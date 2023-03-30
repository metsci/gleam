/**
 * Copyright (c) 2022, Metron, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { Interval1D, Interval2D, Nullable, RefBasic, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, cssEnum, cssLowercase, enablePremultipliedAlphaBlending, Float32Scratch, GL, glUniformInterval1D, glUniformInterval2D, PeerType, StyleProp } from '../../support';
import { frozenSupplier } from '../../util';
import { EmptyMesh, Mesh } from './mesh';
import { EmptySurface, Surface } from './surface';
import { TileDim, TileRect } from './util';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'XY_LIMITS',
        'VALUE_TABLE',
        'VALUE_TABLE_SIZE',
        'COLOR_LIMITS',
        'COLOR_TABLE',
        'INTERP_MODE',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

export enum HeatmapInterpMode {
    NEAREST = 0,
    LINEAR_BETWEEN_COLUMNS = 1,
    LINEAR_BETWEEN_ROWS = 2,
    BILINEAR = 3,
}

interface DeviceTile {
    readonly rect: TileRect;
    readonly numCoords: number;
    readonly coords: Nullable<WebGLBuffer>;
    readonly values: Nullable<WebGLTexture>;
}

export class HeatmapPainter implements Painter {
    readonly peer = createDomPeer( 'heatmap-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly colorTableName = StyleProp.create( this.style, '--color-table', cssLowercase, '' );
    readonly interpMode = StyleProp.create( this.style, '--interp-mode', cssEnum( HeatmapInterpMode ), 'nearest' );

    readonly visible = new RefBasic( true, tripleEquals );

    xyBoundsFn: Supplier<Interval2D>;
    colorBoundsFn: Supplier<Interval1D>;

    protected mesh: Mesh;
    protected surface: Surface;

    protected readonly scratch: Float32Scratch;

    protected glIncarnation: unknown;
    protected dColorTable: Nullable<WebGLTexture>;
    protected dColorTableName: Nullable<string>;
    protected dTiles: Array<DeviceTile>;
    protected dMaxTileDataDim: number;
    protected dMeshValid: boolean;
    protected dSurfaceDimsValid: boolean;
    protected dSurfaceValuesValid: boolean;

    constructor(
        xyBoundsFn?: Supplier<Interval2D>,
        colorBoundsFn?: Supplier<Interval1D>,
    ) {
        this.xyBoundsFn = xyBoundsFn ?? frozenSupplier( Interval2D.fromEdges( 0, 1, 0, 1 ) );
        this.colorBoundsFn = colorBoundsFn ?? frozenSupplier( Interval1D.fromEdges( 0, 1 ) );

        this.mesh = new EmptyMesh( );
        this.surface = new EmptySurface( );

        this.scratch = new Float32Scratch( );

        this.glIncarnation = null;
        this.dColorTable = null;
        this.dColorTableName = null;
        this.dTiles = new Array( );
        this.dMaxTileDataDim = 0;
        this.dMeshValid = false;
        this.dSurfaceDimsValid = false;
        this.dSurfaceValuesValid = false;
    }

    setMesh( mesh: Mesh ): void {
        if ( mesh !== this.mesh ) {
            this.dMeshValid = false;
            this.mesh = mesh;
        }
    }

    setSurface( surface: Surface ): void {
        if ( surface !== this.surface ) {
            this.dSurfaceValuesValid = false;
            if ( surface.rTotal !== this.surface.rTotal || surface.cTotal !== this.surface.cTotal ) {
                this.dSurfaceDimsValid = false;
            }
            this.surface = surface;
        }
    }

    // TODO: Support optional wraparound, at least horizontally
    paint( context: Context, viewport_PX: Interval2D ): void {
        const colorTableName = this.colorTableName.get( );

        const gl = context.gl;

        // The -2 leaves room for a 1-texel border on each side
        const maxTileDataDim = gl.getParameter( GL.MAX_TEXTURE_SIZE ) - 2;

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            // Strictly speaking WebGL doesn't guarantee support for FLOAT textures (OES_texture_float)
            // or LINEAR interp of FLOAT textures (OES_texture_float_linear), but they are supported in
            // all major browsers
            if ( !( gl instanceof WebGL2RenderingContext || ( gl.getExtension( 'OES_texture_float' ) && gl.getExtension( 'OES_texture_float_linear' ) ) ) ) {
                throw new Error( );
            }
            this.glIncarnation = context.glIncarnation;
            this.dColorTable = gl.createTexture( );
            this.dColorTableName = null;
            this.dTiles = new Array<DeviceTile>( );
            this.dMaxTileDataDim = 0;
            this.dMeshValid = false;
            this.dSurfaceDimsValid = false;
            this.dSurfaceValuesValid = false;
        }

        // Repopulate device color table, if necessary
        gl.activeTexture( GL.TEXTURE0 );
        gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
        if ( colorTableName !== this.dColorTableName ) {
            context.getColorTable( colorTableName ).populate( gl, GL.TEXTURE_2D );
            this.dColorTableName = colorTableName;
        }

        // Repopulate device tiles, if necessary
        gl.activeTexture( GL.TEXTURE1 );
        if ( !this.dSurfaceDimsValid || maxTileDataDim !== this.dMaxTileDataDim ) {
            // TODO: Maybe recycle device resources
            for ( const dTile of this.dTiles ) {
                gl.deleteBuffer( dTile.coords );
                gl.deleteTexture( dTile.values );
            }
            this.dTiles.length = 0;

            for ( const tileRect of getTileRects( this.surface, maxTileDataDim ) ) {
                const dCoords = gl.createBuffer( );
                gl.bindBuffer( GL.ARRAY_BUFFER, dCoords );
                const numCoords = pushTileCoordsToDevice( gl, GL.ARRAY_BUFFER, this.mesh, tileRect, this.scratch );

                const dValues = gl.createTexture( );
                gl.bindTexture( GL.TEXTURE_2D, dValues );
                pushTileValuesToDevice( gl, GL.TEXTURE_2D, this.surface, tileRect, this.scratch );

                this.dTiles.push( {
                    rect: tileRect,
                    numCoords,
                    coords: dCoords,
                    values: dValues,
                } );
            }
        }
        else {
            if ( !this.dSurfaceValuesValid ) {
                // TileRects are a fn of surface dims, which haven't changed
                for ( const dTile of this.dTiles ) {
                    gl.bindTexture( GL.TEXTURE_2D, dTile.values );
                    pushTileValuesToDevice( gl, GL.TEXTURE_2D, this.surface, dTile.rect, this.scratch );
                }
            }
            if ( !this.dMeshValid ) {
                // TileRects are a fn of surface dims, which haven't changed
                for ( const dTile of this.dTiles ) {
                    gl.bindBuffer( GL.ARRAY_BUFFER, dTile.coords );
                    pushTileCoordsToDevice( gl, GL.ARRAY_BUFFER, this.mesh, dTile.rect, this.scratch );
                }
            }
        }
        this.dMaxTileDataDim = maxTileDataDim;
        this.dSurfaceDimsValid = true;
        this.dSurfaceValuesValid = true;
        this.dMeshValid = true;

        // Render from device resources
        enablePremultipliedAlphaBlending( gl );
        gl.disable( GL.CULL_FACE );
        const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
        gl.useProgram( program );
        gl.enableVertexAttribArray( attribs.inCoords );
        try {
            //gl.activeTexture( GL.TEXTURE0 );
            //gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );

            glUniformInterval2D( gl, uniforms.XY_LIMITS, this.xyBoundsFn( ) );
            glUniformInterval1D( gl, uniforms.COLOR_LIMITS, this.colorBoundsFn( ) );
            gl.uniform1i( uniforms.COLOR_TABLE, 0 );
            gl.uniform1i( uniforms.VALUE_TABLE, 1 );
            gl.uniform1i( uniforms.INTERP_MODE, this.interpMode.get( ) );

            gl.activeTexture( GL.TEXTURE1 );
            for ( const dTile of this.dTiles ) {
                const numVertices = Math.floor( dTile.numCoords / 4 );
                if ( numVertices >= 3 ) {
                    gl.uniform2f( uniforms.VALUE_TABLE_SIZE, 1+dTile.rect.cDim.count+1, 1+dTile.rect.rDim.count+1 );
                    gl.bindTexture( GL.TEXTURE_2D, dTile.values );
                    gl.bindBuffer( GL.ARRAY_BUFFER, dTile.coords );
                    gl.vertexAttribPointer( attribs.inCoords, 4, GL.FLOAT, false, 0, 0 );
                    gl.drawArrays( GL.TRIANGLES, 0, numVertices );
                }
            }
        }
        finally {
            gl.disableVertexAttribArray( attribs.inCoords );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteTexture( this.dColorTable );
        for ( const dTile of this.dTiles ) {
            gl.deleteBuffer( dTile.coords );
            gl.deleteTexture( dTile.values );
        }

        this.glIncarnation = null;
        this.dColorTable = null;
        this.dColorTableName = null;
        this.dTiles = new Array<DeviceTile>( );
        this.dMeshValid = false;
        this.dSurfaceDimsValid = false;
        this.dSurfaceValuesValid = false;
    }
}

function pushTileCoordsToDevice( gl: WebGLRenderingContext, target: number, mesh: Mesh, tileRect: TileRect, scratch: Float32Scratch ): number {
    const hTileCoords = mesh.getTileCoords( tileRect, scratch );
    gl.bufferData( target, hTileCoords, GL.STATIC_DRAW );
    return hTileCoords.length;
}

function pushTileValuesToDevice( gl: WebGLRenderingContext, target: number, surface: Surface, tileRect: TileRect, scratch: Float32Scratch ): number {
    const hTileValues = surface.getTileValues( tileRect, scratch );

    // The +2 leaves room for a 1-texel border on each side
    const textureWidth = tileRect.cDim.count + 2;
    const textureHeight = tileRect.rDim.count + 2;
    if ( hTileValues.length !== textureWidth * textureHeight ) {
        const extraText = ( hTileValues.length === tileRect.cDim.count * tileRect.rDim.count ? ' (seems to be missing the 1-texel border)' : '' );
        throw new Error( `Heatmap surface tile has wrong value count${extraText}: required = ${textureWidth*textureHeight} (${textureWidth}x${textureHeight}), actual = ${hTileValues.length}` );
    }

    // Set to LINEAR here; shaders may round to the nearest texel
    gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, GL.LINEAR );
    gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, GL.LINEAR );
    gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
    gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
    gl.texImage2D( target, 0, GL.LUMINANCE, textureWidth, textureHeight, 0, GL.LUMINANCE, GL.FLOAT, hTileValues );

    return hTileValues.length;
}

function getTileRects( surface: { rTotal: number, cTotal: number }, maxTileDim: number ): Iterable<TileRect> {
    const rDims = getBandDims( surface.rTotal, maxTileDim );
    const cDims = getBandDims( surface.cTotal, maxTileDim );

    const tileRects = new Array<TileRect>( );
    for ( const rDim of rDims ) {
        for ( const cDim of cDims ) {
            tileRects.push( new TileRect( rDim, cDim ) );
        }
    }
    return tileRects;
}

function getBandDims( totalRanks: number, maxBandDim: number ): Array<TileDim> {
    const bandDims = new Array<TileDim>( );
    const bandCount = Math.ceil( totalRanks / maxBandDim );
    for ( let b = 0; b < bandCount; b++ ) {
        const first = b * maxBandDim;
        const count = Math.min( maxBandDim, totalRanks - first );
        if ( count > 0 ) {
            bandDims.push( new TileDim( totalRanks, first, count ) );
        }
    }
    return bandDims;
}

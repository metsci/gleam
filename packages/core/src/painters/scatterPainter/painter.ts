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
import { get, isDefined, mapAdd, mapRequire, mapSetIfAbsent, Nullable, RefBasic, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, cssColor, cssEnum, cssFloat, cssLowercase, currentDpr, enablePremultipliedAlphaBlending, GL, glUniformInterval1D, glUniformInterval2D, glUniformRgba, Interval1D, Interval2D, PeerType, pushBufferToDevice_BYTES, ShaderSource, StyleProp } from '../../support';
import { frozenSupplier } from '../../util';

import discFragShader_GLSL from './disc.frag';
import ringFragShader_GLSL from './ring.frag';
import squareFragShader_GLSL from './square.frag';
import xyVertShader_GLSL from './xy.vert';
import xycVertShader_GLSL from './xyc.vert';
import xycsVertShader_GLSL from './xycs.vert';
import xysVertShader_GLSL from './xys.vert';

const { floor, max } = Math;

export enum ScatterShape {
    SQUARE,
    DISC,
    RING,
}

export enum ScatterDimensionality {
    XY,
    XYC,
    XYS,
    XYCS,
}

const PROG_SOURCES = get( ( ) => {
    const fragShadersByShape_GLSL = new Map( [
        [ ScatterShape.SQUARE, squareFragShader_GLSL ],
        [ ScatterShape.DISC, discFragShader_GLSL ],
        [ ScatterShape.RING, ringFragShader_GLSL ],
    ] );

    const vertShadersByDimensionality_GLSL = new Map( [
        [ ScatterDimensionality.XY, xyVertShader_GLSL ],
        [ ScatterDimensionality.XYC, xycVertShader_GLSL ],
        [ ScatterDimensionality.XYS, xysVertShader_GLSL ],
        [ ScatterDimensionality.XYCS, xycsVertShader_GLSL ],
    ] );

    const uniformNames = [
        'XY_BOUNDS',

        'FIXED_RGBA',
        'C_BOUNDS',
        'VARIABLE_COLOR_TABLE',

        'FIXED_SIZE_PX',
        'S_BOUNDS',
        'VARIABLE_SIZE_LIMITS_PX',
        'VARIABLE_SIZE_FUNC',

        'THICKNESS_PX',
        'FEATHER_PX',
    ] as const;

    const attribNames = [
        'inCoords',
    ] as const;

    const sourcesByDimByShape = new Map<ScatterShape, Map<ScatterDimensionality, ShaderSource<typeof uniformNames, typeof attribNames>>>( );
    for ( const [ shape, fragShader_GLSL ] of fragShadersByShape_GLSL ) {
        const sourcesByDim = mapSetIfAbsent( sourcesByDimByShape, shape, ( ) => new Map<ScatterDimensionality, ShaderSource<typeof uniformNames, typeof attribNames>>( ) );
        for ( const [ dim, vertShader_GLSL ] of vertShadersByDimensionality_GLSL ) {
            mapAdd( sourcesByDim, dim, { vertShader_GLSL, fragShader_GLSL, attribNames, uniformNames } );
        }
    }
    return sourcesByDimByShape;
} );

export function adjustSizeForShape( size: number, shape: ScatterShape ): number {
    switch ( shape ) {
        case ScatterShape.DISC:
        case ScatterShape.RING: {
            // Add a few pixels so the circle's edge tends to land in the
            // center of a pixel, and we have room to feather the edge
            return size + 3;
        }
        default: {
            return size;
        }
    }
}

export enum ScatterSizeFunc {
    LINEAR,
    QUADRATIC,
    SQRT,
}

export function sizeFuncCode( sizeFunc: ScatterSizeFunc ): number {
    switch ( sizeFunc ) {
        case ScatterSizeFunc.LINEAR: return 0;
        case ScatterSizeFunc.QUADRATIC: return 1;
        case ScatterSizeFunc.SQRT: return 2;
        default: return -1;
    }
}

export class ScatterPainter implements Painter {
    readonly peer = createDomPeer( 'scatter-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly fixedColor = StyleProp.create( this.style, '--fixed-color', cssColor, 'rgb(0,0,0)' );
    readonly variableColorTableName = StyleProp.create( this.style, '--variable-color-table', cssLowercase, '' );
    readonly fixedSize_LPX = StyleProp.create( this.style, '--fixed-size-px', cssFloat, 8 );
    readonly variableSizeMin_LPX = StyleProp.create( this.style, '--variable-size-min-px', cssFloat, 1 );
    readonly variableSizeMax_LPX = StyleProp.create( this.style, '--variable-size-max-px', cssFloat, 18 );
    readonly variableSizeFunc = StyleProp.create( this.style, '--variable-size-fn', cssEnum( ScatterSizeFunc ), 'linear' );
    readonly shape = StyleProp.create( this.style, '--shape', cssEnum( ScatterShape ), 'disc' );
    readonly thickness_LPX = StyleProp.create( this.style, '--thickness-px', cssFloat, 1.5 );

    /**
     * Specified in physical pixels, not logical pixels. Used for making edges
     * look less pixelated, and pixelation is a function of physical pixel size.
     */
    readonly feather_PX = StyleProp.create( this.style, '--feather-dpx', cssFloat, 1.5 );

    readonly visible = new RefBasic( true, tripleEquals );

    xyBoundsFn: Supplier<Interval2D>;
    cBoundsFn: Supplier<Interval1D>;
    sBoundsFn: Supplier<Interval1D>;

    /**
     * Coords: x, y
     * Coords: x, y, c
     * Coords: x, y, s
     * Coords: x, y, c, s
     */
    protected hCoords: Float32Array;
    protected hCoordsPerPoint: number;
    protected hDim: ScatterDimensionality | undefined;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsValid: boolean;
    protected dColorTable: Nullable<WebGLTexture>;
    protected dColorTableName: Nullable<string>;

    constructor(
        xyBoundsFn = frozenSupplier( Interval2D.fromEdges( 0, 1, 0, 1 ) ),
        cBoundsFn = frozenSupplier( Interval1D.fromEdges( 0, 1 ) ),
        sBoundsFn = frozenSupplier( Interval1D.fromEdges( 0, 1 ) ),
    ) {
        this.xyBoundsFn = xyBoundsFn;
        this.cBoundsFn = cBoundsFn;
        this.sBoundsFn = sBoundsFn;

        this.hCoords = new Float32Array( 0 );
        this.hCoordsPerPoint = -1;
        this.hDim = undefined;

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }

    setXyCoords( xyCoords: Float32Array ): void {
        this.hCoordsPerPoint = 2;
        this.hDim = ScatterDimensionality.XY;
        this.hCoords = xyCoords;
        this.dCoordsValid = false;
    }

    setXycCoords( xycCoords: Float32Array ): void {
        this.hCoordsPerPoint = 3;
        this.hDim = ScatterDimensionality.XYC;
        this.hCoords = xycCoords;
        this.dCoordsValid = false;
    }

    setXysCoords( xysCoords: Float32Array ): void {
        this.hCoordsPerPoint = 3;
        this.hDim = ScatterDimensionality.XYS;
        this.hCoords = xysCoords;
        this.dCoordsValid = false;
    }

    setXycsCoords( xycsCoords: Float32Array ): void {
        this.hCoordsPerPoint = 4;
        this.hDim = ScatterDimensionality.XYCS;
        this.hCoords = xycsCoords;
        this.dCoordsValid = false;
    }

    // TODO: Support optional wraparound, at least horizontally
    paint( context: Context, viewport_PX: Interval2D ): void {
        const fixedColor = this.fixedColor.get( );
        const variableColorTableName = this.variableColorTableName.get( );
        const fixedSize_LPX = this.fixedSize_LPX.get( );
        const variableSizeMin_LPX = this.variableSizeMin_LPX.get( );
        const variableSizeMax_LPX = this.variableSizeMax_LPX.get( );
        const variableSizeFunc = this.variableSizeFunc.get( );
        const shape = this.shape.get( );
        const thickness_LPX = this.thickness_LPX.get( );
        const feather_PX = this.feather_PX.get( );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const fixedSize_PX = adjustSizeForShape( fixedSize_LPX * dpr, shape );
        const variableSizeLimits_PX = Interval1D.fromEdges(
            adjustSizeForShape( variableSizeMin_LPX * dpr, shape ),
            adjustSizeForShape( variableSizeMax_LPX * dpr, shape ),
        );
        const thickness_PX = thickness_LPX * dpr;

        const gl = context.gl;

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;
            this.dCoords = gl.createBuffer( );
            this.dCoordsBytes = -1;
            this.dCoordsValid = false;
            this.dColorTable = gl.createTexture( );
            this.dColorTableName = null;
        }

        // Leave these bindings in place for the whole method
        gl.activeTexture( GL.TEXTURE0 );
        gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
        gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

        // Repopulate device coords, if necessary
        if ( !this.dCoordsValid ) {
            //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
            this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords );
            this.dCoordsValid = true;
        }

        // Repopulate device color table, if inputs have changed
        if ( variableColorTableName !== this.dColorTableName ) {
            //gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
            context.getColorTable( variableColorTableName ).populate( gl, GL.TEXTURE_2D );
            this.dColorTableName = variableColorTableName;
        }

        // Render from device resources
        const numVertices = floor( this.hCoords.length / this.hCoordsPerPoint );
        if ( numVertices > 0 && isDefined( this.hDim ) ) {
            const progSource = mapRequire( mapRequire( PROG_SOURCES, shape ), this.hDim );
            const { program, attribs, uniforms } = context.getProgram( progSource );
            enablePremultipliedAlphaBlending( gl );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inCoords );
            try {
                glUniformInterval2D( gl, uniforms.XY_BOUNDS, this.xyBoundsFn( ) );

                //gl.activeTexture( GL.TEXTURE0 );
                //gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
                gl.uniform1i( uniforms.VARIABLE_COLOR_TABLE, 0 );
                glUniformInterval1D( gl, uniforms.C_BOUNDS, this.cBoundsFn( ) );
                glUniformRgba( gl, uniforms.FIXED_RGBA, fixedColor );

                gl.uniform1i( uniforms.VARIABLE_SIZE_FUNC, sizeFuncCode( variableSizeFunc ) );
                glUniformInterval1D( gl, uniforms.VARIABLE_SIZE_LIMITS_PX, variableSizeLimits_PX );
                glUniformInterval1D( gl, uniforms.S_BOUNDS, this.sBoundsFn( ) );
                gl.uniform1f( uniforms.FIXED_SIZE_PX, fixedSize_PX );

                gl.uniform1f( uniforms.THICKNESS_PX, thickness_PX );

                // GLSL's smoothstep chokes if feather is zero
                gl.uniform1f( uniforms.FEATHER_PX, max( 1e-3, feather_PX ) );

                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                gl.vertexAttribPointer( attribs.inCoords, this.hCoordsPerPoint, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.POINTS, 0, numVertices );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inCoords );
                gl.useProgram( null );
            }
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteBuffer( this.dCoords );
        gl.deleteTexture( this.dColorTable );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
}

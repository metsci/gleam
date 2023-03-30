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
import { Interval1D, Interval2D, Nullable, RefBasic, Supplier, tripleEquals, X, Y } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, cssLowercase, enablePremultipliedAlphaBlending, GL, glUniformBool, glUniformInterval1D, PeerType, putAlignedBox, StyleProp } from '../../support';
import { frozenSupplier } from '../../util';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'AXIS_IS_VERTICAL',
        'AXIS_LIMITS',
        'COLOR_LIMITS',
        'COLOR_TABLE',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

export class GradientPainter implements Painter {
    readonly peer = createDomPeer( 'gradient-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly colorTableName = StyleProp.create( this.style, '--color-table', cssLowercase, '' );

    readonly visible = new RefBasic( true, tripleEquals );

    axisType: X | Y;
    axisBoundsFn: Supplier<Interval1D>;
    colorBoundsFn: Supplier<Interval1D>;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsValid: boolean;
    protected dColorTable: Nullable<WebGLTexture>;
    protected dColorTableName: Nullable<string>;

    constructor(
        axisType: X | Y,
        axisBoundsFn: Supplier<Interval1D> = frozenSupplier( Interval1D.fromEdges( 0, 1 ) ),
        colorBoundsFn: Supplier<Interval1D> = frozenSupplier( Interval1D.fromEdges( 0, 1 ) ),
    ) {
        this.axisType = axisType;
        this.axisBoundsFn = axisBoundsFn;
        this.colorBoundsFn = colorBoundsFn;

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const colorTableName = this.colorTableName.get( );

        const gl = context.gl;

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;
            this.dCoords = gl.createBuffer( );
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
            // Coords: colorBoundsFrac, orthoFrac
            const hCoords = new Float32Array( 12 );
            putAlignedBox( hCoords, 0, 0, 1, 0, 1 );

            //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
            gl.bufferData( GL.ARRAY_BUFFER, hCoords, GL.STATIC_DRAW );
            this.dCoordsValid = true;
        }

        // Repopulate device color table, if inputs have changed
        if ( colorTableName !== this.dColorTableName ) {
            //gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
            context.getColorTable( colorTableName ).populate( gl, GL.TEXTURE_2D );
            this.dColorTableName = colorTableName;
        }

        // Render from device resources
        enablePremultipliedAlphaBlending( gl );
        gl.disable( GL.CULL_FACE );
        const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
        gl.useProgram( program );
        gl.enableVertexAttribArray( attribs.inCoords );
        try {
            //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
            gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 0 );

            glUniformBool( gl, uniforms.AXIS_IS_VERTICAL, this.axisType === Y );
            glUniformInterval1D( gl, uniforms.AXIS_LIMITS, this.axisBoundsFn( ) );
            glUniformInterval1D( gl, uniforms.COLOR_LIMITS, this.colorBoundsFn( ) );

            //gl.activeTexture( GL.TEXTURE0 );
            //gl.bindTexture( GL.TEXTURE_2D, this.dColorTable );
            gl.uniform1i( uniforms.COLOR_TABLE, 0 );

            gl.drawArrays( GL.TRIANGLES, 0, 6 );
        }
        finally {
            gl.disableVertexAttribArray( attribs.inCoords );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteBuffer( this.dCoords );
        gl.deleteTexture( this.dColorTable );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
}

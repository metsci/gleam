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
import { Nullable, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { createDomPeer, cssColor, disableBlending, enablePremultipliedAlphaBlending, GL, glUniformRgba, Interval2D, PeerType, putAlignedBox, StyleProp } from '../../support';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

// Avoid circular dependency on ../../core/index
import { Context } from '../../core/context';
import { Painter } from '../../core/painter';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [ 'RGBA' ] as const,
    attribNames: [ 'inCoords' ] as const,
} );

export class FillPainter implements Painter {
    readonly peer = createDomPeer( 'fill-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgba( 255,255,255, 0 )' );

    readonly visible = new RefBasic( true, tripleEquals );

    /**
     * Coords: x_NDC, y_NDC
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsValid: boolean;

    constructor( ) {
        this.hCoords = new Float32Array( 12 );
        putAlignedBox( this.hCoords, 0, -1, +1, -1, +1 );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const color = this.color.get( );
        if ( color.a > 0 ) {
            const gl = context.gl;

            // Reset device resources on context reincarnation
            if ( context.glIncarnation !== this.glIncarnation ) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer( );
                this.dCoordsValid = false;
            }

            // Leave these bindings in place for the whole method
            gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

            // Repopulate device coords, if necessary
            if ( !this.dCoordsValid ) {
                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                gl.bufferData( GL.ARRAY_BUFFER, this.hCoords, GL.STATIC_DRAW );
                this.dCoordsValid = true;
            }

            if ( color.a < 1 ) {
                enablePremultipliedAlphaBlending( gl );
            }
            else {
                disableBlending( gl );
            }

            const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inCoords );
            try {
                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 0 );

                glUniformRgba( gl, uniforms.RGBA, color );

                gl.drawArrays( GL.TRIANGLES, 0, 6 );
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
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }
}

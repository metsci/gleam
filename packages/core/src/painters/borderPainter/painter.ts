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
import { equal, Interval2D, Nullable, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { createDomPeer, cssColor, cssFloat, currentDpr, disableBlending, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, GL, glUniformRgba, PeerType, pushBufferToDevice_BYTES, putAlignedBox, StyleProp, ValueBase2 } from '../../support';

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

export class CoordsInputs extends ValueBase2 {
    constructor(
        readonly viewport_PX: Interval2D,
        readonly width_PX: number,
    ) {
        super( );
    }
}

export class BorderPainter implements Painter {
    readonly peer = createDomPeer( 'border-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(0,0,0)' );
    readonly width_LPX = StyleProp.create( this.style, '--width-px', cssFloat, 0 );

    readonly visible = new RefBasic( true, tripleEquals );

    /**
     * Coords: x_NDC, y_NDC
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;

    constructor( ) {
        this.hCoords = new Float32Array( 0 );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const color = this.color.get( );
        const width_LPX = this.width_LPX.get( );

        const dpr = currentDpr( this );
        const width_PX = Math.round( width_LPX * dpr );

        if ( width_PX > 0 && color.a > 0 ) {
            const gl = context.gl;

            // Reset device resources on context reincarnation
            if ( context.glIncarnation !== this.glIncarnation ) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer( );
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
            }

            // Leave this binding in place for the whole method
            gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

            // Gather coords inputs
            const numVertices = 24;
            const coordsInputs = new CoordsInputs( viewport_PX, width_PX );

            // Repopulate device resources, if inputs have changed
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                const numCoords = 2 * numVertices;
                this.hCoords = ensureHostBufferCapacity( this.hCoords, numCoords );

                const w_NDC = 2*width_PX / viewport_PX.x.span;
                const h_NDC = 2*width_PX / viewport_PX.y.span;

                let i = 0;

                i = putAlignedBox( this.hCoords, i, -1+w_NDC, +1, +1-h_NDC, +1 );
                i = putAlignedBox( this.hCoords, i, +1-w_NDC, +1, -1, +1-h_NDC );
                i = putAlignedBox( this.hCoords, i, -1, +1-w_NDC, -1, -1+h_NDC );
                i = putAlignedBox( this.hCoords, i, -1, -1+w_NDC, -1+h_NDC, +1 );

                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords );
                this.dCoordsInputs = coordsInputs;
            }

            // Render from device resources
            if ( numVertices >= 3 ) {
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
                    gl.drawArrays( GL.TRIANGLES, 0, numVertices );
                }
                finally {
                    gl.disableVertexAttribArray( attribs.inCoords );
                    gl.useProgram( null );
                }
            }
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteBuffer( this.dCoords );
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

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
import { equal, Nullable, RefBasic, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, cssColor, cssFloat, currentDpr, disableBlending, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, GL, glUniformInterval2D, glUniformRgba, Interval2D, PeerType, pushBufferToDevice_BYTES, put4f, StyleProp, ValueBase2 } from '../../support';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'VIEWPORT_PX',
        'AXIS_VIEWPORT_PX',
        'RGBA',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

export class CoordsInputs extends ValueBase2 {
    constructor(
        readonly width_PX: number,
    ) {
        super( );
    }
}

export function coordsInputsEqual( a: Nullable<CoordsInputs>, b: Nullable<CoordsInputs> ): boolean {
    if ( a === b ) {
        return true;
    }
    else if ( a === null || b === null ) {
        return false;
    }
    else {
        return ( a.width_PX === b.width_PX );
    }
}

export class PlotBorderPainter implements Painter {
    readonly peer = createDomPeer( 'plot-border-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(0,0,0)' );
    readonly width_LPX = StyleProp.create( this.style, '--width-px', cssFloat, 1 );

    readonly visible = new RefBasic( true, tripleEquals );

    axisViewportFn_PX: Supplier<Interval2D>;

    /**
     * Coords: xBase_XFRAC, yBase_YFRAC, xOffset_PX, yOffset_PX
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;

    constructor( axisViewportFn_PX: Supplier<Interval2D> ) {
        this.axisViewportFn_PX = axisViewportFn_PX;

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
            const coordsInputs = new CoordsInputs( width_PX );

            // Repopulate device resources, if inputs have changed
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                const numCoords = 4 * numVertices;
                this.hCoords = ensureHostBufferCapacity( this.hCoords, numCoords );

                const outward_PX = width_PX >> 1;
                const inward_PX = width_PX - outward_PX;

                let i = 0;

                // Top
                i = put4f( this.hCoords, i, 0, 1,  +inward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 0, 1,  +inward_PX,  -inward_PX );
                i = put4f( this.hCoords, i, 1, 1, +outward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 1, 1, +outward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 0, 1,  +inward_PX,  -inward_PX );
                i = put4f( this.hCoords, i, 1, 1, +outward_PX,  -inward_PX );

                // Right
                i = put4f( this.hCoords, i, 1, 1,  -inward_PX,  -inward_PX );
                i = put4f( this.hCoords, i, 1, 0,  -inward_PX, -outward_PX );
                i = put4f( this.hCoords, i, 1, 1, +outward_PX,  -inward_PX );
                i = put4f( this.hCoords, i, 1, 1, +outward_PX,  -inward_PX );
                i = put4f( this.hCoords, i, 1, 0,  -inward_PX, -outward_PX );
                i = put4f( this.hCoords, i, 1, 0, +outward_PX, -outward_PX );

                // Bottom
                i = put4f( this.hCoords, i, 0, 0, -outward_PX,  +inward_PX );
                i = put4f( this.hCoords, i, 0, 0, -outward_PX,  -outward_PX );
                i = put4f( this.hCoords, i, 1, 0,  -inward_PX,  +inward_PX );
                i = put4f( this.hCoords, i, 1, 0,  -inward_PX,  +inward_PX );
                i = put4f( this.hCoords, i, 0, 0, -outward_PX, -outward_PX );
                i = put4f( this.hCoords, i, 1, 0,  -inward_PX, -outward_PX );

                // Left
                i = put4f( this.hCoords, i, 0, 1, -outward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 0, 0, -outward_PX,  +inward_PX );
                i = put4f( this.hCoords, i, 0, 1,  +inward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 0, 1,  +inward_PX, +outward_PX );
                i = put4f( this.hCoords, i, 0, 0, -outward_PX,  +inward_PX );
                i = put4f( this.hCoords, i, 0, 0,  +inward_PX,  +inward_PX );

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
                    gl.vertexAttribPointer( attribs.inCoords, 4, GL.FLOAT, false, 0, 0 );

                    glUniformInterval2D( gl, uniforms.VIEWPORT_PX, viewport_PX );
                    glUniformInterval2D( gl, uniforms.AXIS_VIEWPORT_PX, this.axisViewportFn_PX( ) );
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

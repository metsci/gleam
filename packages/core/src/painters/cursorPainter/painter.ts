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
import { Disposer, DisposerGroup, equal, FireableListenable, IMMEDIATE, isDefined, Nullable, Ref, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { Axis1D, Context, createAxisCursorInputHandler1D, Painter, Pane } from '../../core';
import { Color, createDomPeer, cssColor, cssFloat, currentDpr, disableBlending, enablePremultipliedAlphaBlending, GL, glScissor, glViewport, Interval1D, Interval2D, PeerType, pushBufferToDevice_BYTES, putAlignedBox, putRgba, StyleProp, ValueBase2, X, xPixelToNdc, Y, yUpwardPixelToNdc } from '../../support';
import { tickOffsetEpsilon_PX } from '../axisPainter/painter';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    attribNames: [ 'inCoords', 'inColor' ] as const,
} );

export function attachAxisCursor( pane: Pane, axis: Axis1D, axisType: X | Y, cursorRef: Ref<number | undefined | null>, repaint: FireableListenable ): Disposer {
    const disposers = new DisposerGroup( );

    const cursorPainter = new CursorPainter( axis, axisType );
    disposers.add( pane.addPainter( cursorPainter, +999 ) );

    disposers.add( cursorRef.addListener( IMMEDIATE, ( ) => {
        cursorPainter.coord = cursorRef.v ?? undefined;
        repaint.fire( );
    } ) );

    const cursorHoveredRef = new RefBasic( false, tripleEquals );
    const cursorInputHandler = createAxisCursorInputHandler1D( axis, axisType, cursorRef, cursorHoveredRef );
    disposers.add( pane.addInputHandler( cursorInputHandler, +999 ) );

    disposers.add( cursorHoveredRef.addListener( IMMEDIATE, ( ) => {
        cursorPainter.hovered = cursorHoveredRef.v;
        repaint.fire( );
    } ) );

    return disposers;
}

class CoordsInputs extends ValueBase2 {
    constructor(
        readonly viewport_PX: Interval2D,
        readonly axisViewport_PX: Interval1D,
        readonly axisBounds_AXIS: Interval1D,
        readonly cursor_AXIS: number,
        readonly innerWidth_PX: number,
        readonly edgeWidth_PX: number,
        readonly innerColor: Color,
        readonly edgeColor: Color,
    ) {
        super( );
    }
}

export class CursorPainter implements Painter {
    readonly peer = createDomPeer( 'cursor-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly innerColor = StyleProp.create( this.style, '--inner-color', cssColor, 'rgb(0,0,0)' );
    readonly edgeColor = StyleProp.create( this.style, '--edge-color', cssColor, 'rgb(127,127,127)' );
    readonly innerColorHovered = StyleProp.create( this.style, '--inner-color-hovered', cssColor, this.innerColor );
    readonly edgeColorHovered = StyleProp.create( this.style, '--edge-color-hovered', cssColor, this.edgeColor );
    readonly innerWidth_LPX = StyleProp.create( this.style, '--inner-width-px', cssFloat, 1 );
    readonly edgeWidth_LPX = StyleProp.create( this.style, '--edge-width-px', cssFloat, 1 );

    readonly visible = new RefBasic( true, tripleEquals );

    protected readonly axis: Axis1D;
    protected readonly axisType: X | Y;

    coord: number | undefined;

    /**
     * Some painters get a hover effect by having a hover-related CSS class added
     * to their panes. That's not a good option here, because this painter tends
     * to take up a very small portion of a large pane, and the large pane may have
     * other painters that need to be hovered/unhovered independently.
     */
    hovered: boolean;

    protected readonly vertexCount: number;

    /**
     * Vertex coords followed by vertex colors:
     *  - Coords: x_NDC, y_NDC
     *  - Color: r, g, b, a
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;

    constructor( axis: Axis1D, axisType: X | Y ) {
        this.axis = axis;
        this.axisType = axisType;

        this.coord = undefined;
        this.hovered = false;

        // 3 quads = 6 triangles = 18 vertices
        this.vertexCount = 18;

        this.hCoords = new Float32Array( 6 * this.vertexCount );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Get style values
        const innerColor = ( this.hovered ? this.innerColorHovered.get( ) : this.innerColor.get( ) );
        const edgeColor = ( this.hovered ? this.edgeColorHovered.get( ) : this.edgeColor.get( ) );
        const innerWidth_LPX = this.innerWidth_LPX.get( );
        const edgeWidth_LPX = this.edgeWidth_LPX.get( );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const innerWidth_PX = Math.round( innerWidth_LPX * dpr );
        const edgeWidth_PX = Math.round( edgeWidth_LPX * dpr );

        const cursor_AXIS = this.coord;
        const innerVisible = ( innerColor.a > 0 && innerWidth_PX > 0 );
        const edgeVisible = ( edgeColor.a > 0 && edgeWidth_PX > 0 );
        if ( isDefined( cursor_AXIS ) && ( innerVisible || edgeVisible ) ) {
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
            const axisBounds_AXIS = this.axis.bounds;
            const axisViewport_PX = this.axis.viewport_PX;
            const coordsInputs = new CoordsInputs(
                viewport_PX,
                axisViewport_PX,
                axisBounds_AXIS,
                cursor_AXIS,
                innerWidth_PX,
                edgeWidth_PX,
                innerColor,
                edgeColor,
            );

            // Adjust viewport and scissor based on the axis viewport
            let scissor_PX: Interval2D;
            if ( this.axisType === X ) {
                scissor_PX = Interval2D.fromXy( ( viewport_PX.x ).intersection( axisViewport_PX ), viewport_PX.y );
                viewport_PX = Interval2D.fromXy( axisViewport_PX, viewport_PX.y );
            }
            else {
                scissor_PX = Interval2D.fromXy( viewport_PX.x, ( viewport_PX.y ).intersection( axisViewport_PX ) );
                viewport_PX = Interval2D.fromXy( viewport_PX.x, axisViewport_PX );
            }
            glViewport( gl, viewport_PX );
            glScissor( gl, scissor_PX );

            // Repopulate device resources, if inputs have changed
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                let i = 0;

                if ( this.axisType === X ) {
                    const wPixel_NDC = 2 / viewport_PX.w;
                    const xCenter_PX = axisBounds_AXIS.valueToFrac( cursor_AXIS ) * axisViewport_PX.span + tickOffsetEpsilon_PX;
                    const xMinInner_NDC = xPixelToNdc( axisViewport_PX, Math.round( xCenter_PX - 0.5*innerWidth_PX ) );
                    const xMaxInner_NDC = xMinInner_NDC + ( innerWidth_PX * wPixel_NDC );
                    const xMinOuter_NDC = xMinInner_NDC - ( edgeWidth_PX * wPixel_NDC );
                    const xMaxOuter_NDC = xMaxInner_NDC + ( edgeWidth_PX * wPixel_NDC );

                    const yMin_NDC = -1;
                    const yMax_NDC = +1;

                    i = putAlignedBox( this.hCoords, i, xMinOuter_NDC, xMinInner_NDC, yMin_NDC, yMax_NDC );
                    i = putAlignedBox( this.hCoords, i, xMinInner_NDC, xMaxInner_NDC, yMin_NDC, yMax_NDC );
                    i = putAlignedBox( this.hCoords, i, xMaxInner_NDC, xMaxOuter_NDC, yMin_NDC, yMax_NDC );
                }
                else {
                    const hPixel_NDC = 2 / viewport_PX.h;
                    const yCenter_UPX = axisBounds_AXIS.valueToFrac( cursor_AXIS ) * axisViewport_PX.span + tickOffsetEpsilon_PX;
                    const yMinInner_NDC = yUpwardPixelToNdc( axisViewport_PX, Math.round( yCenter_UPX - 0.5*innerWidth_PX ) );
                    const yMaxInner_NDC = yMinInner_NDC + ( innerWidth_PX * hPixel_NDC );
                    const yMinOuter_NDC = yMinInner_NDC - ( edgeWidth_PX * hPixel_NDC );
                    const yMaxOuter_NDC = yMaxInner_NDC + ( edgeWidth_PX * hPixel_NDC );

                    const xMin_NDC = -1;
                    const xMax_NDC = +1;

                    i = putAlignedBox( this.hCoords, i, xMin_NDC, xMax_NDC, yMinOuter_NDC, yMinInner_NDC );
                    i = putAlignedBox( this.hCoords, i, xMin_NDC, xMax_NDC, yMinInner_NDC, yMaxInner_NDC );
                    i = putAlignedBox( this.hCoords, i, xMin_NDC, xMax_NDC, yMaxInner_NDC, yMaxOuter_NDC );
                }

                for ( let c = 0; c < 6; c++ ) {
                    i = putRgba( this.hCoords, i, edgeColor );
                }
                for ( let c = 0; c < 6; c++ ) {
                    i = putRgba( this.hCoords, i, innerColor );
                }
                for ( let c = 0; c < 6; c++ ) {
                    i = putRgba( this.hCoords, i, edgeColor );
                }

                const numCoords = ( 2 * this.vertexCount ) + ( 4 * this.vertexCount );
                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords );
                this.dCoordsInputs = coordsInputs;
            }

            // Render from device resources
            if ( this.vertexCount >= 3 ) {
                if ( ( innerVisible && innerColor.a < 1 ) || ( edgeVisible && edgeColor.a < 1 ) ) {
                    enablePremultipliedAlphaBlending( gl );
                }
                else {
                    disableBlending( gl );
                }

                const { program, attribs } = context.getProgram( PROG_SOURCE );
                gl.useProgram( program );
                gl.enableVertexAttribArray( attribs.inCoords );
                gl.enableVertexAttribArray( attribs.inColor );
                try {
                    //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                    gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 0 );
                    gl.vertexAttribPointer( attribs.inColor, 4, GL.FLOAT, false, 0, 8 * this.vertexCount );

                    gl.drawArrays( GL.TRIANGLES, 0, this.vertexCount );
                }
                finally {
                    gl.disableVertexAttribArray( attribs.inColor );
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

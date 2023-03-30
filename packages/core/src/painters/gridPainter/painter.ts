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
import { equal, Interval1D, Interval2D, Nullable, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { Axis1D, Axis2D, Context, NullTicker, Painter, Ticker } from '../../core';
import { createDomPeer, cssColor, cssFloat, currentDpr, disableBlending, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, GL, glUniformRgba, PeerType, pushBufferToDevice_BYTES, putHorizontalLines, putVerticalLines, StyleProp, ValueBase2 } from '../../support';
import { tickOffsetEpsilon_PX } from '../axisPainter/painter';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [ 'RGBA' ] as const,
    attribNames: [ 'inCoords' ] as const,
} );

export class CoordsInputs extends ValueBase2 {
    constructor(
        readonly xMajors_AXIS: ReadonlyArray<number>,
        readonly xMinors_AXIS: ReadonlyArray<number>,
        readonly yMajors_AXIS: ReadonlyArray<number>,
        readonly yMinors_AXIS: ReadonlyArray<number>,
        readonly xBounds_AXIS: Nullable<Interval1D>,
        readonly yBounds_AXIS: Nullable<Interval1D>,
        readonly xAxisViewport_PX: Nullable<Interval1D>,
        readonly yAxisViewport_PX: Nullable<Interval1D>,
        readonly viewport_PX: Interval2D,
        readonly majorWidth_PX: number,
        readonly minorWidth_PX: number,
    ) {
        super( );
    }
}

export class GridPainter implements Painter {
    readonly peer = createDomPeer( 'grid-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly majorColor = StyleProp.create( this.style, '--major-color', cssColor, 'rgb(0,0,0)' );
    readonly minorColor = StyleProp.create( this.style, '--minor-color', cssColor, 'rgb(0,0,0)' );
    readonly majorWidth_LPX = StyleProp.create( this.style, '--major-width-px', cssFloat, 1 );
    readonly minorWidth_LPX = StyleProp.create( this.style, '--minor-width-px', cssFloat, 1 );

    readonly visible = new RefBasic( true, tripleEquals );

    xAxis: Nullable<Axis1D>;
    yAxis: Nullable<Axis1D>;
    xTicker: Ticker;
    yTicker: Ticker;

    /**
     * Coords: x_NDC, yNDC
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;

    constructor( xyAxis: Axis2D, xTicker: Nullable<Ticker>, yTicker: Nullable<Ticker> );
    constructor( xAxis: Nullable<Axis1D>, yAxis: Nullable<Axis1D>, xTicker: Nullable<Ticker>, yTicker: Nullable<Ticker> );
    constructor( a: any, b: any, c: any, d?: any ) {
        if ( d === undefined ) {
            this.xAxis = ( a as Axis2D ).x;
            this.yAxis = ( a as Axis2D ).y;
            this.xTicker = ( b as Nullable<Ticker> ) ?? new NullTicker( );
            this.yTicker = ( c as Nullable<Ticker> ) ?? new NullTicker( );
        }
        else {
            this.xAxis = a as Nullable<Axis1D>;
            this.yAxis = b as Nullable<Axis1D>;
            this.xTicker = ( c as Nullable<Ticker> ) ?? new NullTicker( );
            this.yTicker = ( d as Nullable<Ticker> ) ?? new NullTicker( );
        }

        this.hCoords = new Float32Array( 0 );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Get style values
        const majorColor = this.majorColor.get( );
        const minorColor = this.minorColor.get( );
        const majorWidth_LPX = this.majorWidth_LPX.get( );
        const minorWidth_LPX = this.minorWidth_LPX.get( );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const majorWidth_PX = Math.round( majorWidth_LPX * dpr );
        const minorWidth_PX = Math.round( minorWidth_LPX * dpr );

        const majorsVisible = ( majorColor.a > 0 && majorWidth_PX > 0 );
        const minorsVisible = ( minorColor.a > 0 && minorWidth_PX > 0 );
        if ( majorsVisible || minorsVisible ) {
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
            const { majorTicks: xMajors_AXIS, minorTicks: xMinors_AXIS } = this.xTicker.getTicks( this.xAxis );
            const { majorTicks: yMajors_AXIS, minorTicks: yMinors_AXIS } = this.yTicker.getTicks( this.yAxis );
            const xBounds_AXIS = this.xAxis && this.xAxis.bounds;
            const yBounds_AXIS = this.yAxis && this.yAxis.bounds;
            const xAxisViewport_PX = this.xAxis && this.xAxis.viewport_PX;
            const yAxisViewport_PX = this.yAxis && this.yAxis.viewport_PX;
            const majorVertexCount = 6 * ( xMajors_AXIS.length + yMajors_AXIS.length );
            const minorVertexCount = 6 * ( xMinors_AXIS.length + yMinors_AXIS.length );
            const coordsInputs = new CoordsInputs(
                xMajors_AXIS,
                xMinors_AXIS,
                yMajors_AXIS,
                yMinors_AXIS,
                xBounds_AXIS,
                yBounds_AXIS,
                xAxisViewport_PX,
                yAxisViewport_PX,
                viewport_PX,
                majorWidth_PX,
                minorWidth_PX,
            );

            // Repopulate device resources, if inputs have changed
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                const numCoords = 2 * ( majorVertexCount + minorVertexCount );
                this.hCoords = ensureHostBufferCapacity( this.hCoords, numCoords );

                let i = 0;
                i = putVerticalLines( this.hCoords, i, viewport_PX, majorWidth_PX, tickOffsetEpsilon_PX, this.xAxis, xMajors_AXIS );
                i = putHorizontalLines( this.hCoords, i, viewport_PX, majorWidth_PX, tickOffsetEpsilon_PX, this.yAxis, yMajors_AXIS );
                i = putVerticalLines( this.hCoords, i, viewport_PX, minorWidth_PX, tickOffsetEpsilon_PX, this.xAxis, xMinors_AXIS );
                i = putHorizontalLines( this.hCoords, i, viewport_PX, minorWidth_PX, tickOffsetEpsilon_PX, this.yAxis, yMinors_AXIS );

                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords );
                this.dCoordsInputs = coordsInputs;
            }

            // Render from device resources
            const drawMajors = ( majorsVisible && majorVertexCount >= 3 );
            const drawMinors = ( minorsVisible && minorVertexCount >= 3 );
            if ( drawMajors || drawMinors ) {
                if ( ( drawMajors && majorColor.a < 1 ) || ( drawMinors && minorColor.a < 1 ) ) {
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

                    if ( drawMinors ) {
                        glUniformRgba( gl, uniforms.RGBA, minorColor );
                        gl.drawArrays( GL.TRIANGLES, majorVertexCount, minorVertexCount );
                    }

                    if ( drawMajors ) {
                        glUniformRgba( gl, uniforms.RGBA, majorColor );
                        gl.drawArrays( GL.TRIANGLES, 0, majorVertexCount );
                    }
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

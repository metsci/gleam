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
import { clamp, Disposer, isDefined, Nullable, requireDefined } from '@metsci/gleam-util';
import { Axis2D, DragHandler, HoverHandler, InputHandler, Pane, PaneMouseEvent } from '../../core';
import { currentDpr, QuadTree, ValueBase2 } from '../../support';
import { BasicLine, BasicLinePainter, indicateDataAboveMax, indicateDataBelowMin } from './painter';

export const BASIC_LINE_POINT_SYMBOL = Symbol( '@@__GLEAM_BASIC_LINE_POINT__@@' );
export function isBasicLinePoint( obj: any ): obj is BasicLinePoint {
    return !!( obj && typeof obj === 'object' && obj[ BASIC_LINE_POINT_SYMBOL ] );
}

export class BasicLinePoint extends ValueBase2 {
    readonly [ BASIC_LINE_POINT_SYMBOL ] = true;

    constructor(
        readonly line: BasicLine,
        readonly i: number,
    ) {
        super( );
    }
}

/**
 * Max distance from a dot's OUTER EDGE at which the dot can be grabbed.
 */
export const dotGrabDistance_LPX = 3;

export function attachBasicLineInputHandler( pane: Pane, axis: Axis2D, linePainter: BasicLinePainter, zIndex?: number, grabDistance_LPX: number = dotGrabDistance_LPX ): Disposer {
    return pane.addInputHandler( new BasicLineInputHandler( axis, linePainter, grabDistance_LPX ), zIndex );
}

interface Datapoint {
    i: number,
    x: number,
    y: number,
}

export class BasicLineInputHandler implements InputHandler {
    protected readonly axis: Axis2D;
    protected readonly linePainter: BasicLinePainter;
    protected readonly grabDistance_LPX: number;

    protected line: BasicLine | undefined;
    protected quadTree: QuadTree<Datapoint>;

    constructor( axis: Axis2D, linePainter: BasicLinePainter, grabDistance_LPX: number ) {
        this.axis = axis;
        this.linePainter = linePainter;
        this.grabDistance_LPX = grabDistance_LPX;

        this.line = undefined;
        this.quadTree = new QuadTree( );
    }

    getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
        const p = this.getPoint( evMove );
        if ( isDefined( p ) ) {
            return {
                target: p,
                getMouseCursorClasses: ( ) => [ 'clickable' ],
            };
        }
        else {
            return null;
        }
    }

    getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
        if ( evGrab.button === 0 ) {
            return this.getHoverHandler( evGrab );
        }
        else {
            return null;
        }
    }

    protected getPoint( ev: PaneMouseEvent ): BasicLinePoint | undefined {
        this.updateQuadTree( );

        const xMouse = this.axis.x.pxToCoord( ev.loc_PX.x );
        const yMouse = this.axis.y.pxToCoord( ev.loc_PX.y );

        const dotDiameter_LPX = this.linePainter.dotDiameter_LPX.get( );
        const offscreenDataIndicatorX = this.linePainter.offscreenDataIndicatorX.get( );
        const offscreenDataIndicatorY = this.linePainter.offscreenDataIndicatorY.get( );
        const indicateDataBelowMinX = indicateDataBelowMin( offscreenDataIndicatorX );
        const indicateDataAboveMaxX = indicateDataAboveMax( offscreenDataIndicatorX );
        const indicateDataBelowMinY = indicateDataBelowMin( offscreenDataIndicatorY );
        const indicateDataAboveMaxY = indicateDataAboveMax( offscreenDataIndicatorY );

        const dpr = currentDpr( this.linePainter );
        const maxGrabDistance_PX = ( 0.5*dotDiameter_LPX + this.grabDistance_LPX ) * dpr;
        let xQueryMin = this.axis.x.pxToCoord( ev.loc_PX.x - maxGrabDistance_PX );
        let xQueryMax = this.axis.x.pxToCoord( ev.loc_PX.x + maxGrabDistance_PX );
        let yQueryMin = this.axis.y.pxToCoord( ev.loc_PX.y - maxGrabDistance_PX );
        let yQueryMax = this.axis.y.pxToCoord( ev.loc_PX.y + maxGrabDistance_PX );
        if ( indicateDataBelowMinX && xQueryMin < this.axis.x.bounds.min ) {
            xQueryMin = Number.NEGATIVE_INFINITY;
        }
        if ( indicateDataAboveMaxX && xQueryMax > this.axis.x.bounds.max ) {
            xQueryMax = Number.POSITIVE_INFINITY;
        }
        if ( indicateDataBelowMinY && yQueryMin < this.axis.y.bounds.min ) {
            yQueryMin = Number.NEGATIVE_INFINITY;
        }
        if ( indicateDataAboveMaxY && yQueryMax > this.axis.y.bounds.max ) {
            yQueryMax = Number.POSITIVE_INFINITY;
        }

        const xClampMin = ( indicateDataBelowMinX ? this.axis.x.bounds.min : Number.NEGATIVE_INFINITY );
        const xClampMax = ( indicateDataAboveMaxX ? this.axis.x.bounds.max : Number.POSITIVE_INFINITY );
        const yClampMin = ( indicateDataBelowMinY ? this.axis.y.bounds.min : Number.NEGATIVE_INFINITY );
        const yClampMax = ( indicateDataAboveMaxY ? this.axis.y.bounds.max : Number.POSITIVE_INFINITY );

        const bestPoints = new Array<Datapoint>( );
        let bestDistanceClamped_PX = maxGrabDistance_PX;
        this.quadTree.forEach( xQueryMin, xQueryMax, yQueryMin, yQueryMax, p => {
            const x = clamp( xClampMin, xClampMax, p.x );
            const y = clamp( yClampMin, yClampMax, p.y );
            const dx_LPX = ( xMouse - x )*this.axis.x.scale;
            const dy_LPX = ( yMouse - y )*this.axis.y.scale;
            const d_PX = Math.hypot( dx_LPX, dy_LPX ) * dpr;

            // If multiple datapoints are very close to each other after clamping, call it
            // a tie, and send them to the tiebreaker below (which uses unclamped locations)
            if ( Math.abs( d_PX - bestDistanceClamped_PX ) <= 0.1 ) {
                bestPoints.push( p );
            }
            else if ( d_PX < bestDistanceClamped_PX ) {
                bestDistanceClamped_PX = d_PX;
                bestPoints.length = 0;
                bestPoints.push( p );
            }
        } );

        // Break ties using distance from mouse to unclamped datapoint
        let bestPoint: Datapoint | undefined = undefined;
        let bestDistanceUnclamped_LPX = Number.POSITIVE_INFINITY;
        for ( const p of bestPoints ) {
            const x = p.x;
            const y = p.y;
            const dx_LPX = ( xMouse - x )*this.axis.x.scale;
            const dy_LPX = ( yMouse - y )*this.axis.y.scale;
            const d_LPX = Math.hypot( dx_LPX, dy_LPX );
            if ( d_LPX <= bestDistanceUnclamped_LPX ) {
                bestDistanceUnclamped_LPX = d_LPX;
                bestPoint = p;
            }
        }

        return ( bestPoint && new BasicLinePoint( requireDefined( this.line ), bestPoint.i ) );
    }

    protected updateQuadTree( ): void {
        const { line } = this.linePainter;
        if ( line !== this.line ) {
            this.quadTree = new QuadTree( );
            if ( line ) {
                for ( let i = 0; i < line.length; i++ ) {
                    const x = line.x( i );
                    const y = line.y( i );
                    if ( isDefined( x ) && isDefined( y ) ) {
                        this.quadTree.add( { x, y, i } );
                    }
                }
            }
            this.line = line;
        }
    }
}

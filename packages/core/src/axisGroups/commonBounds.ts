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
import { ActivityListenable, ActivityListenableBasic, Disposer, nextDownFloat64, nextUpFloat64, Nullable } from '@metsci/gleam-util';
import { Axis1D, Axis2D, AxisGroup1D, AxisGroupMember1D, AxisState1D } from '../core';
import { Interval1D, Interval2D, Point2D, x, y } from '../support';

export function createCommonBoundsAxis1D( bounds: Interval1D = Interval1D.fromEdges( -10, +10 ),
                                          tieFrac: number = 0.0 ): Axis1D {
    return new Axis1D( new CommonBoundsAxisGroup1D( tieFrac, bounds ) );
}

export function createCommonBoundsAxis2D( bounds: Interval2D = Interval2D.fromEdges( -10, +10, -10, +10 ),
                                          tieFrac: Point2D | [number,number] = [ 0.0, 0.0 ] ): Axis2D {
    return new Axis2D( createCommonBoundsAxis1D( bounds.x, x( tieFrac ) ),
                       createCommonBoundsAxis1D( bounds.y, y( tieFrac ) ) );
}

const validSpanMin = nextUpFloat64( 1.0/Number.MAX_VALUE );
export const validSpanInterval = Object.freeze( Interval1D.fromEdges( validSpanMin, 1.0/validSpanMin ) );

export function isValidTieCoord( tieCoord: any ): tieCoord is Number {
    return ( typeof( tieCoord ) === 'number' && isFinite( tieCoord ) );
}

export function isValidSpanLpx( span_LPX: any ): span_LPX is Number {
    return ( typeof( span_LPX ) === 'number' && isFinite( span_LPX ) && span_LPX > 0 );
}

export function spanConstraintToScale( span_LPX: number, spanConstraint: Interval1D ): Nullable<Interval1D> {
    if ( isValidSpanLpx( span_LPX ) ) {
        const spanMin = Math.max( 0, spanConstraint.max );
        const spanMax = Math.max( 0, spanConstraint.min );
        return Interval1D.fromEdges( span_LPX / spanMin, span_LPX / spanMax );
    }
    else {
        return null;
    }
}

export function scaleConstraintToSpan( span_LPX: number, scaleConstraint: Interval1D ): Nullable<Interval1D> {
    if ( isValidSpanLpx( span_LPX ) ) {
        const scaleMin = Math.max( 0, scaleConstraint.max );
        const scaleMax = Math.max( 0, scaleConstraint.min );
        return Interval1D.fromEdges( span_LPX / scaleMin, span_LPX / scaleMax );
    }
    else {
        return null;
    }
}

export function minMaxConstraintsToSpan( minConstraint: Interval1D, maxConstraint: Interval1D ): Interval1D {
    return Interval1D.fromEdges( maxConstraint.min - minConstraint.max, maxConstraint.max - minConstraint.min );
}

export function combineAxisConstraints( axes: Iterable<AxisGroupMember1D>, getConstraint: ( axis: AxisGroupMember1D ) => Nullable<Interval1D> ): Interval1D {
    let result = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );
    for ( const axis of axes ) {
        const interval = getConstraint( axis );
        if ( interval ) {
            result = doCombineConstraints( result, interval );
        }
    }
    return result;
}

/**
 * Reduce constraints to a single constraint using `doCombineConstraints`. Order
 * matters, in some cases.
 */
export function combineConstraints( a: Interval1D, ...others: Nullable<Interval1D>[] ): Interval1D {
    let result = a;
    for ( const b of others ) {
        if ( b ) {
            result = doCombineConstraints( result, b );
        }
    }
    return result;
}

/**
 * If `a` and `b` overlap, then return their intersection. Otherwise, return a
 * constraint that will clamp everything to whichever end of `a` is closer to `b`.
 * Order matters in some cases.
 */
export function doCombineConstraints( a: Interval1D, b: Interval1D ): Interval1D {
    if ( a.max <= b.min ) {
        return Interval1D.fromEdges( nextDownFloat64( a.max ), a.max );
    }
    else if ( b.max <= a.min ) {
        return Interval1D.fromEdges( a.min, nextUpFloat64( a.min ) );
    }
    else {
        const min = Math.max( a.min, b.min );
        const max = Math.min( a.max, b.max );
        return Interval1D.fromEdges( min, max );
    }
}

export class CommonBoundsAxisGroup1D implements AxisGroup1D {
    protected readonly _changes: ActivityListenableBasic;

    protected readonly tieFrac: number;
    protected prioritizeMinConstraint: boolean;
    protected readonly axes: Set<AxisGroupMember1D>;

    protected span: number;
    protected tieCoord: number;
    protected stateMarker: object;

    constructor( tieFrac: number, bounds: Interval1D ) {
        this._changes = new ActivityListenableBasic( );

        this.tieFrac = tieFrac;
        this.prioritizeMinConstraint = true;
        this.axes = new Set( );

        this.span = bounds.span;
        this.tieCoord = bounds.fracToValue( this.tieFrac );
        this.stateMarker = {};
    }

    get changes( ): ActivityListenable {
        return this._changes;
    }

    clone( ): CommonBoundsAxisGroup1D {
        const min = this.tieCoord - this.tieFrac*this.span;
        return new CommonBoundsAxisGroup1D( this.tieFrac, Interval1D.fromRect( min, this.span ) );
    }

    /**
     * Call reconstrain() after calling this method.
     */
    addMember( axis: AxisGroupMember1D ): Disposer {
        if ( this.axes.has( axis ) ) {
            throw new Error( 'This axis is already a member of this group' );
        }
        else {
            this.axes.add( axis );
            return ( ) => {
                this.axes.delete( axis );
            };
        }
    }

    set( ongoing: boolean, span_LPX: number, bounds: Interval1D ): void;
    set( ongoing: boolean, span_LPX: number, min: number, max: number ): void;
    set( ongoing: boolean, span_LPX: number, frac: number, coord: number, scale: number ): void;
    set( ongoing: boolean, span_LPX: number, a: any, b?: any, c?: any ): void {
        if ( c !== undefined ) {
            const frac = a as number;
            const coord = b as number;
            const scale = c as number;
            const span = span_LPX / scale;
            return this.doSet( ongoing, frac, coord, span );
        }
        else if ( b !== undefined ) {
            const min = a as number;
            const max = b as number;
            const span = max - min;
            return this.doSet( ongoing, 0.0, min, span );
        }
        else {
            const bounds = a as Interval1D;
            return this.doSet( ongoing, 0.0, bounds.min, bounds.span );
        }
    }

    pan( ongoing: boolean, span_LPX: number, frac: number, coord: number ): void {
        this.doSet( ongoing, frac, coord, this.span );
    }

    reconstrain( ongoing: boolean ): void {
        this.doSet( ongoing, this.tieFrac, this.tieCoord, this.span );
    }

    protected doSet( ongoing: boolean, frac: number, coord: number, span: number ): void {
        const thisSpan = this.constrainSpan( span );
        const thisTieCoord = this.constrainTieCoord( frac, coord, thisSpan );
        if ( !Number.isNaN( thisSpan ) && isValidTieCoord( thisTieCoord ) ) {
            this.span = thisSpan;
            this.tieCoord = thisTieCoord;
            this.fire( ongoing );
        }
    }

    protected constrainSpan( span: number ): number {
        const spanBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return axis.spanConstraint;
        } );

        const scaleBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return scaleConstraintToSpan( axis.span_LPX, axis.scaleConstraint );
        } );

        const minMaxBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return minMaxConstraintsToSpan( axis.minConstraint, axis.maxConstraint );
        } );

        const constraint = combineConstraints( validSpanInterval,
                                               spanBasedConstraint,
                                               scaleBasedConstraint,
                                               minMaxBasedConstraint );

        return constraint.clamp( span );
    }

    protected constrainTieCoord( frac: number, coord: number, span: number ): number {
        const tieCoord = coord + ( this.tieFrac - frac )*span;

        const minBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return axis.minConstraint.shift( this.tieFrac * span );
        } );

        const maxBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return axis.maxConstraint.shift( ( this.tieFrac - 1 ) * span );
        } );

        const constraint = ( this.prioritizeMinConstraint ? combineConstraints( minBasedConstraint, maxBasedConstraint )
                                                          : combineConstraints( maxBasedConstraint, minBasedConstraint ) );

        return constraint.clamp( tieCoord );
    }

    protected fire( ongoing: boolean ): void {
        this.stateMarker = {};
        this._changes.fire( ongoing );
    }

    getStateMarker( ): object {
        return this.stateMarker;
    }

    /**
     * Convenience method that returns the common bounds, which are not affected by span_LPX.
     */
    getBounds( ): Interval1D {
        const min = this.tieCoord - this.tieFrac*this.span;
        return Interval1D.fromRect( min, this.span );
    }

    /**
     * Convenience method that sets the common bounds, which are not affected by span_LPX.
     */
    setBounds( ongoing: boolean, bounds: Interval1D ): void;
    setBounds( ongoing: boolean, min: number, max: number ): void;
    setBounds( ongoing: boolean, a: any, b?: any ): void {
        if ( b !== undefined ) {
            const min = a as number;
            const max = b as number;
            const span = max - min;
            return this.doSet( ongoing, 0.0, min, span );
        }
        else {
            const bounds = a as Interval1D;
            return this.doSet( ongoing, 0.0, bounds.min, bounds.span );
        }
    }

    computeAxisState( span_LPX: number ): AxisState1D {
        return {
            span_LPX: span_LPX,
            marker: this.stateMarker,
            bounds: this.getBounds( ),
            scale: span_LPX / this.span
        };
    }
}

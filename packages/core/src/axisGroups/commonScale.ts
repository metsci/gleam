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
import { ActivityListenable, ActivityListenableBasic, Disposer, nextUpFloat64, Nullable } from '@metsci/gleam-util';
import { Axis1D, Axis2D, AxisGroup1D, AxisGroupMember1D, AxisState1D } from '../core';
import { Interval1D, Point2D, x, y } from '../support';
import { isfn, isnum } from '../util';
import { combineAxisConstraints, combineConstraints, isValidSpanLpx, isValidTieCoord, minMaxConstraintsToSpan, spanConstraintToScale } from './commonBounds';

export function createCommonScaleAxis1D( tieFrac: number = 0.5,
                                         tieCoord: number = 0.0,
                                         scale: number = 250 ): Axis1D {
    return new Axis1D( new CommonScaleAxisGroup1D( tieFrac, tieCoord, scale ) );
}

export function createCommonScaleAxis2D( tieFrac: Point2D | [number,number] = [ 0.5, 0.5 ],
                                         tieCoord: Point2D | [number,number] = [ 0.0, 0.0 ],
                                         scale: Point2D | [number,number] = [ 250, 250 ] ): Axis2D {
    return new Axis2D( createCommonScaleAxis1D( x( tieFrac ), x( tieCoord ), x( scale ) ),
                       createCommonScaleAxis1D( y( tieFrac ), y( tieCoord ), y( scale ) ) );
}

export function lockScaleRatio( axisAB: Axis2D, ratio: number ): void;
export function lockScaleRatio( axisA: Axis1D, axisB: Axis1D, ratio: number ): void;
export function lockScaleRatio( arg0: any, arg1: any, arg2?: any ): void {
    let axisA;
    let axisB;
    let ratio;
    if ( arg2 === undefined ) {
        axisA = ( arg0 as Axis2D ).x;
        axisB = ( arg0 as Axis2D ).y;
        ratio = arg1 as number;
    }
    else {
        axisA = arg0 as Axis1D;
        axisB = arg1 as Axis1D;
        ratio = arg2 as number;
    }

    const groupA = axisA.getGroup( ) as any;
    const groupB = axisB.getGroup( ) as any;
    if ( isfn( groupA.setScaleRatioLock ) && isfn( groupB.setScaleRatioLock ) ) {
        ( groupA as CommonScaleAxisGroup1D ).setScaleRatioLock( groupB as CommonScaleAxisGroup1D, ratio );
    }
    else {
        throw new Error( 'Axes belong to groups that do not support scale-ratio locking' );
    }
}

export function unlockScaleRatio( axis: Axis1D ): void {
    const group = axis.getGroup( ) as any;
    if ( isfn( group.clearScaleRatioLock ) ) {
        group.clearScaleRatioLock( );
    }
}

export interface ScaleRatioLock {
    readonly group: CommonScaleAxisGroup1D;
    readonly ratio: number;
}

const validScaleMin = nextUpFloat64( 1.0/Number.MAX_VALUE );
export const validScaleInterval = Object.freeze( Interval1D.fromEdges( validScaleMin, 1.0/validScaleMin ) );

export function isValidScaleRatio( ratio: any ): ratio is Number {
    return ( typeof( ratio ) === 'number' && isFinite( ratio ) && isFinite( 1.0/ratio ) && ratio > 0 );
}

export class CommonScaleAxisGroup1D implements AxisGroup1D {
    protected readonly _changes: ActivityListenableBasic;

    protected readonly tieFrac: number;
    protected prioritizeMinConstraint: boolean;
    protected scaleRatioLock: Nullable<ScaleRatioLock>;
    protected readonly axes: Set<AxisGroupMember1D>;

    protected scale: number;
    protected tieCoord: number;
    protected stateMarker: object;

    constructor( tieFrac: number, tieCoord?: number, scale?: number ) {
        this._changes = new ActivityListenableBasic( );

        this.tieFrac = tieFrac;
        this.prioritizeMinConstraint = true;
        this.scaleRatioLock = null;
        this.axes = new Set( );

        this.scale = ( scale !== undefined && !Number.isNaN( scale ) ? validScaleInterval.clamp( scale ) : 1000 );
        this.tieCoord = ( isValidTieCoord( tieCoord ) ? tieCoord : 0 );
        this.stateMarker = {};
    }

    get changes( ): ActivityListenable {
        return this._changes;
    }

    clone( ): CommonScaleAxisGroup1D {
        return new CommonScaleAxisGroup1D( this.tieFrac, this.tieCoord, this.scale );
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

    /**
     * Call reconstrain() after calling this method.
     */
    setScaleRatioLock( other: CommonScaleAxisGroup1D, ratio: number ): void {
        if ( isValidScaleRatio( ratio ) ) {
            other.clearScaleRatioLock( );
            this.scaleRatioLock = { group: other, ratio: ratio };
            other.scaleRatioLock = { group: this, ratio: 1.0/ratio };
        }
        else {
            throw new Error( 'Invalid scale ratio: ' + ratio );
        }
    }

    /**
     * Call reconstrain() after calling this method.
     */
    clearScaleRatioLock( ): void {
        if ( this.scaleRatioLock ) {
            const other = this.scaleRatioLock.group;
            this.scaleRatioLock = null;
            other.scaleRatioLock = null;
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
            return this.doSet( ongoing, { span_LPX, frac, coord }, scale );
        }
        else if ( b !== undefined ) {
            const min = a as number;
            const max = b as number;
            const span = max - min;
            const scale = span_LPX / span;
            const tieCoord = min + this.tieFrac*span;
            return this.doSet( ongoing, tieCoord, scale );
        }
        else {
            const bounds = a as Interval1D;
            const scale = span_LPX / bounds.span;
            const tieCoord = bounds.fracToValue( this.tieFrac );
            return this.doSet( ongoing, tieCoord, scale );
        }
    }

    pan( ongoing: boolean, span_LPX: number, frac: number, coord: number ): void {
        this.doSet( ongoing, { span_LPX, frac, coord }, this.scale );
    }

    reconstrain( ongoing: boolean ): void {
        this.doSet( ongoing, this.tieCoord, this.scale );
    }

    protected doSet( ongoing: boolean, point: { span_LPX: number, frac: number, coord: number }, scale: number ): void;
    protected doSet( ongoing: boolean, tieCoord: number, scale: number ): void;
    protected doSet( ongoing: boolean, pointOrTieCoord: { span_LPX: number, frac: number, coord: number } | number, scale: number ): void {
        // Don't even attempt to update things if scale is zero or NaN
        if ( scale > 0 ) {
            // It's not entirely safe to scale and translate separately, because the scale
            // constraint really ought to consider the LOCAL floating-point precision at the
            // relevant axis coords, and disallow zooming in beyond that precision. However,
            // that would be non-trivial to implement, and in practice is generally prevented
            // by application-specific constraints anyway.
            if ( this.scaleRatioLock ) {
                const other = this.scaleRatioLock.group;
                const thisScale = this.constrainScale( scale );
                const otherScale = thisScale / this.scaleRatioLock.ratio;
                const thisTieCoord = this.constrainTieCoord( pointOrTieCoord, thisScale );
                const otherTieCoord = other.constrainTieCoord( other.tieCoord, otherScale );
                if ( !Number.isNaN( thisScale ) && !Number.isNaN( otherScale ) && isValidTieCoord( thisTieCoord ) && isValidTieCoord( otherTieCoord ) ) {
                    this.scale = thisScale;
                    other.scale = otherScale;
                    this.tieCoord = thisTieCoord;
                    other.tieCoord = otherTieCoord;
                    this.fire( ongoing );
                    other.fire( ongoing );
                }
            }
            else {
                const thisScale = this.constrainScale( scale );
                const thisTieCoord = this.constrainTieCoord( pointOrTieCoord, thisScale );
                if ( !Number.isNaN( thisScale ) && isValidTieCoord( thisTieCoord ) ) {
                    this.scale = thisScale;
                    this.tieCoord = thisTieCoord;
                    this.fire( ongoing );
                }
            }
        }
    }

    protected constrainScale( scale: number ): number {
        if ( this.scaleRatioLock ) {
            const other = this.scaleRatioLock.group;
            const thisConstraint = this.getScaleConstraint( );
            const otherConstraint = other.getScaleConstraint( );
            const constraint = ( thisConstraint ).intersection( otherConstraint.scale( this.scaleRatioLock.ratio ) );
            return constraint.clamp( scale );
        }
        else {
            const constraint = this.getScaleConstraint( );
            return constraint.clamp( scale );
        }
    }

    protected getScaleConstraint( ): Interval1D {
        const scaleBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return axis.scaleConstraint;
        } );

        const spanBasedConstraint = combineAxisConstraints( this.axes, axis => {
            return spanConstraintToScale( axis.span_LPX, axis.spanConstraint );
        } );

        const minMaxBasedConstraint = combineAxisConstraints( this.axes, axis => {
            const spanConstraint = minMaxConstraintsToSpan( axis.minConstraint, axis.maxConstraint );
            return spanConstraintToScale( axis.span_LPX, spanConstraint );
        } );

        return combineConstraints( scaleBasedConstraint, spanBasedConstraint, minMaxBasedConstraint );
    }

    protected constrainTieCoord( pointOrTieCoord: { span_LPX: number, frac: number, coord: number } | number, scale: number ): number {
        const tieCoord = ( isnum( pointOrTieCoord ) ? pointOrTieCoord : this.computeTieCoord( pointOrTieCoord, scale ) );

        const minBasedConstraint = combineAxisConstraints( this.axes, axis => {
            const span_LPX = axis.span_LPX;
            return ( isValidSpanLpx( span_LPX ) ? axis.minConstraint.shift( this.tieFrac * span_LPX / scale ) : null );
        } );

        const maxBasedConstraint = combineAxisConstraints( this.axes, axis => {
            const span_LPX = axis.span_LPX;
            return ( isValidSpanLpx( span_LPX ) ? axis.maxConstraint.shift( ( this.tieFrac - 1 ) * span_LPX / scale ) : null );
        } );

        const constraint = ( this.prioritizeMinConstraint ? combineConstraints( minBasedConstraint, maxBasedConstraint )
                                                          : combineConstraints( maxBasedConstraint, minBasedConstraint ) );

        return constraint.clamp( tieCoord );
    }

    protected computeTieCoord( point: { span_LPX: number, frac: number, coord: number }, scale: number ): number {
        // Note that span doesn't matter when point is right at this.tieFrac
        const span = point.span_LPX / scale;
        return point.coord + ( this.tieFrac - point.frac )*span;
    }

    protected fire( ongoing: boolean ): void {
        this.stateMarker = {};
        this._changes.fire( ongoing );
    }

    getStateMarker( ): object {
        return this.stateMarker;
    }

    getTieCoord( ): number {
        return this.tieCoord;
    }

    getTieFrac( ): number {
        return this.tieFrac;
    }

    getScale( ): number {
        return this.scale;
    }

    computeAxisState( span_LPX: number ): AxisState1D {
        const span = span_LPX / this.scale;
        const min = this.tieCoord - this.tieFrac*span;
        return {
            span_LPX: span_LPX,
            marker: this.stateMarker,
            bounds: Interval1D.fromRect( min, span ),
            scale: this.scale
        };
    }
}

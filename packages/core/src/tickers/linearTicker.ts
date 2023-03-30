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
import { equal, Interval1D, Nullable, run } from '@metsci/gleam-util';
import { Axis1D, AxisLabel, AxisLabelSet, EMPTY_TICKSET, Ticker, TickSet } from '../core';
import { createDomPeer, cssFloat, cssInteger, PeerType, StyleProp, ValueBase } from '../support';

export const linearTickIntervalFactors = Object.freeze( [ 5.0, 2.0, 1.0, 0.5, 0.2, 0.1 ] );

export class LinearTicker implements Ticker {
    readonly peer = createDomPeer( 'linear-ticker', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly majorSpacingApprox_LPX = StyleProp.create( this.style, '--approx-major-spacing-px', cssFloat, 100 );
    readonly minorPerMajor = StyleProp.create( this.style, '--minor-per-major', cssInteger, 5 );

    axisLabel: string;
    axisUnits: string;
    coordFactor: number;
    coordOffset: number;
    minMajorCount: number;

    protected formatTickCanary: ValueBase | undefined;
    protected formatTick: ( ( axisCoord: number ) => string ) | undefined;

    constructor( axisLabel?: Nullable<string>, axisUnits?: Nullable<string>, coordFactor?: number, coordOffset?: number ) {
        this.axisLabel = ( axisLabel ?? '' );
        this.axisUnits = ( axisUnits ?? '' );
        this.coordFactor = ( coordFactor ?? 1.0 );
        this.coordOffset = ( coordOffset ?? 0.0 );
        this.minMajorCount = 3;
        this.formatTickCanary = undefined;
        this.formatTick = undefined;
    }

    toDisplayCoord( axisCoord: number ): number {
        return this.coordOffset + ( this.coordFactor * axisCoord );
    }

    fromDisplayCoord( displayCoord: number ): number {
        return ( displayCoord - this.coordOffset ) / this.coordFactor;
    }

    toDisplayInterval( axisInterval: Interval1D ): Interval1D {
        const a = this.toDisplayCoord( axisInterval.min );
        const b = this.toDisplayCoord( axisInterval.max );
        return Interval1D.fromEdges( Math.min( a, b ), Math.max( a, b ) );
    }

    fromDisplayInterval( displayInterval: Interval1D ): Interval1D {
        const a = this.fromDisplayCoord( displayInterval.min );
        const b = this.fromDisplayCoord( displayInterval.max );
        return Interval1D.fromEdges( Math.min( a, b ), Math.max( a, b ) );
    }

    protected chooseScaleOrder( bounds: Interval1D ): number {
        // Without the epsilon, an axis whose span is a nice round number
        // sometimes flickers rapidly back and forth between scale orders
        const spanEpsilon_PX = 1e-12;
        const spanOrder = order( Math.abs( bounds.span + spanEpsilon_PX ) );
        if ( spanOrder > 0 ) {
            return 3 * Math.floor( ( spanOrder - 1 ) / 3 );
        }
        else if ( spanOrder < 0 ) {
            return 3 * ( Math.ceil( spanOrder / 3 ) - 1 );
        }
        else {
            return 0;
        }
    }

    getTicks( axis: Nullable<Axis1D> ): TickSet {
        if ( !axis || axis.viewport_PX.span <= 0 ) {
            return EMPTY_TICKSET;
        }

        const majorSpacingApprox_LPX = this.majorSpacingApprox_LPX.get( );
        const minorPerMajor = this.minorPerMajor.get( );

        if ( majorSpacingApprox_LPX === null ) {
            return EMPTY_TICKSET;
        }

        const displayBounds = this.toDisplayInterval( axis.bounds );

        const majorSpacingApprox_PX = majorSpacingApprox_LPX * axis.dpr;
        const majorCountApprox = axis.viewport_PX.span / majorSpacingApprox_PX;
        const bestMajorSeq = findLinearTickSeq( this.minMajorCount, majorCountApprox, displayBounds );

        if ( bestMajorSeq === null ) {
            return EMPTY_TICKSET;
        }
        else {
            const majors = [] as number[];
            const majorFirst = bestMajorSeq.first;
            const majorCount = bestMajorSeq.countCurrent;
            const majorStep = bestMajorSeq.step;
            for ( let i = 0; i < majorCount; i++ ) {
                const major = majorFirst + i*majorStep;
                if ( displayBounds.containsPoint( major ) ) {
                    majors.push( this.fromDisplayCoord( major ) );
                }
            }

            const minors = [] as number[];
            const minorStep = majorStep / minorPerMajor;
            for ( let i = -1; i < majorCount; i++ ) {
                const major = majorFirst + i*majorStep;
                for ( let j = 1; j < minorPerMajor; j++ ) {
                    const minor = major + j*minorStep;
                    if ( displayBounds.containsPoint( minor ) ) {
                        minors.push( this.fromDisplayCoord( minor ) );
                    }
                }
            }

            const scaleOrder = this.chooseScaleOrder( displayBounds );
            const scaleFactor = Math.pow( 10, -scaleOrder );
            const precision = -order( Math.abs( majorStep * scaleFactor ) );
            const numDecimalPlaces = Math.max( 0, precision );

            // Reuse the existing `formatTick` fn if we can, so downstream caches stay valid
            const formatTickCanary = new ValueBase( this.coordFactor, this.coordOffset, scaleFactor, numDecimalPlaces );
            if ( !this.formatTick || !equal( formatTickCanary, this.formatTickCanary ) ) {
                this.formatTick = axisCoord => {
                    const scaled = this.toDisplayCoord( axisCoord ) * scaleFactor;
                    return scaled.toFixed( numDecimalPlaces );
                };
                this.formatTickCanary = formatTickCanary;
            }

            const getAxisLabels = ( ) => {
                const scaleText = run( ( ) => {
                    switch ( scaleOrder ) {
                        case 0: return '';
                        case +3: return '\u00D7' + '1,000';
                        case -3: return '\u00D7' + '0.001';
                        default: return '\u00D7' + '10^' + scaleOrder.toFixed( 0 );
                    }
                } );
                const unitsText = joinWords( ' ', scaleText, this.axisUnits );
                const suffixText = ( unitsText.length === 0 ? '' : '(' + unitsText + ')' );
                const axisText = joinWords( ' ', this.axisLabel, suffixText );
                return new AxisLabelSet( [ new AxisLabel( 0.5, axisText ) ], [] );
            };

            return new TickSet( majors, minors, this.formatTick, getAxisLabels );
        }
    }
}

export function joinWords( separator: string, ...words: string[] ): string {
    let s = '';
    for ( const word of words ) {
        if ( word.length > 0 ) {
            if ( s.length > 0 ) {
                s += separator;
            }
            s += word;
        }
    }
    return s;
}

export function order( x: number ): number {
    return Math.floor( Math.log10( x ) );
}

export function findPrelimLinearTickInterval( axisBounds: Interval1D, tickCountApprox: number ): number {
    const axisMin = Math.min( axisBounds.min, axisBounds.max );
    const axisMax = Math.max( axisBounds.min, axisBounds.max );
    const tickStepApprox = ( axisMax - axisMin ) / tickCountApprox;
    return Math.pow( 10, Math.round( Math.log10( tickStepApprox ) ) );
}

export type LinearTickSeq = {
    /**
     * Coord of first tick
     */
    first: number,

    /**
     * Step from one tick to the next
     */
    step: number,

    /**
     * Minimum tick count for the given bounds and this step size
     * -- not a function of first tick coord, which is useful because
     * we want to choose tick step in a way that doesn't vary as
     * the axis pans
     */
    countMin: number,

    /**
     * Actual tick count, given bounds, step, and first tick
     */
    countCurrent: number
};

export function findLinearTickSeq( minTickCount: number, approxTickCount: number, axisBounds: Interval1D ): Nullable<LinearTickSeq> {
    const tickCountTarget = Math.max( minTickCount, approxTickCount );
    const tickStepPrelim = findPrelimLinearTickInterval( axisBounds, tickCountTarget );

    let bestSeq = null as Nullable<LinearTickSeq>;

    // Look for the best factor that gives us at least a minimal number of visible ticks
    {
        let bestMiss = Number.POSITIVE_INFINITY;
        for ( const factor of linearTickIntervalFactors ) {
            const seq = createLinearTickSeq( axisBounds, factor * tickStepPrelim );
            if ( seq.countMin >= minTickCount ) {
                const miss = Math.abs( seq.countMin - tickCountTarget );
                if ( miss < bestMiss ) {
                    bestSeq = seq;
                    bestMiss = miss;
                }
            }
        }
    }

    // If no factor gave us enough visible ticks, use the one that gives us the most visible ticks
    if ( bestSeq === null ) {
        let bestCount = -1;
        for ( const factor of linearTickIntervalFactors ) {
            const seq = createLinearTickSeq( axisBounds, factor * tickStepPrelim );
            if ( seq.countMin > bestCount ) {
                bestSeq = seq;
                bestCount = seq.countMin;
            }
        }
    }

    return bestSeq;
}

export function createLinearTickSeq( axisBounds: Interval1D, tickInterval: number ): LinearTickSeq {
    const axisMin = Math.min( axisBounds.min, axisBounds.max );
    const axisMax = Math.max( axisBounds.min, axisBounds.max );
    const tickStep = Math.abs( tickInterval );
    const tickFirst = Math.ceil( axisMin / tickStep ) * tickStep;
    const tickCountMin = Math.floor( ( axisMax - axisMin ) / tickStep );
    const tickCountCurrent = ( tickFirst > axisMax ? 0 : 1 + Math.floor( ( axisMax - tickFirst ) / tickStep ) );
    return {
        first: tickFirst,
        step: tickStep,
        countMin: tickCountMin,
        countCurrent: tickCountCurrent
    };
}

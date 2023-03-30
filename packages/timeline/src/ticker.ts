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
import { Axis1D, AxisDivider, AxisLabel, AxisLabelSet, createDomPeer, createLinearTickSeq, cssFloat, cssString, EMPTY_AXISLABELSET, EMPTY_TICKSET, findLinearTickSeq, PeerType, StyleProp, Ticker, TickSet } from '@metsci/gleam-core';
import { arrayAllEqual, atLeast, clamp, compareLocalTimes, firstTrue, get, Interval1D, LocalDateTime, localTime, localTimeToPsec, Nullable, psecToIso8601, psecToZonedTime, requireDefined, SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_MONTH_APPROX, SECONDS_PER_YEAR_APPROX, ZonedDateTime, zonedTime, zoneOffsetAt_SEC } from '@metsci/gleam-util';

const { ceil, floor, max, min } = Math;

const UNIT_DURATIONS = Object.freeze( {
    year: { seconds: SECONDS_PER_YEAR_APPROX, isExact: false },
    years: { seconds: SECONDS_PER_YEAR_APPROX, isExact: false },
    month:{ seconds: SECONDS_PER_MONTH_APPROX, isExact: false },
    months: { seconds: SECONDS_PER_MONTH_APPROX, isExact: false },
    day: { seconds: SECONDS_PER_DAY, isExact: true },
    days: { seconds: SECONDS_PER_DAY, isExact: true },
    hour: { seconds: SECONDS_PER_HOUR, isExact: true },
    hours: { seconds: SECONDS_PER_HOUR, isExact: true },
    minute: { seconds: SECONDS_PER_MINUTE, isExact: true },
    minutes: { seconds: SECONDS_PER_MINUTE, isExact: true },
    second: { seconds: 1, isExact: true },
    seconds: { seconds: 1, isExact: true },
} as const );

type DurationUnit = keyof typeof UNIT_DURATIONS;

interface TimeTickIntervalRung {
    readonly stepCount: number;
    readonly stepUnit: DurationUnit;
    readonly stepApprox_SEC: number;
    readonly startUnit: DurationUnit;
}

function rung( stepCount: number, stepUnit: DurationUnit, startUnit: DurationUnit ): TimeTickIntervalRung {
    return {
        stepCount,
        stepUnit,
        stepApprox_SEC: stepCount * UNIT_DURATIONS[ stepUnit ].seconds,
        startUnit,
    };
}

const timeTickIntervalRungs = Object.freeze( [
    rung(  1, 'seconds', 'minute' ),
    rung(  2, 'seconds', 'minute' ),
    rung(  5, 'seconds', 'minute' ),
    rung( 10, 'seconds', 'minute' ),
    rung( 15, 'seconds', 'minute' ),
    rung( 20, 'seconds', 'minute' ),
    rung( 30, 'seconds', 'minute' ),
    rung(  1, 'minutes',   'hour' ),
    rung(  2, 'minutes',   'hour' ),
    rung(  5, 'minutes',   'hour' ),
    rung( 10, 'minutes',   'hour' ),
    rung( 15, 'minutes',   'hour' ),
    rung( 20, 'minutes',   'hour' ),
    rung( 30, 'minutes',   'hour' ),
    rung(  1,   'hours',    'day' ),
    rung(  2,   'hours',    'day' ),
    rung(  3,   'hours',    'day' ),
    rung(  6,   'hours',    'day' ),
    rung( 12,   'hours',    'day' )
] );

function getMonthAbbreviation( month: number ): string {
    switch ( month ) {
        case 1: return 'Jan';
        case 2: return 'Feb';
        case 3: return 'Mar';
        case 4: return 'Apr';
        case 5: return 'May';
        case 6: return 'Jun';
        case 7: return 'Jul';
        case 8: return 'Aug';
        case 9: return 'Sep';
        case 10: return 'Oct';
        case 11: return 'Nov';
        case 12: return 'Dec';
        default: return 'UNK';
    }
}

function formatInt( i: number, minWidth: number ): string {
    return i.toFixed( 0 ).padStart( minWidth, '0' );
}

function truncateToHour( t: ZonedDateTime ): ZonedDateTime {
    const { zoneOffset_MINUTES, year, month, day, hour } = t;
    return zonedTime( zoneOffset_MINUTES, year, month, day, hour, 0, 0 );
}

export class TimeTicker implements Ticker {
    readonly peer = createDomPeer( 'time-ticker', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly timezone = StyleProp.create( this.style, '--timezone', cssString, 'UTC' );
    readonly spacingApprox_LPX = StyleProp.create( this.style, '--approx-spacing-px', cssFloat, 100 );

    minTickCount: number;

    formatYear: ( t: ZonedDateTime ) => string;
    formatMonth: ( t: ZonedDateTime ) => string;
    formatDay: ( t: ZonedDateTime ) => string;
    formatHour: ( t: ZonedDateTime ) => string;
    formatMinute: ( t: ZonedDateTime ) => string;
    formatSecond: ( t: ZonedDateTime ) => string;
    formatUnknown: ( t: ZonedDateTime ) => string;

    formatYearMonth: ( t: ZonedDateTime ) => string;
    formatYearMonthDay: ( t: ZonedDateTime ) => string;
    formatMonthDayHour: ( t: ZonedDateTime ) => string;
    formatHourMinute: ( t: ZonedDateTime ) => string;
    formatMinuteSecond: ( t: ZonedDateTime ) => string;

    protected formatTickCanary: Array<unknown>;
    protected formatTick: ( ( axisCoord: number ) => string ) | undefined;

    constructor( ) {
        this.minTickCount = 3;

        this.formatYear = t => formatInt( t.year, 4 );
        this.formatMonth = t => getMonthAbbreviation( t.month );
        this.formatDay = t => formatInt( t.day, 2 )
        this.formatHour = t => formatInt( t.hour, 2 )
        this.formatMinute = t => formatInt( t.minute, 2 )
        this.formatSecond = t => formatInt( t.second, 2 )
        this.formatUnknown = ( ) => '';

        this.formatYearMonth = t => [ this.formatMonth( t ), this.formatYear( t ) ].join( ' ' );
        this.formatHourMinute = t => [ this.formatHour( t ), this.formatMinute( t ) ].join( '' );
        this.formatMinuteSecond = t => [ this.formatMinute( t ), this.formatSecond( t ) ].join( ':' );
        this.formatYearMonthDay = t => [ this.formatDay( t ), this.formatMonth( t ), this.formatYear( t ) ].join( ' ' );
        this.formatMonthDayHour = t => [ this.formatDay( t ), this.formatMonth( t ), this.formatHourMinute( truncateToHour( t ) ) ].join( ' ' );

        this.formatTickCanary = [];
        this.formatTick = undefined;
    }

    getTicks( axis: Nullable<Axis1D> ): TickSet {
        if ( !axis || axis.viewport_PX.span <= 0 ) {
            return EMPTY_TICKSET;
        }

        const timezone = this.timezone.get( );
        const spacingApprox_LPX = this.spacingApprox_LPX.get( );

        const spacingApprox_PX = spacingApprox_LPX * axis.dpr;
        const axisMin_PSEC = min( axis.bounds.min, axis.bounds.max );
        const axisMax_PSEC = max( axis.bounds.min, axis.bounds.max );
        const approxTickInterval_SEC = ( axisMax_PSEC - axisMin_PSEC ) * spacingApprox_PX / axis.viewport_PX.span;

        let ticks_PSEC: number[];
        let format: ( t: ZonedDateTime ) => string;

        if ( approxTickInterval_SEC > 60*SECONDS_PER_DAY ) {
            format = this.formatYear;
            ticks_PSEC = [];
            const tickCountApprox = axis.viewport_PX.span / spacingApprox_PX;
            const axisBoundsApprox_YEAR = Interval1D.fromEdges( toYear( axisMin_PSEC, timezone ), toYear( axisMax_PSEC, timezone ) );
            let tickSeq_YEAR = findLinearTickSeq( this.minTickCount, tickCountApprox, axisBoundsApprox_YEAR );
            if ( tickSeq_YEAR !== null ) {
                if ( tickSeq_YEAR.step < 1 ) {
                    // Step needs to be at least 1 year
                    tickSeq_YEAR = createLinearTickSeq( axisBoundsApprox_YEAR, 1 );
                }
                for ( let i = 0; i < tickSeq_YEAR.countCurrent; i++ ) {
                    const t_YEAR = tickSeq_YEAR.first + i*tickSeq_YEAR.step;
                    const t_PSEC = fromYear_PSEC( t_YEAR, timezone );
                    ticks_PSEC.push( t_PSEC );
                }
            }
        }
        else if ( approxTickInterval_SEC > 10*SECONDS_PER_DAY ) {
            format = this.formatMonth;
            ticks_PSEC = timeSeq_PSEC( 'month', axis.bounds, 1, 'month', timezone );
        }
        else if ( approxTickInterval_SEC > 12*SECONDS_PER_HOUR ) {
            format = this.formatDay;
            ticks_PSEC = [];
            const approxTickInterval_DAYS = approxTickInterval_SEC / SECONDS_PER_DAY;
            const step_DAYS = firstTrue( [ 1, 2, 3, 4, 5, 7 ], 10, atLeast( approxTickInterval_DAYS ) );
            const months_PSEC = timeSeq_PSEC( 'month', axis.bounds, 1, 'month', timezone );
            for ( let i = 1; i < months_PSEC.length; i++ ) {
                const monthStart_PSEC = months_PSEC[ i - 1 ];
                const monthEnd_PSEC = months_PSEC[ i ] - 0.5*SECONDS_PER_DAY;
                for ( let t_PSEC of timeSeq_PSEC( 'day', [ monthStart_PSEC, monthEnd_PSEC ], step_DAYS, 'day', timezone ) ) {
                    if ( monthStart_PSEC <= t_PSEC && t_PSEC <= monthEnd_PSEC ) {
                        ticks_PSEC.push( t_PSEC );
                    }
                }
            }
        }
        else if ( approxTickInterval_SEC > 0 ) {
            const rung = requireDefined( firstTrue( timeTickIntervalRungs, r => ( r.stepApprox_SEC >= approxTickInterval_SEC ) ) );
            ticks_PSEC = timeSeq_PSEC( rung.startUnit, axis.bounds, rung.stepCount, rung.stepUnit, timezone );
            format = ( rung.stepUnit === 'second' || rung.stepUnit === 'seconds' ? this.formatMinuteSecond : this.formatHourMinute );
        }
        else {
            ticks_PSEC = [];
            format = this.formatUnknown;
        }

        // Drop any ticks outside axis bounds
        ticks_PSEC = ticks_PSEC.filter( t_PSEC => ( axisMin_PSEC <= t_PSEC && t_PSEC <= axisMax_PSEC ) );

        // Reuse the existing `formatTick` fn if we can, so downstream caches stay valid
        const formatTickCanary = [ timezone, format ];
        if ( !this.formatTick || !arrayAllEqual( formatTickCanary, this.formatTickCanary ) ) {
            this.formatTick = t_PSEC => format( psecToZonedTime( t_PSEC, timezone ) );
            this.formatTickCanary = formatTickCanary;
        }

        const getAxisLabels = ( ) => {
            if ( approxTickInterval_SEC > 60*SECONDS_PER_DAY ) {
                return EMPTY_AXISLABELSET;
            }
            else if ( approxTickInterval_SEC > 10*SECONDS_PER_DAY ) {
                return createAxisLabels( axis.bounds, timezone, 'year', this.formatYear );
            }
            else if ( approxTickInterval_SEC > 12*SECONDS_PER_HOUR ) {
                return createAxisLabels( axis.bounds, timezone, 'month', this.formatYearMonth );
            }
            else if ( approxTickInterval_SEC > 0 ) {
                const rung = requireDefined( firstTrue( timeTickIntervalRungs, r => ( r.stepApprox_SEC >= approxTickInterval_SEC ) ) );
                if ( rung.stepUnit === 'second' || rung.stepUnit === 'seconds' ) {
                    return createAxisLabels( axis.bounds, timezone, 'hour', this.formatMonthDayHour );
                }
                else {
                    return createAxisLabels( axis.bounds, timezone, 'day', this.formatYearMonthDay );
                }
            }
            else {
                return EMPTY_AXISLABELSET;
            }
        };

        return new TickSet(
            ticks_PSEC,
            [],
            this.formatTick,
            getAxisLabels,
        );
    }
}

function createAxisLabels( axisBounds_PSEC: Interval1D, timezone: string, unit: DurationUnit, format: ( t: ZonedDateTime ) => string ): AxisLabelSet {
    const times_PSEC = timeSeq_PSEC( unit, axisBounds_PSEC, 1, unit, timezone );

    const axisLabels = new Array<AxisLabel>( );
    for ( let i = 1; i < times_PSEC.length; i++ ) {
        const start_PSEC = times_PSEC[ i - 1 ];
        const end_PSEC = times_PSEC[ i ];

        const visibleStart_PSEC = clamp( start_PSEC, end_PSEC, axisBounds_PSEC.min );
        const visibleEnd_PSEC = clamp( start_PSEC, end_PSEC, axisBounds_PSEC.max );
        const visibleCenter_PSEC = visibleStart_PSEC + 0.5*( visibleEnd_PSEC - visibleStart_PSEC );

        axisLabels.push( new AxisLabel(
            axisBounds_PSEC.valueToFrac( visibleCenter_PSEC ),
            format( psecToZonedTime( visibleCenter_PSEC, timezone ) ),
            axisBounds_PSEC.valueToFrac( visibleStart_PSEC ),
            axisBounds_PSEC.valueToFrac( visibleEnd_PSEC ),
        ) );
    }

    const axisDividers = new Array<AxisDivider>( );
    for ( const time_PSEC of times_PSEC ) {
        const axisFrac = axisBounds_PSEC.valueToFrac( time_PSEC );
        if ( 0 <= axisFrac && axisFrac <= 1 ) {
            axisDividers.push( new AxisDivider( axisFrac ) );
        }
    }

    return new AxisLabelSet( axisLabels, axisDividers );
}

function getIntervalStartAtOrBefore( startUnit: DurationUnit, t_PSEC: number, timezone: string ): LocalDateTime {
    const { year,month,day, hour,minute,second } = psecToZonedTime( t_PSEC, timezone );
    switch ( startUnit ) {
        case 'year':   case 'years':   return localTime( year,1,1, 0,0,0 );
        case 'month':  case 'months':  return localTime( year,month,1, 0,0,0 );
        case 'day':    case 'days':    return localTime( year,month,day, 0,0,0 );
        case 'hour':   case 'hours':   return localTime( year,month,day, hour,0,0 );
        case 'minute': case 'minutes': return localTime( year,month,day, hour,minute,0 );
        case 'second': case 'seconds': return localTime( year,month,day, hour,minute,floor( second ) );
    }
}

function advanceLocalTime( t: LocalDateTime, stepCount: number, stepUnit: DurationUnit ): LocalDateTime {
    const { year,month,day, hour,minute,second } = t;
    switch ( stepUnit ) {
        case 'year':   case 'years':   return localTime( year+stepCount,month,day, hour,minute,second );
        case 'month':  case 'months':  return localTime( year,month+stepCount,day, hour,minute,second );
        case 'day':    case 'days':    return localTime( year,month,day+stepCount, hour,minute,second );
        case 'hour':   case 'hours':   return localTime( year,month,day, hour+stepCount,minute,second );
        case 'minute': case 'minutes': return localTime( year,month,day, hour,minute+stepCount,second );
        case 'second': case 'seconds': return localTime( year,month,day, hour,minute,second+stepCount );
    }
}

/**
 * Returned array will be in order, and will include at least one element before
 * bounds-min and at least one element after bounds-max.
 */
export function timeSeq_PSEC(
    startUnit: DurationUnit,
    bounds_PSEC: { min: number, max: number } | [ min: number, max: number ],
    stepCount: number,
    stepUnit: DurationUnit,
    timezone: string,
): Array<number> {
    const min_PSEC = ( bounds_PSEC instanceof Array ? min( ...bounds_PSEC ) : min( bounds_PSEC.min, bounds_PSEC.max ) );
    const max_PSEC = ( bounds_PSEC instanceof Array ? max( ...bounds_PSEC ) : max( bounds_PSEC.min, bounds_PSEC.max ) );

    // Use a fixed step, if we can
    const step = UNIT_DURATIONS[ stepUnit ];
    if ( step.isExact ) {
        const step_SEC = stepCount * step.seconds;

        const tFirst_PSEC = get( ( ) => {
            const t = getIntervalStartAtOrBefore( startUnit, min_PSEC, timezone );
            const ts_PSEC = localTimeToPsec( t, timezone );
            if ( ts_PSEC.length > 0 ) {
                return min( ...ts_PSEC );
            }

            // t is in a "spring forward" gap, so back up far enough to get out of it
            const t2 = advanceLocalTime( t, -2, 'hours' );
            const ts2_PSEC = localTimeToPsec( t2, timezone );
            if ( ts2_PSEC.length > 0 ) {
                return min( ...ts2_PSEC );
            }

            console.warn( `Failed to get timezone-specific first tick time: start-unit = ${startUnit}, axis-min = ${psecToIso8601( min_PSEC, timezone)}, timezone = ${timezone}` );
            return ( floor( min_PSEC / step_SEC ) * step_SEC );
        } );

        const tLast_PSEC = get( ( ) => {
            const t = advanceLocalTime( getIntervalStartAtOrBefore( stepUnit, max_PSEC, timezone ), stepCount, stepUnit );
            const ts_PSEC = localTimeToPsec( t, timezone );
            if ( ts_PSEC.length > 0 ) {
                return max( ...ts_PSEC );
            }

            // t is in a "spring forward" gap, so advance far enough to get out of it
            const t2 = advanceLocalTime( t, +2, 'hours' );
            const ts2_PSEC = localTimeToPsec( t2, timezone );
            if ( ts2_PSEC.length > 0 ) {
                return max( ...ts2_PSEC );
            }

            console.warn( `Failed to get timezone-specific last tick time: step-unit = ${stepUnit}, axis-max = ${psecToIso8601( max_PSEC, timezone)}, timezone = ${timezone}` );
            return ( ceil( max_PSEC / step_SEC ) * step_SEC );
        } );

        const zoneOffsetChange_SEC = zoneOffsetAt_SEC( tLast_PSEC, timezone ) - zoneOffsetAt_SEC( tFirst_PSEC, timezone );
        if ( zoneOffsetChange_SEC % step_SEC === 0 ) {
            const times_PSEC = new Array<number>( );
            for ( let t_PSEC = tFirst_PSEC; t_PSEC <= tLast_PSEC; t_PSEC += step_SEC ) {
                times_PSEC.push( t_PSEC );
            }
            return times_PSEC;
        }
    }

    // Fixed step wasn't an option, so step by incrementing the appropriate date-time field
    const tFirst = getIntervalStartAtOrBefore( startUnit, min_PSEC, timezone );
    const tLast = advanceLocalTime( getIntervalStartAtOrBefore( stepUnit, max_PSEC, timezone ), 1, stepUnit );
    const times_PSEC = new Array<number>( );
    for ( let t = tFirst; compareLocalTimes( t, tLast ) <= 0; t = advanceLocalTime( t, stepCount, stepUnit ) ) {
        const ts_PSEC = localTimeToPsec( t, timezone );
        if ( ts_PSEC.length === 0 ) {
            // A "spring forward" timezone change can result in zero possible t_PSEC values, in
            // which case we skip the tick
        }
        else {
            // A "fall back" timezone change can result in two possible t_PSEC values, in which case
            // we use the one from the timezone before the timezone change, i.e. the earlier one
            times_PSEC.push( min( ...ts_PSEC ) );
        }
    }
    return times_PSEC;
}

function toYear( t_PSEC: number, timezone: string ): number {
    return psecToZonedTime( t_PSEC, timezone ).year;
}

function fromYear_PSEC( year: number, timezone: string ): number {
    // We don't expect timezone changes at New Year's, but it's easy to scoot over
    // an hour and try again, and doing so makes us robust to unexpected situations
    for ( let hour = 0; hour < 2; hour++ ) {
        const ts_PSEC = localTimeToPsec( localTime( year,1,1, hour,0,0 ), timezone );
        if ( ts_PSEC.length > 0 ) {
            return min( ...ts_PSEC );
        }
    }
    throw new Error( );
}

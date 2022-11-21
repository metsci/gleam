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
import { LinkedMap } from './linked';
import { get, isDefined, Supplier } from './misc';

const { abs, floor, trunc } = Math;
const { parseInt } = Number;

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_YEAR_APPROX = 365.2425;

export const DAYS_PER_MONTH_APPROX = DAYS_PER_YEAR_APPROX / 12.0;

export const HOURS_PER_YEAR_APPROX = HOURS_PER_DAY * DAYS_PER_YEAR_APPROX;
export const HOURS_PER_MONTH_APPROX = HOURS_PER_DAY * DAYS_PER_MONTH_APPROX;

export const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;
export const MINUTES_PER_MONTH_APPROX = MINUTES_PER_DAY * DAYS_PER_MONTH_APPROX;
export const MINUTES_PER_YEAR_APPROX = MINUTES_PER_DAY * DAYS_PER_YEAR_APPROX;

export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
export const SECONDS_PER_MONTH_APPROX = SECONDS_PER_DAY * DAYS_PER_MONTH_APPROX;
export const SECONDS_PER_YEAR_APPROX = SECONDS_PER_DAY * DAYS_PER_YEAR_APPROX;

export interface LocalDateTime {
    kind: 'LOCAL';
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

export function localTime( year: number, month: number, day: number, hour: number, minute: number, second: number ): LocalDateTime {
    return { kind: 'LOCAL', year, month, day, hour, minute, second };
}

/**
 * Compare local times assuming they are from the same timezone offset.
 */
export function compareLocalTimes( a: LocalDateTime, b: LocalDateTime ): number {
    const aAsUtc_PSEC = utcTimeToPsec( a.year, a.month, a.day, a.hour, a.minute, a.second );
    const bAsUtc_PSEC = utcTimeToPsec( b.year, b.month, b.day, b.hour, b.minute, b.second );
    return ( aAsUtc_PSEC - bAsUtc_PSEC );
}

export interface ZonedDateTime {
    kind: 'ZONED';
    zoneOffset_MINUTES: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

export function zonedTime( zoneOffset_MINUTES: number, year: number, month: number, day: number, hour: number, minute: number, second: number ): ZonedDateTime {
    return { kind: 'ZONED', zoneOffset_MINUTES, year, month, day, hour, minute, second };
}

export function compareZonedTimes( a: ZonedDateTime, b: ZonedDateTime ): number {
    return ( zonedTimeToPsec( a ) - zonedTimeToPsec( b ) );
}

export function zonedTimeToPsec( t: ZonedDateTime ): number {
    const { zoneOffset_MINUTES, year, month, day, hour, minute, second } = t;
    return ( utcTimeToPsec( year, month, day, hour, minute, second ) - 60*zoneOffset_MINUTES );
}

const cacheForPsecToZonedTime = createLruCache<string,ZonedDateTime>( 1024 );
export function psecToZonedTime( t_PSEC: number, timezone: string ): ZonedDateTime {
    const tTrunc_PSEC = trunc( t_PSEC );
    const cacheKey = tTrunc_PSEC.toFixed( 0 ) + '@' + timezone;
    const tTruncCached = cacheForPsecToZonedTime( cacheKey, ( ) => {
        const result = zonedTime( NaN, NaN,NaN,NaN, NaN,NaN,NaN );
        const parts = getFullFormatter( timezone ).formatToParts( 1e3*tTrunc_PSEC );
        for ( const { type, value } of parts ) {
            switch ( type ) {
                case 'timeZoneName': result.zoneOffset_MINUTES = parseZoneOffset_MINUTES( value ); break;
                case 'year': result.year = parseInt( value, 10 ); break;
                case 'month': result.month = parseInt( value, 10 ); break;
                case 'day': result.day = parseInt( value, 10 ); break;
                case 'hour': result.hour = ( value === '24' ? 0 : parseInt( value, 10 ) ); break;
                case 'minute': result.minute = parseInt( value, 10 ); break;
                case 'second': result.second = parseInt( value, 10 ); break;
            }
        }
        if ( Number.isNaN( result.zoneOffset_MINUTES ) || Number.isNaN( result.year ) || Number.isNaN( result.month ) || Number.isNaN( result.day ) || Number.isNaN( result.hour ) || Number.isNaN( result.minute ) || Number.isNaN( result.second ) ) {
            throw { message: 'Failed to convert time', tTrunc_PSEC, timezone, parts, incomplete: result };
        }
        return result;
    } );
    const result = { ...tTruncCached };
    result.second += t_PSEC - tTrunc_PSEC;
    return result;
}

const cacheForZoneOffsetAt = createLruCache<string,number>( 1024 );
export function zoneOffsetAt_SEC( t_PSEC: number, timezone: string ): number {
    const cacheKey = t_PSEC.toFixed( 0 ) + '@' + timezone;
    return cacheForZoneOffsetAt( cacheKey, ( ) => {
        const tTrunc_PSEC = trunc( t_PSEC );
        const parts = getZoneFormatter( timezone ).formatToParts( 1e3*tTrunc_PSEC );
        for ( const { type, value } of parts ) {
            if ( type === 'timeZoneName' ) {
                return 60*parseZoneOffset_MINUTES( value );
            }
        }
        throw { message: 'Failed to find zone offset', t_PSEC, timezone, parts };
    } );
}

const cacheForGetFullFormatter = createLruCache<string,Intl.DateTimeFormat>( 32 );
function getFullFormatter( timezone: string ): Intl.DateTimeFormat {
    return cacheForGetFullFormatter( timezone, ( ) => {
        return Object.freeze( new Intl.DateTimeFormat( 'en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            hour12: false,
            minute: 'numeric',
            second: 'numeric',
        } ) );
    } );
}

const cacheForGetZoneFormatter = createLruCache<string,Intl.DateTimeFormat>( 32 );
function getZoneFormatter( timezone: string ): Intl.DateTimeFormat {
    return cacheForGetZoneFormatter( timezone, ( ) => {
        return Object.freeze( new Intl.DateTimeFormat( 'en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        } ) );
    } );
}

const cacheForParseZoneOffset = createLruCache<string,number>( 32 );
function parseZoneOffset_MINUTES( longOffsetTimezone: string ): number {
    return cacheForParseZoneOffset( longOffsetTimezone, ( ) => {
        // Regex groups                           1         1 23    34           456 6 7          7 5 2
        const parts = longOffsetTimezone.match( /^(GMT|UTC|Z)?((\+|-)([0-9][0-9]?)((:)?([0-9][0-9])?)?)?$/ );
        if ( !parts ) {
            throw new Error( `Failed to parse timezone string: ${longOffsetTimezone}` );
        }
        else if ( !parts[2] ) {
            return 0;
        }
        else {
            const sign = ( parts[3] === '-' ? -1 : +1 );
            const hours = parseInt( parts[4], 10 );
            const minutes = ( parts[7] ? parseInt( parts[7], 10 ) : 0 );
            return sign*( 60*hours + minutes );
        }
    } );
}

/**
 * Like `Date.UTC()` but with the following tweaks:
 *  - `month` is 1-based instead of 0-based
 *  - Fractional seconds are retained
 *  - Return value is in POSIX seconds rather than millis
 */
export function utcTimeToPsec( year: number, month: number, day: number, hour: number, minute: number, second: number ): number {
    const additionalMinutes = floor( second / 60 );
    const second2 = second - 60*additionalMinutes;
    const minute2 = minute + additionalMinutes;
    return ( 1e-3*Date.UTC( year, month - 1, day, hour, minute2 ) + second2 );
}

/**
 * Cases:
 *  - Returns 1 result for most arguments
 *  - Returns zero results iff `t` gets skipped over by a "spring forward" time change
 *  - Returns two results iff `t` appears twice due to a "fall back" time change
 */
export function localTimeToPsec( t: LocalDateTime, timezone: string ): Array<number> {
    const ballpark_PSEC = utcTimeToPsec( t.year, t.month, t.day, t.hour, t.minute, t.second );
    const zoneAtBallpark_SEC = zoneOffsetAt_SEC( ballpark_PSEC, timezone );
    const guess_PSEC = ballpark_PSEC + ( 0 - zoneAtBallpark_SEC );
    const zoneAtGuess_SEC = zoneOffsetAt_SEC( guess_PSEC, timezone );
    const primary_PSEC = guess_PSEC + ( zoneAtBallpark_SEC - zoneAtGuess_SEC );
    const zoneAtPrimary_SEC = zoneOffsetAt_SEC( primary_PSEC, timezone );

    // Is the target local-time repr in a "spring forward" gap?
    if ( zoneAtPrimary_SEC !== zoneAtGuess_SEC ) {
        // Refinement subtracted out the mismatch between the guess local-time repr
        // and the target local-time repr. But refinement landed in a different zone-
        // offset, so the local-time repr of the refined value still doesn't match
        // the target, due to the zone-offset change. Further refinement is useless
        // -- it would take us back to the original guess.
        return [];
    }

    // TODO: Can we handle historical zone-offset changes?

    // Is primary right after a "fall back" time change?
    for ( let lookback_SEC of [ -1800, -3600, -7200 ] ) {
        const zoneBeforePrimary_SEC = zoneOffsetAt_SEC( primary_PSEC + lookback_SEC, timezone );
        const zoneChange_SEC = zoneAtPrimary_SEC - zoneBeforePrimary_SEC;
        if ( zoneChange_SEC <= lookback_SEC ) {
            // There's never a tertiary, so now that we've found a secondary we're done
            return [ primary_PSEC, primary_PSEC + zoneChange_SEC ];
        }
    }

    // Is primary right before a "fall back" time change?
    for ( let lookahead_SEC of [ +1800, +3600, +7200 ] ) {
        const zoneAfterPrimary_SEC = zoneOffsetAt_SEC( primary_PSEC + lookahead_SEC, timezone );
        const zoneChange_SEC = zoneAfterPrimary_SEC - zoneAtPrimary_SEC;
        if ( zoneChange_SEC <= -lookahead_SEC ) {
            // There's never a tertiary, so now that we've found a secondary we're done
            return [ primary_PSEC, primary_PSEC - zoneChange_SEC ];
        }
    }

    // No secondary exists
    return [ primary_PSEC ];
}

export function psecToIso8601( t_PSEC: number, timezone?: string, numDecimalPlaces?: number ): string {
    const t = psecToZonedTime( t_PSEC, timezone ?? 'UTC' );
    return zonedTimeToIso8601( t, numDecimalPlaces );
}

export function zonedTimeToIso8601( t: ZonedDateTime, numDecimalPlaces?: number ): string {
    const { zoneOffset_MINUTES, year, month, day, hour, minute, second } = t;

    const YYYY = year.toFixed( 0 ).padStart( 4, '0' );
    const MM = month.toFixed( 0 ).padStart( 2, '0' );
    const DD = day.toFixed( 0 ).padStart( 2, '0' );
    const hh = hour.toFixed( 0 ).padStart( 2, '0' );
    const mm = minute.toFixed( 0 ).padStart( 2, '0' );

    const wholeSeconds = trunc( second );
    const fracSeconds = second - wholeSeconds;
    const ss = wholeSeconds.toFixed( 0 ).padStart( 2, '0' );
    const ffff = get( ( ) => {
        if ( isDefined( numDecimalPlaces ) ) {
            return '.' + fracSeconds.toFixed( numDecimalPlaces ).replace( /^0\./, '' );
        }
        else if ( fracSeconds === 0 ) {
            return '';
        }
        else {
            return '.' + fracSeconds.toFixed( 16 ).replace( /^0\./, '' ).replace( /0*$/, '' );
        }
    } );

    const ZZZZ = get( ( ) => {
        if ( zoneOffset_MINUTES === 0 ) {
            return 'Z';
        }
        else {
            const sign = ( zoneOffset_MINUTES > 0 ? '+' : '-' );
            const minutes = abs( zoneOffset_MINUTES );
            const hours = floor( minutes / 60 );
            const hh = ( hours ).toFixed( 0 ).padStart( 2, '0' );
            const mm = ( minutes - 60*hours ).toFixed( 0 ).padStart( 2, '0' );
            return `Z${sign}${hh}${mm}`;
        }
    } );

    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${ffff}${ZZZZ}`;
}

export function localTimeToString( t: LocalDateTime, numDecimalPlaces?: number ): string {
    const { year, month, day, hour, minute, second } = t;

    const YYYY = year.toFixed( 0 ).padStart( 4, '0' );
    const MM = month.toFixed( 0 ).padStart( 2, '0' );
    const DD = day.toFixed( 0 ).padStart( 2, '0' );
    const hh = hour.toFixed( 0 ).padStart( 2, '0' );
    const mm = minute.toFixed( 0 ).padStart( 2, '0' );

    const wholeSeconds = trunc( second );
    const fracSeconds = second - wholeSeconds;
    const ss = wholeSeconds.toFixed( 0 ).padStart( 2, '0' );
    const ffff = get( ( ) => {
        if ( isDefined( numDecimalPlaces ) ) {
            return '.' + fracSeconds.toFixed( numDecimalPlaces ).replace( /^0\./, '' );
        }
        else if ( fracSeconds === 0 ) {
            return '';
        }
        else {
            return '.' + fracSeconds.toFixed( 16 ).replace( /^0\./, '' ).replace( /0*$/, '' );
        }
    } );

    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${ffff}`;
}

function createLruCache<K,V>( maxCacheSize: number ): ( key: K, computeValue: Supplier<V> ) => V {
    const cache = new LinkedMap<K,V>( );
    return ( k, computeValue ) => {
        const v = cache.get( k );
        if ( isDefined( v ) ) {
            cache.moveFirst( k );
            return v;
        }
        else {
            const vNew = computeValue( );
            cache.putFirst( k, vNew );
            while ( cache.size > maxCacheSize ) {
                cache.removeLast( );
            }
            return vNew;
        }
    };
}

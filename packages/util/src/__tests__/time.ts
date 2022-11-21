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
import { localTime, localTimeToPsec, psecToIso8601, psecToZonedTime, utcTimeToPsec, zonedTime, zonedTimeToPsec } from '../util';

it( 'utcTimeToPsec', function( ) {
    expect( utcTimeToPsec( 1970,1,1, 0,0,0 ) ).toBe( 0 );
    expect( utcTimeToPsec( 1970,1,1, 0,0,1 ) ).toBe( 1 );
    expect( utcTimeToPsec( 1970,1,1, 0,0,0.0001 ) ).toBe( 1e-4 );
} );

it( 'psecToIso8601', function( ) {
    expect( psecToIso8601( 0 ) ).toBe( '1970-01-01T00:00:00Z' );
    expect( psecToIso8601( 1 ) ).toBe( '1970-01-01T00:00:01Z' );
    expect( psecToIso8601( 1e-4 ) ).toBe( '1970-01-01T00:00:00.0001Z' );

    // Use recent times so we're testing current timezones
    expect( psecToIso8601( utcTimeToPsec( 2022,1,1, 0,0,0 ), 'America/New_York' ) ).toEqual( '2021-12-31T19:00:00Z-0500' );
    expect( psecToIso8601( utcTimeToPsec( 2022,1,1, 0,0,0 ), 'Europe/Berlin' ) ).toEqual( '2022-01-01T01:00:00Z+0100' );
    expect( psecToIso8601( utcTimeToPsec( 2022,1,1, 0,0,0 ), 'Pacific/Chatham' ) ).toEqual( '2022-01-01T13:45:00Z+1345' );
    expect( psecToIso8601( utcTimeToPsec( 2022,7,1, 0,0,0 ), 'Pacific/Chatham' ) ).toEqual( '2022-07-01T12:45:00Z+1245' );
    expect( psecToIso8601( utcTimeToPsec( 2022,1,1, 0,0,0 ), 'Pacific/Kiritimati' ) ).toEqual( '2022-01-01T14:00:00Z+1400' );
} );

it( 'psecToZonedTime', function( ) {
    expect( psecToZonedTime( 0, 'America/New_York' ) ).toEqual( zonedTime( -5*60, 1969,12,31, 19,0,0 ) );
    expect( psecToZonedTime( 0, 'Europe/Berlin' ) ).toEqual( zonedTime( +1*60, 1970,1,1, 1,0,0 ) );
} );

it( 'zonedTimeToPsec', function( ) {
    expect( zonedTimeToPsec( zonedTime( -5*60, 1969,12,31, 19,0,0 ) ) ).toEqual( 0 );
    expect( zonedTimeToPsec( zonedTime( +1*60, 1970,1,1, 1,0,0 ) ) ).toEqual( 0 );
} );

it( 'localTimeToPsec', function( ) {
    expect( localTimeToPsec( localTime( 1970,1,1, 0,0,0 ), 'UTC' ) ).toEqual( [ 0 ] );
    expect( localTimeToPsec( localTime( 1970,1,1, 0,0,1 ), 'UTC' ) ).toEqual( [ 1 ] );
    expect( localTimeToPsec( localTime( 1970,1,1, 0,0,0.0001 ), 'UTC' ) ).toEqual( [ 1e-4 ] );

    // Time changes in timezones with positive and negative offsets
    expect( localTimeToPsec( localTime( 2022,3,13, 2,0,0 ), 'America/New_York' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 2,0,0 ), 'Europe/Berlin' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,11,6, 1,0,0 ), 'America/New_York' ) ).toEqual( [ utcTimeToPsec( 2022,11,6, 5,0,0 ), utcTimeToPsec( 2022,11,6, 6,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 2,0,0 ), 'Europe/Berlin' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 1,0,0 ), utcTimeToPsec( 2022,10,30, 0,0,0 ) ] );

    // Time changes to/from/around zero offset
    expect( localTimeToPsec( localTime( 2022,3,27, 1,0,0 ), 'Europe/Dublin' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 1,0,0 ), 'Europe/London' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 0,0,0 ), 'Atlantic/Azores' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,10,30, 1,0,0 ), 'Europe/Dublin' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 1,0,0 ), utcTimeToPsec( 2022,10,30, 0,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 1,0,0 ), 'Europe/London' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 1,0,0 ), utcTimeToPsec( 2022,10,30, 0,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 0,0,0 ), 'Atlantic/Azores' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 0,0,0 ), utcTimeToPsec( 2022,10,30, 1,0,0 ) ] );

    // Africa/Casablanca has zone-offset +1 most of the year, but +0 during Ramadan
    expect( localTimeToPsec( localTime( 2022,3,27, 2,0,0 ), 'Africa/Casablanca' ) ).toEqual( [ utcTimeToPsec( 2022,3,27, 2,0,0 ), utcTimeToPsec( 2022,3,27, 1,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,5,8, 2,0,0 ), 'Africa/Casablanca' ) ).toEqual( [] );

    // Pacific/Chatham has offsets that are not a whole number of hours
    expect( localTimeToPsec( localTime( 2022,4,3, 2,0,0 ), 'Pacific/Chatham' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 12,15,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,4,3, 3,0,0 ), 'Pacific/Chatham' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 14,15,0 ), utcTimeToPsec( 2022,4,2, 13,15,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,4,3, 4,0,0 ), 'Pacific/Chatham' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 15,15,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,9,25, 2,0,0 ), 'Pacific/Chatham' ) ).toEqual( [ utcTimeToPsec( 2022,9,24, 13,15,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,9,25, 3,0,0 ), 'Pacific/Chatham' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,9,25, 4,0,0 ), 'Pacific/Chatham' ) ).toEqual( [ utcTimeToPsec( 2022,9,24, 14,15,0 ) ] );

    // Antarctica/Troll has a 2-hour time change
    expect( localTimeToPsec( localTime( 2022,3,27, 0,59,59 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,3,27, 0,59,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,3,27, 1,0,0 ), 'Antarctica/Troll' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 2,0,0 ), 'Antarctica/Troll' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 2,59,59 ), 'Antarctica/Troll' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,3,27, 3,0,0 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,3,27, 1,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 0,59,59 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,29, 22,59,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 1,0,0 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 1,0,0 ), utcTimeToPsec( 2022,10,29, 23,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 1,59,59 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 1,59,59 ), utcTimeToPsec( 2022,10,29, 23,59,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 2,0,0 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 2,0,0 ), utcTimeToPsec( 2022,10,30, 0,0,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 2,59,59 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 2,59,59 ), utcTimeToPsec( 2022,10,30, 0,59,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,30, 3,0,0 ), 'Antarctica/Troll' ) ).toEqual( [ utcTimeToPsec( 2022,10,30, 3,0,0 ) ] );

    // Australia/Lord_Howe has a 30-minute time change
    expect( localTimeToPsec( localTime( 2022,4,3, 1,29,59 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 14,29,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,4,3, 1,30,0 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 15,0,0 ), utcTimeToPsec( 2022,4,2, 14,30,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,4,3, 1,59,59 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 15,29,59 ), utcTimeToPsec( 2022,4,2, 14,59,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,4,3, 2,0,0 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,4,2, 15,30,0 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,2, 1,59,59 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,10,1, 15,29,59 ) ] );
    expect( localTimeToPsec( localTime( 2022,10,2, 2,0,0 ), 'Australia/Lord_Howe' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,10,2, 2,29,0 ), 'Australia/Lord_Howe' ) ).toEqual( [] );
    expect( localTimeToPsec( localTime( 2022,10,2, 2,30,0 ), 'Australia/Lord_Howe' ) ).toEqual( [ utcTimeToPsec( 2022,10,1, 15,30,0 ) ] );
} );

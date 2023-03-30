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
import { createCommonBoundsAxis1D } from '@metsci/gleam-core';
import { Interval1D, psecToIso8601, utcTimeToPsec } from '@metsci/gleam-util';
import { TimeTicker } from '../ticker';

it( 'TimeTicker', function( ) {
    const ticker = new TimeTicker( );
    const getTickLabels = ( timezone: string, approxNumTicks: number, minTime_PSEC: number, maxTime_PSEC: number ) => {
        ticker.timezone.override = timezone;
        ticker.spacingApprox_LPX.override = 100;
        const axis_PSEC = createCommonBoundsAxis1D( Interval1D.fromEdges( minTime_PSEC, maxTime_PSEC ) );
        axis_PSEC.viewport_PX = Interval1D.fromRect( 0, approxNumTicks*ticker.spacingApprox_LPX.get( ) );
        const tickSet = ticker.getTicks( axis_PSEC );
        return tickSet.majorTicks.map( t_PSEC => psecToIso8601( t_PSEC, timezone ) );
    };

    expect( getTickLabels( 'UTC', 4, utcTimeToPsec( 2022,1,1, 0,0,0 ), utcTimeToPsec( 2022,1,1, 23,59,59 ) ) )
      .toEqual( [ '2022-01-01T00:00:00Z', '2022-01-01T06:00:00Z', '2022-01-01T12:00:00Z', '2022-01-01T18:00:00Z' ] );

    expect( getTickLabels( 'America/New_York', 4, utcTimeToPsec( 2022,3,13, 5,0,0 ), utcTimeToPsec( 2022,3,13, 8,0,0 ) ) )
      .toEqual( [ '2022-03-13T00:00:00Z-0500', '2022-03-13T01:00:00Z-0500', '2022-03-13T03:00:00Z-0400', '2022-03-13T04:00:00Z-0400' ] );

    expect( getTickLabels( 'America/New_York', 4, utcTimeToPsec( 2022,3,13, 4,0,0 ), utcTimeToPsec( 2022,3,13, 12,0,0 ) ) )
      .toEqual( [ '2022-03-13T00:00:00Z-0500', '2022-03-13T04:00:00Z-0400', '2022-03-13T06:00:00Z-0400', '2022-03-13T08:00:00Z-0400' ] );

    expect( getTickLabels( 'America/New_York', 4, utcTimeToPsec( 2022,11,6, 4,0,0 ), utcTimeToPsec( 2022,11,6, 12,0,0 ) ) )
      .toEqual( [ '2022-11-06T00:00:00Z-0400', '2022-11-06T02:00:00Z-0500', '2022-11-06T04:00:00Z-0500', '2022-11-06T06:00:00Z-0500' ] );

    expect( getTickLabels( 'Australia/Lord_Howe', 4, utcTimeToPsec( 2022,4,2, 13,0,0 ), utcTimeToPsec( 2022,4,2, 16,59,59 ) ) )
      .toEqual( [ '2022-04-03T00:00:00Z+1100', '2022-04-03T01:00:00Z+1100', '2022-04-03T02:00:00Z+1030', '2022-04-03T03:00:00Z+1030' ] );

    expect( getTickLabels( 'Australia/Lord_Howe', 4, utcTimeToPsec( 2022,10,1, 13,0,0 ), utcTimeToPsec( 2022,10,1, 17,0,0 ) ) )
      .toEqual( [ '2022-10-02T00:00:00Z+1030', '2022-10-02T01:00:00Z+1030', '2022-10-02T03:00:00Z+1100', '2022-10-02T04:00:00Z+1100' ] );
} );

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
import { Interval1D, SECONDS_PER_YEAR_APPROX, utcTimeToPsec } from '@metsci/gleam-util';
import { EventImpl, EventsGroup, EventsLane, ReadableEvent, ReadableEventsLane } from '../contraptions/eventsRow';
import { StringSet } from '../contraptions/eventsRow/painter/glyphsProgram';
import { splitToMilliPrecision, splitToNanoPrecision } from '../contraptions/eventsRow/painter/misc';

it( 'milliSplit.typical',  ( ) => expectMilliSplitMatch( utcTimeToPsec( 2021,1,1, 0,0,0 ) ) );
it( 'milliSplit.zero',     ( ) => expectMilliSplitMatch( 0 ) );
it( 'milliSplit.extremes', ( ) => expectMilliSplitMatch( 1e3*SECONDS_PER_YEAR_APPROX + 1e-3 ) );
function expectMilliSplitMatch( x: number ): void {
    const fs = new Float32Array( 2 );
    const { a, b } = splitToMilliPrecision( x );
    fs[0] = a;
    fs[1] = b;
    expect( fs[0] + fs[1] ).toBeCloseTo( x, 3 );
}

it( 'nanoSplit.typical',  ( ) => expectNanoSplitMatch( utcTimeToPsec( 2021,1,1, 0,0,0 ) ) );
it( 'nanoSplit.zero',     ( ) => expectNanoSplitMatch( 0 ) );
it( 'nanoSplit.extremes', ( ) => expectNanoSplitMatch( 17e3*SECONDS_PER_YEAR_APPROX + 1e-9 ) );
function expectNanoSplitMatch( x: number ): void {
    const fs = new Float32Array( 3 );
    const { a, b, c } = splitToNanoPrecision( x );
    fs[0] = a;
    fs[1] = b;
    fs[2] = c;
    expect( fs[0] + fs[1] + fs[2] ).toBeCloseTo( x, 9 );
}

it( 'StringSet.basics', ( ) => {
    const NULL = StringSet.NULL_FLOAT;
    const strings = new StringSet( {
        floatsPerBlock: 6,
        floatsPerRank: 6,
    } );

    const startA = strings.add( [ 0,1,2,3,4 ] );
    expect( [ ...strings.floats ] ).toEqual( [ 0,1,2,3,4,NULL ] );

    const startB = strings.add( [ 5,6,7,8,9 ] );
    expect( [ ...strings.floats ] ).toEqual( [ 0,1,2,3,4,NULL, 5,6,7,8,9,NULL ] );

    strings.remove( startA );
    expect( [ ...strings.floats ] ).toEqual( [ NULL,NULL,NULL,NULL,NULL,NULL, 5,6,7,8,9,NULL ] );

    strings.add( [ 0,1,2,3,4 ] );
    strings.remove( startB );
    expect( [ ...strings.floats ] ).toEqual( [ 0,1,2,3,4,NULL, NULL,NULL,NULL,NULL,NULL,NULL ] );
} );

it( 'StringSet.longString', ( ) => {
    const NULL = StringSet.NULL_FLOAT;
    const strings = new StringSet( {
        floatsPerBlock: 6,
        floatsPerRank: 6,
    } );

    const startA = strings.add( [ 1,1,1,1,1, 1,1,1,1,1 ] );
    expect( [ ...strings.floats ] ).toEqual( [ 1,1,1,1,1,6, 1,1,1,1,1,NULL ] );

    strings.remove( startA );
    expect( [ ...strings.floats ] ).toEqual( [ NULL,NULL,NULL,NULL,NULL,NULL, NULL,NULL,NULL,NULL,NULL,NULL ] );
} );

it( 'StringSet.splitString', ( ) => {
    const NULL = StringSet.NULL_FLOAT;
    const strings = new StringSet( {
        floatsPerBlock: 6,
        floatsPerRank: 6,
    } );

    function retrieveString( firstFloatIndex: number ): Array<number> {
        let i = firstFloatIndex;
        const codes = new Array<number>( );
        while ( true ) {
            if ( i === NULL ) {
                break;
            }
            if ( ( i+1 ) % strings.floatsPerBlock === 0 ) {
                i = strings.floats[ i ];
            }
            if ( i === NULL ) {
                break;
            }
            codes.push( strings.floats[ i ] );
            i++;
        }
        return codes;
    }

    const startA = strings.add( [ 1,1,1,1,1 ] );
    expect( retrieveString( startA ) ).toEqual( [ 1,1,1,1,1 ] );

    const startB = strings.add( [ 2,2,2,2,2 ] );
    expect( retrieveString( startB ) ).toEqual( [ 2,2,2,2,2 ] );
    expect( retrieveString( startA ) ).toEqual( [ 1,1,1,1,1 ] );

    strings.remove( startA );
    expect( retrieveString( startB ) ).toEqual( [ 2,2,2,2,2 ] );

    const startC = strings.add( [ 3,3,3,3,3, 3,3,3,3,3 ] );
    expect( retrieveString( startC ) ).toEqual( [ 3,3,3,3,3, 3,3,3,3,3 ] );
    expect( retrieveString( startB ) ).toEqual( [ 2,2,2,2,2 ] );

    const startD = strings.add( [ 4,4,4,4,4 ] );
    expect( retrieveString( startD ) ).toEqual( [ 4,4,4,4,4 ] );
    expect( retrieveString( startC ) ).toEqual( [ 3,3,3,3,3, 3,3,3,3,3 ] );
    expect( retrieveString( startB ) ).toEqual( [ 2,2,2,2,2 ] );
    expect( strings.floats.length ).toEqual( 24 );
} );

it( 'EventsGroup.basics', ( ) => {
    const events = new EventsGroup<ReadableEvent>( );

    events.addEvent( new EventImpl( 'A', Interval1D.fromEdges( 0, 10 ) ) );
    events.addEvent( new EventImpl( 'B', Interval1D.fromEdges( 0, 10 ) ) );
    expect( events.getLanes( ).length ).toEqual( 2 );

    events.clearEvents( );
    expect( events.getLanes( ).length ).toEqual( 0 );

    events.addEvent( new EventImpl( 'C', Interval1D.fromEdges( 20, 50 ) ) );
    events.addEvent( new EventImpl( 'D', Interval1D.fromEdges( 10, 30 ) ) );
    expect( events.getLanes( ).length ).toEqual( 2 );

    events.clearEvents( );
    events.addEvent( new EventImpl( 'E', Interval1D.fromEdges( 0, 10 ) ) );
    events.addEvent( new EventImpl( 'F', Interval1D.fromEdges( 20, 30 ) ) );
    events.addEvent( new EventImpl( 'G', Interval1D.fromEdges( 10, 20 ) ) );
    expect( events.getLanes( ).length ).toEqual( 1 );

    const eventH = events.addEvent( new EventImpl( 'H', Interval1D.fromEdges( 9, 11 ) ) );
    const eventI = events.addEvent( new EventImpl( 'I', Interval1D.fromEdges( 19, 21 ) ) );
    expect( events.getLanes( ).length ).toEqual( 2 );

    const eventJ = events.addEvent( new EventImpl( 'J', Interval1D.fromEdges( 10, 12 ) ) );
    expect( events.getLanes( ).length ).toEqual( 3 );

    events.removeEvent( eventH );
    events.removeEvent( eventI );
    expect( events.getLanes( ).length ).toEqual( 2 );

    eventJ.setEra_PSEC( false, Interval1D.fromEdges( 50, 60 ) );
    expect( events.getLanes( ).length ).toEqual( 1 );

    events.addEvent( new EventImpl( 'K', Interval1D.fromEdges( 10, 10 ) ) );
    events.addEvent( new EventImpl( 'L', Interval1D.fromEdges( 20, 20 ) ) );
    expect( events.getLanes( ).length ).toEqual( 1 );
} );

it( 'EventsGroup.rightNeighbor', ( ) => {
    const events = new EventsGroup<ReadableEvent>( );

    const a = events.addEvent( new EventImpl( 'A', Interval1D.fromEdges( 0, 1 ) ) );
    const b = events.addEvent( new EventImpl( 'B', Interval1D.fromEdges( 2, 3 ) ) );

    const c = events.addEvent( new EventImpl( 'C', Interval1D.fromEdges( 3, 3 ) ) );
    const d = events.addEvent( new EventImpl( 'D', Interval1D.fromEdges( 3, 3 ) ) );
    const e = events.addEvent( new EventImpl( 'E', Interval1D.fromEdges( 3, 3 ) ) );

    const f = events.addEvent( new EventImpl( 'F', Interval1D.fromEdges( 3, 4 ) ) );
    const g = events.addEvent( new EventImpl( 'G', Interval1D.fromEdges( 5, 6 ) ) );

    expect( events.getLeftNeighbor( a ) ).toBe( undefined );
    expect( events.getLeftNeighbor( b ) ).toBe( a );
    expect( events.getLeftNeighbor( c ) ).toBe( b );
    expect( events.getLeftNeighbor( d ) ).toBe( c );
    expect( events.getLeftNeighbor( e ) ).toBe( d );
    expect( events.getLeftNeighbor( f ) ).toBe( e );
    expect( events.getLeftNeighbor( g ) ).toBe( f );

    expect( events.getRightNeighbor( a ) ).toBe( b );
    expect( events.getRightNeighbor( b ) ).toBe( c );
    expect( events.getRightNeighbor( c ) ).toBe( d );
    expect( events.getRightNeighbor( d ) ).toBe( e );
    expect( events.getRightNeighbor( e ) ).toBe( f );
    expect( events.getRightNeighbor( f ) ).toBe( g );
    expect( events.getRightNeighbor( g ) ).toBe( undefined );
} );

it( 'EventsLane.basics', ( ) => {
    const lane = new EventsLane<string>( );

    lane.addEvent( 'a', Interval1D.fromEdges( 0, 10 ) );
    expect( [ ...lane.getEvents( ).keys( ) ] ).toEqual( [ Interval1D.fromEdges( 0, 10 ) ] );

    expect( lane.getEventContaining( -999 ) ).toEqual( undefined );
    expect( lane.getEventContaining( 0 ) ).toEqual( 'a' );
    expect( lane.getEventContaining( 5 ) ).toEqual( 'a' );
    expect( lane.getEventContaining( 10 ) ).toEqual( undefined );
    expect( lane.getEventContaining( 999 ) ).toEqual( undefined );

    expect( values( lane.getEntryStartingBefore( -999 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingBefore( 0 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingBefore( 5 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingBefore( 10 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingBefore( 999 ) ) ).toEqual( [ 'a' ] );

    expect( values( lane.getEntryStartingAtOrBefore( -999 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAtOrBefore( 0 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAtOrBefore( 5 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAtOrBefore( 10 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAtOrBefore( 999 ) ) ).toEqual( [ 'a' ] );

    expect( values( lane.getEntryStartingAfter( -999 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAfter( 0 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAfter( 5 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAfter( 10 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAfter( 999 ) ) ).toEqual( undefined );

    expect( values( lane.getEntryStartingAtOrAfter( -999 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAtOrAfter( 0 ) ) ).toEqual( [ 'a' ] );
    expect( values( lane.getEntryStartingAtOrAfter( 5 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAtOrAfter( 10 ) ) ).toEqual( undefined );
    expect( values( lane.getEntryStartingAtOrAfter( 999 ) ) ).toEqual( undefined );
} );

it( 'EventsLane.zeroDuration', ( ) => {
    const lane = new EventsLane<string>( );

    lane.addEvent( 'a', Interval1D.fromEdges( 0, 1 ) );
    lane.addEvent( 'b', Interval1D.fromEdges( 2, 3 ) );

    lane.addEvent( 'c', Interval1D.fromEdges( 3, 3 ) );
    lane.addEvent( 'd', Interval1D.fromEdges( 3, 3 ) );
    lane.addEvent( 'e', Interval1D.fromEdges( 3, 3 ) );

    lane.addEvent( 'f', Interval1D.fromEdges( 3, 4 ) );
    lane.addEvent( 'g', Interval1D.fromEdges( 5, 6 ) );

    const event = 'd';
    const era_PSEC = Interval1D.fromEdges( 3, 3 );
    const eventAfter = lane.getEventsAt( era_PSEC )?.valueAfter( event ) ?? lane.getEventsAfter( era_PSEC )?.valueAfter( undefined );
    expect( eventAfter ).toEqual( 'e' );
} );

function array<T>( iterable: Iterable<T> | undefined ): Array<T> | undefined {
    return ( iterable === undefined ? undefined : [ ...iterable ] );
}

function values<V>( en: [unknown,Iterable<V>] | undefined ): Array<V> | undefined {
    return array( en?.[1] );
}

function printEventsGroup( events: EventsGroup<ReadableEvent> ): void {
    const lines = new Array<string>( );
    for ( const lane of events.getLanes( ) ) {
        printEventsLane( lane );
    }
    console.log( lines.join( '\n' ) );
}

function printEventsLane( lane: ReadableEventsLane<unknown> ): void {
    const lines = new Array<string>( );
    lines.push( 'Lane (' + lane.size + ')' );
    for ( const [ era_PSEC, events ] of lane.getEvents( ) ) {
        lines.push( '    Events (' + events.size + ') on [ ' + era_PSEC.min + ', ' + era_PSEC.max + ' )' );
    }
    console.log( lines.join( '\n' ) );
}

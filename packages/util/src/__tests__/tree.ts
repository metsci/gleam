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
import { AaTreeMap, AaTreeSet } from '../util';

it( 'AaTreeSet.selfRebalancing', function( ) {
    const items = new AaTreeSet<number>( ( a, b ) => a - b );
    for ( const n of [ 0, 1, 10, 100, 1000, 10000 ] ) {
        for ( let i = 0; i < n; i++ ) {
            items.add( i );
        }
        for ( let i = 0; i < n; i++ ) {
            expect( items.has( i ) ).toEqual( true );
        }
        expect( items.computeDepth( ) ).toBeLessThanOrEqual( 2 * Math.log2( n + 1 ) );
        items.clear( );
    }
} );

it( 'AaTreeSet.basics', function( ) {
    const items = new AaTreeSet<number>( ( a, b ) => a - b );
    items.add( 1 );
    items.add( 0 );
    items.add( 3 );
    items.add( 2 );

    expect( [ ...items ] ).toEqual( [ 0, 1, 2, 3 ] );

    expect( items.valueBefore( 1 ) ).toEqual( 0 );
    expect( items.valueBefore( 2.5 ) ).toEqual( 2 );
    expect( items.valueBefore( 999 ) ).toEqual( 3 );
    expect( items.valueBefore( -999 ) ).toEqual( undefined );

    expect( items.valueAtOrBefore( 1 ) ).toEqual( 1 );
    expect( items.valueAtOrBefore( 2.5 ) ).toEqual( 2 );
    expect( items.valueAtOrBefore( 999 ) ).toEqual( 3 );
    expect( items.valueAtOrBefore( -999 ) ).toEqual( undefined );

    expect( items.valueAfter( 1 ) ).toEqual( 2 );
    expect( items.valueAfter( 1.5 ) ).toEqual( 2 );
    expect( items.valueAfter( 999 ) ).toEqual( undefined );
    expect( items.valueAfter( -999 ) ).toEqual( 0 );

    expect( items.valueAtOrAfter( 1 ) ).toEqual( 1 );
    expect( items.valueAtOrAfter( 1.5 ) ).toEqual( 2 );
    expect( items.valueAtOrAfter( 999 ) ).toEqual( undefined );
    expect( items.valueAtOrAfter( -999 ) ).toEqual( 0 );
} );

it( 'AaTreeMap.selfRebalancing', function( ) {
    const items = new AaTreeMap<number,string>( ( a, b ) => a - b );
    for ( const n of [ 0, 1, 10, 100, 1000, 10000 ] ) {
        for ( let i = 0; i < n; i++ ) {
            items.set( i, 'a' );
        }
        for ( let i = 0; i < n; i++ ) {
            expect( items.get( i ) ).toEqual( 'a' );
        }
        expect( items.computeDepth( ) ).toBeLessThanOrEqual( 2 * Math.log2( n + 1 ) );
        items.clear( );
    }
} );

it( 'AaTreeMap.basics', function( ) {
    const items = new AaTreeMap<number,string>( ( a, b ) => a - b );
    items.set( 1, 'b' );
    items.set( 0, 'a' );
    items.set( 3, 'd' );
    items.set( 2, 'c' );

    expect( [ ...items ] ).toEqual( [ [ 0, 'a' ], [ 1, 'b' ], [ 2, 'c' ], [ 3, 'd' ] ] );

    expect( items.entryBefore( 1 ) ).toEqual( [ 0, 'a' ] );
    expect( items.entryBefore( 2.5 ) ).toEqual( [ 2, 'c' ] );
    expect( items.entryBefore( 999 ) ).toEqual( [ 3, 'd' ] );
    expect( items.entryBefore( -999 ) ).toEqual( undefined );

    expect( items.entryAtOrBefore( 1 ) ).toEqual( [ 1, 'b' ] );
    expect( items.entryAtOrBefore( 2.5 ) ).toEqual( [ 2, 'c' ] );
    expect( items.entryAtOrBefore( 999 ) ).toEqual( [ 3, 'd' ] );
    expect( items.entryAtOrBefore( -999 ) ).toEqual( undefined );

    expect( items.entryAfter( 1 ) ).toEqual( [ 2, 'c' ] );
    expect( items.entryAfter( 1.5 ) ).toEqual( [ 2, 'c' ] );
    expect( items.entryAfter( 999 ) ).toEqual( undefined );
    expect( items.entryAfter( -999 ) ).toEqual( [ 0, 'a' ] );

    expect( items.entryAtOrAfter( 1 ) ).toEqual( [ 1, 'b' ] );
    expect( items.entryAtOrAfter( 1.5 ) ).toEqual( [ 2, 'c' ] );
    expect( items.entryAtOrAfter( 999 ) ).toEqual( undefined );
    expect( items.entryAtOrAfter( -999 ) ).toEqual( [ 0, 'a' ] );
} );

it( 'AaTreeMap.intervalKeys', function( ) {
    const items = new AaTreeMap<[number,number],string>( ( a, b ) => {
        const comparison0 = a[0] - b[0];
        if ( comparison0 !== 0 ) {
            return comparison0;
        }
        const comparison1 = a[1] - b[1];
        if ( comparison1 !== 0 ) {
            return comparison1;
        }
        return 0;
    } );
    items.set( [1,2], 'b2' );
    items.set( [1,1], 'b1' );
    items.set( [0,1], 'a' );
    items.set( [3,4], 'd' );
    items.set( [2,3], 'c' );

    expect( [ ...items ] ).toEqual( [ [ [0,1], 'a' ], [ [1,1], 'b1' ], [ [1,2], 'b2' ], [ [2,3], 'c' ], [ [3,4], 'd' ] ] );

    // Find the first entry that starts at 1
    expect( items.entryAtOrAfter( [1,Number.NEGATIVE_INFINITY] ) ).toEqual( [ [1,1], 'b1' ] );

    // Find the last entry that starts at 1
    expect( items.entryAtOrBefore( [1,Number.POSITIVE_INFINITY] ) ).toEqual( [ [1,2], 'b2' ] );
} );

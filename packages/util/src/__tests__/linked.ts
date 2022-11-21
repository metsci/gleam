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
import { LinkedList, LinkedMap, LinkedSet } from '../util';

it( 'LinkedList.addFirst', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    list.addFirst( 'X' );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );
} );

it( 'LinkedList.addLast', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    list.addLast( 'X' );
    expect( [ ...list ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );
} );

it( 'LinkedList.addBefore', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b' ] );
    const c = list.addLast( 'c' );
    list.addBefore( 'X', c );
    expect( [ ...list ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );
} );

it( 'LinkedList.addAfter', function( ) {
    const list = new LinkedList<string>( [ 'b', 'c' ] );
    const a = list.addFirst( 'a' );
    list.addAfter( 'X', a );
    expect( [ ...list ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );
} );

it( 'LinkedList.moveFirst', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );

    const X = list.addLast( 'X' );
    expect( [ ...list ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    list.moveFirst( X );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    list.moveFirst( X );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );
} );

it( 'LinkedList.moveLast', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );

    const X = list.addFirst( 'X' );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    list.moveLast( X );
    expect( [ ...list ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    list.moveLast( X );
    expect( [ ...list ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );
} );

it( 'LinkedList.moveBefore', function( ) {
    const list = new LinkedList<string>( );
    const a = list.addLast( 'a' );
    const b = list.addLast( 'b' );
    const c = list.addLast( 'c' );

    const X = list.addLast( 'X' );
    list.moveBefore( X, b );
    expect( [ ...list ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );

    list.moveBefore( X, a );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    list.moveBefore( X, a );
    expect( [ ...list ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );
} );

it( 'LinkedList.remove', function( ) {
    const list = new LinkedList<string>( );
    const a = list.addLast( 'a' );
    const b = list.addLast( 'b' );
    const c = list.addLast( 'c' );
    const removed = list.remove( b );
    expect( [ ...list ] ).toEqual( [ 'a', 'c' ] );
    expect( removed?.item ).toBe( 'b' );
} );

it( 'LinkedList.removeFirst', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    const removed = list.removeFirst( );
    expect( [ ...list ] ).toEqual( [ 'b', 'c' ] );
    expect( removed?.item ).toBe( 'a' );
} );

it( 'LinkedList.removeLast', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    const removed = list.removeLast( );
    expect( [ ...list ] ).toEqual( [ 'a', 'b' ] );
    expect( removed?.item ).toBe( 'c' );
} );

it( 'LinkedList.removeBefore', function( ) {
    const list = new LinkedList<string>( );
    const a = list.addLast( 'a' );
    const b = list.addLast( 'b' );
    const c = list.addLast( 'c' );
    const removed = list.removeBefore( b );
    expect( [ ...list ] ).toEqual( [ 'b', 'c' ] );
    expect( removed?.item ).toBe( 'a' );
} );

it( 'LinkedList.removeAfter', function( ) {
    const list = new LinkedList<string>( );
    const a = list.addLast( 'a' );
    const b = list.addLast( 'b' );
    const c = list.addLast( 'c' );
    const removed = list.removeAfter( b );
    expect( [ ...list ] ).toEqual( [ 'a', 'b' ] );
    expect( removed?.item ).toBe( 'c' );
} );

it( 'LinkedList.removeAll', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    list.removeAll( );
    expect( [ ...list ] ).toEqual( [] );
} );

it( 'LinkedList.itemsInReverse', function( ) {
    const list = new LinkedList<string>( [ 'a', 'b', 'c' ] );
    expect( [ ...list.itemsInReverse( ) ] ).toEqual( [ 'c', 'b', 'a' ] );
} );

it( 'LinkedSet.addFirst', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.addFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addFirst( 'X', true );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addLast( 'X', true );
    set.addFirst( 'X', false );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addFirst( 'X', true );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );
} );

it( 'LinkedSet.addLast', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.addLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addLast( 'X', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addFirst( 'X', true );
    set.addLast( 'X', false );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addLast( 'X', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );
} );

it( 'LinkedSet.addBefore', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.addBefore( 'X', 'a' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addBefore( 'X', 'b', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );

    set.addBefore( 'X', 'c', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );

    set.addBefore( 'X', 'a', false );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );
} );

it( 'LinkedSet.addAfter', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addAfter( 'X', 'b', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );

    set.addAfter( 'X', 'a', true );
    expect( [ ...set ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );

    set.addAfter( 'X', 'c', false );
    expect( [ ...set ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );
} );

it( 'LinkedSet.moveFirst', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.moveFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'a' );
    set.moveFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'b', true );
    set.moveFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'c', true );
    set.moveFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.moveFirst( 'X' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );
} );

it( 'LinkedSet.moveLast', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.moveLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addBefore( 'X', 'a' );
    set.moveLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addBefore( 'X', 'b', true );
    set.moveLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.addBefore( 'X', 'c', true );
    set.moveLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.moveLast( 'X' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );
} );

it( 'LinkedSet.moveBefore', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.moveBefore( 'X', 'a' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addLast( 'X' );
    set.moveBefore( 'X', 'a' );
    expect( [ ...set ] ).toEqual( [ 'X', 'a', 'b', 'c' ] );

    set.moveBefore( 'X', 'b' );
    expect( [ ...set ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );

    set.moveBefore( 'X', 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );

    set.moveBefore( 'X', 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );
} );

it( 'LinkedSet.moveAfter', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    set.moveAfter( 'X', 'a' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addFirst( 'X' );
    set.moveAfter( 'X', 'a' );
    expect( [ ...set ] ).toEqual( [ 'a', 'X', 'b', 'c' ] );

    set.moveAfter( 'X', 'b' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'X', 'c' ] );

    set.moveAfter( 'X', 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );

    set.moveAfter( 'X', 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c', 'X' ] );
} );

it( 'LinkedSet.delete', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    const result1 = set.delete( 'X' );
    expect( result1 ).toBe( false );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addFirst( 'X' );
    const result2 = set.delete( 'X' );
    expect( result2 ).toBe( true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'a' );
    const result3 = set.delete( 'X' );
    expect( result3 ).toBe( true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'b' );
    const result4 = set.delete( 'X' );
    expect( result4 ).toBe( true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    set.addAfter( 'X', 'c' );
    const result5 = set.delete( 'X' );
    expect( result5 ).toBe( true );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );
} );

it( 'LinkedSet.removeFirst', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    const result1 = set.removeFirst( );
    expect( result1 ).toBe( 'a' );
    expect( [ ...set ] ).toEqual( [ 'b', 'c' ] );

    const result2 = set.removeFirst( );
    expect( result2 ).toBe( 'b' );
    expect( [ ...set ] ).toEqual( [ 'c' ] );

    const result3 = set.removeFirst( );
    expect( result3 ).toBe( 'c' );
    expect( [ ...set ] ).toEqual( [] );

    const result4 = set.removeFirst( );
    expect( result4 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [] );
} );

it( 'LinkedSet.removeLast', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    const result1 = set.removeLast( );
    expect( result1 ).toBe( 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b' ] );

    const result2 = set.removeLast( );
    expect( result2 ).toBe( 'b' );
    expect( [ ...set ] ).toEqual( [ 'a' ] );

    const result3 = set.removeLast( );
    expect( result3 ).toBe( 'a' );
    expect( [ ...set ] ).toEqual( [] );

    const result4 = set.removeLast( );
    expect( result4 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [] );
} );

it( 'LinkedSet.removeBefore', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    const result1 = set.removeBefore( 'X' );
    expect( result1 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    const result2 = set.removeBefore( 'a' );
    expect( result2 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    const result3 = set.removeBefore( 'c' );
    expect( result3 ).toBe( 'b' );
    expect( [ ...set ] ).toEqual( [ 'a', 'c' ] );

    const result4 = set.removeBefore( 'c' );
    expect( result4 ).toBe( 'a' );
    expect( [ ...set ] ).toEqual( [ 'c' ] );
} );

it( 'LinkedSet.removeAfter', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );

    const result1 = set.removeAfter( 'X' );
    expect( result1 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    const result2 = set.removeAfter( 'c' );
    expect( result2 ).toBe( undefined );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );

    const result3 = set.removeAfter( 'a' );
    expect( result3 ).toBe( 'b' );
    expect( [ ...set ] ).toEqual( [ 'a', 'c' ] );

    const result4 = set.removeAfter( 'a' );
    expect( result4 ).toBe( 'c' );
    expect( [ ...set ] ).toEqual( [ 'a' ] );
} );

it( 'LinkedSet as Set', function( ) {
    const set = new LinkedSet<string>( );
    set.add( 'a' );
    set.add( 'b' );
    set.add( 'c' );
    expect( [ ...set ] ).toEqual( [ 'a', 'b', 'c' ] );
    expect( [ ...set.entries( ) ] ).toEqual( [ ['a','a'], ['b','b'], ['c','c'] ] );
    expect( [ ...set.keys( ) ] ).toEqual( [ 'a', 'b', 'c' ] );
    expect( [ ...set.values( ) ] ).toEqual( [ 'a', 'b', 'c' ] );
    expect( set.size ).toBe( 3 );
    expect( set.has( 'a' ) ).toBe( true );
    expect( set.has( 'X' ) ).toBe( false );
} );

it( 'LinkedSet.valuesInReverse', function( ) {
    const set = new LinkedSet<string>( [ 'a', 'b', 'c' ] );
    expect( [ ...set.valuesInReverse( ) ] ).toEqual( [ 'c', 'b', 'a' ] );
} );

it( 'LinkedMap.putFirst', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.putFirst( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putFirst( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putLast( 'X', 4 );
    map.putFirst( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putLast( 'X', 4 );
    map.putFirst( 'X', 5 );
    expect( [ ...map ] ).toEqual( [ ['X',5], ['a',1], ['b',2], ['c',3] ] );
} );

it( 'LinkedMap.putLast', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.putLast( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putLast( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putFirst( 'X', 4 );
    map.putLast( 'X', 4 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putFirst( 'X', 4 );
    map.putLast( 'X', 5 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',5] ] );
} );

it( 'LinkedMap.putBefore', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.putBefore( 'X', 4, 'a' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putBefore( 'X', 4, 'b', true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['X',4], ['b',2], ['c',3] ] );

    map.putBefore( 'X', 5, 'c', true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',5], ['c',3] ] );

    map.putBefore( 'X', 6, 'a', false );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',6], ['c',3] ] );
} );

it( 'LinkedMap.putAfter', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'c' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putAfter( 'X', 4, 'b', true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',4], ['c',3] ] );

    map.putAfter( 'X', 5, 'a', true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['X',5], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 6, 'c', false );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['X',6], ['b',2], ['c',3] ] );
} );

it( 'LinkedMap.moveFirst', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.moveFirst( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'a', true );
    map.moveFirst( 'X' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'b', true );
    map.moveFirst( 'X' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'c', true );
    map.moveFirst( 'X' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.moveFirst( 'X' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );
} );

it( 'LinkedMap.moveLast', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.moveLast( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putBefore( 'X', 4, 'a', true );
    map.moveLast( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putBefore( 'X', 4, 'b', true );
    map.moveLast( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.putBefore( 'X', 4, 'c', true );
    map.moveLast( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.moveLast( 'X' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );
} );

it( 'LinkedMap.moveBefore', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.moveBefore( 'X', 'a' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putLast( 'X', 4 );
    map.moveBefore( 'X', 'a' );
    expect( [ ...map ] ).toEqual( [ ['X',4], ['a',1], ['b',2], ['c',3] ] );

    map.moveBefore( 'X', 'b' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['X',4], ['b',2], ['c',3] ] );

    map.moveBefore( 'X', 'c' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',4], ['c',3] ] );

    map.moveBefore( 'X', 'c' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',4], ['c',3] ] );
} );

it( 'LinkedMap.moveAfter', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    map.moveAfter( 'X', 'a' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putFirst( 'X', 4 );
    map.moveAfter( 'X', 'a' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['X',4], ['b',2], ['c',3] ] );

    map.moveAfter( 'X', 'b' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['X',4], ['c',3] ] );

    map.moveAfter( 'X', 'c' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );

    map.moveAfter( 'X', 'c' );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3], ['X',4] ] );
} );

it( 'LinkedMap.delete', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    const result1 = map.delete( 'X' );
    expect( result1 ).toBe( false );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putFirst( 'X', 4 );
    const result2 = map.delete( 'X' );
    expect( result2 ).toBe( true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'a' );
    const result3 = map.delete( 'X' );
    expect( result3 ).toBe( true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'b' );
    const result4 = map.delete( 'X' );
    expect( result4 ).toBe( true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    map.putAfter( 'X', 4, 'c' );
    const result5 = map.delete( 'X' );
    expect( result5 ).toBe( true );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );
} );

it( 'LinkedMap.removeFirst', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    const result1 = map.removeFirst( );
    expect( result1 ).toBe( 1 );
    expect( [ ...map ] ).toEqual( [ ['b',2], ['c',3] ] );

    const result2 = map.removeFirst( );
    expect( result2 ).toBe( 2 );
    expect( [ ...map ] ).toEqual( [ ['c',3] ] );

    const result3 = map.removeFirst( );
    expect( result3 ).toBe( 3 );
    expect( [ ...map ] ).toEqual( [] );

    const result4 = map.removeFirst( );
    expect( result4 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [] );
} );

it( 'LinkedMap.removeLast', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    const result1 = map.removeLast( );
    expect( result1 ).toBe( 3 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2] ] );

    const result2 = map.removeLast( );
    expect( result2 ).toBe( 2 );
    expect( [ ...map ] ).toEqual( [ ['a',1] ] );

    const result3 = map.removeLast( );
    expect( result3 ).toBe( 1 );
    expect( [ ...map ] ).toEqual( [] );

    const result4 = map.removeLast( );
    expect( result4 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [] );
} );

it( 'LinkedMap.removeBefore', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    const result1 = map.removeBefore( 'X' );
    expect( result1 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    const result2 = map.removeBefore( 'a' );
    expect( result2 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    const result3 = map.removeBefore( 'c' );
    expect( result3 ).toBe( 2 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['c',3] ] );

    const result4 = map.removeBefore( 'c' );
    expect( result4 ).toBe( 1 );
    expect( [ ...map ] ).toEqual( [ ['c',3] ] );
} );

it( 'LinkedMap.removeAfter', function( ) {
    const map = new LinkedMap<string,number>( [ ['a',1], ['b',2], ['c',3] ] );

    const result1 = map.removeAfter( 'X' );
    expect( result1 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    const result2 = map.removeAfter( 'c' );
    expect( result2 ).toBe( undefined );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );

    const result3 = map.removeAfter( 'a' );
    expect( result3 ).toBe( 2 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['c',3] ] );

    const result4 = map.removeAfter( 'a' );
    expect( result4 ).toBe( 3 );
    expect( [ ...map ] ).toEqual( [ ['a',1] ] );
} );

it( 'LinkedMap as Map', function( ) {
    const map = new LinkedMap<string,number>( );
    map.set( 'a', 1 );
    map.set( 'b', 2 );
    map.set( 'c', 3 );
    expect( [ ...map ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );
    expect( [ ...map.entries( ) ] ).toEqual( [ ['a',1], ['b',2], ['c',3] ] );
    expect( [ ...map.keys( ) ] ).toEqual( [ 'a', 'b', 'c' ] );
    expect( [ ...map.values( ) ] ).toEqual( [ 1, 2, 3 ] );
    expect( map.size ).toBe( 3 );
    expect( map.has( 'a' ) ).toBe( true );
    expect( map.get( 'a' ) ).toBe( 1 );
    expect( map.has( 'X' ) ).toBe( false );
    expect( map.get( 'X' ) ).toBe( undefined );
} );

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
import { Disposer } from './disposer';

export type Nullable<T> = T | null;

export type Runnable = ( ) => unknown;
export type Supplier<T> = ( ) => T;
export type Consumer<T> = ( t: T ) => unknown;
export type ActivityConsumer<T> = ( ongoing: boolean, t: T ) => unknown;
export type Predicate<T> = ( t: T ) => boolean;

export type Equator<T> = ( a: T, b: T ) => boolean;
export type Comparator<T> = ( a: T, b: T ) => number;

export type HomogeneousTuple<T> = readonly [] | readonly [ T, ...T[] ];
export type StringTuple = HomogeneousTuple<string>;

export interface Arrayish<T> {
    readonly length: number;
    readonly [n: number]: T;
    [Symbol.iterator]( ): Iterator<T>;
    slice( start?: number, end?: number ): Arrayish<T>;
}

export const NOOP = ( ) => undefined;
export const alwaysTrue = ( v: unknown ) => true;

/**
 * Calls the given fn immediately. That can be done using basic
 * Javascript instead, but passing a lambda to this fn is more
 * readable in some cases.
 */
export function run<T>( fn: ( ) => T ): T {
    return fn( );
}

/**
 * Alias for `run()`.
 */
export const get = run;

export function cachingSupplier<T>( supplier: Supplier<T> ): Supplier<T> {
    const UNINITIALIZED = Symbol( 'UNINITIALIZED' );
    let value: T | typeof UNINITIALIZED = UNINITIALIZED;
    return ( ) => {
        if ( value === UNINITIALIZED ) {
            value = supplier( );
        }
        return value;
    };
}

export function firstTrue<T>( values: Iterable<T>, test: Predicate<T> ): T | undefined;
export function firstTrue<T>( values: Iterable<T>, fallback: T, test: Predicate<T> ): T;
export function firstTrue<T>( values: Iterable<T>, arg2: unknown, arg3?: unknown ): T | undefined {
    let test;
    let fallback;
    if ( arg3 === undefined ) {
        test = arg2 as Predicate<T>;
        fallback = undefined;
    }
    else {
        test = arg3 as Predicate<T>;
        fallback = arg2 as T;
    }

    for ( const v of values ) {
        if ( test( v ) ) {
            return v;
        }
    }
    return fallback;
}

export function requireTrue<T>( t: T, test: Predicate<T> ): T {
    if ( !test( t ) ) {
        throw new Error( );
    }
    else {
        return t;
    }
}

/**
 * Returns true iff x is a non-NaN number.
 */
export function isNumber( x: unknown ): x is number {
    return ( typeof( x ) === 'number' && !Number.isNaN( x ) );
}

/**
 * Returns the first of the given values that is a non-NaN number.
 * Returns NaN iff every one of the given values is nullish or NaN.
 */
export function firstNumber( ...xs: ReadonlyArray<number | null | undefined> ): number {
    for ( const x of xs ) {
        if ( isNumber( x ) ) {
            return x;
        }
    }
    return NaN;
}

export function atLeast( a: number ): Predicate<number> {
    return v => ( v >= a );
}

export function atMost( a: number ): Predicate<number> {
    return v => ( v <= a );
}

/**
 * Returns x if it is a non-NaN number, or fallback otherwise.
 */
export function numberOr( x: unknown, fallback: number ): number {
    return ( isNumber( x ) ? x : fallback );
}

export function isUndefined( t: unknown ): t is undefined {
    return ( typeof( t ) === 'undefined' );
}

export function isDefined<T>( t: T | undefined ): t is T {
    return ( typeof( t ) !== 'undefined' );
}

export function requireDefined<T>( t: T | undefined ): T {
    if ( isUndefined( t ) ) {
        throw new Error( );
    }
    else {
        return t;
    }
}

export function requireNonNull<T>( t: T | null ): T {
    if ( t === null ) {
        throw new Error( );
    }
    else {
        return t;
    }
}

export function isNonNullish<T>( t: T ): t is NonNullable<T> {
    return ( typeof( t ) !== 'undefined' && t !== null );
}

export function isNullish( t: unknown ): t is null | undefined {
    return ( typeof( t ) === 'undefined' || t === null );
}

export function requireNonNullish<T>( t: T | null | undefined ): T {
    if ( isNullish( t ) ) {
        throw new Error( );
    }
    else {
        return t;
    }
}

export type OneOf<T extends ReadonlyArray<unknown>> = T[number];

/**
 * Truncates toward zero.
 */
export function trunc( v: number ): number {
    return ( v | 0 );
}

/**
 * Like `a % b`, but always returns a non-negative number.
 */
export function mod( a: number, b: number ): number {
    return ( ( ( a % b ) + b ) % b );
}

export function arrayClone<T>( array: ReadonlyArray<T> ): Array<T>;
export function arrayClone<T>( array: Arrayish<T> ): Arrayish<T>;
export function arrayClone<T>( array: Arrayish<T> ): Arrayish<T> {
    return array.slice( 0 );
}

export function arrayClear( array: Array<unknown> ): void {
    array.splice( 0, array.length );
}

export function arrayRemoveFirst<T>( array: Array<T>, value: T ): Nullable<number> {
    let i = array.indexOf( value );
    if ( i === -1 ) {
        return null;
    }
    else {
        array.splice( i, 1 );
        return i;
    }
}

export function arrayRemoveLast<T>( array: Array<T>, value: T ): Nullable<number> {
    let i = array.lastIndexOf( value );
    if ( i === -1 ) {
        return null;
    }
    else {
        array.splice( i, 1 );
        return i;
    }
}

export function createChainedComparator<T>( comparators: ReadonlyArray<Comparator<T>> ): Comparator<T> {
    return ( a, b ) => {
        for ( const comparator of comparators ) {
            const comparison = comparator( a, b );
            if ( comparison !== 0 ) {
                return comparison;
            }
        }
        return 0;
    };
}

export function concat<T>( ...arrays: ConcatArray<T>[] ): T[] {
    return ( [] as T[] ).concat( ...arrays );
}

/**
 * Guarantees stability iff array has no duplicate elements.
 */
export function arraySortStable<T>( array: Array<T>, compare: Comparator<T> ): void {
    // Remember the original index of each element
    const indices = new Map( ) as Map<unknown,number>;
    for ( let i = 0; i < array.length; i++ ) {
        indices.set( array[ i ], i );
    }

    array.sort( ( a, b ) => {
        // Try the primary comparison first
        const primaryComparison = compare( a, b );
        if ( primaryComparison !== 0 ) {
            return primaryComparison;
        }

        // Fall back to index comparison
        const aIndex = requireDefined( indices.get( a ) );
        const bIndex = requireDefined( indices.get( b ) );
        const indexComparison = aIndex - bIndex;
        if ( indexComparison !== 0 ) {
            return indexComparison;
        }

        // Nothing else we can do if array has duplicate entries
        return 0;
    } );
}

export function arrayReverseIterable<T>( array: ArrayLike<T> ): Iterable<T> {
    return {
        [Symbol.iterator]( ): Iterator<T> {
            return arrayReverseIterator( array );
        }
    };
}

export function arrayReverseIterator<T>( array: ArrayLike<T> ): Iterator<T> {
    let i = array.length;
    return {
        next( ): IteratorResult<T> {
            i--;
            return {
                done: ( i < 0 ),
                value: array[ i ]
            };
        }
    };
}

export function* mapIterable<A,B>( iterable: Iterable<A>, fn: ( a: A ) => B ): Iterable<B> {
    for ( const a of iterable ) {
        yield fn( a );
    }
}

export function iterableIsEmpty( iterable: Iterable<unknown> ): boolean {
    for ( const _ of iterable ) {
        return false;
    }
    return true;
}

export function* multiIterable<T>( ...iterables: Iterable<T>[] ): Iterable<T> {
    for ( const iterable of iterables ) {
        for ( const value of iterable ) {
            yield value;
        }
    }
}

interface MapishA<K,V> {
    get( key: K ): V | undefined;
    has( key: K ): boolean;
}

export function mapRequire<K,V>( map: MapishA<K,V>, key: K ): V {
    // We could do the get() first, and check for undefined ...
    // but that would get messy when V is a superset of undefined
    if ( !map.has( key ) ) {
        throw new Error( 'Map does not contain key: ' + key );
    }
    return map.get( key )!;
}

interface MapishB<K,V> {
    get( key: K ): V | undefined;
    has( key: K ): boolean;
    set( key: K, value: V ): this;
    delete( key: K ): unknown;
}

export function mapSetIfAbsent<K,V>( map: MapishB<K,V>, key: K, createValueFn: Supplier<V> ): V {
    if ( !map.has( key ) ) {
        map.set( key, createValueFn( ) );
    }
    return map.get( key )!;
}

export function mapAdd<K,V>( map: MapishB<K,V>, key: K, value: V ): Disposer {
    if ( map.has( key ) ) {
        throw new Error( 'Map already contains key: ' + key );
    }
    map.set( key, value );
    return ( ) => {
        map.delete( key );
    };
}

export function singleOrEmpty<T>( item: T | null | undefined ): Iterable<T> {
    return ( isNullish( item ) ? [] : [ item ] );
}

export function requireEqual<T>( a: T, b: T, equator: Equator<T> = tripleEquals ): T {
    if ( !equator( a, b ) ) {
        throw new Error( );
    }
    else {
        return a;
    }
}

export function arrayEquator<T>( itemEquator: Equator<T> = tripleEquals ): Equator<ArrayLike<T>> {
    return ( a, b ) => {
        return arrayAllEqual( a, b, itemEquator );
    };
}

export function arrayAllEqual<T>( a: Nullable<ArrayLike<T>>, b: Nullable<ArrayLike<T>>, itemEquator: Equator<T> = tripleEquals ): boolean {
    if ( a === b ) {
        return true;
    }
    else if ( a === null || b === null ) {
        return false;
    }
    else if ( a.length !== b.length ) {
        return false;
    }
    else {
        const n = a.length;
        for ( let i = 0; i < n; i++ ) {
            if ( !itemEquator( a[ i ], b[ i ] ) ) {
                return false;
            }
        }
        return true;
    }
}

export function tripleEquals<T>( a: T, b: T ): boolean {
    return ( a === b );
}

/**
 * Check for equality with SameValueZero semantics:
 *  - `sameValueZero( NaN, NaN )` returns `true`
 *  - `sameValueZero( -0, +0 )` returns `true`
 */
export function sameValueZero<T>( a: T, b: T ): boolean {
    return ( a === b || Object.is( a, b ) );
}

export function clamp( xMin: number, xMax: number, x: number ): number {
    return Math.max( xMin, Math.min( xMax, x ) );
}

/**
 * Used by `nextUpFloat64()` and `nextDownFloat64()`
 */
const dataView64 = new DataView( new ArrayBuffer( 8 ) );

function increment64( dataView64: DataView ): void {
    const hi32 = dataView64.getUint32( 0 );
    const lo32 = dataView64.getUint32( 4 );
    dataView64.setUint32( 4, lo32 + 1 );
    if ( lo32 === 0xFFFFFFFF ) {
        dataView64.setUint32( 0, hi32 + 1 );
    }
}

function decrement64( dataView64: DataView ): void {
    const hi32 = dataView64.getUint32( 0 );
    const lo32 = dataView64.getUint32( 4 );
    dataView64.setUint32( 4, lo32 - 1 );
    if ( lo32 === 0x00000000 ) {
        dataView64.setUint32( 0, hi32 - 1 );
    }
}

export function nextUpFloat64( v: number ): number {
    if ( Number.isNaN( v ) || v === Number.POSITIVE_INFINITY ) {
        return v;
    }
    else if ( v === 0 ) {
        return +Number.MIN_VALUE;
    }
    else {
        dataView64.setFloat64( 0, v );
        if ( v < 0 ) {
            decrement64( dataView64 );
        }
        else {
            increment64( dataView64 );
        }
        return dataView64.getFloat64( 0 );
    }
}

export function nextDownFloat64( v: number ): number {
    if ( Number.isNaN( v ) || v === Number.NEGATIVE_INFINITY ) {
        return v;
    }
    else if ( v === 0 ) {
        return -Number.MIN_VALUE;
    }
    else {
        dataView64.setFloat64( 0, v );
        if ( v < 0 ) {
            increment64( dataView64 );
        }
        else {
            decrement64( dataView64 );
        }
        return dataView64.getFloat64( 0 );
    }
}

export function getNow_PMILLIS( ): number {
    return ( new Date( ) ).getTime( );
}

export function setTimeout3( delay_MILLIS: number, fn: Function ): Disposer {
    const handle = setTimeout( fn, delay_MILLIS );
    return ( ) => {
        clearTimeout( handle );
    };
}

export function setRepeating( delay_MILLIS: number, interval_MILLIS: number, fn: Function ): Disposer {
    // clearTimeout is not sufficient if fn does something async
    let running = true;
    let handle = setTimeout2( delay_MILLIS, function g( ) {
        if ( running ) {
            fn( );
            if ( running ) {
                handle = setTimeout2( interval_MILLIS, g );
            }
        }
    } );
    return ( ) => {
        running = false;
        clearTimeout( handle );
    };
}

export function setAsyncRepeating( delay_MILLIS: number, interval_MILLIS: number, asyncFn: ( ) => Promise<unknown> ): Disposer {
    // clearTimeout is not sufficient if fn does something async
    let running = true;
    let handle = setTimeout2( delay_MILLIS, async function g( ) {
        if ( running ) {
            await asyncFn( );
            if ( running ) {
                handle = setTimeout2( interval_MILLIS, g );
            }
        }
    } );
    return ( ) => {
        running = false;
        clearTimeout( handle );
    };
}

/**
 * Just like setTimeout(), but with the function arg last,
 * which is often more readable when passing a lambda.
 */
export function setTimeout2( delay_MILLIS: number, fn: Function ): number {
    return setTimeout( fn, delay_MILLIS );
}

/**
 * Wraps the given runnable in such a way that it won't execute
 * more frequently than specified. If the returned runnable gets
 * called more frequently than specified, calls will be coalesced
 * and delayed until the specified interval has passed since the
 * most recent execution. Calls will not be ignored.
 */
export function rateLimitedRunnable( minInterval_MILLIS: number, listener: Runnable ): Runnable {
    // TODO: Optionally wait before initial firing
    let earliest_PMILLIS = getNow_PMILLIS( );
    let timeout = undefined as ( number | undefined );
    return ( ) => {
        if ( getNow_PMILLIS( ) >= earliest_PMILLIS ) {
            // Enough time has passed that we can call immediately
            if ( timeout !== undefined ) {
                // Resorb the pending call
                clearTimeout( timeout );
                timeout = undefined;
            }
            earliest_PMILLIS = getNow_PMILLIS( ) + minInterval_MILLIS;
            listener( );
        }
        else if ( timeout === undefined ) {
            // No call pending yet, so start one
            timeout = setTimeout2( earliest_PMILLIS - getNow_PMILLIS( ), ( ) => {
                timeout = undefined;
                earliest_PMILLIS = getNow_PMILLIS( ) + minInterval_MILLIS;
                listener( );
            } );
        }
        else {
            // There's already a call pending, so do nothing
        }
    };
}

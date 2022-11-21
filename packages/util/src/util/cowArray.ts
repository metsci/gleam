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
import { findIndexAfter, findIndexAtOrAfter, findIndexAtOrBefore, findIndexBefore, findIndexNearest, findIndexOf, MissFn } from './binarySearch';
import { arrayClear, arrayClone, arrayRemoveFirst, arrayRemoveLast, arrayReverseIterator, arraySortStable, Nullable } from './misc';

export class CowArray<V> {
    readonly inReverse: Iterable<V>;

    protected current: ReadonlyArray<V>;

    constructor( vs: ReadonlyArray<V> = [] ) {
        this.current = vs;

        const _this = this;
        this.inReverse = {
            [Symbol.iterator]( ): Iterator<V> {
                return _this.reverseIterator( );
            }
        };
    }

    protected modify<R>( modify: ( vs: V[] ) => R ): R {
        const vs = arrayClone( this.current );
        const result = modify( vs );
        this.current = vs;
        return result;
    }

    [Symbol.iterator]( ): Iterator<V> {
        return this.current[ Symbol.iterator ]( );
    }

    reverseIterator( ): Iterator<V> {
        return arrayReverseIterator( this.current );
    }

    entries( ): IterableIterator<[number,V]> {
        return this.current.entries( );
    }

    keys( ): IterableIterator<number> {
        return this.current.keys( );
    }

    values( ): IterableIterator<V> {
        return this.current.values( );
    }

    get length( ): number {
        return this.current.length;
    }

    set length( length: number ) {
        this.modify( vs => ( vs.length = length ) );
    }

    clear( ): void {
        this.modify( vs => arrayClear( vs ) );
    }

    get( i: number ): V {
        return this.current[ i ];
    }

    set( i: number, v: V ): V {
        return this.modify( vs => ( vs[ i ] = v ) );
    }

    push( v: V ): number {
        return this.modify( vs => vs.push( v ) );
    }

    pop( ): V | undefined {
        return this.modify( vs => vs.pop( ) );
    }

    shift( ): V | undefined {
        return this.modify( vs => vs.shift( ) );
    }

    unshift( ...items: V[] ): number {
        return this.modify( vs => vs.unshift( ...items ) );
    }

    splice( start: number, deleteCount?: number ): CowArray<V>;
    splice( start: number, deleteCount: number, ...items: V[] ): CowArray<V>;
    splice( start: number, deleteCount: number, ...items: V[] ) {
        return new CowArray( this.modify( vs => vs.splice( start, deleteCount, ...items ) ) );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexOf( missFn: MissFn<V> ): number {
        return findIndexOf( this.current, missFn );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexNearest( missFn: MissFn<V> ): number {
        return findIndexNearest( this.current, missFn );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexAfter( missFn: MissFn<V> ): number {
        return findIndexAfter( this.current, missFn );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexAtOrAfter( missFn: MissFn<V> ): number {
        return findIndexAtOrAfter( this.current, missFn );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexBefore( missFn: MissFn<V> ): number {
        return findIndexBefore( this.current, missFn );
    }

    /**
     * Assumes that this array is already sorted.
     */
    findIndexAtOrBefore( missFn: MissFn<V> ): number {
        return findIndexAtOrBefore( this.current, missFn );
    }

    sort( compareFn?: ( a: V, b: V ) => number ): this {
        this.modify( vs => vs.sort( compareFn ) );
        return this;
    }

    sortStable( compareFn: ( a: V, b: V ) => number ): this {
        this.modify( vs => arraySortStable( vs, compareFn ) );
        return this;
    }

    removeFirst( v: V ): Nullable<number> {
        return this.modify( vs => arrayRemoveFirst( vs, v ) );
    }

    removeLast( v: V ): Nullable<number> {
        return this.modify( vs => arrayRemoveLast( vs, v ) );
    }

    reverse( ): this {
        this.modify( vs => vs.reverse( ) );
        return this;
    }

    fill( v: V, start?: number, end?: number ): this {
        this.modify( vs => vs.fill( v, start, end ) );
        return this;
    }

    copyWithin( target: number, start: number, end?: number ): this {
        this.modify( vs => vs.copyWithin( target, start, end ) );
        return this;
    }

    forEach( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => void, thisArg?: any ): void {
        // Assume fn doesn't modify this.current
        return this.current.forEach( fn, thisArg );
    }

    map<U>( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => U, thisArg?: any ): CowArray<U> {
        // Assume fn doesn't modify this.current
        return new CowArray( this.current.map( fn, thisArg ) );
    }

    filter<S extends V>( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => v is S, thisArg?: any ): CowArray<S>;
    filter( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => unknown, thisArg?: any ): CowArray<V>;
    filter( fn: any, thisArg?: any ) {
        // Assume fn doesn't modify this.current
        return new CowArray( this.current.filter( fn, thisArg ) );
    }

    reduce( fn: ( vPrev: V, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => V ): V;
    reduce( fn: ( vPrev: V, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => V, vInit: V ): V;
    reduce<U>( fn: ( uPrev: U, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => U, uInit: U ): U;
    reduce( fn: any, init?: any ) {
        // Assume fn doesn't modify this.current
        return this.current.reduce( fn, init );
    }

    reduceRight( fn: ( vPrev: V, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => V ): V;
    reduceRight( fn: ( vPrev: V, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => V, vInit: V ): V;
    reduceRight<U>( fn: ( uPrev: U, vCurrent: V, iCurrent: number, vs: ReadonlyArray<V> ) => U, uInit: U ): U;
    reduceRight( fn: any, init?: any ) {
        // Assume fn doesn't modify this.current
        return this.current.reduceRight( fn, init );
    }

    find<S extends V>( fn: ( this: void, v: V, i: number, vs: ReadonlyArray<V> ) => v is S, thisArg?: any ): S | undefined;
    find( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => unknown, thisArg?: any ): V | undefined;
    find( fn: any, thisArg?: any ) {
        // Assume fn doesn't modify this.current
        return this.current.find( fn, thisArg );
    }

    findIndex( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => unknown, thisArg?: any ): number {
        // Assume fn doesn't modify this.current
        return this.current.findIndex( fn, thisArg );
    }

    indexOf( v: V, fromIndex?: number ): number {
        return this.current.indexOf( v, fromIndex );
    }

    lastIndexOf( v: V, fromIndex?: number ): number {
        return this.current.lastIndexOf( v, fromIndex );
    }

    includes( v: V, fromIndex?: number ): boolean {
        return this.current.includes( v, fromIndex );
    }

    concat( ...items: ConcatArray<V>[] ): CowArray<V>;
    concat( ...items: ( V | ConcatArray<V> )[] ): CowArray<V>;
    concat( ...items: any[] ) {
        return new CowArray( this.current.concat( ...items ) );
    }

    join( separator?: string ): string {
        return this.current.join( separator );
    }

    slice( start?: number, end?: number ): CowArray<V> {
        return new CowArray( this.current.slice( start, end ) );
    }

    every( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => unknown, thisArg?: any ): boolean {
        // Assume fn doesn't modify this.current
        return this.current.every( fn, thisArg );
    }

    some( fn: ( v: V, i: number, vs: ReadonlyArray<V> ) => unknown, thisArg?: any ): boolean {
        // Assume fn doesn't modify this.current
        return this.current.some( fn, thisArg );
    }

    toString( ): string {
        return this.current.toString( );
    }

    toLocaleString( ): string {
        return this.current.toLocaleString( );
    }
}

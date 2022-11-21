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
import * as immutable from 'immutable';

// This file allows Gleam to depend on ImmutableJS without forcing dependent
// code to use the same version of ImmutableJS that Gleam does. It also leaves
// open the possibility of replacing ImmutableJS internally with different impls
// of these types, without breaking dependent code.
//
// Like static linking, this makes it harder for dependent code to specify what
// version of ImmutableJS is used internally by Gleam. However, supporting that
// capability is not a high priority.
//
// Each type in this file is a minimal subset of a type in the ImmutableJS API.
// The types here get exposed as part of the Gleam API, in the @metsci/gleam-util
// namespace. If a library depends on Gleam, and also imports types directly from
// ImmutableJS, TypeScript will automatically recognize the ImmutableJS types as
// extending the types here. As long as the types here are kept small and simple,
// future versions of ImmutableJS are expected to be type-compatible as well.

export interface ValueObject {
    hashCode( ): number;
    equals( o: unknown ): boolean;
}

/**
 * Returns true if values are equal by *either* SameValueZero semantics
 * *or* value-object semantics. In particular:
 *  - `equal( NaN, NaN )` returns `true`
 *  - `equal( -0, +0 )` returns `true`
 */
export function equal<T>( a: T, b: T ): boolean {
    return ( a === b || immutable.is( a, b ) );
}

export function hashCode( x: unknown ): number {
    return immutable.hash( x );
}


export interface ImmutableList<T> extends ValueObject {
    readonly size: number;
    get( index: number ): T | undefined;
    [Symbol.iterator]( ): Iterator<T>;
    push( item: T ): ImmutableList<T>;
}

export function newImmutableList<T>( items: Iterable<T> ): ImmutableList<T> {
    return immutable.List<T>( items );
}


export interface ImmutableSet<T> extends ReadonlySet<T>, ValueObject {
    add( item: T ): ImmutableSet<T>;
    remove( item: T ): ImmutableSet<T>;
}

export function newImmutableSet<T>( items: Iterable<T> ): ImmutableSet<T> {
    return immutable.Set<T>( items );
}


export interface ImmutableMap<K,V> extends ReadonlyMap<K,V>, ValueObject {
    get( key: K ): V | undefined;
    set( key: K, value: V ): ImmutableMap<K,V>;
    remove( key: K ): ImmutableMap<K,V>;
    update( key: K, updateFn: ( oldValue: V | undefined ) => V ): ImmutableMap<K,V>;
}

export function newImmutableMap<K,V>( entries: Iterable<[ key: K, value: V ]> ): ImmutableMap<K,V> {
    return immutable.Map( entries );
}

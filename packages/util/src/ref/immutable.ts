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
import { Consumer, Disposer, equal, ImmutableMap, ImmutableSet, isNullish, isUndefined, newImmutableMap, newImmutableSet } from '../util';
import { ListenerConfig } from './config';
import { Listenable } from './listenable';
import { isRef, ReadableRef, ReadableRefDerived, Ref, RefDerived } from './ref';
import { addOldNewListener } from './util';


// General derived Ref impls, using value-object equality
//

export class UnaryReadableRef<A,B> extends ReadableRefDerived<B> {
    constructor(
        readonly aRef: ReadableRef<A>,
        readonly getValue: ( a: A ) => B,
    ) {
        super( aRef );
    }

    areEqual( b0: B, b1: B ): boolean {
        return equal( b0, b1 );
    }

    get v( ): B {
        const a = this.aRef.v;
        return this.getValue( a );
    }
}

export class BinaryReadableRef<A,B,C> extends ReadableRefDerived<C> {
    constructor(
        readonly aRef: ReadableRef<A>,
        readonly bRef: ReadableRef<B>,
        readonly getValue: ( a: A, b: B ) => C,
    ) {
        super( aRef, bRef );
    }

    areEqual( c0: C, c1: C ): boolean {
        return equal( c0, c1 );
    }

    get v( ): C {
        const a = this.aRef.v;
        const b = this.bRef.v;
        return this.getValue( a, b );
    }
}

export class UnaryRef<A,B> extends RefDerived<B> {
    constructor(
        readonly aRef: Ref<A>,
        readonly getValue: ( a: A ) => B,
        readonly updateValue: ( a: A, newValue: B ) => A,
    ) {
        super( aRef );
    }

    areEqual( b0: B, b1: B ): boolean {
        return equal( b0, b1 );
    }

    get v( ): B {
        const a = this.aRef.v;
        return this.getValue( a );
    }

    protected doSet( ongoing: boolean, value: B ): boolean {
        return this.aRef.update( ongoing, a => {
            return this.updateValue( a, value );
        } )
    }
}


// Map-value ReadableRef, using immutable maps and value-object equality
//

class MapValueReadableRef0<K,V> extends ReadableRefDerived< V | undefined > {
    constructor(
        readonly mapRef: ReadableRef< ImmutableMap<K,V> | undefined >,
        readonly key: K,
    ) {
        super( mapRef );
    }

    areEqual( a: V | undefined, b: V | undefined ): boolean {
        return equal( a, b );
    }

    get v( ): V | undefined {
        const map = this.mapRef.v;
        return ( map && map.get( this.key ) );
    }
}

class MapValueReadableRef1<K,V> extends ReadableRefDerived< V | undefined > {
    constructor(
        readonly mapRef: ReadableRef< ImmutableMap<K,V> | undefined >,
        readonly keyRef: ReadableRef< K | undefined >,
    ) {
        super( mapRef, keyRef );
    }

    areEqual( a: V | undefined, b: V | undefined ): boolean {
        return equal( a, b );
    }

    get v( ): V | undefined {
        const key = this.keyRef.v;
        if ( !isNullish( key ) ) {
            const map = this.mapRef.v;
            return ( map && map.get( key ) );
        }
        else {
            return undefined;
        }
    }
}

export function mapValueReadableRef<K,V>( mapRef: ReadableRef< ImmutableMap<K,V> | undefined >, keyOrRef: K | ReadableRef< K | undefined > ): ReadableRef< V | undefined > {
    return ( isRef( keyOrRef )
             ? new MapValueReadableRef1( mapRef, keyOrRef )
             : new MapValueReadableRef0( mapRef, keyOrRef ) );
}


// Map-value Ref, using immutable maps and value-object equality
//

class MapValueRef0<K,V> extends RefDerived< V | undefined > {
    constructor(
        readonly mapRef: Ref< ImmutableMap<K,V> | undefined >,
        readonly key: K,
    ) {
        super( mapRef );
    }

    areEqual( a: V | undefined, b: V | undefined ): boolean {
        return equal( a, b );
    }

    get v( ): V | undefined {
        const map = this.mapRef.v;
        return ( map && map.get( this.key ) );
    }

    protected doSet( ongoing: boolean, value: V | undefined ): boolean {
        const map = this.mapRef.v;
        if ( map ) {
            if ( isUndefined( value ) ) {
                return this.mapRef.set( ongoing, map.remove( this.key ) );
            }
            else {
                return this.mapRef.set( ongoing, map.set( this.key, value ) );
            }
        }
        else {
            return false;
        }
    }
}

class MapValueRef1<K,V> extends RefDerived< V | undefined > {
    constructor(
        readonly mapRef: Ref< ImmutableMap<K,V> | undefined >,
        readonly keyRef: ReadableRef< K | undefined >,
    ) {
        super( mapRef, keyRef );
    }

    areEqual( a: V | undefined, b: V | undefined ): boolean {
        return equal( a, b );
    }

    get v( ): V | undefined {
        const key = this.keyRef.v;
        if ( !isNullish( key ) ) {
            const map = this.mapRef.v;
            return ( map && map.get( key ) );
        }
        else {
            return undefined;
        }
    }

    protected doSet( ongoing: boolean, value: V | undefined ): boolean {
        const key = this.keyRef.v;
        if ( !isNullish( key ) ) {
            const map = this.mapRef.v;
            if ( map ) {
                if ( isUndefined( value ) ) {
                    return this.mapRef.set( ongoing, map.remove( key ) );
                }
                else {
                    return this.mapRef.set( ongoing, map.set( key, value ) );
                }
            }
        }
        return false;
    }
}

export function mapValueRef<K,V>( mapRef: Ref< ImmutableMap<K,V> | undefined >, keyOrRef: K | ReadableRef< K | undefined > ): Ref< V | undefined> {
    return ( isRef( keyOrRef )
            ? new MapValueRef1( mapRef, keyOrRef )
            : new MapValueRef0( mapRef, keyOrRef ) );
}


// Map change listeners, using immutable maps
//

export function onMapKeyAdded<K>(
    mapRef: ReadableRef< ImmutableMap<K,unknown> | undefined >,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: Consumer<K>,
): Disposer {
    return addOldNewListener( mapRef, getListenable, config, ( mapOld0, mapNew0 ) => {
        const mapOld = mapOld0 ?? newImmutableMap<K,unknown>( [] );
        const mapNew = mapNew0 ?? newImmutableMap<K,unknown>( [] );
        for ( const key of mapNew.keys( ) ) {
            if ( !mapOld.has( key ) ) {
                listener( key );
            }
        }
    } );
}

export function onMapKeyRemoved<K>(
    mapRef: ReadableRef< ImmutableMap<K,unknown> | undefined >,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: Consumer<K>,
): Disposer {
    return addOldNewListener( mapRef, getListenable, config, ( mapOld0, mapNew0 ) => {
        const mapOld = mapOld0 ?? newImmutableMap<K,unknown>( [] );
        const mapNew = mapNew0 ?? newImmutableMap<K,unknown>( [] );
        for ( const key of mapOld.keys( ) ) {
            if ( !mapNew.has( key ) ) {
                listener( key );
            }
        }
    } );
}

export function onMapEntryChanged<K,V>(
    mapRef: ReadableRef< ImmutableMap<K,V> | undefined >,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: ( key: K, vOld: V | undefined, vNew: V | undefined ) => unknown,
): Disposer {
    return addOldNewListener( mapRef, getListenable, config, ( mapOld0, mapNew0 ) => {
        const mapOld = mapOld0 ?? newImmutableMap<K,V>( [] );
        const mapNew = mapNew0 ?? newImmutableMap<K,V>( [] );
        const keys = newImmutableSet( [ ...mapOld.keys( ), ...mapNew.keys( ) ] );
        for ( const key of keys ) {
            const vOld = mapOld.get( key );
            const vNew = mapNew.get( key );
            if ( !equal( vNew, vOld ) ) {
                listener( key, vOld, vNew );
            }
        }
    } );
}


// Set change listeners, with immutable sets
//

export function onSetItemAdded<T>(
    setRef: ReadableRef< ImmutableSet<T> | undefined >,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: Consumer<T>,
): Disposer {
    return addOldNewListener( setRef, getListenable, config, ( setOld0, setNew0 ) => {
        const setOld = setOld0 ?? newImmutableSet( [] );
        const setNew = setNew0 ?? newImmutableSet( [] );
        for ( const item of setNew ) {
            if ( !setOld.has( item ) ) {
                listener( item );
            }
        }
    } );
}

export function onSetItemRemoved<T>(
    setRef: ReadableRef< ImmutableSet<T> | undefined >,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: Consumer<T>,
): Disposer {
    return addOldNewListener( setRef, getListenable, config, ( setOld0, setNew0 ) => {
        const setOld = setOld0 ?? newImmutableSet( [] );
        const setNew = setNew0 ?? newImmutableSet( [] );
        for ( const item of setOld ) {
            if ( !setNew.has( item ) ) {
                listener( item );
            }
        }
    } );
}

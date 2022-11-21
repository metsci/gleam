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
import { alwaysTrue, Disposer, Equator, isNonNullish, Predicate, Runnable, Supplier } from '../util';
import { ActivityListenable, ActivityListenableSet, ActivityListener, argsForAddActivityListener, doAddActivityListener } from './activityListenable';
import { ListenerConfig } from './config';
import { argsForAddListener, Listenable, listenable, ListenableBasic } from './listenable';
import { doHandleImmediateFlag } from './misc';
import { addToActiveTxn } from './txn';

export const IS_REF_SYMBOL = '@@__GLEAM_REF__@@';

export function isRef( obj: any ): obj is ReadableRef<unknown> {
    return !!( obj && typeof obj === 'object' && obj[ IS_REF_SYMBOL ] );
}

/**
 * Holds a mutable reference to a `V`. Read the `v` property to retrieve the value,
 * and call `addListener()` to be notified when the value changes.
 *
 * Impls may contain their own state, or may be backed by other refs. (In theory
 * they can be backed by anything that satisfies the interface, but typically the
 * most exotic it gets is being backed by other refs.)
 */
export interface ReadableRef<V> extends ActivityListenable {
    readonly [IS_REF_SYMBOL]: true;

    /**
     * Returns whether this ref considers the given values equal. When a caller
     * changes the value, this is used to determine whether to fire listeners.
     */
    areEqual( a: V, b: V ): boolean;

    /**
     * Returns the value currently held by this ref.
     */
    readonly v: V;
}

/**
 * Holds a mutable reference to a `V`. Read the `v` property to retrieve the value,
 * and call `addListener()` to be notified when the value changes. Call `set()`
 * or `update()` to change the value and fire listeners.
 *
 * Impls may contain their own state, or may be backed by other refs. (In theory
 * they can be backed by anything that satisfies the interface, but typically the
 * most exotic it gets is being backed by other refs.)
 *
 * Use `doTxn()` to make coordinated changes to multiple refs. For example:
 * ```
 * const amountToTransfer = ...;
 * doTxn( ( ) => {
 *     accountBalanceRefA.update( ongoing, v => v - amountToTransfer );
 *     accountBalanceRefB.update( ongoing, v => v + amountToTransfer );
 * } );
 * ```
 * When a ref is modified in a transaction, its listeners fire at the end of the
 * transaction rather than immediately after the change. If the transaction fails
 * to complete because an exception is thrown, refs get rolled back to the values
 * they held when the transaction started, and their listeners don't fire. This way
 * listeners see a consistent set of ref values: either all pre-transaction or all
 * post-transaction. Listeners never see mid-transaction values, where some of the
 * refs have been updated but others haven't yet. (The code running inside the txn
 * is allowed to read the values of other the refs, and *does* see mid-transaction
 * values.)
 *
 * Originally inspired by Clojure's `var` and `ref`.
 */
export interface Ref<V> extends ReadableRef<V> {
    /**
     * Returns whether this call changed the value and notified listeners.
     */
    set( ongoing: boolean, value: V ): boolean;

    /**
     * Returns whether this call changed the value and notified listeners.
     */
    update( ongoing: boolean, updateFn: ( value: V ) => V ): boolean;

    /**
     * Returns whether this call changed the value and notified listeners.
     */
    updateIfNonNullish( ongoing: boolean, updateFn: ( value: NonNullable<V> ) => V ): boolean;
}

export function filterListener<V>( rawListener: Runnable, equals: Equator<V>, getValue: Supplier<V> ): Runnable {
    let value = getValue( );
    return ( ) => {
        const oldValue = value;
        const newValue = getValue( );
        if ( !equals( newValue, oldValue ) ) {
            // Update current value
            value = newValue;

            // Fire listener
            rawListener( );
        }
    };
}

export function filterActivityListener<V>( rawListener: ActivityListener, equals: Equator<V>, getValue: Supplier<V> ): ActivityListener {
    let value = getValue( );
    let hasOngoingChanges = false;
    return ongoing => {
        const oldValue = value;
        const newValue = getValue( );
        if ( ( !ongoing && hasOngoingChanges ) || !equals( newValue, oldValue ) ) {
            // Update current value
            value = newValue;

            // Keep track of whether we've seen any ongoing changes since
            // the last completed change -- the current change is either
            // ongoing (set the flag), or completed (clear the flag)
            hasOngoingChanges = ongoing;

            // Fire listener
            rawListener( ongoing );
        }
    };
}

class FilteredListenable<V> implements Listenable {
    constructor(
        readonly rawListenable: Listenable,
        readonly equals: Equator<V>,
        readonly getValue: Supplier<V>,
    ) { }

    addListener( listener: Runnable ): Disposer;
    addListener( config: ListenerConfig, listener: Runnable ): Disposer;
    addListener( a: ListenerConfig | Runnable, b?: Runnable | undefined ): Disposer {
        const [ config, listener ] = argsForAddListener( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: Runnable ): Disposer {
        return doHandleImmediateFlag( config, listener, config2 => {
            return this.rawListenable.addListener( config2, filterListener( listener, this.equals, this.getValue ) );
        } );
    }
}

export function filterListenable<V>( rawListenable: Listenable, equals: Equator<V>, getValue: Supplier<V> ): Listenable {
    return new FilteredListenable( rawListenable, equals, getValue );
}

/**
 * A `Ref` impl that contains its own state and listener lists.
 */
export class RefBasic<V> implements Ref<V> {
    readonly [IS_REF_SYMBOL] = true;

    protected readonly ongoingRaw: ListenableBasic;
    protected readonly completedRaw: ListenableBasic;

    protected readonly ongoingFiltered: Listenable;
    protected readonly completedFiltered: Listenable;
    protected readonly allFiltered: Listenable;

    protected readonly _equatorFn: Equator<V>;
    protected readonly validatorFn: Predicate<V>;
    protected value: V;
    protected hasOngoingChanges: boolean;
    protected hasTxnMember: boolean;

    constructor(
        value: V,
        equatorFn: Equator<V>,
        validatorFn: Predicate<V> = alwaysTrue,
    ) {
        this.ongoingRaw = new ListenableBasic( );
        this.completedRaw = new ListenableBasic( );
        const allRaw = listenable( this.ongoingRaw, this.completedRaw );

        this._equatorFn = equatorFn;
        this.validatorFn = validatorFn;

        this.ongoingFiltered = filterListenable( this.ongoingRaw, this._equatorFn, ( ) => this.value );
        this.completedFiltered = filterListenable( this.completedRaw, this._equatorFn, ( ) => this.value );
        this.allFiltered = filterListenable( allRaw, this._equatorFn, ( ) => this.value );

        this.value = this.requireValid( value );
        this.hasOngoingChanges = false;
        this.hasTxnMember = false;
    }

    isValid( value: V ): boolean {
        return this.validatorFn( value );
    }

    requireValid( value: V ): V {
        if ( this.isValid( value ) ) {
            return value;
        }
        else {
            throw new Error( 'Value rejected by validate function' );;
        }
    }

    areEqual( a: V, b: V ): boolean {
        return this.equatorFn( a, b );
    }

    get equatorFn( ): Equator<V> {
        return this._equatorFn;
    }

    get v( ): V {
        return this.value;
    }

    set( ongoing: boolean, value: V ): boolean {
        return this.doSet( ongoing, value );
    }

    update( ongoing: boolean, update: ( value: V ) => V ): boolean {
        return this.set( ongoing, update( this.v ) );
    }

    updateIfNonNullish( ongoing: boolean, updateFn: ( value: NonNullable<V> ) => V ): boolean {
        if ( isNonNullish( this.v ) ) {
            return this.set( ongoing, updateFn( this.v ) );
        }
        else {
            return false;
        }
    }

    protected doSet( ongoing: boolean, value: V ): boolean {
        if ( ( !ongoing && this.hasOngoingChanges ) || !this.areEqual( value, this.value ) ) {
            this.requireValid( value );

            // If this will be the first change since the start of the current
            // txn, register a TxnMember to handle the possibility of rollback
            if ( !this.hasTxnMember ) {
                this.hasTxnMember = true;
                const rollbackValue = this.value;
                addToActiveTxn( {
                    rollback: ( ) => {
                        this.value = rollbackValue;
                        this.hasTxnMember = false;
                    },
                    commit: ( ) => {
                        this.hasTxnMember = false;
                    }
                } );
            }

            // Update current value
            this.value = value;

            // Keep track of whether we've seen any ongoing changes since
            // the last completed change -- the current change is either
            // ongoing (set the flag), or completed (clear the flag)
            this.hasOngoingChanges = ongoing;

            // Fire listeners on txn commit
            ( ongoing ? this.ongoingRaw : this.completedRaw ).fire( );

            return true;
        }
        else {
            return false;
        }
    }

    get completed( ): Listenable {
        return this.completedFiltered;
    }

    get all( ): Listenable {
        return this.allFiltered;
    }

    addListener( listener: ActivityListener ): Disposer;
    addListener( config: ListenerConfig, listener: ActivityListener ): Disposer;
    addListener( a: ListenerConfig | ActivityListener, b?: ActivityListener | undefined ): Disposer {
        const [ config, listener ] = argsForAddActivityListener( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: ActivityListener ): Disposer {
        const doImmediately = ( ) => listener( false );
        return doHandleImmediateFlag( config, doImmediately, config2 => {
            const listener2 = filterActivityListener( listener, this._equatorFn, ( ) => this.value );
            return doAddActivityListener( this.ongoingRaw, this.completedRaw, config2, listener2 );
        } );
    }
}

/**
 * A `ReadableRef` impl backed by one or more other `ReadableRef`s. Reading the value
 * actually reads the values of the backing refs, and combined them (in a subclass-
 * specific way) to create a `V`.
 *
 * Adding listeners to an object of this class actually adds the listeners to the backing
 * refs. Notifications from the backing refs are filtered so that listeners added to this
 * object fire only when the derived value changes.
 */
export abstract class ReadableRefDerived<V> implements ReadableRef<V> {
    readonly [IS_REF_SYMBOL] = true;

    protected readonly listenables: ActivityListenableSet;
    protected readonly valueFn: Supplier<V>;
    protected readonly equatorFn: Equator<V>;
    protected readonly _completed: Listenable;
    protected readonly _all: Listenable;

    constructor( ...listenables: ReadonlyArray<ActivityListenable> ) {
        this.listenables = new ActivityListenableSet( ...listenables );

        this.valueFn = ( ) => this.v;
        this.equatorFn = ( a: V, b: V ) => this.areEqual( a, b );
        this._completed = filterListenable( this.listenables.completed, this.equatorFn, this.valueFn );
        this._all = filterListenable( this.listenables.all, this.equatorFn, this.valueFn );
    }

    abstract areEqual( a: V, b: V ): boolean;

    abstract readonly v: V;

    get completed( ): Listenable {
        return this._completed;
    }

    get all( ): Listenable {
        return this._all;
    }

    addListener( listener: ActivityListener ): Disposer;
    addListener( config: ListenerConfig, listener: ActivityListener ): Disposer;
    addListener( a: ListenerConfig | ActivityListener, b?: ActivityListener | undefined ): Disposer {
        const [ config, listener ] = argsForAddActivityListener( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: ActivityListener ): Disposer {
        const doImmediately = ( ) => listener( false );
        return doHandleImmediateFlag( config, doImmediately, config2 => {
            return this.listenables.addListener( config2, filterActivityListener( listener, this.equatorFn, this.valueFn ) );
        } );
    }
}

export abstract class ReadableRefDerivedCaching<V> extends ReadableRefDerived<V> {
    protected static readonly UNINITIALIZED = Symbol( 'UNINITIALIZED' );

    protected readonly upstream: Map< ReadableRef<unknown>, unknown >;
    protected value: V | typeof ReadableRefDerivedCaching.UNINITIALIZED;

    constructor( ...upstreamRefs: ReadonlyArray<ReadableRef<unknown>> ) {
        super( ...upstreamRefs );

        this.upstream = new Map( );
        for ( const upstreamRef of upstreamRefs ) {
            this.upstream.set( upstreamRef, upstreamRef.v );
        }

        // Can't call compute() from the constructor, because it's abstract
        this.value = ReadableRefDerivedCaching.UNINITIALIZED;
    }

    protected static hasValueChanges( refValues: Map<ReadableRef<unknown>,unknown> ): boolean {
        for ( const [ ref, oldValue ] of refValues ) {
            const newValue = ref.v;
            if ( !ref.areEqual( newValue, oldValue ) ) {
                return true;
            }
        }
        return false;
    }

    get v( ): V {
        if ( this.value === ReadableRefDerivedCaching.UNINITIALIZED || ReadableRefDerivedCaching.hasValueChanges( this.upstream ) ) {
            for ( const upstreamRef of this.upstream.keys( ) ) {
                this.upstream.set( upstreamRef, upstreamRef.v );
            }
            this.value = this.compute( );
        }
        return this.value;
    }

    abstract compute( ): V;
}

/**
 * A `Ref` impl backed by one or more other refs. Reading the value actually reads the
 * values of the backing refs, and combines them (in a subclass-specific way) to create
 * a `V`.
 *
 * Changing the value actually changes the values of the backing refs in a subclass-
 * specific way. Subclasses must ensure that subsequent getter calls will return a value
 * that is equal (according to `this.areEqual()`) to the value passed to the set call.
 *
 * Adding listeners to an object of this class actually adds the listeners to the backing
 * refs. Notifications from the backing refs are filtered so that listeners added to this
 * object fire only when the derived value changes.
 *
 */
export abstract class RefDerived<V> extends ReadableRefDerived<V> implements Ref<V> {
    constructor( ...listenables: ReadonlyArray<ActivityListenable> ) {
        super( ...listenables );
    }

    set( ongoing: boolean, value: V ): boolean {
        return this.doSet( ongoing, value );
    }

    update( ongoing: boolean, update: ( value: V ) => V ): boolean {
        return this.set( ongoing, update( this.v ) );
    }

    updateIfNonNullish( ongoing: boolean, updateFn: ( value: NonNullable<V> ) => V ): boolean {
        if ( isNonNullish( this.v ) ) {
            return this.set( ongoing, updateFn( this.v ) );
        }
        else {
            return false;
        }
    }

    protected abstract doSet( ongoing: boolean, value: V ): boolean;
}

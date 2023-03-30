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
import { Disposer, NOOP } from '../util';
import { ActivityListenable } from './activityListenable';
import { ListenerConfig, withoutImmediate } from './config';
import { Listenable } from './listenable';
import { ReadableRef, ReadableRefDerived, Ref, RefDerived } from './ref';

export class PairReadableRef<A,B> extends ReadableRefDerived<[A,B]> {
    constructor(
        protected readonly aRef: ReadableRef<A>,
        protected readonly bRef: ReadableRef<B>,
    ) {
        super( aRef, bRef );
    }

    areEqual( a: [A,B], b: [A,B] ): boolean {
        return ( this.aRef.areEqual( a[0], b[0] ) && this.bRef.areEqual( a[1], b[1] ) );
    }

    get v( ): [A,B] {
        return [ this.aRef.v, this.bRef.v ];
    }
}

export class PairRef<A,B> extends RefDerived<[A,B]> {
    constructor(
        protected readonly aRef: Ref<A>,
        protected readonly bRef: Ref<B>,
    ) {
        super( aRef, bRef );
    }

    areEqual( a: [A,B], b: [A,B] ): boolean {
        return ( this.aRef.areEqual( a[0], b[0] ) && this.bRef.areEqual( a[1], b[1] ) );
    }

    get v( ): [A,B] {
        return [ this.aRef.v, this.bRef.v ];
    }

    protected doSet( ongoing: boolean, value: [A,B] ): boolean {
        // Make both calls before OR-ing their results, to avoid short-circuiting
        const resultA = this.aRef.set( ongoing, value[0] );
        const resultB = this.bRef.set( ongoing, value[1] )
        return ( resultA || resultB );
    }
}

export const COMPLETED_CHANGES = ( activityListenable: ActivityListenable ) => activityListenable.completed;
export const ALL_CHANGES = ( activityListenable: ActivityListenable ) => activityListenable.all;

export function addOldNewListener<V>(
    ref: ReadableRef<V>,
    getListenable: ( ref: ReadableRef<unknown> ) => Listenable,
    config: ListenerConfig,
    listener: ( vOld: V | undefined, vNew: V | undefined ) => unknown,
): Disposer {
    if ( config.immediate ) {
        listener( undefined, ref.v );
        if ( config.once ) {
            return NOOP;
        }
    }

    // Mutable state used in the lambda
    let value = ref.v;

    const config2 = withoutImmediate( config );
    return getListenable( ref ).addListener( config2, ( ) => {
        const oldValue = value;
        const newValue = ref.v;
        if ( !ref.areEqual( newValue, oldValue ) ) {
            value = newValue;
            listener( oldValue, newValue );
        }
    } );
}

/**
 * **WARNING:** The interaction between old-vs-new and ongoing-vs-complete tends
 * to introduce subtle bugs, especially when the listener filters notifications
 * based on the `ongoing` flag.
 *
 * Use the simpler `addOldNewListener()` whenever possible -- it is similar to
 * this fn but encourages callers to avoid that class of bugs by choosing either
 * COMPLETED_CHANGES or ALL_CHANGES.
 */
export function _addOldNewActivityListener<V>(
    ref: ReadableRef<V>,
    config: ListenerConfig,
    listener: ( ongoing: boolean, vOld: V | undefined, vNew: V | undefined ) => unknown,
): Disposer {
    if ( config.immediate ) {
        listener( false, undefined, ref.v );
        if ( config.once ) {
            return NOOP;
        }
    }

    // Mutable state used in the lambda
    let value = ref.v;
    let hasOngoingChanges = false;

    const config2 = withoutImmediate( config );
    return ref.addListener( config2, ongoing => {
        const oldValue = value;
        const newValue = ref.v;
        if ( ( !ongoing && hasOngoingChanges ) || !ref.areEqual( newValue, oldValue ) ) {
            // Update current value
            value = newValue;

            // Keep track of whether we've seen any ongoing changes since
            // the last completed change -- the current change is either
            // ongoing (set the flag), or completed (clear the flag)
            hasOngoingChanges = ongoing;

            // Fire listener
            listener( ongoing, oldValue, newValue );
        }
    } );
}

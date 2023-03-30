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
import { Listenable } from './listenable';
import { ListenerConfig } from './config';
import { Consumer, CowArray, numberOr, NOOP, Disposer } from '../util';
import { addToActiveTxn } from './txn';

export interface Notifier<T> extends Listenable {
    addListener( listener: Consumer<T> ): Disposer;
    addListener( config: ListenerConfig, listener: Consumer<T> ): Disposer;
}

export interface FireableNotifier<T> extends Notifier<T> {
    fire( t: T ): void;
}

export function argsForAddConsumer<T>( a: ListenerConfig | Consumer<T>, b?: Consumer<T> | undefined ): [ ListenerConfig, Consumer<T> ] {
    if ( b === undefined ) {
        return [ {} as ListenerConfig, a as Consumer<T> ];
    }
    else {
        return [ a as ListenerConfig, b as Consumer<T> ];
    }
}

interface ListenerEntry<T> {
    config: ListenerConfig;
    listener: Consumer<T>;
}

export class NotifierBasic<T> implements FireableNotifier<T> {
    protected readonly immediateArg: T;
    protected readonly entries: CowArray<ListenerEntry<T>>;

    constructor( immediateArg: T ) {
        this.immediateArg = immediateArg;
        this.entries = new CowArray( );
    }

    addListener( listener: Consumer<T> ): Disposer;
    addListener( config: ListenerConfig, listener: Consumer<T> ): Disposer;
    addListener( a: ListenerConfig | Consumer<T>, b?: Consumer<T> | undefined ): Disposer {
        const [ config, listener ] = argsForAddConsumer( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: Consumer<T> ): Disposer {
        const entry = { config, listener };

        if ( entry.config.immediate ) {
            entry.listener( this.immediateArg );
            if ( entry.config.once ) {
                return NOOP;
            }
        }

        this.entries.push( entry );
        this.entries.sortStable( ( a, b ) => {
            return ( numberOr( a.config.order, 0 ) - numberOr( b.config.order, 0 ) );
        } );

        return ( ) => {
            this.entries.removeFirst( entry );
        };
    }

    fire( t: T ): void {
        addToActiveTxn( {
            postCommit: ( ) => {
                for ( const entry of this.entries ) {
                    entry.listener( t );
                    if ( entry.config.once ) {
                        // COW list makes this safe while iterating
                        this.entries.removeFirst( entry );
                    }
                }
            }
        } );
    }
}

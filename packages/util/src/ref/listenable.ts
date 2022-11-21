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
import { arrayClone, CowArray, Disposer, DisposerGroup, NOOP, numberOr, Runnable } from '../util';
import { IMMEDIATE, ListenerConfig, withoutOnce } from './config';
import { doHandleImmediateFlag } from './misc';
import { addToActiveTxn } from './txn';

export interface Listenable {
    addListener( listener: Runnable ): Disposer;
    addListener( config: ListenerConfig, listener: Runnable ): Disposer;
}

export interface FireableListenable extends Listenable {
    fire( ): void;
}

export function argsForAddListener( a: ListenerConfig | Runnable, b?: Runnable | undefined ): [ ListenerConfig, Runnable ] {
    if ( b === undefined ) {
        return [ {} as ListenerConfig, a as Runnable ];
    }
    else {
        return [ a as ListenerConfig, b as Runnable ];
    }
}

export interface ListenerEntry {
    config: ListenerConfig;
    listener: Runnable;
}

export class ListenableBasic implements FireableListenable {
    protected readonly entries: CowArray<ListenerEntry>;

    constructor( ) {
        this.entries = new CowArray( );
    }

    addListener( listener: Runnable ): Disposer;
    addListener( config: ListenerConfig, listener: Runnable ): Disposer;
    addListener( a: ListenerConfig | Runnable, b?: Runnable | undefined ): Disposer {
        const [ config, listener ] = argsForAddListener( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: Runnable ): Disposer {
        const entry = { config, listener };

        if ( entry.config.immediate ) {
            entry.listener( );
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

    fire( ): void {
        addToActiveTxn( {
            postCommit: ( ) => {
                for ( const entry of this.entries ) {
                    entry.listener( );
                    if ( entry.config.once ) {
                        // COW list makes this safe while iterating
                        this.entries.removeFirst( entry );
                    }
                }
            }
        } );
    }
}

export class ListenableSet implements Listenable {
    protected readonly members: ReadonlyArray<Listenable>;

    constructor( ...members: ReadonlyArray<Listenable> ) {
        this.members = arrayClone( members );
    }

    addListener( listener: Runnable ): Disposer;
    addListener( config: ListenerConfig, listener: Runnable ): Disposer;
    addListener( a: ListenerConfig | Runnable, b?: Runnable | undefined ): Disposer {
        const [ config, listener ] = argsForAddListener( a, b );
        return this.doAddListener( config, listener );
    }

    protected doAddListener( config: ListenerConfig, listener: Runnable ): Disposer {
        return doHandleImmediateFlag( config, listener, config2 => {
            const disposers = new DisposerGroup( );
            if ( config2.once ) {
                const config3 = withoutOnce( config2 );
                const listener2 = ( ) => {
                    listener( );
                    disposers.dispose( );
                };
                for ( const member of this.members ) {
                    disposers.add( member.addListener( config3, listener2 ) );
                }
            }
            else {
                for ( const member of this.members ) {
                    disposers.add( member.addListener( config2, listener ) );
                }
            }
            return disposers;
        } );
    }
}

export function listenable( ...listenables: ReadonlyArray<Listenable> ): Listenable {
    return new ListenableSet( ...listenables );
}

export function linkListenables( ...listenables: ReadonlyArray<FireableListenable> ): Disposer {
    const disposers = new DisposerGroup( );
    let alreadyFiring = false;
    const ensureAllFire = ( ) => {
        if ( !alreadyFiring ) {
            alreadyFiring = true;
            try {
                for ( const listenable of listenables ) {
                    listenable.fire( );
                }
            }
            finally {
                alreadyFiring = false;
            }
        }
    };
    for ( const listenable of listenables ) {
        disposers.add( listenable.addListener( IMMEDIATE, ensureAllFire ) );
    }
    return disposers;
}

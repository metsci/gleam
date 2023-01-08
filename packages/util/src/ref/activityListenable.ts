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
import { arrayClone, Disposer, DisposerGroup } from '../util';
import { ListenerConfig, withoutOnce } from './config';
import { Listenable, listenable, ListenableBasic, ListenableSet } from './listenable';
import { doHandleImmediateFlag } from './misc';

export type ActivityListener = ( ongoing: boolean ) => void;

export interface ActivityListenable {
    readonly completed: Listenable;
    readonly all: Listenable;

    addListener( listener: ActivityListener ): Disposer;
    addListener( config: ListenerConfig, listener: ActivityListener ): Disposer;
}

export interface ActivityFireableListenable extends ActivityListenable {
    fire( ongoing: boolean ): void;
}

export function argsForAddActivityListener( a: ListenerConfig | ActivityListener, b?: ActivityListener | undefined ): [ ListenerConfig, ActivityListener ] {
    if ( b === undefined ) {
        return [ {} as ListenerConfig, a as ActivityListener ];
    }
    else {
        return [ a as ListenerConfig, b as ActivityListener ];
    }
}

export function doAddActivityListener(
    ongoing: Listenable,
    completed: Listenable,
    config: ListenerConfig,
    listener: ActivityListener,
): Disposer {
    const disposers = new DisposerGroup( );
    if ( config.once ) {
        const config2 = withoutOnce( config );

        disposers.add( ongoing.addListener( config2, ( ) => {
            listener( true );
            disposers.dispose( );
        } ) );

        disposers.add( completed.addListener( config2, ( ) => {
            listener( false );
            disposers.dispose( );
        } ) );
    }
    else {
        disposers.add( ongoing.addListener( config, ( ) => {
            listener( true );
        } ) );

        disposers.add( completed.addListener( config, ( ) => {
            listener( false );
        } ) );
    }
    return disposers;
}

export class ActivityListenableBasic implements ActivityFireableListenable {
    protected readonly _ongoing: ListenableBasic;
    protected readonly _completed: ListenableBasic;
    protected readonly _all: Listenable;

    constructor( ) {
        this._ongoing = new ListenableBasic( );
        this._completed = new ListenableBasic( );
        this._all = listenable( this._ongoing, this._completed );
    }

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
            return doAddActivityListener( this._ongoing, this._completed, config2, listener );
        } );
    }

    fire( ongoing: boolean ): void {
        ( ongoing ? this._ongoing : this._completed ).fire( );
    }
}

export class ActivityListenableSet implements ActivityListenable {
    protected readonly members: ReadonlyArray<ActivityListenable>;
    protected readonly _completed: Listenable;
    protected readonly _all: Listenable;

    constructor( ...members: ReadonlyArray<ActivityListenable> ) {
        this.members = arrayClone( members );
        this._completed = completedListenable( ...members );
        this._all = allListenable( ...members );
    }

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
            const disposers = new DisposerGroup( );
            if ( config2.once ) {
                const config3 = withoutOnce( config2 );
                const listener2 = ( ongoing: boolean ) => {
                    listener( ongoing );
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

export function completedListenable( ...listenables: Array<ActivityListenable> ): Listenable {
    return new ListenableSet( ...listenables.map( listenable => listenable.completed ) );
}

export function allListenable( ...listenables: Array<ActivityListenable> ): Listenable {
    return new ListenableSet( ...listenables.map( listenable => listenable.all ) );
}

export interface Changer {
    readonly changes: ActivityListenable;
}

export function activityListenable( ...members: Array<ActivityListenable|Changer> ): ActivityListenable {
    return new ActivityListenableSet( ...members.map( m => {
        return ( 'changes' in m ? m.changes : m );
    } ) );
}

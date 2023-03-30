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
import { LinkedMap, LinkedSet } from './linked';
import { requireDefined } from './misc';

export interface DisposeFn {
    ( ): unknown;
}

export interface Disposable {
    dispose( ): unknown;
}

export type Disposer = DisposeFn | Disposable;

export function dispose( disposer: Disposer ): void {
    if ( typeof disposer === 'function' ) {
        disposer( );
    }
    else {
        disposer.dispose( );
    }
}

export class DisposerGroup implements Disposable {
    protected members: LinkedSet<Disposer>;

    constructor( ) {
        this.members = new LinkedSet( );
    }

    add( disposer: Disposer ): void {
        this.members.add( disposer );
    }

    dispose( ): void {
        for ( const member of [ ...this.members.valuesInReverse( ) ] ) {
            this.members.delete( member );
            dispose( member );
        }
    }
}

export class DisposerGroupMap<K> implements Disposable {
    protected groups: LinkedMap<K,DisposerGroup>;

    constructor( ) {
        this.groups = new LinkedMap( );
    }

    get( key: K ): DisposerGroup {
        if ( !this.groups.has( key ) ) {
            const disposers = new DisposerGroup( );
            this.groups.set( key, disposers );
            disposers.add( ( ) => {
                if ( this.groups.get( key ) === disposers ) {
                    this.groups.delete( key );
                }
            } );
        }
        return requireDefined( this.groups.get( key ) );
    }

    disposeFor( key: K ): void {
        this.groups.get( key )?.dispose( );
    }

    dispose( ): void {
        for ( const key of [ ...this.groups.keysInReverse( ) ] ) {
            this.disposeFor( key );
        }
    }

    /**
     * Anticipated usage of `DisposerGroupMap` does not require this method.
     * Before using it, consider carefully whether you really need it. It is
     * provided for unforeseen situations.
     */
    get _size( ): number {
        return this.groups.size;
    }

    /**
     * Anticipated usage of `DisposerGroupMap` does not require this method.
     * Before using it, consider carefully whether you really need it. It is
     * provided for unforeseen situations.
     */
    _has( key: K ): boolean {
        return this.groups.has( key );
    }

    /**
     * Anticipated usage of `DisposerGroupMap` does not require this method.
     * Before using it, consider carefully whether you really need it. It is
     * provided for unforeseen situations.
     */
    _keys( ): IterableIterator<K> {
        return this.groups.keys( );
    }
}

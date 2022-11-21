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
import { argsForAddConsumer, arrayClone, arrayRemoveFirst, arrayRemoveLast, arraySortStable, Comparator, Consumer, Disposer, ListenerConfig, NOOP, Notifier, Nullable, numberOr } from '@metsci/gleam-util';

interface ListenerEntry<T> {
    config: ListenerConfig;
    listener: Consumer<T>;
}

export class NotifierTree<T> implements Notifier<T> {
    protected readonly immediateArg: T;

    protected parent: Nullable<NotifierTree<T>>;
    protected children: Array<NotifierTree<T>>;

    protected ownEntries: Array<ListenerEntry<T>>;
    protected ownEntriesDirty: boolean;

    protected subtreeEntries: Nullable<Array<ListenerEntry<T>>>;

    constructor( immediateArg: T ) {
        this.immediateArg = immediateArg;

        this.parent = null;
        this.children = [];

        this.ownEntries = [];
        this.ownEntriesDirty = false;

        this.subtreeEntries = null;
    }

    setParent( parent: Nullable<NotifierTree<T>> ): void {
        if ( this.parent ) {
            arrayRemoveFirst( this.parent.children, this );
            this.parent.setSubtreeEntriesDirty( );
            this.parent = null;
        }
        if ( parent ) {
            this.parent = parent;
            this.parent.children.push( this );
            this.parent.setSubtreeEntriesDirty( );
        }
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

        this.ownEntries.push( entry );
        this.ownEntriesDirty = true;
        this.setSubtreeEntriesDirty( );

        return ( ) => {
            arrayRemoveLast( this.ownEntries, entry );
            this.removeSubtreeEntry( entry );
        };
    }

    protected setSubtreeEntriesDirty( ): void {
        this.subtreeEntries = null;
        if ( this.parent ) {
            this.parent.setSubtreeEntriesDirty( );
        }
    }

    protected removeSubtreeEntry( entry: ListenerEntry<T> ): Nullable<number> {
        let i;
        if ( this.subtreeEntries ) {
            i = arrayRemoveLast( this.subtreeEntries, entry );
        }
        else {
            i = null;
        }

        if ( this.parent ) {
            this.parent.removeSubtreeEntry( entry );
        }

        return i;
    }

    protected sortAndGetOwnEntries( ): Array<ListenerEntry<T>> {
        if ( this.ownEntriesDirty ) {
            arraySortStable( this.ownEntries, ( a, b ) => {
                return ( numberOr( a.config.order, 0 ) - numberOr( b.config.order, 0 ) );
            } );
            this.ownEntriesDirty = false;
        }
        return this.ownEntries;
    }

    protected getSubtreeEntryLists( ): Array<Array<ListenerEntry<T>>> {
        const result = [ this.sortAndGetOwnEntries( ) ];
        for ( const child of this.children ) {
            result.push( ...child.getSubtreeEntryLists( ) );
        }
        return result;
    }

    protected doSubtreeFire( t: T ): void {
        if ( !this.subtreeEntries ) {
            const entryLists = this.getSubtreeEntryLists( );
            this.subtreeEntries = mergePreSortedLists( entryLists, ( a, b ) => {
                return ( numberOr( a.config.order, 0 ) - numberOr( b.config.order, 0 ) );
            } );
        }

        for ( let i = 0; i < this.subtreeEntries.length; i++ ) {
            const entry = this.subtreeEntries[ i ];
            entry.listener( t );
            if ( entry.config.once ) {
                arrayRemoveLast( this.ownEntries, entry );
                const iRemoved = this.removeSubtreeEntry( entry );
                if ( iRemoved !== null && iRemoved <= i ) {
                    i--;
                }
            }
        }
    }

    fire( t: T ): void {
        this.getRoot( ).doSubtreeFire( t );
    }

    protected getRoot( ): NotifierTree<T> {
        return ( this.parent === null ? this : this.parent.getRoot( ) );
    }
}

export function mergePreSortedLists<T>( lists: ReadonlyArray<ReadonlyArray<T>>, compare: Comparator<T> ): Array<T> {
    // Sort list of lists so that neighboring lists have similar lengths
    const lists2 = arrayClone( lists );
    arraySortStable( lists2, ( a, b ) => {
        return ( a.length - b.length );
    } );
    return doMergePreSortedLists( lists2, compare );
}

export function doMergePreSortedLists<T>( lists: ReadonlyArray<ReadonlyArray<T>>, compare: Comparator<T> ): Array<T> {
    switch ( lists.length ) {
        case 0: {
            return [];
        }

        case 1: {
            return arrayClone( lists[ 0 ] );
        }

        case 2: {
            const result = [];

            let iA = 0;
            let iB = 0;
            const listA = lists[ 0 ];
            const listB = lists[ 1 ];

            while ( iA < listA.length && iB < listB.length ) {
                const vA = listA[ iA ];
                const vB = listB[ iB ];
                if ( compare( vA, vB ) <= 0 ) {
                    result.push( vA );
                    iA++;
                }
                else {
                    result.push( vB );
                    iB++;
                }
            }

            while ( iA < listA.length ) {
                const vA = listA[ iA ];
                result.push( vA );
                iA++;
            }

            while ( iB < listB.length ) {
                const vB = listB[ iB ];
                result.push( vB );
                iB++;
            }

            return result;
        }

        default: {
            const split = Math.floor( lists.length / 2 );
            const listsA = lists.slice( 0, split );
            const listsB = lists.slice( split );
            const resultA = doMergePreSortedLists( listsA, compare );
            const resultB = doMergePreSortedLists( listsB, compare );
            return doMergePreSortedLists( [ resultA, resultB ], compare );
        }
    }
}

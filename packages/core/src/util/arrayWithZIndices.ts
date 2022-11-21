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
import { CowArray, Disposer, requireDefined } from '@metsci/gleam-util';

export class ArrayWithZIndices<T> implements Iterable<T> {
    readonly inReverse: Iterable<T>;

    protected readonly array: CowArray<T>;
    protected readonly zMap: Map<T,number>;
    protected arrayNeedsSorting: boolean;

    constructor( ) {
        this.array = new CowArray( );
        this.zMap = new Map( );
        this.arrayNeedsSorting = false;

        const _this = this;
        this.inReverse = {
            [Symbol.iterator]( ): Iterator<T> {
                return _this.reverseIterator( );
            }
        };
    }

    add( item: T, zIndex: number = 0 ): Disposer {
        this.array.push( item );
        this.zMap.set( item, zIndex );
        this.arrayNeedsSorting = true;
        return ( ) => {
            this.delete( item );
        };
    }

    has( item: T ): boolean {
        return this.zMap.has( item );
    }

    delete( item: T ): void {
        this.array.removeFirst( item );
        this.zMap.delete( item );
    }

    getZIndex( item: T ): number {
        if ( !this.zMap.has( item ) ) {
            throw new Error( 'Item not found' );
        }
        return requireDefined( this.zMap.get( item ) );
    }

    setZIndex( item: T, zIndex: number ): void {
        if ( !this.zMap.has( item ) ) {
            throw new Error( 'Item not found' );
        }
        this.zMap.set( item, zIndex );
        this.arrayNeedsSorting = true;
    }

    clear( ): void {
        this.array.clear( );
        this.zMap.clear( );
        this.arrayNeedsSorting = false;
    }

    protected sortAndGetArray( ): CowArray<T> {
        if ( this.arrayNeedsSorting ) {
            this.array.sortStable( ( a, b ) => {
                const za = requireDefined( this.zMap.get( a ) );
                const zb = requireDefined( this.zMap.get( b ) );
                return ( za - zb );
            } );
            this.arrayNeedsSorting = false;
        }
        return this.array;
    }

    [Symbol.iterator]( ): Iterator<T> {
        const sorted = this.sortAndGetArray( );
        return sorted[ Symbol.iterator ]( );
    }

    reverseIterator( ): Iterator<T> {
        const sorted = this.sortAndGetArray( );
        return sorted.reverseIterator( );
    }
}

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

type Zw = [ z: number, w: number ];

export class ArrayWithZIndices<T> implements Iterable<T> {
    readonly inReverse: Iterable<T>;

    protected readonly array: CowArray<T>;
    protected arrayNeedsSorting: boolean;
    protected readonly zwMap: Map<T,Zw>;
    protected wNext: number;

    constructor( ) {
        this.array = new CowArray( );
        this.arrayNeedsSorting = false;
        this.zwMap = new Map( );
        this.wNext = 1;

        const _this = this;
        this.inReverse = {
            [Symbol.iterator]( ): Iterator<T> {
                return _this.reverseIterator( );
            }
        };
    }

    add( item: T, zIndex: number = 0 ): Disposer {
        this.array.push( item );
        const w = this.wNext++;
        this.zwMap.set( item, [ zIndex, w ] );
        this.arrayNeedsSorting = true;
        return ( ) => {
            this.delete( item );
        };
    }

    has( item: T ): boolean {
        return this.zwMap.has( item );
    }

    delete( item: T ): void {
        this.array.removeFirst( item );
        this.zwMap.delete( item );
    }

    getZIndex( item: T ): number {
        if ( !this.zwMap.has( item ) ) {
            throw new Error( 'Item not found' );
        }
        const [ z ] = requireDefined( this.zwMap.get( item ) );
        return z;
    }

    setZIndex( item: T, zIndex: number ): void {
        this.appendToZIndex( item, zIndex );
    }

    prependToZIndex( item: T, zIndex: number ): void {
        if ( !this.zwMap.has( item ) ) {
            throw new Error( 'Item not found' );
        }
        // Negate W so this entry gets sorted before others with the same Z
        const w = -1 * this.wNext++;
        this.zwMap.set( item, [ zIndex, w ] );
        this.arrayNeedsSorting = true;
    }

    appendToZIndex( item: T, zIndex: number ): void {
        if ( !this.zwMap.has( item ) ) {
            throw new Error( 'Item not found' );
        }
        const w = this.wNext++;
        this.zwMap.set( item, [ zIndex, w ] );
        this.arrayNeedsSorting = true;
    }

    clear( ): void {
        this.array.clear( );
        this.zwMap.clear( );
        this.arrayNeedsSorting = false;
    }

    protected sortAndGetArray( ): CowArray<T> {
        if ( this.arrayNeedsSorting ) {
            this.array.sort( ( a, b ) => {
                const [ zA, wA ] = requireDefined( this.zwMap.get( a ) );
                const [ zB, wB ] = requireDefined( this.zwMap.get( b ) );

                // Z low to high
                const zComparison = zA - zB;
                if ( zComparison !== 0 ) {
                    return zComparison;
                }

                // W low to high
                const wComparison = wA - wB;
                return wComparison;
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

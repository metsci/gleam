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
import { Consumer } from '@metsci/gleam-util';

interface BucketVisitor<T> {
    ( bucket: Array<T>, xMinBucket: number, xMaxBucket: number, yMinBucket: number, yMaxBucket: number ): unknown;
}

interface Node<T> {
    findLeaf( x: number, y: number ): LeafNode<T>;
    findItems( xMin: number, xMax: number, yMin: number, yMax: number, visitBucket: BucketVisitor<T> ): void;
}

class InternalNode<T> implements Node<T> {
    readonly xDivider: number;
    readonly yDivider: number;
    readonly children: Array<Node<T>>;

    constructor( xDivider: number, yDivider: number ) {
        this.xDivider = xDivider;
        this.yDivider = yDivider;
        this.children = new Array( );
    }

    findLeaf( x: number, y: number ): LeafNode<T> {
        const q = quadrant( this.xDivider, this.yDivider, x, y );
        return this.children[ q ].findLeaf( x, y );
    }

    findItems( xMin: number, xMax: number, yMin: number, yMax: number, visitBucket: BucketVisitor<T> ): void {
        const skipSmallX = ( xMin >= this.xDivider );
        const skipLargeX = ( xMax < this.xDivider );
        const skipSmallY = ( yMin >= this.yDivider );
        const skipLargeY = ( yMax < this.yDivider );
        if ( !( skipSmallX || skipSmallY ) ) {
            this.children[ 0 ].findItems( xMin, xMax, yMin, yMax, visitBucket );
        }
        if ( !( skipLargeX || skipSmallY ) ) {
            this.children[ 1 ].findItems( xMin, xMax, yMin, yMax, visitBucket );
        }
        if ( !( skipSmallX || skipLargeY ) ) {
            this.children[ 2 ].findItems( xMin, xMax, yMin, yMax, visitBucket );
        }
        if ( !( skipLargeX || skipLargeY ) ) {
            this.children[ 3 ].findItems( xMin, xMax, yMin, yMax, visitBucket );
        }
    }
}

class LeafNode<T> implements Node<T> {
    readonly bucket: Array<T>;

    // Used when checking whether a leaf is too small to split, and when choosing
    // dividers to split this leaf
    readonly xMin: number;
    readonly xMax: number;
    readonly yMin: number;
    readonly yMax: number;

    // Used when replacing this leaf with a replacement node
    readonly referringArray: Array<Node<T>>;
    readonly referringIndex: number;

    constructor( bucket: Array<T>, referringArray: Array<Node<T>>, referringIndex: number, xMin: number, xMax: number, yMin: number, yMax: number ) {
        this.bucket = bucket;
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.referringArray = referringArray;
        this.referringIndex = referringIndex;
    }

    findLeaf( x: number, y: number ): LeafNode<T> {
        return this;
    }

    findItems( xMin: number, xMax: number, yMin: number, yMax: number, visitBucket: BucketVisitor<T> ): void {
        visitBucket( this.bucket, this.xMin, this.xMax, this.yMin, this.yMax );
    }
}

/**
 * 0 = small-x small-y
 * 1 = large-x small-y
 * 2 = small-x large-y
 * 3 = large-x large-y
 */
function quadrant( xDivider: number, yDivider: number, x: number, y: number ): number {
    const h = ( x < xDivider ? 0 : 1 );
    const v = ( y < yDivider ? 0 : 2 );
    return ( h | v );
}

function truncInf( v: number ): number {
    return Math.max( -Number.MAX_VALUE, Math.min( +Number.MAX_VALUE, v ) );
}

export class QuadTree<T extends {x: number, y: number}> {
    protected readonly maxBucketSize: number;
    protected readonly root: Array<Node<T>>;

    constructor( maxBucketSize?: number ) {
        this.maxBucketSize = maxBucketSize ?? 512;
        this.root = new Array( );
        this.root.push( new LeafNode( new Array( ), this.root, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY ) );
    }

    findLeaf( x: number, y: number ): LeafNode<T> {
        return this.root[0].findLeaf( x, y );
    }

    forEach( xMin: number, xMax: number, yMin: number, yMax: number, visitFn: Consumer<T> ): void {
        this.root[0].findItems( xMin, xMax, yMin, yMax, ( bucket, xMinBucket, xMaxBucket, yMinBucket, yMaxBucket ) => {
            const xAll = ( xMin <= xMinBucket && xMaxBucket <= xMax );
            const yAll = ( yMin <= yMinBucket && yMaxBucket <= yMax );
            if ( xAll && yAll ) {
                for ( const item of bucket ) {
                    visitFn( item )
                }
            }
            else if ( xAll ) {
                for ( const item of bucket ) {
                    if ( yMin <= item.y && item.y <= yMax ) {
                        visitFn( item )
                    }
                }
            }
            else if ( yAll ) {
                for ( const item of bucket ) {
                    if ( xMin <= item.x && item.x <= xMax ) {
                        visitFn( item )
                    }
                }
            }
            else {
                for ( const item of bucket ) {
                    if ( xMin <= item.x && item.x <= xMax && yMin <= item.y && item.y <= yMax ) {
                        visitFn( item )
                    }
                }
            }
        } );
    }

    /**
     * If `item.x` or `item.y` is `NaN`, the item won't be added to the tree.
     */
    add( item: T ): void {
        const { x, y } = item;
        if ( Number.isNaN( x ) || Number.isNaN( y ) ) {
            return;
        }

        const leaf = this.findLeaf( x, y );
        leaf.bucket.push( item );
        if ( leaf.bucket.length > this.maxBucketSize ) {
            this.splitLeaf( leaf );
        }
    }

    /**
     * Removes the specified item, but doesn't rebalanced the tree.
     */
    remove( item: T ): void {
        const { x, y } = item;
        const leaf = this.findLeaf( x, y );
        let i = leaf.bucket.indexOf( item );
        if ( i >= 0 ) {
            leaf.bucket.splice( i, 1 );
        }
    }

    protected splitLeaf( leaf: LeafNode<T> ): void {
        const { xMin, xMax, yMin, yMax, bucket: oldBucket } = leaf;

        const minDividerSpacing = Math.pow( 2.0, -23 );
        const canSplitX = ( xMax - xMin > minDividerSpacing );
        const canSplitY = ( yMax - yMin > minDividerSpacing );
        if ( !canSplitX && !canSplitY ) {
            return;
        }

        let xMean = 0.0;
        let yMean = 0.0;
        const oneOverCount = 1.0 / oldBucket.length;
        for ( const item of oldBucket ) {
            xMean += truncInf( item.x ) * oneOverCount;
            yMean += truncInf( item.y ) * oneOverCount;
        }

        const xDivider = ( canSplitX ? truncInf( xMean ) : xMin );
        const yDivider = ( canSplitY ? truncInf( yMean ) : yMin );

        const newBuckets = [ new Array<T>( ), new Array<T>( ), new Array<T>( ), new Array<T>( ) ];
        for ( const item of oldBucket ) {
            const q = quadrant( xDivider, yDivider, item.x, item.y );
            newBuckets[ q ].push( item );
        }

        let numEmptyNewBuckets = 0;
        for ( const newBucket of newBuckets ) {
            if ( newBucket.length === 0 ) {
                numEmptyNewBuckets++;
            }
        }

        if ( numEmptyNewBuckets < 3 ) {
            const newInternal = new InternalNode<T>( xDivider, yDivider );
            newInternal.children.push( new LeafNode<T>( newBuckets[0], newInternal.children, 0, xMin, xDivider, yMin, yDivider ) );
            newInternal.children.push( new LeafNode<T>( newBuckets[1], newInternal.children, 1, xDivider, xMax, yMin, yDivider ) );
            newInternal.children.push( new LeafNode<T>( newBuckets[2], newInternal.children, 2, xMin, xDivider, yDivider, yMax ) );
            newInternal.children.push( new LeafNode<T>( newBuckets[3], newInternal.children, 3, xDivider, xMax, yDivider, yMax ) );
            this.replaceLeaf( leaf, newInternal );
        }
    }

    protected replaceLeaf( leaf: LeafNode<T>, replacement: Node<T> ): void {
        leaf.referringArray[ leaf.referringIndex ] = replacement;
    }
}

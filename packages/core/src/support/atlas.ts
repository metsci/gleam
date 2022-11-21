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
import { arraySortStable, equal, Nullable, requireDefined } from '@metsci/gleam-util';
import { Interval2D, Size2D } from './interval';

export interface Sized2D {
    readonly w: number;
    readonly h: number;
}

export class Entry<V> {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly value: Nullable<V>;

    constructor( x: number, y: number, w: number, h: number, value: Nullable<V> ) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.value = value;
    }

    get bounds( ): Interval2D {
        return Interval2D.fromRect( this.x, this.y, this.w, this.h );
    }
}

export interface Bucket<V> {
    entries( ): Iterable<Entry<V>>;
    usedSize( ): Size2D;
    plusItem( w: number, h: number, value: Nullable<V>, canGrow: boolean ): Nullable<Bucket<V>>;
}

class RootColumn<V> implements Bucket<V> {
    readonly maxDim: number;
    readonly rows: ReadonlyArray<Row<V>>;

    static create<T>( maxDim: number ): RootColumn<T> {
        return new RootColumn( maxDim, Object.freeze( [] ) );
    }

    protected constructor( maxDim: number, rows: ReadonlyArray<Row<V>> ) {
        this.maxDim = maxDim;
        this.rows = rows;
    }

    *entries( ): IterableIterator<Entry<V>> {
        for ( const row of this.rows ) {
            yield* row.entries( );
        }
    }

    usedSize( ): Size2D {
        let w = 0;
        let h = 0;
        for ( const row of this.rows ) {
            const rowSize = row.usedSize( );
            w = Math.max( w, rowSize.w );
            h += rowSize.h;
        }
        return new Size2D( w, h );
    }

    plusItem( w: number, h: number, value: Nullable<V>, canGrow: boolean ): Nullable<RootColumn<V>> {
        const resultA = this.doPlusItemA( w, h, value );
        const resultB = this.doPlusItemB( w, h, value );

        if ( resultA === null ) {
            return resultB;
        }

        if ( resultB === null ) {
            return resultA;
        }

        // Return the result whose used area is closer to square
        const sizeA = resultA.usedSize( );
        const sizeB = resultB.usedSize( );
        const ratioA = Math.min( sizeA.w, sizeA.h ) / Math.max( sizeA.w, sizeA.h );
        const ratioB = Math.min( sizeB.w, sizeB.h ) / Math.max( sizeB.w, sizeB.h );
        return ( ratioA > ratioB ? resultA : resultB );
    }

    protected doPlusItemA( w: number, h: number, value: Nullable<V> ): Nullable<RootColumn<V>> {
        let replacementRow = null;
        let replacementIndex = -1;
        for ( let i = 0; i < this.rows.length; i++ ) {
            const oldRow = this.rows[ i ];
            const newRow = oldRow.plusItem( w, h, value, false );
            if ( newRow !== null && ( replacementRow === null || newRow.usedSize( ).w < replacementRow.usedSize( ).w ) ) {
                replacementRow = newRow;
                replacementIndex = i;
            }
        }

        if ( replacementRow === null ) {
            return null;
        }
        else {
            const newRows = Array.from( this.rows );
            newRows[ replacementIndex ] = replacementRow;
            return new RootColumn( this.maxDim, Object.freeze( newRows ) );
        }
    }

    protected doPlusItemB( w: number, h: number, value: Nullable<V> ): Nullable<RootColumn<V>> {
        const x = 0;

        let y = 0;
        if ( this.rows.length > 0 ) {
            const lastRow = this.rows[ this.rows.length - 1 ];
            y = lastRow.head.y + lastRow.head.h;
        }

        if ( x + w > this.maxDim || y + h > this.maxDim ) {
            return null;
        }
        else {
            const newHead = new Entry( x, y, w, h, value );
            const newRow = Row.create( newHead, this.maxDim );
            const newRows = Array.from( this.rows );
            newRows.push( newRow );
            return new RootColumn( this.maxDim, Object.freeze( newRows ) );
        }
    }
}

class Row<V> implements Bucket<V> {
    readonly head: Entry<V>;
    readonly wMax: number;
    readonly columns: ReadonlyArray<Column<V>>;

    static create<T>( head: Entry<T>, wMax: number ): Row<T> {
        return new Row( head, wMax, Object.freeze( [] ) );
    }

    protected constructor( head: Entry<V>, wMax: number, columns: ReadonlyArray<Column<V>> ) {
        this.head = head;
        this.wMax = wMax;
        this.columns = columns;
    }

    *entries( ): IterableIterator<Entry<V>> {
        yield this.head;
        for ( const column of this.columns ) {
            yield* column.entries( );
        }
    }

    usedSize( ): Size2D {
        const h = this.head.h;

        const lastColumn = this.columns[ this.columns.length - 1 ];
        const w = ( lastColumn === undefined ? this.head.w : lastColumn.head.x + lastColumn.head.w - this.head.x );

        return new Size2D( w, h );
    }

    plusItem( w: number, h: number, value: Nullable<V>, canGrow: boolean ): Nullable<Row<V>> {
        // Try to fit item in an existing child column
        if ( h <= this.head.h ) {
            for ( let i = 0; i < this.columns.length; i++ ) {
                const oldColumn = this.columns[ i ];
                const isLastColumn = ( i === this.columns.length - 1 );
                const newColumn = oldColumn.plusItem( w, h, value, isLastColumn );
                if ( newColumn !== null ) {
                    const newColumns = Array.from( this.columns );
                    newColumns[ i ] = newColumn;
                    return new Row( this.head, this.wMax, Object.freeze( newColumns ) );
                }
            }
        }

        // Find the edge of the used space
        const lastColumn = this.columns[ this.columns.length - 1 ];
        const xLastColumnEnd = ( lastColumn === undefined ? this.head.x + this.head.w : lastColumn.head.x + lastColumn.head.w );
        const wUsed = xLastColumnEnd - this.head.x;

        // Bail out if item is too wide to fit in available space
        if ( wUsed + w > this.wMax ) {
            return null;
        }

        // Try to append a new column with item at its head
        if ( h <= this.head.h ) {
            const xNewColumn = xLastColumnEnd;
            const newHead = new Entry( xNewColumn, this.head.y, w, h, value );
            const newColumn = Column.create( newHead, this.head.h );
            const newColumns = Array.from( this.columns );
            newColumns.push( newColumn );
            return new Row( this.head, this.wMax, Object.freeze( newColumns ) );
        }

        // Try to create a new row with item at its head, and all entries re-added
        if ( canGrow ) {
            const newHead = new Entry( this.head.x, this.head.y, w, h, value );
            let newRow = Row.create( newHead, this.wMax );
            for ( const en of this.entries( ) ) {
                const tempRow = newRow.plusItem( en.w, en.h, en.value, false );
                if ( tempRow === null ) {
                    // Not all entries can fit in the new row
                    return null;
                }
                newRow = tempRow;
            }
            return newRow;
        }

        // Item doesn't fit in this row
        return null;
    }
}

class Column<V> implements Bucket<V> {
    readonly head: Entry<V>;
    readonly hMax: number;
    readonly rows: ReadonlyArray<Row<V>>;

    static create<T>( head: Entry<T>, hMax: number ): Column<T> {
        return new Column( head, hMax, Object.freeze( [] ) );
    }

    protected constructor( head: Entry<V>, hMax: number, rows: ReadonlyArray<Row<V>> ) {
        this.head = head;
        this.hMax = hMax;
        this.rows = rows;
    }

    *entries( ): IterableIterator<Entry<V>> {
        yield this.head;
        for ( const row of this.rows ) {
            yield* row.entries( );
        }
    }

    usedSize( ): Size2D {
        const w = this.head.w;

        const lastRow = this.rows[ this.rows.length - 1 ];
        const h = ( lastRow === undefined ? this.head.h : lastRow.head.y + lastRow.head.h - this.head.y );

        return new Size2D( w, h );
    }

    plusItem( w: number, h: number, value: Nullable<V>, canGrow: boolean ): Nullable<Column<V>> {
        // Try to fit item in an existing child row
        if ( w <= this.head.w ) {
            for ( let i = 0; i < this.rows.length; i++ ) {
                const oldRow = this.rows[ i ];
                const isLastRow = ( i === this.rows.length - 1 );
                const newRow = oldRow.plusItem( w, h, value, isLastRow );
                if ( newRow !== null ) {
                    const newRows = Array.from( this.rows );
                    newRows[ i ] = newRow;
                    return new Column( this.head, this.hMax, Object.freeze( newRows ) );
                }
            }
        }

        // Find the edge of the used space
        const lastRow = this.rows[ this.rows.length - 1 ];
        const yLastRowEnd = ( lastRow === undefined ? this.head.y + this.head.h : lastRow.head.y + lastRow.head.h );
        const hUsed = yLastRowEnd - this.head.y;

        // Bail out if item is too tall to fit in available space
        if ( hUsed + h > this.hMax ) {
            return null;
        }

        // Try to append a new row with item at its head
        if ( w <= this.head.w ) {
            const yNewRow = yLastRowEnd;
            const newHead = new Entry( this.head.x, yNewRow, w, h, value );
            const newRow = Row.create( newHead, this.head.w );
            const newRows = Array.from( this.rows );
            newRows.push( newRow );
            return new Column( this.head, this.hMax, Object.freeze( newRows ) );
        }

        // Try to create a new column with item at its head, and all entries re-added
        if ( canGrow ) {
            const newHead = new Entry( this.head.x, this.head.y, w, h, value );
            let newColumn = Column.create( newHead, this.hMax );
            for ( const en of this.entries( ) ) {
                const tempColumn = newColumn.plusItem( en.w, en.h, en.value, false );
                if ( tempColumn === null ) {
                    // Not all entries can fit in the new column
                    return null;
                }
                newColumn = tempColumn;
            }
            return newColumn;
        }

        // Item doesn't fit in this column
        return null;
    }
}

export interface AnchoredImage {
    /**
     * Anchor x-coord relative to the entire image, including the border.
     */
    readonly xAnchor: number,

    /**
     * Anchor y-coord relative to the entire image, including the border.
     */
    readonly yAnchor: number,

    /**
     * Number of pixels around the edges of the image that do not hold
     * meaningful values, but are there to mitigate edge effects -- e.g.
     * when interpolating a color between two pixels.
     */
    readonly border: number,

    /**
     * Image data for the entire image, including the border.
     */
    readonly imageData: ImageData,
}

export class Atlas<K> {
    readonly maxDim: number;

    protected w_PX: number;
    protected h_PX: number;
    protected bytes: Uint8ClampedArray;

    /**
     * The bucket tree doesn't allow efficient search or removal, so we
     * can't efficiently replace the existing entry. Instead we add a new
     * entry, with a larger revision number. Then we ignore any entry whose
     * rev number doesn't match the latest rev for the entry's key.
     */
    protected readonly currRevs: Map<K,number>;
    protected rootBucket: Bucket<{ key: K, rev: number}>;
    protected images: Map<K,AnchoredImage>;
    protected boxes: Map<K,Interval2D>;
    protected maxInnerAscent: number;
    protected maxInnerDescent: number;

    protected readonly addedImages: Map<K,AnchoredImage>;

    constructor( maxDim: number ) {
        this.maxDim = maxDim;

        this.w_PX = 0;
        this.h_PX = 0;
        this.bytes = new Uint8ClampedArray( 4 * this.w_PX * this.h_PX );

        this.currRevs = new Map( );
        this.rootBucket = RootColumn.create( this.maxDim );
        this.images = new Map( );
        this.boxes = new Map( );
        this.maxInnerAscent = 0;
        this.maxInnerDescent = 0;

        this.addedImages = new Map( );
    }

    get size( ): number {
        this.commit( );
        return this.images.size;
    }

    *[Symbol.iterator]( ): IterableIterator<[ key: K, image: AnchoredImage, box: Interval2D ]> {
        this.commit( );
        for ( const [ key, image ] of this.images ) {
            const box = requireDefined( this.boxes.get( key ) );
            yield [ key, image, box ];
        }
    }

    put( key: K, image: AnchoredImage ): void {
        this.addedImages.set( key, image );
    }

    putAll( images: Map<K,AnchoredImage> ): void {
        for ( const [ key, image ] of images.entries( ) ) {
            this.put( key, image );
        }
    }

    has( key: K ): boolean {
        return ( this.images.has( key ) || this.addedImages.has( key ) );
    }

    /**
     * Modifying pixel values in the returned `ImageData` is possible,
     * but not recommended. Such modifications will be applied to the
     * atlas image some time before the end of the next repack.
     *
     * Returned bounds are for the ENTIRE image, including the border.
     */
    get( key: K ): [ AnchoredImage, Interval2D ] | undefined {
        this.commit( );
        const image = this.images.get( key );
        if ( image === undefined ) {
            return undefined;
        }
        else {
            const box = requireDefined( this.boxes.get( key ) );
            return [ image, box ];
        }
    }

    getUsedArea( ): Size2D {
        this.commit( );
        return this.rootBucket.usedSize( );
    }

    getPixels( ): ImageData {
        this.commit( );

        const wSrc = this.w_PX;
        const srcBytes = this.bytes;

        const used = this.rootBucket.usedSize( );
        const wDest = used.w;
        const hDest = used.h;
        const destBytes = new Uint8ClampedArray( 4 * wDest * hDest );

        for ( let y = 0; y < hDest; y++ ) {
            const srcRow = srcBytes.subarray( 4*( y*wSrc + 0 ), 4*( y*wSrc + wDest ) );
            destBytes.set( srcRow, 4*y*wDest );
        }

        return new ImageData( destBytes, wDest, hDest );
    }

    getPixelBytes( ): Uint8ClampedArray {
        this.commit( );

        const wSrc = this.w_PX;
        const srcBytes = this.bytes;

        const used = this.rootBucket.usedSize( );
        const wDest = used.w;
        const hDest = used.h;
        const destBytes = new Uint8ClampedArray( 4 * wDest * hDest );

        for ( let y = 0; y < hDest; y++ ) {
            const srcRow = srcBytes.subarray( 4*( y*wSrc + 0 ), 4*( y*wSrc + wDest ) );
            destBytes.set( srcRow, 4*y*wDest );
        }

        return destBytes;
    }

    /**
     * Inner ascent is based on the INNER part of the image -- it
     * is computed as if the image border were removed first.
     */
    getMaxInnerAscent( ): number {
        this.commit( );
        return this.maxInnerAscent;
    }

    /**
     * Inner descent is based on the INNER part of the image -- it
     * is computed as if the image border were removed first.
     */
    getMaxInnerDescent( ): number {
        this.commit( );
        return this.maxInnerDescent;
    }

    clear( ): void {
        this.rootBucket = RootColumn.create( this.maxDim );
        this.currRevs.clear( );
        this.images.clear( );
        this.boxes.clear( );
        this.maxInnerAscent = 0;
        this.maxInnerDescent = 0;

        this.addedImages.clear( );
    }

    repack( ): void {
        // Move everything to addedImages
        for ( const [ key, image ] of this.images ) {
            if ( !this.addedImages.has( key ) ) {
                this.addedImages.set( key, image );
            }
        }

        // Start over
        this.rootBucket = RootColumn.create( this.maxDim );
        this.currRevs.clear( );
        this.images.clear( );
        this.boxes.clear( );
    }

    commit( ): void {
        if ( this.addedImages.size > 0 ) {
            // Sort added images from largest to smallest
            const addedTuples = Array.from( this.addedImages.entries( ) );
            arraySortStable( addedTuples, ( a, b ) => {
                const aImage = a[ 1 ];
                const bImage = b[ 1 ];

                const heightComparison = -1 * ( aImage.imageData.height - bImage.imageData.height );
                if ( heightComparison !== 0 ) {
                    return heightComparison;
                }

                const widthComparison = -1 * ( aImage.imageData.width - bImage.imageData.width );
                if ( widthComparison !== 0 ) {
                    return widthComparison;
                }

                return 0;
            } );

            // Place added images
            for ( const [ key, image ] of addedTuples ) {
                const rev = ( this.currRevs.get( key ) ?? -1 ) + 1;
                this.currRevs.set( key, rev );
                const tempBucket = this.rootBucket.plusItem( image.imageData.width, image.imageData.height, { key, rev }, false );
                if ( tempBucket === null ) {
                    throw new Error( 'Failed to pack image' );
                }
                this.rootBucket = tempBucket;
            }

            // Create new boxes map
            const newBoxes = new Map( ) as Map<K,Interval2D>;
            for ( const en of this.rootBucket.entries( ) ) {
                if ( en.value !== null ) {
                    const { key, rev } = en.value;
                    if ( rev === this.currRevs.get( key ) ) {
                        newBoxes.set( key, en.bounds );
                    }
                }
            }

            // Update images map
            const newImages = new Map( this.images );
            for ( const [ key, image ] of addedTuples ) {
                newImages.set( key, image );
            }

            // Grow canvas if necessary
            const minSize = this.rootBucket.usedSize( );

            let newWidth = this.w_PX;
            if ( this.w_PX < minSize.w ) {
                newWidth = Math.min( this.maxDim, Math.max( minSize.w, Math.ceil( 1.618 * this.w_PX ) ) );
            }

            let newHeight = this.h_PX;
            if ( this.h_PX < minSize.h ) {
                newHeight = Math.min( this.maxDim, Math.max( minSize.h, Math.ceil( 1.618 * this.h_PX ) ) );
            }

            if ( newWidth !== this.w_PX || newHeight !== this.h_PX ) {
                this.w_PX = newWidth;
                this.h_PX = newHeight;
                this.bytes = new Uint8ClampedArray( 4 * this.w_PX * this.h_PX );

                // Resize clears the pixels, so boxes are no longer valid
                this.boxes.clear( );
            }

            // Copy images into atlas
            for ( const [ key, newBox ] of newBoxes.entries( ) ) {
                const oldBox = this.boxes.get( key );
                const oldImage = this.images.get( key );
                const newImage = requireDefined( newImages.get( key ) );
                if ( !equal( newBox, oldBox ) || newImage !== oldImage ) {
                    const src = newImage.imageData;
                    if ( src.width !== newBox.w || src.height !== newBox.h ) {
                        throw new Error( );
                    }

                    const wSrc = src.width;
                    const hSrc = src.height;
                    const srcBytes = src.data;

                    const wDest = this.w_PX;
                    const xDest0 = newBox.x.min;
                    const yDest0 = newBox.y.min;
                    const iDest0 = 4*( yDest0*wDest + xDest0 );
                    const destBytes = this.bytes;

                    for ( let ySrc = 0; ySrc < hSrc; ySrc++ ) {
                        const srcRow = srcBytes.subarray( 4*( ySrc+0 )*wSrc, 4*( ySrc+1 )*wSrc );
                        destBytes.set( srcRow, iDest0 + 4*ySrc*wDest );
                    }
                }
            }

            // Update max ascent
            for ( const [ _, image ] of addedTuples ) {
                const innerAscent = image.yAnchor - image.border;
                this.maxInnerAscent = Math.max( this.maxInnerAscent, innerAscent );
            }

            // Update max descent
            for ( const [ _, image ] of addedTuples ) {
                const innerDescent = image.imageData.height - image.border - image.yAnchor;
                this.maxInnerDescent = Math.max( this.maxInnerDescent, innerDescent );
            }

            // Wrap up
            this.boxes = newBoxes;
            this.images = newImages;
            this.addedImages.clear( );
        }
    }
}

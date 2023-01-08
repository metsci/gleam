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
import { equal, Interval2D, isDefined, mapSetIfAbsent, requireDefined, requireNonNull, run } from '@metsci/gleam-util';
import { AnchoredImage, Atlas } from './atlas';
import { BLACK, parseColor, WHITE } from './color';
import { put4f, xPixelToNdc, yUpwardPixelToNdc } from './misc';
import { ValueBase } from './valueBase';

export const DEFAULT_CHARS = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789!@#$%^&*()`~-_=+[]{}\\|;:\'",.<>/? \t°±©¹²³–×—≤≥';

export const DEFAULT_MISSING_CHAR_FALLBACK = '?';

interface TextAtlasCacheEntry {
    dpr: number | undefined;
    atlas: Atlas<string>;
    lastAccessFrameNum: number | undefined;
}

export class TextAtlasCache {
    protected readonly alphabet: Iterable<string>;
    protected readonly alphabetForMetrics: Iterable<string>;
    protected readonly maxDim: number;
    protected readonly entriesByFont: Map<string,TextAtlasCacheEntry>;

    constructor( options?: {
        alphabet?: Iterable<string>,
        alphabetForMetrics?: Iterable<string>,
        maxDim?: number }
    ) {
        this.alphabet = options?.alphabet ?? DEFAULT_CHARS;
        this.alphabetForMetrics = options?.alphabetForMetrics ?? this.alphabet;
        this.maxDim = options?.maxDim ?? 4096;
        this.entriesByFont = new Map( );
    }

    /**
     * Returned values are good for the duration of the current frame. Don't
     * use them beyond that. If you need them again on a future frame, call
     * this method again.
     *
     * This method is designed to be called at least some of the time with a
     * valid `currFrameNum`, e.g. from `Context.frameNum`. If it is only ever
     * called with a `currFrameNum` of `undefined`, unused cache entries will
     * never be pruned. If it is called with `currFrameNum` values that aren't
     * real frame nums, its pruning behavior is undefined.
     */
    get( font: string, dpr: number, currFrameNum: number | undefined ): Atlas<string> {
        const en = mapSetIfAbsent( this.entriesByFont, font, ( ) => ( {
            dpr: undefined,
            atlas: new Atlas<string>( this.maxDim ),
            lastAccessFrameNum: undefined,
        } ) );
        if ( dpr !== en.dpr ) {
            en.dpr = dpr;
            en.atlas.clear( );
            en.atlas.putAll( createTextImages( dpr, font, this.alphabetForMetrics, 1, this.alphabet ) );
        }
        if ( isDefined( currFrameNum ) ) {
            en.lastAccessFrameNum = currFrameNum;

            // The logic here handles situations where, on each frame, one or more painters
            // access an entry to compute their pref sizes (outside their paint methods, so
            // frameNum is undefined), and then access the same atlas again during painting
            for ( const [ font, en ] of this.entriesByFont ) {
                if ( en.lastAccessFrameNum === undefined ) {
                    en.lastAccessFrameNum = currFrameNum;
                }
                else if ( en.lastAccessFrameNum < currFrameNum - 1 ) {
                    this.entriesByFont.delete( font );
                }
            }
        }
        return en.atlas;
    }
}

export function createTextAtlas( dpr: number, font: string, maxDim: number, chars: string = DEFAULT_CHARS ): Atlas<string> {
    const atlas = new Atlas( maxDim ) as Atlas<string>;
    const images = createTextImages( dpr, font, chars, 1, chars );
    atlas.putAll( images );
    return atlas;
}

export function getGlyphCount( atlas: Atlas<string>, text: string, missingCharFallback: string = DEFAULT_MISSING_CHAR_FALLBACK ): number {
    const fallback = requireDefined( atlas.get( missingCharFallback ) );

    let count = 0;
    for ( const c of text ) {
        const [ , box ] = ( atlas.get( c ) ?? fallback );
        if ( box !== undefined ) {
            count++;
        }
    }
    return count;
}

export function getTextWidth( atlas: Atlas<string>, text: string, missingCharFallback: string = DEFAULT_MISSING_CHAR_FALLBACK ): number {
    const fallback = requireDefined( atlas.get( missingCharFallback ) );

    let w_PX = 0;
    for ( const c of text ) {
        const [ image ] = ( atlas.get( c ) ?? fallback );
        w_PX += image.imageData.width - 2*image.border;
    }
    return w_PX;
}

export function putTextCoords( atlas: Atlas<string>, coords: Float32Array, i: number, viewport_PX: Interval2D, x_PX: number, y_PX: number, angle_MATHRAD: number, text: string, missingCharFallback: string = DEFAULT_MISSING_CHAR_FALLBACK ): number {
    const fallback = requireDefined( atlas.get( missingCharFallback ) );

    const y_UPX = viewport_PX.h - y_PX;

    const wTexel_FRAC = 1 / atlas.getUsedArea( ).w;
    const hTexel_FRAC = 1 / atlas.getUsedArea( ).h;

    const sinAdvance = Math.sin( angle_MATHRAD );
    const cosAdvance = Math.cos( angle_MATHRAD );
    const sinAscent = cosAdvance;
    const cosAscent = -sinAdvance;

    let cumuAdvance_PX = 0;

    for ( const c of text ) {
        const [ image, box ] = ( atlas.get( c ) ?? fallback );

        const advance_PX = image.imageData.width - 2*image.border;
        const ascent_PX = image.yAnchor - image.border;
        const descent_PX = image.imageData.height - image.border - image.yAnchor;

        const xBaseLeft_PX = x_PX + cosAdvance*cumuAdvance_PX;
        const yBaseLeft_UPX = y_UPX + sinAdvance*cumuAdvance_PX;

        const xTopLeft_PX = xBaseLeft_PX + cosAscent*ascent_PX;
        const yTopLeft_UPX = yBaseLeft_UPX + sinAscent*ascent_PX;
        const xBottomLeft_PX = xBaseLeft_PX - cosAscent*descent_PX;
        const yBottomLeft_UPX = yBaseLeft_UPX - sinAscent*descent_PX;

        const xTopRight_PX = xTopLeft_PX + cosAdvance*advance_PX;
        const yTopRight_UPX = yTopLeft_UPX + sinAdvance*advance_PX;
        const xBottomRight_PX = xBottomLeft_PX + cosAdvance*advance_PX;
        const yBottomRight_UPX = yBottomLeft_UPX + sinAdvance*advance_PX;

        const xTopLeft = xPixelToNdc( viewport_PX.x, xTopLeft_PX );
        const yTopLeft = yUpwardPixelToNdc( viewport_PX.y, yTopLeft_UPX );
        const xBottomLeft = xPixelToNdc( viewport_PX.x, xBottomLeft_PX );
        const yBottomLeft = yUpwardPixelToNdc( viewport_PX.y, yBottomLeft_UPX );

        const xTopRight = xPixelToNdc( viewport_PX.x, xTopRight_PX );
        const yTopRight = yUpwardPixelToNdc( viewport_PX.y, yTopRight_UPX );
        const xBottomRight = xPixelToNdc( viewport_PX.x, xBottomRight_PX );
        const yBottomRight = yUpwardPixelToNdc( viewport_PX.y, yBottomRight_UPX );

        const sLeft = ( box.xMin + image.border )*wTexel_FRAC;
        const sRight = ( box.xMax - image.border )*wTexel_FRAC;
        const tTop = ( box.yMin + image.border )*hTexel_FRAC;
        const tBottom = ( box.yMax - image.border )*hTexel_FRAC;

        i = put4f( coords, i, xTopLeft,    yTopLeft,    sLeft,  tTop    );
        i = put4f( coords, i, xBottomLeft, yBottomLeft, sLeft,  tBottom );
        i = put4f( coords, i, xTopRight,   yTopRight,   sRight, tTop    );

        i = put4f( coords, i, xTopRight,    yTopRight,    sRight, tTop    );
        i = put4f( coords, i, xBottomLeft,  yBottomLeft,  sLeft,  tBottom );
        i = put4f( coords, i, xBottomRight, yBottomRight, sRight, tBottom );

        cumuAdvance_PX += advance_PX;
    }

    return i;
}

/**
 * Returned images are grayscale and fully opaque, with black
 * foreground and white background. In some browsers the quality
 * of canvas text rendering varies based on the colors used --
 * e.g. in Edge, white-on-black canvas text looks particularly
 * awful, but black-on-white canvas text looks nice.
 *
 * Alpha can be inferred from the grayscale value (e.g. in a frag
 * shader). This avoids introducing rounding error when converting
 * colors from the Canvas's buffer (which most browsers store with
 * premultiplied alpha) to ImageData (which is required to have
 * non-premultiplied alpha).
 *
 * Returned images will have a transparent border of specified
 * thickness, to avoid interp problems at texture edges.
 */
export function createTextImages( dpr: number, font: string, alphabetForMetrics: Iterable<string>, border: number, strings: Iterable<string> ): Map<string,AnchoredImage> {
    const metrics = estimateFontMetrics( dpr, font, alphabetForMetrics );
    const images = new Map( ) as Map<string,AnchoredImage>;
    for ( const s of strings ) {
        images.set( s, createTextImage( dpr, font, metrics, border, 'black', 'white', s ) );
    }
    return images;
}

// For use in createTextImage()
const canvas = document.createElement( 'canvas' );
canvas.width = 1;
canvas.height = 1;
const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );

export class FontMetrics extends ValueBase {
    readonly ascent_PX: number;
    readonly descent_PX: number;

    constructor( args: {
        readonly ascent_PX: number,
        readonly descent_PX: number,
    } ) {
        super( args.ascent_PX, args.descent_PX );
        this.ascent_PX = args.ascent_PX;
        this.descent_PX = args.descent_PX;
    }
}

export function estimateFontMetrics( dpr: number, font: string, alphabetForMetrics: Iterable<string> ): FontMetrics {
    // Make sure the canvas is large enough
    g.font = font;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    const emWidth_PX = Math.ceil( dpr * g.measureText( 'M' ).width );
    const wGuess_PX = 2 * emWidth_PX;
    const hGuess_PX = 3 * emWidth_PX;
    const padding_PX = Math.ceil( dpr );
    const wScratch_PX = wGuess_PX + 2*padding_PX;
    const hScratch_PX = hGuess_PX + 2*padding_PX;
    canvas.width = Math.max( canvas.width, wScratch_PX );
    canvas.height = Math.max( canvas.height, hScratch_PX );

    // Context forgets its settings when canvas size changes
    g.font = font;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';

    // Pick a baseline about 2/3 of the way down
    const yBaseline_PX = Math.round( 0.667 * hGuess_PX ) + padding_PX;

    g.fillStyle = 'white';
    g.fillRect( 0, 0, canvas.width, canvas.height );
    const bgBytes = g.getImageData( 0, 0, 1, 1 ).data;

    g.save( );
    g.translate( padding_PX, yBaseline_PX );
    g.scale( dpr, dpr );
    try {
        g.fillStyle = 'black';
        for ( const ch of alphabetForMetrics ) {
            g.fillText( ch, 0, 0 );
        }
    }
    finally {
        g.restore( );
    }

    const imageData = g.getImageData( 0, 0, wScratch_PX, hScratch_PX );
    const { contentTop_PX, contentBottom_PX } = findContentTopAndBottom_PX( imageData, bgBytes, 0 );
    if ( contentTop_PX < contentBottom_PX ) {
        return new FontMetrics( {
            ascent_PX: yBaseline_PX - contentTop_PX,
            descent_PX: contentBottom_PX - yBaseline_PX,
        } );
    }
    else {
        return new FontMetrics( {
            ascent_PX: 0,
            descent_PX: 0,
        } );
    }
}

/**
 * Returned value's `imageData` will be non-null as long as the
 * rasterized string has at least one non-transparent pixel. That
 * will generally be the case when the specified string contains
 * at least one non-whitespace character ... but in theory there
 * could be strange fonts out there for which non-whitespace chars
 * look like whitespace.
 */
export function createTextImage( dpr: number, font: string, metrics: FontMetrics, border_PX: number, fgColor: string, bgColor: string, s: string ): AnchoredImage {
    border_PX = Math.ceil( border_PX );

    // Avoid chopping off edges
    const leftPadding_PX = Math.ceil( 2*dpr );
    const rightPadding_PX = Math.ceil( 2*dpr );

    // Make sure the canvas is large enough
    g.font = font;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    const wEstimate_PX = Math.ceil( dpr * g.measureText( s ).width );
    const hEstimate_PX = Math.ceil( metrics.ascent_PX + metrics.descent_PX );
    const wScratch_PX = border_PX + leftPadding_PX + wEstimate_PX + rightPadding_PX + border_PX;
    const hScratch_PX = border_PX + hEstimate_PX + border_PX;
    canvas.width = Math.max( canvas.width, wScratch_PX );
    canvas.height = Math.max( canvas.height, hScratch_PX );

    // Context forgets its settings when canvas size changes
    g.font = font;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    const yBaseline_PX = border_PX + metrics.ascent_PX;

    // Render black text on white bg to find content bounds
    //
    // Doing a separate render with known black foreground and white
    // background allows the bounds-finding logic to distinguish not
    // just between background and foreground pixels, but also between
    // light-foreground and heavy-foreground pixels. Columns with only
    // light-foreground pixels are included in spacing logic.
    //
    const { contentLeft_PX, contentRight_PX } = run( ( ) => {
        g.fillStyle = 'white';
        g.fillRect( 0, 0, canvas.width, canvas.height );

        g.save( );
        g.translate( border_PX + leftPadding_PX, yBaseline_PX );
        g.scale( dpr, dpr );
        try {
            g.fillStyle = 'black';
            g.fillText( s, 0, 0 );
        }
        finally {
            g.restore( );
        }

        const bwData = g.getImageData( 0, 0, wScratch_PX, hScratch_PX );
        return findContentLeftAndRight_PX( bwData, border_PX, Math.ceil( 0.5*dpr ) );
    } );

    // Re-render in specified colors
    if ( !equal( parseColor( fgColor ), BLACK ) || !equal( parseColor( bgColor ), WHITE ) ) {
        g.clearRect( 0, 0, canvas.width, canvas.height );

        g.fillStyle = bgColor;
        g.fillRect( 0, 0, canvas.width, canvas.height );

        g.save( );
        g.translate( border_PX + leftPadding_PX, yBaseline_PX );
        g.scale( dpr, dpr );
        try {
            g.fillStyle = fgColor;
            g.fillText( s, 0, 0 );
        }
        finally {
            g.restore( );
        }
    }

    const whitespace = ( contentLeft_PX > contentRight_PX );
    const top_PX = 0;
    const left_PX = ( whitespace ? 0 : contentLeft_PX - border_PX );
    const width_PX = ( whitespace ? wEstimate_PX + 2*border_PX : ( contentRight_PX + border_PX ) - ( contentLeft_PX - border_PX ) );
    const height_PX = hScratch_PX;

    return {
        xAnchor: border_PX,
        yAnchor: yBaseline_PX,
        border: border_PX,
        imageData: g.getImageData( left_PX, top_PX, width_PX, height_PX ),
    };
}

function isRowAllBackground( bgBytes: Uint8ClampedArray, rowBytes: Uint8ClampedArray ): boolean {
    for ( let i = 0; i < rowBytes.length; i++ ) {
        if ( rowBytes[ i ] !== bgBytes[ i % bgBytes.length ] ) {
            return false;
        }
    }
    return true;
}

function findContentTopAndBottom_PX( imageData: ImageData, bgBytes: Uint8ClampedArray, border: number ): { contentTop_PX: number, contentBottom_PX: number } {
    const imageBytes = imageData.data;
    const numBytesPerPixel = bgBytes.length;
    const numBytesPerRow = numBytesPerPixel * imageData.width;
    const numBytesPerBorder = numBytesPerPixel * border;

    // Find the top row that isn't all background
    const contentTop_PX = run( ( ) => {
        for ( let y = border; y < imageData.height - border; y++ ) {
            const rowBytes = imageBytes.subarray( ( y )*numBytesPerRow + numBytesPerBorder, ( y + 1 )*numBytesPerRow - numBytesPerBorder );
            if ( !isRowAllBackground( bgBytes, rowBytes ) ) {
                return y;
            }
        }
        return imageData.height;
    } );

    // Find the bottom row that isn't all background
    const contentBottom_PX = run( ( ) => {
        for ( let y = imageData.height - 1 - border; y >= contentTop_PX; y-- ) {
            const rowBytes = imageBytes.subarray( ( y )*numBytesPerRow + numBytesPerBorder, ( y + 1 )*numBytesPerRow - numBytesPerBorder );
            if ( !isRowAllBackground( bgBytes, rowBytes ) ) {
                return ( y + 1 );
            }
        }
        return contentTop_PX;
    } );

    return { contentTop_PX, contentBottom_PX };
}

function findContentLeftAndRight_PX( bwData: ImageData, border_PX: number, desiredPadding_PX: number ): { contentLeft_PX: number, contentRight_PX: number } {
    const bwBytes = bwData.data;
    const numBytesPerPixel = 4;
    const numBytesPerRow = numBytesPerPixel * bwData.width;

    let outerLeft_PX = bwData.width;
    let innerLeft_PX = bwData.width;
    leftLoop: {
        for ( let x = 0; x < bwData.width; x++ ) {
            for ( let y = border_PX; y < bwData.height - border_PX; y++ ) {
                const green = bwBytes[ y*numBytesPerRow + x*numBytesPerPixel + 1 ];
                if ( green < 255 ) {
                    outerLeft_PX = Math.min( outerLeft_PX, x );
                    if ( green < 204 ) {
                        innerLeft_PX = x;
                        break leftLoop;
                    }
                }
            }
        }
    }

    let outerRight_PX = 0;
    let innerRight_PX = 0;
    rightLoop: {
        for ( let x = bwData.width - 1; x >= 0; x-- ) {
            for ( let y = border_PX; y < bwData.height - border_PX; y++ ) {
                const green = bwBytes[ y*numBytesPerRow + x*numBytesPerPixel + 1 ];
                if ( green < 255 ) {
                    outerRight_PX = Math.max( outerRight_PX, x+1 );
                    if ( green < 204 ) {
                        innerRight_PX = x+1;
                        break rightLoop;
                    }
                }
            }
        }
    }

    return {
        contentLeft_PX: Math.min( outerLeft_PX, innerLeft_PX - desiredPadding_PX ),
        contentRight_PX: Math.max( outerRight_PX, innerRight_PX + desiredPadding_PX ),
    };
}

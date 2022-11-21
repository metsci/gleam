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
import { clamp, requireNonNull } from '@metsci/gleam-util';
import { ValueBase2 } from './valueBase';

export class Color extends ValueBase2 {
    constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number,
        readonly a: number,
    ) {
        super( );
    }

    withUpdatedAlpha( updateAlpha: ( a: number ) => number ): Color {
        return new Color( this.a, this.g, this.b, updateAlpha( this.a ) );
    }

    get cssString( ) : string {
        if ( this.a >= 1 ) {
            return `rgb( ${fracToByte( this.r )},${fracToByte( this.g )},${fracToByte( this.b )} )`;
        }
        else {
            // CSS uses rgb on [0,255] but alpha on [0,1]
            return `rgba( ${fracToByte( this.r )},${fracToByte( this.g )},${fracToByte( this.b )}, ${this.a} )`;
        }
    }

    get rgbaString( ) : string {
        return '' + fracToByte( this.r ) + ',' + fracToByte( this.g ) + ',' + fracToByte( this.b ) + ',' + fracToByte( this.a );
    }
}

export class MutableColor {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor( color: Color ) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }

    set( color: Color ): void {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }

    get( ): Color {
        return new Color( this.r, this.g, this.b, this.a );
    }
}

function fracToByte( frac: number ): number {
    return Math.round( 255 * clamp( 0, 1, frac ) );
}

export const TRANSPARENT = rgba( 1, 1, 1, 0 );

export const BLACK = rgb( 0, 0, 0 );
export const WHITE = rgb( 1, 1, 1 );
export const GRAY = rgb( 0.5, 0.5, 0.5 );

export const RED   = rgb( 1, 0, 0 );
export const GREEN = rgb( 0, 1, 0 );
export const BLUE  = rgb( 0, 0, 1 );

export const CYAN    = rgb( 0, 1, 1 );
export const MAGENTA = rgb( 1, 0, 1 );
export const YELLOW  = rgb( 1, 1, 0 );
export const PERIWINKLE  = rgb( 0.561, 0.561, 0.961 );

export function rgba( r: number, g: number, b: number, a: number ): Color {
    return new Color( r, g, b, a );
}

export function rgb( r: number, g: number, b: number ): Color {
    return new Color( r, g, b, 1 );
}

/**
 * Parses a Color object from a CSS color string. The string must
 * be a valid CSS color -- otherwise behavior is not defined.
 *
 * Named colors may have different values in different browsers.
 */
const cacheParseColor = new Map( ) as Map<string,Color>;
export function parseColor( s: string ): Color {
    const cached = cacheParseColor.get( s );
    if ( cached !== undefined ) {
        return cached;
    }
    else {
        const result = doParseColor( s );
        cacheParseColor.set( s, result );
        return result;
    }
}

const canvasParseColor = document.createElement( 'canvas' );
canvasParseColor.width = 1;
canvasParseColor.height = 1;
const gParseColor = requireNonNull( canvasParseColor.getContext( '2d', { willReadFrequently: true } ) );
function doParseColor( s: string ): Color {
    gParseColor.clearRect( 0, 0, 1, 1 );
    gParseColor.fillStyle = s;
    gParseColor.fillRect( 0, 0, 1, 1 );
    const rgbaData = gParseColor.getImageData( 0, 0, 1, 1 ).data;

    const R = rgbaData[ 0 ] / 255;
    const G = rgbaData[ 1 ] / 255;
    const B = rgbaData[ 2 ] / 255;
    const A = rgbaData[ 3 ] / 255;
    return rgba( R, G, B, A );
}

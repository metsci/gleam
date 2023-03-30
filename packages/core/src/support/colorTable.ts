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
import { ImmutableList, newImmutableList } from '@metsci/gleam-util';
import { Color, MutableColor, WHITE } from './color';
import { GL, put3ub, put4ub, putRgb, putRgba } from './misc';

export interface ColorMapFn {
    ( value: number, result: MutableColor ): void;
}

export interface ColorTableFormat {
    numChannels: number,
    glType: number,
    glFormat: number,
}
export const RGB8UI = Object.freeze( { glFormat: GL.RGB, numChannels: 3, glType: GL.UNSIGNED_BYTE } );
export const RGB32F = Object.freeze( { glFormat: GL.RGB, numChannels: 3, glType: GL.FLOAT } );
export const RGBA8UI = Object.freeze( { glFormat: GL.RGBA, numChannels: 4, glType: GL.UNSIGNED_BYTE } );
export const RGBA32F = Object.freeze( { glFormat: GL.RGBA, numChannels: 4, glType: GL.FLOAT } );

export class ColorTablePopulator {
    protected readonly format: ColorTableFormat;
    protected readonly interp: number;
    protected readonly colors: Uint8Array | Float32Array;
    protected readonly mutators: ImmutableList<ColorTableMutator>;

    constructor( format: ColorTableFormat, interp: number, colors: Uint8Array | Float32Array, mutators: Iterable<ColorTableMutator> = [] ) {
        this.format = format;
        this.interp = interp;
        this.colors = colors;
        this.mutators = newImmutableList( mutators );
    }

    withMutator( mutator: ColorTableMutator ): ColorTablePopulator {
        return new ColorTablePopulator( this.format, this.interp, this.colors, this.mutators.push( mutator ) );
    }

    populate( gl: WebGLRenderingContext, target: number ): void {
        const { numChannels, glType, glFormat } = this.format;

        let colors;
        if ( this.mutators.size === 0 ) {
            colors = this.colors;
        }
        else {
            colors = this.colors.slice( );
            for ( const mutator of this.mutators ) {
                mutator.mutateInPlace( this.format, colors );
            }
        }

        // Strictly speaking WebGL doesn't guarantee support for FLOAT textures (OES_texture_float)
        // or LINEAR interp of FLOAT textures (OES_texture_float_linear), but they are supported in
        // all major browsers
        if ( !( gl instanceof WebGL2RenderingContext || gl.getExtension( 'OES_texture_float' ) ) ) {
            throw new Error( );
        }
        if ( this.interp === GL.LINEAR && !( gl instanceof WebGL2RenderingContext || gl.getExtension( 'OES_texture_float_linear' ) ) ) {
            throw new Error( );
        }

        const numColors = Math.floor( colors.length / numChannels );
        gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, this.interp );
        gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, this.interp );
        gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
        gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
        gl.texImage2D( target, 0, glFormat, numColors, 1, 0, glFormat, glType, colors );
    }
}

export function newColorTableEntry<S extends string>( key: S, format: ColorTableFormat, interp: number, colors: Uint8Array | Float32Array ): Readonly<[S,ColorTablePopulator]>;
export function newColorTableEntry( key: string, format: ColorTableFormat, interp: number, colors: Uint8Array | Float32Array ): Readonly<[string,ColorTablePopulator]>;
export function newColorTableEntry( key: string, format: ColorTableFormat, interp: number, colors: Uint8Array | Float32Array ): Readonly<[string,ColorTablePopulator]> {
    return Object.freeze( [ key, new ColorTablePopulator( format, interp, colors ) ] as const );
}

export interface ColorTableMutator {
    mutateInPlace( format: ColorTableFormat, colors: Uint8Array | Float32Array ): void;
}

class ColorTableInverter implements ColorTableMutator {
    mutateInPlace( format: ColorTableFormat, colors: Uint8Array | Float32Array ): void {
        if ( colors.length >= format.numChannels ) {
            const tmp = colors.slice( 0, format.numChannels );
            const nj = tmp.length;
            const ni = ( colors.length / nj ) | 0;
            for ( let i = 0; i < ni >> 1; i++ ) {
                const a = nj*( ni - 1 - i );
                const b = nj*i;
                for ( let j = 0; j < nj; j++ ) {
                    tmp[ j ] = colors[ a + j ];
                    colors[ a + j ] = colors[ b + j ];
                    colors[ b + j ] = tmp[ j ];
                }
            }
        }
    }
}
export const COLOR_TABLE_INVERTER = new ColorTableInverter( );

export function solidColorTablePopulator( color: Color ): ColorTablePopulator {
    return new ColorTablePopulator( RGBA8UI, GL.NEAREST, createSolidColorTable_RGBA8UI( color ) );
}

export function createSolidColorTable_RGBA8UI( color: Color ): Uint8Array {
    const table = new Uint8Array( 4 );
    put4ub( table, 0, 255*color.r, 255*color.g, 255*color.b, 255*color.a );
    return table;
}

export function createSolidColorTable_RGBA32F( color: Color ): Float32Array {
    const table = new Float32Array( 4 );
    putRgba( table, 0, color );
    return table;
}

export function withAlphaGradient_RGBA8UI( rgb: Uint8Array, alphaGradient: ( frac: number ) => number ): Uint8Array {
    const numColors = ( rgb.length / 3 ) | 0;
    const rgba = new Uint8Array( 4*numColors );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        rgba[ 4*i + 0 ] = rgb[ 3*i + 0 ];
        rgba[ 4*i + 1 ] = rgb[ 3*i + 1 ];
        rgba[ 4*i + 2 ] = rgb[ 3*i + 2 ];
        rgba[ 4*i + 3 ] = 255 * alphaGradient( frac );
    }
    return rgba;
}

export function withAlphaGradient_RGBA32F( rgb: Float32Array, alphaGradient: ( frac: number ) => number ): Float32Array {
    const numColors = ( rgb.length / 3 ) | 0;
    const rgba = new Float32Array( 4*numColors );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        rgba[ 4*i + 0 ] = rgb[ 3*i + 0 ];
        rgba[ 4*i + 1 ] = rgb[ 3*i + 1 ];
        rgba[ 4*i + 2 ] = rgb[ 3*i + 2 ];
        rgba[ 4*i + 3 ] = alphaGradient( frac );
    }
    return rgba;
}

export function withConstantAlpha_RGBA8UI( rgb: Uint8Array, alpha: number ): Uint8Array {
    return withAlphaGradient_RGBA8UI( rgb, ( ) => alpha );
}

export function withConstantAlpha_RGBA32F( rgb: Float32Array, alpha: number ): Float32Array {
    return withAlphaGradient_RGBA32F( rgb, ( ) => alpha );
}

/**
 * Discards the gradient's alpha values.
 */
export function createColorTable_RGB8UI( numColors: number, gradient: ColorMapFn ): Uint8Array {
    const table = new Uint8Array( 3 * numColors );
    const color = new MutableColor( WHITE );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        gradient( frac, color );
        put3ub( table, 3*i, 255*color.r, 255*color.g, 255*color.b );
    }
    return table;
}

/**
 * Discards the gradient's alpha values.
 */
export function createColorTable_RGB32F( numColors: number, gradient: ColorMapFn ): Float32Array {
    const table = new Float32Array( 3 * numColors );
    const color = new MutableColor( WHITE );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        gradient( frac, color );
        putRgb( table, 3*i, color );
    }
    return table;
}

export function createColorTable_RGBA8UI( numColors: number, gradient: ColorMapFn ): Uint8Array {
    const table = new Uint8Array( 4 * numColors );
    const color = new MutableColor( WHITE );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        gradient( frac, color );
        put4ub( table, 4*i, 255*color.r, 255*color.g, 255*color.b, 255*color.a );
    }
    return table;
}

export function createColorTable_RGBA32F( numColors: number, gradient: ColorMapFn ): Float32Array {
    const table = new Float32Array( 4 * numColors );
    const color = new MutableColor( WHITE );
    for ( let i = 0; i < numColors; i++ ) {
        const frac = i / ( numColors - 1 );
        gradient( frac, color );
        putRgba( table, 4*i, color );
    }
    return table;
}

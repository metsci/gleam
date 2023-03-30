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
import { clamp } from '@metsci/gleam-util';
import { Float32Scratch } from '../../support';
import { TileRect } from './util';

export interface Surface {
    readonly rTotal: number;
    readonly cTotal: number;

    /**
     * Returns the data values for the specified tile, in row-major
     * order, with a 1-texel border all the way around. The border
     * won't be visible, but it may affect sampler lookup values near
     * tile edges, if interp is enabled.
     *
     * Impls may return a temporary Float32Array from the provided
     * scratch.
     */
    getTileValues( tileRect: TileRect, scratch: Float32Scratch ): Float32Array;
}

export class EmptySurface implements Surface {
    readonly rTotal = 0;
    readonly cTotal = 0;
    readonly tileValues = new Float32Array( 0 );

    getTileValues( ): Float32Array {
        return this.tileValues;
    }
}

export class Float32ArraySurface implements Surface {
    readonly rTotal: number;
    readonly cTotal: number;
    readonly values: Float32Array;

    constructor( w: number, h: number, values: Float32Array ) {
        requireCount( values.length, [ w, h ] );
        this.rTotal = h;
        this.cTotal = w;
        this.values = values;
    }

    getTileValues( tileRect: TileRect, scratch: Float32Scratch ): Float32Array {
        const { rTotal, cTotal } = this;

        const rFirst = tileRect.rDim.first;
        const cFirst = tileRect.cDim.first;
        const rCount = tileRect.rDim.count;
        const cCount = tileRect.cDim.count;

        const iSize = 1 + cCount + 1;
        const jSize = 1 + rCount + 1;
        const result = scratch.getTempSpace( iSize * jSize );

        for ( let j = 0; j < jSize; j++ ) {
            const r = clamp( 0, rTotal - 1, rFirst + j - 1 );

            const resultIndexFirst = j*iSize + 0;
            const resultRow = result.subarray( resultIndexFirst, resultIndexFirst + iSize );

            // Left border value is the value just left of valuesRow (or, if
            // there isn't a value left of valuesRow, repeat its first value)
            const cLeftBorder = Math.max( 0, cFirst - 1 );
            resultRow[ 0 ] = this.values[ r*cTotal + cLeftBorder ];

            // Row content
            const valuesIndexFirst = r*cTotal + cFirst;
            const valuesRow = this.values.subarray( valuesIndexFirst, valuesIndexFirst + cCount );
            resultRow.set( valuesRow, 1 );

            // Right border value is the value just right of valuesRow (or, if
            // there isn't a value right of valuesRow, repeat its last value)
            const cRightBorder = Math.min( cTotal - 1, cFirst + cCount );
            resultRow[ iSize - 1 ] = this.values[ r*cTotal + cRightBorder ];
        }

        return result;
    }
}

function requireCount( actualCount: number, requiredDims: [number] | [number,number] | [number,number,number] ): void {
    const requiredCount = requiredDims.reduce( ( a, b ) => a*b, 1 );
    if ( actualCount !== requiredCount ) {
        throw new Error( `Count doesn't match required dimensions: required = ${requiredCount} (${requiredDims.map( d => d.toFixed(0) ).join( 'x' )}), actual = ${actualCount}` );
    }
}

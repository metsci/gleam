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
import { arrayClone, Arrayish, requireEqual } from '@metsci/gleam-util';
import { Float32Scratch, put4f } from '../../support';
import { TileRect } from './util';

export interface Mesh {
    getTileCoords( tileRect: TileRect, scratch: Float32Scratch ): Float32Array;
}

export class EmptyMesh implements Mesh {
    protected readonly tileCoords = new Float32Array( 0 );

    getTileCoords( ): Float32Array {
        return this.tileCoords;
    }
}

export type Vec2 = [number,number];

function vec2Copy( v: Readonly<Vec2> ): Vec2 {
    return [ v[0], v[1] ];
}

function vec2MulAdd( v: Readonly<Vec2>, ...entries: ReadonlyArray<Readonly<[number,Readonly<Vec2>]>> ): Vec2 {
    const result = vec2Copy( v );
    for ( const [ scale, w ] of entries ) {
        result[0] += scale * w[0];
        result[1] += scale * w[1];
    }
    return result;
}

export class LinearMesh implements Mesh {
    readonly origin: Readonly<Vec2>;
    readonly sSide: Readonly<Vec2>;
    readonly tSide: Readonly<Vec2>;

    /**
     * Sides don't have to be orthogonal.
     */
    constructor( origin: Readonly<Vec2>, sSide: Readonly<Vec2>, tSide: Readonly<Vec2> ) {
        this.origin = vec2Copy( origin );
        this.sSide = vec2Copy( sSide );
        this.tSide = vec2Copy( tSide );
    }

    getTileCoords( tileRect: TileRect, scratch: Float32Scratch ): Float32Array {
        const sFrac0 = ( tileRect.cDim.first + 0 ) / tileRect.cDim.total;
        const tFrac0 = ( tileRect.rDim.first + 0 ) / tileRect.rDim.total;
        const sFrac1 = ( tileRect.cDim.first + tileRect.cDim.count ) / tileRect.cDim.total;
        const tFrac1 = ( tileRect.rDim.first + tileRect.rDim.count ) / tileRect.rDim.total;

        const xy00 = vec2MulAdd( this.origin, [ tFrac0, this.tSide ], [ sFrac0, this.sSide ] );
        const xy01 = vec2MulAdd( this.origin, [ tFrac0, this.tSide ], [ sFrac1, this.sSide ] );
        const xy10 = vec2MulAdd( this.origin, [ tFrac1, this.tSide ], [ sFrac0, this.sSide ] );
        const xy11 = vec2MulAdd( this.origin, [ tFrac1, this.tSide ], [ sFrac1, this.sSide ] );

        const sStep = 1.0 / ( tileRect.cDim.count + 2 );
        const s0 = 0.0 + sStep;
        const s1 = 1.0 - sStep;

        const tStep = 1.0 / ( tileRect.rDim.count + 2 );
        const t0 = 0.0 + tStep;
        const t1 = 1.0 - tStep;

        const xyst = scratch.getTempSpace( 6 * 4 );
        xyst.set( [
            xy01[0], xy01[1], s0, t1,
            xy00[0], xy00[1], s0, t0,
            xy11[0], xy11[1], s1, t1,
            xy11[0], xy11[1], s1, t1,
            xy00[0], xy00[1], s0, t0,
            xy10[0], xy10[1], s1, t0,
        ] );
        return xyst;
    }
}


export type AxisAlignedRect = { xMin: number, xMax: number, yMin: number, yMax: number };

function axisAlignedRectCopy( { xMin, xMax, yMin, yMax }: AxisAlignedRect ): AxisAlignedRect {
    return { xMin, xMax, yMin, yMax };
}

export class AxisAlignedLinearMesh implements Mesh {
    readonly totalBounds: Readonly<AxisAlignedRect>;

    constructor( totalBounds: Readonly<AxisAlignedRect> ) {
        this.totalBounds = axisAlignedRectCopy( totalBounds );
    }

    getTileCoords( tileRect: TileRect, scratch: Float32Scratch ): Float32Array {
        const xStep = ( this.totalBounds.xMax - this.totalBounds.xMin ) / tileRect.cDim.total;
        const x0 = this.totalBounds.xMin + tileRect.cDim.first*xStep;
        const x1 = x0 + tileRect.cDim.count*xStep;

        const yStep = ( this.totalBounds.yMax - this.totalBounds.yMin ) / tileRect.rDim.total;
        const y0 = this.totalBounds.yMin + tileRect.rDim.first*yStep;
        const y1 = y0 + tileRect.rDim.count*yStep;

        const sStep = 1.0 / ( tileRect.cDim.count + 2 );
        const s0 = 0.0 + sStep;
        const s1 = 1.0 - sStep;

        const tStep = 1.0 / ( tileRect.rDim.count + 2 );
        const t0 = 0.0 + tStep;
        const t1 = 1.0 - tStep;

        const xyst = scratch.getTempSpace( 6 * 4 );
        xyst.set( [
            x0, y1, s0, t1,
            x0, y0, s0, t0,
            x1, y1, s1, t1,
            x1, y1, s1, t1,
            x0, y0, s0, t0,
            x1, y0, s1, t0,
        ] );
        return xyst;
    }
}

export class AxisAlignedMesh implements Mesh {
    readonly columnEdges: ArrayLike<number>;
    readonly rowEdges: ArrayLike<number>;

    constructor( columnEdges: Arrayish<number>, rowEdges: Arrayish<number> ) {
        this.columnEdges = arrayClone( columnEdges );
        this.rowEdges = arrayClone( rowEdges );
    }

    getTileCoords( tileRect: TileRect, scratch: Float32Scratch ): Float32Array {
        const nc = requireEqual( tileRect.cDim.total, this.columnEdges.length - 1 );
        const nr = requireEqual( tileRect.rDim.total, this.rowEdges.length - 1 );
        const sStep = 1.0 / ( tileRect.cDim.count + 2 );
        const tStep = 1.0 / ( tileRect.rDim.count + 2 );

        const xyst = scratch.getTempSpace( nc * nr * 6 * 4 );
        let i = 0;
        for ( let r = 0; r < nr; r++ ) {
            const y0 = this.rowEdges[ r + 0 ];
            const y1 = this.rowEdges[ r + 1 ];
            const t0 = ( 1 + r )*tStep;
            const t1 = t0 + tStep;

            for ( let c = 0; c < nc; c++ ) {
                const x0 = this.columnEdges[ c + 0 ];
                const x1 = this.columnEdges[ c + 1 ];
                const s0 = ( 1 + c )*sStep;
                const s1 = s0 + sStep;

                i = put4f( xyst, i, x0, y1, s0, t1 );
                i = put4f( xyst, i, x0, y0, s0, t0 );
                i = put4f( xyst, i, x1, y1, s1, t1 );
                i = put4f( xyst, i, x1, y1, s1, t1 );
                i = put4f( xyst, i, x0, y0, s0, t0 );
                i = put4f( xyst, i, x1, y0, s1, t0 );
            }
        }
        return xyst;
    }
}

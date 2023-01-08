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
import { createTileIndexComparator } from '../cache';

it( 'compareTileIndices', ( ) => {
    const z = 2;
    const cCount = 1 << z;
    const compareTileIndices = createTileIndexComparator( {
        z,

        cMin: -1,
        cMax: +1,
        cCenter: 0,

        rMin: 0,
        rMax: 0,
        rCenter: 0,
    } );
    expect( compareTileIndices( { zoomLevel: z, columnIndex: cCount-1, rowIndex: 0 }, { zoomLevel: z, columnIndex: 1, rowIndex: 0 }, ) ).toBe( 0 );
    expect( compareTileIndices( { zoomLevel: z, columnIndex: 99*cCount-1, rowIndex: 0 }, { zoomLevel: z, columnIndex: 1, rowIndex: 0 }, ) ).toBe( 0 );
    expect( compareTileIndices( { zoomLevel: z, columnIndex: -99*cCount-1, rowIndex: 0 }, { zoomLevel: z, columnIndex: 1, rowIndex: 0 }, ) ).toBe( 0 );
} );

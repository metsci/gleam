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
import { DEG_TO_RAD, MERCATOR_PROJ, WGS84_EQUATORIAL_CIRCUMFERENCE_METERS } from '@metsci/gleam-util';
import { createXSplitter } from '../painter/support';

const { abs, PI } = Math;

const xWrapSpan_MM = 1e3*WGS84_EQUATORIAL_CIRCUMFERENCE_METERS;
const MM_TO_RAD = 2*PI / xWrapSpan_MM;

it( 'splitX', ( ) => {
    const proj = MERCATOR_PROJ;

    const xWrapSpan = proj.xSpan;
    const PROJ_TO_MM = xWrapSpan_MM / xWrapSpan;
    const splitX = createXSplitter( xWrapSpan );
    function expectXSplitMatch( lon_RAD: number ): void {
        const x = proj.lonToX( lon_RAD );
        const [ xa, xb ] = splitX( x );
        const f32s = new Float32Array( [ xa, xb ] );
        expect( f32s[0] ).toBe( xa );
        expect( f32s[1] ).toBe( xb );
        const error_MM = ( ( f32s[0] + f32s[1] ) - x )*PROJ_TO_MM;
        expect( abs( error_MM ) ).toBeLessThan( 1 );
    }

    expectXSplitMatch( 0*DEG_TO_RAD );
    expectXSplitMatch( +180*DEG_TO_RAD );
    expectXSplitMatch( -180*DEG_TO_RAD );
    expectXSplitMatch( +3780*DEG_TO_RAD );
    expectXSplitMatch( -3780*DEG_TO_RAD );
    expectXSplitMatch( 1e3*360*DEG_TO_RAD + 1*MM_TO_RAD );
} );

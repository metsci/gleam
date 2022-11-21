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
import { wrapAbove, wrapDelta, wrapNear } from '../util/wrap';

it( 'wrapDelta', ( ) => {
    expect( wrapDelta( 0, 360 ) ).toBe( 0 );

    expect( wrapDelta( -179, 360 ) ).toBe( -179 );
    expect( wrapDelta( -180, 360 ) ).toBe( -180 );
    expect( wrapDelta( -181, 360 ) ).toBe( +179 );

    expect( wrapDelta( +179, 360 ) ).toBe( +179 );
    expect( wrapDelta( +180, 360 ) ).toBe( -180 );
    expect( wrapDelta( +181, 360 ) ).toBe( -179 );

    expect( wrapDelta( -539, 360 ) ).toBe( -179 );
    expect( wrapDelta( -540, 360 ) ).toBe( -180 );
    expect( wrapDelta( -541, 360 ) ).toBe( +179 );

    expect( wrapDelta( +539, 360 ) ).toBe( +179 );
    expect( wrapDelta( +540, 360 ) ).toBe( -180 );
    expect( wrapDelta( +541, 360 ) ).toBe( -179 );
} );

it( 'wrapNear', ( ) => {
    expect( wrapNear( 0, 0, 360 ) ).toBe( 0 );

    expect( wrapNear( -179, 0, 360 ) ).toBe( -179 );
    expect( wrapNear( -180, 0, 360 ) ).toBe( -180 );
    expect( wrapNear( -181, 0, 360 ) ).toBe( +179 );

    expect( wrapNear( -179, 0, 360 ) ).toBe( -179 );
    expect( wrapNear( -180, 0, 360 ) ).toBe( -180 );
    expect( wrapNear( -181, 0, 360 ) ).toBe( +179 );

    expect( wrapNear( -539, 0, 360 ) ).toBe( -179 );
    expect( wrapNear( -540, 0, 360 ) ).toBe( -180 );
    expect( wrapNear( -541, 0, 360 ) ).toBe( +179 );

    expect( wrapNear( +539, 0, 360 ) ).toBe( +179 );
    expect( wrapNear( +540, 0, 360 ) ).toBe( -180 );
    expect( wrapNear( +541, 0, 360 ) ).toBe( -179 );

    expect( wrapNear( 821, 1000, 360 ) ).toBe( 821 );
    expect( wrapNear( 820, 1000, 360 ) ).toBe( 820 );
    expect( wrapNear( 819, 1000, 360 ) ).toBe( 1179 );

    expect( wrapNear( 1179, 1000, 360 ) ).toBe( 1179 );
    expect( wrapNear( 1180, 1000, 360 ) ).toBe( 820);
    expect( wrapNear( 1181, 1000, 360 ) ).toBe( 821 );
} );

it( 'wrapAbove', ( ) => {
    expect( wrapAbove( 0, -180, 360 ) ).toBe( 0 );

    expect( wrapAbove( -179, -180, 360 ) ).toBe( -179 );
    expect( wrapAbove( -180, -180, 360 ) ).toBe( -180 );
    expect( wrapAbove( -181, -180, 360 ) ).toBe( +179 );

    expect( wrapAbove( +179, -180, 360 ) ).toBe( +179 );
    expect( wrapAbove( +180, -180, 360 ) ).toBe( -180 );
    expect( wrapAbove( +181, -180, 360 ) ).toBe( -179 );
} );

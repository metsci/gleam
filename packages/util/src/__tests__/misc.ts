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
import { nextDownFloat64, nextUpFloat64 } from '../util';

it( 'nextUpFloat64', function( ) {
    expect( nextUpFloat64( 0 ) ).toBe( 4.9e-324 );
    expect( nextUpFloat64( -4.9e-324 ) ).toBe( 0 );

    expect( nextUpFloat64( 1 ) ).toBe( 1.0000000000000002 );
    expect( nextUpFloat64( -1.0000000000000002 ) ).toBe( -1 );

    expect( nextUpFloat64( -1 ) ).toBe( -0.9999999999999999 );
    expect( nextUpFloat64( 0.9999999999999999 ) ).toBe( 1 );

    expect( nextUpFloat64( Number.MAX_VALUE ) ).toBe( Number.POSITIVE_INFINITY );
    expect( nextUpFloat64( -Number.POSITIVE_INFINITY ) ).toBe( -Number.MAX_VALUE );

    expect( nextUpFloat64( 2.1219957905E-314 ) ).toBe( 2.121995791E-314 );
    expect( nextUpFloat64( -2.121995791E-314 ) ).toBe( -2.1219957905E-314 );

} );

it( 'nextDownFloat64', function( ) {
    expect( nextDownFloat64( 0 ) ).toBe( -4.9e-324 );
    expect( nextDownFloat64( 4.9e-324 ) ).toBe( 0 );

    expect( nextDownFloat64( 1 ) ).toBe( 0.9999999999999999 );
    expect( nextDownFloat64( -0.9999999999999999 ) ).toBe( -1 );

    expect( nextDownFloat64( -1 ) ).toBe( -1.0000000000000002 );
    expect( nextDownFloat64( 1.0000000000000002 ) ).toBe( 1 );

    expect( nextDownFloat64( Number.POSITIVE_INFINITY ) ).toBe( Number.MAX_VALUE );
    expect( nextDownFloat64( -Number.MAX_VALUE ) ).toBe( -Number.POSITIVE_INFINITY );

    expect( nextDownFloat64( 2.121995791E-314 ) ).toBe( 2.1219957905E-314 );
    expect( nextDownFloat64( -2.1219957905E-314 ) ).toBe( -2.121995791E-314 );
} );

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
import { MutableColor } from './color';
import { createColorTable_RGB8UI, newColorTableEntry, RGB8UI } from './colorTable';
import { GL } from './misc';

/**
 * Jet can be misleading. It is included for legacy compatibility, but avoid
 * it if you can. There's a good explanation at https://colorcet.com/.
 */
export function jetColor_LEGACY( frac: number, result: MutableColor ): void {
    frac = clamp( 0, 1, frac );
    const x = 4 * frac;
    const segment = Math.floor( 8 * frac );
    switch ( segment ) {
        case 0:
            result.r = 0;
            result.g = 0;
            result.b = 0.5 + x;
            break;

        case 1:
        case 2:
            result.r = 0;
            result.g = -0.5 + x;
            result.b = 1;
            break;

        case 3:
        case 4:
            result.r = -1.5 + x;
            result.g = 1;
            result.b = 2.5 - x;
            break;

        case 5:
        case 6:
            result.r = 1;
            result.g = 3.5 - x;
            result.b = 0;
            break;

        default:
            result.r = 4.5 - x;
            result.g = 0;
            result.b = 0;
            break;
    }
    result.a = 1;
}

/**
 * Jet can be misleading. It is included for legacy compatibility, but avoid
 * it if you can. There's a good explanation at https://colorcet.com/.
 */
export const JET_LEGACY_RGB8UI = /*@__PURE__*/createColorTable_RGB8UI( 1024, jetColor_LEGACY );

/**
 * Jet can be misleading. It is included for legacy compatibility, but avoid
 * it if you can. There's a good explanation at https://colorcet.com/.
 */
export const JET_LEGACY = /*@__PURE__*/newColorTableEntry( 'jet', RGB8UI, GL.NEAREST, JET_LEGACY_RGB8UI );

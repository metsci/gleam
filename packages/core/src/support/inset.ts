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
import { isNullish } from '@metsci/gleam-util';

export interface Inset {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

export function createInset( all: number ): Inset;
export function createInset( topAndBottom: number, rightAndLeft: number ): Inset;
export function createInset( top: number, rightAndLeft: number, bottom: number ): Inset;
export function createInset( top: number, right: number, bottom: number, left: number ): Inset;
export function createInset( a: number, b?: number, c?: number, d?: number ): Inset {
    if ( b === undefined ) {
        return { top: a, right: a, bottom: a, left: a };
    }
    else if ( c === undefined ) {
        return { top: a, right: b, bottom: a, left: b };
    }
    else if ( d === undefined ) {
        return { top: a, right: b, bottom: c, left: b };
    }
    else {
        return { top: a, right: b, bottom: c, left: d };
    }
}

export function scaleInset( inset: Inset, scaleFactor: number ): Inset {
    return {
        top: inset.top * scaleFactor,
        right: inset.right * scaleFactor,
        bottom: inset.bottom * scaleFactor,
        left: inset.left * scaleFactor
    };
}

export function roundInset( inset: Inset ): Inset {
    return {
        top: Math.round( inset.top ),
        right: Math.round( inset.right ),
        bottom: Math.round( inset.bottom ),
        left: Math.round( inset.left )
    };
}

export const ZERO_INSET = Object.freeze( createInset( 0 ) );

export function formatInset( inset: Inset ): string {
    const { top, right, bottom, left } = inset;

    if ( right !== left ) {
        return `${top} ${right} ${bottom} ${left}`;
    }

    const rightAndLeft = right;
    if ( top !== bottom ) {
        return `${top} ${rightAndLeft} ${bottom}`;
    }

    const topAndBottom = top;
    if ( topAndBottom !== rightAndLeft ) {
        return `${topAndBottom} ${rightAndLeft}`;
    }

    const all = topAndBottom;
    return `${all}`;
}

export function insetsEqual( a: Inset | undefined | null, b: Inset | undefined | null ): boolean {
    if ( a === b ) {
        return true;
    }
    else if ( isNullish( a ) || isNullish( b ) ) {
        return false;
    }
    else {
        return ( Object.is( a.left, b.left )
              && Object.is( a.right, b.right )
              && Object.is( a.bottom, b.bottom )
              && Object.is( a.top, b.top ) );
    }

}

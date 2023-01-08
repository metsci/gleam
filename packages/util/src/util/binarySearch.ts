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
import { trunc } from './misc';

/**
 * Returns a signed number indicating the direction and amount by which the candidate
 * value differs from the target value. Returns negative if the candidate is too small,
 * positive if the candidate is too large, or zero if the candidate equals the target.
 * Values returned by repeated calls to a single instance should be consistent with the
 * assumption that the target is the same for all calls.
 */
export interface MissFn<T> {
    ( candidate: T ): number;
}

export function linearMissFn( target: number ): MissFn<number> {
    return candidate => {
        // TODO: Be more careful about NaN, and about +0.0 vs -0.0
        return ( candidate - target );
    };
}

export function findIndexOf<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    let a = 0;
    let b = sorted.length - 1;
    while ( a <= b ) {
        const pivot = trunc( ( a + b ) / 2 );
        const miss = missFn( sorted[ pivot ] );
        if ( miss < 0 ) {
            a = pivot + 1;
        }
        else if ( miss > 0 ) {
            b = pivot - 1;
        }
        else {
            return pivot;
        }
    }
    return -( a + 1 );
}

export function findIndexNearest<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    const i = findIndexOf( sorted, missFn );

    // Exact value found
    if ( i >= 0 ) {
        return i;
    }

    // Find the closer of the adjacent values
    const iAfter = -i - 1;
    const iBefore = iAfter - 1;

    if ( iAfter >= sorted.length ) {
        return iBefore;
    }

    if ( iBefore < 0 ) {
        return iAfter;
    }

    const missAfter = missFn( sorted[ iAfter ] );
    const missBefore = missFn( sorted[ iBefore ] );
    return ( Math.abs( missAfter ) <= Math.abs( missBefore ) ? iAfter : iBefore );
}

export function findIndexAfter<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    const i = findIndexOf( sorted, missFn );

    // Exact value not found
    if ( i < 0 ) {
        return ( -i - 1 );
    }

    // If the exact value was found, find the value's last occurrence
    let n = sorted.length;
    for ( let j = i + 1; j < n; j++ ) {
        if ( missFn( sorted[ j ] ) > 0 ) {
            return j;
        }
    }
    return n;
}

export function findIndexAtOrAfter<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    const i = findIndexOf( sorted, missFn );

    // Exact value not found
    if ( i < 0 ) {
        return ( -i - 1 );
    }

    // If the exact value was found, find the value's first occurrence
    for ( let j = i; j > 0; j-- ) {
        if ( missFn( sorted[ j - 1 ] ) < 0 ) {
            return j;
        }
    }
    return 0;
}

export function findIndexBefore<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    return findIndexAtOrAfter( sorted, missFn ) - 1;
}

export function findIndexAtOrBefore<T>( sorted: ArrayLike<T>, missFn: MissFn<T> ): number {
    return findIndexAfter( sorted, missFn ) - 1;
}

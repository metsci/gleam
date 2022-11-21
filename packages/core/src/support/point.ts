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
import { X, Y } from './xy';

export function x( pointOrXy: Point2D | [number,number] ): number {
    return ( Array.isArray( pointOrXy ) ? pointOrXy[ 0 ] : pointOrXy.x );
}

export function y( pointOrXy: Point2D | [number,number] ): number {
    return ( Array.isArray( pointOrXy ) ? pointOrXy[ 1 ] : pointOrXy.y );
}

export function point2D( point: Point2D ): Point2D;
export function point2D( xy: [number,number] ): Point2D;
export function point2D( x: number, y: number ): Point2D;
export function point2D( arg0: any, arg1?: any ): Point2D {
    if ( arg1 !== undefined ) {
        return new Point2D( arg0, arg1 );
    }
    else if ( Array.isArray( arg0 ) ) {
        return new Point2D( arg0[0], arg1[1] );
    }
    else {
        return arg0;
    }
}

export class Point2D {
    static readonly ZERO = Object.freeze( new Point2D( 0, 0 ) );

    readonly x: number;
    readonly y: number;

    constructor( x: number, y: number );
    constructor( xy: [number,number] );
    constructor( arg0: any, arg1?: any ) {
        if ( arg1 !== undefined ) {
            this.x = arg0;
            this.y = arg1;
        }
        else {
            this.x = arg0[ 0 ];
            this.y = arg0[ 1 ];
        }
    }

    get [X]( ): number {
        return this.x;
    }

    get [Y]( ): number {
        return this.y;
    }

    times( factor: number ): Point2D {
        return new Point2D( factor * this.x, factor * this.y );
    }
}

export function pointsEqual2D( a: Point2D | null | undefined, b: Point2D | null | undefined ): boolean {
    if ( a === b ) {
        return true;
    }
    else if ( a === null || b === null || a === undefined || b === undefined ) {
        return false;
    }
    else {
        return ( a.x === b.x && a.y === b.y );
    }
}

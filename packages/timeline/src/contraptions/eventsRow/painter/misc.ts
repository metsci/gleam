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
import { Interval1D, LinkedMap, Nullable, requireDefined, Supplier } from '@metsci/gleam-util';

/**
 * Split the value into two parts, each of which can be converted to a
 * 32-bit float, transferred to the graphics device, and used there for
 * arithmetic with 46-bit precision. The particular split implemented
 * here gives a 35-bit whole number and an 11-bit fraction.
 *
 * For values that represent seconds, this means millisecond precision
 * for up to ~1,000 years.
 *
 * See https://help.agi.com/AGIComponents/html/BlogPrecisionsPrecisions.htm.
 */
export function splitToMilliPrecision( x: number ): { a: number, b: number } {
    if ( Math.abs( x ) >= 2**35 ) {
        // Precision loss is better than weird behavior
        return { a: x, b: 0 };
    }
    else {
        const a = Math.trunc( x * 2**-12 ) * 2**12;
        const b = x - a;
        return { a, b };
    }
}

/**
 * Split the value into three parts, each of which can be converted to a
 * 32-bit float, transferred to the graphics device, and used there for
 * arithmetic with 69-bit precision. The particular split implemented
 * here gives a 39-bit whole number and a 30-bit fraction.
 *
 * For values that represent seconds, this means nanosecond precision
 * for up to ~17,000 years.
 *
 * See https://help.agi.com/AGIComponents/html/BlogPrecisionsPrecisions.htm.
 */
export function splitToNanoPrecision( x: number ): { a: number, b: number, c: number } {
    if ( Math.abs( x ) >= 2**39 ) {
        // Precision loss is better than weird behavior
        return { a: x, b: 0, c: 0 };
    }
    else {
        const a = Math.trunc( x * 2**-16 ) * 2**16;
        const b0 = x - a;
        const b = Math.trunc( b0 * 2**7 ) * 2**-7;
        const c = b0 - b;
        return { a, b, c };
    }
}

export function glUniformEra( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, era_PSEC: Interval1D ): void {
    const min_PSEC = splitToMilliPrecision( era_PSEC.min );
    const span_SEC = era_PSEC.span;
    gl.uniform3f( location, min_PSEC.a, min_PSEC.b, span_SEC );
}

export function requireInt( x: number ): number {
    if ( x !== Math.trunc( x ) ) {
        throw new Error( );
    }
    return x;
}

export class StateMarker {
    static create( ): StateMarker {
        return new StateMarker( 0 );
    }

    protected constructor(
        protected readonly seqNum: number,
    ) { }

    bump( ): StateMarker {
        return new StateMarker( this.seqNum + 1 );
    }
}

export class Indexed<K,V> {
    marker: StateMarker = StateMarker.create( );
    protected readonly entriesByKey: LinkedMap<K,[number,V]>;
    protected readonly entriesByIndex: Array<[K,V]>;

    constructor( ) {
        this.entriesByKey = new LinkedMap( );
        this.entriesByIndex = new Array( );
    }

    *[Symbol.iterator]( ): IterableIterator<[ key: K, value: V, index: number ]> {
        for ( let i = 0; i < this.entriesByIndex.length; i++ ) {
            const [ key, value ] = this.entriesByIndex[ i ];
            yield [ key, value, i ];
        }
    }

    addIfAbsent( key: K, value: V ): Readonly<[number,V]> {
        const entry = this.entriesByKey.get( key );
        if ( entry ) {
            return entry;
        }
        else {
            const newIndex = this.entriesByIndex.length;
            const newEntry: [number,V] = [ newIndex, value ];
            this.entriesByKey.putLast( key, newEntry );
            this.entriesByIndex.push( [ key, value ] );
            this.marker = this.marker.bump( );
            return newEntry;
        }
    }

    createIfAbsent( key: K, createValue: Supplier<V> ): Readonly<[number,V]> {
        const entry = this.entriesByKey.get( key );
        if ( entry ) {
            return entry;
        }
        else {
            const newValue = createValue( );
            const newIndex = this.entriesByIndex.length;
            const newEntry: [number,V] = [ newIndex, newValue ];
            this.entriesByKey.putLast( key, newEntry );
            this.entriesByIndex.push( [ key, newValue ] );
            this.marker = this.marker.bump( );
            return newEntry;
        }
    }

    requireByKey( key: K ): Readonly<[number,V]> {
        return requireDefined( this.getByKey( key ) );
    }

    getByKey( key: K ): Readonly<[number,V]> | undefined {
        return this.entriesByKey.get( key );
    }

    requireByIndex( index: number ): Readonly<[K,V]> {
        return requireDefined( this.getByIndex( index ) );
    }

    getByIndex( index: number ): Readonly<[K,V]> | undefined {
        return this.entriesByIndex[ index ];
    }
}

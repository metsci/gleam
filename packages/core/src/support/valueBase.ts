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
import { arrayAllEqual, equal, hashCode, isNullish, ValueObject } from '@metsci/gleam-util';

// TODO: Support maps, sets
export type NumberArray = ReadonlyArray<number> | Array<number> | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export type ValueMemberArray = ReadonlyArray<ValueMember> | Array<ValueMember> | NumberArray;
export type ValueMember = string | number | boolean | ValueObject | null | undefined | ValueMemberArray;

const MEMBERS_ARRAY_SYMBOL = Symbol( 'membersArray' );
const MEMBERS_HASH_SYMBOL = Symbol( 'membersHash' );
export class ValueBase implements ValueObject {
    protected readonly [ MEMBERS_ARRAY_SYMBOL ]: ReadonlyArray<ValueMember>;
    protected readonly [ MEMBERS_HASH_SYMBOL ]: number;

    constructor( ...members: ReadonlyArray<ValueMember> ) {
        this[ MEMBERS_ARRAY_SYMBOL ] = members;
        this[ MEMBERS_HASH_SYMBOL ] = valueArrayHash( this[ MEMBERS_ARRAY_SYMBOL ] );
    }

    hashCode( ): number {
        return this[ MEMBERS_HASH_SYMBOL ];
    }

    equals( o: unknown ): boolean {
        const a = this[ MEMBERS_ARRAY_SYMBOL ];
        const b: ValueMember = ( o as any )?.[ MEMBERS_ARRAY_SYMBOL ];
        return valuesEqual( a, b );
    }
}

export class ValueBase2 implements ValueObject {
    hashCode( ): number {
        const prime = 31;
        let result = 1;
        for ( const propName of Object.getOwnPropertyNames( this ) ) {
            const propValue = ( this as any )[ propName ];
            result = ( prime*result + valueHash( propValue ) ) | 0;
        }
        return result;
    }

    equals( o: unknown ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            const propNames = Object.getOwnPropertyNames( this );
            if ( !arrayAllEqual( Object.getOwnPropertyNames( o ), propNames ) ) {
                return false;
            }
            for ( const propName of propNames ) {
                const a = ( this as any )[ propName ];
                const b = ( o as any )[ propName ];
                if ( !valuesEqual( a, b ) ) {
                    return false;
                }
            }
            return true;
        }
    }
}

function valuesEqual( a: ValueMember, b: ValueMember ): boolean {
    if ( isValueArray( a ) && isValueArray( b ) ) {
        return arrayAllEqual( a, b, valuesEqual );
    }
    else {
        return equal( a, b );
    }
}

function valueHash( x: ValueMember ): number {
    if ( isValueArray( x ) ) {
        return valueArrayHash( x );
    }
    else {
        return hashCode( x );
    }
}

const typedArrayStrings = new Set( [
    ( new Int8Array( 0 ) ).toString( ),
    ( new Uint8Array( 0 ) ).toString( ),
    ( new Uint8ClampedArray( 0 ) ).toString( ),
    ( new Int16Array( 0 ) ).toString( ),
    ( new Uint16Array( 0 ) ).toString( ),
    ( new Int32Array( 0 ) ).toString( ),
    ( new Uint32Array( 0 ) ).toString( ),
    ( new Float32Array( 0 ) ).toString( ),
    ( new Float64Array( 0 ) ).toString( ),
] );

function isValueArray( x: ValueMember ): x is ValueMemberArray {
    // Would be nice to do something more comprehensive, but it's not obvious what that would be
    return ( Array.isArray( x ) || typedArrayStrings.has( Object.prototype.toString.call( x ) ) );
}

function valueArrayHash( xs: ArrayLike<ValueMember> ): number {
    const prime = 193;
    let result = 1;
    result = ( prime*result + hashCode( xs.length ) ) | 0;
    for ( let i = 0; i < xs.length; i++ ) {
        result = ( prime*result + valueHash( xs[i] ) ) | 0;
    }
    return result;
}

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
import { Disposer, Supplier } from '@metsci/gleam-util';

export function isnum( x: unknown ): x is number {
    return ( typeof x === 'number' );
}

export function isobj( x: unknown ): x is object {
    return ( typeof x === 'object' && x !== null );
}

export function isstr( x: unknown ): x is string {
    return ( typeof x === 'string' );
}

export function isfn( x: unknown ): x is Function {
    return ( typeof x === 'function' );
}

export function frozenSupplier<T>( value: T ): Supplier<T> {
    Object.freeze( value );
    return ( ) => value;
}

export const ARE_TYPED_ARRAYS_LITTLE_ENDIAN = areTypedArraysLittleEndian( );

function areTypedArraysLittleEndian( ): boolean {
    const magic = 0x12345678;

    const buffer = new ArrayBuffer( 4 );
    ( new Uint32Array( buffer ) )[ 0 ] = magic;

    const dataView = new DataView( buffer );
    if ( dataView.getInt32( 0, true ) === magic ) {
        return true;
    }
    else if ( dataView.getInt32( 0, false ) === magic ) {
        return false;
    }
    else {
        throw new Error( );
    }
}

export function runAndAttachEventListener<K extends keyof WindowEventMap>( window: Window, type: K, useCapture: boolean, listener: ( ) => unknown ): Disposer;
export function runAndAttachEventListener<K extends keyof HTMLElementEventMap>( element: HTMLElement, type: K, useCapture: boolean, listener: ( ) => unknown ): Disposer;
export function runAndAttachEventListener( source: GlobalEventHandlers, type: string, useCapture: boolean, listener: ( ) => unknown ): Disposer {
    listener( );
    return attachEventListener( source, type, useCapture, listener );
}

export function attachEventListener<K extends keyof WindowEventMap>( window: Window, type: K, useCapture: boolean, listener: ( this: Window, ev: WindowEventMap[K] ) => unknown ): Disposer;
export function attachEventListener<K extends keyof HTMLElementEventMap>( element: HTMLElement, type: K, useCapture: boolean, listener: ( this: HTMLElement, ev: HTMLElementEventMap[K] ) => unknown ): Disposer;
export function attachEventListener( source: GlobalEventHandlers, type: string, useCapture: boolean, listener: EventListenerOrEventListenerObject ): Disposer;
export function attachEventListener( source: GlobalEventHandlers, type: string, useCapture: boolean, listener: EventListenerOrEventListenerObject ): Disposer {
    source.addEventListener( type, listener, useCapture );
    return ( ) => {
        source.removeEventListener( type, listener, useCapture );
    };
}

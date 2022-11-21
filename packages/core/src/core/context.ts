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
import { get, Nullable, StringTuple } from '@metsci/gleam-util';
import { ColorTablePopulator, GL, ShaderProgram, ShaderSource } from '../support';

const { floor } = Math;

export interface ProgramInit<H> {
    initProgram( gl: WebGLRenderingContext, program: Nullable<WebGLProgram> ): H;
}

export interface TextureMeta {
    componentType: number;
    componentsPerPixel: number;
    pixelsWide: number;
    pixelsHigh: number;
}

export interface TextureInfo<M extends TextureMeta = TextureMeta> {
    meta: M;
    texture: Nullable<WebGLTexture>;
}

export interface TextureInit<M extends TextureMeta = TextureMeta> {
    ( gl: WebGLRenderingContext, target: number ): M;
}

/**
 * Convenience fn that calls `gl.texImage2D()` and then returns a `TextureMeta`
 * representation of the texture.
 *
 * Supports only the common case where `level` is zero and `format` is a WebGL1
 * format. For other cases, call `gl.texImage2D()` directly instead of calling
 * this fn.
 */
export function texImage2D( gl: WebGLRenderingContext, target: number, format: number, type: number, data: ImageData ): TextureMeta;
export function texImage2D<X extends object>( gl: WebGLRenderingContext, target: number, format: number, type: number, data: ImageData, metaExtra: X ): TextureMeta & X;
export function texImage2D( gl: WebGLRenderingContext, target: number, format: number, type: number, data: ImageData, metaExtra?: object ): TextureMeta {
    const componentsPerPixel = get( ( ) => {
        switch ( format ) {
            case GL.ALPHA: return 1;
            case GL.LUMINANCE: return 1;
            case GL.LUMINANCE_ALPHA: return 2;
            case GL.RGB: return 3;
            case GL.RGBA: return 4;
        }
        throw new Error( `Unrecognized pixel format: ${format}` );
    } );
    gl.texImage2D( target, 0, format, format, type, data );
    return {
        componentType: type,
        componentsPerPixel,
        pixelsWide: data.width,
        pixelsHigh: data.height,
        ...( metaExtra ?? {} ),
    };
}

export interface BufferMeta {
    componentType: number;
    componentsPerUnit: number;
    unitCount: number;
}

export interface BufferInfo<M extends BufferMeta = BufferMeta> {
    meta: M;
    buffer: Nullable<WebGLBuffer>;
}

export interface BufferInit<M extends BufferMeta = BufferMeta> {
    ( gl: WebGLRenderingContext, target: number ): M;
}

/**
 * Convenience fn that calls `gl.bufferData()` and then returns a `BufferMeta`
 * representation of the buffer.
 */
export function bufferDataI8( gl: WebGLRenderingContext, target: number, data: Int8Array, componentsPerUnit: number, usage: number = GL.STATIC_DRAW ): BufferMeta {
    return doBufferData( gl, target, data, GL.BYTE, componentsPerUnit, usage );
}

/**
 * Convenience fn that calls `gl.bufferData()` and then returns a `BufferMeta`
 * representation of the buffer.
 */
export function bufferDataU8( gl: WebGLRenderingContext, target: number, data: Uint8Array | Uint8ClampedArray, componentsPerUnit: number, usage: number = GL.STATIC_DRAW ): BufferMeta {
    return doBufferData( gl, target, data, GL.UNSIGNED_BYTE, componentsPerUnit, usage );
}

/**
 * Convenience fn that calls `gl.bufferData()` and then returns a `BufferMeta`
 * representation of the buffer.
 */
export function bufferDataI16( gl: WebGLRenderingContext, target: number, data: Int16Array, componentsPerUnit: number, usage: number = GL.STATIC_DRAW ): BufferMeta {
    return doBufferData( gl, target, data, GL.SHORT, componentsPerUnit, usage );
}

/**
 * Convenience fn that calls `gl.bufferData()` and then returns a `BufferMeta`
 * representation of the buffer.
 */
export function bufferDataU16( gl: WebGLRenderingContext, target: number, data: Uint16Array, componentsPerUnit: number, usage: number = GL.STATIC_DRAW ): BufferMeta {
    return doBufferData( gl, target, data, GL.UNSIGNED_SHORT, componentsPerUnit, usage );
}

/**
 * Convenience fn that calls `gl.bufferData()` and then returns a `BufferMeta`
 * representation of the buffer.
 */
export function bufferDataF32( gl: WebGLRenderingContext, target: number, data: Float32Array, componentsPerUnit: number, usage: number = GL.STATIC_DRAW ): BufferMeta {
    return doBufferData( gl, target, data, GL.FLOAT, componentsPerUnit, usage );
}

function doBufferData( gl: WebGLRenderingContext, target: number, data: BufferSource & { length: number }, componentType: number, componentsPerUnit: number, usage: number ): BufferMeta {
    gl.bufferData( target, data, usage );
    return { componentType, componentsPerUnit, unitCount: floor( data.length / componentsPerUnit ) };
}

/**
 * Convenience fn for `gl.bindBuffer()` and then `gl.vertexAttribPointer()`, using
 * the vertex attribute's buffer, component type, etc. from the given `BufferInfo`.
 */
export function vertexAttribPointer( gl: WebGLRenderingContext, attrib: number, buffer: BufferInfo, normalized: boolean = false, stride: number = 0, offset: number = 0 ) {
    gl.bindBuffer( GL.ARRAY_BUFFER, buffer.buffer );
    gl.vertexAttribPointer( attrib, buffer.meta.componentsPerUnit, buffer.meta.componentType, normalized, stride, offset );
}

export interface Context {
    readonly gl: WebGLRenderingContext;

    /**
     * The number of frames that have been painted since this Context was
     * created. Does not reset on context loss/restore.
     */
    readonly frameNum: number;

    /**
     * On context-restore, the value of glIncarnation will change to a new
     * value that is distinct (in a === sense) from its previous values. It
     * can be used to determine when device resources need to be recreated.
     *
     * The value of glIncarnation can only change during event dispatch --
     * it will not change while rendering code is being executed.
     *
     * Rendering code usually should NOT bother checking gl.isContextLost()
     * -- there's no way to check often enough to catch everything, and the
     * subsequent gl call wouldn't be atomic with the check anyway.
     *
     * However, rendering code that reuses device resources SHOULD check
     * whether the value of glIncarnation has changed since the device
     * resources were created -- and if it has changed, the old resources
     * should be abandoned (no need to delete them) and new ones should be
     * created.
     */
    readonly glIncarnation: object;

    /**
     * Returns a unique string associated with `obj`. Subsequent calls with
     * the same `obj` will return the same string. The returned string is
     * suitable for embedding in the `key` argument to `getTexture()` or
     * `getBuffer()`.
     *
     * Intended for cases where a painter needs its own resource namespace.
     * E.g. ``context.getBuffer( `${context.getObjectKey(this)}.coords` )``
     *
     * Passing an object to this method will not affect its eligibility for
     * garbage collection.
     */
    getObjectKey( obj: object ): string;

    /**
     * Returned value is good for the duration of the current frame. Don't
     * use it beyond that. If you need it again on a future frame, call
     * this method again.
     */
    getProgram<U extends StringTuple, A extends StringTuple>( source: ShaderSource<U,A> ): ShaderProgram<U,A>;

    /**
     * Returned value is good for the duration of the current frame. Don't
     * use it beyond that. If you need it again on a future frame, call
     * this method again.
     *
     * If `key` has a cached value but the incoming `inputs` differs from
     * the cached `inputs`, `init` will be called and the cached value will
     * be overwritten. Comparison of `inputs` uses `ValueObject` equality.
     *
     * Intended usage is for no two call sites to use the same `key`. That
     * condition is not enforced -- but if it is violated, this method may
     * return a `TextureInfo` whose `meta` field is not actually of type `M`.
     */
    getTexture<M extends TextureMeta>( key: string, inputs: unknown, init: TextureInit<M> ): TextureInfo<M>;

    /**
     * Returned value is good for the duration of the current frame. Don't
     * use it beyond that. If you need it again on a future frame, call
     * this method again.
     *
     * If `key` has a cached value but the incoming `inputs` differs from
     * the cached `inputs`, `init` will be called and the cached value will
     * be overwritten. Comparison of `inputs` uses `ValueObject` equality.
     *
     * Intended usage is for no two call sites to use the same `key`. That
     * condition is not enforced -- but if it is violated, this method may
     * return a `BufferInfo` whose `meta` field is not actually of type `M`.
     */
    getBuffer<M extends BufferMeta>( key: string, inputs: unknown, init: BufferInit<M> ): BufferInfo<M>;

    getColorTable( key: string ): ColorTablePopulator;
    putColorTable( key: string, value: ColorTablePopulator ): void;
}

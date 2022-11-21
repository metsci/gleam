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
import { Nullable, Supplier } from '@metsci/gleam-util';
import { Axis1D, TagMap } from '../core';
import { Interval1D, Interval2D } from './interval';
import { Point2D } from './point';
import { ValueBase } from './valueBase';

export const GL = WebGLRenderingContext;

export const GLSL_HIGHP_MAXVALUE = 2**62;

export function drawingBufferBounds( gl: WebGLRenderingContext ): Nullable<Interval2D> {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;

    // The context may have been lost before we finished reading the
    // buffer dimensions, in which case the values we read may not be
    // valid.
    //
    // Once context is lost, we assume that it can't get restored until
    // after the 'webglcontextlost' event has been dispatched and handled
    // -- which means not until after this method has returned. This behavior
    // isn't spelled out in the spec, but it is a reasonable assumption
    // for several reasons:
    //
    //   1. At least some browsers are implemented in a way that guarantees
    //      this behavior (based on a look at their open-source code)
    //
    //   2. The spec gives examples involving event.preventDefault(), which
    //      would be hard or impossible for an impl to satisfy without also
    //      guaranteeing this behavior
    //
    //   3. If this behavior were not guaranteed, then there would be no reliable
    //      way to get the buffer dimensions
    //
    if ( gl.isContextLost( ) ) {
        return null;
    }
    else {
        return Interval2D.fromRect( 0, 0, w, h );
    }
}

export function fracToNdc( frac: number ): number {
    return ( -1 + 2*frac );
}

export function ndcToFrac( ndc: number ): number {
    return ( 0.5*( ndc + 1 ) );
}

export function fracToNdc2D( frac: Point2D ): Point2D {
    return new Point2D(
        -1 + 2*frac.x,
        -1 + 2*frac.y,
    );
}

export function ndcToFrac2D( ndc: Point2D ): Point2D {
    return new Point2D(
        0.5*( ndc.x + 1 ),
        0.5*( ndc.y + 1 ),
    );
}

/**
 * Returns `array` if it is already large enough to handle the required capacity.
 * Otherwise creates and returns a new array that has at least the required capacity.
 * If a new array is created, it is left uninitialized -- data from `array` is NOT
 * copied into it, unless `copyData` is true.
 */
export function ensureHostBufferCapacity( array: Float32Array, minCapacity_FLOATS: number, copyData: boolean = false ): Float32Array {
    if ( array.length < minCapacity_FLOATS ) {
        const newCapacity = Math.max( minCapacity_FLOATS, 2*array.length );
        const newArray = new Float32Array( newCapacity );
        if ( copyData ) {
            newArray.set( array );
        }
        return newArray;
    }
    else {
        return array;
    }
}

/**
 * Like `gl.bufferData`, but avoids reallocating the device buffer when possible,
 * and copies only the section of the host buffer that's actually populated.
 *
 * Returns the new capacity (in bytes) of the device buffer.
 */
export function pushBufferToDevice_BYTES(
    gl: WebGLRenderingContext,
    target: number,
    currentCapacity_BYTES: number,
    hCoords: Float32Array,
    hCoordCount: number = hCoords.length,
): number {
    // Grow device buffer to match host buffer size
    const hCapacity_BYTES = hCoords.byteLength;
    let dCapacity_BYTES = currentCapacity_BYTES;
    if ( hCapacity_BYTES > 0 && dCapacity_BYTES !== hCapacity_BYTES ) {
        gl.bufferData( target, hCapacity_BYTES, GL.STATIC_DRAW );
        dCapacity_BYTES = hCapacity_BYTES;
    }

    // Push coords from host to device
    if ( hCoordCount > 0 ) {
        gl.bufferSubData( target, 0, hCoords.subarray( 0, hCoordCount ) );
    }

    // Return new capacity of device buffer
    return dCapacity_BYTES;
}

export class Float32Scratch {
    protected values: Float32Array;

    constructor( ) {
        this.values = new Float32Array( 0 );
    }

    getTempSpace( sizeFloats: number ): Float32Array {
        this.values = ensureHostBufferCapacity( this.values, sizeFloats, false );
        return this.values.subarray( 0, sizeFloats );
    }
}

export function put1f( array: Float32Array, i: number, a: number ): number {
    array[ i++ ] = a;
    return i;
}

export function put2f( array: Float32Array, i: number, a: number, b: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    return i;
}

export function put3f( array: Float32Array, i: number, a: number, b: number, c: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    return i;
}

export function put4f( array: Float32Array, i: number, a: number, b: number, c: number, d: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    return i;
}

export function put6f( array: Float32Array, i: number, a: number, b: number, c: number, d: number, e: number, f: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    array[ i++ ] = e;
    array[ i++ ] = f;
    return i;
}

export function put3ub( array: Uint8Array, i: number, a: number, b: number, c: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    return i;
}

export function put4ub( array: Uint8Array, i: number, a: number, b: number, c: number, d: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    return i;
}

export function put1ui( array: Uint32Array, i: number, a: number ): number {
    array[ i++ ] = a;
    return i;
}

export function put2ui( array: Uint32Array, i: number, a: number, b: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    return i;
}

export function put3ui( array: Uint32Array, i: number, a: number, b: number, c: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    return i;
}

export function put4ui( array: Uint32Array, i: number, a: number, b: number, c: number, d: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    return i;
}

export function put1s( array: Int16Array, i: number, a: number ): number {
    array[ i++ ] = a;
    return i;
}

export function put2s( array: Int16Array, i: number, a: number, b: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    return i;
}

export function put3s( array: Int16Array, i: number, a: number, b: number, c: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    return i;
}

export function put4s( array: Int16Array, i: number, a: number, b: number, c: number, d: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    return i;
}

export function putRgba( array: Float32Array, i: number, color: { r: number, g: number, b: number, a: number } ): number {
    return put4f( array, i, color.r, color.g, color.b, color.a );
}

export function putRgb( array: Float32Array, i: number, color: { r: number, g: number, b: number } ): number {
    return put3f( array, i, color.r, color.g, color.b );
}

export function putAlignedBox( array: Float32Array, i: number, xMin: number, xMax: number, yMin: number, yMax: number ): number {
    i = put2f( array, i, xMin, yMax );
    i = put2f( array, i, xMin, yMin );
    i = put2f( array, i, xMax, yMax );

    i = put2f( array, i, xMax, yMax );
    i = put2f( array, i, xMin, yMin );
    i = put2f( array, i, xMax, yMin );

    return i;
}

export function axisBoundsFn<B>( axis: { bounds: B } ): Supplier<B> {
    return ( ) => axis.bounds;
}

export function axisViewportFn_PX<V>( axis: { viewport_PX: V } ): Supplier<V> {
    return ( ) => axis.viewport_PX;
}

export function paneViewportFn_PX<V>( pane: { getViewport_PX: Supplier<V> } ): Supplier<V> {
    return ( ) => pane.getViewport_PX( );
}

export function tagBoundsFn( tags: TagMap, minKey: string, maxKey: string ): Supplier<Interval1D> {
    return ( ) => tags.requireInterval( minKey, maxKey );
}

export function tagCoordsFn( tags: TagMap ): Supplier<Iterable<number>> {
    return ( ) => tags.sortedCoords( );
}

// TODO: Be more careful about PX relative to axis, viewport, and root-viewport
export function xPixelToNdc( xViewport_PX: Interval1D, x_VPX: number ): number {
    return fracToNdc( x_VPX / xViewport_PX.span );
}

// TODO: Be more careful about PX relative to axis, viewport, and root-viewport
export function yDownwardPixelToNdc( yViewport_PX: Interval1D, y_VPX: number ): number {
    return yUpwardPixelToNdc( yViewport_PX, yViewport_PX.span - y_VPX );
}

// TODO: Be more careful about PX relative to axis, viewport, and root-viewport
export function yUpwardPixelToNdc( yViewport_PX: Interval1D, y_VUPX: number ): number {
    return fracToNdc( y_VUPX / yViewport_PX.span );
}

export function putVerticalLines( coords_NDC: Float32Array, i: number, viewport_PX: Interval2D, thickness_PX: number, offset_PX: number, xAxis: Nullable<Axis1D>, xs: ReadonlyArray<number> ): number {
    if ( xAxis && xs.length > 0 ) {
        const yMin_NDC = -1;
        const yMax_NDC = +1;

        const wPixel_NDC = 2 / viewport_PX.w;
        const wLine_NDC = thickness_PX * wPixel_NDC;

        for ( const x of xs ) {
            const x_PX = xAxis.coordToPx( x ) + offset_PX;
            const xMin_NDC = fracToNdc( viewport_PX.x.valueToFrac( Math.round( x_PX - 0.5*thickness_PX ) ) );
            const xMax_NDC = xMin_NDC + wLine_NDC;

            i = putAlignedBox( coords_NDC, i, xMin_NDC, xMax_NDC, yMin_NDC, yMax_NDC );
        }
    }
    return i;
}

export function putHorizontalLines( coords_NDC: Float32Array, i: number, viewport_PX: Interval2D, thickness_PX: number, offset_PX: number, yAxis: Nullable<Axis1D>, ys: ReadonlyArray<number> ): number {
    if ( yAxis && ys.length > 0 ) {
        const xMin_NDC = -1;
        const xMax_NDC = +1;

        const hPixel_NDC = 2 / viewport_PX.h;
        const hLine_NDC = thickness_PX * hPixel_NDC;

        for ( const y of ys ) {
            const y_UPX = yAxis.coordToPx( y ) + offset_PX;
            const yMin_NDC = fracToNdc( viewport_PX.y.valueToFrac( Math.round( y_UPX - 0.5*thickness_PX ) ) );
            const yMax_NDC = yMin_NDC + hLine_NDC;

            i = putAlignedBox( coords_NDC, i, xMin_NDC, xMax_NDC, yMin_NDC, yMax_NDC );
        }
    }
    return i;
}

export function glViewport( gl: WebGLRenderingContext, viewport_PX: Interval2D ): void {
    gl.viewport( viewport_PX.xMin, viewport_PX.yMin, viewport_PX.w, viewport_PX.h );
}

export function glScissor( gl: WebGLRenderingContext, scissor_PX: Interval2D ): void {
    gl.scissor( scissor_PX.xMin, scissor_PX.yMin, scissor_PX.w, scissor_PX.h );
}

export function requireFloatTextureSupport( gl: WebGLRenderingContext ): void {
    if ( !( gl instanceof WebGL2RenderingContext || gl.getExtension( 'OES_texture_float' ) ) ) {
        throw new Error( 'Float textures aren\'t support' );
    }
}

export function requireVertexTexUnits( gl: WebGLRenderingContext, numRequired: number ): void {
    const numSupported = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
    if ( numSupported < numRequired ) {
        throw new Error( `Device doesn\'t support enough vertex-shader texture units: supported = ${numSupported}, required = ${numRequired}` );
    }
}

export function activeTexture( gl: WebGLRenderingContext, texUnit: number ): void {
    gl.activeTexture( GL.TEXTURE0 + texUnit );
}

export function bindTexture( gl: WebGLRenderingContext, texUnit: number, texture: Nullable<WebGLTexture> ): number {
    activeTexture( gl, texUnit );
    gl.bindTexture( GL.TEXTURE_2D, texture );
    return texUnit;
}

export function enablePremultipliedAlphaBlending( gl: WebGLRenderingContext ): void {
    gl.blendEquation( GL.FUNC_ADD );
    gl.blendFunc( GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
    gl.enable( GL.BLEND );
}

export function disableBlending( gl: WebGLRenderingContext ): void {
    gl.disable( GL.BLEND );
}

type DprWindow = { devicePixelRatio: number };
type DprDocument = { defaultView: DprWindow | null };
type DprElement = { ownerDocument: DprDocument };
type DprPeer = { peer: DprElement };

/**
 * Device pixel ratio. This is needed to convert logical pixels (aka CSS pixels)
 * to physical pixels (which are the units used by most Gleam code):
 * ```
 * const dpr = currentDpr( pane );
 * const width_PX = width_LPX * dpr;
 * const height_PX = height_LPX * dpr;
 * ```
 * Reflects desktop-environment scaling (e.g. for Retina displays) and browser zoom.
 */
export function currentDpr( x: DprWindow | DprDocument | DprElement | DprPeer ): number {
    return (
        'devicePixelRatio' in x ? x : (
            'defaultView' in x ? x : (
                'ownerDocument' in x ? x : (
                    x.peer
                )
            ).ownerDocument
        ).defaultView
    )?.devicePixelRatio || 1;
}

export function getMouseLoc_PX( element: Element, ev: MouseEvent ): Point2D {
    // The 0.5px adjustments move the mouse coords to the center of the physical pixel
    const dpr = currentDpr( element );
    const bounds = element.getBoundingClientRect( );
    const x_PX = ( ev.clientX - bounds.left )*dpr + 0.5;
    const y_PX = ( bounds.bottom - ev.clientY )*dpr - 0.5;
    return new Point2D( x_PX, y_PX );
}

export class ModifierSet extends ValueBase {
    static readonly EMPTY: ModifierSet = new ModifierSet( false, false, false, false );

    constructor(
        readonly alt: boolean,
        readonly ctrl: boolean,
        readonly shift: boolean,
        readonly meta: boolean,
    ) {
        super( alt, ctrl, shift, meta );
    }

    isEmpty( ): boolean {
        return !( this.alt || this.ctrl || this.shift || this.meta );
    }
}

export function getModifiers( ev: {
    altKey: boolean,
    ctrlKey: boolean,
    shiftKey: boolean,
    metaKey: boolean,
} ): ModifierSet {
    return new ModifierSet( ev.altKey, ev.ctrlKey, ev.shiftKey, ev.metaKey );
}

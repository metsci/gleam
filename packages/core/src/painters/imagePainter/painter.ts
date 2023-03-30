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
import { equal, get, Interval2D, Nullable, RefBasic, requireDefined, requireNonNull, tripleEquals, ValueObject } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { AnchoredImage, createDomPeer, cssFloat, enablePremultipliedAlphaBlending, GL, PeerType, put4f, StyleProp } from '../../support';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'VIEWPORT_PX',
        'ANCHOR_PX',
        'IMAGE',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

const EMPTY_IMAGE: AnchoredImage = get( ( ) => {
    const canvas = document.createElement( 'canvas' );
    canvas.width = 3;
    canvas.height = 3;
    const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
    g.clearRect( 0, 0, 3, 3 );
    return {
        xAnchor: 1.5,
        yAnchor: 1.5,
        border: 1,
        imageData: g.getImageData( 0, 0, 3, 3 ),
    };
} );

export interface InputsGen<T> {
    ( ): T;
}

export interface ImageGen<T> {
    ( inputs: T ): AnchoredImage;
}

export class ImagePainter<T extends ValueObject> implements Painter {
    readonly peer = createDomPeer( 'image-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly xAlignViewportFrac = StyleProp.create( this.style, '--x-align-viewport-frac', cssFloat, 0 );
    readonly yAlignViewportFrac = StyleProp.create( this.style, '--y-align-viewport-frac', cssFloat, 0 );
    readonly xAlignImageCoord = StyleProp.create( this.style, '--x-align-image-coord', cssFloat, 0 );
    readonly yAlignImageCoord = StyleProp.create( this.style, '--y-align-image-coord', cssFloat, 0 );

    readonly visible = new RefBasic( true, tripleEquals );

    protected readonly createInputs: InputsGen<T>;
    protected readonly createImage: ImageGen<T>;

    protected hInputs: T | undefined;
    protected hImage: AnchoredImage;
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dInputs: T | undefined;
    protected dTexture: Nullable<WebGLTexture>;
    protected dCoords: Nullable<WebGLBuffer>;

    constructor( options: {
        createInputs: InputsGen<T>,
        createImage: ImageGen<T>,
    } ) {
        this.createInputs = options.createInputs;
        this.createImage = options.createImage;

        this.hInputs = undefined;
        this.hImage = EMPTY_IMAGE;
        this.hCoords = new Float32Array( 16 );

        this.glIncarnation = null;
        this.dInputs = undefined;
        this.dTexture = null;
        this.dCoords = null;
    }

    protected updateHostResources( ): void {
        const inputs = this.createInputs( );
        if ( !equal( inputs, this.hInputs ) ) {
            this.hInputs = inputs;
            this.hImage = this.createImage( this.hInputs );
            const sprawl = getImageSprawl( this.hImage );

            // We flip the T coord here, because canvas coords increase from top to bottom
            const wBorder_FRAC = this.hImage.border / this.hImage.imageData.width;
            const hBorder_FRAC = this.hImage.border / this.hImage.imageData.height;
            const sLeft = 0 + wBorder_FRAC;
            const sRight = 1 - wBorder_FRAC;
            const tBottom = 1 - hBorder_FRAC;
            const tTop = 0 + hBorder_FRAC;

            let i = 0;
            i = put4f( this.hCoords, i, sprawl.dxLeft_PX,  sprawl.dyTop_PX,    sLeft,  tTop    );
            i = put4f( this.hCoords, i, sprawl.dxLeft_PX,  sprawl.dyBottom_PX, sLeft,  tBottom );
            i = put4f( this.hCoords, i, sprawl.dxRight_PX, sprawl.dyTop_PX,    sRight, tTop    );
            i = put4f( this.hCoords, i, sprawl.dxRight_PX, sprawl.dyBottom_PX, sRight, tBottom );
        }
    }

    getImageInputs( ): T {
        this.updateHostResources( );
        return requireDefined( this.hInputs );
    }

    getImage( ): AnchoredImage {
        this.updateHostResources( );
        return this.hImage;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const xAlignViewportFrac = this.xAlignViewportFrac.get( );
        const yAlignViewportFrac = this.yAlignViewportFrac.get( );
        const xAlignImageCoord = this.xAlignImageCoord.get( );
        const yAlignImageCoord = this.yAlignImageCoord.get( );

        const gl = context.gl;

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;
            this.dInputs = undefined;
            this.dTexture = gl.createTexture( );
            this.dCoords = gl.createBuffer( );
        }

        // Leave these bindings in place for the whole method
        gl.activeTexture( GL.TEXTURE0 );
        gl.bindTexture( GL.TEXTURE_2D, this.dTexture );
        gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

        // Make sure host resources are up to date
        this.updateHostResources( );

        // Make sure device resources are up to date
        if ( !equal( this.hInputs, this.dInputs ) ) {
            this.dInputs = this.hInputs;

            //gl.bindTexture( GL.TEXTURE_2D, this.dTexture );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.hImage.imageData );

            //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
            gl.bufferData( GL.ARRAY_BUFFER, this.hCoords, gl.STATIC_DRAW );
        }

        // Compute viewport coords for anchor point
        const sprawl = getImageSprawl( this.hImage );
        const x_PX = Math.round( xAlignViewportFrac*viewport_PX.w - xAlignImageCoord*( xAlignImageCoord < 0 ? -sprawl.dxLeft_PX : sprawl.dxRight_PX ) );
        const y_PX = Math.round( yAlignViewportFrac*viewport_PX.h - yAlignImageCoord*( yAlignImageCoord < 0 ? -sprawl.dyBottom_PX : sprawl.dyTop_PX ) );

        enablePremultipliedAlphaBlending( gl );
        const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
        gl.useProgram( program );
        gl.enableVertexAttribArray( attribs.inCoords );
        try {
            gl.uniform4f( uniforms.VIEWPORT_PX, 0, 0, viewport_PX.w, viewport_PX.h );
            gl.uniform2f( uniforms.ANCHOR_PX, x_PX, y_PX );

            //gl.activeTexture( GL.TEXTURE0 );
            //gl.bindTexture( GL.TEXTURE_2D, this.dTexture );
            gl.uniform1i( uniforms.IMAGE, 0 );

            //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
            gl.vertexAttribPointer( attribs.inCoords, 4, GL.FLOAT, false, 0, 0 );

            gl.drawArrays( GL.TRIANGLE_STRIP, 0, 4 );
        }
        finally {
            gl.disableVertexAttribArray( attribs.inCoords );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteTexture( this.dTexture );
        gl.deleteBuffer( this.dCoords );
        this.glIncarnation = null;
        this.dTexture = null;
        this.dCoords = null;
    }
}

interface ImageSprawl {
    dxLeft_PX: number;
    dxRight_PX: number;
    dyBottom_PX: number;
    dyTop_PX: number;
};

function getImageSprawl( image: AnchoredImage ): ImageSprawl {
    return {
        dxLeft_PX: ( 0 + image.border ) - image.xAnchor,
        dxRight_PX: ( image.imageData.width - image.border ) - image.xAnchor,
        dyBottom_PX: image.yAnchor - ( image.imageData.height - image.border ),
        dyTop_PX: image.yAnchor - ( 0 + image.border ),
    };
}

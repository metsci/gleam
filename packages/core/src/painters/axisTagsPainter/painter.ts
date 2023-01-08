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
import { equal, Interval2D, Nullable, Point2D, RefBasic, requireNonNull, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Axis1D, Context, Painter } from '../../core';
import { AnchoredImage, createDomPeer, cssColor, cssFloat, currentDpr, Edge, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, GL, glUniformEdge, glUniformInterval1D, glUniformInterval2D, glUniformRgba, PeerType, pushBufferToDevice_BYTES, put3f, StyleProp, ValueBase2 } from '../../support';
import { frozenSupplier } from '../../util';

import fragShader_GLSL from './shader.frag';
import vertShader_GLSL from './shader.vert';

const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'EDGE',
        'AXIS_LIMITS',
        'AXIS_VIEWPORT_PX',
        'VIEWPORT_PX',
        'IMAGE',
        'IMAGE_SIZE_PX',
        'IMAGE_ANCHOR_PX',
        'RGBA',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

export class CoordsInputs extends ValueBase2 {
    constructor(
        readonly tagCoords: ReadonlyArray<number>,
    ) {
        super( );
    }
}

export class ImageInputs extends ValueBase2 {
    constructor(
        readonly tagWidth_PX: number,
        readonly tagHeight_PX: number,
        readonly tagLineWidth_PX: number,
    ) {
        super( );
    }
}

// For use in createTagImage()
const canvas = document.createElement( 'canvas' );
const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );

/**
 * Returned images are grayscale and fully opaque, with black
 * background and white foreground. Alpha can be inferred from
 * the grayscale value. This avoids introducing rounding error
 * when converting colors from the Canvas's buffer (which most
 * browsers store with premultiplied alpha) to ImageData (which
 * is required to have non-premultiplied alpha).
 */
export function createTagImage( inputs: ImageInputs ): AnchoredImage {
    // Add a border to avoid interpolation problems at image edges
    const border = 1;

    // Leave some extra space for the mitering of the tip corner
    const tipMiterMargin = 1;

    const wTag = inputs.tagWidth_PX;
    const hTag = inputs.tagHeight_PX;
    const lineWidth = inputs.tagLineWidth_PX;

    const wTotal = Math.ceil( tipMiterMargin + wTag + lineWidth ) + 2*border;
    const hTotal = Math.ceil( hTag + lineWidth ) + 2*border;
    if ( canvas.width < wTotal || canvas.height < hTotal ) {
        canvas.width = wTotal;
        canvas.height = hTotal;
    }

    g.fillStyle = '#000000';
    g.fillRect( 0, 0, wTotal, hTotal );

    const xLeft = border + tipMiterMargin + 0.5*lineWidth;
    const xMid = xLeft + 0.5*wTag;
    const xRight = xLeft + wTag;

    const yMid = 0.5*hTotal;
    const yTop = yMid - 0.5*hTag;
    const yBottom = yMid + 0.5*hTag;

    g.beginPath( );
    g.moveTo(  xLeft, yMid    );
    g.lineTo(   xMid, yTop    );
    g.lineTo( xRight, yTop    );
    g.lineTo( xRight, yBottom );
    g.lineTo(   xMid, yBottom );
    g.closePath( );

    g.globalAlpha = 0.3;
    g.fillStyle = '#FFFFFF';
    g.fill( );

    g.globalAlpha = 1.0;
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = lineWidth;
    g.stroke( );

    return {
        xAnchor: border,
        yAnchor: yMid,
        border,
        imageData: g.getImageData( 0, 0, wTotal, hTotal )
    };
}

export class TagsPainter implements Painter {
    readonly peer = createDomPeer( 'tags-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly tagColor = StyleProp.create( this.style, '--color', cssColor, 'rgb(0,0,0)' );
    readonly tagWidth_LPX = StyleProp.create( this.style, '--tag-width-px', cssFloat, 15 );
    readonly tagHeight_LPX = StyleProp.create( this.style, '--tag-height-px', cssFloat, 11 );
    readonly tagLineWidth_LPX = StyleProp.create( this.style, '--outline-width-px', cssFloat, 2 );
    readonly edgeOffset_LPX = StyleProp.create( this.style, '--edge-offset-px', cssFloat, 0 );

    readonly visible = new RefBasic( true, tripleEquals );

    axis: Axis1D;
    tagsEdge: Edge;
    tagCoordsFn: Supplier<Iterable<number>>;

    /**
     * Coords: coord_AXIS
     */
    protected hCoords: Float32Array;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;
    protected dImage: Nullable<WebGLTexture>;
    protected dImageSize_PX: Point2D;
    protected dImageAnchor_PX: Point2D;
    protected dImageInputs: Nullable<ImageInputs>;

    constructor( axis: Axis1D, tagsEdge: Edge, tagCoordsFn: Supplier<Iterable<number>> = frozenSupplier( [] ) ) {
        this.axis = axis;
        this.tagsEdge = tagsEdge;
        this.tagCoordsFn = tagCoordsFn;

        this.hCoords = new Float32Array( 0 );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dImage = null;
        this.dImageSize_PX = Point2D.ZERO;
        this.dImageAnchor_PX = Point2D.ZERO;
        this.dImageInputs = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const tagColor = this.tagColor.get( );
        const tagWidth_LPX = this.tagWidth_LPX.get( );
        const tagHeight_LPX = this.tagHeight_LPX.get( );
        const tagLineWidth_LPX = this.tagLineWidth_LPX.get( );
        const edgeOffset_LPX = this.edgeOffset_LPX.get( );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const tagWidth_PX = Math.round( tagWidth_LPX * dpr );
        const tagHeight_PX = Math.round( tagHeight_LPX * dpr );
        const tagLineWidth_PX = Math.round( tagLineWidth_LPX * dpr );
        const edgeOffset_PX = Math.round( edgeOffset_LPX * dpr );

        const visible = ( tagColor.a > 0 && ( tagLineWidth_PX > 0 || ( tagWidth_PX > 0 && tagHeight_PX > 0 ) ) );
        if ( visible ) {
            const gl = context.gl;

            // Reset device resources on context reincarnation
            if ( context.glIncarnation !== this.glIncarnation ) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer( );
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
                this.dImage = gl.createTexture( );
                this.dImageSize_PX = Point2D.ZERO;
                this.dImageAnchor_PX = Point2D.ZERO;
                this.dImageInputs = null;
            }

            // Leave this binding in place for the whole method
            gl.activeTexture( GL.TEXTURE0 );
            gl.bindTexture( GL.TEXTURE_2D, this.dImage );
            gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

            // Gather image inputs
            const imageInputs = new ImageInputs( tagWidth_PX, tagHeight_PX, tagLineWidth_PX );

            // Repopulate device image, if inputs have changed
            if ( !equal( imageInputs, this.dImageInputs ) ) {
                //gl.bindTexture( GL.TEXTURE_2D, this.dImage );

                gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
                gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
                gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
                gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );

                const hImage = createTagImage( imageInputs );
                const hPixels = hImage.imageData!;
                gl.texImage2D( GL.TEXTURE_2D, 0, GL.LUMINANCE, GL.LUMINANCE, GL.UNSIGNED_BYTE, hPixels );
                this.dImageSize_PX = new Point2D( hImage.imageData.width, hImage.imageData.height );
                this.dImageAnchor_PX = new Point2D( hImage.xAnchor, hImage.yAnchor );

                this.dImageInputs = imageInputs;
            }

            // Gather coords inputs
            const tagCoords = [];
            const axisBounds = this.axis.bounds;
            for ( const tagCoord of this.tagCoordsFn( ) ) {
                if ( axisBounds.containsPoint( tagCoord ) ) {
                    tagCoords.push( tagCoord );
                }
            }
            const numVertices = 6 * tagCoords.length;
            const coordsInputs = new CoordsInputs( tagCoords );

            // Repopulate device coords, if inputs have changed
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                const numCoords = 3 * numVertices;
                this.hCoords = ensureHostBufferCapacity( this.hCoords, numCoords );

                let i = 0;
                for ( const tagCoord of tagCoords ) {
                    i = put3f( this.hCoords, i, tagCoord, 0, 1 );
                    i = put3f( this.hCoords, i, tagCoord, 0, 0 );
                    i = put3f( this.hCoords, i, tagCoord, 1, 1 );

                    i = put3f( this.hCoords, i, tagCoord, 1, 1 );
                    i = put3f( this.hCoords, i, tagCoord, 0, 0 );
                    i = put3f( this.hCoords, i, tagCoord, 1, 0 );
                }

                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords );
                this.dCoordsInputs = coordsInputs;
            }

            // Render from device resources
            if ( numVertices > 0 ) {
                const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
                enablePremultipliedAlphaBlending( gl );
                gl.useProgram( program );
                gl.enableVertexAttribArray( attribs.inCoords );
                try {
                    //gl.activeTexture( GL.TEXTURE0 );
                    //gl.bindTexture( GL.TEXTURE_2D, this.dImage );
                    gl.uniform1i( uniforms.IMAGE, 0 );
                    gl.uniform2f( uniforms.IMAGE_SIZE_PX, this.dImageSize_PX.x, this.dImageSize_PX.y );
                    gl.uniform2f( uniforms.IMAGE_ANCHOR_PX, this.dImageAnchor_PX.x - edgeOffset_PX, this.dImageAnchor_PX.y );

                    //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                    gl.vertexAttribPointer( attribs.inCoords, 3, GL.FLOAT, false, 0, 0 );

                    glUniformEdge( gl, uniforms.EDGE, this.tagsEdge );
                    glUniformInterval1D( gl, uniforms.AXIS_LIMITS, axisBounds );
                    glUniformInterval1D( gl, uniforms.AXIS_VIEWPORT_PX, this.axis.viewport_PX );
                    glUniformInterval2D( gl, uniforms.VIEWPORT_PX, viewport_PX );
                    glUniformRgba( gl, uniforms.RGBA, tagColor );

                    gl.drawArrays( GL.TRIANGLES, 0, numVertices );
                }
                finally {
                    gl.disableVertexAttribArray( attribs.inCoords );
                    gl.useProgram( null );
                }
            }
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteBuffer( this.dCoords );
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

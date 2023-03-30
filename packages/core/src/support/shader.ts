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
import { Interval1D, Interval2D, Nullable, OneOf, requireNonNullish, Size2D, StringTuple } from '@metsci/gleam-util';
import { Color } from './color';
import { EAST, Edge, NORTH, SOUTH, WEST } from './edge';
import { GL } from './misc';

export function glGetUniformLocation( gl: WebGLRenderingContext, program: Nullable<WebGLProgram>, name: string ): Nullable<WebGLUniformLocation> {
    return ( program ? gl.getUniformLocation( program, name ) : null );
}

export function glGetAttribLocation( gl: WebGLRenderingContext, program: Nullable<WebGLProgram>, name: string ): GLint {
    return ( program ? gl.getAttribLocation( program, name ) : -1 );
}

export function glUniformBool( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, b: boolean ): void {
    gl.uniform1i( location, ( b ? 1 : 0 ) );
}

export function glUniformEdge( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, edge: Edge ): void {
    switch ( edge ) {
        case NORTH: gl.uniform1i( location, 0 ); break;
        case SOUTH: gl.uniform1i( location, 1 ); break;
        case EAST: gl.uniform1i( location, 2 ); break;
        case WEST: gl.uniform1i( location, 3 ); break;
        default: throw new Error( 'Unrecognized edge: ' + edge );
    }
}

export function glUniformRgba( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, color: Color ): void {
    gl.uniform4f( location, color.r, color.g, color.b, color.a );
}

export function glUniformInterval1D( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, interval: Interval1D ): void {
    gl.uniform2f( location, interval.min, interval.span );
}

export function glUniformInterval2D( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, interval: Interval2D ): void {
    gl.uniform4f( location, interval.xMin, interval.yMin, interval.w, interval.h );
}

export function glUniformSize2D( gl: WebGLRenderingContext, location: Nullable<WebGLUniformLocation>, size: Size2D ): void {
    gl.uniform2f( location, size.w, size.h );
}

export function doInitProgram( gl: WebGLRenderingContext, program: Nullable<WebGLProgram>, vertShader_GLSL: string, fragShader_GLSL: string ): void {
    const vertShader = gl.createShader( GL.VERTEX_SHADER );
    const fragShader = gl.createShader( GL.FRAGMENT_SHADER );
    try {
        compileShader( gl, vertShader, vertShader_GLSL );
        compileShader( gl, fragShader, fragShader_GLSL );
        linkProgram( gl, program, vertShader, fragShader );
    }
    finally {
        gl.deleteShader( vertShader );
        gl.deleteShader( fragShader );
    }
}

export function compileShader( gl: WebGLRenderingContext, shader: Nullable<WebGLShader>, glsl: string ): void {
    if ( shader != null ) {
        gl.shaderSource( shader, glsl );
        gl.compileShader( shader );
        if ( !gl.getShaderParameter( shader, GL.COMPILE_STATUS ) && !gl.isContextLost( ) ) {
            throw new Error( gl.getShaderInfoLog( shader ) ?? undefined );
        }
    }
}

export function linkProgram( gl: WebGLRenderingContext, program: Nullable<WebGLProgram>, ...shaders: Nullable<WebGLShader>[] ): void {
    if ( program != null ) {
        for ( const shader of shaders ) {
            if ( shader != null ) {
                gl.attachShader( program, shader );
            }
        }
        try {
            gl.linkProgram( program );
            if ( !gl.getProgramParameter( program, GL.LINK_STATUS ) && !gl.isContextLost( ) ) {
                throw new Error( gl.getProgramInfoLog( program ) ?? undefined );
            }
        }
        finally {
            for ( const shader of shaders ) {
                if ( shader != null ) {
                    gl.detachShader( program, shader );
                }
            }
        }
    }
}

export interface ShaderSource<UNIFORMS extends StringTuple, ATTRIBS extends StringTuple> {
    vertShader_GLSL: string;
    fragShader_GLSL: string;
    uniformNames?: UNIFORMS;
    attribNames: ATTRIBS;
}

export class ShaderProgram<UNIFORMS extends StringTuple, ATTRIBS extends StringTuple> {
    protected readonly vertShader_GLSL: string;
    protected readonly fragShader_GLSL: string;
    protected readonly uniformNames: Iterable<OneOf<UNIFORMS>>;
    protected readonly attribNames: Iterable<OneOf<ATTRIBS>>;

    protected glIncarnation: unknown;
    protected dProgram: Nullable<WebGLProgram>;
    protected dUniforms: Nullable<Record<OneOf<UNIFORMS>,Nullable<WebGLUniformLocation>>>;
    protected dAttribs: Nullable<Record<OneOf<ATTRIBS>,number>>;

    constructor( source: ShaderSource<UNIFORMS,ATTRIBS> ) {
        this.vertShader_GLSL = source.vertShader_GLSL;
        this.fragShader_GLSL = source.fragShader_GLSL;
        this.uniformNames = [ ...source.uniformNames ?? [] ];
        this.attribNames = [ ...source.attribNames ];

        this.glIncarnation = null;
        this.dProgram = null;
        this.dUniforms = null;
        this.dAttribs = null;
    }

    prepare( gl: WebGLRenderingContext, glIncarnation: object ): void {
        if ( glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = glIncarnation;
            this.dProgram = gl.createProgram( );

            doInitProgram( gl, this.dProgram, this.vertShader_GLSL, this.fragShader_GLSL );

            const dUniforms = {} as Record<OneOf<UNIFORMS>,Nullable<WebGLUniformLocation>>;
            for ( const uniformName of this.uniformNames ) {
                dUniforms[ uniformName ] = glGetUniformLocation( gl, this.dProgram, uniformName );
            }
            this.dUniforms = dUniforms;

            const dAttribs = {} as Record<OneOf<ATTRIBS>,number>;
            for ( const attribName of this.attribNames ) {
                dAttribs[ attribName ] = glGetAttribLocation( gl, this.dProgram, attribName );
            }
            this.dAttribs = dAttribs;
        }
    }

    get uniforms( ): Record<OneOf<UNIFORMS>,Nullable<WebGLUniformLocation>> {
        return requireNonNullish( this.dUniforms );
    }

    get attribs( ): Record<OneOf<ATTRIBS>,number> {
        return requireNonNullish( this.dAttribs );
    }

    get program( ): Nullable<WebGLProgram> {
        return this.dProgram;
    }

    dispose( gl: WebGLRenderingContext, glIncarnation: object ): void {
        if ( glIncarnation === this.glIncarnation ) {
            gl.deleteProgram( this.dProgram );
        }
        this.glIncarnation = null;
        this.dProgram = null;
    }
}

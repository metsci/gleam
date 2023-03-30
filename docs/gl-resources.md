# Managing GL Resources

A Gleam [`Context`](../packages/core/src/core/context.ts) has built-in functionality for managing GL resources (textures, buffers, shader programs) and a set of functions for doing common resource-handling operations conveniently. **This functionality is completely optional. Painters are welcome to ignore Gleam's convenience functionality and make WebGL calls directly.**

If you want to learn how to use WebGL directly, [https://webglfundamentals.org/](https://webglfundamentals.org/) is a great resource.


## Create or Update

When a painter calls `Context.getBuffer()`, if the context already has a GL buffer for the given ID, the context returns that existing buffer. Otherwise the context creates a new GL buffer and populates it by calling the given lambda.

That's the general idea, but there is one additional wrinkle. Often a painter will want to have a single GL buffer, and occasionally repopulate its contents when the painter's mutable state changes. To handle such cases, `Context.getBuffer()` takes one more argument that represents the `inputs` used to populate the buffer. If the buffer already exists but its `inputs` have changed, the existing buffer is used, but its contents are overwritten.

The context class also has `getTexture` and `getProgram` methods, which serve a similar purpose for GL textures and shader programs.


## Automatic Dispose

The context keeps track of the frame number on which each resource was last accessed. If a resource goes more than some number of frames without being accessed, the context will automatically dispose of it. This way painters don't need to worry about disposing of their GL resources.

The context does its best to spread out resource disposal across frames, to minimize the effect on frame rate. However, if there are too many resources waiting to be deleted, the context will give up on maintaining frame rate, and do as many of the waiting deletions as it needs to to get the number waiting back down to an acceptable level.


## Other Perks

Gleam's resource management mechanisms handle WebGL context loss. Caller doesn't have to worry about it.

Gleam's mechanism for managing shader programs has you list a program's uniform and attribute names, and then provides objects that support type-checking and auto-completion of those uniform and attribute names.


## Usage Example

Here's a custom painter impl showing how to use the Gleam context to manage GL resources. This is pretty concise as WebGL code goes -- especially given that it handles WebGL context loss properly, and gives type-checking and auto-completion of shader uniform and vertex-attribute names. And because we can always swap out any of the convenience fns and call WebGL fns directly, we're getting that conciseness without sacrificing much power or flexibility.

The first snippet shows the code with the level of comment verbosity typically seen in real code. The second snippet shows the same code, but with more verbose comments that explains what each line is doing.

With typical comment verbosity:

```typescript
import { bufferDataF32, vertexAttribPointer } from '@metsci/gleam-core';
// ... Other imports ...

import vertShader_GLSL from './shader.vert';
import fragShader_GLSL from './shader.frag';
const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'CUSTOM_UNIFORM',
        'ANOTHER_UNIFORM',
    ] as const,
    attribNames: [
        'inVertices',
    ] as const,
} );

export class CustomPainter implements Painter {
    // ... Standard painter stuff ...

    xCenter: number;
    yCenter: number;
    radius: number;

    constructor( ) {
        this.xCenter = 0;
        this.yCenter = 0;
        this.radius = 1;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Vertex buffer unique key
        const painterKey = context.getObjectKey( this );
        const verticesKey = `${painterKey}.myCustomVertices`;

        // Inputs to vertex buffer creation
        const xCenter = this.xCenter;
        const yCenter = this.yCenter;
        const radius = this.radius;
        const verticesInputs = new ValueBase( xCenter, yCenter, radius );

        // Get or create vertex buffer
        const vertices = context.getBuffer( verticesKey, verticesInputs, ( gl, target ) => {
            const xys = new Array<number>( );
            for ( const thetaRad = 0; thetaRad < 2*Math.PI; thetaRad += 0.1*Math.PI ) {
                const x = xCenter + radius*Math.cos( thetaRad );
                const y = yCenter + radius*Math.sin( thetaRad );
                xys.push( x, y );
            }
            return bufferDataF32( gl, target, new Float32Array( xys ), 2 );
        } );

        // Render
        const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );
        gl.useProgram( program );
        gl.enableVertexAttribArray( attribs.inVertices );
        try {
            gl.uniform1f( uniforms.CUSTOM_UNIFORM, 0 );
            gl.uniform1f( uniforms.ANOTHER_UNIFORM, 0 );
            vertexAttribPointer( gl, attribs.inVertices, vertices );
            gl.drawArrays( GL.POINTS, 0, vertices.meta.unitCount );
        }
        finally {
            gl.disableVertexAttribArray( attribs.inVertices );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        // GL resources are all context-owned, and will get pruned automatically
    }
}
```


Here's the same code, with more verbose comments:

```typescript
import { bufferDataF32, vertexAttribPointer } from '@metsci/gleam-core';
// ... Other imports ...

// Import GLSL sources as strings
// May require a bundler plugin, e.g. rollup-plugin-string
import vertShader_GLSL from './shader.vert';
import fragShader_GLSL from './shader.frag';

// Using `as const` on the array literals allows the type checker to check
// that the code below sticks to the uniforms and attributes listed here
const PROG_SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        // Names of uniforms from vert and frag shaders
        'CUSTOM_UNIFORM',
        'ANOTHER_UNIFORM',
    ] as const,
    attribNames: [
        // Names of vertex attributes from vert shader
        'inVertices',
    ] as const,
} );

export class CustomPainter implements Painter {
    // ... Standard painter stuff ...

    // Public mutable fields -- modifications are picked up on the next repaint
    xCenter: number;
    yCenter: number;
    radius: number;

    constructor( ) {
        this.xCenter = 0;
        this.yCenter = 0;
        this.radius = 1;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Unique key for the GL buffer we're about to get or create
        const painterKey = context.getObjectKey( this );
        const verticesKey = `${painterKey}.myCustomVertices`;

        // Current state that determines the contents of the GL buffer
        // Inputs can also come from the painter's CSS style (not shown here)
        const xCenter = this.xCenter;
        const yCenter = this.yCenter;
        const radius = this.radius;

        // Wrap the input state in a ValueObject which the context will use to
        // check whether the existing buffer (if there is one) is out of date
        const verticesInputs = new ValueBase( xCenter, yCenter, radius );

        // If the buffer doesn't exist, create a new one
        // If the buffer exists but its inputs have changed, replace it
        // Otherwise get the existing buffer
        const vertices = context.getBuffer( verticesKey, verticesInputs, ( gl, target ) => {
            // Generate XY coords
            const xys = new Array<number>( );
            for ( const thetaRad = 0; thetaRad < 2*Math.PI; thetaRad += 0.1*Math.PI ) {
                // Don't think too hard about the code shown here, it's only
                // meant to convey that this is where coords get computed
                const x = xCenter + radius*Math.cos( thetaRad );
                const y = yCenter + radius*Math.sin( thetaRad );
                xys.push( x, y );
            }

            // Push coords to the given GL target, and return representative metadata
            // The literal 2 here is number of components per vertex: X and Y
            return bufferDataF32( gl, target, new Float32Array( xys ), 2 );
        } );

        // Get the shader program, compiling it if it doesn't already exist
        const { program, attribs, uniforms } = context.getProgram( PROG_SOURCE );

        // Render using program and vertices buffer
        gl.useProgram( program );
        gl.enableVertexAttribArray( attribs.inVertices );
        try {
            // Set uniform values
            // Type checker recognizes uniform names from the list above
            gl.uniform1f( uniforms.CUSTOM_UNIFORM, 0 );
            gl.uniform1f( uniforms.ANOTHER_UNIFORM, 0 );

            // Use our vertex buffer for the `inVertices` attribute
            // NB: This vertexAttribPointer() is a convenience fn imported above
            vertexAttribPointer( gl, attribs.inVertices, vertices );

            // Render, using a vertex count based on metadata from our vertex buffer
            gl.drawArrays( GL.POINTS, 0, vertices.meta.unitCount );
        }
        finally {
            gl.disableVertexAttribArray( attribs.inVertices );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        // GL resources are all context-owned, and will get pruned automatically
    }
}
```


## Without Convenience Mechanisms

Here's an example painter that doesn't use the convenience mechanisms in `Context`. **This is a perfectly valid way to implement a painter.** It's more verbose, but it lets you make WebGL calls directly, and gives you complete control of behavior.

First with typical comment verbosity:

```typescript
import { equal } from '@metsci/gleam-util';
import { doInitProgram } from '@metsci/gleam-core';
// ... Other imports ...

import vertShader_GLSL from './shader.vert';
import fragShader_GLSL from './shader.frag';

export class CustomPainter implements Painter {
    // ... Standard painter stuff ...

    xCenter: number;
    yCenter: number;
    radius: number;

    protected glIncarnation: unknown;

    // Vertices buffer
    protected vertices: WebGLBuffer | null;
    protected verticesCount: number;
    protected verticesInputs: unknown;

    // Shader program
    protected program: WebGLProgram | null;
    protected CUSTOM_UNIFORM: WebGLUniformLocation | null;
    protected ANOTHER_UNIFORM: WebGLUniformLocation | null;
    protected inVertices: number;

    constructor( ) {
        this.xCenter = 0;
        this.yCenter = 0;
        this.radius = 1;

        this.glIncarnation = null;

        this.vertices = null;
        this.verticesCount = 0;
        this.verticesInputs = undefined;

        this.program = null;
        this.CUSTOM_UNIFORM = null;
        this.ANOTHER_UNIFORM = null;
        this.inVertices = -1;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Reset GL resources if necessary
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;

            this.vertices = gl.createBuffer( );
            this.verticesCount = 0;
            this.verticesInputs = undefined;

            this.program = gl.createProgram( );
            doInitProgram( gl, this.program, vertShader_GLSL, fragShader_GLSL );
            this.CUSTOM_UNIFORM = this.program ? gl.getUniformLocation( this.program, 'CUSTOM_UNIFORM' ) : null;
            this.ANOTHER_UNIFORM = this.program ? gl.getUniformLocation( this.program, 'ANOTHER_UNIFORM' ) : null;
            this.inVertices = this.program ? gl.getAttribLocation( this.program, 'inVertices' ) : -1;
        }

        // Inputs to vertex buffer creation
        const xCenter = this.xCenter;
        const yCenter = this.yCenter;
        const radius = this.radius;
        const verticesInputs = new ValueBase( xCenter, yCenter, radius );

        // Repopulate the GL buffer, if necessary
        if ( !equal( verticesInputs, this.verticesInputs ) ) {
            const xys = new Array<number>( );
            for ( const thetaRad = 0; thetaRad < 2*Math.PI; thetaRad += 0.1*Math.PI ) {
                const x = xCenter + radius*Math.cos( thetaRad );
                const y = yCenter + radius*Math.sin( thetaRad );
                xys.push( x, y );
            }
            gl.bindBuffer( GL.ARRAY_BUFFER, this.vertices );
            gl.bufferData( GL.ARRAY_BUFFER, new Float32Array( xys ), GL.STATIC_DRAW );
            this.verticesCount = Math.floor( xys.length / 2 );
            this.verticesInputs = verticesInputs;
        }

        // Render
        gl.useProgram( this.program );
        gl.enableVertexAttribArray( this.inVertices );
        try {
            gl.uniform1f( this.CUSTOM_UNIFORM, 0 );
            gl.uniform1f( this.ANOTHER_UNIFORM, 0 );

            gl.bindBuffer( GL.ARRAY_BUFFER, this.vertices );
            gl.vertexAttribPointer( this.inVertices, 2, GL.FLOAT, false, 0, 0 );

            gl.drawArrays( GL.POINTS, 0, this.verticesCount );
        }
        finally {
            gl.disableVertexAttribArray( this.inVertices );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;

        gl.deleteProgram( this.program );
        this.program = null;
        this.CUSTOM_UNIFORM = null;
        this.ANOTHER_UNIFORM = null;
        this.inVertices = -1;

        gl.deleteBuffer( this.vertices );
        this.vertices = null;
        this.verticesInputs = undefined;
        this.verticesCount = 0;

        this.glIncarnation = null;
    }
}
```


Same code again, with more verbose comments:

```typescript
import { equal } from '@metsci/gleam-util';
import { doInitProgram } from '@metsci/gleam-core';
// ... Other imports ...

// Import GLSL sources as strings
// May require a bundler plugin, e.g. rollup-plugin-string
import vertShader_GLSL from './shader.vert';
import fragShader_GLSL from './shader.frag';

export class CustomPainter implements Painter {
    // ... Standard painter stuff ...

    xCenter: number;
    yCenter: number;
    radius: number;

    // Used for detecting WebGL context loss
    protected glIncarnation: unknown;

    // GL buffer
    protected vertices: WebGLBuffer | null;

    // Number of vertices in the GL buffer's current contents
    protected verticesCount: number;

    // Snapshot of values that the GL buffer's current contents are based on
    protected verticesInputs: unknown;

    // Shader program, uniforms, and vertex attributes
    protected program: WebGLProgram | null;
    protected CUSTOM_UNIFORM: WebGLUniformLocation | null;
    protected ANOTHER_UNIFORM: WebGLUniformLocation | null;
    protected inVertices: number;

    constructor( ) {
        this.xCenter = 0;
        this.yCenter = 0;
        this.radius = 1;

        this.glIncarnation = null;

        this.vertices = null;
        this.verticesCount = 0;
        this.verticesInputs = undefined;

        this.program = null;
        this.CUSTOM_UNIFORM = null;
        this.ANOTHER_UNIFORM = null;
        this.inVertices = -1;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        // Reset GL resources if this is our first paint, or the WebGL context has changed since previous paint
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;

            this.vertices = gl.createBuffer( );
            this.verticesCount = 0;
            this.verticesInputs = undefined;

            // Shader program doesn't change between frames, so init is only needed when there's a new WebGL context
            this.program = gl.createProgram( );

            // Use a convenience fn to compile the shaders and link them into a program
            // You can do the WebGL calls directly, but it's ~50 sloc
            doInitProgram( gl, this.program, vertShader_GLSL, fragShader_GLSL );

            // Uniforms in vert and frag shaders
            this.CUSTOM_UNIFORM = this.program ? gl.getUniformLocation( this.program, 'CUSTOM_UNIFORM' ) : null;
            this.ANOTHER_UNIFORM = this.program ? gl.getUniformLocation( this.program, 'ANOTHER_UNIFORM' ) : null;

            // Vertex attributes in vert shader
            this.inVertices = this.program ? gl.getAttribLocation( this.program, 'inVertices' ) : -1;
        }

        // Inputs to vertex buffer creation
        // Inputs can also come from the painter's CSS style (not shown here)
        const xCenter = this.xCenter;
        const yCenter = this.yCenter;
        const radius = this.radius;

        // Wrap the input state in a ValueObject which the context will use to
        // check whether the existing buffer (if there is one) is out of date
        const verticesInputs = new ValueBase( xCenter, yCenter, radius );

        // Repopulate the GL buffer, if necessary
        if ( !equal( verticesInputs, this.verticesInputs ) ) {
            // Generate XY coords
            const xys = new Array<number>( );
            for ( const thetaRad = 0; thetaRad < 2*Math.PI; thetaRad += 0.1*Math.PI ) {
                // Don't think too hard about the code shown here, it's only
                // meant to convey that this is where coords get computed
                const x = xCenter + radius*Math.cos( thetaRad );
                const y = yCenter + radius*Math.sin( thetaRad );
                xys.push( x, y );
            }

            // Push values to the GL device
            // Could keep a Float32Array for scratch space, instead of making a new one each time
            // Could keep track of GL buffer size, and do gl.bufferSubData() when possible
            gl.bindBuffer( GL.ARRAY_BUFFER, this.vertices );
            gl.bufferData( GL.ARRAY_BUFFER, new Float32Array( xys ), GL.STATIC_DRAW );

            // Remember how many vertices are in the GL buffer's current contents
            this.verticesCount = Math.floor( xys.length / 2 );

            // Remember what inputs the GL buffer's current contents are based on
            this.verticesInputs = verticesInputs;
        }

        // Render
        gl.useProgram( this.program );
        gl.enableVertexAttribArray( this.inVertices );
        try {
            gl.uniform1f( this.CUSTOM_UNIFORM, 0 );
            gl.uniform1f( this.ANOTHER_UNIFORM, 0 );

            // Set up the XY vertex attribute
            gl.bindBuffer( GL.ARRAY_BUFFER, this.vertices );
            gl.vertexAttribPointer( this.inVertices, 2, GL.FLOAT, false, 0, 0 );

            // Render
            gl.drawArrays( GL.POINTS, 0, this.verticesCount );
        }
        finally {
            gl.disableVertexAttribArray( this.inVertices );
            gl.useProgram( null );
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;

        // Delete the GL shader program
        gl.deleteProgram( this.program );
        this.program = null;
        this.CUSTOM_UNIFORM = null;
        this.ANOTHER_UNIFORM = null;
        this.inVertices = -1;

        // Delete the GL buffer
        gl.deleteBuffer( this.vertices );
        this.vertices = null;
        this.verticesInputs = undefined;
        this.verticesCount = 0;

        // Reset everything to reflect that we're now in an uninitialized state
        this.glIncarnation = null;
    }
}
```

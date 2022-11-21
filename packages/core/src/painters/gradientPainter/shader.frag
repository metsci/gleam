#version 100
precision lowp float;

uniform sampler2D COLOR_TABLE;

varying float vColorTableFrac;

void main( ) {
    vec4 rgba = texture2D( COLOR_TABLE, vec2( vColorTableFrac, 0.0 ) );
    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );
}

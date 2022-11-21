#version 100
precision lowp float;

uniform vec4 RGBA;

void main( ) {
    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );
}

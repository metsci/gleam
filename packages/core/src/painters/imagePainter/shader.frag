#version 100
precision lowp float;

uniform lowp sampler2D IMAGE;

varying vec2 vSt_FRAC;

void main( ) {
    vec4 rgba = texture2D( IMAGE, vSt_FRAC );
    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );
}

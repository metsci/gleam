#version 100
precision lowp float;

uniform lowp sampler2D ATLAS;
uniform vec4 RGBA;

varying vec2 vSt_FRAC;

void main( ) {
    float mask = 1.0 - texture2D( ATLAS, vSt_FRAC ).r;
    float alpha = mask * RGBA.a;
    gl_FragColor = vec4( alpha*RGBA.rgb, alpha );
}

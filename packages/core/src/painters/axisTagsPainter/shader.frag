#version 100
precision lowp float;

uniform lowp sampler2D IMAGE;
uniform vec4 RGBA;

varying vec2 vSt_FRAC;

void main( ) {
    float mask = texture2D( IMAGE, vSt_FRAC ).r;
    float alpha = mask * RGBA.a;
    gl_FragColor = vec4( alpha*RGBA.rgb, alpha );
}

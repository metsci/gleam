#version 100
precision lowp float;

varying float vSize_PX;
varying vec4 vRgba;

void main( ) {
    float alpha = vRgba.a;
    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );
}

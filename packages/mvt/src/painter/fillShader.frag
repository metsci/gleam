#version 100
precision lowp float;

uniform vec4 COLOR;

void main( ) {
    gl_FragColor = vec4( COLOR.a*COLOR.rgb, COLOR.a );
}

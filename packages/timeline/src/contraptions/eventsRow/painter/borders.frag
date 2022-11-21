#version 100
precision lowp float;


varying lowp vec4 vColor;


void main( ) {
    gl_FragColor = vec4( vColor.a*vColor.rgb, vColor.a );
}

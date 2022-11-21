#version 100
precision lowp float;

uniform vec4 COLOR;

void main( ) {
    float alpha = COLOR.a;
    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );
}

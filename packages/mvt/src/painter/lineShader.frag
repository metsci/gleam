#version 100
precision lowp float;

uniform vec4 COLOR;
uniform float THICKNESS_PX;
uniform float FEATHER_PX;

varying float vLateral_PX;

void main( ) {
    float featherMask = smoothstep( 0.5*( THICKNESS_PX + FEATHER_PX ), 0.5*( THICKNESS_PX - FEATHER_PX ), abs( vLateral_PX ) );

    float alpha = featherMask * COLOR.a;
    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );
}

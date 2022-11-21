#version 100
precision lowp float;

uniform vec4 COLOR;
uniform float DIAMETER_PX;
uniform float FEATHER_PX;

void main( ) {
    vec2 xy_PX = ( gl_PointCoord - 0.5 )*( DIAMETER_PX + FEATHER_PX );
    float r_PX = sqrt( dot( xy_PX, xy_PX ) );

    float rOuter_PX = 0.5*( DIAMETER_PX + FEATHER_PX );
    float rInner_PX = 0.5*( DIAMETER_PX - FEATHER_PX );
    float featherMask = smoothstep( rOuter_PX, rInner_PX, r_PX );

    float alpha = featherMask * COLOR.a;
    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );
}

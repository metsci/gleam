#version 100
precision lowp float;

uniform float THICKNESS_PX;
uniform float FEATHER_PX;

varying float vSize_PX;
varying vec4 vRgba;

void main( ) {
    vec2 xy_NPC = -1.0 + 2.0*gl_PointCoord;
    float r_NPC = sqrt( dot( xy_NPC, xy_NPC ) );

    float pxToNpc = 2.0 / vSize_PX;
    float rD_NPC = 1.0 - 0.5*pxToNpc;
    float rC_NPC = rD_NPC - FEATHER_PX*pxToNpc;
    float rB_NPC = rC_NPC - max( 0.0, THICKNESS_PX - FEATHER_PX )*pxToNpc;
    float rA_NPC = rB_NPC - FEATHER_PX*pxToNpc;
    float mask = smoothstep( rD_NPC, rC_NPC, r_NPC ) * smoothstep( rA_NPC, rB_NPC, r_NPC );

    float alpha = mask * vRgba.a;
    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );
}

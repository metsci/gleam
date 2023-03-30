#version 100

uniform vec2 VIEWPORT_SIZE_PX;
uniform lowp float THICKNESS_PX;
uniform lowp float FEATHER_PX;

/**
 * Coords: x_STEPS, y_STEPS, dxForward_STEPS (unnormalized), dyForward_STEPS (unnormalized)
 */
attribute vec4 inCoords;
attribute vec4 inXyOriginAndStep_PX;

varying float vLateral_PX;

void main( ) {
    vec2 origin_PX = inXyOriginAndStep_PX.xy;
    vec2 step_PX = inXyOriginAndStep_PX.zw;

    vec2 xy_STEPS = inCoords.xy;
    vec2 xy_PX = origin_PX + xy_STEPS*step_PX;

    vec2 dxyForward_STEPS = inCoords.zw;
    vec2 dxyForward_PX = dxyForward_STEPS*step_PX;
    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );
    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );

    vec2 xyFinal_PX = xy_PX + 0.5*( THICKNESS_PX + FEATHER_PX )*dxyRightUnit_PX;
    vec2 xyFinal_NDC = -1.0 + 2.0*( xyFinal_PX / VIEWPORT_SIZE_PX );

    gl_Position = vec4( xyFinal_NDC, 0.0, 1.0 );

    bool negativeLateral = ( dxyForward_STEPS.x < 0.0 || ( dxyForward_STEPS.x == 0.0 && dxyForward_STEPS.y < 0.0 ) );
    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );
}

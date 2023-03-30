#version 100

uniform vec2 VIEWPORT_SIZE_PX;
uniform lowp float DIAMETER_PX;
uniform lowp float FEATHER_PX;

/**
 * Coords: x_STEPS, y_STEPS
 */
attribute vec2 inCoords;
attribute vec4 inXyOriginAndStep_PX;

void main( ) {
    vec2 origin_PX = inXyOriginAndStep_PX.xy;
    vec2 step_PX = inXyOriginAndStep_PX.zw;

    vec2 xy_STEPS = inCoords.xy;
    vec2 xy_PX = origin_PX + xy_STEPS*step_PX;
    vec2 xy_NDC = -1.0 + 2.0*( xy_PX / VIEWPORT_SIZE_PX );

    gl_Position = vec4( xy_NDC, 0.0, 1.0 );
    gl_PointSize = DIAMETER_PX + FEATHER_PX;
}

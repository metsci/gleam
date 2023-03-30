#version 100

vec2 min2D( vec4 interval2D ) {
    return interval2D.xy;
}

vec2 span2D( vec4 interval2D ) {
    return interval2D.zw;
}

uniform vec4 AXIS_LIMITS;
uniform vec4 AXIS_VIEWPORT_PX;
uniform lowp float THICKNESS_PX;
uniform lowp float FEATHER_PX;

/**
 * Coords: x, y, dxForward (unnormalized), dyForward (unnormalized)
 */
attribute vec4 inCoords;

varying float vLateral_PX;

void main( ) {
    vec2 xy_XYAXIS = inCoords.xy;
    vec2 xy_FRAC = ( xy_XYAXIS - min2D( AXIS_LIMITS ) ) / span2D( AXIS_LIMITS );
    vec2 xy_PX = xy_FRAC * span2D( AXIS_VIEWPORT_PX );

    vec2 dxyForward_XYAXIS = inCoords.zw;
    vec2 dxyForward_FRAC = dxyForward_XYAXIS / span2D( AXIS_LIMITS );
    vec2 dxyForward_PX = dxyForward_FRAC * span2D( AXIS_VIEWPORT_PX );
    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );
    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );

    vec2 xyFinal_PX = xy_PX + 0.5*( THICKNESS_PX + FEATHER_PX )*dxyRightUnit_PX;
    vec2 xyFinal_NDC = -1.0 + 2.0*( xyFinal_PX / span2D( AXIS_VIEWPORT_PX ) );

    gl_Position = vec4( xyFinal_NDC, 0.0, 1.0 );

    bool negativeLateral = ( dxyForward_XYAXIS.x < 0.0 || ( dxyForward_XYAXIS.x == 0.0 && dxyForward_XYAXIS.y < 0.0 ) );
    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );
}

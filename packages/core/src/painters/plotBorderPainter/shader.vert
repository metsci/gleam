#version 100

vec2 min2D( vec4 interval2D ) {
    return interval2D.xy;
}

vec2 span2D( vec4 interval2D ) {
    return interval2D.zw;
}


uniform vec4 VIEWPORT_PX;
uniform vec4 AXIS_VIEWPORT_PX;


/**
 * Coords: xBase_XFRAC, yBase_YFRAC, xOffset_PX, yOffset_PX
 */
attribute vec4 inCoords;


void main( ) {
    vec2 base_AFRAC = inCoords.xy;
    vec2 base_APX = base_AFRAC * span2D( AXIS_VIEWPORT_PX );
    vec2 base_VPX = min2D( AXIS_VIEWPORT_PX ) - min2D( VIEWPORT_PX ) + base_APX;

    vec2 offset_PX = inCoords.zw;
    vec2 final_VPX = base_VPX + offset_PX;
    vec2 final_NDC = -1.0 + ( 2.0 * final_VPX )/span2D( VIEWPORT_PX );
    gl_Position = vec4( final_NDC, 0.0, 1.0 );
}

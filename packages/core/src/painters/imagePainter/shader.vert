#version 100


vec2 min2D( vec4 interval2D ) {
    return interval2D.xy;
}

vec2 span2D( vec4 interval2D ) {
    return interval2D.zw;
}

vec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {
    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );
    return ( -1.0 + 2.0*frac );
}


uniform vec4 VIEWPORT_PX;
uniform vec2 ANCHOR_PX;

/**
 * Coords: xOffset_PX, yOffset_PX, s_FRAC, t_FRAC
 */
attribute vec4 inCoords;

varying vec2 vSt_FRAC;


void main( ) {
    vec2 xyOffset_PX = inCoords.xy;
    vec2 xy_PX = ANCHOR_PX + xyOffset_PX;
    vec2 xy_NDC = coordsToNdc2D( xy_PX, VIEWPORT_PX );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    vSt_FRAC = inCoords.zw;
}

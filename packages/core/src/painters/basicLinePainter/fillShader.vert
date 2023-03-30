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


uniform vec4 AXIS_LIMITS;

/**
 * Coords: x, y
 */
attribute vec2 inCoords;


void main( ) {
    vec2 xy_XYAXIS = inCoords.xy;
    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );
}

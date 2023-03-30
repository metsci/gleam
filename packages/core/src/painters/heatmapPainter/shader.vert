#version 100

vec2 min2D( vec4 interval2D ) {
    return interval2D.xy;
}

vec2 span2D( vec4 interval2D ) {
    return interval2D.zw;
}

vec4 coordsToNdc2D( vec2 coords, vec4 bounds ) {
    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );
    return vec4( -1.0 + 2.0*frac, 0.0, 1.0 );
}

uniform vec4 XY_LIMITS;

/**
 * Coords: x_XAXIS, y_YAXIS, s_FRAC, t_FRAC
 */
attribute vec4 inCoords;

varying vec2 vSt_FRAC;

void main( ) {
    gl_Position = coordsToNdc2D( inCoords.xy, XY_LIMITS );
    vSt_FRAC = inCoords.zw;
}

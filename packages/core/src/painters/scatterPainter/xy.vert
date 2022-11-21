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


uniform vec4 XY_BOUNDS;

uniform vec4 FIXED_RGBA;

uniform float FIXED_SIZE_PX;


/**
 * Coords: x_XAXIS, y_YAXIS
 */
attribute vec2 inCoords;

varying float vSize_PX;
varying vec4 vRgba;


void main( ) {
    vec2 xy_XYAXIS = inCoords.xy;
    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );

    vRgba = FIXED_RGBA;

    vSize_PX = FIXED_SIZE_PX;
    gl_PointSize = vSize_PX;
}

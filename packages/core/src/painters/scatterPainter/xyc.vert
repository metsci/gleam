#version 100


float min1D( vec2 interval1D ) {
    return interval1D.x;
}

float span1D( vec2 interval1D ) {
    return interval1D.y;
}

vec2 min2D( vec4 interval2D ) {
    return interval2D.xy;
}

vec2 span2D( vec4 interval2D ) {
    return interval2D.zw;
}

float coordToFrac1D( float coord, vec2 bounds ) {
    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );
}

vec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {
    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );
    return ( -1.0 + 2.0*frac );
}


uniform vec4 XY_BOUNDS;

uniform vec2 C_BOUNDS;
uniform sampler2D VARIABLE_COLOR_TABLE;

uniform float FIXED_SIZE_PX;


/**
 * Coords: x_XAXIS, y_YAXIS, c_CAXIS
 */
attribute vec3 inCoords;

varying float vSize_PX;
varying vec4 vRgba;


void main( ) {
    vec2 xy_XYAXIS = inCoords.xy;
    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );

    float c_CAXIS = inCoords.z;
    float c_CFRAC = clamp( coordToFrac1D( c_CAXIS, C_BOUNDS ), 0.0, 1.0 );
    vRgba = texture2D( VARIABLE_COLOR_TABLE, vec2( c_CFRAC, 0.0 ) );

    vSize_PX = FIXED_SIZE_PX;
    gl_PointSize = vSize_PX;
}

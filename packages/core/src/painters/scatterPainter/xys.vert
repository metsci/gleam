#version 100


const int SIZE_FUNC_LINEAR = 0;
const int SIZE_FUNC_QUADRATIC = 1;
const int SIZE_FUNC_SQRT = 2;


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

float fracToCoord1D( float frac, vec2 bounds ) {
    return ( min1D( bounds ) + frac*span1D( bounds ) );
}

vec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {
    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );
    return ( -1.0 + 2.0*frac );
}

float size_PX( float coord, vec2 bounds, int sizeFunc, vec2 sizeLimits_PX ) {
    float frac = clamp( coordToFrac1D( coord, bounds ), 0.0, 1.0 );
    if ( sizeFunc == SIZE_FUNC_LINEAR ) {
        return fracToCoord1D( frac, sizeLimits_PX );
    }
    else if ( sizeFunc == SIZE_FUNC_QUADRATIC ) {
        return fracToCoord1D( frac*frac, sizeLimits_PX );
    }
    else if ( sizeFunc == SIZE_FUNC_SQRT ) {
        return fracToCoord1D( sqrt( frac ), sizeLimits_PX );
    }
    else {
        return min1D( sizeLimits_PX );
    }
}


uniform vec4 XY_BOUNDS;

uniform vec4 FIXED_RGBA;

uniform vec2 S_BOUNDS;
uniform vec2 VARIABLE_SIZE_LIMITS_PX;
uniform int VARIABLE_SIZE_FUNC;


/**
 * Coords: x_XAXIS, y_YAXIS, s_SAXIS
 */
attribute vec4 inCoords;


varying float vSize_PX;
varying vec4 vRgba;


void main( ) {
    vec2 xy_XYAXIS = inCoords.xy;
    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );

    vRgba = FIXED_RGBA;

    float s_SAXIS = inCoords.z;
    vSize_PX = size_PX( s_SAXIS, S_BOUNDS, VARIABLE_SIZE_FUNC, VARIABLE_SIZE_LIMITS_PX );
    gl_PointSize = vSize_PX;
}

#version 100


float min1D( vec2 interval1D ) {
    return interval1D.x;
}

float span1D( vec2 interval1D ) {
    return interval1D.y;
}

float fracToCoord1D( float frac, vec2 bounds ) {
    return ( min1D( bounds ) + frac*span1D( bounds ) );
}

float coordToFrac1D( float coord, vec2 bounds ) {
    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );
}

float fracToNdc1D( float frac ) {
    return ( -1.0 + 2.0*frac );
}


uniform int AXIS_IS_VERTICAL;
uniform vec2 AXIS_LIMITS;
uniform vec2 COLOR_LIMITS;


/**
 * Coords: colorBoundsFrac, orthoFrac
 */
attribute vec3 inCoords;


varying float vColorTableFrac;


void main( ) {
    float colorLimitsFrac = inCoords.x;
    float axisCoord = fracToCoord1D( colorLimitsFrac, COLOR_LIMITS );
    float axisFrac = coordToFrac1D( axisCoord, AXIS_LIMITS );
    float axisNdc = fracToNdc1D( axisFrac );

    float orthoFrac = inCoords.y;
    float orthoNdc = fracToNdc1D( orthoFrac );

    if ( AXIS_IS_VERTICAL == 1 ) {
        gl_Position = vec4( orthoNdc, axisNdc, 0.0, 1.0 );
    }
    else {
        gl_Position = vec4( axisNdc, orthoNdc, 0.0, 1.0 );
    }

    vColorTableFrac = colorLimitsFrac;
}

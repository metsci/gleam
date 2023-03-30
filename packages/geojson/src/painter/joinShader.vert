#version 100


float yMin( vec4 interval2D ) {
    return interval2D.y;
}

float xSpan( vec4 interval2D ) {
    return interval2D.z;
}

float ySpan( vec4 interval2D ) {
    return interval2D.w;
}

float subtractSplitValues( vec2 vSplit, vec2 wSplit ) {
    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );
}


uniform vec4 VIEWPORT_BOUNDS_AXIS;
uniform lowp float DIAMETER_PX;
uniform lowp float FEATHER_PX;


/**
 * Coords: xA_AXIS, xB_AXIS, y_AXIS
 */
attribute vec3 inVertices;

/**
 * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS
 */
attribute vec2 inViewportXMins;


void main( ) {
    vec2 x_AXIS = inVertices.xy;
    vec2 xViewportMin_AXIS = inViewportXMins;
    float x_VIEWFRAC = subtractSplitValues( x_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );

    float y_AXIS = inVertices.z;
    float y_VIEWFRAC = ( y_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );

    vec2 xy_NDC = -1.0 + 2.0*vec2( x_VIEWFRAC, y_VIEWFRAC );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    gl_PointSize = DIAMETER_PX + FEATHER_PX;
}

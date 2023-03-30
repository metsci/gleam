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

vec2 xySpan( vec4 interval2D ) {
    return interval2D.zw;
}

float subtractSplitValues( vec2 vSplit, vec2 wSplit ) {
    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );
}


uniform vec2 VIEWPORT_SIZE_PX;
uniform vec4 VIEWPORT_BOUNDS_AXIS;
uniform lowp float THICKNESS_PX;
uniform lowp float FEATHER_PX;


/**
 * Coords: xA_AXIS, xB_AXIS, y_AXIS
 */
attribute vec3 inVerticesA;

/**
 * Coords: dxForward_AXIS (unnormalized), dyForward_AXIS (unnormalized)
 */
attribute vec2 inVerticesB;

/**
 * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS
 */
attribute vec2 inViewportXMins;


varying float vLateral_PX;


void main( ) {
    vec2 x_AXIS = inVerticesA.xy;
    vec2 xViewportMin_AXIS = inViewportXMins;
    float x_VIEWFRAC = subtractSplitValues( x_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );

    float y_AXIS = inVerticesA.z;
    float y_VIEWFRAC = ( y_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );

    vec2 dxyForward_AXIS = inVerticesB.xy;
    vec2 dxyForward_VIEWFRAC = dxyForward_AXIS / xySpan( VIEWPORT_BOUNDS_AXIS );
    vec2 dxyForward_PX = dxyForward_VIEWFRAC * VIEWPORT_SIZE_PX;
    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );
    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );
    vec2 dxyRight_PX = 0.5*( THICKNESS_PX + FEATHER_PX ) * dxyRightUnit_PX;
    vec2 dxyRight_VIEWFRAC = dxyRight_PX / VIEWPORT_SIZE_PX;

    vec2 xy_VIEWFRAC = vec2( x_VIEWFRAC, y_VIEWFRAC );
    vec2 xy_NDC = -1.0 + 2.0*( xy_VIEWFRAC + dxyRight_VIEWFRAC );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    bool negativeLateral = ( dxyForward_AXIS.x < 0.0 || ( dxyForward_AXIS.x == 0.0 && dxyForward_AXIS.y < 0.0 ) );
    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );
}

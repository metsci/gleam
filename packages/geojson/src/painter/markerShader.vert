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
uniform vec4 IMAGE_SPRAWL_PX;

/**
 * Coords: xAnchorA_AXIS, xAnchorB_AXIS, yAnchor_AXIS
 */
attribute vec3 inVerticesA;

/**
 * Coords: xInImage_IMAGEFRAC, yInImage_IMAGEFRAC
 */
attribute vec2 inVerticesB;

/**
 * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS
 */
attribute vec2 inViewportXMins;


varying lowp vec2 v_st;


void main( ) {
    vec2 xAnchor_AXIS = inVerticesA.xy;
    vec2 xViewportMin_AXIS = inViewportXMins;
    float xAnchor_VIEWFRAC = subtractSplitValues( xAnchor_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );

    float yAnchor_AXIS = inVerticesA.z;
    float yAnchor_VIEWFRAC = ( yAnchor_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );

    float sprawlLeft_PX = IMAGE_SPRAWL_PX.x;
    float sprawlRight_PX = IMAGE_SPRAWL_PX.y;
    float sprawlTop_PX = IMAGE_SPRAWL_PX.z;
    float sprawlBottom_PX = IMAGE_SPRAWL_PX.w;

    // Line up the bottom-left corner of the image with the bottom-left corner of a screen pixel
    xAnchor_VIEWFRAC = ( floor( xAnchor_VIEWFRAC*VIEWPORT_SIZE_PX.x + sprawlLeft_PX + 0.5 ) - sprawlLeft_PX ) / VIEWPORT_SIZE_PX.x;
    yAnchor_VIEWFRAC = ( floor( yAnchor_VIEWFRAC*VIEWPORT_SIZE_PX.y + sprawlBottom_PX + 0.5 ) - sprawlBottom_PX ) / VIEWPORT_SIZE_PX.y;

    vec2 xyInImage_IMAGEFRAC = inVerticesB;
    float dxToCorner_VIEWFRAC = ( sprawlLeft_PX + xyInImage_IMAGEFRAC.x*( sprawlRight_PX - sprawlLeft_PX ) ) / VIEWPORT_SIZE_PX.x;
    float dyToCorner_VIEWFRAC = ( sprawlBottom_PX + xyInImage_IMAGEFRAC.y*( sprawlTop_PX - sprawlBottom_PX ) ) / VIEWPORT_SIZE_PX.y;

    vec2 xy_NDC = -1.0 + 2.0*vec2( xAnchor_VIEWFRAC + dxToCorner_VIEWFRAC, yAnchor_VIEWFRAC + dyToCorner_VIEWFRAC );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    v_st = vec2( xyInImage_IMAGEFRAC.x, 1.0 - xyInImage_IMAGEFRAC.y );
}

#version 100


const int NORTH = 0;
const int SOUTH = 1;
const int EAST = 2;
const int WEST = 3;


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

float xMin( vec4 interval2D ) {
    return interval2D.x;
}

float yMin( vec4 interval2D ) {
    return interval2D.y;
}

float xSpan( vec4 interval2D ) {
    return interval2D.z;
}

float ySpan( vec4 interval2D ) {
    return interval2D.w;
}


uniform vec4 VIEWPORT_PX;
uniform int EDGE;

uniform vec2 AXIS_LIMITS;
uniform vec2 AXIS_VIEWPORT_PX;

uniform lowp sampler2D IMAGE;
uniform vec2 IMAGE_SIZE_PX;
uniform vec2 IMAGE_ANCHOR_PX;


/**
 * Coords: tagCoord_AXIS, s_FRAC, t_FRAC
 */
attribute vec3 inCoords;


varying vec2 vSt_FRAC;


void main( ) {
    float coord_ACOORD = inCoords.x;
    float coord_AFRAC = ( coord_ACOORD - min1D( AXIS_LIMITS ) ) / span1D( AXIS_LIMITS );
    float coord_APX = coord_AFRAC * span1D( AXIS_VIEWPORT_PX );

    vec2 st_IFRAC = inCoords.yz;
    vec2 tip_APX = vec2( 0.0, coord_APX );
    vec2 corner_APX = floor( ( tip_APX - IMAGE_ANCHOR_PX ) + 0.5 );
    vec2 xy_APX = corner_APX + ( st_IFRAC * vec2( IMAGE_SIZE_PX ) );

    float x_VPX;
    float y_VPX;
    if ( EDGE == NORTH ) {
        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;
        y_VPX = xy_APX.x;
    }
    else if ( EDGE == SOUTH ) {
        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;
        y_VPX = ySpan( VIEWPORT_PX ) - xy_APX.x;
    }
    else if ( EDGE == EAST ) {
        x_VPX = xy_APX.x;
        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;
    }
    else {
        x_VPX = xSpan( VIEWPORT_PX ) - xy_APX.x;
        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;
    }

    vec2 xy_NDC = -1.0 + ( 2.0 * vec2( x_VPX, y_VPX ) )/span2D( VIEWPORT_PX );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );
    vSt_FRAC = st_IFRAC;
}

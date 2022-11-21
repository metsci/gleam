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
 * xMin, xMax, yMin, yMax
 */
uniform vec4 DATA_CLAMP_LIMITS;

uniform lowp float JOIN_DIAMETER_PX;
uniform lowp float DATA_DIAMETER_PX;
uniform lowp float DATA_CLAMPED_DIAMETER_PX;
uniform lowp vec4 JOIN_COLOR;
uniform lowp vec4 DATA_COLOR;
uniform lowp vec4 DATA_CLAMPED_COLOR;
uniform lowp float FEATHER_PX;

/**
 * Coords: x, y, isData
 */
attribute vec3 inCoords;

varying float vDiameter_PX;
varying vec4 vColor;


void main( ) {
    bool isData = ( inCoords.z >= 0.5 );

    vec2 xy_XYAXIS;
    if ( isData ) {
        xy_XYAXIS = clamp( inCoords.xy, DATA_CLAMP_LIMITS.xz, DATA_CLAMP_LIMITS.yw );
        bool isClamped = ( xy_XYAXIS != inCoords.xy );
        vDiameter_PX = ( isClamped ? DATA_CLAMPED_DIAMETER_PX : DATA_DIAMETER_PX );
        vColor = ( isClamped ? DATA_CLAMPED_COLOR : DATA_COLOR );
    }
    else {
        xy_XYAXIS = inCoords.xy;
        vDiameter_PX = JOIN_DIAMETER_PX;
        vColor = JOIN_COLOR;
    }

    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );
    gl_PointSize = vDiameter_PX + FEATHER_PX;
}

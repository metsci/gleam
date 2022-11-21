#version 100

/**
 * Coords: x_NDC, y_NDC, s_FRAC, t_FRAC
 */
attribute vec4 inCoords;

varying vec2 vSt_FRAC;

void main( ) {
    vec2 xy_NDC = inCoords.xy;
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    vSt_FRAC = inCoords.zw;
}

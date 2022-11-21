#version 100

/**
 * Coords: x_NDC, y_NDC
 */
attribute vec2 inCoords;

/**
 * Color: r, g, b, a
 */
attribute vec4 inColor;

varying vec4 vColor;

void main( ) {
    vec2 xy_NDC = inCoords.xy;
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    vColor = inColor;
}

#version 100
precision lowp float;


uniform sampler2D PATTERNS_ATLAS;

varying highp vec4 vStBounds;
varying highp vec2 vStUnwrapped;


void main( ) {
    highp vec2 stMin = vStBounds.xy;
    highp vec2 stSpan = vStBounds.zw;
    highp vec2 st = stMin + mod( vStUnwrapped, stSpan );

    vec4 rgba = texture2D( PATTERNS_ATLAS, st );
    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );
}

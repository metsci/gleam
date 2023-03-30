#version 100
precision lowp float;

uniform sampler2D IMAGE_TEXTURE;

varying lowp vec2 v_st;

void main( ) {
    vec4 rgba = texture2D( IMAGE_TEXTURE, v_st );
    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );
}

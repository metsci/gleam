#version 100
precision lowp float;


uniform sampler2D ATLAS;
uniform highp vec2 ATLAS_SIZE_PX;


varying highp float v_sMin_PX;
varying highp float v_dsUnpacked_PX;
varying highp float v_t_PX;
varying lowp float v_isAlphaMask;
varying lowp vec4 v_alphaMaskColor;
varying lowp float v_fadeMask;


void main( ) {
    vec4 rgba;
    if ( v_isAlphaMask >= 0.5 ) {
        float ds_PX = floor( 0.25*v_dsUnpacked_PX + 0.01 );
        float s_PX = v_sMin_PX + ds_PX + 0.5;

        vec4 texel = texture2D( ATLAS, vec2( s_PX, v_t_PX )/ATLAS_SIZE_PX );
        float componentIndex = floor( v_dsUnpacked_PX - 4.0*ds_PX + 0.01 );

        float mask;
        if ( componentIndex < 0.5 ) {
            mask = texel.r;
        }
        else if ( componentIndex < 1.5 ) {
            mask = texel.g;
        }
        else if ( componentIndex < 2.5 ) {
            mask = texel.b;
        }
        else {
            mask = texel.a;
        }

        float a = v_alphaMaskColor.a * clamp( mask, 0.0, 1.0 );
        rgba = vec4( v_alphaMaskColor.rgb, a );
    }
    else {
        float ds_PX = v_dsUnpacked_PX;
        float s_PX = v_sMin_PX + ds_PX;
        rgba = texture2D( ATLAS, vec2( s_PX, v_t_PX )/ATLAS_SIZE_PX );
    }

    float a = rgba.a * clamp( v_fadeMask, 0.0, 1.0 );
    gl_FragColor = vec4( a*rgba.rgb, a );
}

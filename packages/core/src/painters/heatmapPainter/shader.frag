#version 100
precision lowp float;

float min1D( vec2 interval1D ) {
    return interval1D.x;
}

float span1D( vec2 interval1D ) {
    return interval1D.y;
}

float coordToFrac1D( float coord, vec2 bounds ) {
    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );
}

bool isNaN( float x ) {
    // Deliberately convoluted to avoid being optimized away
    return ( x < 0.0 || 0.0 < x || x == 0.0 ) ? false : true;
}

const int INTERPOLATE_NEITHER = 0;
const int INTERPOLATE_S = 1;
const int INTERPOLATE_T = 2;
const int INTERPOLATE_BOTH = 3;

uniform int INTERP_MODE;
uniform sampler2D VALUE_TABLE;
uniform vec2 VALUE_TABLE_SIZE;
uniform sampler2D COLOR_TABLE;
uniform vec2 COLOR_LIMITS;

varying vec2 vSt_FRAC;

void main( ) {
    vec2 st_FRAC;
    if ( INTERP_MODE == INTERPOLATE_BOTH ) {
        st_FRAC = vSt_FRAC;
    }
    else if ( INTERP_MODE == INTERPOLATE_S ) {
        float s_FRAC = vSt_FRAC.s;
        float t_FRAC = ( floor( vSt_FRAC.t*VALUE_TABLE_SIZE.t ) + 0.5 ) / VALUE_TABLE_SIZE.t;
        st_FRAC = vec2( s_FRAC, t_FRAC );
    }
    else if ( INTERP_MODE == INTERPOLATE_T ) {
        float s_FRAC = ( floor( vSt_FRAC.s*VALUE_TABLE_SIZE.s ) + 0.5 ) / VALUE_TABLE_SIZE.s;
        float t_FRAC = vSt_FRAC.t;
        st_FRAC = vec2( s_FRAC, t_FRAC );
    }
    else {
        st_FRAC = ( floor( vSt_FRAC*VALUE_TABLE_SIZE ) + 0.5 ) / VALUE_TABLE_SIZE;
    }

    float value = texture2D( VALUE_TABLE, st_FRAC ).r;
    if ( isNaN( value ) ) {
        discard;
    }
    else {
        float frac = coordToFrac1D( value, COLOR_LIMITS );
        vec4 rgba = texture2D( COLOR_TABLE, vec2( frac, 0.0 ) );
        gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );
    }
}

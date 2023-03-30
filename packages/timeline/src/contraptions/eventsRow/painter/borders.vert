#version 100


float round( float v ) {
    return floor( v + 0.5 );
}

int intRound( float v ) {
    return int( v + 0.5 );
}


/**
 * Device Pixel Ratio, for converting between LPX and PX.
 */
uniform float DPR;

/**
 * viewMinHi_PSEC, viewMinLo_PSEC, viewSpan_SEC
 */
uniform vec3 X_VIEW_LIMITS;

uniform vec4 VIEWPORT_PX;
uniform float LANE_HEIGHT_PX;
uniform float EVENT_MIN_APPARENT_WIDTH_PX;

/**
 * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES
 * Texel 2: IGNORED, styleIndex, IGNORED, IGNORED
 */
uniform highp sampler2D EVENTS_TABLE;
uniform vec2 EVENTS_TABLE_SIZE;

vec4 readEventInfoA( float eventIndex ) {
    float texelIndex = 2.0*eventIndex + 0.0;
    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );
    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;
    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );
}

vec4 readEventInfoB( float eventIndex ) {
    float texelIndex = 2.0*eventIndex + 1.0;
    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );
    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;
    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );
}

/**
 * Texel 1: IGNORED, IGNORED, IGNORED, IGNORED
 * Texel 2: IGNORED, thickness_LPX, ( 8-bit red, 8-bit green ), ( 8-bit blue, 8-bit alpha )
 * Texel 3: barMarginBottom_LPX, barMarginTop_LPX
 */
uniform highp sampler2D STYLES_TABLE;
uniform vec2 STYLES_TABLE_SIZE;

vec4 readStyleInfoB( float styleIndex ) {
    float texelIndex = 3.0*styleIndex + 1.0;
    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );
    float x = texelIndex - y*STYLES_TABLE_SIZE.x;
    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );
}

vec4 readStyleInfoC( float styleIndex ) {
    float texelIndex = 3.0*styleIndex + 2.0;
    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );
    float x = texelIndex - y*STYLES_TABLE_SIZE.x;
    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );
}

/**
 * eventIndex, ( 2-bit X rung, 2-bit Y rung )
 *
 * Rungs:   3 ┌─────────┐
 *          2 │ ┌─────┐ │
 *            │ │     │ │
 *          1 │ └─────┘ │
 *          0 └─────────┘
 *            0 1     2 3
 */
attribute vec2 inVertexCoords;

/**
 * Most of this shader follows the same code path for all vertices in
 * an event. Those parts can effectively discard the event by setting
 * gl_Position to this value, then returning. This puts the event's
 * vertices outside the viewport, and all at the same spot so the
 * event has zero size.
 */
const vec4 DISCARD_EVENT = vec4( -2.0, -2.0, -2.0, 1.0 );

varying lowp vec4 vColor;


void main( ) {
    float eventIndex = inVertexCoords.x;
    float cornerCombined = inVertexCoords.y;
    float xRung = floor( cornerCombined / 4.0 );
    float yRung = round( cornerCombined - 4.0*xRung );

    // Misc context
    float xViewMinHi_PSEC = X_VIEW_LIMITS.x;
    float xViewMinLo_PSEC = X_VIEW_LIMITS.y;
    float xViewSpan_SEC = X_VIEW_LIMITS.z;
    float xViewSpan_PX = VIEWPORT_PX.z;
    float yViewSpan_PX = VIEWPORT_PX.w;

    // Event info
    vec4 eventInfoA = readEventInfoA( eventIndex );
    vec4 eventInfoB = readEventInfoB( eventIndex );
    float xEventLeftHi_PSEC = eventInfoA.x;
    float xEventLeftLo_PSEC = eventInfoA.y;
    float dxDuration_SEC = eventInfoA.z;
    float yEventTopFromViewMax_LANES = eventInfoA.w;
    float styleIndex = eventInfoB.y;
    vec4 styleInfoB = readStyleInfoB( styleIndex );
    vec4 styleInfoC = readStyleInfoC( styleIndex );
    float thickness_LPX = styleInfoB.y;
    float thickness_PX = round( thickness_LPX * DPR );
    float redGreen = styleInfoB.z;
    float blueAlpha = styleInfoB.w;
    float marginBottom_LPX = styleInfoC.x;
    float marginTop_LPX = styleInfoC.y;
    float marginBottom_PX = round( marginBottom_LPX * DPR );
    float marginTop_PX = round( marginTop_LPX * DPR );

    // Event edges
    float xEventLeftFromViewMin_SEC = ( xEventLeftHi_PSEC - xViewMinHi_PSEC ) + ( xEventLeftLo_PSEC - xViewMinLo_PSEC );
    float xEventRightFromViewMin_SEC = xEventLeftFromViewMin_SEC + dxDuration_SEC;
    if ( xEventRightFromViewMin_SEC < 0.0 || xEventLeftFromViewMin_SEC > xViewSpan_SEC ) {
        gl_Position = DISCARD_EVENT;
        return;
    }

    // X of current vertex
    float x_PX;
    float x0_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );
    float x3_PX = max( x0_PX + EVENT_MIN_APPARENT_WIDTH_PX, round( xEventRightFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC ) );
    float xThickness_PX = min( thickness_PX, 0.5*( x3_PX - x0_PX ) );
    if ( xRung < 0.5 ) {
        x_PX = x0_PX;
    }
    else if ( xRung < 1.5 ) {
        x_PX = x0_PX + xThickness_PX;
    }
    else if ( xRung < 2.5 ) {
        x_PX = x3_PX - xThickness_PX;
    }
    else {
        x_PX = x3_PX;
    }
    float x_FRAC = x_PX / xViewSpan_PX;
    float x_NDC = -1.0 + 2.0*x_FRAC;

    // Y of current vertex
    float y_PX;
    float y0_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + marginBottom_PX );
    float y3_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 0.0 )*LANE_HEIGHT_PX - marginTop_PX );
    float yThickness_PX = min( thickness_PX, y3_PX - y0_PX );
    if ( yRung < 0.5 ) {
        y_PX = y0_PX;
    }
    else if ( yRung < 1.5 ) {
        y_PX = y0_PX + yThickness_PX;
    }
    else if ( yRung < 2.5 ) {
        y_PX = y3_PX - yThickness_PX;
    }
    else {
        y_PX = y3_PX;
    }
    float y_FRAC = y_PX / yViewSpan_PX;
    float y_NDC = -1.0 + 2.0*y_FRAC;

    // Set position coords
    gl_Position = vec4( x_NDC, y_NDC, 0.0, 1.0 );

    // Set color
    float red = floor( redGreen / 256.0 );
    float green = redGreen - 256.0*red;
    float blue = floor( blueAlpha / 256.0 );
    float alpha = blueAlpha - 256.0*blue;
    vColor = vec4( red/255.0, green/255.0, blue/255.0, alpha/255.0 );
}

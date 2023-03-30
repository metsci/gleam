#version 100


float round( float v ) {
    return floor( v + 0.5 );
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
 * Texel 2: IGNORED, IGNORED, IGNORED, IGNORED
 * Texel 3: barMarginBottom_LPX, barMarginTop_LPX
 */
uniform highp sampler2D STYLES_TABLE;
uniform vec2 STYLES_TABLE_SIZE;

vec4 readStyleInfoC( float styleIndex ) {
    float texelIndex = 3.0*styleIndex + 2.0;
    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );
    float x = texelIndex - y*STYLES_TABLE_SIZE.x;
    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );
}

/**
 * vec4 stBounds = texture2D( PATTERNS_TOC, vec2( patternIndex, 0.0 ) )
 * vec2 stMin = stBounds.xy
 * vec2 stSpan = stBounds.zw
 */
uniform highp sampler2D PATTERNS_TOC;
uniform float PATTERNS_TOC_SIZE;

uniform highp vec2 PATTERNS_ATLAS_SIZE_PX;

/**
 * eventIndex, ( 1-bit X frac, 1-bit Y frac )
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

varying highp vec4 vStBounds;
varying highp vec2 vStUnwrapped;


void main( ) {
    float eventIndex = inVertexCoords.x;
    float cornerCombined = inVertexCoords.y;
    float xEdge = floor( cornerCombined / 2.0 );
    float yEdge = round( cornerCombined - 2.0*xEdge );

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
    vec4 styleInfoC = readStyleInfoC( styleIndex );
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
    float xEventLeft_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );
    float xEventRight_PX = max( xEventLeft_PX + EVENT_MIN_APPARENT_WIDTH_PX, round( xEventRightFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC ) );
    float x_PX = ( xEdge < 0.5 ? xEventLeft_PX : xEventRight_PX );

    // Pattern tile info
    vec4 stBounds = texture2D( PATTERNS_TOC, vec2( ( styleIndex + 0.5 )/PATTERNS_TOC_SIZE, 0.0 ) );

    // Make texture X coord start at the left edge of the leftmost VISIBLE pattern
    // tile -- don't start at the event's left edge, which may be so many pixels
    // left of viewMin that texture-coord interp runs into precision limits
    float xPatternLeft_PX = xEventLeft_PX;
    if ( xEventLeft_PX < 0.0 ) {
        float tileWidth_PX = stBounds.z * PATTERNS_ATLAS_SIZE_PX.x;
        xPatternLeft_PX += tileWidth_PX * floor( -xEventLeft_PX / tileWidth_PX );
    }

    // Y of current vertex
    float yBottom_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + marginBottom_PX );
    float yTop_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 0.0 )*LANE_HEIGHT_PX - marginTop_PX );
    float y_PX = ( yEdge < 0.5 ? yBottom_PX : yTop_PX );

    // Set position coords
    vec2 xy_PX = vec2( x_PX, y_PX );
    vec2 xyViewSpan_PX = VIEWPORT_PX.zw;
    vec2 xy_NDC = -1.0 + 2.0*( xy_PX / xyViewSpan_PX );
    gl_Position = vec4( xy_NDC, 0.0, 1.0 );

    // Set pattern coords
    vStBounds = stBounds;
    vStUnwrapped = ( xy_PX - vec2( xPatternLeft_PX, yTop_PX ) ) / PATTERNS_ATLAS_SIZE_PX;
}

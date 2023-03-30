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

/**
 * If a string is too long to fit, this is the width of the zone
 * over which the string's rightmost glyphs fade to transparent.
 */
uniform float FADE_ZONE_PX;

/**
 * Each texel holds 4 indices into GLYPHS_TABLE.
 */
uniform highp sampler2D CODES;
uniform vec2 CODES_SIZE;
float readGlyphCode( float codeIndex ) {
    float texelIndex = floor( codeIndex / 4.0 );
    float y = floor( texelIndex / CODES_SIZE.x );
    float x = texelIndex - y*CODES_SIZE.x;
    vec4 raw = texture2D( CODES, ( vec2( x, y ) + 0.5 )/CODES_SIZE );
    float componentIndex = codeIndex - 4.0*texelIndex;

    float v;
    if ( componentIndex < 0.5 ) {
        v = raw.r;
    }
    else if ( componentIndex < 1.5 ) {
        v = raw.g;
    }
    else if ( componentIndex < 2.5 ) {
        v = raw.b;
    }
    else {
        v = raw.a;
    }
    return round( v );
}

/**
 * Texel 1: sMin_PX, tMin_PX, sUnpackedSpan_PX, tSpan_PX
 * Texel 2: ascent_PX, isAlphaMask, IGNORED, IGNORED
 */
uniform highp sampler2D GLYPHS_TABLE;
uniform vec2 GLYPHS_TABLE_SIZE;

vec4 readGlyphInfoA( float glyphIndex ) {
    float texelIndex = 2.0*glyphIndex + 0.0;
    float y = floor( texelIndex / GLYPHS_TABLE_SIZE.x );
    float x = texelIndex - y*GLYPHS_TABLE_SIZE.x;
    return texture2D( GLYPHS_TABLE, ( vec2( x, y ) + 0.5 )/GLYPHS_TABLE_SIZE );
}

vec4 readGlyphInfoB( float glyphIndex ) {
    float texelIndex = 2.0*glyphIndex + 1.0;
    float y = floor( texelIndex / GLYPHS_TABLE_SIZE.x );
    float x = texelIndex - y*GLYPHS_TABLE_SIZE.x;
    return texture2D( GLYPHS_TABLE, ( vec2( x, y ) + 0.5 )/GLYPHS_TABLE_SIZE );
}

/**
 * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES
 * Texel 2: firstCodeIndex, styleIndex, xRightNeighborHi_PSEC, xRightNeighborLo_PSEC
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
 * Texel 1: xOffset_LPX, yOffset_LPX, ( 8-bit fgRed, 8-bit fgGreen ), ( 8-bit fgBlue, 8-bit fgAlpha )
 * Texel 2: allowXOvershoot, IGNORED, IGNORED, IGNORED
 * Texel 3: IGNORED, IGNORED, IGNORED, IGNORED
 */
uniform highp sampler2D STYLES_TABLE;
uniform vec2 STYLES_TABLE_SIZE;

vec4 readStyleInfoA( float styleIndex ) {
    float texelIndex = 3.0*styleIndex + 0.0;
    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );
    float x = texelIndex - y*STYLES_TABLE_SIZE.x;
    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );
}

vec4 readStyleInfoB( float styleIndex ) {
    float texelIndex = 3.0*styleIndex + 1.0;
    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );
    float x = texelIndex - y*STYLES_TABLE_SIZE.x;
    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );
}

/**
 * eventIndex, ( 14-bit codeInString, 2-bit corner )
 *
 * corner = 2 - 3
 *          |   |
 *          0 - 1
 */
attribute vec2 inVertexCoords;

/**
 * WebGL 1 requires loop bounds to be compile-time constants, so
 * we declare a const max bound, then break out of the loop when
 * the counter reaches the (dynamic) actual bound.
 *
 * Setting the max bound too low would make long labels unusable,
 * so use a large value. Old and very-low-end graphics hardware
 * may choke on such a large value at shader-compile time -- but
 * this painter wouldn't be practically usable on such hardware
 * anyway. Better to work well on decent hardware, and fail quickly
 * on very-low-end hardware.
 *
 * TODO: Remove this when we switch to webgl2
 */
const float MAX_GLYPHS_PER_EVENT = 99999.0;

const float NULL_FLOAT = -1.0;

/**
 * Each block is 7 glyph codes and then a pointer to the next block
 */
const float FLOATS_PER_BLOCK = 8.0;

/**
 * Most of this shader follows the same code path for all vertices in
 * a glyph. Those parts can effectively discard the glyph by setting
 * gl_Position to this value, then returning. This puts the glyph's
 * vertices outside the viewport, and all at the same spot so the
 * glyph has zero size.
 */
const vec4 DISCARD_GLYPH = vec4( -2.0, -2.0, -2.0, 1.0 );


varying highp float v_sMin_PX;
varying highp float v_dsUnpacked_PX;
varying highp float v_t_PX;
varying lowp float v_isAlphaMask;
varying lowp vec4 v_alphaMaskColor;
varying lowp float v_fadeMask;


void main( ) {
    float eventIndex = inVertexCoords.x;
    float combinedCoord = inVertexCoords.y;
    float codeInString = floor( combinedCoord / 4.0 );
    float cornerNum = round( combinedCoord - 4.0*codeInString );

    // Whole-event values
    vec4 eventInfoA = readEventInfoA( eventIndex );
    vec4 eventInfoB = readEventInfoB( eventIndex );
    float xEventLeftHi_PSEC = eventInfoA.x;
    float xEventLeftLo_PSEC = eventInfoA.y;
    float dxDuration_SEC = eventInfoA.z;
    float yEventTopFromViewMax_LANES = eventInfoA.w;
    float firstCodeIndex = eventInfoB.x;
    float styleIndex = eventInfoB.y;
    float xRightNeighborHi_PSEC = eventInfoB.z;
    float xRightNeighborLo_PSEC = eventInfoB.w;
    vec4 styleInfoA = readStyleInfoA( styleIndex );
    vec4 styleInfoB = readStyleInfoB( styleIndex );
    float xOffset_LPX = styleInfoA.x;
    float yOffset_LPX = styleInfoA.y;
    float maskRedGreen = styleInfoA.z;
    float maskBlueAlpha = styleInfoA.w;
    float allowXOvershoot = styleInfoB.x;
    float maskRed = floor( maskRedGreen / 256.0 );
    float maskGreen = maskRedGreen - 256.0*maskRed;
    float maskBlue = floor( maskBlueAlpha / 256.0 );
    float maskAlpha = maskBlueAlpha - 256.0*maskBlue;
    float xOffset_PX = xOffset_LPX * DPR;
    float yOffset_PX = yOffset_LPX * DPR;

    // X context
    float xViewMinHi_PSEC = X_VIEW_LIMITS.x;
    float xViewMinLo_PSEC = X_VIEW_LIMITS.y;
    float xViewSpan_SEC = X_VIEW_LIMITS.z;
    float xViewSpan_PX = VIEWPORT_PX.z;

    // X of event's left edge
    float xEventLeftFromViewMin_SEC = ( xEventLeftHi_PSEC - xViewMinHi_PSEC ) + ( xEventLeftLo_PSEC - xViewMinLo_PSEC );
    if ( xEventLeftFromViewMin_SEC > xViewSpan_SEC ) {
        gl_Position = DISCARD_GLYPH;
        return;
    }
    float xEventLeft_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );

    // X where glyphs get cut off
    float xCutoffFromViewMin_SEC;
    if ( allowXOvershoot >= 0.5 ) {
        xCutoffFromViewMin_SEC = ( xRightNeighborHi_PSEC - xViewMinHi_PSEC ) + ( xRightNeighborLo_PSEC - xViewMinLo_PSEC );
    }
    else {
        xCutoffFromViewMin_SEC = xEventLeftFromViewMin_SEC + dxDuration_SEC;
    }
    if ( xCutoffFromViewMin_SEC < 0.0 ) {
        gl_Position = DISCARD_GLYPH;
        return;
    }
    float xCutoff_PX = xCutoffFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC;
    float xFadeZoneLeft_PX = xCutoff_PX - FADE_ZONE_PX;

    // Index of current glyph code, and X of glyph's left edge
    float xGlyphLeft_PX = xEventLeft_PX + xOffset_PX;
    float codeIndex = firstCodeIndex;
    for ( float i = 0.0; i < MAX_GLYPHS_PER_EVENT; i++ ) {
        if ( i >= codeInString ) {
            break;
        }

        // Visit glyph
        if ( xGlyphLeft_PX >= xCutoff_PX ) {
            gl_Position = DISCARD_GLYPH;
            return;
        }
        if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {
            codeIndex = readGlyphCode( codeIndex );
        }
        if ( codeIndex == NULL_FLOAT ) {
            gl_Position = DISCARD_GLYPH;
            return;
        }
        float glyphIndex = readGlyphCode( codeIndex );
        if ( glyphIndex == NULL_FLOAT ) {
            gl_Position = DISCARD_GLYPH;
            return;
        }
        vec4 glyphInfoA = readGlyphInfoA( glyphIndex );
        float glyphUnpackedWidth_PX = glyphInfoA.z;

        // Advance to the next code
        xGlyphLeft_PX += glyphUnpackedWidth_PX;
        codeIndex++;
    }

    // Glyph to render
    if ( xGlyphLeft_PX >= xCutoff_PX ) {
        gl_Position = DISCARD_GLYPH;
        return;
    }
    if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {
        codeIndex = readGlyphCode( codeIndex );
    }
    if ( codeIndex == NULL_FLOAT ) {
        gl_Position = DISCARD_GLYPH;
        return;
    }
    float glyphIndex = readGlyphCode( codeIndex );
    if ( glyphIndex == NULL_FLOAT ) {
        gl_Position = DISCARD_GLYPH;
        return;
    }
    vec4 glyphInfoA = readGlyphInfoA( glyphIndex );
    float glyphUnpackedWidth_PX = glyphInfoA.z;

    float xGlyphFrac = mod( cornerNum, 2.0 );
    float dx_PX = xGlyphFrac * glyphUnpackedWidth_PX;
    float x_PX = xGlyphLeft_PX + dx_PX;
    float x_FRAC = x_PX / xViewSpan_PX;
    float x_NDC = -1.0 + 2.0*x_FRAC;

    // Y context
    float yViewSpan_PX = VIEWPORT_PX.w;

    // Y of glyph's bottom
    float glyphHeight_PX = glyphInfoA.w;
    vec4 glyphInfoB = readGlyphInfoB( glyphIndex );
    float ascent_PX = glyphInfoB.x;
    float descent_PX = glyphHeight_PX - ascent_PX;
    float yGlyphBottom_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + yOffset_PX - descent_PX );

    // Y of current vertex
    float yGlyphFrac = mod( floor( cornerNum / 2.0 ), 2.0 );
    float y_PX = yGlyphBottom_PX + yGlyphFrac*glyphHeight_PX;
    float y_FRAC = y_PX / yViewSpan_PX;
    float y_NDC = -1.0 + 2.0*y_FRAC;

    // Set position coords
    gl_Position = vec4( x_NDC, y_NDC, 0.0, 1.0 );

    // Set texture coords
    v_sMin_PX = glyphInfoA.x;
    v_dsUnpacked_PX = dx_PX;
    float tMin_PX = glyphInfoA.y;
    v_t_PX = tMin_PX + ( 1.0 - yGlyphFrac )*glyphHeight_PX;

    // Set info for alpha-mask glyphs
    v_isAlphaMask = glyphInfoB.y;
    v_alphaMaskColor = vec4( maskRed/255.0, maskGreen/255.0, maskBlue/255.0, maskAlpha/255.0 );

    // Set fade mask
    v_fadeMask = 1.0;
    float xGlyphRight_PX = xGlyphLeft_PX + glyphUnpackedWidth_PX;
    if ( xGlyphRight_PX >= xFadeZoneLeft_PX ) {
        codeIndex++;

        int doesWholeStringFit = 1;
        for ( float i = 0.0; i < MAX_GLYPHS_PER_EVENT; i++ ) {
            // Visit glyph
            if ( xGlyphRight_PX >= xCutoff_PX ) {
                doesWholeStringFit = 0;
                break;
            }
            if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {
                codeIndex = readGlyphCode( codeIndex );
            }
            if ( codeIndex == NULL_FLOAT ) {
                break;
            }
            float glyphIndex = readGlyphCode( codeIndex );
            if ( glyphIndex == NULL_FLOAT ) {
                break;
            }
            vec4 glyphInfoA = readGlyphInfoA( glyphIndex );
            float glyphUnpackedWidth_PX = glyphInfoA.z;

            // Advance to the next code
            xGlyphRight_PX += glyphUnpackedWidth_PX;
            codeIndex++;
        }

        if ( doesWholeStringFit == 0 ) {
            v_fadeMask = ( xCutoff_PX - x_PX ) / ( xCutoff_PX - xFadeZoneLeft_PX );
        }
    }
}

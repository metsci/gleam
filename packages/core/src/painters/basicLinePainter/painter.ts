/**
 * Copyright (c) 2022, Metron, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { alwaysTrue, clamp, equal, Interval2D, isDefined, Nullable, RefBasic, run, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, cssColor, cssEnum, cssFloat, currentDpr, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, GL, GLSL_HIGHP_MAXVALUE, glUniformInterval2D, glUniformRgba, PeerType, pushBufferToDevice_BYTES, put3f, put4f, put6f, StyleProp, ValueBase2 } from '../../support';
import { frozenSupplier } from '../../util';

import fillFragShader_GLSL from './fillShader.frag';
import fillVertShader_GLSL from './fillShader.vert';
import lineFragShader_GLSL from './lineShader.frag';
import lineVertShader_GLSL from './lineShader.vert';
import pointFragShader_GLSL from './pointShader.frag';
import pointVertShader_GLSL from './pointShader.vert';

const FILL_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: fillVertShader_GLSL,
    fragShader_GLSL: fillFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'COLOR',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

const LINE_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: lineVertShader_GLSL,
    fragShader_GLSL: lineFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'AXIS_VIEWPORT_PX',
        'THICKNESS_PX',
        'FEATHER_PX',
        'COLOR',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

const POINT_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: pointVertShader_GLSL,
    fragShader_GLSL: pointFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'DATA_CLAMP_LIMITS',
        'FEATHER_PX',
        'JOIN_DIAMETER_PX',
        'DATA_DIAMETER_PX',
        'DATA_CLAMPED_DIAMETER_PX',
        'JOIN_COLOR',
        'DATA_COLOR',
        'DATA_CLAMPED_COLOR',
    ] as const,
    attribNames: [
        'inCoords',
    ] as const,
} );

/**
 * Abstract representation of a basic line:
 *  - `length`: number of vertices
 *  - `xRef` and `yRef`: references relative to which coords are rendered
 *  - `x(i)` and `y(i)`: the coords of vertex `i`
 *  - `connect(i)`: whether there's a line segment between vertices `i` and `i+1`
 *
 * If either `x(i)` or `y(i)` returns `undefined`, vertex `i` will not be
 * drawn, and vertex `i-1` won't be connected to vertex `i+1`.
 *
 * If `xRef` or `yRef` is `undefined`, the largest index `i` for which *both* `x(i)`
 * and `y(i)` are defined will be found, and its coords will be used as fallbacks
 * for `xRef` and `yRef` independently.
 *
 * A "solo" vertex is one that has no line segments on either side. By default, a
 * solo vertex will be drawn as a dot, and the dot will be slightly larger than
 * the line thickness. These defaults can be overridden with the `--dot-mode` and
 * `--dot-diameter-px` CSS properties.
 *
 * An undefined `connect` method is equivalent to one that always returns `true`.
 *
 * Additional per-line information can be included as custom properties. These
 * are handy when using an input-spectator that gets passed the line object.
 */
export interface BasicLine {
    length: number;
    xRef?: number;
    yRef?: number;
    x( index: number ): number | undefined;
    y( index: number ): number | undefined;
    connect?( index: number ): boolean;
    [customProp: string]: unknown;
}

export enum BasicLineLineMode {
    /**
     * Don't connect dots.
     */
    OFF,

    /**
     * Connect vertices with straight lines.
     */
    STRAIGHT,

    /**
     * Assume X is monotonic, and stairstep up and down.
     */
    STEP_UP_DOWN,

    /**
     * Assume Y is monotonic, and stairstep left and right.
     */
    STEP_LEFT_RIGHT,
}

export enum BasicLineRiserMode {
    OFF,
    ON,
}

export enum BasicLineOffscreenDataIndicator {
    OFF,
    ON,
    MIN,
    MAX,
}

export function indicateDataBelowMin( mode: BasicLineOffscreenDataIndicator ): boolean {
    switch ( mode ) {
        case BasicLineOffscreenDataIndicator.ON: return true;
        case BasicLineOffscreenDataIndicator.MIN: return true;
        default: return false;
    }
}

export function indicateDataAboveMax( mode: BasicLineOffscreenDataIndicator ): boolean {
    switch ( mode ) {
        case BasicLineOffscreenDataIndicator.ON: return true;
        case BasicLineOffscreenDataIndicator.MAX: return true;
        default: return false;
    }
}

export enum BasicLineStepAlign {
    BEFORE_DATAPOINT,
    CENTERED_ON_DATAPOINT,
    AFTER_DATAPOINT,
}

export enum BasicLineDotMode {
    /**
     * Don't draw any dots.
     */
    OFF,

    /**
     * Draw dots at all data-points.
     */
    ALL,

    /**
     * Draw dots at data-points that aren't connected to a line segment
     * on either side.
     */
    SOLO,
}

export enum BasicLineFillMode {
    OFF,
    VERTICAL,
    HORIZONTAL,
}

interface CoordFn {
    ( index: number ): number | undefined;
}

function relativeCoordFn( coordFn: CoordFn, refCoord: number | undefined ): CoordFn {
    if ( refCoord === undefined || refCoord === 0 ) {
        return coordFn;
    }
    else {
        return i => {
            const coord = coordFn( i );
            return ( coord === undefined ? undefined : coord - refCoord );
        };
    }
}

function relativizeLine( line: BasicLine, xRef: number | undefined, yRef: number | undefined ): BasicLine {
    return {
        length: line.length,
        x: relativeCoordFn( line.x, xRef ),
        y: relativeCoordFn( line.y, yRef ),
        connect: line.connect,
    };
}

function relativizeInputs( inputs: CoordInputs, xRef: number | undefined, yRef: number | undefined ): CoordInputs {
    const { lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline } = inputs;
    switch ( fillMode ) {
        case BasicLineFillMode.OFF: {
            return inputs;
        }
        case BasicLineFillMode.VERTICAL: {
            if ( yRef === undefined || yRef === 0 ) {
                return inputs;
            }
            else {
                return new CoordInputs( lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline - yRef );
            }
        }
        case BasicLineFillMode.HORIZONTAL: {
            if ( xRef === undefined || xRef === 0 ) {
                return inputs;
            }
            else {
                return new CoordInputs( lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline - xRef );
            }
        }
        default: {
            throw new Error( 'Unsupported fill mode: ' + fillMode );
        }
    }
}

interface BasicLineCoords {
    hLineCoords: Float32Array;
    hPointCoords: Float32Array;
    hFillCoords: Float32Array;
    hLineCoordsCount: number;
    hPointCoordsCount: number;
    hFillCoordsCount: number;
}

interface BasicLineScratch {
    /**
     * Coords: x, y, dxForward (unnormalized), dyForward (unnormalized)
     */
    hLineCoords: Float32Array;

    /**
     * Coords: x, y, isData
     */
    hPointCoords: Float32Array;

    /**
     * Coords: x, y
     */
    hFillCoords: Float32Array;
}

class CoordInputs extends ValueBase2 {
    constructor(
        readonly lineMode: BasicLineLineMode,
        readonly riserMode: BasicLineRiserMode,
        readonly stepAlign: BasicLineStepAlign,
        readonly dotMode: BasicLineDotMode,
        readonly fillMode: BasicLineFillMode,
        readonly fillBaseline: number,
    ) {
        super( );
    }
}

function getBasicLineCoords( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { lineMode, stepAlign } = inputs;
    switch ( lineMode ) {
        case BasicLineLineMode.OFF: return getCoords_NOLINES( line, inputs, scratch );
        case BasicLineLineMode.STRAIGHT: return getCoords_STRAIGHT( line, inputs, scratch );
        case BasicLineLineMode.STEP_UP_DOWN: {
            switch ( stepAlign ) {
                case BasicLineStepAlign.BEFORE_DATAPOINT: return getCoords_STEP_UD_BEFORE( line, inputs, scratch );
                case BasicLineStepAlign.CENTERED_ON_DATAPOINT: return getCoords_STEP_UD_CENTERED( line, inputs, scratch );
                case BasicLineStepAlign.AFTER_DATAPOINT: return getCoords_STEP_UD_AFTER( line, inputs, scratch );
                default: throw new Error( 'Unsupported step align: ' + stepAlign );
            }
        }
        case BasicLineLineMode.STEP_LEFT_RIGHT: {
            switch ( stepAlign ) {
                case BasicLineStepAlign.BEFORE_DATAPOINT: return getCoords_STEP_LR_BEFORE( line, inputs, scratch );
                case BasicLineStepAlign.CENTERED_ON_DATAPOINT: return getCoords_STEP_LR_CENTERED( line, inputs, scratch );
                case BasicLineStepAlign.AFTER_DATAPOINT: return getCoords_STEP_LR_AFTER( line, inputs, scratch );
                default: throw new Error( 'Unsupported step align: ' + stepAlign );
            }
        }
        default: throw new Error( 'Unsupported line mode: ' + lineMode );
    }
}

function getCoords_NOLINES( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxPointCount = length;
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i+0 );
        const yCurr = y( i+0 );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasNext ) {
                // Data segment
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xNext,yNext );
            }

            if ( dotMode === BasicLineDotMode.ALL || dotMode === BasicLineDotMode.SOLO ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: 0,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STRAIGHT( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = length - 1;
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return 1*length;
            case BasicLineDotMode.ALL:  return 2*length;
            case BasicLineDotMode.SOLO: return 1*length;
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i+0 );
        const yCurr = y( i+0 );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasPrev || hasNext ) {
                // Join/endcap
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,0 );
            }
            if ( hasNext ) {
                // Data line
                iLine = putLineSegment( hLineCoords, iLine, xCurr,yCurr, xNext,yNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xNext,yNext );
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

// TODO: Use miters for stairstep joins; they're are all right angles, although short segments could still be tricky

function getCoords_STEP_UD_CENTERED( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = length + ( risers ? length - 1 : 0 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return 2*length;
            case BasicLineDotMode.ALL:  return 3*length;
            case BasicLineDotMode.SOLO: return 2*length;
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasPrev || hasNext ) {
                // Data line with both joins/endcaps
                let x0 = ( hasPrev ? 0.5*( xPrev + xCurr ) : xCurr );
                let x1 = ( hasNext ? 0.5*( xCurr + xNext ) : xCurr );
                if ( ( x0 < xCurr && x1 < xCurr ) || ( x0 > xCurr && x1 > xCurr ) ) {
                    if ( Math.abs( x0 - xCurr ) < Math.abs( x1 - xCurr ) ) {
                        x0 = xCurr;
                    }
                    else {
                        x1 = xCurr;
                    }
                }
                if ( yCurr !== yPrev ) {
                    iPoint = put3f( hPointCoords, iPoint, x0,yCurr,0 );
                }
                iLine = putLineSegment( hLineCoords, iLine, x0,yCurr, x1,yCurr );
                iFill = putFillSegment( hFillCoords, iFill, inputs, x0,yCurr, x1,yCurr );
                if ( yCurr !== yNext ) {
                    iPoint = put3f( hPointCoords, iPoint, x1,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                const x1 = 0.5*( xCurr + xNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, x1,yCurr, x1,yNext );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, x1,yCurr, x1,yNext );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_LR_CENTERED( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = length + ( risers ? length - 1 : 0 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return 2*length;
            case BasicLineDotMode.ALL:  return 3*length;
            case BasicLineDotMode.SOLO: return 2*length;
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasPrev || hasNext ) {
                // Data line with both joins/endcaps
                let y0 = ( hasPrev ? 0.5*( yPrev + yCurr ) : yCurr );
                let y1 = ( hasNext ? 0.5*( yCurr + yNext ) : yCurr );
                if ( ( y0 < yCurr && y1 < yCurr ) || ( y0 > yCurr && y1 > yCurr ) ) {
                    if ( Math.abs( y0 - yCurr ) < Math.abs( y1 - yCurr ) ) {
                        y0 = yCurr;
                    }
                    else {
                        y1 = yCurr;
                    }
                }
                if ( xCurr !== xPrev ) {
                    iPoint = put3f( hPointCoords, iPoint, xCurr,y0,0 );
                }
                iLine = putLineSegment( hLineCoords, iLine, xCurr,y0, xCurr,y1 );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,y0, xCurr,y1 );
                if ( xCurr !== xNext ) {
                    iPoint = put3f( hPointCoords, iPoint, xCurr,y1,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                const y1 = 0.5*( yCurr + yNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,y1, xNext,y1 );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, xCurr,y1, xNext,y1 );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_UD_BEFORE( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = ( risers ? 2*length - 2 : length - 1 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return ( 2*length - 1 );
            case BasicLineDotMode.ALL:  return ( 3*length - 1 );
            case BasicLineDotMode.SOLO: return ( 2*length - 1 );
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasPrev || ( hasNext && risers ) ) {
                if ( yCurr !== yPrev || !hasPrev || !hasNext ) {
                    // One join/endcap
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xCurr,yNext );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, xCurr,yCurr, xCurr,yNext );
                }
            }
            if ( hasNext ) {
                // Data line with one join/endcap
                iLine = putLineSegment( hLineCoords, iLine, xCurr,yNext, xNext,yNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yNext, xNext,yNext );
                if ( yCurr !== yNext ) {
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yNext,0 );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && !hasPrev && ( !hasNext || !risers ) ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_LR_BEFORE( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = ( risers ? 2*length - 2 : length - 1 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return ( 2*length - 1 );
            case BasicLineDotMode.ALL:  return ( 3*length - 1 );
            case BasicLineDotMode.SOLO: return ( 2*length - 1 );
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( hasPrev || ( hasNext && risers ) ) {
                if ( xCurr !== xPrev || !hasPrev || !hasNext ) {
                    // One join/endcap
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xNext,yCurr );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, xCurr,yCurr, xNext,yCurr );
                }
            }
            if ( hasNext ) {
                // Data line with one join/endcap
                iLine = putLineSegment( hLineCoords, iLine, xNext,yCurr, xNext,yNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xNext,yCurr, xNext,yNext );
                if ( xCurr !== xNext ) {
                    iPoint = put3f( hPointCoords, iPoint, xNext,yCurr,0 );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && !hasPrev && ( !hasNext || !risers ) ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_UD_AFTER( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = ( risers ? 2*length - 2 : length - 1 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return ( 2*length - 1 );
            case BasicLineDotMode.ALL:  return ( 3*length - 1 );
            case BasicLineDotMode.SOLO: return ( 2*length - 1 );
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( ( hasPrev && risers ) || hasNext ) {
                if ( yCurr !== yPrev || !hasPrev || !hasNext ) {
                    // One join/endcap
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Data line with one join/endcap
                iLine = putLineSegment( hLineCoords, iLine, xCurr,yCurr, xNext,yCurr );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xNext,yCurr );
                if ( yCurr !== yNext ) {
                    iPoint = put3f( hPointCoords, iPoint, xNext,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                iFill = putFillSegment( hFillCoords, iFill, inputs, xNext,yCurr, xNext,yNext );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, xNext,yCurr, xNext,yNext );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && ( !hasPrev || !risers ) && !hasNext ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_LR_AFTER( line: BasicLine, inputs: CoordInputs, scratch: BasicLineScratch ): BasicLineCoords {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = ( riserMode === BasicLineRiserMode.ON );
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;

    const maxLineCount = ( risers ? 2*length - 2 : length - 1 );
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity( hLineCoords, maxLineCoordCount );

    const maxPointCount = run( ( ) => {
        switch ( dotMode ) {
            case BasicLineDotMode.OFF:  return ( 2*length - 1 );
            case BasicLineDotMode.ALL:  return ( 3*length - 1 );
            case BasicLineDotMode.SOLO: return ( 2*length - 1 );
        }
    } );
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity( hPointCoords, maxPointCoordCount );

    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2*( maxFillSegmentCount * 6 * 2 );
    hFillCoords = ensureHostBufferCapacity( hFillCoords, maxFillCoordCount );

    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for ( let i = 0; i < length; i++ ) {
        const xCurr = x( i );
        const yCurr = y( i );
        if ( isDefined( xCurr ) && isDefined( yCurr ) ) {
            const connectPrev = ( i-1 >= 0 ? connect( i-1 ) : false );
            const connectNext = ( i+1 < length ? connect( i ) : false );
            const xPrev = ( connectPrev ? x( i-1 ) : undefined );
            const yPrev = ( connectPrev ? y( i-1 ) : undefined );
            const xNext = ( connectNext ? x( i+1 ) : undefined );
            const yNext = ( connectNext ? y( i+1 ) : undefined );
            const hasPrev = ( isDefined( xPrev ) && isDefined( yPrev ) );
            const hasNext = ( isDefined( xNext ) && isDefined( yNext ) );

            if ( ( hasPrev && risers ) || hasNext ) {
                if ( xCurr !== xPrev || !hasPrev || !hasNext ) {
                    // One join/endcap
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,0 );
                }
            }
            if ( hasNext ) {
                // Data line with one join/endcap
                iLine = putLineSegment( hLineCoords, iLine, xCurr,yCurr, xCurr,yNext );
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yCurr, xCurr,yNext );
                if ( xCurr !== xNext ) {
                    iPoint = put3f( hPointCoords, iPoint, xCurr,yNext,0 );
                }
            }
            if ( hasNext ) {
                // Riser fill
                iFill = putFillSegment( hFillCoords, iFill, inputs, xCurr,yNext, xNext,yNext );
                if ( risers ) {
                    // Riser line
                    iLine = putLineSegment( hLineCoords, iLine, xCurr,yNext, xNext,yNext );
                }
            }
            if ( dotMode === BasicLineDotMode.ALL || ( dotMode === BasicLineDotMode.SOLO && ( !hasPrev || !risers ) && !hasNext ) ) {
                // Data dot
                iPoint = put3f( hPointCoords, iPoint, xCurr,yCurr,1 );
            }
        }
    }

    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function putLineSegment( array: Float32Array, i: number, x0: number, y0: number, x1: number, y1: number ): number {
    const dxForward = x1 - x0;
    const dyForward = y1 - y0;
    if ( dxForward !== 0 || dyForward !== 0 ) {
        i = put4f( array, i, x1, y1, -dxForward, -dyForward );
        i = put4f( array, i, x0, y0, -dxForward, -dyForward );
        i = put4f( array, i, x1, y1, +dxForward, +dyForward );

        i = put4f( array, i, x1, y1, +dxForward, +dyForward );
        i = put4f( array, i, x0, y0, -dxForward, -dyForward );
        i = put4f( array, i, x0, y0, +dxForward, +dyForward );
    }
    return i;
}

function putFillSegment( array: Float32Array, i: number, inputs: CoordInputs, x0: number, y0: number, x1: number, y1: number ): number {
    const { fillMode, fillBaseline } = inputs;
    switch ( fillMode ) {
        case BasicLineFillMode.OFF: {
            // No fill
        }
        break;

        case BasicLineFillMode.VERTICAL: {
            const yB = clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, fillBaseline );
            if ( ( y0 < yB && yB < y1 ) || ( y1 < yB && yB < y0 ) ) {
                const xB = x0 + ( ( x1 - x0 ) * ( yB - y0 )/( y1 - y0 ) );
                i = put6f( array, i, x0,y0, x0,yB, xB,yB );
                i = put6f( array, i, xB,yB, x1,yB, x1,y1 );
            }
            else {
                i = put6f( array, i, x0,y0, x0,yB, x1,y1 );
                i = put6f( array, i, x1,y1, x0,yB, x1,yB );
            }
        }
        break;

        case BasicLineFillMode.HORIZONTAL: {
            const xB = clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, fillBaseline );
            if ( ( x0 < xB && xB < x1 ) || ( x1 < xB && xB < x0 ) ) {
                const yB = y0 + ( ( y1 - y0 ) * ( xB - x0 )/( x1 - x0 ) );
                i = put6f( array, i, x0,y0, xB,y0, xB,yB );
                i = put6f( array, i, xB,yB, xB,y1, x1,y1 );
            }
            else {
                i = put6f( array, i, x0,y0, xB,y0, x1,y1 );
                i = put6f( array, i, x1,y1, xB,y0, xB,y1 );
            }
        }
        break;

        default: {
            throw new Error( 'Unsupported fill mode: ' + fillMode );
        }
    }
    return i;
}

/**
 * Specified in physical pixels, not logical pixels, because it's used to smooth
 * jagged edges, and jaggedness is a function of physical pixel size.
 */
const FEATHER_PX = 1.5;

/**
 * Paints a multi-segment line. Does not attempt any sort of intricate line-join;
 * just paints round points at line vertices, sized to match the line thickness.
 * The result looks like a line with rounded corners.
 *
 * This has three advantages over miter-joins:
 * - Simple to implement
 * - Looks good even if some line segments are very short
 * - Looks good underneath a separate set of overlaid points
 *
 * This has disadvantages as well, which may be significant for some use-cases:
 * - Ugly if lines are not opaque
 * - Doesn't support stippling
 */
export class BasicLinePainter implements Painter {
    readonly peer = createDomPeer( 'basic-line-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly lineMode = StyleProp.create( this.style, '--line-mode', cssEnum( BasicLineLineMode ), 'straight' );
    readonly lineStepAlign = StyleProp.create( this.style, '--line-step-align', cssEnum( BasicLineStepAlign ), 'centered-on-datapoint' );
    readonly lineRiserMode = StyleProp.create( this.style, '--line-step-risers', cssEnum( BasicLineRiserMode ), 'on' );
    readonly lineColor = StyleProp.create( this.style, '--line-color', cssColor, 'rgb(0,0,0)' );
    readonly lineThickness_LPX = StyleProp.create( this.style, '--line-thickness-px', cssFloat, 1 );
    readonly dotMode = StyleProp.create( this.style, '--dot-mode', cssEnum( BasicLineDotMode ), 'solo' );
    readonly dotColor = StyleProp.create( this.style, '--dot-color', cssColor, this.lineColor );
    readonly dotDiameter_LPX = StyleProp.create2( this.style, '--dot-diameter-px', cssFloat, ( ) => {
        switch ( this.dotMode.get( ) ) {
            case BasicLineDotMode.ALL:  return 5;
            case BasicLineDotMode.SOLO: return ( 1.2 * this.lineThickness_LPX.get( ) );
            default: return 0;
        }
    } );
    readonly fillMode = StyleProp.create( this.style, '--fill-mode', cssEnum( BasicLineFillMode ), 'off' );
    readonly fillColor = StyleProp.create2( this.style, '--fill-color', cssColor, ( ) => {
        return this.lineColor.get( ).withUpdatedAlpha( a => 0.5*a );
    } );
    readonly fillBaseline = StyleProp.create( this.style, '--fill-baseline', cssFloat, 0 );
    readonly offscreenDataIndicatorX = StyleProp.create( this.style, '--offscreen-data-indicator-x', cssEnum( BasicLineOffscreenDataIndicator ), 'off' );
    readonly offscreenDataIndicatorY = StyleProp.create( this.style, '--offscreen-data-indicator-y', cssEnum( BasicLineOffscreenDataIndicator ), 'off' );
    readonly offscreenDataIndicatorColor = StyleProp.create( this.style, '--offscreen-data-indicator-color', cssColor, this.dotColor );
    readonly offscreenDataIndicatorDiameter_LPX = StyleProp.create( this.style, '--offscreen-data-indicator-diameter-px', cssFloat, this.dotDiameter_LPX );

    readonly visible = new RefBasic( true, tripleEquals );

    xyBoundsFn: Supplier<Interval2D>;
    line: BasicLine | undefined;

    // Render coords are relative to a reference point, to mitigate f32 precision error
    protected xRef: number;
    protected yRef: number;
    protected scratch: BasicLineScratch;

    protected glIncarnation: unknown;

    protected dFillCoords: Nullable<WebGLBuffer>;
    protected dFillCoordsCapacityBytes: number;
    protected dFillCoordsCount: number;

    protected dLineCoords: Nullable<WebGLBuffer>;
    protected dLineCoordsCapacityBytes: number;
    protected dLineCoordsCount: number;

    protected dPointCoords: Nullable<WebGLBuffer>;
    protected dPointCoordsCapacityBytes: number;
    protected dPointCoordsCount: number;

    protected dLine: BasicLine | undefined;
    protected dCoordInputs: CoordInputs | undefined;

    constructor( xyBoundsFn = frozenSupplier( Interval2D.fromEdges( 0, 1, 0, 1 ) ) ) {
        this.xyBoundsFn = xyBoundsFn;
        this.line = undefined;

        this.xRef = 0;
        this.yRef = 0;
        this.scratch = {
            hLineCoords: new Float32Array( 0 ),
            hPointCoords: new Float32Array( 0 ),
            hFillCoords: new Float32Array( 0 ),
        };

        this.glIncarnation = null;

        this.dLineCoords = null;
        this.dLineCoordsCapacityBytes = -1;
        this.dLineCoordsCount = -1;

        this.dPointCoords = null;
        this.dPointCoordsCapacityBytes = -1;
        this.dPointCoordsCount = -1;

        this.dFillCoords = null;
        this.dFillCoordsCapacityBytes = -1;
        this.dFillCoordsCount = -1;

        this.dLine = undefined;
        this.dCoordInputs = undefined;
    }

    // TODO: Support optional wraparound, at least horizontally
    paint( context: Context, viewport_PX: Interval2D ): void {
        // Get style values
        const lineMode = this.lineMode.get( );
        const riserMode = this.lineRiserMode.get( );
        const stepAlign = this.lineStepAlign.get( );
        const lineColor = this.lineColor.get( );
        const lineThickness_LPX = this.lineThickness_LPX.get( );
        const dotMode = this.dotMode.get( );
        const dotColor = this.dotColor.get( );
        const dotDiameter_LPX = this.dotDiameter_LPX.get( );
        const offscreenDataIndicatorColor = this.offscreenDataIndicatorColor.get( );
        const offscreenDataIndicatorDiameter_LPX = this.offscreenDataIndicatorDiameter_LPX.get( );
        const fillMode = this.fillMode.get( );
        const fillColor = this.fillColor.get( );
        const fillBaseline = this.fillBaseline.get( );
        const offscreenDataIndicatorX = this.offscreenDataIndicatorX.get( );
        const offscreenDataIndicatorY = this.offscreenDataIndicatorY.get( );
        const indicateDataBelowMinX = indicateDataBelowMin( offscreenDataIndicatorX );
        const indicateDataAboveMaxX = indicateDataAboveMax( offscreenDataIndicatorX );
        const indicateDataBelowMinY = indicateDataBelowMin( offscreenDataIndicatorY );
        const indicateDataAboveMaxY = indicateDataAboveMax( offscreenDataIndicatorY );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const lineThickness_PX = lineThickness_LPX * dpr;
        const dotDiameter_PX = dotDiameter_LPX * dpr;
        const offscreenDataIndicatorDiameter_PX = offscreenDataIndicatorDiameter_LPX * dpr;

        const gl = context.gl;

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;

            this.dLineCoords = gl.createBuffer( );
            this.dLineCoordsCapacityBytes = -1;
            this.dLineCoordsCount = -1;

            this.dPointCoords = gl.createBuffer( );
            this.dPointCoordsCapacityBytes = -1;
            this.dPointCoordsCount = -1;

            this.dFillCoords = gl.createBuffer( );
            this.dFillCoordsCapacityBytes = -1;
            this.dFillCoordsCount = -1;

            this.dCoordInputs = undefined;
        }

        // Repopulate device coords, if necessary
        const coordInputs = new CoordInputs( lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline );
        if ( this.line !== this.dLine || !equal( coordInputs, this.dCoordInputs ) ) {
            if ( this.line && this.line.length > 0 ) {
                if ( isDefined( this.line.xRef ) && isDefined( this.line.yRef ) ) {
                    this.xRef = this.line.xRef;
                    this.yRef = this.line.yRef;
                }
                else {
                    this.xRef = this.line.xRef ?? 0;
                    this.yRef = this.line.yRef ?? 0;
                    for ( let i = this.line.length - 1; i >= 0; i-- ) {
                        const x = this.line.x( i );
                        const y = this.line.y( i );
                        if ( isDefined( x ) && isDefined( y ) && !Number.isNaN( x ) && !Number.isNaN( y ) ) {
                            this.xRef = this.line.xRef ?? x;
                            this.yRef = this.line.yRef ?? y;
                            break;
                        }
                    }
                }
                const relativeLine = relativizeLine( this.line, this.xRef, this.yRef );
                const relativeInputs = relativizeInputs( coordInputs, this.xRef, this.yRef );
                const coords = getBasicLineCoords( relativeLine, relativeInputs, this.scratch );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dLineCoords );
                this.dLineCoordsCount = coords.hLineCoordsCount;
                this.dLineCoordsCapacityBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dLineCoordsCapacityBytes, coords.hLineCoords, this.dLineCoordsCount );
                this.scratch.hLineCoords = coords.hLineCoords;

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dPointCoords );
                this.dPointCoordsCount = coords.hPointCoordsCount;
                this.dPointCoordsCapacityBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dPointCoordsCapacityBytes, coords.hPointCoords, this.dPointCoordsCount );
                this.scratch.hPointCoords = coords.hPointCoords;

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dFillCoords );
                this.dFillCoordsCount = coords.hFillCoordsCount;
                this.dFillCoordsCapacityBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dFillCoordsCapacityBytes, coords.hFillCoords, this.dFillCoordsCount );
                this.scratch.hFillCoords = coords.hFillCoords;
            }
            else {
                this.dLineCoordsCount = 0;
                this.dPointCoordsCount = 0;
                this.dFillCoordsCount = 0;
            }
            this.dLine = this.line;
            this.dCoordInputs = coordInputs;
        }

        // Render coords are relative to a reference point, to mitigate f32 precision error
        const xBoundsShift = -( this.xRef ?? 0 );
        const yBoundsShift = -( this.yRef ?? 0 );
        const xyBounds = this.xyBoundsFn( ).shift( xBoundsShift, yBoundsShift );

        // Prep for rendering
        enablePremultipliedAlphaBlending( gl );

        // Render fill
        const fillVertexCount = Math.floor( this.dFillCoordsCount / 2 );
        if ( fillVertexCount > 0 && fillColor.a > 0 ) {
            const { program, attribs, uniforms } = context.getProgram( FILL_PROG_SOURCE );
            gl.disable( gl.CULL_FACE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inCoords );
            try {
                glUniformInterval2D( gl, uniforms.AXIS_LIMITS, xyBounds );
                glUniformRgba( gl, uniforms.COLOR, fillColor );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dFillCoords );
                gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.TRIANGLES, 0, fillVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inCoords );
                gl.useProgram( null );
            }
        }

        // Render lines
        const lineVertexCount = Math.floor( this.dLineCoordsCount / 4 );
        if ( lineVertexCount > 0 && lineColor.a > 0 && lineThickness_PX > 0 ) {
            const { program, attribs, uniforms } = context.getProgram( LINE_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inCoords );
            try {
                glUniformInterval2D( gl, uniforms.AXIS_LIMITS, xyBounds );
                glUniformInterval2D( gl, uniforms.AXIS_VIEWPORT_PX, viewport_PX );
                gl.uniform1f( uniforms.THICKNESS_PX, lineThickness_PX );
                gl.uniform1f( uniforms.FEATHER_PX, FEATHER_PX );
                glUniformRgba( gl, uniforms.COLOR, lineColor );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dLineCoords );
                gl.vertexAttribPointer( attribs.inCoords, 4, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.TRIANGLES, 0, lineVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inCoords );
                gl.useProgram( null );
            }
        }

        // Render points
        const pointVertexCount = Math.floor( this.dPointCoordsCount / 3 );
        if ( pointVertexCount > 0 && ( ( dotColor.a > 0 && dotDiameter_PX > 0 ) || ( lineColor.a > 0 && lineThickness_LPX > 1 ) || ( offscreenDataIndicatorColor.a > 0 && offscreenDataIndicatorDiameter_PX > 0 ) ) ) {
            const { program, attribs, uniforms } = context.getProgram( POINT_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inCoords );
            try {
                glUniformInterval2D( gl, uniforms.AXIS_LIMITS, xyBounds );
                gl.uniform4f( uniforms.DATA_CLAMP_LIMITS,
                    clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataBelowMinX ? xyBounds.xMin : Number.NEGATIVE_INFINITY ),
                    clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataAboveMaxX ? xyBounds.xMax : Number.POSITIVE_INFINITY ),
                    clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataBelowMinY ? xyBounds.yMin : Number.NEGATIVE_INFINITY ),
                    clamp( -GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataAboveMaxY ? xyBounds.yMax : Number.POSITIVE_INFINITY ),
                );
                gl.uniform1f( uniforms.FEATHER_PX, FEATHER_PX );
                gl.uniform1f( uniforms.JOIN_DIAMETER_PX, lineThickness_PX );
                gl.uniform1f( uniforms.DATA_DIAMETER_PX, dotDiameter_PX );
                gl.uniform1f( uniforms.DATA_CLAMPED_DIAMETER_PX, offscreenDataIndicatorDiameter_PX );
                glUniformRgba( gl, uniforms.JOIN_COLOR, lineColor );
                glUniformRgba( gl, uniforms.DATA_COLOR, dotColor );
                glUniformRgba( gl, uniforms.DATA_CLAMPED_COLOR, offscreenDataIndicatorColor );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dPointCoords );
                gl.vertexAttribPointer( attribs.inCoords, 3, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.POINTS, 0, pointVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inCoords );
                gl.useProgram( null );
            }
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;

        gl.deleteBuffer( this.dLineCoords );
        this.dLineCoords = null;
        this.dLineCoordsCapacityBytes = -1;
        this.dLineCoordsCount = -1;

        gl.deleteBuffer( this.dPointCoords );
        this.dPointCoords = null;
        this.dPointCoordsCapacityBytes = -1;
        this.dPointCoordsCount = -1;

        gl.deleteBuffer( this.dFillCoords );
        this.dFillCoords = null;
        this.dFillCoordsCapacityBytes = -1;
        this.dFillCoordsCount = -1;

        this.glIncarnation = null;

        this.dLine = undefined;
        this.dCoordInputs = undefined;
    }
}

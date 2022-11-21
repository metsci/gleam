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
import { appendChild, atMost, clamp, equal, findIndexNearest, Nullable, numberOr, RefBasic, requireEqual, requireTrue, run, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Axis1D, AxisLabelSet, Context, Painter, texImage2D, Ticker } from '../../core';
import { createDomPeer, cssColor, cssFloat, cssString, currentDpr, EAST, Edge, enablePremultipliedAlphaBlending, getGlyphCount, getTextWidth, GL, glUniformRgba, Interval1D, Interval2D, NORTH, PeerType, pushBufferToDevice_BYTES, putAlignedBox, putTextCoords, Size2D, SOUTH, StyleProp, TextAtlasCache, ValueBase2, WEST, xPixelToNdc, yUpwardPixelToNdc } from '../../support';

import markFragShader_GLSL from './mark.frag';
import markVertShader_GLSL from './mark.vert';
import textFragShader_GLSL from './text.frag';
import textVertShader_GLSL from './text.vert';

const MARK_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: markVertShader_GLSL,
    fragShader_GLSL: markFragShader_GLSL,
    uniformNames: [ 'RGBA' ] as const,
    attribNames: [ 'inCoords' ] as const,
} );

const TEXT_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: textVertShader_GLSL,
    fragShader_GLSL: textFragShader_GLSL,
    uniformNames: [ 'ATLAS', 'RGBA' ] as const,
    attribNames: [ 'inCoords', 'inColor' ] as const,
} );

export class CoordsInputs extends ValueBase2 {
    constructor(
        readonly majorTicks: ReadonlyArray<number>,
        readonly minorTicks: ReadonlyArray<number>,
        readonly formatTick: ( axisCoord: number ) => string,
        readonly axisLabelSet: AxisLabelSet,
        readonly axisBounds: Interval1D,
        readonly axisViewport_PX: Interval1D,
        readonly viewport_PX: Interval2D,
        readonly markLength_PX: number,
        readonly markWidth_PX: number,
        readonly spaceFromMarkToText_PX: number,
        readonly spaceFromTextToTitle_PX: number,
        readonly edgeOffset_PX: number,
        readonly textFont: string,
    ) {
        super( );
    }
}

/**
 * Tick coords are subject to floating-point precision errors,
 * which can make a tick mark rattle back and forth between two
 * pixels while the axis is panning. An actual solution would
 * take some work -- however, there's an easy workaround for the
 * only case common enough to matter in practice.
 *
 * It is common for an axis to get initialized with bounds that
 * are nice round numbers, resulting in ticks that fall on the
 * leftmost or rightmost pixel edges. When such an axis gets
 * panned, the ticks are no longer at the edges of the pane, but
 * but still fall on pixel edges.
 *
 * The easy workaround for this case is to nudge tick coords a
 * small fraction of a pixel, so that nice round numbers don't
 * fall precisely on pixel edges.
 */
export const tickOffsetEpsilon_PX = 1e-12;

export class AxisPainter implements Painter {
    readonly peer = createDomPeer( 'axis-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly textFont = StyleProp.create( this.style, '--text-font', cssString, '13px sans-serif' );
    readonly textColor = StyleProp.create( this.style, '--text-color', cssColor, 'rgb(127,127,127)' );
    readonly markColor = StyleProp.create( this.style, '--tick-color', cssColor, 'rgb(127,127,127)' );
    readonly dividerColor = StyleProp.create( this.style, '--divider-color', cssColor, 'rgb(170,170,170)' );
    readonly markLength_LPX = StyleProp.create( this.style, '--tick-length-px', cssFloat, 6 );
    readonly markWidth_LPX = StyleProp.create( this.style, '--tick-width-px', cssFloat, 1 );
    readonly dividerWidth_LPX = StyleProp.create( this.style, '--divider-width-px', cssFloat, 1 );
    readonly edgeOffset_LPX = StyleProp.create( this.style, '--edge-offset-px', cssFloat, 0 );
    readonly spaceFromMarkToText_LPX = StyleProp.create( this.style, '--space-tick-to-text-px', cssFloat, 4 );
    readonly spaceFromTextToTitle_LPX = StyleProp.create( this.style, '--space-text-to-title-px', cssFloat, 5 );

    readonly visible = new RefBasic( true, tripleEquals );

    readonly axis: Axis1D;
    readonly ticker: Ticker;
    protected readonly labelEdge: Edge;

    /**
     * Mark coords followed by text coords:
     *  - Mark coords: x_NDC, y_NDC
     *  - Text coords: x_NDC, y_NDC, s_FRAC, t_FRAC
     */
    protected hCoords: Float32Array;
    protected hTextAtlasCache: TextAtlasCache;

    protected glIncarnation: unknown;
    protected dCoords: Nullable<WebGLBuffer>;
    protected dCoordsBytes: number;
    protected dCoordsInputs: Nullable<CoordsInputs>;
    protected dMarkVertexCount: number;
    protected dDividerVertexCount: number;
    protected dTextVertexCount: number;

    /**
     * `labelEdge` indicates which edge to put the axis labels on.
     */
    constructor( axis: Axis1D, labelEdge: Edge, createTicker: Supplier<Ticker>, textAtlasCache?: TextAtlasCache ) {
        this.axis = axis;
        this.labelEdge = labelEdge;
        this.ticker = createTicker( );
        appendChild( this.peer, this.ticker.peer );

        this.hCoords = new Float32Array( 0 );
        this.hTextAtlasCache = textAtlasCache ?? new TextAtlasCache( );

        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dMarkVertexCount = 0;
        this.dDividerVertexCount = 0;
        this.dTextVertexCount = 0;
    }

    getPrefSize_PX( ): Size2D {
        const textFont = this.textFont.get( );
        const markLength_LPX = this.markLength_LPX.get( );
        const edgeOffset_LPX = this.edgeOffset_LPX.get( );
        const spaceFromMarkToText_LPX = this.spaceFromMarkToText_LPX.get( );
        const spaceFromTextToTitle_LPX = this.spaceFromTextToTitle_LPX.get( );

        const dpr = currentDpr( this );
        const markLength_PX = Math.round( markLength_LPX * dpr );
        const edgeOffset_PX = Math.round( edgeOffset_LPX * dpr );
        const spaceFromMarkToText_PX = Math.round( spaceFromMarkToText_LPX * dpr );
        const spaceFromTextToTitle_PX = Math.round( spaceFromTextToTitle_LPX * dpr );

        const hTextAtlas = this.hTextAtlasCache.get( textFont, dpr, undefined );

        const tickSet = this.ticker.getTicks( this.axis );
        const axisLabelSet = tickSet.getAxisLabels( );
        const haveAxisLabels = run( ( ) => {
            for ( const axisLabel of axisLabelSet.axisLabels ) {
                if ( axisLabel.text.trim( ).length > 0 ) {
                    return true;
                }
            }
            return false;
        } );
        const titleSize_PX = ( haveAxisLabels ? spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerDescent( ) + hTextAtlas.getMaxInnerAscent( ) : 0 );

        const tickTexts = new Array<string>( );
        for ( const coord_AXIS of tickSet.majorTicks ) {
            tickTexts.push( tickSet.formatTick( coord_AXIS ) );
        }

        if ( this.labelEdge === NORTH || this.labelEdge === SOUTH ) {
            // The extra spaceFromMarkToText at the end is for padding
            // Ignore tick-text descent, because numbers generally have no descent
            const prefHeight_PX = edgeOffset_PX + markLength_PX + spaceFromMarkToText_PX + hTextAtlas.getMaxInnerAscent( ) + titleSize_PX + spaceFromMarkToText_PX;
            return new Size2D( 0, prefHeight_PX );
        }
        else {
            const wDigits_PX = Math.max( 0, ...tickTexts.map( tickText => ( tickText.match( /[^+-.]/g ) ?? [] ).length ) ) * getTextWidth( hTextAtlas, '0' );
            const wDecimalPoint_PX = ( tickTexts[0]?.includes( '.' ) ? getTextWidth( hTextAtlas, '.' ) : 0 );
            const wSign_PX = Math.max( getTextWidth( hTextAtlas, '-' ), getTextWidth( hTextAtlas, '+' ) );
            const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
            // The extra spaceFromMarkToText at the end is for padding
            const prefWidth_PX = edgeOffset_PX + markLength_PX + spaceFromMarkToText_PX + wTickTextMax_PX + titleSize_PX + spaceFromMarkToText_PX;
            return new Size2D( prefWidth_PX, 0 );
        }
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const textFont = this.textFont.get( );
        const textColor = this.textColor.get( );
        const markColor = this.markColor.get( );
        const markLength_LPX = this.markLength_LPX.get( );
        const markWidth_LPX = this.markWidth_LPX.get( );
        const dividerColor = this.dividerColor.get( );
        const dividerWidth_LPX = this.dividerWidth_LPX.get( );
        const edgeOffset_LPX = this.edgeOffset_LPX.get( );
        const spaceFromMarkToText_LPX = this.spaceFromMarkToText_LPX.get( );
        const spaceFromTextToTitle_LPX = this.spaceFromTextToTitle_LPX.get( );

        // Convert from logical pixels to device pixels
        const dpr = currentDpr( this );
        const markLength_PX = Math.round( markLength_LPX * dpr );
        const markWidth_PX = Math.round( markWidth_LPX * dpr );
        const dividerWidth_PX = Math.round( dividerWidth_LPX * dpr );
        const edgeOffset_PX = Math.round( edgeOffset_LPX * dpr );
        const spaceFromMarkToText_PX = Math.round( spaceFromMarkToText_LPX * dpr );
        const spaceFromTextToTitle_PX = Math.round( spaceFromTextToTitle_LPX * dpr );

        const gl = context.gl;

        const textVisible = ( textColor.a > 0 );
        const marksVisible = ( markColor.a > 0 && markLength_PX > 0 && markWidth_PX > 0 );
        const dividersVisible = ( dividerColor.a > 0 && dividerWidth_PX > 0 );
        if ( textVisible || marksVisible ) {
            // Reset device resources on context reincarnation
            if ( context.glIncarnation !== this.glIncarnation ) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer( );
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
                this.dMarkVertexCount = 0;
                this.dTextVertexCount = 0;
            }

            // Gather coords inputs
            const axisBounds = this.axis.bounds;
            const axisViewport_PX = this.axis.viewport_PX;
            const { majorTicks, minorTicks, formatTick, getAxisLabels } = this.ticker.getTicks( this.axis );
            const axisLabelSet = getAxisLabels( );
            const coordsInputs = new CoordsInputs(
                majorTicks,
                minorTicks,
                formatTick,
                axisLabelSet,
                axisBounds,
                axisViewport_PX,
                viewport_PX,
                markLength_PX,
                markWidth_PX,
                spaceFromMarkToText_PX,
                spaceFromTextToTitle_PX,
                edgeOffset_PX,
                textFont,
            );

            // Repopulate device text atlas, if necessary
            const hTextAtlas = this.hTextAtlasCache.get( textFont, dpr, context.frameNum );
            const dTextAtlas = context.getTexture( `gleam.Axis.Text.${textFont}`, dpr, ( gl, target ) => {
                gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
                gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
                gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
                gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
                return texImage2D( gl, target, GL.LUMINANCE, GL.UNSIGNED_BYTE, hTextAtlas.getPixels( ) );
            } );

            // Leave these bindings in place for the whole method
            gl.activeTexture( GL.TEXTURE0 );
            gl.bindTexture( GL.TEXTURE_2D, dTextAtlas.texture );
            gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );

            // Repopulate device coords, if necessary
            if ( !equal( coordsInputs, this.dCoordsInputs ) ) {
                const titles = axisLabelSet.axisLabels;
                const dividers = axisLabelSet.axisDividers;

                const tickTexts = new Array<string>( );
                for ( const coord_AXIS of majorTicks ) {
                    tickTexts.push( formatTick( coord_AXIS ) );
                }

                const markCount = majorTicks.length;
                const markCoordCount = 12 * markCount;

                const dividerCount = dividers.length;
                const dividerCoordCount = 12 * dividerCount;

                let glyphCount = 0;
                for ( const title of titles ) {
                    glyphCount += getGlyphCount( hTextAtlas, title.text );
                }
                for ( const tickText of tickTexts ) {
                    glyphCount += getGlyphCount( hTextAtlas, tickText );
                }
                const maxTextCoordCount = 24 * glyphCount;

                const maxTotalCoordCount = markCoordCount + dividerCoordCount + maxTextCoordCount;
                if ( this.hCoords.length < maxTotalCoordCount ) {
                    const hCoordsFloats = Math.max( maxTotalCoordCount, 2*this.hCoords.length );
                    this.hCoords = new Float32Array( hCoordsFloats );
                }

                let iMark0 = 0;
                let iDivider0 = iMark0 + markCoordCount;
                let iText0 = iDivider0 + dividerCoordCount;

                let iMark = iMark0;
                let iDivider = iDivider0;
                let iText = iText0;

                if ( this.labelEdge === NORTH || this.labelEdge === SOUTH ) {
                    let yMarkTop_UPX;
                    let yDividerMax_UPX;
                    let yDividerMin_UPX;
                    let yTickText_UPX;
                    let yTitleText_UPX;
                    if ( this.labelEdge === SOUTH ) {
                        yMarkTop_UPX = viewport_PX.h - edgeOffset_PX;
                        yTickText_UPX = yMarkTop_UPX - markLength_PX - spaceFromMarkToText_PX - hTextAtlas.getMaxInnerAscent( );
                        yTitleText_UPX = yTickText_UPX - hTextAtlas.getMaxInnerDescent( ) - spaceFromTextToTitle_PX - hTextAtlas.getMaxInnerAscent( );
                        yDividerMax_UPX = yTickText_UPX - spaceFromMarkToText_PX;
                        yDividerMin_UPX = 0;
                    }
                    else {
                        yMarkTop_UPX = edgeOffset_PX + markLength_PX;
                        // Ignore descent, because numbers generally have no descent
                        //yTickText_UPX = yMarkTop_UPX + spaceFromMarkToText_PX + this.hTextAtlas.getMaxInnerDescent( );
                        yTickText_UPX = yMarkTop_UPX + spaceFromMarkToText_PX;
                        yTitleText_UPX = yTickText_UPX + hTextAtlas.getMaxInnerAscent( ) + spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerDescent( );
                        yDividerMax_UPX = viewport_PX.h;
                        yDividerMin_UPX = yTickText_UPX + hTextAtlas.getMaxInnerAscent( ) + spaceFromMarkToText_PX;
                    }
                    const yTickText_PX = Math.round( viewport_PX.h - yTickText_UPX );
                    const yTitleText_PX = Math.round( viewport_PX.h - yTitleText_UPX );

                    for ( const title of titles ) {
                        const x_PX = ( axisViewport_PX.min - viewport_PX.xMin ) + ( title.axisFrac * axisViewport_PX.span );

                        const text = title.text;
                        const textAlignFrac = numberOr( title.textAlignFrac, 0.5 );
                        const wText_PX = getTextWidth( hTextAtlas, text );
                        const xTextPref_PX = x_PX - textAlignFrac*wText_PX;

                        const minAxisFrac = numberOr( title.minAxisFrac, 0 );
                        const maxAxisFrac = numberOr( title.maxAxisFrac, 1 );
                        const xTextMin_PX = ( axisViewport_PX.min - viewport_PX.xMin ) + ( minAxisFrac * axisViewport_PX.span );
                        const xTextMax_PX = ( axisViewport_PX.min - viewport_PX.xMin ) + ( maxAxisFrac * axisViewport_PX.span ) - wText_PX;

                        const xText_PX = Math.round( clamp( xTextMin_PX, xTextMax_PX, xTextPref_PX ) + tickOffsetEpsilon_PX );

                        if ( xTextMin_PX <= xText_PX && xText_PX <= xTextMax_PX ) {
                            iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yTitleText_PX, 0, text );
                        }
                    }

                    for ( const divider of dividers ) {
                        const x_PX = ( axisViewport_PX.min - viewport_PX.xMin ) + ( divider.axisFrac * axisViewport_PX.span );

                        const xDividerMin_PX = Math.round( x_PX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const xDividerMin_NDC = xPixelToNdc( viewport_PX.x, xDividerMin_PX );
                        const xDividerMax_NDC = xDividerMin_NDC + ( dividerWidth_PX * 2 / viewport_PX.w );
                        const yDividerMin_NDC = yUpwardPixelToNdc( viewport_PX.y, yDividerMin_UPX );
                        const yDividerMax_NDC = yUpwardPixelToNdc( viewport_PX.y, yDividerMax_UPX );
                        iDivider = putAlignedBox( this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC );
                    }

                    // TODO: Improve text overlap avoidance
                    let xTextMinAllowed_PX = Number.NEGATIVE_INFINITY;
                    const wRequiredTextSpacing_PX = 0.5*getTextWidth( hTextAtlas, '0' );
                    for ( let tickNum = 0; tickNum < majorTicks.length; tickNum++ ) {
                        const x_FRAC = axisBounds.valueToFrac( majorTicks[ tickNum ] );
                        const x_PX = ( axisViewport_PX.min - viewport_PX.xMin ) + ( x_FRAC * axisViewport_PX.span );

                        const xMarkMin_PX = Math.round( x_PX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const xMarkMin_NDC = xPixelToNdc( viewport_PX.x, xMarkMin_PX );
                        const xMarkMax_NDC = xMarkMin_NDC + ( markWidth_PX * 2 / viewport_PX.w );
                        const yMarkMax_NDC = yUpwardPixelToNdc( viewport_PX.y, yMarkTop_UPX );
                        const yMarkMin_NDC = yMarkMax_NDC - ( markLength_PX * 2 / viewport_PX.h );
                        iMark = putAlignedBox( this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC );

                        const text = tickTexts[ tickNum ];
                        const wText_PX = getTextWidth( hTextAtlas, text );
                        const wAbsText_PX = ( text.startsWith( '-' ) ? getTextWidth( hTextAtlas, text.substring( 1 ) ) : wText_PX );
                        const xTextPref_PX = xMarkMin_PX + Math.round( 0.5*markWidth_PX + 0.5*wAbsText_PX - wText_PX );
                        const xText_PX = clamp( 0, viewport_PX.w - wText_PX, xTextPref_PX );
                        if ( xText_PX >= xTextMinAllowed_PX ) {
                            iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yTickText_PX, 0, text );
                            xTextMinAllowed_PX = xText_PX + wText_PX + wRequiredTextSpacing_PX;
                        }
                    }
                }
                else if ( this.labelEdge === WEST ) {
                    const xMarkRight_PX = viewport_PX.w - edgeOffset_PX;
                    const xTickTextRight_PX = xMarkRight_PX - markLength_PX - spaceFromMarkToText_PX;
                    const wDigits_PX = Math.max( 0, ...tickTexts.map( tickText => ( tickText.match( /[^+-.]/g ) ?? [] ).length ) ) * getTextWidth( hTextAtlas, '0' );
                    const wDecimalPoint_PX = ( tickTexts[0]?.includes( '.' ) ? getTextWidth( hTextAtlas, '.' ) : 0 );
                    const wSign_PX = Math.max( getTextWidth( hTextAtlas, '-' ), getTextWidth( hTextAtlas, '+' ) );
                    const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
                    const xTitleText_PX = xTickTextRight_PX - wTickTextMax_PX - spaceFromTextToTitle_PX - hTextAtlas.getMaxInnerDescent( );

                    for ( const title of titles ) {
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( title.axisFrac * axisViewport_PX.span );

                        const text = title.text;
                        const textAlignFrac = numberOr( title.textAlignFrac, 0.5 );
                        const hText_PX = getTextWidth( hTextAtlas, text );
                        const yTextPref_UPX = y_UPX - textAlignFrac*hText_PX;

                        const minAxisFrac = numberOr( title.minAxisFrac, 0 );
                        const maxAxisFrac = numberOr( title.maxAxisFrac, 1 );
                        const yTextMin_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( minAxisFrac * axisViewport_PX.span );
                        const yTextMax_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( maxAxisFrac * axisViewport_PX.span ) - hText_PX;

                        const yText_UPX = Math.round( clamp( yTextMin_UPX, yTextMax_UPX, yTextPref_UPX ) + tickOffsetEpsilon_PX );

                        if ( yTextMin_UPX <= yText_UPX && yText_UPX <= yTextMax_UPX ) {
                            const yText_PX = viewport_PX.h - yText_UPX;
                            iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xTitleText_PX, yText_PX, 0.5*Math.PI, text );
                        }
                    }

                    for ( const divider of dividers ) {
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( divider.axisFrac * axisViewport_PX.span );

                        const yDividerMin_UPX = Math.round( y_UPX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const yDividerMin_NDC = yUpwardPixelToNdc( viewport_PX.y, yDividerMin_UPX );
                        const yDividerMax_NDC = yDividerMin_NDC + ( dividerWidth_PX * 2 / viewport_PX.h );
                        const nearestTickNum = findIndexNearest( majorTicks, y => axisBounds.valueToFrac( y ) - divider.axisFrac );
                        const wTickText_PX = getTextWidth( hTextAtlas, tickTexts[ nearestTickNum ] );
                        const xDividerMax_PX = xTickTextRight_PX - wTickText_PX - spaceFromMarkToText_PX;
                        const xDividerMax_NDC = xPixelToNdc( viewport_PX.x, xDividerMax_PX );
                        const xDividerMin_NDC = -1.0;
                        iDivider = putAlignedBox( this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC );
                    }

                    for ( let tickNum = 0; tickNum < majorTicks.length; tickNum++ ) {
                        const y_FRAC = axisBounds.valueToFrac( majorTicks[ tickNum ] );
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( y_FRAC * axisViewport_PX.span );

                        const yMarkMin_UPX = Math.round( y_UPX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const yMarkMin_NDC = yUpwardPixelToNdc( viewport_PX.y, yMarkMin_UPX );
                        const yMarkMax_NDC = yMarkMin_NDC + ( markWidth_PX * 2 / viewport_PX.h );
                        const xMarkMax_NDC = xPixelToNdc( viewport_PX.x, xMarkRight_PX );
                        const xMarkMin_NDC = xMarkMax_NDC - ( markLength_PX * 2 / viewport_PX.w );
                        iMark = putAlignedBox( this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC );

                        const text = tickTexts[ tickNum ];
                        const wText_PX = getTextWidth( hTextAtlas, text );
                        const xText_PX = xTickTextRight_PX - wText_PX;
                        const yText_UPX = yMarkMin_UPX + Math.round( 0.5*markWidth_PX - 0.5*hTextAtlas.getMaxInnerAscent( ) );
                        const yTextPref_PX = viewport_PX.h - yText_UPX;
                        // Ignore descent, because numbers generally have no descent
                        //const yText_PX = clamp( this.hTextAtlas.getMaxInnerAscent( ), viewport_PX.h - this.hTextAtlas.getMaxInnerDescent( ), yTextPref_PX );
                        const yText_PX = clamp( hTextAtlas.getMaxInnerAscent( ), viewport_PX.h, yTextPref_PX );
                        iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yText_PX, 0, text );
                    }
                }
                else if ( this.labelEdge === EAST ) {
                    const xMarkLeft_PX = edgeOffset_PX;
                    const xTickText_PX = xMarkLeft_PX + markLength_PX + spaceFromMarkToText_PX;
                    const wDigits_PX = Math.max( 0, ...tickTexts.map( tickText => ( tickText.match( /[^+-.]/g ) ?? [] ).length ) ) * getTextWidth( hTextAtlas, '0' );
                    const wDecimalPoint_PX = ( tickTexts[0]?.includes( '.' ) ? getTextWidth( hTextAtlas, '.' ) : 0 );
                    const wSign_PX = Math.max( getTextWidth( hTextAtlas, '-' ), getTextWidth( hTextAtlas, '+' ) );
                    const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
                    const xTitleText_PX = xTickText_PX + wTickTextMax_PX + spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerAscent( );

                    for ( const title of titles ) {
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( title.axisFrac * axisViewport_PX.span );

                        const text = title.text;
                        const textAlignFrac = numberOr( title.textAlignFrac, 0.5 );
                        const hText_PX = getTextWidth( hTextAtlas, text );
                        const yTextPref_UPX = y_UPX - textAlignFrac*hText_PX;

                        const minAxisFrac = numberOr( title.minAxisFrac, 0 );
                        const maxAxisFrac = numberOr( title.maxAxisFrac, 1 );
                        const yTextMin_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( minAxisFrac * axisViewport_PX.span );
                        const yTextMax_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( maxAxisFrac * axisViewport_PX.span ) - hText_PX;

                        const yText_UPX = Math.round( clamp( yTextMin_UPX, yTextMax_UPX, yTextPref_UPX ) + tickOffsetEpsilon_PX );

                        if ( yTextMin_UPX <= yText_UPX && yText_UPX <= yTextMax_UPX ) {
                            const yText_PX = viewport_PX.h - yText_UPX;
                            iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xTitleText_PX, yText_PX, 0.5*Math.PI, text );
                        }
                    }

                    for ( const divider of dividers ) {
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( divider.axisFrac * axisViewport_PX.span );

                        const yDividerMin_UPX = Math.round( y_UPX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const yDividerMin_NDC = yUpwardPixelToNdc( viewport_PX.y, yDividerMin_UPX );
                        const yDividerMax_NDC = yDividerMin_NDC + ( dividerWidth_PX * 2 / viewport_PX.h );
                        const nearestTickNum = findIndexNearest( majorTicks, y => axisBounds.valueToFrac( y ) - divider.axisFrac );
                        const wTickText_PX = getTextWidth( hTextAtlas, tickTexts[ nearestTickNum ] );
                        const xDividerMin_PX = xTickText_PX + wTickText_PX + spaceFromMarkToText_PX;
                        const xDividerMin_NDC = xPixelToNdc( viewport_PX.x, xDividerMin_PX );
                        const xDividerMax_NDC = +1.0;
                        iDivider = putAlignedBox( this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC );
                    }

                    for ( let tickNum = 0; tickNum < majorTicks.length; tickNum++ ) {
                        const y_FRAC = axisBounds.valueToFrac( majorTicks[ tickNum ] );
                        const y_UPX = ( axisViewport_PX.min - viewport_PX.yMin ) + ( y_FRAC * axisViewport_PX.span );

                        const yMarkMin_UPX = Math.round( y_UPX - 0.5*markWidth_PX + tickOffsetEpsilon_PX );
                        const yMarkMin_NDC = yUpwardPixelToNdc( viewport_PX.y, yMarkMin_UPX );
                        const yMarkMax_NDC = yMarkMin_NDC + ( markWidth_PX * 2 / viewport_PX.h );
                        const xMarkMin_NDC = xPixelToNdc( viewport_PX.x, xMarkLeft_PX );
                        const xMarkMax_NDC = xMarkMin_NDC + ( markLength_PX * 2 / viewport_PX.w );
                        iMark = putAlignedBox( this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC );

                        const text = tickTexts[ tickNum ];
                        const yText_UPX = yMarkMin_UPX + Math.round( 0.5*markWidth_PX - 0.5*hTextAtlas.getMaxInnerAscent( ) );
                        const yTextPref_PX = viewport_PX.h - yText_UPX;
                        // Ignore descent, because numbers generally have no descent
                        //const yText_PX = clamp( this.hTextAtlas.getMaxInnerAscent( ), viewport_PX.h - this.hTextAtlas.getMaxInnerDescent( ), yTextPref_PX );
                        const yText_PX = clamp( hTextAtlas.getMaxInnerAscent( ), viewport_PX.h, yTextPref_PX );
                        iText = putTextCoords( hTextAtlas, this.hCoords, iText, viewport_PX, xTickText_PX, yText_PX, 0, text );
                    }
                }

                requireEqual( markCoordCount, iMark - iMark0 );
                requireEqual( dividerCoordCount, iDivider - iDivider0 );
                const textCoordCount = requireTrue( iText - iText0, atMost( maxTextCoordCount ) );
                const totalCoordCount = markCoordCount + dividerCoordCount + textCoordCount;

                //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                this.dCoordsBytes = pushBufferToDevice_BYTES( gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, totalCoordCount );
                this.dCoordsInputs = coordsInputs;
                this.dMarkVertexCount = markCoordCount / 2;
                this.dDividerVertexCount = dividerCoordCount / 2;
                this.dTextVertexCount = textCoordCount / 4;
            }

            // Render from device resources
            const drawText = ( textVisible && this.dTextVertexCount >= 3 );
            const drawMarks = ( marksVisible && this.dMarkVertexCount >= 3 );
            const drawDividers = ( dividersVisible && this.dDividerVertexCount >= 3 );
            if ( drawText || drawMarks || drawDividers ) {
                const markProg = context.getProgram( MARK_PROG_SOURCE );
                const textProg = context.getProgram( TEXT_PROG_SOURCE );
                enablePremultipliedAlphaBlending( gl );

                if ( drawMarks ) {
                    const { program, attribs, uniforms } = markProg;
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    try {
                        //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                        gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 0 );

                        glUniformRgba( gl, uniforms.RGBA, markColor );

                        gl.drawArrays( GL.TRIANGLES, 0, this.dMarkVertexCount );
                    }
                    finally {
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }

                if ( drawDividers ) {
                    const { program, attribs, uniforms } = markProg;
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    try {
                        //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                        gl.vertexAttribPointer( attribs.inCoords, 2, GL.FLOAT, false, 0, 8*this.dMarkVertexCount );

                        glUniformRgba( gl, uniforms.RGBA, dividerColor );

                        gl.drawArrays( GL.TRIANGLES, 0, this.dDividerVertexCount );
                    }
                    finally {
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }

                if ( drawText ) {
                    const { program, attribs, uniforms } = textProg;
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    try {
                        //gl.activeTexture( GL.TEXTURE0 );
                        //gl.bindTexture( GL.TEXTURE_2D, this.dTextAtlas.texture );
                        gl.uniform1i( uniforms.ATLAS, 0 );

                        //gl.bindBuffer( GL.ARRAY_BUFFER, this.dCoords );
                        gl.vertexAttribPointer( attribs.inCoords, 4, GL.FLOAT, false, 0, 8*( this.dMarkVertexCount + this.dDividerVertexCount ) );

                        glUniformRgba( gl, uniforms.RGBA, textColor );

                        gl.drawArrays( GL.TRIANGLES, 0, this.dTextVertexCount );
                    }
                    finally {
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }
            }
        }
    }

    dispose( context: Context ): void {
        const gl = context.gl;
        gl.deleteBuffer( this.dCoords );
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dMarkVertexCount = 0;
        this.dTextVertexCount = 0;
    }
}

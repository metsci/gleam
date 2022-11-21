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
import { activeTexture, Atlas, bindTexture, Color, Context, createDomPeer, cssFloat, currentDpr, enablePremultipliedAlphaBlending, ensureHostBufferCapacity, frozenSupplier, GL, glUniformInterval2D, glUniformSize2D, GRAY, Interval1D, Interval2D, Painter, PeerType, RED, requireFloatTextureSupport, requireVertexTexUnits, StyleProp, ValueBase, WHITE } from '@metsci/gleam-core';
import { DisposerGroup, equal, LinkedMap, Nullable, RefBasic, requireDefined, requireNonNull, run, Supplier, tripleEquals } from '@metsci/gleam-util';
import { EventsGroup, ReadableEvent } from '../data';
import { FrozenPattern, Pattern, PatternRasterizer, SolidPatternRasterizer } from '../patterns';
import { EventsTable, StylesTable } from './common';
import { glUniformEra, Indexed, StateMarker } from './misc';

import * as BordersProgram from './bordersProgram';
import * as GlyphsProgram from './glyphsProgram';
import * as PatternsProgram from './patternsProgram';

export interface EventStyle extends GlyphsProgram.GlyphStyle {
    readonly barMarginTop_LPX: { get: Supplier<number> };
    readonly barMarginBottom_LPX: { get: Supplier<number> };
    readonly barBorderColor: { get: Supplier<Color> };
    readonly barBorderWidth_LPX: { get: Supplier<number> };
    createBarFillRasterizer( laneHeight_LPX: number, maxDim_PX: number ): PatternRasterizer;

    readonly labelColor: { get: Supplier<Color> };
    readonly labelOffsetX_LPX: { get: Supplier<number> };
    readonly labelOffsetY_LPX: { get: Supplier<number> };
    readonly labelAllowOvershoot: { get: Supplier<boolean> };
    createGlyphRasterizer( ): GlyphsProgram.GlyphRasterizer;
}

class FallbackGlyphRasterizer extends ValueBase implements GlyphsProgram.GlyphRasterizer {
    protected static readonly glyph = run( ( ) => {
        const border_PX = 1;

        const canvas = document.createElement( 'canvas' );
        canvas.width = border_PX + 10 + border_PX;
        canvas.height = border_PX + 10 + border_PX;
        const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
        g.clearRect( 0, 0, canvas.width, canvas.height );
        g.fillStyle = RED.cssString;
        g.fillRect( border_PX, border_PX, 10, 10 );

        return {
            isAlphaMask: false,
            unpackedWidth: canvas.width,
            image: {
                xAnchor: 0,
                yAnchor: 0,
                border: border_PX,
                imageData: g.getImageData( 0, 0, canvas.width, canvas.height ),
            },
        };
    } );

    constructor( ) {
        super( 'FallbackGlyphRasterizer' );
    }

    createGlyph( ): GlyphsProgram.Glyph {
        return FallbackGlyphRasterizer.glyph;
    }
}

export const FALLBACK_EVENT_FILL_RASTERIZER: PatternRasterizer = new SolidPatternRasterizer( GRAY );
export const FALLBACK_EVENT_FILL_PATTERN: Pattern = new FrozenPattern( 'fallback-pattern', FALLBACK_EVENT_FILL_RASTERIZER );
export const FALLBACK_GLYPH_RASTERIZER: GlyphsProgram.GlyphRasterizer = new FallbackGlyphRasterizer( );
export const FALLBACK_EVENT_STYLE: EventStyle = Object.freeze( {
    barMarginTop_LPX: { get: frozenSupplier( 0 ) },
    barMarginBottom_LPX: { get: frozenSupplier( 0 ) },
    barBorderColor: { get: frozenSupplier( RED ) },
    barBorderWidth_LPX: { get: frozenSupplier( 0 ) },
    createBarFillRasterizer: frozenSupplier( FALLBACK_EVENT_FILL_RASTERIZER ),

    labelColor: { get: frozenSupplier( WHITE ) },
    labelOffsetX_LPX: { get: frozenSupplier( 0 ) },
    labelOffsetY_LPX: { get: frozenSupplier( 0 ) },
    labelAllowOvershoot: { get: frozenSupplier( false ) },
    createGlyphRasterizer: frozenSupplier( FALLBACK_GLYPH_RASTERIZER ),
} );

export function roundLpxToPx( lpx: number, dpr: number ): number {
    return Math.round( lpx * dpr ) / dpr;
}

export class EventsPainter implements Painter {
    readonly peer = createDomPeer( 'timeline-events-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly laneHeight_LPX = StyleProp.create( this.style, '--lane-height-px', cssFloat, 20 );
    readonly eventMinApparentWidth_LPX = StyleProp.create( this.style, '--event-min-apparent-width-px', cssFloat, 1 );
    readonly glyphFadeZone_LPX = StyleProp.create( this.style, '--glyph-fade-zone-px', cssFloat, 20 );

    readonly visible = new RefBasic( true, tripleEquals );


    readonly events: EventsGroup<ReadableEvent>;
    timeBoundsFn_PSEC: Supplier<Interval1D>;
    createEventStyle: ( classes: ReadonlySet<string> ) => EventStyle;


    protected readonly disposers: DisposerGroup;
    protected readonly eventPositionChanges: Set<ReadableEvent>;
    protected readonly eventRightNeighborChanges: Set<ReadableEvent>;
    protected readonly eventStyleChanges: Set<ReadableEvent>;
    protected readonly eventLabelChanges: Set<ReadableEvent>;


    protected readonly hStyles: Indexed<string,EventStyle>;
    protected readonly hStylesTable: StylesTable;
    protected readonly hEventsTable: EventsTable<ReadableEvent>;

    protected readonly hPatternsAtlas: Atlas<string>;
    protected hPatternsTable: Float32Array;
    protected readonly hPatternsVertices: PatternsProgram.VertexSet;

    protected readonly hBordersVertices: BordersProgram.VertexSet;

    protected readonly hGlyphsAtlas: GlyphsProgram.GlyphAtlas;
    protected readonly hGlyphsStrings: GlyphsProgram.StringSet;
    protected readonly hGlyphsVertices: GlyphsProgram.VertexBoxSet;
    protected hGlyphsMinDirtyBoxIndex: number;
    protected hGlyphsMaxDirtyBoxIndex: number;


    protected glIncarnation: unknown;

    protected dStylesTable: Nullable<WebGLTexture>;
    protected dEventsTable: Nullable<WebGLTexture>;
    protected dStylesTableMarker: Nullable<StateMarker>;
    protected dEventsTableMarker: Nullable<StateMarker>;

    protected dPatterns: LinkedMap<string,PatternRasterizer>;
    protected dPatternsAtlas: Nullable<WebGLTexture>;
    protected dPatternsTable: Nullable<WebGLTexture>;
    protected dPatternsVertexCoords: Nullable<WebGLBuffer>;
    protected dPatternsVertexCoordsCapacityBytes: number;
    protected dPatternsVertexCount: number;
    protected dPatternsVertexCoordsMarker: Nullable<StateMarker>;

    protected dBordersVertexCoords: Nullable<WebGLBuffer>;
    protected dBordersVertexCoordsCapacityBytes: number;
    protected dBordersVertexCount: number;
    protected dBordersVertexCoordsMarker: Nullable<StateMarker>;

    protected dGlyphsAtlas: Nullable<WebGLTexture>;
    protected dGlyphsTable: Nullable<WebGLTexture>;
    protected dGlyphsCodes: Nullable<WebGLTexture>;
    protected dGlyphsVertexCoords: Nullable<WebGLBuffer>;
    protected dGlyphsVertexCoordsCapacityBytes: number;
    protected dGlyphsVertexCount: number;
    protected dGlyphsAtlasMarker: Nullable<StateMarker>;
    protected dGlyphsCodesMarker: Nullable<StateMarker>;
    protected dGlyphsVertexCoordsMarker: Nullable<StateMarker>;


    constructor( events: EventsGroup<ReadableEvent> ) {
        this.events = events;
        this.timeBoundsFn_PSEC = frozenSupplier( Interval1D.fromEdges( 0, 1 ) );
        this.createEventStyle = frozenSupplier( FALLBACK_EVENT_STYLE );

        this.disposers = new DisposerGroup( );

        this.eventPositionChanges = new Set( );
        this.disposers.add( this.events.positionChanges.addListener( change => {
            change && this.eventPositionChanges.add( change.event );
        } ) );

        this.eventRightNeighborChanges = new Set( );
        this.disposers.add( this.events.rightNeighborChanges.addListener( change => {
            change && this.eventRightNeighborChanges.add( change.event );
        } ) );

        this.eventStyleChanges = new Set( );
        this.disposers.add( this.events.styleChanges.addListener( change => {
            change && this.eventStyleChanges.add( change.event );
            change && this.eventLabelChanges.add( change.event );
        } ) );

        this.eventLabelChanges = new Set( );
        this.disposers.add( this.events.labelChanges.addListener( change => {
            change && this.eventLabelChanges.add( change.event );
        } ) );

        this.hStyles = new Indexed( );
        this.hStylesTable = new StylesTable( );
        this.hEventsTable = new EventsTable( );

        this.hPatternsAtlas = new Atlas( 4096 );
        this.hPatternsTable = new Float32Array( 0 );
        this.hPatternsVertices = new PatternsProgram.VertexSet( );
        this.hEventsTable.keyMoves.addListener( move => {
            // Triggered in the paint method below, when hEventsTable changes
            if ( move ) {
                const { oldIndex, newIndex } = move;
                if ( oldIndex === undefined && newIndex !== undefined ) {
                    this.hPatternsVertices.eventCount++;
                }
                else if ( oldIndex !== undefined && newIndex === undefined ) {
                    this.hPatternsVertices.eventCount--;
                }
            }
        } );

        this.hBordersVertices = new BordersProgram.VertexSet( );
        this.hEventsTable.keyMoves.addListener( move => {
            // Triggered in the paint method below, when hEventsTable changes
            if ( move ) {
                const { oldIndex, newIndex } = move;
                if ( oldIndex === undefined && newIndex !== undefined ) {
                    this.hBordersVertices.eventCount++;
                }
                else if ( oldIndex !== undefined && newIndex === undefined ) {
                    this.hBordersVertices.eventCount--;
                }
            }
        } );

        this.hGlyphsAtlas = new GlyphsProgram.GlyphAtlas( );
        this.hGlyphsStrings = new GlyphsProgram.StringSet( );
        this.hGlyphsVertices = new GlyphsProgram.VertexBoxSet( );
        this.hEventsTable.keyMoves.addListener( move => {
            // Triggered in the paint method below, when hEventsTable changes
            if ( move ) {
                const { oldIndex, newIndex } = move;
                if ( oldIndex === undefined && newIndex !== undefined ) {
                    const event = requireDefined( this.hEventsTable.key( newIndex ) );
                    const codeCount = this.hEventsTable.codeCount( event );
                    this.hGlyphsVertices.setEvent( newIndex, codeCount );
                }
                else if ( oldIndex !== undefined && newIndex !== undefined ) {
                    this.hGlyphsVertices.updateEventIndex( oldIndex, newIndex );
                }
                else if ( oldIndex !== undefined && newIndex === undefined ) {
                    this.hGlyphsVertices.deleteEvent( oldIndex );
                }
            }
        } );
        this.hGlyphsMinDirtyBoxIndex = Number.POSITIVE_INFINITY;
        this.hGlyphsMaxDirtyBoxIndex = Number.NEGATIVE_INFINITY;
        this.hGlyphsVertices.boxIndexDirtyings.addListener( boxIndex => {
            if ( boxIndex !== undefined ) {
                this.hGlyphsMinDirtyBoxIndex = Math.min( this.hGlyphsMinDirtyBoxIndex, boxIndex );
                this.hGlyphsMaxDirtyBoxIndex = Math.max( this.hGlyphsMaxDirtyBoxIndex, boxIndex );
            }
        } );

        this.glIncarnation = null;

        this.dStylesTable = null;
        this.dEventsTable = null;
        this.dStylesTableMarker = null;
        this.dEventsTableMarker = null;

        this.dPatterns = new LinkedMap( );
        this.dPatternsAtlas = null;
        this.dPatternsTable = null;
        this.dPatternsVertexCoords = null;
        this.dPatternsVertexCoordsCapacityBytes = -1;
        this.dPatternsVertexCount = -1;
        this.dPatternsVertexCoordsMarker = null;

        this.dBordersVertexCoords = null;
        this.dBordersVertexCoordsCapacityBytes = -1;
        this.dBordersVertexCount = -1;
        this.dBordersVertexCoordsMarker = null;

        this.dGlyphsAtlas = null;
        this.dGlyphsTable = null;
        this.dGlyphsCodes = null;
        this.dGlyphsVertexCoords = null;
        this.dGlyphsVertexCoordsCapacityBytes = -1;
        this.dGlyphsVertexCount = -1;
        this.dGlyphsAtlasMarker = null;
        this.dGlyphsCodesMarker = null;
        this.dGlyphsVertexCoordsMarker = null;
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const dpr = currentDpr( this );

        const laneHeight_LPX = roundLpxToPx( this.laneHeight_LPX.get( ), dpr );
        const eventMinApparentWidth_LPX = this.eventMinApparentWidth_LPX.get( );
        const glyphFadeZone_LPX = this.glyphFadeZone_LPX.get( );

        const laneHeight_PX = dpr * laneHeight_LPX;
        const eventMinApparentWidth_PX = dpr * eventMinApparentWidth_LPX;
        const glyphFadeZone_PX = dpr * glyphFadeZone_LPX;

        const gl = context.gl;
        requireFloatTextureSupport( gl );

        // TODO: Cache glyph vertex and texture coords by rendering to a texture?

        // Reset device resources on context reincarnation
        if ( context.glIncarnation !== this.glIncarnation ) {
            this.glIncarnation = context.glIncarnation;

            this.dStylesTable = gl.createTexture( );
            this.dEventsTable = gl.createTexture( );
            this.dStylesTableMarker = null;
            this.dEventsTableMarker = null;

            this.dPatterns.clear( );
            this.dPatternsAtlas = gl.createTexture( );
            this.dPatternsTable = gl.createTexture( );
            this.dPatternsVertexCoords = gl.createBuffer( );
            this.dPatternsVertexCoordsCapacityBytes = -1;
            this.dPatternsVertexCount = -1;
            this.dPatternsVertexCoordsMarker = null;

            this.dBordersVertexCoords = gl.createBuffer( );
            this.dBordersVertexCoordsCapacityBytes = -1;
            this.dBordersVertexCount = -1;
            this.dBordersVertexCoordsMarker = null;

            this.dGlyphsAtlas = gl.createTexture( );
            this.dGlyphsTable = gl.createTexture( );
            this.dGlyphsCodes = gl.createTexture( );
            this.dGlyphsVertexCoords = gl.createBuffer( );
            this.dGlyphsVertexCoordsCapacityBytes = -1;
            this.dGlyphsVertexCount = -1;
            this.dGlyphsAtlasMarker = null;
            this.dGlyphsCodesMarker = null;
            this.dGlyphsVertexCoordsMarker = null;
            this.hGlyphsMinDirtyBoxIndex = 0;
            this.hGlyphsMaxDirtyBoxIndex = this.hGlyphsVertices.boxCount - 1;
        }

        // On some platforms (including Firefox on Linux with Intel Gfx), we get major visual
        // artifacts on some frames. During parts of such frames, shader calls to texture2D()
        // return incorrect values. Seems like a race condition in the driver. Using a separate
        // tex unit for each texture (instead of reusing units 0 and 1 after the first draw
        // call) makes the artifacts less frequent.
        const stylesTableTexUnit = bindTexture( gl, 0, this.dStylesTable );
        const eventsTableTexUnit = bindTexture( gl, 1, this.dEventsTable );
        const patternsAtlasTexUnit = bindTexture( gl, 2, this.dPatternsAtlas );
        const patternsTableTexUnit = bindTexture( gl, 3, this.dPatternsTable );
        const glyphsAtlasTexUnit = bindTexture( gl, 4, this.dGlyphsAtlas );
        const glyphsTableTexUnit = bindTexture( gl, 5, this.dGlyphsTable );
        const glyphsCodesTexUnit = bindTexture( gl, 6, this.dGlyphsCodes );
        requireVertexTexUnits( gl, 7 );

        // Apply queued changes
        for ( const event of this.eventPositionChanges ) {
            const newLaneNum = this.events.getLaneNumContaining( event );
            if ( newLaneNum !== undefined ) {
                const era_PSEC = event.era_PSEC;
                this.hEventsTable.setPosition( event, era_PSEC, newLaneNum );
            }
            else {
                this.hEventsTable.delete( event );
            }
        }
        for ( const event of this.eventRightNeighborChanges ) {
            const lane = this.events.getLaneContaining( event );
            if ( lane ) {
                const rightNeighbor = this.events.getRightNeighbor( event );
                const rightNeighbor_PSEC = rightNeighbor?.era_PSEC.min ?? Number.POSITIVE_INFINITY;
                this.hEventsTable.setRightNeighbor( event, rightNeighbor_PSEC );
            }
        }
        for ( const event of this.eventStyleChanges ) {
            const styleKey = event.styleKey;
            const [ styleIndex ] = this.hStyles.createIfAbsent( styleKey, ( ) => {
                return this.createEventStyle( event.classes );
            } );
            this.hEventsTable.setStyle( event, styleIndex );
        }
        for ( const event of this.eventLabelChanges ) {
            const styleKey = event.styleKey;
            const [ _, eventStyle ] = this.hStyles.requireByKey( styleKey );

            const label = event.label;
            const glyphCodes = new Array<number>( );
            for ( const glyphName of label ) {
                const glyphCode = this.hGlyphsAtlas.addIfAbsent( eventStyle, glyphName );
                glyphCodes.push( glyphCode );
            }

            // TODO: Overwrite instead of remove/add, depending on old and new lengths
            const oldFirstCodeIndex = this.hEventsTable.firstCodeIndex( event );
            this.hGlyphsStrings.remove( oldFirstCodeIndex );
            const newFirstCodeIndex = this.hGlyphsStrings.add( glyphCodes );
            this.hEventsTable.setString( event, newFirstCodeIndex, glyphCodes.length );
        }
        this.eventPositionChanges.clear( );
        this.eventRightNeighborChanges.clear( );
        this.eventStyleChanges.clear( );
        this.eventLabelChanges.clear( );

        // Repopulate device style info, if necessary
        for ( const [ _, eventStyle, styleIndex ] of this.hStyles ) {
            this.hStylesTable.set( styleIndex, {
                barMarginTop_LPX: eventStyle.barMarginTop_LPX.get( ),
                barMarginBottom_LPX: eventStyle.barMarginBottom_LPX.get( ),
                barBorderColor: eventStyle.barBorderColor.get( ),
                barBorderWidth_LPX: eventStyle.barBorderWidth_LPX.get( ),
                labelOffsetX_LPX: eventStyle.labelOffsetX_LPX.get( ),
                labelOffsetY_LPX: eventStyle.labelOffsetY_LPX.get( ),
                labelColor: eventStyle.labelColor.get( ),
                labelAllowOvershoot: eventStyle.labelAllowOvershoot.get( ),
            } );
        }
        if ( this.dStylesTableMarker !== this.hStylesTable.marker ) {
            activeTexture( gl, stylesTableTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, this.hStylesTable.texelsPerRank( 4 ), this.hStylesTable.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hStylesTable.table );

            this.dStylesTableMarker = this.hStylesTable.marker;
        }

        // Repopulate device event info, if necessary
        if ( this.dEventsTableMarker !== this.hEventsTable.marker ) {
            activeTexture( gl, eventsTableTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, this.hEventsTable.texelsPerRank( 4 ), this.hEventsTable.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hEventsTable.table );

            this.dEventsTableMarker = this.hEventsTable.marker;
        }

        // Repopulate device patterns, if necessary
        const dPatternsValid = run( ( ) => {
            for ( const [ styleKey, eventStyle ] of this.hStyles ) {
                const oldPattern = this.dPatterns.get( styleKey );
                const newPattern = eventStyle.createBarFillRasterizer( laneHeight_LPX, this.hPatternsAtlas.maxDim );
                if ( !equal( newPattern, oldPattern ) ) {
                    return false;
                }
            }
            return true;
        } );
        if ( !dPatternsValid ) {
            this.hPatternsAtlas.clear( );
            const hPatterns = new LinkedMap<string,PatternRasterizer>( );
            for ( const [ styleKey, eventStyle ] of this.hStyles ) {
                const pattern = eventStyle.createBarFillRasterizer( laneHeight_LPX, this.hPatternsAtlas.maxDim );
                this.hPatternsAtlas.put( styleKey, pattern.createImage( ) );
                hPatterns.set( styleKey, pattern );
            }

            const wTexel_FRAC = 1.0 / this.hPatternsAtlas.getUsedArea( ).w;
            const hTexel_FRAC = 1.0 / this.hPatternsAtlas.getUsedArea( ).h;
            this.hPatternsTable = ensureHostBufferCapacity( this.hPatternsTable, 4*this.hPatternsAtlas.size, false );
            for ( const [ styleKey, _, styleIndex ] of this.hStyles ) {
                const [ image, box ] = requireDefined( this.hPatternsAtlas.get( styleKey ) );
                const sMin = ( box.xMin + image.border )*wTexel_FRAC;
                const tMin = ( box.yMin + image.border )*hTexel_FRAC;
                const sMax = ( box.xMax - image.border )*wTexel_FRAC;
                const tMax = ( box.yMax - image.border )*hTexel_FRAC;
                this.hPatternsTable[ 4*styleIndex + 0 ] = sMin;
                this.hPatternsTable[ 4*styleIndex + 1 ] = tMin;
                this.hPatternsTable[ 4*styleIndex + 2 ] = sMax - sMin;
                this.hPatternsTable[ 4*styleIndex + 3 ] = tMax - tMin;
            }

            activeTexture( gl, patternsAtlasTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.hPatternsAtlas.getPixels( ) );

            activeTexture( gl, patternsTableTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, this.hPatternsAtlas.size, 1, 0, GL.RGBA, GL.FLOAT, this.hPatternsTable );

            this.dPatterns = hPatterns;
        }

        // Repopulate device patterns coords, if necessary
        if ( this.dPatternsVertexCoordsMarker !== this.hPatternsVertices.marker ) {
            this.dPatternsVertexCoordsCapacityBytes = run( ( ) => {
                const oldCapacityBytes = this.dPatternsVertexCoordsCapacityBytes;
                const newCapacityBytes = this.hPatternsVertices.vertexCoords.byteLength;
                if ( newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes ) {
                    gl.bindBuffer( GL.ARRAY_BUFFER, this.dPatternsVertexCoords );
                    gl.bufferData( GL.ARRAY_BUFFER, this.hPatternsVertices.vertexCoords, GL.STATIC_DRAW );
                    return newCapacityBytes;
                }
                return oldCapacityBytes;
            } );
            this.dPatternsVertexCount = 6*this.hPatternsVertices.eventCount;
            this.dPatternsVertexCoordsMarker = this.hPatternsVertices.marker;
        }

        // Render patterns from device resources
        if ( this.dPatternsVertexCount > 0 ) {
            const { program, attribs, uniforms } = context.getProgram( PatternsProgram.SOURCE );
            enablePremultipliedAlphaBlending( gl );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertexCoords );
            try {
                gl.uniform1f( uniforms.DPR, dpr );
                glUniformEra( gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC( ) );
                glUniformInterval2D( gl, uniforms.VIEWPORT_PX, viewport_PX );
                gl.uniform1f( uniforms.LANE_HEIGHT_PX, laneHeight_PX );
                gl.uniform1f( uniforms.EVENT_MIN_APPARENT_WIDTH_PX, eventMinApparentWidth_PX );

                gl.uniform1i( uniforms.STYLES_TABLE, stylesTableTexUnit );
                gl.uniform2f( uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank( 4 ), this.hStylesTable.ranksTotal );

                gl.uniform1i( uniforms.EVENTS_TABLE, eventsTableTexUnit );
                gl.uniform2f( uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank( 4 ), this.hEventsTable.ranksTotal );

                gl.uniform1i( uniforms.PATTERNS_ATLAS, patternsAtlasTexUnit );
                glUniformSize2D( gl, uniforms.PATTERNS_ATLAS_SIZE_PX, this.hPatternsAtlas.getUsedArea( ) );

                gl.uniform1i( uniforms.PATTERNS_TOC, patternsTableTexUnit );
                gl.uniform1f( uniforms.PATTERNS_TOC_SIZE, this.hPatternsAtlas.size );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dPatternsVertexCoords );
                gl.vertexAttribPointer( attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.TRIANGLES, 0, this.dPatternsVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inVertexCoords );
                gl.useProgram( null );
            }
        }

        // Repopulate device border vertex coords, if necessary
        if ( this.dBordersVertexCoordsMarker !== this.hBordersVertices.marker ) {
            this.dBordersVertexCoordsCapacityBytes = run( ( ) => {
                const oldCapacityBytes = this.dBordersVertexCoordsCapacityBytes;
                const newCapacityBytes = this.hBordersVertices.vertexCoords.byteLength;
                if ( newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes ) {
                    gl.bindBuffer( GL.ARRAY_BUFFER, this.dBordersVertexCoords );
                    gl.bufferData( GL.ARRAY_BUFFER, this.hBordersVertices.vertexCoords, GL.STATIC_DRAW );
                    return newCapacityBytes;
                }
                return oldCapacityBytes;
            } );
            this.dBordersVertexCount = 6*4*this.hBordersVertices.eventCount;
            this.dBordersVertexCoordsMarker = this.hBordersVertices.marker;
        }

        // Render borders from device resources
        if ( this.dBordersVertexCount > 0 ) {
            const { program, attribs, uniforms } = context.getProgram( BordersProgram.SOURCE );
            enablePremultipliedAlphaBlending( gl );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertexCoords );
            try {
                gl.uniform1f( uniforms.DPR, dpr );
                glUniformEra( gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC( ) );
                glUniformInterval2D( gl, uniforms.VIEWPORT_PX, viewport_PX );
                gl.uniform1f( uniforms.LANE_HEIGHT_PX, laneHeight_PX );
                gl.uniform1f( uniforms.EVENT_MIN_APPARENT_WIDTH_PX, eventMinApparentWidth_PX );

                gl.uniform1i( uniforms.STYLES_TABLE, stylesTableTexUnit );
                gl.uniform2f( uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank( 4 ), this.hStylesTable.ranksTotal );

                gl.uniform1i( uniforms.EVENTS_TABLE, eventsTableTexUnit );
                gl.uniform2f( uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank( 4 ), this.hEventsTable.ranksTotal );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dBordersVertexCoords );
                gl.vertexAttribPointer( attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.TRIANGLES, 0, this.dBordersVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inVertexCoords );
                gl.useProgram( null );
            }
        }

        // Repopulate device glyphs, if necessary
        this.hGlyphsAtlas.commit( );
        if ( this.dGlyphsAtlasMarker !== this.hGlyphsAtlas.marker ) {
            activeTexture( gl, glyphsAtlasTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            if ( this.hGlyphsAtlas.atlas.size > 0 ) {
                const { w, h } = this.hGlyphsAtlas.atlas.getUsedArea( );
                gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.hGlyphsAtlas.atlas.getPixelBytes( ) );
            }
            else {
                gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, 0, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array( 0 ) );
            }

            activeTexture( gl, glyphsTableTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, this.hGlyphsAtlas.tocTexelsPerRank( 4 ), this.hGlyphsAtlas.tocRanksTotal, 0, GL.RGBA, GL.FLOAT, this.hGlyphsAtlas.toc );

            this.dGlyphsAtlasMarker = this.hGlyphsAtlas.marker;
        }

        // Repopulate device glyph vertex coords, if necessary
        if ( this.dGlyphsVertexCoordsMarker !== this.hGlyphsVertices.marker ) {
            this.dGlyphsVertexCount = 6*this.hGlyphsVertices.boxCount;
            if ( this.dGlyphsVertexCount > 0 ) {
                if ( this.hGlyphsMaxDirtyBoxIndex > this.hGlyphsMinDirtyBoxIndex ) {
                    this.dGlyphsVertexCoordsCapacityBytes = run( ( ) => {
                        const oldCapacityBytes = this.dGlyphsVertexCoordsCapacityBytes;
                        const newCapacityBytes = this.hGlyphsVertices.vertexCoords.byteLength;
                        if ( newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes ) {
                            gl.bindBuffer( GL.ARRAY_BUFFER, this.dGlyphsVertexCoords );
                            gl.bufferData( GL.ARRAY_BUFFER, newCapacityBytes, GL.STATIC_DRAW );
                            gl.bufferSubData( GL.ARRAY_BUFFER, 0, this.hGlyphsVertices.vertexCoords.subarray( 0, 2*this.dGlyphsVertexCount ) );
                            return newCapacityBytes;
                        }
                        else {
                            gl.bindBuffer( GL.ARRAY_BUFFER, this.dGlyphsVertexCoords );
                            const startFloat = 2*6*this.hGlyphsMinDirtyBoxIndex;
                            const endFloat = 2*6*( this.hGlyphsMaxDirtyBoxIndex + 1 );
                            gl.bufferSubData( GL.ARRAY_BUFFER, 4*startFloat, this.hGlyphsVertices.vertexCoords.subarray( startFloat, endFloat ) );
                            return oldCapacityBytes;
                        }
                    } );
                    this.hGlyphsMinDirtyBoxIndex = Number.POSITIVE_INFINITY;
                    this.hGlyphsMaxDirtyBoxIndex = Number.NEGATIVE_INFINITY;
                }
            }

            this.dGlyphsVertexCoordsMarker = this.hGlyphsVertices.marker;
        }

        // Repopulate device glyph codes, if necessary
        if ( this.dGlyphsCodesMarker !== this.hGlyphsStrings.marker ) {
            activeTexture( gl, glyphsCodesTexUnit );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            gl.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, this.hGlyphsStrings.texelsPerRank( 4 ), this.hGlyphsStrings.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hGlyphsStrings.floats );

            this.dGlyphsCodesMarker = this.hGlyphsStrings.marker;
        }

        // Render glyphs from device resources
        if ( this.dGlyphsVertexCount > 0 ) {
            const { program, attribs, uniforms } = context.getProgram( GlyphsProgram.SOURCE );
            enablePremultipliedAlphaBlending( gl );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertexCoords );
            try {
                gl.uniform1f( uniforms.DPR, dpr );
                glUniformEra( gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC( ) );
                glUniformInterval2D( gl, uniforms.VIEWPORT_PX, viewport_PX );
                gl.uniform1f( uniforms.LANE_HEIGHT_PX, laneHeight_PX );
                gl.uniform1f( uniforms.FADE_ZONE_PX, glyphFadeZone_PX );

                gl.uniform1i( uniforms.STYLES_TABLE, stylesTableTexUnit );
                gl.uniform2f( uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank( 4 ), this.hStylesTable.ranksTotal );

                gl.uniform1i( uniforms.EVENTS_TABLE, eventsTableTexUnit );
                gl.uniform2f( uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank( 4 ), this.hEventsTable.ranksTotal );

                gl.uniform1i( uniforms.ATLAS, glyphsAtlasTexUnit );
                glUniformSize2D( gl, uniforms.ATLAS_SIZE_PX, this.hGlyphsAtlas.atlas.getUsedArea( ) );

                gl.uniform1i( uniforms.GLYPHS_TABLE, glyphsTableTexUnit );
                gl.uniform2f( uniforms.GLYPHS_TABLE_SIZE, this.hGlyphsAtlas.tocTexelsPerRank( 4 ), this.hGlyphsAtlas.tocRanksTotal );

                gl.uniform1i( uniforms.CODES, glyphsCodesTexUnit );
                gl.uniform2f( uniforms.CODES_SIZE, this.hGlyphsStrings.texelsPerRank( 4 ), this.hGlyphsStrings.ranksTotal );

                gl.bindBuffer( GL.ARRAY_BUFFER, this.dGlyphsVertexCoords );
                gl.vertexAttribPointer( attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0 );

                gl.drawArrays( GL.TRIANGLES, 0, this.dGlyphsVertexCount );
            }
            finally {
                gl.disableVertexAttribArray( attribs.inVertexCoords );
                gl.useProgram( null );
            }
        }
    }

    dispose( context: Context ): void {
        this.disposers.dispose( );
        const gl = context.gl;
        this.glIncarnation = null;

        gl.deleteTexture( this.dStylesTable );
        gl.deleteTexture( this.dEventsTable );
        this.dStylesTable = null;
        this.dEventsTable = null;
        this.dStylesTableMarker = null;
        this.dEventsTableMarker = null;

        gl.deleteTexture( this.dPatternsAtlas );
        gl.deleteTexture( this.dPatternsTable );
        gl.deleteBuffer( this.dPatternsVertexCoords );
        this.dPatternsAtlas = null;
        this.dPatternsTable = null;
        this.dPatterns.clear( );
        this.dPatternsVertexCoords = null;
        this.dPatternsVertexCoordsCapacityBytes = -1;
        this.dPatternsVertexCount = -1;
        this.dPatternsVertexCoordsMarker = null;

        gl.deleteBuffer( this.dBordersVertexCoords );
        this.dBordersVertexCoords = null;
        this.dBordersVertexCoordsCapacityBytes = -1;
        this.dBordersVertexCount = -1;
        this.dBordersVertexCoordsMarker = null;

        gl.deleteTexture( this.dGlyphsAtlas );
        gl.deleteTexture( this.dGlyphsTable );
        gl.deleteTexture( this.dGlyphsCodes );
        gl.deleteBuffer( this.dGlyphsVertexCoords );
        this.dGlyphsAtlas = null;
        this.dGlyphsTable = null;
        this.dGlyphsCodes = null;
        this.dGlyphsVertexCoords = null;
        this.dGlyphsVertexCoordsCapacityBytes = -1;
        this.dGlyphsVertexCount = -1;
        this.dGlyphsAtlasMarker = null;
        this.dGlyphsCodesMarker = null;
        this.dGlyphsVertexCoordsMarker = null;
    }
}

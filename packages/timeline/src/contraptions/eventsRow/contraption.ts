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
import { Axis1D, axisBoundsFn, ChildlessLayout, createDomPeer, createTextImage, cssBoolean, cssColor, cssFloat, cssString, currentDpr, DEFAULT_CHARS, DragHandler, estimateFontMetrics, FontMetrics, frozenSupplier, getMouseAxisCoord1D, HoverHandler, InputHandler, Interval1D, KeyHandler, Pane, PaneMouseEvent, PeerType, setCssClassPresent, StyleProp, ValueBase, X } from '@metsci/gleam-core';
import { appendChild, Disposer, DisposerGroup, FireableListenable, hashCode, IMMEDIATE, ImmutableMap, ImmutableSet, isNullish, linkListenables, ListenableBasic, newImmutableMap, newImmutableSet, Nullable, ReadableRef, run, Supplier, ValueObject, _addOldNewActivityListener } from '@metsci/gleam-util';
import { constrainEra, EraConstraintMode, EraConstraints, EventsGroup, isWritableEvent, ReadableEvent, READABLE_EVENT_SYMBOL, WritableEvent, WRITABLE_EVENT_SYMBOL } from './data';
import { EventsPainter, EventStyle, FALLBACK_EVENT_FILL_PATTERN, GlyphRasterizer } from './painter';
import { Glyph } from './painter/glyphsProgram';
import { roundLpxToPx } from './painter/painter';
import { Pattern, PatternRasterizer } from './patterns';

const eventResizeMinWidth_LPX = 3;
const edgeGrabDistance_LPX = 6;
const edgeSnapDistance_LPX = 6;

export class EventImpl implements WritableEvent {
    readonly [ READABLE_EVENT_SYMBOL ] = true;
    readonly [ WRITABLE_EVENT_SYMBOL ] = true;

    protected _label: string;
    protected _era_PSEC: Interval1D;
    protected _allowsUserDrag: boolean;
    protected _eraConstraints_PSEC: EraConstraints;
    protected _classes: ImmutableSet<string>;
    protected _styleKeyCache: {
        classes: ImmutableSet<string>,
        styleKey: string,
    } | undefined;

    /**
     * Intended for use by implementing classes, and by `EventsGroup`.
     *
     * A `Listenable` (or similar) would make for cleaner code, but this has a smaller
     * memory footprint, which allows us to handle a larger number of events.
     */
    _owner: EventsGroup<ReadableEvent> | undefined;

    constructor( label: string, era_PSEC: Interval1D, options?: {
        allowsUserDrag?: boolean,
        eraConstraints_PSEC?: EraConstraints,
        classes?: Iterable<string>
    } ) {
        this._label = label;
        this._allowsUserDrag = options?.allowsUserDrag ?? false;
        this._eraConstraints_PSEC = ( options?.eraConstraints_PSEC ? { ...options.eraConstraints_PSEC } : {} );
        this._era_PSEC = constrainEra( era_PSEC, this._eraConstraints_PSEC );
        this._classes = newImmutableSet( options?.classes ?? [] );
        this._styleKeyCache = undefined;
        this._owner = undefined;
    }

    get label( ): string {
        return this._label;
    }

    get era_PSEC( ): Interval1D {
        return this._era_PSEC;
    }

    get allowsUserDrag( ): boolean {
        return this._allowsUserDrag;
    }

    get eraConstraints_PSEC( ): Readonly<EraConstraints> {
        return this._eraConstraints_PSEC;
    }

    get classes( ): ImmutableSet<string> {
        return this._classes;
    }

    get styleKey( ): string {
        if ( !this._styleKeyCache || this._styleKeyCache.classes !== this._classes ) {
            this._styleKeyCache = {
                classes: this._classes,
                styleKey: EventImpl.createStyleKey( this._classes ),
            };
        }
        return this._styleKeyCache.styleKey;
    }

    protected static createStyleKey( classNames: Iterable<string> ): string {
        let s = '';
        for ( const className of [ ...classNames ].sort( ) ) {
            if ( s.length > 0 ) {
                s += '.';
            }
            s += className;
        }
        return s;
    }

    setLabel( ongoing: boolean, label: string ): void {
        this._label = label;
        this._owner?._updateEvent( ongoing, this );
    }

    setEra_PSEC( ongoing: boolean, era_PSEC: Interval1D, eraConstraintMode?: EraConstraintMode ): void {
        this._era_PSEC = constrainEra( era_PSEC, this._eraConstraints_PSEC, eraConstraintMode );
        this._owner?._updateEvent( ongoing, this );
    }

    setEraConstraints_PSEC( ongoing: boolean, eraConstraints: EraConstraints ): void {
        this._eraConstraints_PSEC = { ...eraConstraints };
        this.setEra_PSEC( ongoing, this._era_PSEC );
    }

    setAllowsUserDrag( ongoing: boolean, allowsUserDrag: boolean ): void {
        this._allowsUserDrag = allowsUserDrag;
        this._owner?._updateEvent( ongoing, this );
    }

    setClasses( ongoing: boolean, classes: ImmutableSet<string> ): void {
        this._classes = classes;
        this._owner?._updateEvent( ongoing, this );
    }

    addClass( ongoing: boolean, clazz: string ): void {
        this.setClasses( ongoing, this.classes.add( clazz ) );
    }

    removeClass( ongoing: boolean, clazz: string ): void {
        this.setClasses( ongoing, this.classes.remove( clazz ) );
    }

    toggleClass( ongoing: boolean, clazz: string ): void {
        if ( this.classes.has( clazz ) ) {
            this.removeClass( ongoing, clazz );
        }
        else {
            this.addClass( ongoing, clazz );
        }
    }
}

class EventStyleImpl implements EventStyle {
    readonly peer = createDomPeer( 'timeline-event-style', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly barMarginTop_LPX = StyleProp.create( this.style, '--bar-margin-top-px', cssFloat, 0 );
    readonly barMarginBottom_LPX = StyleProp.create( this.style, '--bar-margin-bottom-px', cssFloat, 0 );
    readonly barBorderColor = StyleProp.create( this.style, '--bar-border-color', cssColor, 'rgb(127,127,127)' );
    readonly barBorderWidth_LPX = StyleProp.create( this.style, '--bar-border-width-px', cssFloat, 0 );
    readonly barFillPattern = StyleProp.create( this.style, '--bar-fill-pattern', cssString, 'solid' );
    readonly labelColor = StyleProp.create( this.style, '--label-color', cssColor, 'rgb(0,0,0)' );
    readonly labelOffsetX_LPX = StyleProp.create( this.style, '--label-offset-x-px', cssFloat, 1 );
    readonly labelOffsetY_LPX = StyleProp.create( this.style, '--label-offset-y-px', cssFloat, 2 );
    readonly labelAllowOvershoot = StyleProp.create( this.style, '--label-allow-overshoot', cssBoolean, false );
    readonly labelFont = StyleProp.create( this.style, '--label-font', cssString, '13px sans-serif' );

    protected readonly patterns: Map<string,Pattern>;

    constructor( cssClasses: ReadonlySet<string>, patternGens: ReadonlyMap<string,Supplier<Pattern>> ) {
        for ( const cssClass of cssClasses ) {
            setCssClassPresent( this.peer, cssClass, true );
        }

        this.patterns = new Map( );
        for ( const [ key, patternGen ] of patternGens ) {
            const pattern = patternGen( );
            appendChild( this.peer, pattern.peer );
            this.patterns.set( key, pattern );
        }
    }

    createBarFillRasterizer( laneHeight_LPX: number, maxDim_PX: number ): PatternRasterizer {
        const patternName = this.barFillPattern.get( );
        const pattern = this.patterns.get( patternName ) ?? FALLBACK_EVENT_FILL_PATTERN;
        return pattern.createRasterizer( laneHeight_LPX, maxDim_PX );
    }

    createGlyphRasterizer( ): GlyphRasterizer {
        const font = this.labelFont.get( );
        const dpr = currentDpr( this );
        return new GlyphRasterizerImpl( font, dpr );
    }
}

class GlyphRasterizerImpl extends ValueBase implements GlyphRasterizer {
    protected metrics: FontMetrics | undefined;

    constructor(
        readonly font: string,
        readonly dpr: number,
    ) {
        super( font, dpr );
        this.metrics = undefined;
    }

    createGlyph( glyphName: string ): Glyph {
        if ( !this.metrics ) {
            this.metrics = estimateFontMetrics( this.dpr, this.font, DEFAULT_CHARS );
        }

        // Some platforms render black-on-white text much more nicely
        // than with other colors, so do that and then infer alpha
        const bwImage = createTextImage( this.dpr, this.font, this.metrics, 0, 'black', 'white', glyphName );
        const bwBytes = bwImage.imageData.data;
        const bwWidth = bwImage.imageData.width;
        const bwHeight = bwImage.imageData.height;

        const alphaBorder = 1;
        const alphaPackedWidth = Math.ceil( bwWidth / 4 ) + 2*alphaBorder;
        const alphaHeight = bwHeight + 2*alphaBorder;
        const alphaBytes = new Uint8ClampedArray( 4 * alphaPackedWidth * alphaHeight );
        alphaBytes.fill( 0 );
        for ( let bwY = 0; bwY < bwHeight; bwY++ ) {
            for ( let bwX = 0; bwX < bwWidth; bwX++ ) {
                //   0 = black = foreground -> opaque
                // 255 = white = background -> transparent
                const alphaByte = 255 - bwBytes[ 4*( bwY*bwWidth + bwX ) + 1 ];
                const alphaX = 4*alphaBorder + bwX;
                const alphaY = alphaBorder + bwY;
                alphaBytes[ 4*( alphaY*alphaPackedWidth ) + alphaX ] = alphaByte;
            }
        }
        return {
            isAlphaMask: true,
            unpackedWidth: bwWidth,
            image: {
                border: alphaBorder,
                xAnchor: bwImage.xAnchor,
                yAnchor: bwImage.yAnchor,
                imageData: new ImageData( alphaBytes, alphaPackedWidth, alphaHeight ),
            },
        };
    }
}

export class EventsRow<T extends WritableEvent> {
    readonly repaint: FireableListenable;

    readonly timeAxis_PSEC: Axis1D;
    readonly patternGens: ImmutableMap<string,Supplier<Pattern>>;

    readonly events: EventsGroup<T>;
    readonly eventsPainter: EventsPainter;
    readonly pane: Pane;

    constructor( timeAxis_PSEC: Axis1D, patternGens: ReadonlyMap<string,Supplier<Pattern>> ) {
        this.repaint = new ListenableBasic( );

        this.timeAxis_PSEC = timeAxis_PSEC;
        this.timeAxis_PSEC.changes.addListener( IMMEDIATE, ( ) => {
            this.repaint.fire( );
        } );

        this.patternGens = newImmutableMap( patternGens );

        this.events = new EventsGroup( );
        this.events.positionChanges.addListener( { order: 999999 }, ( ) => this.repaint.fire( ) );
        this.events.rightNeighborChanges.addListener( { order: 999999 }, ( ) => this.repaint.fire( ) );
        this.events.styleChanges.addListener( { order: 999999 }, ( ) => this.repaint.fire( ) );
        this.events.labelChanges.addListener( { order: 999999 }, ( ) => this.repaint.fire( ) );

        this.eventsPainter = new EventsPainter( this.events );
        this.eventsPainter.timeBoundsFn_PSEC = axisBoundsFn( this.timeAxis_PSEC );
        this.eventsPainter.createEventStyle = classes => {
            // Once created, an event-style is never removed. Removal could be implemented,
            // but would be complicated, slow (because eventsPainter would have to do an
            // O(n) update of event-style indices), and rarely used in practice.
            const eventStyle = new EventStyleImpl( classes, this.patternGens );
            appendChild( this.pane.peer, eventStyle.peer );
            return eventStyle;
        };

        const layout = new ChildlessLayout( );
        layout.prefWidth_LPX.override = 0;
        layout.prefHeight_LPX.getOverride = ( ) => {
            const numLanes = this.events.getLanes( ).length;
            const laneHeight_LPX = roundLpxToPx( this.eventsPainter.laneHeight_LPX.get( ), currentDpr( this.pane ) );
            return ( numLanes * laneHeight_LPX );
        };

        this.pane = new Pane( layout );
        this.pane.addCssClass( 'timeline-events-row' );
        this.pane.addPainter( this.eventsPainter );

        this.pane.addInputHandler( this.createEventsInputHandler( ) );
    }

    protected createEventsInputHandler( ): InputHandler {
        const row = this;
        return {
            getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
                return row.findInputHandler( evMove )?.getHoverHandler?.( evMove ) ?? null;
            },
            getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
                return row.findInputHandler( evGrab )?.getDragHandler?.( evGrab ) ?? null;
            },
            getKeyHandler( evGrab: PaneMouseEvent ): Nullable<KeyHandler> {
                return row.findInputHandler( evGrab )?.getKeyHandler?.( evGrab ) ?? null;
            },
        };
    }

    protected getMouseCoord_PSEC( ev: PaneMouseEvent ): number {
        return getMouseAxisCoord1D( this.timeAxis_PSEC, X, ev );
    };

    protected findInputHandler( ev: PaneMouseEvent ): Nullable<InputHandler> {
        const dpr = currentDpr( this.pane );
        const laneHeight_LPX = roundLpxToPx( this.eventsPainter.laneHeight_LPX.get( ), dpr );
        const laneHeight_PX = laneHeight_LPX * dpr;
        const grabLaneNum = Math.floor( ( this.pane.getViewport_PX( ).yMax - ev.loc_PX.y ) / laneHeight_PX );
        const grabTime_PSEC = this.getMouseCoord_PSEC( ev );
        const lane = this.events.getLanes( )[ grabLaneNum ];
        if ( lane ) {
            const edgeGrabDistance_SEC = edgeGrabDistance_LPX / this.timeAxis_PSEC.scale;

            const eventContaining = lane.getEventContaining( grabTime_PSEC );
            if ( eventContaining ) {
                // Mouse is inside an event
                if ( eventContaining.allowsUserDrag ) {
                    const era_PSEC = eventContaining.era_PSEC;
                    const eraMid_PSEC = era_PSEC.fracToValue( 0.5 );
                    const maxForMinEdgeGrab_PSEC = Math.min( eraMid_PSEC, era_PSEC.min + edgeGrabDistance_SEC );
                    const minForMaxEdgeGrab_PSEC = Math.max( eraMid_PSEC, era_PSEC.max - edgeGrabDistance_SEC );
                    if ( grabTime_PSEC >= minForMaxEdgeGrab_PSEC ) {
                        return this.createRightEdgeInputHandler( eventContaining );
                    }
                    else if ( grabTime_PSEC <= maxForMinEdgeGrab_PSEC ) {
                        return this.createLeftEdgeInputHandler( eventContaining );
                    }
                    else {
                        return this.createWholeEventInputHandler( eventContaining );
                    }
                }
                else {
                    // Event is selectable but not draggable
                    return this.createEventSelector( eventContaining );
                }
            }

            const eventLeft = lane.getEntryStartingBefore( grabTime_PSEC )?.[1].valueBefore( undefined );
            const eventRight = lane.getEntryStartingAtOrAfter( grabTime_PSEC )?.[1].valueAfter( undefined );
            if ( eventLeft && eventLeft.allowsUserDrag && eventRight && eventRight.allowsUserDrag ) {
                // Mouse may be close to the edges of the event to its left and/or right
                const leftMax_PSEC = eventLeft.era_PSEC.max;
                const rightMin_PSEC = eventRight.era_PSEC.min;
                const mid_PSEC = leftMax_PSEC + 0.5*( rightMin_PSEC - leftMax_PSEC );
                const maxForLeftMaxGrab_PSEC = Math.min( mid_PSEC, leftMax_PSEC + edgeGrabDistance_SEC );
                const minForRightMinGrab_PSEC = Math.max( mid_PSEC, rightMin_PSEC - edgeGrabDistance_SEC );
                if ( grabTime_PSEC <= maxForLeftMaxGrab_PSEC ) {
                    return this.createRightEdgeInputHandler( eventLeft );
                }
                else if ( grabTime_PSEC >= minForRightMinGrab_PSEC ) {
                    return this.createLeftEdgeInputHandler( eventRight );
                }
            }
            else if ( eventLeft && eventLeft.allowsUserDrag ) {
                // Mouse may be close to the edge of the event to its left
                const leftMax_PSEC = eventLeft.era_PSEC.max;
                const maxForLeftMaxGrab_PSEC = leftMax_PSEC + edgeGrabDistance_SEC;
                if ( grabTime_PSEC <= maxForLeftMaxGrab_PSEC ) {
                    return this.createRightEdgeInputHandler( eventLeft );
                }
            }
            else if ( eventRight && eventRight.allowsUserDrag ) {
                // Mouse may be close to the edge of the event to its right
                const rightMin_PSEC = eventRight.era_PSEC.min;
                const minForRightMinGrab_PSEC = rightMin_PSEC - edgeGrabDistance_SEC;
                if ( grabTime_PSEC >= minForRightMinGrab_PSEC ) {
                    return this.createLeftEdgeInputHandler( eventRight );
                }
            }
        }
        return null;
    }

    protected createLeftEdgeInputHandler( event: T ): InputHandler {
        const target = new EventInputTarget( event, EVENT_ZONE_LEFT );
        const getMouseCursorClasses = frozenSupplier( [ 'left-edge-dragger' ] );
        return EventsRow.createEventInputHandler( target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC( evGrab );
            const grabOffset_SEC = grabTime_PSEC - event.era_PSEC.min;

            let hasMouseDraggedInTimeDimension = false;
            const updateLeftEdge = ( ongoing: boolean, ev: PaneMouseEvent ) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC( ev );
                if ( mouseTime_PSEC !== grabTime_PSEC ) {
                    hasMouseDraggedInTimeDimension = true;
                }

                const minWidth_SEC = eventResizeMinWidth_LPX / this.timeAxis_PSEC.scale;
                const maxMin_PSEC = Math.max( event.era_PSEC.max - minWidth_SEC, event.era_PSEC.min );

                const newMin_PSEC = run( ( ) => {
                    const prefMin_PSEC = mouseTime_PSEC - grabOffset_SEC;
                    const snappedMin_PSEC = run( ( ) => {
                        if ( !ev.modifiers.ctrl ) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMin_PSEC = this.events.findNearestSnapTime_PSEC( prefMin_PSEC, Number.NEGATIVE_INFINITY, maxMin_PSEC, [ event ] );
                            if ( snappedMin_PSEC !== undefined && Math.abs( snappedMin_PSEC - prefMin_PSEC ) <= edgeSnapDistance_SEC ) {
                                return snappedMin_PSEC;
                            }
                        }
                        return undefined;
                    } );
                    return ( snappedMin_PSEC ?? Math.min( maxMin_PSEC, prefMin_PSEC ) );
                } );

                const oldEra_PSEC = event.era_PSEC;
                if ( newMin_PSEC !== oldEra_PSEC.min ) {
                    const newEra_PSEC = Interval1D.fromEdges( newMin_PSEC, oldEra_PSEC.max );
                    event.setEra_PSEC( ongoing, newEra_PSEC, EraConstraintMode.KEEP_MAX );
                    this.repaint.fire( );
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateLeftEdge( true, ev ),
                handleUngrab: ev => {
                    if ( hasMouseDraggedInTimeDimension ) {
                        updateLeftEdge( false, ev );
                    }
                },
            };
        } );
    }

    protected createRightEdgeInputHandler( event: T ): InputHandler {
        const target = new EventInputTarget( event, EVENT_ZONE_RIGHT );
        const getMouseCursorClasses = frozenSupplier( [ 'right-edge-dragger' ] );
        return EventsRow.createEventInputHandler( target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC( evGrab );
            const grabOffset_SEC = grabTime_PSEC - event.era_PSEC.max;

            let hasMouseDraggedInTimeDimension = false;
            const updateRightEdge = ( ongoing: boolean, ev: PaneMouseEvent ) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC( ev );
                if ( mouseTime_PSEC !== grabTime_PSEC ) {
                    hasMouseDraggedInTimeDimension = true;
                }

                const minWidth_SEC = eventResizeMinWidth_LPX / this.timeAxis_PSEC.scale;
                const minMax_PSEC = Math.min( event.era_PSEC.min + minWidth_SEC, event.era_PSEC.max );

                const newMax_PSEC = run( ( ) => {
                    const prefMax_PSEC = mouseTime_PSEC - grabOffset_SEC;
                    const snappedMax_PSEC = run( ( ) => {
                        if ( !ev.modifiers.ctrl ) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMax_PSEC = this.events.findNearestSnapTime_PSEC( prefMax_PSEC, minMax_PSEC, Number.POSITIVE_INFINITY, [ event ] );
                            if ( snappedMax_PSEC !== undefined && Math.abs( snappedMax_PSEC - prefMax_PSEC ) <= edgeSnapDistance_SEC ) {
                                return snappedMax_PSEC;
                            }
                        }
                        return undefined;
                    } );
                    return ( snappedMax_PSEC ?? Math.max( minMax_PSEC, prefMax_PSEC ) );
                } );

                const oldEra_PSEC = event.era_PSEC;
                if ( newMax_PSEC !== oldEra_PSEC.max ) {
                    const newEra_PSEC = Interval1D.fromEdges( oldEra_PSEC.min, newMax_PSEC );
                    event.setEra_PSEC( ongoing, newEra_PSEC, EraConstraintMode.KEEP_MIN );
                    this.repaint.fire( );
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateRightEdge( true, ev ),
                handleUngrab: ev => {
                    if ( hasMouseDraggedInTimeDimension ) {
                        updateRightEdge( false, ev );
                    }
                },
            };
        } );
    }

    protected createWholeEventInputHandler( event: T ): InputHandler {
        const target = new EventInputTarget( event, EVENT_ZONE_CENTER );
        const getMouseCursorClasses = frozenSupplier( [ 'clickable' ] );
        return EventsRow.createEventInputHandler( target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC( evGrab );
            const grabOffset_FRAC = event.era_PSEC.valueToFrac( grabTime_PSEC );

            let hasMouseDraggedInTimeDimension = false;
            const updateEra = ( ongoing: boolean, ev: PaneMouseEvent ) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC( ev );
                if ( mouseTime_PSEC !== grabTime_PSEC ) {
                    hasMouseDraggedInTimeDimension = true;
                }

                const oldEra_PSEC = event.era_PSEC;
                const span_SEC = oldEra_PSEC.span;

                const newMin_PSEC = run( ( ) => {
                    const prefMin_PSEC = mouseTime_PSEC - grabOffset_FRAC*span_SEC;
                    const snappedMin_PSEC = run( ( ) => {
                        if ( !ev.modifiers.ctrl ) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMin_PSEC = this.events.findNearestSnapTime_PSEC( prefMin_PSEC, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, [ event ] );
                            if ( snappedMin_PSEC !== undefined && Math.abs( snappedMin_PSEC - prefMin_PSEC ) <= edgeSnapDistance_SEC ) {
                                return snappedMin_PSEC;
                            }
                        }
                        return undefined;
                    } );

                    const prefMax_PSEC = prefMin_PSEC + span_SEC;
                    const snappedMax_PSEC = run( ( ) => {
                        if ( !ev.modifiers.ctrl ) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMax_PSEC = this.events.findNearestSnapTime_PSEC( prefMax_PSEC, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, [ event ] );
                            if ( snappedMax_PSEC !== undefined && Math.abs( snappedMax_PSEC - prefMax_PSEC ) <= edgeSnapDistance_SEC ) {
                                return snappedMax_PSEC;
                            }
                        }
                        return undefined;
                    } );

                    if ( snappedMin_PSEC !== undefined && snappedMax_PSEC !== undefined ) {
                        if ( Math.abs( snappedMin_PSEC - prefMin_PSEC ) < Math.abs( snappedMax_PSEC - prefMax_PSEC ) ) {
                            return snappedMin_PSEC;
                        }
                        else {
                            return ( snappedMax_PSEC - span_SEC );
                        }
                    }
                    else if ( snappedMin_PSEC !== undefined ) {
                        return snappedMin_PSEC;
                    }
                    else if ( snappedMax_PSEC !== undefined ) {
                        return ( snappedMax_PSEC - span_SEC );
                    }
                    else {
                        return prefMin_PSEC;
                    }
                } );

                if ( newMin_PSEC !== oldEra_PSEC.min ) {
                    const newEra_PSEC = Interval1D.fromRect( newMin_PSEC, span_SEC );
                    event.setEra_PSEC( ongoing, newEra_PSEC, EraConstraintMode.KEEP_SPAN );
                    this.repaint.fire( );
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateEra( true, ev ),
                handleUngrab: ev => {
                    if ( hasMouseDraggedInTimeDimension ) {
                        updateEra( false, ev );
                    }
                },
            };
        } );
    }

    protected createEventSelector( event: T ): InputHandler {
        const target = new EventInputTarget( event, EVENT_ZONE_CENTER );
        const getMouseCursorClasses = frozenSupplier( [ 'clickable' ] );
        return EventsRow.createEventInputHandler( target, getMouseCursorClasses, ( ) => {
            return {
                target,
                getMouseCursorClasses,
            };
        } );
    }

    protected static createEventInputHandler( target: unknown, getMouseCursorClasses: Supplier<ReadonlyArray<string>>, createDragHandler: ( evGrab: PaneMouseEvent ) => DragHandler ): InputHandler {
        return {
            getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
                if ( evMove.modifiers.isEmpty( ) ) {
                    return {
                        target,
                        getMouseCursorClasses,
                    };
                }
                else {
                    return null;
                }
            },
            getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
                if ( evGrab.button === 0 && evGrab.modifiers.isEmpty( ) ) {
                    return createDragHandler( evGrab );
                }
                else {
                    return null;
                }
            },
            getKeyHandler( evGrab: PaneMouseEvent ): Nullable<KeyHandler> {
                if ( evGrab.button === 0 && evGrab.modifiers.isEmpty( ) ) {
                    // Providing a KeyHandler makes events focusable
                    return {
                        target,
                    };
                }
                else {
                    return null;
                }
            },
        };
    }

    attachToRepaint( repaint: FireableListenable ): Disposer {
        return linkListenables( this.repaint, repaint );
    }
}

export const EVENT_ZONE_LEFT = Symbol( 'EVENT_ZONE_LEFT' );
export const EVENT_ZONE_RIGHT = Symbol( 'EVENT_ZONE_RIGHT' );
export const EVENT_ZONE_CENTER = Symbol( 'EVENT_ZONE_CENTER' );
export type EventInputZone = typeof EVENT_ZONE_LEFT | typeof EVENT_ZONE_RIGHT | typeof EVENT_ZONE_CENTER;

export class EventInputTarget<T extends ReadableEvent> implements ValueObject {
    constructor(
        readonly event: T,
        readonly zone: EventInputZone,
    ) {
    }

    hashCode( ): number {
        const prime = 31;
        let result = 1;
        result = prime*result + hashCode( this.event );
        result = prime*result + hashCode( this.zone );
        return result;
    }

    equals( o: any ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            return ( o.event === this.event
                  && o.zone === this.zone );
        }
    }
}

export function attachEventClassUpdaters( hoverRef: ReadableRef<unknown>, focusRef: ReadableRef<unknown> ): Disposer {
    const disposers = new DisposerGroup( );
    disposers.add( attachHoveredEventClassUpdater( hoverRef ) );
    disposers.add( attachFocusedEventClassUpdater( focusRef ) );
    return disposers;
}

export function attachFocusedEventClassUpdater( focusRef: ReadableRef<unknown>, focusClass: string = 'focused' ): Disposer {
    // Ongoing flag is only passed along to class listeners, so _addOldNewActivityListener is safe to use
    return _addOldNewActivityListener( focusRef, IMMEDIATE, ( ongoing, oldTarget, newTarget ) => {
        const oldEvent = ( oldTarget as any )?.event;
        if ( isWritableEvent( oldEvent ) ) {
            oldEvent.removeClass( ongoing, focusClass );
        }
        const newEvent = ( newTarget as any )?.event;
        if ( isWritableEvent( newEvent ) ) {
            newEvent.addClass( ongoing, focusClass );
        }
    } );
}

export function attachHoveredEventClassUpdater( hoverRef: ReadableRef<unknown>, hoveredClass: string = 'hovered' ): Disposer {
    // Ongoing flag is only passed along to class listeners, so _addOldNewActivityListener is safe to use
    return _addOldNewActivityListener( hoverRef, IMMEDIATE, ( ongoing, oldHover, newHover ) => {
        const oldEvent = ( oldHover as any )?.event;
        if ( isWritableEvent( oldEvent ) ) {
            oldEvent.removeClass( ongoing, hoveredClass );
        }
        const newEvent = ( newHover as any )?.event;
        if ( isWritableEvent( newEvent ) ) {
            newEvent.addClass( ongoing, hoveredClass );
        }
    } );
}

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
import { ActivityListenableBasic, addToActiveTxn, Disposer, DisposerGroup, equal, Interval1D, isDefined, isNonNullish, newImmutableList, Nullable, Ref, Runnable, Supplier, trunc, X, Y } from '@metsci/gleam-util';
import { currentDpr } from '../support';
import { frozenSupplier } from '../util';
import { AxisGroup1D, AxisState1D } from './axisGroup';
import { DragHandler, HoverHandler, InputHandler, Pane, PaneMouseEvent, WheelHandler } from './pane';

const { abs, pow, round } = Math;

/**
 * **NOTE:** This interface is defined *partly* in terms of *logical* pixels -- unlike
 * the bulk of the rest of the library, which uses physical pixels. Implementations of
 * this interface are responsible for conversion between logical and physical pixels.
 */
export class Axis1D {
    readonly changes: ActivityListenableBasic;

    /**
     * If you modify this field, you should typically update `viewport_PX` as well.
     * Call reconstrain() after modifying this field.
     */
    dpr: number;

    /**
     * If you modify this field, you should typically update `dpr` as well.
     * Call reconstrain() after modifying this field.
     */
    viewport_PX: Interval1D;

    /**
     * Call reconstrain() after modifying this field.
     */
    minConstraint: Interval1D;

    /**
     * Call reconstrain() after modifying this field.
     */
    maxConstraint: Interval1D;

    /**
     * Call reconstrain() after modifying this field.
     */
    spanConstraint: Interval1D;

    /**
     * *Logical* pixels per axis unit.
     *
     * Call reconstrain() after modifying this field.
     */
    scaleConstraint: Interval1D;

    protected cacheState: Nullable<AxisState1D>;
    protected group: AxisGroup1D;
    protected groupMembership: DisposerGroup;

    constructor( group: AxisGroup1D ) {
        this.changes = new ActivityListenableBasic( );

        this.dpr = 1;
        this.viewport_PX = Interval1D.fromEdges( 0, 1000 );
        this.minConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );
        this.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );
        this.spanConstraint = Interval1D.fromEdges( 0, Number.POSITIVE_INFINITY );
        this.scaleConstraint = Interval1D.fromEdges( 0, Number.POSITIVE_INFINITY );

        this.cacheState = null;
        this.group = group.clone( );
        this.groupMembership = new DisposerGroup( );
        this.link( group );
    }

    get span_LPX( ): number {
        return ( this.viewport_PX.span / this.dpr );
    }

    get bounds( ): Interval1D {
        return this.getState( ).bounds;
    }

    /**
     * *Logical* pixels per axis unit.
     */
    get scale( ): number {
        return this.getState( ).scale;
    }

    pxToCoord( px: number ): number {
        const frac = this.viewport_PX.valueToFrac( px );
        return this.getState( ).bounds.fracToValue( frac );
    }

    coordToPx( coord: number ): number {
        const frac = this.getState( ).bounds.valueToFrac( coord );
        return this.viewport_PX.fracToValue( frac );
    }

    protected getState( ): AxisState1D {
        const span_LPX = this.span_LPX;
        const groupMarker = this.group.getStateMarker( );
        if ( !this.cacheState || this.cacheState.marker !== groupMarker || this.cacheState.span_LPX !== span_LPX ) {
            this.cacheState = this.group.computeAxisState( span_LPX );
        }
        return this.cacheState;
    }

    /**
     * Call this to recompute bounds after changing constraints.
     */
    reconstrain( ongoing: boolean ): void {
        this.group.reconstrain( ongoing );
    }

    set( ongoing: boolean, bounds: Interval1D ): void;
    set( ongoing: boolean, min: number, max: number ): void;
    set( ongoing: boolean, frac: number, coord: number, scale: number ): void;
    set( ongoing: boolean, a: any, b?: any, c?: any ): void {
        this.group.set( ongoing, this.span_LPX, a, b, c );
    }

    /**
     * Shift bounds so that the span stays the same, and the given coord falls
     * at the given fraction between min and max.
     */
    pan( ongoing: boolean, frac: number, coord: number ): void {
        this.group.pan( ongoing, this.span_LPX, frac, coord );
    }

    getGroup( ): AxisGroup1D {
        return this.group;
    }

    link( group: AxisGroup1D ): Disposer {
        this.groupMembership.dispose( );

        this.group = group;
        this.groupMembership.add( this.group._addMember( this ) );
        this.groupMembership.add( this.group.changes.addListener( ongoing => {
            this.changes.fire( ongoing );
        } ) );

        this.group.reconstrain( false );

        return ( ) => {
            this.unlink( );
        };
    }

    unlink( ): void {
        this.link( this.group.clone( ) );
    }
}

/**
 * How far an axis should get zoomed in or out in response to a single wheel step.
 */
export const ZOOM_STEP_FACTOR = 1.12;

/**
 * How many pixels the mouse has to move vertically during a middle-click-drag (or CTRL+drag)
 * to count as a single wheel step.
 */
export const PSEUDOWHEEL_STEP_LPX = 4;

const deferredAxisReconstrains = new Array<Runnable>( );

/**
 * Keep an axis viewport set according to the given pane.
 *
 * The pane arg is called `centerPane` because you usually want to pass the pane in which
 * the *plot contents* (not the axis labels) are drawn. If you have a reason to pass a pane
 * other than the plot-center pane, that is fine -- the arg name is chosen to make
 * misunderstandings less likely in the common case.
 *
 * When attaching viewport-updaters to multiple (possibly linked) axes, the attach calls
 * can be wrapped in a `doTxn()`. This allows the axes to be updated immediately, while
 * deferring the ensuing `axis.reconstrain()` calls.
 */
export function attachAxisViewportUpdater1D( centerPane: Pane, axis: Axis1D, axisType: X | Y, getInset_LPX?: Supplier<number> ): Disposer {
    // A single viewport change may update more than one axis. Because
    // those axes may be linked to each other, we apply those updates to
    // all axes before calling reconstrain on any of them.

    function updateAxisFields( ): Disposer | undefined {
        const dpr = currentDpr( centerPane );
        let viewport_PX = centerPane.getViewport_PX( )[ axisType ];
        if ( getInset_LPX ) {
            const inset_PX = round( getInset_LPX( ) * dpr );
            viewport_PX = Interval1D.fromEdges( viewport_PX.min + inset_PX, viewport_PX.max - inset_PX );
        }
        if ( viewport_PX.span > 0 && ( dpr !== axis.dpr || !equal( viewport_PX, axis.viewport_PX ) ) ) {
            // Save original axis state, for possible rollback
            const oldDpr = axis.dpr;
            const oldViewport_PX = axis.viewport_PX;

            // Update axis state
            axis.dpr = dpr;
            axis.viewport_PX = viewport_PX;

            // On rollback, restore original axis state (unless somebody else has modified it)
            return ( ) => {
                if ( axis.dpr === dpr && axis.viewport_PX === viewport_PX ) {
                    axis.dpr = oldDpr;
                    axis.viewport_PX = oldViewport_PX;
                }
            };
        }
        else {
            // We didn't make any changes that would need to be rolled back
            return undefined;
        }
    }

    // Update when centerPane's viewport changes, using an ad-hoc mechanism to defer the reconstrain
    const disposers = new DisposerGroup( );
    disposers.add( centerPane.layoutReady.addListener( { order: -0.1 }, ( ) => {
        if ( updateAxisFields( ) ) {
            deferredAxisReconstrains.push( ( ) => {
                // TODO: Detect ongoing viewport changes
                axis.reconstrain( false );
            } );
        }
    } ) );
    disposers.add( centerPane.layoutReady.addListener( { order: 0 }, ( ) => {
        for ( const reconstrainAxis of deferredAxisReconstrains ) {
            reconstrainAxis( );
        }
        deferredAxisReconstrains.length = 0;
    } ) );

    // Update immediately, using the txn mechanism to defer the reconstrain
    const immediateDisposers = updateAxisFields( );
    if ( immediateDisposers ) {
        disposers.add( immediateDisposers );
        addToActiveTxn( {
            rollback( ) {
                disposers.dispose( );
            },
            postCommit( ) {
                axis.reconstrain( false );
            }
        } );
    }

    return disposers;
}

export function attachAxisInputHandlers1D( mousePane: Pane, axis: Axis1D, axisType: X | Y ): Disposer {
    return mousePane.addInputHandler( createAxisZoomersAndPanners1D( axis, axisType ) );
}

export function attachAxisWheelZoomer1D( mousePane: Pane, axis: Axis1D, axisType: X | Y ): Disposer {
    return mousePane.addInputHandler( createAxisWheelZoomer1D( axis, axisType ) );
}

// TODO: Support side-scrolling to pan a horizontal axis

export function createAxisZoomersAndPanners1D( axis: Axis1D, axisType: X | Y ): InputHandler {
    return {
        getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
            if ( evMove.modifiers.ctrl ) {
                return createHoverZoomer( axis, axisType );
            }
            else {
                return createHoverPanner( axis, axisType );
            }
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( evGrab.button === 1 || ( evGrab.button === 0 && evGrab.modifiers.ctrl ) ) {
                return createDragZoomer( axis, axisType, evGrab );
            }
            else if ( evGrab.button === 0 ) {
                return createDragPanner( axis, axisType, evGrab );
            }
            else {
                return null;
            }
        },
        getWheelHandler( evGrabOrWheel: PaneMouseEvent ): Nullable<WheelHandler> {
            // Wheel with modifiers may do other things (e.g. browser zoom)
            if ( evGrabOrWheel.modifiers.isEmpty( ) ) {
                return createWheelZoomer( axis, axisType );
            }
            else {
                return null;
            }
        },
    };
}

export function createAxisWheelZoomer1D( axis: Axis1D, axisType: X | Y ): InputHandler {
    return {
        getWheelHandler( evGrabOrWheel: PaneMouseEvent ): Nullable<WheelHandler> {
            // Wheel with modifiers may do other things (e.g. browser zoom)
            if ( evGrabOrWheel.modifiers.isEmpty( ) ) {
                return createWheelZoomer( axis, axisType );
            }
            else {
                return null;
            }
        },
    };
}

export function createHoverPanner( axis: Axis1D, axisType: X | Y ): HoverHandler {
    return {
        target: newImmutableList( [ 'Pan1D', axis ] ),
        getMouseCursorClasses: frozenSupplier( axisType === X ? [ 'x-axis-panner' ] : [ 'y-axis-panner' ] ),
    };
}

export function createHoverZoomer( axis: Axis1D, axisType: X | Y ): HoverHandler {
    return {
        target: newImmutableList( [ 'Zoom1D', axis ] ),
        getMouseCursorClasses: frozenSupplier( axisType === X ? [ 'x-axis-zoomer' ] : [ 'y-axis-zoomer' ] ),
    };
}

export function createDragPanner( axis: Axis1D, axisType: X | Y, evGrab: PaneMouseEvent ): DragHandler {
    const grabFrac = getMouseAxisFrac1D( axis, axisType, evGrab );
    const grabCoord = axis.bounds.fracToValue( grabFrac );
    return {
        target: newImmutableList( [ 'Pan1D', axis ] ),
        getMouseCursorClasses: frozenSupplier( axisType === X ? [ 'x-axis-panner' ] : [ 'y-axis-panner' ] ),
        handleDrag( evDrag: PaneMouseEvent ): void {
            const mouseFrac = getMouseAxisFrac1D( axis, axisType, evDrag );
            axis.pan( true, mouseFrac, grabCoord );
        },
        handleUngrab( evUngrab: PaneMouseEvent ): void {
            const mouseFrac = getMouseAxisFrac1D( axis, axisType, evUngrab );
            axis.pan( false, mouseFrac, grabCoord );
        },
    };
}

export function createDragZoomer( axis: Axis1D, axisType: X | Y, evGrab: PaneMouseEvent ): DragHandler {
    const grabFrac = getMouseAxisFrac1D( axis, axisType, evGrab );
    const grabCoord = axis.bounds.fracToValue( grabFrac );
    const grabScale = axis.scale;
    return {
        target: newImmutableList( [ 'Zoom1D', axis ] ),
        getMouseCursorClasses: frozenSupplier( axisType === X ? [ 'x-axis-zoomer' ] : [ 'y-axis-zoomer' ] ),
        handleDrag( evDrag: PaneMouseEvent ): void {
            const wheelSteps = -1 * trunc( ( evDrag.loc_PX.y - evGrab.loc_PX.y ) / ( PSEUDOWHEEL_STEP_LPX * evGrab.dpr ) );
            const scale = grabScale / pow( ZOOM_STEP_FACTOR, wheelSteps );
            axis.set( true, grabFrac, grabCoord, scale );
        },
        handleUngrab( evUngrab: PaneMouseEvent ): void {
            const wheelSteps = -1 * trunc( ( evUngrab.loc_PX.y - evGrab.loc_PX.y ) / ( PSEUDOWHEEL_STEP_LPX * evGrab.dpr ) );
            const scale = grabScale / pow( ZOOM_STEP_FACTOR, wheelSteps );
            axis.set( false, grabFrac, grabCoord, scale );
        },
    };
}

export function createWheelZoomer( axis: Axis1D, axisType: X | Y ): WheelHandler {
    return {
        target: newImmutableList( [ 'Zoom1D', axis ] ),
        handleWheel( evWheel: PaneMouseEvent ): void {
            const frac = getMouseAxisFrac1D( axis, axisType, evWheel );
            const coord = axis.bounds.fracToValue( frac );
            const scale = axis.scale / pow( ZOOM_STEP_FACTOR, evWheel.wheelSteps );
            axis.set( false, frac, coord, scale );
        },
    };
}

export const cursorGrabDistance_LPX = 7;

export function createAxisCursorInputHandler1D( axis: Axis1D, axisType: X | Y, cursorCoord: Ref<number | undefined | null>, hoveredRef?: Ref<boolean>, grabDistance_LPX: number = cursorGrabDistance_LPX ): InputHandler {
    const target = cursorCoord;
    const getMouseCursorClasses = frozenSupplier( axisType === X ? [ 'x-tag-dragger' ] : [ 'y-tag-dragger' ] );
    function getMouseCoord( ev: PaneMouseEvent ): number {
        return getMouseAxisCoord1D( axis, axisType, ev );
    }
    return {
        getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
            const cursorValue = cursorCoord.v;
            const moveCoord = getMouseCoord( evMove );
            const moveOffset = ( isNonNullish( cursorValue ) ? moveCoord - cursorValue : undefined );
            if ( axis.bounds.containsPoint( moveCoord ) && isDefined( moveOffset ) && abs( moveOffset ) <= grabDistance_LPX / axis.scale ) {
                return {
                    target,
                    getMouseCursorClasses,
                    handleHover: ( ) => hoveredRef?.set( true, true ),
                    handleUnhover: ( ) => hoveredRef?.set( true, false ),
                };
            }
            return null;
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( evGrab.button === 0 ) {
                const cursorValue = cursorCoord.v;
                const grabCoord = getMouseCoord( evGrab );
                const grabOffset = ( evGrab.pressCount > 1 ? 0 : isNonNullish( cursorValue ) ? grabCoord - cursorValue : undefined );
                if ( axis.bounds.containsPoint( grabCoord ) && isDefined( grabOffset ) && abs( grabOffset ) <= grabDistance_LPX / axis.scale ) {
                    return {
                        target,
                        getMouseCursorClasses,
                        handleHover: ( ) => hoveredRef?.set( true, true ),
                        handleUnhover: ( ) => hoveredRef?.set( true, false ),
                        handleGrab: ( ) => cursorCoord.set( true, getMouseCoord( evGrab ) - grabOffset ),
                        handleDrag: evDrag => cursorCoord.set( true, getMouseCoord( evDrag ) - grabOffset ),
                        handleUngrab: evUngrab => cursorCoord.set( false, getMouseCoord( evUngrab ) - grabOffset )
                    };
                }
            }
            return null;
        },
    };
}

export function getMouseAxisFrac1D( axis: Axis1D, axisType: X | Y, ev: PaneMouseEvent ): number {
    return axis.viewport_PX.valueToFrac( ev.loc_PX[ axisType ] );
}

export function getMouseAxisCoord1D( axis: Axis1D, axisType: X | Y, ev: PaneMouseEvent ): number {
    const frac = getMouseAxisFrac1D( axis, axisType, ev );
    return axis.bounds.fracToValue( frac );
}

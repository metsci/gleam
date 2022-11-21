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
import { ActivityListenable, ActivityListenableSet, Disposer, DisposerGroup, doTxn, newImmutableList, Nullable, trunc } from '@metsci/gleam-util';
import { Interval1D, Interval2D, Point2D, X, x, Y, y } from '../support';
import { frozenSupplier } from '../util';
import { attachAxisViewportUpdater1D, Axis1D, PSEUDOWHEEL_STEP_LPX, ZOOM_STEP_FACTOR } from './axis1d';
import { DragHandler, HoverHandler, InputHandler, Pane, PaneMouseEvent, WheelHandler } from './pane';

/**
 * **NOTE:** This interface is defined *partly* in terms of *logical* pixels -- unlike
 * the bulk of the rest of the library, which uses physical pixels. Implementations of
 * this interface are responsible for conversion between logical and physical pixels.
 */
export class Axis2D {
    readonly x: Axis1D;
    readonly y: Axis1D;
    readonly changes: ActivityListenable;

    constructor( x: Axis1D, y: Axis1D ) {
        this.x = x;
        this.y = y;
        this.changes = new ActivityListenableSet( this.x.changes, this.y.changes );
    }

    get [X]( ): Axis1D {
        return this.x;
    }

    get [Y]( ): Axis1D {
        return this.y;
    }

    get bounds( ): Interval2D {
        return Interval2D.fromXy( this.x.bounds, this.y.bounds );
    }

    /**
     * *Logical* pixels per axis unit.
     */
    get scale( ): Point2D {
        return new Point2D( this.x.scale, this.y.scale );
    }

    reconstrain( ongoing: boolean ): void {
        doTxn( ( ) => {
            this.x.reconstrain( ongoing );
            this.y.reconstrain( ongoing );
        } );
    }

    set( ongoing: boolean, bounds: Interval2D ): void;
    set( ongoing: boolean, xBounds: Interval1D, yBounds: Interval1D ): void;
    set( ongoing: boolean, frac: Point2D | [number,number], coord: Point2D | [number,number], scale: Point2D | [number,number] ): void;
    set( ongoing: boolean, xMin: number, xMax: number, yMin: number, yMax: number ): void;
    set( ongoing: boolean, a: any, b?: any, c?: any, d?: any ): void {
        if ( d !== undefined ) {
            const xMin = a as number;
            const xMax = b as number;
            const yMin = c as number;
            const yMax = d as number;
            doTxn( ( ) => {
                this.x.set( ongoing, xMin, xMax );
                this.y.set( ongoing, yMin, yMax );

                // In some cases the order of x.set and y.set calls matters (e.g. with a
                // scale-ratio lock). If giving y.set the final word zoomed us in too far,
                // give x.set the final word instead.
                if ( this.x.bounds.span < 0.95*( xMax - xMin ) || this.y.bounds.span < 0.95*( yMax - yMin ) ) {
                    this.x.set( ongoing, xMin, xMax );
                }
            } );
        }
        else if ( c !== undefined ) {
            const frac = a as Point2D | [number,number];
            const coord = b as Point2D | [number,number];
            const scale = c as Point2D | [number,number];
            doTxn( ( ) => {
                this.x.set( ongoing, x( frac ), x( coord ), x( scale ) );
                this.y.set( ongoing, y( frac ), y( coord ), y( scale ) );
            } );
        }
        else if ( b !== undefined ) {
            const xBounds = a as Interval1D;
            const yBounds = b as Interval1D;
            doTxn( ( ) => {
                this.x.set( ongoing, xBounds );
                this.y.set( ongoing, yBounds );

                // In some cases the order of x.set and y.set calls matters (e.g. with a
                // scale-ratio lock). If giving y.set the final word zoomed us in too far,
                // give x.set the final word instead.
                if ( this.x.bounds.span < 0.95*xBounds.span || this.y.bounds.span < 0.95*yBounds.span ) {
                    this.x.set( ongoing, xBounds );
                }
            } );
        }
        else {
            const bounds = a as Interval2D;
            doTxn( ( ) => {
                this.x.set( ongoing, bounds.x );
                this.y.set( ongoing, bounds.y );

                // In some cases the order of x.set and y.set calls matters (e.g. with a
                // scale-ratio lock). If giving y.set the final word zoomed us in too far,
                // give x.set the final word instead.
                if ( this.x.bounds.span < 0.95*bounds.x.span || this.y.bounds.span < 0.95*bounds.y.span ) {
                    this.x.set( ongoing, bounds.x );
                }
            } );
        }
    }

    pan( ongoing: boolean, frac: Point2D | [number,number], coord: Point2D | [number,number] ): void {
        doTxn( ( ) => {
            this.x.pan( ongoing, x( frac ), x( coord ) );
            this.y.pan( ongoing, y( frac ), y( coord ) );
        } );
    }

    get viewport_PX( ): Interval2D {
        return Interval2D.fromXy( this.x.viewport_PX, this.y.viewport_PX );
    }
}

/**
 * Keep axis viewports set according to the given pane.
 *
 * The pane arg is called `centerPane` because you usually want to pass the pane in which
 * the *plot contents* (not the axis labels) are drawn. If you have a reason to pass a pane
 * other than the plot-center pane, that is fine -- the arg name is chosen to make
 * misunderstandings less likely in the common case.
 */
export function attachAxisViewportUpdater2D( centerPane: Pane, axis: Axis2D ): Disposer {
    const disposers = new DisposerGroup( );
    doTxn( ( ) => {
        disposers.add( attachAxisViewportUpdater1D( centerPane, axis.x, X ) );
        disposers.add( attachAxisViewportUpdater1D( centerPane, axis.y, Y ) );
    } );
    return disposers;
}

export function attachAxisInputHandlers2D( mousePane: Pane, xyAxis: Axis2D ): Disposer;
export function attachAxisInputHandlers2D( mousePane: Pane, xAxis: Axis1D, yAxis: Axis1D ): Disposer;
export function attachAxisInputHandlers2D( mousePane: Pane, arg0: any, arg1?: any ): Disposer {
    const axis = xyAxisArg( arg0, arg1 );
    return mousePane.addInputHandler( createAxisZoomerAndPanner2D( axis ) );
}

export function xyAxisArg( xyAxis: Axis2D ): Axis2D;
export function xyAxisArg( xAxis: Axis1D, yAxis: Axis1D ): Axis2D;
export function xyAxisArg( arg0: any, arg1?: any ): Axis2D {
    if ( arg1 === undefined ) {
        return ( arg0 as Axis2D );
    }
    else {
        const x = arg0 as Axis1D;
        const y = arg1 as Axis1D;
        return new Axis2D( x, y );
    }
}

export function createAxisZoomerAndPanner2D( axis: Axis2D ): InputHandler {
    return {
        getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
            if ( evMove.modifiers.ctrl ) {
                return createHoverZoomer( axis );
            }
            else {
                return createHoverPanner( axis );
            }
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( evGrab.button === 1 || ( evGrab.button === 0 && evGrab.modifiers.ctrl ) ) {
                return createDragZoomer( axis, evGrab );
            }
            else if ( evGrab.button === 0 ) {
                return createDragPanner( axis, evGrab );
            }
            else {
                return null;
            }
        },
        getWheelHandler( evGrabOrWheel: PaneMouseEvent ): Nullable<WheelHandler> {
            // Wheel with modifiers may do other things (e.g. browser zoom)
            if ( evGrabOrWheel.modifiers.isEmpty( ) ) {
                return createWheelZoomer( axis );
            }
            else {
                return null;
            }
        },
    };
}

function createHoverPanner( axis: Axis2D ): HoverHandler {
    return {
        target: newImmutableList( [ 'Pan2D', axis ] ),
        getMouseCursorClasses: frozenSupplier( [ 'xy-axis-panner' ] ),
    };
}

function createHoverZoomer( axis: Axis2D ): HoverHandler {
    return {
        target: newImmutableList( [ 'Zoom2D', axis ] ),
        getMouseCursorClasses: frozenSupplier( [ 'xy-axis-zoomer' ] ),
    };
}

function createDragPanner( axis: Axis2D, evGrab: PaneMouseEvent ): DragHandler {
    const grabFrac = getMouseAxisFrac2D( axis, evGrab );
    const grabCoord = axis.bounds.fracToValue( grabFrac );
    return {
        target: newImmutableList( [ 'Pan2D', axis ] ),
        getMouseCursorClasses: frozenSupplier( [ 'xy-axis-panner' ] ),
        handleDrag( evDrag: PaneMouseEvent ): void {
            const mouseFrac = getMouseAxisFrac2D( axis, evDrag );
            axis.pan( true, mouseFrac, grabCoord );
        },
        handleUngrab( evUngrab: PaneMouseEvent ): void {
            const mouseFrac = getMouseAxisFrac2D( axis, evUngrab );
            axis.pan( false, mouseFrac, grabCoord );
        }
    };
}

function createDragZoomer( axis: Axis2D, evGrab: PaneMouseEvent ): DragHandler {
    const grabFrac = getMouseAxisFrac2D( axis, evGrab );
    const grabCoord = axis.bounds.fracToValue( grabFrac );
    const grabScale = axis.scale;
    return {
        target: newImmutableList( [ 'Zoom2D', axis ] ),
        getMouseCursorClasses: frozenSupplier( [ 'xy-axis-zoomer' ] ),
        handleDrag( evDrag: PaneMouseEvent ): void {
            const wheelSteps = -1 * trunc( ( evDrag.loc_PX.y - evGrab.loc_PX.y ) / ( PSEUDOWHEEL_STEP_LPX * evGrab.dpr ) );
            const scale = grabScale.times( 1.0 / Math.pow( ZOOM_STEP_FACTOR, wheelSteps ) );
            axis.set( true, grabFrac, grabCoord, scale );
        },
        handleUngrab( evUngrab: PaneMouseEvent ): void {
            const wheelSteps = -1 * trunc( ( evUngrab.loc_PX.y - evGrab.loc_PX.y ) / ( PSEUDOWHEEL_STEP_LPX * evGrab.dpr ) );
            const scale = grabScale.times( 1.0 / Math.pow( ZOOM_STEP_FACTOR, wheelSteps ) );
            axis.set( false, grabFrac, grabCoord, scale );
        }
    };
}

function createWheelZoomer( axis: Axis2D ): WheelHandler {
    return {
        target: newImmutableList( [ 'Zoom2D', axis ] ),
        handleWheel( evWheel: PaneMouseEvent ): void {
            const frac = getMouseAxisFrac2D( axis, evWheel );
            const coord = axis.bounds.fracToValue( frac );
            const scale = axis.scale.times( 1.0 / Math.pow( ZOOM_STEP_FACTOR, evWheel.wheelSteps ) );
            axis.set( false, frac, coord, scale );
        },
    };
}

export function getMouseAxisFrac2D( axis: Axis2D, ev: PaneMouseEvent ): Point2D {
    return new Point2D(
        axis.x.viewport_PX.valueToFrac( ev.loc_PX.x ),
        axis.y.viewport_PX.valueToFrac( ev.loc_PX.y ),
    );
}

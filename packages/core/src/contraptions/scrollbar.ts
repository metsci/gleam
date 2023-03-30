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
import { appendChild, dispose, Disposer, FireableListenable, Interval1D, Interval2D, isDefined, linkListenables, ListenableBasic, newImmutableList, newImmutableMap, Nullable, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { Context, DragHandler, HoverHandler, InputHandler, KeyHandler, Painter, Pane, PaneKeyEvent, PaneMouseEvent, WheelHandler } from '../core';
import { VerticalScrollerLayout } from '../layouts/scrollerLayout';
import { FillPainter } from '../painters/fillPainter';
import { createDomPeer, cssColor, glViewport, PeerType, StyleProp } from '../support';
import { frozenSupplier } from '../util';

export class VerticalScrollbar {
    readonly scrollerLayout: VerticalScrollerLayout;
    readonly painter: VerticalScrollbarPainter;
    readonly repaint: FireableListenable;
    readonly pane: Pane;

    constructor( scrollerLayout: VerticalScrollerLayout ) {
        this.scrollerLayout = scrollerLayout;
        this.painter = new VerticalScrollbarPainter( this.scrollerLayout );
        this.repaint = new ListenableBasic( );

        this.pane = new Pane( );
        this.pane.addCssClass( 'scrollbar' );
        this.pane.addPainter( this.painter );

        attachVerticalScrollbarInputHandler( this.pane, this.scrollerLayout, this.repaint );
    }

    attachToRepaint( repaint: FireableListenable ): Disposer {
        return linkListenables( this.repaint, repaint );
    }
}

/**
 * Intended for the scrollable content pane. Includes scrolling
 * wheel/key handlers, but not hover/drag handlers.
 */
export function attachVerticalScrollableInputHandler( scrollablePane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): Disposer {
    return scrollablePane.addInputHandler( createVerticalScrollableInputHandler( scrollablePane, scrollerLayout, repaint ) );
}

/**
 * Intended for the scrollable content pane. Includes scrolling
 * wheel/key handlers, but not hover/drag handlers.
 */
export function createVerticalScrollableInputHandler( scrollablePane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): InputHandler {
    return {
        getWheelHandler( ): Nullable<WheelHandler> {
            return createWheelHandler( scrollablePane, scrollerLayout, repaint );
        },
        getKeyHandler( ): Nullable<KeyHandler> {
            return createKeyHandler( scrollablePane, scrollerLayout, repaint );
        },
    };
}

/**
 * Intended for the scrollbar pane. Includes scrolling
 * hover/drag/wheel/key handlers.
 */
export function attachVerticalScrollbarInputHandler( scrollbarPane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): Disposer {
    return scrollbarPane.addInputHandler( createVerticalScrollbarInputHandler( scrollbarPane, scrollerLayout, repaint ) );
}

/**
 * Intended for the scrollbar pane. Includes scrolling
 * hover/drag/wheel/key handlers.
 */
export function createVerticalScrollbarInputHandler( scrollbarPane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): InputHandler {
    return {
        getHoverHandler( ): Nullable<HoverHandler> {
            return createHoverHandler( scrollbarPane );
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( evGrab.button === 0 ) {
                return createDragHandler( scrollbarPane, scrollerLayout, repaint, evGrab );
            }
            else {
                return null;
            }
        },
        getWheelHandler( ): Nullable<WheelHandler> {
            return createWheelHandler( scrollbarPane, scrollerLayout, repaint );
        },
        getKeyHandler( ): Nullable<KeyHandler> {
            return createKeyHandler( scrollbarPane, scrollerLayout, repaint );
        },
    };
}

function createHoverHandler( scrollbarPane: Pane ): HoverHandler {
    return {
        target: scrollbarPane,
        getMouseCursorClasses: frozenSupplier( [ 'y-scroller' ] ),
    };
}

function createDragHandler( scrollbarPane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable, evGrab: PaneMouseEvent ): DragHandler {
    // If mouse is outside the thumb, grab the center of the thumb ... which
    // will warp the thumb so that it's centered on the mouse-press position
    const grab_PX = evGrab.loc_PX.y;
    const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX( scrollerLayout, scrollbarPane.getViewport_PX( ).y );
    const grabThumbFrac = ( thumbBounds_PX.containsPoint( grab_PX ) ? thumbBounds_PX.valueToFrac( grab_PX ) : 0.5 );

    let mouse_PX = evGrab.loc_PX.y;
    let repaintListenerDisposer = null as Nullable<Disposer>;
    return {
        target: newImmutableList( [ 'Scrollbar', scrollbarPane ] ),
        getMouseCursorClasses: frozenSupplier( [ 'y-scroller' ] ),
        handleGrab( ): void {
            // Scroll on every repaint between press and release, so we get a
            // chance to adjust the scroll position if content height changes
            repaintListenerDisposer = repaint.addListener( ( ) => {
                const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX( scrollerLayout, scrollbarPane.getViewport_PX( ).y );
                const thumbTop_PX = mouse_PX + ( 1.0 - grabThumbFrac )*thumbBounds_PX.span;
                const thumbTop_FRAC = scrollbarPane.getViewport_PX( ).y.valueToFrac( thumbTop_PX );
                const { hContent_PX } = scrollerLayout;
                scrollerLayout.yOffset_PX = hContent_PX - ( thumbTop_FRAC * hContent_PX );
            } );

            // Update mouse loc, then trigger the repaint listener
            mouse_PX = evGrab.loc_PX.y;
            repaint.fire( );
        },
        handleDrag( evDrag: PaneMouseEvent ): void {
            // Update mouse loc, then trigger the repaint listener
            mouse_PX = evDrag.loc_PX.y;
            repaint.fire( );
        },
        handleUngrab( ): void {
            // Don't scroll on release, because doing so feels unpleasant when
            // we get a simple click (no dragging between press and release),
            // and content height changes between the press and the release

            // Stop adjusting the scroll position on every repaint
            if ( repaintListenerDisposer ) {
                dispose( repaintListenerDisposer );
            }
        },
    };
}

// TODO: Accept this as an optional arg
const scrollStepSize_LPX = 40;

const scrollStepsByKey = newImmutableMap( [
    [ 'ArrowUp',   -1 ],
    [ 'ArrowDown', +1 ],
    [ 'PageUp',   -11 ],
    [ 'PageDown', +11 ],
] );

function createKeyHandler( keyPane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): KeyHandler {
    return {
        target: newImmutableList( [ 'Scrollbar', keyPane ] ),
        handleKeyPress( evPress: PaneKeyEvent ): void {
            const steps = scrollStepsByKey.get( evPress.key );
            if ( isDefined( steps ) ) {
                scrollerLayout.yOffset_PX += steps * scrollStepSize_LPX * evPress.dpr;
                repaint.fire( );
            }
        },
    };
}

function createWheelHandler( wheelPane: Pane, scrollerLayout: VerticalScrollerLayout, repaint: FireableListenable ): WheelHandler {
    return {
        target: newImmutableList( [ 'Scrollbar', wheelPane ] ),
        handleWheel( evWheel: PaneMouseEvent ): void {
            scrollerLayout.yOffset_PX += evWheel.wheelSteps * scrollStepSize_LPX * evWheel.dpr;
            repaint.fire( );
        },
    };
}

/**
 * The "thumb" is the draggable part of the scrollbar.
 */
export function getVerticalScrollbarThumbBounds_PX( scrollerLayout: VerticalScrollerLayout, scrollbarViewport_PX: Interval1D ): Interval1D {
    const { yOffset_PX, hContent_PX, hVisible_PX } = scrollerLayout;
    const thumbBottom_FRAC = ( hContent_PX - ( yOffset_PX + hVisible_PX ) ) / hContent_PX;
    const thumbTop_FRAC = ( hContent_PX - yOffset_PX ) / hContent_PX;
    const yMin_PX = scrollbarViewport_PX.fracToValue( thumbBottom_FRAC );
    const yMax_PX = scrollbarViewport_PX.fracToValue( thumbTop_FRAC );
    return Interval1D.fromEdges( yMin_PX, yMax_PX );
}

export class VerticalScrollbarPainter implements Painter {
    readonly peer = createDomPeer( 'scrollbar-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly trackColor = StyleProp.create( this.style, '--track-color', cssColor, 'rgb( 212,212,212 )' );
    readonly thumbColor = StyleProp.create( this.style, '--thumb-color', cssColor, 'rgb( 165,165,165 )' );

    readonly visible = new RefBasic( true, tripleEquals );

    protected readonly scrollerLayout: VerticalScrollerLayout;
    protected readonly trackPainter: FillPainter;
    protected readonly thumbPainter: FillPainter;

    constructor( scrollerLayout: VerticalScrollerLayout ) {
        this.scrollerLayout = scrollerLayout;

        this.trackPainter = new FillPainter( );
        this.trackPainter.color.getOverride = ( ) => this.trackColor.get( );
        appendChild( this.peer, this.trackPainter.peer );

        this.thumbPainter = new FillPainter( );
        this.thumbPainter.color.getOverride = ( ) => this.thumbColor.get( );
        appendChild( this.peer, this.thumbPainter.peer );
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const gl = context.gl;
        try {
            this.trackPainter.paint( context, viewport_PX );

            const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX( this.scrollerLayout, viewport_PX.y );
            const thumbViewport_PX = viewport_PX.withYEdges( Math.round( thumbBounds_PX.min ), Math.round( thumbBounds_PX.max ) );
            glViewport( gl, thumbViewport_PX );
            this.thumbPainter.paint( context, thumbViewport_PX );
        }
        finally {
            glViewport( gl, viewport_PX );
        }
    }

    dispose( context: Context ): void {
        this.trackPainter.dispose( context );
        this.thumbPainter.dispose( context );
    }
}

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
import { appendChild, arrayAllEqual, arrayRemoveFirst, arrayRemoveLast, arraySortStable, Consumer, Disposer, DisposerGroup, DisposerGroupMap, equal, FireableListenable, FireableNotifier, IMMEDIATE, ImmutableSet, Interval2D, isDefined, isNonNullish, isNullish, isNumber, LinkedSet, mapAdd, mapRequire, mapSetIfAbsent, newImmutableSet, NOOP, NotifierBasic, Nullable, Point2D, Predicate, ReadableRef, Ref, RefBasic, requireNonNullish, run, Runnable, Size2D, StringTuple, Supplier } from '@metsci/gleam-util';
import { ChildlessLayout } from '../layouts/childlessLayout';
import { BorderPainter } from '../painters/borderPainter';
import { FillPainter } from '../painters/fillPainter';
import { attachCanvasResizeListener, attachSubtreeRestyleListener, CET_L01, ColorTablePopulator, COLOR_TABLE_INVERTER, createDomPeer, currentDpr, DomPeer, drawingBufferBounds, getModifiers, getMouseLoc_PX, GL, glScissor, glViewport, isDomPeer, isStyleProp, isUnboundStyleProp, MAGMA, ModifierSet, PeerType, setCssClassPresent, ShaderProgram, ShaderSource } from '../support';
import { ArrayWithZIndices, attachEventListener, isfn, isobj } from '../util';
import { mergePreSortedLists, NotifierTree } from '../util/notifierTree';
import { BufferInfo, BufferInit, BufferMeta, Context, TextureInfo, TextureInit, TextureMeta } from './context';
import { Layout } from './layout';
import { Painter } from './painter';

const { max, min } = Math;

export class PaneMouseEvent {
    constructor(
        readonly dpr: number,
        readonly loc_PX: Point2D,
        readonly modifiers: ModifierSet,
        readonly button: Nullable<number> = null,
        readonly pressCount: number = 0,
        readonly wheelSteps: number = 0,
    ) {
    }
}

export class PaneKeyEvent {
    constructor(
        readonly dpr: number,
        readonly key: string,
        readonly keysDown: ImmutableSet<string>,
    ) {
    }
}

export function findPaneById( id: string ): Nullable<Pane> {
    return ( document.getElementById( id ) as any )?.pane ?? null;
}

export function* findPanes( rootPane: Pane, selectors: string ): Iterable<Pane> {
    for ( const element of rootPane.peer.querySelectorAll( selectors ) ) {
        const pane = ( element as any ).pane;
        if ( pane ) {
            yield pane;
        }
    }
}

export function findFirstPane( basePane: Pane, selectors: string ): Nullable<Pane> {
    for ( const pane of findPanes( basePane, selectors ) ) {
        return pane;
    }
    return null;
}

export interface PaintFn {
    ( context: Context ): void;
}

export interface InputHandler {
    getHoverHandler?( evMove: PaneMouseEvent ): Nullable<HoverHandler>;
    getDragHandler?( evGrab: PaneMouseEvent ): Nullable<DragHandler>;
    getWheelHandler?( evWheel: PaneMouseEvent ): Nullable<WheelHandler>;
    getKeyHandler?( evGrab: PaneMouseEvent ): Nullable<KeyHandler>;
}

export function maskedInputHandler( inputHandler: InputHandler, mask: Predicate<PaneMouseEvent> ): InputHandler {
    return {
        getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
            if ( inputHandler.getHoverHandler && mask( evMove ) ) {
                return inputHandler.getHoverHandler( evMove );
            }
            return null;
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( inputHandler.getDragHandler && mask( evGrab ) ) {
                return inputHandler.getDragHandler( evGrab );
            }
            return null;
        },
        getWheelHandler( evWheel: PaneMouseEvent ): Nullable<WheelHandler> {
            if ( inputHandler.getWheelHandler && mask( evWheel ) ) {
                return inputHandler.getWheelHandler( evWheel );
            }
            return null;
        },
        getKeyHandler( evGrab: PaneMouseEvent ): Nullable<KeyHandler> {
            if ( inputHandler.getKeyHandler && mask( evGrab ) ) {
                return inputHandler.getKeyHandler( evGrab );
            }
            return null;
        },
    };
}

export interface HoverHandler {
    /**
     * A sequence of handlers with the same `target` are considered a single
     * continuous hover. `handleHover` is called when such a sequence starts,
     * and `handleUnhover` is called when the sequence ends. `target` objects
     * are checked for equality according to `ValueObject` semantics.
     */
    readonly target: unknown;

    getMouseCursorClasses?( ): ReadonlyArray<string>;
    handleHover?( ): void;
    handleMove?( evMove: PaneMouseEvent ): void;
    handleUnhover?( ): void;
}

export interface DragHandler extends HoverHandler {
    handleGrab?( ): void;
    handleDrag?( evDrag: PaneMouseEvent ): void;
    handleUngrab?( evUngrab: PaneMouseEvent ): void;
}

export interface WheelHandler {
    /**
     * Passed to input spectators. The wheel is treated as separate from
     * hover/drag and focus, and there are no begin/end wheel notifications
     * analogous to hover/unhover, grab/ungrab, and focus/unfocus.
     */
    readonly target: unknown;

    handleWheel?( evWheel: PaneMouseEvent ): void;
}

export interface KeyHandler {
    /**
     * A sequence of handlers with the same `target` are considered a single
     * continuous focus. `handleFocus` is called when such a sequence starts,
     * and `handleUnfocus` is called when the sequence ends. `target` objects
     * are checked for equality according to `ValueObject` semantics.
     */
    readonly target: unknown;

    handleFocus?( ): void;
    handleKeyPress?( evPress: PaneKeyEvent ): void;
    handleKeyRelease?( evRelease: PaneKeyEvent ): void;
    handleUnfocus?( ): void;
}

const NOOP_TARGET: unknown = Object.freeze( [ 'NOOP' ] );
const NOOP_HOVER_HANDLER: HoverHandler = Object.freeze( { target: NOOP_TARGET } );
const NOOP_DRAG_HANDLER: DragHandler = Object.freeze( { target: NOOP_TARGET } );
const NOOP_KEY_HANDLER: KeyHandler = Object.freeze( { target: NOOP_TARGET } );
const NOOP_WHEEL_HANDLER: WheelHandler = Object.freeze( { target: NOOP_TARGET } );

export interface InputSpectator {
    handleHover?( target: unknown, evEnter: PaneMouseEvent ): void;
    handleMove?( target: unknown, evHover: PaneMouseEvent ): void;
    handleUnhover?( target: unknown, evExit: PaneMouseEvent ): void;

    handleGrab?( target: unknown, evGrab: PaneMouseEvent ): void;
    handleDrag?( target: unknown, evDrag: PaneMouseEvent ): void;
    handleUngrab?( target: unknown, evUngrab: PaneMouseEvent ): void;

    handleWheel?( target: unknown, evWheel: PaneMouseEvent ): void;

    handleFocus?( target: unknown ): void;
    handleKeyPress?( target: unknown, evPress: PaneKeyEvent ): void;
    handleKeyRelease?( target: unknown, evRelease: PaneKeyEvent ): void;
    handleUnfocus?( target: unknown ): void;
}

export function createHoverAndFocusRefs( pane: Pane ): [ ReadableRef<unknown>, ReadableRef<unknown> ] {
    const hoverTargetRef = new RefBasic<unknown>( undefined, equal );
    const focusTargetRef = new RefBasic<unknown>( undefined, equal );
    attachHoverAndFocusRefs( pane, hoverTargetRef, focusTargetRef );
    return [ hoverTargetRef, focusTargetRef ];
}

export function attachHoverAndFocusRefs( pane: Pane, hoverTargetRef: Ref<unknown>, focusTargetRef: Ref<unknown> ): Disposer {
    const disposers = new DisposerGroup( );
    disposers.add( attachHoverRef( pane, hoverTargetRef ) );
    disposers.add( attachFocusRef( pane, focusTargetRef ) );
    return disposers;
}

export function attachHoverRef( pane: Pane, hoverTargetRef: Ref<unknown> ): Disposer {
    return pane.inputSpectators.add( {
        handleHover: target => hoverTargetRef.set( true, target ),
        handleUnhover: ( ) => hoverTargetRef.set( true, undefined ),
    } );
}

export function attachFocusRef( pane: Pane, focusTargetRef: Ref<unknown> ): Disposer {
    return pane.inputSpectators.add( {
        handleFocus: target => focusTargetRef.set( false, target ),
        handleUnfocus: ( ) => focusTargetRef.set( false, undefined ),
    } );
}

export const PANE_SYMBOL = Symbol( '@@__GLEAM_PANE__@@' );
export function isPane( obj: any ): obj is Pane {
    return !!( obj && typeof obj === 'object' && obj[ PANE_SYMBOL ] );
}

export class Pane {
    readonly [ PANE_SYMBOL ] = true;

    readonly peer = createDomPeer( 'gleam-pane', this, PeerType.PANE );

    /**
     * CSS props to be consulted by this pane's parent layout when deciding
     * where to place this pane.
     */
    readonly siteInParentPeer = createDomPeer( 'site-in-parent', this, PeerType.SITE );
    readonly siteInParentStyle = window.getComputedStyle( this.siteInParentPeer );
    readonly siteInParentOverrides: { [ key: string ]: Supplier<unknown> | undefined } = {};

    readonly layout: Layout;
    consumesInputEvents: boolean;

    protected parent: Pane | null;
    protected readonly children: LinkedSet<Pane>;

    /**
     * Actions to be run the next time a `Context` is current.
     */
    protected readonly pendingContextActions: Array<Consumer<Context>>;

    /**
     * Includes `PaintFn` instances for both painters and child-panes.
     */
    protected readonly paintFns: ArrayWithZIndices<PaintFn>;
    protected readonly paintFnsByPainter: Map<Painter,PaintFn>;
    protected readonly paintFnsByPane: Map<Pane,PaintFn>;

    /**
     * Includes handlers added via `addInputHandler()` and child panes added
     * via `addPane()`.
     */
    protected readonly inputHandlers: ArrayWithZIndices<InputHandler>;

    protected readonly disposersByCssClass: DisposerGroupMap<string>;
    protected readonly disposersByPainter: DisposerGroupMap<Painter>;
    protected readonly disposersByInputHandler: DisposerGroupMap<InputHandler>;
    protected readonly disposersByInputSpectator: DisposerGroupMap<InputSpectator>;
    protected readonly disposersByChild: DisposerGroupMap<Pane>;

    protected visible: boolean;
    protected prefSize_PX: Size2D;
    protected viewport_PX: Interval2D;
    protected scissor_PX: Interval2D;

    readonly prefSizeReady: FireableNotifier<void>;
    readonly layoutReady: NotifierTree<void>;
    readonly inputSpectators: InputSpectatorTree;

    /**
     * Defined iff this pane is a top-level pane that is currently attached
     * to a canvas. See `Pane.getCanvas()`.
     */
    protected canvas: HTMLCanvasElement | undefined;

    /**
     * See also `Pane.getCanvas()`.
     */
    readonly canvasChanged: NotifierTree<void>;

    readonly background: FillPainter;
    readonly border: BorderPainter;

    constructor( layout: Layout = new ChildlessLayout( ) ) {
        this.disposersByCssClass = new DisposerGroupMap( );
        this.disposersByPainter = new DisposerGroupMap( );
        this.disposersByInputHandler = new DisposerGroupMap( );
        this.disposersByInputSpectator = new DisposerGroupMap( );
        this.disposersByChild = new DisposerGroupMap( );

        // TODO: Make this.layout mutable
        appendChild( this.peer, this.siteInParentPeer );
        appendChild( this.peer, layout.peer );
        this.layout = layout;

        this.consumesInputEvents = false;

        this.parent = null;
        this.children = new LinkedSet( );

        this.pendingContextActions = new Array( );

        this.paintFns = new ArrayWithZIndices( );
        this.paintFnsByPainter = new Map( );
        this.paintFnsByPane = new Map( );

        this.inputHandlers = new ArrayWithZIndices( );

        this.visible = true;
        this.prefSize_PX = Size2D.ZERO;
        this.viewport_PX = Interval2D.ZERO;
        this.scissor_PX = this.viewport_PX;

        this.prefSizeReady = new NotifierBasic( undefined );
        this.layoutReady = new NotifierTree( undefined );
        this.inputSpectators = new InputSpectatorTree( );

        this.canvas = undefined;
        this.canvasChanged = new NotifierTree( undefined );

        this.background = new FillPainter( );
        this.background.peer.classList.add( 'background' );
        this.addPainter( this.background, -1e6 );

        this.border = new BorderPainter( );
        this.addPainter( this.border, +1e6 );

        const debugPickFill = new FillPainter( );
        debugPickFill.peer.classList.add( 'inspect-highlight' );
        this.addPainter( debugPickFill, Number.POSITIVE_INFINITY );

        const debugPickBorder = new BorderPainter( );
        debugPickBorder.peer.classList.add( 'inspect-highlight' );
        this.addPainter( debugPickBorder, Number.POSITIVE_INFINITY );
    }

    addCssClass( className: string ): Disposer {
        const disposers = this.disposersByCssClass.get( className );
        if ( !this.peer.classList.contains( className ) ) {
            this.peer.classList.add( className );
            disposers.add( ( ) => {
                this.peer.classList.remove( className );
            } );
        }
        return disposers;
    }

    removeCssClass( className: string ): void {
        this.disposersByCssClass.disposeFor( className );
    }

    getParent( ): Pane | null {
        return this.parent;
    }

    addPainter( painter: Painter, zIndex: number = 0 ): Disposer {
        const disposers = this.disposersByPainter.get( painter );

        disposers.add( appendChild( this.peer, painter.peer ) );

        const paintFn = ( context: Context ): void => {
            if ( painter.visible.v ) {
                const gl = context.gl;
                gl.enable( GL.SCISSOR_TEST );
                glScissor( gl, this.scissor_PX );
                glViewport( gl, this.viewport_PX );
                painter.paint( context, this.viewport_PX );
            }
        };
        disposers.add( mapAdd( this.paintFnsByPainter, painter, paintFn ) );
        disposers.add( this.paintFns.add( paintFn, zIndex ) );

        return disposers;
    }

    getPainters( ): Iterable<Painter> {
        return this.paintFnsByPainter.keys( );
    }

    removePainter( painter: Painter ): void {
        this.disposersByPainter.disposeFor( painter );
    }

    removeAllPainters( ): void {
        this.disposersByPainter.dispose( );
    }

    hasPainter( painter: Painter ): boolean {
        return this.paintFnsByPainter.has( painter );
    }

    getPainterZIndex( painter: Painter ): number {
        const paintFn = mapRequire( this.paintFnsByPainter, painter );
        return this.paintFns.getZIndex( paintFn );
    }

    setPainterZIndex( painter: Painter, zIndex: number ): void {
        this.appendPainterToZIndex( painter, zIndex );
    }

    prependPainterToZIndex( painter: Painter, zIndex: number ): void {
        const paintFn = mapRequire( this.paintFnsByPainter, painter );
        this.paintFns.prependToZIndex( paintFn, zIndex );
    }

    appendPainterToZIndex( painter: Painter, zIndex: number ): void {
        const paintFn = mapRequire( this.paintFnsByPainter, painter );
        this.paintFns.appendToZIndex( paintFn, zIndex );
    }

    addInputHandler( inputHandler: InputHandler, zIndex: number = 0 ): Disposer {
        return this.inputHandlers.add( inputHandler, zIndex );
    }

    removeInputHandler( inputHandler: InputHandler ): void {
        this.disposersByInputHandler.disposeFor( inputHandler );
    }

    removeAllInputHandlers( ): void {
        this.disposersByInputHandler.dispose( );
    }

    hasInputHandler( inputHandler: InputHandler ): boolean {
        return this.inputHandlers.has( inputHandler );
    }

    getInputHandlerZIndex( inputHandler: InputHandler ): number {
        return this.inputHandlers.getZIndex( inputHandler );
    }

    setInputHandlerZIndex( inputHandler: InputHandler, zIndex: number ): void {
        this.appendInputHandlerToZIndex( inputHandler, zIndex );
    }

    prependInputHandlerToZIndex( inputHandler: InputHandler, zIndex: number ): void {
        this.inputHandlers.prependToZIndex( inputHandler, zIndex );
    }

    appendInputHandlerToZIndex( inputHandler: InputHandler, zIndex: number ): void {
        this.inputHandlers.appendToZIndex( inputHandler, zIndex );
    }

    addPane( child: Pane, zIndex: number = 0 ): Disposer {
        const disposers = this.disposersByChild.get( child );

        child.parent = this;
        disposers.add( ( ) => {
            child.parent = null;
        } );

        this.children.addLast( child );
        disposers.add( ( ) => {
            this.children.delete( child );
        } );

        // Move context actions as high up the tree as possible, so they run
        // even if child gets detached from the tree before the next render
        this.getRootPane( ).pendingContextActions.push( ...child.pendingContextActions );
        child.pendingContextActions.length = 0;

        disposers.add( appendChild( this.peer, child.peer ) );

        const paintFn = ( context: Context ): void => {
            child.paint( context );
        };
        disposers.add( mapAdd( this.paintFnsByPane, child, paintFn ) );
        disposers.add( this.paintFns.add( paintFn, zIndex ) );

        disposers.add( this.inputHandlers.add( child, zIndex ) );

        child.layoutReady.setParent( this.layoutReady );
        disposers.add( ( ) => {
            child.layoutReady.setParent( null );
        } );

        child.inputSpectators.setParent( this.inputSpectators );
        disposers.add( ( ) => {
            child.inputSpectators.setParent( null );
        } );

        child.canvasChanged.setParent( this.canvasChanged );
        disposers.add( ( ) => {
            child.canvasChanged.setParent( null );
        } );

        return disposers;
    }

    removePane( child: Pane ): void {
        this.disposersByChild.disposeFor( child );
    }

    removeAllPanes( ): void {
        this.disposersByChild.dispose( );
    }

    hasPane( pane: Pane ): boolean {
        return this.paintFnsByPane.has( pane );
    }

    getPaneZIndex( pane: Pane ): number {
        const paintFn = mapRequire( this.paintFnsByPane, pane );
        return this.paintFns.getZIndex( paintFn );
    }

    setPaneZIndex( pane: Pane, zIndex: number ): void {
        this.appendPaneToZIndex( pane, zIndex );
    }

    prependPaneToZIndex( pane: Pane, zIndex: number ): void {
        const paintFn = mapRequire( this.paintFnsByPane, pane );
        this.paintFns.prependToZIndex( paintFn, zIndex );
        this.inputHandlers.prependToZIndex( pane, zIndex );
    }

    appendPaneToZIndex( pane: Pane, zIndex: number ): void {
        const paintFn = mapRequire( this.paintFnsByPane, pane );
        this.paintFns.appendToZIndex( paintFn, zIndex );
        this.inputHandlers.appendToZIndex( pane, zIndex );
    }

    // TODO: Maybe replace with an enum like VISIBLE, BLANK, ABSENT
    isVisible( ): boolean {
        return this.visible;
    }

    setVisible( visible: boolean ): void {
        this.visible = visible;
    }

    getPrefSize_PX( ): Size2D {
        return this.prefSize_PX;
    }

    getViewport_PX( ): Interval2D {
        return this.viewport_PX;
    }

    getScissor_PX( ): Interval2D {
        return this.scissor_PX;
    }

    /**
     * **WARNING:** This method updates the mutable state of this pane and
     * its descendants, but doesn't render to the display. This may leave
     * the pane states out of sync with what's visible on the screen.
     *
     * Recursively layout this pane and its descendants to fit the specified
     * bounds.
     *
     * This method is rarely used. In most cases, it is sufficient to do the
     * layout just before rendering. However, there are cases where you want
     * to change a setting, then (without rendering) check how the layout
     * has changed.
     */
    _doLayout( bounds?: Interval2D ): void {
        bounds = bounds ?? this.getViewport_PX( );
        this.prepForLayout( );
        this.updatePrefSizes( );
        this.updateBounds( bounds, bounds );
    }

    /**
     * Recursively layout and paint this pane and its descendants to fill
     * the supplied context. This method is only intended to be called on
     * the top-level pane within a canvas.
     */
    render( context: Context ): void {
        // Pending actions
        while ( true ) {
            const contextAction = this.pendingContextActions.shift( );
            if ( contextAction === undefined ) {
                break;
            }
            contextAction( context );
        }

        // Prep
        this.prepForLayout( );

        // Pref sizes
        this.updatePrefSizes( );
        this.prefSizeReady.fire( );

        // Layout and paint
        const bounds = drawingBufferBounds( context.gl );
        if ( bounds !== null ) {
            this.updateBounds( bounds, bounds );
            this.layoutReady.fire( undefined );
            this.paint( context );
        }
    }

    /**
     * Enqueues the given action to run the next time a context is current.
     * Handy when non-rendering code needs to make sure a GL resource gets
     * disposed.
     */
    doLaterWithContext( contextAction: Consumer<Context> ): void {
        // Add it as high up the tree as possible, so the thing still runs even
        // if this Pane gets detached from the tree before the next render
        this.getRootPane( ).pendingContextActions.push( contextAction );
    }

    enableColorTables( colorTables: Iterable<Readonly<[string,ColorTablePopulator]>> ): void {
        this.doLaterWithContext( context => {
            for ( const [ key, value ] of colorTables ) {
                context.putColorTable( key, value );
            }
        } );
    }

    getRootPane( ): Pane {
        let pane: Pane = this;
        while ( true ) {
            if ( pane.parent === null ) {
                return pane;
            }
            pane = pane.parent;
        }
    }

    /**
     * Convenience method for application code that needs to access the part
     * of the DOM that contains a pane.
     *
     * See also `Pane.canvasChanged`.
     */
    getCanvas( ): HTMLCanvasElement | undefined {
        return this.getRootPane( ).canvas;
    }

    /**
     * Intended for internal use only.
     */
    _setCanvas( canvas: HTMLCanvasElement ): Disposer {
        if ( this.canvas ) {
            throw new Error( 'Canvas is already set' );
        }
        else {
            this.canvas = canvas;
            this.canvasChanged.fire( undefined );
            return ( ) => {
                if ( this.canvas === canvas ) {
                    this.canvas = undefined;
                    this.canvasChanged.fire( undefined );
                }
            };
        }
    }

    protected prepForLayout( ): void {
        // Child panes
        for ( const child of this.children ) {
            child.prepForLayout( );
        }
        // This pane
        if ( this.visible && this.layout.prepFns !== undefined ) {
            for ( const prepFn of this.layout.prepFns ) {
                prepFn( this.children );
            }
        }
    }

    protected updatePrefSizes( ): void {
        // Child panes
        for ( const child of this.children ) {
            child.updatePrefSizes( );
        }
        // This pane
        if ( this.visible && this.layout.computePrefSize_PX !== undefined ) {
            this.prefSize_PX = this.layout.computePrefSize_PX( this.children );
        }
        else {
            this.prefSize_PX = Size2D.ZERO;
        }
    }

    protected updateBounds( viewport_PX: Interval2D, scissor_PX: Interval2D ): void {
        // This pane
        this.viewport_PX = viewport_PX;
        this.scissor_PX = scissor_PX;
        // Child panes
        const childViewports_PX = this.layout.computeChildViewports_PX( this.viewport_PX, this.children );
        for ( const child of this.children ) {
            const childViewport_PX = ( childViewports_PX.get( child ) ?? Interval2D.ZERO ).round( );
            const childScissor_PX = ( childViewport_PX.intersection( this.scissor_PX ) ?? Interval2D.ZERO );
            child.updateBounds( childViewport_PX, childScissor_PX );
        }
    }

    protected paint( context: Context ): void {
        if ( this.visible && this.scissor_PX.w > 0 && this.scissor_PX.h > 0 ) {
            for ( const paintFn of this.paintFns ) {
                paintFn( context );
            }
        }
    }

    getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
        if ( this.visible && this.scissor_PX.containsPoint( evMove.loc_PX ) ) {
            for ( const inputHandler of this.inputHandlers.inReverse ) {
                const result = inputHandler.getHoverHandler?.( evMove );
                if ( isNonNullish( result ) ) {
                    return result;
                }
            }
            if ( this.consumesInputEvents ) {
                return NOOP_HOVER_HANDLER;
            }
        }
        return null;
    }

    getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
        if ( this.visible && this.scissor_PX.containsPoint( evGrab.loc_PX ) ) {
            for ( const inputHandler of this.inputHandlers.inReverse ) {
                const result = inputHandler.getDragHandler?.( evGrab );
                if ( isNonNullish( result ) ) {
                    return result;
                }
            }
            if ( this.consumesInputEvents ) {
                return NOOP_DRAG_HANDLER;
            }
        }
        return null;
    }

    getWheelHandler( evGrabOrWheel: PaneMouseEvent ): Nullable<WheelHandler> {
        if ( this.visible && this.scissor_PX.containsPoint( evGrabOrWheel.loc_PX ) ) {
            for ( const inputHandler of this.inputHandlers.inReverse ) {
                const result = inputHandler.getWheelHandler?.( evGrabOrWheel );
                if ( isNonNullish( result ) ) {
                    return result;
                }
            }
            if ( this.consumesInputEvents ) {
                return NOOP_WHEEL_HANDLER;
            }
        }
        return null;
    }

    getKeyHandler( evGrab: PaneMouseEvent ): Nullable<KeyHandler> {
        if ( this.visible && this.scissor_PX.containsPoint( evGrab.loc_PX ) ) {
            for ( const inputHandler of this.inputHandlers.inReverse ) {
                const result = inputHandler.getKeyHandler?.( evGrab );
                if ( isNonNullish( result ) ) {
                    return result;
                }
            }
            if ( this.consumesInputEvents ) {
                return NOOP_KEY_HANDLER;
            }
        }
        return null;
    }

    getPaneToInspect( evMove: PaneMouseEvent ): Nullable<Pane> {
        if ( this.visible && this.scissor_PX.containsPoint( evMove.loc_PX ) ) {
            for ( const inputHandler of this.inputHandlers.inReverse ) {
                if ( isPane( inputHandler ) ) {
                    const pane = inputHandler.getPaneToInspect( evMove );
                    if ( isNonNullish( pane ) ) {
                        return pane;
                    }
                }
                else {
                    const hoverHandler = inputHandler.getHoverHandler?.( evMove );
                    if ( isNonNullish( hoverHandler ) ) {
                        return this;
                    }
                }
            }
            return this;
        }
        return null;
    }
}

/**
 * Attach a listener that will run after layouts and before subsequent paints. The listener
 * will remove itself after it has run the given number of times, or immediately upon key
 * press, mouse press, or wheel.
 *
 * Useful at application startup, when the browser's reported window size can fluctuate for
 * a few frames (e.g. if the application was opened in a bg tab while the fg tab had docked
 * devtools), and there are application state variables (especially axis bounds) that need
 * to be initialized based on the pixel sizes of onscreen components.
 */
export function onFirstFewLayouts( pane: Pane, numTimes: number, listener: Runnable ): Disposer {
    const disposers = new DisposerGroup( );
    let timesRemaining = numTimes;
    if ( timesRemaining > 0 ) {
        // Tear down after we've run the listener the specified number of times
        disposers.add( pane.layoutReady.addListener( { order: +1e6 }, ( ) => {
            listener( );
            timesRemaining--;
            if ( timesRemaining <= 0 ) {
                disposers.dispose( );
            }
        } ) );
        // Tear down immediately on user interaction
        disposers.add( pane.inputSpectators.add( {
            handleGrab: ( ) => disposers.dispose( ),
            handleWheel: ( ) => disposers.dispose( ),
            handleKeyPress: ( ) => disposers.dispose( ),
        } ) );
    }
    return disposers;
}

interface ProgramCacheEntry {
    prog: ShaderProgram<StringTuple,StringTuple>;
    lastAccessFrameNum: number;
}

interface TextureCacheEntry {
    inputs: ReadonlyArray<unknown>;
    info: TextureInfo<TextureMeta>;
    lastAccessFrameNum: number;
}

interface BufferCacheEntry {
    inputs: ReadonlyArray<unknown>;
    info: BufferInfo<BufferMeta>;
    lastAccessFrameNum: number;
}

class ContextImpl implements Context {
    frameNum: number;
    wnd: Window;
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    glIncarnation: { n: number };
    protected nextObjectNum: number;
    protected readonly objectKeys: WeakMap<object,string>;
    protected readonly colorTables: Map<string,ColorTablePopulator>;
    protected readonly colorTableFallback: ColorTablePopulator;
    protected readonly programCache: Map<ShaderSource<StringTuple,StringTuple>,ProgramCacheEntry>;
    protected readonly textureCache: Map<string,TextureCacheEntry>;
    protected readonly bufferCache: Map<string,BufferCacheEntry>;
    protected programCacheLastPruneFrameNum: number;
    protected textureCacheLastPruneFrameNum: number;
    protected bufferCacheLastPruneFrameNum: number;

    constructor( wndInit: Window, canvasInit: HTMLCanvasElement, glInit: WebGLRenderingContext ) {
        this.frameNum = 0;
        this.wnd = wndInit;
        this.canvas = canvasInit;
        this.gl = glInit;
        this.glIncarnation = { n: 0 };
        this.nextObjectNum = 0;
        this.objectKeys = new WeakMap( );
        this.colorTables = new Map( [ CET_L01, MAGMA ] );
        this.colorTableFallback = CET_L01[ 1 ];
        this.programCache = new Map( );
        this.textureCache = new Map( );
        this.bufferCache = new Map( );
        this.programCacheLastPruneFrameNum = this.frameNum;
        this.textureCacheLastPruneFrameNum = this.frameNum;
        this.bufferCacheLastPruneFrameNum = this.frameNum;
    }

    startNewIncarnation( wnd: Window, canvas: HTMLCanvasElement, gl: WebGLRenderingContext ): void {
        this.wnd = wnd;
        this.canvas = canvas;
        this.gl = gl;
        this.glIncarnation = { n: this.glIncarnation.n + 1 };
        this.programCache.clear( );
        this.textureCache.clear( );
        this.bufferCache.clear( );
        this.programCacheLastPruneFrameNum = this.frameNum;
        this.textureCacheLastPruneFrameNum = this.frameNum;
        this.bufferCacheLastPruneFrameNum = this.frameNum;
    }

    getObjectKey( obj: object ): string {
        return mapSetIfAbsent( this.objectKeys, obj, ( ) => `#${this.nextObjectNum++}#` );
    }

    getProgram<U extends StringTuple, A extends StringTuple>( source: ShaderSource<U,A> ): ShaderProgram<U,A> {
        this.pruneProgramCache( );
        const en = mapSetIfAbsent( this.programCache, source, ( ) => {
            return {
                prog: new ShaderProgram( source ),
                lastAccessFrameNum: -1,
            };
        } );
        en.lastAccessFrameNum = this.frameNum;
        en.prog.prepare( this.gl, this.glIncarnation );
        return en.prog as ShaderProgram<U,A>;
    }

    protected pruneProgramCache( ): void {
        if ( this.frameNum > this.programCacheLastPruneFrameNum ) {
            // Identify entries ready to be disposed
            const entriesToDispose = new Array<[ ShaderSource<StringTuple,StringTuple>, ShaderProgram<StringTuple,StringTuple> ]>( );
            for ( const [ source, { prog, lastAccessFrameNum } ] of this.programCache ) {
                if ( lastAccessFrameNum < this.frameNum - 1 ) {
                    entriesToDispose.push( [ source, prog ] );
                }
            }
            // Try not to do more than `disposeLimit` disposes on a single frame,
            // but never leave more than `deferLimit` waiting to be disposed
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max( min( disposeLimit, entriesToDispose.length ), entriesToDispose.length - deferLimit );
            for ( const [ source, prog ] of entriesToDispose.slice( 0, numToDispose ) ) {
                prog.dispose( this.gl, this.glIncarnation );
                this.programCache.delete( source );
            }
            // Don't prune again until next frame
            this.programCacheLastPruneFrameNum = this.frameNum;
        }
    }

    getTexture<M extends TextureMeta>( key: string, inputs: ReadonlyArray<unknown>, init: TextureInit<M> ): TextureInfo<M> {
        this.pruneTextureCache( );
        let en = this.textureCache.get( key );
        if ( !en || !arrayAllEqual( inputs, en.inputs, equal ) ) {
            const texture = this.gl.createTexture( );
            this.gl.bindTexture( GL.TEXTURE_2D, texture );
            const meta = init( this.gl, GL.TEXTURE_2D );
            en = { inputs, info: { meta, texture }, lastAccessFrameNum: -1 };
            this.textureCache.set( key, en );
        }
        en.lastAccessFrameNum = this.frameNum;
        // See the `Context.getTexture()` doc comment for why this cast is acceptable
        return en.info as TextureInfo<M>;
    }

    protected pruneTextureCache( ): void {
        if ( this.frameNum > this.textureCacheLastPruneFrameNum ) {
            // Identify entries ready to be disposed
            const entriesToDispose = new Array<[ string, Nullable<WebGLTexture> ]>( );
            for ( const [ key, { info, lastAccessFrameNum } ] of this.textureCache ) {
                if ( lastAccessFrameNum < this.frameNum - 1 ) {
                    entriesToDispose.push( [ key, info.texture ] );
                }
            }
            // Try not to do more than `disposeLimit` disposes on a single frame,
            // but never leave more than `deferLimit` waiting to be disposed
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max( min( disposeLimit, entriesToDispose.length ), entriesToDispose.length - deferLimit );
            for ( const [ key, texture ] of entriesToDispose.slice( 0, numToDispose ) ) {
                this.gl.deleteTexture( texture );
                this.textureCache.delete( key );
            }
            // Don't prune again until next frame
            this.textureCacheLastPruneFrameNum = this.frameNum;
        }
    }

    getBuffer<M extends BufferMeta>( key: string, inputs: ReadonlyArray<unknown>, init: BufferInit<M> ): BufferInfo<M> {
        this.pruneBufferCache( );
        let en = this.bufferCache.get( key );
        if ( !en || !arrayAllEqual( inputs, en.inputs, equal ) ) {
            const buffer = this.gl.createBuffer( );
            this.gl.bindBuffer( GL.ARRAY_BUFFER, buffer );
            const meta = init( this.gl, GL.ARRAY_BUFFER );
            en = { inputs, info: { meta, buffer }, lastAccessFrameNum: -1 };
            this.bufferCache.set( key, en );
        }
        en.lastAccessFrameNum = this.frameNum;
        // See the `Context.getBuffer()` doc comment for why this cast is acceptable
        return en.info as BufferInfo<M>;
    }

    protected pruneBufferCache( ): void {
        if ( this.frameNum > this.bufferCacheLastPruneFrameNum ) {
            // Identify entries ready to be disposed
            const entriesToDispose = new Array<[ string, Nullable<WebGLBuffer> ]>( );
            for ( const [ key, { info, lastAccessFrameNum } ] of this.bufferCache ) {
                if ( lastAccessFrameNum < this.frameNum - 1 ) {
                    entriesToDispose.push( [ key, info.buffer ] );
                }
            }
            // Try not to do more than `disposeLimit` disposes on a single frame,
            // but never leave more than `deferLimit` waiting to be disposed
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max( min( disposeLimit, entriesToDispose.length ), entriesToDispose.length - deferLimit );
            for ( const [ key, buffer ] of entriesToDispose.slice( 0, numToDispose ) ) {
                this.gl.deleteBuffer( buffer );
                this.bufferCache.delete( key );
            }
            // Don't prune again until next frame
            this.bufferCacheLastPruneFrameNum = this.frameNum;
        }
    }

    getColorTable( s: string ): ColorTablePopulator {
        const exact = this.colorTables.get( s.trim( ).toLowerCase( ) );
        if ( exact ) {
            return exact;
        }

        const m = s.match( /^([^\(]*)\(([^\)]*)\)$/ );
        if ( m && m.length >= 2 ) {
            const transform = run( ( ) => {
                switch ( m[1].trim( ).toLowerCase( ) ) {
                    case 'invert': return COLOR_TABLE_INVERTER;
                    case 'reverse': return COLOR_TABLE_INVERTER;
                    default: return undefined;
                }
            } );
            const orig = this.getColorTable( m[2].trim( ).toLowerCase( ) );
            if ( transform && orig ) {
                return orig.withMutator( transform );
            }
        }

        return this.colorTableFallback;
    }

    putColorTable( key: string, value: ColorTablePopulator ): void {
        this.colorTables.set( key.trim( ).toLowerCase( ), value );
    }
}

const HOST_CLASS = 'gleam';
const HOSTS_KEY = '@@__GLEAM_HOSTS__@@';
if ( !isDefined( ( window as any )[ HOSTS_KEY ] ) ) {
    ( window as any )[ HOSTS_KEY ] = new Set<HTMLElement>( );
}
const hosts = ( window as any )[ HOSTS_KEY ];

export interface CanvasProvider {
    claimNext( ): HTMLCanvasElement;
    release( canvas: HTMLCanvasElement ): void;
}

export const DEFAULT_CANVAS_PROVIDER: CanvasProvider = {
    claimNext: ( ) => document.createElement( 'canvas' ),
    release: NOOP,
};

/**
 * The optional `canvasProvider` arg allows the caller to provide canvases by a mechanism
 * other than the default `document.createElement('canvas')`. For example, some callers may
 * wish to reuse canvases via a canvas pool, to avoid hitting browser limits on the number
 * of GL contexts.
 */
export function attachPane(
    host: HTMLElement,
    pane: Pane,
    repaint: FireableListenable,
    options?: {
        canvasProvider?: CanvasProvider,
        glContextAttrs?: WebGLContextAttributes,
    },
): Disposer {
    const disposers = new DisposerGroup( );

    if ( hosts.has( host ) ) {
        throw new Error( 'Element already has a Gleam pane attached to it' );
    }
    hosts.add( host );
    disposers.add( ( ) => {
        hosts.delete( host );
    } );

    setCssClassPresent( host, HOST_CLASS, true );
    disposers.add( ( ) => {
        setCssClassPresent( host, HOST_CLASS, false );
    } );

    const wnd0 = requireNonNullish( host.ownerDocument?.defaultView );
    if ( !wnd0.WebGLRenderingContext ) {
        host.classList.add( 'error' );
        host.textContent = 'Browser does not support WebGL';
        disposers.dispose( );
        throw new Error( 'Browser does not support WebGL' );
    }

    const glContextAttrs: WebGLContextAttributes = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        desynchronized: false,
        ...( options?.glContextAttrs ?? {} ),
    };

    function createCanvas( ): [ HTMLCanvasElement, WebGLRenderingContext ] {
        const numAttempts = 3;
        for ( let i = 0; i < numAttempts; i++ ) {
            const canvas = ( options?.canvasProvider ?? DEFAULT_CANVAS_PROVIDER ).claimNext( );

            // Apply basic styling here so there's less flicker when CSS loading isn't instantaneous
            canvas.style.border = '0';
            canvas.style.margin = '0';
            canvas.style.padding = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';

            const gl = canvas.getContext( 'webgl', glContextAttrs );
            if ( gl ) {
                if ( i > 0 ) {
                    console.info( 'WebGL context creation succeeded on attempt ' + i );
                }
                return [ canvas, gl ];
            }
        }
        console.warn( 'WebGL context creation did not succeed in ' + numAttempts + ' attempts' );
        host.classList.add( 'error' );
        host.textContent = 'Browser failed to initialize WebGL';
        disposers.dispose( );
        throw new Error( 'Browser failed to initialize WebGL' );
    }

    // WebGLRenderingContext.isContextLost() can change to true and then back to
    // false ... but in practice a lost context NEVER becomes usable again, so we
    // need a property that's like isContextLost() but never changes back to false
    const CONTEXT_EVER_LOST = '@@__GLEAM_CONTEXT_EVER_LOST__@@';

    function setContextEverLost( canvas: HTMLCanvasElement ): void {
        ( canvas as any )[ CONTEXT_EVER_LOST ] = true;
    }

    function wasContextEverLost( canvas: HTMLCanvasElement ): boolean {
        return !!( ( canvas as any )[ CONTEXT_EVER_LOST ] );
    }

    const disposersForCanvases = new DisposerGroupMap<HTMLCanvasElement>( );
    disposers.add( disposersForCanvases );
    const context = new ContextImpl( wnd0, ...createCanvas( ) );
    let pendingFrameRequestId = undefined as number | undefined;
    function attachCanvas( wnd: Window & typeof globalThis, canvas: HTMLCanvasElement ): Disposer {
        const disposers = new DisposerGroup( );
        disposers.add( appendChild( host, canvas ) );
        disposers.add( pane._setCanvas( canvas ) );
        disposers.add( attachPaneInputListeners( wnd, canvas, pane, repaint ) );
        disposers.add( attachEventListener( canvas, 'webglcontextlost', true, ev => {
            ev.preventDefault( );
            setContextEverLost( canvas );
            repaint.fire( );
        } ) );

        let printApproxSizeWarning = true;
        disposers.add( attachCanvasResizeListener( wnd, host, canvas, ( width_PX, height_PX, isApprox ) => {
            if ( isApprox === undefined ) {
                // Don't do anything logging related
            }
            else if ( isApprox === false ) {
                printApproxSizeWarning = true;
            }
            else if ( isApprox === true && printApproxSizeWarning ) {
                console.warn( 'Exact canvas size is not available in this browser -- canvas may look blurry' );
                printApproxSizeWarning = false;
            }
            canvas.width = width_PX;
            canvas.height = height_PX;

            // Modifying canvas.width or canvas.height clears the canvas, so render
            // immediately afterwards without waiting for the next animation frame,
            // to avoid flicker during resize ... unless we have a stale canvas or
            // window, in which case queue up a new animation frame the usual way
            if ( canvas === context.canvas && wnd === canvas.ownerDocument.defaultView ) {
                doRender( wnd );
            }
            else {
                repaint.fire( );
            }
        } ) );

        return disposers;
    }
    function doRender( wnd: Window & typeof globalThis ): void {
        // The webglcontextlost event may not have fired yet
        if ( context.gl.isContextLost( ) || wnd !== context.wnd ) {
            setContextEverLost( context.canvas );
        }

        // Recreate the canvas and gl, if necessary
        if ( wasContextEverLost( context.canvas ) ) {
            // Create a new canvas and gl
            console.debug( 'Recovering from lost WebGL context' );
            const [ canvas, gl ] = createCanvas( );
            console.debug( 'Recovered from lost WebGL context' );

            // Swap out the old canvas for the new one
            disposersForCanvases.disposeFor( context.canvas );
            ( options?.canvasProvider ?? DEFAULT_CANVAS_PROVIDER ).release( context.canvas );
            disposersForCanvases.get( canvas ).add( attachCanvas( wnd, canvas ) );

            // Update the gleam context
            context.startNewIncarnation( wnd, canvas, gl );
        }

        // Browsers will automatically clear the WebGL canvas to transparent
        // between frames -- EXCEPT on frames with no draw GL draw calls, in
        // in which case the previous frame remains visible. But we don't ever
        // want an old frame to remain visible, even when there are no visible
        // painters. So do an explicit clear here.
        const gl = context.gl;
        context.gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );
        gl.clearColor( 0, 0, 0, 0 );
        gl.clear( GL.COLOR_BUFFER_BIT );

        // Render
        pendingFrameRequestId = undefined;
        pane.render( context );
        context.frameNum++;
    };
    disposersForCanvases.get( context.canvas ).add( attachCanvas( wnd0, context.canvas ) );

    disposers.add( repaint.addListener( ( ) => {
        const wnd = context.canvas.ownerDocument.defaultView;
        if ( pendingFrameRequestId === undefined || wnd !== context.wnd ) {
            pendingFrameRequestId = wnd?.requestAnimationFrame( ( ) => {
                doRender( wnd );
            } );
        }
    } ) );

    disposers.add( appendChild( host, pane.peer ) );

    disposers.add( attachSubtreeRestyleListener( pane.peer, ( ) => {
        repaint.fire( );
    } ) );

    repaint.fire( );

    return disposers;
}

export function wheelSteps( ev: WheelEvent ): number {
    // Extracting more than the sign is hard to do reliably across browsers
    return Math.sign( ev.deltaY );
}

export function buttonsMask( ...buttonNumbers: number[] ): number {
    let union = 0;
    for ( const button of buttonNumbers ) {
        switch ( button ) {
            case 0: union |= 1; break;
            case 1: union |= 4; break;
            case 2: union |= 2; break;
            case 3: union |= 8; break;
            case 4: union |= 16; break;
        }
    }
    return union;
}

export function isButtonDown( buttonsDown: number, buttonNumber: number ): boolean {
    return ( ( buttonsDown & buttonsMask( buttonNumber ) ) !== 0 );
}

/**
 * **WARNING**: Creates a one-way binding only -- does not update the ref when element.classList changes.
 */
function _attachClassesRefListener( classes: ReadableRef<ImmutableSet<string>>, element: HTMLElement ): Disposer {
    let oldClasses = newImmutableSet<string>( [] );
    return classes.addListener( IMMEDIATE, ( ) => {
        const newClasses = classes.v;
        for ( const clazz of oldClasses ) {
            if ( !newClasses.has( clazz ) ) {
                element.classList.remove( clazz );
            }
        }
        for ( const clazz of newClasses ) {
            if ( !oldClasses.has( clazz ) ) {
                element.classList.add( clazz );
            }
        }
        oldClasses = newClasses;
    } );
}

export function attachPaneInputListeners( wnd: Window, canvas: HTMLCanvasElement, contentPane: Pane, repaint: FireableListenable ): Disposer {
    const disposers = new DisposerGroup( );


    // Constants
    //

    // How long after an initial press to accumulate subsequent presses into a
    // multi-press -- the window always starts at the initial press; subsequent
    // presses do not extend it
    const MULTIPRESS_WINDOW_MILLIS = 300;

    // CSS classes that get added to the canvas while dragging -- can be used
    // in CSS to differentiate style (especially mouse cursors) based on whether
    // there's an actual drag happening, or just a hover or click
    const DRAGGED_CLASSES = newImmutableSet( [ 'dragged' ] );

    // Frequently used empty set
    const EMPTY_CLASSES = newImmutableSet<string>( [] );


    // Mutable state
    //

    let activeHover: Nullable<{
        hoverHandler: HoverHandler,
        loc_PX: Point2D,
    }> = null;

    let activeDrag: Nullable<{
        dragHandler: DragHandler,
        loc_PX: Point2D,
        button: number,
        grabModifiers: ModifierSet,
        currModifiers: ModifierSet,
        wheelHandler: Nullable<WheelHandler>,
    }> = null;

    let activeFocus: Nullable<{
        keyHandler: KeyHandler,
        keysDown: Set<string>,
    }> = null;

    const cursorClasses = new RefBasic<ImmutableSet<string>>( EMPTY_CLASSES, equal );
    disposers.add( _attachClassesRefListener( cursorClasses, canvas ) );

    const dragClasses = new RefBasic<ImmutableSet<string>>( EMPTY_CLASSES, equal );
    disposers.add( _attachClassesRefListener( dragClasses, canvas ) );


    // Simple actions
    //

    type TupleWithoutFirst<T extends any[]> = T extends [ infer F, ...infer R ] ? R : never;
    function createPaneMouseEvent( ...args: TupleWithoutFirst<ConstructorParameters<typeof PaneMouseEvent>> ): PaneMouseEvent {
        return new PaneMouseEvent( currentDpr( contentPane ), ...args );
    }
    function createPaneKeyEvent( ...args: TupleWithoutFirst<ConstructorParameters<typeof PaneKeyEvent>> ): PaneKeyEvent {
        return new PaneKeyEvent( currentDpr( contentPane ), ...args );
    }

    function doMove( mouse_PX: Point2D, modifiers: ModifierSet ): void {
        if ( activeDrag !== null ) {
            throw new Error( );
        }
        else {
            if ( isInspectPickingActive( contentPane ) ) {
                const evMove = createPaneMouseEvent( mouse_PX, modifiers );
                const newPane = contentPane.getPaneToInspect( evMove );
                if ( setInspectHoveredPane( newPane ) ) {
                    repaint.fire( );
                }
            }
            else {
                if ( setInspectHoveredPane( null ) ) {
                    repaint.fire( );
                }
            }

            const evMove = createPaneMouseEvent( mouse_PX, modifiers );
            const hoverHandler = contentPane.getHoverHandler( evMove );
            const oldHoverHandler = activeHover?.hoverHandler ?? null;
            if ( !equal( hoverHandler?.target, oldHoverHandler?.target ) ) {
                const ev = createPaneMouseEvent( mouse_PX, modifiers );
                if ( oldHoverHandler !== null ) {
                    contentPane.inputSpectators.fireUnhover( oldHoverHandler.target, ev );
                    oldHoverHandler.handleUnhover?.( );
                }
                if ( hoverHandler !== null ) {
                    hoverHandler.handleHover?.( );
                    contentPane.inputSpectators.fireHover( hoverHandler.target, ev );
                }
            }
            cursorClasses.set( false, newImmutableSet( hoverHandler?.getMouseCursorClasses?.( ) ?? [] ) );
            activeHover = ( hoverHandler === null ? null : {
                hoverHandler,
                loc_PX: mouse_PX,
            } );
            activeHover?.hoverHandler.handleMove?.( evMove );
            contentPane.inputSpectators.fireMove( activeHover?.hoverHandler.target, evMove );
        }
    }

    function doUnhover( ): void {
        if ( activeDrag !== null ) {
            throw new Error( );
        }
        else if ( activeHover !== null ) {
            const ev = createPaneMouseEvent( activeHover.loc_PX, ModifierSet.EMPTY );
            contentPane.inputSpectators.fireUnhover( activeHover.hoverHandler.target, ev );
            activeHover.hoverHandler.handleUnhover?.( );
            cursorClasses.set( false, newImmutableSet( [] ) );
            activeHover = null;
        }
    }

    function doGrab( mouse_PX: Point2D, modifiers: ModifierSet, button: number, pressCount: number ): void {
        if ( activeDrag !== null ) {
            throw new Error( );
        }
        else if ( isInspectPickingActive( contentPane ) ) {
            const evGrab = createPaneMouseEvent( mouse_PX, modifiers );
            const newPane = contentPane.getPaneToInspect( evGrab );
            if ( setInspectSelectedPane( newPane ) ) {
                repaint.fire( );
            }
        }
        else {
            if ( setInspectSelectedPane( null ) ) {
                repaint.fire( );
            }

            const evGrab = createPaneMouseEvent( mouse_PX, modifiers, button, pressCount );

            // Call handleGrab before getKeyHandler, so any new focus target created by
            // handleGrab will be eligible to receive focus immediately
            let dragHandler: Nullable<DragHandler>;
            const newDragHandler = contentPane.getDragHandler( evGrab );
            const oldHoverHandler = activeHover?.hoverHandler ?? null;
            if ( !equal( newDragHandler?.target, oldHoverHandler?.target ) ) {
                const ev = createPaneMouseEvent( mouse_PX, modifiers );
                if ( oldHoverHandler !== null ) {
                    contentPane.inputSpectators.fireUnhover( oldHoverHandler.target, ev );
                    oldHoverHandler.handleUnhover?.( );
                }
                if ( newDragHandler !== null ) {
                    newDragHandler.handleHover?.( );
                    contentPane.inputSpectators.fireHover( newDragHandler.target, ev );
                }
                dragHandler = newDragHandler;
            }
            else if ( oldHoverHandler && newDragHandler ) {
                // The drag is a continutation of the hover because they have the same target,
                // so combine the hover and drag handlers together into a single handler
                dragHandler = { ...newDragHandler };
                dragHandler.handleMove = evMove => {
                    newDragHandler.handleMove?.( evMove );
                    oldHoverHandler.handleMove?.( evMove );
                };
                dragHandler.handleUnhover = ( ) => {
                    newDragHandler.handleUnhover?.( );
                    oldHoverHandler.handleUnhover?.( );
                };
            }
            else {
                dragHandler = newDragHandler;
            }
            cursorClasses.set( false, newImmutableSet( dragHandler?.getMouseCursorClasses?.( ) ?? [] ) );
            dragClasses.set( false, EMPTY_CLASSES );
            const newWheelHandler = contentPane.getWheelHandler( evGrab );
            activeDrag = ( dragHandler === null ? null : {
                dragHandler,
                loc_PX: mouse_PX,
                button,
                grabModifiers: modifiers,
                currModifiers: modifiers,
                wheelHandler: newWheelHandler,
            } );
            activeHover = ( dragHandler === null ? null : {
                hoverHandler: dragHandler,
                loc_PX: mouse_PX,
            } );
            activeDrag?.dragHandler.handleGrab?.( );
            contentPane.inputSpectators.fireGrab( activeDrag?.dragHandler.target, evGrab );

            // Call getKeyHandler after handleGrab, for reasons described above
            const keyHandler = contentPane.getKeyHandler( evGrab );
            if ( keyHandler !== null && !equal( keyHandler.target, activeFocus?.keyHandler.target ) ) {
                if ( activeFocus !== null ) {
                    activeFocus.keyHandler.handleUnfocus?.( );
                    contentPane.inputSpectators.fireUnfocus( activeFocus.keyHandler.target );
                }
                activeFocus = ( keyHandler === null ? null : {
                    keyHandler,
                    keysDown: new Set( ),
                } );
                if ( activeFocus !== null ) {
                    activeFocus.keyHandler.handleFocus?.( );
                    contentPane.inputSpectators.fireFocus( activeFocus.keyHandler.target );
                }
            }
        }
    }

    function doDrag( mouse_PX: Point2D, modifiers: ModifierSet ): void {
        if ( activeDrag === null || activeHover === null ) {
            throw new Error( );
        }
        else {
            const evDrag = createPaneMouseEvent( mouse_PX, modifiers, activeDrag.button );
            cursorClasses.set( false, newImmutableSet( activeDrag.dragHandler.getMouseCursorClasses?.( ) ?? [] ) );
            dragClasses.set( false, DRAGGED_CLASSES );
            activeDrag.currModifiers = modifiers;
            activeDrag.loc_PX = mouse_PX;
            activeHover.loc_PX = mouse_PX;
            activeDrag.dragHandler.handleDrag?.( evDrag );
            contentPane.inputSpectators.fireDrag( activeDrag.dragHandler.target, evDrag );
        }
    }

    function doUngrab( mouse_PX: Point2D, modifiers: ModifierSet ): void {
        if ( activeDrag === null ) {
            throw new Error( );
        }
        else {
            const evUngrab = createPaneMouseEvent( mouse_PX, modifiers, activeDrag.button );
            contentPane.inputSpectators.fireUngrab( activeDrag.dragHandler.target, evUngrab );
            activeDrag.dragHandler.handleUngrab?.( evUngrab );
            dragClasses.set( false, EMPTY_CLASSES );
            activeDrag = null;
        }
    }

    function doWheel( mouse_PX: Point2D, modifiers: ModifierSet, wheelSteps: number ): void {
        if ( activeDrag !== null ) {
            const evWheel = createPaneMouseEvent( mouse_PX, modifiers, null, 0, wheelSteps );
            activeDrag.wheelHandler?.handleWheel?.( evWheel );
            contentPane.inputSpectators.fireWheel( activeDrag.wheelHandler?.target, evWheel );
            doDrag( mouse_PX, modifiers );
        }
        else {
            const evWheel = createPaneMouseEvent( mouse_PX, modifiers, null, 0, wheelSteps );
            const wheelHandler = contentPane.getWheelHandler( evWheel );
            wheelHandler?.handleWheel?.( evWheel );
            contentPane.inputSpectators.fireWheel( wheelHandler?.target, evWheel );
            doMove( mouse_PX, modifiers );
        }
    }

    function doKeyPress( key: string ): void {
        if ( activeFocus !== null ) {
            activeFocus.keysDown.add( key );
            const evPress = createPaneKeyEvent( key, newImmutableSet( activeFocus.keysDown ) );
            activeFocus.keyHandler.handleKeyPress?.( evPress );
            contentPane.inputSpectators.fireKeyPress( activeFocus.keyHandler.target, evPress );
        }
    }

    function doKeyRelease( key: string ): void {
        if ( activeFocus !== null ) {
            activeFocus.keysDown.delete( key );
            const evRelease = createPaneKeyEvent( key, newImmutableSet( activeFocus.keysDown ) );
            activeFocus.keyHandler.handleKeyRelease?.( evRelease );
            contentPane.inputSpectators.fireKeyRelease( activeFocus.keyHandler.target, evRelease );
        }
    }

    // If draggerButton is still down (as it typically should be), call doDrag() as usual --
    // but if draggerButton is NOT still down (which does happen in certain corner cases,
    // especially when presses and releases of different buttons are interleaved, and some
    // of them happen outside the browser window), handle it as gracefully as possible
    function doCheckedDrag( mouse_PX: Point2D, modifiers: ModifierSet, buttonsDown: number ): void {
        if ( activeDrag === null ) {
            throw new Error( );
        }
        else if ( isButtonDown( buttonsDown, activeDrag.button ) ) {
            if ( !equal( mouse_PX, activeDrag.loc_PX ) || !equal( modifiers, activeDrag.currModifiers ) ) {
                doDrag( mouse_PX, modifiers );
            }
        }
        else {
            doUngrab( mouse_PX, modifiers );
            doMove( mouse_PX, modifiers );
        }
    }


    // Compose simple actions into event handlers
    //

    let multiPressStart_PMILLIS: number = Number.NEGATIVE_INFINITY;
    let multiPressButton: Nullable<number> = null;
    let multiPressCount: number = 0;
    disposers.add( attachEventListener( canvas, 'mousedown', false, ev => {
        const pressTime_PMILLIS = Date.now( );
        const mouse_PX = getMouseLoc_PX( canvas, ev );
        const modifiers = getModifiers( ev );

        if ( ev.button === multiPressButton && pressTime_PMILLIS <= multiPressStart_PMILLIS + MULTIPRESS_WINDOW_MILLIS ) {
            multiPressCount++;
        }
        else {
            multiPressStart_PMILLIS = pressTime_PMILLIS;
            multiPressButton = ev.button;
            multiPressCount = 1;
        }

        // If a new drag starts in the middle of an existing drag, terminate the old one
        if ( activeDrag !== null ) {
            doUngrab( mouse_PX, modifiers );
        }

        doGrab( mouse_PX, modifiers, ev.button, multiPressCount );

        // Disable text selection on double-click, which messes up subsequent drags
        ev.preventDefault( );
    } ) );

    // Get NON-DRAG moves from the CANVAS
    disposers.add( attachEventListener( canvas, 'mousemove', false, ev => {
        if ( activeDrag === null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doMove( mouse_PX, modifiers );
        }
    } ) );

    // Get DRAG moves from the WINDOW, so that we get even the ones outside the canvas
    disposers.add( attachEventListener( wnd, 'mousemove', false, ev => {
        if ( activeDrag !== null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doCheckedDrag( mouse_PX, modifiers, ev.buttons );
        }
    } ) );

    // Get NON-DRAG releases from the CANVAS
    disposers.add( attachEventListener( canvas, 'mouseup', false, ev => {
        if ( activeDrag === null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doMove( mouse_PX, modifiers );
        }
    } ) );

    // TODO: Auto-repeat with more than one key involved has inconvenient behavior
    // Refresh hovered grabber when modifiers change
    disposers.add( attachEventListener( wnd, 'keydown', false, ev => {
        if ( activeDrag !== null ) {
            const modifiers = getModifiers( ev );
            doCheckedDrag( activeDrag.loc_PX, modifiers, buttonsMask( activeDrag.button ) );
        }
        else if ( activeHover !== null ) {
            const modifiers = getModifiers( ev );
            doMove( activeHover.loc_PX, modifiers );
        }
        doKeyPress( ev.key );
    } ) );

    // Refresh hovered grabber when modifiers change
    disposers.add( attachEventListener( wnd, 'keyup', false, ev => {
        if ( activeDrag !== null ) {
            const modifiers = getModifiers( ev );
            doCheckedDrag( activeDrag.loc_PX, modifiers, buttonsMask( activeDrag.button ) );
        }
        else if ( activeHover !== null ) {
            const modifiers = getModifiers( ev );
            doMove( activeHover.loc_PX, modifiers );
        }
        doKeyRelease( ev.key );
    } ) );

    // Get DRAG releases from the WINDOW, so that we get even the ones outside the canvas
    disposers.add( attachEventListener( wnd, 'mouseup', false, ev => {
        if ( activeDrag !== null ) {
            // On some browsers, ev.button and ev.buttons are unreliable when the mouse
            // is outside the window ... the least problematic way to cope with this is
            // to end the drag when we get a mouseup outside the window from ANY button
            const inWindow = ( 0 <= ev.x && ev.x < wnd.innerWidth && 0 <= ev.y && ev.y < wnd.innerHeight );
            if ( ev.button === activeDrag.button || !inWindow ) {
                const mouse_PX = getMouseLoc_PX( canvas, ev );
                const modifiers = getModifiers( ev );
                doUngrab( mouse_PX, modifiers );
                doMove( mouse_PX, modifiers );
            }
        }
    } ) );

    disposers.add( attachEventListener( wnd, 'blur', false, ( ) => {
        if ( activeDrag !== null ) {
            doUngrab( activeDrag.loc_PX, activeDrag.currModifiers );
        }
        if ( activeHover !== null ) {
            doUnhover( );
        }
        if ( activeFocus !== null ) {
            activeFocus.keysDown.clear( );
        }
        if ( setInspectHoveredPane( null ) ) {
            repaint.fire( );
        }
    } ) );

    disposers.add( attachEventListener( canvas, 'mouseout', false, ev => {
        if ( activeDrag === null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doMove( mouse_PX, modifiers );
        }
    } ) );

    disposers.add( attachEventListener( canvas, 'mouseover', false, ev => {
        if ( activeDrag === null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doMove( mouse_PX, modifiers );
        }
    } ) );

    // Get NON-DRAG wheels from the CANVAS
    attachEventListener( canvas, 'wheel', false, ev => {
        if ( activeDrag === null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doMove( mouse_PX, modifiers );
            doWheel( mouse_PX, modifiers, wheelSteps( ev ) );
        }
    } );

    // Get DRAG wheels from the WINDOW, so that we get even the ones outside the canvas
    attachEventListener( wnd, 'wheel', false, ev => {
        if ( activeDrag !== null ) {
            const mouse_PX = getMouseLoc_PX( canvas, ev );
            const modifiers = getModifiers( ev );
            doCheckedDrag( mouse_PX, modifiers, ev.buttons );
            doWheel( mouse_PX, modifiers, wheelSteps( ev ) );
        }
    } );

    return disposers;
}

export interface InputSpectatorConfig {
    order?: number;
}

interface InputSpectatorEntry {
    config: InputSpectatorConfig;
    inputSpectator: InputSpectator;
}

class InputSpectatorTree {
    protected parent: Nullable<InputSpectatorTree>;
    protected children: Array<InputSpectatorTree>;

    protected ownEntries: Array<InputSpectatorEntry>;
    protected ownEntriesDirty: boolean;

    protected subtreeEntries: Nullable<Array<InputSpectatorEntry>>;

    constructor( ) {
        this.parent = null;
        this.children = new Array( );

        this.ownEntries = new Array( );
        this.ownEntriesDirty = false;

        this.subtreeEntries = null;
    }

    add( inputSpectator: InputSpectator ): Disposer;
    add( config: InputSpectatorConfig, inputSpectator: InputSpectator ): Disposer;
    add( a: InputSpectatorConfig | InputSpectator, b?: InputSpectator ): Disposer {
        const entry = InputSpectatorTree.createEntry( a, b );
        return this.doAddEntry( entry );
    }

    protected static createEntry( a: InputSpectatorConfig | InputSpectator, b: InputSpectator | undefined ): InputSpectatorEntry {
        if ( b === undefined ) {
            return {
                config: {},
                inputSpectator: a as InputSpectator,
            };
        }
        else {
            return {
                config: a as InputSpectatorConfig,
                inputSpectator: b,
            };
        }
    }

    protected doAddEntry( entry: InputSpectatorEntry ): Disposer {
        this.ownEntries.push( entry );
        this.ownEntriesDirty = true;
        this.setSubtreeEntriesDirty( );
        return ( ) => {
            arrayRemoveLast( this.ownEntries, entry );
            this.removeSubtreeEntry( entry );
        };
    }

    setParent( parent: Nullable<InputSpectatorTree> ): void {
        if ( this.parent ) {
            arrayRemoveFirst( this.parent.children, this );
            this.parent.setSubtreeEntriesDirty( );
            this.parent = null;
        }
        if ( parent ) {
            this.parent = parent;
            this.parent.children.push( this );
            this.parent.setSubtreeEntriesDirty( );
        }
    }

    protected setSubtreeEntriesDirty( ): void {
        this.subtreeEntries = null;
        if ( this.parent ) {
            this.parent.setSubtreeEntriesDirty( );
        }
    }

    protected removeSubtreeEntry( entry: InputSpectatorEntry ): Nullable<number> {
        let i;
        if ( this.subtreeEntries ) {
            i = arrayRemoveLast( this.subtreeEntries, entry );
        }
        else {
            i = null;
        }

        if ( this.parent ) {
            this.parent.removeSubtreeEntry( entry );
        }

        return i;
    }

    protected sortAndGetOwnEntries( ): Array<InputSpectatorEntry> {
        if ( this.ownEntriesDirty ) {
            arraySortStable( this.ownEntries, ( a, b ) => {
                return ( ( a.config.order ?? 0 ) - ( b.config.order ?? 0 ) );
            } );
            this.ownEntriesDirty = false;
        }
        return this.ownEntries;
    }

    protected getSubtreeEntryLists( ): Array<Array<InputSpectatorEntry>> {
        const result = new Array<Array<InputSpectatorEntry>>( );
        result.push( this.sortAndGetOwnEntries( ) );
        for ( const child of this.children ) {
            result.push( ...child.getSubtreeEntryLists( ) );
        }
        return result;
    }

    protected getSubtreeEntries( ): ReadonlyArray<InputSpectatorEntry> {
        if ( !this.subtreeEntries ) {
            const entryLists = this.getSubtreeEntryLists( );
            this.subtreeEntries = mergePreSortedLists( entryLists, ( a, b ) => {
                return ( ( a.config.order ?? 0 ) - ( b.config.order ?? 0 ) );
            } );
        }
        return this.subtreeEntries;
    }

    protected forSubtree( fn: Consumer<InputSpectator> ): void {
        for ( const en of this.getSubtreeEntries( ) ) {
            fn( en.inputSpectator );
        }
    }

    fireHover( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleHover?.( target, ev ) );
    }

    fireMove( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleMove?.( target, ev ) );
    }

    fireUnhover( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleUnhover?.( target, ev ) );
    }

    fireGrab( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleGrab?.( target, ev ) );
    }

    fireDrag( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleDrag?.( target, ev ) );
    }

    fireUngrab( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleUngrab?.( target, ev ) );
    }

    fireWheel( target: unknown, ev: PaneMouseEvent ): void {
        this.forSubtree( s => s.handleWheel?.( target, ev ) );
    }

    fireFocus( target: unknown ): void {
        this.forSubtree( s => s.handleFocus?.( target ) );
    }

    fireKeyPress( target: unknown, ev: PaneKeyEvent ): void {
        this.forSubtree( s => s.handleKeyPress?.( target, ev ) );
    }

    fireKeyRelease( target: unknown, ev: PaneKeyEvent ): void {
        this.forSubtree( s => s.handleKeyRelease?.( target, ev ) );
    }

    fireUnfocus( target: unknown ): void {
        this.forSubtree( s => s.handleUnfocus?.( target ) );
    }
}



// Inspect utils

const INSPECT_PICKING_CLASS = 'inspect-picking';
const INSPECT_HOVERED_CLASS = 'inspect-hovered';
const INSPECT_SELECTED_CLASS = 'inspect-selected';

/**
 * To show a Gleam pane's peer in browser devtools: (1) run `gleamInspect()` in
 * the console, (2) click on the pane of interest, (3) click on the representation
 * of the pane's DOM peer that gets printed to the console.
 *
 * Alternatively: (1) select a DOM peer in the devtools element tree, (2) run
 * `gleamInspect($0)` in the console, (3) click on the representation of the
 * pane's DOM peer that gets printed to the console.
 *
 * For Step 3 above, some browsers require you to right-click the printed DOM peer,
 * then choose something like "Reveal element" from the popup menu. In other browsers,
 * the printed form of the DOM peer includes a clickable icon.
 *
 * `gleamInspect()` takes one optional argument:
 *  - If the arg is omitted, the inspected pane will be selected by mouse click
 *  - If the arg is `undefined`, the inspected pane will be selected by mouse click
 *  - If the arg is a DOM peer, the peer's associated pane becomes the inspected pane
 *  - If the arg is a `Pane`, that pane becomes the inspected pane
 *  - Otherwise an error is printed to the console
 */
if ( !isDefined( ( window as any ).gleamInspect ) ) {
    ( window as any ).gleamInspect = ( paneOrPeer?: unknown ) => {
        if ( isPane( paneOrPeer ) ) {
            setInspectSelectedPane( paneOrPeer );
        }
        else if ( isDomPeer( paneOrPeer ) ) {
            setInspectSelectedDomPeer( paneOrPeer );
        }
        else if ( isNullish( paneOrPeer ) ) {
            for ( const host of hosts ) {
                setCssClassPresent( host, INSPECT_PICKING_CLASS, true );
            }
            console.info( 'Click on a pane to inspect it' );
        }
        else {
            console.error( 'Item is not inspectable:\n', paneOrPeer );
        }
    };
}

function getHostElement( domPeer: DomPeer ): Nullable<HTMLElement> {
    const rootDomPeer = run( ( ) => {
        for ( const ancestor of getDomPeerStack( domPeer ) ) {
            return ancestor;
        }
        return undefined;
    } );

    const host = rootDomPeer?.parentElement;
    if ( host?.classList.contains( HOST_CLASS ) ) {
        return host;
    }
    else {
        return null;
    }
}

function isInspectPickingActive( pane: Pane ): boolean {
    const host = getHostElement( pane.peer );
    return !!( host?.classList.contains( INSPECT_PICKING_CLASS ) );
}

function setInspectHoveredPane( pane: Nullable<Pane> ): boolean {
    let anyCssClassChanges = false;
    const domPeer = pane?.peer;
    for ( const host of hosts ) {
        for ( const el of host.querySelectorAll( `.${INSPECT_HOVERED_CLASS}` ) ) {
            anyCssClassChanges = setCssClassPresent( el, INSPECT_HOVERED_CLASS, el === domPeer ) || anyCssClassChanges;
        }
    }
    if ( domPeer ) {
        anyCssClassChanges = setCssClassPresent( domPeer, INSPECT_HOVERED_CLASS, true ) || anyCssClassChanges;
    }
    return anyCssClassChanges;
}

function setInspectSelectedPane( pane: Nullable<Pane> ): boolean {
    return setInspectSelectedDomPeer( pane?.peer );
}

function setInspectSelectedDomPeer( domPeer?: DomPeer ): boolean {
    let anyCssClassChanges = false;
    for ( const host of hosts ) {
        anyCssClassChanges = setCssClassPresent( host, INSPECT_PICKING_CLASS, false ) || anyCssClassChanges;
    }
    for ( const host of hosts ) {
        for ( const el of host.querySelectorAll( `.${INSPECT_HOVERED_CLASS}` ) ) {
            anyCssClassChanges = setCssClassPresent( el, INSPECT_HOVERED_CLASS, false ) || anyCssClassChanges;
        }
    }
    for ( const host of hosts ) {
        for ( const el of host.querySelectorAll( `.${INSPECT_SELECTED_CLASS}` ) ) {
            anyCssClassChanges = setCssClassPresent( el, INSPECT_SELECTED_CLASS, el === domPeer ) || anyCssClassChanges;
        }
    }
    if ( domPeer ) {
        anyCssClassChanges = setCssClassPresent( domPeer, INSPECT_SELECTED_CLASS, true ) || anyCssClassChanges;
    }

    ( window as any ).$gleamInspected = domPeer;

    if ( isNonNullish( domPeer ) ) {
        console.log( inspectDomPeer( domPeer ) );
    }

    return anyCssClassChanges;
}

export interface Inspectable {
    PEER: HTMLElement;
    SITE?: { [ key: string ]: unknown };
    contraption?: Inspectable | Array<Inspectable>;
    layout?: Inspectable | Array<Inspectable>;
    style?: { [ key: string ]: unknown };
    subtrees?: Array<Inspectable>;
    other?: Array<Inspectable>;
}

export function inspectGleamPeer( gleamPeer: { peer: Readonly<DomPeer> } ): Array<Inspectable> {
    return inspectDomPeer( gleamPeer.peer );
}

export function inspectDomPeer( domPeer: Readonly<DomPeer> ): Array<Inspectable> {
    // TODO: We could reuse subtrees here, if there's a noticeable benefit to doing so
    return [ ...getDomPeerStack( domPeer ) ].map( doInspectDomPeer );
}

export function* getDomPeerStack( element: Readonly<HTMLElement> | null | undefined ): IterableIterator<DomPeer> {
    if ( isDomPeer( element ) ) {
        yield* getDomPeerStack( element.parentElement );
        yield element;
    }
}

function doInspectDomPeer( domPeer: DomPeer ): Inspectable {
    const result: Inspectable = {
        PEER: domPeer,
    };

    const { gleamPeer } = domPeer;

    if ( isPane( gleamPeer ) ) {
        const site = doInspectSite( gleamPeer );
        if ( Object.entries( site ).length > 0 ) {
            result.SITE = site;
        }
    }

    const style = doInspectStyle( gleamPeer );
    if ( Object.entries( style ).length > 0 ) {
        result.style = style;
    }

    const contraptions = new Array<Inspectable>( );
    const layouts = new Array<Inspectable>( );
    const subtrees = new ArrayWithZIndices<Inspectable>( );
    const other = new Array<Inspectable>( );
    for ( const domChild of domPeer.children ) {
        if ( isDomPeer( domChild ) ) {
            const gleamChild = domChild.gleamPeer;
            const inspectableChild = doInspectDomPeer( domChild );
            switch ( domChild.gleamType ) {
                case PeerType.CONTRAPTION:
                    contraptions.push( inspectableChild );
                    break;

                case PeerType.LAYOUT:
                    layouts.push( inspectableChild );
                    break;

                case PeerType.PANE:
                case PeerType.PAINTER:
                    if ( !domChild.classList.contains( 'inspect-highlight' ) ) {
                        const zIndex = getZIndex( gleamPeer, gleamChild );
                        if ( isDefined( zIndex ) ) {
                            if ( !isDefined( inspectableChild.SITE ) ) {
                                inspectableChild.SITE = {};
                            }
                            inspectableChild.SITE.Z_INDEX = zIndex;
                        }
                        subtrees.add( inspectableChild, zIndex );
                    }
                    break;

                case PeerType.OTHER:
                    other.push( inspectableChild );
                    break;
            }
        }
    }

    switch ( contraptions.length ) {
        case 0: break;
        case 1: result.contraption = contraptions[0]; break;
        default: result.contraption = contraptions;
    }

    switch ( layouts.length ) {
        case 0: break;
        case 1: result.layout = layouts[0]; break;
        default: result.layout = layouts;
    }

    const subtrees2 = [ ...subtrees ];
    switch ( subtrees2.length ) {
        case 0: break;
        default: result.subtrees = subtrees2;
    }

    switch ( other.length ) {
        case 0: break;
        default: result.other = other;
    }

    return result;
}

function getZIndex( gleamParent: any, gleamChild: any ): number | undefined {
    if ( isfn( gleamParent.hasPane ) && isfn( gleamParent.getPaneZIndex ) && gleamParent.hasPane( gleamChild ) ) {
        return gleamParent.getPaneZIndex( gleamChild );
    }
    else if ( isfn( gleamParent.hasPainter ) && isfn( gleamParent.getPainterZIndex ) && gleamParent.hasPainter( gleamChild ) ) {
        return gleamParent.getPainterZIndex( gleamChild );
    }
    else {
        return undefined;
    }
}

function doInspectSite( pane: Pane ): { [ key: string ]: unknown } {
    const result: { [ key: string ]: unknown } = {};

    const viewport_PX = pane.getViewport_PX( );
    result.VIEWPORT_PX = {
        x: viewport_PX.xMin,
        y: viewport_PX.yMin,
        w: viewport_PX.w,
        h: viewport_PX.h,
    };

    const parent = pane.getParent( );
    if ( parent ) {
        for ( const [ key, prop ] of Object.entries( parent.layout ) ) {
            if ( isUnboundStyleProp( prop ) ) {
                result[ prop.name ] = prop.get( pane.siteInParentStyle, pane.siteInParentOverrides[ key ] );
            }
        }
    }

    return result;
}

function doInspectStyle( gleamPeer: unknown ): { [ key: string ]: unknown } {
    const result: { [ key: string ]: unknown } = {};
    if ( isobj( gleamPeer ) ) {
        for ( const [ _, prop ] of Object.entries( gleamPeer ) ) {
            if ( isStyleProp( prop ) ) {
                result[ prop.name ] = formatStyleValue( prop.get( ) );
            }
        }
    }
    return result;
}

function formatStyleValue( v: any ): unknown {
    if ( isDefined( v?.cssString ) ) {
        return v.cssString;
    }
    if ( isNumber( v?.top ) && isNumber( v?.right ) && isNumber( v?.bottom ) && isNumber( v?.left ) ) {
        return `${v.top} ${v.right} ${v.bottom} ${v.left}`;
    }
    else {
        return v;
    }
}

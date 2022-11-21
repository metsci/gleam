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
import { appendChild, Disposer, Supplier } from '@metsci/gleam-util';
import { attachAxisInputHandlers1D, attachAxisViewportUpdater1D, Axis1D, createAxisZoomersAndPanners1D, createTagsInputHandler1D, maskedInputHandler, Painter, Pane, TagMap, Ticker } from '../core';
import { ChildlessLayout } from '../layouts/childlessLayout';
import { AxisPainter } from '../painters/axisPainter';
import { BarAxisPainter } from '../painters/barAxisPainter';
import { createDomPeer, cssFloat, currentDpr, EAST, Edge, getOrthogonalDim, PeerType, StyleProp, tagCoordsFn, TextAtlasCache, WEST, X, Y } from '../support';
import { LinearTicker } from '../tickers/linearTicker';

export class EdgeAxisWidget {
    readonly axis: Axis1D;
    readonly axisType: X | Y;
    readonly painter: AxisPainter;
    readonly pane: Pane;

    /**
     * The `labelEdge` arg indicates which edge of the pane the axis label will be on.
     */
    constructor(
        axis: Axis1D,
        labelEdge: Edge,
        options?: {
            createTicker?: Supplier<Ticker>,
            textAtlasCache?: TextAtlasCache,
        },
    ) {
        this.axis = axis;

        this.painter = new AxisPainter(
            this.axis,
            labelEdge,
            options?.createTicker ?? ( ( ) => new LinearTicker( ) ),
            options?.textAtlasCache,
        );

        // TODO: Use layout.prepFns to avoid calling painter.getPrefSize() twice
        const layout = new ChildlessLayout( );
        layout.prefWidth_LPX.getOverride = ( ) => this.painter.getPrefSize_PX( ).w / currentDpr( this.pane );
        layout.prefHeight_LPX.getOverride = ( ) => this.painter.getPrefSize_PX( ).h / currentDpr( this.pane );

        this.axisType = ( labelEdge === EAST || labelEdge === WEST ? Y : X );
        this.pane = new Pane( layout );
        this.pane.addCssClass( 'edge-axis' );
        this.pane.addCssClass( `${( this.axisType === Y ? 'y' : 'x' )}-edge-axis` );
        this.pane.addPainter( this.painter );
        attachAxisInputHandlers1D( this.pane, this.axis, this.axisType );
    }

    /**
     * Convenience wrapper around `attachAxisViewportUpdater1D`, for simple cases.
     * For complicated cases, call `attachAxisViewportUpdater1D()` directly.
     */
    attachAxisViewportUpdater( plotCenterPane: Pane ): Disposer {
        return attachAxisViewportUpdater1D( plotCenterPane, this.axis, this.axisType );
    }

    get ticker( ): Ticker {
        return this.painter.ticker;
    }
}

export class BarAxisWidget {
    readonly peer = createDomPeer( 'bar-axis-widget', this, PeerType.CONTRAPTION );
    readonly style = window.getComputedStyle( this.peer );

    readonly axisInset_LPX = StyleProp.create( this.style, '--axis-inset-px', cssFloat, 0 );

    readonly axis: Axis1D;
    readonly axisType: X | Y;
    readonly painter: BarAxisPainter;
    readonly pane: Pane;

    /**
     * The `ticksEdge` arg determines which edge of the pane the ticks will face.
     */
    constructor(
        axis: Axis1D,
        labelEdge: Edge,
        options?: {
            createTicker?: Supplier<Ticker>,
            tags?: TagMap,
            barPainters?: Iterable<Painter>,
            textAtlasCache?: TextAtlasCache,
        },
    ) {
        this.axis = axis;

        this.painter = new BarAxisPainter(
            this.axis,
            labelEdge,
            options?.createTicker ?? ( ( ) => new LinearTicker( ) ),
            options?.tags && tagCoordsFn( options.tags ),
            options?.barPainters,
            options?.textAtlasCache,
        );

        // TODO: Use layout.prepFns to avoid calling painter.getPrefSize() twice
        const layout = new ChildlessLayout( );
        layout.prefWidth_LPX.getOverride = ( ) => this.painter.getPrefSize_PX( ).w / currentDpr( this.pane );
        layout.prefHeight_LPX.getOverride = ( ) => this.painter.getPrefSize_PX( ).h / currentDpr( this.pane );

        this.axisType = ( labelEdge === EAST || labelEdge === WEST ? Y : X );
        this.pane = new Pane( layout );
        appendChild( this.pane.peer, this.peer );
        this.pane.addCssClass( 'bar-axis' );
        this.pane.addCssClass( `${( this.axisType === Y ? 'y' : 'x' )}-bar-axis` );
        this.pane.addPainter( this.painter );

        const axisInputHandler = createAxisZoomersAndPanners1D( this.axis, this.axisType );
        this.pane.addInputHandler( maskedInputHandler( axisInputHandler, ev => {
            return this.axis.viewport_PX.containsPoint( ev.loc_PX[ this.axisType ] );
        } ) );

        if ( options?.tags ) {
            const tagsInputHandler = createTagsInputHandler1D( axis, this.axisType, options.tags, true, ( ) => {
                return this.painter.ticker.getTicks( axis ).majorTicks;
            } );
            this.pane.addInputHandler( maskedInputHandler( tagsInputHandler, ev => {
                const d = getOrthogonalDim( this.axisType );
                return this.painter.tagsMouseArea_PX[ d ].containsPoint( ev.loc_PX[ d ] );
            } ) );
        }
    }

    /**
     * Convenience wrapper around `attachAxisViewportUpdater1D`, for simple cases.
     * For complicated cases, call `attachAxisViewportUpdater1D()` directly.
     */
    attachAxisViewportUpdater( plotCenterPane: Pane ): Disposer {
        return attachAxisViewportUpdater1D( plotCenterPane, this.axis, this.axisType, ( ) => this.axisInset_LPX.get( ) );
    }

    get ticker( ): Ticker {
        return this.painter.ticker;
    }
}

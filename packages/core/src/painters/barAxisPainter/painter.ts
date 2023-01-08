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
import { appendChild, Disposer, DisposerGroup, Interval2D, RefBasic, Size2D, Supplier, tripleEquals } from '@metsci/gleam-util';
import { Axis1D, Context, Painter, Ticker } from '../../core';
import { createDomPeer, cssFloat, currentDpr, EAST, Edge, getOppositeEdge, glViewport, NORTH, PeerType, SOUTH, StyleProp, TextAtlasCache, WEST } from '../../support';
import { ArrayWithZIndices, frozenSupplier } from '../../util';
import { AxisPainter } from '../axisPainter';
import { TagsPainter } from '../axisTagsPainter';
import { FillPainter } from '../fillPainter';
import { GridPainter } from '../gridPainter';
import { PlotBorderPainter } from '../plotBorderPainter';

export class BarAxisPainter implements Painter {
    readonly peer = createDomPeer( 'bar-axis-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly edgeOffset_LPX = StyleProp.create( this.style, '--edge-offset-px', cssFloat, 10 );
    readonly barWidth_LPX = StyleProp.create( this.style, '--bar-width-px', cssFloat, 11 );

    readonly visible = new RefBasic( true, tripleEquals );

    protected readonly axis: Axis1D;
    protected readonly labelEdge: Edge;
    protected readonly labelsPainter: AxisPainter;
    protected readonly tagsPainter: TagsPainter;
    protected readonly borderPainter: PlotBorderPainter;
    protected readonly barBackgroundPainter: FillPainter;
    protected readonly barPainters: ArrayWithZIndices<Painter>;

    protected recentTagsMouseArea_PX: Interval2D;

    constructor(
        axis: Axis1D,
        labelEdge: Edge,
        createTicker: Supplier<Ticker>,
        tagCoordsFn: Supplier<Iterable<number>> = frozenSupplier( [] ),
        barPainters: Iterable<Painter> = [],
        textAtlasCache?: TextAtlasCache,
    ) {
        this.axis = axis;
        this.labelEdge = labelEdge;

        this.labelsPainter = new AxisPainter( this.axis, labelEdge, createTicker, textAtlasCache );
        appendChild( this.peer, this.labelsPainter.peer );

        this.tagsPainter = new TagsPainter( axis, getOppositeEdge( labelEdge ), tagCoordsFn );
        appendChild( this.peer, this.tagsPainter.peer );

        this.borderPainter = new PlotBorderPainter( frozenSupplier( Interval2D.ZERO ) );
        appendChild( this.peer, this.borderPainter.peer );

        this.barPainters = new ArrayWithZIndices( );

        this.barBackgroundPainter = new FillPainter( );
        this.barBackgroundPainter.peer.classList.add( 'background' );
        this.addBarPainter( this.barBackgroundPainter, -1e3 );

        const axisIsVertical = ( this.labelEdge === EAST || this.labelEdge === WEST );
        const gridPainter = ( axisIsVertical
                              ? new GridPainter( null, this.axis, null, this.labelsPainter.ticker )
                              : new GridPainter( this.axis, null, this.labelsPainter.ticker, null ) );
        this.addBarPainter( gridPainter, +1e3 );

        for ( const painter of barPainters ) {
            this.addBarPainter( painter );
        }

        this.recentTagsMouseArea_PX = Interval2D.ZERO;
    }

    get ticker( ): Ticker {
        return this.labelsPainter.ticker;
    }

    set tagCoordsFn( tagCoordsFn: Supplier<Iterable<number>> ) {
        this.tagsPainter.tagCoordsFn = tagCoordsFn;
    }

    addBarPainter( painter: Painter, zIndex: number = 0 ): Disposer {
        const disposers = new DisposerGroup( );
        disposers.add( appendChild( this.peer, painter.peer ) );
        disposers.add( this.barPainters.add( painter, zIndex ) );
        return disposers;
    }

    setBarPainterZIndex( painter: Painter, zIndex: number ): void {
        this.barPainters.setZIndex( painter, zIndex );
    }

    hasBarPainter( painter: Painter ): boolean {
        return this.barPainters.has( painter );
    }

    getBarPainterZIndex( painter: Painter ): number {
        return this.barPainters.getZIndex( painter );
    }

    /**
     * Intended for use by `gleamInspect()`.
     */
    hasPainter( painter: Painter ): boolean {
        switch ( painter ) {
            case this.labelsPainter: return true;
            case this.tagsPainter: return true;
            case this.borderPainter: return true;
            case this.barBackgroundPainter: return true;
            default: return this.hasBarPainter( painter );
        }
    }

    /**
     * Intended for use by `gleamInspect()`.
     */
    getPainterZIndex( painter: Painter ): number | undefined {
        return ( this.hasBarPainter( painter ) ? this.getBarPainterZIndex( painter ) : undefined );
    }

    get tagsMouseArea_PX( ): Interval2D {
        return this.recentTagsMouseArea_PX;
    }

    getPrefSize_PX( ): Size2D {
        const edgeOffset_LPX = this.edgeOffset_LPX.get( );
        const barWidth_LPX = this.barWidth_LPX.get( );

        const dpr = currentDpr( this );
        const edgeOffset_PX = Math.round( edgeOffset_LPX * dpr );
        const barWidth_PX = Math.round( barWidth_LPX * dpr );

        if ( this.labelEdge === NORTH || this.labelEdge === SOUTH ) {
            const prefHeight_PX = edgeOffset_PX + barWidth_PX + this.labelsPainter.getPrefSize_PX( ).h;
            return new Size2D( 0, prefHeight_PX );
        }
        else {
            const prefWidth_PX = edgeOffset_PX + barWidth_PX + this.labelsPainter.getPrefSize_PX( ).w;
            return new Size2D( prefWidth_PX, 0 );
        }
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        const gl = context.gl;
        try {
            const edgeOffset_LPX = this.edgeOffset_LPX.get( );
            const barWidth_LPX = this.barWidth_LPX.get( );

            const dpr = currentDpr( this );
            const edgeOffset_PX = Math.round( edgeOffset_LPX * dpr );
            const barWidth_PX = Math.round( barWidth_LPX * dpr );

            let barViewport_PX;
            let labelsViewport_PX;
            let tagsViewport_PX;
            let tagsMouseArea_PX;
            switch ( this.labelEdge ) {
                case NORTH:
                    barViewport_PX = Interval2D.fromEdges( this.axis.viewport_PX.min, this.axis.viewport_PX.max, viewport_PX.y.min + edgeOffset_PX, viewport_PX.y.min + ( edgeOffset_PX + barWidth_PX ) );
                    labelsViewport_PX = viewport_PX.withYEdges( barViewport_PX.yMax, viewport_PX.yMax );
                    tagsViewport_PX = viewport_PX.withYEdges( viewport_PX.yMin, barViewport_PX.yMax );
                    tagsMouseArea_PX = tagsViewport_PX.withXEdges( barViewport_PX.xMin, barViewport_PX.xMax );
                    break;

                case SOUTH:
                    barViewport_PX = Interval2D.fromEdges( this.axis.viewport_PX.min, this.axis.viewport_PX.max, viewport_PX.y.max - ( edgeOffset_PX + barWidth_PX ), viewport_PX.y.max - edgeOffset_PX );
                    labelsViewport_PX = viewport_PX.withYEdges( viewport_PX.yMin, barViewport_PX.yMin );
                    tagsViewport_PX = viewport_PX.withYEdges( barViewport_PX.yMin, viewport_PX.yMax );
                    tagsMouseArea_PX = tagsViewport_PX.withXEdges( barViewport_PX.xMin, barViewport_PX.xMax );
                    break;

                case EAST:
                    barViewport_PX = Interval2D.fromEdges( viewport_PX.x.min + edgeOffset_PX, viewport_PX.x.min + ( edgeOffset_PX + barWidth_PX ), this.axis.viewport_PX.min, this.axis.viewport_PX.max );
                    labelsViewport_PX = viewport_PX.withXEdges( barViewport_PX.xMax, viewport_PX.xMax );
                    tagsViewport_PX = viewport_PX.withXEdges( viewport_PX.xMin, barViewport_PX.xMax );
                    tagsMouseArea_PX = tagsViewport_PX.withYEdges( barViewport_PX.yMin, barViewport_PX.yMax );
                    break;

                case WEST:
                    barViewport_PX = Interval2D.fromEdges( viewport_PX.x.max - ( edgeOffset_PX + barWidth_PX ), viewport_PX.x.max - edgeOffset_PX, this.axis.viewport_PX.min, this.axis.viewport_PX.max );
                    labelsViewport_PX = viewport_PX.withXEdges( viewport_PX.xMin, barViewport_PX.xMin );
                    tagsViewport_PX = viewport_PX.withXEdges( barViewport_PX.xMin, viewport_PX.xMax );
                    tagsMouseArea_PX = tagsViewport_PX.withYEdges( barViewport_PX.yMin, barViewport_PX.yMax );
                    break;

                default:
                    throw new Error( 'Unrecognized edge: ' + this.labelEdge );
            }

            if ( barViewport_PX.w > 0 && barViewport_PX.h > 0 ) {
                glViewport( gl, barViewport_PX );
                for ( const barPainter of this.barPainters ) {
                    barPainter.paint( context, barViewport_PX );
                }
            }

            if ( viewport_PX.w > 0 && viewport_PX.h > 0 ) {
                glViewport( gl, viewport_PX );
                this.borderPainter.axisViewportFn_PX = frozenSupplier( barViewport_PX );
                this.borderPainter.paint( context, viewport_PX );
            }

            if ( labelsViewport_PX.w > 0 && labelsViewport_PX.h > 0 ) {
                glViewport( gl, labelsViewport_PX );
                this.labelsPainter.paint( context, labelsViewport_PX );
            }

            if ( tagsViewport_PX.w > 0 && tagsViewport_PX.h > 0 ) {
                glViewport( gl, tagsViewport_PX );
                this.tagsPainter.paint( context, tagsViewport_PX );
            }

            this.recentTagsMouseArea_PX = tagsMouseArea_PX;
        }
        finally {
            glViewport( gl, viewport_PX );
        }
    }

    dispose( context: Context ): void {
        this.labelsPainter.dispose( context );
        this.tagsPainter.dispose( context );
        for ( const barPainter of this.barPainters ) {
            barPainter.dispose( context );
        }
        this.barPainters.clear( );
    }
}

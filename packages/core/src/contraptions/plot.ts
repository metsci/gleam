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
import { Disposer, DisposerGroup, doTxn } from '@metsci/gleam-util';
import { Axis1D, Axis2D, createAxisZoomerAndPanner2D, createAxisZoomersAndPanners1D, maskedInputHandler, Painter, Pane } from '../core';
import { GridLayout, setGridCoords } from '../layouts/gridLayout';
import { InsetLayout } from '../layouts/insetLayout';
import { PlotBorderPainter } from '../painters/plotBorderPainter';
import { createInset, currentDpr, E, EAST, Edge, getOrthogonalDim, N, NORTH, paneViewportFn_PX, S, SOUTH, W, WEST, X, Y } from '../support';

export function getEdgeAxisType( edge: Edge ): X | Y {
    switch ( edge ) {
        case NORTH: return X;
        case SOUTH: return X;
        case EAST: return Y;
        case WEST: return Y;
    }
}

const Z_INDEX_EDGE_AXIS = 0;
const Z_INDEX_CORNER = +10;
const Z_INDEX_BAR_AXIS = +20;
const Z_INDEX_BORDER = +999;

export class Plot {
    readonly centerPane: Pane;

    readonly paddedLayout: InsetLayout;
    readonly paddedPane: Pane;

    readonly gridLayout: GridLayout;
    readonly pane: Pane;

    protected nextNorthPaneIndex: number;
    protected nextSouthPaneIndex: number;
    protected nextEastPaneIndex: number;
    protected nextWestPaneIndex: number;

    constructor( ) {
        this.gridLayout = new GridLayout( );
        this.pane = new Pane( this.gridLayout );

        this.centerPane = new Pane( );
        this.centerPane.addCssClass( 'plot-center' );

        const plotBorderPainter = new PlotBorderPainter( paneViewportFn_PX( this.centerPane ) );
        this.pane.addPainter( plotBorderPainter, Z_INDEX_BORDER );

        this.paddedLayout = new InsetLayout( );
        this.paddedLayout.inset_LPX.getOverride = ( ) => {
            const dpr = currentDpr( this.pane );
            const borderWidth_PX = Math.round( plotBorderPainter.width_LPX.get( ) * dpr );
            const borderOutward_LPX = ( borderWidth_PX >> 1 ) / dpr;
            return createInset( borderOutward_LPX );
        };
        this.paddedPane = new Pane( this.paddedLayout );
        this.paddedPane.addCssClass( 'plot-padded' );
        this.paddedPane.siteInParentOverrides.rowHeight = ( ) => 'flex(0,pref)';
        this.paddedPane.siteInParentOverrides.columnWidth = ( ) => 'flex(0,pref)';
        this.gridLayout.visibleRowKeys.addLast( 'Center' );
        this.gridLayout.visibleColumnKeys.addLast( 'Center' );
        setGridCoords( this.paddedPane, 'Center', 'Center' );
        this.paddedPane.addPane( this.centerPane, +999 );
        this.pane.addPane( this.paddedPane );

        this.nextNorthPaneIndex = 0;
        this.nextSouthPaneIndex = 0;
        this.nextEastPaneIndex = 0;
        this.nextWestPaneIndex = 0;
    }

    addCenterPainter( painter: Painter ): Disposer {
        return this.centerPane.addPainter( painter );
    }

    addEdgePane( pane: Pane, labelEdge: Edge, zIndex: number = 0 ): Disposer {
        const disposers = new DisposerGroup( );

        let rowKey = 'ALL';
        let columnKey = 'ALL';
        switch ( labelEdge ) {
            case NORTH: {
                rowKey = `North${this.nextNorthPaneIndex++}`;
                this.gridLayout.visibleRowKeys.addLast( rowKey );
                disposers.add( ( ) => this.gridLayout.visibleRowKeys.delete( rowKey ) );
                disposers.add( pane.addCssClass( `plot-north-edge` ) );
            }
            break;

            case SOUTH: {
                rowKey = `South${this.nextSouthPaneIndex++}`;
                this.gridLayout.visibleRowKeys.addFirst( rowKey );
                disposers.add( ( ) => this.gridLayout.visibleRowKeys.delete( rowKey ) );
                disposers.add( pane.addCssClass( `plot-south-edge` ) );
            }
            break;

            case EAST: {
                columnKey = `East${this.nextEastPaneIndex++}`;
                this.gridLayout.visibleColumnKeys.addLast( columnKey );
                disposers.add( ( ) => this.gridLayout.visibleColumnKeys.delete( columnKey ) );
                disposers.add( pane.addCssClass( `plot-east-edge` ) );
            }
            break;

            case WEST: {
                columnKey = `West${this.nextWestPaneIndex++}`;
                this.gridLayout.visibleColumnKeys.addFirst( columnKey );
                disposers.add( ( ) => this.gridLayout.visibleColumnKeys.delete( columnKey ) );
                disposers.add( pane.addCssClass( `plot-west-edge` ) );
            }
            break;
        }
        setGridCoords( pane, rowKey, columnKey );
        disposers.add( ( ) => setGridCoords( pane, undefined, undefined ) );
        disposers.add( this.pane.addPane( pane, zIndex ) );

        return disposers;
    }

    /**
     * `controlFromCenter` indicates whether mouse events in the plot-center will affect this axis.
     * This should usually be `true`, but there are cases where you want a scroll/drag in the center
     * to zoom/pan one axis but not the other -- e.g. so that scrolling/dragging a timeline plot will
     * zoom/pan only the time axis.
     */
    addEdgeAxis1D( axisWidget: { axis: Axis1D, axisType: X|Y, pane: Pane }, plotEdge: Edge, controlFromCenter: boolean = true ): Disposer {
        const disposers = new DisposerGroup( );

        disposers.add( this.addEdgePane( axisWidget.pane, plotEdge, Z_INDEX_EDGE_AXIS ) );

        if ( controlFromCenter ) {
            const centerInputHandler = createAxisZoomersAndPanners1D( axisWidget.axis, axisWidget.axisType );
            disposers.add( this.centerPane.addInputHandler( centerInputHandler ) );
            disposers.add( this.paddedPane.addInputHandler( centerInputHandler ) );
            disposers.add( this.pane.addInputHandler( maskedInputHandler( centerInputHandler, ev => {
                const parallelDim = axisWidget.axisType;
                const orthogonalDim = getOrthogonalDim( parallelDim );
                return ( !this.paddedPane.getScissor_PX( )[ parallelDim ].containsPoint( ev.loc_PX[ parallelDim ] )
                      && axisWidget.pane.getScissor_PX( )[ orthogonalDim ].containsPoint( ev.loc_PX[ orthogonalDim ] ) );
            } ), Z_INDEX_CORNER ) );
        }

        return disposers;
    }

    addEdgeAxis2D( xAxisWidget: { axis: Axis1D, pane: Pane }, xPlotEdge: N|S, yAxisWidget: { axis: Axis1D, pane: Pane }, yPlotEdge: E|W ): Disposer {
        const disposers = new DisposerGroup( );

        disposers.add( this.addEdgePane( xAxisWidget.pane, xPlotEdge, Z_INDEX_EDGE_AXIS ) );
        disposers.add( this.addEdgePane( yAxisWidget.pane, yPlotEdge, Z_INDEX_EDGE_AXIS ) );

        const centerInputHandler = createAxisZoomerAndPanner2D( new Axis2D( xAxisWidget.axis, yAxisWidget.axis ) );
        disposers.add( this.centerPane.addInputHandler( centerInputHandler ) );
        disposers.add( this.paddedPane.addInputHandler( centerInputHandler ) );
        disposers.add( this.pane.addInputHandler( maskedInputHandler( centerInputHandler, ev => {
            return ( xAxisWidget.pane.getScissor_PX( ).y.containsPoint( ev.loc_PX.y )
                  && yAxisWidget.pane.getScissor_PX( ).x.containsPoint( ev.loc_PX.x ) );
        } ), Z_INDEX_CORNER ) );

        return disposers;
    }

    addBarAxis1D( axisWidget: { axis: Axis1D, pane: Pane }, edge: Edge ): Disposer {
        const disposers = new DisposerGroup( );

        disposers.add( this.addEdgePane( axisWidget.pane, edge, Z_INDEX_BAR_AXIS ) );

        return disposers;
    }

    attachAxisViewportUpdaters( ...axisWidgets: ReadonlyArray<{ attachAxisViewportUpdater: ( centerPane: Pane ) => Disposer, pane: Pane }> ): Disposer {
        const disposers = new DisposerGroup( );
        doTxn( ( ) => {
            for ( const axisWidget of axisWidgets ) {
                disposers.add( axisWidget.attachAxisViewportUpdater( this.centerPane ) );
            }
        } );
        return disposers;
    }
}

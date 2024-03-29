import { addCssLink, attachPane, axisBoundsFn, BasicLinePainter, createCommonBoundsAxis2D, createInsetPane, EdgeAxisWidget, gleamCoreDefaultStyleLoading, GridPainter, LinearTicker, Plot, SOUTH, TextAtlasCache, WEST } from '@metsci/gleam-core';
import { Interval1D, ListenableBasic, requireNonNull, run } from '@metsci/gleam-util';

// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const mainCssUrl = new URL( './main.css', import.meta.url );

run( async ( ) => {
    // Begin loading CSS
    const stylesLoading = Promise.all( [
        gleamCoreDefaultStyleLoading,
        addCssLink( mainCssUrl ),
    ] );

    // Create a listenable that can be fired by application code to trigger a repaint
    const repaint = new ListenableBasic( );

    // Create a shared TextAtlasCache to avoid duplicating text rasterization, which can be slow
    const textAtlasCache = new TextAtlasCache( );

    // Create axes
    const xyAxis = createCommonBoundsAxis2D( );
    xyAxis.set( false, -5, +7, -0.75, +1.75 );
    xyAxis.changes.addListener( ( ) => {
        repaint.fire( );
    } );

    // Constrain the axes to a reasonable range
    xyAxis.x.minConstraint = Interval1D.fromEdges( -42, Number.POSITIVE_INFINITY );
    xyAxis.x.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +52 );
    xyAxis.x.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    xyAxis.y.minConstraint = Interval1D.fromEdges( -42, Number.POSITIVE_INFINITY );
    xyAxis.y.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +42 );
    xyAxis.y.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e4 );
    xyAxis.reconstrain( false );

    // Create a basic plot
    const plot = new Plot( );
    const xAxisWidget = new EdgeAxisWidget( xyAxis.x, SOUTH, {
        createTicker: ( ) => new LinearTicker( 'X' ),
        textAtlasCache,
    } );
    const yAxisWidget = new EdgeAxisWidget( xyAxis.y, WEST, {
        createTicker: ( ) => new LinearTicker( 'Y' ),
        textAtlasCache,
    } );
    plot.addEdgeAxis2D( xAxisWidget, SOUTH, yAxisWidget, WEST );
    plot.attachAxisViewportUpdaters( xAxisWidget, yAxisWidget );

    // Show XY grid lines
    const xyGridPainter = new GridPainter( xyAxis, xAxisWidget.ticker, yAxisWidget.ticker );
    plot.addCenterPainter( xyGridPainter );

    // Show a histogram
    const histogramPainterA = new BasicLinePainter( axisBoundsFn( xyAxis ) );
    const histogramPainterB = new BasicLinePainter( axisBoundsFn( xyAxis ) );
    histogramPainterA.peer.classList.add( 'A' );
    histogramPainterB.peer.classList.add( 'B' );
    histogramPainterA.line = {
        length: 75,
        x: i => 0.1*( i - 38 ),
        y: i => Math.exp( -0.5 * ( 0.1*( i - 38 ) )**2 ),
    };
    histogramPainterB.line = {
        length: 28,
        x: i => 3 + 0.08*( i - 14 ),
        y: i => 0.4*Math.exp( -0.5 * ( 0.4*( i - 14 ) )**2 ),
    };
    plot.addCenterPainter( histogramPainterA );
    plot.addCenterPainter( histogramPainterB );

    // Make the plot visible
    const pane = createInsetPane( plot.pane );
    pane.addCssClass( 'content' );
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, pane, repaint );
} );

import { addCssLink, attachBasicLineInputHandler, attachPane, axisBoundsFn, BasicLinePainter, createCommonBoundsAxis2D, createInsetPane, EdgeAxisWidget, frozenSupplier, gleamCoreDefaultStyleLoading, GridPainter, Interval1D, isBasicLinePoint, LinearTicker, PaneMouseEvent, Plot, SOUTH, TextAtlasCache, TooltipDiv, WEST } from '@metsci/gleam-core';
import { appendChild, ListenableBasic, requireNonNull, run } from '@metsci/gleam-util';

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

    // Create a shared TextAtlasCache to avoid duplicating text rasterization, which can be quite slow
    const textAtlasCache = new TextAtlasCache( );

    // Create axes
    const xyAxis = createCommonBoundsAxis2D( );
    xyAxis.set( false, -1, +11, -3, +3 );
    xyAxis.changes.addListener( ( ) => {
        repaint.fire( );
    } );

    // Constrain the axes to a reasonable range
    xyAxis.x.minConstraint = Interval1D.fromEdges( -42, Number.POSITIVE_INFINITY );
    xyAxis.x.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +52 );
    xyAxis.x.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    xyAxis.y.minConstraint = Interval1D.fromEdges( -42, Number.POSITIVE_INFINITY );
    xyAxis.y.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +42 );
    xyAxis.y.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
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

    // Show a basic line
    const linePainter = new BasicLinePainter( axisBoundsFn( xyAxis ) );
    linePainter.line = {
        length: 101,
        x: i => 0.1*i,
        y: i => Math.sin( Math.PI * 0.1*i ),
        connect: i => ( i % 3 !== 2 ),
    };
    plot.addCenterPainter( linePainter );

    // Use another "line" painter to highlight the hovered dot, when there is one
    const hoverDotPainter = new BasicLinePainter( axisBoundsFn( xyAxis ) );
    hoverDotPainter.peer.classList.add( 'hover-dot' );
    hoverDotPainter.line = undefined;
    plot.addCenterPainter( hoverDotPainter );

    // Hook up an input handler that recognizes the line's points
    attachBasicLineInputHandler( plot.centerPane, xyAxis, linePainter );

    // Handle input events that are aimed at one of the line's points
    const tooltip = new TooltipDiv( );
    plot.centerPane.inputSpectators.add( {
        handleHover( target: unknown, ev: PaneMouseEvent ): void {
            if ( isBasicLinePoint( target ) && target.line === linePainter.line ) {
                const { line, i } = target;
                const [ x, y ] = [ line.x( i ), line.y( i ) ];
                hoverDotPainter.line = {
                    length: 1,
                    x: frozenSupplier( x ),
                    y: frozenSupplier( y ),
                };
                repaint.fire( );
                tooltip.show( ev.loc_PX, `Point ${i}` );
            }
        },
        handleMove( target: unknown, ev: PaneMouseEvent ): void {
            if ( isBasicLinePoint( target ) && target.line === linePainter.line ) {
                tooltip.setPosition( ev.loc_PX );
            }
        },
        handleUnhover( target: unknown, ev: PaneMouseEvent ): void {
            if ( isBasicLinePoint( target ) && target.line === linePainter.line ) {
                hoverDotPainter.line = undefined;
                repaint.fire( );
                tooltip.hide( );
            }
        },
        handleGrab( target: unknown, ev: PaneMouseEvent ): void {
            if ( isBasicLinePoint( target ) && target.line === linePainter.line ) {
                console.log( `Click on Point ${target.i}` );
            }
        },
    } );

    // Make the plot visible
    const pane = createInsetPane( plot.pane );
    pane.addCssClass( 'content' );
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, pane, repaint );
    appendChild( host, tooltip.div );
} );

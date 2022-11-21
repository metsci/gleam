import { addCssLink, attachPane, axisBoundsFn, BarAxisWidget, CET_L04, CET_L06, CET_L07, CET_L08, CET_L17, CET_L19, CET_L20, createCommonBoundsAxis1D, createCommonScaleAxis2D, createInsetPane, createTagOrderConstraint, EAST, EdgeAxisWidget, gleamCoreDefaultStyleLoading, GradientPainter, GridPainter, INFERNO, JET_LEGACY, LinearTicker, onFirstFewLayouts, PLASMA, Plot, ScatterPainter, SolidPainter, SOUTH, tagBoundsFn, TagMap, TextAtlasCache, VIRIDIS, WEST, Y } from '@metsci/gleam-core';
import { activityListenable, IMMEDIATE, ListenableBasic, requireNonNull, run } from '@metsci/gleam-util';
import { generateXycsCoords } from './misc';

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

    // Create axes for x, y, color, and size
    const xyAxis = createCommonScaleAxis2D( );
    const cAxis = createCommonBoundsAxis1D( );
    const sAxis = createCommonBoundsAxis1D( );

    // Create draggable tags for min and max color and size
    const cTags = new TagMap( { min: 0, max: 0 } );
    const sTags = new TagMap( { min: 0, max: 0 } );
    const cTagBoundsFn = tagBoundsFn( cTags, 'min', 'max' );
    const sTagBoundsFn = tagBoundsFn( sTags, 'min', 'max' );

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

    // Add a color axis
    const cGradientPainter = new GradientPainter( Y, axisBoundsFn( cAxis ), cTagBoundsFn );
    const cAxisWidget = new BarAxisWidget( cAxis, WEST, {
        createTicker: ( ) => new LinearTicker( 'Color' ),
        textAtlasCache,
        tags: cTags,
        barPainters: [ cGradientPainter ],
    } );
    plot.addBarAxis1D( cAxisWidget, EAST );
    plot.attachAxisViewportUpdaters( cAxisWidget );

    // Add a size axis
    const sSolidPainter = new SolidPainter( Y, axisBoundsFn( sAxis ), sTagBoundsFn );
    const sAxisWidget = new BarAxisWidget( sAxis, WEST, {
        createTicker: ( ) => new LinearTicker( 'Size' ),
        textAtlasCache,
        tags: sTags,
        barPainters: [ sSolidPainter ],
    } );
    plot.addBarAxis1D( sAxisWidget, EAST );
    plot.attachAxisViewportUpdaters( sAxisWidget );

    // Keep the max size tag at or above the min color tag
    sTags.setConstraint( createTagOrderConstraint( 'min', 'max' ) );

    // Add a scatter painter
    const scatterPainter = new ScatterPainter( axisBoundsFn( xyAxis ), cTagBoundsFn, sTagBoundsFn );
    const scatterCoords = generateXycsCoords( 10000 );
    scatterPainter.setXycsCoords( scatterCoords );
    plot.addCenterPainter( scatterPainter );

    // Allow CSS to refer to some of the CET colormaps (increases bundle size)
    plot.pane.enableColorTables( [ INFERNO, PLASMA, VIRIDIS, JET_LEGACY, CET_L04, CET_L06, CET_L07, CET_L08, CET_L17, CET_L19, CET_L20 ] );

    // Repaint when the axes or tags change
    const changes = activityListenable( xyAxis, cAxis, sAxis, cTags, sTags );
    changes.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } );

    // Initialize axes as soon as they have meaningful pixel sizes
    onFirstFewLayouts( plot.pane, 5, ( ) => {
        xyAxis.set( false, -1, 2*Math.PI + 1, -2.5, +1.5 );
        cAxis.set( false, -1.65, +1.65 );
        sAxis.set( false, -0.15, +1.15 );
        cTags.set( false, { min: -1.5, max: +1.5 } );
        sTags.set( false, { min: 0, max: 1 } );
    } );

    // Make the plot visible
    const pane = createInsetPane( plot.pane );
    pane.addCssClass( 'content' );
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, pane, repaint );
} );

import { addCssLink, attachPane, axisBoundsFn, BarAxisWidget, CET_L03, CET_L06, CET_L07, CET_L19, CET_R1, CET_R2, createCommonBoundsAxis1D, createCommonBoundsAxis2D, createInsetPane, EAST, EdgeAxisWidget, gleamCoreDefaultStyleLoading, GradientPainter, GridPainter, HeatmapPainter, INFERNO, LinearMesh, LinearTicker, PLASMA, Plot, SOUTH, tagBoundsFn, TagMap, TextAtlasCache, VIRIDIS, WEST, Y } from '@metsci/gleam-core';
import { activityListenable, IMMEDIATE, ListenableBasic, requireNonNull, run } from '@metsci/gleam-util';
import { generateSurface } from './misc';

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

    // Create spatial axes
    const xyAxis = createCommonBoundsAxis2D( );
    xyAxis.set( false, -13, +13, -13, +13 );

    // Create color axis
    const cAxis = createCommonBoundsAxis1D( );
    const cTags = new TagMap( { min: 0, max: 0 } );
    cAxis.set( false, -12, +62 );
    cTags.set( false, { min: 0, max: 50 } );
    const cTagBoundsFn = tagBoundsFn( cTags, 'min', 'max' );

    // Repaint when the axes or tags change
    const changes = activityListenable( xyAxis, cAxis, cTags );
    changes.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } );

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

    // Show XY grid lines
    const xyGridPainter = new GridPainter( xyAxis, xAxisWidget.ticker, yAxisWidget.ticker );
    plot.addCenterPainter( xyGridPainter );

    // Add a heatmap
    const heatmapPainter = new HeatmapPainter( );
    heatmapPainter.xyBoundsFn = axisBoundsFn( xyAxis );
    heatmapPainter.colorBoundsFn = cTagBoundsFn;
    // heatmapPainter.setMesh( new AxisAlignedLinearMesh( Interval2D.fromEdges( -10, +10, -10, +10 ) ) );
    heatmapPainter.setMesh( new LinearMesh( [-10,-10], [0,+20], [+20,0] ) );
    heatmapPainter.setSurface( generateSurface( ) );
    plot.addCenterPainter( heatmapPainter );

    // Allow CSS to refer to some of the CET colormaps (increases bundle size)
    plot.pane.enableColorTables( [ INFERNO, PLASMA, VIRIDIS, CET_L03, CET_L06, CET_L07, CET_L19, CET_R1, CET_R2 ] );

    // Make the plot visible
    const pane = createInsetPane( plot.pane );
    pane.addCssClass( 'content' );
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, pane, repaint );
} );

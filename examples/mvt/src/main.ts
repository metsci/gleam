import { addCssLink, attachAxisInputHandlers2D, attachAxisViewportUpdater2D, attachPane, axisBoundsFn, createCommonScaleAxis2D, gleamCoreDefaultStyleLoading, lockScaleRatio, Pane } from '@metsci/gleam-core';
import { addMvtAttributionElement, createCacheWorkerPool, createRenderGroupsFactory, fetchTileSetToc, gleamMvtDefaultStyleLoading, MvtCache, MvtPainter } from '@metsci/gleam-mvt';
import { Interval1D, ListenableBasic, MERCATOR_PROJ, requireNonNull, run } from '@metsci/gleam-util';

const { PI } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;

// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const mainCssUrl = new URL( './main.css', import.meta.url );

run( async ( ) => {
    // Begin loading CSS
    const stylesLoading = Promise.all( [
        gleamCoreDefaultStyleLoading,
        gleamMvtDefaultStyleLoading,
        addCssLink( mainCssUrl ),
    ] );

    // Create a listenable that can be fired by application code to trigger a repaint
    const repaint = new ListenableBasic( );

    // Create axes
    const proj = MERCATOR_PROJ;
    const xyAxis = createCommonScaleAxis2D( );
    lockScaleRatio( xyAxis, 1 );
    xyAxis.y.maxConstraint = Interval1D.fromEdges( NEGATIVE_INFINITY, proj.maxUsableY );
    xyAxis.y.minConstraint = Interval1D.fromEdges( proj.minUsableY, POSITIVE_INFINITY );
    xyAxis.y.scaleConstraint = Interval1D.fromEdges( NEGATIVE_INFINITY, 1e7*proj.maxDLatDY_RAD( ) );
    xyAxis.x.set( false, proj.lonToX( -PI ), proj.lonToX( +PI ) );
    xyAxis.changes.addListener( ( ) => {
        repaint.fire( );
    } );

    // Attach axes to a pane
    const pane = new Pane( );
    attachAxisViewportUpdater2D( pane, xyAxis );
    attachAxisInputHandlers2D( pane, xyAxis );

    // Show MVT tiles
    const mvtTocUrl = '__TILES_JSON_URL__';
    const mvtToc = fetchTileSetToc( mvtTocUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
    } );
    const mvtCreateRenderGroups = createRenderGroupsFactory( createCacheWorkerPool( ) );
    const mvtCache = new MvtCache( mvtToc, mvtCreateRenderGroups );
    mvtCache.attachToRepaint( repaint );
    const mvtPainter = new MvtPainter( mvtCache, proj, axisBoundsFn( xyAxis ) );
    pane.addPainter( mvtPainter );

    // Make the pane visible
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, pane, repaint );
    addMvtAttributionElement( host, mvtToc );
} );

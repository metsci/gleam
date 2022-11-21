import { addCssLink, attachPane, createInsetPane, gleamCoreDefaultStyleLoading, Interval1D, Pane, RowsLayout, TextAtlasCache } from '@metsci/gleam-core';
import { addMvtAttributionElement, createCacheWorkerPool, createRenderGroupsFactory, fetchTileSetToc, MvtCache } from '@metsci/gleam-mvt';
import { gleamTimelineDefaultStyleLoading } from '@metsci/gleam-timeline';
import { appendChild, ListenableBasic, requireNonNull, run, utcTimeToPsec } from '@metsci/gleam-util';
import { TILES_JSON_URL } from './config';
import { attachGeoController } from './geo/controller';
import { GeoView } from './geo/view';
import { Model } from './model';
import { attachTimelineController } from './timeline/controller';
import { TimelineView } from './timeline/view';

// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const mainCssUrl = new URL( './main.css', import.meta.url );

run( async ( ) => {
    // Begin loading MVT toc
    const mvtToc = fetchTileSetToc( TILES_JSON_URL, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
    } );

    // Begin loading CSS
    const stylesLoading = Promise.all( [
        gleamCoreDefaultStyleLoading,
        gleamTimelineDefaultStyleLoading,
        addCssLink( mainCssUrl ),
    ] );

    // Create a model to hold UI state
    const model = new Model( );
    model.xAxisGroup.set( false, 1000, -1, +1 );
    model.yAxisGroup.set( false, 1000, -1, +1 );
    model.xAxisGroup.setScaleRatioLock( model.yAxisGroup, 1 );
    model.zAxisGroup.setBounds( false, Interval1D.fromEdges( -11, +11 ) );
    model.tAxisGroup_PSEC.setBounds( false, Interval1D.fromRect( utcTimeToPsec( 2022,6,14, 23,0,0 ), 26*3600 ) );
    model.tCursor_PSEC.set( false, utcTimeToPsec( 2022,6,15, 7,0,0 ) );

    // Create a listenable that can be fired by application code to trigger a repaint
    const repaint = new ListenableBasic( );

    // Create a shared TextAtlasCache to avoid duplicating text rasterization, which can be quite slow
    const textAtlasCache = new TextAtlasCache( );

    // Geo
    const mvtCreateRenderGroups = createRenderGroupsFactory( createCacheWorkerPool( ) );
    const mvtCache = new MvtCache( mvtToc, mvtCreateRenderGroups );
    mvtCache.attachToRepaint( repaint );
    const geoView = new GeoView( mvtCache );
    attachGeoController( model, geoView, repaint );

    // Timeline
    const timelineView = new TimelineView( textAtlasCache );
    attachTimelineController( model, timelineView, repaint );

    // Main pane
    const mainPane = new Pane( new RowsLayout( ) );
    mainPane.addPane( createInsetPane( timelineView.pane, [ 'timeline-inset' ] ) );
    mainPane.addPane( createInsetPane( geoView.pane, [ 'geo-inset' ] ) );

    // Instructions div
    const instructionsDiv = document.createElement( 'div' );
    instructionsDiv.classList.add( 'instructions' );
    instructionsDiv.innerHTML = '<b>SHIFT+CLICK</b> to add a data point<br><b>DRAG</b> to move a data point';

    // Main div
    await stylesLoading;
    const mainDiv = requireNonNull( document.getElementById( 'main-div' ) );
    attachPane( mainDiv, mainPane, repaint );
    appendChild( mainDiv, instructionsDiv );
    addMvtAttributionElement( mainDiv, mvtToc );
} );

import { Axis1D, Axis2D, AxisAlignedLinearMesh, axisBoundsFn, BarAxisWidget, BasicLinePainter, createCommonBoundsAxis1D, createMinMaxConstraint, createStdTagConstraint, EAST, EdgeAxisWidget, Float32ArraySurface, GradientPainter, GridLayout, HeatmapPainter, Interval1D, LinearTicker, Pane, ScatterPainter, setGridCoords, SolidPainter, tagBoundsFn, TagMap, TextAtlasCache, WEST, Y } from '@metsci/gleam-core';
import { activityListenable, FireableListenable, get, IMMEDIATE, LinkedSet, SECONDS_PER_DAY, utcTimeToPsec } from '@metsci/gleam-util';

export function createLinePlotRowPane( timeAxis_PSEC: Axis1D, repaint: FireableListenable, textAtlasCache: TextAtlasCache ): Pane {
    const yAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -0.6, +0.6 ) );
    yAxis.changes.addListener( ( ) => {
        repaint.fire( );
    } );

    // Constrain the Y axis to a reasonable range
    yAxis.minConstraint = Interval1D.fromEdges( -12, Number.POSITIVE_INFINITY );
    yAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +12 );
    yAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    yAxis.reconstrain( false );

    // Generate line coords, relative to a reference X
    const firstTime_PSEC = utcTimeToPsec( 2021,1,1, 6,0,0 );
    const linePainter = new BasicLinePainter( axisBoundsFn( new Axis2D( timeAxis_PSEC, yAxis ) ) );
    linePainter.line = {
        length: 1000,
        x: i => firstTime_PSEC + ( 3 * 60 * i ),
        y: i => 0.45*Math.sin( Math.PI * 1e-2 * i ),
    };
    const linePane = new Pane( );
    linePane.addPainter( linePainter );

    // Overlay the Y axis along the left edge of the plot
    //
    // GridLayout lays out panes based on their `grid-row--` and `grid-column--` CSS
    // classes. Here those CSS classes are added using the setGridCoords convenience
    // function.
    //
    // GridLayout looks for panes whose row and column keys match the contents of its
    // `visibleRowKeys` and `visibleColumnKeys` fields. The special key `ALL` means to
    // cover all rows or all columns, and the special key `VIEWPORT` means to cover the
    // full viewport height or full viewport width.
    //
    // `linePane` will have CSS classes `grid-row--VIEWPORT` and `grid-column--VIEWPORT`,
    // so it will fill the whole parent pane.
    //
    // `yAxisWidget` will have CSS classes `grid-row--VIEWPORT` and `grid-column--AxisY`,
    // so it will fill the viewport vertically, and will go in the `AxisY` column. Column
    // width will be the preferred width of `yAxisWidget`.
    //
    // Because `yAxisWidget` is added last, it will be drawn in front of `linePane`. The
    // result of all this is a line plot with a y axis overlaid along the left edge.
    //
    // By default, column widths and row heights are set to the preferred sizes of their
    // contents. This can be overridden via CSS.
    //
    const plotLayout = new GridLayout( );
    plotLayout.visibleColumnKeys = new LinkedSet( [ 'AxisY' ] );
    const plotPane = new Pane( plotLayout );
    plotPane.addCssClass( 'line-plot' );
    const yAxisWidget = new EdgeAxisWidget( yAxis, EAST, { textAtlasCache } );
    yAxisWidget.attachAxisViewportUpdater( yAxisWidget.pane );
    setGridCoords( yAxisWidget.pane, 'VIEWPORT', 'AxisY' );
    setGridCoords( linePane, 'VIEWPORT', 'VIEWPORT' );
    plotPane.addPane( linePane );
    plotPane.addPane( yAxisWidget.pane );

    return plotPane;
}

export function createScatterPlotRowPane( timeAxis_PSEC: Axis1D, repaint: FireableListenable, textAtlasCache: TextAtlasCache ): Pane {
    // Create y axis
    const yAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -0.25, +1.05 ) );
    yAxis.minConstraint = Interval1D.fromEdges( -12, Number.POSITIVE_INFINITY );
    yAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +12 );
    yAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    yAxis.reconstrain( false );
    const tyBoundsFn = axisBoundsFn( new Axis2D( timeAxis_PSEC, yAxis ) );

    // Create color axis and tags
    const cAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -1.75, +1.35 ) );
    const cTags = new TagMap( { min: -1.6, max: +1.2 } );
    cTags.setConstraint( createMinMaxConstraint( -100, +100 ) );
    cAxis.minConstraint = Interval1D.fromEdges( -104, Number.POSITIVE_INFINITY );
    cAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +104 );
    cAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    cAxis.reconstrain( false );
    const cTagBoundsFn = tagBoundsFn( cTags, 'min', 'max' );

    // Create size axis and tags
    const sAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -0.055, +1.055 ) );
    const sTags = new TagMap( { min: 0, max: 1 } );
    sTags.setConstraint( createStdTagConstraint( 0, 100, [ 'min', 'max' ] ) );
    sAxis.minConstraint = Interval1D.fromEdges( -2, Number.POSITIVE_INFINITY );
    sAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +102 );
    sAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    const sTagBoundsFn = tagBoundsFn( sTags, 'min', 'max' );

    // Repaint when the axes or tags change
    const changes = activityListenable( yAxis, cAxis, sAxis, cTags, sTags );
    changes.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } );

    // Generate point coords, relative to a reference X
    const refTime_PSEC = utcTimeToPsec( 2021,1,1, 6,0,0 );
    const pointCount = 10000;
    const pointCoords = new Float32Array( 4 * pointCount );
    for ( let i = 0; i < pointCount; i++ ) {
        const r = Math.random( );
        const isBig = ( 10*Math.random( ) < -0.3*Math.log( r ) );

        const x = Math.random( ) * 4*Math.PI;
        const t = 4*3600 + 3 * 3600 * x;
        const y = 0.7 + 0.25*( Math.sin( x ) + 0.3*Math.log( r ) );
        const c = ( isBig ? -1.2 : -1.0 ) * ( Math.cos( x - 0.33 ) + 0.3*( -1 + 2*r ) ) + Math.random( ) - 0.5;
        const s = Math.sqrt( ( isBig ? 1 : 0.2 ) * Math.sqrt( 0.5 + 0.5*Math.sin( 3*c ) ) );

        pointCoords[ 4*i + 0 ] = refTime_PSEC + t;
        pointCoords[ 4*i + 1 ] = y;
        pointCoords[ 4*i + 2 ] = c;
        pointCoords[ 4*i + 3 ] = s;
    }

    // Create a scatter plot
    const scatterPainter = new ScatterPainter( tyBoundsFn, cTagBoundsFn, sTagBoundsFn );
    scatterPainter.setXycsCoords( pointCoords );
    const scatterPane = new Pane( );
    scatterPane.addPainter( scatterPainter );

    // Create a y axis widget
    const yAxisWidget = new EdgeAxisWidget( yAxis, EAST, { textAtlasCache } );
    yAxisWidget.attachAxisViewportUpdater( yAxisWidget.pane );
    setGridCoords( yAxisWidget.pane, 'VIEWPORT', 'AxisY' );

    // Create a spacer to separate east axes from west axes
    const spacerPane = new Pane( );
    setGridCoords( spacerPane, 'VIEWPORT', 'Spacer' );

    // Create a color axis widget
    const cGradientPainter = new GradientPainter( Y, axisBoundsFn( cAxis ), cTagBoundsFn );
    const cAxisWidget = new BarAxisWidget( cAxis, WEST, {
        createTicker: ( ) => new LinearTicker( ),
        textAtlasCache,
        tags: cTags,
        barPainters: [ cGradientPainter ],
    } );
    cAxisWidget.attachAxisViewportUpdater( cAxisWidget.pane );
    setGridCoords( cAxisWidget.pane, 'VIEWPORT', 'AxisC' );

    // Create a size axis widget
    const sSolidPainter = new SolidPainter( Y, axisBoundsFn( sAxis ), sTagBoundsFn );
    const sAxisWidget = new BarAxisWidget( sAxis, WEST, {
        createTicker: ( ) => new LinearTicker( ),
        textAtlasCache,
        tags: sTags,
        barPainters: [ sSolidPainter ],
    } );
    sAxisWidget.attachAxisViewportUpdater( sAxisWidget.pane );
    setGridCoords( sAxisWidget.pane, 'VIEWPORT', 'AxisS' );

    // Assemble a plot from the pieces above
    const plotLayout = new GridLayout( );
    plotLayout.visibleColumnKeys = new LinkedSet( [ 'AxisY', 'Spacer', 'AxisC', 'AxisS' ] );
    const plotPane = new Pane( plotLayout );
    plotPane.addCssClass( 'scatter-plot' );
    setGridCoords( scatterPane, 'VIEWPORT', 'VIEWPORT' );
    plotPane.addPane( scatterPane );
    plotPane.addPane( yAxisWidget.pane );
    plotPane.addPane( spacerPane, Number.NEGATIVE_INFINITY );
    plotPane.addPane( cAxisWidget.pane );
    plotPane.addPane( sAxisWidget.pane );

    return plotPane;
}

export function createHeatmapPlotRowPane( timeAxis_PSEC: Axis1D, repaint: FireableListenable, textAtlasCache: TextAtlasCache ): Pane {
    // Create y axis
    const yAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -11, +11 ) );
    yAxis.minConstraint = Interval1D.fromEdges( -99, Number.POSITIVE_INFINITY );
    yAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +99 );
    yAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    yAxis.reconstrain( false );
    const tyBoundsFn = axisBoundsFn( new Axis2D( timeAxis_PSEC, yAxis ) );

    // Create color axis and tags
    const cAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( -4, +54 ) );
    const cTags = new TagMap( { min: 0, max: 50 } );
    cTags.setConstraint( createMinMaxConstraint( -100, +100 ) );
    cAxis.minConstraint = Interval1D.fromEdges( -104, Number.POSITIVE_INFINITY );
    cAxis.maxConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, +104 );
    cAxis.scaleConstraint = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, 3e3 );
    cAxis.reconstrain( false );
    const cTagBoundsFn = tagBoundsFn( cTags, 'min', 'max' );

    // Repaint when the axes or tags change
    const changes = activityListenable( yAxis, cAxis, cTags );
    changes.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } );

    // Generate point coords, relative to a reference X
    const refTime_PSEC = utcTimeToPsec( 2021,1,1, 6,0,0 );
    const pointCount = 10000;
    const pointCoords = new Float32Array( 4 * pointCount );
    for ( let i = 0; i < pointCount; i++ ) {
        const r = Math.random( );
        const isBig = ( 10*Math.random( ) < -0.3*Math.log( r ) );

        const x = Math.random( ) * 4*Math.PI;
        const t = 4*3600 + 3 * 3600 * x;
        const y = 0.7 + 0.25*( Math.sin( x ) + 0.3*Math.log( r ) );
        const c = ( isBig ? -1.2 : -1.0 ) * ( Math.cos( x - 0.33 ) + 0.3*( -1 + 2*r ) ) + Math.random( ) - 0.5;
        const s = Math.sqrt( ( isBig ? 1 : 0.2 ) * Math.sqrt( 0.5 + 0.5*Math.sin( 3*c ) ) );

        pointCoords[ 4*i + 0 ] = refTime_PSEC + t;
        pointCoords[ 4*i + 1 ] = y;
        pointCoords[ 4*i + 2 ] = c;
        pointCoords[ 4*i + 3 ] = s;
    }

    // Create a heatmap plot
    const heatmapPainter = new HeatmapPainter( tyBoundsFn, cTagBoundsFn );
    heatmapPainter.setMesh( new AxisAlignedLinearMesh( {
        xMin: refTime_PSEC,
        xMax: refTime_PSEC + 2*SECONDS_PER_DAY,
        yMin: -10,
        yMax: +10,
    } ) );
    heatmapPainter.setSurface( get( ( ) => {
        const ni = 250;
        const nj = 250;
        const values = new Float32Array( ni * nj );
        for ( let j = 0; j < nj; j++ ) {
            for ( let i = 0; i < ni; i++ ) {
                values[ j*ni + i ] = 1e-3*( i * j ) + 10*( Math.random( ) - 0.5 );
            }
        }
        return new Float32ArraySurface( ni, nj, values );
    } ) );
    const heatmapPane = new Pane( );
    heatmapPane.addPainter( heatmapPainter );

    // Create a y axis widget
    const yAxisWidget = new EdgeAxisWidget( yAxis, EAST, { textAtlasCache } );
    yAxisWidget.attachAxisViewportUpdater( yAxisWidget.pane );
    setGridCoords( yAxisWidget.pane, 'VIEWPORT', 'AxisY' );

    // Create a spacer to separate east axes from west axes
    const spacerPane = new Pane( );
    setGridCoords( spacerPane, 'VIEWPORT', 'Spacer' );

    // Create a color axis widget
    const cGradientPainter = new GradientPainter( Y, axisBoundsFn( cAxis ), cTagBoundsFn );
    const cAxisWidget = new BarAxisWidget( cAxis, WEST, {
        createTicker: ( ) => new LinearTicker( ),
        textAtlasCache,
        tags: cTags,
        barPainters: [ cGradientPainter ],
    } );
    cAxisWidget.attachAxisViewportUpdater( cAxisWidget.pane );
    setGridCoords( cAxisWidget.pane, 'VIEWPORT', 'AxisC' );

    // Assemble a plot from the pieces above
    const plotLayout = new GridLayout( );
    plotLayout.visibleColumnKeys = new LinkedSet( [ 'AxisY', 'Spacer', 'AxisC' ] );
    const plotPane = new Pane( plotLayout );
    plotPane.addCssClass( 'heatmap-plot' );
    setGridCoords( heatmapPane, 'VIEWPORT', 'VIEWPORT' );
    plotPane.addPane( heatmapPane );
    plotPane.addPane( yAxisWidget.pane );
    plotPane.addPane( spacerPane, Number.NEGATIVE_INFINITY );
    plotPane.addPane( cAxisWidget.pane );

    return plotPane;
}

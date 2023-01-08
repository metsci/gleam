import { attachAxisInputHandlers1D, createCommonBoundsAxis1D, EAST, EdgeAxisWidget, GridLayout, GridPainter, LinearTicker, Pane, ScatterPainter, setGridCoords, SOUTH, TextAtlasCache } from '@metsci/gleam-core';
import { TimeTicker } from '@metsci/gleam-timeline';
import { Interval1D, LinkedSet, X } from '@metsci/gleam-util';

export class TimelineView {
    readonly tAxisWidget_PSEC: EdgeAxisWidget;
    readonly zAxisWidget: EdgeAxisWidget;
    readonly dotsPainter: ScatterPainter;
    readonly pane: Pane;

    constructor( textAtlasCache: TextAtlasCache ) {
        // Data pane
        const dataPane = new Pane( );

        // Time axis
        const tAxis_PSEC = createCommonBoundsAxis1D( Interval1D.fromEdges( 0, 86400 ) );
        this.tAxisWidget_PSEC = new EdgeAxisWidget( tAxis_PSEC, SOUTH, {
            createTicker: ( ) => new TimeTicker( ),
            textAtlasCache,
        } );
        this.tAxisWidget_PSEC.attachAxisViewportUpdater( dataPane );
        attachAxisInputHandlers1D( dataPane, this.tAxisWidget_PSEC.axis, X );

        // Vertical axis
        const zAxis = createCommonBoundsAxis1D( Interval1D.fromEdges( 0, 1 ) );
        this.zAxisWidget = new EdgeAxisWidget( zAxis, EAST, {
            createTicker: ( ) => new LinearTicker( ),
            textAtlasCache,
        } );
        this.zAxisWidget.attachAxisViewportUpdater( dataPane );

        // Grid painter
        dataPane.addPainter( new GridPainter( this.tAxisWidget_PSEC.axis, null, this.tAxisWidget_PSEC.ticker, null ) );

        // Points painter
        this.dotsPainter = new ScatterPainter( );
        dataPane.addPainter( this.dotsPainter );

        // Assemble pane
        const gridLayout = new GridLayout( );
        this.pane = new Pane( gridLayout );
        this.pane.addCssClass( 'timeline-view' );
        this.pane.addPane( dataPane );
        this.pane.addPane( this.zAxisWidget.pane );
        this.pane.addPane( this.tAxisWidget_PSEC.pane );
        gridLayout.visibleColumnKeys = new LinkedSet( [ 'WestColumn' ] );
        gridLayout.visibleRowKeys = new LinkedSet( [ 'SouthRow', 'NorthRow' ] );
        setGridCoords( dataPane, 'NorthRow', 'VIEWPORT' );
        setGridCoords( this.zAxisWidget.pane, 'NorthRow', 'WestColumn' );
        setGridCoords( this.tAxisWidget_PSEC.pane, 'SouthRow', 'VIEWPORT' );
    }
}

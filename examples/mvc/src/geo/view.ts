import { attachAxisInputHandlers2D, attachAxisViewportUpdater2D, Axis2D, axisBoundsFn, createCommonScaleAxis2D, Pane, ScatterPainter } from '@metsci/gleam-core';
import { MvtCache, MvtPainter } from '@metsci/gleam-mvt';
import { Interval1D, MERCATOR_PROJ, NormalCylindricalProjection } from '@metsci/gleam-util';
import { GREEN_WITH_TRIANGULAR_ALPHA, RED_WITH_TRIANGULAR_ALPHA, YELLOW_WITH_TRIANGULAR_ALPHA } from '../misc';

const { PI } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;

export class GeoView {
    readonly proj: NormalCylindricalProjection;
    readonly xyAxis: Axis2D;
    readonly mvtPainter: MvtPainter;
    readonly dotsPainter: ScatterPainter;
    readonly pane: Pane;

    constructor( mvtCache: MvtCache ) {
        // Pane
        this.pane = new Pane( );
        this.pane.addCssClass( 'geo-view' );

        // XY axis
        this.proj = MERCATOR_PROJ;
        this.xyAxis = createCommonScaleAxis2D( );
        this.xyAxis.y.maxConstraint = Interval1D.fromEdges( NEGATIVE_INFINITY, this.proj.maxUsableY );
        this.xyAxis.y.minConstraint = Interval1D.fromEdges( this.proj.minUsableY, POSITIVE_INFINITY );
        this.xyAxis.y.scaleConstraint = Interval1D.fromEdges( NEGATIVE_INFINITY, 1e7*this.proj.maxDLatDY_RAD( ) );
        this.xyAxis.x.set( false, this.proj.lonToX( -PI ), this.proj.lonToX( +PI ) );
        attachAxisViewportUpdater2D( this.pane, this.xyAxis );
        attachAxisInputHandlers2D( this.pane, this.xyAxis );

        // MVT tiles
        this.mvtPainter = new MvtPainter( mvtCache, this.proj, axisBoundsFn( this.xyAxis ) );
        this.pane.addPainter( this.mvtPainter );

        // Dots painter
        // TODO: Support wraparound when drawing dots
        this.dotsPainter = new ScatterPainter( axisBoundsFn( this.xyAxis ) );
        this.pane.addPainter( this.dotsPainter );
        this.pane.enableColorTables( [ RED_WITH_TRIANGULAR_ALPHA, YELLOW_WITH_TRIANGULAR_ALPHA, GREEN_WITH_TRIANGULAR_ALPHA ] );
    }
}

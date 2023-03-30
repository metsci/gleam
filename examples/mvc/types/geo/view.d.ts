import { Axis2D, Pane, ScatterPainter } from '@metsci/gleam-core';
import { MvtCache, MvtPainter } from '@metsci/gleam-mvt';
import { NormalCylindricalProjection } from '@metsci/gleam-util';
export declare class GeoView {
    readonly proj: NormalCylindricalProjection;
    readonly xyAxis: Axis2D;
    readonly mvtPainter: MvtPainter;
    readonly dotsPainter: ScatterPainter;
    readonly pane: Pane;
    constructor(mvtCache: MvtCache);
}
//# sourceMappingURL=view.d.ts.map
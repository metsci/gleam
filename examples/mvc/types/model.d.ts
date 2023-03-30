import { CommonBoundsAxisGroup1D, CommonScaleAxisGroup1D } from '@metsci/gleam-core';
import { BinaryReadableRef, RefBasic, UnaryReadableRef } from '@metsci/gleam-util';
import * as immutable from 'immutable';
import { Dot } from './misc';
export declare class Model {
    protected _nextDotKey: number;
    readonly nextDotKey: () => string;
    readonly dots: RefBasic<immutable.Map<string, Dot>>;
    readonly tCursor_PSEC: RefBasic<number>;
    readonly tRef_PSEC: UnaryReadableRef<immutable.Map<string, Dot>, number>;
    readonly tCursor: BinaryReadableRef<number, number, number>;
    readonly xAxisGroup: CommonScaleAxisGroup1D;
    readonly yAxisGroup: CommonScaleAxisGroup1D;
    readonly zAxisGroup: CommonBoundsAxisGroup1D;
    readonly tAxisGroup_PSEC: CommonBoundsAxisGroup1D;
}
//# sourceMappingURL=model.d.ts.map
import { CommonBoundsAxisGroup1D, CommonScaleAxisGroup1D } from '@metsci/gleam-core';
import { BinaryReadableRef, equal, Interval1D, RefBasic, tripleEquals, UnaryReadableRef } from '@metsci/gleam-util';
import * as immutable from 'immutable';
import { Dot, firstValue } from './misc';

export class Model {
    // Dots
    protected _nextDotKey = 0;
    readonly nextDotKey = ( ) => `dot-${this._nextDotKey++}`;
    readonly dots = new RefBasic( immutable.Map<string,Dot>( ), equal );

    // Time cursor
    readonly tCursor_PSEC = new RefBasic( 0, tripleEquals );
    readonly tRef_PSEC = new UnaryReadableRef( this.dots, dots => firstValue( dots )?.t_PSEC ?? 0 );
    readonly tCursor = new BinaryReadableRef( this.tCursor_PSEC, this.tRef_PSEC, ( tCursor_PSEC, tRef_PSEC ) => tCursor_PSEC - tRef_PSEC );

    // Axis groups
    readonly xAxisGroup = new CommonScaleAxisGroup1D( 0.5 );
    readonly yAxisGroup = new CommonScaleAxisGroup1D( 0.5 );
    readonly zAxisGroup = new CommonBoundsAxisGroup1D( 0, Interval1D.fromEdges( -1.1, +1.1 ) );
    readonly tAxisGroup_PSEC = new CommonBoundsAxisGroup1D( 0, Interval1D.fromEdges( 0, 86400 ) );
}

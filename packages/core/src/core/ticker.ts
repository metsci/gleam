/**
 * Copyright (c) 2022, Metron, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { Nullable } from '@metsci/gleam-util';
import { createDomPeer, PeerType, Styleable, ValueBase2 } from '../support';
import { Axis1D } from './axis1d';

export class AxisLabelSet extends ValueBase2 {
    constructor(
        readonly axisLabels: ReadonlyArray<AxisLabel>,
        readonly axisDividers: ReadonlyArray<AxisDivider>,
    ) {
        super( );
    }
}

export class AxisLabel extends ValueBase2 {
    constructor(
        /**
         * Axis coord where the text's alignment point will
         * end up.
         */
        readonly axisFrac: number,

        /**
         * Label text.
         */
        readonly text: string,

        /**
         * Text will not extend below this point -- it may
         * get scooted forward, or simply not be drawn.
         *
         * Defaults to 0.
         */
        readonly minAxisFrac?: number,

        /**
         * Text will not extend above this point -- it may
         * get scooted backward, or simply not be drawn.
         *
         * Defaults to 1.
         */
        readonly maxAxisFrac?: number,

        /**
         * Text alignment point. Typically on [0,1]:
         *   0.0 = left-aligned
         *   0.5 = centered
         *   1.0 = right-aligned
         *
         * Defaults to 0.5.
         */
        readonly textAlignFrac?: number,
    ) {
        super( );
    }
}

export class AxisDivider extends ValueBase2 {
    constructor(
        /**
         * Axis coord where the divider will be drawn.
         */
        readonly axisFrac: number,
    ) {
        super( );
    }
}

export class TickSet extends ValueBase2 {
    constructor(
        readonly majorTicks: ReadonlyArray<number>,
        readonly minorTicks: ReadonlyArray<number>,
        readonly formatTick: ( axisCoord: number ) => string,
        readonly getAxisLabels: ( ) => AxisLabelSet,
    ) {
        super( );
    }
}

export const EMPTY_AXISLABELSET = new AxisLabelSet( [], [] );

export const EMPTY_TICKSET = new TickSet( [], [], ( ) => '', ( ) => EMPTY_AXISLABELSET );

export interface Ticker extends Styleable {
    getTicks( axis: Nullable<Axis1D> ): TickSet;
}

export class NullTicker implements Ticker {
    readonly peer = createDomPeer( 'null-ticker', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    getTicks( ): TickSet {
        return EMPTY_TICKSET;
    }
}

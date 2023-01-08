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
import { Interval2D, LinkedSet, newImmutableSet, Size2D } from '@metsci/gleam-util';
import { LayoutBase, Pane } from '../core';
import { cssBoolean, cssFloat, cssString, currentDpr, StyleProp, UnboundStyleProp } from '../support';
import { ColumnsConfig, computeGridChildViewports_PX, computeGridPrefSize_PX, setColumnKey, setRowKey } from './gridLayout';

/**
 * Like a `GridLayout` with a single column. Honors `GridLayout`'s row-
 * related CSS properties.
 *
 * Unlike `GridLayout`, this class makes all visible children into visible
 * rows, ordered to match the order in which they were added to the parent
 * pane. In many cases this is simpler for the caller than using `GridLayout`
 * itself.
 */
export class RowsLayout extends LayoutBase {
    readonly topToBottom = StyleProp.create( this.style, '--top-to-bottom', cssBoolean, false );
    readonly gapBetweenRows_LPX = StyleProp.create( this.style, '--gap-between-rows-px', cssFloat, 0 );

    readonly rowHeight = UnboundStyleProp.create( '--row-height', cssString, 'flex(0,pref)' );

    _visibleRowKeys: LinkedSet<string>;

    constructor( ) {
        super( 'rows-layout' );
        this._visibleRowKeys = new LinkedSet( );
    }

    get visibleRowKeys( ): ReadonlySet<string> {
        return this._visibleRowKeys;
    }

    computePrefSize_PX( children: Iterable<Pane> ): Size2D {
        updateChildColumnKeys( children );
        this._visibleRowKeys = updateChildRowKeys( children );
        return computeGridPrefSize_PX( currentDpr( this ), children, this, SINGLE_COLUMN_CONFIG );
    }

    computeChildViewports_PX( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D> {
        return computeGridChildViewports_PX( currentDpr( this ), viewport_PX, children, this, SINGLE_COLUMN_CONFIG );
    }
}

const SINGLE_COLUMN_CONFIG: ColumnsConfig = Object.freeze( {
    rightToLeft: { get( ) { return true } },
    gapBetweenColumns_LPX: { get( ) { return 0 } },

    columnWidth: { get( ) { return 'flex(0,pref)' } },

    visibleColumnKeys: newImmutableSet( [] ),
} );

function updateChildColumnKeys( children: Iterable<Pane> ): void {
    for ( const child of children ) {
        if ( child.isVisible( ) ) {
            setColumnKey( child, 'ALL' );
        }
    }
}

function updateChildRowKeys( children: Iterable<Pane> ): LinkedSet<string> {
    const visibleRowKeys = new LinkedSet<string>( );
    let nextChildNum = 0;
    for ( const child of children ) {
        const childNum = nextChildNum++;
        if ( child.isVisible( ) ) {
            const rowKey = childNum.toFixed( );
            setRowKey( child, rowKey );
            visibleRowKeys.add( rowKey );
        }
    }
    return visibleRowKeys;
}

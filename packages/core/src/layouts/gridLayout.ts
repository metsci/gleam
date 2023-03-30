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
import { Interval1D, Interval2D, isNumber, LinkedSet, mapIterable, requireNonNullish, Size2D, Supplier } from '@metsci/gleam-util';
import { LayoutBase, Pane } from '../core';
import { cssBoolean, cssFloat, cssString, currentDpr, StyleProp, UnboundStyleProp } from '../support';
import { isstr } from '../util';

export function getRowKey( pane: Pane ): string | undefined {
    return getFirstClassName( pane.peer, 'grid-row--' );
}

export function getColumnKey( pane: Pane ): string | undefined {
    return getFirstClassName( pane.peer, 'grid-column--' );
}

export function setRowKey( pane: Pane, rowKey: string | undefined ): void {
    replaceClassNames( pane.peer, 'grid-row--', rowKey === undefined ? [] : [ rowKey ] );
}

export function setColumnKey( pane: Pane, columnKey: string | undefined ): void {
    replaceClassNames( pane.peer, 'grid-column--', columnKey === undefined ? [] : [ columnKey ] );
}

export function setGridCoords( pane: Pane, rowKey: string | undefined, columnKey: string | undefined ): void {
    setRowKey( pane, rowKey );
    setColumnKey( pane, columnKey );
}

function getFirstClassName( element: Element, prefix: string ): string | undefined {
    for ( const className of element.classList ) {
        if ( className.startsWith( prefix ) ) {
            return className.substring( prefix.length );
        }
    }
    return undefined;
}

function replaceClassNames( element: Element, prefix: string, replacementSuffixes: Iterable<string> ): void {
    // Don't touch element.classList unless we have actual changes --
    // touching classList (even adding/removing an empty array of classes)
    // can trigger an endless MutationObserver-repaint cycle

    const classNamesToAdd = new Set<string>( );
    for ( const suffix of replacementSuffixes ) {
        classNamesToAdd.add( prefix + suffix );
    }

    const classNamesToRemove = [];
    for ( const className of element.classList ) {
        if ( !classNamesToAdd.delete( className ) && className.startsWith( prefix ) ) {
            classNamesToRemove.push( className );
        }
    }

    if ( classNamesToRemove.length > 0 ) {
        element.classList.remove( ...classNamesToRemove );
    }

    if ( classNamesToAdd.size > 0 ) {
        element.classList.add( ...classNamesToAdd );
    }
}

/**
 * Arranges child panes based on their `grid-row--${rowKey}` and `grid-column--${columnKey}`
 * CSS classes. Use the `setGridCoords()`, `setRowKey()`, and `setColumnKey()` convenience
 * fns, or manage the class-list directly.
 *
 * Looks for panes whose row and column keys match the contents of its `visibleRowKeys` and
 * `visibleColumnKeys` fields, which are set programmatically, not in CSS.
 *
 * The special key `ALL` means to cover all rows or all columns, and the special key `VIEWPORT`
 * means to cover the full viewport height or full viewport width.
 *
 * By default, column widths and row heights are set to the preferred sizes of their contents.
 * This can be overridden in CSS, by setting `--row-height` and `--column-width` properties
 * on a child pane's site-in-parent. For example:
 * ```css
 * gleam-pane.some-specific-class > site-in-parent {
 *   --column-width: rigid( 250px );
 *   --row-height: rigid( 50px );
 * }
 * ```
 */
export class GridLayout extends LayoutBase {
    readonly topToBottom = StyleProp.create( this.style, '--top-to-bottom', cssBoolean, false );
    readonly gapBetweenRows_LPX = StyleProp.create( this.style, '--gap-between-rows-px', cssFloat, 0 );

    readonly rowHeight = UnboundStyleProp.create( '--row-height', cssString, 'flex(0,pref)' );

    visibleRowKeys: LinkedSet<string>;

    readonly rightToLeft = StyleProp.create( this.style, '--right-to-left', cssBoolean, false );
    readonly gapBetweenColumns_LPX = StyleProp.create( this.style, '--gap-between-columns-px', cssFloat, 0 );

    readonly columnWidth = UnboundStyleProp.create( '--column-width', cssString, 'flex(0,pref)' );

    visibleColumnKeys: LinkedSet<string>;

    constructor( ) {
        super( 'grid-layout' );
        this.visibleRowKeys = new LinkedSet( );
        this.visibleColumnKeys = new LinkedSet( );
    }

    computePrefSize_PX( children: Iterable<Pane> ): Size2D {
        return computeGridPrefSize_PX( currentDpr( this ), children, this, this );
    }

    computeChildViewports_PX( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D> {
        return computeGridChildViewports_PX( currentDpr( this ), viewport_PX, children, this, this );
    }
}

export interface RowsConfig {
    readonly topToBottom: { get( ): boolean };
    readonly gapBetweenRows_LPX: { get( ): number };

    readonly rowHeight: { get( style: CSSStyleDeclaration, getOverride: Supplier<string | undefined> | undefined ): string };

    readonly visibleRowKeys: ReadonlySet<string>;
}

export interface ColumnsConfig {
    readonly rightToLeft: { get( ): boolean };
    readonly gapBetweenColumns_LPX: { get( ): number };

    readonly columnWidth: { get( style: CSSStyleDeclaration, getOverride: Supplier<string | undefined> | undefined ): string };

    readonly visibleColumnKeys: ReadonlySet<string>;
}

export function getRowHeightInfo( viewport_PX: Interval2D, dpr: number, pane: Pane, rowsConfig: RowsConfig ): SizeInfo {
    const s = rowsConfig.rowHeight.get( pane.siteInParentStyle, checkedStringSupplier( pane.siteInParentOverrides.rowHeight ) );
    return parseSizeInfo( viewport_PX.h, dpr, pane.getPrefSize_PX( ).h, s );
}

export function getColumnWidthInfo( viewport_PX: Interval2D, dpr: number, pane: Pane, columnsConfig: ColumnsConfig ): SizeInfo {
    const s = columnsConfig.columnWidth.get( pane.siteInParentStyle, checkedStringSupplier( pane.siteInParentOverrides.columnWidth ) );
    return parseSizeInfo( viewport_PX.w, dpr, pane.getPrefSize_PX( ).w, s );
}

function checkedStringSupplier( supplier: Supplier<unknown> | undefined ): Supplier<string | undefined> | undefined {
    return ( ) => {
        const v = supplier?.( );
        if ( v === undefined || isstr( v ) ) {
            return v;
        }
        else {
            throw new Error( );
        }
    };
}

export function parseSizeInfo( viewport_PX: number, dpr: number, pref_PX: number, s: string ): SizeInfo {
    const rigidMatch = s.match( /^rigid\(([^\)]*)\)$/ );
    if ( rigidMatch !== null ) {
        const sizeStr = rigidMatch[1].trim( ).toLowerCase( );
        const size_PX = parseSize_PX( sizeStr, dpr, viewport_PX, pref_PX );
        if ( isNumber( size_PX ) ) {
            return {
                type: 'rigid',
                size_PX,
            };
        }
    }

    const flexMatch = s.match( /^flex\(([^\)]*),([^\)]*)\)$/ );
    if ( flexMatch !== null ) {
        const minSizeStr = flexMatch[1].trim( ).toLowerCase( );
        const prefSizeStr = flexMatch[2].trim( ).toLowerCase( );
        const minSize_PX = parseSize_PX( minSizeStr, dpr, viewport_PX, pref_PX );
        const prefSize_PX = parseSize_PX( prefSizeStr, dpr, viewport_PX, pref_PX );
        if ( isNumber( minSize_PX ) && isNumber( prefSize_PX ) ) {
            return {
                type: 'flex',
                minSize_PX,
                prefSize_PX,
            };
        }
    }

    return {
        type: 'flex',
        minSize_PX: 0,
        prefSize_PX: pref_PX,
    };
}

export function computeGridPrefSize_PX( dpr: number, children: Iterable<Pane>, rowsConfig: RowsConfig, columnsConfig: ColumnsConfig ): Size2D {
    const gapBetweenRows_PX = Math.round( rowsConfig.gapBetweenRows_LPX.get( ) * dpr );
    const gapBetweenColumns_PX = Math.round( columnsConfig.gapBetweenColumns_LPX.get( ) * dpr );

    // With a NaN viewport, rows/columns with viewport-fraction sizes act like flex rows/columns
    const viewport_PX = Interval2D.fromEdges( NaN, NaN, NaN, NaN );
    const childInfos = getGridChildInfos( viewport_PX, dpr, children, rowsConfig, columnsConfig );

    const rowSizes = getRankSizes( mapIterable( childInfos.values( ), c => c.row ) );
    const prefHeight_PX = computeRankSizeTotals( gapBetweenRows_PX, rowSizes ).totalPrefSize_PX;

    const columnSizes = getRankSizes( mapIterable( childInfos.values( ), c => c.column ) );
    const prefWidth_PX = computeRankSizeTotals( gapBetweenColumns_PX, columnSizes ).totalPrefSize_PX;

    return new Size2D( prefWidth_PX, prefHeight_PX );
}

export function computeGridChildViewports_PX( dpr: number, viewport_PX: Interval2D, children: Iterable<Pane>, rowsConfig: RowsConfig, columnsConfig: ColumnsConfig ): Map<Pane,Interval2D> {
    const topToBottom = rowsConfig.topToBottom.get( );
    const rightToLeft = columnsConfig.rightToLeft.get( );

    const gapBetweenRows_PX = Math.round( rowsConfig.gapBetweenRows_LPX.get( ) * dpr );
    const gapBetweenColumns_PX = Math.round( columnsConfig.gapBetweenColumns_LPX.get( ) * dpr );

    const childInfos = getGridChildInfos( viewport_PX, dpr, children, rowsConfig, columnsConfig );

    const rowSizes = getRankSizes( mapIterable( childInfos.values( ), c => c.row ) );
    const rowIntervals_PX = computeRankIntervals_PX( viewport_PX.y, topToBottom, gapBetweenRows_PX, rowSizes, rowsConfig.visibleRowKeys );

    const columnSizes = getRankSizes( mapIterable( childInfos.values( ), c => c.column ) );
    const columnIntervals_PX = computeRankIntervals_PX( viewport_PX.x, rightToLeft, gapBetweenColumns_PX, columnSizes, columnsConfig.visibleColumnKeys );

    const childViewports_PX = new Map( ) as Map<Pane,Interval2D>;
    for ( const [ child, childInfo ] of childInfos ) {
        const rowInterval_PX = requireNonNullish( rowIntervals_PX.get( childInfo.row.key ) );
        const columnInterval_PX = requireNonNullish( columnIntervals_PX.get( childInfo.column.key ) );
        childViewports_PX.set( child, Interval2D.fromXy( columnInterval_PX, rowInterval_PX ) );
    }
    return childViewports_PX;
}

/**
 * Return values may be NaN.
 *
 * Return values are not necessarily integers.
 */
function parseSize_PX( s: any, dpr: number, viewportSize_PX: number, prefSize_PX: number ): number {
    if ( typeof( s ) !== 'string' ) {
        return NaN;
    }

    const prefMatch = s.match( /^pref$/ );
    if ( prefMatch !== null ) {
        return prefSize_PX;
    }

    const pxMatch = s.match( /^(.*)px$/ );
    if ( pxMatch !== null ) {
        const size_LPX = Number.parseFloat( pxMatch[ 1 ] );
        return ( size_LPX * dpr );
    }

    const percentMatch = s.match( /^(.*)%$/ );
    if ( percentMatch !== null ) {
        const size_FRAC = 0.01 * Number.parseFloat( percentMatch[ 1 ] );
        return ( size_FRAC * viewportSize_PX );
    }

    const size_LPX = Number.parseFloat( s );
    return ( size_LPX * dpr );
}

interface GridChildInfo {
    row: RankInfo;
    column: RankInfo;
}

interface RankInfo {
    key: string;
    size: SizeInfo;
}

export type SizeInfo = RigidInfo | FlexInfo;

export interface RigidInfo {
    type: 'rigid';
    size_PX: number;
}

export interface FlexInfo {
    type: 'flex';
    prefSize_PX: number;
    minSize_PX: number;
}

function getGridChildInfos( viewport_PX: Interval2D, dpr: number, children: Iterable<Pane>, rowsConfig: RowsConfig, columnsConfig: ColumnsConfig ): Map<Pane,GridChildInfo> {
    const result = new Map<Pane,GridChildInfo>( );
    for ( const child of children ) {
        if ( !child.isVisible( ) ) {
            continue;
        }

        const rowKey = getRowKey( child );
        if ( rowKey === undefined ) {
            continue;
        }
        if ( !( rowKey === 'ALL' || rowKey === 'VIEWPORT' || rowsConfig.visibleRowKeys.has( rowKey ) ) ) {
            continue;
        }

        const columnKey = getColumnKey( child );
        if ( columnKey === undefined ) {
            continue;
        }
        if ( !( columnKey === 'ALL' || columnKey === 'VIEWPORT' || columnsConfig.visibleColumnKeys.has( columnKey ) ) ) {
            continue;
        }

        result.set( child, {
            row: {
                key: rowKey,
                size: getRowHeightInfo( viewport_PX, dpr, child, rowsConfig ),
            },
            column: {
                key: columnKey,
                size: getColumnWidthInfo( viewport_PX, dpr, child, columnsConfig ),
            },
        } );
    }
    return result;
}

function getRankSizes( childRankInfos: Iterable<RankInfo> ): Map<string,SizeInfo> {
    const sizes = new Map<string,SizeInfo>( );
    for ( const rankInfo of childRankInfos ) {
        const oldSize = sizes.get( rankInfo.key );
        const newSize = mergeSizeInfos( oldSize, rankInfo.size );
        sizes.set( rankInfo.key, newSize );
    }
    for ( const size of sizes.values( ) ) {
        tweakSizeInfo( size );
    }
    return sizes;
}

function mergeSizeInfos( a: SizeInfo | undefined, b: SizeInfo | undefined ): SizeInfo {
    a = a ?? {
        type: 'rigid' as const,
        size_PX: 0,
    };

    b = b ?? {
        type: 'rigid' as const,
        size_PX: 0,
    };

    if ( a.type === 'rigid' && b.type === 'rigid' ) {
        return {
            type: 'rigid',
            size_PX: Math.max( a.size_PX, b.size_PX ),
        };
    }
    else if ( a.type === 'rigid' && b.type === 'flex' ) {
        return {
            type: 'flex',
            minSize_PX: Math.max( a.size_PX, b.minSize_PX ),
            prefSize_PX: Math.max( a.size_PX, b.prefSize_PX ),
        };
    }
    else if ( a.type === 'flex' && b.type === 'flex' ) {
        return {
            type: 'flex',
            minSize_PX: Math.max( a.minSize_PX, b.minSize_PX ),
            prefSize_PX: Math.max( a.prefSize_PX, b.prefSize_PX ),
        };
    }
    else if ( a.type === 'flex' && b.type === 'rigid' ) {
        return {
            type: 'flex',
            minSize_PX: Math.max( a.minSize_PX, b.size_PX ),
            prefSize_PX: Math.max( a.prefSize_PX, b.size_PX ),
        };
    }
    else {
        throw new Error( 'Unexpected size-info types: a = ' + a.type + ', b = ' + b.type );
    }
}

function tweakSizeInfo( size: SizeInfo ): void {
    switch ( size.type ) {
        case 'rigid': {
            size.size_PX = Math.round( size.size_PX );
        }
        break;

        case 'flex': {
            size.minSize_PX = Math.round( size.minSize_PX );
            size.prefSize_PX = Math.round( size.prefSize_PX );
            size.prefSize_PX = Math.max( size.minSize_PX, size.prefSize_PX );
        }
        break;
    }
}

interface RankSizeTotals {
    totalPrefSize_PX: number;
    totalGapSize_PX: number;
    totalRigidCount: number;
    totalRigidSize_PX: number;
    totalFlexCount: number;
    totalFlexMinSize_PX: number;
    totalFlexPrefSize_PX: number;
}

function computeRankSizeTotals( gapBetweenRanks_PX: number, rankSizes: ReadonlyMap<string,SizeInfo> ): RankSizeTotals {
    let totalRigidCount = 0;
    let totalRigidSize_PX = 0;

    let totalFlexCount = 0;
    let totalFlexMinSize_PX = 0;
    let totalFlexPrefSize_PX = 0;

    for ( const [ rankKey, rankSize ] of rankSizes ) {
        if ( rankKey !== 'ALL' && rankKey !== 'VIEWPORT' ) {
            switch ( rankSize.type ) {
                case 'rigid': {
                    totalRigidSize_PX += rankSize.size_PX;
                    totalRigidCount++;
                }
                break;

                case 'flex': {
                    totalFlexMinSize_PX += rankSize.minSize_PX;
                    totalFlexPrefSize_PX += rankSize.prefSize_PX;
                    totalFlexCount++;
                }
                break;
            }
        }
    }

    const totalGapSize_PX = Math.max( 0, totalRigidCount + totalFlexCount - 1 ) * gapBetweenRanks_PX;
    let totalPrefSize_PX = totalRigidSize_PX + totalFlexPrefSize_PX + totalGapSize_PX;
    for ( const [ rankKey, rankSize ] of rankSizes ) {
        if ( rankKey === 'ALL' || rankKey === 'VIEWPORT' ) {
            switch ( rankSize.type ) {
                case 'rigid': {
                    totalPrefSize_PX = Math.max( totalPrefSize_PX, rankSize.size_PX );
                }
                break;

                case 'flex': {
                    totalPrefSize_PX = Math.max( totalPrefSize_PX, rankSize.prefSize_PX );
                }
                break;
            }
        }
    }

    return {
        totalPrefSize_PX,
        totalGapSize_PX,
        totalRigidCount,
        totalRigidSize_PX,
        totalFlexCount,
        totalFlexMinSize_PX,
        totalFlexPrefSize_PX,
    };
}

function computeRankIntervals_PX( viewport_PX: Interval1D, maxToMin: boolean, gapBetweenRanks_PX: number, rankSizes: ReadonlyMap<string,SizeInfo>, visibleRankKeys: Iterable<string> ): ReadonlyMap<string,Interval1D> {
    const rankIntervals_PX = new Map<string,Interval1D>( );

    const { totalGapSize_PX, totalRigidSize_PX, totalFlexCount, totalFlexMinSize_PX, totalFlexPrefSize_PX } = computeRankSizeTotals( gapBetweenRanks_PX, rankSizes );
    let usedSize_PX = 0;
    let remainingDiscretionarySpace_PX = viewport_PX.span - ( totalRigidSize_PX + totalFlexMinSize_PX + totalGapSize_PX );
    let remainingFlexPrefSize_PX = totalFlexPrefSize_PX;
    let remainingFlexCount = totalFlexCount;
    for ( const rankKey of visibleRankKeys ) {
        const rankSize = rankSizes.get( rankKey );
        if ( rankSize !== undefined && rankKey !== 'ALL' && rankKey !== 'VIEWPORT' ) {
            if ( rankIntervals_PX.size > 0 ) {
                usedSize_PX += gapBetweenRanks_PX;
            }

            let rankSize_PX: number;
            switch ( rankSize.type ) {
                case 'rigid': {
                    rankSize_PX = rankSize.size_PX;
                }
                break;

                case 'flex': {
                    // Distribute discretionary space based on pref size ... could instead
                    // be based on the difference between min and pref, but usually we want
                    // min to be ignored except as a hard stop
                    const discretionaryFrac = (
                        ( totalFlexPrefSize_PX <= 0 )
                          ? 1.0 / remainingFlexCount
                          : ( remainingFlexPrefSize_PX <= 0 )
                              ? 0
                              : rankSize.prefSize_PX / remainingFlexPrefSize_PX
                    );
                    const discretionarySize_PX = Math.round( discretionaryFrac * remainingDiscretionarySpace_PX );
                    remainingDiscretionarySpace_PX -= discretionarySize_PX;
                    remainingFlexPrefSize_PX -= rankSize.prefSize_PX;
                    remainingFlexCount -= 1;
                    rankSize_PX = rankSize.minSize_PX + discretionarySize_PX;
                }
            }

            let min_PX;
            if ( maxToMin ) {
                min_PX = viewport_PX.max - usedSize_PX - rankSize_PX;
            }
            else {
                min_PX = viewport_PX.min + usedSize_PX;
            }
            const max_PX = min_PX + rankSize_PX;
            rankIntervals_PX.set( rankKey, Interval1D.fromEdges( min_PX, max_PX ) );
            usedSize_PX += rankSize_PX;
        }
    }

    let totalSize_PX = usedSize_PX;
    for ( const [ rankKey, rankSize ] of rankSizes ) {
        if ( rankKey === 'ALL' || rankKey === 'VIEWPORT' ) {
            switch ( rankSize.type ) {
                case 'rigid': {
                    totalSize_PX = Math.max( totalSize_PX, rankSize.size_PX );
                }
                break;

                case 'flex': {
                    totalSize_PX = Math.max( totalSize_PX, viewport_PX.span );
                }
                break;
            }
        }
    }
    const allMin_PX = ( maxToMin ? viewport_PX.max - totalSize_PX : viewport_PX.min );
    rankIntervals_PX.set( 'ALL', Interval1D.fromRect( allMin_PX, totalSize_PX ) );

    rankIntervals_PX.set( 'VIEWPORT', viewport_PX );

    return rankIntervals_PX;
}

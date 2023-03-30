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
import { attachAxisInputHandlers1D, attachAxisViewportUpdater1D, Axis1D, ChildlessLayout, ColumnsLayout, Context, createAxisCursorInputHandler1D, createDomPeer, createInset, cssColor, cssFloat, currentDpr, CursorPainter, DragHandler, EdgeAxisWidget, FillPainter, frozenSupplier, glViewport, GridLayout, HoverHandler, InputHandler, InsetLayout, LayoutPrepFn, NORTH, Painter, Pane, PaneMouseEvent, PeerType, RowsLayout, setGridCoords, SOUTH, StyleProp, TextAtlasCache, TRANSPARENT, VerticalScrollbar, VerticalScrollerLayout } from '@metsci/gleam-core';
import { appendChild, Disposer, DisposerGroup, findIndexAtOrAfter, FireableListenable, IMMEDIATE, Interval1D, Interval2D, isDefined, LinkedMap, LinkedSet, linkListenables, ListenableBasic, newImmutableList, Nullable, Point2D, ReadableLinkedMap, Ref, RefBasic, requireDefined, tripleEquals, X } from '@metsci/gleam-util';
import { TimeTicker } from '../ticker';

export interface TimelineRow {
    readonly key: string;
    readonly parentKey: string | undefined;
    readonly labelLayout: InsetLayout;
    readonly labelPane: Pane;
    readonly dataLayout: InsetLayout;
    readonly dataPane: Pane;
    readonly children?: {
        readonly expanded: boolean;
        readonly rows: ReadableLinkedMap<string,TimelineRow>;
    };
}

export interface TimelineNestedRow {
    readonly row: TimelineRow;
    readonly nest: number;
}

export interface DragSiteFilter {
    ( timeline: HorizontalTimeline, draggedKey: string ): AllowSiteFn;
}

export interface AllowSiteFn {
    ( parentKey: string | undefined, keyBelow: string | undefined ): boolean;
}

export interface DragSite {
    parentKey: string | undefined;
    keyBelow: string | undefined;
    coord_PX: number;
}

export const TO_ANY_SITE: DragSiteFilter = ( ) => ( ) => {
    return true;
};

export const TO_SIBLING_SITES: DragSiteFilter = ( timeline, draggedKey ) => {
    const origParentKey = timeline.requireRow( draggedKey ).parentKey;
    return parentKey => {
        return ( parentKey === origParentKey );
    };
};

interface TimelineRowImpl {
    readonly key: string;
    parentKey: string | undefined;
    readonly labelLayout: InsetLayout;
    readonly labelPane: Pane;
    readonly dataLayout: InsetLayout;
    readonly dataPane: Pane;
    children?: {
        expanded: boolean;
        readonly rows: LinkedMap<string,TimelineRowImpl>;
    };
}

function getRowVerticalViewport_PX( row: TimelineRow ): Interval1D {
    return row.labelPane.getViewport_PX( ).y;
}

function updateExpandedCssClasses( row: TimelineRowImpl ): void {
    for ( const pane of [ row.labelPane, row.dataPane ] ) {
        switch ( row.children?.expanded ) {
            case undefined:
                pane.removeCssClass( 'expanded' );
                pane.removeCssClass( 'collapsed' );
                break;

            case true:
                pane.addCssClass( 'expanded' );
                pane.removeCssClass( 'collapsed' );
                break;

            case false:
                pane.addCssClass( 'collapsed' );
                pane.removeCssClass( 'expanded' );
                break;
        }
    }
}

export class HorizontalTimeline {
    readonly peer = createDomPeer( 'horizontal-timeline', this, PeerType.CONTRAPTION );
    readonly style = window.getComputedStyle( this.peer );

    readonly nestIndent_LPX = StyleProp.create( this.style, '--nest-indent-px', cssFloat, 13 );

    readonly repaint: FireableListenable;

    readonly timeAxis_PSEC: Axis1D;
    dragSiteFilter: DragSiteFilter;

    /**
     * Mutate using `addRow`, `removeRow`, `setRowParent`, `moveRowBefore`, and `moveRowAfter`.
     */
    protected readonly rootRows: LinkedMap<string,TimelineRowImpl>;

    /**
     * Mutate using `addRow`, `removeRow`, `setRowParent`, `moveRowBefore`, and `moveRowAfter`.
     */
    protected readonly allRows: Map<string,TimelineRowImpl>;

    readonly gridLayout: GridLayout;
    readonly gridPane: Pane;
    readonly dataUnderlayPane: Pane;
    readonly dragSitePainter: HorizontalDragSitePainter;
    readonly scrollerLayout: VerticalScrollerLayout;
    readonly scrollerPane: Pane;
    readonly scrollbar: VerticalScrollbar;
    readonly northAxisWidget: EdgeAxisWidget;
    readonly southAxisWidget: EdgeAxisWidget;
    readonly pane: Pane;

    constructor( timeAxis_PSEC: Axis1D, options?: { textAtlasCache?: TextAtlasCache } ) {
        this.repaint = new ListenableBasic( );

        this.timeAxis_PSEC = timeAxis_PSEC;
        this.timeAxis_PSEC.changes.addListener( IMMEDIATE, ( ) => {
            this.repaint.fire( );
        } );

        this.dragSiteFilter = TO_SIBLING_SITES;

        this.rootRows = new LinkedMap( );
        this.allRows = new Map( );

        this.gridLayout = new GridLayout( );
        this.gridLayout.visibleColumnKeys = new LinkedSet( [ 'Label', 'Data' ] );
        // TODO: Generalize drag-site logic to support bottom-to-top
        this.gridLayout.topToBottom.override = true;
        this.gridLayout.prepFns.addLast( ( ) => {
            function* walkTree( rows: ReadonlyMap<string,TimelineRow> ): IterableIterator<string> {
                for ( const row of rows.values( ) ) {
                    if ( getRowVerticalViewport_PX( row ) !== undefined ) {
                        yield row.key;
                        if ( row.children && row.children.expanded ) {
                            yield* walkTree( row.children.rows );
                        }
                    }
                }
            }
            this.gridLayout.visibleRowKeys = new LinkedSet( walkTree( this.rootRows ) );
        } );
        this.gridLayout.prepFns.addLast( ( ) => {
            const indent_LPX = this.nestIndent_LPX.get( );
            for ( const { row, nest } of this.getVisibleNestedRows( ) ) {
                const inset_LPX = createInset( 0, 0, 0, nest*indent_LPX );
                row.labelLayout.inset_LPX.override = inset_LPX;
            }
        } );
        this.gridPane = new Pane( this.gridLayout );
        this.gridPane.addCssClass( 'timeline-content' );

        this.dataUnderlayPane = new Pane( new ChildlessLayout( ) );
        this.dataUnderlayPane.background.color.override = TRANSPARENT;
        this.dataUnderlayPane.border.color.override = TRANSPARENT;
        setGridCoords( this.dataUnderlayPane, 'VIEWPORT', 'Data' );
        this.gridPane.addPane( this.dataUnderlayPane, -999 );

        this.dragSitePainter = new HorizontalDragSitePainter( );
        this.gridPane.addPainter( this.dragSitePainter, +888 );

        this.scrollerLayout = new VerticalScrollerLayout( );
        this.scrollerPane = new Pane( this.scrollerLayout );
        this.scrollerPane.addPane( this.gridPane );
        this.scrollbar = new VerticalScrollbar( this.scrollerLayout );
        this.scrollbar.attachToRepaint( this.repaint );
        const middlePane = new Pane( new ColumnsLayout( ) );
        middlePane.addPane( this.scrollerPane );
        middlePane.addPane( this.scrollbar.pane );

        attachAxisViewportUpdater1D( this.dataUnderlayPane, this.timeAxis_PSEC, X );
        attachAxisInputHandlers1D( this.dataUnderlayPane, this.timeAxis_PSEC, X );

        const textAtlasCache = options?.textAtlasCache ?? new TextAtlasCache( );
        this.northAxisWidget = new EdgeAxisWidget( this.timeAxis_PSEC, NORTH, { createTicker: ( ) => new TimeTicker( ), textAtlasCache } );
        this.southAxisWidget = new EdgeAxisWidget( this.timeAxis_PSEC, SOUTH, { createTicker: ( ) => new TimeTicker( ), textAtlasCache } );
        this.northAxisWidget.pane.addCssClass( 'north-axis' );
        this.southAxisWidget.pane.addCssClass( 'south-axis' );

        this.pane = new Pane( new RowsLayout( ) );
        appendChild( this.pane.peer, this.peer );
        this.pane.addCssClass( 'timeline' );
        this.pane.addPane( this.southAxisWidget.pane );
        this.pane.addPane( middlePane );
        this.pane.addPane( this.northAxisWidget.pane );
    }

    attachToRepaint( repaint: FireableListenable ): Disposer {
        return linkListenables( this.repaint, repaint );
    }

    getRootRows( ): ReadableLinkedMap<string,TimelineRow> {
        return this.rootRows;
    }

    getAllRows( ): ReadonlyMap<string,TimelineRow> {
        return this.allRows;
    }

    getVisibleRows( ): ReadableLinkedMap<string,TimelineRow> {
        const result = new LinkedMap<string,TimelineRow>( );
        for ( const key of this.gridLayout.visibleRowKeys ) {
            const row = this.getRow( key );
            if ( row ) {
                result.putLast( key, row );
            }
        }
        return result;
    }

    getVisibleNestedRows( ): IterableIterator<TimelineNestedRow> {
        const timeline = this;
        function* walkTree( rows: ReadonlyMap<string,TimelineRow>, nest: number ): IterableIterator<TimelineNestedRow> {
            for ( const row of rows.values( ) ) {
                if ( timeline.gridLayout.visibleRowKeys.has( row.key ) ) {
                    yield { row, nest };
                    if ( row.children && row.children.expanded ) {
                        yield* walkTree( row.children.rows, nest+1 );
                    }
                }
            }
        }
        return walkTree( this.rootRows, 0 );
    }

    getChildRows( key: string | undefined ): ReadableLinkedMap<string,TimelineRow> {
        return ( key === undefined ? this.rootRows : this.getRow( key )?.children?.rows ?? new LinkedMap( ) );
    }

    protected requireMutableChildRows( key: string | undefined, initIfMissing: boolean ): LinkedMap<string,TimelineRow> {
        if ( key === undefined ) {
            return this.rootRows;
        }
        else {
            const row = requireDefined( this.allRows.get( key ) );
            if ( row.children === undefined && initIfMissing ) {
                row.children = {
                    expanded: true,
                    rows: new LinkedMap( ),
                };
                updateExpandedCssClasses( row );
            }
            return requireDefined( row.children ).rows;
        }
    }

    hasRow( key: string ): boolean {
        return this.allRows.has( key );
    }

    getRow( key: string ): TimelineRow | undefined {
        return this.allRows.get( key );
    }

    getRowNest( key: string | undefined ): number {
        return ( key === undefined ? 0 : this.getRowNest( this.requireRow( key ).parentKey ) + 1 );
    }

    requireRow( key: string ): TimelineRow {
        return requireDefined( this.getRow( key ) );
    }

    isRowExpanded( key: string | undefined ): boolean {
        return ( key === undefined || !!this.requireRow( key ).children?.expanded );
    }

    addRow( key: string ): TimelineRow {
        if ( this.hasRow( key ) ) {
            throw new Error( 'Timeline row already exists: key = ' + key );
        }

        const labelLayout = new InsetLayout( );
        const labelPane = new Pane( labelLayout );
        labelPane.addCssClass( 'timeline-row-label' );
        setGridCoords( labelPane, key, 'Label' );
        attachParentOfClassesManager( labelPane );
        this.gridPane.addPane( labelPane );

        const dataLayout = new InsetLayout( );
        const dataPane = new Pane( dataLayout );
        dataPane.addCssClass( 'timeline-row-data' );
        setGridCoords( dataPane, key, 'Data' );
        attachParentOfClassesManager( dataPane );
        this.gridPane.addPane( dataPane );

        const row = {
            key,
            labelLayout,
            labelPane,
            dataLayout,
            dataPane,
            parentKey: undefined,
        };
        this.allRows.set( key, row );
        this.rootRows.putLast( key, row );

        this.repaint.fire( );

        return row;
    }

    removeRow( key: string ): void {
        const row = requireDefined( this.allRows.get( key ) );
        if ( row.children ) {
            for ( const childKey of row.children.rows.keys( ) ) {
                this.removeRow( childKey );
            }
        }
        this.gridPane.removePane( row.labelPane );
        this.gridPane.removePane( row.dataPane );
        this.requireMutableChildRows( row.parentKey, false ).delete( key );
        this.allRows.delete( key );
        this.repaint.fire( );
    }

    setRowParent( key: string, parentKey: string | undefined ): void {
        const row = requireDefined( this.allRows.get( key ) );
        if ( parentKey !== row.parentKey ) {
            this.requireMutableChildRows( row.parentKey, false ).delete( key );
            row.parentKey = parentKey;
            this.requireMutableChildRows( row.parentKey, true ).putLast( key, row, false );
            this.repaint.fire( );
        }
    }

    moveRowBefore( key: string, parentKey: string | undefined, siblingKey: string | undefined ): void {
        this.setRowParent( key, parentKey );
        this.requireMutableChildRows( parentKey, false ).moveBefore( key, siblingKey );
    }

    moveRowAfter( key: string, parentKey: string | undefined, siblingKey: string | undefined ): void {
        this.setRowParent( key, parentKey );
        this.requireMutableChildRows( parentKey, false ).moveAfter( key, siblingKey );
    }

    setRowExpanded( key: string, expanded: boolean ): void {
        const row = requireDefined( this.allRows.get( key ) );
        if ( row.children && expanded !== row.children.expanded ) {
            row.children.expanded = expanded;
            updateExpandedCssClasses( row );
            this.repaint.fire( );
        }
    }

    toggleRowExpanded( key: string ): void {
        const row = requireDefined( this.allRows.get( key ) );
        if ( row.children ) {
            row.children.expanded = !row.children.expanded;
            updateExpandedCssClasses( row );
            this.repaint.fire( );
        }
    }

    *getRowDescendants( key: string | undefined ): IterableIterator<string> {
        if ( key !== undefined ) {
            yield key;
        }
        for ( const childKey of this.getChildRows( key ).keys( ) ) {
            yield* this.getRowDescendants( childKey );
        }
    }

    getRowsInterval_PX( keys: Iterable<string> ): Interval1D | undefined {
        const viewports_PX = [ ...keys ].filter( key => this.gridLayout.visibleRowKeys.has( key ), this )
                                        .map( this.getRow, this )
                                        .filter( isDefined )
                                        .map( getRowVerticalViewport_PX );

        const min_PX = Math.min( ...viewports_PX.map( v => v.min ) );
        const max_PX = Math.max( ...viewports_PX.map( v => v.max ) );
        return ( min_PX <= max_PX ? Interval1D.fromEdges( min_PX, max_PX ) : undefined );
    }

    scrollToInterval( interval_PX: Interval1D ): void {
        let sectionMin_PX = interval_PX.min;
        let sectionMax_PX = interval_PX.max;
        if ( sectionMin_PX <= sectionMax_PX ) {
            const scrollerViewport_PX = this.scrollerPane.getViewport_PX( ).y;
            if ( scrollerViewport_PX.min > sectionMin_PX ) {
                const shift_PX = scrollerViewport_PX.min - sectionMin_PX;
                this.scrollerLayout.yOffset_PX += shift_PX;
                sectionMin_PX += shift_PX;
                sectionMax_PX += shift_PX;
                this.repaint.fire( );
            }
            if ( scrollerViewport_PX.max < sectionMax_PX ) {
                const shift_PX = scrollerViewport_PX.max - sectionMax_PX;
                this.scrollerLayout.yOffset_PX += shift_PX;
                sectionMin_PX += shift_PX;
                sectionMax_PX += shift_PX;
                this.repaint.fire( );
            }
        }
    }

    scrollToRows( keys: ReadonlyArray<string> ): void {
        const interval_PX = this.getRowsInterval_PX( keys )
        if ( interval_PX ) {
            this.scrollToInterval( interval_PX );
        }
    }

    createExpandCollapseInputHandler( key: string ): InputHandler {
        const timeline = this;
        const target = newImmutableList( [ 'RowExpandCollapse', timeline, key ] );
        const getMouseCursorClasses = frozenSupplier( [ 'clickable' ] );
        return {
            getHoverHandler( ): Nullable<HoverHandler> {
                return {
                    target,
                    getMouseCursorClasses,
                };
            },
            getDragHandler( ): Nullable<DragHandler> {
                return {
                    target,
                    getMouseCursorClasses,
                    handleGrab( ): void {
                        timeline.toggleRowExpanded( key );
                        // Scroll to reveal newly expanded rows
                        if ( timeline.isRowExpanded( key ) && timeline.getChildRows( key ).size > 0 ) {
                            // Redo the layout first, so newly expanded rows have valid
                            // viewports, and scrollLayout has a valid content height
                            timeline.pane._doLayout( );
                            const section_PX = timeline.getRowsInterval_PX( timeline.getRowDescendants( key ) );
                            if ( section_PX ) {
                                // We got a mouse click on the section's top row, so that row must
                                // already be at least partly visible -- and in that case it feels
                                // best to allow the top to stay where it is, instead of revealing
                                // the full height of the (already partly visible) top row
                                const revealMin_PX = section_PX.min;
                                const revealMax_PX = Math.min( section_PX.max, timeline.gridPane.getScissor_PX( ).y.max );
                                timeline.scrollToInterval( Interval1D.fromEdges( revealMin_PX, revealMax_PX ) );
                            }
                        }
                    },
                };
            }
        };
    }

    createRowDragInputHandler( key: string ): InputHandler {
        // TODO: Maybe show ephemeral child rows in empty/collapsed sections
        // TODO: Maybe expand a section when it's hovered for a while by a row-drag
        // TODO: Maybe scroll when a row-drag goes above/below scroll viewport
        const timeline = this;
        const target = newImmutableList( [ 'RowDrag', timeline, key ] );
        const getMouseCursorClasses = frozenSupplier( [ 'draggable' ] );
        return {
            getHoverHandler( ): Nullable<HoverHandler> {
                return {
                    target,
                    getMouseCursorClasses,
                };
            },
            getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
                if ( evGrab.button === 0 ) {
                    const allowSite = timeline.dragSiteFilter( timeline, key );
                    return {
                        target,
                        getMouseCursorClasses,
                        handleDrag( evDrag: PaneMouseEvent ): void {
                            const site = timeline.findDragSite( key, evDrag, allowSite );
                            if ( site ) {
                                timeline.dragSitePainter.bar = {
                                    yCenter_PX: site.coord_PX,
                                    xIndent_PX: timeline.getRowNest( site.parentKey ) * timeline.nestIndent_LPX.get( ) * currentDpr( timeline ),
                                };
                                timeline.repaint.fire( );
                            }
                        },
                        handleUngrab( evUngrab: PaneMouseEvent ): void {
                            const site = timeline.findDragSite( key, evUngrab, allowSite );
                            if ( site ) {
                                timeline.moveRowBefore( key, site.parentKey, site.keyBelow );
                                timeline.dragSitePainter.bar = null;
                                timeline.repaint.fire( );
                            }
                        }
                    };
                }
                return null;
            },
        };
    }

    protected findDragSite( key: string, mouse: { loc_PX: Point2D }, allowSite: AllowSiteFn ): DragSite | undefined {
        // Never allow drags that would make a row its own descendant
        const descendants = new Set( this.getRowDescendants( key ) );
        const sites = [ ...this.getDragSites( ( parentKey, keyBelow ) => {
            return ( ( parentKey === undefined || !descendants.has( parentKey ) ) && allowSite( parentKey, keyBelow ) );
        } ) ];

        // Couple of unusual things about the code below:
        //  1. findIndexNearest doesn't give us enough control of behavior when two
        //     coords are equal, so use a different findIndex fn, and do additional
        //     checking afterwards
        //  2. The index may be outside the array bounds, so the array lookup may
        //     return undefined -- which is fine, but we have to explicitly tell
        //     the type checker that it's a possibility
        const mouse_PX = mouse.loc_PX.y;
        const siteIndexAbove = findIndexAtOrAfter( sites, site => site.coord_PX - mouse_PX );
        const siteAbove = sites[ siteIndexAbove ] as DragSite | undefined;
        const siteBelow = sites[ siteIndexAbove - 1 ] as DragSite | undefined;
        if ( siteAbove !== undefined && siteBelow !== undefined ) {
            const missAbove_PX = Math.abs( siteAbove.coord_PX - mouse_PX );
            const missBelow_PX = Math.abs( siteBelow.coord_PX - mouse_PX );
            return ( missBelow_PX <= missAbove_PX ? siteBelow : siteAbove );
        }
        else if ( siteBelow !== undefined ) {
            // We're above the top of the top row
            return siteBelow;
        }
        else if ( siteAbove !== undefined ) {
            // We're below the bottom of the bottom row
            return siteAbove;
        }
        else {
            // There are no allowed sites, so don't allow drag
            return undefined;
        }
    }

    protected getDragSites( allowSite: AllowSiteFn ): IterableIterator<DragSite> {
        const timeline = this;
        function* walkTree( parentKey: string | undefined ): IterableIterator<DragSite> {
            const rows = timeline.getChildRows( parentKey );

            // First add the site at the bottom of the section
            const sectionViewport_PX = timeline.getRowsInterval_PX( timeline.getRowDescendants( parentKey ) );
            if ( sectionViewport_PX && allowSite( parentKey, undefined ) ) {
                yield {
                    parentKey,
                    keyBelow: undefined,
                    coord_PX: sectionViewport_PX.min,
                };
            }

            // Then add the sites associated with each row
            for ( const row of rows.valuesInReverse( ) ) {
                // Add sites associated with child rows
                if ( row.children && row.children.expanded ) {
                    yield* walkTree( row.key );
                }

                // Add the site at the top of the row
                const rowViewport_PX = getRowVerticalViewport_PX( row );
                if ( rowViewport_PX && allowSite( parentKey, row.key ) ) {
                    yield {
                        parentKey,
                        keyBelow: row.key,
                        coord_PX: rowViewport_PX.max,
                    };
                }
            }
        }
        return walkTree( undefined );
    }
}

export function attachTimeCursor_PSEC( timeline: HorizontalTimeline, timeCursor_PSEC: Ref<number | null | undefined> ): Disposer {
    const disposers = new DisposerGroup( );

    const { timeAxis_PSEC, pane, repaint } = timeline;

    const cursorPainter = new CursorPainter( timeAxis_PSEC, X );
    disposers.add( pane.addPainter( cursorPainter, +999 ) );

    disposers.add( timeCursor_PSEC.addListener( IMMEDIATE, ( ) => {
        cursorPainter.coord = timeCursor_PSEC.v ?? undefined;
        repaint.fire( );
    } ) );

    const cursorHoveredRef = new RefBasic<boolean>( false, tripleEquals );
    const cursorInputHandler = createAxisCursorInputHandler1D( timeAxis_PSEC, X, timeCursor_PSEC, cursorHoveredRef );
    disposers.add( pane.addInputHandler( cursorInputHandler, +999 ) );

    disposers.add( cursorHoveredRef.addListener( IMMEDIATE, ( ) => {
        cursorPainter.hovered = cursorHoveredRef.v;
        timeline.repaint.fire( );
    } ) );

    return disposers;
}

function attachParentOfClassesManager( pane: Pane ): Disposer {
    let oldClasses = new Set<string>( );
    const updateClasses: LayoutPrepFn = children => {
        const newClasses = new Set<string>( );
        for ( const child of children ) {
            for ( const cssClass of child.peer.classList ) {
                newClasses.add( `parent-of--${cssClass}` );
            }
        }
        for ( const oldClass of oldClasses ) {
            if ( !newClasses.has( oldClass ) ) {
                pane.removeCssClass( oldClass );
            }
        }
        for ( const newClass of newClasses ) {
            if ( !oldClasses.has( newClass ) ) {
                pane.addCssClass( newClass );
            }
        }
        oldClasses = newClasses;
    };
    pane.layout.prepFns!.addFirst( updateClasses );
    return ( ) => {
        pane.layout.prepFns!.delete( updateClasses );
    };
}

export class HorizontalDragSitePainter implements Painter {
    readonly peer = createDomPeer( 'drag-site-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(255,0,0)' );
    readonly width_LPX = StyleProp.create( this.style, '--width-px', cssFloat, 3 );

    readonly visible = new RefBasic( true, tripleEquals );

    bar: Nullable<{
        yCenter_PX: number;
        xIndent_PX: number;
    }>;

    protected readonly fillPainter: FillPainter;

    constructor( ) {
        this.bar = null;
        this.fillPainter = new FillPainter( );
        this.fillPainter.color.getOverride = ( ) => this.color.get( );
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        if ( this.bar !== null ) {
            const gl = context.gl;
            try {
                const width_LPX = this.width_LPX.get( );
                const width_PX = width_LPX * currentDpr( this );
                const fillViewport_PX = Interval2D.fromEdges(
                    viewport_PX.xMin + Math.round( this.bar.xIndent_PX ),
                    viewport_PX.xMax,
                    Math.round( this.bar.yCenter_PX - 0.5*width_PX ),
                    Math.round( this.bar.yCenter_PX + 0.5*width_PX ),
                );
                glViewport( gl, fillViewport_PX );
                this.fillPainter.paint( context, fillViewport_PX );
            }
            finally {
                glViewport( gl, viewport_PX );
            }
        }
    }

    dispose( context: Context ): void {
        this.fillPainter.dispose( context );
    }
}

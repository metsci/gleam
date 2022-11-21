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
import { ChildlessLayout, Color, ColumnsLayout, cssColor, cssString, currentDpr, DEFAULT_CHARS, estimateFontMetrics, ImagePainter, InsetLayout, isfn, Painter, Pane, StyleProp, TextLabel, ValueBase2 } from '@metsci/gleam-core';
import { requireNonNull, Supplier } from '@metsci/gleam-util';
import { HorizontalTimeline, TimelineRow } from './timeline';

/**
 * Adds a timeline row with a text label, a simple expand/collapse symbol, and
 * the specified data panes and painters. Row draggability is governed by the
 * timeline's `HorizontalTimeline.dragSiteFilter`.
 *
 * This is simple and convenient, and covers most use-cases. However, timelines
 * aren't limited to this kind of row; adding rows to a timeline directly
 * offers more flexibility than this fn allows (e.g. custom row labels, custom
 * mouse listeners, etc.).
 */
export function addRow( timeline: HorizontalTimeline, key: string, name: string, dataPainters: Iterable<Painter | Supplier<Painter>>, dataPanes: Iterable<Pane>, parentKey?: string ): TimelineRow {
    const row = timeline.addRow( key );
    timeline.setRowParent( key, parentKey );

    const symbolLabel = new RowSymbolLabel( row );
    symbolLabel.pane.addCssClass( 'timeline-row-label-symbol' );
    symbolLabel.pane.addInputHandler( timeline.createExpandCollapseInputHandler( key ) );

    const nameLabel = new TextLabel( name );
    nameLabel.pane.addCssClass( 'timeline-row-label-name' );

    const columnsPane = new Pane( new ColumnsLayout( ) );
    columnsPane.addCssClass( 'timeline-row-label-columns' );
    columnsPane.addPane( symbolLabel.pane );
    columnsPane.addPane( nameLabel.pane );

    const insetPane = new Pane( new InsetLayout( ) );
    insetPane.addCssClass( 'timeline-row-label-inset' );
    insetPane.addPane( columnsPane );

    row.labelPane.addInputHandler( timeline.createRowDragInputHandler( key ) );
    row.labelPane.addPane( insetPane );

    for ( const dataPainter of dataPainters ) {
        const painter = ( isfn( dataPainter ) ? dataPainter( ) : dataPainter );
        row.dataPane.addPainter( painter );
    }

    for ( const dataPane of dataPanes ) {
        row.dataPane.addPane( dataPane );
    }

    return row;
}

/**
 * A contraption for expanding/collapsing a row.
 */
 export class RowSymbolLabel {
    readonly insetLayout = new InsetLayout( );
    readonly pane = new Pane( this.insetLayout );
    readonly style = window.getComputedStyle( this.pane.peer );

    readonly symbolLayout: ChildlessLayout;
    readonly symbolPainter: RowSymbolPainter;
    readonly symbolPane: Pane;

    constructor( row: TimelineRow ) {
        this.symbolPainter = new RowSymbolPainter( row );
        this.symbolLayout = new ChildlessLayout( );
        this.symbolLayout.prefWidth_LPX.getOverride = ( ) => {
            const image = this.symbolPainter.getImage( );
            const imageWidth_PX = image.imageData.width - 2*image.border;
            return ( imageWidth_PX / currentDpr( this.pane ) );
        };
        this.symbolLayout.prefHeight_LPX.getOverride = ( ) => {
            const image = this.symbolPainter.getImage( );
            const imageHeight_PX = image.imageData.height - 2*image.border;
            return ( imageHeight_PX / currentDpr( this.pane ) );
        };
        this.symbolPane = new Pane( this.symbolLayout );
        this.symbolPane.addPainter( this.symbolPainter );

        this.pane.peer.classList.add( 'label' );
        this.pane.addPane( this.symbolPane );
    }
}

enum RowState {
    CHILDREN_NONE,
    CHILDREN_COLLAPSED,
    CHILDREN_EXPANDED,
}

class RowSymbolInputs extends ValueBase2 {
    constructor(
        readonly dpr: number,
        readonly font: string,
        readonly color: Color,
        readonly state: RowState,
    ) {
        super( );
    }
}

class RowSymbolPainter extends ImagePainter<RowSymbolInputs> {
    readonly font = StyleProp.create( this.style, '--font', cssString, '13px sans-serif' );
    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(127,127,127)' );

    protected readonly canvas: HTMLCanvasElement = document.createElement( 'canvas' );

    constructor( row: TimelineRow ) {
        super( {
            createInputs: ( ) => {
                const state = ( row.children ? ( row.children.expanded ? RowState.CHILDREN_EXPANDED : RowState.CHILDREN_COLLAPSED ) : RowState.CHILDREN_NONE );
                return new RowSymbolInputs( currentDpr( this ), this.font.get( ), this.color.get( ), state );
            },
            createImage: ( { dpr, font, color, state } ) => {
                const border_PX = 1;
                const leftPadding_PX = Math.ceil( 0.75 * dpr );
                const { ascent_PX, descent_PX } = estimateFontMetrics( dpr, font, DEFAULT_CHARS );

                const g = requireNonNull( this.canvas.getContext( '2d', { willReadFrequently: true } ) );
                g.font = font;
                g.textAlign = 'left';
                g.textBaseline = 'alphabetic';
                const wContent_PX = Math.ceil( ascent_PX );
                const hContent_PX = Math.ceil( ascent_PX + descent_PX );
                const wImage_PX = leftPadding_PX + border_PX + wContent_PX + border_PX;
                const hImage_PX = border_PX + hContent_PX + border_PX;
                this.canvas.width = wImage_PX;
                this.canvas.height = hImage_PX;

                // Context forgets its settings when canvas size changes
                g.font = font;
                g.textAlign = 'left';
                g.textBaseline = 'alphabetic';
                const yBaseline_PX = border_PX + ascent_PX;

                g.clearRect( 0, 0, wImage_PX, hImage_PX );

                switch ( state ) {
                    case RowState.CHILDREN_NONE: {
                        // Leave it blank
                    }
                    break;

                    case RowState.CHILDREN_COLLAPSED: {
                        g.save( );
                        g.translate( border_PX + leftPadding_PX, border_PX );
                        try {
                            // Ascent estimate seems to come out 1px larger than reality
                            const side_PX = ascent_PX - 1;
                            const xCenter_PX = 0.5*side_PX;
                            const yCenter_PX = 0.5*side_PX;

                            g.lineWidth = 1;
                            g.lineJoin = 'miter';
                            g.miterLimit = 99;

                            g.beginPath( );
                            g.moveTo( xCenter_PX - 0.25*side_PX, yCenter_PX );
                            g.lineTo( xCenter_PX - 0.25*side_PX, yCenter_PX - 0.5*side_PX + 0.25 );
                            g.lineTo( xCenter_PX + 0.25*side_PX, yCenter_PX );
                            g.lineTo( xCenter_PX - 0.25*side_PX, yCenter_PX + 0.5*side_PX - 0.25 );
                            g.lineTo( xCenter_PX - 0.25*side_PX, yCenter_PX );
                            g.closePath( );
                            g.fillStyle = color.cssString;
                            g.fill( );
                        }
                        finally {
                            g.restore( );
                        }
                    }
                    break;

                    case RowState.CHILDREN_EXPANDED: {
                        g.save( );
                        g.translate( border_PX + leftPadding_PX, border_PX );
                        try {
                            // Ascent estimate seems to come out 1px larger than reality
                            const side_PX = ascent_PX - 1;
                            const xCenter_PX = 0.5*side_PX;
                            const yCenter_PX = 0.5*side_PX;

                            g.lineWidth = 1;
                            g.lineJoin = 'miter';
                            g.miterLimit = 99;

                            g.beginPath( );
                            g.moveTo( xCenter_PX                     , yCenter_PX - 0.25*side_PX );
                            g.lineTo( xCenter_PX + 0.5*side_PX - 0.25, yCenter_PX - 0.25*side_PX );
                            g.lineTo( xCenter_PX                     , yCenter_PX + 0.25*side_PX );
                            g.lineTo( xCenter_PX - 0.5*side_PX + 0.25, yCenter_PX - 0.25*side_PX );
                            g.lineTo( xCenter_PX                     , yCenter_PX - 0.25*side_PX );
                            g.closePath( );
                            g.fillStyle = color.cssString;
                            g.fill( );

                        }
                        finally {
                            g.restore( );
                        }
                    }
                    break;
                }

                return {
                    w: this.canvas.width,
                    h: this.canvas.height,
                    xAnchor: border_PX,
                    yAnchor: yBaseline_PX,
                    border: border_PX,
                    imageData: g.getImageData( 0, 0, this.canvas.width, this.canvas.height ),
                };
            },
        } );
    }
}

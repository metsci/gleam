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
import { LayoutBase, Pane } from '../core';
import { cssInset, currentDpr, Inset, Interval2D, roundInset, scaleInset, Size2D, StyleProp } from '../support';

export function createInsetPane( child: Pane, cssClasses: Iterable<string> = [] ): Pane {
    const pane = new Pane( new InsetLayout( ) );
    for ( const cssClass of cssClasses ) {
        pane.addCssClass( cssClass );
    }
    pane.addPane( child );
    return pane;
}

export class InsetLayout extends LayoutBase {
    readonly inset_LPX = StyleProp.create( this.style, '--inset-px', cssInset, '0 0 0 0' );

    constructor( ) {
        super( 'inset-layout' );
    }

    getInset_PX( ): Inset {
        return roundInset( scaleInset( this.inset_LPX.get( ), currentDpr( this ) ) );
    }

    computePrefSize_PX( children: Iterable<Pane> ): Size2D {
        let maxPrefWidth_PX = 0;
        let maxPrefHeight_PX = 0;
        for ( const child of children ) {
            if ( child.isVisible( ) ) {
                maxPrefWidth_PX = Math.max( maxPrefWidth_PX, child.getPrefSize_PX( ).w );
                maxPrefHeight_PX = Math.max( maxPrefHeight_PX, child.getPrefSize_PX( ).h );
            }
        }

        const inset_PX = this.getInset_PX( );
        const w_PX = inset_PX.left + Math.ceil( maxPrefWidth_PX ) + inset_PX.right;
        const h_PX = inset_PX.top + Math.ceil( maxPrefHeight_PX ) + inset_PX.bottom;
        return new Size2D( w_PX, h_PX );
    }

    computeChildViewports_PX( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D> {
        const inset_PX = this.getInset_PX( );
        const xMin_PX = viewport_PX.xMin + inset_PX.left;
        const xMax_PX = viewport_PX.xMax - inset_PX.right;
        const yMin_PX = viewport_PX.yMin + inset_PX.bottom;
        const yMax_PX = viewport_PX.yMax - inset_PX.top;
        const childViewport_PX = Interval2D.fromEdges( xMin_PX, xMax_PX, yMin_PX, yMax_PX );

        const childViewports_PX = new Map<Pane,Interval2D>( );
        for ( const child of children ) {
            if ( child.isVisible( ) ) {
                childViewports_PX.set( child, childViewport_PX );
            }
        }
        return childViewports_PX;
    }
}

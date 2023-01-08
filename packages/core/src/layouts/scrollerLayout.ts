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
import { Interval2D, Size2D } from '@metsci/gleam-util';
import { LayoutBase, Pane } from '../core';

export class VerticalScrollerLayout extends LayoutBase {
    yOffset_PX: number;
    hContent_PX: number;
    hVisible_PX: number;

    constructor( ) {
        super( 'vertical-scroller-layout' );
        this.yOffset_PX = 0;
        this.hContent_PX = 0;
        this.hVisible_PX = 0;
    }

    computePrefSize_PX( children: Iterable<Pane> ): Size2D {
        return ( getScrollerChild( children )?.getPrefSize_PX( ) ?? Size2D.ZERO );
    }

    computeChildViewports_PX( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D> {
        const childViewports_PX = new Map<Pane,Interval2D>( );
        const child = getScrollerChild( children );
        if ( child ) {
            const hChild_PX = Math.max( child.getPrefSize_PX( ).h, viewport_PX.h );

            let yChildMin_PX;
            if ( hChild_PX <= viewport_PX.h ) {
                yChildMin_PX = viewport_PX.yMax - hChild_PX;
            }
            else {
                yChildMin_PX = Math.min( viewport_PX.yMin, viewport_PX.yMax - hChild_PX + Math.max( 0, this.yOffset_PX ) );
            }

            childViewports_PX.set( child, viewport_PX.withYEdges( yChildMin_PX, yChildMin_PX + hChild_PX ) );

            this.yOffset_PX = ( yChildMin_PX + hChild_PX ) - viewport_PX.yMax;
            this.hContent_PX = hChild_PX;
            this.hVisible_PX = viewport_PX.h;
        }
        return childViewports_PX;
    }
}

function getScrollerChild( children: Iterable<Pane> ): Pane | null {
    const visibles = [] as Array<Pane>;
    for ( const child of children ) {
        if ( child.isVisible( ) ) {
            visibles.push( child );
        }
    }

    if ( visibles.length > 1 ) {
        throw new Error( 'Scroller layout only works with 1 visible child, but pane has ' + visibles.length );
    }
    else if ( visibles.length === 1 ) {
        return visibles[0];
    }
    else {
        return null;
    }
}

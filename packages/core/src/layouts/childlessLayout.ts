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
import { Interval2D, LinkedSet, Size2D } from '@metsci/gleam-util';
import { Layout, LayoutPrepFn, Pane } from '../core';
import { createDomPeer, cssFloat, currentDpr, PeerType, StyleProp } from '../support';

/**
 * Simple layout for panes that have no child panes.
 */
// Avoid a circular dependency with Pane, by not extending LayoutBase
export class ChildlessLayout implements Layout {
    readonly peer = createDomPeer( 'childless-layout', this, PeerType.LAYOUT );
    readonly style = window.getComputedStyle( this.peer );

    readonly prefWidth_LPX = StyleProp.create( this.style, '--pref-width-px', cssFloat, 0 );
    readonly prefHeight_LPX = StyleProp.create( this.style, '--pref-height-px', cssFloat, 0 );

    readonly prepFns = new LinkedSet<LayoutPrepFn>( );

    computePrefSize_PX( ): Size2D {
        const dpr = currentDpr( this );
        const width_PX = this.prefWidth_LPX.get( ) * dpr;
        const height_PX = this.prefHeight_LPX.get( ) * dpr;
        return new Size2D( width_PX, height_PX );
    }

    computeChildViewports_PX( ): Map<Pane,Interval2D> {
        return new Map( );
    }
}

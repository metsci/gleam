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
import { createDomPeer, PeerType, Styleable } from '../support';
import { Pane } from './pane';

export interface ComputeChildViewportsFn {
    ( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D>;
}

export interface LayoutPrepFn {
    ( children: Iterable<Pane> ): unknown;
}

export interface Layout extends Styleable {
    /**
     * Fns to invoke at the start of each layout execution. One anticipated use for
     * this mechanism is auto-updating state that will be used by `computePrefSize_PX`
     * and `computeChildViewports_PX`.
     */
    readonly prepFns: LinkedSet<LayoutPrepFn>;

    /**
     * Returns the preferred size for a pane, given its child panes.
     *
     * If this method is undefined, the pane's preferred size will be set to zero. In
     * most cases this will make the pane invisible. However, there are cases where
     * preferred sizes are ignored: the parent layout is allowed to use or ignore pref
     * sizes as it chooses, and the top-level pane attached to a canvas is always set
     * to the size of the canvas.
     *
     * Called *after* the preferred sizes of the children have been updated. Impls
     * of this method can take children's preferred sizes into account by calling
     * `child.getPrefSize_PX()`.
     */
    computePrefSize_PX?( children: Iterable<Pane> ): Size2D;

    /**
     * Returns viewports for a pane's children, given the pane's own viewport.
     *
     * Called after all preferred sizes have been updated. Impls of this method may
     * use the children's pref sizes any way it chooses, or ignore them altogether.
     *
     * Impls of this method may return child viewports that are larger than the pane's
     * own viewport. In such a case the child will be painted to the larger viewport,
     * but only the intersection with the pane's own viewport will be visible.
     * `VerticalScrollerLayout` uses this technique.
     *
     * Impls of this method may return child viewports that overlap each other.
     *
     * Impls of this method may omit one or more children from the returned map,
     * causing them not to be painted.
     *
     * If the returned map contains panes that weren't passed in in the `children` arg,
     * those panes will be ignored by the caller.
     */
    computeChildViewports_PX( viewport_PX: Interval2D, children: Iterable<Pane> ): Map<Pane,Interval2D>;
}

export abstract class LayoutBase implements Layout {
    readonly peer: HTMLElement;
    readonly style: CSSStyleDeclaration;

    readonly prepFns = new LinkedSet<LayoutPrepFn>( );

    constructor( peerTag: string ) {
        this.peer = createDomPeer( peerTag, this, PeerType.LAYOUT );
        this.style = window.getComputedStyle( this.peer );
    }

    abstract computeChildViewports_PX(viewport_PX: Interval2D, children: Iterable<Pane>): Map<Pane, Interval2D>;
}

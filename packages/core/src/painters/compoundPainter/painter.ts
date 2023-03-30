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
import { appendChild, Disposer, DisposerGroup, Interval2D, RefBasic, tripleEquals } from '@metsci/gleam-util';
import { Context, Painter } from '../../core';
import { createDomPeer, PeerType } from '../../support';
import { ArrayWithZIndices } from '../../util';

export class CompoundPainter implements Painter {
    readonly peer = createDomPeer( 'compound-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly visible = new RefBasic( true, tripleEquals );

    protected readonly painters: ArrayWithZIndices<Painter>;

    constructor( painters: Iterable<Painter> = [] ) {
        this.painters = new ArrayWithZIndices( );
        for ( const painter of painters ) {
            this.addPainter( painter );
        }
    }

    addPainter( painter: Painter, zIndex: number = 0 ): Disposer {
        const disposers = new DisposerGroup( );
        disposers.add( appendChild( this.peer, painter.peer ) );
        disposers.add( this.painters.add( painter, zIndex ) );
        return disposers;
    }

    getPainters( ): Iterable<Painter> {
        return this.painters;
    }

    hasPainter( painter: Painter ): boolean {
        return this.painters.has( painter );
    }

    getPainterZIndex( painter: Painter ): number {
        return this.painters.getZIndex( painter );
    }

    setPainterZIndex( painter: Painter, zIndex: number ): void {
        this.painters.setZIndex( painter, zIndex );
    }

    /**
     * **NOTE:** Does NOT dispose the painter.
     */
    removePainter( painter: Painter ): void {
        this.painters.delete( painter );
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        for ( const painter of this.painters ) {
            if ( painter.visible.v ) {
                painter.paint( context, viewport_PX );
            }
        }
    }

    /**
     * Disposes all painters.
     */
    dispose( context: Context ): void {
        for ( const painter of this.painters ) {
            painter.dispose( context );
        }
        this.painters.clear( );
    }
}

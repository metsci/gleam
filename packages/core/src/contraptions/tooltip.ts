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
import { clamp } from '@metsci/gleam-util';
import { cssFloat, currentDpr, Point2D, StyleProp } from '../support';

export class TooltipDiv {
    readonly div = document.createElement( 'div' );
    readonly style = window.getComputedStyle( this.div );

    readonly xOffset_LPX = StyleProp.create( this.style, '--x-offset-px', cssFloat, 3 );
    readonly yOffset_LPX = StyleProp.create( this.style, '--y-offset-px', cssFloat, 3 );

    constructor( ) {
        this.div.classList.add( 'tooltip' );
        this.div.style.position = 'absolute';
        this.div.style.display = 'none';
    }

    setPosition( loc_PX: Point2D ): void {
        const currWindow = this.div.ownerDocument?.defaultView;
        if ( currWindow ) {
            const xOffset_LPX = this.xOffset_LPX.get( );
            const yOffset_LPX = this.yOffset_LPX.get( );

            const dpr = currentDpr( currWindow );
            const maxLeft_LPX = currWindow.innerWidth - this.div.offsetWidth;
            const maxBottom_LPX = currWindow.innerHeight - this.div.offsetHeight;
            const left_LPX = clamp( 0, maxLeft_LPX, loc_PX.x/dpr + xOffset_LPX );
            const bottom_LPX = clamp( 0, maxBottom_LPX, loc_PX.y/dpr + yOffset_LPX );
            this.div.style.left = `${left_LPX}px`;
            this.div.style.bottom = `${bottom_LPX}px`;
        }
    }

    setText( text: string ): void {
        this.div.textContent = text;
    }

    setVisible( visible: boolean ): void {
        this.div.style.display = ( visible ? 'block' : 'none' );
    }

    show( loc_PX: Point2D, text: string ): void {
        this.setPosition( loc_PX );
        this.setText( text );
        this.setVisible( true );
    }

    hide( ): void {
        this.setVisible( false );
    }
}

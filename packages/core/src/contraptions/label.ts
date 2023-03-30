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
import { isDefined } from '@metsci/gleam-util';
import { Pane } from '../core';
import { ChildlessLayout } from '../layouts/childlessLayout';
import { InsetLayout } from '../layouts/insetLayout';
import { ImagePainter } from '../painters/imagePainter';
import { Color, createTextImage, cssColor, cssString, currentDpr, DEFAULT_CHARS, estimateFontMetrics, StyleProp, TRANSPARENT, ValueBase2 } from '../support';

export class TextInputs extends ValueBase2 {
    constructor(
        readonly dpr: number,
        readonly font: string,
        readonly color: Color,
        readonly text: string,
        readonly prefix: string,
        readonly suffix: string,
    ) {
        super( );
    }
}

export class TextPainter extends ImagePainter<TextInputs> {
    readonly font = StyleProp.create( this.style, '--font', cssString, '13px sans-serif' );
    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(0,0,0)' );
    readonly prefix = StyleProp.create( this.style, '--prefix', cssString, '' );
    readonly text = StyleProp.create( this.style, '--text', cssString, '' );
    readonly suffix  = StyleProp.create( this.style, '--suffix', cssString, '' );

    constructor( ) {
        super( {
            createInputs: ( ) => {
                return new TextInputs( currentDpr( this ), this.font.get( ), this.color.get( ), this.text.get( ), this.prefix.get( ), this.suffix.get( ) );
            },
            createImage: ( { dpr, font, color, text, prefix, suffix } ) => {
                const metrics = estimateFontMetrics( dpr, font, DEFAULT_CHARS );
                return createTextImage( dpr, font, metrics, 1, color.cssString, TRANSPARENT.cssString, prefix + text + suffix );
            },
        } );
    }
}

export class TextLabel {
    readonly insetLayout = new InsetLayout( );
    readonly pane = new Pane( this.insetLayout );
    readonly style = window.getComputedStyle( this.pane.peer );

    readonly textLayout: ChildlessLayout;
    readonly textPainter: TextPainter;
    readonly textPane: Pane;

    constructor( text?: string ) {
        this.textPainter = new TextPainter( );
        if ( isDefined( text ) ) {
            this.textPainter.text.override = text;
        }

        this.textLayout = new ChildlessLayout( );
        this.textLayout.prefWidth_LPX.getOverride = ( ) => {
            const image = this.textPainter.getImage( );
            const prefWidth_PX = image.imageData.width - 2*image.border;
            return ( prefWidth_PX / currentDpr( this.pane ) );
        };
        this.textLayout.prefHeight_LPX.getOverride = ( ) => {
            const image = this.textPainter.getImage( );
            const prefHeight_PX = image.imageData.height - 2*image.border;
            return ( prefHeight_PX / currentDpr( this.pane ) );
        };
        this.textPane = new Pane( this.textLayout );
        this.textPane.addPainter( this.textPainter );

        this.pane.addCssClass( 'label' );
        this.pane.addPane( this.textPane );
    }
}

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
import { AnchoredImage, BLACK, BLUE, Color, createDomPeer, cssColor, cssFloat, CssParser, currentDpr, CYAN, GRAY, GREEN, MAGENTA, parseColor, PeerType, RED, StyleProp, UNPARSEABLE, ValueBase, YELLOW } from '@metsci/gleam-core';
import { findIndexAtOrBefore, ImmutableList, isNonNullish, mod, newImmutableList, newImmutableMap, requireDefined, requireNonNull, run, Supplier, ValueObject } from '@metsci/gleam-util';

export const STANDARD_PATTERN_GENS = newImmutableMap<string,Supplier<Pattern>>( [
    [ 'solid', ( ) => new SolidPattern( ) ],
    [ 'striped', ( ) => new StripedPattern( ) ],
    [ 'test', ( ) => new TestPattern( ) ],
] );

export interface Pattern {
    readonly peer: HTMLElement;
    readonly style: CSSStyleDeclaration;

    createRasterizer( laneHeight_LPX: number, maxDim_PX: number ): PatternRasterizer;
}

export interface PatternRasterizer extends ValueObject {
    createImage( ): AnchoredImage;
}

export class FrozenPattern implements Pattern {
    readonly peer: HTMLElement;
    readonly style: CSSStyleDeclaration;

    readonly rasterizer: PatternRasterizer;

    constructor( peerTag: string, rasterizer: PatternRasterizer ) {
        this.peer = createDomPeer( peerTag, this, PeerType.OTHER );
        this.style = window.getComputedStyle( this.peer );
        this.rasterizer = rasterizer;
    }

    createRasterizer( ): PatternRasterizer {
        return this.rasterizer;
    }
}

export class SolidPattern implements Pattern {
    readonly peer = createDomPeer( 'solid-pattern', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(127,127,127)' );

    createRasterizer( ): PatternRasterizer {
        return new SolidPatternRasterizer( this.color.get( ) );
    }
}

export class SolidPatternRasterizer extends ValueBase implements PatternRasterizer {
    constructor(
        readonly color: Color
    ) {
        super( 'SolidPatternRasterizer', color );
    }

    createImage( ): AnchoredImage {
        const border_PX = 1;

        const canvas = document.createElement( 'canvas' );
        canvas.width = border_PX + 1 + border_PX;
        canvas.height = border_PX + 1 + border_PX;
        const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
        g.clearRect( 0, 0, canvas.width, canvas.height );
        g.fillStyle = this.color.cssString;
        g.fillRect( border_PX, border_PX, 1, 1 );

        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData( 0, 0, canvas.width, canvas.height ),
        };
    }
}

export class StripedPattern implements Pattern {
    readonly peer = createDomPeer( 'striped-pattern', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly angle_MATHDEG = StyleProp.create( this.style, '--angle-mathdeg', cssFloat, -45 );
    readonly lateralShift_LPX = StyleProp.create( this.style, '--lateral-shift-px', cssFloat, 0 );
    readonly stripes = StyleProp.create( this.style, '--stripes', cssStripesArray, '5px rgb(255,255,255), 6px rgb(127,127,127)' );

    createRasterizer( laneHeight_LPX: number, maxDim_PX: number ): PatternRasterizer {
        return new StripedPatternRasterizer(
            currentDpr( this ),
            this.angle_MATHDEG.get( ),
            this.lateralShift_LPX.get( ),
            laneHeight_LPX,
            maxDim_PX,
            newImmutableList( this.stripes.get( ) ),
        );
    }
}

export class StripedPatternRasterizer extends ValueBase implements PatternRasterizer {
    constructor(
        readonly dpr: number,
        readonly angle_MATHDEG: number,
        readonly lateralShift_LPX: number,
        readonly laneHeight_LPX: number,
        readonly maxDim_PX: number,
        readonly stripes: ImmutableList<Stripe>,
    ) {
        super( 'StripedPatternRasterizer', dpr, angle_MATHDEG, lateralShift_LPX, laneHeight_LPX, maxDim_PX, stripes );
    }

    createImage( ): AnchoredImage {
        // This fn uses "u" for along-stripe coords, and "v" for across-stripe coords

        const { stripes, vPeriod_PX } = run( ( ) => {
            let vSum_PX = 0;
            for ( const stripe of this.stripes ) {
                vSum_PX += this.dpr*stripe.thickness_LPX;
            }
            if ( vSum_PX >= 0.5 ) {
                return {
                    stripes: this.stripes,
                    vPeriod_PX: vSum_PX,
                };
            }
            else {
                return {
                    stripes: newImmutableList( [ new Stripe( 1, GRAY ) ] ),
                    vPeriod_PX: 1,
                };
            }
        } );

        const vMins_PX = [];
        let vSum_PX = 0;
        for ( const stripe of stripes ) {
            vMins_PX.push( vSum_PX );
            vSum_PX += this.dpr*stripe.thickness_LPX;
        }

        let angle_MATHRAD = this.angle_MATHDEG * Math.PI / 180.0;
        let cosAngle = Math.cos( angle_MATHRAD );
        let sinAngle = Math.sin( angle_MATHRAD );
        if ( cosAngle < 0 ) {
            angle_MATHRAD += Math.PI;
            cosAngle *= -1;
            sinAngle *= -1;
        }

        const border_PX = 1;

        const patternHeightMax_PX = this.maxDim_PX - 2*border_PX;
        const patternHeight_PX = Math.min( patternHeightMax_PX, Math.ceil( this.dpr * this.laneHeight_LPX ) );

        const patternWidthMax_PX = this.maxDim_PX - 2*border_PX;
        const patternWidthPref_PX = Math.round( Math.abs( vPeriod_PX / sinAngle ) );
        const patternWidth_PX = ( patternWidthPref_PX > patternWidthMax_PX ? 1 : patternWidthPref_PX );

        const vShiftDefault_PX = run( ( ) => {
            // Shift the v coord so that the first stripe's edges intersect the event's
            // vertical and horizontal edges equally far away from the event's corner --
            // which looks nicer than centering the first stripe on the event's corner
            const firstStripeThickness_PX = this.dpr * requireDefined( stripes.get( 0 ) ).thickness_LPX;
            const absAngle_RAD = Math.abs( angle_MATHRAD );
            const a_FRAC = Math.SQRT1_2 * sinAngle / Math.sin( 0.75*Math.PI - absAngle_RAD );
            const b_FRAC = a_FRAC * Math.cos( 0.25*Math.PI - absAngle_RAD );
            if ( sinAngle <= 0 ) {
                // Make first stripe straddle the event's top-left corner
                return -b_FRAC*firstStripeThickness_PX;
            }
            else {
                // Make first stripe straddle the event's bottom-left corner
                return ( 1.0 - b_FRAC )*firstStripeThickness_PX - patternHeight_PX*cosAngle;
            }
        } );
        const vShift_PX = vShiftDefault_PX + this.dpr*this.lateralShift_LPX;

        const canvas = document.createElement( 'canvas' );
        canvas.width = border_PX + patternWidth_PX + border_PX;
        canvas.height = border_PX + patternHeight_PX + border_PX;
        const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
        g.clearRect( 0, 0, canvas.width, canvas.height );

        g.save( );
        g.translate( border_PX, canvas.height - border_PX );
        g.scale( 1, -1 );
        try {
            for ( let row = 0; row < patternHeight_PX; row++ ) {
                const y = row + 0.5;
                for ( let col = 0; col < patternWidth_PX; col++ ) {
                    const x = col + 0.5;
                    //const u = x*cosAngle - y*sinAngle;
                    const v = mod( x*sinAngle + y*cosAngle + vPeriod_PX + vShift_PX, vPeriod_PX );

                    const stripeIndexPrelim = findIndexAtOrBefore( vMins_PX, vMin => vMin - v );
                    const stripeIndex = mod( stripeIndexPrelim, stripes.size );
                    const stripe = requireDefined( stripes.get( stripeIndex ) );
                    const stripeColor = stripe.color;

                    const stripeVMin_PX = vMins_PX[ stripeIndex ];
                    const stripeVMax_PX = stripeVMin_PX + this.dpr*stripe.thickness_LPX;
                    const vAboveMin_PX = v - stripeVMin_PX;
                    const vBelowMax_PX = stripeVMax_PX - v;

                    const feather_PX = 1;
                    if ( vAboveMin_PX < 0.5*feather_PX && vAboveMin_PX < vBelowMax_PX ) {
                        const prevStripeIndex = mod( stripeIndex - 1, stripes.size );
                        const prevStripe = requireDefined( stripes.get( prevStripeIndex ) );
                        const prevStripeColor = prevStripe.color;
                        const mixFrac = 0.5 + vAboveMin_PX/feather_PX;
                        const mixColor = new Color(
                            ( 1 - mixFrac )*prevStripeColor.r + ( mixFrac )*stripeColor.r,
                            ( 1 - mixFrac )*prevStripeColor.g + ( mixFrac )*stripeColor.g,
                            ( 1 - mixFrac )*prevStripeColor.b + ( mixFrac )*stripeColor.b,
                            ( 1 - mixFrac )*prevStripeColor.a + ( mixFrac )*stripeColor.a,
                        );
                        g.fillStyle = mixColor.cssString;
                    }
                    else if ( vBelowMax_PX < 0.5*feather_PX ) {
                        const nextStripeIndex = mod( stripeIndex + 1, stripes.size );
                        const nextStripe = requireDefined( stripes.get( nextStripeIndex ) );
                        const nextStripeColor = nextStripe.color;
                        const mixFrac = 0.5 + vBelowMax_PX/feather_PX;
                        const mixColor = new Color(
                            ( mixFrac )*stripeColor.r + ( 1 - mixFrac )*nextStripeColor.r,
                            ( mixFrac )*stripeColor.g + ( 1 - mixFrac )*nextStripeColor.g,
                            ( mixFrac )*stripeColor.b + ( 1 - mixFrac )*nextStripeColor.b,
                            ( mixFrac )*stripeColor.a + ( 1 - mixFrac )*nextStripeColor.a,
                        );
                        g.fillStyle = mixColor.cssString;
                    }
                    else {
                        g.fillStyle = stripeColor.cssString;
                    }

                    g.fillRect( col, row, 1, 1 );
                }
            }
        }
        finally {
            g.restore( );
        }

        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData( 0, 0, canvas.width, canvas.height ),
        };
    }
}

export class Stripe extends ValueBase {
    constructor(
        readonly thickness_LPX: number,
        readonly color: Color,
    ) {
        super( thickness_LPX, color );
    }
}

export const cssStripesArray = new CssParser<Array<Stripe>>( 'e.g. 3px red, 2px white, ...', parseStripesArray );

export function parseStripesArray( s: string ): Array<Stripe> | UNPARSEABLE {
    // 3px red, 2.5px rgba( 127, 64, 0, 1.0 )
    const tokens = s.match( /(?:[^,\(]*\(.*?\)[^,\(]*)+|[^,]+/g );
    return ( tokens?.map( parseStripe ) ?? UNPARSEABLE );
}

function parseStripeThickness_LPX( s: string ): number {
    // 2.5px
    s = s.trim( );
    if ( s.endsWith( 'px' ) ) {
        const v = parseFloat( s.substring( 0, s.length - 'px'.length ) );
        if ( !Number.isNaN( v ) ) {
            return v;
        }
    }
    throw new Error( `Failed to parse stripe thickness: string = "${s}"` );
}

function parseStripe( s: string ): Stripe {
    // 2.5px rgba( 127, 64, 0, 1.0 )
    const tokens = s.match( /(?:[^ \(]*\(.*?\)[^ \(]*)+|[^ ]+/g );
    if ( isNonNullish( tokens ) && tokens.length === 2 ) {
        return new Stripe(
            parseStripeThickness_LPX( tokens[0] ),
            parseColor( tokens[1] ),
        );
    }
    throw new Error( `Failed to parse stripe: string = "${s}"` );
}

export class TestPattern implements Pattern {
    readonly peer = createDomPeer( 'test-pattern', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    createRasterizer( ): PatternRasterizer {
        return new TestPatternRasterizer( );
    }
}

export class TestPatternRasterizer extends ValueBase implements PatternRasterizer {
    constructor( ) {
        super( 'TestPatternRasterizer' );
    }

    createImage( ): AnchoredImage {
        const border_PX = 1;

        const canvas = document.createElement( 'canvas' );
        canvas.width = border_PX + 4 + border_PX;
        canvas.height = border_PX + 4 + border_PX;
        const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
        g.clearRect( 0, 0, canvas.width, canvas.height );

        g.save( );
        g.translate( border_PX, canvas.height - border_PX );
        g.scale( 1, -1 );
        try {
            g.fillStyle = CYAN.cssString;
            g.fillRect( 0, 0, 3, 1 );

            g.fillStyle = MAGENTA.cssString;
            g.fillRect( 3, 0, 1, 3 );

            g.fillStyle = YELLOW.cssString;
            g.fillRect( 1, 3, 3, 1 );

            g.fillStyle = BLACK.cssString;
            g.fillRect( 0, 1, 1, 3 );

            g.fillStyle = RED.cssString;
            g.fillRect( 1, 2, 1, 1 );

            g.fillStyle = BLUE.cssString;
            g.fillRect( 2, 2, 1, 1 );

            g.fillStyle = GREEN.cssString;
            g.fillRect( 1, 1, 1, 1 );
        }
        finally {
            g.restore( );
        }

        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData( 0, 0, canvas.width, canvas.height ),
        };
    }
}

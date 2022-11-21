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
import { clamp, equal, hashCode, isNullish, nextUpFloat64 } from '@metsci/gleam-util';
import { Point2D } from './point';
import { X, Y } from './xy';

export class Size2D {
    static readonly ZERO = Object.freeze( new Size2D( 0, 0 ) );

    readonly w: number;
    readonly h: number;

    constructor( w: number, h: number ) {
        this.w = w;
        this.h = h;
    }

    get [X]( ): number {
        return this.w;
    }

    get [Y]( ): number {
        return this.h;
    }

    scale( factor: number ): Size2D {
        return new Size2D( this.w * factor, this.h * factor );
    }

    hashCode( ): number {
        const prime = 9043;
        let result = 1;
        result = prime * result + hashCode( this.w );
        result = prime * result + hashCode( this.h );
        return result;
    }

    equals( o: unknown ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            const other = o as Size2D;
            return ( Object.is( other.w, this.w )
                  && Object.is( other.h, this.h ) );
        }
    }
}

/**
 * A numeric interval with INCLUSIVE lower bound and EXCLUSIVE upper bound.
 * The `nextUpFloat64` and `nextDownFloat64` functions from util/misc can be
 * used for fine control over interval edges.
 */
export class Interval1D {
    static readonly ZERO = Object.freeze( Interval1D.point( 0 ) );

    /**
     * Inclusive lower bound.
     */
    readonly min: number;

    /**
     * Exclusive upper bound.
     */
    readonly max: number;

    /**
     * Difference between min and max.
     */
    readonly span: number;

    /**
     * The span of the returned interval may differ from the given span
     * due to floating-point precision error, or handling of infinities.
     * This is annoying -- but it ensures that  span = max - min  holds
     * for all intervals, regardless of how they were constructed.
     */
    static fromRect( min: number, approxSpan: number ): Interval1D {
        return new Interval1D( min, min+approxSpan );
    }

    static fromEdges( min: number, max: number ): Interval1D {
        return new Interval1D( min, max );
    }

    static point( v: number ): Interval1D {
        return new Interval1D( v, v );
    }

    private constructor( min: number, max: number ) {
        this.min = min;
        this.max = max;
        this.span = this.max - this.min;
    }

    shift( shift: number ): Interval1D {
        return Interval1D.fromEdges( this.min + shift, this.max + shift );
    }

    scale( factor: number ): Interval1D {
        if ( factor >= 0 ) {
            return Interval1D.fromEdges( factor*this.min, factor*this.max );
        }
        else {
            // Nudge upward so the new min is inclusive and the new max is exclusive
            return Interval1D.fromEdges( nextUpFloat64( factor*this.max ), nextUpFloat64( factor*this.min ) );
        }
    }

    round( ): Interval1D {
        return Interval1D.fromEdges( Math.round( this.min ), Math.round( this.max ) );
    }

    clamp( v: number ): number {
        return clamp( this.min, this.max, v );
    }

    valueToFrac( v: number ): number {
        return ( ( v - this.min ) / this.span );
    }

    fracToValue( frac: number ): number {
        return ( this.min + frac*this.span );
    }

    containsPoint( v: number ): boolean {
        return ( this.min <= v && v < this.max );
    }

    containsInterval( other: Interval1D ): boolean {
        return ( this.min <= other.min && other.max <= this.max );
    }

    intersectsInterval( other: Interval1D ): boolean {
        return !( this.min >= other.max || other.min >= this.max );
    }

    intersection( other: Interval1D ): Interval1D {
        const min = Math.max( this.min, other.min );
        const max = Math.min( this.max, other.max );
        return Interval1D.fromEdges( min, max );
    }

    minus( other: Interval1D ): Array<Interval1D> {
        if ( other.max <= this.min || this.max <= other.min || other.max <= other.min ) {
            return [ this ];
        }
        else if ( other.min <= this.min ) {
            if ( this.max <= other.max ) {
                return [];
            }
            else {
                return [ Interval1D.fromEdges( other.max, this.max ) ];
            }
        }
        else {
            if ( this.max <= other.max ) {
                return [ Interval1D.fromEdges( this.min, other.min ) ];
            }
            else {
                return [ Interval1D.fromEdges( this.min, other.min ), Interval1D.fromEdges( other.max, this.max ) ];
            }
        }
    }

    expand( frac: number, minSpan: number = 0.0 ): Interval1D {
        const center = 0.5*( this.min + this.max );
        const oldSpan = this.max - this.min;
        const newSpan = Math.max( 0.0, minSpan, ( 1.0 + 2*frac )*oldSpan );
        return Interval1D.fromEdges( center - 0.5*newSpan, center + 0.5*newSpan );
    }

    hashCode( ): number {
        const prime = 9049;
        let result = 1;
        result = prime * result + hashCode( this.min );
        result = prime * result + hashCode( this.max );
        return result;
    }

    equals( o: unknown ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            const other = o as Interval1D;
            return ( Object.is( other.min, this.min )
                  && Object.is( other.max, this.max ) );
        }
    }
}

export class Interval2D {
    static readonly ZERO = Object.freeze( Interval2D.point( 0, 0 ) );

    readonly x: Interval1D;
    readonly y: Interval1D;

    static fromEdges( xMin: number, xMax: number, yMin: number, yMax: number ): Interval2D {
        const x = Interval1D.fromEdges( xMin, xMax );
        const y = Interval1D.fromEdges( yMin, yMax );
        return new Interval2D( x, y );
    }

    static fromRect( xMin: number, yMin: number, xSpan: number, ySpan: number ): Interval2D {
        const x = Interval1D.fromRect( xMin, xSpan );
        const y = Interval1D.fromRect( yMin, ySpan );
        return new Interval2D( x, y );
    }

    static point( xPoint: number, yPoint: number ): Interval2D {
        const x = Interval1D.point( xPoint );
        const y = Interval1D.point( yPoint );
        return new Interval2D( x, y );
    }

    static fromXy( x: Interval1D, y: Interval1D ): Interval2D {
        return new Interval2D( x, y );
    }

    private constructor( x: Interval1D, y: Interval1D ) {
        this.x = x;
        this.y = y;
    }

    get [X]( ): Interval1D {
        return this.x;
    }

    get [Y]( ): Interval1D {
        return this.y;
    }

    get xMin( ): number {
        return this.x.min;
    }

    get xMax( ): number {
        return this.x.max;
    }

    get yMin( ): number {
        return this.y.min;
    }

    get yMax( ): number {
        return this.y.max;
    }

    get w( ): number {
        return this.x.span;
    }

    get h( ): number {
        return this.y.span;
    }

    get span( ): Size2D {
        return new Size2D( this.x.span, this.y.span );
    }

    get area( ): number {
        return ( Math.max( 0, this.w ) * Math.max( 0, this.h ) );
    }

    withXEdges( xMin: number, xMax: number ): Interval2D {
        return new Interval2D( Interval1D.fromEdges( xMin, xMax ), this.y );
    }

    withYEdges( yMin: number, yMax: number ): Interval2D {
        return new Interval2D( this.x, Interval1D.fromEdges( yMin, yMax ) );
    }

    round( ): Interval2D {
        return new Interval2D( this.x.round( ), this.y.round( ) );
    }

    valueToFrac( v: Point2D ): Point2D {
        return new Point2D( this.x.valueToFrac( v.x ),
                            this.y.valueToFrac( v.y ) );
    }

    fracToValue( frac: Point2D ): Point2D {
        return new Point2D( this.x.fracToValue( frac.x ),
                            this.y.fracToValue( frac.y ) );
    }

    containsPoint( xy: Point2D ): boolean;
    containsPoint( x: number, y: number ): boolean;
    containsPoint( arg0: any, arg1?: any ): boolean {
        let x;
        let y;
        if ( arg1 === undefined ) {
            const xy = arg0 as Point2D;
            x = xy.x;
            y = xy.y;
        }
        else {
            x = arg0 as number;
            y = arg1 as number;
        }
        return ( this.x.containsPoint( x ) && this.y.containsPoint( y ) );
    }

    containsInterval( other: Interval2D ): boolean {
        return ( this.x.containsInterval( other.x ) && this.y.containsInterval( other.y ) );
    }

    intersectsInterval( other: Interval2D ): boolean {
        return ( this.x.intersectsInterval( other.x ) && this.y.intersectsInterval( other.y ) );
    }

    intersection( other: Interval2D ): Interval2D | null {
        if ( this.containsInterval( other ) ) {
            return other;
        }
        else if ( other.containsInterval( this ) ) {
            return this;
        }
        else {
            const x = this.x.intersection( other.x );
            const y = this.y.intersection( other.y );
            return new Interval2D( x, y );
        }
    }

    shift( xShift: number, yShift: number ): Interval2D {
        const x = this.x.shift( xShift );
        const y = this.y.shift( yShift );
        return new Interval2D( x, y );
    }

    expand( xFrac: number, yFrac: number, xMinSpan: number = 0.0, yMinSpan: number = 0.0 ): Interval2D {
        const x = this.x.expand( xFrac, xMinSpan );
        const y = this.y.expand( yFrac, yMinSpan );
        return new Interval2D( x, y );
    }

    hashCode( ): number {
        const prime = 9059;
        let result = 1;
        result = prime * result + this.x.hashCode( );
        result = prime * result + this.y.hashCode( );
        return result;
    }

    equals( o: unknown ): boolean {
        if ( o === this ) {
            return true;
        }
        else if ( isNullish( o ) ) {
            return false;
        }
        else {
            const other = o as Interval2D;
            return ( equal( other.x, this.x )
                  && equal( other.y, this.y ) );
        }
    }
}

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
import { basicDelims, basicEscapes, basicQuotePair, Consumer, isDefined, LinkedMap, LinkedSet, numberOr, Predicate, QuotePair, requireDefined, splitString, Supplier } from '@metsci/gleam-util';
import { frozenSupplier, isstr } from '../util';
import { Color, parseColor } from './color';
import { createInset, Inset } from './inset';

export interface Styleable {
    readonly peer: HTMLElement;
    readonly style: CSSStyleDeclaration;
}

export enum PeerType {
    PANE,
    LAYOUT,
    PAINTER,
    CONTRAPTION,
    SITE,
    OTHER,
}

const DOM_PEER_SYMBOL = Symbol( '@@__GLEAM_DOM_PEER__@@' );
export function isDomPeer( obj: unknown ): obj is DomPeer {
    return !!( obj && typeof obj === 'object' && ( obj as any )[ DOM_PEER_SYMBOL ] );
}

export interface DomPeer extends HTMLElement {
    readonly [DOM_PEER_SYMBOL]: true;
    readonly gleamPeer: unknown;
    readonly gleamType: PeerType;
}

export function createDomPeer( tagName: string, gleamPeer: unknown, gleamType: PeerType ): DomPeer {
    return Object.assign( document.createElement( tagName ), {
        [DOM_PEER_SYMBOL]: true as const,
        gleamPeer,
        gleamType,
    } );
}

function createValueSupplier<V>( parser: CssParser<V>, v: V | string | StyleProp<V> ): Supplier<V> {
    if ( isstr( v ) ) {
        return frozenSupplier( parseOrThrow( parser, v ) );
    }
    else if ( isStyleProp( v ) ) {
        return ( ) => v.get( );
    }
    else {
        return frozenSupplier( v );
    }
}

const STYLE_PROP_SYMBOL = Symbol( '@@__GLEAM_STYLE_PROP__@@' );
export function isStyleProp( obj: any ): obj is StyleProp<unknown> {
    return !!( obj && typeof obj === 'object' && obj[ STYLE_PROP_SYMBOL ] );
}

export class StyleProp<T> {
    readonly [ STYLE_PROP_SYMBOL ] = true;

    readonly style: CSSStyleDeclaration;
    readonly name: string;
    readonly parser: CssParser<T>;
    getFallback: Supplier<T>;
    getOverride: Supplier<T | undefined> | undefined;
    readonly transforms: LinkedMap<string, ( value: T ) => T>;

    protected readonly cache: CssParseCache<T> | undefined;

    /**
     * If you need to pass a `getFallback` supplier instead of a `fallback`
     * value, use `create2()` instead of this fn. The two fns are separate
     * because if `T` is a function type, runtime dispatch can't distinguish
     * `T` from `Supplier<T>`.
     */
    static create<T>( style: CSSStyleDeclaration, name: string, parser: CssParser<T>, fallback: T | string | StyleProp<T>, cacheSize: number = 1 ) {
        return new StyleProp( style, name, parser, createValueSupplier( parser, fallback ), cacheSize );
    }

    static create2<T>( style: CSSStyleDeclaration, name: string, parser: CssParser<T>, getFallback: Supplier<T>, cacheSize: number = 1 ) {
        return new StyleProp( style, name, parser, getFallback, cacheSize );
    }

    protected constructor( style: CSSStyleDeclaration, name: string, parser: CssParser<T>, getFallback: Supplier<T>, cacheSize: number ) {
        this.style = style;
        this.name = name;
        this.parser = parser;
        this.getFallback = getFallback;
        this.getOverride = undefined;
        this.transforms = new LinkedMap( );
        this.cache = ( cacheSize > 0 ? new CssParseCache<T>( cacheSize ) : undefined );
    }

    get( ): T {
        let value = cssParsed( this.parser, this.getOverride, this.style, this.name, this.getFallback, this.cache );
        for ( const [ _, transform ] of this.transforms ) {
            value = transform( value );
        }
        return value;
    }

    get override( ): T | undefined {
        return this.getOverride?.( );
    }

    set override( value: T | undefined ) {
        this.getOverride = ( ) => value;
    }
}

const UNBOUND_STYLE_PROP_SYMBOL = Symbol( '@@__GLEAM_UNBOUND_STYLE_PROP__@@' );
export function isUnboundStyleProp( obj: any ): obj is UnboundStyleProp<unknown> {
    return !!( obj && typeof obj === 'object' && obj[ UNBOUND_STYLE_PROP_SYMBOL ] );
}

export class UnboundStyleProp<T> {
    readonly [ UNBOUND_STYLE_PROP_SYMBOL ] = true;

    readonly name: string;
    readonly parser: CssParser<T>;
    getFallback: Supplier<T>;
    readonly transforms: LinkedMap<string, ( value: T ) => T>;

    protected readonly cache: CssParseCache<T> | undefined;

    /**
     * If you need to pass a `getFallback` supplier instead of a `fallback`
     * value, use `create2()` instead of this fn. The two fns are separate
     * because if `T` is a function type, runtime dispatch can't distinguish
     * `T` from `Supplier<T>`.
     */
    static create<T>( name: string, parser: CssParser<T>, fallback: T | string | StyleProp<T>, cacheSize: number = 10 ) {
        return new UnboundStyleProp( name, parser, createValueSupplier( parser, fallback ), cacheSize );
    }

    static create2<T>( name: string, parser: CssParser<T>, getFallback: Supplier<T>, cacheSize: number = 10 ) {
        return new UnboundStyleProp( name, parser, getFallback, cacheSize );
    }

    protected constructor( name: string, parser: CssParser<T>, getFallback: Supplier<T>, cacheSize: number ) {
        this.name = name;
        this.parser = parser;
        this.getFallback = getFallback;
        this.transforms = new LinkedMap( );
        this.cache = ( cacheSize > 0 ? new CssParseCache<T>( cacheSize ) : undefined );
    }

    get( style: CSSStyleDeclaration, getOverride?: Supplier<T | undefined> | undefined ): T {
        let value = cssParsed( this.parser, getOverride, style, this.name, this.getFallback, this.cache );
        for ( const [ _, transform ] of this.transforms ) {
            value = transform( value );
        }
        return value;
    }
}

function parseOrThrow<V>( parser: CssParser<V>, s: string ): V {
    const v = parser.parse( s );
    if ( v === UNPARSEABLE ) {
        throw new Error( `CSS parsing failed: required = ${parser.descriptionOfValidValues}, found = ${s}` );
    }
    else {
        return v;
    }
}

export const UNPARSEABLE = Symbol( 'UNPARSEABLE' );
export type UNPARSEABLE = typeof UNPARSEABLE;

interface CssParseFn<V> {
    ( s: string ): V | UNPARSEABLE;
}

// TODO: Add a format fn, for debugging purposes
export class CssParser<V> {
    constructor(
        readonly descriptionOfValidValues: string,
        readonly parse: CssParseFn<V>,
    ) {
    }
}

export class CssParseCache<V> {
    protected readonly map: LinkedMap<string, V | UNPARSEABLE>;
    protected readonly maxSize: number;

    constructor( maxSize: number ) {
        this.map = new LinkedMap( );
        this.maxSize = maxSize;
    }

    get( unparsed: string, parseFn: CssParseFn<V> ): V | UNPARSEABLE {
        const cached = this.map.get( unparsed );
        if ( cached !== undefined ) {
            return cached;
        }
        else {
            const parsed = parseFn( unparsed );
            this.map.putLast( unparsed, parsed );
            if ( this.maxSize > 0 ) {
                while ( this.map.size > this.maxSize ) {
                    this.map.removeFirst( );
                }
            }
            return parsed;
        }
    }
}

export function cssParsed<V>( parser: CssParser<V>, getOverride: Supplier<V | undefined> | undefined, style: CSSStyleDeclaration, propName: string, getFallback: Supplier<V>, cache?: CssParseCache<V> ): V {
    try {
        const override = getOverride?.( );
        if ( isDefined( override ) ) {
            return override;
        }
    }
    catch ( e ) {
        console.warn( `CSS override supplier failed: "${propName}"`, e, e.stack );
    }

    const sRaw = style.getPropertyValue( propName );

    // It's VERY easy for parsers to get tripped up by leading/trailing whitespace,
    // so trim it immediately -- makes it awkward when a parser needs the whitespace,
    // but that's rare in practice
    let s = sRaw.trim( );

    // Allow whitespace if the value is quoted
    // TODO: Make quote parsing more robust
    if ( ( s.startsWith( '"' ) && s.endsWith( '"' ) ) || ( s.startsWith( "'" ) && s.endsWith( "'" ) ) ) {
        s = s.substring( 1, s.length-1 );
    }

    if ( s.length > 0 ) {
        const parseFn = wrapParseFn( parser.parse, ( ) => {
            console.warn( `CSS parsing failed: "${propName}:${sRaw}"` );
        } );

        const result = cache?.get( s, parseFn ) ?? parseFn( s );
        if ( result !== UNPARSEABLE ) {
            return result;
        }
    }

    return getFallback( );
}

function wrapParseFn<V>( parseFn: CssParseFn<V>, handleParseFailure: Consumer<string> ): CssParseFn<V> {
    return s => {
        let result;
        try {
            result = parseFn( s );
        }
        catch ( e ) {
            result = UNPARSEABLE;
        }
        if ( result === UNPARSEABLE ) {
            handleParseFailure( s );
        }
        return result;
    };
}

export const cssString = new CssParser<string>( '<string>', s => s );
export const cssLowercase = new CssParser<string>( '<string>', s => s.toLowerCase( ) );
export const cssUppercase = new CssParser<string>( '<string>', s => s.toUpperCase( ) );

export const cssInteger = new CssParser<number>( '<integer>', parseInt );

export const cssColor = new CssParser<Color>( '<color>', parseColor );

const truthyStrings = new Set( [ 'true', 'yes', 't', 'y', '1' ] );
export const cssBoolean = new CssParser<boolean>( '<boolean>', s => {
    return truthyStrings.has( s.trim( ).toLowerCase( ) );
} );

const posInfStrings = new Set( [ '+inf', '+infinity', 'inf', 'infinity' ] );
const negInfStrings = new Set( [ '-inf', '-infinity' ] );
export const cssFloat = new CssParser<number>( '<number>', s => {
    if ( posInfStrings.has( s ) ) {
        return Number.POSITIVE_INFINITY;
    }
    if ( negInfStrings.has( s ) ) {
        return Number.NEGATIVE_INFINITY;
    }
    return parseFloat( s );
} );

export function cssEnum<T extends object>( enumType: T ): CssParser<T[keyof T]> {
    const validValues = Object.keys( enumType )
                              .map( s => s.toLowerCase( ).replace( /_/g, '-' ) )
                              .join( ' | ' );
    return new CssParser( validValues, s => {
        const enumKey = s.toUpperCase( ).replace( /-/g, '_' );
        return requireDefined( ( enumType as any )[ enumKey ] );
    } );
}

export const cssInset = new CssParser<Inset>( 'omni | vertical horizontal | top horizontal bottom | top right bottom left', s => {
    const numbers = new Array<number>( );
    for ( const token of s.trim( ).split( /\s+/, 4 ) ) {
        numbers.push( numberOr( parseFloat( token ), 0 ) );
    }
    return createInset( numbers[ 0 ], numbers[ 1 ], numbers[ 2 ], numbers[ 3 ] );
} );

export const STD_ESCAPES = Object.freeze( basicEscapes( '\\' ) );
export const STD_DELIMS = Object.freeze( basicDelims( ',' ) );
export const STD_QUOTES = Object.freeze( [
    basicQuotePair( '"', '"' ),
    basicQuotePair( "'", "'" ),
    basicQuotePair( "`", "`" ),
    basicQuotePair( '(', ')' ),
    basicQuotePair( '[', ']' ),
    basicQuotePair( '{', '}' ),
] );

export function cssArray<T>( itemParser: CssParser<T>, delims?: Predicate<string>, quotes?: Iterable<QuotePair>, escapes?: Predicate<string> ): CssParser<Array<T>> {
    return new CssParser<Array<T>>( `list of ${itemParser.descriptionOfValidValues}`, s => {
        return [ ...parseIterable( s, itemParser, delims, quotes, escapes ) ];
    } );
}

export function cssSet<T>( itemParser: CssParser<T>, delims?: Predicate<string>, quotes?: Iterable<QuotePair>, escapes?: Predicate<string> ): CssParser<Set<T>> {
    return new CssParser<Set<T>>( `list of ${itemParser.descriptionOfValidValues}`, s => {
        return new Set( parseIterable( s, itemParser, delims, quotes, escapes ) );
    } );
}

export function cssLinkedSet<T>( itemParser: CssParser<T>, delims?: Predicate<string>, quotes?: Iterable<QuotePair>, escapes?: Predicate<string> ): CssParser<LinkedSet<T>> {
    return new CssParser<LinkedSet<T>>( `list of ${itemParser.descriptionOfValidValues}`, s => {
        return new LinkedSet( parseIterable( s, itemParser, delims, quotes, escapes ) );
    } );
}

function* parseIterable<T>( s: string, itemParser: CssParser<T>, delims?: Predicate<string>, quotes?: Iterable<QuotePair>, escapes?: Predicate<string> ): Iterable<T> {
    for ( const sItem of splitString( s, escapes ?? STD_ESCAPES, delims ?? STD_DELIMS, quotes ?? STD_QUOTES ) ) {
        const item = itemParser.parse( sItem.trim( ) );
        if ( item === UNPARSEABLE ) {
            throw new Error( );
        }
        else {
            yield item;
        }
    }
}

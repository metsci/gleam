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
import { Predicate } from './misc';

export function basicEscapes( ...escapes: ReadonlyArray<string> ): Predicate<string> {
    const escapesSet = new Set( escapes );
    return c => {
        return escapesSet.has( c );
    };
}

export function basicDelims( ...delims: ReadonlyArray<string> ): Predicate<string> {
    const delimsSet = new Set( delims );
    return c => {
        return delimsSet.has( c );
    };
}

export interface QuotePair {
    isOpen( c: string ): boolean;
    isClose( c: string ): boolean;
}

export function basicQuotePair( openQuote: string, closeQuote: string ): QuotePair {
    return {
        isOpen( c ) {
            return c === openQuote;
        },
        isClose( c ) {
            return c === closeQuote;
        },
    };
}

/**
 * Supports zero or more single-char delimiters, zero or more pairs of single-char quotes,
 * and zero or more single-char escapes. Quote characters ARE included in the returned
 * tokens. Escape and delimiter characters are NOT included in the returned tokens.
 */
export function* splitString( s: string, isEscape: Predicate<string>, isDelim: Predicate<string>, quotePairs: Iterable<QuotePair> ): Iterable<string> {
    function getMatchingCloseQuote( possibleOpenQuote: string ): Predicate<string> | undefined {
        for ( const quotePair of quotePairs ) {
            if ( quotePair.isOpen( possibleOpenQuote ) ) {
                return quotePair.isClose;
            }
        }
        return undefined;
    }

    let token = '';
    let escaped = false;
    let isCloseQuote: Predicate<string> | undefined = undefined;
    for ( const c of s ) {
        if ( escaped ) {
            token += c;
            escaped = false;
        }
        else if ( isEscape( c ) ) {
            escaped = true;
        }
        else if ( isCloseQuote === undefined ) {
            isCloseQuote = getMatchingCloseQuote( c );
            if ( isCloseQuote !== undefined ) {
                // c isn't quoted, and is an open-quote
                token += c;
            }
            else if ( isDelim( c ) ) {
                // c isn't quoted, and is a delimiter
                yield token;
                token = '';
            }
            else {
                // c isn't quoted, and is neither an open-quote nor a delimiter
                token += c;
            }
        }
        else if ( !isCloseQuote( c ) ) {
            // c is quoted, and isn't a close-quote
            token += c;
        }
        else {
            // c is quoted, and is a close-quote
            token += c;
            isCloseQuote = undefined;
        }
    }
    yield token;
}

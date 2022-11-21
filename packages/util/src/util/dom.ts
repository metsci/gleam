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
import { Disposer, DisposerGroup } from './disposer';
import { NOOP, Runnable } from './misc';

const { round } = Math;

export function appendChild( parent: Node, child: Node ): Disposer {
    parent.appendChild( child );
    return ( ) => {
        parent.removeChild( child );
    };
}

export function insertBefore( parent: Node, child: Node, existingChild: Node | null ): Disposer {
    parent.insertBefore( child, existingChild );
    return ( ) => {
        parent.removeChild( child );
    };
}

export function createCssLink( url: URL ): HTMLLinkElement {
    const link = document.createElement( 'link' );
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url.href;
    return link;
}

export function appendCssLink( parent: Node, cssLink: HTMLLinkElement ): { loading: Promise<HTMLLinkElement>, disposers: DisposerGroup } {
    const disposers = new DisposerGroup( );
    disposers.add( appendChild( parent, cssLink ) );
    const [ loadingPromise, loadingDisposer ] = createCssLoadingPromise( cssLink );
    disposers.add( loadingDisposer );
    return { loading: loadingPromise, disposers };
}

export function createCssLoadingPromise( cssLink: HTMLLinkElement ): [ Promise<HTMLLinkElement>, Disposer ] {
    const disposers = new DisposerGroup( );
    const promise = new Promise<HTMLLinkElement>( ( resolve, reject ) => {
        let settled = false;
        disposers.add( onCssLoaded( cssLink, ( ) => {
            if ( !settled ) {
                settled = true;
                resolve( cssLink );
            }
        } ) );
        disposers.add( ( ) => {
            if ( !settled ) {
                settled = true;
                reject( { reason: 'DISPOSED', href: cssLink.href } );
            }
        } );
    } );
    return [ promise, disposers ];
}

/**
 * Executes `callback` immediately if `cssLink` has already loaded. Otherwise,
 * polls until `cssLink` has loaded, and then executes `callback`. If loading
 * takes a long time, logs a one-time warning to the console, then logs a
 * success message when loading completes.
 */
export function onCssLoaded( cssLink: HTMLLinkElement, callback: Runnable ): Disposer {
    const millisBetweenPolls = 10;
    const pollsBeforeWarning = 500;
    let pollsSoFar = 0;
    const doPoll = ( ) => {
        try {
            if ( cssLink.sheet?.cssRules ) {
                if ( pollsSoFar >= pollsBeforeWarning ) {
                    console.log( `CSS load completed after ${ round( 1e-3*millisBetweenPolls*pollsSoFar ) } seconds:`, cssLink.href );
                }
                return true;
            }
            else {
                pollsSoFar++;
                if ( pollsSoFar === pollsBeforeWarning ) {
                    console.warn( `Still waiting for CSS to load after ${ round( 1e-3*millisBetweenPolls*pollsSoFar ) } seconds:`, cssLink.href );
                }
                return false;
            }
        }
        catch ( e ) {
            pollsSoFar++;
            if ( pollsSoFar === pollsBeforeWarning ) {
                console.warn( `Still waiting for CSS to load after ${ round( 1e-3*millisBetweenPolls*pollsSoFar ) } seconds:`, cssLink.href, '\n ', e );
            }
            return false;
        }
    };

    if ( doPoll( ) ) {
        callback( );
        return NOOP;
    }
    else {
        const interval = setInterval( ( ) => {
            if ( doPoll( ) ) {
                callback( );
                clearInterval( interval );
            }
        }, millisBetweenPolls );

        return ( ) => {
            clearInterval( interval );
        };
    }
}

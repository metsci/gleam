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
import { appendCssLink, arrayAllEqual, arrayClear, createCssLink, Disposer, DisposerGroup, DisposerGroupMap, get, isNonNullish, multiIterable, onCssLoaded, requireNonNull, Runnable } from '@metsci/gleam-util';

export function attachDprListener( wnd: Window, listener: Runnable ): Disposer {
    const queries = [] as MediaQueryList[];

    const queryListener = ( ) => {
        for ( const query of queries ) {
            query.removeListener( queryListener );
        }
        arrayClear( queries );

        listener( );

        const dpr = wnd.devicePixelRatio;
        if ( dpr ) {
            // Not sure what matchMedia's precision limit is -- but presumably it's
            // at least .01, and that should be good enough for what we care about
            const dprAbove = 1e-2 * Math.ceil( dpr * 1e2 );
            const dprBelow = 1e-2 * Math.floor( dpr * 1e2 );
            queries.push( wnd.matchMedia( `screen and (max-resolution: ${dprAbove}dppx)` ) );
            queries.push( wnd.matchMedia( `screen and (min-resolution: ${dprBelow}dppx)` ) );
            for ( const query of queries ) {
                query.addListener( queryListener );
            }
        }
    };
    queryListener( );

    return ( ) => {
        for ( const query of queries ) {
            query.removeListener( queryListener );
        }
        arrayClear( queries );
    };
}

export interface CanvasResizeListener {
    ( width_PX: number, height_PX: number, isApprox: boolean | undefined ): unknown;
}

export function attachCanvasResizeListener( wnd: Window & typeof globalThis, parent: HTMLElement, canvas: HTMLCanvasElement, listener: CanvasResizeListener ): Disposer {
    try {
        return attachDefaultCanvasResizeListener( wnd, canvas, listener );
    }
    catch ( e ) {
        return attachFallbackCanvasResizeListener( wnd, parent, canvas, listener );
    }
}

function attachDefaultCanvasResizeListener( wnd: Window & typeof globalThis, canvas: HTMLCanvasElement, listener: CanvasResizeListener ): Disposer {
    // ResizeObserver doesn't fire immediately, so do something approximate
    // tide us over. This is helpful during app initialization, when e.g.
    // common-scale axes need to know their pixel sizes to be initialized
    // to specified bounds

    const { width_PX, height_PX } = approxElementSize_PX( wnd, canvas );
    listener( width_PX, height_PX, undefined );

    // We need to observe both 'content-box' and 'device-pixel-content-box'
    // changes -- that way we get notified when devicePixelRatio changes,
    // even if the canvas stays the same number of device pixels in size.
    //
    // At first glance this looks possible with a single observer instance,
    // but in at least some cases only the last box actually ends up being
    // observed. So we create multiple observer instances, and use each one
    // to watch a different box.

    const style = wnd.getComputedStyle( canvas );
    const resizeCallback = ( entries: ReadonlyArray<ResizeObserverEntry> ) => {
        for ( const en of entries ) {
            if ( en.target === canvas ) {
                const sizes = en.devicePixelContentBoxSize;
                if ( isNonNullish( sizes ) && sizes.length === 1 ) {
                    const size = sizes[ 0 ];
                    const writingMode = style.writingMode;
                    const isWritingModeVertical = ( isNonNullish( writingMode ) && writingMode.toLowerCase( ).startsWith( 'vertical' ) );
                    const width_PX = ( isWritingModeVertical ? size.blockSize : size.inlineSize );
                    const height_PX = ( isWritingModeVertical ? size.inlineSize : size.blockSize );
                    listener( width_PX, height_PX, false );
                }
                else {
                    const { width_PX, height_PX } = approxElementSize_PX( wnd, canvas );
                    listener( width_PX, height_PX, true );
                }
            }
        }
    };

    const disposers = new DisposerGroup( );
    const boxes: ReadonlyArray<ResizeObserverBoxOptions> = [ 'content-box', 'device-pixel-content-box' ];
    for ( const box of boxes ) {
        // To receive resize events from a window `wnd` which may not be same as the global
        // `window`, we call `new wnd.ResizeObserver()` instead of just `new ResizeObserver()`
        const observer = new wnd.ResizeObserver( resizeCallback );
        observer.observe( canvas, { box } );
        disposers.add( ( ) => {
            observer.disconnect( );
        } );
    }
    return disposers;
}

function attachFallbackCanvasResizeListener( wnd: Window, parent: HTMLElement, canvas: HTMLCanvasElement, listener: CanvasResizeListener ): Disposer {
    const disposers = new DisposerGroup( );

    function wrappedListener( ) {
        const { width_PX, height_PX } = approxElementSize_PX( wnd, canvas );
        listener( width_PX, height_PX, true );
    }
    disposers.add( attachDprListener( wnd, wrappedListener ) );
    disposers.add( attachLegacyElementResizeListener( wnd, parent, wrappedListener ) );

    return disposers;
}

function attachLegacyElementResizeListener( wnd: Window, element: HTMLElement, listener: Runnable ): Disposer {
    const document = requireNonNull( element.ownerDocument );

    // The scroll trick doesn't work on elements with "static" positioning, but
    // fortunately "relative" positioning is almost identical to "static" -- the
    // differences are minor, and not even noticeable in the vast majority of cases
    if ( wnd.getComputedStyle( element ).getPropertyValue( 'position' ) === 'static' ) {
        throw new Error( 'Element has "static" positioning, which does not support resize detection -- change its positioning to "relative", or wrap it in a div with "relative" positioning' );
    }

    const template = document.createElement( 'x-resize-canary' );
    template.style.position = 'absolute';
    template.style.top = '0';
    template.style.left = '0';
    template.style.zIndex = '-16777215';
    template.style.visibility = 'hidden';
    template.style.overflow = 'hidden';

    const expandSizer = template.cloneNode( false ) as HTMLElement;
    expandSizer.style.width = '999999px';
    expandSizer.style.height = '999999px';

    const expandCanary = template.cloneNode( false ) as HTMLElement;
    expandCanary.style.width = '100%';
    expandCanary.style.height = '100%';
    expandCanary.appendChild( expandSizer );

    const shrinkSizer = template.cloneNode( false ) as HTMLElement;
    shrinkSizer.style.width = '200%';
    shrinkSizer.style.height = '200%';

    const shrinkCanary = template.cloneNode( false ) as HTMLElement;
    shrinkCanary.style.width = '100%';
    shrinkCanary.style.height = '100%';
    shrinkCanary.appendChild( shrinkSizer );

    const rootCanary = template.cloneNode( false ) as HTMLElement;
    rootCanary.style.width = '100%';
    rootCanary.style.height = '100%';
    rootCanary.appendChild( expandCanary );
    rootCanary.appendChild( shrinkCanary );

    element.appendChild( rootCanary );

    const scrollFn = ( ) => {
        expandCanary.scrollLeft = 999999;
        expandCanary.scrollTop = 999999;
        shrinkCanary.scrollLeft = 999999;
        shrinkCanary.scrollTop = 999999;
        listener( );
    }
    expandCanary.onscroll = scrollFn;
    shrinkCanary.onscroll = scrollFn;
    scrollFn( );

    return ( ) => {
        expandCanary.onscroll = null;
        shrinkCanary.onscroll = null;
        element.removeChild( rootCanary );
    };
}

function approxElementSize_PX( wnd: Window, element: HTMLElement ): { width_PX: number, height_PX: number } {
    // The only reliable way to get a pixel-perfect size is to use ResizeObserver with
    // 'device-pixel-content-box' ... but for platforms where that's not supported, fall
    // back to this estimate, which is sometimes off by 1 device pixel
    const dpr = ( wnd.devicePixelRatio || 1 );
    const bounds_LPX = element.getBoundingClientRect( );
    const width_PX = Math.round( bounds_LPX.right*dpr ) - Math.round( bounds_LPX.left*dpr );
    const height_PX = Math.round( bounds_LPX.bottom*dpr ) - Math.round( bounds_LPX.top*dpr );
    return { width_PX, height_PX };
}

/**
 * Returns true if this call modified the element's classList.
 */
export function setCssClassPresent( element: Element, className: string, wantPresent: boolean ): boolean {
    const alreadyPresent = element.classList.contains( className );
    if ( wantPresent && !alreadyPresent ) {
        element.classList.add( className );
        return true;
    }
    else if ( !wantPresent && alreadyPresent ) {
        element.classList.remove( className );
        return true;
    }
    return false;
}

export function addCssLink( url: URL ): Promise<HTMLLinkElement> {
    return appendCssLink( document.head, createCssLink( url ) ).loading;
}

/**
 * Fires the listener when a style in the specified subtree MIGHT have
 * changed. Spurious firings are not frequent, but do happen.
 *
 * Some style changes made in browser devtools are detectable, but not
 * all. In Chrome's devtools for example, edits to `element.style` are
 * detected, but edits to a stylesheet are not.
 */
export function attachSubtreeRestyleListener( element: HTMLElement, listener: Runnable ): Disposer {
    const disposersByChild = new DisposerGroupMap<Node>( );

    const firingObserveOptions = {
        attributes: true,
        attributeFilter: [ 'id', 'class', 'style' ],
        childList: true,
        subtree: true
    };
    const firingObserver = get( ( ) => {
        let ancestors = getAncestors( element );
        return new MutationObserver( evs => {
            let shouldFire = false;
            let shouldCheckAncestors = false;
            for ( const ev of evs ) {
                switch ( ev.type ) {
                    case 'attributes': {
                        // Fire when a relevant attr changes on an ancestor or descendant
                        shouldFire = shouldFire || ev.target.contains( element );
                        shouldFire = shouldFire || element.contains( ev.target );
                    }
                    break;

                    case 'childList': {
                        // Ancestors may have changed
                        shouldCheckAncestors = true;

                        // Clean up when a stylesheet <link> gets removed
                        for ( const node of ev.removedNodes ) {
                            if ( isStylesheetLink( node ) ) {
                                disposersByChild.disposeFor( node );
                            }
                        }

                        // Fire when a stylesheet <link> gets loaded
                        for ( const node of ev.addedNodes ) {
                            if ( isStylesheetLink( node ) ) {
                                disposersByChild.get( node ).add(
                                    onCssLoaded( node as HTMLLinkElement, listener )
                                );
                            }
                        }

                        // Fire when a <style> element or stylesheet <link> gets added or removed
                        shouldFire = shouldFire || get( ( ) => {
                            for ( const node of multiIterable( ev.addedNodes, ev.removedNodes ) ) {
                                if ( isStyle( node ) || isStylesheetLink( node ) ) {
                                    return true;
                                }
                            }
                            return false;
                        } );

                        // Fire when descendants change
                        shouldFire = shouldFire || element.contains( ev.target );
                    }
                    break;
                }
            }

            // Fire when ancestors change
            if ( shouldCheckAncestors ) {
                const newAncestors = getAncestors( element );
                shouldFire = shouldFire || !arrayAllEqual( newAncestors, ancestors );
                ancestors = newAncestors;
            }

            if ( shouldFire ) {
                listener( );
            }
        } );
    } );

    const hierarchyObserveOptions = {
        childList: true,
        subtree: true
    };
    let hierarchyObserver: MutationObserver;
    const hierarchyInit = get( ( ) => {
        let ancestors = new Array<Node>( );
        return ( ) => {
            let newAncestors = getAncestors( element );
            if ( !arrayAllEqual( newAncestors, ancestors ) ) {
                hierarchyObserver.disconnect( );
                firingObserver.disconnect( );
                disposersByChild.dispose( );

                ancestors = newAncestors;

                // Add CSS-loading listeners to relevant DOM subtree
                for ( const link of ( element.getRootNode( ) as ParentNode ).querySelectorAll( 'link' ) ) {
                    if ( isStylesheetLink( link ) ) {
                        disposersByChild.get( link ).add(
                            onCssLoaded( link, listener )
                        );
                    }
                }

                // Fire listener on changes in the relevant DOM subtree
                firingObserver.observe( element.getRootNode( ), firingObserveOptions );

                // On changes in ANY containing root, check whether to reinitialize
                for ( const r of getRoots( element ) ) {
                    hierarchyObserver.observe( r, hierarchyObserveOptions );
                }
            }
        };
    } );
    // Init immediately, and reinit when ancestors change
    hierarchyObserver = new MutationObserver( hierarchyInit );
    hierarchyInit( );

    return ( ) => {
        hierarchyObserver.disconnect( );
        firingObserver.disconnect( );
        disposersByChild.dispose( );
    };
}

function isStylesheetLink( node: Node ): boolean {
    const link = node as HTMLLinkElement;
    return ( link.tagName === 'LINK' && link.rel === 'stylesheet' );
}

function isStyle( node: Node ): boolean {
    const element = node as Element;
    return ( element.tagName === 'STYLE' );
}

function getRoots( node: Node ) {
    const roots = new Array<Document | ShadowRoot>( );
    let root = node.getRootNode( ) as Document | ShadowRoot;
    while ( true ) {
        roots.push( root );
        root = ( root as any )?.host?.getRootNode( ) as Document | ShadowRoot;
        if ( !root ) {
            return roots;
        }
    }
}

function getAncestors( node: Node ): Node[] {
    const ancestors = new Array<Node>( );
    let ancestor = node;
    while ( true ) {
        ancestors.push( ancestor );
        const next = ancestor.parentNode ?? ( ancestor as ShadowRoot ).host;
        if ( next ) {
            ancestor = next;
        }
        else {
            return ancestors;
        }
    }
}

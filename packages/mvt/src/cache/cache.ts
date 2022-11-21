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
import { arraySortStable, createWorkerPool, Disposer, FireableListenable, getNow_PMILLIS, IMMEDIATE, ListenableBasic, MERCATOR_PROJ, mod, run, submitToWorkerPool, WGS84_EQUATORIAL_CIRCUMFERENCE_METERS, WorkerPool, WorkerPoolWorker } from '@metsci/gleam-util';
import { areProjectionsCompatible, RenderGroupsMap, TileEntry, TileEntryReady, TileIndex, TileSetToc, TilesViewport, TOC_DEFAULT_CRS } from '../support';
import { createTileIndexComparator, WorkerResult } from './cacheSupport';

const { floor, max, min } = Math;

function getTileUrl( toc: TileSetToc, tileIndex: TileIndex ): string {
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    const rowCount = 1 << zoomLevel;
    const columnCount = rowCount;
    const rowIndex_TMS = rowCount - rowIndex - 1;

    const prefix = ( columnIndex % 16 ).toString( 16 ) + ( rowIndex % 16 ).toString( 16 );
    const z = zoomLevel.toFixed( 0 );
    const x = columnIndex.toFixed( 0 );
    const y = ( toc.scheme === 'tms' ? rowIndex_TMS : rowIndex ).toFixed( 0 );
    const quadKey = getBingMapsQuadKey( tileIndex );

    const urlTemplates = toc.tiles;
    const roundRobinIndex = ( columnIndex + rowIndex ) % urlTemplates.length;
    const urlTemplate = urlTemplates[ roundRobinIndex ];
    const url = urlTemplate
                 .replace( /{prefix}/g, prefix )
                 .replace( /{z}/g, z )
                 .replace( /{x}/g, x )
                 .replace( /{y}/g, y )
                 .replace( /{quadkey}/g, quadKey );

    // MvtPainter requires view projection to be compatible with toc projection, so if toc
    // projection is mercator-compatible we can assume tileIndex is linear in mercator coords
    if ( areProjectionsCompatible( MERCATOR_PROJ, toc ) ) {
        // This gives behavior equivalent to widely used third-party libraries
        const xMin_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS*( ( columnIndex + 0 )/columnCount - 0.5 );
        const xMax_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS*( ( columnIndex + 1 )/columnCount - 0.5 );
        const yMin_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS*( ( rowIndex_TMS + 0 )/rowCount - 0.5 );
        const yMax_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS*( ( rowIndex_TMS + 1 )/rowCount - 0.5 );
        return url.replace( /{bbox-epsg-3857}/g, `${xMin_3857},${yMin_3857},${xMax_3857},${yMax_3857}` );
    }
    else if ( url.indexOf( '{bbox-epsg-3857}' ) ) {
        // TODO: Reproject bbox from projected coords to EPSG:3857
        const crsString = toc.crs ?? ( TOC_DEFAULT_CRS + ' (by default)' );
        throw new Error( `Tile URL templates with {bbox-epsg-3857} are only supported when projection is compatible with EPSG:3857: crs = ${crsString}, url-template = ${urlTemplate}` );
    }
    else {
        return url;
    }
}

function getBingMapsQuadKey( tileIndex: TileIndex ): string {
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    let result = '';
    for ( let z = zoomLevel; z > 0; z-- ) {
        const bitmask = 1 << ( z - 1 );
        const digit = ( ( ( columnIndex & bitmask ) ? 1 : 0 ) + ( ( rowIndex & bitmask ) ? 2 : 0 ) );
        result += digit.toFixed( 0 );
    }
    return result;
}

function getAncestorTileKeys( zoomLevel: number, columnIndex: number, rowIndex: number ): Array<[ tileKey: string, tileIndex: TileIndex ]> {
    const result = new Array<[ tileKey: string, tileIndex: TileIndex ]>( );
    let z = zoomLevel;
    let c = columnIndex;
    let r = rowIndex;
    while ( z >= 0 ) {
        result.push( [
            `z=${z},x=${c},y=${r}`,
            { zoomLevel: z, columnIndex: c, rowIndex: r },
        ] );
        z--;
        c = floor( c / 2 );
        r = floor( r / 2 );
    }
    return result;
}

export interface RenderGroupsFactoryFn {
    ( view: TilesViewport, tileIndex: TileIndex, tileBuffer: Readonly<ArrayBuffer> ): Promise<RenderGroupsMap | undefined>;
}

// Bundler is configured to output a bundle at this location
// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const cacheWorkerUrl = new URL( './cacheWorker.worker.js', import.meta.url );

export function createCacheWorkerPool( options?: {
    workerCount?: number,
    workerCredentials?: RequestCredentials,
} ): WorkerPool {
    const workerCount = options?.workerCount ?? min( 12, navigator.hardwareConcurrency );
    return createWorkerPool( workerCount, i => new Worker( cacheWorkerUrl, {
        name: `MvtCache-${ i.toFixed( 0 ).padStart( 2, '0' ) }`,
        credentials: options?.workerCredentials,
    } ) );
}

export function createRenderGroupsFactory( cacheWorkerPool: WorkerPool ): RenderGroupsFactoryFn {
    return ( view, tileIndex, tileBuffer ) => {
        return submitToWorkerPool( cacheWorkerPool, ( cacheWorker, callKey ) => {
            return createRenderGroupsAsync( cacheWorker, callKey, view, tileIndex, tileBuffer );
        } );
    };
}

export function createRenderGroupsAsync( cacheWorker: WorkerPoolWorker, callKey: unknown, view: TilesViewport, tileIndex: TileIndex, tileBuffer: Readonly<ArrayBuffer> ): Promise<RenderGroupsMap | undefined> {
    // Send a request to the worker
    cacheWorker.postMessage( {
        callKey,
        viewUpdate: view,
        queryArgs: [ tileIndex, tileBuffer ],
    }, [ tileBuffer ] );

    // Wait for a response, or worker termination
    return new Promise( ( resolve, reject ) => {
        cacheWorker.termination.addListener( { once: true }, ( ) => {
            reject( 'Worker was terminated' );
        } );
        const messageListener = ( ev: MessageEvent<WorkerResult> ) => {
            const result = ev.data;
            if ( result.callKey === callKey ) {
                cacheWorker.removeEventListener( 'message', messageListener );
                resolve( result.queryResult );
            }
        };
        cacheWorker.addEventListener( 'message', messageListener );
    } );
}

export class MvtCache {
    readonly tocPromise: Promise<Readonly<TileSetToc>>;
    protected toc: Readonly<TileSetToc> | undefined;
    protected readonly tileEntries: Map<string,TileEntry>;
    protected readonly createRenderGroups: RenderGroupsFactoryFn;
    protected readonly repaint: FireableListenable;

    /**
     * For typical usage call `createRenderGroupsFactory( createCacheWorkerPool( ) )`
     * for the `createRenderGroups` arg. This uses the `cacheWorker.worker.js` script,
     * and assumes the toolchain used to build the application will (A) include the
     * worker script with the application's browser-accessible assets, and (B) detect
     * `new URL( <path-relative-to-source-file>, import.meta.url )` expressions and
     * rewrite them to point to the appropriate browser-accessible assets.
     *
     * Alternatively, the caller may pass in a custom function. This probably won't be
     * any easier from an asset-bookkeeping perspective -- ultimately something has to
     * make the worker script accessible to the browser, and pass the script's browser-
     * accessible URL into the `Worker` constructor. But it gives the caller additional
     * control.
     */
    constructor( tocPromise: Promise<Readonly<TileSetToc>>, createRenderGroups: RenderGroupsFactoryFn ) {
        this.tocPromise = tocPromise;
        this.toc = undefined;
        this.tileEntries = new Map( );
        this.createRenderGroups = createRenderGroups;
        this.repaint = new ListenableBasic( );
        tocPromise.then( toc => {
            this.toc = toc;
            this.repaint.fire( );
        } );
    }

    attachToRepaint( repaint: FireableListenable ): Disposer {
        return this.repaint.addListener( IMMEDIATE, ( ) => {
            repaint.fire( );
        } );
    }

    getTilesToRender( frameNum: number, view: TilesViewport ): Array<TileEntryReady> {
        // No tiles are ready until we finish fetching the toc
        if ( !this.toc ) {
            return [];
        }

        // Identify unique wrapped column indices
        const cs = new Set<number>( );
        const tocColumnCount = 1 << view.z;
        for ( let cRaw = view.cMin; cRaw <= view.cMax; cRaw++ ) {
            cs.add( mod( cRaw, tocColumnCount ) );
        }

        // Identify row indices
        const rs = new Set<number>( );
        const tocRowCount = 1 << view.z;
        for ( let r = max( 0, view.rMin ); r <= min( tocRowCount-1, view.rMax ); r++ ) {
            rs.add( r );
        }

        // Identify missing tiles
        const tilesToFetch = new Array<[ tileKey: string, tileIndex: TileIndex ]>( );
        for ( const r of rs ) {
            for ( const c of cs ) {
                for ( const [ tileKey, tileIndex ] of getAncestorTileKeys( view.z, c, r ) ) {
                    if ( !this.tileEntries.has( tileKey ) ) {
                        tilesToFetch.push( [ tileKey, tileIndex ] );
                    }
                }
            }
        }
        const compareTileIndices = createTileIndexComparator( view );
        tilesToFetch.sort( ( a, b ) => compareTileIndices( a[1], b[1] ) );

        // Request tiles from server
        for ( const [ tileKey, tileIndex ] of tilesToFetch ) {
            const tileUrl = getTileUrl( this.toc, tileIndex );
            const fetchController = new AbortController( );
            this.tileEntries.set( tileKey, {
                status: 'pending',
                tileUrl,
                tileIndex,
                expiresAfterFrameNum: frameNum + 1,
                fetchController,
            } );
            run( async ( ) => {
                try {
                    const resp = await self.fetch( new Request( tileUrl, {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'same-origin',
                        signal: fetchController.signal,
                    } ) );
                    if ( !this.tileEntries.has( tileKey ) ) {
                        return;
                    }
                    if ( resp.status !== 200 ) {
                        throw new Error( `Fetch failed: url = ${resp.url}, status = ${resp.status} (${resp.statusText})` );
                    }

                    const tileBuffer = await resp.arrayBuffer( );
                    if ( !this.tileEntries.has( tileKey ) ) {
                        return;
                    }

                    const renderGroups = await this.createRenderGroups( view, tileIndex, tileBuffer );
                    if ( !renderGroups ) {
                        return;
                    }
                    if ( !this.tileEntries.has( tileKey ) ) {
                        return;
                    }

                    this.tileEntries.set( tileKey, {
                        status: 'ready',
                        tileUrl,
                        tileIndex,
                        expiresAfterFrameNum: undefined,
                        renderGroups,
                    } );
                }
                catch ( e ) {
                    if ( !this.tileEntries.has( tileKey ) ) {
                        // Do nothing
                    }
                    else if ( e instanceof DOMException && e.name === 'AbortError' ) {
                        // Do nothing
                    }
                    else {
                        // TODO: Get cache expiry info from resp headers?
                        const millisUntilRetry = 10*60e3;
                        console.warn( `Tile ${tileUrl} is unavailable: time-until-retry = ${1e-3*millisUntilRetry} seconds\n`, e );
                        this.tileEntries.set( tileKey, {
                            status: 'unavailable',
                            tileUrl,
                            tileIndex,
                            expiresAfterTime_PMILLIS: getNow_PMILLIS( ) + millisUntilRetry,
                        } );
                    }
                }
                finally {
                    this.repaint.fire( );
                }
            } );
        }

        // Identify tiles to render, and bump their expiration counters
        const tileEntriesToRender = new Set<TileEntryReady>( );
        for ( const r of rs ) {
            for ( const c of cs ) {
                // If the tile at (z,c,r) is ready to render, then include it. Otherwise check its
                // parent (which has lower resolution but is better than nothing), grandparent, etc.
                let bestTileEntry: TileEntryReady | undefined = undefined;
                for ( const [ tileKey ] of getAncestorTileKeys( view.z, c, r ) ) {
                    const tileEntry = this.tileEntries.get( tileKey );
                    switch ( tileEntry?.status ) {
                        case 'pending': {
                            tileEntry.expiresAfterFrameNum = frameNum + 1;
                        }
                        break;

                        case 'ready': {
                            tileEntry.expiresAfterFrameNum = frameNum + 1;
                            if ( !bestTileEntry ) {
                                bestTileEntry = tileEntry;
                            }
                        }
                        break;
                    }
                }
                if ( bestTileEntry ) {
                    tileEntriesToRender.add( bestTileEntry );
                }
            }
        }

        // Discard expired tiles
        for ( const [ tileKey, tileEntry ] of this.tileEntries ) {
            switch ( tileEntry.status ) {
                case 'pending': {
                    if ( frameNum > tileEntry.expiresAfterFrameNum ) {
                        this.tileEntries.delete( tileKey );
                        tileEntry.fetchController.abort( );
                    }
                }
                break;

                case 'ready': {
                    if ( tileEntry.expiresAfterFrameNum === undefined ) {
                        // Last use is unknown but must have been on or before the current frame
                        tileEntry.expiresAfterFrameNum = frameNum + 1;
                    }
                    else if ( frameNum > tileEntry.expiresAfterFrameNum ) {
                        this.tileEntries.delete( tileKey );
                    }
                }
                break;

                case 'unavailable': {
                    if ( getNow_PMILLIS( ) > tileEntry.expiresAfterTime_PMILLIS ) {
                        // Tile is now eligible for another attempt
                        this.tileEntries.delete( tileKey );
                    }
                }
                break;
            }
        }

        // Sort tiles to be rendered low-res to high-res
        const tileEntriesInRenderOrder = new Array( ...tileEntriesToRender );
        arraySortStable( tileEntriesInRenderOrder, ( a, b ) => {
            return ( a.tileIndex.zoomLevel - b.tileIndex.zoomLevel );
        } );
        return tileEntriesInRenderOrder;
    }

    dispose( ): void {
        this.tileEntries.clear( );
    }
}

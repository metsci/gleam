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
import { appendChild, Disposer, DisposerGroup, NormalCylindricalProjection } from '@metsci/gleam-util';
import DOMPurify from 'dompurify';

/**
 * Table of contents for a set of tiles. This interface definition is based on
 * https://github.com/mapbox/tilejson-spec/blob/master/3.0.0/README.md, and is
 * augmented for ease of use with (1) other versions of the spec, and (2) real-
 * world tile sets.
 */
export interface TileSetToc {
    tilejson: string;
    tiles: Array<string>;

    vector_layers?: Array<{
        id: string;
        minzoom: number;
        maxzoom: number;
        description: string;
        fields: {
            [ name: string ]: string;
        };
    }>;

    name?: string;
    description?: string;
    version?: string;
    attribution?: string;

    formatter?: string;
    template?: string;
    legend?: string;
    scheme?: string;

    grids?: Array<string>;
    data?: Array<string>;
    resolution?: number;
    minzoom?: number;
    maxzoom?: number;
    bounds?: [
        westLon_DEG: number,
        southLat_DEG: number,
        eastLon_DEG: number,
        northLat_DEG: number,
    ];
    center?: [
        lon_DEG: number,
        lat_DEG: number,
        zoomLevel: number,
    ];

    crs?: string;
    crs_wkt?: string;
    extent?: Array<number>;
    [ name: string ]: unknown;
}

export const TOC_DEFAULT_BOUNDS = [ -180, -85.05112877980659, 180, 85.0511287798066 ] as const;
export const TOC_DEFAULT_SCHEME = 'xyz' as const;
export const TOC_DEFAULT_MINZOOM = 0;
export const TOC_DEFAULT_MAXZOOM = 30;
export const TOC_DEFAULT_CRS = 'EPSG:3857';

export async function fetchTileSetToc( url: string, reqInit: RequestInit ): Promise<TileSetToc> {
    const resp = await self.fetch( new Request( url, reqInit ) );
    if ( resp.status !== 200 ) {
        throw new Error( `Fetch failed: url = ${resp.url}, status = ${resp.status} (${resp.statusText})` );
    }
    return await resp.json( ) as TileSetToc;
}

export function areProjectionsCompatible( proj: NormalCylindricalProjection, toc: { crs?: string } ): boolean {
    const tocCrsKey = ( toc.crs ?? TOC_DEFAULT_CRS ).toUpperCase( );
    return proj.compatibleCrsKeys.has( tocCrsKey );
}

export function addMvtAttributionElement( parent: Node, tocPromise: Promise<TileSetToc> ): Disposer {
    const disposers = new DisposerGroup( );

    let alreadyDisposed = false;
    disposers.add( ( ) => {
        alreadyDisposed = true;
    } );

    tocPromise.then( toc => {
        if ( !alreadyDisposed && toc.attribution ) {
            const attributionDiv = document.createElement( 'div' );
            attributionDiv.classList.add( 'mvt-attribution' );
            attributionDiv.innerHTML = DOMPurify.sanitize( toc.attribution );
            disposers.add( appendChild( parent, attributionDiv ) );
        }
    } );

    return disposers;
}

export const FEATURE_TYPE_UNKNOWN = 0 as const;
export const FEATURE_TYPE_POINT = 1 as const;
export const FEATURE_TYPE_LINE = 2 as const;
export const FEATURE_TYPE_POLYGON = 3 as const;
export type FeatureType = typeof FEATURE_TYPE_UNKNOWN | typeof FEATURE_TYPE_POINT | typeof FEATURE_TYPE_LINE | typeof FEATURE_TYPE_POLYGON;

export interface TileIndex {
    zoomLevel: number;
    columnIndex: number;
    rowIndex: number;
}

export interface TileEntryPending {
    status: 'pending';
    tileIndex: TileIndex;
    tileUrl: string;
    expiresAfterFrameNum: number;
    fetchController: AbortController;
}
export interface TileEntryReady {
    status: 'ready';
    tileIndex: TileIndex;
    tileUrl: string;
    expiresAfterFrameNum: number | undefined;
    renderGroups: RenderGroupsMap;
}
export interface TileEntryUnavailable {
    status: 'unavailable';
    tileIndex: TileIndex;
    tileUrl: string;
    expiresAfterTime_PMILLIS: number;
}
export type TileEntry = TileEntryPending | TileEntryReady | TileEntryUnavailable;

export interface TilesViewport {
    z: number;

    cMin: number;
    cMax: number;
    cCenter: number;

    rMin: number;
    rMax: number;
    rCenter: number;
}

export interface RenderGroupsMap {
    lineGroupsByStem: Map<string,Array<RenderGroupLines>>;
    polygonGroupsByStem: Map<string,Array<RenderGroupPolygons>>;
}

export interface RenderGroupLines {
    extent: number;
    coords: LineCoords;
}
export interface LineCoords {
    /**
     * Coords: x_STEPS, y_STEPS, dxForward_STEPS (unnormalized), dyForward_STEPS (unnormalized)
     */
    triangleCoords4: Int16Array;
    triangleVertexCount: number;

    /**
     * Coords: x_STEPS, y_STEPS
     */
    pointCoords2: Int16Array;
    pointVertexCount: number;
}

export interface RenderGroupPolygons {
    extent: number;
    coords: PolygonCoords;
}
export interface PolygonCoords {
    /**
     * x_STEPS, y_STEPS
     */
    triangleCoords2: Int16Array;
    triangleVertexCount: number;
}

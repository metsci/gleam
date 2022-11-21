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
import { VectorTile, VectorTileFeature, VectorTileLayer } from '@mapbox/vector-tile';
import { Comparator, isDefined, mod, Supplier, wrapDelta } from '@metsci/gleam-util';
import earcut from 'earcut';
import Pbf from 'pbf';
import quickselect from 'quickselect';
import { FEATURE_TYPE_LINE, FEATURE_TYPE_POINT, FEATURE_TYPE_POLYGON, LineCoords, PolygonCoords, RenderGroupLines, RenderGroupPolygons, RenderGroupsMap, TileIndex, TilesViewport } from '../support';

const { abs, pow } = Math;

/**
 * Orders zoom levels:
 *  - 0
 *  - zView
 *  - zView - 1
 *  - zView - 2
 *  - ...
 *  - 1
 *  - Levels outside of [0,zView]
 */
export function createZoomLevelComparator( zView: number ): Comparator<number> {
    return ( a, b ) => {
        if ( a === b ) return 0;

        // Level zero gets highest priority
        if ( a === 0 ) return -1;
        if ( b === 0 ) return -1;

        // Munge out-of-range levels so they end up with low priority
        if ( a < 0 || a > zView ) {
            a = -abs( a - zView );
        }
        if ( b < 0 || b > zView ) {
            b = -abs( b - zView );
        }

        // Decreasing order from zCurr to 1
        return ( b - a );
    };
}

export function createTileIndexComparator( view: TilesViewport ): Comparator<TileIndex> {
    const compareZoomLevels = createZoomLevelComparator( view.z );
    return ( a, b ) => {
        const zComparison = compareZoomLevels( a.zoomLevel, b.zoomLevel );
        if ( zComparison !== 0 ) return zComparison;

        // Tiles whose centers are near the view center get higher priority
        const zAB = a.zoomLevel;
        const zAdjustFactor = pow( 2, zAB - view.z );
        const cCount = 1 << view.z;
        const cCenter = mod( view.cCenter * zAdjustFactor, cCount );
        const rCenter = view.rCenter * zAdjustFactor;
        const cDeltaA = wrapDelta( a.columnIndex - cCenter, cCount );
        const cDeltaB = wrapDelta( b.columnIndex - cCenter, cCount );
        const rDeltaA = a.rowIndex - rCenter;
        const rDeltaB = b.rowIndex - rCenter;
        const aDistSqFromCenter = cDeltaA*cDeltaA + rDeltaA*rDeltaA;
        const bDistSqFromCenter = cDeltaB*cDeltaB + rDeltaB*rDeltaB;
        return ( aDistSqFromCenter - bDistSqFromCenter );
    };
}

export interface WorkerCall {
    callKey: unknown;
    viewUpdate: TilesViewport;
    queryArgs?: [ tileIndex: TileIndex, tileBuffer: Readonly<ArrayBuffer> ];
}

export interface WorkerResult {
    callKey: unknown;

    /**
     * Missing iff the query was preempted.
     */
    queryResult?: RenderGroupsMap;
}

// TODO: Wish we could take a getGroupStem fn arg, but a closure can't be passed to a worker
export function createRenderGroups( tileIndex: TileIndex, tileBuffer: Readonly<ArrayBuffer> ): RenderGroupsMap {
    // Convert features into coord buffers
    // TODO: Try parallelizing using a worker pool
    const linesByExtentByStem = new Map<string,Map<number,Array<LineCoords>>>( );
    const polygonsByExtentByStem = new Map<string,Map<number,Array<PolygonCoords>>>( );
    const tile = new VectorTile( new Pbf( tileBuffer ) );
    for ( const layer of Object.values( tile.layers ) ) {
        for ( const feature of getLayerFeatures( layer ) ) {
            const geometry = feature.loadGeometry( );
            const stem = getGroupStem( tileIndex, layer, feature, geometry );
            switch ( feature.type ) {
                case FEATURE_TYPE_POINT: {
                    // TODO: Support point features
                }
                break;

                case FEATURE_TYPE_LINE: {
                    const coords = getLineFeatureCoords( geometry );
                    if ( coords.triangleCoords4.length > 0 || coords.pointCoords2.length > 0 ) {
                        const linesByExtent = mapSetIfAbsent( linesByExtentByStem, stem, ( ) => new Map<number,Array<LineCoords>>( ) );
                        const lines = mapSetIfAbsent( linesByExtent, feature.extent, ( ) => [] );
                        lines.push( coords );
                    }
                }
                break;

                case FEATURE_TYPE_POLYGON: {
                    const coords = getPolygonFeatureCoords( geometry, 500 );
                    if ( coords.triangleCoords2.length > 0 ) {
                        const polygonsByExtent = mapSetIfAbsent( polygonsByExtentByStem, stem, ( ) => new Map<number,Array<PolygonCoords>>( ) );
                        const polygons = mapSetIfAbsent( polygonsByExtent, feature.extent, ( ) => [] );
                        polygons.push( coords );
                    }
                }
                break;
            }
        }
    }

    // Combine line coord buffers that are in the same group and have the same layer extent
    const lineGroupsByStem = new Map<string,Array<RenderGroupLines>>( );
    for ( const [ stem, coordsByLayerExtent ] of linesByExtentByStem ) {
        for ( const [ extent, coords ] of coordsByLayerExtent ) {
            const triangleCoords4 = concatInt16Arrays( coords.map( c => c.triangleCoords4 ) );
            const pointCoords2 = concatInt16Arrays( coords.map( c => c.pointCoords2 ) );
            mapSetIfAbsent( lineGroupsByStem, stem, ( ) => [] ).push( {
                extent,
                coords: {
                    triangleCoords4,
                    triangleVertexCount: triangleCoords4.length >>> 2,
                    pointCoords2,
                    pointVertexCount: pointCoords2.length >>> 1,
                },
            } );
        }
    }

    // Combine polygon coord buffers that are in the same group and have the same layer extent
    const polygonGroupsByStem = new Map<string,Array<RenderGroupPolygons>>( );
    for ( const [ stem, coordsByLayerExtent ] of polygonsByExtentByStem ) {
        for ( const [ extent, coords ] of coordsByLayerExtent ) {
            const triangleCoords2 = concatInt16Arrays( coords.map( c => c.triangleCoords2 ) );
            mapSetIfAbsent( polygonGroupsByStem, stem, ( ) => [] ).push( {
                extent,
                coords: {
                    triangleCoords2,
                    triangleVertexCount: triangleCoords2.length >>> 1,
                },
            } );
        }
    }

    // Add a pseudo-feature for tile background, so high-res tiles won't
    // have empty spots where a low-res tile underneath can show through
    mapSetIfAbsent( polygonGroupsByStem, 'background', ( ) => [] ).push( {
        extent: 1,
        coords: {
            triangleCoords2: new Int16Array( [
                0,1, 0,0, 1,1,
                1,1, 0,0, 1,0,
            ] ),
            triangleVertexCount: 6,
        },
    } );

    return { lineGroupsByStem, polygonGroupsByStem };
}

function mapSetIfAbsent<K,V>( map: Map<K,V>, key: K, createValueFn: Supplier<V> ): V {
    if ( !map.has( key ) ) {
        map.set( key, createValueFn( ) );
    }
    return map.get( key )!;
}

function getLayerFeatures( layer: VectorTileLayer ): Array<VectorTileFeature> {
    const result = new Array<VectorTileFeature>( );
    for ( let i = 0; i < layer.length; i++ ) {
        result.push( layer.feature( i ) );
    }
    return result;
}

export type FeatureGeometry = Array<Array<{ x: number, y: number }>>;

/**
 * Returns the stem of a CSS classname to be used when styling the given feature.
 * The full CSS classname will be the returned stem, plus a suffix based on the
 * feature type. For example, if this fn returns `landcover_sand` and the feature
 * is of type area, the CSS classname will be `landcover_sand_area`.
 */
function getGroupStem( tileIndex: TileIndex, layer: VectorTileLayer, feature: VectorTileFeature, geometry: Readonly<FeatureGeometry> ): string {
    const props = feature.properties;
    const layerIs = ( layerName: string ): boolean => ( layer.name === layerName );
    const classIs = ( className: string ): boolean => ( props.class === className );
    const classHasAny = ( ...substrs: ReadonlyArray<string> ): boolean => strHasAny( props.class, substrs );
    const classHas = ( substr: string ): boolean => classHasAny( substr );
    const subclassHasAny = ( ...substrs: ReadonlyArray<string> ): boolean => strHasAny( props.subclass, substrs );
    const isBridge = ( props.brunnel === 'bridge' );
    const isTunnel = ( props.brunnel === 'tunnel' );
    const isIntermittent = ( props.intermittent === 1 );
    const isPolygon = ( feature.type === FEATURE_TYPE_POLYGON );

    if ( layerIs( 'landcover' ) && classHas( 'sand' ) ) return 'landcover_sand';
    if ( layerIs( 'landcover' ) && subclassHasAny( 'glacier', 'ice_shelf' ) ) return 'landcover_glacier';

    if ( layerIs( 'water' ) && isIntermittent ) return 'water_intermittent';
    if ( layerIs( 'water' ) && isTunnel ) return 'water_tunnel';
    if ( layerIs( 'water' ) ) return 'water';

    if ( layerIs( 'waterway' ) && isTunnel ) return 'waterway_tunnel';
    if ( layerIs( 'waterway' ) && isBridge ) return 'waterway_bridge';
    if ( layerIs( 'waterway' ) && isIntermittent ) return 'waterway_intermittent';
    if ( layerIs( 'waterway' ) ) return 'waterway';

    if ( layerIs( 'transportation' ) && classIs( 'pier' ) && isPolygon ) return 'road_area_pier';
    if ( layerIs( 'transportation' ) && isBridge && isPolygon ) return 'road_area_bridge';
    if ( layerIs( 'transportation' ) && classHas( 'pier' ) ) return 'road_pier';
    if ( layerIs( 'transportation' ) && isBridge && classHasAny( 'primary', 'secondary', 'tertiary', 'trunk' ) ) return 'bridge';

    if ( layerIs( 'boundary' ) && typeof props.admin_level === 'number' && props.admin_level <= 2 ) {
        const { zoomLevel, columnIndex } = tileIndex;
        const maxColumnIndex = ( 1 << zoomLevel ) - 1;
        const { extent } = feature;
        const xs = geometry.flat( ).map( p => p.x );
        const isLeftEdge = ( columnIndex === 0 && xs.every( x => ( x <= 0 ) ) );
        const isRightEdge = ( columnIndex === maxColumnIndex && xs.every( x => ( x >= extent ) ) );
        const isAntimeridian = ( isLeftEdge || isRightEdge );
        return `${ isAntimeridian ? 'antimeridian' : 'countryborder' }${ !!props.disputed ? '_disputed' : '' }${ !!props.maritime ? '_maritime' : '' }`;
    }

    return layer.name + ( props.class ? '_' + props.class : '' );
}

export function strHasAny( str: string | unknown, substrs: ReadonlyArray<string> ): boolean {
    if ( typeof str === 'string' ) {
        for ( const substr of substrs ) {
            if ( str.includes( substr ) ) {
                return true;
            }
        }
    }
    return false;
}

export function concatInt16Arrays( arrays: ReadonlyArray<Int16Array> ): Int16Array {
    const count = arrays.reduce( ( sum, a ) => sum + a.length, 0 );
    const result = new Int16Array( count );
    let i = 0;
    for ( const a of arrays ) {
        result.set( a, i );
        i += a.length;
    }
    return result;
}

export function getLineFeatureCoords( lineStrips: ReadonlyArray<ReadonlyArray<{ x: number, y: number }>> ): LineCoords {
    let lineCount = 0;
    let pointCount = 0;
    for ( const lineStrip of lineStrips ) {
        if ( lineStrip.length > 0 ) {
            lineCount += lineStrip.length - 1;
            pointCount += lineStrip.length;
        }
    }
    const triangleVertexCount = 2*3*lineCount;
    const triangleCoords4 = new Int16Array( 4*triangleVertexCount );
    const pointVertexCount = 1*pointCount;
    const pointCoords2 = new Int16Array( 2*pointVertexCount );

    let iTriangle = 0;
    let iPoint = 0;
    for ( const lineStrip of lineStrips ) {
        for ( let i = 1; i < lineStrip.length; i++ ) {
            const { x: x0, y: y0 } = lineStrip[ i-1 ];
            const { x: x1, y: y1 } = lineStrip[ i+0 ];
            const dxForward = x1 - x0;
            const dyForward = y1 - y0;
            iTriangle = put4s( triangleCoords4, iTriangle, x1, y1, -dxForward, -dyForward );
            iTriangle = put4s( triangleCoords4, iTriangle, x0, y0, -dxForward, -dyForward );
            iTriangle = put4s( triangleCoords4, iTriangle, x1, y1, +dxForward, +dyForward );
            iTriangle = put4s( triangleCoords4, iTriangle, x1, y1, +dxForward, +dyForward );
            iTriangle = put4s( triangleCoords4, iTriangle, x0, y0, -dxForward, -dyForward );
            iTriangle = put4s( triangleCoords4, iTriangle, x0, y0, +dxForward, +dyForward );
        }
        for ( const { x, y } of lineStrip ) {
            iPoint = put2s( pointCoords2, iPoint, x, y );
        }
    }
    return { triangleCoords4, triangleVertexCount, pointCoords2, pointVertexCount };
}

function put2s( array: Int16Array, i: number, a: number, b: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    return i;
}

function put4s( array: Int16Array, i: number, a: number, b: number, c: number, d: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    array[ i++ ] = d;
    return i;
}

export function getPolygonFeatureCoords( rings: ReadonlyArray<ReadonlyArray<{ x: number, y: number }>>, polygonHoleLimit: number | undefined ): PolygonCoords {
    type Xy = [ x: number, y: number ];
    type Ring = { xys: Array<Xy>, signedArea: number };
    type Polygon = Array<Ring>;

    const rings2 = rings.map( ring => {
        const xys: Array<Xy> = ring.map( p => [ p.x, p.y ] );
        return { xys, signedArea: computeSignedArea( xys ) };
    } );

    // Convert the arbitrarily nested polygon (which could be e.g. an ocean containing an
    // island containing a lake containing a smaller island) to a set of simpler polygons,
    // each with a set of holes but no nested rings beyond that
    const polygons = new Array<Polygon>( );
    let currPolygon: Polygon | undefined = undefined;
    let firstRingSignedArea: number | undefined = undefined;
    for ( const ring of rings2 ) {
        if ( ring.signedArea === 0 ) {
            continue;
        }
        if ( firstRingSignedArea === undefined ) {
            firstRingSignedArea = ring.signedArea;
        }

        if ( ( ring.signedArea < 0 ) !== ( firstRingSignedArea < 0 ) ) {
            // Ring is a hole in the current polygon
            currPolygon!.push( ring );
        }
        else {
            // Ring starts a new polygon
            if ( currPolygon ) {
                polygons.push( currPolygon );
            }
            currPolygon = [ ring ];
        }
    }
    if ( currPolygon ) {
        polygons.push( currPolygon );
    }

    const triangles = new Array<number>( );
    for ( let polygon of polygons ) {
        // Earcut's worst-case complexity scales quadratically. In practice it's
        // fast unless there are a large number of holes. ... Here we use the same
        // workaround Mapbox does, which is to retain the N largest holes and
        // discard the rest.
        //
        // When we discard a hole, we don't have enough information to recursively
        // discard rings nested within it. Specifically, given two rings whose
        // signed areas with the same sign, we can't tell whether they are siblings,
        // or grandparent and grandchild. As a result, we can end up e.g. retaining
        // an island but discarding the lake it's in. ... It's not clear how to fix
        // that, and it doesn't seem to cause noticeable problems in practice.
        if ( isDefined( polygonHoleLimit ) && polygon.length > 1+polygonHoleLimit ) {
            // Leave index 0 alone; that's the polygons's outer ring. Partially sort
            // the hole rings, which start at index 1, to find the N largest holes.
            quickselect( polygon, polygonHoleLimit, 1, polygon.length - 1, ( a, b ) => {
                return abs( b.signedArea ) - abs( a.signedArea );
            } );
            // Keep the outer ring and the N largest holes. Discard the rest.
            polygon = polygon.slice( 0, 1+polygonHoleLimit );
        }

        // Triangulate
        const { vertices, holes, dimensions } = earcut.flatten( polygon.map( ring => ring.xys ) );
        const vertexIndices = earcut( vertices, holes, dimensions );
        for ( const vertexIndex of vertexIndices ) {
            triangles.push( vertices[ 2*vertexIndex + 0 ] );
            triangles.push( vertices[ 2*vertexIndex + 1 ] );
        }
    }
    return {
        triangleCoords2: new Int16Array( triangles ),
        triangleVertexCount: triangles.length >> 1,
    };
}

export function computeSignedArea( ring: ReadonlyArray<[ x: number, y: number ]> ): number {
    // Based on https://en.wikipedia.org/wiki/Shoelace_formula#Trapezoid_formula
    let sum = 0;
    let prev = ring[ ring.length - 1 ];
    for ( const curr of ring ) {
        sum += ( prev[1] + curr[1] )*( prev[0] - curr[0] );
        prev = curr;
    }
    return 0.5*sum;
}

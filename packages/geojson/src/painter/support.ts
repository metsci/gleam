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
import { arraySortStable, clamp, createChainedComparator, DEG_TO_RAD, LatLon, LatLonInterpolator, LatLonInterpolatorDescriptor, latLonToXy, mapSetIfAbsent, NOOP, NormalCylindricalProjection, NormalCylindricalProjectionDescriptor, projectLatLonSegment, sphereSurfaceRingContains, toUnitSphereXyz, WGS84_EQUATORIAL_CIRCUMFERENCE_METERS, wrapNear } from '@metsci/gleam-util';
import { Geometry, Position } from 'geojson';
import libtess from 'libtess';

const { abs, max, min, PI, ceil, fround, log2, trunc } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;

export interface WorkerCall {
    callKey: unknown;
    geometry: Geometry;
    interpDesc: LatLonInterpolatorDescriptor;
    projDesc: NormalCylindricalProjectionDescriptor;
    perceptibleProjDist: number;
}

export interface WorkerResult {
    callKey: unknown;
    preRenderables: Array<PreRenderable>;
}

export type PreRenderable = MarkersPreRenderable | LinesPreRenderable | PolygonsPreRenderable;

export interface MarkersPreRenderable {
    readonly type: 'MARKERS';
    readonly scores: RenderableScores,
    readonly pointsA3: Float32Array,
    readonly pointsB2: Float32Array,
}

export interface LinesPreRenderable {
    readonly type: 'LINES';
    readonly scores: RenderableScores,
    readonly trianglesA3: Float32Array,
    readonly trianglesB2: Float32Array,
    readonly points3: Float32Array,
}

export interface PolygonsPreRenderable {
    readonly type: 'POLYGONS';
    readonly scores: RenderableScores,
    readonly fillTriangles3: Float32Array,
    readonly strokeTrianglesA3: Float32Array,
    readonly strokeTrianglesB2: Float32Array,
    readonly strokePoints3: Float32Array,
}

export interface RenderableScores {
    latScore: number;
    altitudeScore: number;
    areaScore: number;
}

export function createPreRenderables( geometry: Geometry, interp: LatLonInterpolator, proj: NormalCylindricalProjection, perceptibleProjDist: number ): Array<PreRenderable> {
    const results = new Array<PreRenderable>( );
    pushPreRenderables( geometry, interp, proj, perceptibleProjDist, results );
    return results;
}

function pushPreRenderables(
    geometry: Geometry,
    interp: LatLonInterpolator,
    proj: NormalCylindricalProjection,
    perceptibleProjDist: number,
    results_OUT: Array<PreRenderable>,
): void {
    const splitX = getSplitX( proj );
    switch ( geometry.type ) {
        case 'GeometryCollection': geometry.geometries.forEach( g => pushPreRenderables( g, interp, proj, perceptibleProjDist, results_OUT ) ); break;
        case 'Point': results_OUT.push( createMarkersPreRenderable( [ geometry.coordinates ], proj, splitX ) ); break;
        case 'MultiPoint': results_OUT.push( createMarkersPreRenderable( geometry.coordinates, proj, splitX ) ); break;
        case 'LineString': results_OUT.push( createLinesPreRenderable( [ geometry.coordinates ], interp, proj, perceptibleProjDist, splitX ) ); break;
        case 'MultiLineString': results_OUT.push( createLinesPreRenderable( geometry.coordinates, interp, proj, perceptibleProjDist, splitX ) ); break;
        case 'Polygon': results_OUT.push( createPolygonsPreRenderable( [ geometry.coordinates ], interp, proj, perceptibleProjDist, splitX ) ); break;
        case 'MultiPolygon': results_OUT.push( createPolygonsPreRenderable( geometry.coordinates, interp, proj, perceptibleProjDist, splitX ) ); break;
    }
}

export function getTransferables( preRenderables: Iterable<PreRenderable> ): Array<Transferable> {
    const transfers = new Array<Transferable>( );
    for ( const preRenderable of preRenderables ) {
        switch ( preRenderable.type ) {
            case 'MARKERS': transfers.push( preRenderable.pointsA3.buffer, preRenderable.pointsB2.buffer ); break;
            case 'LINES': transfers.push( preRenderable.trianglesA3.buffer, preRenderable.trianglesB2.buffer, preRenderable.points3.buffer ); break;
            case 'POLYGONS': transfers.push( preRenderable.fillTriangles3.buffer, preRenderable.strokeTrianglesA3.buffer, preRenderable.strokeTrianglesB2.buffer, preRenderable.strokePoints3.buffer ); break;
        }
    }
    return transfers;
}

export interface Splitter {
    ( x: number ): [ a: number, b: number ];
}

const cachedSplitters = new Map<number,Splitter>( );
function getSplitX( proj: NormalCylindricalProjection ): Splitter {
    const xSpan = proj.xSpan( );
    return mapSetIfAbsent( cachedSplitters, xSpan, ( ) => createXSplitter( xSpan ) );
}

/**
 * Creates a function that takes an X coord representing a projected longitude,
 * and splits the coord into two parts, each of which can be converted to a 32-
 * bit float, transferred to the graphics device, and used there for arithmetic
 * with 46-bit precision.
 *
 * The 46-bit splits values will have a number of fractional bits chosen, based
 * on the value of `xWrapSpan`, to give millimeter precision or slightly better.
 *
 * See https://help.agi.com/AGIComponents/html/BlogPrecisionsPrecisions.htm.
 */
export function createXSplitter( xWrapSpan: number ): Splitter {
    const xWrapSpan_MM = 1e3*WGS84_EQUATORIAL_CIRCUMFERENCE_METERS;
    const numFractionBits = ceil( log2( xWrapSpan_MM / xWrapSpan ) );
    const numWholeBits = 46 - numFractionBits;
    const numWholeBitsInBottomWord = 23 - numFractionBits;
    const xMaxSplittable = 2**numWholeBits;
    const aShiftFactor = 2**-numWholeBitsInBottomWord;
    const aUnshiftFactor = 2**numWholeBitsInBottomWord;
    return x => {
        if ( abs( x ) >= xMaxSplittable ) {
            // Precision loss is better than weird behavior
            return [ fround( x ), 0 ];
        }
        else {
            const a = trunc( x * aShiftFactor ) * aUnshiftFactor;
            const b = x - a;
            return [ fround( a ), fround( b ) ];
        }
    };
}

function positionToLatLon( p: Position ): LatLon {
    const [ lon_DEG, lat_DEG ] = p;
    return {
        lat_RAD: lat_DEG * DEG_TO_RAD,
        lon_RAD: lon_DEG * DEG_TO_RAD,
    };
}

type Xy = [ x: number, y: number ];
type Xyz = [ x: number, y: number, z: number ];
type XyMaybeZ = [ x: number, y: number, z?: number ];

function createMarkersPreRenderable(
    multiPointCoordinates: Position[],
    proj: NormalCylindricalProjection,
    splitX: Splitter,
): MarkersPreRenderable {
    const xMeridian = proj.lonToX( 0 );
    const xWrapSpan = proj.xSpan( );

    // Project, relativize to xMeridian, and wrap to [-180,+180)
    const points = new Array<Xyz>( );
    for ( const [ lon_DEG, lat_DEG, altitude_M ] of multiPointCoordinates ) {
        const xRaw = proj.lonToX( lon_DEG * DEG_TO_RAD );
        const x = wrapNear( xRaw, xMeridian, xWrapSpan );
        const y = proj.latToY( lat_DEG * DEG_TO_RAD );
        const z = altitude_M ?? 0;
        points.push( [ x, y, z ] );
    }

    // Sort
    const ALTITUDES_LOW_TO_HIGH = ( a: Xyz, b: Xyz ) => ( a[2] - b[2] );
    const LATITUDES_NORTH_TO_SOUTH = ( a: Xyz, b: Xyz ) => ( b[1] - a[1] );
    arraySortStable( points, createChainedComparator( [ ALTITUDES_LOW_TO_HIGH, LATITUDES_NORTH_TO_SOUTH ] ) );

    // Create points buffer
    let iA = 0;
    let iB = 0;
    const pointsA3 = new Float32Array( 6*3*points.length );
    const pointsB2 = new Float32Array( 6*2*points.length );
    for ( const [ x, y ] of points ) {
        const [ xa, xb ] = splitX( x );

        iA = put3f( pointsA3, iA, xa,xb,y );
        iA = put3f( pointsA3, iA, xa,xb,y );
        iA = put3f( pointsA3, iA, xa,xb,y );
        iA = put3f( pointsA3, iA, xa,xb,y );
        iA = put3f( pointsA3, iA, xa,xb,y );
        iA = put3f( pointsA3, iA, xa,xb,y );

        iB = put2f( pointsB2, iB, 0,1 );
        iB = put2f( pointsB2, iB, 1,1 );
        iB = put2f( pointsB2, iB, 0,0 );
        iB = put2f( pointsB2, iB, 0,0 );
        iB = put2f( pointsB2, iB, 1,1 );
        iB = put2f( pointsB2, iB, 1,0 );
    }

    return {
        type: 'MARKERS',
        scores: computeRenderableScores( points ),
        pointsA3,
        pointsB2,
    };
}

function put2f( array: Float32Array, i: number, a: number, b: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    return i;
}

function put3f( array: Float32Array, i: number, a: number, b: number, c: number ): number {
    array[ i++ ] = a;
    array[ i++ ] = b;
    array[ i++ ] = c;
    return i;
}

function createLinesPreRenderable(
    multiLineCoordinates: Position[][],
    interp: LatLonInterpolator,
    proj: NormalCylindricalProjection,
    perceptibleProjDist: number,
    splitX: Splitter,
): LinesPreRenderable {
    const xMeridian = proj.lonToX( 0 );
    const xWrapSpan = proj.xSpan( );

    // Project, wrapping so each line segment goes the short way around
    const lines = new Array<Array<Xy>>( );
    for ( const lineCoords of multiLineCoordinates ) {
        const line = new Array<Xy>( );

        // Project, resampling each segment according to the min perceptible distance
        let llPrev: LatLon | undefined = undefined;
        for ( const llCurr of lineCoords.map( positionToLatLon ) ) {
            if ( llPrev ) {
                const segment = projectLatLonSegment( llPrev, llCurr, interp, proj, perceptibleProjDist, false );
                line.push( ...segment );
            }
            llPrev = llCurr;
        }
        if ( llPrev ) {
            line.push( latLonToXy( proj, llPrev ) );
        }

        // Modify IN PLACE, wrapping projected X coords so each step goes the short way around
        let xPrev = xMeridian;
        for ( const xyCurr of line ) {
            xyCurr[0] = wrapNear( xyCurr[0], xPrev, xWrapSpan );
            xPrev = xyCurr[0];
        }

        // Store projected line
        if ( line.length > 0 ) {
            lines.push( line );
        }
    }

    // Create segments buffer
    const trianglesA3 = new Array<number>( );
    const trianglesB2 = new Array<number>( );
    for ( const line of lines ) {
        let xPrev = undefined as number | undefined;
        let yPrev = undefined as number | undefined;
        for ( const [ xCurr, yCurr ] of line ) {
            if ( xPrev !== undefined && yPrev !== undefined ) {
                const dxForward = xCurr - xPrev;
                const dyForward = yCurr - yPrev;
                if ( dxForward !== 0 || dyForward !== 0 ) {
                    const [ xCurrA, xCurrB ] = splitX( xCurr );
                    const [ xPrevA, xPrevB ] = splitX( xPrev );
                    trianglesA3.push(
                        xCurrA, xCurrB, yCurr,
                        xPrevA, xPrevB, yPrev,
                        xCurrA, xCurrB, yCurr,
                        xCurrA, xCurrB, yCurr,
                        xPrevA, xPrevB, yPrev,
                        xPrevA, xPrevB, yPrev,
                    );
                    trianglesB2.push(
                        -dxForward, -dyForward,
                        -dxForward, -dyForward,
                        +dxForward, +dyForward,
                        +dxForward, +dyForward,
                        -dxForward, -dyForward,
                        +dxForward, +dyForward,
                    );
                }
            }
            xPrev = xCurr;
            yPrev = yCurr;
        }
    }

    // Create joins buffer
    const points3 = new Array<number>( );
    for ( const line of lines ) {
        let xPrev = undefined as number | undefined;
        let yPrev = undefined as number | undefined;
        for ( const [ xCurr, yCurr ] of line ) {
            if ( xCurr !== xPrev || yCurr !== yPrev ) {
                const [ xCurrA, xCurrB ] = splitX( xCurr );
                points3.push( xCurrA, xCurrB, yCurr );
            }
            xPrev = xCurr;
            yPrev = yCurr;
        }
    }

    return {
        type: 'LINES',
        scores: computeRenderableScores( lines ),
        trianglesA3: new Float32Array( trianglesA3 ),
        trianglesB2: new Float32Array( trianglesB2 ),
        points3: new Float32Array( points3 ),
    };
}

function createPolygonsPreRenderable(
    multiPolygonCoordinates: Position[][][],
    interp: LatLonInterpolator,
    proj: NormalCylindricalProjection,
    perceptibleProjDist: number,
    splitX: Splitter,
): PolygonsPreRenderable {
    const xMeridian = proj.lonToX( 0 );
    const xWrapSpan = proj.xSpan( );
    type PolygonEntry = { polygon: Xy[][], polygonWithPoleTweaks: Xy[][], altitudeScore: number, areaScore: number };
    const northPole_UXYZ = [ 0, 0, +1 ] as const;
    const southPole_UXYZ = [ 0, 0, -1 ] as const;
    function projectRing( ring: Position[], xNearby: number ): { ring: Xy[], containsNorthPole: boolean, containsSouthPole: boolean } {
        const ring_UXYZ = ring.map( ( [ lon_DEG, lat_DEG ] ) => toUnitSphereXyz( lat_DEG*DEG_TO_RAD, lon_DEG*DEG_TO_RAD ) );
        const containsNorthPole = sphereSurfaceRingContains( ring_UXYZ, northPole_UXYZ );
        const containsSouthPole = sphereSurfaceRingContains( ring_UXYZ, southPole_UXYZ );

        const ring_PROJ = new Array<Xy>( );

        // Project, resampling each segment according to the min perceptible distance
        for ( let i = 0; i < ring.length; i++ ) {
            const llPrev = positionToLatLon( ring[ ( i - 1 + ring.length ) % ring.length ] );
            const llCurr = positionToLatLon( ring[ i ] );
            const segment = projectLatLonSegment( llPrev, llCurr, interp, proj, perceptibleProjDist, false );
            ring_PROJ.push( ...segment );
        }

        // Modify IN PLACE, wrapping projected X coords so each step goes the short way around
        let xPrev = xNearby;
        for ( const xyCurr of ring_PROJ ) {
            xyCurr[0] = wrapNear( xyCurr[0], xPrev, xWrapSpan );
            xPrev = xyCurr[0];
        }

        return { ring: ring_PROJ, containsNorthPole, containsSouthPole };
    }

    // Project, wrapping so each edge goes the short way around
    const polygonEntries = new Array<PolygonEntry>( );
    for ( const [ outer_LL, ...holes_LL ] of multiPolygonCoordinates ) {
        if ( outer_LL.length > 0 ) {
            const outer = projectRing( outer_LL, xMeridian );
            const rings = [ outer ];

            // Heuristic for wrapping holes so they land inside the outer ring
            let xOuterMin = POSITIVE_INFINITY;
            let xOuterMax = NEGATIVE_INFINITY;
            for ( const [ x ] of outer.ring ) {
                xOuterMin = min( xOuterMin, x );
                xOuterMax = max( xOuterMax, x );
            }
            const xOuterCenter = xOuterMin + 0.5*( xOuterMax - xOuterMin );
            for ( const hole_LL of holes_LL ) {
                const hole = projectRing( hole_LL, xOuterCenter );
                if ( hole.ring.length > 0 ) {
                    rings.push( hole );
                }
            }

            const polygon = new Array<Array<Xy>>( );
            for ( const { ring } of rings ) {
                polygon.push( ring );
            }

            const polygonWithPoleTweaks = new Array<Array<Xy>>( );
            for ( const { ring, containsNorthPole, containsSouthPole } of rings ) {
                if ( containsNorthPole ) {
                    const yNorth = clamp( proj.minUsableY( ), proj.maxUsableY( ), proj.latToY( +0.5*PI ) );

                    // Rotate vertex list so it starts with vertex nearest pole -- ensures
                    // retrace edges we inject won't intersect the ring's existing edges
                    let iNearPole = 0;
                    for ( let i = 0; i < ring.length; i++ ) {
                        if ( abs( ring[ i ][ 1 ] - yNorth ) < abs( ring[ iNearPole ][ 1 ] - yNorth ) ) {
                            iNearPole = i;
                        }
                    }

                    // Rewrap so each segment in the rotated list goes the short way around
                    const ringRotated = new Array<Xy>( );
                    let xPrev = xMeridian;
                    for ( let i = 0; i < ring.length; i++ ) {
                        const [ xRaw, y ] = ring[ ( iNearPole + i ) % ring.length ];
                        const x = wrapNear( xRaw, xPrev, xWrapSpan );
                        ringRotated.push( [ x, y ] );
                        xPrev = x;
                    }

                    // Inject retrace vertices along the north edge of the map
                    const [ xFirst, yFirst ] = ringRotated[ 0 ];
                    const [ xLast ] = ringRotated[ ringRotated.length - 1 ];
                    const xFirstWrapped = wrapNear( xFirst, xLast, xWrapSpan );
                    polygonWithPoleTweaks.push( [ [ xFirst,yNorth ], ...ringRotated, [ xFirstWrapped,yFirst ], [ xFirstWrapped,yNorth ] ] );
                }
                else if ( containsSouthPole ) {
                    const ySouth = clamp( proj.minUsableY( ), proj.maxUsableY( ), proj.latToY( -0.5*PI ) );

                    // Rotate vertex list so it starts with vertex nearest pole -- ensures
                    // retrace edges we inject won't intersect the ring's existing edges
                    let iNearPole = 0;
                    for ( let i = 0; i < ring.length; i++ ) {
                        if ( abs( ring[ i ][ 1 ] - ySouth ) < abs( ring[ iNearPole ][ 1 ] - ySouth ) ) {
                            iNearPole = i;
                        }
                    }

                    // Rewrap so each segment in the rotated list goes the short way around
                    const ringRotated = new Array<Xy>( );
                    let xPrev = xMeridian;
                    for ( let i = 0; i < ring.length; i++ ) {
                        const [ xRaw, y ] = ring[ ( iNearPole + i ) % ring.length ];
                        const x = wrapNear( xRaw, xPrev, xWrapSpan );
                        ringRotated.push( [ x, y ] );
                        xPrev = x;
                    }

                    // Inject retrace vertices along the south edge of the map
                    const [ xFirst, yFirst ] = ringRotated[ 0 ];
                    const [ xLast ] = ringRotated[ ringRotated.length - 1 ];
                    const xFirstWrapped = wrapNear( xFirst, xLast, xWrapSpan );
                    polygonWithPoleTweaks.push( [ [ xFirst,ySouth ], ...ringRotated, [ xFirstWrapped,yFirst ], [ xFirstWrapped,ySouth ] ] );
                }
                else {
                    polygonWithPoleTweaks.push( ring );
                }
            }

            polygonEntries.push( {
                polygon,
                polygonWithPoleTweaks,
                altitudeScore: computeAltitudeScore( polygon ),
                areaScore: computeAreaScore( polygonWithPoleTweaks ),
            } );
        }
    }

    // Sort
    arraySortStable( polygonEntries, ( a, b ) => {
        const altitudeComparison = a.altitudeScore - b.altitudeScore;
        if ( altitudeComparison !== 0 ) {
            return altitudeComparison;
        }
        const areaComparison = a.areaScore - b.areaScore;
        if ( areaComparison !== 0 ) {
            return areaComparison;
        }
        return 0;
    } );

    // Create fill triangles buffer
    const fillTriangles3 = new Array<number>( );
    const tess = new libtess.GluTesselator( );
    tess.gluTessCallback( libtess.gluEnum.GLU_TESS_COMBINE, ( xy: Xy ) => xy );
    tess.gluTessCallback( libtess.gluEnum.GLU_TESS_EDGE_FLAG, NOOP );
    tess.gluTessCallback( libtess.gluEnum.GLU_TESS_ERROR, ( errorCode: number ) => { throw new Error( `Tesselation failed: error-code = ${errorCode}` ) } );
    tess.gluTessCallback( libtess.gluEnum.GLU_TESS_VERTEX, ( [ x, y ]: Xy ) => {
        const [ xa, xb ] = splitX( x );
        fillTriangles3.push( xa, xb, y );
    } );
    tess.gluTessNormal( 0, 0, 1 );
    for ( const { polygonWithPoleTweaks } of polygonEntries ) {
        tess.gluTessBeginPolygon( );
        for ( const ring of polygonWithPoleTweaks ) {
            tess.gluTessBeginContour( );
            for ( const xy of ring ) {
                const [ x, y ] = xy;
                tess.gluTessVertex( [ x, y, 0 ], xy );
            }
            tess.gluTessEndContour( );
        }
        tess.gluTessEndPolygon( );
    }

    // Create stroke triangles buffer
    const strokeTrianglesA3 = new Array<number>( );
    const strokeTrianglesB2 = new Array<number>( );
    for ( const { polygon } of polygonEntries ) {
        for ( const ring of polygon ) {
            let [ xPrev, yPrev ] = ring[ ring.length - 1 ];
            xPrev = wrapNear( xPrev, ring[ 0 ][ 0 ], xWrapSpan );
            for ( const [ xCurr, yCurr ] of ring ) {
                const dxForward = xCurr - xPrev;
                const dyForward = yCurr - yPrev;
                if ( dxForward !== 0 || dyForward !== 0 ) {
                    const [ xCurrA, xCurrB ] = splitX( xCurr );
                    const [ xPrevA, xPrevB ] = splitX( xPrev );
                    strokeTrianglesA3.push(
                        xCurrA, xCurrB, yCurr,
                        xPrevA, xPrevB, yPrev,
                        xCurrA, xCurrB, yCurr,
                        xCurrA, xCurrB, yCurr,
                        xPrevA, xPrevB, yPrev,
                        xPrevA, xPrevB, yPrev,
                    );
                    strokeTrianglesB2.push(
                        -dxForward, -dyForward,
                        -dxForward, -dyForward,
                        +dxForward, +dyForward,
                        +dxForward, +dyForward,
                        -dxForward, -dyForward,
                        +dxForward, +dyForward,
                    );
                }
                xPrev = xCurr;
                yPrev = yCurr;
            }
        }
    }

    // Create stroke joins buffer
    const strokePoints3 = new Array<number>( );
    for ( const { polygon } of polygonEntries ) {
        for ( const ring of polygon ) {
            let [ xPrev, yPrev ] = ring[ ring.length - 1 ];
            xPrev = wrapNear( xPrev, ring[ 0 ][ 0 ], xWrapSpan );
            for ( const [ xCurr, yCurr ] of ring ) {
                const dxForward = xCurr - xPrev;
                const dyForward = yCurr - yPrev;
                if ( dxForward !== 0 || dyForward !== 0 ) {
                    const [ xCurrA, xCurrB ] = splitX( xCurr );
                    strokePoints3.push( xCurrA, xCurrB, yCurr );
                }
                xPrev = xCurr;
                yPrev = yCurr;
            }
        }
    }

    return {
        type: 'POLYGONS',
        scores: computeRenderableScores( polygonEntries.map( en => en.polygonWithPoleTweaks ) ),
        fillTriangles3: new Float32Array( fillTriangles3 ),
        strokeTrianglesA3: new Float32Array( strokeTrianglesA3 ),
        strokeTrianglesB2: new Float32Array( strokeTrianglesB2 ),
        strokePoints3: new Float32Array( strokePoints3 ),
    };
}

function computeRenderableScores( coords: XyMaybeZ | XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ): RenderableScores {
    return {
        latScore: computeLatScore( coords ),
        altitudeScore: computeAltitudeScore( coords ),
        areaScore: computeAreaScore( coords ),
    };
}

function computeLatScore( coords: XyMaybeZ | XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ): number {
    if ( typeof coords[0] === 'number' ) {
        const y = ( coords as XyMaybeZ )[1];
        return ( typeof y === 'number' ? -y : NEGATIVE_INFINITY );
    }
    else {
        let maxScore = NEGATIVE_INFINITY;
        for ( const entry of coords as XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ) {
            maxScore = max( maxScore, computeLatScore( entry ) );
        }
        return maxScore;
    }
}

function computeAltitudeScore( coords: XyMaybeZ | XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ): number {
    if ( typeof coords[0] === 'number' ) {
        const altitude_M = ( coords as XyMaybeZ )[2] ?? 0;
        return altitude_M;
    }
    else {
        let maxScore = NEGATIVE_INFINITY;
        for ( const entry of coords as XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ) {
            maxScore = max( maxScore, computeAltitudeScore( entry ) );
        }
        return maxScore;
    }
}

function computeAreaScore( coords: XyMaybeZ | XyMaybeZ[] | XyMaybeZ[][] | XyMaybeZ[][][] ): number {
    // Based on https://en.wikipedia.org/wiki/Shoelace_formula#Trapezoid_formula
    function computeArea( ring: XyMaybeZ[] ): number {
        let sum = 0;
        let prev = ring[ ring.length - 1 ];
        for ( const curr of ring ) {
            sum += ( prev[1] + curr[1] )*( prev[0] - curr[0] );
            prev = curr;
        }
        return abs( 0.5*sum );
    }

    if ( typeof coords[0] === 'number' ) {
        return 0;
    }
    else if ( typeof coords[0][0] === 'number' ) {
        const onlyRing = coords as XyMaybeZ[];
        return -computeArea( onlyRing );
    }
    else if ( typeof coords[0][0][0] === 'number' ) {
        const outerRing = ( coords as XyMaybeZ[][] )[0];
        return -computeArea( outerRing );
    }
    else {
        const polygons = coords as XyMaybeZ[][][];
        let totalScore = 0;
        for ( const polygon of polygons ) {
            const outerRing = polygon[0];
            totalScore += -computeArea( outerRing );
        }
        return totalScore;
    }
}

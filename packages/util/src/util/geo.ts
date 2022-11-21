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
import { clamp } from './misc';
import { wrapDelta, wrapNear } from './wrap';
import { dot3, fromUnitSphereXyz, getGreatCircleNormal, toUnitSphereXyz, Xyz } from './xyz';

const { acos, atan, cos, log, exp, PI, sin } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;

export const WGS84_EQUATORIAL_RADIUS_METERS = 6378137.0;
export const WGS84_EQUATORIAL_CIRCUMFERENCE_METERS = 2*Math.PI * WGS84_EQUATORIAL_RADIUS_METERS;

export const HALF_PI = 0.5 * PI;
export const DEG_TO_RAD = PI / 180.0;
export const RAD_TO_DEG = 180.0 / PI;

export interface NormalCylindricalProjectionDescriptor {
    type: string;
    params: Array<unknown>;
}

export interface NormalCylindricalProjection {
    readonly name: string;
    readonly desc: Readonly<NormalCylindricalProjectionDescriptor>;

    /**
     * Identifiers of Coordinate Reference Systems whose projected X coord is
     * a linear function of this projection's X coord, and whose projected Y
     * coord is a linear function of this projection's Y coord.
     */
    readonly compatibleCrsKeys: ReadonlySet<string>;

    readonly originLon_RAD: number;

    xToLon_RAD( x: number ): number;
    yToLat_RAD( y: number ): number;

    lonToX( lon_RAD: number ): number;
    latToY( lat_RAD: number ): number;

    xSpan( ): number;

    /**
     * Derivative of lat_RAD with respect to dy (i.e. dLat/dY), at the given y.
     */
    getDLatDY_RAD( y: number ): number;

    /**
     * Maximum value of dLat/dY over all y values in [yMin,yMax].
     */
    maxDLatDY_RAD( yMin?: number, yMax?: number ): number;

    minUsableY( ): number;
    maxUsableY( ): number;
}

export class EquirectNormalCylindricalProjection implements NormalCylindricalProjection {
    readonly compatibleCrsKeys: ReadonlySet<string> = new Set( [
        'EPSG:4326',
        'EPSG:4087',
        'EPSG:32662',
        'EPSG:32663',
        'EPSG:54001',
    ] );

    readonly name: string;
    readonly desc: Readonly<NormalCylindricalProjectionDescriptor>;
    protected readonly xToRad: number;
    protected readonly yToRad: number;

    /**
     * `radToX` and `radToY` default to `1.0`, which gives coords in radians.
     * To get coords in degrees, pass `RAD_TO_DEG`.
     */
    constructor(
        readonly originLon_RAD: number = 0.0,
        readonly radToX: number = 1.0,
        readonly radToY: number = radToX,
    ) {
        this.name = `Equirect[ rad-to-x=${this.radToX}, rad-to-y=${this.radToY}, x-origin=${this.originLon_RAD*this.radToX} ]`;
        this.desc = Object.freeze( {
            type: 'Equirect',
            params: [ originLon_RAD, radToX, radToY ],
        } );
        this.xToRad = 1.0 / this.radToX;
        this.yToRad = 1.0 / this.radToY;
    }

    xToLon_RAD( x: number ): number {
        const x_RAD = x*this.xToRad;
        return ( this.originLon_RAD + x_RAD );
    }

    lonToX( lon_RAD: number ): number {
        const x_RAD = lon_RAD - this.originLon_RAD;
        return ( x_RAD*this.radToX );
    }

    xSpan( ): number {
        return 2*PI*this.radToX;
    }

    yToLat_RAD( y: number ): number {
        const y_RAD = y*this.yToRad;
        return y_RAD;
    }

    latToY( lat_RAD: number ): number {
        const y_RAD = lat_RAD;
        return y_RAD*this.radToY;
    }

    getDLatDY_RAD( y: number ): number {
        return this.yToRad;
    }

    maxDLatDY_RAD( ): number {
        return this.yToRad;
    }

    minUsableY( ): number {
        return -HALF_PI*this.radToY;
    }

    maxUsableY( ): number {
        return +HALF_PI*this.radToY;
    }
}

export class MercatorNormalCylindricalProjection implements NormalCylindricalProjection {
    readonly compatibleCrsKeys: ReadonlySet<string> = new Set( [
        'EPSG:3857',
        'EPSG:3395',
        'EPSG:3785',
        'EPSG:900913',
        'ESRI:102100',
        'ESRI:102113',
        'OSGEO:41001',
    ] );

    readonly name: string;
    readonly desc: Readonly<NormalCylindricalProjectionDescriptor>;

    /**
     * `yCutoff` defaults to `PI`, which is reasonable in practice and makes
     * the bounds square.
     */
    constructor(
        readonly originLon_RAD: number = 0.0,
        readonly yCutoff: number = PI,
    ) {
        this.name = `Mercator[ lon-origin=${this.originLon_RAD}\u00B0, y-interval=[-${this.yCutoff},+${this.yCutoff}] ]`;
        this.desc = Object.freeze( {
            type: 'Mercator',
            params: [ originLon_RAD, yCutoff ],
        } );
    }

    xToLon_RAD( x: number ): number {
        return ( this.originLon_RAD + x );
    }

    lonToX( lon_RAD: number ): number {
        return ( lon_RAD - this.originLon_RAD );
    }

    xSpan( ): number {
        return 2*PI;
    }

    yToLat_RAD( y: number ): number {
        return ( ( 2.0 * atan( exp( y ) ) ) - HALF_PI );
    }

    latToY( lat_RAD: number ): number {
        return log( ( sin( lat_RAD ) + 1.0 ) / cos( lat_RAD ) );
    }

    getDLatDY_RAD( y: number ): number {
        const expY = exp( y );
        return ( ( 2.0 * expY ) / ( 1.0 + expY*expY ) );
    }

    maxDLatDY_RAD( yMin?: number, yMax?: number ): number {
        if ( yMin === undefined ) {
            yMin = NEGATIVE_INFINITY;
        }
        if ( yMax === undefined ) {
            yMax = POSITIVE_INFINITY;
        }

        // dlat/dy has a global maximum at y=0, and decreases monotonically
        // as y gets farther from 0 -- so we want to find dlat/dy at the y
        // value within [yMin,yMax] that is as close as possible to y=0
        if ( yMin <= 0.0 && 0.0 <= yMax )
        {
            // 0 ∊ [yMin,yMax], so use y=0
            //return this.dyToDlat_DEG( 0.0 );
            return 1.0;
        }
        else if ( yMin > 0.0 )
        {
            // The closest we can get to y=0 is yMin
            return this.getDLatDY_RAD( yMin );
        }
        else
        {
            // The closest we can get to y=0 is yMax
            return this.getDLatDY_RAD( yMax );
        }
    }

    minUsableY( ): number {
        return ( -1.0 * this.yCutoff );
    }

    maxUsableY( ): number {
        return ( +1.0 * this.yCutoff );
    }
}

export const EQUIRECT_PROJ_RAD = new EquirectNormalCylindricalProjection( 0.0, 1.0 );
export const EQUIRECT_PROJ_DEG = new EquirectNormalCylindricalProjection( 0.0, RAD_TO_DEG );
export const MERCATOR_PROJ = new MercatorNormalCylindricalProjection( 0.0 );

export function builtinProjectionFromDescriptor( desc: NormalCylindricalProjectionDescriptor ): NormalCylindricalProjection {
    switch ( desc.type ) {
        case 'Equirect': return new EquirectNormalCylindricalProjection( ...desc.params as ConstructorParameters<typeof EquirectNormalCylindricalProjection> );
        case 'Mercator': return new MercatorNormalCylindricalProjection( ...desc.params as ConstructorParameters<typeof MercatorNormalCylindricalProjection> );
        default: throw new Error( `Unrecognized projection type: ${desc.type}` );
    }
}

export interface LatLon {
    lat_RAD: number;
    lon_RAD: number;
}

export interface LatLonInterpolatorDescriptor {
    type: string;
    params?: Array<unknown>;
}

export interface LatLonInterpolator {
    readonly desc: Readonly<LatLonInterpolatorDescriptor>;
    getInterpFn( A: LatLon, B: LatLon ): ( fracAB: number ) => LatLon;
}

export const SPHERICAL_GREAT_CIRCLE_INTERPOLATOR: LatLonInterpolator = Object.freeze( {
    desc: {
        type: 'SphericalGreatCircle',
    },
    getInterpFn: ( A: LatLon, B: LatLon ) => {
        const xyzA = toUnitSphereXyz( A.lat_RAD, A.lon_RAD );
        const xyzB = toUnitSphereXyz( B.lat_RAD, B.lon_RAD );
        const distAB_RAD = acos( clamp( -1, +1, dot3( xyzA, xyzB ) ) );
        const N = getGreatCircleNormal( xyzA, xyzB );
        if ( !N || distAB_RAD < 1e-8 ) {
            // A and B are colocated, or close enough to cause precision issues
            return ( fracAB: number ) => {
                return ( fracAB <= 0.5 ? A : B );
            };
        }

        const [Nx,Ny,Nz] = N;
        const getXyzOnAB = ( fracAB: number ): Xyz => {
            const [x,y,z] = xyzA;
            const dist_RAD = distAB_RAD * fracAB;
            const sinD = sin( dist_RAD );
            const cosD = cos( dist_RAD );
            return [
                ( x *  ( cosD + Nx*Nx*(1-cosD) )   )  +  ( y * ( Nx*Ny*(1-cosD) - Nz*sinD ) )  +  ( z * ( Nx*Nz*(1-cosD) + Ny*sinD ) ),
                ( x * ( Nx*Ny*(1-cosD) + Nz*sinD ) )  +  ( y *  ( cosD + Ny*Ny*(1-cosD) )   )  +  ( z * ( Ny*Nz*(1-cosD) - Nx*sinD ) ),
                ( x * ( Nx*Nz*(1-cosD) - Ny*sinD ) )  +  ( y * ( Ny*Nz*(1-cosD) + Nx*sinD ) )  +  ( z *  ( cosD + Nz*Nz*(1-cosD) )   ),
            ];
        };

        return ( fracAB: number ) => {
            const xyz = getXyzOnAB( fracAB );
            const [ lat_RAD, lon_RAD ] = fromUnitSphereXyz( xyz );
            return { lat_RAD, lon_RAD };
        };
    },
} );

export const SPHERICAL_RHUMB_LINE_INTERPOLATOR: LatLonInterpolator = Object.freeze( {
    desc: {
        type: 'SphericalRhumbLine',
    },
    getInterpFn: ( A: LatLon, B: LatLon ) => {
        // TODO: Is there a more efficient way to implement this?
        const [ xA, yA ] = latLonToXy( MERCATOR_PROJ, A );
        const [ xRawB, yB ] = latLonToXy( MERCATOR_PROJ, B );
        const xB = wrapNear( xRawB, xA, MERCATOR_PROJ.xSpan( ) );
        return ( fracAB: number ) => {
            const x = xA + fracAB*( xB - xA );
            const y = yA + fracAB*( yB - yA );
            return xyToLatLon( MERCATOR_PROJ, [ x, y ] );
        };
    },
} );

export function builtinInterpFromDescriptor( desc: LatLonInterpolatorDescriptor ): LatLonInterpolator {
    switch ( desc.type ) {
        case 'SphericalGreatCircle': return SPHERICAL_GREAT_CIRCLE_INTERPOLATOR;
        case 'SphericalRhumbLine': return SPHERICAL_RHUMB_LINE_INTERPOLATOR;
        default: throw new Error( `Unrecognized interpolator type: ${desc.type}` );
    }
}

export type Xy = [ x: number, y: number ];

export function latLonToXy( proj: NormalCylindricalProjection, p: LatLon ): Xy {
    return [
        proj.lonToX( p.lon_RAD ),
        proj.latToY( p.lat_RAD ),
    ];
}

export function xyToLatLon( proj: NormalCylindricalProjection, xy: Xy ): LatLon {
    const [ x, y ] = xy;
    return {
        lat_RAD: proj.yToLat_RAD( y ),
        lon_RAD: proj.xToLon_RAD( x ),
    };
}

export function projectLatLonSegment(
    A: LatLon,
    B: LatLon,
    interp: LatLonInterpolator,
    proj: NormalCylindricalProjection,
    perceptibleProjDist: number,
    includeB: boolean,
): Array<Xy> {
    const xWrapSpan = proj.xSpan( );
    const perceptibleProjDistSq = perceptibleProjDist*perceptibleProjDist;

    const interpolate = interp.getInterpFn( A, B );

    type PointOnAB = [ frac: number, xProj: number, yProj: number ];
    const getPointOnAB = ( fracAB: number ): PointOnAB => {
        const { lat_RAD, lon_RAD } = interpolate( fracAB );
        const xProj = proj.lonToX( lon_RAD );
        const yProj = proj.latToY( lat_RAD );
        return [ fracAB, xProj, yProj ];
    };

    const appendSamples = ( start: PointOnAB, end: PointOnAB, result_OUT: Array<Xy> ): void => {
        const [ fracStart, xProjStart, yProjStart ] = start;
        const [ fracEnd, xProjEnd, yProjEnd ] = end;

        // If proj-start and proj-end are close together, no more subdividing
        const dx1 = wrapDelta( xProjEnd - xProjStart, xWrapSpan );
        const dy1 = yProjEnd - yProjStart;
        const d1sq = dx1*dx1 + dy1*dy1;
        if ( 0.25*d1sq < perceptibleProjDistSq ) {
            return;
        }

        // Compute the midpoint
        const mid = getPointOnAB( 0.5*( fracStart + fracEnd ) );
        const [ _, xProjMid, yProjMid ] = mid;

        // Convert proj-midpoint into along-track and across-track components
        // (i.e. projection onto and rejection from the line between proj-start
        // and proj-end) ... if its along-track coord is central-ish and its
        // across-track coord is small, no more subdividing
        const dx2 = wrapDelta( xProjMid - xProjStart, xWrapSpan );
        const dy2 = yProjMid - yProjStart;
        const projectionSq = ( dx1*dx2 + dy1*dy2 )/d1sq;
        const d1CrossD2 = dx1*dy2 - dx2*dy1;
        const rejectionSq = ( d1CrossD2 * d1CrossD2 )/d1sq;
        if ( 0.2 < projectionSq && projectionSq < 0.8 && rejectionSq < perceptibleProjDistSq ) {
            return;
        }

        // Recursively subdivide first half and second half
        appendSamples( start, mid, result_OUT );
        result_OUT.push( [ xProjMid, yProjMid ] );
        appendSamples( mid, end, result_OUT );
    };

    const result = new Array<Xy>( );
    result.push( latLonToXy( proj, A ) );
    appendSamples( getPointOnAB( 0 ), getPointOnAB( 1 ), result );
    if ( includeB ) {
        result.push( latLonToXy( proj, B ) );
    }
    return result;
}

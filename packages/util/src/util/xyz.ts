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
import { requireDefined } from './misc';

const { asin, atan2, cos, PI, sign, sin, sqrt } = Math;

export type Xyz = Readonly<[ x: number, y: number, z: number ]>;

export const X3 = Object.freeze( [ 1, 0, 0 ] as const );
export const Y3 = Object.freeze( [ 0, 1, 0 ] as const );
export const Z3 = Object.freeze( [ 0, 0, 1 ] as const );

export function toUnitSphereXyz( lat_RAD: number, lon_RAD: number ): Xyz {
    const sinLat = sin( lat_RAD );
    const cosLat = cos( lat_RAD );
    const sinLon = sin( lon_RAD );
    const cosLon = cos( lon_RAD );
    return [
        cosLat * cosLon,
        cosLat * sinLon,
        sinLat,
    ];
}

export function fromUnitSphereXyz( [x,y,z]: Xyz ): [ lat_RAD: number, lon_RAD: number ] {
    const lat_RAD = atan2( z, sqrt( x*x + y*y ) );
    const lon_RAD = atan2( y, x );
    return [ lat_RAD, lon_RAD ];
}

export function getGreatCircleNormal( A: Xyz, B: Xyz ): Xyz | undefined {
    const N = normalize3( cross3( A, B ) );
    if ( N ) {
        // This is the common case
        return N;
    }
    else {
        // These are corner cases
        const AoB = dot3( A, B );
        if ( AoB > 0 ) {
            // A and B are colocated
            return undefined;
        }
        else {
            // A and B are antipodes
            const ZxA = normalize3( cross3( Z3, A ) );
            if ( ZxA ) {
                // Choose (arbitrarily) the great circle whose max-latitude and min-latitude points are at A and B
                return normalize3( cross3( A, ZxA ) );
            }
            else {
                // A and B are at the poles; choose (arbitrarily) the great circle that goes through North America
                return X3;
            }
        }
    }
}

export function sphereSurfaceRingContains( ring_UNIT: ReadonlyArray<Xyz>, p_UNIT: Xyz ): boolean {
    // Use a trick from chapter 14 of the Red Book. Make a triangle-fan, starting from some
    // arbitrary point, and fanning out to each vertex in the polygon. Count how many of the
    // fan triangles contain the point -- the point is inside the polygon iff the count is odd.
    //
    // This approach has the advantage that it does not require a point whose inside/outside
    // status is known a priori.
    //
    // The disadvantage of this approach is that it can only give us even/odd winding behavior.
    // This is good enough for the use-cases we care about. It is also consistent with our
    // renderer. (Actually, the renderer doesn't always behave as it should when a polygon
    // overlaps a wrapped-around part of itself, so it's not 100% consistent. But still close
    // enough.)

    // TODO: Should some triangle edges be inclusive?

    if ( ring_UNIT.length < 3 ) {
        return false;
    }
    else {
        const a_UNIT = ring_UNIT[ 0 ];
        let b_UNIT = ring_UNIT[ 1 ];
        let count = 0;
        for ( let i = 2; i < ring_UNIT.length; i++ ) {
            const c_UNIT = ring_UNIT[ i ];
            if ( sphereSurfaceTriangleContains( a_UNIT, b_UNIT, c_UNIT, p_UNIT ) ) {
                count++;
            }
            b_UNIT = c_UNIT;
        }
        return ( count % 2 === 1 );
    }
}

export function sphereSurfaceTriangleContains( a_UNIT: Xyz, b_UNIT: Xyz, c_UNIT: Xyz, p_UNIT: Xyz ): boolean {
    // TODO: Allow each edge to be either inclusive or exclusive

    const distanceAB_RAD = angleBetweenUnitVectors_RAD( a_UNIT, b_UNIT );
    const distanceBC_RAD = angleBetweenUnitVectors_RAD( b_UNIT, c_UNIT );
    const distanceCA_RAD = angleBetweenUnitVectors_RAD( c_UNIT, a_UNIT );
    if ( distanceAB_RAD === 0.0 || distanceBC_RAD === 0.0 || distanceCA_RAD === 0.0 ) {
        return false;
    }

    const gcnAB_UNIT = normalize3( cross3( a_UNIT, b_UNIT ) ) ?? X3;
    const midpointAB_UNIT = normalize3( rotate3( a_UNIT, 0.5*distanceAB_RAD, gcnAB_UNIT ) ) ?? X3;
    const distanceCToMidpointAB_RAD = angleBetweenUnitVectors_RAD( c_UNIT, midpointAB_UNIT );
    if ( distanceCToMidpointAB_RAD === 0.0 ) {
        return false;
    }

    const TWO_THIRDS = 2.0 / 3.0;
    const gcnCToMidpointAB_UNIT = normalize3( cross3( c_UNIT, midpointAB_UNIT ) ) ?? X3;
    const centroid_UNIT = normalize3( rotate3( c_UNIT, TWO_THIRDS*distanceCToMidpointAB_RAD, gcnCToMidpointAB_UNIT ) ) ?? X3;

    const signumCentroidFromAB = sign( dot3( centroid_UNIT, gcnAB_UNIT ) );
    const signumPFromAB = sign( dot3( p_UNIT, gcnAB_UNIT ) );
    if ( signumPFromAB !== signumCentroidFromAB ) {
        // P and Centroid are on different sides of AB
        return false;
    }

    const gcnBC_UNIT = normalize3( cross3( b_UNIT, c_UNIT ) ) ?? X3;
    const signumCentroidFromBC = sign( dot3( centroid_UNIT, gcnBC_UNIT ) );
    if ( signumCentroidFromBC !== signumCentroidFromAB ) {
    // Centroid is not an interior point, presumably due to precision error and triangle degeneracy
        return false;
    }
    const signumPFromBC = sign( dot3( p_UNIT, gcnBC_UNIT ) );
    if ( signumPFromBC !== signumCentroidFromBC ) {
        // P and Centroid are on different sides of BC
        return false;
    }

    const gcnCA_UNIT = normalize3( cross3( c_UNIT, a_UNIT ) ) ?? X3;
    const signumCentroidFromCA = sign( dot3( centroid_UNIT, gcnCA_UNIT ) );
    const signumPFromCA = sign( dot3( p_UNIT, gcnCA_UNIT ) );
    if ( signumCentroidFromCA !== signumCentroidFromAB ) {
    // Centroid is not an interior point, presumably due to precision error and triangle degeneracy
        return false;
    }
    if ( signumPFromCA !== signumCentroidFromCA ) {
        // P and Centroid are on different sides of CA
        return false;
    }

    return true;
}

export function angleBetweenUnitVectors_RAD( a_UNIT: Xyz, b_UNIT: Xyz ): number {
    // See http://www.plunk.org/~hatch/rightway.php
    if ( dot3( a_UNIT, b_UNIT ) < 0.0 ) {
        return PI - 2.0*asin( 0.5 * norm3( plus3( a_UNIT, b_UNIT ) ) );
    }
    else {
        return 2.0*asin( 0.5 * norm3( minus3( a_UNIT, b_UNIT ) ) );
    }
}

export function plus3( a: Xyz, b: Xyz ): Xyz {
    const [ ax, ay, az ] = a;
    const [ bx, by, bz ] = b;
    return [
        ax + bx,
        ay + by,
        az + bz,
    ];
}

export function minus3( a: Xyz, b: Xyz ): Xyz {
    const [ ax, ay, az ] = a;
    const [ bx, by, bz ] = b;
    return [
        ax - bx,
        ay - by,
        az - bz,
    ];
}

export function norm3( v: Xyz ): number {
    return sqrt( normSquared3( v ) );
}

export function normSquared3( [x,y,z]: Xyz ): number {
    return ( x*x + y*y + z*z );
}

export function dot3( a: Xyz, b: Xyz ): number {
    const [ ax, ay, az ] = a;
    const [ bx, by, bz ] = b;
    return ( ax*bx + ay*by + az*bz );
}

export function cross3( a: Xyz, b: Xyz ): Xyz {
    const [ ax, ay, az ] = a;
    const [ bx, by, bz ] = b;
    return [
        ay*bz - az*by,
        az*bx - ax*bz,
        ax*by - ay*bx,
    ];
}

export function normalize3( v: Xyz ): Xyz | undefined {
    const norm = norm3( v );
    return ( norm === 0 ? undefined : scale3( v, 1.0 / norm ) );
}

export function scale3( [x,y,z]: Xyz, scaleFactor: number ): Xyz {
    return [
        scaleFactor * x,
        scaleFactor * y,
        scaleFactor * z,
    ];
}

export function negate3( [x,y,z]: Xyz ): Xyz {
    return [ -x, -y, -z ];
}

export function rotate3( [x,y,z]: Xyz, angle_RAD: number, axis: Xyz ): Xyz {
    const [ux,uy,uz] = requireDefined( normalize3( axis ) );
    const sinA = sin( angle_RAD );
    const cosA = cos( angle_RAD );
    return [
        ( x *  ( cosA + ux*ux*(1-cosA) )   )  +  ( y * ( ux*uy*(1-cosA) - uz*sinA ) )  +  ( z * ( ux*uz*(1-cosA) + uy*sinA ) ),
        ( x * ( ux*uy*(1-cosA) + uz*sinA ) )  +  ( y *  ( cosA + uy*uy*(1-cosA) )   )  +  ( z * ( uy*uz*(1-cosA) - ux*sinA ) ),
        ( x * ( ux*uz*(1-cosA) - uy*sinA ) )  +  ( y * ( uy*uz*(1-cosA) + ux*sinA ) )  +  ( z *  ( cosA + uz*uz*(1-cosA) )   ),
    ];
}

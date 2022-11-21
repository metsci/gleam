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
export const NORTH = Symbol( 'NORTH' );
export const SOUTH = Symbol( 'SOUTH' );
export const EAST = Symbol( 'EAST' );
export const WEST = Symbol( 'WEST' );
export const NORTHEAST = Symbol( 'NORTHEAST' );
export const NORTHWEST = Symbol( 'NORTHWEST' );
export const SOUTHEAST = Symbol( 'SOUTHEAST' );
export const SOUTHWEST = Symbol( 'SOUTHWEST' );

export type N = typeof NORTH;
export type S = typeof SOUTH;
export type E = typeof EAST;
export type W = typeof WEST;
export type NE = typeof NORTHEAST;
export type NW = typeof NORTHWEST;
export type SE = typeof SOUTHEAST;
export type SW = typeof SOUTHWEST;

export type Edge = N|S|E|W;
export type Corner = NE|NW|SE|SW;
export type Direction = N|S|E|W|NE|NW|SE|SW;

export function getOppositeEdge( edge: N|S ): N|S;
export function getOppositeEdge( edge: E|W ): E|W;
export function getOppositeEdge( edge: Edge ): Edge;
export function getOppositeEdge( edge: Edge ): Edge {
    switch ( edge ) {
        case NORTH: return SOUTH;
        case SOUTH: return NORTH;
        case EAST: return WEST;
        case WEST: return EAST;
    }
}

export function getOppositeCorner( corner: Corner ): Corner {
    switch ( corner ) {
        case NORTHEAST: return SOUTHWEST;
        case NORTHWEST: return SOUTHEAST;
        case SOUTHEAST: return NORTHWEST;
        case SOUTHWEST: return NORTHEAST;
    }
}

export function getOppositeDir( dir: Direction ): Direction {
    switch ( dir ) {
        case NORTH: return SOUTH;
        case SOUTH: return NORTH;
        case EAST: return WEST;
        case WEST: return EAST;
        case NORTHEAST: return SOUTHWEST;
        case NORTHWEST: return SOUTHEAST;
        case SOUTHEAST: return NORTHWEST;
        case SOUTHWEST: return NORTHEAST;
    }
}

export function getCorner( nsEdge: N|S, ewEdge: E|W ): Corner {
    switch ( nsEdge ) {
        case NORTH: return ( ewEdge === EAST ? NORTHEAST : NORTHWEST );
        case SOUTH: return ( ewEdge === EAST ? SOUTHEAST : SOUTHWEST );
    }
}

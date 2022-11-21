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
import { put2f } from '@metsci/gleam-core';
import { StateMarker } from './misc';

import fragShader_GLSL from './borders.frag';
import vertShader_GLSL from './borders.vert';

export const SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'DPR',
        'X_VIEW_LIMITS',
        'VIEWPORT_PX',
        'LANE_HEIGHT_PX',
        'EVENT_MIN_APPARENT_WIDTH_PX',
        'STYLES_TABLE',
        'STYLES_TABLE_SIZE',
        'EVENTS_TABLE',
        'EVENTS_TABLE_SIZE',
    ] as const,
    attribNames: [
        'inVertexCoords',
    ] as const,
} );

export class VertexSet {
    marker: StateMarker = StateMarker.create( );

    protected _eventCount: number;

    /**
     * eventIndex, ( 2-bit X rung, 2-bit Y rung )
     *
     * Rungs:   3 ┌─────────┐
     *          2 │ ┌─────┐ │
     *            │ │     │ │
     *          1 │ └─────┘ │
     *          0 └─────────┘
     *            0 1     2 3
     */
    vertexCoords: Float32Array;

    constructor( ) {
        this._eventCount = 0;
        this.vertexCoords = new Float32Array( 0 );
    }

    get eventCount( ): number {
        return this._eventCount;
    }

    set eventCount( value: number ) {
        this._eventCount = value;

        const coordsPerEvent = 2*6*4;
        const minLength = coordsPerEvent*this._eventCount;
        const oldLength = this.vertexCoords.length;
        if ( oldLength < minLength ) {
            const newLength = Math.max( minLength, 2*oldLength );
            const newArray = new Float32Array( newLength );
            newArray.set( this.vertexCoords );
            const oldEventCapacity = Math.floor( oldLength / coordsPerEvent );
            const newEventCapacity = Math.ceil( newLength / coordsPerEvent );
            for ( let eventIndex = oldEventCapacity; eventIndex < newEventCapacity; eventIndex++ ) {
                let i = coordsPerEvent * eventIndex;

                // Left edge
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 0 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 2 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 2 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 0 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 1 ) );

                // Right edge
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 2 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 1 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 1 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 0 ) );

                // Bottom edge
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 1 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 0 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 1 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 1 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 0 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 0 ) );

                // Top edge
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 0, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 2 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 3, 3 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 1, 2 ) );
                i = put2f( newArray, i, eventIndex, VertexSet.combineRungs( 2, 2 ) );
            }
            this.vertexCoords = newArray;
        }

        this.marker = this.marker.bump( );
    }

    protected static combineRungs( xRung: number, yRung: number ): number {
        // 2-bit X rung, 2-bit Y rung
        return ( ( xRung & 0x3 ) << 2 ) + ( yRung & 0x3 );
    }
}

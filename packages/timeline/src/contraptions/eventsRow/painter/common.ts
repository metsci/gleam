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
import { Color, Interval1D, put1f, put2f, put4f } from '@metsci/gleam-core';
import { FireableNotifier, NotifierBasic, requireDefined, run } from '@metsci/gleam-util';
import { StringSet } from './glyphsProgram';
import { requireInt, splitToMilliPrecision, StateMarker } from './misc';

export class StylesTable {
    marker: StateMarker = StateMarker.create( );
    readonly floatsPerRank: number;

    /**
     * Texel 1: labelXOffset_LPX, labelYOffset_LPX, ( 8-bit labelFgRed, 8-bit labelFgGreen ), ( 8-bit labelFgBlue, 8-bit labelFgAlpha )
     * Texel 2: labelAllowXOvershoot, borderThickness_LPX, ( 8-bit borderRed, 8-bit borderGreen ), ( 8-bit borderBlue, 8-bit borderAlpha )
     * Texel 3: barMarginBottom_LPX, barMarginTop_LPX
     */
    table: Float32Array;

    protected temp: Float32Array;

    constructor( options?: {
        floatsPerRank: number,
    } ) {
        this.floatsPerRank = options?.floatsPerRank ?? 4 * 4096;
        this.table = new Float32Array( 0 );
        this.temp = new Float32Array( 12 );
    }

    get ranksTotal( ): number {
        return requireInt( this.table.length / this.floatsPerRank );
    }

    texelsPerRank( floatsPerTexel: number ): number {
        return requireInt( this.floatsPerRank / floatsPerTexel );
    }

    set( index: number, v: {
        barMarginBottom_LPX: number,
        barMarginTop_LPX: number,
        barBorderColor: Color,
        barBorderWidth_LPX: number,
        labelOffsetX_LPX: number,
        labelOffsetY_LPX: number,
        labelColor: Color,
        labelAllowOvershoot: boolean,
    } ): void {
        const minLength = 12*( index + 1 );
        if ( this.table.length < minLength ) {
            const newNumRanks = Math.ceil( minLength / this.floatsPerRank );
            const newTable = new Float32Array( newNumRanks * this.floatsPerRank );
            newTable.set( this.table );
            this.table = newTable;
            this.marker = this.marker.bump( );
        }

        const labelRgBa = StylesTable.combineColorComponents( v.labelColor );
        const labelAllowOvershootFlag = ( v.labelAllowOvershoot ? 1.0 : 0.0 );
        const borderRgBa = StylesTable.combineColorComponents( v.barBorderColor );
        put4f( this.temp, 0, v.labelOffsetX_LPX, v.labelOffsetY_LPX, labelRgBa.rg, labelRgBa.ba );
        put4f( this.temp, 4, labelAllowOvershootFlag, v.barBorderWidth_LPX, borderRgBa.rg, borderRgBa.ba );
        put2f( this.temp, 8, v.barMarginBottom_LPX, v.barMarginTop_LPX );

        const anyValuesChanged = run( ( ) => {
            for ( let i = 0; i < 12; i++ ) {
                if ( this.temp[ i ] !== this.table[ 12*index + i ] ) {
                    return true;
                }
            }
            return false;
        } );
        if ( anyValuesChanged ) {
            this.table.set( this.temp, 12*index );
            this.marker = this.marker.bump( );
        }
    }

    protected static combineColorComponents( color: Color ): { rg: number, ba: number } {
        return {
            rg: ( ( ( 255*color.r ) & 0xFF ) << 8 ) + ( ( 255*color.g ) & 0xFF ),
            ba: ( ( ( 255*color.b ) & 0xFF ) << 8 ) + ( ( 255*color.a ) & 0xFF ),
        };
    }
}

interface EventPosition {
    era_PSEC: Interval1D;
    laneNum: number;
}

interface EventRightNeighbor {
    rightNeighbor_PSEC: number;
}

interface EventString {
    firstCodeIndex: number;
    codeCount: number;
}

interface EventStyle {
    styleIndex: number;
}

export interface IndexChange<K> {
    item: K;
    oldIndex: number | undefined;
    newIndex: number | undefined;
}

export class EventsTable<K> {
    marker: StateMarker = StateMarker.create( );

    readonly keyMoves: FireableNotifier<IndexChange<K> | undefined>;

    readonly floatsPerRank: number;

    protected readonly positionsByKey: Map<K,EventPosition>;
    protected readonly rightNeighborsByKey: Map<K,EventRightNeighbor>;
    protected readonly stringsByKey: Map<K,EventString>;
    protected readonly stylesByKey: Map<K,EventStyle>;

    protected readonly indicesByKey: Map<K,number>;
    protected readonly keysByIndex: Array<K>;

    /**
     * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES
     * Texel 2: firstCodeIndex, styleIndex, xRightNeighborHi_PSEC, xRightNeighborLo_PSEC
     */
    table: Float32Array;

    constructor( options?: {
        floatsPerRank: number,
    } ) {
        this.keyMoves = new NotifierBasic( undefined );

        this.floatsPerRank = options?.floatsPerRank ?? 4 * 4096;

        this.positionsByKey = new Map( );
        this.rightNeighborsByKey = new Map( );
        this.stringsByKey = new Map( );
        this.stylesByKey = new Map( );

        this.indicesByKey = new Map( );
        this.keysByIndex = new Array( );

        this.table = new Float32Array( 0 );
    }

    get ranksTotal( ): number {
        return requireInt( this.table.length / this.floatsPerRank );
    }

    texelsPerRank( floatsPerTexel: number ): number {
        return requireInt( this.floatsPerRank / floatsPerTexel );
    }

    index( key: K ): number | undefined {
        return this.indicesByKey.get( key );
    }

    key( index: number ): K | undefined {
        return this.keysByIndex[ index ];
    }

    firstCodeIndex( key: K ): number {
        return this.stringsByKey.get( key )?.firstCodeIndex ?? StringSet.NULL_FLOAT;
    }

    codeCount( key: K ): number {
        return this.stringsByKey.get( key )?.codeCount ?? 0;
    }

    setStyle( key: K, styleIndex: number ): void {
        const index = this.indicesByKey.get( key );
        if ( index !== undefined ) {
            put1f( this.table, 8*index + 5, styleIndex );
            this.stylesByKey.set( key, { styleIndex } );
            this.marker = this.marker.bump( );
        }
        else {
            const l = { styleIndex };
            const p = this.positionsByKey.get( key );
            const r = this.rightNeighborsByKey.get( key );
            const s = this.stringsByKey.get( key );
            if ( p && r && s ) {
                this.appendToTable( key, p, r, s, l );
            }
            else {
                this.stylesByKey.set( key, l );
            }
        }
    }

    setString( key: K, firstCodeIndex: number, codeCount: number ): void {
        const index = this.indicesByKey.get( key );
        if ( index !== undefined ) {
            put1f( this.table, 8*index + 4, firstCodeIndex );
            this.stringsByKey.set( key, { firstCodeIndex, codeCount } );
            this.marker = this.marker.bump( );
        }
        else {
            const s = { firstCodeIndex, codeCount };
            const p = this.positionsByKey.get( key );
            const r = this.rightNeighborsByKey.get( key );
            const l = this.stylesByKey.get( key );
            if ( p && r && l ) {
                this.appendToTable( key, p, r, s, l );
            }
            else {
                this.stringsByKey.set( key, s );
            }
        }
    }

    setPosition( key: K, era_PSEC: Interval1D, laneNum: number ): void {
        const index = this.indicesByKey.get( key );
        if ( index !== undefined ) {
            const xLeft_PSEC = splitToMilliPrecision( era_PSEC.min );
            put4f( this.table, 8*index + 0, xLeft_PSEC.a, xLeft_PSEC.b, era_PSEC.span, laneNum );
            this.positionsByKey.set( key, { era_PSEC, laneNum } );
            this.marker = this.marker.bump( );
        }
        else {
            const p = { era_PSEC, laneNum };
            const r = this.rightNeighborsByKey.get( key );
            const s = this.stringsByKey.get( key );
            const l = this.stylesByKey.get( key );
            if ( r && s && l ) {
                this.appendToTable( key, p, r, s, l );
            }
            else {
                this.positionsByKey.set( key, p );
            }
        }
    }

    setRightNeighbor( key: K, rightNeighbor_PSEC: number ): void {
        const index = this.indicesByKey.get( key );
        if ( index !== undefined ) {
            const xRightNeighbor_PSEC = splitToMilliPrecision( rightNeighbor_PSEC );
            put2f( this.table, 8*index + 6, xRightNeighbor_PSEC.a, xRightNeighbor_PSEC.b );
            this.rightNeighborsByKey.set( key, { rightNeighbor_PSEC } );
            this.marker = this.marker.bump( );
        }
        else {
            const r = { rightNeighbor_PSEC };
            const p = this.positionsByKey.get( key );
            const s = this.stringsByKey.get( key );
            const l = this.stylesByKey.get( key );
            if ( p && s && l ) {
                this.appendToTable( key, p, r, s, l );
            }
            else {
                this.rightNeighborsByKey.set( key, r );
            }
        }
    }

    protected appendToTable( key: K, p: EventPosition, r: EventRightNeighbor, s: EventString, l: EventStyle ): void {
        if ( this.indicesByKey.has( key ) ) {
            throw new Error( );
        }

        const index = this.keysByIndex.length;
        this.keysByIndex[ index ] = key;
        this.indicesByKey.set( key, index );

        const tableMinLength = 8*this.keysByIndex.length;
        if ( this.table.length < tableMinLength ) {
            const newNumFloats = Math.max( tableMinLength, 1.618*this.table.length );
            const newNumRanks = Math.ceil( newNumFloats / this.floatsPerRank );
            const newTable = new Float32Array( newNumRanks * this.floatsPerRank );
            newTable.set( this.table );
            this.table = newTable;
        }

        const xLeft_PSEC = splitToMilliPrecision( p.era_PSEC.min );
        const xRightNeighbor_PSEC = splitToMilliPrecision( r.rightNeighbor_PSEC );
        put4f( this.table, 8*index + 0, xLeft_PSEC.a, xLeft_PSEC.b, p.era_PSEC.span, p.laneNum );
        put4f( this.table, 8*index + 4, s.firstCodeIndex, l.styleIndex, xRightNeighbor_PSEC.a, xRightNeighbor_PSEC.b );

        this.positionsByKey.set( key, p );
        this.rightNeighborsByKey.set( key, r );
        this.stringsByKey.set( key, s );
        this.stylesByKey.set( key, l );

        this.marker = this.marker.bump( );
        this.keyMoves.fire( { item: key, oldIndex: undefined, newIndex: index } );
    }

    delete( key: K ): void {
        this.stylesByKey.delete( key );
        this.stringsByKey.delete( key );
        this.rightNeighborsByKey.delete( key );
        this.positionsByKey.delete( key );
        const index = this.indicesByKey.get( key );
        if ( index !== undefined ) {
            // Move the item from the end into the vacated slot, then cut off the end slot
            const moveToIndex = index;
            const moveFromIndex = this.keysByIndex.length - 1;
            if ( moveToIndex !== moveFromIndex ) {
                const movingKey = requireDefined( this.keysByIndex[ moveFromIndex ] );
                this.table.copyWithin( 8*moveToIndex, 8*moveFromIndex, 8*( moveFromIndex+1 ) );
                this.keysByIndex[ moveToIndex ] = movingKey;
                this.indicesByKey.set( movingKey, moveToIndex );
            }
            this.keysByIndex.length--;
            this.indicesByKey.delete( key );

            this.marker = this.marker.bump( );
            this.keyMoves.fire( { item: key, oldIndex: index, newIndex: undefined } );
            if ( moveToIndex !== moveFromIndex ) {
                this.keyMoves.fire( { item: key, oldIndex: moveFromIndex, newIndex: moveToIndex } );
            }
        }
    }
}

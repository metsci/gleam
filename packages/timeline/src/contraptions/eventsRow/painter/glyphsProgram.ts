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
import { AnchoredImage, Atlas, ensureHostBufferCapacity, put1f, put2f, put4f } from '@metsci/gleam-core';
import { equal, FireableNotifier, LinkedSet, NotifierBasic, requireDefined, ValueObject } from '@metsci/gleam-util';
import { requireInt, StateMarker } from './misc';

import fragShader_GLSL from './glyphs.frag';
import vertShader_GLSL from './glyphs.vert';

export const SOURCE = Object.freeze( {
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'DPR',
        'X_VIEW_LIMITS',
        'VIEWPORT_PX',
        'LANE_HEIGHT_PX',
        'FADE_ZONE_PX',
        'STYLES_TABLE',
        'STYLES_TABLE_SIZE',
        'EVENTS_TABLE',
        'EVENTS_TABLE_SIZE',
        'ATLAS',
        'ATLAS_SIZE_PX',
        'GLYPHS_TABLE',
        'GLYPHS_TABLE_SIZE',
        'CODES',
        'CODES_SIZE',
    ] as const,
    attribNames: [
        'inVertexCoords',
    ] as const,
} );

export interface GlyphStyle {
    createGlyphRasterizer( ): GlyphRasterizer;
}

export interface GlyphRasterizer extends ValueObject {
    createGlyph( glyphName: string ): Glyph;
}

export interface Glyph {
    /**
     * If false, each image pixel is a straight-up texel color.
     * If true, each image pixel holds FOUR alpha values, which
     * are used as a mask on the event-style's foreground color.
     */
    readonly isAlphaMask: boolean,

    /**
     * If `isAlphaMask` is false, this is equal to the width of
     * the image. But if `isAlphaMask` is true, this is the width
     * of the original image, before it was packed into RGBA
     * channels. This is important for images whose widths aren't
     * evenly divisible by 4, because their original widths can't
     * be recovered from the widths of their packed images.
     */
    readonly unpackedWidth: number;

    readonly image: AnchoredImage;
}

export class GlyphAtlas {
    marker: StateMarker = StateMarker.create( );

    readonly tocFloatsPerRank: number;

    protected readonly indicesByNameByStyle: Map<GlyphStyle,Map<string,number>>;
    protected nextIndex: number;

    protected readonly committedRasterizers: Map<GlyphStyle,GlyphRasterizer>;
    readonly glyphs: Map<number,Glyph>;
    readonly atlas: Atlas<number>;
    toc: Float32Array;

    constructor( options?: {
        tocFloatsPerRank: number,
    } ) {
        this.tocFloatsPerRank = options?.tocFloatsPerRank ?? 4 * 4096;

        this.indicesByNameByStyle = new Map( );
        this.nextIndex = 0;

        this.committedRasterizers = new Map( );
        this.glyphs = new Map( );
        this.atlas = new Atlas( 4096 );
        this.toc = new Float32Array( 0 );
    }

    get tocRanksTotal( ): number {
        return requireInt( this.toc.length / this.tocFloatsPerRank );
    }

    tocTexelsPerRank( floatsPerTexel: number ): number {
        return requireInt( this.tocFloatsPerRank / floatsPerTexel );
    }

    addIfAbsent( glyphStyle: GlyphStyle, glyphName: string ): number {
        const indicesByName = this.getIndicesByName( glyphStyle );
        const index = indicesByName.get( glyphName );
        if ( index !== undefined ) {
            return index;
        }
        else {
            const newIndex = this.nextIndex++;
            indicesByName.set( glyphName, newIndex );
            this.marker = this.marker.bump( );
            return newIndex;
        }
    }

    protected getIndicesByName( style: GlyphStyle ): Map<string,number> {
        const indicesByName = this.indicesByNameByStyle.get( style );
        if ( indicesByName !== undefined ) {
            return indicesByName;
        }
        else {
            const newIndicesByName = new Map<string,number>( );
            this.indicesByNameByStyle.set( style, newIndicesByName );
            return newIndicesByName;
        }
    }

    commit( ): void {
        let isTocValid = true;
        for ( const [ style, indicesByName ] of this.indicesByNameByStyle ) {
            const oldRasterizer = this.committedRasterizers.get( style );
            const newRasterizer = style.createGlyphRasterizer( );
            if ( !equal( newRasterizer, oldRasterizer ) ) {
                // Rasterizer has changed, so re-rasterize all its glyphs
                for ( const [ name, index ] of indicesByName ) {
                    const glyph = newRasterizer.createGlyph( name );
                    this.glyphs.set( index, glyph );
                    this.atlas.put( index, glyph.image );
                    isTocValid = false;
                }
                this.committedRasterizers.set( style, newRasterizer );
            }
            else {
                // Rasterizer hasn't changed, so only rasterize newly added glyphs
                for ( const [ name, index ] of indicesByName ) {
                    if ( !this.atlas.has( index ) ) {
                        const glyph = newRasterizer.createGlyph( name );
                        this.glyphs.set( index, glyph );
                        this.atlas.put( index, glyph.image );
                        isTocValid = false;
                    }
                }
            }
        }
        if ( !isTocValid ) {
            try {
                this.atlas.commit( );
            }
            catch {
                this.atlas.repack( );
                this.atlas.commit( );
            }

            const tocMinLength = 8*this.atlas.size;
            if ( this.toc.length < tocMinLength ) {
                const newNumRanks = Math.ceil( tocMinLength / this.tocFloatsPerRank );
                this.toc = new Float32Array( newNumRanks * this.tocFloatsPerRank );
            }

            for ( const [ index, _, box ] of this.atlas ) {
                const { isAlphaMask, unpackedWidth, image } = requireDefined( this.glyphs.get( index ) );

                const sMin_PX = box.xMin + image.border;
                const tMin_PX = box.yMin + image.border;
                const sUnpackedSpan_PX = unpackedWidth;
                const tSpan_PX = image.imageData.height - 2*image.border;
                put4f( this.toc, 8*index + 0, sMin_PX, tMin_PX, sUnpackedSpan_PX, tSpan_PX );

                const ascent_PX = image.yAnchor - image.border;
                const alphaMaskFlag = ( isAlphaMask ? 1 : 0 );
                put2f( this.toc, 8*index + 4, ascent_PX, alphaMaskFlag );
            }

            this.marker = this.marker.bump( );
        }
    }
}

export class StringSet {
    static readonly NULL_FLOAT: number = -1;

    marker: StateMarker = StateMarker.create( );

    readonly floatsPerRank: number;
    readonly floatsPerBlock: number;
    readonly codesPerBlock: number;
    readonly blocksPerRank: number;

    /**
     * The array is always allocated in whole numbers of ranks. Each rank
     * contains a whole number of blocks. Each block contains several glyph
     * codes, then a pointer to the next block in the string (or NULL_FLOAT
     * if the string doesn't have any more blocks).
     *
     * Typically:
     *  * 1 block = 8 floats = 7 glyphCodes + 1 blockPtr
     *  * 1 rank = 16384 floats = 2048 blocks
     */
    floats: Float32Array;
    protected readonly freeBlockNums: Array<number>;

    constructor( options?: {
        floatsPerRank: number,
        floatsPerBlock: number,
    } ) {
        this.floatsPerRank = options?.floatsPerRank ?? 4 * 4096;
        this.floatsPerBlock = options?.floatsPerBlock ?? 8;
        this.codesPerBlock = this.floatsPerBlock - 1;
        this.blocksPerRank = requireInt( this.floatsPerRank / this.floatsPerBlock );

        this.floats = new Float32Array( 0 );
        this.freeBlockNums = new Array( );
    }

    get ranksTotal( ): number {
        return requireInt( this.floats.length / this.floatsPerRank );
    }

    texelsPerRank( floatsPerTexel: number ): number {
        return requireInt( this.floatsPerRank / floatsPerTexel );
    }

    /**
     * Returns the string's `firstFloatIndex`.
     */
    add( codes: ArrayLike<number> ): number {
        if ( codes.length === 0 ) {
            return StringSet.NULL_FLOAT;
        }

        let firstBlockNum = undefined;
        let prevBlockNum = undefined;
        const blocksInString = Math.ceil( codes.length / this.codesPerBlock );
        for ( let blockInString = 0; blockInString < blocksInString; blockInString++ ) {
            // Acquired blocks are pre-filled with NULL_CODE
            const currBlockNum = this.acquireBlock( );
            if ( firstBlockNum === undefined ) {
                firstBlockNum = currBlockNum;
            }
            if ( prevBlockNum !== undefined ) {
                // Make the pointer at end of the previous block point to the current block
                this.floats[ prevBlockNum*this.floatsPerBlock + this.codesPerBlock ] = currBlockNum * this.floatsPerBlock;
            }
            const numCodesInBlock = Math.min( this.codesPerBlock, codes.length - blockInString*this.codesPerBlock );
            for ( let codeInBlock = 0; codeInBlock < numCodesInBlock; codeInBlock++ ) {
                this.floats[ currBlockNum*this.floatsPerBlock + codeInBlock ] = codes[ blockInString*this.codesPerBlock + codeInBlock ];
            }
            prevBlockNum = currBlockNum;
        }
        this.marker = this.marker.bump( );
        return ( requireDefined( firstBlockNum ) * this.floatsPerBlock );
    }

    /**
     * The argument must be a string's `firstFloatIndex`; otherwise behavior is undefined.
     */
    remove( firstFloatIndex: number ): void {
        if ( firstFloatIndex !== StringSet.NULL_FLOAT ) {
            const blockNum = Math.floor( firstFloatIndex / this.floatsPerBlock );
            if ( blockNum * this.floatsPerBlock !== firstFloatIndex ) {
                throw new Error( );
            }
            const nextFloatIndex = this.floats[ firstFloatIndex + this.codesPerBlock ];
            this.releaseBlock( blockNum );
            this.remove( nextFloatIndex );
            this.marker = this.marker.bump( );
        }
    }

    protected acquireBlock( ): number {
        const blockNum = this.freeBlockNums.pop( );
        if ( blockNum !== undefined ) {
            return blockNum;
        }
        else {
            const oldNumRanks = Math.ceil( this.floats.length / this.floatsPerRank );
            const minNumFloats = Math.max( this.floats.length + this.floatsPerBlock, 1.618*this.floats.length );
            const newNumRanks = Math.ceil( minNumFloats / this.floatsPerRank );
            const newFloats = new Float32Array( newNumRanks * this.floatsPerRank );
            newFloats.set( this.floats );
            newFloats.fill( StringSet.NULL_FLOAT, this.floats.length );
            this.floats = newFloats;
            for ( let newBlockNum = oldNumRanks*this.blocksPerRank; newBlockNum < newNumRanks*this.blocksPerRank; newBlockNum++ ) {
                this.freeBlockNums.push( newBlockNum );
            }
            return requireDefined( this.freeBlockNums.pop( ) );
        }
    }

    protected releaseBlock( blockNum: number ): void {
        this.floats.fill( StringSet.NULL_FLOAT, ( blockNum )*this.floatsPerBlock, ( blockNum + 1 )*this.floatsPerBlock );
        this.freeBlockNums.push( blockNum );
    }
}

export class VertexBoxSet {
    marker: StateMarker = StateMarker.create( );

    protected readonly boxIndicesByEventIndex: Map<number,LinkedSet<number>>;
    protected readonly eventIndicesByBoxIndex: Array<number>;
    readonly boxIndexDirtyings: FireableNotifier<number | undefined>;

    vertexCoords: Float32Array;

    constructor( ) {
        this.boxIndicesByEventIndex = new Map( );
        this.eventIndicesByBoxIndex = new Array( );
        this.boxIndexDirtyings = new NotifierBasic( undefined );

        this.vertexCoords = new Float32Array( 0 );
    }

    get boxCount( ): number {
        return this.eventIndicesByBoxIndex.length;
    }

    setEvent( eventIndex: number, codeCount: number ): void {
        this.removeBoxesForEvent( eventIndex );
        for ( let codeInString = 0; codeInString < codeCount; codeInString++ ) {
            const boxIndex = this.addBox( eventIndex );
            let j = 2*6*boxIndex;
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 2 ) );
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 0 ) );
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 3 ) );
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 3 ) );
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 0 ) );
            j = put2f( this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords( codeInString, 1 ) );
            this.boxIndexDirtyings.fire( boxIndex );
        }
        this.marker = this.marker.bump( );
    }

    protected static combineVertexCoords( codeInString: number, cornerNum: number ): number {
        // 14 bits of codeInString, and 2 bits of cornerNum
        return ( ( codeInString & 0x3FF ) << 2 ) + ( cornerNum & 0x3 );
    }

    /**
     * Doesn't fill in the vacated `eventIndex`. Caller is responsible for doing so by calling `updateEventIndex`.
     */
    deleteEvent( eventIndex: number ): void {
        this.removeBoxesForEvent( eventIndex );
        this.boxIndicesByEventIndex.delete( eventIndex );
    }

    updateEventIndex( eventOldIndex: number, eventNewIndex: number  ): void {
        if ( this.boxIndicesByEventIndex.has( eventNewIndex ) ) {
            throw new Error( );
        }
        const boxIndices = requireDefined( this.boxIndicesByEventIndex.get( eventOldIndex ) );
        this.boxIndicesByEventIndex.delete( eventOldIndex )
        this.boxIndicesByEventIndex.set( eventNewIndex, boxIndices );
        for ( const boxIndex of boxIndices ) {
            this.eventIndicesByBoxIndex[ boxIndex ] = eventNewIndex;
            let j = 2*6*boxIndex;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            j = put1f( this.vertexCoords, j, eventNewIndex ) + 1;
            this.boxIndexDirtyings.fire( boxIndex );
        }
        this.marker = this.marker.bump( );
    }

    protected addBox( eventIndex: number ): number {
        const boxIndex = this.eventIndicesByBoxIndex.length;
        let boxIndices = this.boxIndicesByEventIndex.get( eventIndex );
        if ( !boxIndices ) {
            boxIndices = new LinkedSet( );
            this.boxIndicesByEventIndex.set( eventIndex, boxIndices );
        }
        boxIndices.add( boxIndex );
        this.eventIndicesByBoxIndex[ boxIndex ] = eventIndex;
        this.vertexCoords = ensureHostBufferCapacity( this.vertexCoords, 2*6*this.eventIndicesByBoxIndex.length, true );
        return boxIndex;
    }

    protected removeBoxesForEvent( eventIndex: number ): void {
        const boxIndices = this.boxIndicesByEventIndex.get( eventIndex );
        if ( boxIndices ) {
            while ( true ) {
                const boxIndex = boxIndices.valueAfter( undefined );
                if ( boxIndex !== undefined ) {
                    this.removeBox( boxIndex );
                }
                else {
                    break;
                }
            }
        }
    }

    protected removeBox( boxIndex: number ): void {
        const eventIndex = requireDefined( this.eventIndicesByBoxIndex[ boxIndex ] );
        const boxIndices = requireDefined( this.boxIndicesByEventIndex.get( eventIndex ) );
        boxIndices.delete( boxIndex );

        const movingBoxIndex = this.eventIndicesByBoxIndex.length - 1;
        if ( boxIndex !== movingBoxIndex ) {
            this.vertexCoords.copyWithin( 2*6*boxIndex, 2*6*movingBoxIndex, 2*6*( movingBoxIndex+1 ) );
            this.boxIndexDirtyings.fire( boxIndex );

            const movingEventIndex = requireDefined( this.eventIndicesByBoxIndex[ movingBoxIndex ] );
            const movingBoxIndices = requireDefined( this.boxIndicesByEventIndex.get( movingEventIndex ) );
            movingBoxIndices.delete( movingBoxIndex );
            movingBoxIndices.add( boxIndex );

            this.eventIndicesByBoxIndex[ boxIndex ] = movingEventIndex;
        }

        this.eventIndicesByBoxIndex.length--;
    }
}

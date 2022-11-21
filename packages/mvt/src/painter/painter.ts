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
import { bufferDataF32, bufferDataI16, Color, Context, createDomPeer, cssArray, cssColor, cssFloat, CssParser, currentDpr, DomPeer, enablePremultipliedAlphaBlending, frozenSupplier, GL, glUniformRgba, GRAY, Interval2D, Painter, PeerType, Point2D, put4f, StyleProp, UnboundStyleProp, UNPARSEABLE, vertexAttribPointer } from '@metsci/gleam-core';
import { clamp, DEG_TO_RAD, mapRequire, mapSetIfAbsent, mod, NormalCylindricalProjection, RefBasic, requireNonNullish, Supplier, tripleEquals } from '@metsci/gleam-util';
import { MvtCache } from '../cache';
import { areProjectionsCompatible, FeatureType, FEATURE_TYPE_LINE, FEATURE_TYPE_POINT, FEATURE_TYPE_POLYGON, RenderGroupLines, RenderGroupPolygons, TileIndex, TileSetToc, TilesViewport, TOC_DEFAULT_BOUNDS, TOC_DEFAULT_CRS, TOC_DEFAULT_MAXZOOM, TOC_DEFAULT_MINZOOM } from '../support';

const { floor, log2, PI, round } = Math;

import fillFragShader_GLSL from './fillShader.frag';
import fillVertShader_GLSL from './fillShader.vert';
const FILL_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: fillVertShader_GLSL,
    fragShader_GLSL: fillFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
    ] as const,
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ] as const,
} );

import lineFragShader_GLSL from './lineShader.frag';
import lineVertShader_GLSL from './lineShader.vert';
const LINE_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: lineVertShader_GLSL,
    fragShader_GLSL: lineFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
        'THICKNESS_PX',
        'FEATHER_PX',
    ] as const,
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ] as const,
} );

import pointFragShader_GLSL from './pointShader.frag';
import pointVertShader_GLSL from './pointShader.vert';
const POINT_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: pointVertShader_GLSL,
    fragShader_GLSL: pointFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
        'DIAMETER_PX',
        'FEATHER_PX',
    ] as const,
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ] as const,
} );

function projectTocBounds( toc: TileSetToc, toProj: NormalCylindricalProjection ): Interval2D {
    const [ westLon_DEG, southLat_DEG, eastLon_DEG, northLat_DEG ] = toc.bounds ?? TOC_DEFAULT_BOUNDS;
    const xMin = toProj.lonToX( westLon_DEG * DEG_TO_RAD );
    const xMax = toProj.lonToX( eastLon_DEG * DEG_TO_RAD );
    const yMin = toProj.latToY( southLat_DEG * DEG_TO_RAD );
    const yMax = toProj.latToY( northLat_DEG * DEG_TO_RAD );
    return Interval2D.fromEdges( xMin, xMax, yMin, yMax );
}

function boxToFracOfOtherBox( box: Interval2D, otherBox: Interval2D ): Interval2D {
    const xMin = otherBox.x.valueToFrac( box.xMin );
    const xMax = otherBox.x.valueToFrac( box.xMax );
    const yMin = otherBox.y.valueToFrac( box.yMin );
    const yMax = otherBox.y.valueToFrac( box.yMax );
    return Interval2D.fromEdges( xMin, xMax, yMin, yMax );
}

function boxFromFracOfOtherBox( frac: Interval2D, otherBox: Interval2D ): Interval2D {
    const xMin = otherBox.x.fracToValue( frac.xMin );
    const xMax = otherBox.x.fracToValue( frac.xMax );
    const yMin = otherBox.y.fracToValue( frac.yMin );
    const yMax = otherBox.y.fracToValue( frac.yMax );
    return Interval2D.fromEdges( xMin, xMax, yMin, yMax );
}

function getTilesInView( tocBounds: Interval2D, viewBounds: Interval2D, zoomLevel: number ): TilesViewport {
    const tocRowCount = 1 << zoomLevel;
    const tocColumnCount = tocRowCount;
    const viewBounds_TOCFRAC = boxToFracOfOtherBox( viewBounds, tocBounds );
    const viewCenter = viewBounds.fracToValue( new Point2D( 0.5, 0.5 ) );
    const viewCenter_TOCFRAC = tocBounds.valueToFrac( viewCenter );
    return {
        z: zoomLevel,

        cMin: floor( viewBounds_TOCFRAC.xMin * tocColumnCount ),
        cMax: floor( viewBounds_TOCFRAC.xMax * tocColumnCount ),
        cCenter: viewCenter_TOCFRAC.x * tocColumnCount,

        rMin: floor( ( 1.0 - viewBounds_TOCFRAC.yMax ) * tocRowCount ),
        rMax: floor( ( 1.0 - viewBounds_TOCFRAC.yMin ) * tocRowCount ),
        rCenter: ( 1.0 - viewCenter_TOCFRAC.y ) * tocRowCount,
    };
}

function getProjectedTileBounds( tocBounds: Interval2D, tileIndex: TileIndex ): Interval2D {
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    const oneOverTocRowCount = 1.0 / ( 1 << zoomLevel );
    const oneOverTocColumnCount = oneOverTocRowCount;
    const xMin_TOCFRAC = ( columnIndex + 0 ) * oneOverTocColumnCount;
    const xMax_TOCFRAC = ( columnIndex + 1 ) * oneOverTocColumnCount;
    const yMin_TOCFRAC = 1.0 - ( ( rowIndex + 0 ) * oneOverTocRowCount );
    const yMax_TOCFRAC = 1.0 - ( ( rowIndex + 1 ) * oneOverTocRowCount );
    const tileBounds_TOCFRAC = Interval2D.fromEdges( xMin_TOCFRAC, xMax_TOCFRAC, yMin_TOCFRAC, yMax_TOCFRAC );
    return boxFromFracOfOtherBox( tileBounds_TOCFRAC, tocBounds );
}

function getViewColumnIndicesByWrappedColumnIndexByZoomLevel( view: TilesViewport ): Array<Map<number,Array<number>>> {
    const csByCWrappedByZ = new Array<Map<number,Array<number>>>( );
    let { z, cMin, cMax } = view;
    while ( z >= 0 ) {
        const csByCWrapped = new Map<number,Array<number>>( );
        const cCount = 1 << z;
        for ( let c = cMin; c <= cMax; c++ ) {
            const cWrapped = mod( c, cCount );
            mapSetIfAbsent( csByCWrapped, cWrapped, ( ) => [] ).push( c );
        }
        csByCWrappedByZ[ z ] = csByCWrapped;

        z--;
        cMin = floor( cMin / 2 );
        cMax = floor( cMax / 2 );
    }
    return csByCWrappedByZ;
}

interface StyleEntry {
    readonly peer: DomPeer;
    readonly style: CSSStyleDeclaration;
}

export const cssRenderGroupKey = new CssParser<{ stem: string, type: FeatureType }>( 'e.g. landcover_sand_area', s => {
    const i = s.lastIndexOf( '_' );
    if ( i >= 0 ) {
        const stem = s.substring( 0, i );
        switch ( s.substring( i + 1 ) ) {
            case 'point': return { stem, type: FEATURE_TYPE_POINT };
            case 'line': return { stem, type: FEATURE_TYPE_LINE };
            case 'area': return { stem, type: FEATURE_TYPE_POLYGON };
        }
    }
    return UNPARSEABLE;
} );

export class MvtPainter implements Painter {
    readonly peer = createDomPeer( 'mvt-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly renderGroupKeys = StyleProp.create( this.style, '--render-groups', cssArray( cssRenderGroupKey ), 'background_area, water_area, waterway_line' );
    readonly featureFillColor = UnboundStyleProp.create( '--fill-color', cssColor, GRAY, 100 );
    readonly featureLineColor = UnboundStyleProp.create( '--line-color', cssColor, GRAY, 100 );
    readonly featureLineThickness_LPX = UnboundStyleProp.create( '--line-thickness-px', cssFloat, 1, 100 );

    readonly visible = new RefBasic( true, tripleEquals );

    readonly viewProj: NormalCylindricalProjection;
    viewBoundsFn: Supplier<Interval2D>;

    protected readonly cache: MvtCache;
    protected toc: Readonly<TileSetToc> | undefined;
    protected tocBounds: Interval2D | undefined;
    protected readonly stylesByGroupKey: Map<string,StyleEntry>;

    constructor(
        cache: MvtCache,
        viewProj: NormalCylindricalProjection,
        viewBoundsFn: Supplier<Interval2D> = frozenSupplier( Interval2D.fromEdges( 0, 1, 0, 1 ) ),
    ) {
        this.viewProj = viewProj;
        this.viewBoundsFn = viewBoundsFn;

        this.cache = cache;
        this.tocBounds = undefined;
        this.stylesByGroupKey = new Map( );
        this.cache.tocPromise.then( toc => {
            if ( !areProjectionsCompatible( viewProj, toc ) ) {
                throw new Error( `Tile coords are not compatible with view projection: tile-crs=${toc.crs ?? TOC_DEFAULT_CRS}, view-proj=${viewProj.name}` );
            }
            this.toc = toc;
            this.tocBounds = projectTocBounds( this.toc, this.viewProj );
        } );
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        if ( !this.toc || !this.tocBounds ) {
            return;
        }

        const gl = context.gl;
        const glExt = requireNonNullish( gl.getExtension( 'ANGLE_instanced_arrays' ) );

        // Painter-level style values
        const renderGroupKeys = this.renderGroupKeys.get( );

        // Cache feature style values, so we don't repeat CSS lookups for every individual feature
        const fillColorsByGroupKey = new Map<string,Color>( );
        const getFillColor = ( groupKey: string ) => {
            return mapSetIfAbsent( fillColorsByGroupKey, groupKey, ( ) => {
                const groupStyle = this.getRenderGroupStyle( groupKey );
                return this.featureFillColor.get( groupStyle );
            } );
        };
        const lineColorsByGroupKey = new Map<string,Color>( );
        const getLineColor = ( groupKey: string ) => {
            return mapSetIfAbsent( lineColorsByGroupKey, groupKey, ( ) => {
                const groupStyle = this.getRenderGroupStyle( groupKey );
                return this.featureLineColor.get( groupStyle );
            } );
        };
        const lineThicknessesByGroupKey_LPX = new Map<string,number>( );
        const getLineThickness_LPX = ( groupKey: string ) => {
            return mapSetIfAbsent( lineThicknessesByGroupKey_LPX, groupKey, ( ) => {
                const groupStyle = this.getRenderGroupStyle( groupKey );
                return this.featureLineThickness_LPX.get( groupStyle );
            } );
        };

        // Conversion between logical pixels and device pixels
        const lpxToPx = currentDpr( this );
        const pxToLpx = 1.0 / lpxToPx;

        // Select visible zoom level
        const viewBounds = this.viewBoundsFn( );
        const yPerLpx = viewBounds.h / ( viewport_PX.h * pxToLpx );
        const radPerY = this.viewProj.maxDLatDY_RAD( );
        const rootTileNominalGrainsPerRad = 360 / PI;
        const rootTileNominalGrainsPerLpx = rootTileNominalGrainsPerRad * radPerY * yPerLpx;
        const zoomLevel = clamp(
            this.toc.minzoom ?? TOC_DEFAULT_MINZOOM,
            this.toc.maxzoom ?? TOC_DEFAULT_MAXZOOM,
            round( -log2( rootTileNominalGrainsPerLpx ) ),
        );

        // Identify tiles to render
        const tilesInView = getTilesInView( this.tocBounds, viewBounds, zoomLevel );
        const tileEntriesToRender = this.cache.getTilesToRender( context.frameNum, tilesInView );

        // Define fn for updating origin-and-step device buffer
        const getXyOriginAndSteps = ( tileUrl: string, extent: number, perInstanceTileBounds_PX: ReadonlyArray<Interval2D> ) => {
            const dXyOriginAndStepKey = `${tileUrl}::${extent}::xyOriginAndStep4`;
            return context.getBuffer( dXyOriginAndStepKey, context.frameNum, ( gl, target ) => {
                const xyOriginAndStep4 = new Float32Array( 4*perInstanceTileBounds_PX.length );
                let i = 0;
                for ( const tileBounds_PX of perInstanceTileBounds_PX ) {
                    const xOrigin_PX = tileBounds_PX.xMin;
                    const yOrigin_PX = tileBounds_PX.yMin;
                    const xStep_PX = tileBounds_PX.w / extent;
                    const yStep_PX = tileBounds_PX.h / extent;
                    i = put4f( xyOriginAndStep4, i, xOrigin_PX, yOrigin_PX, xStep_PX, yStep_PX );
                }
                return bufferDataF32( gl, target, xyOriginAndStep4, 4 );
            } );
        };

        // Define fn for painting line segments
        const paintLineSegments = ( tileUrl: string, perInstanceTileBounds_PX: ReadonlyArray<Interval2D>, stem: string, groups: Array<RenderGroupLines> | undefined ) => {
            if ( groups && groups.some( g => ( g.coords.triangleVertexCount >= 3 ) ) ) {
                const groupKey = `${stem}_line`;
                const thickness_PX = getLineThickness_LPX( groupKey ) * lpxToPx;
                const color = getLineColor( groupKey );
                if ( thickness_PX > 0 && color.a > 0 ) {
                    const { program, attribs, uniforms } = context.getProgram( LINE_PROG_SOURCE );
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    gl.enableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                    glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 1 );
                    try {
                        gl.uniform2f( uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h );
                        gl.uniform1f( uniforms.THICKNESS_PX, thickness_PX );
                        gl.uniform1f( uniforms.FEATHER_PX, 1.5 );
                        glUniformRgba( gl, uniforms.COLOR, color );
                        for ( const { extent, coords: { triangleCoords4, triangleVertexCount } } of groups ) {
                            if ( triangleVertexCount >= 3 ) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::lineVertices`;
                                const dVertices = context.getBuffer( dVerticesKey, null, ( gl, target ) => {
                                    return bufferDataI16( gl, target, triangleCoords4.subarray( 0, 4*triangleVertexCount ), 4 );
                                } );
                                vertexAttribPointer( gl, attribs.inCoords, dVertices );

                                const dXyOriginAndSteps = getXyOriginAndSteps( tileUrl, extent, perInstanceTileBounds_PX );
                                vertexAttribPointer( gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps );

                                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount );
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 0 );
                        gl.disableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }
            }
        };

        // Define fn for painting line joins
        const paintLineJoins = ( tileUrl: string, perInstanceTileBounds_PX: ReadonlyArray<Interval2D>, stem: string, groups: Array<RenderGroupLines> | undefined ) => {
            if ( groups && groups.some( g => ( g.coords.pointVertexCount >= 1 ) ) ) {
                const groupKey = `${stem}_line`;
                const thickness_PX = getLineThickness_LPX( groupKey ) * lpxToPx;
                const color = getLineColor( groupKey );
                if ( thickness_PX > 1 && color.a > 0 ) {
                    const { program, attribs, uniforms } = context.getProgram( POINT_PROG_SOURCE );
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    gl.enableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                    glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 1 );
                    try {
                        gl.uniform2f( uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h );
                        gl.uniform1f( uniforms.DIAMETER_PX, thickness_PX );
                        gl.uniform1f( uniforms.FEATHER_PX, 1.5 );
                        glUniformRgba( gl, uniforms.COLOR, color );
                        for ( const { extent, coords: { pointCoords2, pointVertexCount } } of groups ) {
                            if ( pointVertexCount >= 1 ) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::pointVertices`;
                                const dVertices = context.getBuffer( dVerticesKey, null, ( gl, target ) => {
                                    return bufferDataI16( gl, target, pointCoords2.subarray( 0, 2*pointVertexCount ), 2 );
                                } );
                                vertexAttribPointer( gl, attribs.inCoords, dVertices );

                                const dXyOriginAndSteps = getXyOriginAndSteps( tileUrl, extent, perInstanceTileBounds_PX );
                                vertexAttribPointer( gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps );

                                glExt.drawArraysInstancedANGLE( GL.POINTS, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount );
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 0 );
                        gl.disableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }
            }
        };

        // Define fn for painting polygon fills
        const paintPolygonFills = ( tileUrl: string, perInstanceTileBounds_PX: ReadonlyArray<Interval2D>, stem: string, groups: Array<RenderGroupPolygons> | undefined ) => {
            if ( groups && groups.some( g => ( g.coords.triangleVertexCount >= 3 ) ) ) {
                const groupKey = `${stem}_area`;
                const color = getFillColor( groupKey );
                if ( color.a > 0 ) {
                    const { program, attribs, uniforms } = context.getProgram( FILL_PROG_SOURCE );
                    gl.useProgram( program );
                    gl.enableVertexAttribArray( attribs.inCoords );
                    gl.enableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                    glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 1 );
                    try {
                        gl.uniform2f( uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h );
                        glUniformRgba( gl, uniforms.COLOR, color );
                        for ( const { extent, coords: { triangleCoords2, triangleVertexCount } } of groups ) {
                            if ( triangleVertexCount >= 3 ) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::fillVertices`;
                                const dVertices = context.getBuffer( dVerticesKey, null, ( gl, target ) => {
                                    return bufferDataI16( gl, target, triangleCoords2.subarray( 0, 2*triangleVertexCount ), 2 );
                                } );
                                vertexAttribPointer( gl, attribs.inCoords, dVertices );

                                const dXyOriginAndSteps = getXyOriginAndSteps( tileUrl, extent, perInstanceTileBounds_PX );
                                vertexAttribPointer( gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps );

                                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount );
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE( attribs.inXyOriginAndStep_PX, 0 );
                        gl.disableVertexAttribArray( attribs.inXyOriginAndStep_PX );
                        gl.disableVertexAttribArray( attribs.inCoords );
                        gl.useProgram( null );
                    }
                }
            }
        };

        // Prep for rendering
        enablePremultipliedAlphaBlending( gl );

        // Render tiles
        const csByCWrappedByZ = getViewColumnIndicesByWrappedColumnIndexByZoomLevel( tilesInView );
        for ( const { tileUrl, tileIndex, renderGroups } of tileEntriesToRender ) {
            const tileBounds_PX = new Array<Interval2D>( );
            const { zoomLevel, rowIndex } = tileIndex;
            const columnIndices = mapRequire( csByCWrappedByZ[ zoomLevel ], tileIndex.columnIndex );
            const viewportWidth_PX = viewport_PX.w;
            const viewportHeight_PX = viewport_PX.h;
            for ( const columnIndex of columnIndices ) {
                const tileInstanceBounds_PROJ = getProjectedTileBounds( this.tocBounds, { zoomLevel, columnIndex, rowIndex } );
                const tileInstanceBounds_FRAC = boxToFracOfOtherBox( tileInstanceBounds_PROJ, viewBounds );
                const tileInstanceBounds_PX = Interval2D.fromXy(
                    tileInstanceBounds_FRAC.x.scale( viewportWidth_PX ),
                    tileInstanceBounds_FRAC.y.scale( viewportHeight_PX ),
                );
                tileBounds_PX.push( tileInstanceBounds_PX );
            }
            for ( const { stem, type } of renderGroupKeys ) {
                switch ( type ) {
                    case FEATURE_TYPE_POINT: {
                        // TODO: Support point features
                    }
                    break;

                    case FEATURE_TYPE_LINE: {
                        const groups = renderGroups.lineGroupsByStem.get( stem );
                        paintLineSegments( tileUrl, tileBounds_PX, stem, groups );
                        paintLineJoins( tileUrl, tileBounds_PX, stem, groups );
                    }
                    break;

                    case FEATURE_TYPE_POLYGON: {
                        const groups = renderGroups.polygonGroupsByStem.get( stem );
                        paintPolygonFills( tileUrl, tileBounds_PX, stem, groups );
                    }
                    break;
                }
            }
        }
    }

    protected getRenderGroupStyle( groupKey: string ): CSSStyleDeclaration {
        // TODO: Can we get away with not pruning the styles map?
        const styleEntry = mapSetIfAbsent( this.stylesByGroupKey, groupKey, ( ) => {
            const peer = createDomPeer( 'feature-style', this, PeerType.OTHER );
            if ( groupKey ) {
                peer.classList.add( groupKey );
            }
            this.peer.appendChild( peer );
            const style = window.getComputedStyle( peer );
            return { peer, style };
        } );
        return styleEntry.style;
    }

    dispose( context: Context ): void {
        this.cache.dispose( );
    }
}

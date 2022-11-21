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
import { AnchoredImage, BLACK, bufferDataF32, BufferInfo, Color, Context, createDomPeer, cssBoolean, cssColor, cssFloat, cssString, currentDpr, DomPeer, enablePremultipliedAlphaBlending, Float32Scratch, frozenSupplier, GL, glUniformInterval2D, glUniformRgba, glUniformSize2D, Interval1D, Interval2D, isfn, isstr, Painter, PeerType, RED, rgb, rgba, StyleProp, texImage2D, ValueBase, vertexAttribPointer } from '@metsci/gleam-core';
import { appendChild, arraySortStable, Comparator, createWorkerPool, Disposer, DisposerGroup, DisposerGroupMap, FireableListenable, LatLonInterpolator, LatLonInterpolatorDescriptor, LinkedMap, ListenableBasic, mapAdd, NormalCylindricalProjection, NormalCylindricalProjectionDescriptor, Nullable, RefBasic, requireNonNull, requireNonNullish, SPHERICAL_GREAT_CIRCLE_INTERPOLATOR, submitToWorkerPool, Supplier, tripleEquals, WGS84_EQUATORIAL_CIRCUMFERENCE_METERS, WorkerPool, WorkerPoolWorker } from '@metsci/gleam-util';
import { Feature, GeoJSON, Geometry } from 'geojson';
import { createXSplitter, PreRenderable, RenderableScores, WorkerResult } from './support';

const { acos, ceil, floor, min, PI, sin } = Math;

import markerFragShader_GLSL from './markerShader.frag';
import markerVertShader_GLSL from './markerShader.vert';
const MARKER_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: markerVertShader_GLSL,
    fragShader_GLSL: markerFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'VIEWPORT_BOUNDS_AXIS',
        'IMAGE_TEXTURE',
        'IMAGE_SPRAWL_PX',
    ] as const,
    attribNames: [
        'inVerticesA',
        'inVerticesB',
        'inViewportXMins',
    ] as const,
} );

import lineFragShader_GLSL from './lineShader.frag';
import lineVertShader_GLSL from './lineShader.vert';
const LINE_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: lineVertShader_GLSL,
    fragShader_GLSL: lineFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
        'THICKNESS_PX',
        'FEATHER_PX',
    ] as const,
    attribNames: [
        'inVerticesA',
        'inVerticesB',
        'inViewportXMins',
    ] as const,
} );

import joinFragShader_GLSL from './joinShader.frag';
import joinVertShader_GLSL from './joinShader.vert';
const JOIN_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: joinVertShader_GLSL,
    fragShader_GLSL: joinFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
        'DIAMETER_PX',
        'FEATHER_PX',
    ] as const,
    attribNames: [
        'inVertices',
        'inViewportXMins',
    ] as const,
} );

import fillFragShader_GLSL from './fillShader.frag';
import fillVertShader_GLSL from './fillShader.vert';
const FILL_PROG_SOURCE = Object.freeze( {
    vertShader_GLSL: fillVertShader_GLSL,
    fragShader_GLSL: fillFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
    ] as const,
    attribNames: [
        'inVertices',
        'inViewportXMins',
    ] as const,
} );

export type GeoJsonRenderableType = Renderable[ 'type' ];

export interface GeoJsonMarker {
    readonly peer?: DomPeer;
    getTexture( context: Context ): { texture: Nullable<WebGLTexture>, sprawl: ImageSprawl };
}

export interface ImageSprawl {
    dxLeft_PX: number;
    dxRight_PX: number;
    dyBottom_PX: number;
    dyTop_PX: number;
}

export function getImageSprawl( image: AnchoredImage ): ImageSprawl {
    return {
        dxLeft_PX: 0 - image.xAnchor,
        dxRight_PX: image.imageData.width - image.xAnchor,
        dyBottom_PX: image.yAnchor - image.imageData.height,
        dyTop_PX: image.yAnchor - 0,
    };
}

export class GeoJsonMarkerPin implements GeoJsonMarker {
    readonly peer = createDomPeer( 'geojson-marker-pin', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly fillColor = StyleProp.create( this.style, '--fill-color', cssColor, RED );
    readonly strokeColor = StyleProp.create( this.style, '--stroke-color', cssColor, BLACK );

    constructor( ...cssClasses: Array<string> ) {
        cssClasses.forEach( s => this.peer.classList.add( s ) );
    }

    getTexture( context: Context ): { texture: Nullable<WebGLTexture>, sprawl: ImageSprawl } {
        const instanceKey = context.getObjectKey( this );

        const fillColor = this.fillColor.get( );
        const strokeColor = this.strokeColor.get( );
        const dpr = currentDpr( this );

        const dMarker = context.getTexture( `geojson-marker-pin.${instanceKey}`, new ValueBase( [ dpr, fillColor, strokeColor ] ), ( gl, target ) => {
            const hMarker = GeoJsonMarkerPin.drawImage( dpr, fillColor, strokeColor );
            gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
            gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
            gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
            gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
            return texImage2D( gl, target, GL.RGBA, GL.UNSIGNED_BYTE, hMarker.imageData, {
                sprawl: getImageSprawl( hMarker ),
            } );
        } );
        return {
            texture: dMarker.texture,
            sprawl: dMarker.meta.sprawl,
        };
    }

    static drawImage( dpr: number, fillColor: Color, strokeColor: Color ): AnchoredImage {
        // Border avoids interpolation problems at image edges
        const border = 1;

        const r = ceil( 6*dpr );
        const tipToCenter = 1.667*r;
        const lineWidth = 2.5*dpr;

        const phi = acos( r / tipToCenter );
        const thetaA = 0.5*PI + phi;
        const thetaB = 0.5*PI - phi;
        const leftRightPad = ceil( 0.5*lineWidth );
        const topPad = ceil( 0.5*lineWidth );
        const bottomPad = ceil( ceil( 0.5*lineWidth ) / sin( 0.5*PI - phi ) );
        const wTotal = 1 + 2*r + 2*leftRightPad + 2*border;
        const hTotal = 1 + r + tipToCenter + topPad + bottomPad + 2*border;
        const xCenter = 0.5*wTotal;
        const yCenter = border + topPad + r;
        const yTip = yCenter + tipToCenter;

        const canvas = document.createElement( 'canvas' );
        canvas.width = wTotal;
        canvas.height = hTotal;
        const g = requireNonNull( canvas.getContext( '2d', { willReadFrequently: true } ) );
        g.clearRect( 0, 0, wTotal, hTotal );

        g.moveTo( xCenter, yTip );
        g.arc( xCenter, yCenter, r, thetaA, thetaB );
        g.closePath( );

        g.strokeStyle = strokeColor.cssString;
        g.lineWidth = lineWidth;
        g.stroke( );

        g.fillStyle = fillColor.cssString;
        g.fill( );

        const transitionColor = rgb(
            0.5*fillColor.r + 0.5*strokeColor.r,
            0.5*fillColor.g + 0.5*strokeColor.g,
            0.5*fillColor.b + 0.5*strokeColor.b,
        );
        g.strokeStyle = transitionColor.cssString;
        g.lineWidth = min( 1, 0.5*lineWidth );
        g.stroke( );

        return {
            xAnchor: xCenter,
            yAnchor: yTip,
            border,
            imageData: g.getImageData( 0, 0, wTotal, hTotal ),
        };
    }
}

interface ContextPlus {
    readonly context: Context;
    readonly painterKey: string;
    readonly dpr: number;
    readonly viewport_PX: Interval2D;
    readonly viewBounds: Interval2D;
    readonly viewProj: NormalCylindricalProjection;
    readonly markers: Map<string,GeoJsonMarker>;
    readonly gl: WebGLRenderingContext;
    readonly glExt: ANGLE_instanced_arrays;
    readonly dViewportXMins: BufferInfo;
}

type Renderable = MarkersRenderable | LinesRenderable | PolygonsRenderable;

class MarkersRenderable {
    readonly type = 'MARKERS';
    readonly peer = createDomPeer( 'geojson-markers-renderable', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly marker = StyleProp.create( this.style, '--marker', cssString, 'default' );
    readonly zIndex = StyleProp.create( this.style, '--z-index', cssFloat, 0 );
    readonly visible = StyleProp.create( this.style, '--visible', cssBoolean, true );

    constructor(
        readonly renderableKey: string,
        readonly props: { [ name: string ]: unknown },
        readonly scores: RenderableScores,
        readonly pointsA3: Float32Array,
        readonly pointsB2: Float32Array,
    ) {
    }
}

class LinesRenderable {
    readonly type = 'LINES';
    readonly peer = createDomPeer( 'geojson-lines-renderable', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly color = StyleProp.create( this.style, '--color', cssColor, BLACK );
    readonly width_LPX = StyleProp.create( this.style, '--width-px', cssFloat, 1 );
    readonly zIndex = StyleProp.create( this.style, '--z-index', cssFloat, 0 );
    readonly visible = StyleProp.create( this.style, '--visible', cssBoolean, true );

    constructor(
        readonly renderableKey: string,
        readonly props: { [ name: string ]: unknown },
        readonly scores: RenderableScores,
        readonly trianglesA3: Float32Array,
        readonly trianglesB2: Float32Array,
        readonly points3: Float32Array,
    ) {
    }
}

class PolygonsRenderable {
    readonly type = 'POLYGONS';
    readonly peer = createDomPeer( 'geojson-polygons-renderable', this, PeerType.OTHER );
    readonly style = window.getComputedStyle( this.peer );

    readonly fillColor = StyleProp.create( this.style, '--fill-color', cssColor, rgba( 0,0,0, 0.25 ) );
    readonly strokeColor = StyleProp.create( this.style, '--stroke-color', cssColor, BLACK );
    readonly strokeWidth_LPX = StyleProp.create( this.style, '--stroke-width-px', cssFloat, 1 );
    readonly zIndex = StyleProp.create( this.style, '--z-index', cssFloat, 0 );
    readonly visible = StyleProp.create( this.style, '--visible', cssBoolean, true );

    constructor(
        readonly renderableKey: string,
        readonly props: { [ name: string ]: unknown },
        readonly scores: RenderableScores,
        readonly fillTriangles3: Float32Array,
        readonly strokeTrianglesA3: Float32Array,
        readonly strokeTrianglesB2: Float32Array,
        readonly strokePoints3: Float32Array,
    ) {
    }
}

export function createRenderable( renderableKey: string, props: { [ name: string ]: unknown }, preRenderable: PreRenderable ): Renderable {
    switch ( preRenderable.type ) {
        case 'MARKERS': return new MarkersRenderable(
            renderableKey,
            props,
            preRenderable.scores,
            preRenderable.pointsA3,
            preRenderable.pointsB2,
        );

        case 'LINES': return new LinesRenderable(
            renderableKey,
            props,
            preRenderable.scores,
            preRenderable.trianglesA3,
            preRenderable.trianglesB2,
            preRenderable.points3,
        );

        case 'POLYGONS': return new PolygonsRenderable(
            renderableKey,
            props,
            preRenderable.scores,
            preRenderable.fillTriangles3,
            preRenderable.strokeTrianglesA3,
            preRenderable.strokeTrianglesB2,
            preRenderable.strokePoints3,
        );
    }
}

export interface GeoJsonRenderableTweak {
    ( renderable: Renderable, disposers: DisposerGroup ): void;
}

export function addCssClass( cssClass: string ): GeoJsonRenderableTweak {
    return ( renderable, disposers ) => {
        if ( !renderable.peer.classList.contains( cssClass ) ) {
            renderable.peer.classList.add( cssClass );
            disposers.add( ( ) => {
                renderable.peer.classList.remove( cssClass );
            } );
        }
    };
}

export function addCssClassFromProperty( cssClassPropertyName: string ): GeoJsonRenderableTweak {
    return ( renderable, disposers ) => {
        const cssClass = renderable.props[ cssClassPropertyName ];
        if ( isstr( cssClass ) && !renderable.peer.classList.contains( cssClass ) ) {
            renderable.peer.classList.add( cssClass );
            disposers.add( ( ) => {
                renderable.peer.classList.remove( cssClass );
            } );
        }
    };
}

const renderableRanksByType = {
    POLYGONS: 1,
    LINES: 2,
    MARKERS: 3,
};
const RENDERING_ORDER: Comparator<[ renderable: Renderable, zIndex: number ]> = ( a, b ) => {
    const [ aRenderable, aZIndex ] = a;
    const [ bRenderable, bZIndex ] = b;

    const typeComparison = renderableRanksByType[ aRenderable.type ] - renderableRanksByType[ bRenderable.type ];
    if ( typeComparison !== 0 ) {
        return typeComparison;
    }

    const zIndexComparison = aZIndex - bZIndex;
    if ( zIndexComparison !== 0 ) {
        return zIndexComparison;
    }

    const altitudeComparison = aRenderable.scores.altitudeScore - bRenderable.scores.altitudeScore;
    if ( altitudeComparison !== 0 ) {
        return altitudeComparison;
    }

    if ( aRenderable.type === 'MARKERS' && bRenderable.type === 'MARKERS' ) {
        const latComparison = aRenderable.scores.latScore - bRenderable.scores.latScore;
        if ( latComparison !== 0 ) {
            return latComparison;
        }
    }

    const areaComparison = aRenderable.scores.areaScore - bRenderable.scores.areaScore;
    if ( areaComparison !== 0 ) {
        return areaComparison;
    }

    return 0;
};

export interface PreRenderablesFactoryFn {
    ( geometry: Geometry, interp: LatLonInterpolator, proj: NormalCylindricalProjection, perceptibleProjDist: number ): Promise<ReadonlyArray<PreRenderable>>;
}

// Bundler is configured to output a bundle at this location
// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const preRenderablesWorkerUrl = new URL( './worker.worker.js', import.meta.url );

export function createPreRenderablesWorkerPool( options?: {
    workerCount?: number,
    workerCredentials?: RequestCredentials,
} ): WorkerPool {
    const workerCount = options?.workerCount ?? min( 2, navigator.hardwareConcurrency );
    return createWorkerPool( workerCount, i => new Worker( preRenderablesWorkerUrl, {
        name: `GeoJsonPreRenderables-${ i.toFixed( 0 ).padStart( 2, '0' ) }`,
        credentials: options?.workerCredentials,
    } ) );
}

export function createPreRenderableFactory( workerPool: WorkerPool ): PreRenderablesFactoryFn {
    return ( geometry, interp, proj, perceptibleProjDist ) => {
        return submitToWorkerPool( workerPool, ( worker, callKey ) => {
            return createPreRenderablesAsync( worker, callKey, geometry, interp.desc, proj.desc, perceptibleProjDist );
        } );
    };
}

export function createPreRenderablesAsync(
    worker: WorkerPoolWorker,
    callKey: unknown,
    geometry: Geometry,
    interpDesc: LatLonInterpolatorDescriptor,
    projDesc: NormalCylindricalProjectionDescriptor,
    perceptibleProjDist: number,
): Promise<ReadonlyArray<PreRenderable>> {
    // Send a request to the worker
    worker.postMessage( { callKey, geometry, interpDesc, projDesc, perceptibleProjDist } );

    // Wait for a response, or worker termination
    return new Promise( ( resolve, reject ) => {
        worker.termination.addListener( { once: true }, ( ) => {
            reject( 'Worker was terminated' );
        } );
        const messageListener = ( ev: MessageEvent<WorkerResult> ) => {
            const result = ev.data;
            if ( result.callKey === callKey ) {
                worker.removeEventListener( 'message', messageListener );
                resolve( result.preRenderables );
            }
        };
        worker.addEventListener( 'message', messageListener );
    } );
}

export interface GeoJsonPreRenderOptionsFn {
    ( geometry: Geometry, props: { [ name: string ]: unknown } ): GeoJsonPreRenderOptions;
}

export interface GeoJsonPreRenderOptions {
    interp?: LatLonInterpolator;
    perceptibleDistance_M?: number;
}

export class GeoJsonPainter implements Painter {
    readonly peer = createDomPeer( 'geojson-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    readonly visible = new RefBasic( true, tripleEquals );

    readonly viewProj: NormalCylindricalProjection;
    protected readonly splitX: ( x: number ) => [ a: number, b: number ];
    viewBoundsFn: Supplier<Interval2D>;
    protected readonly preRenderDefaults: Required<GeoJsonPreRenderOptions>;
    protected readonly createPreRenderables: PreRenderablesFactoryFn;
    protected readonly repaint: FireableListenable;

    protected readonly markers: Map<string,GeoJsonMarker>;
    protected readonly disposersByMarkerKey: DisposerGroupMap<string>;
    protected readonly renderablesByDataKey: LinkedMap< string, { visible: boolean, renderables: Array<Renderable> } >;
    protected readonly disposersByDataKey: DisposerGroupMap<string>;
    protected readonly scratch: Float32Scratch;

    constructor(
        viewProj: NormalCylindricalProjection,
        createPreRenderables: PreRenderablesFactoryFn,
        viewBoundsFn?: Supplier<Interval2D>,
        preRenderDefaults?: GeoJsonPreRenderOptions,
    ) {
        this.viewProj = viewProj;
        this.splitX = createXSplitter( this.viewProj.xSpan( ) );
        this.viewBoundsFn = viewBoundsFn ?? frozenSupplier( Interval2D.fromEdges( 0, 1, 0, 1 ) );
        this.preRenderDefaults = {
            interp: preRenderDefaults?.interp ?? SPHERICAL_GREAT_CIRCLE_INTERPOLATOR,
            perceptibleDistance_M: preRenderDefaults?.perceptibleDistance_M ?? 100,
        };
        this.createPreRenderables = createPreRenderables;
        this.repaint = new ListenableBasic( );

        this.markers = new Map( );
        this.disposersByMarkerKey = new DisposerGroupMap( );
        this.renderablesByDataKey = new LinkedMap( );
        this.disposersByDataKey = new DisposerGroupMap( );
        this.scratch = new Float32Scratch( );

        this.registerMarker( 'default', new GeoJsonMarkerPin( 'default' ) );
    }

    attachToRepaint( repaint: FireableListenable ): Disposer {
        return this.repaint.addListener( ( ) => {
            repaint.fire( );
        } );
    }

    /**
     * The recommended convention is to add a CSS class matching `markerKey` to `marker.peer`.
     * For example: `marker.peer.classList.add( markerKey )`. This isn't required, but in most
     * cases it makes it easier to keep track of which marker styles are used by which renderable
     * styles.
     */
    registerMarker( markerKey: string, marker: GeoJsonMarker ): Disposer {
        this.disposersByMarkerKey.disposeFor( markerKey );

        const disposers = this.disposersByMarkerKey.get( markerKey );
        if ( marker.peer ) {
            disposers.add( appendChild( this.peer, marker.peer ) );
        }
        disposers.add( mapAdd( this.markers, markerKey, marker ) );
        return disposers;
    }

    putData(
        dataKey: string,
        geojson: GeoJSON,
        tweaks?: ReadonlyArray<GeoJsonRenderableTweak>,
        preRenderOptions?: GeoJsonPreRenderOptions | GeoJsonPreRenderOptionsFn,
    ): Disposer {
        this.disposersByDataKey.disposeFor( dataKey );

        const disposers = this.disposersByDataKey.get( dataKey );
        disposers.add( ( ) => this.repaint.fire( ) );

        const renderables = new Array<Renderable>( );
        disposers.add( mapAdd( this.renderablesByDataKey, dataKey, { visible: true, renderables } ) );

        let canceled = false;
        disposers.add( ( ) => ( canceled = true ) );

        const renderablesByGeometry = new Array<Array<Renderable>>( );
        const addGeometry = async ( geometry: Geometry, props: { [ name: string ]: unknown } ) => {
            const geometryNum = renderablesByGeometry.length;
            const renderablesForGeometry = new Array<Renderable>( );
            renderablesByGeometry.push( renderablesForGeometry );

            const preRenderOptions2 = isfn( preRenderOptions ) ? preRenderOptions( geometry, props ) : preRenderOptions;
            const interp = preRenderOptions2?.interp ?? this.preRenderDefaults.interp;
            const perceptibleDistance_M = preRenderOptions2?.perceptibleDistance_M ?? this.preRenderDefaults.perceptibleDistance_M;
            const perceptibleProjDist = perceptibleDistance_M * this.viewProj.xSpan( ) / WGS84_EQUATORIAL_CIRCUMFERENCE_METERS;

            const preRenderables = await this.createPreRenderables( geometry, interp, this.viewProj, perceptibleProjDist );
            if ( canceled ) {
                return;
            }

            for ( const preRenderable of preRenderables ) {
                const renderableKey = `${dataKey}[${geometryNum}][${renderablesForGeometry.length}]`;
                renderablesForGeometry.push( createRenderable( renderableKey, props, preRenderable ) );
            }
            if ( tweaks ) {
                for ( const renderable of renderablesForGeometry ) {
                    for ( const tweak of tweaks ) {
                        try {
                            tweak( renderable, disposers );
                        }
                        catch ( e ) {
                            console.warn( 'Failed to apply GeoJSON renderable tweak', e );
                        }
                    }
                }
            }
            for ( const renderable of renderablesForGeometry ) {
                disposers.add( appendChild( this.peer, renderable.peer ) );
            }

            renderables.length = 0;
            renderables.push( ...renderablesByGeometry.flat( ) );
            this.repaint.fire( );
        }

        const addFeature = ( feature: Feature ) => {
            addGeometry( feature.geometry, feature.properties ?? {} );
        };

        switch ( geojson.type ) {
            case 'FeatureCollection': geojson.features.forEach( f => addFeature( f ) ); break;
            case 'Feature': addFeature( geojson ); break;
            default: addGeometry( geojson, {} ); break;
        }

        return disposers;
    }

    hasData( dataKey: string ): boolean {
        return this.renderablesByDataKey.has( dataKey );
    }

    setDataVisible( dataKey: string, visible: boolean ): void {
        const en = this.renderablesByDataKey.get( dataKey );
        if ( en && en.visible !== visible ) {
            en.visible = visible;
            this.repaint.fire( );
        }
    }

    removeData( dataKey: string ): void {
        this.disposersByDataKey.disposeFor( dataKey );
    }

    clearData( ): void {
        this.disposersByDataKey.dispose( );
    }

    paint( context: Context, viewport_PX: Interval2D ): void {
        if ( this.renderablesByDataKey.size > 0 ) {
            const painterKey = context.getObjectKey( this );
            const viewBounds = this.viewBoundsFn( );
            const mapXBounds = Interval1D.fromEdges(
                this.viewProj.lonToX( -PI ),
                this.viewProj.lonToX( +PI ),
            );
            // TODO: Support lines/polygons that wrap around more than once
            const xViewMin = viewBounds.xMin;
            const xWrapSpan = this.viewProj.xSpan( );
            const xWrapNumMin = floor( mapXBounds.valueToFrac( viewBounds.xMin ) - 1.0 );
            const xWrapNumMax = floor( mapXBounds.valueToFrac( viewBounds.xMax ) + 1.0 );
            const xWrapCount = xWrapNumMax - xWrapNumMin + 1;
            const dViewportXMins = context.getBuffer( `geojson.${painterKey}.viewportXMins`, new ValueBase( xViewMin, xWrapSpan, xWrapNumMin, xWrapCount ), ( gl, target ) => {
                const xs2 = this.scratch.getTempSpace( 2*xWrapCount );
                for ( let i = 0; i < xWrapCount; i++ ) {
                    const x = viewBounds.xMin - ( xWrapNumMin + i )*xWrapSpan;
                    const [ xa, xb ] = this.splitX( x );
                    xs2[ 2*i + 0 ] = xa;
                    xs2[ 2*i + 1 ] = xb;
                }
                return bufferDataF32( gl, target, xs2, 2 );
            } );
            const contextPlus: ContextPlus = {
                context,
                painterKey,
                dpr: currentDpr( this ),
                viewport_PX,
                viewBounds,
                viewProj: this.viewProj,
                markers: this.markers,
                gl: context.gl,
                glExt: requireNonNullish( context.gl.getExtension( 'ANGLE_instanced_arrays' ) ),
                dViewportXMins,
            };
            const renderablePairs = new Array<[ renderable: Renderable, zIndex: number ]>( );
            for ( const [ _, { visible, renderables } ] of this.renderablesByDataKey ) {
                if ( visible ) {
                    for ( const renderable of renderables ) {
                        if ( renderable.visible.get( ) ) {
                            renderablePairs.push( [ renderable, renderable.zIndex.get( ) ] );
                        }
                    }
                }
            }
            arraySortStable( renderablePairs, RENDERING_ORDER );
            enablePremultipliedAlphaBlending( context.gl );
            for ( const [ renderable ] of renderablePairs ) {
                switch ( renderable.type ) {
                    case 'MARKERS': this.drawMarkers( contextPlus, renderable ); break;
                    case 'LINES': this.drawLines( contextPlus, renderable ); break;
                    case 'POLYGONS': this.drawPolygons( contextPlus, renderable ); break;
                }
            }
        }
    }

    protected drawMarkers( contextPlus: ContextPlus, renderable: MarkersRenderable ): void {
        const { context, painterKey, viewport_PX, viewBounds, markers, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, pointsA3, pointsB2 } = renderable;
        const markerKey = renderable.marker.get( );
        const marker = markers.get( markerKey );

        // Marker
        if ( marker ) {
            const dMarker = marker.getTexture( context );
            const dVerticesA = context.getBuffer( `geojson.${painterKey}.marker.verticesA.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, pointsA3, 3 );
            } );
            const dVerticesB = context.getBuffer( `geojson.${painterKey}.marker.verticesB.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, pointsB2, 2 );
            } );
            const { program, attribs, uniforms } = context.getProgram( MARKER_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVerticesA );
            gl.enableVertexAttribArray( attribs.inVerticesB );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformSize2D( gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span );
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );

                gl.activeTexture( GL.TEXTURE0 );
                gl.bindTexture( GL.TEXTURE_2D, dMarker.texture );
                gl.uniform1i( uniforms.IMAGE_TEXTURE, 0 );

                const sprawl = dMarker.sprawl;
                gl.uniform4f( uniforms.IMAGE_SPRAWL_PX, sprawl.dxLeft_PX, sprawl.dxRight_PX, sprawl.dyTop_PX, sprawl.dyBottom_PX );

                vertexAttribPointer( gl, attribs.inVerticesA, dVerticesA );
                vertexAttribPointer( gl, attribs.inVerticesB, dVerticesB );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVerticesB );
                gl.disableVertexAttribArray( attribs.inVerticesA );
                gl.useProgram( null );
            }
        }
    }

    protected drawLines( contextPlus: ContextPlus, renderable: LinesRenderable ): void {
        const { context, painterKey, dpr, viewport_PX, viewBounds, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, trianglesA3, trianglesB2, points3 } = renderable;
        const color = renderable.color.get( );
        const width_LPX = renderable.width_LPX.get( );
        const width_PX = width_LPX * dpr;
        const feather_PX = 1.5;

        // Joins
        if ( color && color.a > 0 && width_PX > 1 ) {
            const dVertices = context.getBuffer( `geojson.${painterKey}.line.points.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, points3, 3 );
            } );
            const { program, attribs, uniforms } = context.getProgram( JOIN_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertices );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );
                glUniformRgba( gl, uniforms.COLOR, color );
                gl.uniform1f( uniforms.DIAMETER_PX, width_PX );
                gl.uniform1f( uniforms.FEATHER_PX, feather_PX );

                vertexAttribPointer( gl, attribs.inVertices, dVertices );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.POINTS, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVertices );
                gl.useProgram( null );
            }
        }

        // Segments
        if ( color && color.a > 0 && width_PX > 0 ) {
            const dVerticesA = context.getBuffer( `geojson.${painterKey}.line.trianglesA.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, trianglesA3, 3 );
            } );
            const dVerticesB = context.getBuffer( `geojson.${painterKey}.line.trianglesB.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, trianglesB2, 2 );
            } );
            const { program, attribs, uniforms } = context.getProgram( LINE_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVerticesA );
            gl.enableVertexAttribArray( attribs.inVerticesB );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformSize2D( gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span );
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );
                glUniformRgba( gl, uniforms.COLOR, color );
                gl.uniform1f( uniforms.THICKNESS_PX, width_PX );
                gl.uniform1f( uniforms.FEATHER_PX, feather_PX );

                vertexAttribPointer( gl, attribs.inVerticesA, dVerticesA );
                vertexAttribPointer( gl, attribs.inVerticesB, dVerticesB );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVerticesB );
                gl.disableVertexAttribArray( attribs.inVerticesA );
                gl.useProgram( null );
            }
        }
    }

    protected drawPolygons( contextPlus: ContextPlus, renderable: PolygonsRenderable ): void {
        const { context, painterKey, dpr, viewport_PX, viewBounds, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, fillTriangles3, strokeTrianglesA3, strokeTrianglesB2, strokePoints3 } = renderable;
        const fillColor = renderable.fillColor.get( );
        const strokeColor = renderable.strokeColor.get( );
        const strokeWidth_LPX = renderable.strokeWidth_LPX.get( );
        const strokeWidth_PX = strokeWidth_LPX * dpr;
        const strokeFeather_PX = 1.5;

        // TODO: Improve behavior when member polygons overlap -- currently draws all fills, then all strokes

        // Fill
        if ( fillColor && fillColor.a > 0 ) {
            const dVertices = context.getBuffer( `geojson.${painterKey}.polygon.fillTriangles.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, fillTriangles3, 3 );
            } );
            const { program, attribs, uniforms } = context.getProgram( FILL_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertices );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );
                glUniformRgba( gl, uniforms.COLOR, fillColor );

                vertexAttribPointer( gl, attribs.inVertices, dVertices );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVertices );
                gl.useProgram( null );
            }
        }

        // Stroke joins
        if ( strokeColor && strokeColor.a > 0 && strokeWidth_PX > 1 ) {
            const dVertices = context.getBuffer( `geojson.${painterKey}.polygon.strokePoints.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, strokePoints3, 3 );
            } );
            const { program, attribs, uniforms } = context.getProgram( JOIN_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVertices );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );
                glUniformRgba( gl, uniforms.COLOR, strokeColor );
                gl.uniform1f( uniforms.DIAMETER_PX, strokeWidth_PX );
                gl.uniform1f( uniforms.FEATHER_PX, strokeFeather_PX );

                vertexAttribPointer( gl, attribs.inVertices, dVertices );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.POINTS, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVertices );
                gl.useProgram( null );
            }
        }

        // Stroke segments
        if ( strokeColor && strokeColor.a > 0 && strokeWidth_PX > 0 ) {
            const dVerticesA = context.getBuffer( `geojson.${painterKey}.polygon.strokeTrianglesA.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, strokeTrianglesA3, 3 );
            } );
            const dVerticesB = context.getBuffer( `geojson.${painterKey}.polygon.strokeTrianglesB.${renderableKey}`, renderable, ( gl, target ) => {
                return bufferDataF32( gl, target, strokeTrianglesB2, 2 );
            } );
            const { program, attribs, uniforms } = context.getProgram( LINE_PROG_SOURCE );
            gl.useProgram( program );
            gl.enableVertexAttribArray( attribs.inVerticesA );
            gl.enableVertexAttribArray( attribs.inVerticesB );
            gl.enableVertexAttribArray( attribs.inViewportXMins );
            glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 1 );
            try {
                glUniformSize2D( gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span );
                glUniformInterval2D( gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds );
                glUniformRgba( gl, uniforms.COLOR, strokeColor );
                gl.uniform1f( uniforms.THICKNESS_PX, strokeWidth_PX );
                gl.uniform1f( uniforms.FEATHER_PX, strokeFeather_PX );

                vertexAttribPointer( gl, attribs.inVerticesA, dVerticesA );
                vertexAttribPointer( gl, attribs.inVerticesB, dVerticesB );
                vertexAttribPointer( gl, attribs.inViewportXMins, dViewportXMins );

                glExt.drawArraysInstancedANGLE( GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount );
            }
            finally {
                glExt.vertexAttribDivisorANGLE( attribs.inViewportXMins, 0 );
                gl.disableVertexAttribArray( attribs.inViewportXMins );
                gl.disableVertexAttribArray( attribs.inVerticesB );
                gl.disableVertexAttribArray( attribs.inVerticesA );
                gl.useProgram( null );
            }
        }
    }

    dispose( context: Context ): void {
        // Device resources are all context-owned, and will get pruned automatically
        this.disposersByDataKey.dispose( );
    }
}

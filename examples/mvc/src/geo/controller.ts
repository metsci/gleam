import { Interval1D, PaneMouseEvent, put3f } from '@metsci/gleam-core';
import { activityListenable, Disposer, DisposerGroup, FireableListenable, IMMEDIATE, isDefined } from '@metsci/gleam-util';
import { Dot } from '../misc';
import { Model } from '../model';
import { GeoView } from './view';

const { ceil } = Math;

export function attachGeoController( model: Model, view: GeoView, repaint: FireableListenable ): Disposer {
    const disposers = new DisposerGroup( );

    // Link view axes with the model
    disposers.add( view.xyAxis.x.link( model.xAxisGroup ) );
    disposers.add( view.xyAxis.y.link( model.yAxisGroup ) );

    // Set color bounds so dot opacity is 1.0 at cursor time, and decreases as 𝚫t increases
    view.dotsPainter.cBoundsFn = ( ) => {
        const tCursor = model.tCursor.v;
        return Interval1D.fromEdges( tCursor - 3600, tCursor + 3600 );
    };
    disposers.add( ( ) => {
        view.dotsPainter.cBoundsFn = ( ) => Interval1D.fromEdges( 0, 1 );
    } );

    // Update dotsPainter coords when model changes
    const coordsListenable = activityListenable( model.tRef_PSEC, model.dots );
    disposers.add( coordsListenable.addListener( IMMEDIATE, ( ) => {
        const tRef_PSEC = model.tRef_PSEC.v;
        const dots = model.dots.v;
        const xytCoords = new Float32Array( 3 * dots.size );
        let i = 0;
        for ( const [ _, { x, y, t_PSEC } ] of dots ) {
            const t = t_PSEC - tRef_PSEC;
            i = put3f( xytCoords, i, x, y, t );
        }
        view.dotsPainter.setXycCoords( xytCoords );
        repaint.fire( );
    } ) );

    // Manipulate dots with mouse and keyboard
    disposers.add( attachGeoInputHandler( model, view ) );

    // Repaint when necessary
    const repaintListenable = activityListenable( view.xyAxis, model.tCursor_PSEC );
    disposers.add( repaintListenable.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } ) );

    return disposers;
}

function attachGeoInputHandler( model: Model, view: GeoView ): Disposer {
    const disposers = new DisposerGroup( );

    function xyMouse( ev: PaneMouseEvent ): [ x: number, y: number ] {
        return [
            view.xyAxis.x.pxToCoord( ev.loc_PX.x ),
            view.xyAxis.y.pxToCoord( ev.loc_PX.y ),
        ];
    }

    function findDotAt( ev: PaneMouseEvent ): [ dotKey: string, dot: Dot ] | undefined {
        const [ xGrab, yGrab ] = xyMouse( ev );
        const xScale = view.xyAxis.x.scale;
        const yScale = view.xyAxis.y.scale;
        const grabDistance_LPX = ceil( 0.5*view.dotsPainter.fixedSize_LPX.get( ) );
        let bestDistanceSq_LPX = grabDistance_LPX * grabDistance_LPX;
        let bestEntry: [ string, Dot ] | undefined = undefined;
        for ( const [ dotKey, dot ] of model.dots.v ) {
            const dx_LPX = ( xGrab - dot.x ) * xScale;
            const dy_LPX = ( yGrab - dot.y ) * yScale;
            const dSq_LPX = dx_LPX*dx_LPX + dy_LPX*dy_LPX;
            if ( dSq_LPX <= bestDistanceSq_LPX ) {
                bestDistanceSq_LPX = dSq_LPX;
                bestEntry = [ dotKey, dot ];
            }
        }
        return bestEntry;
    }

    disposers.add( view.pane.addInputHandler( {
        getHoverHandler: evMove => {
            // Add a new dot on SHIFT+Click
            if ( evMove.modifiers.shift ) {
                return {
                    target: undefined,
                    getMouseCursorClasses: ( ) => [ 'clickable' ],
                };
            }

            // Drag the nearest existing dot if we're close enough to it
            const bestEntry = findDotAt( evMove );
            if ( isDefined( bestEntry ) ) {
                const [ dotKey ] = bestEntry;
                return {
                    target: dotKey,
                    getMouseCursorClasses: ( ) => [ 'dot-hovered' ],
                };
            }

            // Fall through to the next handler
            return null;
        },
        getDragHandler: evGrab => {
            // Add a new dot on SHIFT+Click
            if ( evGrab.button === 0 && evGrab.modifiers.shift ) {
                const dotKey = model.nextDotKey( );
                return {
                    target: dotKey,
                    handleGrab: ( ) => {
                        const [ x, y ] = xyMouse( evGrab );
                        const z = model.zAxisGroup.getBounds( ).fracToValue( 0.5 );
                        const t_PSEC = model.tCursor_PSEC.v;
                        const dot = new Dot( x, y, z, t_PSEC );
                        model.dots.update( true, dots => dots.set( dotKey, dot ) );
                    },
                    handleDrag: ev => {
                        const [ x, y ] = xyMouse( ev );
                        model.dots.update( true, dots => dots.update( dotKey, dot => dot!.withXy( x, y ) ) );
                    },
                    handleUngrab: ev => {
                        const [ x, y ] = xyMouse( ev );
                        model.dots.update( false, dots => dots.update( dotKey, dot => dot!.withXy( x, y ) ) );
                    },
                };
            }

            // Drag the nearest existing dot if we're close enough to it
            if ( evGrab.button === 0 ) {
                const bestEntry = findDotAt( evGrab );
                if ( isDefined( bestEntry ) ) {
                    const [ dotKey, dotGrab ] = bestEntry;
                    const [ xGrab, yGrab ] = xyMouse( evGrab );
                    let dxGrab = xGrab - dotGrab.x;
                    let dyGrab = yGrab - dotGrab.y;
                    return {
                        target: dotKey,
                        getMouseCursorClasses: ( ) => [ 'dot-dragged' ],
                        handleDrag: ev => {
                            const [ x, y ] = xyMouse( ev );
                            model.dots.update( true, dots => dots.update( dotKey, dot => dot!.withXy( x - dxGrab, y - dyGrab ) ) );
                        },
                        handleUngrab: ev => {
                            const [ x, y ] = xyMouse( ev );
                            model.dots.update( false, dots => dots.update( dotKey, dot => dot!.withXy( x - dxGrab, y - dyGrab ) ) );
                        },
                    };
                }
            }

            // Fall through to the next handler
            return null;
        },
    } ) );

    return disposers;
}

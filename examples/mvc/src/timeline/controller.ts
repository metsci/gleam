import { attachAxisCursor, PaneMouseEvent, put2f } from '@metsci/gleam-core';
import { activityListenable, Disposer, DisposerGroup, FireableListenable, IMMEDIATE, Interval2D, isDefined } from '@metsci/gleam-util';
import { Dot } from '../misc';
import { Model } from '../model';
import { TimelineView } from './view';

const { ceil } = Math;

export function attachTimelineController( model: Model, view: TimelineView, repaint: FireableListenable ): Disposer {
    const disposers = new DisposerGroup( );

    // Link view axes with the model
    disposers.add( view.zAxisWidget.axis.link( model.zAxisGroup ) );
    disposers.add( view.tAxisWidget_PSEC.axis.link( model.tAxisGroup_PSEC ) );

    // Add a draggable time cursor
    disposers.add( attachAxisCursor( view.pane, view.tAxisWidget_PSEC.axis, view.tAxisWidget_PSEC.axisType, model.tCursor_PSEC, repaint ) );

    // Shift T bounds so coords are relative to model.tRef_PSEC, to avoid f32 precision error
    view.dotsPainter.xyBoundsFn = ( ) => {
        const tRef_PSEC = model.tRef_PSEC.v;
        const tBounds = view.tAxisWidget_PSEC.axis.bounds.shift( -tRef_PSEC );
        const zBounds = view.zAxisWidget.axis.bounds;
        return Interval2D.fromXy( tBounds, zBounds );
    };
    disposers.add( ( ) => {
        view.dotsPainter.xyBoundsFn = ( ) => Interval2D.fromEdges( 0, 1, 0, 1 );
    } );

    // Update dotsPainter coords when model changes
    const coordsListenable = activityListenable( model.tRef_PSEC, model.dots );
    disposers.add( coordsListenable.addListener( IMMEDIATE, ( ) => {
        const tRef_PSEC = model.tRef_PSEC.v;
        const dots = model.dots.v;
        const tzCoords = new Float32Array( 2 * dots.size );
        let i = 0;
        for ( const [ _, { t_PSEC, z } ] of dots ) {
            const t = t_PSEC - tRef_PSEC;
            i = put2f( tzCoords, i, t, z );
        }
        view.dotsPainter.setXyCoords( tzCoords );
        repaint.fire( );
    } ) );

    // Manipulate dots with mouse and keyboard
    disposers.add( attachTimelineInputHandler( model, view ) );

    // Repaint when necessary
    const repaintListenable = activityListenable( view.tAxisWidget_PSEC.axis, view.zAxisWidget.axis, model.dots );
    disposers.add( repaintListenable.addListener( IMMEDIATE, ( ) => {
        repaint.fire( );
    } ) );

    return disposers;
}

function attachTimelineInputHandler( model: Model, view: TimelineView ): Disposer {
    const disposers = new DisposerGroup( );

    function ztMouse_PSEC( ev: PaneMouseEvent ): [ z: number, t_PSEC: number] {
        return [
            view.zAxisWidget.axis.pxToCoord( ev.loc_PX.y ),
            view.tAxisWidget_PSEC.axis.pxToCoord( ev.loc_PX.x ),
        ];
    }

    function findDotAt( ev: PaneMouseEvent ): [ dotKey: string, dot: Dot ] | undefined {
        const [ zGrab, tGrab_PSEC ] = ztMouse_PSEC( ev );
        const zScale = view.zAxisWidget.axis.scale;
        const tScale = view.tAxisWidget_PSEC.axis.scale;
        const grabDistance_LPX = ceil( 0.5*view.dotsPainter.fixedSize_LPX.get( ) );
        let bestDistanceSq_LPX = grabDistance_LPX * grabDistance_LPX;
        let bestEntry: [ string, Dot ] | undefined = undefined;
        for ( const [ dotKey, dot ] of model.dots.v ) {
            const dz_LPX = ( zGrab - dot.z ) * zScale;
            const dt_LPX = ( tGrab_PSEC - dot.t_PSEC ) * tScale;
            const dSq_LPX = dz_LPX*dz_LPX + dt_LPX*dt_LPX;
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
                        const x = model.xAxisGroup.getTieCoord( );
                        const y = model.yAxisGroup.getTieCoord( );
                        const [ z, t_PSEC ] = ztMouse_PSEC( evGrab );
                        const dot = new Dot( x, y, z, t_PSEC );
                        model.dots.update( false, dots => dots.set( dotKey, dot ) );
                    },
                    handleDrag: ev => {
                        const [ z, t_PSEC ] = ztMouse_PSEC( ev );
                        model.dots.update( true, dots => dots.update( dotKey, dot => dot!.withZt( z, t_PSEC ) ) );
                    },
                    handleUngrab: ev => {
                        const [ z, t_PSEC ] = ztMouse_PSEC( ev );
                        model.dots.update( false, dots => dots.update( dotKey, dot => dot!.withZt( z, t_PSEC ) ) );
                    },
                };
            }

            // Drag the nearest existing dot if we're close enough to it
            if ( evGrab.button === 0 ) {
                const bestEntry = findDotAt( evGrab );
                if ( isDefined( bestEntry ) ) {
                    const [ dotKey, dotGrab ] = bestEntry;
                    const [ zGrab, tGrab_PSEC ] = ztMouse_PSEC( evGrab );
                    let dzGrab = zGrab - dotGrab.z;
                    let dtGrab = tGrab_PSEC - dotGrab.t_PSEC;
                    return {
                        target: dotKey,
                        handleDrag: ev => {
                            const [ z, t_PSEC ] = ztMouse_PSEC( ev );
                            model.dots.update( true, dots => dots.update( dotKey, dot => dot!.withZt( z - dzGrab, t_PSEC - dtGrab ) ) );
                        },
                        handleUngrab: ev => {
                            const [ z, t_PSEC ] = ztMouse_PSEC( ev );
                            model.dots.update( false, dots => dots.update( dotKey, dot => dot!.withZt( z - dzGrab, t_PSEC - dtGrab ) ) );
                        },
                    };
                }
            }

            // Fall through to the next input handler
            return null;
        },
    } ) );

    return disposers;
}

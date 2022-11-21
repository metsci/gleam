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
import { ActivityListenable, clamp, CowArray, doTxn, equal, findIndexNearest, ImmutableMap, isDefined, isUndefined, newImmutableMap, newImmutableSet, NOOP, Nullable, Ref, RefBasic, RefDerived, requireDefined, _addOldNewActivityListener } from '@metsci/gleam-util';
import { Interval1D, ModifierSet, X, Y } from '../support';
import { frozenSupplier } from '../util';
import { Axis1D, getMouseAxisCoord1D, ZOOM_STEP_FACTOR } from './axis1d';
import { DragHandler, HoverHandler, InputHandler, PaneMouseEvent, WheelHandler } from './pane';

export interface Tag {
    readonly map: TagMap;
    readonly key: string;
    readonly coord: Ref<number>;
}

export interface TagConstraintFn {
    ( ongoing: boolean, map: ReadonlyMap<string,Tag>, changingKeys: ReadonlySet<string> ): void;
}

class TagCoordRef extends RefDerived<number> {
    constructor(
        readonly mapRef: Ref<ImmutableMap<string,number>>,
        readonly key: string,
    ) {
        super( mapRef );
    }

    areEqual( a: number, b: number ): boolean {
        return Object.is( a, b );
    }

    get v( ): number {
        return requireDefined( this.mapRef.v.get( this.key ) );
    }

    protected doSet( ongoing: boolean, value: number ): boolean {
        return this.mapRef.update( ongoing, map => map.set( this.key, value ) );
    }
}

export class TagMap implements Iterable<Tag> {
    protected readonly coordsRef: Ref<ImmutableMap<string,number>>;
    protected constraintFn: TagConstraintFn;

    protected readonly tagsMap: Map<string,Tag>;
    protected readonly tagsArray: CowArray<Tag>;
    protected tagsArrayNeedsRegen: boolean;
    protected tagsArrayNeedsSort: boolean;

    constructor( tags: Record<string,number> = {} ) {
        this.coordsRef = new RefBasic( newImmutableMap<string,number>( [] ), equal );
        this.constraintFn = NOOP;

        this.tagsMap = new Map( );
        this.tagsArray = new CowArray( );
        this.tagsArrayNeedsRegen = false;
        this.tagsArrayNeedsSort = false;

        // Ongoing flag is only passed along to constraintFn, so _addOldNewActivityListener is safe to use
        _addOldNewActivityListener( this.coordsRef, { immediate: true, order: -1e6 }, ( ongoing, oldMap0, newMap0 ) => {
            const changingKeys = new Set<string>( );

            const oldMap = oldMap0 ?? newImmutableMap<string,number>( [] );
            const newMap = newMap0 ?? newImmutableMap<string,number>( [] );
            const keys = newImmutableSet( [ ...oldMap.keys( ), ...newMap.keys( ) ] );
            for ( const key of keys ) {
                const oldCoord = oldMap.get( key );
                const newCoord = newMap.get( key );
                if ( newCoord !== oldCoord ) {
                    changingKeys.add( key );
                    if ( oldCoord === undefined ) {
                        // Key added
                        this.tagsMap.set( key, {
                            map: this,
                            key: key,
                            coord: new TagCoordRef( this.coordsRef, key )
                        } );
                        this.tagsArrayNeedsRegen = true;
                        this.tagsArrayNeedsSort = true;
                    }
                    else if ( newCoord === undefined ) {
                        // Key removed
                        this.tagsMap.delete( key );
                        this.tagsArrayNeedsRegen = true;
                    }
                    else {
                        // Value changed
                        this.tagsArrayNeedsSort = true;
                    }
                }
            }

            doTxn( ( ) => {
                this.constraintFn( ongoing, this.tagsMap, changingKeys );
            } );
        } );

        this.set( false, tags );
    }

    get changes( ): ActivityListenable {
        return this.coordsRef;
    }

    getTag( key: string ): Tag | undefined {
        return this.tagsMap.get( key );
    }

    requireTag( key: string ): Tag {
        const tag = this.getTag( key );
        if ( isUndefined( tag ) ) {
            throw new Error( 'Tag not found: key = "' + key + '"' );
        }
        return tag;
    }

    getCoord( key: string ): number | undefined {
        return this.coordsRef.v.get( key );
    }

    requireCoord( key: string ): number {
        const coord = this.getCoord( key );
        if ( isUndefined( coord ) ) {
            throw new Error( 'Tag not found: key = "' + key + '"' );
        }
        return coord;
    }

    requireInterval( minKey: string, maxKey: string ): Interval1D {
        const min = this.requireCoord( minKey );
        const max = this.requireCoord( maxKey );
        return Interval1D.fromEdges( min, max );
    }

    set( ongoing: boolean, tags: Record<string,number> ): void {
        this.coordsRef.update( ongoing, map => {
            // Could be done more efficiently, but in practice the number of tags is always small (< 10),
            // and this way we don't require the ImmutableMap interface to have any particular update method
            const mutable = new Map( map );
            for ( const [ key, coord ] of Object.entries( tags ) ) {
                mutable.set( key, coord );
            }
            return newImmutableMap( mutable );
        } );
    }

    delete( ongoing: boolean, key: string ): void {
        this.coordsRef.update( ongoing, map => map.remove( key ) );
    }

    setConstraint( constraintFn: TagConstraintFn ): void {
        this.constraintFn = constraintFn;
        doTxn( ( ) => {
            this.constraintFn( false, this.tagsMap, new Set( ) );
        } );
    }

    protected updateTagsArray( ): void {
        if ( this.tagsArrayNeedsRegen ) {
            this.tagsArray.length = 0;
            for ( const tag of this.tagsMap.values( ) ) {
                this.tagsArray.push( tag );
            }
            this.tagsArrayNeedsRegen = false;
            this.tagsArrayNeedsSort = true;
        }

        if ( this.tagsArrayNeedsSort ) {
            this.tagsArray.sortStable( ( a, b ) => {
                return ( a.coord.v - b.coord.v );
            } );
            this.tagsArrayNeedsSort = false;
        }
    }

    minCoord( ): number | undefined {
        this.updateTagsArray( );
        const tag = this.tagsArray.get( 0 );
        return ( tag && tag.coord.v );
    }

    maxCoord( ): number | undefined {
        this.updateTagsArray( );
        const tag = this.tagsArray.get( this.tagsArray.length - 1 );
        return ( tag && tag.coord.v );
    }

    sortedCoords( ): number[] {
        this.updateTagsArray( );
        const result = [];
        for ( const tag of this.tagsArray ) {
            result.push( tag.coord.v );
        }
        return result;
    }

    findNearest( coord: number, acceptableTagCoordInterval: Interval1D ): Tag | undefined {
        this.updateTagsArray( );
        const { min: minAcceptableTagCoord, max: maxAcceptableTagCoord } = acceptableTagCoordInterval;
        const i = this.tagsArray.findIndexNearest( tag => {
            let tagCoord = tag.coord.v;
            if ( tagCoord < minAcceptableTagCoord ) {
                tagCoord = Number.NEGATIVE_INFINITY;
            }
            else if ( tagCoord > maxAcceptableTagCoord ) {
                tagCoord = Number.POSITIVE_INFINITY;
            }
            return ( tag.coord.v - coord );
        } );
        const tag = this.tagsArray.get( i );
        if ( acceptableTagCoordInterval.containsPoint( tag.coord.v ) ) {
            return tag;
        }
        else {
            return undefined;
        }
    }

    [Symbol.iterator]( ): Iterator<Tag> {
        this.updateTagsArray( );
        return this.tagsArray[ Symbol.iterator ]( );
    }
}

export const tagGrabDistance_LPX = 10;
export const tagSnapDistance_LPX = 7;

export function allowSnap( modifiers: ModifierSet ): boolean {
    // ALT would be more natural, but some browsers use ALT (by itself) as a hotkey
    // -- for example, Firefox shows the top menubar -- so use SHIFT here instead
    return !modifiers.shift;
}

export function snap( axis: Axis1D, coord: number, snapCoords: ArrayLike<number> ): number {
    const i = findIndexNearest( snapCoords, snapCoord => snapCoord - coord );
    if ( i >= 0 ) {
        const snapCoord = snapCoords[ i ];
        if ( Math.abs( coord - snapCoord ) <= tagSnapDistance_LPX / axis.scale ) {
            return snapCoord;
        }
    }
    return coord;
}

export function createTagsInputHandler1D( axis: Axis1D, axisType: X | Y, tags: TagMap, allowDragAll: boolean = true, getSnapCoords?: ( axis: Axis1D ) => ArrayLike<number> ): InputHandler {
    const getSingleTagMouseCursorClasses = frozenSupplier( axisType === X ? [ 'x-tag-dragger' ] : [ 'y-tag-dragger' ] );
    const getMultiTagMouseCursorClasses = frozenSupplier( axisType === X ? [ 'x-multitag-dragger' ] : [ 'y-multitag-dragger' ] );
    return {
        getHoverHandler( evMove: PaneMouseEvent ): Nullable<HoverHandler> {
            const moveCoord = getMouseAxisCoord1D( axis, axisType, evMove );
            const tag = tags.findNearest( moveCoord, axis.bounds );
            if ( tag ) {
                const moveOffset = moveCoord - tag.coord.v;
                if ( Math.abs( moveOffset ) <= tagGrabDistance_LPX / axis.scale ) {
                    return {
                        target: tag,
                        getMouseCursorClasses: getSingleTagMouseCursorClasses,
                    };
                }
            }
            if ( allowDragAll && axis.bounds.containsPoint( moveCoord ) ) {
                const minTagCoord = tags.minCoord( );
                const maxTagCoord = tags.maxCoord( );
                if ( isDefined( minTagCoord ) && isDefined( maxTagCoord ) ) {
                    const moveTagFrac = ( moveCoord - minTagCoord ) / ( maxTagCoord - minTagCoord );
                    if ( 0.0 <= moveTagFrac && moveTagFrac <= 1.0 ) {
                        return {
                            target: tags,
                            getMouseCursorClasses: getMultiTagMouseCursorClasses,
                        };
                    }
                }
            }
            return null;
        },
        getDragHandler( evGrab: PaneMouseEvent ): Nullable<DragHandler> {
            if ( evGrab.button === 0 ) {
                const grabCoord = getMouseAxisCoord1D( axis, axisType, evGrab );
                const tag = tags.findNearest( grabCoord, axis.bounds );
                if ( tag ) {
                    // With offset as a constant axis distance, things get weird if you zoom way in
                    // while dragging. We wouldn't have that issue if offset were a pixel distance.
                    // However, pixel offset has its own problem: the dragged object's axis coord
                    // changes, which feels wrong, and gets more noticeable as you zoom OUT. When a
                    // dragged object is linked to stuff shown on other plots, this movement in axis
                    // space feels especially bad. So the offset here is a constant axis distance.
                    const grabOffset = grabCoord - tag.coord.v;
                    if ( Math.abs( grabOffset ) <= tagGrabDistance_LPX / axis.scale ) {
                        return {
                            target: tag,
                            getMouseCursorClasses: getSingleTagMouseCursorClasses,
                            handleDrag( evDrag: PaneMouseEvent ): void {
                                const mouseCoord = getMouseAxisCoord1D( axis, axisType, evDrag );
                                let tagCoord = mouseCoord - grabOffset;
                                if ( getSnapCoords && allowSnap( evDrag.modifiers ) ) {
                                    tagCoord = snap( axis, tagCoord, getSnapCoords( axis ) );
                                }
                                tag.coord.set( true, tagCoord );
                            },
                            handleUngrab( evUngrab: PaneMouseEvent ): void {
                                const mouseCoord = getMouseAxisCoord1D( axis, axisType, evUngrab );
                                let tagCoord = mouseCoord - grabOffset;
                                if ( getSnapCoords && allowSnap( evUngrab.modifiers ) ) {
                                    tagCoord = snap( axis, tagCoord, getSnapCoords( axis ) );
                                }
                                tag.coord.set( false, tagCoord );
                            }
                        };
                    }
                }
                if ( allowDragAll && axis.bounds.containsPoint( grabCoord ) ) {
                    const minTagCoord = tags.minCoord( );
                    const maxTagCoord = tags.maxCoord( );
                    if ( minTagCoord !== undefined && maxTagCoord !== undefined ) {
                        const grabTagFrac = ( grabCoord - minTagCoord ) / ( maxTagCoord - minTagCoord );
                        if ( 0.0 <= grabTagFrac && grabTagFrac <= 1.0 ) {
                            const grabOffsetsByKey = new Map( ) as Map<string,number>;
                            for ( const tag of tags ) {
                                grabOffsetsByKey.set( tag.key, grabCoord - tag.coord.v );
                            }
                            return {
                                target: tags,
                                getMouseCursorClasses: getMultiTagMouseCursorClasses,
                                handleDrag( evDrag: PaneMouseEvent ): void {
                                    const mouseCoord = getMouseAxisCoord1D( axis, axisType, evDrag );
                                    const newTags = { } as Record<string,number>;
                                    for ( const tag of tags ) {
                                        const grabOffset = grabOffsetsByKey.get( tag.key );
                                        if ( grabOffset !== undefined ) {
                                            newTags[ tag.key ] = mouseCoord - grabOffset;
                                        }
                                        else {
                                            // New tag appeared during drag
                                            grabOffsetsByKey.set( tag.key, mouseCoord - tag.coord.v );
                                        }
                                    }
                                    tags.set( true, newTags );
                                },
                                handleUngrab( evUngrab: PaneMouseEvent ): void {
                                    const mouseCoord = getMouseAxisCoord1D( axis, axisType, evUngrab );
                                    const newTags = { } as Record<string,number>;
                                    for ( const tag of tags ) {
                                        const grabOffset = grabOffsetsByKey.get( tag.key );
                                        if ( grabOffset !== undefined ) {
                                            newTags[ tag.key ] = mouseCoord - grabOffset;
                                        }
                                    }
                                    tags.set( false, newTags );
                                },
                            }
                        }
                    }
                }
            }
            return null;
        },
        getWheelHandler( evGrabOrWheel: PaneMouseEvent ): Nullable<WheelHandler> {
            // Wheel with modifiers may do other things (e.g. browser zoom)
            if ( evGrabOrWheel.modifiers.isEmpty( ) ) {
                const mouseCoord = getMouseAxisCoord1D( axis, axisType, evGrabOrWheel );
                const tag = tags.findNearest( mouseCoord, axis.bounds );
                if ( tag ) {
                    const mouseOffset = mouseCoord - tag.coord.v;
                    if ( Math.abs( mouseOffset ) <= tagGrabDistance_LPX / axis.scale ) {
                        return {
                            target: tag,
                            handleWheel( evWheel: PaneMouseEvent ): void {
                                const tagCoord = tag.coord.v;
                                const tagFrac = axis.bounds.valueToFrac( tagCoord );
                                const scale = axis.scale / Math.pow( ZOOM_STEP_FACTOR, evWheel.wheelSteps );
                                axis.set( false, tagFrac, tagCoord, scale );
                            },
                        };
                    }
                }
            }
            return null;
        },
    };
}

/**
 * Returns a TagConstraintFn that applies the given constraints in the
 * given order.
 *
 * **WARNING**: Test your chained constraints thoroughly! They sometimes
 * behave in unexpected ways.
 */
export function chainTagConstraints( ...constraintFns: ReadonlyArray<TagConstraintFn> ): TagConstraintFn {
    return ( ongoing, map, changingKeys ) => {
        for ( const constraintFn of constraintFns ) {
            constraintFn( ongoing, map, changingKeys );
        }
    };
}

export function createStdTagConstraint( minLimit: number, maxLimit: number, keysInOrder: ReadonlyArray<string> ): TagConstraintFn {
    return chainTagConstraints(
        createMinMaxConstraint( minLimit, maxLimit ),
        createTagOrderConstraint( ...keysInOrder ),
    );
}

export function createMinMaxConstraint( minLimit: number, maxLimit: number ): TagConstraintFn {
    return ( ongoing, map, changingKeys ) => {
        let minCoord = Number.POSITIVE_INFINITY;
        let maxCoord = Number.NEGATIVE_INFINITY;
        for ( const key of changingKeys ) {
            const tag = map.get( key );
            if ( tag ) {
                const coord = tag.coord.v;
                minCoord = Math.min( minCoord, coord );
                maxCoord = Math.max( maxCoord, coord );
            }
        }

        let shift = 0.0;
        if ( maxCoord > maxLimit ) {
            shift = maxLimit - maxCoord;
        }
        else if ( minCoord < minLimit ) {
            shift = minLimit - minCoord;
        }

        if ( shift !== 0.0 ) {
            for ( const key of changingKeys ) {
                const tag = map.get( key );
                if ( tag ) {
                    const oldCoord = tag.coord.v;
                    const newCoord = clamp( minLimit, maxLimit, oldCoord + shift );
                    tag.coord.set( ongoing, newCoord );
                }
            }
        }
    };
}

export function createTagOrderConstraint( ...keysInOrder: string[] ): TagConstraintFn {
    return ( ongoing, map, changingKeys ) => {
        const tags = [];
        for ( const key of keysInOrder ) {
            const tag = map.get( key );
            if ( tag ) {
                tags.push( tag );
            }
        }

        // Adjust CHANGING tags to satisfy order
        let floorCoord = Number.NEGATIVE_INFINITY;
        for ( const tag of tags ) {
            if ( changingKeys.has( tag.key ) ) {
                if ( tag.coord.v < floorCoord ) {
                    tag.coord.set( ongoing, floorCoord );
                }
                else if ( tag.coord.v > floorCoord ) {
                    floorCoord = tag.coord.v;
                }
            }
        }

        // Adjust NON-changing tags to satisfy order, without adjusting CHANGING keys
        for ( let i = 0; i < tags.length; i++ ) {
            const tag = tags[ i ];
            if ( changingKeys.has( tag.key ) ) {

                // Adjust NON-changing tags between current and previous CHANGING tags
                let ceilCoord = tag.coord.v;
                for ( let iBelow = i - 1; iBelow >= 0; iBelow-- ) {
                    const tagBelow = tags[ iBelow ];
                    if ( !changingKeys.has( tagBelow.key ) ) {
                        if ( tagBelow.coord.v > ceilCoord ) {
                            tagBelow.coord.set( ongoing, ceilCoord );
                        }
                        else if ( tagBelow.coord.v < ceilCoord ) {
                            ceilCoord = tagBelow.coord.v;
                        }
                    }
                    else {
                        break;
                    }
                }

                // Adjust NON-changing tags between current and next CHANGING tags
                let floorCoord = tag.coord.v;
                for ( let iAbove = i + 1; iAbove < tags.length; iAbove++ ) {
                    const tagAbove = tags[ iAbove ];
                    if ( !changingKeys.has( tagAbove.key ) ) {
                        if ( tagAbove.coord.v < floorCoord ) {
                            tagAbove.coord.set( ongoing, floorCoord );
                        }
                        else if ( tagAbove.coord.v > floorCoord ) {
                            floorCoord = tagAbove.coord.v;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
    };
}

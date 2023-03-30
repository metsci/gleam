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
import { doCombineConstraints } from '@metsci/gleam-core';
import { AaTreeMap, Disposer, DisposerGroup, equal, FireableNotifier, ImmutableSet, Interval1D, LinkedSet, NOOP, NotifierBasic, ReadableAaNode, ReadableLinkedSet, ReadableTreeMap, requireDefined, requireEqual, TreeMap } from '@metsci/gleam-util';

const { max, min } = Math;
const { POSITIVE_INFINITY, NEGATIVE_INFINITY } = Number;

export const READABLE_EVENT_SYMBOL = Symbol( '@@__GLEAM_READABLE_EVENT__@@' );
export function isReadableEvent( obj: any ): obj is ReadableEvent {
    return !!( obj && typeof obj === 'object' && obj[ READABLE_EVENT_SYMBOL ] );
}

export interface EraConstraints {
    min?: Interval1D;
    max?: Interval1D;
}

export interface ReadableEvent {
    readonly [ READABLE_EVENT_SYMBOL ]: true;
    readonly label: string;
    readonly era_PSEC: Interval1D;
    readonly eraConstraints_PSEC: Readonly<EraConstraints>;
    readonly allowsUserDrag: boolean;
    readonly classes: ImmutableSet<string>;
    readonly styleKey: string;
}

export const WRITABLE_EVENT_SYMBOL = Symbol( '@@__GLEAM_WRITABLE_EVENT__@@' );
export function isWritableEvent( obj: any ): obj is WritableEvent {
    return !!( obj && typeof obj === 'object' && obj[ WRITABLE_EVENT_SYMBOL ] );
}

export enum EraConstraintMode {
    KEEP_MIN,
    KEEP_MAX,
    KEEP_SPAN,
    CLIP_PRIORITIZING_MIN_CONSTRAINT,
    CLIP_PRIORITIZING_MAX_CONSTRAINT,
}

const UNCONSTRAINED = Interval1D.fromEdges( Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );
function isConstrained( constraint: Interval1D ): boolean {
    return !( constraint.min === NEGATIVE_INFINITY && constraint.max === POSITIVE_INFINITY );
}

export function constrainEra( era: Interval1D, constraints: EraConstraints, mode?: EraConstraintMode ): Interval1D {
    const minConstraint = constraints.min ?? UNCONSTRAINED;
    const maxConstraint = constraints.max ?? UNCONSTRAINED;
    if ( minConstraint.containsPoint( era.min ) && maxConstraint.containsPoint( era.max ) ) {
        // Reuse the existing object, if we can, to avoid unnecessary object creation
        return era;
    }
    else {
        switch ( mode ?? EraConstraintMode.CLIP_PRIORITIZING_MAX_CONSTRAINT ) {
            case EraConstraintMode.KEEP_MIN: {
                const constrainedMax = maxConstraint.clamp( era.max );
                const constrainedMin = min( era.min, constrainedMax );
                return Interval1D.fromEdges( constrainedMin, constrainedMax );
            }

            case EraConstraintMode.KEEP_MAX: {
                const constrainedMin = minConstraint.clamp( era.min );
                const constrainedMax = max( era.max, constrainedMin );
                return Interval1D.fromEdges( constrainedMin, constrainedMax );
            }

            case EraConstraintMode.KEEP_SPAN: {
                const { span } = era;
                const constrainedMax = doCombineConstraints( maxConstraint, minConstraint.shift( span ) ).clamp( era.max );
                const constrainedMin = constrainedMax - span;
                return Interval1D.fromEdges( constrainedMin, constrainedMax );
            }

            case EraConstraintMode.CLIP_PRIORITIZING_MIN_CONSTRAINT: {
                if ( isConstrained( minConstraint ) && isConstrained( maxConstraint ) ) {
                    const constrainedMin = minConstraint.clamp( era.min );
                    const constrainedMax = max( maxConstraint.clamp( era.max ), constrainedMin );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else if ( isConstrained( minConstraint ) ) {
                    const constrainedMin = minConstraint.clamp( era.min );
                    const constrainedMax = max( era.max, constrainedMin );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else if ( isConstrained( maxConstraint ) ) {
                    const constrainedMax = maxConstraint.clamp( era.max );
                    const constrainedMin = min( era.min, constrainedMax );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else {
                    return era;
                }
            }

            case EraConstraintMode.CLIP_PRIORITIZING_MAX_CONSTRAINT: {
                if ( isConstrained( minConstraint ) && isConstrained( maxConstraint ) ) {
                    const constrainedMax = maxConstraint.clamp( era.max );
                    const constrainedMin = min( minConstraint.clamp( era.min ), constrainedMax );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else if ( isConstrained( minConstraint ) ) {
                    const constrainedMin = minConstraint.clamp( era.min );
                    const constrainedMax = max( era.max, constrainedMin );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else if ( isConstrained( maxConstraint ) ) {
                    const constrainedMax = maxConstraint.clamp( era.max );
                    const constrainedMin = min( era.min, constrainedMax );
                    return Interval1D.fromEdges( constrainedMin, constrainedMax );
                }
                else {
                    return era;
                }
            }
        }
    }
}

export interface WritableEvent extends ReadableEvent {
    readonly [ WRITABLE_EVENT_SYMBOL ]: true;

    setLabel( ongoing: boolean, label: string ): void;
    setEra_PSEC( ongoing: boolean, era_PSEC: Interval1D, constraintMode?: EraConstraintMode ): void;
    setAllowsUserDrag( ongoing: boolean, allowsUserDrag: boolean ): void;
    setClasses( ongoing: boolean, classes: ImmutableSet<string> ): void;

    /**
     * This method applies the new constraints to the existing era, which may set the
     * event duration to zero. If a caller wishes to avoid setting duration to zero,
     * the caller can modify the era appropriately before calling this method.
     */
    setEraConstraints_PSEC( ongoing: boolean, eraConstraints_PSEC: EraConstraints ): void;

    /**
     * Convenience wrapper around `setClasses`.
     */
    addClass( ongoing: boolean, clazz: string ): void;

    /**
     * Convenience wrapper around `setClasses`.
     */
    removeClass( ongoing: boolean, clazz: string ): void;

    /**
     * Convenience wrapper around `setClasses`.
     */
    toggleClass( ongoing: boolean, clazz: string ): void;

    /**
     * Intended for use by implementing classes, and by `EventsGroup`.
     *
     * A `Listenable` (or similar) would make for cleaner code, but this has a smaller
     * memory footprint, which allows us to handle a larger number of events.
     */
    _owner: EventsGroup<ReadableEvent> | undefined;
}

export interface EventChange<T extends ReadableEvent> {
    ongoing: boolean;
    event: T;
}

interface EventSnapshot {
    readonly label: string;
    readonly era_PSEC: Interval1D;
    readonly styleKey: string;
}

export class EventsGroup<T extends ReadableEvent> {
    readonly positionChanges: FireableNotifier<EventChange<T> | undefined>;
    readonly rightNeighborChanges: FireableNotifier<EventChange<T> | undefined>;
    readonly styleChanges: FireableNotifier<EventChange<T> | undefined>;
    readonly labelChanges: FireableNotifier<EventChange<T> | undefined>;

    protected readonly lanes: Array<EventsLane<T>>;
    protected readonly currLaneNums: Map<T,number>;
    protected readonly eventSnapshots: Map<T,EventSnapshot>;
    protected readonly snapTimes_PSEC: TreeMap<number,LinkedSet<T>>;

    constructor( ) {
        this.positionChanges = new NotifierBasic( undefined );
        this.rightNeighborChanges = new NotifierBasic( undefined );
        this.styleChanges = new NotifierBasic( undefined );
        this.labelChanges = new NotifierBasic( undefined );

        this.lanes = new Array( );
        this.currLaneNums = new Map( );
        this.eventSnapshots = new Map( );
        this.snapTimes_PSEC = new AaTreeMap( ( a, b ) => {
            return ( a - b );
        } );
    }

    get size( ): number {
        return this.currLaneNums.size;
    }

    getLanes( ): ReadonlyArray<ReadableEventsLane<T>> {
        return this.lanes;
    }

    has( event: T ): boolean {
        return this.currLaneNums.has( event );
    }

    getLaneNumContaining( event: T ): number | undefined {
        return this.currLaneNums.get( event );
    }

    getLaneContaining( event: T ): ReadableEventsLane<T> | undefined {
        const laneNum = this.currLaneNums.get( event );
        return ( laneNum === undefined ? undefined : this.lanes[ laneNum ] );
    }

    getLeftNeighbor( event: T ): T | undefined {
        const lane = requireDefined( this.getLaneContaining( event ) );
        return lane.getEventsAt( event.era_PSEC )?.valueBefore( event )
            ?? lane.getEventsBefore( event.era_PSEC )?.valueBefore( undefined );
    }

    getRightNeighbor( event: T ): T | undefined {
        const lane = requireDefined( this.getLaneContaining( event ) );
        return lane.getEventsAt( event.era_PSEC )?.valueAfter( event )
            ?? lane.getEventsAfter( event.era_PSEC )?.valueAfter( undefined );
    }

    addEvent<U extends T>( event: U ): U {
        if ( isWritableEvent( event ) ) {
            requireEqual( event._owner, undefined );
            event._owner = this;
        }
        this._updateEvent( false, event );
        return event;
    }

    /**
     * Intended for use by `WritableEvent` impls.
     */
    _updateEvent<U extends T>( ongoing: boolean, event: U ): U {
        if ( isWritableEvent( event ) ) {
            requireEqual( event._owner, this );
        }

        const oldSnapshot = this.eventSnapshots.get( event );
        if ( !equal( event.era_PSEC, oldSnapshot?.era_PSEC ) ) {
            this.resettleEvent( ongoing, event, event.era_PSEC );
        }
        if ( event.styleKey !== oldSnapshot?.styleKey ) {
            this.styleChanges.fire( { ongoing, event } );
        }
        if ( event.label !== oldSnapshot?.label ) {
            this.labelChanges.fire( { ongoing, event } );
        }

        this.eventSnapshots.set( event, {
            label: event.label,
            era_PSEC: event.era_PSEC,
            styleKey: event.styleKey,
        } );

        return event;
    }

    removeEvent( event: T ): void {
        if ( isWritableEvent( event ) ) {
            requireEqual( event._owner, this );
            event._owner = undefined;
        }
        this.resettleEvent( false, event, undefined );
        this.eventSnapshots.delete( event );
    }

    clearEvents( ): void {
        // TODO: Could probably be more efficient
        for ( const [ event ] of this.currLaneNums ) {
            this.removeEvent( event );
        }
    }

    findNearestSnapTime_PSEC( time_PSEC: number, min_PSEC: number, max_PSEC: number, eventsToSuppress: Iterable<T> ): number | undefined {
        // Suppress specified events
        const eventSuppression = new DisposerGroup( );
        const suppressSnapTime = ( snapTime_PSEC: number, event: T ): Disposer => {
            if ( this.removeSnapTime( snapTime_PSEC, event ) ) {
                return ( ) => {
                    this.addSnapTime( snapTime_PSEC, event );
                };
            }
            return NOOP;
        };
        for ( const event of eventsToSuppress ) {
            const laneNum = this.currLaneNums.get( event );
            const era_PSEC = ( laneNum === undefined ? undefined : this.lanes[ laneNum ].getEra_PSEC( event ) );
            if ( era_PSEC ) {
                eventSuppression.add( suppressSnapTime( era_PSEC.min, event ) );
                eventSuppression.add( suppressSnapTime( era_PSEC.max, event ) );
            }
        }
        try {
            // Do the actual work
            return this.doFindNearestSnapTime_PSEC( time_PSEC, min_PSEC, max_PSEC );
        }
        finally {
            // Cancel event suppression
            eventSuppression.dispose( );
        }
    }

    protected doFindNearestSnapTime_PSEC( time_PSEC: number, min_PSEC: number, max_PSEC: number ): number | undefined {
        let a_PSEC = this.snapTimes_PSEC.keyBefore( time_PSEC );
        if ( a_PSEC !== undefined && !( min_PSEC <= a_PSEC && a_PSEC <= max_PSEC ) ) {
            a_PSEC = undefined;
        }

        let b_PSEC = this.snapTimes_PSEC.keyAtOrAfter( time_PSEC );
        if ( b_PSEC !== undefined && !( min_PSEC <= b_PSEC && b_PSEC <= max_PSEC ) ) {
            b_PSEC = undefined;
        }

        if ( a_PSEC !== undefined && b_PSEC !== undefined ) {
            return ( Math.abs( time_PSEC - a_PSEC ) < Math.abs( time_PSEC - b_PSEC ) ? a_PSEC : b_PSEC );
        }
        else if ( a_PSEC !== undefined ) {
            return a_PSEC;
        }
        else if ( b_PSEC !== undefined ) {
            return b_PSEC;
        }
        else {
            return undefined;
        }
    }

    protected addSnapTime( snapTime_PSEC: number, event: T ): boolean {
        let events = this.snapTimes_PSEC.get( snapTime_PSEC );
        if ( !events ) {
            events = new LinkedSet( );
            this.snapTimes_PSEC.set( snapTime_PSEC, events );
        }
        const hadEvent = events.has( event );
        events.add( event );
        return !hadEvent;
    };

    protected removeSnapTime( snapTime_PSEC: number, event: T ): boolean {
        let deletedEvent = false;
        const events = this.snapTimes_PSEC.get( snapTime_PSEC );
        if ( events ) {
            deletedEvent = events.delete( event );
            if ( events.size === 0 ) {
                this.snapTimes_PSEC.delete( snapTime_PSEC );
            }
        }
        return deletedEvent;
    }

    protected resettleEvent( ongoing: boolean, event: T, newEra_PSEC: Interval1D | undefined, pruneEmptyLanes: boolean = true ): void {
        // TODO: Resettle is slow when a lane is vacated by a wide event with many events on top of it

        // Remove event from old lane
        const oldLaneNum = this.currLaneNums.get( event );
        const oldEra_PSEC = ( oldLaneNum === undefined ? undefined : this.lanes[ oldLaneNum ].removeEvent( event ) );

        // Remove event's edges from snapTimes
        if ( oldEra_PSEC ) {
            this.removeSnapTime( oldEra_PSEC.min, event );
            this.removeSnapTime( oldEra_PSEC.max, event );
        }

        // Identify the lane event will end up in
        const newLaneNum = ( newEra_PSEC ? this.getOrCreateLaneWithRoom( newEra_PSEC ) : undefined );

        // Notify listeners of events' whose right neighbors are changing or moving
        if ( newLaneNum !== oldLaneNum || !equal( newEra_PSEC, oldEra_PSEC ) ) {
            function getLeftNeighbor( lanes: ReadonlyArray<EventsLane<T>>, laneNum: number, t_PSEC: number ): T | undefined {
                const leftEntry = lanes[ laneNum ].getEntryStartingAtOrBefore( t_PSEC );
                return leftEntry?.[1].valueBefore( undefined );
            }
            if ( oldLaneNum !== undefined && oldEra_PSEC ) {
                const oldLeftNeighbor = getLeftNeighbor( this.lanes, oldLaneNum, oldEra_PSEC.min );
                oldLeftNeighbor && this.rightNeighborChanges.fire( { ongoing, event: oldLeftNeighbor } );
            }
            if ( newLaneNum !== undefined && newEra_PSEC ) {
                const newLeftNeighbor = getLeftNeighbor( this.lanes, newLaneNum, newEra_PSEC.min );
                newLeftNeighbor && this.rightNeighborChanges.fire( { ongoing, event: newLeftNeighbor } );
            }
            if ( newLaneNum !== undefined && newLaneNum !== oldLaneNum ) {
                this.rightNeighborChanges.fire( { ongoing, event } );
            }
        }

        // Add event to new lane
        if ( newLaneNum !== undefined ) {
            this.currLaneNums.set( event, newLaneNum );
            this.lanes[ newLaneNum ].addEvent( event, requireDefined( newEra_PSEC ) );
        }
        else {
            this.currLaneNums.delete( event );
        }

        // Add event's edges to snapTimes
        if ( newEra_PSEC ) {
            this.addSnapTime( newEra_PSEC.min, event );
            this.addSnapTime( newEra_PSEC.max, event );
        }

        // Notify listeners
        this.positionChanges.fire( { ongoing, event } );

        // Resettle events in later lanes
        if ( oldLaneNum !== undefined && oldEra_PSEC && ( newLaneNum !== oldLaneNum || !equal( newEra_PSEC, oldEra_PSEC ) ) ) {
            const vacatedEras_PSEC = ( newLaneNum !== oldLaneNum ? [ oldEra_PSEC ] : oldEra_PSEC.minus( newEra_PSEC ?? Interval1D.ZERO ) );
            for ( let laneNum = oldLaneNum+1; laneNum < this.lanes.length; laneNum++ ) {
                const lane = this.lanes[ laneNum ];
                for ( const vacatedEra_PSEC of vacatedEras_PSEC ) {
                    // A call to resettleEvents modifies lanes, which messes up a live
                    // intersecting-events iterator -- so we consume all iterator items
                    // into an array before calling resettleEvents
                    for ( const other of [ ...lane.getEventsIntersecting( vacatedEra_PSEC ) ] ) {
                        this.resettleEvent( ongoing, other, other.era_PSEC, false );
                    }
                }
            }
        }

        // Prune trailing empty lanes (does not affect events' laneNums)
        if ( pruneEmptyLanes ) {
            while ( this.lanes.length > 0 && this.lanes[ this.lanes.length-1 ].size === 0 ) {
                this.lanes.pop( );
            }
        }
    }

    protected getOrCreateLaneWithRoom( era_PSEC: Interval1D ): number {
        for ( let laneNum = 0; laneNum < this.lanes.length; laneNum++ ) {
            const lane = this.lanes[ laneNum ];
            if ( !lane.hasEventsIntersecting( era_PSEC ) ) {
                return laneNum;
            }
        }
        const newLane = new EventsLane<T>( );
        this.lanes.push( newLane );
        return ( this.lanes.length - 1 );
    }
}

export interface ReadableEventsLane<T> {
    readonly size: number;
    getEvents( ): ReadableTreeMap<Interval1D,ReadableLinkedSet<T>>;
    getEventsAt( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined;
    getEventsBefore( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined;
    getEventsAtOrBefore( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined;
    getEventsAfter( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined;
    getEventsAtOrAfter( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined;
    getEventContaining( t_PSEC: number ): T | undefined;
    getEntryStartingBefore( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined;
    getEntryStartingAtOrBefore( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined;
    getEntryStartingAfter( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined;
    getEntryStartingAtOrAfter( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined;
    hasEventsIntersecting( era_PSEC: Interval1D ): boolean;
    getEventsIntersecting( era_PSEC: Interval1D ): IterableIterator<T>;
}

export class EventsLane<T> implements ReadableEventsLane<T> {
    protected events: TreeMap<Interval1D,LinkedSet<T>>;
    protected eras_PSEC: Map<T,Interval1D>;

    constructor( ) {
        this.events = new AaTreeMap( ( a, b ) => {
            const minComparison = a.min - b.min;
            if ( minComparison !== 0 ) {
                return minComparison;
            }
            const maxComparison = a.max - b.max;
            if ( maxComparison !== 0 ) {
                return maxComparison;
            }
            return 0;
        } );
        this.eras_PSEC = new Map( );
    }

    get size( ): number {
        return this.eras_PSEC.size;
    }

    getEvents( ): ReadableTreeMap<Interval1D,ReadableLinkedSet<T>> {
        return this.events;
    }

    getEventsAt( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined {
        return this.events.get( era_PSEC );
    }

    getEventsBefore( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined {
        return this.events.valueBefore( era_PSEC );
    }

    getEventsAtOrBefore( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined {
        return this.events.valueAtOrBefore( era_PSEC );
    }

    getEventsAfter( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined {
        return this.events.valueAfter( era_PSEC );
    }

    getEventsAtOrAfter( era_PSEC: Interval1D ): ReadableLinkedSet<T> | undefined {
        return this.events.valueAtOrAfter( era_PSEC );
    }

    getEventContaining( t_PSEC: number ): T | undefined {
        const en = this.events.entryAtOrBefore( Interval1D.fromEdges( t_PSEC, Number.POSITIVE_INFINITY ) );
        if ( en?.[0].containsPoint( t_PSEC ) ) {
            // There's at most one event for each non-empty interval; this
            // interval contains t_PSEC and therefore must be non-empty, so
            // we can pull the single event out of the set however we want
            return en[1].valueBefore( undefined );
        }
        else {
            return undefined;
        }
    }

    getEntryStartingBefore( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined {
        return this.events.entryBefore( Interval1D.fromEdges( t_PSEC, Number.NEGATIVE_INFINITY ) );
    }

    getEntryStartingAtOrBefore( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined {
        return this.events.entryAtOrBefore( Interval1D.fromEdges( t_PSEC, Number.POSITIVE_INFINITY ) );
    }

    getEntryStartingAfter( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined {
        return this.events.entryAfter( Interval1D.fromEdges( t_PSEC, Number.POSITIVE_INFINITY ) );
    }

    getEntryStartingAtOrAfter( t_PSEC: number ): [Interval1D,ReadableLinkedSet<T>] | undefined {
        return this.events.entryAtOrAfter( Interval1D.fromEdges( t_PSEC, Number.NEGATIVE_INFINITY ) );
    }

    hasEventsIntersecting( era_PSEC: Interval1D ): boolean {
        function doSubtree( root: ReadableAaNode<[Interval1D,Iterable<T>]> | undefined ): boolean {
            if ( root ) {
                const rootEra_PSEC = root.item[0];
                if ( era_PSEC.intersectsInterval( rootEra_PSEC ) ) {
                    return true;
                }
                if ( era_PSEC.min < rootEra_PSEC.min ) {
                    if ( doSubtree( root.left ) ) {
                        return true;
                    }
                }
                if ( era_PSEC.max > rootEra_PSEC.max ) {
                    if ( doSubtree( root.right ) ) {
                        return true;
                    }
                }
            }
            return false;
        }
        return doSubtree( this.events.getRoot( ) );
    }

    getEventsIntersecting( era_PSEC: Interval1D ): IterableIterator<T> {
        function* doSubtree( root: ReadableAaNode<[Interval1D,Iterable<T>]> | undefined ): IterableIterator<T> {
            if ( root ) {
                // Assumes nodes have non-intersecting eras -- which isn't true
                // of interval trees in general, but is true of TimelineLanes
                const rootEra_PSEC = root.item[0];
                if ( era_PSEC.min < rootEra_PSEC.min ) {
                    yield* doSubtree( root.left );
                }
                if ( era_PSEC.intersectsInterval( rootEra_PSEC ) ) {
                    yield* root.item[1];
                }
                if ( era_PSEC.max > rootEra_PSEC.max ) {
                    yield* doSubtree( root.right );
                }
            }
        }
        return doSubtree( this.events.getRoot( ) );
    }

    addEvent( event: T, era_PSEC: Interval1D ): void {
        if ( this.hasEventsIntersecting( era_PSEC ) ) {
            throw new Error( );
        }
        // TODO: Would be faster with a putIfAbsent fn that combined get and set
        let events = this.events.get( era_PSEC );
        if ( events === undefined ) {
            events = new LinkedSet( );
            this.events.set( era_PSEC, events );
        }
        events.addLast( event );
        this.eras_PSEC.set( event, era_PSEC );
    }

    /**
     * Returns the vacated interval.
     */
    removeEvent( event: T ): Interval1D {
        const era_PSEC = requireDefined( this.eras_PSEC.get( event ) );
        this.eras_PSEC.delete( event );
        const events = requireDefined( this.events.get( era_PSEC ) );
        events.delete( event );
        if ( events.size === 0 ) {
            this.events.delete( era_PSEC );
        }
        return era_PSEC;
    }

    getEra_PSEC( event: T ): Interval1D | undefined {
        return this.eras_PSEC.get( event );
    }
}

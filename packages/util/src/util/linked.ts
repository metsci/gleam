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
import { requireDefined } from './misc';

export interface Prev<T> {
    next: Next<T>;
}

export interface Next<T> {
    prev: Prev<T>;
}

export interface Node<T> extends Prev<T>, Next<T> {
    item: T;
}

type PossibleNode<T> = Node<T> | Prev<T> | Next<T>;

function isNode<T>( x: PossibleNode<T> ): x is Node<T> {
    const { prev, next } = x as any;
    return ( !!prev && !!next );
}

export class LinkedList<T> {
    readonly head: Prev<T>;
    readonly tail: Next<T>;

    constructor( items?: Iterable<T> ) {
        this.head = { next: undefined } as any;
        this.tail = { prev: undefined } as any;
        this.head.next = this.tail;
        this.tail.prev = this.head;
        if ( items ) {
            for ( const item of items ) {
                this.addLast( item );
            }
        }
    }

    *[Symbol.iterator]( ): IterableIterator<T> {
        let node = this.head;
        while ( true ) {
            const next = node.next;
            if ( !isNode( next ) ) {
                break;
            }
            yield next.item;
            node = next;
        }
    }

    *itemsInReverse( ): IterableIterator<T> {
        let node = this.tail;
        while ( true ) {
            const prev = node.prev;
            if ( !isNode( prev ) ) {
                break;
            }
            yield prev.item;
            node = prev;
        }
    }

    forEach( fn: ( item: T, i: number, list: LinkedList<T> ) => unknown, thisArg?: any ): void {
        let i = 0;
        for ( const item of this ) {
            fn.call( thisArg, item, i, this );
            i++;
        }
    }

    getFirst( ): Node<T> | undefined {
        return this.getNext( this.head );
    }

    getLast( ): Node<T> | undefined {
        return this.getPrev( this.tail );
    }

    getPrev( next: Next<T> ): Node<T> | undefined {
        const node = next.prev;
        return ( isNode( node ) ? node : undefined );
    }

    getNext( prev: Prev<T> ): Node<T> | undefined {
        const node = prev.next;
        return ( isNode( node ) ? node : undefined );
    }

    addFirst( item: T ): Node<T> {
        return this.addAfter( item, this.head );
    }

    addLast( item: T ): Node<T> {
        return this.addBefore( item, this.tail );
    }

    addBefore( item: T, next: Next<T> ): Node<T> {
        return this.addAfter( item, next.prev );
    }

    addAfter( item: T, prev: Prev<T> ): Node<T> {
        const next = prev.next;
        const node = { prev, next, item };
        prev.next = node;
        next.prev = node;
        return node;
    }

    moveFirst( node: Node<T> ): void {
        this.moveAfter( node, this.head );
    }

    moveLast( node: Node<T> ): void {
        this.moveBefore( node, this.tail );
    }

    moveBefore( node: Node<T>, next: Next<T> ): void {
        if ( node !== next ) {
            // Remove before computing the destination, in case the destination is adjacent to node
            this.doRemove( node );
            const prev = next.prev;
            node.prev = prev;
            node.next = next;
            prev.next = node;
            next.prev = node;
        }
    }

    moveAfter( node: Node<T>, prev: Prev<T> ): void {
        if ( node !== prev ) {
            // Remove before computing the destination, in case the destination is adjacent to node
            this.doRemove( node );
            const next = prev.next;
            node.prev = prev;
            node.next = next;
            prev.next = node;
            next.prev = node;
        }
    }

    remove( node: Node<T> ): Node<T> | undefined {
        return this.doRemove( node );
    }

    removeFirst( ): Node<T> | undefined {
        return this.doRemove( this.head.next );
    }

    removeLast( ): Node<T> | undefined {
        return this.doRemove( this.tail.prev );
    }

    removeBefore( next: Next<T> ): Node<T> | undefined {
        return this.doRemove( next.prev );
    }

    removeAfter( prev: Prev<T> ): Node<T> | undefined {
        return this.doRemove( prev.next );
    }

    protected doRemove( node: PossibleNode<T> ): Node<T> | undefined {
        if ( !isNode( node ) ) {
            return undefined;
        }
        else {
            const { prev, next } = node;
            prev.next = next;
            next.prev = prev;
            node.prev = { next: node };
            node.next = { prev: node };
            return node;
        }
    }

    removeAll( ): void {
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
}

export interface ReadableLinkedSet<T> extends ReadonlySet<T> {
    readonly [Symbol.toStringTag]: string;
    valuesInReverse( ): IterableIterator<T>;
    valueBefore( item: T | undefined ): T | undefined;
    valueAfter( item: T | undefined ): T | undefined;
}

export class LinkedSet<T> implements Set<T>, ReadableLinkedSet<T> {
    protected readonly map: Map<T,Node<T>>;
    protected readonly list: LinkedList<T>;

    constructor( items?: Iterable<T> ) {
        this.map = new Map( );
        this.list = new LinkedList( );
        if ( items ) {
            for ( const item of items ) {
                this.addLast( item );
            }
        }
    }

    get [Symbol.toStringTag]( ): string {
        return '[object LinkedSet]';
    }

    get size( ): number {
        return this.map.size;
    }

    has( item: T ): boolean {
        return this.map.has( item );
    }

    [Symbol.iterator]( ): IterableIterator<T> {
        return this.values( );
    }

    *entries( ): IterableIterator<[T,T]> {
        for ( const item of this.values( ) ) {
            yield [ item, item ];
        }
    }

    keys( ): IterableIterator<T> {
        return this.values( );
    }

    values( ): IterableIterator<T> {
        return this.list[Symbol.iterator]( );
    }

    valuesInReverse( ): IterableIterator<T> {
        return this.list.itemsInReverse( );
    }

    valueBefore( item: T | undefined ): T | undefined {
        const next = requireDefined( item === undefined ? this.list.tail : this.map.get( item ) );
        return this.list.getPrev( next )?.item;
    }

    valueAfter( item: T | undefined ): T | undefined {
        const prev = requireDefined( item === undefined ? this.list.head : this.map.get( item ) );
        return this.list.getNext( prev )?.item;
    }

    forEach( fn: ( item: T, item2: T, set: Set<T> ) => void, thisArg?: any ): void {
        for ( const item of this ) {
            fn.call( thisArg, item, item, this );
        }
    }

    add( item: T ): this {
        this.addLast( item, false );
        return this;
    }

    delete( item: T ): boolean {
        const node = this.map.get( item );
        if ( node ) {
            this.map.delete( item );
            this.list.remove( node );
            return true;
        }
        else {
            return false;
        }
    }

    clear( ): void {
        this.map.clear( );
        this.list.removeAll( );
    }

    addFirst( item: T, move: boolean = true ): void {
        let node = this.map.get( item );
        if ( node ) {
            if ( move ) {
                this.list.moveFirst( node );
            }
        }
        else {
            node = this.list.addFirst( item );
            this.map.set( item, node );
        }
    }

    addLast( item: T, move: boolean = true ): void {
        let node = this.map.get( item );
        if ( node ) {
            if ( move ) {
                this.list.moveLast( node );
            }
        }
        else {
            node = this.list.addLast( item );
            this.map.set( item, node );
        }
    }

    addBefore( item: T, nextItem: T | undefined, move: boolean = true ): void {
        let node = this.map.get( item );
        if ( node ) {
            if ( move ) {
                const next = ( nextItem === undefined ? this.list.tail : this.map.get( nextItem ) );
                if ( next ) {
                    this.list.moveBefore( node, next );
                }
                else {
                    this.list.moveFirst( node );
                }
            }
        }
        else {
            const next = ( nextItem === undefined ? this.list.tail : this.map.get( nextItem ) );
            if ( next ) {
                node = this.list.addBefore( item, next );
            }
            else {
                node = this.list.addFirst( item );
            }
            this.map.set( item, node );
        }
    }

    addAfter( item: T, prevItem: T | undefined, move: boolean = true ): void {
        let node = this.map.get( item );
        if ( node ) {
            if ( move ) {
                const prev = ( prevItem === undefined ? this.list.head : this.map.get( prevItem ) );
                if ( prev ) {
                    this.list.moveAfter( node, prev );
                }
                else {
                    this.list.moveLast( node );
                }
            }
        }
        else {
            const prev = ( prevItem === undefined ? this.list.head : this.map.get( prevItem ) );
            if ( prev ) {
                node = this.list.addAfter( item, prev );
            }
            else {
                node = this.list.addLast( item );
            }
            this.map.set( item, node );
        }
    }

    moveFirst( item: T ): void {
        let node = this.map.get( item );
        if ( node ) {
            this.list.moveFirst( node );
        }
    }

    moveLast( item: T ): void {
        let node = this.map.get( item );
        if ( node ) {
            this.list.moveLast( node );
        }
    }

    moveBefore( item: T, nextItem: T | undefined ): void {
        let node = this.map.get( item );
        if ( node ) {
            const next = ( nextItem === undefined ? this.list.tail : this.map.get( nextItem ) );
            if ( next ) {
                this.list.moveBefore( node, next );
            }
            else {
                this.list.moveFirst( node );
            }
        }
    }

    moveAfter( item: T, prevItem: T | undefined ): void {
        let node = this.map.get( item );
        if ( node ) {
            const prev = ( prevItem === undefined ? this.list.head : this.map.get( prevItem ) );
            if ( prev ) {
                this.list.moveAfter( node, prev );
            }
            else {
                this.list.moveLast( node );
            }
        }
    }

    removeFirst( ): T | undefined {
        const node = this.list.removeFirst( );
        return this.doRemoveFromMap( node );
    }

    removeLast( ): T | undefined {
        const node = this.list.removeLast( );
        return this.doRemoveFromMap( node );
    }

    removeBefore( nextItem: T | undefined ): T | undefined {
        const next = ( nextItem === undefined ? this.list.tail : this.map.get( nextItem ) );
        if ( next ) {
            const node = this.list.removeBefore( next );
            return this.doRemoveFromMap( node );
        }
        else {
            return undefined;
        }
    }

    removeAfter( prevItem: T | undefined ): T | undefined {
        const prev = ( prevItem === undefined ? this.list.head : this.map.get( prevItem ) );
        if ( prev ) {
            const node = this.list.removeAfter( prev );
            return this.doRemoveFromMap( node );
        }
        else {
            return undefined;
        }
    }

    protected doRemoveFromMap( node: Node<T> | undefined ): T | undefined {
        if ( node ) {
            this.map.delete( node.item );
            return node.item;
        }
        else {
            return undefined;
        }
    }
}

export interface ReadableLinkedMap<K,V> extends ReadonlyMap<K,V> {
    readonly [Symbol.toStringTag]: string;
    entriesInReverse( ): IterableIterator<[K,V]>;
    entryBefore( key: K | undefined ): [K,V] | undefined;
    entryAfter( key: K | undefined ): [K,V] | undefined;
    keysInReverse( ): IterableIterator<K>;
    keyBefore( key: K | undefined ): K | undefined;
    keyAfter( key: K | undefined ): K | undefined;
    valuesInReverse( ): IterableIterator<V>;
    valueBefore( key: K | undefined ): V | undefined;
    valueAfter( key: K | undefined ): V | undefined;
}

export class LinkedMap<K,V> implements Map<K,V>, ReadableLinkedMap<K,V> {
    protected readonly map: Map<K,Node<[K,V]>>;
    protected readonly list: LinkedList<[K,V]>;

    constructor( entries?: Iterable<[K,V]> ) {
        this.map = new Map( );
        this.list = new LinkedList( );
        if ( entries ) {
            for ( const en of entries ) {
                this.putLast( en[0], en[1] );
            }
        }
    }

    get [Symbol.toStringTag]( ): string {
        return '[object LinkedMap]';
    }

    get size( ): number {
        return this.map.size;
    }

    has( key: K ): boolean {
        return this.map.has( key );
    }

    get( key: K ): V | undefined {
        return this.map.get( key )?.item[1];
    }

    [Symbol.iterator]( ): IterableIterator<[K,V]> {
        return this.entries( );
    }

    entries( ): IterableIterator<[K,V]> {
        return this.list[Symbol.iterator]( );
    }

    entriesInReverse( ): IterableIterator<[K,V]> {
        return this.list.itemsInReverse( );
    }

    entryBefore( key: K | undefined ): [K,V] | undefined {
        const next = requireDefined( key === undefined ? this.list.tail : this.map.get( key ) );
        return this.list.getPrev( next )?.item;
    }

    entryAfter( key: K | undefined ): [K,V] | undefined {
        const prev = requireDefined( key === undefined ? this.list.head : this.map.get( key ) );
        return this.list.getNext( prev )?.item;
    }

    *keys( ): IterableIterator<K> {
        for ( const en of this.list ) {
            yield en[0];
        }
    }

    *keysInReverse( ): IterableIterator<K> {
        for ( const en of this.list.itemsInReverse( ) ) {
            yield en[0];
        }
    }

    keyBefore( key: K | undefined ): K | undefined {
        return this.entryBefore( key )?.[0];
    }

    keyAfter( key: K | undefined ): K | undefined {
        return this.entryAfter( key )?.[0];
    }

    *values( ): IterableIterator<V> {
        for ( const en of this.list ) {
            yield en[1];
        }
    }

    *valuesInReverse( ): IterableIterator<V> {
        for ( const en of this.list.itemsInReverse( ) ) {
            yield en[1];
        }
    }

    valueBefore( key: K | undefined ): V | undefined {
        return this.entryBefore( key )?.[1];
    }

    valueAfter( key: K | undefined ): V | undefined {
        return this.entryAfter( key )?.[1];
    }

    forEach( fn: ( value: V, key: K, map: Map<K,V> ) => void, thisArg?: any ): void {
        for ( const item of this ) {
            fn.call( thisArg, item[1], item[0], this );
        }
    }

    set( key: K, value: V ): this {
        this.putLast( key, value, false );
        return this;
    }

    delete( key: K ): boolean {
        const node = this.map.get( key );
        if ( node ) {
            this.map.delete( key );
            this.list.remove( node );
            return true;
        }
        else {
            return false;
        }
    }

    clear( ): void {
        this.map.clear( );
        this.list.removeAll( );
    }

    putFirst( key: K, value: V, move: boolean = true ): void {
        let node = this.map.get( key );
        if ( node ) {
            node.item[1] = value;
            if ( move ) {
                this.list.moveFirst( node );
            }
        }
        else {
            node = this.list.addFirst( [ key, value ] );
            this.map.set( key, node );
        }
    }

    putLast( key: K, value: V, move: boolean = true ): void {
        let node = this.map.get( key );
        if ( node ) {
            node.item[1] = value;
            if ( move ) {
                this.list.moveLast( node );
            }
        }
        else {
            node = this.list.addLast( [ key, value ] );
            this.map.set( key, node );
        }
    }

    putBefore( key: K, value: V, nextKey: K | undefined, move: boolean = true ): void {
        let node = this.map.get( key );
        if ( node ) {
            node.item[1] = value;
            if ( move ) {
                const next = ( nextKey === undefined ? this.list.tail : this.map.get( nextKey ) );
                if ( next ) {
                    this.list.moveBefore( node, next );
                }
                else {
                    this.list.moveFirst( node );
                }
            }
        }
        else {
            const next = ( nextKey === undefined ? this.list.tail : this.map.get( nextKey ) );
            if ( next ) {
                node = this.list.addBefore( [ key, value ], next );
            }
            else {
                node = this.list.addFirst( [ key, value ] );
            }
            this.map.set( key, node );
        }
    }

    putAfter( key: K, value: V, prevKey: K | undefined, move: boolean = true ): void {
        let node = this.map.get( key );
        if ( node ) {
            node.item[1] = value;
            if ( move ) {
                const prev = ( prevKey === undefined ? this.list.head : this.map.get( prevKey ) );
                if ( prev ) {
                    this.list.moveAfter( node, prev );
                }
                else {
                    this.list.moveLast( node );
                }
            }
        }
        else {
            const prev = ( prevKey === undefined ? this.list.head : this.map.get( prevKey ) );
            if ( prev ) {
                node = this.list.addAfter( [ key, value ], prev );
            }
            else {
                node = this.list.addLast( [ key, value ] );
            }
            this.map.set( key, node );
        }
    }

    moveFirst( key: K ): void {
        let node = this.map.get( key );
        if ( node ) {
            this.list.moveFirst( node );
        }
    }

    moveLast( key: K ): void {
        let node = this.map.get( key );
        if ( node ) {
            this.list.moveLast( node );
        }
    }

    moveBefore( key: K, nextKey: K | undefined ): void {
        let node = this.map.get( key );
        if ( node ) {
            const next = ( nextKey === undefined ? this.list.tail : this.map.get( nextKey ) );
            if ( next ) {
                this.list.moveBefore( node, next );
            }
            else {
                this.list.moveFirst( node );
            }
        }
    }

    moveAfter( key: K, prevKey: K | undefined ): void {
        let node = this.map.get( key );
        if ( node ) {
            const prev = ( prevKey === undefined ? this.list.head : this.map.get( prevKey ) );
            if ( prev ) {
                this.list.moveAfter( node, prev );
            }
            else {
                this.list.moveLast( node );
            }
        }
    }

    removeFirst( ): V | undefined {
        const node = this.list.removeFirst( );
        return this.doRemoveFromMap( node );
    }

    removeLast( ): V | undefined {
        const node = this.list.removeLast( );
        return this.doRemoveFromMap( node );
    }

    removeBefore( nextKey: K | undefined ): V | undefined {
        const next = ( nextKey === undefined ? this.list.tail : this.map.get( nextKey ) );
        if ( next ) {
            const node = this.list.removeBefore( next );
            return this.doRemoveFromMap( node );
        }
        else {
            return undefined;
        }
    }

    removeAfter( prevKey: K | undefined ): V | undefined {
        const prev = ( prevKey === undefined ? this.list.head : this.map.get( prevKey ) );
        if ( prev ) {
            const node = this.list.removeAfter( prev );
            return this.doRemoveFromMap( node );
        }
        else {
            return undefined;
        }
    }

    protected doRemoveFromMap( node: Node<[K,V]> | undefined ): V | undefined {
        if ( node ) {
            this.map.delete( node.item[0] );
            return node.item[1];
        }
        else {
            return undefined;
        }
    }
}

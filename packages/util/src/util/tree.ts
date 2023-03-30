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
import { Comparator } from './misc';

export interface ReadableTreeSet<T extends C,C=T> extends ReadonlySet<T> {
    getRoot( ): ReadableAaNode<T> | undefined;
    valuesInReverse( ): IterableIterator<T>;
    valueBefore( item: C ): T | undefined;
    valueAtOrBefore( item: C ): T | undefined;
    valueAfter( item: C ): T | undefined;
    valueAtOrAfter( item: C ): T | undefined;
}

export interface TreeSet<T extends C,C=T> extends Set<T>, ReadableTreeSet<T,C> {
    forEach( fn: ( item: T, item2: T, set: Set<T> ) => void, thisArg?: any ): void;
}

/**
 * https://en.wikipedia.org/wiki/AA_tree
 */
export class AaTreeSet<T extends C,C=T> implements TreeSet<T,C> {
    readonly compareItems: Comparator<C>;
    protected root: AaNode<T> | undefined;
    protected _size: number;

    constructor( compareItems: Comparator<C> ) {
        this.compareItems = compareItems;
        this.root = undefined;
        this._size = 0;
    }

    get [Symbol.toStringTag]( ): string {
        return '[object AaTreeSet]';
    }

    get size( ): number {
        return this._size;
    }

    has( item: C ): boolean {
        return ( find( this.root, item, this.compareItems ) !== undefined );
    }

    getRoot( ): ReadableAaNode<T> | undefined {
        return this.root;
    }

    valueBefore( item: C ): T | undefined {
        return findBefore( this.root, item, this.compareItems )?.item;
    }

    valueAtOrBefore( item: C ): T | undefined {
        return findAtOrBefore( this.root, item, this.compareItems )?.item;
    }

    valueAfter( item: C ): T | undefined {
        return findAfter( this.root, item, this.compareItems )?.item;
    }

    valueAtOrAfter( item: C ): T | undefined {
        return findAtOrAfter( this.root, item, this.compareItems )?.item;
    }

    [Symbol.iterator]( ): IterableIterator<T> {
        return this.values( );
    }

    *entries( ): IterableIterator<[T,T]> {
        for ( const item of this.values( ) ) {
            yield [ item, item ];
        }
    }

    *entriesInReverse( ): IterableIterator<[T,T]> {
        for ( const item of this.valuesInReverse( ) ) {
            yield [ item, item ];
        }
    }

    keys( ): IterableIterator<T> {
        return this.values( );
    }

    keysInReverse( ): IterableIterator<T> {
        return this.valuesInReverse( );
    }

    *values( ): IterableIterator<T> {
        for ( const { item } of nodesInOrder( this.root ) ) {
            yield item;
        }
    }

    *valuesInReverse( ): IterableIterator<T> {
        for ( const { item } of nodesInReverse( this.root ) ) {
            yield item;
        }
    }

    forEach( fn: ( item: T, item2: T, set: Set<T> ) => void, thisArg?: any ): void {
        for ( const item of this ) {
            fn.call( thisArg, item, item, this );
        }
    }

    add( item: T ): this {
        const update = addIfAbsent( this.root, item, this.compareItems );
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return this;
    }

    delete( item: T ): boolean {
        const update = removeIfPresent( this.root, item, this.compareItems );
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return ( update.sizeDelta !== 0 );
    }

    clear( ): void {
        this.root = undefined;
        this._size = 0;
    }

    /**
     * O(n). Intended for debugging.
     */
    computeDepth( ): number {
        return computeTreeDepth( this.root );
    }

    /**
     * Intended for debugging.
     */
    format( formatItem: ( item: T ) => string ): string {
        return formatTree( this.root, formatItem );
    }
}

export interface ReadableTreeMap<K extends C,V,C=K> extends ReadonlyMap<K,V> {
    getRoot( ): ReadableAaNode<[K,V]> | undefined;
    keysInReverse( ): IterableIterator<K>;
    valuesInReverse( ): IterableIterator<V>;
    entriesInReverse( ): IterableIterator<[K,V]>;
    keyBefore( key: C ): K | undefined;
    keyAtOrBefore( key: C ): K | undefined;
    keyAfter( key: C ): K | undefined;
    keyAtOrAfter( key: C ): K | undefined;
    valueBefore( key: C ): V | undefined;
    valueAtOrBefore( key: C ): V | undefined;
    valueAfter( key: C ): V | undefined;
    valueAtOrAfter( key: C ): V | undefined;
    entryBefore( key: C ): [K,V] | undefined;
    entryAtOrBefore( key: C ): [K,V] | undefined;
    entryAfter( key: C ): [K,V] | undefined;
    entryAtOrAfter( key: C ): [K,V] | undefined;
}

export interface TreeMap<K extends C,V,C=K> extends Map<K,V>, ReadableTreeMap<K,V,C> {
    forEach( fn: ( value: V, key: K, map: Map<K,V> ) => void, thisArg?: any ): void;
}

/**
 * https://en.wikipedia.org/wiki/AA_tree
 */
export class AaTreeMap<K extends C,V,C=K> implements TreeMap<K,V,C> {
    readonly compareKeys: Comparator<C>;
    protected readonly compareEntries: Comparator<[C,unknown]>;
    protected root: AaNode<[K,V]> | undefined;
    protected _size: number;

    constructor( compareKeys: Comparator<C> ) {
        this.compareKeys = compareKeys;
        this.compareEntries = ( a, b ) => {
            return compareKeys( a[0], b[0] );
        };
        this.root = undefined;
        this._size = 0;
    }

    get [Symbol.toStringTag]( ): string {
        return '[object AaTreeMap]';
    }

    get size( ): number {
        return this._size;
    }

    has( key: C ): boolean {
        return ( this.entry( key ) !== undefined );
    }

    get( key: C ): V | undefined {
        return this.entry( key )?.[1];
    }

    getRoot( ): ReadableAaNode<[K,V]> | undefined {
        return this.root;
    }

    [Symbol.iterator]( ): IterableIterator<[K,V]> {
        return this.entries( );
    }

    *entries( ): IterableIterator<[K,V]> {
        for ( const { item } of nodesInOrder( this.root ) ) {
            yield item;
        }
    }

    *entriesInReverse( ): IterableIterator<[K,V]> {
        for ( const { item } of nodesInReverse( this.root ) ) {
            yield item;
        }
    }

    entry( key: C ): [K,V] | undefined {
        const en: [C,unknown] = [ key, undefined ];
        return find( this.root, en, this.compareEntries )?.item;
    }

    entryBefore( key: C ): [K,V] | undefined {
        const en: [C,unknown] = [ key, undefined ];
        return findBefore( this.root, en, this.compareEntries )?.item;
    }

    entryAtOrBefore( key: C ): [K,V] | undefined {
        const en: [C,unknown] = [ key, undefined ];
        return findAtOrBefore( this.root, en, this.compareEntries )?.item;
    }

    entryAfter( key: C ): [K,V] | undefined {
        const en: [C,unknown] = [ key, undefined ];
        return findAfter( this.root, en, this.compareEntries )?.item;
    }

    entryAtOrAfter( key: C ): [K,V] | undefined {
        const en: [C,unknown] = [ key, undefined ];
        return findAtOrAfter( this.root, en, this.compareEntries )?.item;
    }

    *keys( ): IterableIterator<K> {
        for ( const en of this.entries( ) ) {
            yield en[0];
        }
    }

    *keysInReverse( ): IterableIterator<K> {
        for ( const en of this.entriesInReverse( ) ) {
            yield en[0];
        }
    }

    keyBefore( key: C ): K | undefined {
        return this.entryBefore( key )?.[0];
    }

    keyAtOrBefore( key: C ): K | undefined {
        return this.entryAtOrBefore( key )?.[0];
    }

    keyAfter( key: C ): K | undefined {
        return this.entryAfter( key )?.[0];
    }

    keyAtOrAfter( key: C ): K | undefined {
        return this.entryAtOrAfter( key )?.[0];
    }

    *values( ): IterableIterator<V> {
        for ( const en of this.entries( ) ) {
            yield en[1];
        }
    }

    *valuesInReverse( ): IterableIterator<V> {
        for ( const en of this.entriesInReverse( ) ) {
            yield en[1];
        }
    }

    valueBefore( key: C ): V | undefined {
        return this.entryBefore( key )?.[1];
    }

    valueAtOrBefore( key: C ): V | undefined {
        return this.entryAtOrBefore( key )?.[1];
    }

    valueAfter( key: C ): V | undefined {
        return this.entryAfter( key )?.[1];
    }

    valueAtOrAfter( key: C ): V | undefined {
        return this.entryAtOrAfter( key )?.[1];
    }

    forEach( fn: ( value: V, key: K, map: Map<K,V> ) => void, thisArg?: any ): void {
        for ( const item of this ) {
            fn.call( thisArg, item[1], item[0], this );
        }
    }

    set( key: K, value: V ): this {
        const en: [K,V] = [ key, value ];
        const update = addIfAbsent( this.root, en, this.compareEntries );
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return this;
    }

    delete( key: C ): boolean {
        const en: [C,unknown] = [ key, undefined ];
        const update = removeIfPresent( this.root, en, this.compareEntries );
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return ( update.sizeDelta !== 0 );
    }

    clear( ): void {
        this.root = undefined;
        this._size = 0;
    }

    /**
     * O(n). Intended for debugging.
     */
    computeDepth( ): number {
        return computeTreeDepth( this.root );
    }

    /**
     * Intended for debugging.
     */
    format( formatEntry: ( en: [K,V] ) => string ): string {
        return formatTree( this.root, formatEntry );
    }
}

export interface ReadableAaNode<T> {
    readonly item: T;
    readonly level: number;
    readonly left: ReadableAaNode<T> | undefined;
    readonly right: ReadableAaNode<T> | undefined;
}

export interface AaNode<T> {
    item: T;
    level: number;
    left: AaNode<T> | undefined;
    right: AaNode<T> | undefined;
}

export function* nodesInOrder<T>( root: ReadableAaNode<T> | undefined ): IterableIterator<ReadableAaNode<T>> {
    if ( root ) {
        yield* nodesInOrder( root.left );
        yield root;
        yield* nodesInOrder( root.right );
    }
}

export function* nodesInReverse<T>( root: ReadableAaNode<T> | undefined ): IterableIterator<ReadableAaNode<T>> {
    if ( root ) {
        yield* nodesInOrder( root.right );
        yield root;
        yield* nodesInOrder( root.left );
    }
}

function find<T extends U,U>( root: ReadableAaNode<T> | undefined, item: U, compare: Comparator<U> ): ReadableAaNode<T> | undefined {
    if ( !root ) {
        return undefined;
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            return find( root.left, item, compare );
        }
        else if ( comparison > 0 ) {
            return find( root.right, item, compare );
        }
        else {
            return root;
        }
    }
}

function findBefore<T extends U,U>( root: ReadableAaNode<T> | undefined, item: U, compare: Comparator<U> ): ReadableAaNode<T> | undefined {
    if ( !root ) {
        return undefined;
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison <= 0 ) {
            return findBefore( root.left, item, compare );
        }
        else {
            return ( findBefore( root.right, item, compare ) ?? root );
        }
    }
}

function findAtOrBefore<T extends U,U>( root: ReadableAaNode<T> | undefined, item: U, compare: Comparator<U> ): ReadableAaNode<T> | undefined {
    if ( !root ) {
        return undefined;
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            return findAtOrBefore( root.left, item, compare );
        }
        else if ( comparison > 0 ) {
            return ( findAtOrBefore( root.right, item, compare ) ?? root );
        }
        else {
            return root;
        }
    }
}

function findAfter<T extends U,U>( root: ReadableAaNode<T> | undefined, item: U, compare: Comparator<U> ): ReadableAaNode<T> | undefined {
    if ( !root ) {
        return undefined;
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            return ( findAfter( root.left, item, compare ) ?? root );
        }
        else {
            return findAfter( root.right, item, compare );
        }
    }
}

function findAtOrAfter<T extends U,U>( root: ReadableAaNode<T> | undefined, item: U, compare: Comparator<U> ): ReadableAaNode<T> | undefined {
    if ( !root ) {
        return undefined;
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            return ( findAtOrAfter( root.left, item, compare ) ?? root );
        }
        else if ( comparison > 0 ) {
            return findAtOrAfter( root.right, item, compare );
        }
        else {
            return root;
        }
    }
}

/**
 * O(n)
 */
function computeTreeDepth( root: ReadableAaNode<unknown> | undefined, parentDepth: number = 0 ): number {
    if ( !root ) {
        return parentDepth;
    }
    else {
        return Math.max(
            computeTreeDepth( root.left, parentDepth+1 ),
            computeTreeDepth( root.right, parentDepth+1 ),
        );
    }
}

function* nodesWithDepths<T>( root: ReadableAaNode<T> | undefined, rootDepth: number = 1 ): IterableIterator<{ node: ReadableAaNode<T>, depth: number }> {
    if ( root ) {
        const rightDepth = ( root.right?.level === root.level ? rootDepth : rootDepth+1 );
        yield* nodesWithDepths( root.right, rightDepth );

        yield { node: root, depth: rootDepth };

        const leftDepth = ( root.left?.level === root.level ? rootDepth : rootDepth+1 );
        yield* nodesWithDepths( root.left, leftDepth );
    }
}

function formatTree<T>( root: ReadableAaNode<T> | undefined, formatItem: ( item: T ) => string ): string {
    const lines = new Array<string>( );
    for ( const { node, depth } of nodesWithDepths( root ) ) {
        lines.push( depth.toFixed(0) + ': ' + ' '.repeat( depth ) + formatItem( node.item ) + '(' + node.level + ')' );
    }
    return lines.join( '\n' );
}

interface TreeUpdate<T> {
    newRoot: AaNode<T> | undefined;
    sizeDelta: number;
}

function addIfAbsent<T extends U,U>( root: AaNode<T> | undefined, item: T, compare: Comparator<U> ): TreeUpdate<T> {
    if ( !root ) {
        return {
            newRoot: {
                item,
                level: 1,
                left: undefined,
                right: undefined,
            },
            sizeDelta: +1,
        };
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            const leftUpdate = addIfAbsent( root.left, item, compare );
            root.left = leftUpdate.newRoot;
            return {
                newRoot: rebalanceAfterAdd( root ),
                sizeDelta: leftUpdate.sizeDelta,
            }
        }
        else if ( comparison > 0 ) {
            const rightUpdate = addIfAbsent( root.right, item, compare );
            root.right = rightUpdate.newRoot;
            return {
                newRoot: rebalanceAfterAdd( root ),
                sizeDelta: rightUpdate.sizeDelta,
            };
        }
        else {
            return {
                newRoot: root,
                sizeDelta: 0,
            };
        }
    }
}

function rebalanceAfterAdd<T>( root: AaNode<T> ): AaNode<T> {
    return split( skew( root ) );
}

function removeIfPresent<T extends U,U>( root: AaNode<T> | undefined, item: U, compare: Comparator<U> ): TreeUpdate<T> {
    if ( !root ) {
        return {
            newRoot: root,
            sizeDelta: 0,
        };
    }
    else {
        const comparison = compare( item, root.item );
        if ( comparison < 0 ) {
            const leftUpdate = removeIfPresent( root.left, item, compare );
            root.left = leftUpdate.newRoot;
            return {
                newRoot: rebalanceAfterRemove( root ),
                sizeDelta: leftUpdate.sizeDelta,
            };
        }
        else if ( comparison > 0 ) {
            const rightUpdate = removeIfPresent( root.right, item, compare );
            root.right = rightUpdate.newRoot;
            return {
                newRoot: rebalanceAfterRemove( root ),
                sizeDelta: rightUpdate.sizeDelta,
            };
        }
        else if ( root.left ) {
            const prev = rightmostDescendant( root.left );
            const leftUpdate = removeIfPresent( root.left, prev.item, compare );
            root.left = leftUpdate.newRoot;
            root.item = prev.item;
            return {
                newRoot: rebalanceAfterRemove( root ),
                sizeDelta: leftUpdate.sizeDelta,
            };
        }
        else if ( root.right ) {
            const next = leftmostDescendant( root.right );
            const rightUpdate = removeIfPresent( root.right, next.item, compare );
            root.right = rightUpdate.newRoot;
            root.item = next.item;
            return {
                newRoot: rebalanceAfterRemove( root ),
                sizeDelta: rightUpdate.sizeDelta,
            };
        }
        else {
            return {
                newRoot: undefined,
                sizeDelta: -1,
            };
        }
    }
}

function rebalanceAfterRemove<T>( root: AaNode<T> ): AaNode<T> {
    const level = Math.min( root.left?.level ?? 0, root.right?.level ?? 0 ) + 1;
    if ( root.level > level ) {
        root.level = level;
        if ( root.right && root.right.level > level ) {
            root.right.level = level;
        }
    }

    root = skew( root );
    if ( root ) {
        root.right = skew( root.right );
        if ( root.right ) {
            root.right.right = skew( root.right.right );
        }
    }

    root = split( root );
    if ( root ) {
        root.right = split( root.right );
    }

    return root;
}

function leftmostDescendant<T>( node: ReadableAaNode<T> ): ReadableAaNode<T> {
    return ( node.left ? leftmostDescendant( node.left ) : node );
}

function rightmostDescendant<T>( node: ReadableAaNode<T> ): ReadableAaNode<T> {
    return ( node.right ? rightmostDescendant( node.right ) : node );
}

/**
 *        |        |
 *    L — T   =>   L — T
 *   / \   \      /   / \
 *  A   B   R    A   B   R
 */
function skew<T>( root: undefined ): undefined;
function skew<T>( root: AaNode<T> ): AaNode<T>;
function skew<T>( root: AaNode<T> | undefined ): AaNode<T> | undefined;
function skew<T>( root: AaNode<T> | undefined ): AaNode<T> | undefined {
    if ( root && root.left && root.left.level === root.level ) {
        const left = root.left;
        root.left = left.right;
        left.right = root;
        return left;
    }
    else {
        return root;
    }
}

/**
 *
 *    |                  |
 *    T — R — X   =>     R
 *   /   /              / \
 *  A   B              T   X
 *                    / \
 *                   A   B
 */
function split<T>( root: undefined ): undefined;
function split<T>( root: AaNode<T> ): AaNode<T>;
function split<T>( root: AaNode<T> | undefined ): AaNode<T> | undefined;
function split<T>( root: AaNode<T> | undefined ): AaNode<T> | undefined {
    if ( root && root.right && root.right.right && root.right.right.level === root.level ) {
        const right = root.right;
        root.right = right.left;
        right.left = root;
        right.level++;
        return right;
    }
    else {
        return root;
    }
}

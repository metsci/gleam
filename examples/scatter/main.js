(function (factory) {
typeof define === 'function' && define.amd ? define(factory) :
factory();
})((function () { 'use strict';

/*!
 * @metsci/gleam-util
 *
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
const NOOP = () => undefined;
const alwaysTrue = (v) => true;

function run(fn) {
    return fn();
}

const get$1 = run;
function requireTrue(t, test) {
    if (!test(t)) {
        throw new Error();
    }
    else {
        return t;
    }
}

function isNumber(x) {
    return (typeof (x) === 'number' && !Number.isNaN(x));
}
function atMost(a) {
    return v => (v <= a);
}

function numberOr(x, fallback) {
    return (isNumber(x) ? x : fallback);
}
function isUndefined(t) {
    return (typeof (t) === 'undefined');
}
function isDefined(t) {
    return (typeof (t) !== 'undefined');
}
function requireDefined(t) {
    if (isUndefined(t)) {
        throw new Error();
    }
    else {
        return t;
    }
}
function requireNonNull(t) {
    if (t === null) {
        throw new Error();
    }
    else {
        return t;
    }
}
function isNonNullish(t) {
    return (typeof (t) !== 'undefined' && t !== null);
}
function isNullish(t) {
    return (typeof (t) === 'undefined' || t === null);
}
function requireNonNullish(t) {
    if (isNullish(t)) {
        throw new Error();
    }
    else {
        return t;
    }
}

function trunc$1(v) {
    return (v | 0);
}
function arrayClone(array) {
    return array.slice(0);
}
function arrayClear(array) {
    array.splice(0, array.length);
}
function arrayRemoveFirst(array, value) {
    let i = array.indexOf(value);
    if (i === -1) {
        return null;
    }
    else {
        array.splice(i, 1);
        return i;
    }
}
function arrayRemoveLast(array, value) {
    let i = array.lastIndexOf(value);
    if (i === -1) {
        return null;
    }
    else {
        array.splice(i, 1);
        return i;
    }
}

function arraySortStable(array, compare) {
    
    const indices = new Map();
    for (let i = 0; i < array.length; i++) {
        indices.set(array[i], i);
    }
    array.sort((a, b) => {
        
        const primaryComparison = compare(a, b);
        if (primaryComparison !== 0) {
            return primaryComparison;
        }
        
        const aIndex = requireDefined(indices.get(a));
        const bIndex = requireDefined(indices.get(b));
        const indexComparison = aIndex - bIndex;
        if (indexComparison !== 0) {
            return indexComparison;
        }
        
        return 0;
    });
}
function arrayReverseIterable(array) {
    return {
        [Symbol.iterator]() {
            return arrayReverseIterator(array);
        }
    };
}
function arrayReverseIterator(array) {
    let i = array.length;
    return {
        next() {
            i--;
            return {
                done: (i < 0),
                value: array[i]
            };
        }
    };
}
function* mapIterable(iterable, fn) {
    for (const a of iterable) {
        yield fn(a);
    }
}
function* multiIterable(...iterables) {
    for (const iterable of iterables) {
        for (const value of iterable) {
            yield value;
        }
    }
}
function mapRequire(map, key) {
    
    
    if (!map.has(key)) {
        throw new Error('Map does not contain key: ' + key);
    }
    return map.get(key);
}
function mapSetIfAbsent(map, key, createValueFn) {
    if (!map.has(key)) {
        map.set(key, createValueFn());
    }
    return map.get(key);
}
function mapAdd(map, key, value) {
    if (map.has(key)) {
        throw new Error('Map already contains key: ' + key);
    }
    map.set(key, value);
    return () => {
        map.delete(key);
    };
}
function requireEqual(a, b, equator = tripleEquals) {
    if (!equator(a, b)) {
        throw new Error();
    }
    else {
        return a;
    }
}
function arrayAllEqual(a, b, itemEquator = tripleEquals) {
    if (a === b) {
        return true;
    }
    else if (a === null || b === null) {
        return false;
    }
    else if (a.length !== b.length) {
        return false;
    }
    else {
        const n = a.length;
        for (let i = 0; i < n; i++) {
            if (!itemEquator(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
}
function tripleEquals(a, b) {
    return (a === b);
}
function clamp(xMin, xMax, x) {
    return Math.max(xMin, Math.min(xMax, x));
}

const dataView64 = new DataView(new ArrayBuffer(8));
function increment64(dataView64) {
    const hi32 = dataView64.getUint32(0);
    const lo32 = dataView64.getUint32(4);
    dataView64.setUint32(4, lo32 + 1);
    if (lo32 === 0xFFFFFFFF) {
        dataView64.setUint32(0, hi32 + 1);
    }
}
function decrement64(dataView64) {
    const hi32 = dataView64.getUint32(0);
    const lo32 = dataView64.getUint32(4);
    dataView64.setUint32(4, lo32 - 1);
    if (lo32 === 0x00000000) {
        dataView64.setUint32(0, hi32 - 1);
    }
}
function nextUpFloat64(v) {
    if (Number.isNaN(v) || v === Number.POSITIVE_INFINITY) {
        return v;
    }
    else if (v === 0) {
        return +Number.MIN_VALUE;
    }
    else {
        dataView64.setFloat64(0, v);
        if (v < 0) {
            decrement64(dataView64);
        }
        else {
            increment64(dataView64);
        }
        return dataView64.getFloat64(0);
    }
}
function nextDownFloat64(v) {
    if (Number.isNaN(v) || v === Number.NEGATIVE_INFINITY) {
        return v;
    }
    else if (v === 0) {
        return -Number.MIN_VALUE;
    }
    else {
        dataView64.setFloat64(0, v);
        if (v < 0) {
            increment64(dataView64);
        }
        else {
            decrement64(dataView64);
        }
        return dataView64.getFloat64(0);
    }
}
function findIndexOf(sorted, missFn) {
    let a = 0;
    let b = sorted.length - 1;
    while (a <= b) {
        const pivot = trunc$1((a + b) / 2);
        const miss = missFn(sorted[pivot]);
        if (miss < 0) {
            a = pivot + 1;
        }
        else if (miss > 0) {
            b = pivot - 1;
        }
        else {
            return pivot;
        }
    }
    return -(a + 1);
}
function findIndexNearest(sorted, missFn) {
    const i = findIndexOf(sorted, missFn);
    
    if (i >= 0) {
        return i;
    }
    
    const iAfter = -i - 1;
    const iBefore = iAfter - 1;
    if (iAfter >= sorted.length) {
        return iBefore;
    }
    if (iBefore < 0) {
        return iAfter;
    }
    const missAfter = missFn(sorted[iAfter]);
    const missBefore = missFn(sorted[iBefore]);
    return (Math.abs(missAfter) <= Math.abs(missBefore) ? iAfter : iBefore);
}
function findIndexAfter(sorted, missFn) {
    const i = findIndexOf(sorted, missFn);
    
    if (i < 0) {
        return (-i - 1);
    }
    
    let n = sorted.length;
    for (let j = i + 1; j < n; j++) {
        if (missFn(sorted[j]) > 0) {
            return j;
        }
    }
    return n;
}
function findIndexAtOrAfter(sorted, missFn) {
    const i = findIndexOf(sorted, missFn);
    
    if (i < 0) {
        return (-i - 1);
    }
    
    for (let j = i; j > 0; j--) {
        if (missFn(sorted[j - 1]) < 0) {
            return j;
        }
    }
    return 0;
}
function findIndexBefore(sorted, missFn) {
    return findIndexAtOrAfter(sorted, missFn) - 1;
}
function findIndexAtOrBefore(sorted, missFn) {
    return findIndexAfter(sorted, missFn) - 1;
}

class CowArray {
    constructor(vs = []) {
        this.current = vs;
        const _this = this;
        this.inReverse = {
            [Symbol.iterator]() {
                return _this.reverseIterator();
            }
        };
    }
    modify(modify) {
        const vs = arrayClone(this.current);
        const result = modify(vs);
        this.current = vs;
        return result;
    }
    [Symbol.iterator]() {
        return this.current[Symbol.iterator]();
    }
    reverseIterator() {
        return arrayReverseIterator(this.current);
    }
    entries() {
        return this.current.entries();
    }
    keys() {
        return this.current.keys();
    }
    values() {
        return this.current.values();
    }
    get length() {
        return this.current.length;
    }
    set length(length) {
        this.modify(vs => (vs.length = length));
    }
    clear() {
        this.modify(vs => arrayClear(vs));
    }
    get(i) {
        return this.current[i];
    }
    set(i, v) {
        return this.modify(vs => (vs[i] = v));
    }
    push(v) {
        return this.modify(vs => vs.push(v));
    }
    pop() {
        return this.modify(vs => vs.pop());
    }
    shift() {
        return this.modify(vs => vs.shift());
    }
    unshift(...items) {
        return this.modify(vs => vs.unshift(...items));
    }
    splice(start, deleteCount, ...items) {
        return new CowArray(this.modify(vs => vs.splice(start, deleteCount, ...items)));
    }
    
    findIndexOf(missFn) {
        return findIndexOf(this.current, missFn);
    }
    
    findIndexNearest(missFn) {
        return findIndexNearest(this.current, missFn);
    }
    
    findIndexAfter(missFn) {
        return findIndexAfter(this.current, missFn);
    }
    
    findIndexAtOrAfter(missFn) {
        return findIndexAtOrAfter(this.current, missFn);
    }
    
    findIndexBefore(missFn) {
        return findIndexBefore(this.current, missFn);
    }
    
    findIndexAtOrBefore(missFn) {
        return findIndexAtOrBefore(this.current, missFn);
    }
    sort(compareFn) {
        this.modify(vs => vs.sort(compareFn));
        return this;
    }
    sortStable(compareFn) {
        this.modify(vs => arraySortStable(vs, compareFn));
        return this;
    }
    removeFirst(v) {
        return this.modify(vs => arrayRemoveFirst(vs, v));
    }
    removeLast(v) {
        return this.modify(vs => arrayRemoveLast(vs, v));
    }
    reverse() {
        this.modify(vs => vs.reverse());
        return this;
    }
    fill(v, start, end) {
        this.modify(vs => vs.fill(v, start, end));
        return this;
    }
    copyWithin(target, start, end) {
        this.modify(vs => vs.copyWithin(target, start, end));
        return this;
    }
    
    forEach(fn, thisArg) {
        return this.current.forEach(fn, thisArg);
    }
    
    map(fn, thisArg) {
        return new CowArray(this.current.map(fn, thisArg));
    }
    filter(fn, thisArg) {
        return new CowArray(this.current.filter(fn, thisArg));
    }
    reduce(fn, init) {
        return this.current.reduce(fn, init);
    }
    reduceRight(fn, init) {
        return this.current.reduceRight(fn, init);
    }
    find(fn, thisArg) {
        return this.current.find(fn, thisArg);
    }
    
    findIndex(fn, thisArg) {
        return this.current.findIndex(fn, thisArg);
    }
    indexOf(v, fromIndex) {
        return this.current.indexOf(v, fromIndex);
    }
    lastIndexOf(v, fromIndex) {
        return this.current.lastIndexOf(v, fromIndex);
    }
    includes(v, fromIndex) {
        return this.current.includes(v, fromIndex);
    }
    concat(...items) {
        return new CowArray(this.current.concat(...items));
    }
    join(separator) {
        return this.current.join(separator);
    }
    slice(start, end) {
        return new CowArray(this.current.slice(start, end));
    }
    
    every(fn, thisArg) {
        return this.current.every(fn, thisArg);
    }
    
    some(fn, thisArg) {
        return this.current.some(fn, thisArg);
    }
    toString() {
        return this.current.toString();
    }
    toLocaleString() {
        return this.current.toLocaleString();
    }
}

function isNode(x) {
    const { prev, next } = x;
    return (!!prev && !!next);
}
class LinkedList {
    constructor(items) {
        this.head = { next: undefined };
        this.tail = { prev: undefined };
        this.head.next = this.tail;
        this.tail.prev = this.head;
        if (items) {
            for (const item of items) {
                this.addLast(item);
            }
        }
    }
    *[Symbol.iterator]() {
        let node = this.head;
        while (true) {
            const next = node.next;
            if (!isNode(next)) {
                break;
            }
            yield next.item;
            node = next;
        }
    }
    *itemsInReverse() {
        let node = this.tail;
        while (true) {
            const prev = node.prev;
            if (!isNode(prev)) {
                break;
            }
            yield prev.item;
            node = prev;
        }
    }
    forEach(fn, thisArg) {
        let i = 0;
        for (const item of this) {
            fn.call(thisArg, item, i, this);
            i++;
        }
    }
    getFirst() {
        return this.getNext(this.head);
    }
    getLast() {
        return this.getPrev(this.tail);
    }
    getPrev(next) {
        const node = next.prev;
        return (isNode(node) ? node : undefined);
    }
    getNext(prev) {
        const node = prev.next;
        return (isNode(node) ? node : undefined);
    }
    addFirst(item) {
        return this.addAfter(item, this.head);
    }
    addLast(item) {
        return this.addBefore(item, this.tail);
    }
    addBefore(item, next) {
        return this.addAfter(item, next.prev);
    }
    addAfter(item, prev) {
        const next = prev.next;
        const node = { prev, next, item };
        prev.next = node;
        next.prev = node;
        return node;
    }
    moveFirst(node) {
        this.moveAfter(node, this.head);
    }
    moveLast(node) {
        this.moveBefore(node, this.tail);
    }
    moveBefore(node, next) {
        if (node !== next) {
            
            this.doRemove(node);
            const prev = next.prev;
            node.prev = prev;
            node.next = next;
            prev.next = node;
            next.prev = node;
        }
    }
    moveAfter(node, prev) {
        if (node !== prev) {
            
            this.doRemove(node);
            const next = prev.next;
            node.prev = prev;
            node.next = next;
            prev.next = node;
            next.prev = node;
        }
    }
    remove(node) {
        return this.doRemove(node);
    }
    removeFirst() {
        return this.doRemove(this.head.next);
    }
    removeLast() {
        return this.doRemove(this.tail.prev);
    }
    removeBefore(next) {
        return this.doRemove(next.prev);
    }
    removeAfter(prev) {
        return this.doRemove(prev.next);
    }
    doRemove(node) {
        if (!isNode(node)) {
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
    removeAll() {
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
}
class LinkedSet {
    constructor(items) {
        this.map = new Map();
        this.list = new LinkedList();
        if (items) {
            for (const item of items) {
                this.addLast(item);
            }
        }
    }
    get [Symbol.toStringTag]() {
        return '[object LinkedSet]';
    }
    get size() {
        return this.map.size;
    }
    has(item) {
        return this.map.has(item);
    }
    [Symbol.iterator]() {
        return this.values();
    }
    *entries() {
        for (const item of this.values()) {
            yield [item, item];
        }
    }
    keys() {
        return this.values();
    }
    values() {
        return this.list[Symbol.iterator]();
    }
    valuesInReverse() {
        return this.list.itemsInReverse();
    }
    valueBefore(item) {
        var _a;
        const next = requireDefined(item === undefined ? this.list.tail : this.map.get(item));
        return (_a = this.list.getPrev(next)) === null || _a === void 0 ? void 0 : _a.item;
    }
    valueAfter(item) {
        var _a;
        const prev = requireDefined(item === undefined ? this.list.head : this.map.get(item));
        return (_a = this.list.getNext(prev)) === null || _a === void 0 ? void 0 : _a.item;
    }
    forEach(fn, thisArg) {
        for (const item of this) {
            fn.call(thisArg, item, item, this);
        }
    }
    add(item) {
        this.addLast(item, false);
        return this;
    }
    delete(item) {
        const node = this.map.get(item);
        if (node) {
            this.map.delete(item);
            this.list.remove(node);
            return true;
        }
        else {
            return false;
        }
    }
    clear() {
        this.map.clear();
        this.list.removeAll();
    }
    addFirst(item, move = true) {
        let node = this.map.get(item);
        if (node) {
            if (move) {
                this.list.moveFirst(node);
            }
        }
        else {
            node = this.list.addFirst(item);
            this.map.set(item, node);
        }
    }
    addLast(item, move = true) {
        let node = this.map.get(item);
        if (node) {
            if (move) {
                this.list.moveLast(node);
            }
        }
        else {
            node = this.list.addLast(item);
            this.map.set(item, node);
        }
    }
    addBefore(item, nextItem, move = true) {
        let node = this.map.get(item);
        if (node) {
            if (move) {
                const next = (nextItem === undefined ? this.list.tail : this.map.get(nextItem));
                if (next) {
                    this.list.moveBefore(node, next);
                }
                else {
                    this.list.moveFirst(node);
                }
            }
        }
        else {
            const next = (nextItem === undefined ? this.list.tail : this.map.get(nextItem));
            if (next) {
                node = this.list.addBefore(item, next);
            }
            else {
                node = this.list.addFirst(item);
            }
            this.map.set(item, node);
        }
    }
    addAfter(item, prevItem, move = true) {
        let node = this.map.get(item);
        if (node) {
            if (move) {
                const prev = (prevItem === undefined ? this.list.head : this.map.get(prevItem));
                if (prev) {
                    this.list.moveAfter(node, prev);
                }
                else {
                    this.list.moveLast(node);
                }
            }
        }
        else {
            const prev = (prevItem === undefined ? this.list.head : this.map.get(prevItem));
            if (prev) {
                node = this.list.addAfter(item, prev);
            }
            else {
                node = this.list.addLast(item);
            }
            this.map.set(item, node);
        }
    }
    moveFirst(item) {
        let node = this.map.get(item);
        if (node) {
            this.list.moveFirst(node);
        }
    }
    moveLast(item) {
        let node = this.map.get(item);
        if (node) {
            this.list.moveLast(node);
        }
    }
    moveBefore(item, nextItem) {
        let node = this.map.get(item);
        if (node) {
            const next = (nextItem === undefined ? this.list.tail : this.map.get(nextItem));
            if (next) {
                this.list.moveBefore(node, next);
            }
            else {
                this.list.moveFirst(node);
            }
        }
    }
    moveAfter(item, prevItem) {
        let node = this.map.get(item);
        if (node) {
            const prev = (prevItem === undefined ? this.list.head : this.map.get(prevItem));
            if (prev) {
                this.list.moveAfter(node, prev);
            }
            else {
                this.list.moveLast(node);
            }
        }
    }
    removeFirst() {
        const node = this.list.removeFirst();
        return this.doRemoveFromMap(node);
    }
    removeLast() {
        const node = this.list.removeLast();
        return this.doRemoveFromMap(node);
    }
    removeBefore(nextItem) {
        const next = (nextItem === undefined ? this.list.tail : this.map.get(nextItem));
        if (next) {
            const node = this.list.removeBefore(next);
            return this.doRemoveFromMap(node);
        }
        else {
            return undefined;
        }
    }
    removeAfter(prevItem) {
        const prev = (prevItem === undefined ? this.list.head : this.map.get(prevItem));
        if (prev) {
            const node = this.list.removeAfter(prev);
            return this.doRemoveFromMap(node);
        }
        else {
            return undefined;
        }
    }
    doRemoveFromMap(node) {
        if (node) {
            this.map.delete(node.item);
            return node.item;
        }
        else {
            return undefined;
        }
    }
}
class LinkedMap {
    constructor(entries) {
        this.map = new Map();
        this.list = new LinkedList();
        if (entries) {
            for (const en of entries) {
                this.putLast(en[0], en[1]);
            }
        }
    }
    get [Symbol.toStringTag]() {
        return '[object LinkedMap]';
    }
    get size() {
        return this.map.size;
    }
    has(key) {
        return this.map.has(key);
    }
    get(key) {
        var _a;
        return (_a = this.map.get(key)) === null || _a === void 0 ? void 0 : _a.item[1];
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    entries() {
        return this.list[Symbol.iterator]();
    }
    entriesInReverse() {
        return this.list.itemsInReverse();
    }
    entryBefore(key) {
        var _a;
        const next = requireDefined(key === undefined ? this.list.tail : this.map.get(key));
        return (_a = this.list.getPrev(next)) === null || _a === void 0 ? void 0 : _a.item;
    }
    entryAfter(key) {
        var _a;
        const prev = requireDefined(key === undefined ? this.list.head : this.map.get(key));
        return (_a = this.list.getNext(prev)) === null || _a === void 0 ? void 0 : _a.item;
    }
    *keys() {
        for (const en of this.list) {
            yield en[0];
        }
    }
    *keysInReverse() {
        for (const en of this.list.itemsInReverse()) {
            yield en[0];
        }
    }
    keyBefore(key) {
        var _a;
        return (_a = this.entryBefore(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    keyAfter(key) {
        var _a;
        return (_a = this.entryAfter(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    *values() {
        for (const en of this.list) {
            yield en[1];
        }
    }
    *valuesInReverse() {
        for (const en of this.list.itemsInReverse()) {
            yield en[1];
        }
    }
    valueBefore(key) {
        var _a;
        return (_a = this.entryBefore(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    valueAfter(key) {
        var _a;
        return (_a = this.entryAfter(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    forEach(fn, thisArg) {
        for (const item of this) {
            fn.call(thisArg, item[1], item[0], this);
        }
    }
    set(key, value) {
        this.putLast(key, value, false);
        return this;
    }
    delete(key) {
        const node = this.map.get(key);
        if (node) {
            this.map.delete(key);
            this.list.remove(node);
            return true;
        }
        else {
            return false;
        }
    }
    clear() {
        this.map.clear();
        this.list.removeAll();
    }
    putFirst(key, value, move = true) {
        let node = this.map.get(key);
        if (node) {
            node.item[1] = value;
            if (move) {
                this.list.moveFirst(node);
            }
        }
        else {
            node = this.list.addFirst([key, value]);
            this.map.set(key, node);
        }
    }
    putLast(key, value, move = true) {
        let node = this.map.get(key);
        if (node) {
            node.item[1] = value;
            if (move) {
                this.list.moveLast(node);
            }
        }
        else {
            node = this.list.addLast([key, value]);
            this.map.set(key, node);
        }
    }
    putBefore(key, value, nextKey, move = true) {
        let node = this.map.get(key);
        if (node) {
            node.item[1] = value;
            if (move) {
                const next = (nextKey === undefined ? this.list.tail : this.map.get(nextKey));
                if (next) {
                    this.list.moveBefore(node, next);
                }
                else {
                    this.list.moveFirst(node);
                }
            }
        }
        else {
            const next = (nextKey === undefined ? this.list.tail : this.map.get(nextKey));
            if (next) {
                node = this.list.addBefore([key, value], next);
            }
            else {
                node = this.list.addFirst([key, value]);
            }
            this.map.set(key, node);
        }
    }
    putAfter(key, value, prevKey, move = true) {
        let node = this.map.get(key);
        if (node) {
            node.item[1] = value;
            if (move) {
                const prev = (prevKey === undefined ? this.list.head : this.map.get(prevKey));
                if (prev) {
                    this.list.moveAfter(node, prev);
                }
                else {
                    this.list.moveLast(node);
                }
            }
        }
        else {
            const prev = (prevKey === undefined ? this.list.head : this.map.get(prevKey));
            if (prev) {
                node = this.list.addAfter([key, value], prev);
            }
            else {
                node = this.list.addLast([key, value]);
            }
            this.map.set(key, node);
        }
    }
    moveFirst(key) {
        let node = this.map.get(key);
        if (node) {
            this.list.moveFirst(node);
        }
    }
    moveLast(key) {
        let node = this.map.get(key);
        if (node) {
            this.list.moveLast(node);
        }
    }
    moveBefore(key, nextKey) {
        let node = this.map.get(key);
        if (node) {
            const next = (nextKey === undefined ? this.list.tail : this.map.get(nextKey));
            if (next) {
                this.list.moveBefore(node, next);
            }
            else {
                this.list.moveFirst(node);
            }
        }
    }
    moveAfter(key, prevKey) {
        let node = this.map.get(key);
        if (node) {
            const prev = (prevKey === undefined ? this.list.head : this.map.get(prevKey));
            if (prev) {
                this.list.moveAfter(node, prev);
            }
            else {
                this.list.moveLast(node);
            }
        }
    }
    removeFirst() {
        const node = this.list.removeFirst();
        return this.doRemoveFromMap(node);
    }
    removeLast() {
        const node = this.list.removeLast();
        return this.doRemoveFromMap(node);
    }
    removeBefore(nextKey) {
        const next = (nextKey === undefined ? this.list.tail : this.map.get(nextKey));
        if (next) {
            const node = this.list.removeBefore(next);
            return this.doRemoveFromMap(node);
        }
        else {
            return undefined;
        }
    }
    removeAfter(prevKey) {
        const prev = (prevKey === undefined ? this.list.head : this.map.get(prevKey));
        if (prev) {
            const node = this.list.removeAfter(prev);
            return this.doRemoveFromMap(node);
        }
        else {
            return undefined;
        }
    }
    doRemoveFromMap(node) {
        if (node) {
            this.map.delete(node.item[0]);
            return node.item[1];
        }
        else {
            return undefined;
        }
    }
}

function dispose(disposer) {
    if (typeof disposer === 'function') {
        disposer();
    }
    else {
        disposer.dispose();
    }
}
class DisposerGroup {
    constructor() {
        this.members = new LinkedSet();
    }
    add(disposer) {
        this.members.add(disposer);
    }
    dispose() {
        for (const member of [...this.members.valuesInReverse()]) {
            this.members.delete(member);
            dispose(member);
        }
    }
}
class DisposerGroupMap {
    constructor() {
        this.groups = new LinkedMap();
    }
    get(key) {
        if (!this.groups.has(key)) {
            const disposers = new DisposerGroup();
            this.groups.set(key, disposers);
            disposers.add(() => {
                if (this.groups.get(key) === disposers) {
                    this.groups.delete(key);
                }
            });
        }
        return requireDefined(this.groups.get(key));
    }
    disposeFor(key) {
        var _a;
        (_a = this.groups.get(key)) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    dispose() {
        for (const key of [...this.groups.keysInReverse()]) {
            this.disposeFor(key);
        }
    }
    
    get _size() {
        return this.groups.size;
    }
    
    _has(key) {
        return this.groups.has(key);
    }
    
    _keys() {
        return this.groups.keys();
    }
}

const { round: round$1 } = Math;
function appendChild(parent, child) {
    parent.appendChild(child);
    return () => {
        parent.removeChild(child);
    };
}
function createCssLink(url) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url.href;
    return link;
}
function appendCssLink(parent, cssLink) {
    const disposers = new DisposerGroup();
    disposers.add(appendChild(parent, cssLink));
    const [loadingPromise, loadingDisposer] = createCssLoadingPromise(cssLink);
    disposers.add(loadingDisposer);
    return { loading: loadingPromise, disposers };
}
function createCssLoadingPromise(cssLink) {
    const disposers = new DisposerGroup();
    const promise = new Promise((resolve, reject) => {
        let settled = false;
        disposers.add(onCssLoaded(cssLink, () => {
            if (!settled) {
                settled = true;
                resolve(cssLink);
            }
        }));
        disposers.add(() => {
            if (!settled) {
                settled = true;
                reject({ reason: 'DISPOSED', href: cssLink.href });
            }
        });
    });
    return [promise, disposers];
}

function onCssLoaded(cssLink, callback) {
    const millisBetweenPolls = 10;
    const pollsBeforeWarning = 500;
    let pollsSoFar = 0;
    const doPoll = () => {
        var _a;
        try {
            if ((_a = cssLink.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
                if (pollsSoFar >= pollsBeforeWarning) {
                    console.log(`CSS load completed after ${round$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href);
                }
                return true;
            }
            else {
                pollsSoFar++;
                if (pollsSoFar === pollsBeforeWarning) {
                    console.warn(`Still waiting for CSS to load after ${round$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href);
                }
                return false;
            }
        }
        catch (e) {
            pollsSoFar++;
            if (pollsSoFar === pollsBeforeWarning) {
                console.warn(`Still waiting for CSS to load after ${round$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href, '\n ', e);
            }
            return false;
        }
    };
    if (doPoll()) {
        callback();
        return NOOP;
    }
    else {
        const interval = setInterval(() => {
            if (doPoll()) {
                callback();
                clearInterval(interval);
            }
        }, millisBetweenPolls);
        return () => {
            clearInterval(interval);
        };
    }
}

const { floor: floor$1, round: round$2 } = Math;

function wrapNear(value, ref, wrapSpan) {
    return (ref + wrapDelta(value - ref, wrapSpan));
}

function wrapDelta(delta, wrapSpan) {
    const wrapCount = round$2(delta / wrapSpan);
    return (delta - (wrapCount * wrapSpan));
}

const { asin, atan2, cos: cos$1, PI: PI$1, sign, sin: sin$1, sqrt } = Math;
const X3 = Object.freeze([1, 0, 0]);
Object.freeze([0, 1, 0]);
const Z3 = Object.freeze([0, 0, 1]);
function toUnitSphereXyz(lat_RAD, lon_RAD) {
    const sinLat = sin$1(lat_RAD);
    const cosLat = cos$1(lat_RAD);
    const sinLon = sin$1(lon_RAD);
    const cosLon = cos$1(lon_RAD);
    return [
        cosLat * cosLon,
        cosLat * sinLon,
        sinLat,
    ];
}
function fromUnitSphereXyz([x, y, z]) {
    const lat_RAD = atan2(z, sqrt(x * x + y * y));
    const lon_RAD = atan2(y, x);
    return [lat_RAD, lon_RAD];
}
function getGreatCircleNormal(A, B) {
    const N = normalize3(cross3(A, B));
    if (N) {
        
        return N;
    }
    else {
        
        const AoB = dot3(A, B);
        if (AoB > 0) {
            
            return undefined;
        }
        else {
            
            const ZxA = normalize3(cross3(Z3, A));
            if (ZxA) {
                
                return normalize3(cross3(A, ZxA));
            }
            else {
                
                return X3;
            }
        }
    }
}
function norm3(v) {
    return sqrt(normSquared3(v));
}
function normSquared3([x, y, z]) {
    return (x * x + y * y + z * z);
}
function dot3(a, b) {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    return (ax * bx + ay * by + az * bz);
}
function cross3(a, b) {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    return [
        ay * bz - az * by,
        az * bx - ax * bz,
        ax * by - ay * bx,
    ];
}
function normalize3(v) {
    const norm = norm3(v);
    return (norm === 0 ? undefined : scale3(v, 1.0 / norm));
}
function scale3([x, y, z], scaleFactor) {
    return [
        scaleFactor * x,
        scaleFactor * y,
        scaleFactor * z,
    ];
}

const { acos, atan, cos, log, exp, PI, sin } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;
const HALF_PI = 0.5 * PI;
const DEG_TO_RAD = PI / 180.0;
const RAD_TO_DEG = 180.0 / PI;
class EquirectNormalCylindricalProjection {
    
    constructor(originLon_RAD = 0.0, radToX = 1.0, radToY = radToX) {
        this.originLon_RAD = originLon_RAD;
        this.radToX = radToX;
        this.radToY = radToY;
        this.compatibleCrsKeys = new Set([
            'EPSG:4326',
            'EPSG:4087',
            'EPSG:32662',
            'EPSG:32663',
            'EPSG:54001',
        ]);
        this.name = `Equirect[ rad-to-x=${this.radToX}, rad-to-y=${this.radToY}, x-origin=${this.originLon_RAD * this.radToX} ]`;
        this.desc = Object.freeze({
            type: 'Equirect',
            params: [originLon_RAD, radToX, radToY],
        });
        this.xSpan = 2 * PI * this.radToX;
        this.minUsableY = -HALF_PI * this.radToY;
        this.maxUsableY = +HALF_PI * this.radToY;
        this.xToRad = 1.0 / this.radToX;
        this.yToRad = 1.0 / this.radToY;
    }
    xToLon_RAD(x) {
        const x_RAD = x * this.xToRad;
        return (this.originLon_RAD + x_RAD);
    }
    lonToX(lon_RAD) {
        const x_RAD = lon_RAD - this.originLon_RAD;
        return (x_RAD * this.radToX);
    }
    yToLat_RAD(y) {
        const y_RAD = y * this.yToRad;
        return y_RAD;
    }
    latToY(lat_RAD) {
        const y_RAD = lat_RAD;
        return y_RAD * this.radToY;
    }
    getDLatDY_RAD(y) {
        return this.yToRad;
    }
    maxDLatDY_RAD() {
        return this.yToRad;
    }
}
class MercatorNormalCylindricalProjection {
    
    constructor(originLon_RAD = 0.0, yCutoff = PI) {
        this.originLon_RAD = originLon_RAD;
        this.yCutoff = yCutoff;
        this.compatibleCrsKeys = new Set([
            'EPSG:3857',
            'EPSG:3395',
            'EPSG:3785',
            'EPSG:900913',
            'ESRI:102100',
            'ESRI:102113',
            'OSGEO:41001',
        ]);
        this.name = `Mercator[ lon-origin=${this.originLon_RAD}\u00B0, y-interval=[-${this.yCutoff},+${this.yCutoff}] ]`;
        this.desc = Object.freeze({
            type: 'Mercator',
            params: [originLon_RAD, yCutoff],
        });
        this.xSpan = 2 * PI;
        this.minUsableY = -1.0 * this.yCutoff;
        this.maxUsableY = +1.0 * this.yCutoff;
    }
    xToLon_RAD(x) {
        return (this.originLon_RAD + x);
    }
    lonToX(lon_RAD) {
        return (lon_RAD - this.originLon_RAD);
    }
    yToLat_RAD(y) {
        return ((2.0 * atan(exp(y))) - HALF_PI);
    }
    latToY(lat_RAD) {
        return log((sin(lat_RAD) + 1.0) / cos(lat_RAD));
    }
    getDLatDY_RAD(y) {
        const expY = exp(y);
        return ((2.0 * expY) / (1.0 + expY * expY));
    }
    maxDLatDY_RAD(yMin, yMax) {
        if (yMin === undefined) {
            yMin = NEGATIVE_INFINITY;
        }
        if (yMax === undefined) {
            yMax = POSITIVE_INFINITY;
        }
        
        
        
        if (yMin <= 0.0 && 0.0 <= yMax) {
            
            
            return 1.0;
        }
        else if (yMin > 0.0) {
            
            return this.getDLatDY_RAD(yMin);
        }
        else {
            
            return this.getDLatDY_RAD(yMax);
        }
    }
}
new EquirectNormalCylindricalProjection(0.0, 1.0);
new EquirectNormalCylindricalProjection(0.0, RAD_TO_DEG);
const MERCATOR_PROJ = new MercatorNormalCylindricalProjection(0.0);
var LatLon;
(function (LatLon) {
    function fromRad(lat_RAD, lon_RAD) {
        return { lat_RAD, lon_RAD };
    }
    LatLon.fromRad = fromRad;
    function fromDeg(lat_DEG, lon_DEG) {
        return fromRad(lat_DEG * DEG_TO_RAD, lon_DEG * DEG_TO_RAD);
    }
    LatLon.fromDeg = fromDeg;
})(LatLon || (LatLon = {}));
Object.freeze({
    desc: {
        type: 'SphericalGreatCircle',
    },
    getInterpFn: (A, B) => {
        const xyzA = toUnitSphereXyz(A.lat_RAD, A.lon_RAD);
        const xyzB = toUnitSphereXyz(B.lat_RAD, B.lon_RAD);
        const distAB_RAD = acos(clamp(-1, +1, dot3(xyzA, xyzB)));
        const N = getGreatCircleNormal(xyzA, xyzB);
        if (!N || distAB_RAD < 1e-8) {
            
            return (fracAB) => {
                return (fracAB <= 0.5 ? A : B);
            };
        }
        const [Nx, Ny, Nz] = N;
        const getXyzOnAB = (fracAB) => {
            const [x, y, z] = xyzA;
            const dist_RAD = distAB_RAD * fracAB;
            const sinD = sin(dist_RAD);
            const cosD = cos(dist_RAD);
            return [
                (x * (cosD + Nx * Nx * (1 - cosD))) + (y * (Nx * Ny * (1 - cosD) - Nz * sinD)) + (z * (Nx * Nz * (1 - cosD) + Ny * sinD)),
                (x * (Nx * Ny * (1 - cosD) + Nz * sinD)) + (y * (cosD + Ny * Ny * (1 - cosD))) + (z * (Ny * Nz * (1 - cosD) - Nx * sinD)),
                (x * (Nx * Nz * (1 - cosD) - Ny * sinD)) + (y * (Ny * Nz * (1 - cosD) + Nx * sinD)) + (z * (cosD + Nz * Nz * (1 - cosD))),
            ];
        };
        return (fracAB) => {
            const xyz = getXyzOnAB(fracAB);
            const [lat_RAD, lon_RAD] = fromUnitSphereXyz(xyz);
            return { lat_RAD, lon_RAD };
        };
    },
});
Object.freeze({
    desc: {
        type: 'SphericalRhumbLine',
    },
    getInterpFn: (A, B) => {
        
        const [xA, yA] = latLonToXy(MERCATOR_PROJ, A);
        const [xRawB, yB] = latLonToXy(MERCATOR_PROJ, B);
        const xB = wrapNear(xRawB, xA, MERCATOR_PROJ.xSpan);
        return (fracAB) => {
            const x = xA + fracAB * (xB - xA);
            const y = yA + fracAB * (yB - yA);
            return xyToLatLon(MERCATOR_PROJ, [x, y]);
        };
    },
});
function latLonToXy(proj, p) {
    return [
        proj.lonToX(p.lon_RAD),
        proj.latToY(p.lat_RAD),
    ];
}
function xyToLatLon(proj, xy) {
    const [x, y] = xy;
    return {
        lat_RAD: proj.yToLat_RAD(y),
        lon_RAD: proj.xToLon_RAD(x),
    };
}

var DELETE = 'delete';


var SHIFT = 5; 
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;



var NOT_SET = {};


function MakeRef() {
  return { value: false };
}

function SetRef(ref) {
  if (ref) {
    ref.value = true;
  }
}




function OwnerID() {}

function ensureSize(iter) {
  if (iter.size === undefined) {
    iter.size = iter.__iterate(returnTrue);
  }
  return iter.size;
}

function wrapIndex(iter, index) {
  
  
  
  
  
  
  
  if (typeof index !== 'number') {
    var uint32Index = index >>> 0; 
    if ('' + uint32Index !== index || uint32Index === 4294967295) {
      return NaN;
    }
    index = uint32Index;
  }
  return index < 0 ? ensureSize(iter) + index : index;
}

function returnTrue() {
  return true;
}

function wholeSlice(begin, end, size) {
  return (
    ((begin === 0 && !isNeg(begin)) ||
      (size !== undefined && begin <= -size)) &&
    (end === undefined || (size !== undefined && end >= size))
  );
}

function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
  
  
  return index === undefined
    ? defaultIndex
    : isNeg(index)
    ? size === Infinity
      ? size
      : Math.max(0, size + index) | 0
    : size === undefined || size === index
    ? index
    : Math.min(size, index) | 0;
}

function isNeg(value) {
  
  return value < 0 || (value === 0 && 1 / value === -Infinity);
}

var IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

function isCollection(maybeCollection) {
  return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
}

var IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

function isKeyed(maybeKeyed) {
  return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
}

var IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

function isIndexed(maybeIndexed) {
  return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
}

function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

var Collection = function Collection(value) {
  return isCollection(value) ? value : Seq(value);
};

var KeyedCollection = /*@__PURE__*/(function (Collection) {
  function KeyedCollection(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }

  if ( Collection ) KeyedCollection.__proto__ = Collection;
  KeyedCollection.prototype = Object.create( Collection && Collection.prototype );
  KeyedCollection.prototype.constructor = KeyedCollection;

  return KeyedCollection;
}(Collection));

var IndexedCollection = /*@__PURE__*/(function (Collection) {
  function IndexedCollection(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }

  if ( Collection ) IndexedCollection.__proto__ = Collection;
  IndexedCollection.prototype = Object.create( Collection && Collection.prototype );
  IndexedCollection.prototype.constructor = IndexedCollection;

  return IndexedCollection;
}(Collection));

var SetCollection = /*@__PURE__*/(function (Collection) {
  function SetCollection(value) {
    return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
  }

  if ( Collection ) SetCollection.__proto__ = Collection;
  SetCollection.prototype = Object.create( Collection && Collection.prototype );
  SetCollection.prototype.constructor = SetCollection;

  return SetCollection;
}(Collection));

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;

var IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

function isSeq(maybeSeq) {
  return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
}

var IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

function isRecord(maybeRecord) {
  return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
}

function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}

var IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

function isOrdered(maybeOrdered) {
  return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
}

var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;

var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

var Iterator = function Iterator(next) {
  this.next = next;
};

Iterator.prototype.toString = function toString () {
  return '[Iterator]';
};

Iterator.KEYS = ITERATE_KEYS;
Iterator.VALUES = ITERATE_VALUES;
Iterator.ENTRIES = ITERATE_ENTRIES;

Iterator.prototype.inspect = Iterator.prototype.toSource = function () {
  return this.toString();
};
Iterator.prototype[ITERATOR_SYMBOL] = function () {
  return this;
};

function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult
    ? (iteratorResult.value = value)
    : (iteratorResult = {
        value: value,
        done: false,
      });
  return iteratorResult;
}

function iteratorDone() {
  return { value: undefined, done: true };
}

function hasIterator(maybeIterable) {
  if (Array.isArray(maybeIterable)) {
    
    return true;
  }

  return !!getIteratorFn(maybeIterable);
}

function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

function getIterator(iterable) {
  var iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  var iteratorFn =
    iterable &&
    ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function isEntriesIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

function isKeysIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isArrayLike(value) {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  return (
    value &&
    typeof value === 'object' &&
    Number.isInteger(value.length) &&
    value.length >= 0 &&
    (value.length === 0
      ? 
        Object.keys(value).length === 1
      : 
        
        value.hasOwnProperty(value.length - 1))
  );
}

var Seq = /*@__PURE__*/(function (Collection) {
  function Seq(value) {
    return value === undefined || value === null
      ? emptySequence()
      : isImmutable(value)
      ? value.toSeq()
      : seqFromValue(value);
  }

  if ( Collection ) Seq.__proto__ = Collection;
  Seq.prototype = Object.create( Collection && Collection.prototype );
  Seq.prototype.constructor = Seq;

  Seq.prototype.toSeq = function toSeq () {
    return this;
  };

  Seq.prototype.toString = function toString () {
    return this.__toString('Seq {', '}');
  };

  Seq.prototype.cacheResult = function cacheResult () {
    if (!this._cache && this.__iterateUncached) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  };

  

  Seq.prototype.__iterate = function __iterate (fn, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      while (i !== size) {
        var entry = cache[reverse ? size - ++i : i++];
        if (fn(entry[1], entry[0], this) === false) {
          break;
        }
      }
      return i;
    }
    return this.__iterateUncached(fn, reverse);
  };

  

  Seq.prototype.__iterator = function __iterator (type, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var entry = cache[reverse ? size - ++i : i++];
        return iteratorValue(type, entry[0], entry[1]);
      });
    }
    return this.__iteratorUncached(type, reverse);
  };

  return Seq;
}(Collection));

var KeyedSeq = /*@__PURE__*/(function (Seq) {
  function KeyedSeq(value) {
    return value === undefined || value === null
      ? emptySequence().toKeyedSeq()
      : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
      ? value.toSeq()
      : keyedSeqFromValue(value);
  }

  if ( Seq ) KeyedSeq.__proto__ = Seq;
  KeyedSeq.prototype = Object.create( Seq && Seq.prototype );
  KeyedSeq.prototype.constructor = KeyedSeq;

  KeyedSeq.prototype.toKeyedSeq = function toKeyedSeq () {
    return this;
  };

  return KeyedSeq;
}(Seq));

var IndexedSeq = /*@__PURE__*/(function (Seq) {
  function IndexedSeq(value) {
    return value === undefined || value === null
      ? emptySequence()
      : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
      ? value.toSeq().entrySeq()
      : indexedSeqFromValue(value);
  }

  if ( Seq ) IndexedSeq.__proto__ = Seq;
  IndexedSeq.prototype = Object.create( Seq && Seq.prototype );
  IndexedSeq.prototype.constructor = IndexedSeq;

  IndexedSeq.of = function of () {
    return IndexedSeq(arguments);
  };

  IndexedSeq.prototype.toIndexedSeq = function toIndexedSeq () {
    return this;
  };

  IndexedSeq.prototype.toString = function toString () {
    return this.__toString('Seq [', ']');
  };

  return IndexedSeq;
}(Seq));

var SetSeq = /*@__PURE__*/(function (Seq) {
  function SetSeq(value) {
    return (
      isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
    ).toSetSeq();
  }

  if ( Seq ) SetSeq.__proto__ = Seq;
  SetSeq.prototype = Object.create( Seq && Seq.prototype );
  SetSeq.prototype.constructor = SetSeq;

  SetSeq.of = function of () {
    return SetSeq(arguments);
  };

  SetSeq.prototype.toSetSeq = function toSetSeq () {
    return this;
  };

  return SetSeq;
}(Seq));

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

Seq.prototype[IS_SEQ_SYMBOL] = true;



var ArraySeq = /*@__PURE__*/(function (IndexedSeq) {
  function ArraySeq(array) {
    this._array = array;
    this.size = array.length;
  }

  if ( IndexedSeq ) ArraySeq.__proto__ = IndexedSeq;
  ArraySeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ArraySeq.prototype.constructor = ArraySeq;

  ArraySeq.prototype.get = function get (index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  };

  ArraySeq.prototype.__iterate = function __iterate (fn, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    while (i !== size) {
      var ii = reverse ? size - ++i : i++;
      if (fn(array[ii], ii, this) === false) {
        break;
      }
    }
    return i;
  };

  ArraySeq.prototype.__iterator = function __iterator (type, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]);
    });
  };

  return ArraySeq;
}(IndexedSeq));

var ObjectSeq = /*@__PURE__*/(function (KeyedSeq) {
  function ObjectSeq(object) {
    var keys = Object.keys(object).concat(
      Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []
    );
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  if ( KeyedSeq ) ObjectSeq.__proto__ = KeyedSeq;
  ObjectSeq.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ObjectSeq.prototype.constructor = ObjectSeq;

  ObjectSeq.prototype.get = function get (key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  };

  ObjectSeq.prototype.has = function has (key) {
    return hasOwnProperty.call(this._object, key);
  };

  ObjectSeq.prototype.__iterate = function __iterate (fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    while (i !== size) {
      var key = keys[reverse ? size - ++i : i++];
      if (fn(object[key], key, this) === false) {
        break;
      }
    }
    return i;
  };

  ObjectSeq.prototype.__iterator = function __iterator (type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var key = keys[reverse ? size - ++i : i++];
      return iteratorValue(type, key, object[key]);
    });
  };

  return ObjectSeq;
}(KeyedSeq));
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

var CollectionSeq = /*@__PURE__*/(function (IndexedSeq) {
  function CollectionSeq(collection) {
    this._collection = collection;
    this.size = collection.length || collection.size;
  }

  if ( IndexedSeq ) CollectionSeq.__proto__ = IndexedSeq;
  CollectionSeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  CollectionSeq.prototype.constructor = CollectionSeq;

  CollectionSeq.prototype.__iterateUncached = function __iterateUncached (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  };

  CollectionSeq.prototype.__iteratorUncached = function __iteratorUncached (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    var iterations = 0;
    return new Iterator(function () {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  };

  return CollectionSeq;
}(IndexedSeq));



var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}

function keyedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

function indexedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
      ? seq.toSetSeq()
      : seq;
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue(value) {
  return isArrayLike(value)
    ? new ArraySeq(value)
    : hasIterator(value)
    ? new CollectionSeq(value)
    : undefined;
}

var IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

function isMap(maybeMap) {
  return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
}

function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}

function isValueObject(maybeValue) {
  return Boolean(
    maybeValue &&
      typeof maybeValue.equals === 'function' &&
      typeof maybeValue.hashCode === 'function'
  );
}


function is(valueA, valueB) {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (
    typeof valueA.valueOf === 'function' &&
    typeof valueB.valueOf === 'function'
  ) {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  return !!(
    isValueObject(valueA) &&
    isValueObject(valueB) &&
    valueA.equals(valueB)
  );
}

var imul =
  typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2
    ? Math.imul
    : function imul(a, b) {
        a |= 0; 
        b |= 0; 
        var c = a & 0xffff;
        var d = b & 0xffff;
        
        return (c * d + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0)) | 0; 
      };





function smi(i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}

var defaultValueOf = Object.prototype.valueOf;

function hash(o) {
  if (o == null) {
    return hashNullish(o);
  }

  if (typeof o.hashCode === 'function') {
    
    return smi(o.hashCode(o));
  }

  var v = valueOf(o);

  if (v == null) {
    return hashNullish(v);
  }

  switch (typeof v) {
    case 'boolean':
      
      
      
      return v ? 0x42108421 : 0x42108420;
    case 'number':
      return hashNumber(v);
    case 'string':
      return v.length > STRING_HASH_CACHE_MIN_STRLEN
        ? cachedHashString(v)
        : hashString(v);
    case 'object':
    case 'function':
      return hashJSObj(v);
    case 'symbol':
      return hashSymbol(v);
    default:
      if (typeof v.toString === 'function') {
        return hashString(v.toString());
      }
      throw new Error('Value type ' + typeof v + ' cannot be hashed.');
  }
}

function hashNullish(nullish) {
  return nullish === null ? 0x42108422 :  0x42108423;
}


function hashNumber(n) {
  if (n !== n || n === Infinity) {
    return 0;
  }
  var hash = n | 0;
  if (hash !== n) {
    hash ^= n * 0xffffffff;
  }
  while (n > 0xffffffff) {
    n /= 0xffffffff;
    hash ^= n;
  }
  return smi(hash);
}

function cachedHashString(string) {
  var hashed = stringHashCache[string];
  if (hashed === undefined) {
    hashed = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hashed;
  }
  return hashed;
}


function hashString(string) {
  
  
  
  
  
  
  var hashed = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
  }
  return smi(hashed);
}

function hashSymbol(sym) {
  var hashed = symbolMap[sym];
  if (hashed !== undefined) {
    return hashed;
  }

  hashed = nextHash();

  symbolMap[sym] = hashed;

  return hashed;
}

function hashJSObj(obj) {
  var hashed;
  if (usingWeakMap) {
    hashed = weakMap.get(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = obj[UID_HASH_KEY];
  if (hashed !== undefined) {
    return hashed;
  }

  if (!canDefineProperty) {
    hashed = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hashed !== undefined) {
      return hashed;
    }

    hashed = getIENodeHash(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = nextHash();

  if (usingWeakMap) {
    weakMap.set(obj, hashed);
  } else if (isExtensible !== undefined && isExtensible(obj) === false) {
    throw new Error('Non-extensible objects are not allowed as keys.');
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashed,
    });
  } else if (
    obj.propertyIsEnumerable !== undefined &&
    obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable
  ) {
    
    
    
    
    obj.propertyIsEnumerable = function () {
      return this.constructor.prototype.propertyIsEnumerable.apply(
        this,
        arguments
      );
    };
    obj.propertyIsEnumerable[UID_HASH_KEY] = hashed;
  } else if (obj.nodeType !== undefined) {
    
    
    
    
    obj[UID_HASH_KEY] = hashed;
  } else {
    throw new Error('Unable to set a non-enumerable property on object.');
  }

  return hashed;
}


var isExtensible = Object.isExtensible;


var canDefineProperty = (function () {
  try {
    Object.defineProperty({}, '@', {});
    return true;
  } catch (e) {
    return false;
  }
})();



function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1: 
        return node.uniqueID;
      case 9: 
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}

function valueOf(obj) {
  return obj.valueOf !== defaultValueOf && typeof obj.valueOf === 'function'
    ? obj.valueOf(obj)
    : obj;
}

function nextHash() {
  var nextHash = ++_objHashUID;
  if (_objHashUID & 0x40000000) {
    _objHashUID = 0;
  }
  return nextHash;
}


var usingWeakMap = typeof WeakMap === 'function';
var weakMap;
if (usingWeakMap) {
  weakMap = new WeakMap();
}

var symbolMap = Object.create(null);

var _objHashUID = 0;

var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol === 'function') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}

var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var stringHashCache = {};

var ToKeyedSequence = /*@__PURE__*/(function (KeyedSeq) {
  function ToKeyedSequence(indexed, useKeys) {
    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  if ( KeyedSeq ) ToKeyedSequence.__proto__ = KeyedSeq;
  ToKeyedSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ToKeyedSequence.prototype.constructor = ToKeyedSequence;

  ToKeyedSequence.prototype.get = function get (key, notSetValue) {
    return this._iter.get(key, notSetValue);
  };

  ToKeyedSequence.prototype.has = function has (key) {
    return this._iter.has(key);
  };

  ToKeyedSequence.prototype.valueSeq = function valueSeq () {
    return this._iter.valueSeq();
  };

  ToKeyedSequence.prototype.reverse = function reverse () {
    var this$1$1 = this;

    var reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = function () { return this$1$1._iter.toSeq().reverse(); };
    }
    return reversedSequence;
  };

  ToKeyedSequence.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    var mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = function () { return this$1$1._iter.toSeq().map(mapper, context); };
    }
    return mappedSequence;
  };

  ToKeyedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v, k) { return fn(v, k, this$1$1); }, reverse);
  };

  ToKeyedSequence.prototype.__iterator = function __iterator (type, reverse) {
    return this._iter.__iterator(type, reverse);
  };

  return ToKeyedSequence;
}(KeyedSeq));
ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

var ToIndexedSequence = /*@__PURE__*/(function (IndexedSeq) {
  function ToIndexedSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( IndexedSeq ) ToIndexedSequence.__proto__ = IndexedSeq;
  ToIndexedSequence.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ToIndexedSequence.prototype.constructor = ToIndexedSequence;

  ToIndexedSequence.prototype.includes = function includes (value) {
    return this._iter.includes(value);
  };

  ToIndexedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(this);
    return this._iter.__iterate(
      function (v) { return fn(v, reverse ? this$1$1.size - ++i : i++, this$1$1); },
      reverse
    );
  };

  ToIndexedSequence.prototype.__iterator = function __iterator (type, reverse) {
    var this$1$1 = this;

    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    var i = 0;
    reverse && ensureSize(this);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(
            type,
            reverse ? this$1$1.size - ++i : i++,
            step.value,
            step
          );
    });
  };

  return ToIndexedSequence;
}(IndexedSeq));

var ToSetSequence = /*@__PURE__*/(function (SetSeq) {
  function ToSetSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( SetSeq ) ToSetSequence.__proto__ = SetSeq;
  ToSetSequence.prototype = Object.create( SetSeq && SetSeq.prototype );
  ToSetSequence.prototype.constructor = ToSetSequence;

  ToSetSequence.prototype.has = function has (key) {
    return this._iter.includes(key);
  };

  ToSetSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v) { return fn(v, v, this$1$1); }, reverse);
  };

  ToSetSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, step.value, step.value, step);
    });
  };

  return ToSetSequence;
}(SetSeq));

var FromEntriesSequence = /*@__PURE__*/(function (KeyedSeq) {
  function FromEntriesSequence(entries) {
    this._iter = entries;
    this.size = entries.size;
  }

  if ( KeyedSeq ) FromEntriesSequence.__proto__ = KeyedSeq;
  FromEntriesSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  FromEntriesSequence.prototype.constructor = FromEntriesSequence;

  FromEntriesSequence.prototype.entrySeq = function entrySeq () {
    return this._iter.toSeq();
  };

  FromEntriesSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (entry) {
      
      
      if (entry) {
        validateEntry(entry);
        var indexedCollection = isCollection(entry);
        return fn(
          indexedCollection ? entry.get(1) : entry[1],
          indexedCollection ? entry.get(0) : entry[0],
          this$1$1
        );
      }
    }, reverse);
  };

  FromEntriesSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        
        
        if (entry) {
          validateEntry(entry);
          var indexedCollection = isCollection(entry);
          return iteratorValue(
            type,
            indexedCollection ? entry.get(0) : entry[0],
            indexedCollection ? entry.get(1) : entry[1],
            step
          );
        }
      }
    });
  };

  return FromEntriesSequence;
}(KeyedSeq));

ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;

function flipFactory(collection) {
  var flipSequence = makeSequence(collection);
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = function () { return collection; };
  flipSequence.reverse = function () {
    var reversedSequence = collection.reverse.apply(this); 
    reversedSequence.flip = function () { return collection.reverse(); };
    return reversedSequence;
  };
  flipSequence.has = function (key) { return collection.includes(key); };
  flipSequence.includes = function (key) { return collection.has(key); };
  flipSequence.cacheResult = cacheResultThrough;
  flipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(function (v, k) { return fn(k, v, this$1$1) !== false; }, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = collection.__iterator(type, reverse);
      return new Iterator(function () {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return collection.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  };
  return flipSequence;
}

function mapFactory(collection, mapper, context) {
  var mappedSequence = makeSequence(collection);
  mappedSequence.size = collection.size;
  mappedSequence.has = function (key) { return collection.has(key); };
  mappedSequence.get = function (key, notSetValue) {
    var v = collection.get(key, NOT_SET);
    return v === NOT_SET
      ? notSetValue
      : mapper.call(context, v, key, collection);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(
      function (v, k, c) { return fn(mapper.call(context, v, k, c), k, this$1$1) !== false; },
      reverse
    );
  };
  mappedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(
        type,
        key,
        mapper.call(context, entry[1], key, collection),
        step
      );
    });
  };
  return mappedSequence;
}

function reverseFactory(collection, useKeys) {
  var this$1$1 = this;

  var reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = function () { return collection; };
  if (collection.flip) {
    reversedSequence.flip = function () {
      var flipSequence = flipFactory(collection);
      flipSequence.reverse = function () { return collection.flip(); };
      return flipSequence;
    };
  }
  reversedSequence.get = function (key, notSetValue) { return collection.get(useKeys ? key : -1 - key, notSetValue); };
  reversedSequence.has = function (key) { return collection.has(useKeys ? key : -1 - key); };
  reversedSequence.includes = function (value) { return collection.includes(value); };
  reversedSequence.cacheResult = cacheResultThrough;
  reversedSequence.__iterate = function (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(collection);
    return collection.__iterate(
      function (v, k) { return fn(v, useKeys ? k : reverse ? this$1$1.size - ++i : i++, this$1$1); },
      !reverse
    );
  };
  reversedSequence.__iterator = function (type, reverse) {
    var i = 0;
    reverse && ensureSize(collection);
    var iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      return iteratorValue(
        type,
        useKeys ? entry[0] : reverse ? this$1$1.size - ++i : i++,
        entry[1],
        step
      );
    });
  };
  return reversedSequence;
}

function filterFactory(collection, predicate, context, useKeys) {
  var filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = function (key) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = function (key, notSetValue) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
}

function countByFactory(collection, grouper, context) {
  var groups = Map$1().asMutable();
  collection.__iterate(function (v, k) {
    groups.update(grouper.call(context, v, k, collection), 0, function (a) { return a + 1; });
  });
  return groups.asImmutable();
}

function groupByFactory(collection, grouper, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = (isOrdered(collection) ? OrderedMap() : Map$1()).asMutable();
  collection.__iterate(function (v, k) {
    groups.update(
      grouper.call(context, v, k, collection),
      function (a) { return ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a); }
    );
  });
  var coerce = collectionClass(collection);
  return groups.map(function (arr) { return reify(collection, coerce(arr)); }).asImmutable();
}

function partitionFactory(collection, predicate, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = [[], []];
  collection.__iterate(function (v, k) {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(
      isKeyedIter ? [k, v] : v
    );
  });
  var coerce = collectionClass(collection);
  return groups.map(function (arr) { return reify(collection, coerce(arr)); });
}

function sliceFactory(collection, begin, end, useKeys) {
  var originalSize = collection.size;

  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }

  var resolvedBegin = resolveBegin(begin, originalSize);
  var resolvedEnd = resolveEnd(end, originalSize);

  
  
  
  if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
    return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
  }

  
  
  
  
  var resolvedSize = resolvedEnd - resolvedBegin;
  var sliceSize;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }

  var sliceSeq = makeSequence(collection);

  
  
  sliceSeq.size =
    sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

  if (!useKeys && isSeq(collection) && sliceSize >= 0) {
    sliceSeq.get = function (index, notSetValue) {
      index = wrapIndex(this, index);
      return index >= 0 && index < sliceSize
        ? collection.get(index + resolvedBegin, notSetValue)
        : notSetValue;
    };
  }

  sliceSeq.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (sliceSize === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return (
          fn(v, useKeys ? k : iterations - 1, this$1$1) !== false &&
          iterations !== sliceSize
        );
      }
    });
    return iterations;
  };

  sliceSeq.__iteratorUncached = function (type, reverse) {
    if (sliceSize !== 0 && reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    var iterator = collection.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator(function () {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }
      if (++iterations > sliceSize) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, undefined, step);
      }
      return iteratorValue(type, iterations - 1, step.value[1], step);
    });
  };

  return sliceSeq;
}

function takeWhileFactory(collection, predicate, context) {
  var takeSequence = makeSequence(collection);
  takeSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    collection.__iterate(
      function (v, k, c) { return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$1$1); }
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator(function () {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, this$1$1)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}

function skipWhileFactory(collection, predicate, context, useKeys) {
  var skipSequence = makeSequence(collection);
  skipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator(function () {
      var step;
      var k;
      var v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, undefined, step);
          }
          return iteratorValue(type, iterations++, step.value[1], step);
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, this$1$1));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}

function concatFactory(collection, values) {
  var isKeyedCollection = isKeyed(collection);
  var iters = [collection]
    .concat(values)
    .map(function (v) {
      if (!isCollection(v)) {
        v = isKeyedCollection
          ? keyedSeqFromValue(v)
          : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = KeyedCollection(v);
      }
      return v;
    })
    .filter(function (v) { return v.size !== 0; });

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    var singleton = iters[0];
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  var concatSeq = new ArraySeq(iters);
  if (isKeyedCollection) {
    concatSeq = concatSeq.toKeyedSeq();
  } else if (!isIndexed(collection)) {
    concatSeq = concatSeq.toSetSeq();
  }
  concatSeq = concatSeq.flatten(true);
  concatSeq.size = iters.reduce(function (sum, seq) {
    if (sum !== undefined) {
      var size = seq.size;
      if (size !== undefined) {
        return sum + size;
      }
    }
  }, 0);
  return concatSeq;
}

function flattenFactory(collection, depth, useKeys) {
  var flatSequence = makeSequence(collection);
  flatSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    var stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate(function (v, k) {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(type, reverse);
    var stack = [];
    var iterations = 0;
    return new Iterator(function () {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
}

function flatMapFactory(collection, mapper, context) {
  var coerce = collectionClass(collection);
  return collection
    .toSeq()
    .map(function (v, k) { return coerce(mapper.call(context, v, k, collection)); })
    .flatten(true);
}

function interposeFactory(collection, separator) {
  var interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(
      function (v) { return (!iterations || fn(separator, iterations++, this$1$1) !== false) &&
        fn(v, iterations++, this$1$1) !== false; },
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator(function () {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}

function sortFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  var isKeyedCollection = isKeyed(collection);
  var index = 0;
  var entries = collection
    .toSeq()
    .map(function (v, k) { return [k, v, index++, mapper ? mapper(v, k, collection) : v]; })
    .valueSeq()
    .toArray();
  entries
    .sort(function (a, b) { return comparator(a[3], b[3]) || a[2] - b[2]; })
    .forEach(
      isKeyedCollection
        ? function (v, i) {
            entries[i].length = 2;
          }
        : function (v, i) {
            entries[i] = v[1];
          }
    );
  return isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
    ? IndexedSeq(entries)
    : SetSeq(entries);
}

function maxFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    var entry = collection
      .toSeq()
      .map(function (v, k) { return [v, mapper(v, k, collection)]; })
      .reduce(function (a, b) { return (maxCompare(comparator, a[1], b[1]) ? b : a); });
    return entry && entry[0];
  }
  return collection.reduce(function (a, b) { return (maxCompare(comparator, a, b) ? b : a); });
}

function maxCompare(comparator, a, b) {
  var comp = comparator(b, a);
  
  
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
}

function zipWithFactory(keyIter, zipper, iters, zipAll) {
  var zipSequence = makeSequence(keyIter);
  var sizes = new ArraySeq(iters).map(function (i) { return i.size; });
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  
  
  zipSequence.__iterate = function (fn, reverse) {
    
    
    var iterator = this.__iterator(ITERATE_VALUES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    var iterators = iters.map(
      function (i) { return ((i = Collection(i)), getIterator(reverse ? i.reverse() : i)); }
    );
    var iterations = 0;
    var isDone = false;
    return new Iterator(function () {
      var steps;
      if (!isDone) {
        steps = iterators.map(function (i) { return i.next(); });
        isDone = zipAll ? steps.every(function (s) { return s.done; }) : steps.some(function (s) { return s.done; });
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zipper.apply(
          null,
          steps.map(function (s) { return s.value; })
        )
      );
    });
  };
  return zipSequence;
}



function reify(iter, seq) {
  return iter === seq ? iter : isSeq(iter) ? seq : iter.constructor(seq);
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}

function collectionClass(collection) {
  return isKeyed(collection)
    ? KeyedCollection
    : isIndexed(collection)
    ? IndexedCollection
    : SetCollection;
}

function makeSequence(collection) {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeq
      : isIndexed(collection)
      ? IndexedSeq
      : SetSeq
    ).prototype
  );
}

function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return Seq.prototype.cacheResult.call(this);
}

function defaultComparator(a, b) {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a > b ? 1 : a < b ? -1 : 0;
}

function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}

function invariant(condition, error) {
  if (!condition) { throw new Error(error); }
}

function assertNotInfinite(size) {
  invariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  );
}

function coerceKeyPath(keyPath) {
  if (isArrayLike(keyPath) && typeof keyPath !== 'string') {
    return keyPath;
  }
  if (isOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError(
    'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
  );
}

var toString = Object.prototype.toString;

function isPlainObject(value) {
  
  if (
    !value ||
    typeof value !== 'object' ||
    toString.call(value) !== '[object Object]'
  ) {
    return false;
  }

  var proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  
  var parentProto = proto;
  var nextProto = Object.getPrototypeOf(proto);
  while (nextProto !== null) {
    parentProto = nextProto;
    nextProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
}


function isDataStructure(value) {
  return (
    typeof value === 'object' &&
    (isImmutable(value) || Array.isArray(value) || isPlainObject(value))
  );
}

function quoteString(value) {
  try {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  } catch (_ignoreError) {
    return JSON.stringify(value);
  }
}

function has(collection, key) {
  return isImmutable(collection)
    ? collection.has(key)
    : isDataStructure(collection) && hasOwnProperty.call(collection, key);
}

function get(collection, key, notSetValue) {
  return isImmutable(collection)
    ? collection.get(key, notSetValue)
    : !has(collection, key)
    ? notSetValue
    : typeof collection.get === 'function'
    ? collection.get(key)
    : collection[key];
}

function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  var to = {};
  for (var key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}

function remove(collection, key) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.remove) {
      throw new TypeError(
        'Cannot update immutable value without .remove() method: ' + collection
      );
    }
    return collection.remove(key);
  }
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}

function set(collection, key, value) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.set) {
      throw new TypeError(
        'Cannot update immutable value without .set() method: ' + collection
      );
    }
    return collection.set(key, value);
  }
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}

function updateIn$1(collection, keyPath, notSetValue, updater) {
  if (!updater) {
    updater = notSetValue;
    notSetValue = undefined;
  }
  var updatedValue = updateInDeeply(
    isImmutable(collection),
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}

function updateInDeeply(
  inImmutable,
  existing,
  keyPath,
  i,
  notSetValue,
  updater
) {
  var wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    var existingValue = wasNotSet ? notSetValue : existing;
    var newValue = updater(existingValue);
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !isDataStructure(existing)) {
    throw new TypeError(
      'Cannot update within non-data-structure value in path [' +
        keyPath.slice(0, i).map(quoteString) +
        ']: ' +
        existing
    );
  }
  var key = keyPath[i];
  var nextExisting = wasNotSet ? NOT_SET : get(existing, key, NOT_SET);
  var nextUpdated = updateInDeeply(
    nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater
  );
  return nextUpdated === nextExisting
    ? existing
    : nextUpdated === NOT_SET
    ? remove(existing, key)
    : set(
        wasNotSet ? (inImmutable ? emptyMap() : {}) : existing,
        key,
        nextUpdated
      );
}

function setIn$1(collection, keyPath, value) {
  return updateIn$1(collection, keyPath, NOT_SET, function () { return value; });
}

function setIn(keyPath, v) {
  return setIn$1(this, keyPath, v);
}

function removeIn(collection, keyPath) {
  return updateIn$1(collection, keyPath, function () { return NOT_SET; });
}

function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}

function update$1(collection, key, notSetValue, updater) {
  return updateIn$1(collection, [key], notSetValue, updater);
}

function update(key, notSetValue, updater) {
  return arguments.length === 1
    ? key(this)
    : update$1(this, key, notSetValue, updater);
}

function updateIn(keyPath, notSetValue, updater) {
  return updateIn$1(this, keyPath, notSetValue, updater);
}

function merge$1() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeIntoKeyedWith(this, iters);
}

function mergeWith$1(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  if (typeof merger !== 'function') {
    throw new TypeError('Invalid merger function: ' + merger);
  }
  return mergeIntoKeyedWith(this, iters, merger);
}

function mergeIntoKeyedWith(collection, collections, merger) {
  var iters = [];
  for (var ii = 0; ii < collections.length; ii++) {
    var collection$1 = KeyedCollection(collections[ii]);
    if (collection$1.size !== 0) {
      iters.push(collection$1);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (
    collection.toSeq().size === 0 &&
    !collection.__ownerID &&
    iters.length === 1
  ) {
    return collection.constructor(iters[0]);
  }
  return collection.withMutations(function (collection) {
    var mergeIntoCollection = merger
      ? function (value, key) {
          update$1(collection, key, NOT_SET, function (oldVal) { return oldVal === NOT_SET ? value : merger(oldVal, value, key); }
          );
        }
      : function (value, key) {
          collection.set(key, value);
        };
    for (var ii = 0; ii < iters.length; ii++) {
      iters[ii].forEach(mergeIntoCollection);
    }
  });
}

function mergeDeepWithSources(collection, sources, merger) {
  return mergeWithSources(collection, sources, deepMergerWith(merger));
}

function mergeWithSources(collection, sources, merger) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    return typeof merger === 'function' && collection.mergeWith
      ? collection.mergeWith.apply(collection, [ merger ].concat( sources ))
      : collection.merge
      ? collection.merge.apply(collection, sources)
      : collection.concat.apply(collection, sources);
  }
  var isArray = Array.isArray(collection);
  var merged = collection;
  var Collection = isArray ? IndexedCollection : KeyedCollection;
  var mergeItem = isArray
    ? function (value) {
        
        if (merged === collection) {
          merged = shallowCopy(merged);
        }
        merged.push(value);
      }
    : function (value, key) {
        var hasVal = hasOwnProperty.call(merged, key);
        var nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged[key] = nextVal;
        }
      };
  for (var i = 0; i < sources.length; i++) {
    Collection(sources[i]).forEach(mergeItem);
  }
  return merged;
}

function deepMergerWith(merger) {
  function deepMerger(oldValue, newValue, key) {
    return isDataStructure(oldValue) &&
      isDataStructure(newValue) &&
      areMergeable(oldValue, newValue)
      ? mergeWithSources(oldValue, [newValue], deepMerger)
      : merger
      ? merger(oldValue, newValue, key)
      : newValue;
  }
  return deepMerger;
}


function areMergeable(oldDataStructure, newDataStructure) {
  var oldSeq = Seq(oldDataStructure);
  var newSeq = Seq(newDataStructure);
  
  
  return (
    isIndexed(oldSeq) === isIndexed(newSeq) &&
    isKeyed(oldSeq) === isKeyed(newSeq)
  );
}

function mergeDeep() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeDeepWithSources(this, iters);
}

function mergeDeepWith(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return mergeDeepWithSources(this, iters, merger);
}

function mergeIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeWithSources(m, iters); });
}

function mergeDeepIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeDeepWithSources(m, iters); }
  );
}

function withMutations(fn) {
  var mutable = this.asMutable();
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}

function asMutable() {
  return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
}

function asImmutable() {
  return this.__ensureOwner();
}

function wasAltered() {
  return this.__altered;
}

var Map$1 = /*@__PURE__*/(function (KeyedCollection) {
  function Map(value) {
    return value === undefined || value === null
      ? emptyMap()
      : isMap(value) && !isOrdered(value)
      ? value
      : emptyMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( KeyedCollection ) Map.__proto__ = KeyedCollection;
  Map.prototype = Object.create( KeyedCollection && KeyedCollection.prototype );
  Map.prototype.constructor = Map;

  Map.of = function of () {
    var keyValues = [], len = arguments.length;
    while ( len-- ) keyValues[ len ] = arguments[ len ];

    return emptyMap().withMutations(function (map) {
      for (var i = 0; i < keyValues.length; i += 2) {
        if (i + 1 >= keyValues.length) {
          throw new Error('Missing value for key: ' + keyValues[i]);
        }
        map.set(keyValues[i], keyValues[i + 1]);
      }
    });
  };

  Map.prototype.toString = function toString () {
    return this.__toString('Map {', '}');
  };

  

  Map.prototype.get = function get (k, notSetValue) {
    return this._root
      ? this._root.get(0, undefined, k, notSetValue)
      : notSetValue;
  };

  

  Map.prototype.set = function set (k, v) {
    return updateMap(this, k, v);
  };

  Map.prototype.remove = function remove (k) {
    return updateMap(this, k, NOT_SET);
  };

  Map.prototype.deleteAll = function deleteAll (keys) {
    var collection = Collection(keys);

    if (collection.size === 0) {
      return this;
    }

    return this.withMutations(function (map) {
      collection.forEach(function (key) { return map.remove(key); });
    });
  };

  Map.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyMap();
  };

  

  Map.prototype.sort = function sort (comparator) {
    
    return OrderedMap(sortFactory(this, comparator));
  };

  Map.prototype.sortBy = function sortBy (mapper, comparator) {
    
    return OrderedMap(sortFactory(this, comparator, mapper));
  };

  Map.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (map) {
      map.forEach(function (value, key) {
        map.set(key, mapper.call(context, value, key, this$1$1));
      });
    });
  };

  

  Map.prototype.__iterator = function __iterator (type, reverse) {
    return new MapIterator(this, type, reverse);
  };

  Map.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    this._root &&
      this._root.iterate(function (entry) {
        iterations++;
        return fn(entry[1], entry[0], this$1$1);
      }, reverse);
    return iterations;
  };

  Map.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.size, this._root, ownerID, this.__hash);
  };

  return Map;
}(KeyedCollection));

Map$1.isMap = isMap;

var MapPrototype = Map$1.prototype;
MapPrototype[IS_MAP_SYMBOL] = true;
MapPrototype[DELETE] = MapPrototype.remove;
MapPrototype.removeAll = MapPrototype.deleteAll;
MapPrototype.setIn = setIn;
MapPrototype.removeIn = MapPrototype.deleteIn = deleteIn;
MapPrototype.update = update;
MapPrototype.updateIn = updateIn;
MapPrototype.merge = MapPrototype.concat = merge$1;
MapPrototype.mergeWith = mergeWith$1;
MapPrototype.mergeDeep = mergeDeep;
MapPrototype.mergeDeepWith = mergeDeepWith;
MapPrototype.mergeIn = mergeIn;
MapPrototype.mergeDeepIn = mergeDeepIn;
MapPrototype.withMutations = withMutations;
MapPrototype.wasAltered = wasAltered;
MapPrototype.asImmutable = asImmutable;
MapPrototype['@@transducer/init'] = MapPrototype.asMutable = asMutable;
MapPrototype['@@transducer/step'] = function (result, arr) {
  return result.set(arr[0], arr[1]);
};
MapPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};



var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
  this.ownerID = ownerID;
  this.entries = entries;
};

ArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

ArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && entries.length === 1) {
    return; 
  }

  if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
    return createNodes(ownerID, entries, key, value);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new ArrayMapNode(ownerID, newEntries);
};

var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};

BitmapIndexedNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
  var bitmap = this.bitmap;
  return (bitmap & bit) === 0
    ? notSetValue
    : this.nodes[popCount(bitmap & (bit - 1))].get(
        shift + SHIFT,
        keyHash,
        key,
        notSetValue
      );
};

BitmapIndexedNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var bit = 1 << keyHashFrag;
  var bitmap = this.bitmap;
  var exists = (bitmap & bit) !== 0;

  if (!exists && value === NOT_SET) {
    return this;
  }

  var idx = popCount(bitmap & (bit - 1));
  var nodes = this.nodes;
  var node = exists ? nodes[idx] : undefined;
  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );

  if (newNode === node) {
    return this;
  }

  if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
    return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
  }

  if (
    exists &&
    !newNode &&
    nodes.length === 2 &&
    isLeafNode(nodes[idx ^ 1])
  ) {
    return nodes[idx ^ 1];
  }

  if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
    return newNode;
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newBitmap = exists ? (newNode ? bitmap : bitmap ^ bit) : bitmap | bit;
  var newNodes = exists
    ? newNode
      ? setAt(nodes, idx, newNode, isEditable)
      : spliceOut(nodes, idx, isEditable)
    : spliceIn(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.bitmap = newBitmap;
    this.nodes = newNodes;
    return this;
  }

  return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
};

var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};

HashArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var node = this.nodes[idx];
  return node
    ? node.get(shift + SHIFT, keyHash, key, notSetValue)
    : notSetValue;
};

HashArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var removed = value === NOT_SET;
  var nodes = this.nodes;
  var node = nodes[idx];

  if (removed && !node) {
    return this;
  }

  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
  if (newNode === node) {
    return this;
  }

  var newCount = this.count;
  if (!node) {
    newCount++;
  } else if (!newNode) {
    newCount--;
    if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
      return packNodes(ownerID, nodes, newCount, idx);
    }
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newNodes = setAt(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.count = newCount;
    this.nodes = newNodes;
    return this;
  }

  return new HashArrayMapNode(ownerID, newCount, newNodes);
};

var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entries = entries;
};

HashCollisionNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

HashCollisionNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }

  var removed = value === NOT_SET;

  if (keyHash !== this.keyHash) {
    if (removed) {
      return this;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
  }

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && len === 2) {
    return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new HashCollisionNode(ownerID, this.keyHash, newEntries);
};

var ValueNode = function ValueNode(ownerID, keyHash, entry) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entry = entry;
};

ValueNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
};

ValueNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;
  var keyMatch = is(key, this.entry[0]);
  if (keyMatch ? value === this.entry[1] : removed) {
    return this;
  }

  SetRef(didAlter);

  if (removed) {
    SetRef(didChangeSize);
    return; 
  }

  if (keyMatch) {
    if (ownerID && ownerID === this.ownerID) {
      this.entry[1] = value;
      return this;
    }
    return new ValueNode(ownerID, this.keyHash, [key, value]);
  }

  SetRef(didChangeSize);
  return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
};



ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate =
  function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  };

BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate =
  function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  };


ValueNode.prototype.iterate = function (fn, reverse) {
  return fn(this.entry);
};

var MapIterator = /*@__PURE__*/(function (Iterator) {
  function MapIterator(map, type, reverse) {
    this._type = type;
    this._reverse = reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }

  if ( Iterator ) MapIterator.__proto__ = Iterator;
  MapIterator.prototype = Object.create( Iterator && Iterator.prototype );
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.next = function next () {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex = (void 0);
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(
            type,
            node.entries[this._reverse ? maxIndex - index : index]
          );
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  };

  return MapIterator;
}(Iterator));

function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}

function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev,
  };
}

function makeMap(size, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_MAP;
function emptyMap() {
  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
}

function updateMap(map, k, v) {
  var newRoot;
  var newSize;
  if (!map._root) {
    if (v === NOT_SET) {
      return map;
    }
    newSize = 1;
    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
  } else {
    var didChangeSize = MakeRef();
    var didAlter = MakeRef();
    newRoot = updateNode(
      map._root,
      map.__ownerID,
      0,
      undefined,
      k,
      v,
      didChangeSize,
      didAlter
    );
    if (!didAlter.value) {
      return map;
    }
    newSize = map.size + (didChangeSize.value ? (v === NOT_SET ? -1 : 1) : 0);
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
}

function updateNode(
  node,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, keyHash, [key, value]);
  }
  return node.update(
    ownerID,
    shift,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
}

function isLeafNode(node) {
  return (
    node.constructor === ValueNode || node.constructor === HashCollisionNode
  );
}

function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
  if (node.keyHash === keyHash) {
    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
  }

  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

  var newNode;
  var nodes =
    idx1 === idx2
      ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]
      : ((newNode = new ValueNode(ownerID, keyHash, entry)),
        idx1 < idx2 ? [node, newNode] : [newNode, node]);

  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}

function createNodes(ownerID, entries, key, value) {
  if (!ownerID) {
    ownerID = new OwnerID();
  }
  var node = new ValueNode(ownerID, hash(key), [key, value]);
  for (var ii = 0; ii < entries.length; ii++) {
    var entry = entries[ii];
    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
  }
  return node;
}

function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node !== undefined && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}

function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
  }
  expandedNodes[including] = node;
  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
}

function popCount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}

function setAt(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}

function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}

function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}

var MAX_ARRAY_MAP_SIZE = SIZE / 4;
var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

var IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

function isList(maybeList) {
  return Boolean(maybeList && maybeList[IS_LIST_SYMBOL]);
}

var List = /*@__PURE__*/(function (IndexedCollection) {
  function List(value) {
    var empty = emptyList();
    if (value === undefined || value === null) {
      return empty;
    }
    if (isList(value)) {
      return value;
    }
    var iter = IndexedCollection(value);
    var size = iter.size;
    if (size === 0) {
      return empty;
    }
    assertNotInfinite(size);
    if (size > 0 && size < SIZE) {
      return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
    }
    return empty.withMutations(function (list) {
      list.setSize(size);
      iter.forEach(function (v, i) { return list.set(i, v); });
    });
  }

  if ( IndexedCollection ) List.__proto__ = IndexedCollection;
  List.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  List.prototype.constructor = List;

  List.of = function of () {
    return this(arguments);
  };

  List.prototype.toString = function toString () {
    return this.__toString('List [', ']');
  };

  

  List.prototype.get = function get (index, notSetValue) {
    index = wrapIndex(this, index);
    if (index >= 0 && index < this.size) {
      index += this._origin;
      var node = listNodeFor(this, index);
      return node && node.array[index & MASK];
    }
    return notSetValue;
  };

  

  List.prototype.set = function set (index, value) {
    return updateList(this, index, value);
  };

  List.prototype.remove = function remove (index) {
    return !this.has(index)
      ? this
      : index === 0
      ? this.shift()
      : index === this.size - 1
      ? this.pop()
      : this.splice(index, 1);
  };

  List.prototype.insert = function insert (index, value) {
    return this.splice(index, 0, value);
  };

  List.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyList();
  };

  List.prototype.push = function push () {
    var values = arguments;
    var oldSize = this.size;
    return this.withMutations(function (list) {
      setListBounds(list, 0, oldSize + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(oldSize + ii, values[ii]);
      }
    });
  };

  List.prototype.pop = function pop () {
    return setListBounds(this, 0, -1);
  };

  List.prototype.unshift = function unshift () {
    var values = arguments;
    return this.withMutations(function (list) {
      setListBounds(list, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(ii, values[ii]);
      }
    });
  };

  List.prototype.shift = function shift () {
    return setListBounds(this, 1);
  };

  

  List.prototype.concat = function concat () {
    var arguments$1 = arguments;

    var seqs = [];
    for (var i = 0; i < arguments.length; i++) {
      var argument = arguments$1[i];
      var seq = IndexedCollection(
        typeof argument !== 'string' && hasIterator(argument)
          ? argument
          : [argument]
      );
      if (seq.size !== 0) {
        seqs.push(seq);
      }
    }
    if (seqs.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
      return this.constructor(seqs[0]);
    }
    return this.withMutations(function (list) {
      seqs.forEach(function (seq) { return seq.forEach(function (value) { return list.push(value); }); });
    });
  };

  List.prototype.setSize = function setSize (size) {
    return setListBounds(this, 0, size);
  };

  List.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (list) {
      for (var i = 0; i < this$1$1.size; i++) {
        list.set(i, mapper.call(context, list.get(i), i, this$1$1));
      }
    });
  };

  

  List.prototype.slice = function slice (begin, end) {
    var size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setListBounds(
      this,
      resolveBegin(begin, size),
      resolveEnd(end, size)
    );
  };

  List.prototype.__iterator = function __iterator (type, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    return new Iterator(function () {
      var value = values();
      return value === DONE
        ? iteratorDone()
        : iteratorValue(type, reverse ? --index : index++, value);
    });
  };

  List.prototype.__iterate = function __iterate (fn, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    var value;
    while ((value = values()) !== DONE) {
      if (fn(value, reverse ? --index : index++, this) === false) {
        break;
      }
    }
    return index;
  };

  List.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyList();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeList(
      this._origin,
      this._capacity,
      this._level,
      this._root,
      this._tail,
      ownerID,
      this.__hash
    );
  };

  return List;
}(IndexedCollection));

List.isList = isList;

var ListPrototype = List.prototype;
ListPrototype[IS_LIST_SYMBOL] = true;
ListPrototype[DELETE] = ListPrototype.remove;
ListPrototype.merge = ListPrototype.concat;
ListPrototype.setIn = setIn;
ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
ListPrototype.update = update;
ListPrototype.updateIn = updateIn;
ListPrototype.mergeIn = mergeIn;
ListPrototype.mergeDeepIn = mergeDeepIn;
ListPrototype.withMutations = withMutations;
ListPrototype.wasAltered = wasAltered;
ListPrototype.asImmutable = asImmutable;
ListPrototype['@@transducer/init'] = ListPrototype.asMutable = asMutable;
ListPrototype['@@transducer/step'] = function (result, arr) {
  return result.push(arr);
};
ListPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};



VNode.prototype.removeBefore = function removeBefore (ownerID, level, index) {
  if (index === level ? 1 << level : this.array.length === 0) {
    return this;
  }
  var originIndex = (index >>> level) & MASK;
  if (originIndex >= this.array.length) {
    return new VNode([], ownerID);
  }
  var removingFirst = originIndex === 0;
  var newChild;
  if (level > 0) {
    var oldChild = this.array[originIndex];
    newChild =
      oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
    if (newChild === oldChild && removingFirst) {
      return this;
    }
  }
  if (removingFirst && !newChild) {
    return this;
  }
  var editable = editableVNode(this, ownerID);
  if (!removingFirst) {
    for (var ii = 0; ii < originIndex; ii++) {
      editable.array[ii] = undefined;
    }
  }
  if (newChild) {
    editable.array[originIndex] = newChild;
  }
  return editable;
};

VNode.prototype.removeAfter = function removeAfter (ownerID, level, index) {
  if (index === (level ? 1 << level : 0) || this.array.length === 0) {
    return this;
  }
  var sizeIndex = ((index - 1) >>> level) & MASK;
  if (sizeIndex >= this.array.length) {
    return this;
  }

  var newChild;
  if (level > 0) {
    var oldChild = this.array[sizeIndex];
    newChild =
      oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
    if (newChild === oldChild && sizeIndex === this.array.length - 1) {
      return this;
    }
  }

  var editable = editableVNode(this, ownerID);
  editable.array.splice(sizeIndex + 1);
  if (newChild) {
    editable.array[sizeIndex] = newChild;
  }
  return editable;
};

var DONE = {};

function iterateList(list, reverse) {
  var left = list._origin;
  var right = list._capacity;
  var tailPos = getTailOffset(right);
  var tail = list._tail;

  return iterateNodeOrLeaf(list._root, list._level, 0);

  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0
      ? iterateLeaf(node, offset)
      : iterateNode(node, level, offset);
  }

  function iterateLeaf(node, offset) {
    var array = offset === tailPos ? tail && tail.array : node && node.array;
    var from = offset > left ? 0 : left - offset;
    var to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      if (from === to) {
        return DONE;
      }
      var idx = reverse ? --to : from++;
      return array && array[idx];
    };
  }

  function iterateNode(node, level, offset) {
    var values;
    var array = node && node.array;
    var from = offset > left ? 0 : (left - offset) >> level;
    var to = ((right - offset) >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      while (true) {
        if (values) {
          var value = values();
          if (value !== DONE) {
            return value;
          }
          values = null;
        }
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        values = iterateNodeOrLeaf(
          array && array[idx],
          level - SHIFT,
          offset + (idx << level)
        );
      }
    };
  }
}

function makeList(origin, capacity, level, root, tail, ownerID, hash) {
  var list = Object.create(ListPrototype);
  list.size = capacity - origin;
  list._origin = origin;
  list._capacity = capacity;
  list._level = level;
  list._root = root;
  list._tail = tail;
  list.__ownerID = ownerID;
  list.__hash = hash;
  list.__altered = false;
  return list;
}

var EMPTY_LIST;
function emptyList() {
  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
}

function updateList(list, index, value) {
  index = wrapIndex(list, index);

  if (index !== index) {
    return list;
  }

  if (index >= list.size || index < 0) {
    return list.withMutations(function (list) {
      index < 0
        ? setListBounds(list, index).set(0, value)
        : setListBounds(list, 0, index + 1).set(index, value);
    });
  }

  index += list._origin;

  var newTail = list._tail;
  var newRoot = list._root;
  var didAlter = MakeRef();
  if (index >= getTailOffset(list._capacity)) {
    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(
      newRoot,
      list.__ownerID,
      list._level,
      index,
      value,
      didAlter
    );
  }

  if (!didAlter.value) {
    return list;
  }

  if (list.__ownerID) {
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === undefined) {
    return node;
  }

  var newNode;

  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(
      lowerNode,
      ownerID,
      level - SHIFT,
      index,
      value,
      didAlter
    );
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (nodeHas && node.array[idx] === value) {
    return node;
  }

  if (didAlter) {
    SetRef(didAlter);
  }

  newNode = editableVNode(node, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}

function listNodeFor(list, rawIndex) {
  if (rawIndex >= getTailOffset(list._capacity)) {
    return list._tail;
  }
  if (rawIndex < 1 << (list._level + SHIFT)) {
    var node = list._root;
    var level = list._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}

function setListBounds(list, begin, end) {
  
  
  if (begin !== undefined) {
    begin |= 0;
  }
  if (end !== undefined) {
    end |= 0;
  }
  var owner = list.__ownerID || new OwnerID();
  var oldOrigin = list._origin;
  var oldCapacity = list._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity =
    end === undefined
      ? oldCapacity
      : end < 0
      ? oldCapacity + end
      : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list;
  }

  
  if (newOrigin >= newCapacity) {
    return list.clear();
  }

  var newLevel = list._level;
  var newRoot = list._root;

  
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [undefined, newRoot] : [],
      owner
    );
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);

  
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [newRoot] : [],
      owner
    );
    newLevel += SHIFT;
  }

  
  var oldTail = list._tail;
  var newTail =
    newTailOffset < oldTailOffset
      ? listNodeFor(list, newCapacity - 1)
      : newTailOffset > oldTailOffset
      ? new VNode([], owner)
      : oldTail;

  
  if (
    oldTail &&
    newTailOffset > oldTailOffset &&
    newOrigin < oldCapacity &&
    oldTail.array.length
  ) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }

  
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    
    while (newRoot) {
      var beginIndex = (newOrigin >>> newLevel) & MASK;
      if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }

    
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(
        owner,
        newLevel,
        newTailOffset - offsetShift
      );
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (list.__ownerID) {
    list.size = newCapacity - newOrigin;
    list._origin = newOrigin;
    list._capacity = newCapacity;
    list._level = newLevel;
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
}

function getTailOffset(size) {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
}

var OrderedMap = /*@__PURE__*/(function (Map) {
  function OrderedMap(value) {
    return value === undefined || value === null
      ? emptyOrderedMap()
      : isOrderedMap(value)
      ? value
      : emptyOrderedMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( Map ) OrderedMap.__proto__ = Map;
  OrderedMap.prototype = Object.create( Map && Map.prototype );
  OrderedMap.prototype.constructor = OrderedMap;

  OrderedMap.of = function of () {
    return this(arguments);
  };

  OrderedMap.prototype.toString = function toString () {
    return this.__toString('OrderedMap {', '}');
  };

  

  OrderedMap.prototype.get = function get (k, notSetValue) {
    var index = this._map.get(k);
    return index !== undefined ? this._list.get(index)[1] : notSetValue;
  };

  

  OrderedMap.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._list.clear();
      this.__altered = true;
      return this;
    }
    return emptyOrderedMap();
  };

  OrderedMap.prototype.set = function set (k, v) {
    return updateOrderedMap(this, k, v);
  };

  OrderedMap.prototype.remove = function remove (k) {
    return updateOrderedMap(this, k, NOT_SET);
  };

  OrderedMap.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._list.__iterate(
      function (entry) { return entry && fn(entry[1], entry[0], this$1$1); },
      reverse
    );
  };

  OrderedMap.prototype.__iterator = function __iterator (type, reverse) {
    return this._list.fromEntrySeq().__iterator(type, reverse);
  };

  OrderedMap.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newList = this._list.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return emptyOrderedMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      this._map = newMap;
      this._list = newList;
      return this;
    }
    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
  };

  return OrderedMap;
}(Map$1));

OrderedMap.isOrderedMap = isOrderedMap;

OrderedMap.prototype[IS_ORDERED_SYMBOL] = true;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;

function makeOrderedMap(map, list, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._list = list;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  omap.__altered = false;
  return omap;
}

var EMPTY_ORDERED_MAP;
function emptyOrderedMap() {
  return (
    EMPTY_ORDERED_MAP ||
    (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()))
  );
}

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var list = omap._list;
  var i = map.get(k);
  var has = i !== undefined;
  var newMap;
  var newList;
  if (v === NOT_SET) {
    
    if (!has) {
      return omap;
    }
    if (list.size >= SIZE && list.size >= map.size * 2) {
      newList = list.filter(function (entry, idx) { return entry !== undefined && i !== idx; });
      newMap = newList
        .toKeyedSeq()
        .map(function (entry) { return entry[0]; })
        .flip()
        .toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map.remove(k);
      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
    }
  } else if (has) {
    if (v === list.get(i)[1]) {
      return omap;
    }
    newMap = map;
    newList = list.set(i, [k, v]);
  } else {
    newMap = map.set(k, list.size);
    newList = list.set(list.size, [k, v]);
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    omap.__altered = true;
    return omap;
  }
  return makeOrderedMap(newMap, newList);
}

var IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

function isStack(maybeStack) {
  return Boolean(maybeStack && maybeStack[IS_STACK_SYMBOL]);
}

var Stack = /*@__PURE__*/(function (IndexedCollection) {
  function Stack(value) {
    return value === undefined || value === null
      ? emptyStack()
      : isStack(value)
      ? value
      : emptyStack().pushAll(value);
  }

  if ( IndexedCollection ) Stack.__proto__ = IndexedCollection;
  Stack.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  Stack.prototype.constructor = Stack;

  Stack.of = function of () {
    return this(arguments);
  };

  Stack.prototype.toString = function toString () {
    return this.__toString('Stack [', ']');
  };

  

  Stack.prototype.get = function get (index, notSetValue) {
    var head = this._head;
    index = wrapIndex(this, index);
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  };

  Stack.prototype.peek = function peek () {
    return this._head && this._head.value;
  };

  

  Stack.prototype.push = function push () {
    var arguments$1 = arguments;

    if (arguments.length === 0) {
      return this;
    }
    var newSize = this.size + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments$1[ii],
        next: head,
      };
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pushAll = function pushAll (iter) {
    iter = IndexedCollection(iter);
    if (iter.size === 0) {
      return this;
    }
    if (this.size === 0 && isStack(iter)) {
      return iter;
    }
    assertNotInfinite(iter.size);
    var newSize = this.size;
    var head = this._head;
    iter.__iterate(function (value) {
      newSize++;
      head = {
        value: value,
        next: head,
      };
    },  true);
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pop = function pop () {
    return this.slice(1);
  };

  Stack.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyStack();
  };

  Stack.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      
      return IndexedCollection.prototype.slice.call(this, begin, end);
    }
    var newSize = this.size - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  

  Stack.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyStack();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  };

  

  Stack.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return new ArraySeq(this.toArray()).__iterate(
        function (v, k) { return fn(v, k, this$1$1); },
        reverse
      );
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  };

  Stack.prototype.__iterator = function __iterator (type, reverse) {
    if (reverse) {
      return new ArraySeq(this.toArray()).__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator(function () {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    });
  };

  return Stack;
}(IndexedCollection));

Stack.isStack = isStack;

var StackPrototype = Stack.prototype;
StackPrototype[IS_STACK_SYMBOL] = true;
StackPrototype.shift = StackPrototype.pop;
StackPrototype.unshift = StackPrototype.push;
StackPrototype.unshiftAll = StackPrototype.pushAll;
StackPrototype.withMutations = withMutations;
StackPrototype.wasAltered = wasAltered;
StackPrototype.asImmutable = asImmutable;
StackPrototype['@@transducer/init'] = StackPrototype.asMutable = asMutable;
StackPrototype['@@transducer/step'] = function (result, arr) {
  return result.unshift(arr);
};
StackPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

function makeStack(size, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_STACK;
function emptyStack() {
  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
}

var IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

function isSet(maybeSet) {
  return Boolean(maybeSet && maybeSet[IS_SET_SYMBOL]);
}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (
    !isCollection(b) ||
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    (a.__hash !== undefined &&
      b.__hash !== undefined &&
      a.__hash !== b.__hash) ||
    isKeyed(a) !== isKeyed(b) ||
    isIndexed(a) !== isIndexed(b) ||
    isOrdered(a) !== isOrdered(b)
  ) {
    return false;
  }

  if (a.size === 0 && b.size === 0) {
    return true;
  }

  var notAssociative = !isAssociative(a);

  if (isOrdered(a)) {
    var entries = a.entries();
    return (
      b.every(function (v, k) {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done
    );
  }

  var flipped = false;

  if (a.size === undefined) {
    if (b.size === undefined) {
      if (typeof a.cacheResult === 'function') {
        a.cacheResult();
      }
    } else {
      flipped = true;
      var _ = a;
      a = b;
      b = _;
    }
  }

  var allEqual = true;
  var bSize = b.__iterate(function (v, k) {
    if (
      notAssociative
        ? !a.has(v)
        : flipped
        ? !is(v, a.get(k, NOT_SET))
        : !is(a.get(k, NOT_SET), v)
    ) {
      allEqual = false;
      return false;
    }
  });

  return allEqual && a.size === bSize;
}

function mixin(ctor, methods) {
  var keyCopier = function (key) {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}

function toJS(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    var result$1 = {};
    value.__iterate(function (v, k) {
      result$1[k] = toJS(v);
    });
    return result$1;
  }
  var result = [];
  value.__iterate(function (v) {
    result.push(toJS(v));
  });
  return result;
}

var Set$1 = /*@__PURE__*/(function (SetCollection) {
  function Set(value) {
    return value === undefined || value === null
      ? emptySet()
      : isSet(value) && !isOrdered(value)
      ? value
      : emptySet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( SetCollection ) Set.__proto__ = SetCollection;
  Set.prototype = Object.create( SetCollection && SetCollection.prototype );
  Set.prototype.constructor = Set;

  Set.of = function of () {
    return this(arguments);
  };

  Set.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  Set.intersect = function intersect (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.intersect.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.union = function union (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.union.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.prototype.toString = function toString () {
    return this.__toString('Set {', '}');
  };

  

  Set.prototype.has = function has (value) {
    return this._map.has(value);
  };

  

  Set.prototype.add = function add (value) {
    return updateSet(this, this._map.set(value, value));
  };

  Set.prototype.remove = function remove (value) {
    return updateSet(this, this._map.remove(value));
  };

  Set.prototype.clear = function clear () {
    return updateSet(this, this._map.clear());
  };

  

  Set.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    
    var didChanges = false;

    var newMap = updateSet(
      this,
      this._map.mapEntries(function (ref) {
        var v = ref[1];

        var mapped = mapper.call(context, v, v, this$1$1);

        if (mapped !== v) {
          didChanges = true;
        }

        return [mapped, mapped];
      }, context)
    );

    return didChanges ? newMap : this;
  };

  Set.prototype.union = function union () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    iters = iters.filter(function (x) { return x.size !== 0; });
    if (iters.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && iters.length === 1) {
      return this.constructor(iters[0]);
    }
    return this.withMutations(function (set) {
      for (var ii = 0; ii < iters.length; ii++) {
        if (typeof iters[ii] === 'string') {
          set.add(iters[ii]);
        } else {
          SetCollection(iters[ii]).forEach(function (value) { return set.add(value); });
        }
      }
    });
  };

  Set.prototype.intersect = function intersect () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (!iters.every(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.subtract = function subtract () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (iters.some(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.sort = function sort (comparator) {
    
    return OrderedSet(sortFactory(this, comparator));
  };

  Set.prototype.sortBy = function sortBy (mapper, comparator) {
    
    return OrderedSet(sortFactory(this, comparator, mapper));
  };

  Set.prototype.wasAltered = function wasAltered () {
    return this._map.wasAltered();
  };

  Set.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._map.__iterate(function (k) { return fn(k, k, this$1$1); }, reverse);
  };

  Set.prototype.__iterator = function __iterator (type, reverse) {
    return this._map.__iterator(type, reverse);
  };

  Set.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return this.__empty();
      }
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this.__make(newMap, ownerID);
  };

  return Set;
}(SetCollection));

Set$1.isSet = isSet;

var SetPrototype = Set$1.prototype;
SetPrototype[IS_SET_SYMBOL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
SetPrototype.withMutations = withMutations;
SetPrototype.asImmutable = asImmutable;
SetPrototype['@@transducer/init'] = SetPrototype.asMutable = asMutable;
SetPrototype['@@transducer/step'] = function (result, arr) {
  return result.add(arr);
};
SetPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

SetPrototype.__empty = emptySet;
SetPrototype.__make = makeSet;

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map
    ? set
    : newMap.size === 0
    ? set.__empty()
    : set.__make(newMap);
}

function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_SET;
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}


var Range = /*@__PURE__*/(function (IndexedSeq) {
  function Range(start, end, step) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end === undefined) {
      end = Infinity;
    }
    step = step === undefined ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this._start = start;
    this._end = end;
    this._step = step;
    this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
    if (this.size === 0) {
      if (EMPTY_RANGE) {
        return EMPTY_RANGE;
      }
      EMPTY_RANGE = this;
    }
  }

  if ( IndexedSeq ) Range.__proto__ = IndexedSeq;
  Range.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  Range.prototype.constructor = Range;

  Range.prototype.toString = function toString () {
    if (this.size === 0) {
      return 'Range []';
    }
    return (
      'Range [ ' +
      this._start +
      '...' +
      this._end +
      (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]'
    );
  };

  Range.prototype.get = function get (index, notSetValue) {
    return this.has(index)
      ? this._start + wrapIndex(this, index) * this._step
      : notSetValue;
  };

  Range.prototype.includes = function includes (searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return (
      possibleIndex >= 0 &&
      possibleIndex < this.size &&
      possibleIndex === Math.floor(possibleIndex)
    );
  };

  Range.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return new Range(0, 0);
    }
    return new Range(
      this.get(begin, this._end),
      this.get(end, this._end),
      this._step
    );
  };

  Range.prototype.indexOf = function indexOf (searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index;
      }
    }
    return -1;
  };

  Range.prototype.lastIndexOf = function lastIndexOf (searchValue) {
    return this.indexOf(searchValue);
  };

  Range.prototype.__iterate = function __iterate (fn, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    while (i !== size) {
      if (fn(value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return i;
  };

  Range.prototype.__iterator = function __iterator (type, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var v = value;
      value += reverse ? -step : step;
      return iteratorValue(type, reverse ? size - ++i : i++, v);
    });
  };

  Range.prototype.equals = function equals (other) {
    return other instanceof Range
      ? this._start === other._start &&
          this._end === other._end &&
          this._step === other._step
      : deepEqual(this, other);
  };

  return Range;
}(IndexedSeq));

var EMPTY_RANGE;

function getIn$1(collection, searchKeyPath, notSetValue) {
  var keyPath = coerceKeyPath(searchKeyPath);
  var i = 0;
  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}

function getIn(searchKeyPath, notSetValue) {
  return getIn$1(this, searchKeyPath, notSetValue);
}

function hasIn$1(collection, keyPath) {
  return getIn$1(collection, keyPath, NOT_SET) !== NOT_SET;
}

function hasIn(searchKeyPath) {
  return hasIn$1(this, searchKeyPath);
}

function toObject() {
  assertNotInfinite(this.size);
  var object = {};
  this.__iterate(function (v, k) {
    object[k] = v;
  });
  return object;
}


Collection.isIterable = isCollection;
Collection.isKeyed = isKeyed;
Collection.isIndexed = isIndexed;
Collection.isAssociative = isAssociative;
Collection.isOrdered = isOrdered;

Collection.Iterator = Iterator;

mixin(Collection, {
  

  toArray: function toArray() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    var useTuples = isKeyed(this);
    var i = 0;
    this.__iterate(function (v, k) {
      
      array[i++] = useTuples ? [k, v] : v;
    });
    return array;
  },

  toIndexedSeq: function toIndexedSeq() {
    return new ToIndexedSequence(this);
  },

  toJS: function toJS$1() {
    return toJS(this);
  },

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap: function toMap() {
    
    return Map$1(this.toKeyedSeq());
  },

  toObject: toObject,

  toOrderedMap: function toOrderedMap() {
    
    return OrderedMap(this.toKeyedSeq());
  },

  toOrderedSet: function toOrderedSet() {
    
    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
  },

  toSet: function toSet() {
    
    return Set$1(isKeyed(this) ? this.valueSeq() : this);
  },

  toSetSeq: function toSetSeq() {
    return new ToSetSequence(this);
  },

  toSeq: function toSeq() {
    return isIndexed(this)
      ? this.toIndexedSeq()
      : isKeyed(this)
      ? this.toKeyedSeq()
      : this.toSetSeq();
  },

  toStack: function toStack() {
    
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  },

  toList: function toList() {
    
    return List(isKeyed(this) ? this.valueSeq() : this);
  },

  

  toString: function toString() {
    return '[Collection]';
  },

  __toString: function __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return (
      head +
      ' ' +
      this.toSeq().map(this.__toStringMapper).join(', ') +
      ' ' +
      tail
    );
  },

  

  concat: function concat() {
    var values = [], len = arguments.length;
    while ( len-- ) values[ len ] = arguments[ len ];

    return reify(this, concatFactory(this, values));
  },

  includes: function includes(searchValue) {
    return this.some(function (value) { return is(value, searchValue); });
  },

  entries: function entries() {
    return this.__iterator(ITERATE_ENTRIES);
  },

  every: function every(predicate, context) {
    assertNotInfinite(this.size);
    var returnValue = true;
    this.__iterate(function (v, k, c) {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  },

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },

  partition: function partition(predicate, context) {
    return partitionFactory(this, predicate, context);
  },

  find: function find(predicate, context, notSetValue) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  },

  forEach: function forEach(sideEffect, context) {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },

  join: function join(separator) {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate(function (v) {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v.toString() : '';
    });
    return joined;
  },

  keys: function keys() {
    return this.__iterator(ITERATE_KEYS);
  },

  map: function map(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
  },

  reduce: function reduce$1(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    );
  },

  reduceRight: function reduceRight(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    );
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  some: function some(predicate, context) {
    return !this.every(not(predicate), context);
  },

  sort: function sort(comparator) {
    return reify(this, sortFactory(this, comparator));
  },

  values: function values() {
    return this.__iterator(ITERATE_VALUES);
  },

  

  butLast: function butLast() {
    return this.slice(0, -1);
  },

  isEmpty: function isEmpty() {
    return this.size !== undefined ? this.size === 0 : !this.some(function () { return true; });
  },

  count: function count(predicate, context) {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  },

  countBy: function countBy(grouper, context) {
    return countByFactory(this, grouper, context);
  },

  equals: function equals(other) {
    return deepEqual(this, other);
  },

  entrySeq: function entrySeq() {
    var collection = this;
    if (collection._cache) {
      
      return new ArraySeq(collection._cache);
    }
    var entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = function () { return collection.toSeq(); };
    return entriesSequence;
  },

  filterNot: function filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  },

  findEntry: function findEntry(predicate, context, notSetValue) {
    var found = notSetValue;
    this.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  },

  findKey: function findKey(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry && entry[0];
  },

  findLast: function findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },

  findLastEntry: function findLastEntry(predicate, context, notSetValue) {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  },

  findLastKey: function findLastKey(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },

  first: function first(notSetValue) {
    return this.find(returnTrue, null, notSetValue);
  },

  flatMap: function flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },

  fromEntrySeq: function fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  get: function get(searchKey, notSetValue) {
    return this.find(function (_, key) { return is(key, searchKey); }, undefined, notSetValue);
  },

  getIn: getIn,

  groupBy: function groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  has: function has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },

  hasIn: hasIn,

  isSubset: function isSubset(iter) {
    iter = typeof iter.includes === 'function' ? iter : Collection(iter);
    return this.every(function (value) { return iter.includes(value); });
  },

  isSuperset: function isSuperset(iter) {
    iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
    return iter.isSubset(this);
  },

  keyOf: function keyOf(searchValue) {
    return this.findKey(function (value) { return is(value, searchValue); });
  },

  keySeq: function keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },

  last: function last(notSetValue) {
    return this.toSeq().reverse().first(notSetValue);
  },

  lastKeyOf: function lastKeyOf(searchValue) {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  },

  max: function max(comparator) {
    return maxFactory(this, comparator);
  },

  maxBy: function maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  },

  min: function min(comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator
    );
  },

  minBy: function minBy(mapper, comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator,
      mapper
    );
  },

  rest: function rest() {
    return this.slice(1);
  },

  skip: function skip(amount) {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  },

  skipLast: function skipLast(amount) {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  },

  skipUntil: function skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },

  sortBy: function sortBy(mapper, comparator) {
    return reify(this, sortFactory(this, comparator, mapper));
  },

  take: function take(amount) {
    return this.slice(0, Math.max(0, amount));
  },

  takeLast: function takeLast(amount) {
    return this.slice(-Math.max(0, amount));
  },

  takeWhile: function takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },

  takeUntil: function takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },

  update: function update(fn) {
    return fn(this);
  },

  valueSeq: function valueSeq() {
    return this.toIndexedSeq();
  },

  

  hashCode: function hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  },

  

  

  
});

var CollectionPrototype = Collection.prototype;
CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
CollectionPrototype.toJSON = CollectionPrototype.toArray;
CollectionPrototype.__toStringMapper = quoteString;
CollectionPrototype.inspect = CollectionPrototype.toSource = function () {
  return this.toString();
};
CollectionPrototype.chain = CollectionPrototype.flatMap;
CollectionPrototype.contains = CollectionPrototype.includes;

mixin(KeyedCollection, {
  

  flip: function flip() {
    return reify(this, flipFactory(this));
  },

  mapEntries: function mapEntries(mapper, context) {
    var this$1$1 = this;

    var iterations = 0;
    return reify(
      this,
      this.toSeq()
        .map(function (v, k) { return mapper.call(context, [k, v], iterations++, this$1$1); })
        .fromEntrySeq()
    );
  },

  mapKeys: function mapKeys(mapper, context) {
    var this$1$1 = this;

    return reify(
      this,
      this.toSeq()
        .flip()
        .map(function (k, v) { return mapper.call(context, k, v, this$1$1); })
        .flip()
    );
  },
});

var KeyedCollectionPrototype = KeyedCollection.prototype;
KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
KeyedCollectionPrototype.toJSON = toObject;
KeyedCollectionPrototype.__toStringMapper = function (v, k) { return quoteString(k) + ': ' + quoteString(v); };

mixin(IndexedCollection, {
  

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  },

  

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },

  findIndex: function findIndex(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  indexOf: function indexOf(searchValue) {
    var key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  lastIndexOf: function lastIndexOf(searchValue) {
    var key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, false));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, false));
  },

  splice: function splice(index, removeNum ) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum || 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    
    
    
    index = resolveBegin(index, index < 0 ? this.count() : this.size);
    var spliced = this.slice(0, index);
    return reify(
      this,
      numArgs === 1
        ? spliced
        : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
    );
  },

  

  findLastIndex: function findLastIndex(predicate, context) {
    var entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  first: function first(notSetValue) {
    return this.get(0, notSetValue);
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  get: function get(index, notSetValue) {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find(function (_, key) { return key === index; }, undefined, notSetValue);
  },

  has: function has(index) {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index) !== -1)
    );
  },

  interpose: function interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave: function interleave() {
    var collections = [this].concat(arrCopy(arguments));
    var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
    var interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * collections.length;
    }
    return reify(this, interleaved);
  },

  keySeq: function keySeq() {
    return Range(0, this.size);
  },

  last: function last(notSetValue) {
    return this.get(-1, notSetValue);
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip: function zip() {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections));
  },

  zipAll: function zipAll() {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections, true));
  },

  zipWith: function zipWith(zipper ) {
    var collections = arrCopy(arguments);
    collections[0] = this;
    return reify(this, zipWithFactory(this, zipper, collections));
  },
});

var IndexedCollectionPrototype = IndexedCollection.prototype;
IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

mixin(SetCollection, {
  

  get: function get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },

  includes: function includes(value) {
    return this.has(value);
  },

  

  keySeq: function keySeq() {
    return this.valueSeq();
  },
});

var SetCollectionPrototype = SetCollection.prototype;
SetCollectionPrototype.has = CollectionPrototype.includes;
SetCollectionPrototype.contains = SetCollectionPrototype.includes;
SetCollectionPrototype.keys = SetCollectionPrototype.values;



mixin(KeyedSeq, KeyedCollectionPrototype);
mixin(IndexedSeq, IndexedCollectionPrototype);
mixin(SetSeq, SetCollectionPrototype);



function reduce(collection, reducer, reduction, context, useFirst, reverse) {
  assertNotInfinite(collection.size);
  collection.__iterate(function (v, k, c) {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

function defaultZipper() {
  return arrCopy(arguments);
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  var ordered = isOrdered(collection);
  var keyed = isKeyed(collection);
  var h = ordered ? 1 : 0;
  var size = collection.__iterate(
    keyed
      ? ordered
        ? function (v, k) {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : function (v, k) {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
      ? function (v) {
          h = (31 * h + hash(v)) | 0;
        }
      : function (v) {
          h = (h + hash(v)) | 0;
        }
  );
  return murmurHashOfSize(size, h);
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; 
}

var OrderedSet = /*@__PURE__*/(function (Set) {
  function OrderedSet(value) {
    return value === undefined || value === null
      ? emptyOrderedSet()
      : isOrderedSet(value)
      ? value
      : emptyOrderedSet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( Set ) OrderedSet.__proto__ = Set;
  OrderedSet.prototype = Object.create( Set && Set.prototype );
  OrderedSet.prototype.constructor = OrderedSet;

  OrderedSet.of = function of () {
    return this(arguments);
  };

  OrderedSet.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  OrderedSet.prototype.toString = function toString () {
    return this.__toString('OrderedSet {', '}');
  };

  return OrderedSet;
}(Set$1));

OrderedSet.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;
OrderedSetPrototype.zipAll = IndexedCollectionPrototype.zipAll;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(map, ownerID) {
  var set = Object.create(OrderedSetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_ORDERED_SET;
function emptyOrderedSet() {
  return (
    EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()))
  );
}

function throwOnInvalidDefaultValues(defaultValues) {
  if (isRecord(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Record as default values. Use a plain javascript object instead.'
    );
  }

  if (isImmutable(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Collection as default values. Use a plain javascript object instead.'
    );
  }

  if (defaultValues === null || typeof defaultValues !== 'object') {
    throw new Error(
      'Can not call `Record` with a non-object as default values. Use a plain javascript object instead.'
    );
  }
}

var Record = function Record(defaultValues, name) {
  var hasInitialized;

  throwOnInvalidDefaultValues(defaultValues);

  var RecordType = function Record(values) {
    var this$1$1 = this;

    if (values instanceof RecordType) {
      return values;
    }
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    if (!hasInitialized) {
      hasInitialized = true;
      var keys = Object.keys(defaultValues);
      var indices = (RecordTypePrototype._indices = {});
      
      
      
      RecordTypePrototype._name = name;
      RecordTypePrototype._keys = keys;
      RecordTypePrototype._defaultValues = defaultValues;
      for (var i = 0; i < keys.length; i++) {
        var propName = keys[i];
        indices[propName] = i;
        if (RecordTypePrototype[propName]) {
          
          typeof console === 'object' &&
            console.warn &&
            console.warn(
              'Cannot define ' +
                recordName(this) +
                ' with property "' +
                propName +
                '" since that property name is part of the Record API.'
            );
          
        } else {
          setProp(RecordTypePrototype, propName);
        }
      }
    }
    this.__ownerID = undefined;
    this._values = List().withMutations(function (l) {
      l.setSize(this$1$1._keys.length);
      KeyedCollection(values).forEach(function (v, k) {
        l.set(this$1$1._indices[k], v === this$1$1._defaultValues[k] ? undefined : v);
      });
    });
    return this;
  };

  var RecordTypePrototype = (RecordType.prototype =
    Object.create(RecordPrototype));
  RecordTypePrototype.constructor = RecordType;

  if (name) {
    RecordType.displayName = name;
  }

  return RecordType;
};

Record.prototype.toString = function toString () {
  var str = recordName(this) + ' { ';
  var keys = this._keys;
  var k;
  for (var i = 0, l = keys.length; i !== l; i++) {
    k = keys[i];
    str += (i ? ', ' : '') + k + ': ' + quoteString(this.get(k));
  }
  return str + ' }';
};

Record.prototype.equals = function equals (other) {
  return (
    this === other ||
    (isRecord(other) && recordSeq(this).equals(recordSeq(other)))
  );
};

Record.prototype.hashCode = function hashCode () {
  return recordSeq(this).hashCode();
};



Record.prototype.has = function has (k) {
  return this._indices.hasOwnProperty(k);
};

Record.prototype.get = function get (k, notSetValue) {
  if (!this.has(k)) {
    return notSetValue;
  }
  var index = this._indices[k];
  var value = this._values.get(index);
  return value === undefined ? this._defaultValues[k] : value;
};



Record.prototype.set = function set (k, v) {
  if (this.has(k)) {
    var newValues = this._values.set(
      this._indices[k],
      v === this._defaultValues[k] ? undefined : v
    );
    if (newValues !== this._values && !this.__ownerID) {
      return makeRecord(this, newValues);
    }
  }
  return this;
};

Record.prototype.remove = function remove (k) {
  return this.set(k);
};

Record.prototype.clear = function clear () {
  var newValues = this._values.clear().setSize(this._keys.length);

  return this.__ownerID ? this : makeRecord(this, newValues);
};

Record.prototype.wasAltered = function wasAltered () {
  return this._values.wasAltered();
};

Record.prototype.toSeq = function toSeq () {
  return recordSeq(this);
};

Record.prototype.toJS = function toJS$1 () {
  return toJS(this);
};

Record.prototype.entries = function entries () {
  return this.__iterator(ITERATE_ENTRIES);
};

Record.prototype.__iterator = function __iterator (type, reverse) {
  return recordSeq(this).__iterator(type, reverse);
};

Record.prototype.__iterate = function __iterate (fn, reverse) {
  return recordSeq(this).__iterate(fn, reverse);
};

Record.prototype.__ensureOwner = function __ensureOwner (ownerID) {
  if (ownerID === this.__ownerID) {
    return this;
  }
  var newValues = this._values.__ensureOwner(ownerID);
  if (!ownerID) {
    this.__ownerID = ownerID;
    this._values = newValues;
    return this;
  }
  return makeRecord(this, newValues, ownerID);
};

Record.isRecord = isRecord;
Record.getDescriptiveName = recordName;
var RecordPrototype = Record.prototype;
RecordPrototype[IS_RECORD_SYMBOL] = true;
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
RecordPrototype.getIn = getIn;
RecordPrototype.hasIn = CollectionPrototype.hasIn;
RecordPrototype.merge = merge$1;
RecordPrototype.mergeWith = mergeWith$1;
RecordPrototype.mergeIn = mergeIn;
RecordPrototype.mergeDeep = mergeDeep;
RecordPrototype.mergeDeepWith = mergeDeepWith;
RecordPrototype.mergeDeepIn = mergeDeepIn;
RecordPrototype.setIn = setIn;
RecordPrototype.update = update;
RecordPrototype.updateIn = updateIn;
RecordPrototype.withMutations = withMutations;
RecordPrototype.asMutable = asMutable;
RecordPrototype.asImmutable = asImmutable;
RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
RecordPrototype.toJSON = RecordPrototype.toObject =
  CollectionPrototype.toObject;
RecordPrototype.inspect = RecordPrototype.toSource = function () {
  return this.toString();
};

function makeRecord(likeRecord, values, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values;
  record.__ownerID = ownerID;
  return record;
}

function recordName(record) {
  return record.constructor.displayName || record.constructor.name || 'Record';
}

function recordSeq(record) {
  return keyedSeqFromValue(record._keys.map(function (k) { return [k, record.get(k)]; }));
}

function setProp(prototype, name) {
  try {
    Object.defineProperty(prototype, name, {
      get: function () {
        return this.get(name);
      },
      set: function (value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      },
    });
  } catch (error) {
    
  }
}

function equal(a, b) {
    return (a === b || is(a, b));
}
function hashCode(x) {
    return hash(x);
}
function newImmutableList(items) {
    return List(items);
}
function newImmutableSet(items) {
    return Set$1(items);
}
function newImmutableMap(entries) {
    return Map$1(entries);
}

const X = Symbol('X');
const Y = Symbol('Y');
function x(xy) {
    return (Array.isArray(xy) ? xy[0] : xy.x);
}
function y(xy) {
    return (Array.isArray(xy) ? xy[1] : xy.y);
}
function getOrthogonalDim(dim) {
    switch (dim) {
        case X: return Y;
        case Y: return X;
    }
}
class Point2D {
    constructor(arg0, arg1) {
        if (arg1 !== undefined) {
            this.x = arg0;
            this.y = arg1;
        }
        else {
            this.x = arg0[0];
            this.y = arg0[1];
        }
    }
    get [X]() {
        return this.x;
    }
    get [Y]() {
        return this.y;
    }
    times(factor) {
        return new Point2D(factor * this.x, factor * this.y);
    }
    hashCode() {
        const prime = 33413;
        let result = 1;
        result = prime * result + hashCode(this.x);
        result = prime * result + hashCode(this.y);
        return result;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (isNullish(o)) {
            return false;
        }
        else {
            const other = o;
            return (Object.is(other.x, this.x)
                && Object.is(other.y, this.y));
        }
    }
}
Point2D.ZERO = Object.freeze(new Point2D(0, 0));
class Size2D {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
    get [X]() {
        return this.w;
    }
    get [Y]() {
        return this.h;
    }
    scale(factor) {
        return new Size2D(this.w * factor, this.h * factor);
    }
    hashCode() {
        const prime = 9043;
        let result = 1;
        result = prime * result + hashCode(this.w);
        result = prime * result + hashCode(this.h);
        return result;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (isNullish(o)) {
            return false;
        }
        else {
            const other = o;
            return (Object.is(other.w, this.w)
                && Object.is(other.h, this.h));
        }
    }
}
Size2D.ZERO = Object.freeze(new Size2D(0, 0));

class Interval1D {
    
    static fromRect(min, approxSpan) {
        return new Interval1D(min, min + approxSpan);
    }
    static fromEdges(min, max) {
        return new Interval1D(min, max);
    }
    static point(v) {
        return new Interval1D(v, v);
    }
    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.span = this.max - this.min;
    }
    shift(shift) {
        return Interval1D.fromEdges(this.min + shift, this.max + shift);
    }
    scale(factor) {
        if (factor >= 0) {
            return Interval1D.fromEdges(factor * this.min, factor * this.max);
        }
        else {
            
            return Interval1D.fromEdges(nextUpFloat64(factor * this.max), nextUpFloat64(factor * this.min));
        }
    }
    round() {
        return Interval1D.fromEdges(Math.round(this.min), Math.round(this.max));
    }
    clamp(v) {
        return clamp(this.min, this.max, v);
    }
    valueToFrac(v) {
        return ((v - this.min) / this.span);
    }
    fracToValue(frac) {
        return (this.min + frac * this.span);
    }
    containsPoint(v) {
        return (this.min <= v && v < this.max);
    }
    containsInterval(other) {
        return (this.min <= other.min && other.max <= this.max);
    }
    intersectsInterval(other) {
        return !(this.min >= other.max || other.min >= this.max);
    }
    intersection(other) {
        const min = Math.max(this.min, other.min);
        const max = Math.min(this.max, other.max);
        return Interval1D.fromEdges(min, max);
    }
    minus(other) {
        if (other.max <= this.min || this.max <= other.min || other.max <= other.min) {
            return [this];
        }
        else if (other.min <= this.min) {
            if (this.max <= other.max) {
                return [];
            }
            else {
                return [Interval1D.fromEdges(other.max, this.max)];
            }
        }
        else {
            if (this.max <= other.max) {
                return [Interval1D.fromEdges(this.min, other.min)];
            }
            else {
                return [Interval1D.fromEdges(this.min, other.min), Interval1D.fromEdges(other.max, this.max)];
            }
        }
    }
    expand(frac, minSpan = 0.0) {
        const center = 0.5 * (this.min + this.max);
        const oldSpan = this.max - this.min;
        const newSpan = Math.max(0.0, minSpan, (1.0 + 2 * frac) * oldSpan);
        return Interval1D.fromEdges(center - 0.5 * newSpan, center + 0.5 * newSpan);
    }
    hashCode() {
        const prime = 9049;
        let result = 1;
        result = prime * result + hashCode(this.min);
        result = prime * result + hashCode(this.max);
        return result;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (isNullish(o)) {
            return false;
        }
        else {
            const other = o;
            return (Object.is(other.min, this.min)
                && Object.is(other.max, this.max));
        }
    }
}
Interval1D.ZERO = Object.freeze(Interval1D.point(0));
class Interval2D {
    static fromEdges(xMin, xMax, yMin, yMax) {
        const x = Interval1D.fromEdges(xMin, xMax);
        const y = Interval1D.fromEdges(yMin, yMax);
        return new Interval2D(x, y);
    }
    static fromRect(xMin, yMin, xSpan, ySpan) {
        const x = Interval1D.fromRect(xMin, xSpan);
        const y = Interval1D.fromRect(yMin, ySpan);
        return new Interval2D(x, y);
    }
    static point(xPoint, yPoint) {
        const x = Interval1D.point(xPoint);
        const y = Interval1D.point(yPoint);
        return new Interval2D(x, y);
    }
    static fromXy(x, y) {
        return new Interval2D(x, y);
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get [X]() {
        return this.x;
    }
    get [Y]() {
        return this.y;
    }
    get xMin() {
        return this.x.min;
    }
    get xMax() {
        return this.x.max;
    }
    get yMin() {
        return this.y.min;
    }
    get yMax() {
        return this.y.max;
    }
    get w() {
        return this.x.span;
    }
    get h() {
        return this.y.span;
    }
    get span() {
        return new Size2D(this.x.span, this.y.span);
    }
    get area() {
        return (Math.max(0, this.w) * Math.max(0, this.h));
    }
    withXEdges(xMin, xMax) {
        return new Interval2D(Interval1D.fromEdges(xMin, xMax), this.y);
    }
    withYEdges(yMin, yMax) {
        return new Interval2D(this.x, Interval1D.fromEdges(yMin, yMax));
    }
    round() {
        return new Interval2D(this.x.round(), this.y.round());
    }
    valueToFrac(v) {
        return new Point2D(this.x.valueToFrac(v.x), this.y.valueToFrac(v.y));
    }
    fracToValue(frac) {
        return new Point2D(this.x.fracToValue(frac.x), this.y.fracToValue(frac.y));
    }
    containsPoint(arg0, arg1) {
        let x;
        let y;
        if (arg1 === undefined) {
            const xy = arg0;
            x = xy.x;
            y = xy.y;
        }
        else {
            x = arg0;
            y = arg1;
        }
        return (this.x.containsPoint(x) && this.y.containsPoint(y));
    }
    containsInterval(other) {
        return (this.x.containsInterval(other.x) && this.y.containsInterval(other.y));
    }
    intersectsInterval(other) {
        return (this.x.intersectsInterval(other.x) && this.y.intersectsInterval(other.y));
    }
    intersection(other) {
        if (this.containsInterval(other)) {
            return other;
        }
        else if (other.containsInterval(this)) {
            return this;
        }
        else {
            const x = this.x.intersection(other.x);
            const y = this.y.intersection(other.y);
            return new Interval2D(x, y);
        }
    }
    shift(xShift, yShift) {
        const x = this.x.shift(xShift);
        const y = this.y.shift(yShift);
        return new Interval2D(x, y);
    }
    expand(xFrac, yFrac, xMinSpan = 0.0, yMinSpan = 0.0) {
        const x = this.x.expand(xFrac, xMinSpan);
        const y = this.y.expand(yFrac, yMinSpan);
        return new Interval2D(x, y);
    }
    hashCode() {
        const prime = 9059;
        let result = 1;
        result = prime * result + this.x.hashCode();
        result = prime * result + this.y.hashCode();
        return result;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (isNullish(o)) {
            return false;
        }
        else {
            const other = o;
            return (equal(other.x, this.x)
                && equal(other.y, this.y));
        }
    }
}
Interval2D.ZERO = Object.freeze(Interval2D.point(0, 0));

function basicEscapes(...escapes) {
    const escapesSet = new Set(escapes);
    return c => {
        return escapesSet.has(c);
    };
}
function basicDelims(...delims) {
    const delimsSet = new Set(delims);
    return c => {
        return delimsSet.has(c);
    };
}
function basicQuotePair(openQuote, closeQuote) {
    return {
        isOpen(c) {
            return c === openQuote;
        },
        isClose(c) {
            return c === closeQuote;
        },
    };
}
createLruCache(1024);
createLruCache(1024);
createLruCache(32);
createLruCache(32);
createLruCache(32);
function createLruCache(maxCacheSize) {
    const cache = new LinkedMap();
    return (k, computeValue) => {
        const v = cache.get(k);
        if (isDefined(v)) {
            cache.moveFirst(k);
            return v;
        }
        else {
            const vNew = computeValue();
            cache.putFirst(k, vNew);
            while (cache.size > maxCacheSize) {
                cache.removeLast();
            }
            return vNew;
        }
    };
}

const IMMEDIATE = Object.freeze({ immediate: true });
function withoutImmediate(flags) {
    return {
        once: flags.once,
        order: flags.order
    };
}
function withoutOnce(flags) {
    return {
        immediate: flags.immediate,
        order: flags.order
    };
}

function doHandleImmediateFlag(config, doImmediately, doAddListener) {
    if (config.immediate) {
        doImmediately();
        if (config.once) {
            return NOOP;
        }
    }
    const config2 = withoutImmediate(config);
    return doAddListener(config2);
}

let activeTxn = null;

function addToActiveTxn(member) {
    var _a, _b;
    const txn = activeTxn;
    if (!txn) {
        
        (_a = member.commit) === null || _a === void 0 ? void 0 : _a.call(member);
        (_b = member.postCommit) === null || _b === void 0 ? void 0 : _b.call(member);
    }
    else {
        
        txn.push(member);
    }
}
function doTxn(task) {
    var _a, _b, _c;
    if (activeTxn) {
        
        return task();
    }
    else {
        const txn = [];
        let result;
        activeTxn = txn;
        try {
            
            result = task();
            
            for (const member of txn) {
                (_a = member.commit) === null || _a === void 0 ? void 0 : _a.call(member);
            }
        }
        catch (e) {
            
            for (const member of arrayReverseIterable(txn)) {
                (_b = member.rollback) === null || _b === void 0 ? void 0 : _b.call(member);
            }
            
            throw e;
        }
        finally {
            activeTxn = null;
        }
        
        
        for (const member of txn) {
            (_c = member.postCommit) === null || _c === void 0 ? void 0 : _c.call(member);
        }
        return result;
    }
}

function argsForAddListener(a, b) {
    if (b === undefined) {
        return [{}, a];
    }
    else {
        return [a, b];
    }
}
class ListenableBasic {
    constructor() {
        this.entries = new CowArray();
    }
    addListener(a, b) {
        const [config, listener] = argsForAddListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const entry = { config, listener };
        if (entry.config.immediate) {
            entry.listener();
            if (entry.config.once) {
                return NOOP;
            }
        }
        this.entries.push(entry);
        this.entries.sortStable((a, b) => {
            return (numberOr(a.config.order, 0) - numberOr(b.config.order, 0));
        });
        return () => {
            this.entries.removeFirst(entry);
        };
    }
    fire() {
        addToActiveTxn({
            postCommit: () => {
                for (const entry of this.entries) {
                    entry.listener();
                    if (entry.config.once) {
                        
                        this.entries.removeFirst(entry);
                    }
                }
            }
        });
    }
}
class ListenableSet {
    constructor(...members) {
        this.members = arrayClone(members);
    }
    addListener(a, b) {
        const [config, listener] = argsForAddListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        return doHandleImmediateFlag(config, listener, config2 => {
            const disposers = new DisposerGroup();
            if (config2.once) {
                const config3 = withoutOnce(config2);
                const listener2 = () => {
                    listener();
                    disposers.dispose();
                };
                for (const member of this.members) {
                    disposers.add(member.addListener(config3, listener2));
                }
            }
            else {
                for (const member of this.members) {
                    disposers.add(member.addListener(config2, listener));
                }
            }
            return disposers;
        });
    }
}
function listenable(...listenables) {
    return new ListenableSet(...listenables);
}

function argsForAddActivityListener(a, b) {
    if (b === undefined) {
        return [{}, a];
    }
    else {
        return [a, b];
    }
}
function doAddActivityListener(ongoing, completed, config, listener) {
    const disposers = new DisposerGroup();
    if (config.once) {
        const config2 = withoutOnce(config);
        disposers.add(ongoing.addListener(config2, () => {
            listener(true);
            disposers.dispose();
        }));
        disposers.add(completed.addListener(config2, () => {
            listener(false);
            disposers.dispose();
        }));
    }
    else {
        disposers.add(ongoing.addListener(config, () => {
            listener(true);
        }));
        disposers.add(completed.addListener(config, () => {
            listener(false);
        }));
    }
    return disposers;
}
class ActivityListenableBasic {
    constructor() {
        this._ongoing = new ListenableBasic();
        this._completed = new ListenableBasic();
        this._all = listenable(this._ongoing, this._completed);
    }
    get completed() {
        return this._completed;
    }
    get all() {
        return this._all;
    }
    addListener(a, b) {
        const [config, listener] = argsForAddActivityListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const doImmediately = () => listener(false);
        return doHandleImmediateFlag(config, doImmediately, config2 => {
            return doAddActivityListener(this._ongoing, this._completed, config2, listener);
        });
    }
    fire(ongoing) {
        (ongoing ? this._ongoing : this._completed).fire();
    }
}
class ActivityListenableSet {
    constructor(...members) {
        this.members = arrayClone(members);
        this._completed = completedListenable(...members);
        this._all = allListenable(...members);
    }
    get completed() {
        return this._completed;
    }
    get all() {
        return this._all;
    }
    addListener(a, b) {
        const [config, listener] = argsForAddActivityListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const doImmediately = () => listener(false);
        return doHandleImmediateFlag(config, doImmediately, config2 => {
            const disposers = new DisposerGroup();
            if (config2.once) {
                const config3 = withoutOnce(config2);
                const listener2 = (ongoing) => {
                    listener(ongoing);
                    disposers.dispose();
                };
                for (const member of this.members) {
                    disposers.add(member.addListener(config3, listener2));
                }
            }
            else {
                for (const member of this.members) {
                    disposers.add(member.addListener(config2, listener));
                }
            }
            return disposers;
        });
    }
}
function completedListenable(...listenables) {
    return new ListenableSet(...listenables.map(listenable => listenable.completed));
}
function allListenable(...listenables) {
    return new ListenableSet(...listenables.map(listenable => listenable.all));
}
function activityListenable(...members) {
    return new ActivityListenableSet(...members.map(m => {
        return ('changes' in m ? m.changes : m);
    }));
}

var _a, _b$1;
const IS_REF_SYMBOL = '@@__GLEAM_REF__@@';
function filterListener(rawListener, equals, getValue) {
    let value = getValue();
    return () => {
        const oldValue = value;
        const newValue = getValue();
        if (!equals(newValue, oldValue)) {
            
            value = newValue;
            
            rawListener();
        }
    };
}
function filterActivityListener(rawListener, equals, getValue) {
    let value = getValue();
    let hasOngoingChanges = false;
    return ongoing => {
        const oldValue = value;
        const newValue = getValue();
        if ((!ongoing && hasOngoingChanges) || !equals(newValue, oldValue)) {
            
            value = newValue;
            
            
            
            hasOngoingChanges = ongoing;
            
            rawListener(ongoing);
        }
    };
}
class FilteredListenable {
    constructor(rawListenable, equals, getValue) {
        this.rawListenable = rawListenable;
        this.equals = equals;
        this.getValue = getValue;
    }
    addListener(a, b) {
        const [config, listener] = argsForAddListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        return doHandleImmediateFlag(config, listener, config2 => {
            return this.rawListenable.addListener(config2, filterListener(listener, this.equals, this.getValue));
        });
    }
}
function filterListenable(rawListenable, equals, getValue) {
    return new FilteredListenable(rawListenable, equals, getValue);
}

class RefBasic {
    constructor(value, equatorFn, validatorFn = alwaysTrue) {
        this[_a] = true;
        this.ongoingRaw = new ListenableBasic();
        this.completedRaw = new ListenableBasic();
        const allRaw = listenable(this.ongoingRaw, this.completedRaw);
        this._equatorFn = equatorFn;
        this.validatorFn = validatorFn;
        this.ongoingFiltered = filterListenable(this.ongoingRaw, this._equatorFn, () => this.value);
        this.completedFiltered = filterListenable(this.completedRaw, this._equatorFn, () => this.value);
        this.allFiltered = filterListenable(allRaw, this._equatorFn, () => this.value);
        this.value = this.requireValid(value);
        this.hasOngoingChanges = false;
        this.hasTxnMember = false;
    }
    isValid(value) {
        return this.validatorFn(value);
    }
    requireValid(value) {
        if (this.isValid(value)) {
            return value;
        }
        else {
            throw new Error('Value rejected by validate function');
        }
    }
    areEqual(a, b) {
        return this.equatorFn(a, b);
    }
    get equatorFn() {
        return this._equatorFn;
    }
    get v() {
        return this.value;
    }
    set(ongoing, value) {
        return this.doSet(ongoing, value);
    }
    update(ongoing, update) {
        return this.set(ongoing, update(this.v));
    }
    updateIfNonNullish(ongoing, updateFn) {
        if (isNonNullish(this.v)) {
            return this.set(ongoing, updateFn(this.v));
        }
        else {
            return false;
        }
    }
    doSet(ongoing, value) {
        if ((!ongoing && this.hasOngoingChanges) || !this.areEqual(value, this.value)) {
            this.requireValid(value);
            
            
            if (!this.hasTxnMember) {
                this.hasTxnMember = true;
                const rollbackValue = this.value;
                addToActiveTxn({
                    rollback: () => {
                        this.value = rollbackValue;
                        this.hasTxnMember = false;
                    },
                    commit: () => {
                        this.hasTxnMember = false;
                    }
                });
            }
            
            this.value = value;
            
            
            
            this.hasOngoingChanges = ongoing;
            
            (ongoing ? this.ongoingRaw : this.completedRaw).fire();
            return true;
        }
        else {
            return false;
        }
    }
    get completed() {
        return this.completedFiltered;
    }
    get all() {
        return this.allFiltered;
    }
    addListener(a, b) {
        const [config, listener] = argsForAddActivityListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const doImmediately = () => listener(false);
        return doHandleImmediateFlag(config, doImmediately, config2 => {
            const listener2 = filterActivityListener(listener, this._equatorFn, () => this.value);
            return doAddActivityListener(this.ongoingRaw, this.completedRaw, config2, listener2);
        });
    }
}
_a = IS_REF_SYMBOL;

class ReadableRefDerived {
    constructor(...listenables) {
        this[_b$1] = true;
        this.listenables = new ActivityListenableSet(...listenables);
        this.valueFn = () => this.v;
        this.equatorFn = (a, b) => this.areEqual(a, b);
        this._completed = filterListenable(this.listenables.completed, this.equatorFn, this.valueFn);
        this._all = filterListenable(this.listenables.all, this.equatorFn, this.valueFn);
    }
    get completed() {
        return this._completed;
    }
    get all() {
        return this._all;
    }
    addListener(a, b) {
        const [config, listener] = argsForAddActivityListener(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const doImmediately = () => listener(false);
        return doHandleImmediateFlag(config, doImmediately, config2 => {
            return this.listenables.addListener(config2, filterActivityListener(listener, this.equatorFn, this.valueFn));
        });
    }
}
_b$1 = IS_REF_SYMBOL;
class ReadableRefDerivedCaching extends ReadableRefDerived {
    constructor(...upstreamRefs) {
        super(...upstreamRefs);
        this.upstream = new Map();
        for (const upstreamRef of upstreamRefs) {
            this.upstream.set(upstreamRef, upstreamRef.v);
        }
        
        this.value = ReadableRefDerivedCaching.UNINITIALIZED;
    }
    static hasValueChanges(refValues) {
        for (const [ref, oldValue] of refValues) {
            const newValue = ref.v;
            if (!ref.areEqual(newValue, oldValue)) {
                return true;
            }
        }
        return false;
    }
    get v() {
        if (this.value === ReadableRefDerivedCaching.UNINITIALIZED || ReadableRefDerivedCaching.hasValueChanges(this.upstream)) {
            for (const upstreamRef of this.upstream.keys()) {
                this.upstream.set(upstreamRef, upstreamRef.v);
            }
            this.value = this.compute();
        }
        return this.value;
    }
}
ReadableRefDerivedCaching.UNINITIALIZED = Symbol('UNINITIALIZED');

class RefDerived extends ReadableRefDerived {
    constructor(...listenables) {
        super(...listenables);
    }
    set(ongoing, value) {
        return this.doSet(ongoing, value);
    }
    update(ongoing, update) {
        return this.set(ongoing, update(this.v));
    }
    updateIfNonNullish(ongoing, updateFn) {
        if (isNonNullish(this.v)) {
            return this.set(ongoing, updateFn(this.v));
        }
        else {
            return false;
        }
    }
}

function _addOldNewActivityListener(ref, config, listener) {
    if (config.immediate) {
        listener(false, undefined, ref.v);
        if (config.once) {
            return NOOP;
        }
    }
    
    let value = ref.v;
    let hasOngoingChanges = false;
    const config2 = withoutImmediate(config);
    return ref.addListener(config2, ongoing => {
        const oldValue = value;
        const newValue = ref.v;
        if ((!ongoing && hasOngoingChanges) || !ref.areEqual(newValue, oldValue)) {
            
            value = newValue;
            
            
            
            hasOngoingChanges = ongoing;
            
            listener(ongoing, oldValue, newValue);
        }
    });
}

function argsForAddConsumer(a, b) {
    if (b === undefined) {
        return [{}, a];
    }
    else {
        return [a, b];
    }
}
class NotifierBasic {
    constructor(immediateArg) {
        this.immediateArg = immediateArg;
        this.entries = new CowArray();
    }
    addListener(a, b) {
        const [config, listener] = argsForAddConsumer(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const entry = { config, listener };
        if (entry.config.immediate) {
            entry.listener(this.immediateArg);
            if (entry.config.once) {
                return NOOP;
            }
        }
        this.entries.push(entry);
        this.entries.sortStable((a, b) => {
            return (numberOr(a.config.order, 0) - numberOr(b.config.order, 0));
        });
        return () => {
            this.entries.removeFirst(entry);
        };
    }
    fire(t) {
        addToActiveTxn({
            postCommit: () => {
                for (const entry of this.entries) {
                    entry.listener(t);
                    if (entry.config.once) {
                        
                        this.entries.removeFirst(entry);
                    }
                }
            }
        });
    }
}

/*!
 * @metsci/gleam-core
 *
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

const cssUrl = new URL("assets/@metsci/gleam-core/69436c73-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink = createCssLink(cssUrl);
function createGleamCoreDefaultStyle() {
    return cssLink.cloneNode(true);
}
const defaultStyle = appendCssLink(document.head, createGleamCoreDefaultStyle());
const gleamCoreDefaultStyleLoading = defaultStyle.loading;

class ArrayWithZIndices {
    constructor() {
        this.array = new CowArray();
        this.arrayNeedsSorting = false;
        this.zwMap = new Map();
        this.wNext = 1;
        const _this = this;
        this.inReverse = {
            [Symbol.iterator]() {
                return _this.reverseIterator();
            }
        };
    }
    add(item, zIndex = 0) {
        this.array.push(item);
        const w = this.wNext++;
        this.zwMap.set(item, [zIndex, w]);
        this.arrayNeedsSorting = true;
        return () => {
            this.delete(item);
        };
    }
    has(item) {
        return this.zwMap.has(item);
    }
    delete(item) {
        this.array.removeFirst(item);
        this.zwMap.delete(item);
    }
    getZIndex(item) {
        if (!this.zwMap.has(item)) {
            throw new Error('Item not found');
        }
        const [z] = requireDefined(this.zwMap.get(item));
        return z;
    }
    setZIndex(item, zIndex) {
        this.appendToZIndex(item, zIndex);
    }
    prependToZIndex(item, zIndex) {
        if (!this.zwMap.has(item)) {
            throw new Error('Item not found');
        }
        
        const w = -1 * this.wNext++;
        this.zwMap.set(item, [zIndex, w]);
        this.arrayNeedsSorting = true;
    }
    appendToZIndex(item, zIndex) {
        if (!this.zwMap.has(item)) {
            throw new Error('Item not found');
        }
        const w = this.wNext++;
        this.zwMap.set(item, [zIndex, w]);
        this.arrayNeedsSorting = true;
    }
    clear() {
        this.array.clear();
        this.zwMap.clear();
        this.arrayNeedsSorting = false;
    }
    sortAndGetArray() {
        if (this.arrayNeedsSorting) {
            this.array.sort((a, b) => {
                const [zA, wA] = requireDefined(this.zwMap.get(a));
                const [zB, wB] = requireDefined(this.zwMap.get(b));
                
                const zComparison = zA - zB;
                if (zComparison !== 0) {
                    return zComparison;
                }
                
                const wComparison = wA - wB;
                return wComparison;
            });
            this.arrayNeedsSorting = false;
        }
        return this.array;
    }
    [Symbol.iterator]() {
        const sorted = this.sortAndGetArray();
        return sorted[Symbol.iterator]();
    }
    reverseIterator() {
        const sorted = this.sortAndGetArray();
        return sorted.reverseIterator();
    }
}

function isnum(x) {
    return (typeof x === 'number');
}
function isobj(x) {
    return (typeof x === 'object' && x !== null);
}
function isstr(x) {
    return (typeof x === 'string');
}
function isfn(x) {
    return (typeof x === 'function');
}
function frozenSupplier(value) {
    Object.freeze(value);
    return () => value;
}
areTypedArraysLittleEndian();
function areTypedArraysLittleEndian() {
    const magic = 0x12345678;
    const buffer = new ArrayBuffer(4);
    (new Uint32Array(buffer))[0] = magic;
    const dataView = new DataView(buffer);
    if (dataView.getInt32(0, true) === magic) {
        return true;
    }
    else if (dataView.getInt32(0, false) === magic) {
        return false;
    }
    else {
        throw new Error();
    }
}
function attachEventListener(source, type, useCapture, listener) {
    source.addEventListener(type, listener, useCapture);
    return () => {
        source.removeEventListener(type, listener, useCapture);
    };
}

class NotifierTree {
    constructor(immediateArg) {
        this.immediateArg = immediateArg;
        this.parent = null;
        this.children = [];
        this.ownEntries = [];
        this.ownEntriesDirty = false;
        this.subtreeEntries = null;
    }
    setParent(parent) {
        if (this.parent) {
            arrayRemoveFirst(this.parent.children, this);
            this.parent.setSubtreeEntriesDirty();
            this.parent = null;
        }
        if (parent) {
            this.parent = parent;
            this.parent.children.push(this);
            this.parent.setSubtreeEntriesDirty();
        }
    }
    addListener(a, b) {
        const [config, listener] = argsForAddConsumer(a, b);
        return this.doAddListener(config, listener);
    }
    doAddListener(config, listener) {
        const entry = { config, listener };
        if (entry.config.immediate) {
            entry.listener(this.immediateArg);
            if (entry.config.once) {
                return NOOP;
            }
        }
        this.ownEntries.push(entry);
        this.ownEntriesDirty = true;
        this.setSubtreeEntriesDirty();
        return () => {
            arrayRemoveLast(this.ownEntries, entry);
            this.removeSubtreeEntry(entry);
        };
    }
    setSubtreeEntriesDirty() {
        this.subtreeEntries = null;
        if (this.parent) {
            this.parent.setSubtreeEntriesDirty();
        }
    }
    removeSubtreeEntry(entry) {
        let i;
        if (this.subtreeEntries) {
            i = arrayRemoveLast(this.subtreeEntries, entry);
        }
        else {
            i = null;
        }
        if (this.parent) {
            this.parent.removeSubtreeEntry(entry);
        }
        return i;
    }
    sortAndGetOwnEntries() {
        if (this.ownEntriesDirty) {
            arraySortStable(this.ownEntries, (a, b) => {
                return (numberOr(a.config.order, 0) - numberOr(b.config.order, 0));
            });
            this.ownEntriesDirty = false;
        }
        return this.ownEntries;
    }
    getSubtreeEntryLists() {
        const result = [this.sortAndGetOwnEntries()];
        for (const child of this.children) {
            result.push(...child.getSubtreeEntryLists());
        }
        return result;
    }
    doSubtreeFire(t) {
        if (!this.subtreeEntries) {
            const entryLists = this.getSubtreeEntryLists();
            this.subtreeEntries = mergePreSortedLists(entryLists, (a, b) => {
                return (numberOr(a.config.order, 0) - numberOr(b.config.order, 0));
            });
        }
        for (let i = 0; i < this.subtreeEntries.length; i++) {
            const entry = this.subtreeEntries[i];
            entry.listener(t);
            if (entry.config.once) {
                arrayRemoveLast(this.ownEntries, entry);
                const iRemoved = this.removeSubtreeEntry(entry);
                if (iRemoved !== null && iRemoved <= i) {
                    i--;
                }
            }
        }
    }
    fire(t) {
        this.getRoot().doSubtreeFire(t);
    }
    getRoot() {
        return (this.parent === null ? this : this.parent.getRoot());
    }
}
function mergePreSortedLists(lists, compare) {
    
    const lists2 = arrayClone(lists);
    arraySortStable(lists2, (a, b) => {
        return (a.length - b.length);
    });
    return doMergePreSortedLists(lists2, compare);
}
function doMergePreSortedLists(lists, compare) {
    switch (lists.length) {
        case 0: {
            return [];
        }
        case 1: {
            return arrayClone(lists[0]);
        }
        case 2: {
            const result = [];
            let iA = 0;
            let iB = 0;
            const listA = lists[0];
            const listB = lists[1];
            while (iA < listA.length && iB < listB.length) {
                const vA = listA[iA];
                const vB = listB[iB];
                if (compare(vA, vB) <= 0) {
                    result.push(vA);
                    iA++;
                }
                else {
                    result.push(vB);
                    iB++;
                }
            }
            while (iA < listA.length) {
                const vA = listA[iA];
                result.push(vA);
                iA++;
            }
            while (iB < listB.length) {
                const vB = listB[iB];
                result.push(vB);
                iB++;
            }
            return result;
        }
        default: {
            const split = Math.floor(lists.length / 2);
            const listsA = lists.slice(0, split);
            const listsB = lists.slice(split);
            const resultA = doMergePreSortedLists(listsA, compare);
            const resultB = doMergePreSortedLists(listsB, compare);
            return doMergePreSortedLists([resultA, resultB], compare);
        }
    }
}

class Entry {
    constructor(x, y, w, h, value) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.value = value;
    }
    get bounds() {
        return Interval2D.fromRect(this.x, this.y, this.w, this.h);
    }
}
class RootColumn {
    static create(maxDim) {
        return new RootColumn(maxDim, Object.freeze([]));
    }
    constructor(maxDim, rows) {
        this.maxDim = maxDim;
        this.rows = rows;
    }
    *entries() {
        for (const row of this.rows) {
            yield* row.entries();
        }
    }
    usedSize() {
        let w = 0;
        let h = 0;
        for (const row of this.rows) {
            const rowSize = row.usedSize();
            w = Math.max(w, rowSize.w);
            h += rowSize.h;
        }
        return new Size2D(w, h);
    }
    plusItem(w, h, value, canGrow) {
        const resultA = this.doPlusItemA(w, h, value);
        const resultB = this.doPlusItemB(w, h, value);
        if (resultA === null) {
            return resultB;
        }
        if (resultB === null) {
            return resultA;
        }
        
        const sizeA = resultA.usedSize();
        const sizeB = resultB.usedSize();
        const ratioA = Math.min(sizeA.w, sizeA.h) / Math.max(sizeA.w, sizeA.h);
        const ratioB = Math.min(sizeB.w, sizeB.h) / Math.max(sizeB.w, sizeB.h);
        return (ratioA > ratioB ? resultA : resultB);
    }
    doPlusItemA(w, h, value) {
        let replacementRow = null;
        let replacementIndex = -1;
        for (let i = 0; i < this.rows.length; i++) {
            const oldRow = this.rows[i];
            const newRow = oldRow.plusItem(w, h, value, false);
            if (newRow !== null && (replacementRow === null || newRow.usedSize().w < replacementRow.usedSize().w)) {
                replacementRow = newRow;
                replacementIndex = i;
            }
        }
        if (replacementRow === null) {
            return null;
        }
        else {
            const newRows = Array.from(this.rows);
            newRows[replacementIndex] = replacementRow;
            return new RootColumn(this.maxDim, Object.freeze(newRows));
        }
    }
    doPlusItemB(w, h, value) {
        const x = 0;
        let y = 0;
        if (this.rows.length > 0) {
            const lastRow = this.rows[this.rows.length - 1];
            y = lastRow.head.y + lastRow.head.h;
        }
        if (x + w > this.maxDim || y + h > this.maxDim) {
            return null;
        }
        else {
            const newHead = new Entry(x, y, w, h, value);
            const newRow = Row.create(newHead, this.maxDim);
            const newRows = Array.from(this.rows);
            newRows.push(newRow);
            return new RootColumn(this.maxDim, Object.freeze(newRows));
        }
    }
}
class Row {
    static create(head, wMax) {
        return new Row(head, wMax, Object.freeze([]));
    }
    constructor(head, wMax, columns) {
        this.head = head;
        this.wMax = wMax;
        this.columns = columns;
    }
    *entries() {
        yield this.head;
        for (const column of this.columns) {
            yield* column.entries();
        }
    }
    usedSize() {
        const h = this.head.h;
        const lastColumn = this.columns[this.columns.length - 1];
        const w = (lastColumn === undefined ? this.head.w : lastColumn.head.x + lastColumn.head.w - this.head.x);
        return new Size2D(w, h);
    }
    plusItem(w, h, value, canGrow) {
        
        if (h <= this.head.h) {
            for (let i = 0; i < this.columns.length; i++) {
                const oldColumn = this.columns[i];
                const isLastColumn = (i === this.columns.length - 1);
                const newColumn = oldColumn.plusItem(w, h, value, isLastColumn);
                if (newColumn !== null) {
                    const newColumns = Array.from(this.columns);
                    newColumns[i] = newColumn;
                    return new Row(this.head, this.wMax, Object.freeze(newColumns));
                }
            }
        }
        
        const lastColumn = this.columns[this.columns.length - 1];
        const xLastColumnEnd = (lastColumn === undefined ? this.head.x + this.head.w : lastColumn.head.x + lastColumn.head.w);
        const wUsed = xLastColumnEnd - this.head.x;
        
        if (wUsed + w > this.wMax) {
            return null;
        }
        
        if (h <= this.head.h) {
            const xNewColumn = xLastColumnEnd;
            const newHead = new Entry(xNewColumn, this.head.y, w, h, value);
            const newColumn = Column.create(newHead, this.head.h);
            const newColumns = Array.from(this.columns);
            newColumns.push(newColumn);
            return new Row(this.head, this.wMax, Object.freeze(newColumns));
        }
        
        if (canGrow) {
            const newHead = new Entry(this.head.x, this.head.y, w, h, value);
            let newRow = Row.create(newHead, this.wMax);
            for (const en of this.entries()) {
                const tempRow = newRow.plusItem(en.w, en.h, en.value, false);
                if (tempRow === null) {
                    
                    return null;
                }
                newRow = tempRow;
            }
            return newRow;
        }
        
        return null;
    }
}
class Column {
    static create(head, hMax) {
        return new Column(head, hMax, Object.freeze([]));
    }
    constructor(head, hMax, rows) {
        this.head = head;
        this.hMax = hMax;
        this.rows = rows;
    }
    *entries() {
        yield this.head;
        for (const row of this.rows) {
            yield* row.entries();
        }
    }
    usedSize() {
        const w = this.head.w;
        const lastRow = this.rows[this.rows.length - 1];
        const h = (lastRow === undefined ? this.head.h : lastRow.head.y + lastRow.head.h - this.head.y);
        return new Size2D(w, h);
    }
    plusItem(w, h, value, canGrow) {
        
        if (w <= this.head.w) {
            for (let i = 0; i < this.rows.length; i++) {
                const oldRow = this.rows[i];
                const isLastRow = (i === this.rows.length - 1);
                const newRow = oldRow.plusItem(w, h, value, isLastRow);
                if (newRow !== null) {
                    const newRows = Array.from(this.rows);
                    newRows[i] = newRow;
                    return new Column(this.head, this.hMax, Object.freeze(newRows));
                }
            }
        }
        
        const lastRow = this.rows[this.rows.length - 1];
        const yLastRowEnd = (lastRow === undefined ? this.head.y + this.head.h : lastRow.head.y + lastRow.head.h);
        const hUsed = yLastRowEnd - this.head.y;
        
        if (hUsed + h > this.hMax) {
            return null;
        }
        
        if (w <= this.head.w) {
            const yNewRow = yLastRowEnd;
            const newHead = new Entry(this.head.x, yNewRow, w, h, value);
            const newRow = Row.create(newHead, this.head.w);
            const newRows = Array.from(this.rows);
            newRows.push(newRow);
            return new Column(this.head, this.hMax, Object.freeze(newRows));
        }
        
        if (canGrow) {
            const newHead = new Entry(this.head.x, this.head.y, w, h, value);
            let newColumn = Column.create(newHead, this.hMax);
            for (const en of this.entries()) {
                const tempColumn = newColumn.plusItem(en.w, en.h, en.value, false);
                if (tempColumn === null) {
                    
                    return null;
                }
                newColumn = tempColumn;
            }
            return newColumn;
        }
        
        return null;
    }
}
class Atlas {
    constructor(maxDim) {
        this.maxDim = maxDim;
        this.w_PX = 0;
        this.h_PX = 0;
        this.bytes = new Uint8ClampedArray(4 * this.w_PX * this.h_PX);
        this.currRevs = new Map();
        this.rootBucket = RootColumn.create(this.maxDim);
        this.images = new Map();
        this.boxes = new Map();
        this.maxInnerAscent = 0;
        this.maxInnerDescent = 0;
        this.addedImages = new Map();
    }
    get size() {
        this.commit();
        return this.images.size;
    }
    *[Symbol.iterator]() {
        this.commit();
        for (const [key, image] of this.images) {
            const box = requireDefined(this.boxes.get(key));
            yield [key, image, box];
        }
    }
    put(key, image) {
        this.addedImages.set(key, image);
    }
    putAll(images) {
        for (const [key, image] of images.entries()) {
            this.put(key, image);
        }
    }
    has(key) {
        return (this.images.has(key) || this.addedImages.has(key));
    }
    
    get(key) {
        this.commit();
        const image = this.images.get(key);
        if (image === undefined) {
            return undefined;
        }
        else {
            const box = requireDefined(this.boxes.get(key));
            return [image, box];
        }
    }
    getUsedArea() {
        this.commit();
        return this.rootBucket.usedSize();
    }
    getPixels() {
        this.commit();
        const wSrc = this.w_PX;
        const srcBytes = this.bytes;
        const used = this.rootBucket.usedSize();
        const wDest = used.w;
        const hDest = used.h;
        const destBytes = new Uint8ClampedArray(4 * wDest * hDest);
        for (let y = 0; y < hDest; y++) {
            const srcRow = srcBytes.subarray(4 * (y * wSrc + 0), 4 * (y * wSrc + wDest));
            destBytes.set(srcRow, 4 * y * wDest);
        }
        return new ImageData(destBytes, wDest, hDest);
    }
    getPixelBytes() {
        this.commit();
        const wSrc = this.w_PX;
        const srcBytes = this.bytes;
        const used = this.rootBucket.usedSize();
        const wDest = used.w;
        const hDest = used.h;
        const destBytes = new Uint8ClampedArray(4 * wDest * hDest);
        for (let y = 0; y < hDest; y++) {
            const srcRow = srcBytes.subarray(4 * (y * wSrc + 0), 4 * (y * wSrc + wDest));
            destBytes.set(srcRow, 4 * y * wDest);
        }
        return destBytes;
    }
    
    getMaxInnerAscent() {
        this.commit();
        return this.maxInnerAscent;
    }
    
    getMaxInnerDescent() {
        this.commit();
        return this.maxInnerDescent;
    }
    clear() {
        this.rootBucket = RootColumn.create(this.maxDim);
        this.currRevs.clear();
        this.images.clear();
        this.boxes.clear();
        this.maxInnerAscent = 0;
        this.maxInnerDescent = 0;
        this.addedImages.clear();
    }
    repack() {
        
        for (const [key, image] of this.images) {
            if (!this.addedImages.has(key)) {
                this.addedImages.set(key, image);
            }
        }
        
        this.rootBucket = RootColumn.create(this.maxDim);
        this.currRevs.clear();
        this.images.clear();
        this.boxes.clear();
    }
    commit() {
        var _a;
        if (this.addedImages.size > 0) {
            
            const addedTuples = Array.from(this.addedImages.entries());
            arraySortStable(addedTuples, (a, b) => {
                const aImage = a[1];
                const bImage = b[1];
                const heightComparison = -1 * (aImage.imageData.height - bImage.imageData.height);
                if (heightComparison !== 0) {
                    return heightComparison;
                }
                const widthComparison = -1 * (aImage.imageData.width - bImage.imageData.width);
                if (widthComparison !== 0) {
                    return widthComparison;
                }
                return 0;
            });
            
            for (const [key, image] of addedTuples) {
                const rev = ((_a = this.currRevs.get(key)) !== null && _a !== void 0 ? _a : -1) + 1;
                this.currRevs.set(key, rev);
                const tempBucket = this.rootBucket.plusItem(image.imageData.width, image.imageData.height, { key, rev }, false);
                if (tempBucket === null) {
                    throw new Error('Failed to pack image');
                }
                this.rootBucket = tempBucket;
            }
            
            const newBoxes = new Map();
            for (const en of this.rootBucket.entries()) {
                if (en.value !== null) {
                    const { key, rev } = en.value;
                    if (rev === this.currRevs.get(key)) {
                        newBoxes.set(key, en.bounds);
                    }
                }
            }
            
            const newImages = new Map(this.images);
            for (const [key, image] of addedTuples) {
                newImages.set(key, image);
            }
            
            const minSize = this.rootBucket.usedSize();
            let newWidth = this.w_PX;
            if (this.w_PX < minSize.w) {
                newWidth = Math.min(this.maxDim, Math.max(minSize.w, Math.ceil(1.618 * this.w_PX)));
            }
            let newHeight = this.h_PX;
            if (this.h_PX < minSize.h) {
                newHeight = Math.min(this.maxDim, Math.max(minSize.h, Math.ceil(1.618 * this.h_PX)));
            }
            if (newWidth !== this.w_PX || newHeight !== this.h_PX) {
                this.w_PX = newWidth;
                this.h_PX = newHeight;
                this.bytes = new Uint8ClampedArray(4 * this.w_PX * this.h_PX);
                
                this.boxes.clear();
            }
            
            for (const [key, newBox] of newBoxes.entries()) {
                const oldBox = this.boxes.get(key);
                const oldImage = this.images.get(key);
                const newImage = requireDefined(newImages.get(key));
                if (!equal(newBox, oldBox) || newImage !== oldImage) {
                    const src = newImage.imageData;
                    if (src.width !== newBox.w || src.height !== newBox.h) {
                        throw new Error();
                    }
                    const wSrc = src.width;
                    const hSrc = src.height;
                    const srcBytes = src.data;
                    const wDest = this.w_PX;
                    const xDest0 = newBox.x.min;
                    const yDest0 = newBox.y.min;
                    const iDest0 = 4 * (yDest0 * wDest + xDest0);
                    const destBytes = this.bytes;
                    for (let ySrc = 0; ySrc < hSrc; ySrc++) {
                        const srcRow = srcBytes.subarray(4 * (ySrc + 0) * wSrc, 4 * (ySrc + 1) * wSrc);
                        destBytes.set(srcRow, iDest0 + 4 * ySrc * wDest);
                    }
                }
            }
            
            for (const [_, image] of addedTuples) {
                const innerAscent = image.yAnchor - image.border;
                this.maxInnerAscent = Math.max(this.maxInnerAscent, innerAscent);
            }
            
            for (const [_, image] of addedTuples) {
                const innerDescent = image.imageData.height - image.border - image.yAnchor;
                this.maxInnerDescent = Math.max(this.maxInnerDescent, innerDescent);
            }
            
            this.boxes = newBoxes;
            this.images = newImages;
            this.addedImages.clear();
        }
    }
}

const MEMBERS_ARRAY_SYMBOL = Symbol('membersArray');
const MEMBERS_HASH_SYMBOL = Symbol('membersHash');
class ValueBase {
    constructor(...members) {
        this[MEMBERS_ARRAY_SYMBOL] = members;
        this[MEMBERS_HASH_SYMBOL] = valueArrayHash(this[MEMBERS_ARRAY_SYMBOL]);
    }
    hashCode() {
        return this[MEMBERS_HASH_SYMBOL];
    }
    equals(o) {
        const a = this[MEMBERS_ARRAY_SYMBOL];
        const b = o === null || o === void 0 ? void 0 : o[MEMBERS_ARRAY_SYMBOL];
        return valuesEqual(a, b);
    }
}
class ValueBase2 {
    hashCode() {
        const prime = 31;
        let result = 1;
        for (const propName of Object.getOwnPropertyNames(this)) {
            const propValue = this[propName];
            result = (prime * result + valueHash(propValue)) | 0;
        }
        return result;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (isNullish(o)) {
            return false;
        }
        else {
            const propNames = Object.getOwnPropertyNames(this);
            if (!arrayAllEqual(Object.getOwnPropertyNames(o), propNames)) {
                return false;
            }
            for (const propName of propNames) {
                const a = this[propName];
                const b = o[propName];
                if (!valuesEqual(a, b)) {
                    return false;
                }
            }
            return true;
        }
    }
}
function valuesEqual(a, b) {
    if (isValueArray(a) && isValueArray(b)) {
        return arrayAllEqual(a, b, valuesEqual);
    }
    else {
        return equal(a, b);
    }
}
function valueHash(x) {
    if (isValueArray(x)) {
        return valueArrayHash(x);
    }
    else {
        return hashCode(x);
    }
}
const typedArrayStrings = new Set([
    (new Int8Array(0)).toString(),
    (new Uint8Array(0)).toString(),
    (new Uint8ClampedArray(0)).toString(),
    (new Int16Array(0)).toString(),
    (new Uint16Array(0)).toString(),
    (new Int32Array(0)).toString(),
    (new Uint32Array(0)).toString(),
    (new Float32Array(0)).toString(),
    (new Float64Array(0)).toString(),
]);
function isValueArray(x) {
    
    return (Array.isArray(x) || typedArrayStrings.has(Object.prototype.toString.call(x)));
}
function valueArrayHash(xs) {
    const prime = 193;
    let result = 1;
    result = (prime * result + hashCode(xs.length)) | 0;
    for (let i = 0; i < xs.length; i++) {
        result = (prime * result + valueHash(xs[i])) | 0;
    }
    return result;
}

class Color extends ValueBase2 {
    constructor(r, g, b, a) {
        super();
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    withUpdatedAlpha(updateAlpha) {
        return new Color(this.a, this.g, this.b, updateAlpha(this.a));
    }
    get cssString() {
        if (this.a >= 1) {
            return `rgb( ${fracToByte(this.r)},${fracToByte(this.g)},${fracToByte(this.b)} )`;
        }
        else {
            
            return `rgba( ${fracToByte(this.r)},${fracToByte(this.g)},${fracToByte(this.b)}, ${this.a} )`;
        }
    }
    get rgbaString() {
        return '' + fracToByte(this.r) + ',' + fracToByte(this.g) + ',' + fracToByte(this.b) + ',' + fracToByte(this.a);
    }
}
class MutableColor {
    constructor(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }
    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }
    get() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}
function fracToByte(frac) {
    return Math.round(255 * clamp(0, 1, frac));
}
rgba(1, 1, 1, 0);
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
rgb(0.5, 0.5, 0.5);
rgb(1, 0, 0);
rgb(0, 1, 0);
rgb(0, 0, 1);
rgb(0, 1, 1);
rgb(1, 0, 1);
rgb(1, 1, 0);
rgb(0.561, 0.561, 0.961);
function rgba(r, g, b, a) {
    return new Color(r, g, b, a);
}
function rgb(r, g, b) {
    return new Color(r, g, b, 1);
}

const cacheParseColor = new Map();
function parseColor(s) {
    const cached = cacheParseColor.get(s);
    if (cached !== undefined) {
        return cached;
    }
    else {
        const result = doParseColor(s);
        cacheParseColor.set(s, result);
        return result;
    }
}
const canvasParseColor = document.createElement('canvas');
canvasParseColor.width = 1;
canvasParseColor.height = 1;
const gParseColor = requireNonNull(canvasParseColor.getContext('2d', { willReadFrequently: true }));
function doParseColor(s) {
    gParseColor.clearRect(0, 0, 1, 1);
    gParseColor.fillStyle = s;
    gParseColor.fillRect(0, 0, 1, 1);
    const rgbaData = gParseColor.getImageData(0, 0, 1, 1).data;
    const R = rgbaData[0] / 255;
    const G = rgbaData[1] / 255;
    const B = rgbaData[2] / 255;
    const A = rgbaData[3] / 255;
    return rgba(R, G, B, A);
}

const GL = WebGLRenderingContext;
function drawingBufferBounds(gl) {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    if (gl.isContextLost()) {
        return null;
    }
    else {
        return Interval2D.fromRect(0, 0, w, h);
    }
}
function fracToNdc(frac) {
    return (-1 + 2 * frac);
}

function ensureHostBufferCapacity(array, minCapacity_FLOATS, copyData = false) {
    if (array.length < minCapacity_FLOATS) {
        const newCapacity = Math.max(minCapacity_FLOATS, 2 * array.length);
        const newArray = new Float32Array(newCapacity);
        if (copyData) {
            newArray.set(array);
        }
        return newArray;
    }
    else {
        return array;
    }
}

function pushBufferToDevice_BYTES(gl, target, currentCapacity_BYTES, hCoords, hCoordCount = hCoords.length) {
    
    const hCapacity_BYTES = hCoords.byteLength;
    let dCapacity_BYTES = currentCapacity_BYTES;
    if (hCapacity_BYTES > 0 && dCapacity_BYTES !== hCapacity_BYTES) {
        gl.bufferData(target, hCapacity_BYTES, GL.STATIC_DRAW);
        dCapacity_BYTES = hCapacity_BYTES;
    }
    
    if (hCoordCount > 0) {
        gl.bufferSubData(target, 0, hCoords.subarray(0, hCoordCount));
    }
    
    return dCapacity_BYTES;
}
function put2f(array, i, a, b) {
    array[i++] = a;
    array[i++] = b;
    return i;
}
function put3f(array, i, a, b, c) {
    array[i++] = a;
    array[i++] = b;
    array[i++] = c;
    return i;
}
function put4f(array, i, a, b, c, d) {
    array[i++] = a;
    array[i++] = b;
    array[i++] = c;
    array[i++] = d;
    return i;
}
function put3ub(array, i, a, b, c) {
    array[i++] = a;
    array[i++] = b;
    array[i++] = c;
    return i;
}
function putAlignedBox(array, i, xMin, xMax, yMin, yMax) {
    i = put2f(array, i, xMin, yMax);
    i = put2f(array, i, xMin, yMin);
    i = put2f(array, i, xMax, yMax);
    i = put2f(array, i, xMax, yMax);
    i = put2f(array, i, xMin, yMin);
    i = put2f(array, i, xMax, yMin);
    return i;
}
function axisBoundsFn(axis) {
    return () => axis.bounds;
}
function paneViewportFn_PX(pane) {
    return () => pane.getViewport_PX();
}
function tagBoundsFn(tags, minKey, maxKey) {
    return () => tags.requireInterval(minKey, maxKey);
}
function tagCoordsFn(tags) {
    return () => tags.sortedCoords();
}

function xPixelToNdc(xViewport_PX, x_VPX) {
    return fracToNdc(x_VPX / xViewport_PX.span);
}

function yUpwardPixelToNdc(yViewport_PX, y_VUPX) {
    return fracToNdc(y_VUPX / yViewport_PX.span);
}
function putVerticalLines(coords_NDC, i, viewport_PX, thickness_PX, offset_PX, xAxis, xs) {
    if (xAxis && xs.length > 0) {
        const yMin_NDC = -1;
        const yMax_NDC = +1;
        const wPixel_NDC = 2 / viewport_PX.w;
        const wLine_NDC = thickness_PX * wPixel_NDC;
        for (const x of xs) {
            const x_PX = xAxis.coordToPx(x) + offset_PX;
            const xMin_NDC = fracToNdc(viewport_PX.x.valueToFrac(Math.round(x_PX - 0.5 * thickness_PX)));
            const xMax_NDC = xMin_NDC + wLine_NDC;
            i = putAlignedBox(coords_NDC, i, xMin_NDC, xMax_NDC, yMin_NDC, yMax_NDC);
        }
    }
    return i;
}
function putHorizontalLines(coords_NDC, i, viewport_PX, thickness_PX, offset_PX, yAxis, ys) {
    if (yAxis && ys.length > 0) {
        const xMin_NDC = -1;
        const xMax_NDC = +1;
        const hPixel_NDC = 2 / viewport_PX.h;
        const hLine_NDC = thickness_PX * hPixel_NDC;
        for (const y of ys) {
            const y_UPX = yAxis.coordToPx(y) + offset_PX;
            const yMin_NDC = fracToNdc(viewport_PX.y.valueToFrac(Math.round(y_UPX - 0.5 * thickness_PX)));
            const yMax_NDC = yMin_NDC + hLine_NDC;
            i = putAlignedBox(coords_NDC, i, xMin_NDC, xMax_NDC, yMin_NDC, yMax_NDC);
        }
    }
    return i;
}
function glViewport(gl, viewport_PX) {
    gl.viewport(viewport_PX.xMin, viewport_PX.yMin, viewport_PX.w, viewport_PX.h);
}
function glScissor(gl, scissor_PX) {
    gl.scissor(scissor_PX.xMin, scissor_PX.yMin, scissor_PX.w, scissor_PX.h);
}
function enablePremultipliedAlphaBlending(gl) {
    gl.blendEquation(GL.FUNC_ADD);
    gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
    gl.enable(GL.BLEND);
}
function disableBlending(gl) {
    gl.disable(GL.BLEND);
}

function currentDpr(x) {
    var _a;
    return ((_a = ('devicePixelRatio' in x ? x : ('defaultView' in x ? x : ('ownerDocument' in x ? x : (x.peer)).ownerDocument).defaultView)) === null || _a === void 0 ? void 0 : _a.devicePixelRatio) || 1;
}
function getMouseLoc_PX(element, ev) {
    
    const dpr = currentDpr(element);
    const bounds = element.getBoundingClientRect();
    const x_PX = (ev.clientX - bounds.left) * dpr + 0.5;
    const y_PX = (bounds.bottom - ev.clientY) * dpr - 0.5;
    return new Point2D(x_PX, y_PX);
}
class ModifierSet extends ValueBase {
    constructor(alt, ctrl, shift, meta) {
        super(alt, ctrl, shift, meta);
        this.alt = alt;
        this.ctrl = ctrl;
        this.shift = shift;
        this.meta = meta;
    }
    isEmpty() {
        return !(this.alt || this.ctrl || this.shift || this.meta);
    }
}
ModifierSet.EMPTY = new ModifierSet(false, false, false, false);
function getModifiers(ev) {
    return new ModifierSet(ev.altKey, ev.ctrlKey, ev.shiftKey, ev.metaKey);
}

const RGB8UI = Object.freeze({ glFormat: GL.RGB, numChannels: 3, glType: GL.UNSIGNED_BYTE });
Object.freeze({ glFormat: GL.RGB, numChannels: 3, glType: GL.FLOAT });
Object.freeze({ glFormat: GL.RGBA, numChannels: 4, glType: GL.UNSIGNED_BYTE });
Object.freeze({ glFormat: GL.RGBA, numChannels: 4, glType: GL.FLOAT });
class ColorTablePopulator {
    constructor(format, interp, colors, mutators = []) {
        this.format = format;
        this.interp = interp;
        this.colors = colors;
        this.mutators = newImmutableList(mutators);
    }
    withMutator(mutator) {
        return new ColorTablePopulator(this.format, this.interp, this.colors, this.mutators.push(mutator));
    }
    populate(gl, target) {
        const { numChannels, glType, glFormat } = this.format;
        let colors;
        if (this.mutators.size === 0) {
            colors = this.colors;
        }
        else {
            colors = this.colors.slice();
            for (const mutator of this.mutators) {
                mutator.mutateInPlace(this.format, colors);
            }
        }
        
        
        
        if (!(gl instanceof WebGL2RenderingContext || gl.getExtension('OES_texture_float'))) {
            throw new Error();
        }
        if (this.interp === GL.LINEAR && !(gl instanceof WebGL2RenderingContext || gl.getExtension('OES_texture_float_linear'))) {
            throw new Error();
        }
        const numColors = Math.floor(colors.length / numChannels);
        gl.texParameteri(target, GL.TEXTURE_MAG_FILTER, this.interp);
        gl.texParameteri(target, GL.TEXTURE_MIN_FILTER, this.interp);
        gl.texParameteri(target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        gl.texParameteri(target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        gl.texImage2D(target, 0, glFormat, numColors, 1, 0, glFormat, glType, colors);
    }
}
function newColorTableEntry(key, format, interp, colors) {
    return Object.freeze([key, new ColorTablePopulator(format, interp, colors)]);
}
class ColorTableInverter {
    mutateInPlace(format, colors) {
        if (colors.length >= format.numChannels) {
            const tmp = colors.slice(0, format.numChannels);
            const nj = tmp.length;
            const ni = (colors.length / nj) | 0;
            for (let i = 0; i < ni >> 1; i++) {
                const a = nj * (ni - 1 - i);
                const b = nj * i;
                for (let j = 0; j < nj; j++) {
                    tmp[j] = colors[a + j];
                    colors[a + j] = colors[b + j];
                    colors[b + j] = tmp[j];
                }
            }
        }
    }
}
const COLOR_TABLE_INVERTER = new ColorTableInverter();

function createColorTable_RGB8UI(numColors, gradient) {
    const table = new Uint8Array(3 * numColors);
    const color = new MutableColor(WHITE);
    for (let i = 0; i < numColors; i++) {
        const frac = i / (numColors - 1);
        gradient(frac, color);
        put3ub(table, 3 * i, 255 * color.r, 255 * color.g, 255 * color.b);
    }
    return table;
}

const CET_L01_RGB8UI = new Uint8Array([0, 0, 0, 1, 1, 1, 3, 3, 3, 4, 4, 4, 6, 6, 6, 7, 7, 7, 9, 9, 9, 10, 10, 10, 11, 11, 11, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 22, 22, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 26, 26, 26, 26, 26, 26, 27, 27, 27, 28, 28, 28, 29, 29, 29, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32, 32, 33, 33, 33, 33, 33, 33, 34, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 37, 37, 37, 37, 38, 38, 38, 39, 39, 39, 40, 40, 40, 41, 41, 41, 42, 42, 42, 42, 42, 42, 43, 43, 43, 44, 44, 44, 45, 45, 45, 46, 46, 46, 47, 47, 47, 47, 47, 47, 48, 48, 48, 49, 49, 49, 50, 50, 50, 51, 51, 51, 52, 52, 52, 53, 53, 53, 53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 56, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 59, 60, 60, 60, 60, 60, 61, 61, 61, 62, 62, 62, 63, 63, 63, 64, 64, 64, 65, 65, 65, 66, 66, 66, 67, 67, 67, 67, 67, 67, 68, 68, 68, 69, 69, 69, 70, 70, 70, 71, 71, 71, 72, 72, 72, 73, 73, 73, 74, 74, 74, 75, 75, 75, 76, 76, 76, 77, 77, 77, 77, 77, 77, 78, 78, 78, 79, 79, 79, 80, 80, 80, 81, 81, 81, 82, 82, 82, 83, 83, 83, 84, 84, 84, 85, 85, 85, 86, 86, 86, 87, 87, 87, 88, 88, 88, 89, 89, 89, 90, 90, 90, 90, 90, 90, 91, 91, 91, 92, 92, 92, 93, 93, 93, 94, 94, 94, 95, 95, 95, 96, 96, 96, 97, 97, 97, 98, 98, 98, 99, 99, 99, 100, 100, 100, 101, 101, 101, 102, 102, 102, 103, 103, 103, 104, 104, 104, 105, 105, 105, 106, 106, 106, 107, 107, 107, 108, 108, 108, 109, 109, 109, 110, 110, 110, 111, 111, 111, 112, 112, 112, 113, 113, 113, 113, 114, 114, 114, 114, 114, 115, 115, 115, 116, 116, 116, 117, 117, 117, 118, 118, 118, 119, 119, 119, 120, 120, 120, 121, 121, 121, 122, 122, 122, 123, 123, 123, 124, 124, 124, 125, 125, 125, 126, 126, 126, 127, 127, 127, 128, 128, 128, 129, 129, 129, 130, 130, 130, 131, 131, 131, 132, 132, 132, 133, 133, 133, 134, 134, 134, 135, 135, 135, 136, 136, 136, 137, 137, 137, 138, 138, 138, 139, 139, 139, 140, 140, 140, 141, 141, 141, 142, 143, 143, 144, 144, 144, 145, 145, 145, 146, 146, 146, 147, 147, 147, 148, 148, 148, 149, 149, 149, 150, 150, 150, 151, 151, 151, 152, 152, 152, 153, 153, 153, 154, 154, 154, 155, 155, 155, 156, 156, 156, 157, 157, 157, 158, 158, 158, 159, 159, 159, 160, 160, 160, 161, 161, 161, 162, 162, 162, 163, 163, 163, 164, 164, 164, 165, 165, 165, 166, 166, 166, 167, 167, 167, 168, 168, 168, 169, 169, 169, 170, 171, 171, 172, 172, 172, 173, 173, 173, 174, 174, 174, 175, 175, 175, 176, 176, 176, 177, 177, 177, 178, 178, 178, 179, 179, 179, 180, 180, 180, 181, 181, 181, 182, 182, 182, 183, 183, 183, 184, 184, 184, 185, 185, 185, 186, 186, 186, 188, 188, 188, 189, 189, 189, 190, 190, 190, 191, 191, 191, 192, 192, 192, 193, 193, 193, 194, 194, 194, 195, 195, 195, 196, 196, 196, 197, 197, 197, 198, 198, 198, 199, 199, 199, 200, 201, 201, 202, 202, 202, 203, 203, 203, 204, 204, 204, 205, 205, 205, 206, 206, 206, 207, 207, 207, 208, 208, 208, 209, 209, 209, 210, 210, 210, 211, 211, 211, 212, 213, 213, 214, 214, 214, 215, 215, 215, 216, 216, 216, 217, 217, 217, 218, 218, 218, 219, 219, 219, 220, 220, 220, 221, 221, 221, 222, 222, 222, 224, 224, 224, 225, 225, 225, 226, 226, 226, 227, 227, 227, 228, 228, 228, 229, 229, 229, 230, 230, 230, 231, 231, 231, 232, 232, 232, 234, 234, 234, 235, 235, 235, 236, 236, 236, 237, 237, 237, 238, 238, 238, 239, 239, 239, 240, 240, 240, 241, 241, 241, 243, 243, 243, 244, 244, 244, 245, 245, 245, 246, 246, 246, 247, 247, 247, 248, 248, 248, 249, 249, 249, 250, 250, 250, 252, 252, 252, 253, 253, 253, 254, 254, 254, 255, 255, 255]);
const CET_L04_RGB8UI = new Uint8Array([0, 0, 0, 7, 0, 0, 13, 0, 0, 18, 0, 0, 22, 0, 0, 25, 0, 0, 28, 0, 0, 31, 0, 0, 34, 0, 0, 36, 0, 0, 38, 0, 0, 40, 0, 0, 42, 0, 0, 44, 0, 0, 46, 0, 0, 48, 0, 0, 50, 0, 0, 51, 0, 0, 53, 0, 0, 54, 0, 0, 56, 0, 0, 57, 0, 0, 59, 0, 0, 60, 0, 0, 62, 0, 0, 63, 0, 0, 64, 0, 0, 66, 1, 0, 67, 1, 0, 69, 1, 0, 70, 1, 0, 72, 1, 0, 73, 1, 0, 75, 1, 0, 76, 1, 0, 78, 1, 0, 79, 1, 0, 81, 1, 0, 82, 1, 0, 84, 1, 0, 85, 1, 0, 87, 1, 0, 88, 1, 0, 90, 1, 0, 91, 1, 0, 93, 1, 0, 94, 1, 0, 96, 1, 0, 97, 1, 0, 99, 1, 0, 100, 1, 0, 102, 1, 0, 103, 1, 0, 105, 1, 0, 107, 2, 0, 108, 2, 0, 110, 2, 0, 111, 2, 0, 113, 2, 0, 114, 2, 0, 116, 2, 0, 118, 2, 0, 119, 2, 0, 121, 2, 0, 122, 2, 0, 124, 2, 0, 126, 2, 0, 127, 2, 0, 129, 2, 0, 131, 2, 0, 132, 3, 0, 134, 3, 0, 135, 3, 0, 137, 3, 0, 139, 3, 0, 140, 3, 0, 142, 3, 0, 144, 3, 0, 145, 3, 0, 147, 3, 0, 149, 3, 0, 150, 4, 0, 152, 4, 0, 154, 4, 0, 155, 4, 0, 157, 4, 0, 159, 4, 0, 160, 4, 0, 162, 4, 0, 164, 4, 0, 165, 5, 0, 167, 5, 0, 169, 5, 0, 171, 5, 0, 172, 5, 0, 174, 5, 0, 176, 6, 0, 177, 6, 0, 179, 6, 0, 181, 6, 0, 183, 6, 0, 184, 6, 0, 186, 7, 0, 188, 7, 0, 189, 7, 0, 191, 7, 0, 193, 7, 0, 195, 8, 0, 196, 8, 0, 198, 8, 0, 200, 8, 0, 202, 9, 0, 203, 9, 0, 205, 9, 0, 207, 9, 0, 209, 10, 0, 210, 10, 0, 212, 10, 0, 214, 11, 0, 216, 11, 0, 217, 12, 0, 219, 12, 0, 221, 12, 0, 223, 13, 0, 224, 13, 0, 226, 14, 0, 228, 15, 0, 230, 15, 0, 231, 16, 0, 233, 17, 0, 235, 18, 0, 236, 19, 0, 238, 21, 0, 239, 24, 0, 240, 26, 0, 241, 29, 0, 242, 33, 0, 243, 36, 0, 244, 39, 0, 244, 42, 0, 245, 46, 0, 246, 49, 0, 246, 52, 0, 247, 55, 0, 247, 58, 0, 247, 61, 0, 248, 63, 0, 248, 66, 0, 248, 69, 0, 249, 72, 0, 249, 74, 0, 249, 77, 0, 249, 79, 0, 250, 82, 0, 250, 84, 0, 250, 86, 0, 250, 89, 0, 250, 91, 0, 251, 93, 0, 251, 96, 0, 251, 98, 0, 251, 100, 0, 251, 102, 0, 251, 104, 0, 252, 106, 0, 252, 108, 0, 252, 110, 0, 252, 112, 0, 252, 114, 0, 252, 116, 0, 252, 118, 0, 252, 120, 0, 252, 122, 0, 252, 124, 0, 253, 126, 0, 253, 128, 0, 253, 130, 0, 253, 131, 0, 253, 133, 0, 253, 135, 0, 253, 137, 0, 253, 139, 0, 253, 140, 0, 253, 142, 0, 253, 144, 0, 253, 146, 0, 253, 147, 0, 254, 149, 0, 254, 151, 0, 254, 153, 0, 254, 154, 0, 254, 156, 0, 254, 158, 0, 254, 159, 0, 254, 161, 0, 254, 163, 0, 254, 164, 0, 254, 166, 0, 254, 168, 0, 254, 169, 0, 254, 171, 0, 254, 173, 0, 254, 174, 0, 254, 176, 0, 254, 177, 0, 254, 179, 0, 254, 181, 0, 254, 182, 0, 254, 184, 0, 254, 185, 0, 254, 187, 0, 254, 189, 0, 255, 190, 0, 255, 192, 0, 255, 193, 0, 255, 195, 0, 255, 196, 0, 255, 198, 0, 255, 199, 0, 255, 201, 0, 255, 203, 0, 255, 204, 0, 255, 206, 0, 255, 207, 0, 255, 209, 0, 255, 210, 0, 255, 212, 0, 255, 213, 0, 255, 215, 0, 255, 216, 0, 255, 218, 0, 255, 219, 0, 255, 221, 0, 255, 222, 0, 255, 224, 0, 255, 225, 0, 255, 227, 0, 255, 228, 0, 255, 230, 0, 255, 231, 0, 255, 233, 0, 255, 234, 0, 255, 236, 0, 255, 237, 0, 255, 239, 0, 255, 240, 0, 255, 242, 0, 255, 243, 0, 255, 245, 0, 255, 246, 0, 255, 248, 0, 255, 249, 0, 255, 251, 0, 255, 252, 0, 255, 254, 0, 255, 255, 0]);
const CET_L06_RGB8UI = new Uint8Array([0, 1, 78, 0, 1, 80, 0, 2, 82, 0, 2, 84, 0, 2, 86, 0, 3, 88, 0, 3, 90, 0, 3, 92, 0, 3, 94, 0, 3, 96, 1, 3, 98, 2, 3, 100, 2, 3, 102, 3, 3, 104, 4, 2, 106, 5, 2, 108, 5, 2, 110, 6, 2, 112, 7, 2, 114, 8, 2, 116, 8, 2, 118, 9, 2, 120, 10, 2, 123, 11, 2, 125, 11, 2, 127, 12, 2, 129, 13, 2, 131, 13, 2, 133, 14, 2, 136, 14, 1, 138, 15, 1, 140, 15, 1, 142, 15, 1, 144, 16, 1, 147, 16, 1, 149, 16, 1, 151, 16, 1, 153, 16, 2, 156, 16, 2, 158, 16, 2, 160, 16, 2, 162, 15, 2, 165, 15, 2, 167, 14, 3, 170, 13, 3, 172, 13, 3, 174, 12, 4, 177, 11, 4, 179, 10, 4, 181, 10, 5, 183, 9, 5, 185, 9, 6, 188, 8, 7, 190, 8, 7, 192, 8, 8, 194, 8, 9, 196, 8, 10, 198, 8, 10, 200, 8, 11, 202, 8, 12, 204, 9, 13, 206, 9, 14, 208, 10, 15, 210, 11, 16, 212, 12, 17, 214, 13, 18, 216, 14, 18, 217, 16, 19, 219, 17, 20, 221, 18, 21, 223, 19, 22, 224, 21, 23, 226, 22, 24, 227, 24, 25, 229, 25, 26, 231, 26, 28, 232, 27, 29, 233, 28, 30, 235, 29, 31, 236, 31, 33, 237, 32, 34, 238, 33, 36, 240, 34, 37, 241, 35, 38, 242, 35, 40, 243, 36, 41, 244, 37, 43, 244, 38, 45, 245, 39, 46, 246, 40, 48, 247, 40, 49, 247, 41, 51, 248, 42, 53, 248, 42, 54, 249, 43, 56, 249, 43, 58, 250, 44, 59, 250, 44, 61, 250, 45, 63, 250, 45, 65, 251, 45, 66, 251, 46, 68, 251, 46, 70, 251, 46, 71, 251, 47, 73, 251, 47, 75, 251, 47, 76, 251, 47, 78, 251, 47, 79, 251, 47, 81, 251, 47, 82, 252, 48, 84, 252, 48, 86, 252, 48, 87, 252, 48, 89, 252, 48, 90, 252, 48, 92, 252, 48, 93, 252, 47, 94, 252, 47, 96, 252, 47, 97, 252, 47, 99, 253, 47, 100, 253, 47, 102, 253, 46, 103, 253, 46, 105, 253, 46, 106, 253, 46, 107, 253, 45, 109, 253, 45, 110, 253, 45, 112, 253, 44, 113, 253, 44, 114, 253, 44, 116, 253, 44, 117, 254, 44, 118, 254, 43, 120, 254, 43, 121, 254, 43, 123, 254, 43, 124, 254, 43, 125, 254, 44, 126, 254, 44, 128, 254, 44, 129, 254, 44, 130, 254, 44, 132, 254, 45, 133, 254, 45, 134, 254, 45, 135, 254, 46, 137, 254, 46, 138, 254, 47, 139, 254, 47, 141, 254, 48, 142, 254, 48, 143, 254, 49, 144, 253, 50, 146, 253, 50, 147, 253, 51, 148, 253, 51, 149, 253, 52, 150, 253, 52, 152, 253, 53, 153, 253, 53, 154, 253, 53, 155, 253, 53, 157, 253, 54, 158, 253, 54, 159, 253, 54, 160, 253, 54, 162, 253, 54, 163, 253, 54, 164, 253, 54, 166, 253, 54, 167, 253, 53, 168, 253, 53, 169, 252, 53, 171, 252, 53, 172, 252, 52, 173, 252, 52, 174, 252, 51, 176, 252, 51, 177, 252, 50, 178, 252, 49, 180, 252, 49, 181, 252, 48, 182, 252, 47, 183, 252, 46, 185, 252, 46, 186, 252, 45, 187, 252, 44, 188, 252, 44, 190, 252, 43, 191, 252, 43, 192, 252, 42, 194, 252, 42, 195, 252, 42, 196, 252, 41, 197, 252, 41, 199, 252, 41, 200, 252, 41, 201, 251, 41, 202, 251, 41, 203, 251, 41, 205, 251, 41, 206, 251, 41, 207, 251, 41, 208, 251, 42, 210, 251, 42, 211, 251, 43, 212, 251, 43, 213, 251, 44, 214, 251, 44, 216, 250, 45, 217, 250, 47, 218, 250, 48, 219, 250, 51, 220, 250, 53, 221, 250, 56, 222, 250, 60, 223, 250, 63, 225, 250, 66, 226, 249, 70, 227, 249, 73, 228, 249, 77, 229, 249, 80, 229, 249, 84, 230, 249, 87, 231, 249, 91, 232, 249, 94, 233, 249, 98, 234, 248, 101, 235, 248, 105, 236, 248, 108, 237, 248, 112, 238, 248, 115, 239, 248, 118, 240, 248, 122, 240, 248, 125, 241, 248, 128, 242, 247, 132, 243, 247, 135, 244, 247, 138, 245, 247, 142, 245, 247, 145, 246, 247, 148, 247, 247, 151, 248, 247, 154, 249, 246, 157, 249, 246, 161, 250, 246, 164, 251, 246, 167, 252, 246, 170, 253, 246, 173, 253, 246, 176, 254, 246, 179, 255, 246]);
const CET_L07_RGB8UI = new Uint8Array([0, 2, 75, 0, 3, 77, 0, 3, 79, 0, 4, 81, 0, 4, 83, 0, 4, 85, 0, 5, 88, 0, 5, 90, 0, 5, 92, 0, 5, 94, 0, 5, 96, 0, 5, 98, 0, 5, 100, 0, 5, 102, 0, 5, 104, 1, 5, 106, 1, 5, 109, 1, 5, 111, 1, 5, 113, 2, 5, 115, 2, 5, 117, 2, 5, 119, 3, 5, 121, 3, 5, 124, 3, 5, 126, 4, 5, 128, 4, 5, 130, 4, 5, 132, 4, 6, 135, 5, 6, 137, 5, 6, 139, 5, 6, 141, 5, 6, 144, 6, 6, 146, 6, 6, 148, 6, 6, 150, 6, 6, 153, 6, 6, 155, 6, 6, 157, 6, 6, 159, 6, 6, 162, 6, 7, 164, 5, 7, 166, 5, 7, 169, 5, 7, 171, 5, 7, 173, 5, 8, 175, 5, 8, 178, 5, 8, 180, 5, 8, 182, 5, 9, 184, 6, 9, 186, 6, 10, 189, 7, 10, 191, 8, 10, 193, 9, 11, 195, 11, 11, 197, 12, 12, 199, 13, 12, 201, 15, 13, 203, 16, 13, 205, 18, 14, 207, 19, 14, 209, 21, 15, 211, 22, 15, 213, 24, 16, 214, 25, 17, 216, 27, 17, 218, 29, 18, 220, 30, 18, 222, 32, 19, 223, 34, 20, 225, 36, 20, 227, 38, 21, 228, 40, 21, 230, 42, 22, 231, 44, 22, 233, 47, 23, 234, 49, 23, 236, 52, 24, 237, 55, 24, 238, 57, 25, 239, 60, 25, 240, 63, 25, 242, 66, 26, 243, 69, 26, 244, 72, 26, 245, 75, 27, 245, 77, 27, 246, 80, 27, 247, 83, 27, 248, 86, 27, 248, 89, 28, 249, 93, 28, 250, 96, 28, 250, 99, 28, 250, 102, 28, 251, 105, 28, 251, 108, 28, 251, 111, 28, 252, 114, 28, 252, 117, 28, 252, 120, 28, 252, 123, 28, 252, 126, 28, 252, 128, 28, 253, 131, 28, 253, 134, 28, 253, 137, 28, 253, 139, 28, 253, 142, 28, 253, 145, 28, 253, 147, 29, 253, 150, 29, 254, 153, 29, 254, 155, 29, 254, 158, 29, 254, 160, 29, 254, 163, 29, 254, 165, 29, 254, 168, 29, 254, 170, 29, 254, 173, 29, 254, 175, 29, 254, 177, 29, 254, 180, 29, 254, 182, 28, 254, 185, 28, 254, 187, 28, 254, 189, 29, 254, 192, 29, 254, 194, 29, 254, 196, 29, 254, 198, 30, 254, 200, 30, 254, 202, 31, 254, 204, 32, 254, 206, 33, 254, 208, 34, 254, 210, 35, 254, 212, 36, 254, 214, 37, 254, 215, 38, 254, 217, 39, 254, 219, 41, 254, 220, 42, 254, 222, 44, 254, 224, 45, 254, 225, 46, 254, 227, 48, 254, 228, 50, 254, 229, 51, 254, 231, 53, 254, 232, 55, 254, 233, 56, 254, 235, 58, 254, 236, 60, 254, 237, 62, 254, 238, 63, 254, 239, 65, 254, 240, 67, 254, 241, 69, 254, 242, 71, 254, 243, 73, 254, 244, 75, 254, 245, 77, 254, 246, 79, 254, 247, 81, 254, 248, 83, 254, 248, 85, 254, 249, 87, 254, 250, 89, 254, 250, 91, 254, 251, 93, 254, 251, 95, 254, 252, 97, 254, 252, 99, 254, 252, 101, 254, 253, 103, 254, 253, 106, 254, 253, 108, 253, 253, 110, 253, 254, 112, 253, 254, 114, 253, 254, 116, 253, 254, 118, 253, 254, 120, 253, 254, 123, 253, 254, 125, 253, 254, 127, 253, 254, 129, 253, 254, 131, 253, 254, 133, 253, 254, 135, 253, 254, 136, 253, 254, 138, 253, 254, 140, 253, 254, 142, 253, 254, 144, 253, 254, 146, 253, 254, 148, 253, 254, 149, 253, 254, 151, 253, 254, 153, 253, 254, 155, 253, 254, 156, 253, 254, 158, 253, 254, 160, 253, 254, 162, 253, 254, 163, 253, 254, 165, 253, 254, 167, 253, 254, 168, 253, 254, 170, 253, 254, 172, 253, 254, 173, 253, 254, 175, 253, 254, 177, 254, 254, 178, 254, 254, 180, 254, 254, 181, 254, 254, 183, 254, 254, 185, 254, 254, 186, 254, 254, 188, 254, 254, 189, 254, 254, 191, 254, 254, 193, 254, 254, 194, 254, 255, 196, 254, 255, 197, 254, 255, 199, 254, 255, 200, 254, 255, 202, 254, 255, 203, 254, 255, 205, 254, 255, 206, 254, 255, 208, 254, 255, 209, 254, 255, 211, 254, 255, 212, 254, 255, 214, 254, 255, 215, 254, 255, 217, 254, 255, 218, 254, 255, 220, 254, 255, 221, 254, 255, 223, 254, 255, 224, 254, 255, 226, 254, 255, 227, 254, 255, 229, 254, 254, 230, 254, 254, 232, 254, 254, 233, 254, 254, 235, 254]);
const CET_L08_RGB8UI = new Uint8Array([0, 15, 93, 1, 15, 94, 1, 16, 96, 1, 16, 98, 1, 17, 99, 2, 17, 101, 2, 18, 103, 3, 18, 104, 4, 18, 106, 5, 19, 107, 6, 19, 109, 7, 20, 111, 8, 20, 112, 10, 21, 114, 12, 21, 115, 13, 21, 117, 15, 22, 118, 17, 22, 119, 18, 22, 121, 20, 23, 122, 22, 23, 124, 24, 23, 125, 25, 24, 126, 27, 24, 128, 29, 24, 129, 31, 25, 130, 33, 25, 131, 35, 25, 133, 37, 25, 134, 39, 26, 135, 41, 26, 136, 43, 26, 137, 46, 26, 138, 48, 26, 139, 50, 27, 140, 52, 27, 141, 55, 27, 142, 57, 27, 143, 59, 27, 143, 62, 27, 144, 64, 27, 144, 67, 26, 145, 70, 26, 145, 72, 26, 146, 75, 26, 146, 78, 25, 146, 81, 25, 146, 84, 25, 146, 86, 24, 146, 89, 24, 146, 92, 23, 146, 94, 23, 146, 97, 23, 146, 99, 22, 146, 102, 22, 146, 104, 21, 146, 107, 21, 146, 109, 20, 146, 111, 20, 146, 114, 19, 146, 116, 19, 146, 118, 18, 145, 121, 18, 145, 123, 17, 145, 125, 17, 145, 127, 16, 145, 129, 16, 145, 131, 15, 144, 134, 15, 144, 136, 14, 144, 138, 14, 144, 140, 13, 143, 142, 13, 143, 144, 13, 143, 146, 12, 142, 148, 12, 142, 150, 11, 142, 152, 11, 141, 154, 11, 141, 156, 10, 140, 158, 10, 140, 160, 10, 140, 162, 10, 139, 163, 10, 139, 165, 9, 138, 167, 9, 138, 169, 9, 138, 171, 9, 137, 173, 9, 137, 174, 10, 136, 176, 10, 136, 178, 10, 136, 180, 10, 135, 182, 10, 135, 183, 11, 134, 185, 11, 134, 187, 12, 133, 189, 12, 133, 190, 13, 133, 192, 13, 132, 194, 14, 132, 195, 14, 131, 197, 15, 131, 199, 16, 130, 200, 16, 130, 202, 17, 129, 204, 18, 129, 205, 19, 128, 207, 20, 128, 208, 21, 127, 210, 22, 127, 211, 23, 126, 213, 25, 125, 214, 26, 125, 216, 28, 124, 217, 29, 123, 218, 31, 123, 220, 32, 122, 221, 34, 121, 222, 35, 120, 223, 37, 120, 224, 39, 119, 226, 41, 118, 227, 42, 117, 228, 44, 116, 229, 46, 115, 230, 48, 114, 231, 49, 114, 232, 51, 113, 233, 53, 112, 234, 55, 111, 235, 57, 110, 236, 59, 108, 237, 61, 107, 237, 62, 106, 238, 64, 105, 239, 66, 104, 240, 68, 103, 240, 70, 102, 241, 72, 101, 242, 74, 100, 242, 76, 98, 243, 77, 97, 243, 79, 96, 244, 81, 95, 244, 83, 94, 245, 85, 93, 245, 87, 92, 246, 88, 92, 246, 90, 91, 247, 92, 90, 247, 94, 89, 247, 96, 88, 248, 98, 87, 248, 100, 86, 248, 101, 85, 248, 103, 85, 248, 105, 84, 249, 107, 83, 249, 109, 82, 249, 111, 82, 249, 112, 81, 249, 114, 80, 249, 116, 79, 249, 118, 79, 249, 120, 78, 249, 122, 77, 249, 123, 77, 249, 125, 76, 249, 127, 76, 249, 129, 75, 249, 130, 74, 249, 132, 74, 249, 134, 73, 249, 135, 72, 249, 137, 72, 249, 138, 71, 249, 140, 70, 249, 142, 70, 249, 143, 69, 249, 145, 68, 249, 146, 68, 249, 148, 67, 249, 149, 66, 249, 151, 66, 250, 152, 65, 250, 154, 65, 250, 155, 64, 250, 157, 63, 250, 158, 63, 250, 159, 62, 250, 161, 61, 251, 162, 61, 251, 164, 60, 251, 165, 59, 251, 166, 59, 251, 168, 58, 252, 169, 57, 252, 171, 57, 252, 172, 57, 252, 173, 56, 252, 175, 56, 252, 176, 56, 252, 177, 56, 252, 179, 56, 252, 180, 56, 252, 182, 56, 253, 183, 56, 253, 184, 56, 253, 186, 56, 253, 187, 56, 253, 189, 56, 253, 190, 56, 253, 191, 56, 253, 193, 57, 253, 194, 57, 252, 195, 57, 252, 197, 57, 252, 198, 58, 252, 200, 58, 252, 201, 58, 252, 202, 59, 252, 204, 59, 252, 205, 59, 252, 206, 60, 252, 208, 60, 252, 209, 61, 252, 211, 61, 251, 212, 62, 251, 213, 62, 251, 215, 63, 251, 216, 63, 251, 217, 64, 251, 219, 64, 251, 220, 65, 250, 222, 65, 250, 223, 66, 250, 224, 66, 250, 226, 67, 250, 227, 67, 249, 228, 68, 249, 230, 69, 249, 231, 69, 249, 232, 70, 248, 234, 70, 248, 235, 71, 248, 237, 72, 248, 238, 72, 247, 239, 73, 247, 241, 74, 247, 242, 74, 247, 243, 75, 246, 245, 76, 246, 246, 76, 246, 247, 77, 245, 249, 78]);
const CET_L17_RGB8UI = new Uint8Array([255, 255, 255, 255, 254, 252, 254, 253, 249, 254, 253, 247, 253, 252, 244, 253, 251, 241, 252, 250, 238, 252, 250, 235, 251, 249, 233, 251, 248, 230, 250, 247, 227, 250, 247, 224, 249, 246, 221, 248, 245, 219, 248, 244, 216, 247, 243, 213, 247, 243, 210, 246, 242, 207, 246, 241, 205, 245, 240, 202, 244, 240, 199, 244, 239, 196, 243, 238, 194, 242, 237, 191, 242, 236, 189, 242, 235, 187, 242, 234, 186, 242, 233, 184, 243, 232, 182, 243, 231, 180, 243, 230, 179, 243, 229, 177, 243, 228, 175, 243, 227, 174, 243, 226, 172, 243, 225, 170, 243, 224, 169, 242, 223, 167, 242, 222, 165, 242, 221, 164, 242, 220, 162, 242, 219, 160, 242, 218, 159, 242, 217, 157, 242, 215, 156, 242, 214, 154, 242, 213, 152, 242, 212, 151, 242, 211, 150, 242, 210, 148, 242, 209, 147, 243, 208, 146, 243, 207, 145, 243, 205, 144, 243, 204, 142, 243, 203, 141, 243, 202, 140, 243, 201, 139, 243, 200, 138, 243, 198, 136, 244, 197, 135, 244, 196, 134, 244, 195, 133, 244, 194, 132, 244, 193, 131, 244, 191, 129, 244, 190, 128, 244, 189, 127, 244, 188, 126, 244, 187, 125, 244, 186, 124, 244, 184, 123, 244, 183, 122, 244, 182, 122, 245, 181, 121, 245, 179, 120, 245, 178, 119, 245, 177, 119, 245, 176, 118, 245, 174, 117, 245, 173, 117, 245, 172, 116, 245, 171, 115, 245, 170, 115, 245, 168, 114, 245, 167, 113, 245, 166, 112, 245, 164, 112, 245, 163, 111, 245, 162, 110, 245, 161, 110, 245, 159, 109, 245, 158, 108, 245, 157, 108, 245, 156, 108, 245, 154, 107, 245, 153, 107, 245, 152, 107, 245, 151, 107, 245, 149, 106, 245, 148, 106, 245, 147, 106, 245, 145, 106, 245, 144, 106, 244, 143, 105, 244, 141, 105, 244, 140, 105, 244, 139, 105, 244, 138, 105, 244, 136, 104, 244, 135, 104, 244, 134, 104, 244, 132, 104, 243, 131, 103, 243, 129, 103, 243, 128, 103, 243, 127, 103, 243, 126, 103, 242, 124, 103, 242, 123, 103, 242, 122, 104, 242, 120, 104, 241, 119, 104, 241, 118, 104, 241, 116, 104, 240, 115, 104, 240, 114, 105, 240, 112, 105, 239, 111, 105, 239, 110, 105, 239, 108, 105, 238, 107, 106, 238, 106, 106, 238, 104, 106, 237, 103, 106, 237, 102, 106, 237, 100, 106, 236, 99, 106, 236, 97, 107, 236, 96, 107, 235, 95, 107, 234, 93, 108, 234, 92, 108, 233, 91, 109, 232, 90, 109, 232, 88, 110, 231, 87, 110, 231, 86, 110, 230, 85, 111, 229, 83, 111, 229, 82, 112, 228, 81, 112, 227, 79, 113, 227, 78, 113, 226, 77, 114, 225, 75, 114, 225, 74, 114, 224, 73, 115, 224, 71, 115, 223, 70, 116, 222, 68, 116, 222, 67, 117, 221, 65, 117, 220, 64, 117, 219, 63, 118, 218, 62, 119, 217, 61, 119, 216, 60, 120, 215, 59, 121, 214, 58, 121, 213, 56, 122, 212, 55, 122, 211, 54, 123, 210, 53, 124, 209, 52, 124, 208, 51, 125, 207, 50, 125, 206, 48, 126, 205, 47, 127, 204, 46, 127, 203, 45, 128, 202, 43, 128, 201, 42, 129, 200, 41, 130, 199, 40, 130, 197, 38, 131, 196, 37, 131, 195, 37, 132, 193, 36, 133, 192, 35, 133, 190, 35, 134, 189, 34, 135, 188, 34, 135, 186, 33, 136, 185, 32, 137, 183, 32, 137, 182, 31, 138, 180, 31, 138, 179, 30, 139, 177, 29, 140, 176, 29, 140, 174, 28, 141, 173, 28, 142, 171, 27, 142, 170, 27, 143, 168, 26, 144, 167, 25, 144, 165, 25, 145, 163, 24, 146, 162, 24, 146, 160, 24, 147, 158, 25, 147, 156, 25, 148, 154, 26, 148, 152, 26, 149, 150, 26, 150, 148, 27, 150, 146, 27, 151, 144, 27, 151, 142, 28, 152, 140, 28, 153, 137, 28, 153, 135, 29, 154, 133, 29, 154, 131, 29, 155, 129, 29, 155, 127, 30, 156, 124, 30, 157, 122, 30, 157, 120, 30, 158, 117, 31, 158, 115, 31, 159, 112, 31, 159, 110, 32, 160, 107, 33, 160, 104, 33, 160, 101, 34, 161, 98, 35, 161, 95, 35, 162, 92, 36, 162, 89, 36, 162, 85, 37, 163, 82, 37, 163, 78, 38, 163, 75, 38, 164, 71, 39, 164, 67, 39, 164, 62, 39, 165, 58, 40, 165, 52, 40, 166, 47, 41, 166, 41, 41, 166, 33, 41, 167, 24, 42, 167, 10, 42, 167, 0, 42, 168]);
const CET_L19_RGB8UI = new Uint8Array([255, 255, 255, 254, 255, 255, 252, 254, 255, 251, 254, 255, 250, 253, 255, 249, 253, 254, 247, 252, 254, 246, 252, 254, 245, 251, 254, 244, 251, 254, 242, 250, 254, 241, 250, 254, 240, 249, 254, 239, 249, 254, 237, 248, 254, 236, 248, 253, 235, 247, 253, 233, 247, 253, 232, 246, 253, 231, 246, 253, 230, 245, 253, 228, 245, 253, 227, 244, 253, 226, 244, 253, 225, 243, 253, 224, 243, 253, 223, 242, 253, 222, 241, 253, 220, 241, 253, 219, 240, 253, 218, 240, 253, 217, 239, 253, 216, 238, 253, 215, 238, 253, 214, 237, 253, 213, 237, 253, 212, 236, 253, 211, 236, 253, 210, 235, 253, 209, 234, 253, 208, 234, 253, 207, 233, 254, 206, 233, 254, 205, 232, 254, 204, 232, 254, 203, 231, 254, 202, 230, 254, 201, 230, 254, 200, 229, 254, 200, 228, 254, 199, 228, 254, 198, 227, 254, 198, 226, 254, 197, 226, 254, 197, 225, 254, 196, 224, 254, 195, 224, 254, 195, 223, 254, 194, 222, 254, 193, 222, 255, 193, 221, 255, 192, 220, 255, 191, 219, 255, 191, 219, 255, 190, 218, 255, 189, 217, 255, 189, 217, 255, 188, 216, 255, 188, 215, 255, 187, 215, 255, 186, 214, 255, 186, 213, 255, 186, 212, 255, 186, 212, 255, 186, 211, 255, 186, 210, 255, 186, 209, 255, 186, 208, 254, 185, 208, 254, 185, 207, 254, 185, 206, 254, 185, 205, 254, 185, 204, 254, 185, 204, 254, 185, 203, 254, 185, 202, 254, 184, 201, 254, 184, 201, 254, 184, 200, 253, 184, 199, 253, 184, 198, 253, 184, 197, 253, 184, 197, 253, 184, 196, 253, 184, 195, 253, 184, 194, 252, 185, 193, 252, 185, 192, 251, 186, 191, 251, 186, 190, 251, 186, 189, 250, 187, 188, 250, 187, 188, 250, 187, 187, 249, 188, 186, 249, 188, 185, 248, 188, 184, 248, 189, 183, 248, 189, 182, 247, 189, 181, 247, 190, 180, 247, 190, 179, 246, 190, 178, 246, 191, 177, 245, 191, 177, 245, 191, 176, 245, 192, 175, 244, 192, 174, 244, 193, 173, 243, 194, 172, 242, 195, 171, 241, 195, 170, 241, 196, 169, 240, 197, 168, 239, 197, 166, 238, 198, 165, 238, 199, 164, 237, 199, 163, 236, 200, 162, 235, 201, 161, 235, 201, 160, 234, 202, 159, 233, 202, 158, 232, 203, 157, 232, 204, 156, 231, 204, 155, 230, 205, 154, 229, 205, 153, 229, 206, 152, 228, 206, 151, 227, 207, 150, 226, 208, 149, 225, 209, 147, 224, 209, 146, 222, 210, 145, 221, 211, 144, 220, 212, 143, 219, 212, 142, 218, 213, 141, 216, 214, 139, 215, 214, 138, 214, 215, 137, 213, 216, 136, 212, 216, 135, 211, 217, 134, 209, 218, 132, 208, 218, 131, 207, 219, 130, 206, 220, 129, 205, 220, 128, 204, 221, 126, 202, 221, 125, 201, 222, 124, 200, 223, 123, 199, 223, 122, 197, 224, 120, 195, 224, 119, 194, 225, 118, 192, 225, 117, 191, 226, 116, 189, 226, 114, 187, 227, 113, 186, 227, 112, 184, 228, 111, 183, 228, 110, 181, 229, 108, 180, 229, 107, 178, 230, 106, 176, 230, 104, 175, 231, 103, 173, 231, 102, 172, 232, 101, 170, 232, 99, 169, 232, 98, 167, 233, 96, 166, 233, 95, 164, 233, 94, 162, 234, 93, 160, 234, 92, 158, 234, 90, 157, 234, 89, 155, 234, 88, 153, 235, 87, 151, 235, 85, 149, 235, 84, 147, 235, 83, 145, 235, 82, 143, 235, 80, 141, 235, 79, 140, 235, 78, 138, 236, 77, 136, 236, 75, 134, 236, 74, 132, 236, 73, 130, 236, 71, 128, 236, 70, 126, 236, 68, 125, 236, 67, 123, 236, 66, 121, 236, 64, 119, 236, 63, 117, 235, 62, 115, 235, 61, 113, 235, 60, 111, 234, 59, 108, 234, 58, 106, 234, 57, 104, 234, 56, 102, 233, 55, 100, 233, 54, 98, 232, 53, 96, 232, 52, 94, 232, 51, 92, 231, 50, 90, 231, 49, 88, 231, 48, 86, 230, 46, 84, 230, 45, 82, 229, 44, 79, 229, 43, 77, 229, 42, 75, 228, 40, 73, 228, 39, 71, 227, 39, 69, 226, 39, 67, 225, 38, 65, 224, 38, 62, 224, 38, 60, 223, 38, 58, 222, 37, 56, 221, 37, 53, 220, 37, 51, 219, 36, 49, 219, 36, 47, 218, 36, 44, 217, 36, 42, 216, 35, 39, 215, 35, 37, 214, 35, 35, 213, 34, 32, 213, 34, 29, 212, 34, 27, 211, 34, 24, 210, 34, 21, 209, 33, 18, 208, 33, 14]);
const CET_L20_RGB8UI = new Uint8Array([48, 48, 48, 49, 49, 51, 50, 49, 53, 51, 49, 56, 52, 50, 59, 53, 50, 61, 54, 50, 64, 54, 51, 66, 55, 51, 69, 56, 51, 71, 57, 52, 74, 57, 52, 76, 58, 52, 79, 59, 53, 81, 59, 53, 84, 60, 54, 86, 60, 54, 89, 61, 54, 91, 61, 55, 94, 62, 55, 96, 62, 55, 99, 63, 56, 101, 63, 56, 104, 64, 57, 106, 64, 57, 108, 64, 57, 111, 65, 58, 113, 65, 58, 116, 65, 59, 118, 66, 59, 120, 66, 60, 123, 66, 60, 125, 66, 61, 127, 66, 61, 130, 67, 62, 132, 67, 62, 134, 67, 63, 137, 67, 63, 139, 67, 64, 141, 67, 64, 143, 67, 65, 145, 67, 65, 147, 67, 66, 150, 67, 66, 152, 67, 67, 154, 67, 67, 156, 67, 68, 158, 67, 69, 160, 67, 69, 162, 66, 70, 164, 66, 71, 166, 66, 71, 168, 66, 72, 169, 66, 73, 171, 66, 73, 173, 65, 74, 175, 65, 75, 176, 65, 75, 178, 65, 76, 180, 64, 77, 181, 64, 78, 183, 64, 78, 184, 63, 79, 186, 63, 80, 187, 63, 81, 188, 62, 82, 190, 62, 83, 191, 61, 83, 192, 61, 84, 193, 61, 85, 194, 60, 86, 195, 60, 87, 196, 59, 88, 197, 59, 89, 198, 58, 90, 198, 58, 91, 199, 58, 92, 200, 57, 93, 200, 57, 94, 200, 56, 96, 201, 55, 97, 201, 55, 98, 201, 54, 99, 201, 54, 100, 200, 53, 101, 200, 52, 103, 200, 52, 104, 199, 51, 105, 198, 50, 107, 197, 49, 108, 196, 48, 110, 195, 47, 111, 193, 46, 112, 192, 45, 114, 190, 43, 116, 187, 42, 117, 185, 41, 119, 183, 39, 120, 181, 38, 122, 179, 37, 123, 176, 36, 124, 174, 36, 126, 172, 35, 127, 170, 34, 128, 168, 34, 130, 166, 34, 131, 164, 34, 132, 161, 34, 133, 159, 34, 134, 157, 35, 136, 155, 36, 137, 153, 36, 138, 151, 37, 139, 149, 38, 140, 147, 40, 141, 145, 41, 142, 143, 42, 143, 141, 44, 144, 139, 45, 145, 137, 47, 146, 135, 49, 147, 133, 51, 148, 131, 53, 149, 129, 55, 150, 127, 57, 151, 125, 59, 152, 123, 61, 152, 121, 63, 153, 120, 66, 154, 118, 68, 155, 116, 70, 156, 114, 73, 157, 112, 75, 157, 110, 78, 158, 108, 80, 159, 106, 83, 159, 104, 85, 160, 103, 88, 161, 101, 91, 162, 99, 93, 162, 97, 96, 163, 95, 99, 163, 93, 102, 164, 91, 105, 165, 89, 108, 165, 87, 111, 166, 86, 113, 166, 84, 116, 167, 82, 119, 167, 80, 122, 168, 78, 124, 168, 76, 127, 169, 74, 130, 169, 72, 132, 170, 71, 135, 170, 69, 137, 171, 67, 140, 171, 65, 143, 172, 63, 145, 172, 61, 148, 173, 59, 150, 173, 58, 152, 174, 56, 155, 174, 54, 157, 174, 52, 160, 175, 50, 162, 175, 48, 165, 176, 46, 167, 176, 45, 170, 176, 43, 172, 177, 41, 175, 177, 39, 177, 178, 37, 180, 178, 36, 182, 178, 34, 185, 179, 32, 187, 179, 30, 190, 179, 29, 192, 179, 27, 195, 180, 25, 197, 180, 24, 200, 180, 23, 203, 180, 21, 205, 181, 20, 208, 181, 19, 211, 181, 19, 213, 181, 18, 216, 181, 18, 219, 181, 18, 221, 182, 18, 224, 182, 19, 226, 182, 19, 228, 182, 19, 230, 183, 19, 232, 183, 19, 233, 184, 20, 235, 184, 20, 236, 185, 20, 238, 186, 20, 239, 186, 20, 240, 187, 20, 241, 188, 20, 242, 188, 20, 243, 189, 20, 244, 190, 20, 245, 191, 20, 246, 192, 20, 247, 193, 20, 247, 193, 20, 248, 194, 20, 249, 195, 20, 249, 196, 20, 250, 197, 20, 250, 198, 20, 251, 199, 20, 251, 200, 20, 252, 201, 20, 252, 202, 20, 253, 203, 19, 253, 204, 19, 253, 205, 19, 253, 207, 19, 254, 208, 19, 254, 209, 19, 254, 210, 19, 254, 211, 19, 254, 212, 18, 254, 213, 18, 255, 214, 18, 255, 216, 18, 255, 217, 18, 255, 218, 18, 255, 219, 17, 255, 220, 17, 255, 221, 17, 255, 223, 17, 254, 224, 16, 254, 225, 16, 254, 226, 16, 254, 227, 16, 254, 229, 15, 254, 230, 15, 254, 231, 15, 253, 232, 15, 253, 234, 14, 253, 235, 14, 253, 236, 14, 252, 237, 13, 252, 239, 13, 252, 240, 13, 251, 241, 12, 251, 242, 12, 250, 244, 12, 250, 245, 11, 250, 246, 11, 249, 247, 10, 249, 249, 10]);
const CET_L01 = /*@__PURE__*/ newColorTableEntry('cet-L01', RGB8UI, GL.LINEAR, CET_L01_RGB8UI);
const CET_L04 = /*@__PURE__*/ newColorTableEntry('cet-L04', RGB8UI, GL.LINEAR, CET_L04_RGB8UI);
const CET_L06 = /*@__PURE__*/ newColorTableEntry('cet-L06', RGB8UI, GL.LINEAR, CET_L06_RGB8UI);
const CET_L07 = /*@__PURE__*/ newColorTableEntry('cet-L07', RGB8UI, GL.LINEAR, CET_L07_RGB8UI);
const CET_L08 = /*@__PURE__*/ newColorTableEntry('cet-L08', RGB8UI, GL.LINEAR, CET_L08_RGB8UI);
const CET_L17 = /*@__PURE__*/ newColorTableEntry('cet-L17', RGB8UI, GL.LINEAR, CET_L17_RGB8UI);
const CET_L19 = /*@__PURE__*/ newColorTableEntry('cet-L19', RGB8UI, GL.LINEAR, CET_L19_RGB8UI);
const CET_L20 = /*@__PURE__*/ newColorTableEntry('cet-L20', RGB8UI, GL.LINEAR, CET_L20_RGB8UI);

function jetColor_LEGACY(frac, result) {
    frac = clamp(0, 1, frac);
    const x = 4 * frac;
    const segment = Math.floor(8 * frac);
    switch (segment) {
        case 0:
            result.r = 0;
            result.g = 0;
            result.b = 0.5 + x;
            break;
        case 1:
        case 2:
            result.r = 0;
            result.g = -0.5 + x;
            result.b = 1;
            break;
        case 3:
        case 4:
            result.r = -1.5 + x;
            result.g = 1;
            result.b = 2.5 - x;
            break;
        case 5:
        case 6:
            result.r = 1;
            result.g = 3.5 - x;
            result.b = 0;
            break;
        default:
            result.r = 4.5 - x;
            result.g = 0;
            result.b = 0;
            break;
    }
    result.a = 1;
}

const JET_LEGACY_RGB8UI = /*@__PURE__*/ createColorTable_RGB8UI(1024, jetColor_LEGACY);

const JET_LEGACY = /*@__PURE__*/ newColorTableEntry('jet', RGB8UI, GL.NEAREST, JET_LEGACY_RGB8UI);

const MAGMA_RGB8UI = new Uint8Array([0, 0, 4, 1, 0, 5, 1, 1, 6, 1, 1, 8, 2, 1, 9, 2, 2, 11, 2, 2, 13, 3, 3, 15, 3, 3, 18, 4, 4, 20, 5, 4, 22, 6, 5, 24, 6, 5, 26, 7, 6, 28, 8, 7, 30, 9, 7, 32, 10, 8, 34, 11, 9, 36, 12, 9, 38, 13, 10, 41, 14, 11, 43, 16, 11, 45, 17, 12, 47, 18, 13, 49, 19, 13, 52, 20, 14, 54, 21, 14, 56, 22, 15, 59, 24, 15, 61, 25, 16, 63, 26, 16, 66, 28, 16, 68, 29, 17, 71, 30, 17, 73, 32, 17, 75, 33, 17, 78, 34, 17, 80, 36, 18, 83, 37, 18, 85, 39, 18, 88, 41, 17, 90, 42, 17, 92, 44, 17, 95, 45, 17, 97, 47, 17, 99, 49, 17, 101, 51, 16, 103, 52, 16, 105, 54, 16, 107, 56, 16, 108, 57, 15, 110, 59, 15, 112, 61, 15, 113, 63, 15, 114, 64, 15, 116, 66, 15, 117, 68, 15, 118, 69, 16, 119, 71, 16, 120, 73, 16, 120, 74, 16, 121, 76, 17, 122, 78, 17, 123, 79, 18, 123, 81, 18, 124, 82, 19, 124, 84, 19, 125, 86, 20, 125, 87, 21, 126, 89, 21, 126, 90, 22, 126, 92, 22, 127, 93, 23, 127, 95, 24, 127, 96, 24, 128, 98, 25, 128, 100, 26, 128, 101, 26, 128, 103, 27, 128, 104, 28, 129, 106, 28, 129, 107, 29, 129, 109, 29, 129, 110, 30, 129, 112, 31, 129, 114, 31, 129, 115, 32, 129, 117, 33, 129, 118, 33, 129, 120, 34, 129, 121, 34, 130, 123, 35, 130, 124, 35, 130, 126, 36, 130, 128, 37, 130, 129, 37, 129, 131, 38, 129, 132, 38, 129, 134, 39, 129, 136, 39, 129, 137, 40, 129, 139, 41, 129, 140, 41, 129, 142, 42, 129, 144, 42, 129, 145, 43, 129, 147, 43, 128, 148, 44, 128, 150, 44, 128, 152, 45, 128, 153, 45, 128, 155, 46, 127, 156, 46, 127, 158, 47, 127, 160, 47, 127, 161, 48, 126, 163, 48, 126, 165, 49, 126, 166, 49, 125, 168, 50, 125, 170, 51, 125, 171, 51, 124, 173, 52, 124, 174, 52, 123, 176, 53, 123, 178, 53, 123, 179, 54, 122, 181, 54, 122, 183, 55, 121, 184, 55, 121, 186, 56, 120, 188, 57, 120, 189, 57, 119, 191, 58, 119, 192, 58, 118, 194, 59, 117, 196, 60, 117, 197, 60, 116, 199, 61, 115, 200, 62, 115, 202, 62, 114, 204, 63, 113, 205, 64, 113, 207, 64, 112, 208, 65, 111, 210, 66, 111, 211, 67, 110, 213, 68, 109, 214, 69, 108, 216, 69, 108, 217, 70, 107, 219, 71, 106, 220, 72, 105, 222, 73, 104, 223, 74, 104, 224, 76, 103, 226, 77, 102, 227, 78, 101, 228, 79, 100, 229, 80, 100, 231, 82, 99, 232, 83, 98, 233, 84, 98, 234, 86, 97, 235, 87, 96, 236, 88, 96, 237, 90, 95, 238, 91, 94, 239, 93, 94, 240, 95, 94, 241, 96, 93, 242, 98, 93, 242, 100, 92, 243, 101, 92, 244, 103, 92, 244, 105, 92, 245, 107, 92, 246, 108, 92, 246, 110, 92, 247, 112, 92, 247, 114, 92, 248, 116, 92, 248, 118, 92, 249, 120, 93, 249, 121, 93, 249, 123, 93, 250, 125, 94, 250, 127, 94, 250, 129, 95, 251, 131, 95, 251, 133, 96, 251, 135, 97, 252, 137, 97, 252, 138, 98, 252, 140, 99, 252, 142, 100, 252, 144, 101, 253, 146, 102, 253, 148, 103, 253, 150, 104, 253, 152, 105, 253, 154, 106, 253, 155, 107, 254, 157, 108, 254, 159, 109, 254, 161, 110, 254, 163, 111, 254, 165, 113, 254, 167, 114, 254, 169, 115, 254, 170, 116, 254, 172, 118, 254, 174, 119, 254, 176, 120, 254, 178, 122, 254, 180, 123, 254, 182, 124, 254, 183, 126, 254, 185, 127, 254, 187, 129, 254, 189, 130, 254, 191, 132, 254, 193, 133, 254, 194, 135, 254, 196, 136, 254, 198, 138, 254, 200, 140, 254, 202, 141, 254, 204, 143, 254, 205, 144, 254, 207, 146, 254, 209, 148, 254, 211, 149, 254, 213, 151, 254, 215, 153, 254, 216, 154, 253, 218, 156, 253, 220, 158, 253, 222, 160, 253, 224, 161, 253, 226, 163, 253, 227, 165, 253, 229, 167, 253, 231, 169, 253, 233, 170, 253, 235, 172, 252, 236, 174, 252, 238, 176, 252, 240, 178, 252, 242, 180, 252, 244, 182, 252, 246, 184, 252, 247, 185, 252, 249, 187, 252, 251, 189, 252, 253, 191]);
const PLASMA_RGB8UI = new Uint8Array([13, 8, 135, 16, 7, 136, 19, 7, 137, 22, 7, 138, 25, 6, 140, 27, 6, 141, 29, 6, 142, 32, 6, 143, 34, 6, 144, 36, 6, 145, 38, 5, 145, 40, 5, 146, 42, 5, 147, 44, 5, 148, 46, 5, 149, 47, 5, 150, 49, 5, 151, 51, 5, 151, 53, 4, 152, 55, 4, 153, 56, 4, 154, 58, 4, 154, 60, 4, 155, 62, 4, 156, 63, 4, 156, 65, 4, 157, 67, 3, 158, 68, 3, 158, 70, 3, 159, 72, 3, 159, 73, 3, 160, 75, 3, 161, 76, 2, 161, 78, 2, 162, 80, 2, 162, 81, 2, 163, 83, 2, 163, 85, 2, 164, 86, 1, 164, 88, 1, 164, 89, 1, 165, 91, 1, 165, 92, 1, 166, 94, 1, 166, 96, 1, 166, 97, 0, 167, 99, 0, 167, 100, 0, 167, 102, 0, 167, 103, 0, 168, 105, 0, 168, 106, 0, 168, 108, 0, 168, 110, 0, 168, 111, 0, 168, 113, 0, 168, 114, 1, 168, 116, 1, 168, 117, 1, 168, 119, 1, 168, 120, 1, 168, 122, 2, 168, 123, 2, 168, 125, 3, 168, 126, 3, 168, 128, 4, 168, 129, 4, 167, 131, 5, 167, 132, 5, 167, 134, 6, 166, 135, 7, 166, 136, 8, 166, 138, 9, 165, 139, 10, 165, 141, 11, 165, 142, 12, 164, 143, 13, 164, 145, 14, 163, 146, 15, 163, 148, 16, 162, 149, 17, 161, 150, 19, 161, 152, 20, 160, 153, 21, 159, 154, 22, 159, 156, 23, 158, 157, 24, 157, 158, 25, 157, 160, 26, 156, 161, 27, 155, 162, 29, 154, 163, 30, 154, 165, 31, 153, 166, 32, 152, 167, 33, 151, 168, 34, 150, 170, 35, 149, 171, 36, 148, 172, 38, 148, 173, 39, 147, 174, 40, 146, 176, 41, 145, 177, 42, 144, 178, 43, 143, 179, 44, 142, 180, 46, 141, 181, 47, 140, 182, 48, 139, 183, 49, 138, 184, 50, 137, 186, 51, 136, 187, 52, 136, 188, 53, 135, 189, 55, 134, 190, 56, 133, 191, 57, 132, 192, 58, 131, 193, 59, 130, 194, 60, 129, 195, 61, 128, 196, 62, 127, 197, 64, 126, 198, 65, 125, 199, 66, 124, 200, 67, 123, 201, 68, 122, 202, 69, 122, 203, 70, 121, 204, 71, 120, 204, 73, 119, 205, 74, 118, 206, 75, 117, 207, 76, 116, 208, 77, 115, 209, 78, 114, 210, 79, 113, 211, 81, 113, 212, 82, 112, 213, 83, 111, 213, 84, 110, 214, 85, 109, 215, 86, 108, 216, 87, 107, 217, 88, 106, 218, 90, 106, 218, 91, 105, 219, 92, 104, 220, 93, 103, 221, 94, 102, 222, 95, 101, 222, 97, 100, 223, 98, 99, 224, 99, 99, 225, 100, 98, 226, 101, 97, 226, 102, 96, 227, 104, 95, 228, 105, 94, 229, 106, 93, 229, 107, 93, 230, 108, 92, 231, 110, 91, 231, 111, 90, 232, 112, 89, 233, 113, 88, 233, 114, 87, 234, 116, 87, 235, 117, 86, 235, 118, 85, 236, 119, 84, 237, 121, 83, 237, 122, 82, 238, 123, 81, 239, 124, 81, 239, 126, 80, 240, 127, 79, 240, 128, 78, 241, 129, 77, 241, 131, 76, 242, 132, 75, 243, 133, 75, 243, 135, 74, 244, 136, 73, 244, 137, 72, 245, 139, 71, 245, 140, 70, 246, 141, 69, 246, 143, 68, 247, 144, 68, 247, 145, 67, 247, 147, 66, 248, 148, 65, 248, 149, 64, 249, 151, 63, 249, 152, 62, 249, 154, 62, 250, 155, 61, 250, 156, 60, 250, 158, 59, 251, 159, 58, 251, 161, 57, 251, 162, 56, 252, 163, 56, 252, 165, 55, 252, 166, 54, 252, 168, 53, 252, 169, 52, 253, 171, 51, 253, 172, 51, 253, 174, 50, 253, 175, 49, 253, 177, 48, 253, 178, 47, 253, 180, 47, 253, 181, 46, 254, 183, 45, 254, 184, 44, 254, 186, 44, 254, 187, 43, 254, 189, 42, 254, 190, 42, 254, 192, 41, 253, 194, 41, 253, 195, 40, 253, 197, 39, 253, 198, 39, 253, 200, 39, 253, 202, 38, 253, 203, 38, 252, 205, 37, 252, 206, 37, 252, 208, 37, 252, 210, 37, 251, 211, 36, 251, 213, 36, 251, 215, 36, 250, 216, 36, 250, 218, 36, 249, 220, 36, 249, 221, 37, 248, 223, 37, 248, 225, 37, 247, 226, 37, 247, 228, 37, 246, 230, 38, 246, 232, 38, 245, 233, 38, 245, 235, 39, 244, 237, 39, 243, 238, 39, 243, 240, 39, 242, 242, 39, 241, 244, 38, 241, 245, 37, 240, 247, 36, 240, 249, 33]);
const INFERNO_RGB8UI = new Uint8Array([0, 0, 4, 1, 0, 5, 1, 1, 6, 1, 1, 8, 2, 1, 10, 2, 2, 12, 2, 2, 14, 3, 2, 16, 4, 3, 18, 4, 3, 20, 5, 4, 23, 6, 4, 25, 7, 5, 27, 8, 5, 29, 9, 6, 31, 10, 7, 34, 11, 7, 36, 12, 8, 38, 13, 8, 41, 14, 9, 43, 16, 9, 45, 17, 10, 48, 18, 10, 50, 20, 11, 52, 21, 11, 55, 22, 11, 57, 24, 12, 60, 25, 12, 62, 27, 12, 65, 28, 12, 67, 30, 12, 69, 31, 12, 72, 33, 12, 74, 35, 12, 76, 36, 12, 79, 38, 12, 81, 40, 11, 83, 41, 11, 85, 43, 11, 87, 45, 11, 89, 47, 10, 91, 49, 10, 92, 50, 10, 94, 52, 10, 95, 54, 9, 97, 56, 9, 98, 57, 9, 99, 59, 9, 100, 61, 9, 101, 62, 9, 102, 64, 10, 103, 66, 10, 104, 68, 10, 104, 69, 10, 105, 71, 11, 106, 73, 11, 106, 74, 12, 107, 76, 12, 107, 77, 13, 108, 79, 13, 108, 81, 14, 108, 82, 14, 109, 84, 15, 109, 85, 15, 109, 87, 16, 110, 89, 16, 110, 90, 17, 110, 92, 18, 110, 93, 18, 110, 95, 19, 110, 97, 19, 110, 98, 20, 110, 100, 21, 110, 101, 21, 110, 103, 22, 110, 105, 22, 110, 106, 23, 110, 108, 24, 110, 109, 24, 110, 111, 25, 110, 113, 25, 110, 114, 26, 110, 116, 26, 110, 117, 27, 110, 119, 28, 109, 120, 28, 109, 122, 29, 109, 124, 29, 109, 125, 30, 109, 127, 30, 108, 128, 31, 108, 130, 32, 108, 132, 32, 107, 133, 33, 107, 135, 33, 107, 136, 34, 106, 138, 34, 106, 140, 35, 105, 141, 35, 105, 143, 36, 105, 144, 37, 104, 146, 37, 104, 147, 38, 103, 149, 38, 103, 151, 39, 102, 152, 39, 102, 154, 40, 101, 155, 41, 100, 157, 41, 100, 159, 42, 99, 160, 42, 99, 162, 43, 98, 163, 44, 97, 165, 44, 96, 166, 45, 96, 168, 46, 95, 169, 46, 94, 171, 47, 94, 173, 48, 93, 174, 48, 92, 176, 49, 91, 177, 50, 90, 179, 50, 90, 180, 51, 89, 182, 52, 88, 183, 53, 87, 185, 53, 86, 186, 54, 85, 188, 55, 84, 189, 56, 83, 191, 57, 82, 192, 58, 81, 193, 58, 80, 195, 59, 79, 196, 60, 78, 198, 61, 77, 199, 62, 76, 200, 63, 75, 202, 64, 74, 203, 65, 73, 204, 66, 72, 206, 67, 71, 207, 68, 70, 208, 69, 69, 210, 70, 68, 211, 71, 67, 212, 72, 66, 213, 74, 65, 215, 75, 63, 216, 76, 62, 217, 77, 61, 218, 78, 60, 219, 80, 59, 221, 81, 58, 222, 82, 56, 223, 83, 55, 224, 85, 54, 225, 86, 53, 226, 87, 52, 227, 89, 51, 228, 90, 49, 229, 92, 48, 230, 93, 47, 231, 94, 46, 232, 96, 45, 233, 97, 43, 234, 99, 42, 235, 100, 41, 235, 102, 40, 236, 103, 38, 237, 105, 37, 238, 106, 36, 239, 108, 35, 239, 110, 33, 240, 111, 32, 241, 113, 31, 241, 115, 29, 242, 116, 28, 243, 118, 27, 243, 120, 25, 244, 121, 24, 245, 123, 23, 245, 125, 21, 246, 126, 20, 246, 128, 19, 247, 130, 18, 247, 132, 16, 248, 133, 15, 248, 135, 14, 248, 137, 12, 249, 139, 11, 249, 140, 10, 249, 142, 9, 250, 144, 8, 250, 146, 7, 250, 148, 7, 251, 150, 6, 251, 151, 6, 251, 153, 6, 251, 155, 6, 251, 157, 7, 252, 159, 7, 252, 161, 8, 252, 163, 9, 252, 165, 10, 252, 166, 12, 252, 168, 13, 252, 170, 15, 252, 172, 17, 252, 174, 18, 252, 176, 20, 252, 178, 22, 252, 180, 24, 251, 182, 26, 251, 184, 29, 251, 186, 31, 251, 188, 33, 251, 190, 35, 250, 192, 38, 250, 194, 40, 250, 196, 42, 250, 198, 45, 249, 199, 47, 249, 201, 50, 249, 203, 53, 248, 205, 55, 248, 207, 58, 247, 209, 61, 247, 211, 64, 246, 213, 67, 246, 215, 70, 245, 217, 73, 245, 219, 76, 244, 221, 79, 244, 223, 83, 244, 225, 86, 243, 227, 90, 243, 229, 93, 242, 230, 97, 242, 232, 101, 242, 234, 105, 241, 236, 109, 241, 237, 113, 241, 239, 117, 241, 241, 121, 242, 242, 125, 242, 244, 130, 243, 245, 134, 243, 246, 138, 244, 248, 142, 245, 249, 146, 246, 250, 150, 248, 251, 154, 249, 252, 157, 250, 253, 161, 252, 255, 164]);
const VIRIDIS_RGB8UI = new Uint8Array([68, 1, 84, 68, 2, 86, 69, 4, 87, 69, 5, 89, 70, 7, 90, 70, 8, 92, 70, 10, 93, 70, 11, 94, 71, 13, 96, 71, 14, 97, 71, 16, 99, 71, 17, 100, 71, 19, 101, 72, 20, 103, 72, 22, 104, 72, 23, 105, 72, 24, 106, 72, 26, 108, 72, 27, 109, 72, 28, 110, 72, 29, 111, 72, 31, 112, 72, 32, 113, 72, 33, 115, 72, 35, 116, 72, 36, 117, 72, 37, 118, 72, 38, 119, 72, 40, 120, 72, 41, 121, 71, 42, 122, 71, 44, 122, 71, 45, 123, 71, 46, 124, 71, 47, 125, 70, 48, 126, 70, 50, 126, 70, 51, 127, 70, 52, 128, 69, 53, 129, 69, 55, 129, 69, 56, 130, 68, 57, 131, 68, 58, 131, 68, 59, 132, 67, 61, 132, 67, 62, 133, 66, 63, 133, 66, 64, 134, 66, 65, 134, 65, 66, 135, 65, 68, 135, 64, 69, 136, 64, 70, 136, 63, 71, 136, 63, 72, 137, 62, 73, 137, 62, 74, 137, 62, 76, 138, 61, 77, 138, 61, 78, 138, 60, 79, 138, 60, 80, 139, 59, 81, 139, 59, 82, 139, 58, 83, 139, 58, 84, 140, 57, 85, 140, 57, 86, 140, 56, 88, 140, 56, 89, 140, 55, 90, 140, 55, 91, 141, 54, 92, 141, 54, 93, 141, 53, 94, 141, 53, 95, 141, 52, 96, 141, 52, 97, 141, 51, 98, 141, 51, 99, 141, 50, 100, 142, 50, 101, 142, 49, 102, 142, 49, 103, 142, 49, 104, 142, 48, 105, 142, 48, 106, 142, 47, 107, 142, 47, 108, 142, 46, 109, 142, 46, 110, 142, 46, 111, 142, 45, 112, 142, 45, 113, 142, 44, 113, 142, 44, 114, 142, 44, 115, 142, 43, 116, 142, 43, 117, 142, 42, 118, 142, 42, 119, 142, 42, 120, 142, 41, 121, 142, 41, 122, 142, 41, 123, 142, 40, 124, 142, 40, 125, 142, 39, 126, 142, 39, 127, 142, 39, 128, 142, 38, 129, 142, 38, 130, 142, 38, 130, 142, 37, 131, 142, 37, 132, 142, 37, 133, 142, 36, 134, 142, 36, 135, 142, 35, 136, 142, 35, 137, 142, 35, 138, 141, 34, 139, 141, 34, 140, 141, 34, 141, 141, 33, 142, 141, 33, 143, 141, 33, 144, 141, 33, 145, 140, 32, 146, 140, 32, 146, 140, 32, 147, 140, 31, 148, 140, 31, 149, 139, 31, 150, 139, 31, 151, 139, 31, 152, 139, 31, 153, 138, 31, 154, 138, 30, 155, 138, 30, 156, 137, 30, 157, 137, 31, 158, 137, 31, 159, 136, 31, 160, 136, 31, 161, 136, 31, 161, 135, 31, 162, 135, 32, 163, 134, 32, 164, 134, 33, 165, 133, 33, 166, 133, 34, 167, 133, 34, 168, 132, 35, 169, 131, 36, 170, 131, 37, 171, 130, 37, 172, 130, 38, 173, 129, 39, 173, 129, 40, 174, 128, 41, 175, 127, 42, 176, 127, 44, 177, 126, 45, 178, 125, 46, 179, 124, 47, 180, 124, 49, 181, 123, 50, 182, 122, 52, 182, 121, 53, 183, 121, 55, 184, 120, 56, 185, 119, 58, 186, 118, 59, 187, 117, 61, 188, 116, 63, 188, 115, 64, 189, 114, 66, 190, 113, 68, 191, 112, 70, 192, 111, 72, 193, 110, 74, 193, 109, 76, 194, 108, 78, 195, 107, 80, 196, 106, 82, 197, 105, 84, 197, 104, 86, 198, 103, 88, 199, 101, 90, 200, 100, 92, 200, 99, 94, 201, 98, 96, 202, 96, 99, 203, 95, 101, 203, 94, 103, 204, 92, 105, 205, 91, 108, 205, 90, 110, 206, 88, 112, 207, 87, 115, 208, 86, 117, 208, 84, 119, 209, 83, 122, 209, 81, 124, 210, 80, 127, 211, 78, 129, 211, 77, 132, 212, 75, 134, 213, 73, 137, 213, 72, 139, 214, 70, 142, 214, 69, 144, 215, 67, 147, 215, 65, 149, 216, 64, 152, 216, 62, 155, 217, 60, 157, 217, 59, 160, 218, 57, 162, 218, 55, 165, 219, 54, 168, 219, 52, 170, 220, 50, 173, 220, 48, 176, 221, 47, 178, 221, 45, 181, 222, 43, 184, 222, 41, 186, 222, 40, 189, 223, 38, 192, 223, 37, 194, 223, 35, 197, 224, 33, 200, 224, 32, 202, 225, 31, 205, 225, 29, 208, 225, 28, 210, 226, 27, 213, 226, 26, 216, 226, 25, 218, 227, 25, 221, 227, 24, 223, 227, 24, 226, 228, 24, 229, 228, 25, 231, 228, 25, 234, 229, 26, 236, 229, 27, 239, 229, 28, 241, 229, 29, 244, 230, 30, 246, 230, 32, 248, 230, 33, 251, 231, 35, 253, 231, 37]);
const MAGMA = /*@__PURE__*/ newColorTableEntry('magma', RGB8UI, GL.LINEAR, MAGMA_RGB8UI);
const PLASMA = /*@__PURE__*/ newColorTableEntry('plasma', RGB8UI, GL.LINEAR, PLASMA_RGB8UI);
const INFERNO = /*@__PURE__*/ newColorTableEntry('inferno', RGB8UI, GL.LINEAR, INFERNO_RGB8UI);
const VIRIDIS = /*@__PURE__*/ newColorTableEntry('viridis', RGB8UI, GL.LINEAR, VIRIDIS_RGB8UI);

function attachDprListener(wnd, listener) {
    const queries = [];
    const queryListener = () => {
        for (const query of queries) {
            query.removeListener(queryListener);
        }
        arrayClear(queries);
        listener();
        const dpr = wnd.devicePixelRatio;
        if (dpr) {
            
            
            const dprAbove = 1e-2 * Math.ceil(dpr * 1e2);
            const dprBelow = 1e-2 * Math.floor(dpr * 1e2);
            queries.push(wnd.matchMedia(`screen and (max-resolution: ${dprAbove}dppx)`));
            queries.push(wnd.matchMedia(`screen and (min-resolution: ${dprBelow}dppx)`));
            for (const query of queries) {
                query.addListener(queryListener);
            }
        }
    };
    queryListener();
    return () => {
        for (const query of queries) {
            query.removeListener(queryListener);
        }
        arrayClear(queries);
    };
}
function attachCanvasResizeListener(wnd, parent, canvas, listener) {
    try {
        return attachDefaultCanvasResizeListener(wnd, canvas, listener);
    }
    catch (e) {
        return attachFallbackCanvasResizeListener(wnd, parent, canvas, listener);
    }
}
function attachDefaultCanvasResizeListener(wnd, canvas, listener) {
    
    
    
    
    const { width_PX, height_PX } = approxElementSize_PX(wnd, canvas);
    listener(width_PX, height_PX, undefined);
    
    
    
    
    
    
    
    
    const style = wnd.getComputedStyle(canvas);
    const resizeCallback = (entries) => {
        for (const en of entries) {
            if (en.target === canvas) {
                const sizes = en.devicePixelContentBoxSize;
                if (isNonNullish(sizes) && sizes.length === 1) {
                    const size = sizes[0];
                    const writingMode = style.writingMode;
                    const isWritingModeVertical = (isNonNullish(writingMode) && writingMode.toLowerCase().startsWith('vertical'));
                    const width_PX = (isWritingModeVertical ? size.blockSize : size.inlineSize);
                    const height_PX = (isWritingModeVertical ? size.inlineSize : size.blockSize);
                    listener(width_PX, height_PX, false);
                }
                else {
                    const { width_PX, height_PX } = approxElementSize_PX(wnd, canvas);
                    listener(width_PX, height_PX, true);
                }
            }
        }
    };
    const disposers = new DisposerGroup();
    const boxes = ['content-box', 'device-pixel-content-box'];
    for (const box of boxes) {
        
        
        const observer = new wnd.ResizeObserver(resizeCallback);
        observer.observe(canvas, { box });
        disposers.add(() => {
            observer.disconnect();
        });
    }
    return disposers;
}
function attachFallbackCanvasResizeListener(wnd, parent, canvas, listener) {
    const disposers = new DisposerGroup();
    function wrappedListener() {
        const { width_PX, height_PX } = approxElementSize_PX(wnd, canvas);
        listener(width_PX, height_PX, true);
    }
    disposers.add(attachDprListener(wnd, wrappedListener));
    disposers.add(attachLegacyElementResizeListener(wnd, parent, wrappedListener));
    return disposers;
}
function attachLegacyElementResizeListener(wnd, element, listener) {
    const document = requireNonNull(element.ownerDocument);
    
    
    
    if (wnd.getComputedStyle(element).getPropertyValue('position') === 'static') {
        throw new Error('Element has "static" positioning, which does not support resize detection -- change its positioning to "relative", or wrap it in a div with "relative" positioning');
    }
    const template = document.createElement('x-resize-canary');
    template.style.position = 'absolute';
    template.style.top = '0';
    template.style.left = '0';
    template.style.zIndex = '-16777215';
    template.style.visibility = 'hidden';
    template.style.overflow = 'hidden';
    const expandSizer = template.cloneNode(false);
    expandSizer.style.width = '999999px';
    expandSizer.style.height = '999999px';
    const expandCanary = template.cloneNode(false);
    expandCanary.style.width = '100%';
    expandCanary.style.height = '100%';
    expandCanary.appendChild(expandSizer);
    const shrinkSizer = template.cloneNode(false);
    shrinkSizer.style.width = '200%';
    shrinkSizer.style.height = '200%';
    const shrinkCanary = template.cloneNode(false);
    shrinkCanary.style.width = '100%';
    shrinkCanary.style.height = '100%';
    shrinkCanary.appendChild(shrinkSizer);
    const rootCanary = template.cloneNode(false);
    rootCanary.style.width = '100%';
    rootCanary.style.height = '100%';
    rootCanary.appendChild(expandCanary);
    rootCanary.appendChild(shrinkCanary);
    element.appendChild(rootCanary);
    const scrollFn = () => {
        expandCanary.scrollLeft = 999999;
        expandCanary.scrollTop = 999999;
        shrinkCanary.scrollLeft = 999999;
        shrinkCanary.scrollTop = 999999;
        listener();
    };
    expandCanary.onscroll = scrollFn;
    shrinkCanary.onscroll = scrollFn;
    scrollFn();
    return () => {
        expandCanary.onscroll = null;
        shrinkCanary.onscroll = null;
        element.removeChild(rootCanary);
    };
}
function approxElementSize_PX(wnd, element) {
    
    
    
    const dpr = (wnd.devicePixelRatio || 1);
    const bounds_LPX = element.getBoundingClientRect();
    const width_PX = Math.round(bounds_LPX.right * dpr) - Math.round(bounds_LPX.left * dpr);
    const height_PX = Math.round(bounds_LPX.bottom * dpr) - Math.round(bounds_LPX.top * dpr);
    return { width_PX, height_PX };
}

function setCssClassPresent(element, className, wantPresent) {
    const alreadyPresent = element.classList.contains(className);
    if (wantPresent && !alreadyPresent) {
        element.classList.add(className);
        return true;
    }
    else if (!wantPresent && alreadyPresent) {
        element.classList.remove(className);
        return true;
    }
    return false;
}
function addCssLink(url) {
    return appendCssLink(document.head, createCssLink(url)).loading;
}

function attachSubtreeRestyleListener(element, listener) {
    const disposersByChild = new DisposerGroupMap();
    const firingObserveOptions = {
        attributes: true,
        attributeFilter: ['id', 'class', 'style'],
        childList: true,
        subtree: true
    };
    const firingObserver = get$1(() => {
        let ancestors = getAncestors(element);
        return new MutationObserver(evs => {
            let shouldFire = false;
            let shouldCheckAncestors = false;
            for (const ev of evs) {
                switch (ev.type) {
                    case 'attributes':
                        {
                            
                            shouldFire = shouldFire || ev.target.contains(element);
                            shouldFire = shouldFire || element.contains(ev.target);
                        }
                        break;
                    case 'childList':
                        {
                            
                            shouldCheckAncestors = true;
                            
                            for (const node of ev.removedNodes) {
                                if (isStylesheetLink(node)) {
                                    disposersByChild.disposeFor(node);
                                }
                            }
                            
                            for (const node of ev.addedNodes) {
                                if (isStylesheetLink(node)) {
                                    disposersByChild.get(node).add(onCssLoaded(node, listener));
                                }
                            }
                            
                            shouldFire = shouldFire || get$1(() => {
                                for (const node of multiIterable(ev.addedNodes, ev.removedNodes)) {
                                    if (isStyle(node) || isStylesheetLink(node)) {
                                        return true;
                                    }
                                }
                                return false;
                            });
                            
                            shouldFire = shouldFire || element.contains(ev.target);
                        }
                        break;
                }
            }
            
            if (shouldCheckAncestors) {
                const newAncestors = getAncestors(element);
                shouldFire = shouldFire || !arrayAllEqual(newAncestors, ancestors);
                ancestors = newAncestors;
            }
            if (shouldFire) {
                listener();
            }
        });
    });
    const hierarchyObserveOptions = {
        childList: true,
        subtree: true
    };
    let hierarchyObserver;
    const hierarchyInit = get$1(() => {
        let ancestors = new Array();
        return () => {
            let newAncestors = getAncestors(element);
            if (!arrayAllEqual(newAncestors, ancestors)) {
                hierarchyObserver.disconnect();
                firingObserver.disconnect();
                disposersByChild.dispose();
                ancestors = newAncestors;
                
                for (const link of element.getRootNode().querySelectorAll('link')) {
                    if (isStylesheetLink(link)) {
                        disposersByChild.get(link).add(onCssLoaded(link, listener));
                    }
                }
                
                firingObserver.observe(element.getRootNode(), firingObserveOptions);
                
                for (const r of getRoots(element)) {
                    hierarchyObserver.observe(r, hierarchyObserveOptions);
                }
            }
        };
    });
    
    hierarchyObserver = new MutationObserver(hierarchyInit);
    hierarchyInit();
    return () => {
        hierarchyObserver.disconnect();
        firingObserver.disconnect();
        disposersByChild.dispose();
    };
}
function isStylesheetLink(node) {
    const link = node;
    return (link.tagName === 'LINK' && link.rel === 'stylesheet');
}
function isStyle(node) {
    const element = node;
    return (element.tagName === 'STYLE');
}
function getRoots(node) {
    var _a;
    const roots = new Array();
    let root = node.getRootNode();
    while (true) {
        roots.push(root);
        root = (_a = root === null || root === void 0 ? void 0 : root.host) === null || _a === void 0 ? void 0 : _a.getRootNode();
        if (!root) {
            return roots;
        }
    }
}
function getAncestors(node) {
    var _a;
    const ancestors = new Array();
    let ancestor = node;
    while (true) {
        ancestors.push(ancestor);
        const next = (_a = ancestor.parentNode) !== null && _a !== void 0 ? _a : ancestor.host;
        if (next) {
            ancestor = next;
        }
        else {
            return ancestors;
        }
    }
}

const NORTH = Symbol('NORTH');
const SOUTH = Symbol('SOUTH');
const EAST = Symbol('EAST');
const WEST = Symbol('WEST');
function getOppositeEdge(edge) {
    switch (edge) {
        case NORTH: return SOUTH;
        case SOUTH: return NORTH;
        case EAST: return WEST;
        case WEST: return EAST;
    }
}

function createInset(a, b, c, d) {
    if (b === undefined) {
        return { top: a, right: a, bottom: a, left: a };
    }
    else if (c === undefined) {
        return { top: a, right: b, bottom: a, left: b };
    }
    else if (d === undefined) {
        return { top: a, right: b, bottom: c, left: b };
    }
    else {
        return { top: a, right: b, bottom: c, left: d };
    }
}
function scaleInset(inset, scaleFactor) {
    return {
        top: inset.top * scaleFactor,
        right: inset.right * scaleFactor,
        bottom: inset.bottom * scaleFactor,
        left: inset.left * scaleFactor
    };
}
function roundInset(inset) {
    return {
        top: Math.round(inset.top),
        right: Math.round(inset.right),
        bottom: Math.round(inset.bottom),
        left: Math.round(inset.left)
    };
}
Object.freeze(createInset(0));

function glGetUniformLocation(gl, program, name) {
    return (program ? gl.getUniformLocation(program, name) : null);
}
function glGetAttribLocation(gl, program, name) {
    return (program ? gl.getAttribLocation(program, name) : -1);
}
function glUniformBool(gl, location, b) {
    gl.uniform1i(location, (b ? 1 : 0));
}
function glUniformEdge(gl, location, edge) {
    switch (edge) {
        case NORTH:
            gl.uniform1i(location, 0);
            break;
        case SOUTH:
            gl.uniform1i(location, 1);
            break;
        case EAST:
            gl.uniform1i(location, 2);
            break;
        case WEST:
            gl.uniform1i(location, 3);
            break;
        default: throw new Error('Unrecognized edge: ' + edge);
    }
}
function glUniformRgba(gl, location, color) {
    gl.uniform4f(location, color.r, color.g, color.b, color.a);
}
function glUniformInterval1D(gl, location, interval) {
    gl.uniform2f(location, interval.min, interval.span);
}
function glUniformInterval2D(gl, location, interval) {
    gl.uniform4f(location, interval.xMin, interval.yMin, interval.w, interval.h);
}
function doInitProgram(gl, program, vertShader_GLSL, fragShader_GLSL) {
    const vertShader = gl.createShader(GL.VERTEX_SHADER);
    const fragShader = gl.createShader(GL.FRAGMENT_SHADER);
    try {
        compileShader(gl, vertShader, vertShader_GLSL);
        compileShader(gl, fragShader, fragShader_GLSL);
        linkProgram(gl, program, vertShader, fragShader);
    }
    finally {
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
    }
}
function compileShader(gl, shader, glsl) {
    var _a;
    if (shader != null) {
        gl.shaderSource(shader, glsl);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, GL.COMPILE_STATUS) && !gl.isContextLost()) {
            throw new Error((_a = gl.getShaderInfoLog(shader)) !== null && _a !== void 0 ? _a : undefined);
        }
    }
}
function linkProgram(gl, program, ...shaders) {
    var _a;
    if (program != null) {
        for (const shader of shaders) {
            if (shader != null) {
                gl.attachShader(program, shader);
            }
        }
        try {
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, GL.LINK_STATUS) && !gl.isContextLost()) {
                throw new Error((_a = gl.getProgramInfoLog(program)) !== null && _a !== void 0 ? _a : undefined);
            }
        }
        finally {
            for (const shader of shaders) {
                if (shader != null) {
                    gl.detachShader(program, shader);
                }
            }
        }
    }
}
class ShaderProgram {
    constructor(source) {
        var _a;
        this.vertShader_GLSL = source.vertShader_GLSL;
        this.fragShader_GLSL = source.fragShader_GLSL;
        this.uniformNames = [...(_a = source.uniformNames) !== null && _a !== void 0 ? _a : []];
        this.attribNames = [...source.attribNames];
        this.glIncarnation = null;
        this.dProgram = null;
        this.dUniforms = null;
        this.dAttribs = null;
    }
    prepare(gl, glIncarnation) {
        if (glIncarnation !== this.glIncarnation) {
            this.glIncarnation = glIncarnation;
            this.dProgram = gl.createProgram();
            doInitProgram(gl, this.dProgram, this.vertShader_GLSL, this.fragShader_GLSL);
            const dUniforms = {};
            for (const uniformName of this.uniformNames) {
                dUniforms[uniformName] = glGetUniformLocation(gl, this.dProgram, uniformName);
            }
            this.dUniforms = dUniforms;
            const dAttribs = {};
            for (const attribName of this.attribNames) {
                dAttribs[attribName] = glGetAttribLocation(gl, this.dProgram, attribName);
            }
            this.dAttribs = dAttribs;
        }
    }
    get uniforms() {
        return requireNonNullish(this.dUniforms);
    }
    get attribs() {
        return requireNonNullish(this.dAttribs);
    }
    get program() {
        return this.dProgram;
    }
    dispose(gl, glIncarnation) {
        if (glIncarnation === this.glIncarnation) {
            gl.deleteProgram(this.dProgram);
        }
        this.glIncarnation = null;
        this.dProgram = null;
    }
}

var _a$2, _b;
var PeerType;
(function (PeerType) {
    PeerType[PeerType["PANE"] = 0] = "PANE";
    PeerType[PeerType["LAYOUT"] = 1] = "LAYOUT";
    PeerType[PeerType["PAINTER"] = 2] = "PAINTER";
    PeerType[PeerType["CONTRAPTION"] = 3] = "CONTRAPTION";
    PeerType[PeerType["SITE"] = 4] = "SITE";
    PeerType[PeerType["OTHER"] = 5] = "OTHER";
})(PeerType || (PeerType = {}));
const DOM_PEER_SYMBOL = Symbol('@@__GLEAM_DOM_PEER__@@');
function isDomPeer(obj) {
    return !!(obj && typeof obj === 'object' && obj[DOM_PEER_SYMBOL]);
}
function createDomPeer(tagName, gleamPeer, gleamType) {
    return Object.assign(document.createElement(tagName), {
        [DOM_PEER_SYMBOL]: true,
        gleamPeer,
        gleamType,
    });
}
function createValueSupplier(parser, v) {
    if (isstr(v)) {
        return frozenSupplier(parseOrThrow(parser, v));
    }
    else if (isStyleProp(v)) {
        return () => v.get();
    }
    else {
        return frozenSupplier(v);
    }
}
const STYLE_PROP_SYMBOL = Symbol('@@__GLEAM_STYLE_PROP__@@');
function isStyleProp(obj) {
    return !!(obj && typeof obj === 'object' && obj[STYLE_PROP_SYMBOL]);
}
class StyleProp {
    
    static create(style, name, parser, fallback, cacheSize = 1) {
        return new StyleProp(style, name, parser, createValueSupplier(parser, fallback), cacheSize);
    }
    static create2(style, name, parser, getFallback, cacheSize = 1) {
        return new StyleProp(style, name, parser, getFallback, cacheSize);
    }
    constructor(style, name, parser, getFallback, cacheSize) {
        this[_a$2] = true;
        this.style = style;
        this.name = name;
        this.parser = parser;
        this.getFallback = getFallback;
        this.getOverride = undefined;
        this.transforms = new LinkedMap();
        this.cache = (cacheSize > 0 ? new CssParseCache(cacheSize) : undefined);
    }
    get() {
        let value = cssParsed(this.parser, this.getOverride, this.style, this.name, this.getFallback, this.cache);
        for (const [_, transform] of this.transforms) {
            value = transform(value);
        }
        return value;
    }
    get override() {
        var _c;
        return (_c = this.getOverride) === null || _c === void 0 ? void 0 : _c.call(this);
    }
    set override(value) {
        this.getOverride = () => value;
    }
}
_a$2 = STYLE_PROP_SYMBOL;
const UNBOUND_STYLE_PROP_SYMBOL = Symbol('@@__GLEAM_UNBOUND_STYLE_PROP__@@');
function isUnboundStyleProp(obj) {
    return !!(obj && typeof obj === 'object' && obj[UNBOUND_STYLE_PROP_SYMBOL]);
}
class UnboundStyleProp {
    
    static create(name, parser, fallback, cacheSize = 10) {
        return new UnboundStyleProp(name, parser, createValueSupplier(parser, fallback), cacheSize);
    }
    static create2(name, parser, getFallback, cacheSize = 10) {
        return new UnboundStyleProp(name, parser, getFallback, cacheSize);
    }
    constructor(name, parser, getFallback, cacheSize) {
        this[_b] = true;
        this.name = name;
        this.parser = parser;
        this.getFallback = getFallback;
        this.transforms = new LinkedMap();
        this.cache = (cacheSize > 0 ? new CssParseCache(cacheSize) : undefined);
    }
    get(style, getOverride) {
        let value = cssParsed(this.parser, getOverride, style, this.name, this.getFallback, this.cache);
        for (const [_, transform] of this.transforms) {
            value = transform(value);
        }
        return value;
    }
}
_b = UNBOUND_STYLE_PROP_SYMBOL;
function parseOrThrow(parser, s) {
    const v = parser.parse(s);
    if (v === UNPARSEABLE) {
        throw new Error(`CSS parsing failed: required = ${parser.descriptionOfValidValues}, found = ${s}`);
    }
    else {
        return v;
    }
}
const UNPARSEABLE = Symbol('UNPARSEABLE');

class CssParser {
    constructor(descriptionOfValidValues, parse) {
        this.descriptionOfValidValues = descriptionOfValidValues;
        this.parse = parse;
    }
}
class CssParseCache {
    constructor(maxSize) {
        this.map = new LinkedMap();
        this.maxSize = maxSize;
    }
    get(unparsed, parseFn) {
        const cached = this.map.get(unparsed);
        if (cached !== undefined) {
            return cached;
        }
        else {
            const parsed = parseFn(unparsed);
            this.map.putLast(unparsed, parsed);
            if (this.maxSize > 0) {
                while (this.map.size > this.maxSize) {
                    this.map.removeFirst();
                }
            }
            return parsed;
        }
    }
}
function cssParsed(parser, getOverride, style, propName, getFallback, cache) {
    var _c;
    try {
        const override = getOverride === null || getOverride === void 0 ? void 0 : getOverride();
        if (isDefined(override)) {
            return override;
        }
    }
    catch (e) {
        console.warn(`CSS override supplier failed: "${propName}"`, e, e.stack);
    }
    const sRaw = style.getPropertyValue(propName);
    
    
    
    let s = sRaw.trim();
    
    
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.substring(1, s.length - 1);
    }
    if (s.length > 0) {
        const parseFn = wrapParseFn(parser.parse, () => {
            console.warn(`CSS parsing failed: "${propName}:${sRaw}"`);
        });
        const result = (_c = cache === null || cache === void 0 ? void 0 : cache.get(s, parseFn)) !== null && _c !== void 0 ? _c : parseFn(s);
        if (result !== UNPARSEABLE) {
            return result;
        }
    }
    return getFallback();
}
function wrapParseFn(parseFn, handleParseFailure) {
    return s => {
        let result;
        try {
            result = parseFn(s);
        }
        catch (e) {
            result = UNPARSEABLE;
        }
        if (result === UNPARSEABLE) {
            handleParseFailure(s);
        }
        return result;
    };
}
const cssString = new CssParser('<string>', s => s);
const cssLowercase = new CssParser('<string>', s => s.toLowerCase());
new CssParser('<string>', s => s.toUpperCase());
const cssInteger = new CssParser('<integer>', parseInt);
const cssColor = new CssParser('<color>', parseColor);
const truthyStrings = new Set(['true', 'yes', 't', 'y', '1']);
const cssBoolean = new CssParser('<boolean>', s => {
    return truthyStrings.has(s.trim().toLowerCase());
});
const posInfStrings = new Set(['+inf', '+infinity', 'inf', 'infinity']);
const negInfStrings = new Set(['-inf', '-infinity']);
const cssFloat = new CssParser('<number>', s => {
    if (posInfStrings.has(s)) {
        return Number.POSITIVE_INFINITY;
    }
    if (negInfStrings.has(s)) {
        return Number.NEGATIVE_INFINITY;
    }
    return parseFloat(s);
});
function cssEnum(enumType) {
    const validValues = Object.keys(enumType)
        .map(s => s.toLowerCase().replace(/_/g, '-'))
        .join(' | ');
    return new CssParser(validValues, s => {
        const enumKey = s.toUpperCase().replace(/-/g, '_');
        return requireDefined(enumType[enumKey]);
    });
}
const cssInset = new CssParser('omni | vertical horizontal | top horizontal bottom | top right bottom left', s => {
    const numbers = new Array();
    for (const token of s.trim().split(/\s+/, 4)) {
        numbers.push(numberOr(parseFloat(token), 0));
    }
    return createInset(numbers[0], numbers[1], numbers[2], numbers[3]);
});
Object.freeze(basicEscapes('\\'));
Object.freeze(basicDelims(','));
Object.freeze([
    basicQuotePair('"', '"'),
    basicQuotePair("'", "'"),
    basicQuotePair("`", "`"),
    basicQuotePair('(', ')'),
    basicQuotePair('[', ']'),
    basicQuotePair('{', '}'),
]);

const DEFAULT_CHARS = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789!@#$%^&*()`~-_=+[]{}\\|;:\'",.<>/? \t°±©¹²³–×—≤≥';
const DEFAULT_MISSING_CHAR_FALLBACK = '?';
class TextAtlasCache {
    constructor(options) {
        var _a, _b, _c;
        this.alphabet = (_a = options === null || options === void 0 ? void 0 : options.alphabet) !== null && _a !== void 0 ? _a : DEFAULT_CHARS;
        this.alphabetForMetrics = (_b = options === null || options === void 0 ? void 0 : options.alphabetForMetrics) !== null && _b !== void 0 ? _b : this.alphabet;
        this.maxDim = (_c = options === null || options === void 0 ? void 0 : options.maxDim) !== null && _c !== void 0 ? _c : 4096;
        this.entriesByFont = new Map();
    }
    
    get(font, dpr, currFrameNum) {
        const en = mapSetIfAbsent(this.entriesByFont, font, () => ({
            dpr: undefined,
            atlas: new Atlas(this.maxDim),
            lastAccessFrameNum: undefined,
        }));
        if (dpr !== en.dpr) {
            en.dpr = dpr;
            en.atlas.clear();
            en.atlas.putAll(createTextImages(dpr, font, this.alphabetForMetrics, 1, this.alphabet));
        }
        if (isDefined(currFrameNum)) {
            en.lastAccessFrameNum = currFrameNum;
            
            
            
            for (const [font, en] of this.entriesByFont) {
                if (en.lastAccessFrameNum === undefined) {
                    en.lastAccessFrameNum = currFrameNum;
                }
                else if (en.lastAccessFrameNum < currFrameNum - 1) {
                    this.entriesByFont.delete(font);
                }
            }
        }
        return en.atlas;
    }
}
function getGlyphCount(atlas, text, missingCharFallback = DEFAULT_MISSING_CHAR_FALLBACK) {
    var _a;
    const fallback = requireDefined(atlas.get(missingCharFallback));
    let count = 0;
    for (const c of text) {
        const [, box] = ((_a = atlas.get(c)) !== null && _a !== void 0 ? _a : fallback);
        if (box !== undefined) {
            count++;
        }
    }
    return count;
}
function getTextWidth(atlas, text, missingCharFallback = DEFAULT_MISSING_CHAR_FALLBACK) {
    var _a;
    const fallback = requireDefined(atlas.get(missingCharFallback));
    let w_PX = 0;
    for (const c of text) {
        const [image] = ((_a = atlas.get(c)) !== null && _a !== void 0 ? _a : fallback);
        w_PX += image.imageData.width - 2 * image.border;
    }
    return w_PX;
}
function putTextCoords(atlas, coords, i, viewport_PX, x_PX, y_PX, angle_MATHRAD, text, missingCharFallback = DEFAULT_MISSING_CHAR_FALLBACK) {
    var _a;
    const fallback = requireDefined(atlas.get(missingCharFallback));
    const y_UPX = viewport_PX.h - y_PX;
    const wTexel_FRAC = 1 / atlas.getUsedArea().w;
    const hTexel_FRAC = 1 / atlas.getUsedArea().h;
    const sinAdvance = Math.sin(angle_MATHRAD);
    const cosAdvance = Math.cos(angle_MATHRAD);
    const sinAscent = cosAdvance;
    const cosAscent = -sinAdvance;
    let cumuAdvance_PX = 0;
    for (const c of text) {
        const [image, box] = ((_a = atlas.get(c)) !== null && _a !== void 0 ? _a : fallback);
        const advance_PX = image.imageData.width - 2 * image.border;
        const ascent_PX = image.yAnchor - image.border;
        const descent_PX = image.imageData.height - image.border - image.yAnchor;
        const xBaseLeft_PX = x_PX + cosAdvance * cumuAdvance_PX;
        const yBaseLeft_UPX = y_UPX + sinAdvance * cumuAdvance_PX;
        const xTopLeft_PX = xBaseLeft_PX + cosAscent * ascent_PX;
        const yTopLeft_UPX = yBaseLeft_UPX + sinAscent * ascent_PX;
        const xBottomLeft_PX = xBaseLeft_PX - cosAscent * descent_PX;
        const yBottomLeft_UPX = yBaseLeft_UPX - sinAscent * descent_PX;
        const xTopRight_PX = xTopLeft_PX + cosAdvance * advance_PX;
        const yTopRight_UPX = yTopLeft_UPX + sinAdvance * advance_PX;
        const xBottomRight_PX = xBottomLeft_PX + cosAdvance * advance_PX;
        const yBottomRight_UPX = yBottomLeft_UPX + sinAdvance * advance_PX;
        const xTopLeft = xPixelToNdc(viewport_PX.x, xTopLeft_PX);
        const yTopLeft = yUpwardPixelToNdc(viewport_PX.y, yTopLeft_UPX);
        const xBottomLeft = xPixelToNdc(viewport_PX.x, xBottomLeft_PX);
        const yBottomLeft = yUpwardPixelToNdc(viewport_PX.y, yBottomLeft_UPX);
        const xTopRight = xPixelToNdc(viewport_PX.x, xTopRight_PX);
        const yTopRight = yUpwardPixelToNdc(viewport_PX.y, yTopRight_UPX);
        const xBottomRight = xPixelToNdc(viewport_PX.x, xBottomRight_PX);
        const yBottomRight = yUpwardPixelToNdc(viewport_PX.y, yBottomRight_UPX);
        const sLeft = (box.xMin + image.border) * wTexel_FRAC;
        const sRight = (box.xMax - image.border) * wTexel_FRAC;
        const tTop = (box.yMin + image.border) * hTexel_FRAC;
        const tBottom = (box.yMax - image.border) * hTexel_FRAC;
        i = put4f(coords, i, xTopLeft, yTopLeft, sLeft, tTop);
        i = put4f(coords, i, xBottomLeft, yBottomLeft, sLeft, tBottom);
        i = put4f(coords, i, xTopRight, yTopRight, sRight, tTop);
        i = put4f(coords, i, xTopRight, yTopRight, sRight, tTop);
        i = put4f(coords, i, xBottomLeft, yBottomLeft, sLeft, tBottom);
        i = put4f(coords, i, xBottomRight, yBottomRight, sRight, tBottom);
        cumuAdvance_PX += advance_PX;
    }
    return i;
}

function createTextImages(dpr, font, alphabetForMetrics, border, strings) {
    const metrics = estimateFontMetrics(dpr, font, alphabetForMetrics);
    const images = new Map();
    for (const s of strings) {
        images.set(s, createTextImage(dpr, font, metrics, border, 'black', 'white', s));
    }
    return images;
}

const canvas$1 = document.createElement('canvas');
canvas$1.width = 1;
canvas$1.height = 1;
const g$1 = requireNonNull(canvas$1.getContext('2d', { willReadFrequently: true }));
class FontMetrics extends ValueBase {
    constructor(args) {
        super(args.ascent_PX, args.descent_PX);
        this.ascent_PX = args.ascent_PX;
        this.descent_PX = args.descent_PX;
    }
}
function estimateFontMetrics(dpr, font, alphabetForMetrics) {
    
    g$1.font = font;
    g$1.textAlign = 'left';
    g$1.textBaseline = 'alphabetic';
    const emWidth_PX = Math.ceil(dpr * g$1.measureText('M').width);
    const wGuess_PX = 2 * emWidth_PX;
    const hGuess_PX = 3 * emWidth_PX;
    const padding_PX = Math.ceil(dpr);
    const wScratch_PX = wGuess_PX + 2 * padding_PX;
    const hScratch_PX = hGuess_PX + 2 * padding_PX;
    canvas$1.width = Math.max(canvas$1.width, wScratch_PX);
    canvas$1.height = Math.max(canvas$1.height, hScratch_PX);
    
    g$1.font = font;
    g$1.textAlign = 'left';
    g$1.textBaseline = 'alphabetic';
    
    const yBaseline_PX = Math.round(0.667 * hGuess_PX) + padding_PX;
    g$1.fillStyle = 'white';
    g$1.fillRect(0, 0, canvas$1.width, canvas$1.height);
    const bgBytes = g$1.getImageData(0, 0, 1, 1).data;
    g$1.save();
    g$1.translate(padding_PX, yBaseline_PX);
    g$1.scale(dpr, dpr);
    try {
        g$1.fillStyle = 'black';
        for (const ch of alphabetForMetrics) {
            g$1.fillText(ch, 0, 0);
        }
    }
    finally {
        g$1.restore();
    }
    const imageData = g$1.getImageData(0, 0, wScratch_PX, hScratch_PX);
    const { contentTop_PX, contentBottom_PX } = findContentTopAndBottom_PX(imageData, bgBytes, 0);
    if (contentTop_PX < contentBottom_PX) {
        return new FontMetrics({
            ascent_PX: yBaseline_PX - contentTop_PX,
            descent_PX: contentBottom_PX - yBaseline_PX,
        });
    }
    else {
        return new FontMetrics({
            ascent_PX: 0,
            descent_PX: 0,
        });
    }
}

function createTextImage(dpr, font, metrics, border_PX, fgColor, bgColor, s) {
    border_PX = Math.ceil(border_PX);
    
    const leftPadding_PX = Math.ceil(2 * dpr);
    const rightPadding_PX = Math.ceil(2 * dpr);
    
    g$1.font = font;
    g$1.textAlign = 'left';
    g$1.textBaseline = 'alphabetic';
    const wEstimate_PX = Math.ceil(dpr * g$1.measureText(s).width);
    const hEstimate_PX = Math.ceil(metrics.ascent_PX + metrics.descent_PX);
    const wScratch_PX = border_PX + leftPadding_PX + wEstimate_PX + rightPadding_PX + border_PX;
    const hScratch_PX = border_PX + hEstimate_PX + border_PX;
    canvas$1.width = Math.max(canvas$1.width, wScratch_PX);
    canvas$1.height = Math.max(canvas$1.height, hScratch_PX);
    
    g$1.font = font;
    g$1.textAlign = 'left';
    g$1.textBaseline = 'alphabetic';
    const yBaseline_PX = border_PX + metrics.ascent_PX;
    
    
    
    
    
    
    
    
    const { contentLeft_PX, contentRight_PX } = run(() => {
        g$1.fillStyle = 'white';
        g$1.fillRect(0, 0, canvas$1.width, canvas$1.height);
        g$1.save();
        g$1.translate(border_PX + leftPadding_PX, yBaseline_PX);
        g$1.scale(dpr, dpr);
        try {
            g$1.fillStyle = 'black';
            g$1.fillText(s, 0, 0);
        }
        finally {
            g$1.restore();
        }
        const bwData = g$1.getImageData(0, 0, wScratch_PX, hScratch_PX);
        return findContentLeftAndRight_PX(bwData, border_PX, Math.ceil(0.5 * dpr));
    });
    
    if (!equal(parseColor(fgColor), BLACK) || !equal(parseColor(bgColor), WHITE)) {
        g$1.clearRect(0, 0, canvas$1.width, canvas$1.height);
        g$1.fillStyle = bgColor;
        g$1.fillRect(0, 0, canvas$1.width, canvas$1.height);
        g$1.save();
        g$1.translate(border_PX + leftPadding_PX, yBaseline_PX);
        g$1.scale(dpr, dpr);
        try {
            g$1.fillStyle = fgColor;
            g$1.fillText(s, 0, 0);
        }
        finally {
            g$1.restore();
        }
    }
    const whitespace = (contentLeft_PX > contentRight_PX);
    const top_PX = 0;
    const left_PX = (whitespace ? 0 : contentLeft_PX - border_PX);
    const width_PX = (whitespace ? wEstimate_PX + 2 * border_PX : (contentRight_PX + border_PX) - (contentLeft_PX - border_PX));
    const height_PX = hScratch_PX;
    return {
        xAnchor: border_PX,
        yAnchor: yBaseline_PX,
        border: border_PX,
        imageData: g$1.getImageData(left_PX, top_PX, width_PX, height_PX),
    };
}
function isRowAllBackground(bgBytes, rowBytes) {
    for (let i = 0; i < rowBytes.length; i++) {
        if (rowBytes[i] !== bgBytes[i % bgBytes.length]) {
            return false;
        }
    }
    return true;
}
function findContentTopAndBottom_PX(imageData, bgBytes, border) {
    const imageBytes = imageData.data;
    const numBytesPerPixel = bgBytes.length;
    const numBytesPerRow = numBytesPerPixel * imageData.width;
    const numBytesPerBorder = numBytesPerPixel * border;
    
    const contentTop_PX = run(() => {
        for (let y = border; y < imageData.height - border; y++) {
            const rowBytes = imageBytes.subarray((y) * numBytesPerRow + numBytesPerBorder, (y + 1) * numBytesPerRow - numBytesPerBorder);
            if (!isRowAllBackground(bgBytes, rowBytes)) {
                return y;
            }
        }
        return imageData.height;
    });
    
    const contentBottom_PX = run(() => {
        for (let y = imageData.height - 1 - border; y >= contentTop_PX; y--) {
            const rowBytes = imageBytes.subarray((y) * numBytesPerRow + numBytesPerBorder, (y + 1) * numBytesPerRow - numBytesPerBorder);
            if (!isRowAllBackground(bgBytes, rowBytes)) {
                return (y + 1);
            }
        }
        return contentTop_PX;
    });
    return { contentTop_PX, contentBottom_PX };
}
function findContentLeftAndRight_PX(bwData, border_PX, desiredPadding_PX) {
    const bwBytes = bwData.data;
    const numBytesPerPixel = 4;
    const numBytesPerRow = numBytesPerPixel * bwData.width;
    let outerLeft_PX = bwData.width;
    let innerLeft_PX = bwData.width;
    leftLoop: {
        for (let x = 0; x < bwData.width; x++) {
            for (let y = border_PX; y < bwData.height - border_PX; y++) {
                const green = bwBytes[y * numBytesPerRow + x * numBytesPerPixel + 1];
                if (green < 255) {
                    outerLeft_PX = Math.min(outerLeft_PX, x);
                    if (green < 204) {
                        innerLeft_PX = x;
                        break leftLoop;
                    }
                }
            }
        }
    }
    let outerRight_PX = 0;
    let innerRight_PX = 0;
    rightLoop: {
        for (let x = bwData.width - 1; x >= 0; x--) {
            for (let y = border_PX; y < bwData.height - border_PX; y++) {
                const green = bwBytes[y * numBytesPerRow + x * numBytesPerPixel + 1];
                if (green < 255) {
                    outerRight_PX = Math.max(outerRight_PX, x + 1);
                    if (green < 204) {
                        innerRight_PX = x + 1;
                        break rightLoop;
                    }
                }
            }
        }
    }
    return {
        contentLeft_PX: Math.min(outerLeft_PX, innerLeft_PX - desiredPadding_PX),
        contentRight_PX: Math.max(outerRight_PX, innerRight_PX + desiredPadding_PX),
    };
}

const { abs, pow, round } = Math;

class Axis1D {
    constructor(group) {
        this.changes = new ActivityListenableBasic();
        this.dpr = 1;
        this.viewport_PX = Interval1D.fromEdges(0, 1000);
        this.minConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.spanConstraint = Interval1D.fromEdges(0, Number.POSITIVE_INFINITY);
        this.scaleConstraint = Interval1D.fromEdges(0, Number.POSITIVE_INFINITY);
        this.cacheState = null;
        this.group = group.clone();
        this.groupMembership = new DisposerGroup();
        this.link(group);
    }
    get span_LPX() {
        return (this.viewport_PX.span / this.dpr);
    }
    get bounds() {
        return this.getState().bounds;
    }
    
    get scale() {
        return this.getState().scale;
    }
    pxToCoord(px) {
        const frac = this.viewport_PX.valueToFrac(px);
        return this.getState().bounds.fracToValue(frac);
    }
    coordToPx(coord) {
        const frac = this.getState().bounds.valueToFrac(coord);
        return this.viewport_PX.fracToValue(frac);
    }
    getState() {
        const span_LPX = this.span_LPX;
        const groupMarker = this.group.getStateMarker();
        if (!this.cacheState || this.cacheState.marker !== groupMarker || this.cacheState.span_LPX !== span_LPX) {
            this.cacheState = this.group.computeAxisState(span_LPX);
        }
        return this.cacheState;
    }
    
    reconstrain(ongoing) {
        this.group.reconstrain(ongoing);
    }
    set(ongoing, a, b, c) {
        this.group.set(ongoing, this.span_LPX, a, b, c);
    }
    
    pan(ongoing, frac, coord) {
        this.group.pan(ongoing, this.span_LPX, frac, coord);
    }
    getGroup() {
        return this.group;
    }
    link(group) {
        this.groupMembership.dispose();
        this.group = group;
        this.groupMembership.add(this.group._addMember(this));
        this.groupMembership.add(this.group.changes.addListener(ongoing => {
            this.changes.fire(ongoing);
        }));
        this.group.reconstrain(false);
        return () => {
            this.unlink();
        };
    }
    unlink() {
        this.link(this.group.clone());
    }
}

const ZOOM_STEP_FACTOR = 1.12;

const PSEUDOWHEEL_STEP_LPX = 4;
const deferredAxisReconstrains = new Array();

function attachAxisViewportUpdater1D(centerPane, axis, axisType, getInset_LPX) {
    
    
    
    function updateAxisFields() {
        const dpr = currentDpr(centerPane);
        let viewport_PX = centerPane.getViewport_PX()[axisType];
        if (getInset_LPX) {
            const inset_PX = round(getInset_LPX() * dpr);
            viewport_PX = Interval1D.fromEdges(viewport_PX.min + inset_PX, viewport_PX.max - inset_PX);
        }
        if (viewport_PX.span > 0 && (dpr !== axis.dpr || !equal(viewport_PX, axis.viewport_PX))) {
            
            const oldDpr = axis.dpr;
            const oldViewport_PX = axis.viewport_PX;
            
            axis.dpr = dpr;
            axis.viewport_PX = viewport_PX;
            
            return () => {
                if (axis.dpr === dpr && axis.viewport_PX === viewport_PX) {
                    axis.dpr = oldDpr;
                    axis.viewport_PX = oldViewport_PX;
                }
            };
        }
        else {
            
            return undefined;
        }
    }
    
    const disposers = new DisposerGroup();
    disposers.add(centerPane.layoutReady.addListener({ order: -0.1 }, () => {
        if (updateAxisFields()) {
            deferredAxisReconstrains.push(() => {
                
                axis.reconstrain(false);
            });
        }
    }));
    disposers.add(centerPane.layoutReady.addListener({ order: 0 }, () => {
        for (const reconstrainAxis of deferredAxisReconstrains) {
            reconstrainAxis();
        }
        deferredAxisReconstrains.length = 0;
    }));
    
    const immediateDisposers = updateAxisFields();
    if (immediateDisposers) {
        disposers.add(immediateDisposers);
        addToActiveTxn({
            rollback() {
                disposers.dispose();
            },
            postCommit() {
                axis.reconstrain(false);
            }
        });
    }
    return disposers;
}
function attachAxisInputHandlers1D(mousePane, axis, axisType) {
    return mousePane.addInputHandler(createAxisZoomersAndPanners1D(axis, axisType));
}

function createAxisZoomersAndPanners1D(axis, axisType) {
    return {
        getHoverHandler(evMove) {
            if (evMove.modifiers.ctrl) {
                return createHoverZoomer$1(axis, axisType);
            }
            else {
                return createHoverPanner$1(axis, axisType);
            }
        },
        getDragHandler(evGrab) {
            if (evGrab.button === 1 || (evGrab.button === 0 && evGrab.modifiers.ctrl)) {
                return createDragZoomer$1(axis, axisType, evGrab);
            }
            else if (evGrab.button === 0) {
                return createDragPanner$1(axis, axisType, evGrab);
            }
            else {
                return null;
            }
        },
        getWheelHandler(evGrabOrWheel) {
            
            if (evGrabOrWheel.modifiers.isEmpty()) {
                return createWheelZoomer$1(axis, axisType);
            }
            else {
                return null;
            }
        },
    };
}
function createHoverPanner$1(axis, axisType) {
    return {
        target: newImmutableList(['Pan1D', axis]),
        getMouseCursorClasses: frozenSupplier(axisType === X ? ['x-axis-panner'] : ['y-axis-panner']),
    };
}
function createHoverZoomer$1(axis, axisType) {
    return {
        target: newImmutableList(['Zoom1D', axis]),
        getMouseCursorClasses: frozenSupplier(axisType === X ? ['x-axis-zoomer'] : ['y-axis-zoomer']),
    };
}
function createDragPanner$1(axis, axisType, evGrab) {
    const grabFrac = getMouseAxisFrac1D(axis, axisType, evGrab);
    const grabCoord = axis.bounds.fracToValue(grabFrac);
    return {
        target: newImmutableList(['Pan1D', axis]),
        getMouseCursorClasses: frozenSupplier(axisType === X ? ['x-axis-panner'] : ['y-axis-panner']),
        handleDrag(evDrag) {
            const mouseFrac = getMouseAxisFrac1D(axis, axisType, evDrag);
            axis.pan(true, mouseFrac, grabCoord);
        },
        handleUngrab(evUngrab) {
            const mouseFrac = getMouseAxisFrac1D(axis, axisType, evUngrab);
            axis.pan(false, mouseFrac, grabCoord);
        },
    };
}
function createDragZoomer$1(axis, axisType, evGrab) {
    const grabFrac = getMouseAxisFrac1D(axis, axisType, evGrab);
    const grabCoord = axis.bounds.fracToValue(grabFrac);
    const grabScale = axis.scale;
    return {
        target: newImmutableList(['Zoom1D', axis]),
        getMouseCursorClasses: frozenSupplier(axisType === X ? ['x-axis-zoomer'] : ['y-axis-zoomer']),
        handleDrag(evDrag) {
            const wheelSteps = -1 * trunc$1((evDrag.loc_PX.y - evGrab.loc_PX.y) / (PSEUDOWHEEL_STEP_LPX * evGrab.dpr));
            const scale = grabScale / pow(ZOOM_STEP_FACTOR, wheelSteps);
            axis.set(true, grabFrac, grabCoord, scale);
        },
        handleUngrab(evUngrab) {
            const wheelSteps = -1 * trunc$1((evUngrab.loc_PX.y - evGrab.loc_PX.y) / (PSEUDOWHEEL_STEP_LPX * evGrab.dpr));
            const scale = grabScale / pow(ZOOM_STEP_FACTOR, wheelSteps);
            axis.set(false, grabFrac, grabCoord, scale);
        },
    };
}
function createWheelZoomer$1(axis, axisType) {
    return {
        target: newImmutableList(['Zoom1D', axis]),
        handleWheel(evWheel) {
            const frac = getMouseAxisFrac1D(axis, axisType, evWheel);
            const coord = axis.bounds.fracToValue(frac);
            const scale = axis.scale / pow(ZOOM_STEP_FACTOR, evWheel.wheelSteps);
            axis.set(false, frac, coord, scale);
        },
    };
}
function getMouseAxisFrac1D(axis, axisType, ev) {
    return axis.viewport_PX.valueToFrac(ev.loc_PX[axisType]);
}
function getMouseAxisCoord1D(axis, axisType, ev) {
    const frac = getMouseAxisFrac1D(axis, axisType, ev);
    return axis.bounds.fracToValue(frac);
}

class Axis2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.changes = new ActivityListenableSet(this.x.changes, this.y.changes);
    }
    get [X]() {
        return this.x;
    }
    get [Y]() {
        return this.y;
    }
    get bounds() {
        return Interval2D.fromXy(this.x.bounds, this.y.bounds);
    }
    
    get scale() {
        return new Point2D(this.x.scale, this.y.scale);
    }
    reconstrain(ongoing) {
        doTxn(() => {
            this.x.reconstrain(ongoing);
            this.y.reconstrain(ongoing);
        });
    }
    set(ongoing, a, b, c, d) {
        if (d !== undefined) {
            const xMin = a;
            const xMax = b;
            const yMin = c;
            const yMax = d;
            doTxn(() => {
                this.x.set(ongoing, xMin, xMax);
                this.y.set(ongoing, yMin, yMax);
                
                
                
                if (this.x.bounds.span < 0.95 * (xMax - xMin) || this.y.bounds.span < 0.95 * (yMax - yMin)) {
                    this.x.set(ongoing, xMin, xMax);
                }
            });
        }
        else if (c !== undefined) {
            const frac = a;
            const coord = b;
            const scale = c;
            doTxn(() => {
                this.x.set(ongoing, x(frac), x(coord), x(scale));
                this.y.set(ongoing, y(frac), y(coord), y(scale));
            });
        }
        else if (b !== undefined) {
            const xBounds = a;
            const yBounds = b;
            doTxn(() => {
                this.x.set(ongoing, xBounds);
                this.y.set(ongoing, yBounds);
                
                
                
                if (this.x.bounds.span < 0.95 * xBounds.span || this.y.bounds.span < 0.95 * yBounds.span) {
                    this.x.set(ongoing, xBounds);
                }
            });
        }
        else {
            const bounds = a;
            doTxn(() => {
                this.x.set(ongoing, bounds.x);
                this.y.set(ongoing, bounds.y);
                
                
                
                if (this.x.bounds.span < 0.95 * bounds.x.span || this.y.bounds.span < 0.95 * bounds.y.span) {
                    this.x.set(ongoing, bounds.x);
                }
            });
        }
    }
    pan(ongoing, frac, coord) {
        doTxn(() => {
            this.x.pan(ongoing, x(frac), x(coord));
            this.y.pan(ongoing, y(frac), y(coord));
        });
    }
    get viewport_PX() {
        return Interval2D.fromXy(this.x.viewport_PX, this.y.viewport_PX);
    }
}
function createAxisZoomerAndPanner2D(axis) {
    return {
        getHoverHandler(evMove) {
            if (evMove.modifiers.ctrl) {
                return createHoverZoomer(axis);
            }
            else {
                return createHoverPanner(axis);
            }
        },
        getDragHandler(evGrab) {
            if (evGrab.button === 1 || (evGrab.button === 0 && evGrab.modifiers.ctrl)) {
                return createDragZoomer(axis, evGrab);
            }
            else if (evGrab.button === 0) {
                return createDragPanner(axis, evGrab);
            }
            else {
                return null;
            }
        },
        getWheelHandler(evGrabOrWheel) {
            
            if (evGrabOrWheel.modifiers.isEmpty()) {
                return createWheelZoomer(axis);
            }
            else {
                return null;
            }
        },
    };
}
function createHoverPanner(axis) {
    return {
        target: newImmutableList(['Pan2D', axis]),
        getMouseCursorClasses: frozenSupplier(['xy-axis-panner']),
    };
}
function createHoverZoomer(axis) {
    return {
        target: newImmutableList(['Zoom2D', axis]),
        getMouseCursorClasses: frozenSupplier(['xy-axis-zoomer']),
    };
}
function createDragPanner(axis, evGrab) {
    const grabFrac = getMouseAxisFrac2D(axis, evGrab);
    const grabCoord = axis.bounds.fracToValue(grabFrac);
    return {
        target: newImmutableList(['Pan2D', axis]),
        getMouseCursorClasses: frozenSupplier(['xy-axis-panner']),
        handleDrag(evDrag) {
            const mouseFrac = getMouseAxisFrac2D(axis, evDrag);
            axis.pan(true, mouseFrac, grabCoord);
        },
        handleUngrab(evUngrab) {
            const mouseFrac = getMouseAxisFrac2D(axis, evUngrab);
            axis.pan(false, mouseFrac, grabCoord);
        }
    };
}
function createDragZoomer(axis, evGrab) {
    const grabFrac = getMouseAxisFrac2D(axis, evGrab);
    const grabCoord = axis.bounds.fracToValue(grabFrac);
    const grabScale = axis.scale;
    return {
        target: newImmutableList(['Zoom2D', axis]),
        getMouseCursorClasses: frozenSupplier(['xy-axis-zoomer']),
        handleDrag(evDrag) {
            const wheelSteps = -1 * trunc$1((evDrag.loc_PX.y - evGrab.loc_PX.y) / (PSEUDOWHEEL_STEP_LPX * evGrab.dpr));
            const scale = grabScale.times(1.0 / Math.pow(ZOOM_STEP_FACTOR, wheelSteps));
            axis.set(true, grabFrac, grabCoord, scale);
        },
        handleUngrab(evUngrab) {
            const wheelSteps = -1 * trunc$1((evUngrab.loc_PX.y - evGrab.loc_PX.y) / (PSEUDOWHEEL_STEP_LPX * evGrab.dpr));
            const scale = grabScale.times(1.0 / Math.pow(ZOOM_STEP_FACTOR, wheelSteps));
            axis.set(false, grabFrac, grabCoord, scale);
        }
    };
}
function createWheelZoomer(axis) {
    return {
        target: newImmutableList(['Zoom2D', axis]),
        handleWheel(evWheel) {
            const frac = getMouseAxisFrac2D(axis, evWheel);
            const coord = axis.bounds.fracToValue(frac);
            const scale = axis.scale.times(1.0 / Math.pow(ZOOM_STEP_FACTOR, evWheel.wheelSteps));
            axis.set(false, frac, coord, scale);
        },
    };
}
function getMouseAxisFrac2D(axis, ev) {
    return new Point2D(axis.x.viewport_PX.valueToFrac(ev.loc_PX.x), axis.y.viewport_PX.valueToFrac(ev.loc_PX.y));
}

class TagCoordRef extends RefDerived {
    constructor(mapRef, key) {
        super(mapRef);
        this.mapRef = mapRef;
        this.key = key;
    }
    areEqual(a, b) {
        return Object.is(a, b);
    }
    get v() {
        return requireDefined(this.mapRef.v.get(this.key));
    }
    doSet(ongoing, value) {
        return this.mapRef.update(ongoing, map => map.set(this.key, value));
    }
}
class TagMap {
    constructor(tags = {}) {
        this.coordsRef = new RefBasic(newImmutableMap([]), equal);
        this.constraintFn = NOOP;
        this.tagsMap = new Map();
        this.tagsArray = new CowArray();
        this.tagsArrayNeedsRegen = false;
        this.tagsArrayNeedsSort = false;
        
        _addOldNewActivityListener(this.coordsRef, { immediate: true, order: -1e6 }, (ongoing, oldMap0, newMap0) => {
            const changingKeys = new Set();
            const oldMap = oldMap0 !== null && oldMap0 !== void 0 ? oldMap0 : newImmutableMap([]);
            const newMap = newMap0 !== null && newMap0 !== void 0 ? newMap0 : newImmutableMap([]);
            const keys = newImmutableSet([...oldMap.keys(), ...newMap.keys()]);
            for (const key of keys) {
                const oldCoord = oldMap.get(key);
                const newCoord = newMap.get(key);
                if (newCoord !== oldCoord) {
                    changingKeys.add(key);
                    if (oldCoord === undefined) {
                        
                        this.tagsMap.set(key, {
                            map: this,
                            key: key,
                            coord: new TagCoordRef(this.coordsRef, key)
                        });
                        this.tagsArrayNeedsRegen = true;
                        this.tagsArrayNeedsSort = true;
                    }
                    else if (newCoord === undefined) {
                        
                        this.tagsMap.delete(key);
                        this.tagsArrayNeedsRegen = true;
                    }
                    else {
                        
                        this.tagsArrayNeedsSort = true;
                    }
                }
            }
            doTxn(() => {
                this.constraintFn(ongoing, this.tagsMap, changingKeys);
            });
        });
        this.set(false, tags);
    }
    get changes() {
        return this.coordsRef;
    }
    getTag(key) {
        return this.tagsMap.get(key);
    }
    requireTag(key) {
        const tag = this.getTag(key);
        if (isUndefined(tag)) {
            throw new Error(`Tag not found: key = "${key}"`);
        }
        return tag;
    }
    getCoord(key) {
        return this.coordsRef.v.get(key);
    }
    requireCoord(key) {
        const coord = this.getCoord(key);
        if (isUndefined(coord)) {
            throw new Error(`Coord not found: key = "${key}"`);
        }
        return coord;
    }
    requireInterval(minKey, maxKey) {
        const min = this.requireCoord(minKey);
        const max = this.requireCoord(maxKey);
        return Interval1D.fromEdges(min, max);
    }
    set(ongoing, tags) {
        this.coordsRef.update(ongoing, map => {
            
            
            const mutable = new Map(map);
            for (const [key, coord] of Object.entries(tags)) {
                mutable.set(key, coord);
            }
            return newImmutableMap(mutable);
        });
    }
    delete(ongoing, key) {
        this.coordsRef.update(ongoing, map => map.remove(key));
    }
    setConstraint(constraintFn) {
        this.constraintFn = constraintFn;
        doTxn(() => {
            this.constraintFn(false, this.tagsMap, new Set());
        });
    }
    updateTagsArray() {
        if (this.tagsArrayNeedsRegen) {
            this.tagsArray.length = 0;
            for (const tag of this.tagsMap.values()) {
                this.tagsArray.push(tag);
            }
            this.tagsArrayNeedsRegen = false;
            this.tagsArrayNeedsSort = true;
        }
        if (this.tagsArrayNeedsSort) {
            this.tagsArray.sortStable((a, b) => {
                return (a.coord.v - b.coord.v);
            });
            this.tagsArrayNeedsSort = false;
        }
    }
    minCoord() {
        this.updateTagsArray();
        const tag = this.tagsArray.get(0);
        return (tag && tag.coord.v);
    }
    maxCoord() {
        this.updateTagsArray();
        const tag = this.tagsArray.get(this.tagsArray.length - 1);
        return (tag && tag.coord.v);
    }
    sortedCoords() {
        this.updateTagsArray();
        const result = [];
        for (const tag of this.tagsArray) {
            result.push(tag.coord.v);
        }
        return result;
    }
    findNearest(coord, acceptableTagCoordInterval) {
        this.updateTagsArray();
        const i = this.tagsArray.findIndexNearest(tag => {
            tag.coord.v;
            return (tag.coord.v - coord);
        });
        const tag = this.tagsArray.get(i);
        if (acceptableTagCoordInterval.containsPoint(tag.coord.v)) {
            return tag;
        }
        else {
            return undefined;
        }
    }
    [Symbol.iterator]() {
        this.updateTagsArray();
        return this.tagsArray[Symbol.iterator]();
    }
}
const tagGrabDistance_LPX = 10;
const tagSnapDistance_LPX = 7;
function allowSnap(modifiers) {
    
    
    return !modifiers.shift;
}
function snap(axis, coord, snapCoords) {
    const i = findIndexNearest(snapCoords, snapCoord => snapCoord - coord);
    if (i >= 0) {
        const snapCoord = snapCoords[i];
        if (Math.abs(coord - snapCoord) <= tagSnapDistance_LPX / axis.scale) {
            return snapCoord;
        }
    }
    return coord;
}
function createTagsInputHandler1D(axis, axisType, tags, allowDragAll = true, getSnapCoords) {
    const getSingleTagMouseCursorClasses = frozenSupplier(axisType === X ? ['x-tag-dragger'] : ['y-tag-dragger']);
    const getMultiTagMouseCursorClasses = frozenSupplier(axisType === X ? ['x-multitag-dragger'] : ['y-multitag-dragger']);
    return {
        getHoverHandler(evMove) {
            const moveCoord = getMouseAxisCoord1D(axis, axisType, evMove);
            const tag = tags.findNearest(moveCoord, axis.bounds);
            if (tag) {
                const moveOffset = moveCoord - tag.coord.v;
                if (Math.abs(moveOffset) <= tagGrabDistance_LPX / axis.scale) {
                    return {
                        target: tag,
                        getMouseCursorClasses: getSingleTagMouseCursorClasses,
                    };
                }
            }
            if (allowDragAll && axis.bounds.containsPoint(moveCoord)) {
                const minTagCoord = tags.minCoord();
                const maxTagCoord = tags.maxCoord();
                if (isDefined(minTagCoord) && isDefined(maxTagCoord)) {
                    const moveTagFrac = (moveCoord - minTagCoord) / (maxTagCoord - minTagCoord);
                    if (0.0 <= moveTagFrac && moveTagFrac <= 1.0) {
                        return {
                            target: tags,
                            getMouseCursorClasses: getMultiTagMouseCursorClasses,
                        };
                    }
                }
            }
            return null;
        },
        getDragHandler(evGrab) {
            if (evGrab.button === 0) {
                const grabCoord = getMouseAxisCoord1D(axis, axisType, evGrab);
                const tag = tags.findNearest(grabCoord, axis.bounds);
                if (tag) {
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    const grabOffset = grabCoord - tag.coord.v;
                    if (Math.abs(grabOffset) <= tagGrabDistance_LPX / axis.scale) {
                        return {
                            target: tag,
                            getMouseCursorClasses: getSingleTagMouseCursorClasses,
                            handleDrag(evDrag) {
                                const mouseCoord = getMouseAxisCoord1D(axis, axisType, evDrag);
                                let tagCoord = mouseCoord - grabOffset;
                                if (getSnapCoords && allowSnap(evDrag.modifiers)) {
                                    tagCoord = snap(axis, tagCoord, getSnapCoords(axis));
                                }
                                tag.coord.set(true, tagCoord);
                            },
                            handleUngrab(evUngrab) {
                                const mouseCoord = getMouseAxisCoord1D(axis, axisType, evUngrab);
                                let tagCoord = mouseCoord - grabOffset;
                                if (getSnapCoords && allowSnap(evUngrab.modifiers)) {
                                    tagCoord = snap(axis, tagCoord, getSnapCoords(axis));
                                }
                                tag.coord.set(false, tagCoord);
                            }
                        };
                    }
                }
                if (allowDragAll && axis.bounds.containsPoint(grabCoord)) {
                    const minTagCoord = tags.minCoord();
                    const maxTagCoord = tags.maxCoord();
                    if (minTagCoord !== undefined && maxTagCoord !== undefined) {
                        const grabTagFrac = (grabCoord - minTagCoord) / (maxTagCoord - minTagCoord);
                        if (0.0 <= grabTagFrac && grabTagFrac <= 1.0) {
                            const grabOffsetsByKey = new Map();
                            for (const tag of tags) {
                                grabOffsetsByKey.set(tag.key, grabCoord - tag.coord.v);
                            }
                            return {
                                target: tags,
                                getMouseCursorClasses: getMultiTagMouseCursorClasses,
                                handleDrag(evDrag) {
                                    const mouseCoord = getMouseAxisCoord1D(axis, axisType, evDrag);
                                    const newTags = {};
                                    for (const tag of tags) {
                                        const grabOffset = grabOffsetsByKey.get(tag.key);
                                        if (grabOffset !== undefined) {
                                            newTags[tag.key] = mouseCoord - grabOffset;
                                        }
                                        else {
                                            
                                            grabOffsetsByKey.set(tag.key, mouseCoord - tag.coord.v);
                                        }
                                    }
                                    tags.set(true, newTags);
                                },
                                handleUngrab(evUngrab) {
                                    const mouseCoord = getMouseAxisCoord1D(axis, axisType, evUngrab);
                                    const newTags = {};
                                    for (const tag of tags) {
                                        const grabOffset = grabOffsetsByKey.get(tag.key);
                                        if (grabOffset !== undefined) {
                                            newTags[tag.key] = mouseCoord - grabOffset;
                                        }
                                    }
                                    tags.set(false, newTags);
                                },
                            };
                        }
                    }
                }
            }
            return null;
        },
        getWheelHandler(evGrabOrWheel) {
            
            if (evGrabOrWheel.modifiers.isEmpty()) {
                const mouseCoord = getMouseAxisCoord1D(axis, axisType, evGrabOrWheel);
                const tag = tags.findNearest(mouseCoord, axis.bounds);
                if (tag) {
                    const mouseOffset = mouseCoord - tag.coord.v;
                    if (Math.abs(mouseOffset) <= tagGrabDistance_LPX / axis.scale) {
                        return {
                            target: tag,
                            handleWheel(evWheel) {
                                const tagCoord = tag.coord.v;
                                const tagFrac = axis.bounds.valueToFrac(tagCoord);
                                const scale = axis.scale / Math.pow(ZOOM_STEP_FACTOR, evWheel.wheelSteps);
                                axis.set(false, tagFrac, tagCoord, scale);
                            },
                        };
                    }
                }
            }
            return null;
        },
    };
}
function createTagOrderConstraint(...keysInOrder) {
    return (ongoing, map, changingKeys) => {
        const tags = [];
        for (const key of keysInOrder) {
            const tag = map.get(key);
            if (tag) {
                tags.push(tag);
            }
        }
        
        let floorCoord = Number.NEGATIVE_INFINITY;
        for (const tag of tags) {
            if (changingKeys.has(tag.key)) {
                if (tag.coord.v < floorCoord) {
                    tag.coord.set(ongoing, floorCoord);
                }
                else if (tag.coord.v > floorCoord) {
                    floorCoord = tag.coord.v;
                }
            }
        }
        
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if (changingKeys.has(tag.key)) {
                
                let ceilCoord = tag.coord.v;
                for (let iBelow = i - 1; iBelow >= 0; iBelow--) {
                    const tagBelow = tags[iBelow];
                    if (!changingKeys.has(tagBelow.key)) {
                        if (tagBelow.coord.v > ceilCoord) {
                            tagBelow.coord.set(ongoing, ceilCoord);
                        }
                        else if (tagBelow.coord.v < ceilCoord) {
                            ceilCoord = tagBelow.coord.v;
                        }
                    }
                    else {
                        break;
                    }
                }
                
                let floorCoord = tag.coord.v;
                for (let iAbove = i + 1; iAbove < tags.length; iAbove++) {
                    const tagAbove = tags[iAbove];
                    if (!changingKeys.has(tagAbove.key)) {
                        if (tagAbove.coord.v < floorCoord) {
                            tagAbove.coord.set(ongoing, floorCoord);
                        }
                        else if (tagAbove.coord.v > floorCoord) {
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
function texImage2D(gl, target, format, type, data, metaExtra) {
    const componentsPerPixel = get$1(() => {
        switch (format) {
            case GL.ALPHA: return 1;
            case GL.LUMINANCE: return 1;
            case GL.LUMINANCE_ALPHA: return 2;
            case GL.RGB: return 3;
            case GL.RGBA: return 4;
        }
        throw new Error(`Unrecognized pixel format: ${format}`);
    });
    gl.texImage2D(target, 0, format, format, type, data);
    return Object.assign({ componentType: type, componentsPerPixel, pixelsWide: data.width, pixelsHigh: data.height }, (metaExtra !== null && metaExtra !== void 0 ? metaExtra : {}));
}

class LayoutBase {
    constructor(peerTag) {
        this.prepFns = new LinkedSet();
        this.peer = createDomPeer(peerTag, this, PeerType.LAYOUT);
        this.style = window.getComputedStyle(this.peer);
    }
}

class ChildlessLayout {
    constructor() {
        this.peer = createDomPeer('childless-layout', this, PeerType.LAYOUT);
        this.style = window.getComputedStyle(this.peer);
        this.prefWidth_LPX = StyleProp.create(this.style, '--pref-width-px', cssFloat, 0);
        this.prefHeight_LPX = StyleProp.create(this.style, '--pref-height-px', cssFloat, 0);
        this.prepFns = new LinkedSet();
    }
    computePrefSize_PX() {
        const dpr = currentDpr(this);
        const width_PX = this.prefWidth_LPX.get() * dpr;
        const height_PX = this.prefHeight_LPX.get() * dpr;
        return new Size2D(width_PX, height_PX);
    }
    computeChildViewports_PX() {
        return new Map();
    }
}

var fragShader_GLSL$9 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$9 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

const PROG_SOURCE$9 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$9,
    fragShader_GLSL: fragShader_GLSL$9,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});
class CoordsInputs$5 extends ValueBase2 {
    constructor(viewport_PX, width_PX) {
        super();
        this.viewport_PX = viewport_PX;
        this.width_PX = width_PX;
    }
}
class BorderPainter {
    constructor() {
        this.peer = createDomPeer('border-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(0,0,0)');
        this.width_LPX = StyleProp.create(this.style, '--width-px', cssFloat, 0);
        this.visible = new RefBasic(true, tripleEquals);
        this.hCoords = new Float32Array(0);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
    paint(context, viewport_PX) {
        const color = this.color.get();
        const width_LPX = this.width_LPX.get();
        const dpr = currentDpr(this);
        const width_PX = Math.round(width_LPX * dpr);
        if (width_PX > 0 && color.a > 0) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
            }
            
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            const numVertices = 24;
            const coordsInputs = new CoordsInputs$5(viewport_PX, width_PX);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                const numCoords = 2 * numVertices;
                this.hCoords = ensureHostBufferCapacity(this.hCoords, numCoords);
                const w_NDC = 2 * width_PX / viewport_PX.x.span;
                const h_NDC = 2 * width_PX / viewport_PX.y.span;
                let i = 0;
                i = putAlignedBox(this.hCoords, i, -1 + w_NDC, +1, +1 - h_NDC, +1);
                i = putAlignedBox(this.hCoords, i, +1 - w_NDC, +1, -1, +1 - h_NDC);
                i = putAlignedBox(this.hCoords, i, -1, +1 - w_NDC, -1, -1 + h_NDC);
                i = putAlignedBox(this.hCoords, i, -1, -1 + w_NDC, -1 + h_NDC, +1);
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords);
                this.dCoordsInputs = coordsInputs;
            }
            
            {
                if (color.a < 1) {
                    enablePremultipliedAlphaBlending(gl);
                }
                else {
                    disableBlending(gl);
                }
                const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$9);
                gl.useProgram(program);
                gl.enableVertexAttribArray(attribs.inCoords);
                try {
                    
                    gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                    glUniformRgba(gl, uniforms.RGBA, color);
                    gl.drawArrays(GL.TRIANGLES, 0, numVertices);
                }
                finally {
                    gl.disableVertexAttribArray(attribs.inCoords);
                    gl.useProgram(null);
                }
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

var fragShader_GLSL$8 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$8 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

const PROG_SOURCE$8 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$8,
    fragShader_GLSL: fragShader_GLSL$8,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});
class FillPainter {
    constructor() {
        this.peer = createDomPeer('fill-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgba( 255,255,255, 0 )');
        this.visible = new RefBasic(true, tripleEquals);
        this.hCoords = new Float32Array(12);
        putAlignedBox(this.hCoords, 0, -1, +1, -1, +1);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }
    paint(context, viewport_PX) {
        const color = this.color.get();
        if (color.a > 0) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsValid = false;
            }
            
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            if (!this.dCoordsValid) {
                
                gl.bufferData(GL.ARRAY_BUFFER, this.hCoords, GL.STATIC_DRAW);
                this.dCoordsValid = true;
            }
            if (color.a < 1) {
                enablePremultipliedAlphaBlending(gl);
            }
            else {
                disableBlending(gl);
            }
            const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$8);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inCoords);
            try {
                
                gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                glUniformRgba(gl, uniforms.RGBA, color);
                gl.drawArrays(GL.TRIANGLES, 0, 6);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inCoords);
                gl.useProgram(null);
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }
}

var _a$1;
const { max: max$1, min } = Math;
class PaneMouseEvent {
    constructor(dpr, loc_PX, modifiers, button = null, pressCount = 0, wheelSteps = 0) {
        this.dpr = dpr;
        this.loc_PX = loc_PX;
        this.modifiers = modifiers;
        this.button = button;
        this.pressCount = pressCount;
        this.wheelSteps = wheelSteps;
    }
}
class PaneKeyEvent {
    constructor(dpr, key, keysDown) {
        this.dpr = dpr;
        this.key = key;
        this.keysDown = keysDown;
    }
}
function maskedInputHandler(inputHandler, mask) {
    return {
        getHoverHandler(evMove) {
            if (inputHandler.getHoverHandler && mask(evMove)) {
                return inputHandler.getHoverHandler(evMove);
            }
            return null;
        },
        getDragHandler(evGrab) {
            if (inputHandler.getDragHandler && mask(evGrab)) {
                return inputHandler.getDragHandler(evGrab);
            }
            return null;
        },
        getWheelHandler(evWheel) {
            if (inputHandler.getWheelHandler && mask(evWheel)) {
                return inputHandler.getWheelHandler(evWheel);
            }
            return null;
        },
        getKeyHandler(evGrab) {
            if (inputHandler.getKeyHandler && mask(evGrab)) {
                return inputHandler.getKeyHandler(evGrab);
            }
            return null;
        },
    };
}
const NOOP_TARGET = Object.freeze(['NOOP']);
const NOOP_HOVER_HANDLER = Object.freeze({ target: NOOP_TARGET });
const NOOP_DRAG_HANDLER = Object.freeze({ target: NOOP_TARGET });
const NOOP_KEY_HANDLER = Object.freeze({ target: NOOP_TARGET });
const NOOP_WHEEL_HANDLER = Object.freeze({ target: NOOP_TARGET });
const PANE_SYMBOL = Symbol('@@__GLEAM_PANE__@@');
function isPane(obj) {
    return !!(obj && typeof obj === 'object' && obj[PANE_SYMBOL]);
}
class Pane {
    constructor(layout = new ChildlessLayout()) {
        this[_a$1] = true;
        this.peer = createDomPeer('gleam-pane', this, PeerType.PANE);
        
        this.siteInParentPeer = createDomPeer('site-in-parent', this, PeerType.SITE);
        this.siteInParentStyle = window.getComputedStyle(this.siteInParentPeer);
        this.siteInParentOverrides = {};
        this.disposersByCssClass = new DisposerGroupMap();
        this.disposersByPainter = new DisposerGroupMap();
        this.disposersByInputHandler = new DisposerGroupMap();
        this.disposersByInputSpectator = new DisposerGroupMap();
        this.disposersByChild = new DisposerGroupMap();
        
        appendChild(this.peer, this.siteInParentPeer);
        appendChild(this.peer, layout.peer);
        this.layout = layout;
        this.consumesInputEvents = false;
        this.parent = null;
        this.children = new LinkedSet();
        this.pendingContextActions = new Array();
        this.paintFns = new ArrayWithZIndices();
        this.paintFnsByPainter = new Map();
        this.paintFnsByPane = new Map();
        this.inputHandlers = new ArrayWithZIndices();
        this.visible = true;
        this.prefSize_PX = Size2D.ZERO;
        this.viewport_PX = Interval2D.ZERO;
        this.scissor_PX = this.viewport_PX;
        this.prefSizeReady = new NotifierBasic(undefined);
        this.layoutReady = new NotifierTree(undefined);
        this.inputSpectators = new InputSpectatorTree();
        this.canvas = undefined;
        this.canvasChanged = new NotifierTree(undefined);
        this.background = new FillPainter();
        this.background.peer.classList.add('background');
        this.addPainter(this.background, -1e6);
        this.border = new BorderPainter();
        this.addPainter(this.border, +1e6);
        const debugPickFill = new FillPainter();
        debugPickFill.peer.classList.add('inspect-highlight');
        this.addPainter(debugPickFill, Number.POSITIVE_INFINITY);
        const debugPickBorder = new BorderPainter();
        debugPickBorder.peer.classList.add('inspect-highlight');
        this.addPainter(debugPickBorder, Number.POSITIVE_INFINITY);
    }
    addCssClass(className) {
        const disposers = this.disposersByCssClass.get(className);
        if (!this.peer.classList.contains(className)) {
            this.peer.classList.add(className);
            disposers.add(() => {
                this.peer.classList.remove(className);
            });
        }
        return disposers;
    }
    removeCssClass(className) {
        this.disposersByCssClass.disposeFor(className);
    }
    getParent() {
        return this.parent;
    }
    addPainter(painter, zIndex = 0) {
        const disposers = this.disposersByPainter.get(painter);
        disposers.add(appendChild(this.peer, painter.peer));
        const paintFn = (context) => {
            if (painter.visible.v) {
                const gl = context.gl;
                gl.enable(GL.SCISSOR_TEST);
                glScissor(gl, this.scissor_PX);
                glViewport(gl, this.viewport_PX);
                painter.paint(context, this.viewport_PX);
            }
        };
        disposers.add(mapAdd(this.paintFnsByPainter, painter, paintFn));
        disposers.add(this.paintFns.add(paintFn, zIndex));
        return disposers;
    }
    getPainters() {
        return this.paintFnsByPainter.keys();
    }
    removePainter(painter) {
        this.disposersByPainter.disposeFor(painter);
    }
    removeAllPainters() {
        this.disposersByPainter.dispose();
    }
    hasPainter(painter) {
        return this.paintFnsByPainter.has(painter);
    }
    getPainterZIndex(painter) {
        const paintFn = mapRequire(this.paintFnsByPainter, painter);
        return this.paintFns.getZIndex(paintFn);
    }
    setPainterZIndex(painter, zIndex) {
        this.appendPainterToZIndex(painter, zIndex);
    }
    prependPainterToZIndex(painter, zIndex) {
        const paintFn = mapRequire(this.paintFnsByPainter, painter);
        this.paintFns.prependToZIndex(paintFn, zIndex);
    }
    appendPainterToZIndex(painter, zIndex) {
        const paintFn = mapRequire(this.paintFnsByPainter, painter);
        this.paintFns.appendToZIndex(paintFn, zIndex);
    }
    addInputHandler(inputHandler, zIndex = 0) {
        return this.inputHandlers.add(inputHandler, zIndex);
    }
    removeInputHandler(inputHandler) {
        this.disposersByInputHandler.disposeFor(inputHandler);
    }
    removeAllInputHandlers() {
        this.disposersByInputHandler.dispose();
    }
    hasInputHandler(inputHandler) {
        return this.inputHandlers.has(inputHandler);
    }
    getInputHandlerZIndex(inputHandler) {
        return this.inputHandlers.getZIndex(inputHandler);
    }
    setInputHandlerZIndex(inputHandler, zIndex) {
        this.appendInputHandlerToZIndex(inputHandler, zIndex);
    }
    prependInputHandlerToZIndex(inputHandler, zIndex) {
        this.inputHandlers.prependToZIndex(inputHandler, zIndex);
    }
    appendInputHandlerToZIndex(inputHandler, zIndex) {
        this.inputHandlers.appendToZIndex(inputHandler, zIndex);
    }
    addPane(child, zIndex = 0) {
        const disposers = this.disposersByChild.get(child);
        child.parent = this;
        disposers.add(() => {
            child.parent = null;
        });
        this.children.addLast(child);
        disposers.add(() => {
            this.children.delete(child);
        });
        
        
        this.getRootPane().pendingContextActions.push(...child.pendingContextActions);
        child.pendingContextActions.length = 0;
        disposers.add(appendChild(this.peer, child.peer));
        const paintFn = (context) => {
            child.paint(context);
        };
        disposers.add(mapAdd(this.paintFnsByPane, child, paintFn));
        disposers.add(this.paintFns.add(paintFn, zIndex));
        disposers.add(this.inputHandlers.add(child, zIndex));
        child.layoutReady.setParent(this.layoutReady);
        disposers.add(() => {
            child.layoutReady.setParent(null);
        });
        child.inputSpectators.setParent(this.inputSpectators);
        disposers.add(() => {
            child.inputSpectators.setParent(null);
        });
        child.canvasChanged.setParent(this.canvasChanged);
        disposers.add(() => {
            child.canvasChanged.setParent(null);
        });
        return disposers;
    }
    removePane(child) {
        this.disposersByChild.disposeFor(child);
    }
    removeAllPanes() {
        this.disposersByChild.dispose();
    }
    hasPane(pane) {
        return this.paintFnsByPane.has(pane);
    }
    getPaneZIndex(pane) {
        const paintFn = mapRequire(this.paintFnsByPane, pane);
        return this.paintFns.getZIndex(paintFn);
    }
    setPaneZIndex(pane, zIndex) {
        this.appendPaneToZIndex(pane, zIndex);
    }
    prependPaneToZIndex(pane, zIndex) {
        const paintFn = mapRequire(this.paintFnsByPane, pane);
        this.paintFns.prependToZIndex(paintFn, zIndex);
        this.inputHandlers.prependToZIndex(pane, zIndex);
    }
    appendPaneToZIndex(pane, zIndex) {
        const paintFn = mapRequire(this.paintFnsByPane, pane);
        this.paintFns.appendToZIndex(paintFn, zIndex);
        this.inputHandlers.appendToZIndex(pane, zIndex);
    }
    
    isVisible() {
        return this.visible;
    }
    setVisible(visible) {
        this.visible = visible;
    }
    getPrefSize_PX() {
        return this.prefSize_PX;
    }
    getViewport_PX() {
        return this.viewport_PX;
    }
    getScissor_PX() {
        return this.scissor_PX;
    }
    
    _doLayout(bounds) {
        bounds = bounds !== null && bounds !== void 0 ? bounds : this.getViewport_PX();
        this.prepForLayout();
        this.updatePrefSizes();
        this.updateBounds(bounds, bounds);
    }
    
    render(context) {
        
        while (true) {
            const contextAction = this.pendingContextActions.shift();
            if (contextAction === undefined) {
                break;
            }
            contextAction(context);
        }
        
        this.prepForLayout();
        
        this.updatePrefSizes();
        this.prefSizeReady.fire();
        
        const bounds = drawingBufferBounds(context.gl);
        if (bounds !== null) {
            this.updateBounds(bounds, bounds);
            this.layoutReady.fire(undefined);
            this.paint(context);
        }
    }
    
    doLaterWithContext(contextAction) {
        
        
        this.getRootPane().pendingContextActions.push(contextAction);
    }
    enableColorTables(colorTables) {
        this.doLaterWithContext(context => {
            for (const [key, value] of colorTables) {
                context.putColorTable(key, value);
            }
        });
    }
    getRootPane() {
        let pane = this;
        while (true) {
            if (pane.parent === null) {
                return pane;
            }
            pane = pane.parent;
        }
    }
    
    getCanvas() {
        return this.getRootPane().canvas;
    }
    
    _setCanvas(canvas) {
        if (this.canvas) {
            throw new Error('Canvas is already set');
        }
        else {
            this.canvas = canvas;
            this.canvasChanged.fire(undefined);
            return () => {
                if (this.canvas === canvas) {
                    this.canvas = undefined;
                    this.canvasChanged.fire(undefined);
                }
            };
        }
    }
    prepForLayout() {
        
        for (const child of this.children) {
            child.prepForLayout();
        }
        
        if (this.visible && this.layout.prepFns !== undefined) {
            for (const prepFn of this.layout.prepFns) {
                prepFn(this.children);
            }
        }
    }
    updatePrefSizes() {
        
        for (const child of this.children) {
            child.updatePrefSizes();
        }
        
        if (this.visible && this.layout.computePrefSize_PX !== undefined) {
            this.prefSize_PX = this.layout.computePrefSize_PX(this.children);
        }
        else {
            this.prefSize_PX = Size2D.ZERO;
        }
    }
    updateBounds(viewport_PX, scissor_PX) {
        var _b, _c;
        
        this.viewport_PX = viewport_PX;
        this.scissor_PX = scissor_PX;
        
        const childViewports_PX = this.layout.computeChildViewports_PX(this.viewport_PX, this.children);
        for (const child of this.children) {
            const childViewport_PX = ((_b = childViewports_PX.get(child)) !== null && _b !== void 0 ? _b : Interval2D.ZERO).round();
            const childScissor_PX = ((_c = childViewport_PX.intersection(this.scissor_PX)) !== null && _c !== void 0 ? _c : Interval2D.ZERO);
            child.updateBounds(childViewport_PX, childScissor_PX);
        }
    }
    paint(context) {
        if (this.visible && this.scissor_PX.w > 0 && this.scissor_PX.h > 0) {
            for (const paintFn of this.paintFns) {
                paintFn(context);
            }
        }
    }
    getHoverHandler(evMove) {
        var _b;
        if (this.visible && this.scissor_PX.containsPoint(evMove.loc_PX)) {
            for (const inputHandler of this.inputHandlers.inReverse) {
                const result = (_b = inputHandler.getHoverHandler) === null || _b === void 0 ? void 0 : _b.call(inputHandler, evMove);
                if (isNonNullish(result)) {
                    return result;
                }
            }
            if (this.consumesInputEvents) {
                return NOOP_HOVER_HANDLER;
            }
        }
        return null;
    }
    getDragHandler(evGrab) {
        var _b;
        if (this.visible && this.scissor_PX.containsPoint(evGrab.loc_PX)) {
            for (const inputHandler of this.inputHandlers.inReverse) {
                const result = (_b = inputHandler.getDragHandler) === null || _b === void 0 ? void 0 : _b.call(inputHandler, evGrab);
                if (isNonNullish(result)) {
                    return result;
                }
            }
            if (this.consumesInputEvents) {
                return NOOP_DRAG_HANDLER;
            }
        }
        return null;
    }
    getWheelHandler(evGrabOrWheel) {
        var _b;
        if (this.visible && this.scissor_PX.containsPoint(evGrabOrWheel.loc_PX)) {
            for (const inputHandler of this.inputHandlers.inReverse) {
                const result = (_b = inputHandler.getWheelHandler) === null || _b === void 0 ? void 0 : _b.call(inputHandler, evGrabOrWheel);
                if (isNonNullish(result)) {
                    return result;
                }
            }
            if (this.consumesInputEvents) {
                return NOOP_WHEEL_HANDLER;
            }
        }
        return null;
    }
    getKeyHandler(evGrab) {
        var _b;
        if (this.visible && this.scissor_PX.containsPoint(evGrab.loc_PX)) {
            for (const inputHandler of this.inputHandlers.inReverse) {
                const result = (_b = inputHandler.getKeyHandler) === null || _b === void 0 ? void 0 : _b.call(inputHandler, evGrab);
                if (isNonNullish(result)) {
                    return result;
                }
            }
            if (this.consumesInputEvents) {
                return NOOP_KEY_HANDLER;
            }
        }
        return null;
    }
    getPaneToInspect(evMove) {
        var _b;
        if (this.visible && this.scissor_PX.containsPoint(evMove.loc_PX)) {
            for (const inputHandler of this.inputHandlers.inReverse) {
                if (isPane(inputHandler)) {
                    const pane = inputHandler.getPaneToInspect(evMove);
                    if (isNonNullish(pane)) {
                        return pane;
                    }
                }
                else {
                    const hoverHandler = (_b = inputHandler.getHoverHandler) === null || _b === void 0 ? void 0 : _b.call(inputHandler, evMove);
                    if (isNonNullish(hoverHandler)) {
                        return this;
                    }
                }
            }
            return this;
        }
        return null;
    }
}
_a$1 = PANE_SYMBOL;

function onFirstFewLayouts(pane, numTimes, listener) {
    const disposers = new DisposerGroup();
    let timesRemaining = numTimes;
    if (timesRemaining > 0) {
        
        disposers.add(pane.layoutReady.addListener({ order: +1e6 }, () => {
            listener();
            timesRemaining--;
            if (timesRemaining <= 0) {
                disposers.dispose();
            }
        }));
        
        disposers.add(pane.inputSpectators.add({
            handleGrab: () => disposers.dispose(),
            handleWheel: () => disposers.dispose(),
            handleKeyPress: () => disposers.dispose(),
        }));
    }
    return disposers;
}
class ContextImpl {
    constructor(wndInit, canvasInit, glInit) {
        this.frameNum = 0;
        this.wnd = wndInit;
        this.canvas = canvasInit;
        this.gl = glInit;
        this.glIncarnation = { n: 0 };
        this.nextObjectNum = 0;
        this.objectKeys = new WeakMap();
        this.colorTables = new Map([CET_L01, MAGMA]);
        this.colorTableFallback = CET_L01[1];
        this.programCache = new Map();
        this.textureCache = new Map();
        this.bufferCache = new Map();
        this.programCacheLastPruneFrameNum = this.frameNum;
        this.textureCacheLastPruneFrameNum = this.frameNum;
        this.bufferCacheLastPruneFrameNum = this.frameNum;
    }
    startNewIncarnation(wnd, canvas, gl) {
        this.wnd = wnd;
        this.canvas = canvas;
        this.gl = gl;
        this.glIncarnation = { n: this.glIncarnation.n + 1 };
        this.programCache.clear();
        this.textureCache.clear();
        this.bufferCache.clear();
        this.programCacheLastPruneFrameNum = this.frameNum;
        this.textureCacheLastPruneFrameNum = this.frameNum;
        this.bufferCacheLastPruneFrameNum = this.frameNum;
    }
    getObjectKey(obj) {
        return mapSetIfAbsent(this.objectKeys, obj, () => `#${this.nextObjectNum++}#`);
    }
    getProgram(source) {
        this.pruneProgramCache();
        const en = mapSetIfAbsent(this.programCache, source, () => {
            return {
                prog: new ShaderProgram(source),
                lastAccessFrameNum: -1,
            };
        });
        en.lastAccessFrameNum = this.frameNum;
        en.prog.prepare(this.gl, this.glIncarnation);
        return en.prog;
    }
    pruneProgramCache() {
        if (this.frameNum > this.programCacheLastPruneFrameNum) {
            
            const entriesToDispose = new Array();
            for (const [source, { prog, lastAccessFrameNum }] of this.programCache) {
                if (lastAccessFrameNum < this.frameNum - 1) {
                    entriesToDispose.push([source, prog]);
                }
            }
            
            
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max$1(min(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
            for (const [source, prog] of entriesToDispose.slice(0, numToDispose)) {
                prog.dispose(this.gl, this.glIncarnation);
                this.programCache.delete(source);
            }
            
            this.programCacheLastPruneFrameNum = this.frameNum;
        }
    }
    getTexture(key, inputs, init) {
        this.pruneTextureCache();
        let en = this.textureCache.get(key);
        if (!en || !arrayAllEqual(inputs, en.inputs, equal)) {
            const texture = this.gl.createTexture();
            this.gl.bindTexture(GL.TEXTURE_2D, texture);
            const meta = init(this.gl, GL.TEXTURE_2D);
            en = { inputs, info: { meta, texture }, lastAccessFrameNum: -1 };
            this.textureCache.set(key, en);
        }
        en.lastAccessFrameNum = this.frameNum;
        
        return en.info;
    }
    pruneTextureCache() {
        if (this.frameNum > this.textureCacheLastPruneFrameNum) {
            
            const entriesToDispose = new Array();
            for (const [key, { info, lastAccessFrameNum }] of this.textureCache) {
                if (lastAccessFrameNum < this.frameNum - 1) {
                    entriesToDispose.push([key, info.texture]);
                }
            }
            
            
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max$1(min(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
            for (const [key, texture] of entriesToDispose.slice(0, numToDispose)) {
                this.gl.deleteTexture(texture);
                this.textureCache.delete(key);
            }
            
            this.textureCacheLastPruneFrameNum = this.frameNum;
        }
    }
    getBuffer(key, inputs, init) {
        this.pruneBufferCache();
        let en = this.bufferCache.get(key);
        if (!en || !arrayAllEqual(inputs, en.inputs, equal)) {
            const buffer = this.gl.createBuffer();
            this.gl.bindBuffer(GL.ARRAY_BUFFER, buffer);
            const meta = init(this.gl, GL.ARRAY_BUFFER);
            en = { inputs, info: { meta, buffer }, lastAccessFrameNum: -1 };
            this.bufferCache.set(key, en);
        }
        en.lastAccessFrameNum = this.frameNum;
        
        return en.info;
    }
    pruneBufferCache() {
        if (this.frameNum > this.bufferCacheLastPruneFrameNum) {
            
            const entriesToDispose = new Array();
            for (const [key, { info, lastAccessFrameNum }] of this.bufferCache) {
                if (lastAccessFrameNum < this.frameNum - 1) {
                    entriesToDispose.push([key, info.buffer]);
                }
            }
            
            
            const disposeLimit = 1;
            const deferLimit = 10;
            const numToDispose = max$1(min(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
            for (const [key, buffer] of entriesToDispose.slice(0, numToDispose)) {
                this.gl.deleteBuffer(buffer);
                this.bufferCache.delete(key);
            }
            
            this.bufferCacheLastPruneFrameNum = this.frameNum;
        }
    }
    getColorTable(s) {
        const exact = this.colorTables.get(s.trim().toLowerCase());
        if (exact) {
            return exact;
        }
        const m = s.match(/^([^\(]*)\(([^\)]*)\)$/);
        if (m && m.length >= 2) {
            const transform = run(() => {
                switch (m[1].trim().toLowerCase()) {
                    case 'invert': return COLOR_TABLE_INVERTER;
                    case 'reverse': return COLOR_TABLE_INVERTER;
                    default: return undefined;
                }
            });
            const orig = this.getColorTable(m[2].trim().toLowerCase());
            if (transform && orig) {
                return orig.withMutator(transform);
            }
        }
        return this.colorTableFallback;
    }
    putColorTable(key, value) {
        this.colorTables.set(key.trim().toLowerCase(), value);
    }
}
const HOST_CLASS = 'gleam';
const HOSTS_KEY = '@@__GLEAM_HOSTS__@@';
if (!isDefined(window[HOSTS_KEY])) {
    window[HOSTS_KEY] = new Set();
}
const hosts = window[HOSTS_KEY];
const DEFAULT_CANVAS_PROVIDER = {
    claimNext: () => document.createElement('canvas'),
    release: NOOP,
};

function attachPane(host, pane, repaint, options) {
    var _b, _c;
    const disposers = new DisposerGroup();
    if (hosts.has(host)) {
        throw new Error('Element already has a Gleam pane attached to it');
    }
    hosts.add(host);
    disposers.add(() => {
        hosts.delete(host);
    });
    setCssClassPresent(host, HOST_CLASS, true);
    disposers.add(() => {
        setCssClassPresent(host, HOST_CLASS, false);
    });
    const wnd0 = requireNonNullish((_b = host.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView);
    if (!wnd0.WebGLRenderingContext) {
        host.classList.add('error');
        host.textContent = 'Browser does not support WebGL';
        disposers.dispose();
        throw new Error('Browser does not support WebGL');
    }
    const glContextAttrs = Object.assign({ alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false, desynchronized: false }, ((_c = options === null || options === void 0 ? void 0 : options.glContextAttrs) !== null && _c !== void 0 ? _c : {}));
    function createCanvas() {
        var _b;
        const numAttempts = 3;
        for (let i = 0; i < numAttempts; i++) {
            const canvas = ((_b = options === null || options === void 0 ? void 0 : options.canvasProvider) !== null && _b !== void 0 ? _b : DEFAULT_CANVAS_PROVIDER).claimNext();
            
            canvas.style.border = '0';
            canvas.style.margin = '0';
            canvas.style.padding = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            const gl = canvas.getContext('webgl', glContextAttrs);
            if (gl) {
                if (i > 0) {
                    console.info('WebGL context creation succeeded on attempt ' + i);
                }
                return [canvas, gl];
            }
        }
        console.warn('WebGL context creation did not succeed in ' + numAttempts + ' attempts');
        host.classList.add('error');
        host.textContent = 'Browser failed to initialize WebGL';
        disposers.dispose();
        throw new Error('Browser failed to initialize WebGL');
    }
    
    
    
    const CONTEXT_EVER_LOST = '@@__GLEAM_CONTEXT_EVER_LOST__@@';
    function setContextEverLost(canvas) {
        canvas[CONTEXT_EVER_LOST] = true;
    }
    function wasContextEverLost(canvas) {
        return !!(canvas[CONTEXT_EVER_LOST]);
    }
    const disposersForCanvases = new DisposerGroupMap();
    disposers.add(disposersForCanvases);
    const context = new ContextImpl(wnd0, ...createCanvas());
    let pendingFrameRequestId = undefined;
    function attachCanvas(wnd, canvas) {
        const disposers = new DisposerGroup();
        disposers.add(appendChild(host, canvas));
        disposers.add(pane._setCanvas(canvas));
        disposers.add(attachPaneInputListeners(wnd, canvas, pane, repaint));
        disposers.add(attachEventListener(canvas, 'webglcontextlost', true, ev => {
            ev.preventDefault();
            setContextEverLost(canvas);
            repaint.fire();
        }));
        let printApproxSizeWarning = true;
        disposers.add(attachCanvasResizeListener(wnd, host, canvas, (width_PX, height_PX, isApprox) => {
            if (isApprox === undefined) ;
            else if (isApprox === false) {
                printApproxSizeWarning = true;
            }
            else if (isApprox === true && printApproxSizeWarning) {
                console.warn('Exact canvas size is not available in this browser -- canvas may look blurry');
                printApproxSizeWarning = false;
            }
            canvas.width = width_PX;
            canvas.height = height_PX;
            
            
            
            
            if (canvas === context.canvas && wnd === canvas.ownerDocument.defaultView) {
                doRender(wnd);
            }
            else {
                repaint.fire();
            }
        }));
        return disposers;
    }
    function doRender(wnd) {
        var _b;
        
        if (context.gl.isContextLost() || wnd !== context.wnd) {
            setContextEverLost(context.canvas);
        }
        
        if (wasContextEverLost(context.canvas)) {
            
            console.debug('Recovering from lost WebGL context');
            const [canvas, gl] = createCanvas();
            console.debug('Recovered from lost WebGL context');
            
            disposersForCanvases.disposeFor(context.canvas);
            ((_b = options === null || options === void 0 ? void 0 : options.canvasProvider) !== null && _b !== void 0 ? _b : DEFAULT_CANVAS_PROVIDER).release(context.canvas);
            disposersForCanvases.get(canvas).add(attachCanvas(wnd, canvas));
            
            context.startNewIncarnation(wnd, canvas, gl);
        }
        
        
        
        
        
        const gl = context.gl;
        context.gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(GL.COLOR_BUFFER_BIT);
        
        pendingFrameRequestId = undefined;
        pane.render(context);
        context.frameNum++;
    }
    disposersForCanvases.get(context.canvas).add(attachCanvas(wnd0, context.canvas));
    disposers.add(repaint.addListener(() => {
        const wnd = context.canvas.ownerDocument.defaultView;
        if (pendingFrameRequestId === undefined || wnd !== context.wnd) {
            pendingFrameRequestId = wnd === null || wnd === void 0 ? void 0 : wnd.requestAnimationFrame(() => {
                doRender(wnd);
            });
        }
    }));
    disposers.add(appendChild(host, pane.peer));
    disposers.add(attachSubtreeRestyleListener(pane.peer, () => {
        repaint.fire();
    }));
    repaint.fire();
    return disposers;
}
function wheelSteps(ev) {
    
    return Math.sign(ev.deltaY);
}
function buttonsMask(...buttonNumbers) {
    let union = 0;
    for (const button of buttonNumbers) {
        switch (button) {
            case 0:
                union |= 1;
                break;
            case 1:
                union |= 4;
                break;
            case 2:
                union |= 2;
                break;
            case 3:
                union |= 8;
                break;
            case 4:
                union |= 16;
                break;
        }
    }
    return union;
}
function isButtonDown(buttonsDown, buttonNumber) {
    return ((buttonsDown & buttonsMask(buttonNumber)) !== 0);
}

function _attachClassesRefListener(classes, element) {
    let oldClasses = newImmutableSet([]);
    return classes.addListener(IMMEDIATE, () => {
        const newClasses = classes.v;
        for (const clazz of oldClasses) {
            if (!newClasses.has(clazz)) {
                element.classList.remove(clazz);
            }
        }
        for (const clazz of newClasses) {
            if (!oldClasses.has(clazz)) {
                element.classList.add(clazz);
            }
        }
        oldClasses = newClasses;
    });
}
function attachPaneInputListeners(wnd, canvas, contentPane, repaint) {
    const disposers = new DisposerGroup();
    
    
    
    
    
    const MULTIPRESS_WINDOW_MILLIS = 300;
    
    
    
    const DRAGGED_CLASSES = newImmutableSet(['dragged']);
    
    const EMPTY_CLASSES = newImmutableSet([]);
    
    
    let activeHover = null;
    let activeDrag = null;
    let activeFocus = null;
    const cursorClasses = new RefBasic(EMPTY_CLASSES, equal);
    disposers.add(_attachClassesRefListener(cursorClasses, canvas));
    const dragClasses = new RefBasic(EMPTY_CLASSES, equal);
    disposers.add(_attachClassesRefListener(dragClasses, canvas));
    function createPaneMouseEvent(...args) {
        return new PaneMouseEvent(currentDpr(contentPane), ...args);
    }
    function createPaneKeyEvent(...args) {
        return new PaneKeyEvent(currentDpr(contentPane), ...args);
    }
    function doMove(mouse_PX, modifiers) {
        var _b, _c, _d, _e, _f, _g, _h;
        if (activeDrag !== null) {
            throw new Error();
        }
        else {
            if (isInspectPickingActive(contentPane)) {
                const evMove = createPaneMouseEvent(mouse_PX, modifiers);
                const newPane = contentPane.getPaneToInspect(evMove);
                if (setInspectHoveredPane(newPane)) {
                    repaint.fire();
                }
            }
            else {
                if (setInspectHoveredPane(null)) {
                    repaint.fire();
                }
            }
            const evMove = createPaneMouseEvent(mouse_PX, modifiers);
            const hoverHandler = contentPane.getHoverHandler(evMove);
            const oldHoverHandler = (_b = activeHover === null || activeHover === void 0 ? void 0 : activeHover.hoverHandler) !== null && _b !== void 0 ? _b : null;
            if (!equal(hoverHandler === null || hoverHandler === void 0 ? void 0 : hoverHandler.target, oldHoverHandler === null || oldHoverHandler === void 0 ? void 0 : oldHoverHandler.target)) {
                const ev = createPaneMouseEvent(mouse_PX, modifiers);
                if (oldHoverHandler !== null) {
                    contentPane.inputSpectators.fireUnhover(oldHoverHandler.target, ev);
                    (_c = oldHoverHandler.handleUnhover) === null || _c === void 0 ? void 0 : _c.call(oldHoverHandler);
                }
                if (hoverHandler !== null) {
                    (_d = hoverHandler.handleHover) === null || _d === void 0 ? void 0 : _d.call(hoverHandler);
                    contentPane.inputSpectators.fireHover(hoverHandler.target, ev);
                }
            }
            cursorClasses.set(false, newImmutableSet((_f = (_e = hoverHandler === null || hoverHandler === void 0 ? void 0 : hoverHandler.getMouseCursorClasses) === null || _e === void 0 ? void 0 : _e.call(hoverHandler)) !== null && _f !== void 0 ? _f : []));
            activeHover = (hoverHandler === null ? null : {
                hoverHandler,
                loc_PX: mouse_PX,
            });
            (_h = activeHover === null || activeHover === void 0 ? void 0 : (_g = activeHover.hoverHandler).handleMove) === null || _h === void 0 ? void 0 : _h.call(_g, evMove);
            contentPane.inputSpectators.fireMove(activeHover === null || activeHover === void 0 ? void 0 : activeHover.hoverHandler.target, evMove);
        }
    }
    function doUnhover() {
        var _b, _c;
        if (activeDrag !== null) {
            throw new Error();
        }
        else if (activeHover !== null) {
            const ev = createPaneMouseEvent(activeHover.loc_PX, ModifierSet.EMPTY);
            contentPane.inputSpectators.fireUnhover(activeHover.hoverHandler.target, ev);
            (_c = (_b = activeHover.hoverHandler).handleUnhover) === null || _c === void 0 ? void 0 : _c.call(_b);
            cursorClasses.set(false, newImmutableSet([]));
            activeHover = null;
        }
    }
    function doGrab(mouse_PX, modifiers, button, pressCount) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (activeDrag !== null) {
            throw new Error();
        }
        else if (isInspectPickingActive(contentPane)) {
            const evGrab = createPaneMouseEvent(mouse_PX, modifiers);
            const newPane = contentPane.getPaneToInspect(evGrab);
            if (setInspectSelectedPane(newPane)) {
                repaint.fire();
            }
        }
        else {
            if (setInspectSelectedPane(null)) {
                repaint.fire();
            }
            const evGrab = createPaneMouseEvent(mouse_PX, modifiers, button, pressCount);
            
            
            let dragHandler;
            const newDragHandler = contentPane.getDragHandler(evGrab);
            const oldHoverHandler = (_b = activeHover === null || activeHover === void 0 ? void 0 : activeHover.hoverHandler) !== null && _b !== void 0 ? _b : null;
            if (!equal(newDragHandler === null || newDragHandler === void 0 ? void 0 : newDragHandler.target, oldHoverHandler === null || oldHoverHandler === void 0 ? void 0 : oldHoverHandler.target)) {
                const ev = createPaneMouseEvent(mouse_PX, modifiers);
                if (oldHoverHandler !== null) {
                    contentPane.inputSpectators.fireUnhover(oldHoverHandler.target, ev);
                    (_c = oldHoverHandler.handleUnhover) === null || _c === void 0 ? void 0 : _c.call(oldHoverHandler);
                }
                if (newDragHandler !== null) {
                    (_d = newDragHandler.handleHover) === null || _d === void 0 ? void 0 : _d.call(newDragHandler);
                    contentPane.inputSpectators.fireHover(newDragHandler.target, ev);
                }
                dragHandler = newDragHandler;
            }
            else if (oldHoverHandler && newDragHandler) {
                
                
                dragHandler = Object.assign({}, newDragHandler);
                dragHandler.handleMove = evMove => {
                    var _b, _c;
                    (_b = newDragHandler.handleMove) === null || _b === void 0 ? void 0 : _b.call(newDragHandler, evMove);
                    (_c = oldHoverHandler.handleMove) === null || _c === void 0 ? void 0 : _c.call(oldHoverHandler, evMove);
                };
                dragHandler.handleUnhover = () => {
                    var _b, _c;
                    (_b = newDragHandler.handleUnhover) === null || _b === void 0 ? void 0 : _b.call(newDragHandler);
                    (_c = oldHoverHandler.handleUnhover) === null || _c === void 0 ? void 0 : _c.call(oldHoverHandler);
                };
            }
            else {
                dragHandler = newDragHandler;
            }
            cursorClasses.set(false, newImmutableSet((_f = (_e = dragHandler === null || dragHandler === void 0 ? void 0 : dragHandler.getMouseCursorClasses) === null || _e === void 0 ? void 0 : _e.call(dragHandler)) !== null && _f !== void 0 ? _f : []));
            dragClasses.set(false, EMPTY_CLASSES);
            const newWheelHandler = contentPane.getWheelHandler(evGrab);
            activeDrag = (dragHandler === null ? null : {
                dragHandler,
                loc_PX: mouse_PX,
                button,
                grabModifiers: modifiers,
                currModifiers: modifiers,
                wheelHandler: newWheelHandler,
            });
            activeHover = (dragHandler === null ? null : {
                hoverHandler: dragHandler,
                loc_PX: mouse_PX,
            });
            (_h = activeDrag === null || activeDrag === void 0 ? void 0 : (_g = activeDrag.dragHandler).handleGrab) === null || _h === void 0 ? void 0 : _h.call(_g);
            contentPane.inputSpectators.fireGrab(activeDrag === null || activeDrag === void 0 ? void 0 : activeDrag.dragHandler.target, evGrab);
            
            const keyHandler = contentPane.getKeyHandler(evGrab);
            if (keyHandler !== null && !equal(keyHandler.target, activeFocus === null || activeFocus === void 0 ? void 0 : activeFocus.keyHandler.target)) {
                if (activeFocus !== null) {
                    (_k = (_j = activeFocus.keyHandler).handleUnfocus) === null || _k === void 0 ? void 0 : _k.call(_j);
                    contentPane.inputSpectators.fireUnfocus(activeFocus.keyHandler.target);
                }
                activeFocus = (keyHandler === null ? null : {
                    keyHandler,
                    keysDown: new Set(),
                });
                if (activeFocus !== null) {
                    (_m = (_l = activeFocus.keyHandler).handleFocus) === null || _m === void 0 ? void 0 : _m.call(_l);
                    contentPane.inputSpectators.fireFocus(activeFocus.keyHandler.target);
                }
            }
        }
    }
    function doDrag(mouse_PX, modifiers) {
        var _b, _c, _d, _e, _f;
        if (activeDrag === null || activeHover === null) {
            throw new Error();
        }
        else {
            const evDrag = createPaneMouseEvent(mouse_PX, modifiers, activeDrag.button);
            cursorClasses.set(false, newImmutableSet((_d = (_c = (_b = activeDrag.dragHandler).getMouseCursorClasses) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : []));
            dragClasses.set(false, DRAGGED_CLASSES);
            activeDrag.currModifiers = modifiers;
            activeDrag.loc_PX = mouse_PX;
            activeHover.loc_PX = mouse_PX;
            (_f = (_e = activeDrag.dragHandler).handleDrag) === null || _f === void 0 ? void 0 : _f.call(_e, evDrag);
            contentPane.inputSpectators.fireDrag(activeDrag.dragHandler.target, evDrag);
        }
    }
    function doUngrab(mouse_PX, modifiers) {
        var _b, _c;
        if (activeDrag === null) {
            throw new Error();
        }
        else {
            const evUngrab = createPaneMouseEvent(mouse_PX, modifiers, activeDrag.button);
            contentPane.inputSpectators.fireUngrab(activeDrag.dragHandler.target, evUngrab);
            (_c = (_b = activeDrag.dragHandler).handleUngrab) === null || _c === void 0 ? void 0 : _c.call(_b, evUngrab);
            dragClasses.set(false, EMPTY_CLASSES);
            activeDrag = null;
        }
    }
    function doWheel(mouse_PX, modifiers, wheelSteps) {
        var _b, _c, _d, _e;
        if (activeDrag !== null) {
            const evWheel = createPaneMouseEvent(mouse_PX, modifiers, null, 0, wheelSteps);
            (_c = (_b = activeDrag.wheelHandler) === null || _b === void 0 ? void 0 : _b.handleWheel) === null || _c === void 0 ? void 0 : _c.call(_b, evWheel);
            contentPane.inputSpectators.fireWheel((_d = activeDrag.wheelHandler) === null || _d === void 0 ? void 0 : _d.target, evWheel);
            doDrag(mouse_PX, modifiers);
        }
        else {
            const evWheel = createPaneMouseEvent(mouse_PX, modifiers, null, 0, wheelSteps);
            const wheelHandler = contentPane.getWheelHandler(evWheel);
            (_e = wheelHandler === null || wheelHandler === void 0 ? void 0 : wheelHandler.handleWheel) === null || _e === void 0 ? void 0 : _e.call(wheelHandler, evWheel);
            contentPane.inputSpectators.fireWheel(wheelHandler === null || wheelHandler === void 0 ? void 0 : wheelHandler.target, evWheel);
            doMove(mouse_PX, modifiers);
        }
    }
    function doKeyPress(key) {
        var _b, _c;
        if (activeFocus !== null) {
            activeFocus.keysDown.add(key);
            const evPress = createPaneKeyEvent(key, newImmutableSet(activeFocus.keysDown));
            (_c = (_b = activeFocus.keyHandler).handleKeyPress) === null || _c === void 0 ? void 0 : _c.call(_b, evPress);
            contentPane.inputSpectators.fireKeyPress(activeFocus.keyHandler.target, evPress);
        }
    }
    function doKeyRelease(key) {
        var _b, _c;
        if (activeFocus !== null) {
            activeFocus.keysDown.delete(key);
            const evRelease = createPaneKeyEvent(key, newImmutableSet(activeFocus.keysDown));
            (_c = (_b = activeFocus.keyHandler).handleKeyRelease) === null || _c === void 0 ? void 0 : _c.call(_b, evRelease);
            contentPane.inputSpectators.fireKeyRelease(activeFocus.keyHandler.target, evRelease);
        }
    }
    
    
    
    
    function doCheckedDrag(mouse_PX, modifiers, buttonsDown) {
        if (activeDrag === null) {
            throw new Error();
        }
        else if (isButtonDown(buttonsDown, activeDrag.button)) {
            if (!equal(mouse_PX, activeDrag.loc_PX) || !equal(modifiers, activeDrag.currModifiers)) {
                doDrag(mouse_PX, modifiers);
            }
        }
        else {
            doUngrab(mouse_PX, modifiers);
            doMove(mouse_PX, modifiers);
        }
    }
    
    
    let multiPressStart_PMILLIS = Number.NEGATIVE_INFINITY;
    let multiPressButton = null;
    let multiPressCount = 0;
    disposers.add(attachEventListener(canvas, 'mousedown', false, ev => {
        const pressTime_PMILLIS = Date.now();
        const mouse_PX = getMouseLoc_PX(canvas, ev);
        const modifiers = getModifiers(ev);
        if (ev.button === multiPressButton && pressTime_PMILLIS <= multiPressStart_PMILLIS + MULTIPRESS_WINDOW_MILLIS) {
            multiPressCount++;
        }
        else {
            multiPressStart_PMILLIS = pressTime_PMILLIS;
            multiPressButton = ev.button;
            multiPressCount = 1;
        }
        
        if (activeDrag !== null) {
            doUngrab(mouse_PX, modifiers);
        }
        doGrab(mouse_PX, modifiers, ev.button, multiPressCount);
        
        ev.preventDefault();
    }));
    
    disposers.add(attachEventListener(canvas, 'mousemove', false, ev => {
        if (activeDrag === null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doMove(mouse_PX, modifiers);
        }
    }));
    
    disposers.add(attachEventListener(wnd, 'mousemove', false, ev => {
        if (activeDrag !== null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doCheckedDrag(mouse_PX, modifiers, ev.buttons);
        }
    }));
    
    disposers.add(attachEventListener(canvas, 'mouseup', false, ev => {
        if (activeDrag === null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doMove(mouse_PX, modifiers);
        }
    }));
    
    
    disposers.add(attachEventListener(wnd, 'keydown', false, ev => {
        if (activeDrag !== null) {
            const modifiers = getModifiers(ev);
            doCheckedDrag(activeDrag.loc_PX, modifiers, buttonsMask(activeDrag.button));
        }
        else if (activeHover !== null) {
            const modifiers = getModifiers(ev);
            doMove(activeHover.loc_PX, modifiers);
        }
        doKeyPress(ev.key);
    }));
    
    disposers.add(attachEventListener(wnd, 'keyup', false, ev => {
        if (activeDrag !== null) {
            const modifiers = getModifiers(ev);
            doCheckedDrag(activeDrag.loc_PX, modifiers, buttonsMask(activeDrag.button));
        }
        else if (activeHover !== null) {
            const modifiers = getModifiers(ev);
            doMove(activeHover.loc_PX, modifiers);
        }
        doKeyRelease(ev.key);
    }));
    
    disposers.add(attachEventListener(wnd, 'mouseup', false, ev => {
        if (activeDrag !== null) {
            
            
            
            const inWindow = (0 <= ev.x && ev.x < wnd.innerWidth && 0 <= ev.y && ev.y < wnd.innerHeight);
            if (ev.button === activeDrag.button || !inWindow) {
                const mouse_PX = getMouseLoc_PX(canvas, ev);
                const modifiers = getModifiers(ev);
                doUngrab(mouse_PX, modifiers);
                doMove(mouse_PX, modifiers);
            }
        }
    }));
    disposers.add(attachEventListener(wnd, 'blur', false, () => {
        if (activeDrag !== null) {
            doUngrab(activeDrag.loc_PX, activeDrag.currModifiers);
        }
        if (activeHover !== null) {
            doUnhover();
        }
        if (activeFocus !== null) {
            activeFocus.keysDown.clear();
        }
        if (setInspectHoveredPane(null)) {
            repaint.fire();
        }
    }));
    disposers.add(attachEventListener(canvas, 'mouseout', false, ev => {
        if (activeDrag === null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doMove(mouse_PX, modifiers);
        }
    }));
    disposers.add(attachEventListener(canvas, 'mouseover', false, ev => {
        if (activeDrag === null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doMove(mouse_PX, modifiers);
        }
    }));
    
    attachEventListener(canvas, 'wheel', false, ev => {
        if (activeDrag === null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doMove(mouse_PX, modifiers);
            doWheel(mouse_PX, modifiers, wheelSteps(ev));
        }
    });
    
    attachEventListener(wnd, 'wheel', false, ev => {
        if (activeDrag !== null) {
            const mouse_PX = getMouseLoc_PX(canvas, ev);
            const modifiers = getModifiers(ev);
            doCheckedDrag(mouse_PX, modifiers, ev.buttons);
            doWheel(mouse_PX, modifiers, wheelSteps(ev));
        }
    });
    return disposers;
}
class InputSpectatorTree {
    constructor() {
        this.parent = null;
        this.children = new Array();
        this.ownEntries = new Array();
        this.ownEntriesDirty = false;
        this.subtreeEntries = null;
    }
    add(a, b) {
        const entry = InputSpectatorTree.createEntry(a, b);
        return this.doAddEntry(entry);
    }
    static createEntry(a, b) {
        if (b === undefined) {
            return {
                config: {},
                inputSpectator: a,
            };
        }
        else {
            return {
                config: a,
                inputSpectator: b,
            };
        }
    }
    doAddEntry(entry) {
        this.ownEntries.push(entry);
        this.ownEntriesDirty = true;
        this.setSubtreeEntriesDirty();
        return () => {
            arrayRemoveLast(this.ownEntries, entry);
            this.removeSubtreeEntry(entry);
        };
    }
    setParent(parent) {
        if (this.parent) {
            arrayRemoveFirst(this.parent.children, this);
            this.parent.setSubtreeEntriesDirty();
            this.parent = null;
        }
        if (parent) {
            this.parent = parent;
            this.parent.children.push(this);
            this.parent.setSubtreeEntriesDirty();
        }
    }
    setSubtreeEntriesDirty() {
        this.subtreeEntries = null;
        if (this.parent) {
            this.parent.setSubtreeEntriesDirty();
        }
    }
    removeSubtreeEntry(entry) {
        let i;
        if (this.subtreeEntries) {
            i = arrayRemoveLast(this.subtreeEntries, entry);
        }
        else {
            i = null;
        }
        if (this.parent) {
            this.parent.removeSubtreeEntry(entry);
        }
        return i;
    }
    sortAndGetOwnEntries() {
        if (this.ownEntriesDirty) {
            arraySortStable(this.ownEntries, (a, b) => {
                var _b, _c;
                return (((_b = a.config.order) !== null && _b !== void 0 ? _b : 0) - ((_c = b.config.order) !== null && _c !== void 0 ? _c : 0));
            });
            this.ownEntriesDirty = false;
        }
        return this.ownEntries;
    }
    getSubtreeEntryLists() {
        const result = new Array();
        result.push(this.sortAndGetOwnEntries());
        for (const child of this.children) {
            result.push(...child.getSubtreeEntryLists());
        }
        return result;
    }
    getSubtreeEntries() {
        if (!this.subtreeEntries) {
            const entryLists = this.getSubtreeEntryLists();
            this.subtreeEntries = mergePreSortedLists(entryLists, (a, b) => {
                var _b, _c;
                return (((_b = a.config.order) !== null && _b !== void 0 ? _b : 0) - ((_c = b.config.order) !== null && _c !== void 0 ? _c : 0));
            });
        }
        return this.subtreeEntries;
    }
    forSubtree(fn) {
        for (const en of this.getSubtreeEntries()) {
            fn(en.inputSpectator);
        }
    }
    fireHover(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleHover) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireMove(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleMove) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireUnhover(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleUnhover) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireGrab(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleGrab) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireDrag(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleDrag) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireUngrab(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleUngrab) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireWheel(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleWheel) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireFocus(target) {
        this.forSubtree(s => { var _b; return (_b = s.handleFocus) === null || _b === void 0 ? void 0 : _b.call(s, target); });
    }
    fireKeyPress(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleKeyPress) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireKeyRelease(target, ev) {
        this.forSubtree(s => { var _b; return (_b = s.handleKeyRelease) === null || _b === void 0 ? void 0 : _b.call(s, target, ev); });
    }
    fireUnfocus(target) {
        this.forSubtree(s => { var _b; return (_b = s.handleUnfocus) === null || _b === void 0 ? void 0 : _b.call(s, target); });
    }
}

const INSPECT_PICKING_CLASS = 'inspect-picking';
const INSPECT_HOVERED_CLASS = 'inspect-hovered';
const INSPECT_SELECTED_CLASS = 'inspect-selected';

if (!isDefined(window.gleamInspect)) {
    window.gleamInspect = (paneOrPeer) => {
        if (isPane(paneOrPeer)) {
            setInspectSelectedPane(paneOrPeer);
        }
        else if (isDomPeer(paneOrPeer)) {
            setInspectSelectedDomPeer(paneOrPeer);
        }
        else if (isNullish(paneOrPeer)) {
            for (const host of hosts) {
                setCssClassPresent(host, INSPECT_PICKING_CLASS, true);
            }
            console.info('Click on a pane to inspect it');
        }
        else {
            console.error('Item is not inspectable:\n', paneOrPeer);
        }
    };
}
function getHostElement(domPeer) {
    const rootDomPeer = run(() => {
        for (const ancestor of getDomPeerStack(domPeer)) {
            return ancestor;
        }
        return undefined;
    });
    const host = rootDomPeer === null || rootDomPeer === void 0 ? void 0 : rootDomPeer.parentElement;
    if (host === null || host === void 0 ? void 0 : host.classList.contains(HOST_CLASS)) {
        return host;
    }
    else {
        return null;
    }
}
function isInspectPickingActive(pane) {
    const host = getHostElement(pane.peer);
    return !!(host === null || host === void 0 ? void 0 : host.classList.contains(INSPECT_PICKING_CLASS));
}
function setInspectHoveredPane(pane) {
    let anyCssClassChanges = false;
    const domPeer = pane === null || pane === void 0 ? void 0 : pane.peer;
    for (const host of hosts) {
        for (const el of host.querySelectorAll(`.${INSPECT_HOVERED_CLASS}`)) {
            anyCssClassChanges = setCssClassPresent(el, INSPECT_HOVERED_CLASS, el === domPeer) || anyCssClassChanges;
        }
    }
    if (domPeer) {
        anyCssClassChanges = setCssClassPresent(domPeer, INSPECT_HOVERED_CLASS, true) || anyCssClassChanges;
    }
    return anyCssClassChanges;
}
function setInspectSelectedPane(pane) {
    return setInspectSelectedDomPeer(pane === null || pane === void 0 ? void 0 : pane.peer);
}
function setInspectSelectedDomPeer(domPeer) {
    let anyCssClassChanges = false;
    for (const host of hosts) {
        anyCssClassChanges = setCssClassPresent(host, INSPECT_PICKING_CLASS, false) || anyCssClassChanges;
    }
    for (const host of hosts) {
        for (const el of host.querySelectorAll(`.${INSPECT_HOVERED_CLASS}`)) {
            anyCssClassChanges = setCssClassPresent(el, INSPECT_HOVERED_CLASS, false) || anyCssClassChanges;
        }
    }
    for (const host of hosts) {
        for (const el of host.querySelectorAll(`.${INSPECT_SELECTED_CLASS}`)) {
            anyCssClassChanges = setCssClassPresent(el, INSPECT_SELECTED_CLASS, el === domPeer) || anyCssClassChanges;
        }
    }
    if (domPeer) {
        anyCssClassChanges = setCssClassPresent(domPeer, INSPECT_SELECTED_CLASS, true) || anyCssClassChanges;
    }
    window.$gleamInspected = domPeer;
    if (isNonNullish(domPeer)) {
        console.log(inspectDomPeer(domPeer));
    }
    return anyCssClassChanges;
}
function inspectDomPeer(domPeer) {
    
    return [...getDomPeerStack(domPeer)].map(doInspectDomPeer);
}
function* getDomPeerStack(element) {
    if (isDomPeer(element)) {
        yield* getDomPeerStack(element.parentElement);
        yield element;
    }
}
function doInspectDomPeer(domPeer) {
    const result = {
        PEER: domPeer,
    };
    const { gleamPeer } = domPeer;
    if (isPane(gleamPeer)) {
        const site = doInspectSite(gleamPeer);
        if (Object.entries(site).length > 0) {
            result.SITE = site;
        }
    }
    const style = doInspectStyle(gleamPeer);
    if (Object.entries(style).length > 0) {
        result.style = style;
    }
    const contraptions = new Array();
    const layouts = new Array();
    const subtrees = new ArrayWithZIndices();
    const other = new Array();
    for (const domChild of domPeer.children) {
        if (isDomPeer(domChild)) {
            const gleamChild = domChild.gleamPeer;
            const inspectableChild = doInspectDomPeer(domChild);
            switch (domChild.gleamType) {
                case PeerType.CONTRAPTION:
                    contraptions.push(inspectableChild);
                    break;
                case PeerType.LAYOUT:
                    layouts.push(inspectableChild);
                    break;
                case PeerType.PANE:
                case PeerType.PAINTER:
                    if (!domChild.classList.contains('inspect-highlight')) {
                        const zIndex = getZIndex(gleamPeer, gleamChild);
                        if (isDefined(zIndex)) {
                            if (!isDefined(inspectableChild.SITE)) {
                                inspectableChild.SITE = {};
                            }
                            inspectableChild.SITE.Z_INDEX = zIndex;
                        }
                        subtrees.add(inspectableChild, zIndex);
                    }
                    break;
                case PeerType.OTHER:
                    other.push(inspectableChild);
                    break;
            }
        }
    }
    switch (contraptions.length) {
        case 0: break;
        case 1:
            result.contraption = contraptions[0];
            break;
        default: result.contraption = contraptions;
    }
    switch (layouts.length) {
        case 0: break;
        case 1:
            result.layout = layouts[0];
            break;
        default: result.layout = layouts;
    }
    const subtrees2 = [...subtrees];
    switch (subtrees2.length) {
        case 0: break;
        default: result.subtrees = subtrees2;
    }
    switch (other.length) {
        case 0: break;
        default: result.other = other;
    }
    return result;
}
function getZIndex(gleamParent, gleamChild) {
    if (isfn(gleamParent.hasPane) && isfn(gleamParent.getPaneZIndex) && gleamParent.hasPane(gleamChild)) {
        return gleamParent.getPaneZIndex(gleamChild);
    }
    else if (isfn(gleamParent.hasPainter) && isfn(gleamParent.getPainterZIndex) && gleamParent.hasPainter(gleamChild)) {
        return gleamParent.getPainterZIndex(gleamChild);
    }
    else {
        return undefined;
    }
}
function doInspectSite(pane) {
    const result = {};
    const viewport_PX = pane.getViewport_PX();
    result.VIEWPORT_PX = {
        x: viewport_PX.xMin,
        y: viewport_PX.yMin,
        w: viewport_PX.w,
        h: viewport_PX.h,
    };
    const parent = pane.getParent();
    if (parent) {
        for (const [key, prop] of Object.entries(parent.layout)) {
            if (isUnboundStyleProp(prop)) {
                result[prop.name] = prop.get(pane.siteInParentStyle, pane.siteInParentOverrides[key]);
            }
        }
    }
    return result;
}
function doInspectStyle(gleamPeer) {
    const result = {};
    if (isobj(gleamPeer)) {
        for (const [_, prop] of Object.entries(gleamPeer)) {
            if (isStyleProp(prop)) {
                result[prop.name] = formatStyleValue(prop.get());
            }
        }
    }
    return result;
}
function formatStyleValue(v) {
    if (isDefined(v === null || v === void 0 ? void 0 : v.cssString)) {
        return v.cssString;
    }
    if (isNumber(v === null || v === void 0 ? void 0 : v.top) && isNumber(v === null || v === void 0 ? void 0 : v.right) && isNumber(v === null || v === void 0 ? void 0 : v.bottom) && isNumber(v === null || v === void 0 ? void 0 : v.left)) {
        return `${v.top} ${v.right} ${v.bottom} ${v.left}`;
    }
    else {
        return v;
    }
}

class AxisLabelSet extends ValueBase2 {
    constructor(axisLabels, axisDividers) {
        super();
        this.axisLabels = axisLabels;
        this.axisDividers = axisDividers;
    }
}
class AxisLabel extends ValueBase2 {
    constructor(
    
    axisFrac, 
    
    text, 
    
    minAxisFrac, 
    
    maxAxisFrac, 
    
    textAlignFrac) {
        super();
        this.axisFrac = axisFrac;
        this.text = text;
        this.minAxisFrac = minAxisFrac;
        this.maxAxisFrac = maxAxisFrac;
        this.textAlignFrac = textAlignFrac;
    }
}
class TickSet extends ValueBase2 {
    constructor(majorTicks, minorTicks, formatTick, getAxisLabels) {
        super();
        this.majorTicks = majorTicks;
        this.minorTicks = minorTicks;
        this.formatTick = formatTick;
        this.getAxisLabels = getAxisLabels;
    }
}
const EMPTY_AXISLABELSET = new AxisLabelSet([], []);
const EMPTY_TICKSET = new TickSet([], [], () => '', () => EMPTY_AXISLABELSET);
class NullTicker {
    constructor() {
        this.peer = createDomPeer('null-ticker', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
    }
    getTicks() {
        return EMPTY_TICKSET;
    }
}

function createCommonBoundsAxis1D(bounds = Interval1D.fromEdges(-10, +10), tieFrac = 0.0) {
    return new Axis1D(new CommonBoundsAxisGroup1D(tieFrac, bounds));
}
const validSpanMin = nextUpFloat64(1.0 / Number.MAX_VALUE);
const validSpanInterval = Object.freeze(Interval1D.fromEdges(validSpanMin, 1.0 / validSpanMin));
function isValidTieCoord(tieCoord) {
    return (typeof (tieCoord) === 'number' && isFinite(tieCoord));
}
function isValidSpanLpx(span_LPX) {
    return (typeof (span_LPX) === 'number' && isFinite(span_LPX) && span_LPX > 0);
}
function spanConstraintToScale(span_LPX, spanConstraint) {
    if (isValidSpanLpx(span_LPX)) {
        const spanMin = Math.max(0, spanConstraint.max);
        const spanMax = Math.max(0, spanConstraint.min);
        return Interval1D.fromEdges(span_LPX / spanMin, span_LPX / spanMax);
    }
    else {
        return null;
    }
}
function scaleConstraintToSpan(span_LPX, scaleConstraint) {
    if (isValidSpanLpx(span_LPX)) {
        const scaleMin = Math.max(0, scaleConstraint.max);
        const scaleMax = Math.max(0, scaleConstraint.min);
        return Interval1D.fromEdges(span_LPX / scaleMin, span_LPX / scaleMax);
    }
    else {
        return null;
    }
}
function minMaxConstraintsToSpan(minConstraint, maxConstraint) {
    return Interval1D.fromEdges(maxConstraint.min - minConstraint.max, maxConstraint.max - minConstraint.min);
}
function combineAxisConstraints(axes, getConstraint) {
    let result = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    for (const axis of axes) {
        const interval = getConstraint(axis);
        if (interval) {
            result = doCombineConstraints(result, interval);
        }
    }
    return result;
}

function combineConstraints(a, ...others) {
    let result = a;
    for (const b of others) {
        if (b) {
            result = doCombineConstraints(result, b);
        }
    }
    return result;
}

function doCombineConstraints(a, b) {
    if (a.max <= b.min) {
        return Interval1D.fromEdges(nextDownFloat64(a.max), a.max);
    }
    else if (b.max <= a.min) {
        return Interval1D.fromEdges(a.min, nextUpFloat64(a.min));
    }
    else {
        const min = Math.max(a.min, b.min);
        const max = Math.min(a.max, b.max);
        return Interval1D.fromEdges(min, max);
    }
}
class CommonBoundsAxisGroup1D {
    constructor(tieFrac, bounds) {
        this._changes = new ActivityListenableBasic();
        this.tieFrac = tieFrac;
        this.prioritizeMinConstraint = true;
        this.axes = new Set();
        this.span = bounds.span;
        this.tieCoord = bounds.fracToValue(this.tieFrac);
        this.stateMarker = {};
    }
    get changes() {
        return this._changes;
    }
    clone() {
        const min = this.tieCoord - this.tieFrac * this.span;
        return new CommonBoundsAxisGroup1D(this.tieFrac, Interval1D.fromRect(min, this.span));
    }
    
    _addMember(axis) {
        if (this.axes.has(axis)) {
            throw new Error('This axis is already a member of this group');
        }
        else {
            this.axes.add(axis);
            return () => {
                this.axes.delete(axis);
            };
        }
    }
    set(ongoing, span_LPX, a, b, c) {
        if (c !== undefined) {
            const frac = a;
            const coord = b;
            const scale = c;
            const span = span_LPX / scale;
            return this.doSet(ongoing, frac, coord, span);
        }
        else if (b !== undefined) {
            const min = a;
            const max = b;
            const span = max - min;
            return this.doSet(ongoing, 0.0, min, span);
        }
        else {
            const bounds = a;
            return this.doSet(ongoing, 0.0, bounds.min, bounds.span);
        }
    }
    pan(ongoing, span_LPX, frac, coord) {
        this.doSet(ongoing, frac, coord, this.span);
    }
    reconstrain(ongoing) {
        this.doSet(ongoing, this.tieFrac, this.tieCoord, this.span);
    }
    doSet(ongoing, frac, coord, span) {
        const thisSpan = this.constrainSpan(span);
        const thisTieCoord = this.constrainTieCoord(frac, coord, thisSpan);
        if (!Number.isNaN(thisSpan) && isValidTieCoord(thisTieCoord)) {
            this.span = thisSpan;
            this.tieCoord = thisTieCoord;
            this.fire(ongoing);
        }
    }
    constrainSpan(span) {
        const spanBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return axis.spanConstraint;
        });
        const scaleBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return scaleConstraintToSpan(axis.span_LPX, axis.scaleConstraint);
        });
        const minMaxBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return minMaxConstraintsToSpan(axis.minConstraint, axis.maxConstraint);
        });
        const constraint = combineConstraints(validSpanInterval, spanBasedConstraint, scaleBasedConstraint, minMaxBasedConstraint);
        return constraint.clamp(span);
    }
    constrainTieCoord(frac, coord, span) {
        const tieCoord = coord + (this.tieFrac - frac) * span;
        const minBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return axis.minConstraint.shift(this.tieFrac * span);
        });
        const maxBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return axis.maxConstraint.shift((this.tieFrac - 1) * span);
        });
        const constraint = (this.prioritizeMinConstraint ? combineConstraints(minBasedConstraint, maxBasedConstraint)
            : combineConstraints(maxBasedConstraint, minBasedConstraint));
        return constraint.clamp(tieCoord);
    }
    fire(ongoing) {
        this.stateMarker = {};
        this._changes.fire(ongoing);
    }
    getStateMarker() {
        return this.stateMarker;
    }
    
    getBounds() {
        const min = this.tieCoord - this.tieFrac * this.span;
        return Interval1D.fromRect(min, this.span);
    }
    setBounds(ongoing, a, b) {
        if (b !== undefined) {
            const min = a;
            const max = b;
            const span = max - min;
            return this.doSet(ongoing, 0.0, min, span);
        }
        else {
            const bounds = a;
            return this.doSet(ongoing, 0.0, bounds.min, bounds.span);
        }
    }
    computeAxisState(span_LPX) {
        return {
            span_LPX: span_LPX,
            marker: this.stateMarker,
            bounds: this.getBounds(),
            scale: span_LPX / this.span
        };
    }
}

function createCommonScaleAxis1D(tieFrac = 0.5, tieCoord = 0.0, scale = 250) {
    return new Axis1D(new CommonScaleAxisGroup1D(tieFrac, tieCoord, scale));
}
function createCommonScaleAxis2D(tieFrac = [0.5, 0.5], tieCoord = [0.0, 0.0], scale = [250, 250]) {
    return new Axis2D(createCommonScaleAxis1D(x(tieFrac), x(tieCoord), x(scale)), createCommonScaleAxis1D(y(tieFrac), y(tieCoord), y(scale)));
}
const validScaleMin = nextUpFloat64(1.0 / Number.MAX_VALUE);
const validScaleInterval = Object.freeze(Interval1D.fromEdges(validScaleMin, 1.0 / validScaleMin));
function isValidScaleRatio(ratio) {
    return (typeof (ratio) === 'number' && isFinite(ratio) && isFinite(1.0 / ratio) && ratio > 0);
}
class CommonScaleAxisGroup1D {
    constructor(tieFrac, tieCoord, scale) {
        this._changes = new ActivityListenableBasic();
        this.tieFrac = tieFrac;
        this.prioritizeMinConstraint = true;
        this.scaleRatioLock = null;
        this.axes = new Set();
        this.scale = (scale !== undefined && !Number.isNaN(scale) ? validScaleInterval.clamp(scale) : 1000);
        this.tieCoord = (isValidTieCoord(tieCoord) ? tieCoord : 0);
        this.stateMarker = {};
    }
    get changes() {
        return this._changes;
    }
    clone() {
        return new CommonScaleAxisGroup1D(this.tieFrac, this.tieCoord, this.scale);
    }
    
    _addMember(axis) {
        if (this.axes.has(axis)) {
            throw new Error('This axis is already a member of this group');
        }
        else {
            this.axes.add(axis);
            return () => {
                this.axes.delete(axis);
            };
        }
    }
    
    setScaleRatioLock(other, ratio) {
        if (isValidScaleRatio(ratio)) {
            other.clearScaleRatioLock();
            this.scaleRatioLock = { group: other, ratio: ratio };
            other.scaleRatioLock = { group: this, ratio: 1.0 / ratio };
        }
        else {
            throw new Error('Invalid scale ratio: ' + ratio);
        }
    }
    
    clearScaleRatioLock() {
        if (this.scaleRatioLock) {
            const other = this.scaleRatioLock.group;
            this.scaleRatioLock = null;
            other.scaleRatioLock = null;
        }
    }
    set(ongoing, span_LPX, a, b, c) {
        if (c !== undefined) {
            const frac = a;
            const coord = b;
            const scale = c;
            return this.doSet(ongoing, { span_LPX, frac, coord }, scale);
        }
        else if (b !== undefined) {
            const min = a;
            const max = b;
            const span = max - min;
            const scale = span_LPX / span;
            const tieCoord = min + this.tieFrac * span;
            return this.doSet(ongoing, tieCoord, scale);
        }
        else {
            const bounds = a;
            const scale = span_LPX / bounds.span;
            const tieCoord = bounds.fracToValue(this.tieFrac);
            return this.doSet(ongoing, tieCoord, scale);
        }
    }
    pan(ongoing, span_LPX, frac, coord) {
        this.doSet(ongoing, { span_LPX, frac, coord }, this.scale);
    }
    reconstrain(ongoing) {
        this.doSet(ongoing, this.tieCoord, this.scale);
    }
    doSet(ongoing, pointOrTieCoord, scale) {
        
        if (scale > 0) {
            
            
            
            
            
            if (this.scaleRatioLock) {
                const other = this.scaleRatioLock.group;
                const thisScale = this.constrainScale(scale);
                const otherScale = thisScale / this.scaleRatioLock.ratio;
                const thisTieCoord = this.constrainTieCoord(pointOrTieCoord, thisScale);
                const otherTieCoord = other.constrainTieCoord(other.tieCoord, otherScale);
                if (!Number.isNaN(thisScale) && !Number.isNaN(otherScale) && isValidTieCoord(thisTieCoord) && isValidTieCoord(otherTieCoord)) {
                    this.scale = thisScale;
                    other.scale = otherScale;
                    this.tieCoord = thisTieCoord;
                    other.tieCoord = otherTieCoord;
                    this.fire(ongoing);
                    other.fire(ongoing);
                }
            }
            else {
                const thisScale = this.constrainScale(scale);
                const thisTieCoord = this.constrainTieCoord(pointOrTieCoord, thisScale);
                if (!Number.isNaN(thisScale) && isValidTieCoord(thisTieCoord)) {
                    this.scale = thisScale;
                    this.tieCoord = thisTieCoord;
                    this.fire(ongoing);
                }
            }
        }
    }
    constrainScale(scale) {
        if (this.scaleRatioLock) {
            const other = this.scaleRatioLock.group;
            const thisConstraint = this.getScaleConstraint();
            const otherConstraint = other.getScaleConstraint();
            const constraint = (thisConstraint).intersection(otherConstraint.scale(this.scaleRatioLock.ratio));
            return constraint.clamp(scale);
        }
        else {
            const constraint = this.getScaleConstraint();
            return constraint.clamp(scale);
        }
    }
    getScaleConstraint() {
        const scaleBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return axis.scaleConstraint;
        });
        const spanBasedConstraint = combineAxisConstraints(this.axes, axis => {
            return spanConstraintToScale(axis.span_LPX, axis.spanConstraint);
        });
        const minMaxBasedConstraint = combineAxisConstraints(this.axes, axis => {
            const spanConstraint = minMaxConstraintsToSpan(axis.minConstraint, axis.maxConstraint);
            return spanConstraintToScale(axis.span_LPX, spanConstraint);
        });
        return combineConstraints(scaleBasedConstraint, spanBasedConstraint, minMaxBasedConstraint);
    }
    constrainTieCoord(pointOrTieCoord, scale) {
        const tieCoord = (isnum(pointOrTieCoord) ? pointOrTieCoord : this.computeTieCoord(pointOrTieCoord, scale));
        const minBasedConstraint = combineAxisConstraints(this.axes, axis => {
            const span_LPX = axis.span_LPX;
            return (isValidSpanLpx(span_LPX) ? axis.minConstraint.shift(this.tieFrac * span_LPX / scale) : null);
        });
        const maxBasedConstraint = combineAxisConstraints(this.axes, axis => {
            const span_LPX = axis.span_LPX;
            return (isValidSpanLpx(span_LPX) ? axis.maxConstraint.shift((this.tieFrac - 1) * span_LPX / scale) : null);
        });
        const constraint = (this.prioritizeMinConstraint ? combineConstraints(minBasedConstraint, maxBasedConstraint)
            : combineConstraints(maxBasedConstraint, minBasedConstraint));
        return constraint.clamp(tieCoord);
    }
    computeTieCoord(point, scale) {
        
        const span = point.span_LPX / scale;
        return point.coord + (this.tieFrac - point.frac) * span;
    }
    fire(ongoing) {
        this.stateMarker = {};
        this._changes.fire(ongoing);
    }
    getStateMarker() {
        return this.stateMarker;
    }
    getTieCoord() {
        return this.tieCoord;
    }
    getTieFrac() {
        return this.tieFrac;
    }
    getScale() {
        return this.scale;
    }
    computeAxisState(span_LPX) {
        const span = span_LPX / this.scale;
        const min = this.tieCoord - this.tieFrac * span;
        return {
            span_LPX: span_LPX,
            marker: this.stateMarker,
            bounds: Interval1D.fromRect(min, span),
            scale: this.scale
        };
    }
}

function getRowKey(pane) {
    return getFirstClassName(pane.peer, 'grid-row--');
}
function getColumnKey(pane) {
    return getFirstClassName(pane.peer, 'grid-column--');
}
function setRowKey(pane, rowKey) {
    replaceClassNames(pane.peer, 'grid-row--', rowKey === undefined ? [] : [rowKey]);
}
function setColumnKey(pane, columnKey) {
    replaceClassNames(pane.peer, 'grid-column--', columnKey === undefined ? [] : [columnKey]);
}
function setGridCoords(pane, rowKey, columnKey) {
    setRowKey(pane, rowKey);
    setColumnKey(pane, columnKey);
}
function getFirstClassName(element, prefix) {
    for (const className of element.classList) {
        if (className.startsWith(prefix)) {
            return className.substring(prefix.length);
        }
    }
    return undefined;
}
function replaceClassNames(element, prefix, replacementSuffixes) {
    
    
    
    const classNamesToAdd = new Set();
    for (const suffix of replacementSuffixes) {
        classNamesToAdd.add(prefix + suffix);
    }
    const classNamesToRemove = [];
    for (const className of element.classList) {
        if (!classNamesToAdd.delete(className) && className.startsWith(prefix)) {
            classNamesToRemove.push(className);
        }
    }
    if (classNamesToRemove.length > 0) {
        element.classList.remove(...classNamesToRemove);
    }
    if (classNamesToAdd.size > 0) {
        element.classList.add(...classNamesToAdd);
    }
}

class GridLayout extends LayoutBase {
    constructor() {
        super('grid-layout');
        this.topToBottom = StyleProp.create(this.style, '--top-to-bottom', cssBoolean, false);
        this.gapBetweenRows_LPX = StyleProp.create(this.style, '--gap-between-rows-px', cssFloat, 0);
        this.rowHeight = UnboundStyleProp.create('--row-height', cssString, 'flex(0,pref)');
        this.rightToLeft = StyleProp.create(this.style, '--right-to-left', cssBoolean, false);
        this.gapBetweenColumns_LPX = StyleProp.create(this.style, '--gap-between-columns-px', cssFloat, 0);
        this.columnWidth = UnboundStyleProp.create('--column-width', cssString, 'flex(0,pref)');
        this.visibleRowKeys = new LinkedSet();
        this.visibleColumnKeys = new LinkedSet();
    }
    computePrefSize_PX(children) {
        return computeGridPrefSize_PX(currentDpr(this), children, this, this);
    }
    computeChildViewports_PX(viewport_PX, children) {
        return computeGridChildViewports_PX(currentDpr(this), viewport_PX, children, this, this);
    }
}
function getRowHeightInfo(viewport_PX, dpr, pane, rowsConfig) {
    const s = rowsConfig.rowHeight.get(pane.siteInParentStyle, checkedStringSupplier(pane.siteInParentOverrides.rowHeight));
    return parseSizeInfo(viewport_PX.h, dpr, pane.getPrefSize_PX().h, s);
}
function getColumnWidthInfo(viewport_PX, dpr, pane, columnsConfig) {
    const s = columnsConfig.columnWidth.get(pane.siteInParentStyle, checkedStringSupplier(pane.siteInParentOverrides.columnWidth));
    return parseSizeInfo(viewport_PX.w, dpr, pane.getPrefSize_PX().w, s);
}
function checkedStringSupplier(supplier) {
    return () => {
        const v = supplier === null || supplier === void 0 ? void 0 : supplier();
        if (v === undefined || isstr(v)) {
            return v;
        }
        else {
            throw new Error();
        }
    };
}
function parseSizeInfo(viewport_PX, dpr, pref_PX, s) {
    const rigidMatch = s.match(/^rigid\(([^\)]*)\)$/);
    if (rigidMatch !== null) {
        const sizeStr = rigidMatch[1].trim().toLowerCase();
        const size_PX = parseSize_PX(sizeStr, dpr, viewport_PX, pref_PX);
        if (isNumber(size_PX)) {
            return {
                type: 'rigid',
                size_PX,
            };
        }
    }
    const flexMatch = s.match(/^flex\(([^\)]*),([^\)]*)\)$/);
    if (flexMatch !== null) {
        const minSizeStr = flexMatch[1].trim().toLowerCase();
        const prefSizeStr = flexMatch[2].trim().toLowerCase();
        const minSize_PX = parseSize_PX(minSizeStr, dpr, viewport_PX, pref_PX);
        const prefSize_PX = parseSize_PX(prefSizeStr, dpr, viewport_PX, pref_PX);
        if (isNumber(minSize_PX) && isNumber(prefSize_PX)) {
            return {
                type: 'flex',
                minSize_PX,
                prefSize_PX,
            };
        }
    }
    return {
        type: 'flex',
        minSize_PX: 0,
        prefSize_PX: pref_PX,
    };
}
function computeGridPrefSize_PX(dpr, children, rowsConfig, columnsConfig) {
    const gapBetweenRows_PX = Math.round(rowsConfig.gapBetweenRows_LPX.get() * dpr);
    const gapBetweenColumns_PX = Math.round(columnsConfig.gapBetweenColumns_LPX.get() * dpr);
    
    const viewport_PX = Interval2D.fromEdges(NaN, NaN, NaN, NaN);
    const childInfos = getGridChildInfos(viewport_PX, dpr, children, rowsConfig, columnsConfig);
    const rowSizes = getRankSizes(mapIterable(childInfos.values(), c => c.row));
    const prefHeight_PX = computeRankSizeTotals(gapBetweenRows_PX, rowSizes).totalPrefSize_PX;
    const columnSizes = getRankSizes(mapIterable(childInfos.values(), c => c.column));
    const prefWidth_PX = computeRankSizeTotals(gapBetweenColumns_PX, columnSizes).totalPrefSize_PX;
    return new Size2D(prefWidth_PX, prefHeight_PX);
}
function computeGridChildViewports_PX(dpr, viewport_PX, children, rowsConfig, columnsConfig) {
    const topToBottom = rowsConfig.topToBottom.get();
    const rightToLeft = columnsConfig.rightToLeft.get();
    const gapBetweenRows_PX = Math.round(rowsConfig.gapBetweenRows_LPX.get() * dpr);
    const gapBetweenColumns_PX = Math.round(columnsConfig.gapBetweenColumns_LPX.get() * dpr);
    const childInfos = getGridChildInfos(viewport_PX, dpr, children, rowsConfig, columnsConfig);
    const rowSizes = getRankSizes(mapIterable(childInfos.values(), c => c.row));
    const rowIntervals_PX = computeRankIntervals_PX(viewport_PX.y, topToBottom, gapBetweenRows_PX, rowSizes, rowsConfig.visibleRowKeys);
    const columnSizes = getRankSizes(mapIterable(childInfos.values(), c => c.column));
    const columnIntervals_PX = computeRankIntervals_PX(viewport_PX.x, rightToLeft, gapBetweenColumns_PX, columnSizes, columnsConfig.visibleColumnKeys);
    const childViewports_PX = new Map();
    for (const [child, childInfo] of childInfos) {
        const rowInterval_PX = requireNonNullish(rowIntervals_PX.get(childInfo.row.key));
        const columnInterval_PX = requireNonNullish(columnIntervals_PX.get(childInfo.column.key));
        childViewports_PX.set(child, Interval2D.fromXy(columnInterval_PX, rowInterval_PX));
    }
    return childViewports_PX;
}

function parseSize_PX(s, dpr, viewportSize_PX, prefSize_PX) {
    if (typeof (s) !== 'string') {
        return NaN;
    }
    const prefMatch = s.match(/^pref$/);
    if (prefMatch !== null) {
        return prefSize_PX;
    }
    const pxMatch = s.match(/^(.*)px$/);
    if (pxMatch !== null) {
        const size_LPX = Number.parseFloat(pxMatch[1]);
        return (size_LPX * dpr);
    }
    const percentMatch = s.match(/^(.*)%$/);
    if (percentMatch !== null) {
        const size_FRAC = 0.01 * Number.parseFloat(percentMatch[1]);
        return (size_FRAC * viewportSize_PX);
    }
    const size_LPX = Number.parseFloat(s);
    return (size_LPX * dpr);
}
function getGridChildInfos(viewport_PX, dpr, children, rowsConfig, columnsConfig) {
    const result = new Map();
    for (const child of children) {
        if (!child.isVisible()) {
            continue;
        }
        const rowKey = getRowKey(child);
        if (rowKey === undefined) {
            continue;
        }
        if (!(rowKey === 'ALL' || rowKey === 'VIEWPORT' || rowsConfig.visibleRowKeys.has(rowKey))) {
            continue;
        }
        const columnKey = getColumnKey(child);
        if (columnKey === undefined) {
            continue;
        }
        if (!(columnKey === 'ALL' || columnKey === 'VIEWPORT' || columnsConfig.visibleColumnKeys.has(columnKey))) {
            continue;
        }
        result.set(child, {
            row: {
                key: rowKey,
                size: getRowHeightInfo(viewport_PX, dpr, child, rowsConfig),
            },
            column: {
                key: columnKey,
                size: getColumnWidthInfo(viewport_PX, dpr, child, columnsConfig),
            },
        });
    }
    return result;
}
function getRankSizes(childRankInfos) {
    const sizes = new Map();
    for (const rankInfo of childRankInfos) {
        const oldSize = sizes.get(rankInfo.key);
        const newSize = mergeSizeInfos(oldSize, rankInfo.size);
        sizes.set(rankInfo.key, newSize);
    }
    for (const size of sizes.values()) {
        tweakSizeInfo(size);
    }
    return sizes;
}
function mergeSizeInfos(a, b) {
    a = a !== null && a !== void 0 ? a : {
        type: 'rigid',
        size_PX: 0,
    };
    b = b !== null && b !== void 0 ? b : {
        type: 'rigid',
        size_PX: 0,
    };
    if (a.type === 'rigid' && b.type === 'rigid') {
        return {
            type: 'rigid',
            size_PX: Math.max(a.size_PX, b.size_PX),
        };
    }
    else if (a.type === 'rigid' && b.type === 'flex') {
        return {
            type: 'flex',
            minSize_PX: Math.max(a.size_PX, b.minSize_PX),
            prefSize_PX: Math.max(a.size_PX, b.prefSize_PX),
        };
    }
    else if (a.type === 'flex' && b.type === 'flex') {
        return {
            type: 'flex',
            minSize_PX: Math.max(a.minSize_PX, b.minSize_PX),
            prefSize_PX: Math.max(a.prefSize_PX, b.prefSize_PX),
        };
    }
    else if (a.type === 'flex' && b.type === 'rigid') {
        return {
            type: 'flex',
            minSize_PX: Math.max(a.minSize_PX, b.size_PX),
            prefSize_PX: Math.max(a.prefSize_PX, b.size_PX),
        };
    }
    else {
        throw new Error('Unexpected size-info types: a = ' + a.type + ', b = ' + b.type);
    }
}
function tweakSizeInfo(size) {
    switch (size.type) {
        case 'rigid':
            {
                size.size_PX = Math.round(size.size_PX);
            }
            break;
        case 'flex':
            {
                size.minSize_PX = Math.round(size.minSize_PX);
                size.prefSize_PX = Math.round(size.prefSize_PX);
                size.prefSize_PX = Math.max(size.minSize_PX, size.prefSize_PX);
            }
            break;
    }
}
function computeRankSizeTotals(gapBetweenRanks_PX, rankSizes) {
    let totalRigidCount = 0;
    let totalRigidSize_PX = 0;
    let totalFlexCount = 0;
    let totalFlexMinSize_PX = 0;
    let totalFlexPrefSize_PX = 0;
    for (const [rankKey, rankSize] of rankSizes) {
        if (rankKey !== 'ALL' && rankKey !== 'VIEWPORT') {
            switch (rankSize.type) {
                case 'rigid':
                    {
                        totalRigidSize_PX += rankSize.size_PX;
                        totalRigidCount++;
                    }
                    break;
                case 'flex':
                    {
                        totalFlexMinSize_PX += rankSize.minSize_PX;
                        totalFlexPrefSize_PX += rankSize.prefSize_PX;
                        totalFlexCount++;
                    }
                    break;
            }
        }
    }
    const totalGapSize_PX = Math.max(0, totalRigidCount + totalFlexCount - 1) * gapBetweenRanks_PX;
    let totalPrefSize_PX = totalRigidSize_PX + totalFlexPrefSize_PX + totalGapSize_PX;
    for (const [rankKey, rankSize] of rankSizes) {
        if (rankKey === 'ALL' || rankKey === 'VIEWPORT') {
            switch (rankSize.type) {
                case 'rigid':
                    {
                        totalPrefSize_PX = Math.max(totalPrefSize_PX, rankSize.size_PX);
                    }
                    break;
                case 'flex':
                    {
                        totalPrefSize_PX = Math.max(totalPrefSize_PX, rankSize.prefSize_PX);
                    }
                    break;
            }
        }
    }
    return {
        totalPrefSize_PX,
        totalGapSize_PX,
        totalRigidCount,
        totalRigidSize_PX,
        totalFlexCount,
        totalFlexMinSize_PX,
        totalFlexPrefSize_PX,
    };
}
function computeRankIntervals_PX(viewport_PX, maxToMin, gapBetweenRanks_PX, rankSizes, visibleRankKeys) {
    const rankIntervals_PX = new Map();
    const { totalGapSize_PX, totalRigidSize_PX, totalFlexCount, totalFlexMinSize_PX, totalFlexPrefSize_PX } = computeRankSizeTotals(gapBetweenRanks_PX, rankSizes);
    let usedSize_PX = 0;
    let remainingDiscretionarySpace_PX = viewport_PX.span - (totalRigidSize_PX + totalFlexMinSize_PX + totalGapSize_PX);
    let remainingFlexPrefSize_PX = totalFlexPrefSize_PX;
    let remainingFlexCount = totalFlexCount;
    for (const rankKey of visibleRankKeys) {
        const rankSize = rankSizes.get(rankKey);
        if (rankSize !== undefined && rankKey !== 'ALL' && rankKey !== 'VIEWPORT') {
            if (rankIntervals_PX.size > 0) {
                usedSize_PX += gapBetweenRanks_PX;
            }
            let rankSize_PX;
            switch (rankSize.type) {
                case 'rigid':
                    {
                        rankSize_PX = rankSize.size_PX;
                    }
                    break;
                case 'flex': {
                    
                    
                    
                    const discretionaryFrac = ((totalFlexPrefSize_PX <= 0)
                        ? 1.0 / remainingFlexCount
                        : (remainingFlexPrefSize_PX <= 0)
                            ? 0
                            : rankSize.prefSize_PX / remainingFlexPrefSize_PX);
                    const discretionarySize_PX = Math.round(discretionaryFrac * remainingDiscretionarySpace_PX);
                    remainingDiscretionarySpace_PX -= discretionarySize_PX;
                    remainingFlexPrefSize_PX -= rankSize.prefSize_PX;
                    remainingFlexCount -= 1;
                    rankSize_PX = rankSize.minSize_PX + discretionarySize_PX;
                }
            }
            let min_PX;
            if (maxToMin) {
                min_PX = viewport_PX.max - usedSize_PX - rankSize_PX;
            }
            else {
                min_PX = viewport_PX.min + usedSize_PX;
            }
            const max_PX = min_PX + rankSize_PX;
            rankIntervals_PX.set(rankKey, Interval1D.fromEdges(min_PX, max_PX));
            usedSize_PX += rankSize_PX;
        }
    }
    let totalSize_PX = usedSize_PX;
    for (const [rankKey, rankSize] of rankSizes) {
        if (rankKey === 'ALL' || rankKey === 'VIEWPORT') {
            switch (rankSize.type) {
                case 'rigid':
                    {
                        totalSize_PX = Math.max(totalSize_PX, rankSize.size_PX);
                    }
                    break;
                case 'flex':
                    {
                        totalSize_PX = Math.max(totalSize_PX, viewport_PX.span);
                    }
                    break;
            }
        }
    }
    const allMin_PX = (maxToMin ? viewport_PX.max - totalSize_PX : viewport_PX.min);
    rankIntervals_PX.set('ALL', Interval1D.fromRect(allMin_PX, totalSize_PX));
    rankIntervals_PX.set('VIEWPORT', viewport_PX);
    return rankIntervals_PX;
}
Object.freeze({
    topToBottom: { get() { return true; } },
    gapBetweenRows_LPX: { get() { return 0; } },
    rowHeight: { get() { return 'flex(0,pref)'; } },
    visibleRowKeys: newImmutableSet([]),
});

function createInsetPane(child, cssClasses = []) {
    const pane = new Pane(new InsetLayout());
    for (const cssClass of cssClasses) {
        pane.addCssClass(cssClass);
    }
    pane.addPane(child);
    return pane;
}
class InsetLayout extends LayoutBase {
    constructor() {
        super('inset-layout');
        this.inset_LPX = StyleProp.create(this.style, '--inset-px', cssInset, '0 0 0 0');
    }
    getInset_PX() {
        return roundInset(scaleInset(this.inset_LPX.get(), currentDpr(this)));
    }
    computePrefSize_PX(children) {
        let maxPrefWidth_PX = 0;
        let maxPrefHeight_PX = 0;
        for (const child of children) {
            if (child.isVisible()) {
                maxPrefWidth_PX = Math.max(maxPrefWidth_PX, child.getPrefSize_PX().w);
                maxPrefHeight_PX = Math.max(maxPrefHeight_PX, child.getPrefSize_PX().h);
            }
        }
        const inset_PX = this.getInset_PX();
        const w_PX = inset_PX.left + Math.ceil(maxPrefWidth_PX) + inset_PX.right;
        const h_PX = inset_PX.top + Math.ceil(maxPrefHeight_PX) + inset_PX.bottom;
        return new Size2D(w_PX, h_PX);
    }
    computeChildViewports_PX(viewport_PX, children) {
        const inset_PX = this.getInset_PX();
        const xMin_PX = viewport_PX.xMin + inset_PX.left;
        const xMax_PX = viewport_PX.xMax - inset_PX.right;
        const yMin_PX = viewport_PX.yMin + inset_PX.bottom;
        const yMax_PX = viewport_PX.yMax - inset_PX.top;
        const childViewport_PX = Interval2D.fromEdges(xMin_PX, xMax_PX, yMin_PX, yMax_PX);
        const childViewports_PX = new Map();
        for (const child of children) {
            if (child.isVisible()) {
                childViewports_PX.set(child, childViewport_PX);
            }
        }
        return childViewports_PX;
    }
}
Object.freeze({
    rightToLeft: { get() { return true; } },
    gapBetweenColumns_LPX: { get() { return 0; } },
    columnWidth: { get() { return 'flex(0,pref)'; } },
    visibleColumnKeys: newImmutableSet([]),
});

var markFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var markVertShader_GLSL = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

var textFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform lowp sampler2D ATLAS;\nuniform vec4 RGBA;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    float mask = 1.0 - texture2D( ATLAS, vSt_FRAC ).r;\n    float alpha = mask * RGBA.a;\n    gl_FragColor = vec4( alpha*RGBA.rgb, alpha );\n}\n";

var textVertShader_GLSL = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC, s_FRAC, t_FRAC\n */\nattribute vec4 inCoords;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    vSt_FRAC = inCoords.zw;\n}\n";

const MARK_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: markVertShader_GLSL,
    fragShader_GLSL: markFragShader_GLSL,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});
const TEXT_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: textVertShader_GLSL,
    fragShader_GLSL: textFragShader_GLSL,
    uniformNames: ['ATLAS', 'RGBA'],
    attribNames: ['inCoords', 'inColor'],
});
class CoordsInputs$4 extends ValueBase2 {
    constructor(majorTicks, minorTicks, formatTick, axisLabelSet, axisBounds, axisViewport_PX, viewport_PX, markLength_PX, markWidth_PX, spaceFromMarkToText_PX, spaceFromTextToTitle_PX, edgeOffset_PX, textFont) {
        super();
        this.majorTicks = majorTicks;
        this.minorTicks = minorTicks;
        this.formatTick = formatTick;
        this.axisLabelSet = axisLabelSet;
        this.axisBounds = axisBounds;
        this.axisViewport_PX = axisViewport_PX;
        this.viewport_PX = viewport_PX;
        this.markLength_PX = markLength_PX;
        this.markWidth_PX = markWidth_PX;
        this.spaceFromMarkToText_PX = spaceFromMarkToText_PX;
        this.spaceFromTextToTitle_PX = spaceFromTextToTitle_PX;
        this.edgeOffset_PX = edgeOffset_PX;
        this.textFont = textFont;
    }
}

const tickOffsetEpsilon_PX = 1e-12;
class AxisPainter {
    
    constructor(axis, labelEdge, createTicker, textAtlasCache) {
        this.peer = createDomPeer('axis-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.textFont = StyleProp.create(this.style, '--text-font', cssString, '13px sans-serif');
        this.textColor = StyleProp.create(this.style, '--text-color', cssColor, 'rgb(127,127,127)');
        this.markColor = StyleProp.create(this.style, '--tick-color', cssColor, 'rgb(127,127,127)');
        this.dividerColor = StyleProp.create(this.style, '--divider-color', cssColor, 'rgb(170,170,170)');
        this.markLength_LPX = StyleProp.create(this.style, '--tick-length-px', cssFloat, 6);
        this.markWidth_LPX = StyleProp.create(this.style, '--tick-width-px', cssFloat, 1);
        this.dividerWidth_LPX = StyleProp.create(this.style, '--divider-width-px', cssFloat, 1);
        this.edgeOffset_LPX = StyleProp.create(this.style, '--edge-offset-px', cssFloat, 0);
        this.spaceFromMarkToText_LPX = StyleProp.create(this.style, '--space-tick-to-text-px', cssFloat, 4);
        this.spaceFromTextToTitle_LPX = StyleProp.create(this.style, '--space-text-to-title-px', cssFloat, 5);
        this.visible = new RefBasic(true, tripleEquals);
        this.axis = axis;
        this.labelEdge = labelEdge;
        this.ticker = createTicker();
        appendChild(this.peer, this.ticker.peer);
        this.hCoords = new Float32Array(0);
        this.hTextAtlasCache = textAtlasCache !== null && textAtlasCache !== void 0 ? textAtlasCache : new TextAtlasCache();
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dMarkVertexCount = 0;
        this.dDividerVertexCount = 0;
        this.dTextVertexCount = 0;
    }
    getPrefSize_PX() {
        var _a;
        const textFont = this.textFont.get();
        const markLength_LPX = this.markLength_LPX.get();
        const edgeOffset_LPX = this.edgeOffset_LPX.get();
        const spaceFromMarkToText_LPX = this.spaceFromMarkToText_LPX.get();
        const spaceFromTextToTitle_LPX = this.spaceFromTextToTitle_LPX.get();
        const dpr = currentDpr(this);
        const markLength_PX = Math.round(markLength_LPX * dpr);
        const edgeOffset_PX = Math.round(edgeOffset_LPX * dpr);
        const spaceFromMarkToText_PX = Math.round(spaceFromMarkToText_LPX * dpr);
        const spaceFromTextToTitle_PX = Math.round(spaceFromTextToTitle_LPX * dpr);
        const hTextAtlas = this.hTextAtlasCache.get(textFont, dpr, undefined);
        const tickSet = this.ticker.getTicks(this.axis);
        const axisLabelSet = tickSet.getAxisLabels();
        const haveAxisLabels = run(() => {
            for (const axisLabel of axisLabelSet.axisLabels) {
                if (axisLabel.text.trim().length > 0) {
                    return true;
                }
            }
            return false;
        });
        const titleSize_PX = (haveAxisLabels ? spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerDescent() + hTextAtlas.getMaxInnerAscent() : 0);
        const tickTexts = new Array();
        for (const coord_AXIS of tickSet.majorTicks) {
            tickTexts.push(tickSet.formatTick(coord_AXIS));
        }
        if (this.labelEdge === NORTH || this.labelEdge === SOUTH) {
            
            
            const prefHeight_PX = edgeOffset_PX + markLength_PX + spaceFromMarkToText_PX + hTextAtlas.getMaxInnerAscent() + titleSize_PX + spaceFromMarkToText_PX;
            return new Size2D(0, prefHeight_PX);
        }
        else {
            const wDigits_PX = Math.max(0, ...tickTexts.map(tickText => { var _a; return ((_a = tickText.match(/[^+-.]/g)) !== null && _a !== void 0 ? _a : []).length; })) * getTextWidth(hTextAtlas, '0');
            const wDecimalPoint_PX = (((_a = tickTexts[0]) === null || _a === void 0 ? void 0 : _a.includes('.')) ? getTextWidth(hTextAtlas, '.') : 0);
            const wSign_PX = Math.max(getTextWidth(hTextAtlas, '-'), getTextWidth(hTextAtlas, '+'));
            const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
            
            const prefWidth_PX = edgeOffset_PX + markLength_PX + spaceFromMarkToText_PX + wTickTextMax_PX + titleSize_PX + spaceFromMarkToText_PX;
            return new Size2D(prefWidth_PX, 0);
        }
    }
    paint(context, viewport_PX) {
        var _a, _b;
        const textFont = this.textFont.get();
        const textColor = this.textColor.get();
        const markColor = this.markColor.get();
        const markLength_LPX = this.markLength_LPX.get();
        const markWidth_LPX = this.markWidth_LPX.get();
        const dividerColor = this.dividerColor.get();
        const dividerWidth_LPX = this.dividerWidth_LPX.get();
        const edgeOffset_LPX = this.edgeOffset_LPX.get();
        const spaceFromMarkToText_LPX = this.spaceFromMarkToText_LPX.get();
        const spaceFromTextToTitle_LPX = this.spaceFromTextToTitle_LPX.get();
        
        const dpr = currentDpr(this);
        const markLength_PX = Math.round(markLength_LPX * dpr);
        const markWidth_PX = Math.round(markWidth_LPX * dpr);
        const dividerWidth_PX = Math.round(dividerWidth_LPX * dpr);
        const edgeOffset_PX = Math.round(edgeOffset_LPX * dpr);
        const spaceFromMarkToText_PX = Math.round(spaceFromMarkToText_LPX * dpr);
        const spaceFromTextToTitle_PX = Math.round(spaceFromTextToTitle_LPX * dpr);
        const gl = context.gl;
        const textVisible = (textColor.a > 0);
        const marksVisible = (markColor.a > 0 && markLength_PX > 0 && markWidth_PX > 0);
        const dividersVisible = (dividerColor.a > 0 && dividerWidth_PX > 0);
        if (textVisible || marksVisible) {
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
                this.dMarkVertexCount = 0;
                this.dTextVertexCount = 0;
            }
            
            const axisBounds = this.axis.bounds;
            const axisViewport_PX = this.axis.viewport_PX;
            const { majorTicks, minorTicks, formatTick, getAxisLabels } = this.ticker.getTicks(this.axis);
            const axisLabelSet = getAxisLabels();
            const coordsInputs = new CoordsInputs$4(majorTicks, minorTicks, formatTick, axisLabelSet, axisBounds, axisViewport_PX, viewport_PX, markLength_PX, markWidth_PX, spaceFromMarkToText_PX, spaceFromTextToTitle_PX, edgeOffset_PX, textFont);
            
            const hTextAtlas = this.hTextAtlasCache.get(textFont, dpr, context.frameNum);
            const dTextAtlas = context.getTexture(`gleam.Axis.Text.${textFont}`, [dpr], (gl, target) => {
                gl.texParameteri(target, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
                gl.texParameteri(target, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
                gl.texParameteri(target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
                gl.texParameteri(target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
                return texImage2D(gl, target, GL.LUMINANCE, GL.UNSIGNED_BYTE, hTextAtlas.getPixels());
            });
            
            gl.activeTexture(GL.TEXTURE0);
            gl.bindTexture(GL.TEXTURE_2D, dTextAtlas.texture);
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                const titles = axisLabelSet.axisLabels;
                const dividers = axisLabelSet.axisDividers;
                const tickTexts = new Array();
                for (const coord_AXIS of majorTicks) {
                    tickTexts.push(formatTick(coord_AXIS));
                }
                const markCount = majorTicks.length;
                const markCoordCount = 12 * markCount;
                const dividerCount = dividers.length;
                const dividerCoordCount = 12 * dividerCount;
                let glyphCount = 0;
                for (const title of titles) {
                    glyphCount += getGlyphCount(hTextAtlas, title.text);
                }
                for (const tickText of tickTexts) {
                    glyphCount += getGlyphCount(hTextAtlas, tickText);
                }
                const maxTextCoordCount = 24 * glyphCount;
                const maxTotalCoordCount = markCoordCount + dividerCoordCount + maxTextCoordCount;
                if (this.hCoords.length < maxTotalCoordCount) {
                    const hCoordsFloats = Math.max(maxTotalCoordCount, 2 * this.hCoords.length);
                    this.hCoords = new Float32Array(hCoordsFloats);
                }
                let iMark0 = 0;
                let iDivider0 = iMark0 + markCoordCount;
                let iText0 = iDivider0 + dividerCoordCount;
                let iMark = iMark0;
                let iDivider = iDivider0;
                let iText = iText0;
                if (this.labelEdge === NORTH || this.labelEdge === SOUTH) {
                    let yMarkTop_UPX;
                    let yDividerMax_UPX;
                    let yDividerMin_UPX;
                    let yTickText_UPX;
                    let yTitleText_UPX;
                    if (this.labelEdge === SOUTH) {
                        yMarkTop_UPX = viewport_PX.h - edgeOffset_PX;
                        yTickText_UPX = yMarkTop_UPX - markLength_PX - spaceFromMarkToText_PX - hTextAtlas.getMaxInnerAscent();
                        yTitleText_UPX = yTickText_UPX - hTextAtlas.getMaxInnerDescent() - spaceFromTextToTitle_PX - hTextAtlas.getMaxInnerAscent();
                        yDividerMax_UPX = yTickText_UPX - spaceFromMarkToText_PX;
                        yDividerMin_UPX = 0;
                    }
                    else {
                        yMarkTop_UPX = edgeOffset_PX + markLength_PX;
                        
                        
                        yTickText_UPX = yMarkTop_UPX + spaceFromMarkToText_PX;
                        yTitleText_UPX = yTickText_UPX + hTextAtlas.getMaxInnerAscent() + spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerDescent();
                        yDividerMax_UPX = viewport_PX.h;
                        yDividerMin_UPX = yTickText_UPX + hTextAtlas.getMaxInnerAscent() + spaceFromMarkToText_PX;
                    }
                    const yTickText_PX = Math.round(viewport_PX.h - yTickText_UPX);
                    const yTitleText_PX = Math.round(viewport_PX.h - yTitleText_UPX);
                    for (const title of titles) {
                        const x_PX = (axisViewport_PX.min - viewport_PX.xMin) + (title.axisFrac * axisViewport_PX.span);
                        const text = title.text;
                        const textAlignFrac = numberOr(title.textAlignFrac, 0.5);
                        const wText_PX = getTextWidth(hTextAtlas, text);
                        const xTextPref_PX = x_PX - textAlignFrac * wText_PX;
                        const minAxisFrac = numberOr(title.minAxisFrac, 0);
                        const maxAxisFrac = numberOr(title.maxAxisFrac, 1);
                        const xTextMin_PX = (axisViewport_PX.min - viewport_PX.xMin) + (minAxisFrac * axisViewport_PX.span);
                        const xTextMax_PX = (axisViewport_PX.min - viewport_PX.xMin) + (maxAxisFrac * axisViewport_PX.span) - wText_PX;
                        const xText_PX = Math.round(clamp(xTextMin_PX, xTextMax_PX, xTextPref_PX) + tickOffsetEpsilon_PX);
                        if (xTextMin_PX <= xText_PX && xText_PX <= xTextMax_PX) {
                            iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yTitleText_PX, 0, text);
                        }
                    }
                    for (const divider of dividers) {
                        const x_PX = (axisViewport_PX.min - viewport_PX.xMin) + (divider.axisFrac * axisViewport_PX.span);
                        const xDividerMin_PX = Math.round(x_PX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const xDividerMin_NDC = xPixelToNdc(viewport_PX.x, xDividerMin_PX);
                        const xDividerMax_NDC = xDividerMin_NDC + (dividerWidth_PX * 2 / viewport_PX.w);
                        const yDividerMin_NDC = yUpwardPixelToNdc(viewport_PX.y, yDividerMin_UPX);
                        const yDividerMax_NDC = yUpwardPixelToNdc(viewport_PX.y, yDividerMax_UPX);
                        iDivider = putAlignedBox(this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC);
                    }
                    
                    let xTextMinAllowed_PX = Number.NEGATIVE_INFINITY;
                    const wRequiredTextSpacing_PX = 0.5 * getTextWidth(hTextAtlas, '0');
                    for (let tickNum = 0; tickNum < majorTicks.length; tickNum++) {
                        const x_FRAC = axisBounds.valueToFrac(majorTicks[tickNum]);
                        const x_PX = (axisViewport_PX.min - viewport_PX.xMin) + (x_FRAC * axisViewport_PX.span);
                        const xMarkMin_PX = Math.round(x_PX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const xMarkMin_NDC = xPixelToNdc(viewport_PX.x, xMarkMin_PX);
                        const xMarkMax_NDC = xMarkMin_NDC + (markWidth_PX * 2 / viewport_PX.w);
                        const yMarkMax_NDC = yUpwardPixelToNdc(viewport_PX.y, yMarkTop_UPX);
                        const yMarkMin_NDC = yMarkMax_NDC - (markLength_PX * 2 / viewport_PX.h);
                        iMark = putAlignedBox(this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC);
                        const text = tickTexts[tickNum];
                        const wText_PX = getTextWidth(hTextAtlas, text);
                        const wAbsText_PX = (text.startsWith('-') ? getTextWidth(hTextAtlas, text.substring(1)) : wText_PX);
                        const xTextPref_PX = xMarkMin_PX + Math.round(0.5 * markWidth_PX + 0.5 * wAbsText_PX - wText_PX);
                        const xText_PX = clamp(0, viewport_PX.w - wText_PX, xTextPref_PX);
                        if (xText_PX >= xTextMinAllowed_PX) {
                            iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yTickText_PX, 0, text);
                            xTextMinAllowed_PX = xText_PX + wText_PX + wRequiredTextSpacing_PX;
                        }
                    }
                }
                else if (this.labelEdge === WEST) {
                    const xMarkRight_PX = viewport_PX.w - edgeOffset_PX;
                    const xTickTextRight_PX = xMarkRight_PX - markLength_PX - spaceFromMarkToText_PX;
                    const wDigits_PX = Math.max(0, ...tickTexts.map(tickText => { var _a; return ((_a = tickText.match(/[^+-.]/g)) !== null && _a !== void 0 ? _a : []).length; })) * getTextWidth(hTextAtlas, '0');
                    const wDecimalPoint_PX = (((_a = tickTexts[0]) === null || _a === void 0 ? void 0 : _a.includes('.')) ? getTextWidth(hTextAtlas, '.') : 0);
                    const wSign_PX = Math.max(getTextWidth(hTextAtlas, '-'), getTextWidth(hTextAtlas, '+'));
                    const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
                    const xTitleText_PX = xTickTextRight_PX - wTickTextMax_PX - spaceFromTextToTitle_PX - hTextAtlas.getMaxInnerDescent();
                    for (const title of titles) {
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (title.axisFrac * axisViewport_PX.span);
                        const text = title.text;
                        const textAlignFrac = numberOr(title.textAlignFrac, 0.5);
                        const hText_PX = getTextWidth(hTextAtlas, text);
                        const yTextPref_UPX = y_UPX - textAlignFrac * hText_PX;
                        const minAxisFrac = numberOr(title.minAxisFrac, 0);
                        const maxAxisFrac = numberOr(title.maxAxisFrac, 1);
                        const yTextMin_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (minAxisFrac * axisViewport_PX.span);
                        const yTextMax_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (maxAxisFrac * axisViewport_PX.span) - hText_PX;
                        const yText_UPX = Math.round(clamp(yTextMin_UPX, yTextMax_UPX, yTextPref_UPX) + tickOffsetEpsilon_PX);
                        if (yTextMin_UPX <= yText_UPX && yText_UPX <= yTextMax_UPX) {
                            const yText_PX = viewport_PX.h - yText_UPX;
                            iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xTitleText_PX, yText_PX, 0.5 * Math.PI, text);
                        }
                    }
                    for (const divider of dividers) {
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (divider.axisFrac * axisViewport_PX.span);
                        const yDividerMin_UPX = Math.round(y_UPX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const yDividerMin_NDC = yUpwardPixelToNdc(viewport_PX.y, yDividerMin_UPX);
                        const yDividerMax_NDC = yDividerMin_NDC + (dividerWidth_PX * 2 / viewport_PX.h);
                        const nearestTickNum = findIndexNearest(majorTicks, y => axisBounds.valueToFrac(y) - divider.axisFrac);
                        const wTickText_PX = getTextWidth(hTextAtlas, tickTexts[nearestTickNum]);
                        const xDividerMax_PX = xTickTextRight_PX - wTickText_PX - spaceFromMarkToText_PX;
                        const xDividerMax_NDC = xPixelToNdc(viewport_PX.x, xDividerMax_PX);
                        const xDividerMin_NDC = -1.0;
                        iDivider = putAlignedBox(this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC);
                    }
                    for (let tickNum = 0; tickNum < majorTicks.length; tickNum++) {
                        const y_FRAC = axisBounds.valueToFrac(majorTicks[tickNum]);
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (y_FRAC * axisViewport_PX.span);
                        const yMarkMin_UPX = Math.round(y_UPX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const yMarkMin_NDC = yUpwardPixelToNdc(viewport_PX.y, yMarkMin_UPX);
                        const yMarkMax_NDC = yMarkMin_NDC + (markWidth_PX * 2 / viewport_PX.h);
                        const xMarkMax_NDC = xPixelToNdc(viewport_PX.x, xMarkRight_PX);
                        const xMarkMin_NDC = xMarkMax_NDC - (markLength_PX * 2 / viewport_PX.w);
                        iMark = putAlignedBox(this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC);
                        const text = tickTexts[tickNum];
                        const wText_PX = getTextWidth(hTextAtlas, text);
                        const xText_PX = xTickTextRight_PX - wText_PX;
                        const yText_UPX = yMarkMin_UPX + Math.round(0.5 * markWidth_PX - 0.5 * hTextAtlas.getMaxInnerAscent());
                        const yTextPref_PX = viewport_PX.h - yText_UPX;
                        
                        
                        const yText_PX = clamp(hTextAtlas.getMaxInnerAscent(), viewport_PX.h, yTextPref_PX);
                        iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xText_PX, yText_PX, 0, text);
                    }
                }
                else if (this.labelEdge === EAST) {
                    const xMarkLeft_PX = edgeOffset_PX;
                    const xTickText_PX = xMarkLeft_PX + markLength_PX + spaceFromMarkToText_PX;
                    const wDigits_PX = Math.max(0, ...tickTexts.map(tickText => { var _a; return ((_a = tickText.match(/[^+-.]/g)) !== null && _a !== void 0 ? _a : []).length; })) * getTextWidth(hTextAtlas, '0');
                    const wDecimalPoint_PX = (((_b = tickTexts[0]) === null || _b === void 0 ? void 0 : _b.includes('.')) ? getTextWidth(hTextAtlas, '.') : 0);
                    const wSign_PX = Math.max(getTextWidth(hTextAtlas, '-'), getTextWidth(hTextAtlas, '+'));
                    const wTickTextMax_PX = wDigits_PX + wDecimalPoint_PX + wSign_PX;
                    const xTitleText_PX = xTickText_PX + wTickTextMax_PX + spaceFromTextToTitle_PX + hTextAtlas.getMaxInnerAscent();
                    for (const title of titles) {
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (title.axisFrac * axisViewport_PX.span);
                        const text = title.text;
                        const textAlignFrac = numberOr(title.textAlignFrac, 0.5);
                        const hText_PX = getTextWidth(hTextAtlas, text);
                        const yTextPref_UPX = y_UPX - textAlignFrac * hText_PX;
                        const minAxisFrac = numberOr(title.minAxisFrac, 0);
                        const maxAxisFrac = numberOr(title.maxAxisFrac, 1);
                        const yTextMin_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (minAxisFrac * axisViewport_PX.span);
                        const yTextMax_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (maxAxisFrac * axisViewport_PX.span) - hText_PX;
                        const yText_UPX = Math.round(clamp(yTextMin_UPX, yTextMax_UPX, yTextPref_UPX) + tickOffsetEpsilon_PX);
                        if (yTextMin_UPX <= yText_UPX && yText_UPX <= yTextMax_UPX) {
                            const yText_PX = viewport_PX.h - yText_UPX;
                            iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xTitleText_PX, yText_PX, 0.5 * Math.PI, text);
                        }
                    }
                    for (const divider of dividers) {
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (divider.axisFrac * axisViewport_PX.span);
                        const yDividerMin_UPX = Math.round(y_UPX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const yDividerMin_NDC = yUpwardPixelToNdc(viewport_PX.y, yDividerMin_UPX);
                        const yDividerMax_NDC = yDividerMin_NDC + (dividerWidth_PX * 2 / viewport_PX.h);
                        const nearestTickNum = findIndexNearest(majorTicks, y => axisBounds.valueToFrac(y) - divider.axisFrac);
                        const wTickText_PX = getTextWidth(hTextAtlas, tickTexts[nearestTickNum]);
                        const xDividerMin_PX = xTickText_PX + wTickText_PX + spaceFromMarkToText_PX;
                        const xDividerMin_NDC = xPixelToNdc(viewport_PX.x, xDividerMin_PX);
                        const xDividerMax_NDC = +1.0;
                        iDivider = putAlignedBox(this.hCoords, iDivider, xDividerMin_NDC, xDividerMax_NDC, yDividerMin_NDC, yDividerMax_NDC);
                    }
                    for (let tickNum = 0; tickNum < majorTicks.length; tickNum++) {
                        const y_FRAC = axisBounds.valueToFrac(majorTicks[tickNum]);
                        const y_UPX = (axisViewport_PX.min - viewport_PX.yMin) + (y_FRAC * axisViewport_PX.span);
                        const yMarkMin_UPX = Math.round(y_UPX - 0.5 * markWidth_PX + tickOffsetEpsilon_PX);
                        const yMarkMin_NDC = yUpwardPixelToNdc(viewport_PX.y, yMarkMin_UPX);
                        const yMarkMax_NDC = yMarkMin_NDC + (markWidth_PX * 2 / viewport_PX.h);
                        const xMarkMin_NDC = xPixelToNdc(viewport_PX.x, xMarkLeft_PX);
                        const xMarkMax_NDC = xMarkMin_NDC + (markLength_PX * 2 / viewport_PX.w);
                        iMark = putAlignedBox(this.hCoords, iMark, xMarkMin_NDC, xMarkMax_NDC, yMarkMin_NDC, yMarkMax_NDC);
                        const text = tickTexts[tickNum];
                        const yText_UPX = yMarkMin_UPX + Math.round(0.5 * markWidth_PX - 0.5 * hTextAtlas.getMaxInnerAscent());
                        const yTextPref_PX = viewport_PX.h - yText_UPX;
                        
                        
                        const yText_PX = clamp(hTextAtlas.getMaxInnerAscent(), viewport_PX.h, yTextPref_PX);
                        iText = putTextCoords(hTextAtlas, this.hCoords, iText, viewport_PX, xTickText_PX, yText_PX, 0, text);
                    }
                }
                requireEqual(markCoordCount, iMark - iMark0);
                requireEqual(dividerCoordCount, iDivider - iDivider0);
                const textCoordCount = requireTrue(iText - iText0, atMost(maxTextCoordCount));
                const totalCoordCount = markCoordCount + dividerCoordCount + textCoordCount;
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, totalCoordCount);
                this.dCoordsInputs = coordsInputs;
                this.dMarkVertexCount = markCoordCount / 2;
                this.dDividerVertexCount = dividerCoordCount / 2;
                this.dTextVertexCount = textCoordCount / 4;
            }
            
            const drawText = (textVisible && this.dTextVertexCount >= 3);
            const drawMarks = (marksVisible && this.dMarkVertexCount >= 3);
            const drawDividers = (dividersVisible && this.dDividerVertexCount >= 3);
            if (drawText || drawMarks || drawDividers) {
                const markProg = context.getProgram(MARK_PROG_SOURCE);
                const textProg = context.getProgram(TEXT_PROG_SOURCE);
                enablePremultipliedAlphaBlending(gl);
                if (drawMarks) {
                    const { program, attribs, uniforms } = markProg;
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    try {
                        
                        gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                        glUniformRgba(gl, uniforms.RGBA, markColor);
                        gl.drawArrays(GL.TRIANGLES, 0, this.dMarkVertexCount);
                    }
                    finally {
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
                if (drawDividers) {
                    const { program, attribs, uniforms } = markProg;
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    try {
                        
                        gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 8 * this.dMarkVertexCount);
                        glUniformRgba(gl, uniforms.RGBA, dividerColor);
                        gl.drawArrays(GL.TRIANGLES, 0, this.dDividerVertexCount);
                    }
                    finally {
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
                if (drawText) {
                    const { program, attribs, uniforms } = textProg;
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    try {
                        
                        
                        gl.uniform1i(uniforms.ATLAS, 0);
                        
                        gl.vertexAttribPointer(attribs.inCoords, 4, GL.FLOAT, false, 0, 8 * (this.dMarkVertexCount + this.dDividerVertexCount));
                        glUniformRgba(gl, uniforms.RGBA, textColor);
                        gl.drawArrays(GL.TRIANGLES, 0, this.dTextVertexCount);
                    }
                    finally {
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dMarkVertexCount = 0;
        this.dTextVertexCount = 0;
    }
}

var fragShader_GLSL$7 = "#version 100\nprecision lowp float;\n\nuniform lowp sampler2D IMAGE;\nuniform vec4 RGBA;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    float mask = texture2D( IMAGE, vSt_FRAC ).r;\n    float alpha = mask * RGBA.a;\n    gl_FragColor = vec4( alpha*RGBA.rgb, alpha );\n}\n";

var vertShader_GLSL$7 = "#version 100\n\n\nconst int NORTH = 0;\nconst int SOUTH = 1;\nconst int EAST = 2;\nconst int WEST = 3;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat xMin( vec4 interval2D ) {\n    return interval2D.x;\n}\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform int EDGE;\n\nuniform vec2 AXIS_LIMITS;\nuniform vec2 AXIS_VIEWPORT_PX;\n\nuniform lowp sampler2D IMAGE;\nuniform vec2 IMAGE_SIZE_PX;\nuniform vec2 IMAGE_ANCHOR_PX;\n\n\n/**\n * Coords: tagCoord_AXIS, s_FRAC, t_FRAC\n */\nattribute vec3 inCoords;\n\n\nvarying vec2 vSt_FRAC;\n\n\nvoid main( ) {\n    float coord_ACOORD = inCoords.x;\n    float coord_AFRAC = ( coord_ACOORD - min1D( AXIS_LIMITS ) ) / span1D( AXIS_LIMITS );\n    float coord_APX = coord_AFRAC * span1D( AXIS_VIEWPORT_PX );\n\n    vec2 st_IFRAC = inCoords.yz;\n    vec2 tip_APX = vec2( 0.0, coord_APX );\n    vec2 corner_APX = floor( ( tip_APX - IMAGE_ANCHOR_PX ) + 0.5 );\n    vec2 xy_APX = corner_APX + ( st_IFRAC * vec2( IMAGE_SIZE_PX ) );\n\n    float x_VPX;\n    float y_VPX;\n    if ( EDGE == NORTH ) {\n        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;\n        y_VPX = xy_APX.x;\n    }\n    else if ( EDGE == SOUTH ) {\n        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;\n        y_VPX = ySpan( VIEWPORT_PX ) - xy_APX.x;\n    }\n    else if ( EDGE == EAST ) {\n        x_VPX = xy_APX.x;\n        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;\n    }\n    else {\n        x_VPX = xSpan( VIEWPORT_PX ) - xy_APX.x;\n        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;\n    }\n\n    vec2 xy_NDC = -1.0 + ( 2.0 * vec2( x_VPX, y_VPX ) )/span2D( VIEWPORT_PX );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n    vSt_FRAC = st_IFRAC;\n}\n";

const PROG_SOURCE$7 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$7,
    fragShader_GLSL: fragShader_GLSL$7,
    uniformNames: [
        'EDGE',
        'AXIS_LIMITS',
        'AXIS_VIEWPORT_PX',
        'VIEWPORT_PX',
        'IMAGE',
        'IMAGE_SIZE_PX',
        'IMAGE_ANCHOR_PX',
        'RGBA',
    ],
    attribNames: [
        'inCoords',
    ],
});
class CoordsInputs$3 extends ValueBase2 {
    constructor(tagCoords) {
        super();
        this.tagCoords = tagCoords;
    }
}
class ImageInputs extends ValueBase2 {
    constructor(tagWidth_PX, tagHeight_PX, tagLineWidth_PX) {
        super();
        this.tagWidth_PX = tagWidth_PX;
        this.tagHeight_PX = tagHeight_PX;
        this.tagLineWidth_PX = tagLineWidth_PX;
    }
}

const canvas = document.createElement('canvas');
const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));

function createTagImage(inputs) {
    
    const border = 1;
    
    const tipMiterMargin = 1;
    const wTag = inputs.tagWidth_PX;
    const hTag = inputs.tagHeight_PX;
    const lineWidth = inputs.tagLineWidth_PX;
    const wTotal = Math.ceil(tipMiterMargin + wTag + lineWidth) + 2 * border;
    const hTotal = Math.ceil(hTag + lineWidth) + 2 * border;
    if (canvas.width < wTotal || canvas.height < hTotal) {
        canvas.width = wTotal;
        canvas.height = hTotal;
    }
    g.fillStyle = '#000000';
    g.fillRect(0, 0, wTotal, hTotal);
    const xLeft = border + tipMiterMargin + 0.5 * lineWidth;
    const xMid = xLeft + 0.5 * wTag;
    const xRight = xLeft + wTag;
    const yMid = 0.5 * hTotal;
    const yTop = yMid - 0.5 * hTag;
    const yBottom = yMid + 0.5 * hTag;
    g.beginPath();
    g.moveTo(xLeft, yMid);
    g.lineTo(xMid, yTop);
    g.lineTo(xRight, yTop);
    g.lineTo(xRight, yBottom);
    g.lineTo(xMid, yBottom);
    g.closePath();
    g.globalAlpha = 0.3;
    g.fillStyle = '#FFFFFF';
    g.fill();
    g.globalAlpha = 1.0;
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = lineWidth;
    g.stroke();
    return {
        xAnchor: border,
        yAnchor: yMid,
        border,
        imageData: g.getImageData(0, 0, wTotal, hTotal)
    };
}
class TagsPainter {
    constructor(axis, tagsEdge, tagCoordsFn = frozenSupplier([])) {
        this.peer = createDomPeer('tags-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.tagColor = StyleProp.create(this.style, '--color', cssColor, 'rgb(0,0,0)');
        this.tagWidth_LPX = StyleProp.create(this.style, '--tag-width-px', cssFloat, 15);
        this.tagHeight_LPX = StyleProp.create(this.style, '--tag-height-px', cssFloat, 11);
        this.tagLineWidth_LPX = StyleProp.create(this.style, '--outline-width-px', cssFloat, 2);
        this.edgeOffset_LPX = StyleProp.create(this.style, '--edge-offset-px', cssFloat, 0);
        this.visible = new RefBasic(true, tripleEquals);
        this.axis = axis;
        this.tagsEdge = tagsEdge;
        this.tagCoordsFn = tagCoordsFn;
        this.hCoords = new Float32Array(0);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
        this.dImage = null;
        this.dImageSize_PX = Point2D.ZERO;
        this.dImageAnchor_PX = Point2D.ZERO;
        this.dImageInputs = null;
    }
    paint(context, viewport_PX) {
        const tagColor = this.tagColor.get();
        const tagWidth_LPX = this.tagWidth_LPX.get();
        const tagHeight_LPX = this.tagHeight_LPX.get();
        const tagLineWidth_LPX = this.tagLineWidth_LPX.get();
        const edgeOffset_LPX = this.edgeOffset_LPX.get();
        
        const dpr = currentDpr(this);
        const tagWidth_PX = Math.round(tagWidth_LPX * dpr);
        const tagHeight_PX = Math.round(tagHeight_LPX * dpr);
        const tagLineWidth_PX = Math.round(tagLineWidth_LPX * dpr);
        const edgeOffset_PX = Math.round(edgeOffset_LPX * dpr);
        const visible = (tagColor.a > 0 && (tagLineWidth_PX > 0 || (tagWidth_PX > 0 && tagHeight_PX > 0)));
        if (visible) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
                this.dImage = gl.createTexture();
                this.dImageSize_PX = Point2D.ZERO;
                this.dImageAnchor_PX = Point2D.ZERO;
                this.dImageInputs = null;
            }
            
            gl.activeTexture(GL.TEXTURE0);
            gl.bindTexture(GL.TEXTURE_2D, this.dImage);
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            const imageInputs = new ImageInputs(tagWidth_PX, tagHeight_PX, tagLineWidth_PX);
            
            if (!equal(imageInputs, this.dImageInputs)) {
                
                gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
                gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
                gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
                gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
                const hImage = createTagImage(imageInputs);
                const hPixels = hImage.imageData;
                gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, GL.LUMINANCE, GL.UNSIGNED_BYTE, hPixels);
                this.dImageSize_PX = new Point2D(hImage.imageData.width, hImage.imageData.height);
                this.dImageAnchor_PX = new Point2D(hImage.xAnchor, hImage.yAnchor);
                this.dImageInputs = imageInputs;
            }
            
            const tagCoords = [];
            const axisBounds = this.axis.bounds;
            for (const tagCoord of this.tagCoordsFn()) {
                if (axisBounds.containsPoint(tagCoord)) {
                    tagCoords.push(tagCoord);
                }
            }
            const numVertices = 6 * tagCoords.length;
            const coordsInputs = new CoordsInputs$3(tagCoords);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                const numCoords = 3 * numVertices;
                this.hCoords = ensureHostBufferCapacity(this.hCoords, numCoords);
                let i = 0;
                for (const tagCoord of tagCoords) {
                    i = put3f(this.hCoords, i, tagCoord, 0, 1);
                    i = put3f(this.hCoords, i, tagCoord, 0, 0);
                    i = put3f(this.hCoords, i, tagCoord, 1, 1);
                    i = put3f(this.hCoords, i, tagCoord, 1, 1);
                    i = put3f(this.hCoords, i, tagCoord, 0, 0);
                    i = put3f(this.hCoords, i, tagCoord, 1, 0);
                }
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords);
                this.dCoordsInputs = coordsInputs;
            }
            
            if (numVertices > 0) {
                const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$7);
                enablePremultipliedAlphaBlending(gl);
                gl.useProgram(program);
                gl.enableVertexAttribArray(attribs.inCoords);
                try {
                    
                    
                    gl.uniform1i(uniforms.IMAGE, 0);
                    gl.uniform2f(uniforms.IMAGE_SIZE_PX, this.dImageSize_PX.x, this.dImageSize_PX.y);
                    gl.uniform2f(uniforms.IMAGE_ANCHOR_PX, this.dImageAnchor_PX.x - edgeOffset_PX, this.dImageAnchor_PX.y);
                    
                    gl.vertexAttribPointer(attribs.inCoords, 3, GL.FLOAT, false, 0, 0);
                    glUniformEdge(gl, uniforms.EDGE, this.tagsEdge);
                    glUniformInterval1D(gl, uniforms.AXIS_LIMITS, axisBounds);
                    glUniformInterval1D(gl, uniforms.AXIS_VIEWPORT_PX, this.axis.viewport_PX);
                    glUniformInterval2D(gl, uniforms.VIEWPORT_PX, viewport_PX);
                    glUniformRgba(gl, uniforms.RGBA, tagColor);
                    gl.drawArrays(GL.TRIANGLES, 0, numVertices);
                }
                finally {
                    gl.disableVertexAttribArray(attribs.inCoords);
                    gl.useProgram(null);
                }
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

var fragShader_GLSL$6 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$6 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

const PROG_SOURCE$6 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$6,
    fragShader_GLSL: fragShader_GLSL$6,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});
class CoordsInputs$2 extends ValueBase2 {
    constructor(xMajors_AXIS, xMinors_AXIS, yMajors_AXIS, yMinors_AXIS, xBounds_AXIS, yBounds_AXIS, xAxisViewport_PX, yAxisViewport_PX, viewport_PX, majorWidth_PX, minorWidth_PX) {
        super();
        this.xMajors_AXIS = xMajors_AXIS;
        this.xMinors_AXIS = xMinors_AXIS;
        this.yMajors_AXIS = yMajors_AXIS;
        this.yMinors_AXIS = yMinors_AXIS;
        this.xBounds_AXIS = xBounds_AXIS;
        this.yBounds_AXIS = yBounds_AXIS;
        this.xAxisViewport_PX = xAxisViewport_PX;
        this.yAxisViewport_PX = yAxisViewport_PX;
        this.viewport_PX = viewport_PX;
        this.majorWidth_PX = majorWidth_PX;
        this.minorWidth_PX = minorWidth_PX;
    }
}
class GridPainter {
    constructor(a, b, c, d) {
        var _a, _b, _c, _d;
        this.peer = createDomPeer('grid-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.majorColor = StyleProp.create(this.style, '--major-color', cssColor, 'rgb(0,0,0)');
        this.minorColor = StyleProp.create(this.style, '--minor-color', cssColor, 'rgb(0,0,0)');
        this.majorWidth_LPX = StyleProp.create(this.style, '--major-width-px', cssFloat, 1);
        this.minorWidth_LPX = StyleProp.create(this.style, '--minor-width-px', cssFloat, 1);
        this.visible = new RefBasic(true, tripleEquals);
        if (d === undefined) {
            this.xAxis = a.x;
            this.yAxis = a.y;
            this.xTicker = (_a = b) !== null && _a !== void 0 ? _a : new NullTicker();
            this.yTicker = (_b = c) !== null && _b !== void 0 ? _b : new NullTicker();
        }
        else {
            this.xAxis = a;
            this.yAxis = b;
            this.xTicker = (_c = c) !== null && _c !== void 0 ? _c : new NullTicker();
            this.yTicker = (_d = d) !== null && _d !== void 0 ? _d : new NullTicker();
        }
        this.hCoords = new Float32Array(0);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
    paint(context, viewport_PX) {
        
        const majorColor = this.majorColor.get();
        const minorColor = this.minorColor.get();
        const majorWidth_LPX = this.majorWidth_LPX.get();
        const minorWidth_LPX = this.minorWidth_LPX.get();
        
        const dpr = currentDpr(this);
        const majorWidth_PX = Math.round(majorWidth_LPX * dpr);
        const minorWidth_PX = Math.round(minorWidth_LPX * dpr);
        const majorsVisible = (majorColor.a > 0 && majorWidth_PX > 0);
        const minorsVisible = (minorColor.a > 0 && minorWidth_PX > 0);
        if (majorsVisible || minorsVisible) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
            }
            
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            const { majorTicks: xMajors_AXIS, minorTicks: xMinors_AXIS } = this.xTicker.getTicks(this.xAxis);
            const { majorTicks: yMajors_AXIS, minorTicks: yMinors_AXIS } = this.yTicker.getTicks(this.yAxis);
            const xBounds_AXIS = this.xAxis && this.xAxis.bounds;
            const yBounds_AXIS = this.yAxis && this.yAxis.bounds;
            const xAxisViewport_PX = this.xAxis && this.xAxis.viewport_PX;
            const yAxisViewport_PX = this.yAxis && this.yAxis.viewport_PX;
            const majorVertexCount = 6 * (xMajors_AXIS.length + yMajors_AXIS.length);
            const minorVertexCount = 6 * (xMinors_AXIS.length + yMinors_AXIS.length);
            const coordsInputs = new CoordsInputs$2(xMajors_AXIS, xMinors_AXIS, yMajors_AXIS, yMinors_AXIS, xBounds_AXIS, yBounds_AXIS, xAxisViewport_PX, yAxisViewport_PX, viewport_PX, majorWidth_PX, minorWidth_PX);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                const numCoords = 2 * (majorVertexCount + minorVertexCount);
                this.hCoords = ensureHostBufferCapacity(this.hCoords, numCoords);
                let i = 0;
                i = putVerticalLines(this.hCoords, i, viewport_PX, majorWidth_PX, tickOffsetEpsilon_PX, this.xAxis, xMajors_AXIS);
                i = putHorizontalLines(this.hCoords, i, viewport_PX, majorWidth_PX, tickOffsetEpsilon_PX, this.yAxis, yMajors_AXIS);
                i = putVerticalLines(this.hCoords, i, viewport_PX, minorWidth_PX, tickOffsetEpsilon_PX, this.xAxis, xMinors_AXIS);
                i = putHorizontalLines(this.hCoords, i, viewport_PX, minorWidth_PX, tickOffsetEpsilon_PX, this.yAxis, yMinors_AXIS);
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords);
                this.dCoordsInputs = coordsInputs;
            }
            
            const drawMajors = (majorsVisible && majorVertexCount >= 3);
            const drawMinors = (minorsVisible && minorVertexCount >= 3);
            if (drawMajors || drawMinors) {
                if ((drawMajors && majorColor.a < 1) || (drawMinors && minorColor.a < 1)) {
                    enablePremultipliedAlphaBlending(gl);
                }
                else {
                    disableBlending(gl);
                }
                const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$6);
                gl.useProgram(program);
                gl.enableVertexAttribArray(attribs.inCoords);
                try {
                    
                    gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                    if (drawMinors) {
                        glUniformRgba(gl, uniforms.RGBA, minorColor);
                        gl.drawArrays(GL.TRIANGLES, majorVertexCount, minorVertexCount);
                    }
                    if (drawMajors) {
                        glUniformRgba(gl, uniforms.RGBA, majorColor);
                        gl.drawArrays(GL.TRIANGLES, 0, majorVertexCount);
                    }
                }
                finally {
                    gl.disableVertexAttribArray(attribs.inCoords);
                    gl.useProgram(null);
                }
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

var fragShader_GLSL$5 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$5 = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform vec4 AXIS_VIEWPORT_PX;\n\n\n/**\n * Coords: xBase_XFRAC, yBase_YFRAC, xOffset_PX, yOffset_PX\n */\nattribute vec4 inCoords;\n\n\nvoid main( ) {\n    vec2 base_AFRAC = inCoords.xy;\n    vec2 base_APX = base_AFRAC * span2D( AXIS_VIEWPORT_PX );\n    vec2 base_VPX = min2D( AXIS_VIEWPORT_PX ) - min2D( VIEWPORT_PX ) + base_APX;\n\n    vec2 offset_PX = inCoords.zw;\n    vec2 final_VPX = base_VPX + offset_PX;\n    vec2 final_NDC = -1.0 + ( 2.0 * final_VPX )/span2D( VIEWPORT_PX );\n    gl_Position = vec4( final_NDC, 0.0, 1.0 );\n}\n";

const PROG_SOURCE$5 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$5,
    fragShader_GLSL: fragShader_GLSL$5,
    uniformNames: [
        'VIEWPORT_PX',
        'AXIS_VIEWPORT_PX',
        'RGBA',
    ],
    attribNames: [
        'inCoords',
    ],
});
class CoordsInputs$1 extends ValueBase2 {
    constructor(width_PX) {
        super();
        this.width_PX = width_PX;
    }
}
class PlotBorderPainter {
    constructor(axisViewportFn_PX) {
        this.peer = createDomPeer('plot-border-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(0,0,0)');
        this.width_LPX = StyleProp.create(this.style, '--width-px', cssFloat, 1);
        this.visible = new RefBasic(true, tripleEquals);
        this.axisViewportFn_PX = axisViewportFn_PX;
        this.hCoords = new Float32Array(0);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
    paint(context, viewport_PX) {
        const color = this.color.get();
        const width_LPX = this.width_LPX.get();
        const dpr = currentDpr(this);
        const width_PX = Math.round(width_LPX * dpr);
        if (width_PX > 0 && color.a > 0) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
            }
            
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            const numVertices = 24;
            const coordsInputs = new CoordsInputs$1(width_PX);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                const numCoords = 4 * numVertices;
                this.hCoords = ensureHostBufferCapacity(this.hCoords, numCoords);
                const outward_PX = width_PX >> 1;
                const inward_PX = width_PX - outward_PX;
                let i = 0;
                
                i = put4f(this.hCoords, i, 0, 1, +inward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 0, 1, +inward_PX, -inward_PX);
                i = put4f(this.hCoords, i, 1, 1, +outward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 1, 1, +outward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 0, 1, +inward_PX, -inward_PX);
                i = put4f(this.hCoords, i, 1, 1, +outward_PX, -inward_PX);
                
                i = put4f(this.hCoords, i, 1, 1, -inward_PX, -inward_PX);
                i = put4f(this.hCoords, i, 1, 0, -inward_PX, -outward_PX);
                i = put4f(this.hCoords, i, 1, 1, +outward_PX, -inward_PX);
                i = put4f(this.hCoords, i, 1, 1, +outward_PX, -inward_PX);
                i = put4f(this.hCoords, i, 1, 0, -inward_PX, -outward_PX);
                i = put4f(this.hCoords, i, 1, 0, +outward_PX, -outward_PX);
                
                i = put4f(this.hCoords, i, 0, 0, -outward_PX, +inward_PX);
                i = put4f(this.hCoords, i, 0, 0, -outward_PX, -outward_PX);
                i = put4f(this.hCoords, i, 1, 0, -inward_PX, +inward_PX);
                i = put4f(this.hCoords, i, 1, 0, -inward_PX, +inward_PX);
                i = put4f(this.hCoords, i, 0, 0, -outward_PX, -outward_PX);
                i = put4f(this.hCoords, i, 1, 0, -inward_PX, -outward_PX);
                
                i = put4f(this.hCoords, i, 0, 1, -outward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 0, 0, -outward_PX, +inward_PX);
                i = put4f(this.hCoords, i, 0, 1, +inward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 0, 1, +inward_PX, +outward_PX);
                i = put4f(this.hCoords, i, 0, 0, -outward_PX, +inward_PX);
                i = put4f(this.hCoords, i, 0, 0, +inward_PX, +inward_PX);
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords);
                this.dCoordsInputs = coordsInputs;
            }
            
            {
                if (color.a < 1) {
                    enablePremultipliedAlphaBlending(gl);
                }
                else {
                    disableBlending(gl);
                }
                const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$5);
                gl.useProgram(program);
                gl.enableVertexAttribArray(attribs.inCoords);
                try {
                    
                    gl.vertexAttribPointer(attribs.inCoords, 4, GL.FLOAT, false, 0, 0);
                    glUniformInterval2D(gl, uniforms.VIEWPORT_PX, viewport_PX);
                    glUniformInterval2D(gl, uniforms.AXIS_VIEWPORT_PX, this.axisViewportFn_PX());
                    glUniformRgba(gl, uniforms.RGBA, color);
                    gl.drawArrays(GL.TRIANGLES, 0, numVertices);
                }
                finally {
                    gl.disableVertexAttribArray(attribs.inCoords);
                    gl.useProgram(null);
                }
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
}

class BarAxisPainter {
    constructor(axis, labelEdge, createTicker, tagCoordsFn = frozenSupplier([]), barPainters = [], textAtlasCache) {
        this.peer = createDomPeer('bar-axis-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.edgeOffset_LPX = StyleProp.create(this.style, '--edge-offset-px', cssFloat, 10);
        this.barWidth_LPX = StyleProp.create(this.style, '--bar-width-px', cssFloat, 11);
        this.visible = new RefBasic(true, tripleEquals);
        this.axis = axis;
        this.labelEdge = labelEdge;
        this.labelsPainter = new AxisPainter(this.axis, labelEdge, createTicker, textAtlasCache);
        appendChild(this.peer, this.labelsPainter.peer);
        this.tagsPainter = new TagsPainter(axis, getOppositeEdge(labelEdge), tagCoordsFn);
        appendChild(this.peer, this.tagsPainter.peer);
        this.borderPainter = new PlotBorderPainter(frozenSupplier(Interval2D.ZERO));
        appendChild(this.peer, this.borderPainter.peer);
        this.barPainters = new ArrayWithZIndices();
        this.barBackgroundPainter = new FillPainter();
        this.barBackgroundPainter.peer.classList.add('background');
        this.addBarPainter(this.barBackgroundPainter, -1e3);
        const axisIsVertical = (this.labelEdge === EAST || this.labelEdge === WEST);
        const gridPainter = (axisIsVertical
            ? new GridPainter(null, this.axis, null, this.labelsPainter.ticker)
            : new GridPainter(this.axis, null, this.labelsPainter.ticker, null));
        this.addBarPainter(gridPainter, +1e3);
        for (const painter of barPainters) {
            this.addBarPainter(painter);
        }
        this.recentTagsMouseArea_PX = Interval2D.ZERO;
    }
    get ticker() {
        return this.labelsPainter.ticker;
    }
    set tagCoordsFn(tagCoordsFn) {
        this.tagsPainter.tagCoordsFn = tagCoordsFn;
    }
    addBarPainter(painter, zIndex = 0) {
        const disposers = new DisposerGroup();
        disposers.add(appendChild(this.peer, painter.peer));
        disposers.add(this.barPainters.add(painter, zIndex));
        return disposers;
    }
    setBarPainterZIndex(painter, zIndex) {
        this.barPainters.setZIndex(painter, zIndex);
    }
    hasBarPainter(painter) {
        return this.barPainters.has(painter);
    }
    getBarPainterZIndex(painter) {
        return this.barPainters.getZIndex(painter);
    }
    
    hasPainter(painter) {
        switch (painter) {
            case this.labelsPainter: return true;
            case this.tagsPainter: return true;
            case this.borderPainter: return true;
            case this.barBackgroundPainter: return true;
            default: return this.hasBarPainter(painter);
        }
    }
    
    getPainterZIndex(painter) {
        return (this.hasBarPainter(painter) ? this.getBarPainterZIndex(painter) : undefined);
    }
    get tagsMouseArea_PX() {
        return this.recentTagsMouseArea_PX;
    }
    getPrefSize_PX() {
        const edgeOffset_LPX = this.edgeOffset_LPX.get();
        const barWidth_LPX = this.barWidth_LPX.get();
        const dpr = currentDpr(this);
        const edgeOffset_PX = Math.round(edgeOffset_LPX * dpr);
        const barWidth_PX = Math.round(barWidth_LPX * dpr);
        if (this.labelEdge === NORTH || this.labelEdge === SOUTH) {
            const prefHeight_PX = edgeOffset_PX + barWidth_PX + this.labelsPainter.getPrefSize_PX().h;
            return new Size2D(0, prefHeight_PX);
        }
        else {
            const prefWidth_PX = edgeOffset_PX + barWidth_PX + this.labelsPainter.getPrefSize_PX().w;
            return new Size2D(prefWidth_PX, 0);
        }
    }
    paint(context, viewport_PX) {
        const gl = context.gl;
        try {
            const edgeOffset_LPX = this.edgeOffset_LPX.get();
            const barWidth_LPX = this.barWidth_LPX.get();
            const dpr = currentDpr(this);
            const edgeOffset_PX = Math.round(edgeOffset_LPX * dpr);
            const barWidth_PX = Math.round(barWidth_LPX * dpr);
            let barViewport_PX;
            let labelsViewport_PX;
            let tagsViewport_PX;
            let tagsMouseArea_PX;
            switch (this.labelEdge) {
                case NORTH:
                    barViewport_PX = Interval2D.fromEdges(this.axis.viewport_PX.min, this.axis.viewport_PX.max, viewport_PX.y.min + edgeOffset_PX, viewport_PX.y.min + (edgeOffset_PX + barWidth_PX));
                    labelsViewport_PX = viewport_PX.withYEdges(barViewport_PX.yMax, viewport_PX.yMax);
                    tagsViewport_PX = viewport_PX.withYEdges(viewport_PX.yMin, barViewport_PX.yMax);
                    tagsMouseArea_PX = tagsViewport_PX.withXEdges(barViewport_PX.xMin, barViewport_PX.xMax);
                    break;
                case SOUTH:
                    barViewport_PX = Interval2D.fromEdges(this.axis.viewport_PX.min, this.axis.viewport_PX.max, viewport_PX.y.max - (edgeOffset_PX + barWidth_PX), viewport_PX.y.max - edgeOffset_PX);
                    labelsViewport_PX = viewport_PX.withYEdges(viewport_PX.yMin, barViewport_PX.yMin);
                    tagsViewport_PX = viewport_PX.withYEdges(barViewport_PX.yMin, viewport_PX.yMax);
                    tagsMouseArea_PX = tagsViewport_PX.withXEdges(barViewport_PX.xMin, barViewport_PX.xMax);
                    break;
                case EAST:
                    barViewport_PX = Interval2D.fromEdges(viewport_PX.x.min + edgeOffset_PX, viewport_PX.x.min + (edgeOffset_PX + barWidth_PX), this.axis.viewport_PX.min, this.axis.viewport_PX.max);
                    labelsViewport_PX = viewport_PX.withXEdges(barViewport_PX.xMax, viewport_PX.xMax);
                    tagsViewport_PX = viewport_PX.withXEdges(viewport_PX.xMin, barViewport_PX.xMax);
                    tagsMouseArea_PX = tagsViewport_PX.withYEdges(barViewport_PX.yMin, barViewport_PX.yMax);
                    break;
                case WEST:
                    barViewport_PX = Interval2D.fromEdges(viewport_PX.x.max - (edgeOffset_PX + barWidth_PX), viewport_PX.x.max - edgeOffset_PX, this.axis.viewport_PX.min, this.axis.viewport_PX.max);
                    labelsViewport_PX = viewport_PX.withXEdges(viewport_PX.xMin, barViewport_PX.xMin);
                    tagsViewport_PX = viewport_PX.withXEdges(barViewport_PX.xMin, viewport_PX.xMax);
                    tagsMouseArea_PX = tagsViewport_PX.withYEdges(barViewport_PX.yMin, barViewport_PX.yMax);
                    break;
                default:
                    throw new Error('Unrecognized edge: ' + this.labelEdge);
            }
            if (barViewport_PX.w > 0 && barViewport_PX.h > 0) {
                glViewport(gl, barViewport_PX);
                for (const barPainter of this.barPainters) {
                    barPainter.paint(context, barViewport_PX);
                }
            }
            if (viewport_PX.w > 0 && viewport_PX.h > 0) {
                glViewport(gl, viewport_PX);
                this.borderPainter.axisViewportFn_PX = frozenSupplier(barViewport_PX);
                this.borderPainter.paint(context, viewport_PX);
            }
            if (labelsViewport_PX.w > 0 && labelsViewport_PX.h > 0) {
                glViewport(gl, labelsViewport_PX);
                this.labelsPainter.paint(context, labelsViewport_PX);
            }
            if (tagsViewport_PX.w > 0 && tagsViewport_PX.h > 0) {
                glViewport(gl, tagsViewport_PX);
                this.tagsPainter.paint(context, tagsViewport_PX);
            }
            this.recentTagsMouseArea_PX = tagsMouseArea_PX;
        }
        finally {
            glViewport(gl, viewport_PX);
        }
    }
    dispose(context) {
        this.labelsPainter.dispose(context);
        this.tagsPainter.dispose(context);
        for (const barPainter of this.barPainters) {
            barPainter.dispose(context);
        }
        this.barPainters.clear();
    }
}

var fillFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\n\nvoid main( ) {\n    float alpha = COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var fillVertShader_GLSL = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 AXIS_LIMITS;\n\n/**\n * Coords: x, y\n */\nattribute vec2 inCoords;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

var lineFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    float featherMask = smoothstep( 0.5*( THICKNESS_PX + FEATHER_PX ), 0.5*( THICKNESS_PX - FEATHER_PX ), abs( vLateral_PX ) );\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var lineVertShader_GLSL = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nuniform vec4 AXIS_LIMITS;\nuniform vec4 AXIS_VIEWPORT_PX;\nuniform lowp float THICKNESS_PX;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x, y, dxForward (unnormalized), dyForward (unnormalized)\n */\nattribute vec4 inCoords;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    vec2 xy_FRAC = ( xy_XYAXIS - min2D( AXIS_LIMITS ) ) / span2D( AXIS_LIMITS );\n    vec2 xy_PX = xy_FRAC * span2D( AXIS_VIEWPORT_PX );\n\n    vec2 dxyForward_XYAXIS = inCoords.zw;\n    vec2 dxyForward_FRAC = dxyForward_XYAXIS / span2D( AXIS_LIMITS );\n    vec2 dxyForward_PX = dxyForward_FRAC * span2D( AXIS_VIEWPORT_PX );\n    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );\n    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );\n\n    vec2 xyFinal_PX = xy_PX + 0.5*( THICKNESS_PX + FEATHER_PX )*dxyRightUnit_PX;\n    vec2 xyFinal_NDC = -1.0 + 2.0*( xyFinal_PX / span2D( AXIS_VIEWPORT_PX ) );\n\n    gl_Position = vec4( xyFinal_NDC, 0.0, 1.0 );\n\n    bool negativeLateral = ( dxyForward_XYAXIS.x < 0.0 || ( dxyForward_XYAXIS.x == 0.0 && dxyForward_XYAXIS.y < 0.0 ) );\n    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );\n}\n";

var pointFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform float FEATHER_PX;\n\nvarying float vDiameter_PX;\nvarying vec4 vColor;\n\nvoid main( ) {\n    vec2 xy_PX = ( gl_PointCoord - 0.5 )*( vDiameter_PX + FEATHER_PX );\n    float r_PX = sqrt( dot( xy_PX, xy_PX ) );\n\n    float rOuter_PX = 0.5*( vDiameter_PX + FEATHER_PX );\n    float rInner_PX = 0.5*( vDiameter_PX - FEATHER_PX );\n    float featherMask = smoothstep( rOuter_PX, rInner_PX, r_PX );\n\n    float alpha = featherMask * vColor.a;\n    gl_FragColor = vec4( alpha*vColor.rgb, alpha );\n}\n";

var pointVertShader_GLSL = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 AXIS_LIMITS;\n\n/**\n * xMin, xMax, yMin, yMax\n */\nuniform vec4 DATA_CLAMP_LIMITS;\n\nuniform lowp float JOIN_DIAMETER_PX;\nuniform lowp float DATA_DIAMETER_PX;\nuniform lowp float DATA_CLAMPED_DIAMETER_PX;\nuniform lowp vec4 JOIN_COLOR;\nuniform lowp vec4 DATA_COLOR;\nuniform lowp vec4 DATA_CLAMPED_COLOR;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x, y, isData\n */\nattribute vec3 inCoords;\n\nvarying float vDiameter_PX;\nvarying vec4 vColor;\n\n\nvoid main( ) {\n    bool isData = ( inCoords.z >= 0.5 );\n\n    vec2 xy_XYAXIS;\n    if ( isData ) {\n        xy_XYAXIS = clamp( inCoords.xy, DATA_CLAMP_LIMITS.xz, DATA_CLAMP_LIMITS.yw );\n        bool isClamped = ( xy_XYAXIS != inCoords.xy );\n        vDiameter_PX = ( isClamped ? DATA_CLAMPED_DIAMETER_PX : DATA_DIAMETER_PX );\n        vColor = ( isClamped ? DATA_CLAMPED_COLOR : DATA_COLOR );\n    }\n    else {\n        xy_XYAXIS = inCoords.xy;\n        vDiameter_PX = JOIN_DIAMETER_PX;\n        vColor = JOIN_COLOR;\n    }\n\n    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n    gl_PointSize = vDiameter_PX + FEATHER_PX;\n}\n";

Object.freeze({
    vertShader_GLSL: fillVertShader_GLSL,
    fragShader_GLSL: fillFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'COLOR',
    ],
    attribNames: [
        'inCoords',
    ],
});
Object.freeze({
    vertShader_GLSL: lineVertShader_GLSL,
    fragShader_GLSL: lineFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'AXIS_VIEWPORT_PX',
        'THICKNESS_PX',
        'FEATHER_PX',
        'COLOR',
    ],
    attribNames: [
        'inCoords',
    ],
});
Object.freeze({
    vertShader_GLSL: pointVertShader_GLSL,
    fragShader_GLSL: pointFragShader_GLSL,
    uniformNames: [
        'AXIS_LIMITS',
        'DATA_CLAMP_LIMITS',
        'FEATHER_PX',
        'JOIN_DIAMETER_PX',
        'DATA_DIAMETER_PX',
        'DATA_CLAMPED_DIAMETER_PX',
        'JOIN_COLOR',
        'DATA_COLOR',
        'DATA_CLAMPED_COLOR',
    ],
    attribNames: [
        'inCoords',
    ],
});
var BasicLineLineMode;
(function (BasicLineLineMode) {
    
    BasicLineLineMode[BasicLineLineMode["OFF"] = 0] = "OFF";
    
    BasicLineLineMode[BasicLineLineMode["STRAIGHT"] = 1] = "STRAIGHT";
    
    BasicLineLineMode[BasicLineLineMode["STEP_UP_DOWN"] = 2] = "STEP_UP_DOWN";
    
    BasicLineLineMode[BasicLineLineMode["STEP_LEFT_RIGHT"] = 3] = "STEP_LEFT_RIGHT";
})(BasicLineLineMode || (BasicLineLineMode = {}));
var BasicLineRiserMode;
(function (BasicLineRiserMode) {
    BasicLineRiserMode[BasicLineRiserMode["OFF"] = 0] = "OFF";
    BasicLineRiserMode[BasicLineRiserMode["ON"] = 1] = "ON";
})(BasicLineRiserMode || (BasicLineRiserMode = {}));
var BasicLineOffscreenDataIndicator;
(function (BasicLineOffscreenDataIndicator) {
    BasicLineOffscreenDataIndicator[BasicLineOffscreenDataIndicator["OFF"] = 0] = "OFF";
    BasicLineOffscreenDataIndicator[BasicLineOffscreenDataIndicator["ON"] = 1] = "ON";
    BasicLineOffscreenDataIndicator[BasicLineOffscreenDataIndicator["MIN"] = 2] = "MIN";
    BasicLineOffscreenDataIndicator[BasicLineOffscreenDataIndicator["MAX"] = 3] = "MAX";
})(BasicLineOffscreenDataIndicator || (BasicLineOffscreenDataIndicator = {}));
var BasicLineStepAlign;
(function (BasicLineStepAlign) {
    BasicLineStepAlign[BasicLineStepAlign["BEFORE_DATAPOINT"] = 0] = "BEFORE_DATAPOINT";
    BasicLineStepAlign[BasicLineStepAlign["CENTERED_ON_DATAPOINT"] = 1] = "CENTERED_ON_DATAPOINT";
    BasicLineStepAlign[BasicLineStepAlign["AFTER_DATAPOINT"] = 2] = "AFTER_DATAPOINT";
})(BasicLineStepAlign || (BasicLineStepAlign = {}));
var BasicLineDotMode;
(function (BasicLineDotMode) {
    
    BasicLineDotMode[BasicLineDotMode["OFF"] = 0] = "OFF";
    
    BasicLineDotMode[BasicLineDotMode["ALL"] = 1] = "ALL";
    
    BasicLineDotMode[BasicLineDotMode["SOLO"] = 2] = "SOLO";
})(BasicLineDotMode || (BasicLineDotMode = {}));
var BasicLineFillMode;
(function (BasicLineFillMode) {
    BasicLineFillMode[BasicLineFillMode["OFF"] = 0] = "OFF";
    BasicLineFillMode[BasicLineFillMode["VERTICAL"] = 1] = "VERTICAL";
    BasicLineFillMode[BasicLineFillMode["HORIZONTAL"] = 2] = "HORIZONTAL";
})(BasicLineFillMode || (BasicLineFillMode = {}));

var fragShader_GLSL$4 = "#version 100\nprecision lowp float;\n\nvarying vec4 vColor;\n\nvoid main( ) {\n    gl_FragColor = vec4( vColor.a * vColor.rgb, vColor.a );\n}\n";

var vertShader_GLSL$4 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\n/**\n * Color: r, g, b, a\n */\nattribute vec4 inColor;\n\nvarying vec4 vColor;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    vColor = inColor;\n}\n";

Object.freeze({
    vertShader_GLSL: vertShader_GLSL$4,
    fragShader_GLSL: fragShader_GLSL$4,
    attribNames: ['inCoords', 'inColor'],
});

var fragShader_GLSL$3 = "#version 100\nprecision lowp float;\n\nuniform sampler2D COLOR_TABLE;\n\nvarying float vColorTableFrac;\n\nvoid main( ) {\n    vec4 rgba = texture2D( COLOR_TABLE, vec2( vColorTableFrac, 0.0 ) );\n    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n}\n";

var vertShader_GLSL$3 = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToNdc1D( float frac ) {\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform int AXIS_IS_VERTICAL;\nuniform vec2 AXIS_LIMITS;\nuniform vec2 COLOR_LIMITS;\n\n\n/**\n * Coords: colorBoundsFrac, orthoFrac\n */\nattribute vec3 inCoords;\n\n\nvarying float vColorTableFrac;\n\n\nvoid main( ) {\n    float colorLimitsFrac = inCoords.x;\n    float axisCoord = fracToCoord1D( colorLimitsFrac, COLOR_LIMITS );\n    float axisFrac = coordToFrac1D( axisCoord, AXIS_LIMITS );\n    float axisNdc = fracToNdc1D( axisFrac );\n\n    float orthoFrac = inCoords.y;\n    float orthoNdc = fracToNdc1D( orthoFrac );\n\n    if ( AXIS_IS_VERTICAL == 1 ) {\n        gl_Position = vec4( orthoNdc, axisNdc, 0.0, 1.0 );\n    }\n    else {\n        gl_Position = vec4( axisNdc, orthoNdc, 0.0, 1.0 );\n    }\n\n    vColorTableFrac = colorLimitsFrac;\n}\n";

const PROG_SOURCE$3 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$3,
    fragShader_GLSL: fragShader_GLSL$3,
    uniformNames: [
        'AXIS_IS_VERTICAL',
        'AXIS_LIMITS',
        'COLOR_LIMITS',
        'COLOR_TABLE',
    ],
    attribNames: [
        'inCoords',
    ],
});
class GradientPainter {
    constructor(axisType, axisBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1)), colorBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1))) {
        this.peer = createDomPeer('gradient-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.colorTableName = StyleProp.create(this.style, '--color-table', cssLowercase, '');
        this.visible = new RefBasic(true, tripleEquals);
        this.axisType = axisType;
        this.axisBoundsFn = axisBoundsFn;
        this.colorBoundsFn = colorBoundsFn;
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
    paint(context, viewport_PX) {
        const colorTableName = this.colorTableName.get();
        const gl = context.gl;
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dCoords = gl.createBuffer();
            this.dCoordsValid = false;
            this.dColorTable = gl.createTexture();
            this.dColorTableName = null;
        }
        
        gl.activeTexture(GL.TEXTURE0);
        gl.bindTexture(GL.TEXTURE_2D, this.dColorTable);
        gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
        
        if (!this.dCoordsValid) {
            
            const hCoords = new Float32Array(12);
            putAlignedBox(hCoords, 0, 0, 1, 0, 1);
            
            gl.bufferData(GL.ARRAY_BUFFER, hCoords, GL.STATIC_DRAW);
            this.dCoordsValid = true;
        }
        
        if (colorTableName !== this.dColorTableName) {
            
            context.getColorTable(colorTableName).populate(gl, GL.TEXTURE_2D);
            this.dColorTableName = colorTableName;
        }
        
        enablePremultipliedAlphaBlending(gl);
        gl.disable(GL.CULL_FACE);
        const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$3);
        gl.useProgram(program);
        gl.enableVertexAttribArray(attribs.inCoords);
        try {
            
            gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
            glUniformBool(gl, uniforms.AXIS_IS_VERTICAL, this.axisType === Y);
            glUniformInterval1D(gl, uniforms.AXIS_LIMITS, this.axisBoundsFn());
            glUniformInterval1D(gl, uniforms.COLOR_LIMITS, this.colorBoundsFn());
            
            
            gl.uniform1i(uniforms.COLOR_TABLE, 0);
            gl.drawArrays(GL.TRIANGLES, 0, 6);
        }
        finally {
            gl.disableVertexAttribArray(attribs.inCoords);
            gl.useProgram(null);
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        gl.deleteTexture(this.dColorTable);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
}

var fragShader_GLSL$2 = "#version 100\nprecision lowp float;\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nbool isNaN( float x ) {\n    // Deliberately convoluted to avoid being optimized away\n    return ( x < 0.0 || 0.0 < x || x == 0.0 ) ? false : true;\n}\n\nconst int INTERPOLATE_NEITHER = 0;\nconst int INTERPOLATE_S = 1;\nconst int INTERPOLATE_T = 2;\nconst int INTERPOLATE_BOTH = 3;\n\nuniform int INTERP_MODE;\nuniform sampler2D VALUE_TABLE;\nuniform vec2 VALUE_TABLE_SIZE;\nuniform sampler2D COLOR_TABLE;\nuniform vec2 COLOR_LIMITS;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    vec2 st_FRAC;\n    if ( INTERP_MODE == INTERPOLATE_BOTH ) {\n        st_FRAC = vSt_FRAC;\n    }\n    else if ( INTERP_MODE == INTERPOLATE_S ) {\n        float s_FRAC = vSt_FRAC.s;\n        float t_FRAC = ( floor( vSt_FRAC.t*VALUE_TABLE_SIZE.t ) + 0.5 ) / VALUE_TABLE_SIZE.t;\n        st_FRAC = vec2( s_FRAC, t_FRAC );\n    }\n    else if ( INTERP_MODE == INTERPOLATE_T ) {\n        float s_FRAC = ( floor( vSt_FRAC.s*VALUE_TABLE_SIZE.s ) + 0.5 ) / VALUE_TABLE_SIZE.s;\n        float t_FRAC = vSt_FRAC.t;\n        st_FRAC = vec2( s_FRAC, t_FRAC );\n    }\n    else {\n        st_FRAC = ( floor( vSt_FRAC*VALUE_TABLE_SIZE ) + 0.5 ) / VALUE_TABLE_SIZE;\n    }\n\n    float value = texture2D( VALUE_TABLE, st_FRAC ).r;\n    if ( isNaN( value ) ) {\n        discard;\n    }\n    else {\n        float frac = coordToFrac1D( value, COLOR_LIMITS );\n        vec4 rgba = texture2D( COLOR_TABLE, vec2( frac, 0.0 ) );\n        gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n    }\n}\n";

var vertShader_GLSL$2 = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec4 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return vec4( -1.0 + 2.0*frac, 0.0, 1.0 );\n}\n\nuniform vec4 XY_LIMITS;\n\n/**\n * Coords: x_XAXIS, y_YAXIS, s_FRAC, t_FRAC\n */\nattribute vec4 inCoords;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    gl_Position = coordsToNdc2D( inCoords.xy, XY_LIMITS );\n    vSt_FRAC = inCoords.zw;\n}\n";

Object.freeze({
    vertShader_GLSL: vertShader_GLSL$2,
    fragShader_GLSL: fragShader_GLSL$2,
    uniformNames: [
        'XY_LIMITS',
        'VALUE_TABLE',
        'VALUE_TABLE_SIZE',
        'COLOR_LIMITS',
        'COLOR_TABLE',
        'INTERP_MODE',
    ],
    attribNames: [
        'inCoords',
    ],
});
var HeatmapInterpMode;
(function (HeatmapInterpMode) {
    HeatmapInterpMode[HeatmapInterpMode["NEAREST"] = 0] = "NEAREST";
    HeatmapInterpMode[HeatmapInterpMode["LINEAR_BETWEEN_COLUMNS"] = 1] = "LINEAR_BETWEEN_COLUMNS";
    HeatmapInterpMode[HeatmapInterpMode["LINEAR_BETWEEN_ROWS"] = 2] = "LINEAR_BETWEEN_ROWS";
    HeatmapInterpMode[HeatmapInterpMode["BILINEAR"] = 3] = "BILINEAR";
})(HeatmapInterpMode || (HeatmapInterpMode = {}));

var fragShader_GLSL$1 = "#version 100\nprecision lowp float;\n\nuniform lowp sampler2D IMAGE;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    vec4 rgba = texture2D( IMAGE, vSt_FRAC );\n    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n}\n";

var vertShader_GLSL$1 = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform vec2 ANCHOR_PX;\n\n/**\n * Coords: xOffset_PX, yOffset_PX, s_FRAC, t_FRAC\n */\nattribute vec4 inCoords;\n\nvarying vec2 vSt_FRAC;\n\n\nvoid main( ) {\n    vec2 xyOffset_PX = inCoords.xy;\n    vec2 xy_PX = ANCHOR_PX + xyOffset_PX;\n    vec2 xy_NDC = coordsToNdc2D( xy_PX, VIEWPORT_PX );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    vSt_FRAC = inCoords.zw;\n}\n";

Object.freeze({
    vertShader_GLSL: vertShader_GLSL$1,
    fragShader_GLSL: fragShader_GLSL$1,
    uniformNames: [
        'VIEWPORT_PX',
        'ANCHOR_PX',
        'IMAGE',
    ],
    attribNames: [
        'inCoords',
    ],
});
get$1(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 3;
    canvas.height = 3;
    const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
    g.clearRect(0, 0, 3, 3);
    return {
        xAnchor: 1.5,
        yAnchor: 1.5,
        border: 1,
        imageData: g.getImageData(0, 0, 3, 3),
    };
});

var discFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform float FEATHER_PX;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    vec2 xy_NPC = -1.0 + 2.0*gl_PointCoord;\n    float r_NPC = sqrt( dot( xy_NPC, xy_NPC ) );\n\n    float pxToNpc = 2.0 / vSize_PX;\n    float rOuter_NPC = 1.0 - 0.5*pxToNpc;\n    float rInner_NPC = rOuter_NPC - FEATHER_PX*pxToNpc;\n    float mask = smoothstep( rOuter_NPC, rInner_NPC, r_NPC );\n\n    float alpha = mask * vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var ringFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    vec2 xy_NPC = -1.0 + 2.0*gl_PointCoord;\n    float r_NPC = sqrt( dot( xy_NPC, xy_NPC ) );\n\n    float pxToNpc = 2.0 / vSize_PX;\n    float rD_NPC = 1.0 - 0.5*pxToNpc;\n    float rC_NPC = rD_NPC - FEATHER_PX*pxToNpc;\n    float rB_NPC = rC_NPC - max( 0.0, THICKNESS_PX - FEATHER_PX )*pxToNpc;\n    float rA_NPC = rB_NPC - FEATHER_PX*pxToNpc;\n    float mask = smoothstep( rD_NPC, rC_NPC, r_NPC ) * smoothstep( rA_NPC, rB_NPC, r_NPC );\n\n    float alpha = mask * vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var squareFragShader_GLSL = "#version 100\nprecision lowp float;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    float alpha = vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var xyVertShader_GLSL = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec4 FIXED_RGBA;\n\nuniform float FIXED_SIZE_PX;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS\n */\nattribute vec2 inCoords;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    vRgba = FIXED_RGBA;\n\n    vSize_PX = FIXED_SIZE_PX;\n    gl_PointSize = vSize_PX;\n}\n";

var xycVertShader_GLSL = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec2 C_BOUNDS;\nuniform sampler2D VARIABLE_COLOR_TABLE;\n\nuniform float FIXED_SIZE_PX;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, c_CAXIS\n */\nattribute vec3 inCoords;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    float c_CAXIS = inCoords.z;\n    float c_CFRAC = clamp( coordToFrac1D( c_CAXIS, C_BOUNDS ), 0.0, 1.0 );\n    vRgba = texture2D( VARIABLE_COLOR_TABLE, vec2( c_CFRAC, 0.0 ) );\n\n    vSize_PX = FIXED_SIZE_PX;\n    gl_PointSize = vSize_PX;\n}\n";

var xycsVertShader_GLSL = "#version 100\n\n\nconst int SIZE_FUNC_LINEAR = 0;\nconst int SIZE_FUNC_QUADRATIC = 1;\nconst int SIZE_FUNC_SQRT = 2;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\nfloat size_PX( float coord, vec2 bounds, int sizeFunc, vec2 sizeLimits_PX ) {\n    float frac = clamp( coordToFrac1D( coord, bounds ), 0.0, 1.0 );\n    if ( sizeFunc == SIZE_FUNC_LINEAR ) {\n        return fracToCoord1D( frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_QUADRATIC ) {\n        return fracToCoord1D( frac*frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_SQRT ) {\n        return fracToCoord1D( sqrt( frac ), sizeLimits_PX );\n    }\n    else {\n        return min1D( sizeLimits_PX );\n    }\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec2 C_BOUNDS;\nuniform sampler2D VARIABLE_COLOR_TABLE;\n\nuniform vec2 S_BOUNDS;\nuniform vec2 VARIABLE_SIZE_LIMITS_PX;\nuniform int VARIABLE_SIZE_FUNC;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, c_CAXIS, s_SAXIS\n */\nattribute vec4 inCoords;\n\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    float c_CAXIS = inCoords.z;\n    float c_CFRAC = clamp( coordToFrac1D( c_CAXIS, C_BOUNDS ), 0.0, 1.0 );\n    vRgba = texture2D( VARIABLE_COLOR_TABLE, vec2( c_CFRAC, 0.0 ) );\n\n    float s_SAXIS = inCoords.w;\n    vSize_PX = size_PX( s_SAXIS, S_BOUNDS, VARIABLE_SIZE_FUNC, VARIABLE_SIZE_LIMITS_PX );\n    gl_PointSize = vSize_PX;\n}\n";

var xysVertShader_GLSL = "#version 100\n\n\nconst int SIZE_FUNC_LINEAR = 0;\nconst int SIZE_FUNC_QUADRATIC = 1;\nconst int SIZE_FUNC_SQRT = 2;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\nfloat size_PX( float coord, vec2 bounds, int sizeFunc, vec2 sizeLimits_PX ) {\n    float frac = clamp( coordToFrac1D( coord, bounds ), 0.0, 1.0 );\n    if ( sizeFunc == SIZE_FUNC_LINEAR ) {\n        return fracToCoord1D( frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_QUADRATIC ) {\n        return fracToCoord1D( frac*frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_SQRT ) {\n        return fracToCoord1D( sqrt( frac ), sizeLimits_PX );\n    }\n    else {\n        return min1D( sizeLimits_PX );\n    }\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec4 FIXED_RGBA;\n\nuniform vec2 S_BOUNDS;\nuniform vec2 VARIABLE_SIZE_LIMITS_PX;\nuniform int VARIABLE_SIZE_FUNC;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, s_SAXIS\n */\nattribute vec4 inCoords;\n\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    vRgba = FIXED_RGBA;\n\n    float s_SAXIS = inCoords.z;\n    vSize_PX = size_PX( s_SAXIS, S_BOUNDS, VARIABLE_SIZE_FUNC, VARIABLE_SIZE_LIMITS_PX );\n    gl_PointSize = vSize_PX;\n}\n";

const { floor, max } = Math;
var ScatterShape;
(function (ScatterShape) {
    ScatterShape[ScatterShape["SQUARE"] = 0] = "SQUARE";
    ScatterShape[ScatterShape["DISC"] = 1] = "DISC";
    ScatterShape[ScatterShape["RING"] = 2] = "RING";
})(ScatterShape || (ScatterShape = {}));
var ScatterDimensionality;
(function (ScatterDimensionality) {
    ScatterDimensionality[ScatterDimensionality["XY"] = 0] = "XY";
    ScatterDimensionality[ScatterDimensionality["XYC"] = 1] = "XYC";
    ScatterDimensionality[ScatterDimensionality["XYS"] = 2] = "XYS";
    ScatterDimensionality[ScatterDimensionality["XYCS"] = 3] = "XYCS";
})(ScatterDimensionality || (ScatterDimensionality = {}));
const PROG_SOURCES = get$1(() => {
    const fragShadersByShape_GLSL = new Map([
        [ScatterShape.SQUARE, squareFragShader_GLSL],
        [ScatterShape.DISC, discFragShader_GLSL],
        [ScatterShape.RING, ringFragShader_GLSL],
    ]);
    const vertShadersByDimensionality_GLSL = new Map([
        [ScatterDimensionality.XY, xyVertShader_GLSL],
        [ScatterDimensionality.XYC, xycVertShader_GLSL],
        [ScatterDimensionality.XYS, xysVertShader_GLSL],
        [ScatterDimensionality.XYCS, xycsVertShader_GLSL],
    ]);
    const uniformNames = [
        'XY_BOUNDS',
        'FIXED_RGBA',
        'C_BOUNDS',
        'VARIABLE_COLOR_TABLE',
        'FIXED_SIZE_PX',
        'S_BOUNDS',
        'VARIABLE_SIZE_LIMITS_PX',
        'VARIABLE_SIZE_FUNC',
        'THICKNESS_PX',
        'FEATHER_PX',
    ];
    const attribNames = [
        'inCoords',
    ];
    const sourcesByDimByShape = new Map();
    for (const [shape, fragShader_GLSL] of fragShadersByShape_GLSL) {
        const sourcesByDim = mapSetIfAbsent(sourcesByDimByShape, shape, () => new Map());
        for (const [dim, vertShader_GLSL] of vertShadersByDimensionality_GLSL) {
            mapAdd(sourcesByDim, dim, { vertShader_GLSL, fragShader_GLSL, attribNames, uniformNames });
        }
    }
    return sourcesByDimByShape;
});
function adjustSizeForShape(size, shape) {
    switch (shape) {
        case ScatterShape.DISC:
        case ScatterShape.RING: {
            
            
            return size + 3;
        }
        default: {
            return size;
        }
    }
}
var ScatterSizeFunc;
(function (ScatterSizeFunc) {
    ScatterSizeFunc[ScatterSizeFunc["LINEAR"] = 0] = "LINEAR";
    ScatterSizeFunc[ScatterSizeFunc["QUADRATIC"] = 1] = "QUADRATIC";
    ScatterSizeFunc[ScatterSizeFunc["SQRT"] = 2] = "SQRT";
})(ScatterSizeFunc || (ScatterSizeFunc = {}));
function sizeFuncCode(sizeFunc) {
    switch (sizeFunc) {
        case ScatterSizeFunc.LINEAR: return 0;
        case ScatterSizeFunc.QUADRATIC: return 1;
        case ScatterSizeFunc.SQRT: return 2;
        default: return -1;
    }
}
class ScatterPainter {
    constructor(xyBoundsFn = frozenSupplier(Interval2D.fromEdges(0, 1, 0, 1)), cBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1)), sBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1))) {
        this.peer = createDomPeer('scatter-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.fixedColor = StyleProp.create(this.style, '--fixed-color', cssColor, 'rgb(0,0,0)');
        this.variableColorTableName = StyleProp.create(this.style, '--variable-color-table', cssLowercase, '');
        this.fixedSize_LPX = StyleProp.create(this.style, '--fixed-size-px', cssFloat, 8);
        this.variableSizeMin_LPX = StyleProp.create(this.style, '--variable-size-min-px', cssFloat, 1);
        this.variableSizeMax_LPX = StyleProp.create(this.style, '--variable-size-max-px', cssFloat, 18);
        this.variableSizeFunc = StyleProp.create(this.style, '--variable-size-fn', cssEnum(ScatterSizeFunc), 'linear');
        this.shape = StyleProp.create(this.style, '--shape', cssEnum(ScatterShape), 'disc');
        this.thickness_LPX = StyleProp.create(this.style, '--thickness-px', cssFloat, 1.5);
        
        this.feather_PX = StyleProp.create(this.style, '--feather-dpx', cssFloat, 1.5);
        this.visible = new RefBasic(true, tripleEquals);
        this.xyBoundsFn = xyBoundsFn;
        this.cBoundsFn = cBoundsFn;
        this.sBoundsFn = sBoundsFn;
        this.hCoords = new Float32Array(0);
        this.hCoordsPerPoint = -1;
        this.hDim = undefined;
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
    setXyCoords(xyCoords) {
        this.hCoordsPerPoint = 2;
        this.hDim = ScatterDimensionality.XY;
        this.hCoords = xyCoords;
        this.dCoordsValid = false;
    }
    setXycCoords(xycCoords) {
        this.hCoordsPerPoint = 3;
        this.hDim = ScatterDimensionality.XYC;
        this.hCoords = xycCoords;
        this.dCoordsValid = false;
    }
    setXysCoords(xysCoords) {
        this.hCoordsPerPoint = 3;
        this.hDim = ScatterDimensionality.XYS;
        this.hCoords = xysCoords;
        this.dCoordsValid = false;
    }
    setXycsCoords(xycsCoords) {
        this.hCoordsPerPoint = 4;
        this.hDim = ScatterDimensionality.XYCS;
        this.hCoords = xycsCoords;
        this.dCoordsValid = false;
    }
    
    paint(context, viewport_PX) {
        const fixedColor = this.fixedColor.get();
        const variableColorTableName = this.variableColorTableName.get();
        const fixedSize_LPX = this.fixedSize_LPX.get();
        const variableSizeMin_LPX = this.variableSizeMin_LPX.get();
        const variableSizeMax_LPX = this.variableSizeMax_LPX.get();
        const variableSizeFunc = this.variableSizeFunc.get();
        const shape = this.shape.get();
        const thickness_LPX = this.thickness_LPX.get();
        const feather_PX = this.feather_PX.get();
        
        const dpr = currentDpr(this);
        const fixedSize_PX = adjustSizeForShape(fixedSize_LPX * dpr, shape);
        const variableSizeLimits_PX = Interval1D.fromEdges(adjustSizeForShape(variableSizeMin_LPX * dpr, shape), adjustSizeForShape(variableSizeMax_LPX * dpr, shape));
        const thickness_PX = thickness_LPX * dpr;
        const gl = context.gl;
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dCoords = gl.createBuffer();
            this.dCoordsBytes = -1;
            this.dCoordsValid = false;
            this.dColorTable = gl.createTexture();
            this.dColorTableName = null;
        }
        
        gl.activeTexture(GL.TEXTURE0);
        gl.bindTexture(GL.TEXTURE_2D, this.dColorTable);
        gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
        
        if (!this.dCoordsValid) {
            
            this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords);
            this.dCoordsValid = true;
        }
        
        if (variableColorTableName !== this.dColorTableName) {
            
            context.getColorTable(variableColorTableName).populate(gl, GL.TEXTURE_2D);
            this.dColorTableName = variableColorTableName;
        }
        
        const numVertices = floor(this.hCoords.length / this.hCoordsPerPoint);
        if (numVertices > 0 && isDefined(this.hDim)) {
            const progSource = mapRequire(mapRequire(PROG_SOURCES, shape), this.hDim);
            const { program, attribs, uniforms } = context.getProgram(progSource);
            enablePremultipliedAlphaBlending(gl);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inCoords);
            try {
                glUniformInterval2D(gl, uniforms.XY_BOUNDS, this.xyBoundsFn());
                
                
                gl.uniform1i(uniforms.VARIABLE_COLOR_TABLE, 0);
                glUniformInterval1D(gl, uniforms.C_BOUNDS, this.cBoundsFn());
                glUniformRgba(gl, uniforms.FIXED_RGBA, fixedColor);
                gl.uniform1i(uniforms.VARIABLE_SIZE_FUNC, sizeFuncCode(variableSizeFunc));
                glUniformInterval1D(gl, uniforms.VARIABLE_SIZE_LIMITS_PX, variableSizeLimits_PX);
                glUniformInterval1D(gl, uniforms.S_BOUNDS, this.sBoundsFn());
                gl.uniform1f(uniforms.FIXED_SIZE_PX, fixedSize_PX);
                gl.uniform1f(uniforms.THICKNESS_PX, thickness_PX);
                
                gl.uniform1f(uniforms.FEATHER_PX, max(1e-3, feather_PX));
                
                gl.vertexAttribPointer(attribs.inCoords, this.hCoordsPerPoint, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.POINTS, 0, numVertices);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inCoords);
                gl.useProgram(null);
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        gl.deleteTexture(this.dColorTable);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsValid = false;
        this.dColorTable = null;
        this.dColorTableName = null;
    }
}

var fragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToNdc1D( float frac ) {\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform int AXIS_IS_VERTICAL;\nuniform vec2 AXIS_LIMITS;\nuniform vec2 COLOR_LIMITS;\n\n\n/**\n * Coords: colorBoundsFrac, orthoFrac\n */\nattribute vec3 inCoords;\n\n\nvoid main( ) {\n    float colorLimitsFrac = inCoords.x;\n    float axisCoord = fracToCoord1D( colorLimitsFrac, COLOR_LIMITS );\n    float axisFrac = coordToFrac1D( axisCoord, AXIS_LIMITS );\n    float axisNdc = fracToNdc1D( axisFrac );\n\n    float orthoFrac = inCoords.y;\n    float orthoNdc = fracToNdc1D( orthoFrac );\n\n    if ( AXIS_IS_VERTICAL == 1 ) {\n        gl_Position = vec4( orthoNdc, axisNdc, 0.0, 1.0 );\n    }\n    else {\n        gl_Position = vec4( axisNdc, orthoNdc, 0.0, 1.0 );\n    }\n}\n";

const PROG_SOURCE = Object.freeze({
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'AXIS_IS_VERTICAL',
        'AXIS_LIMITS',
        'COLOR_LIMITS',
        'RGBA',
    ],
    attribNames: [
        'inCoords',
    ],
});
class SolidPainter {
    constructor(axisType, axisBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1)), colorBoundsFn = frozenSupplier(Interval1D.fromEdges(0, 1))) {
        this.peer = createDomPeer('solid-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(127,127,127)');
        this.visible = new RefBasic(true, tripleEquals);
        this.axisType = axisType;
        this.axisBoundsFn = axisBoundsFn;
        this.colorBoundsFn = colorBoundsFn;
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }
    paint(context, viewport_PX) {
        const color = this.color.get();
        const gl = context.gl;
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dCoords = gl.createBuffer();
            this.dCoordsValid = false;
        }
        
        gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
        
        if (!this.dCoordsValid) {
            
            const hCoords = new Float32Array(12);
            putAlignedBox(hCoords, 0, 0, 1, 0, 1);
            
            gl.bufferData(GL.ARRAY_BUFFER, hCoords, GL.STATIC_DRAW);
            this.dCoordsValid = true;
        }
        
        enablePremultipliedAlphaBlending(gl);
        gl.disable(GL.CULL_FACE);
        const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE);
        gl.useProgram(program);
        gl.enableVertexAttribArray(attribs.inCoords);
        try {
            
            gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
            glUniformBool(gl, uniforms.AXIS_IS_VERTICAL, this.axisType === Y);
            glUniformInterval1D(gl, uniforms.AXIS_LIMITS, this.axisBoundsFn());
            glUniformInterval1D(gl, uniforms.COLOR_LIMITS, this.colorBoundsFn());
            glUniformRgba(gl, uniforms.RGBA, color);
            gl.drawArrays(GL.TRIANGLE_STRIP, 0, 6);
        }
        finally {
            gl.disableVertexAttribArray(attribs.inCoords);
            gl.useProgram(null);
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsValid = false;
    }
}

const linearTickIntervalFactors = Object.freeze([5.0, 2.0, 1.0, 0.5, 0.2, 0.1]);
class LinearTicker {
    constructor(axisLabel, axisUnits, coordFactor, coordOffset) {
        this.peer = createDomPeer('linear-ticker', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.majorSpacingApprox_LPX = StyleProp.create(this.style, '--approx-major-spacing-px', cssFloat, 100);
        this.minorPerMajor = StyleProp.create(this.style, '--minor-per-major', cssInteger, 5);
        this.axisLabel = (axisLabel !== null && axisLabel !== void 0 ? axisLabel : '');
        this.axisUnits = (axisUnits !== null && axisUnits !== void 0 ? axisUnits : '');
        this.coordFactor = (coordFactor !== null && coordFactor !== void 0 ? coordFactor : 1.0);
        this.coordOffset = (coordOffset !== null && coordOffset !== void 0 ? coordOffset : 0.0);
        this.minMajorCount = 3;
        this.formatTickCanary = undefined;
        this.formatTick = undefined;
    }
    toDisplayCoord(axisCoord) {
        return this.coordOffset + (this.coordFactor * axisCoord);
    }
    fromDisplayCoord(displayCoord) {
        return (displayCoord - this.coordOffset) / this.coordFactor;
    }
    toDisplayInterval(axisInterval) {
        const a = this.toDisplayCoord(axisInterval.min);
        const b = this.toDisplayCoord(axisInterval.max);
        return Interval1D.fromEdges(Math.min(a, b), Math.max(a, b));
    }
    fromDisplayInterval(displayInterval) {
        const a = this.fromDisplayCoord(displayInterval.min);
        const b = this.fromDisplayCoord(displayInterval.max);
        return Interval1D.fromEdges(Math.min(a, b), Math.max(a, b));
    }
    chooseScaleOrder(bounds) {
        
        
        const spanEpsilon_PX = 1e-12;
        const spanOrder = order(Math.abs(bounds.span + spanEpsilon_PX));
        if (spanOrder > 0) {
            return 3 * Math.floor((spanOrder - 1) / 3);
        }
        else if (spanOrder < 0) {
            return 3 * (Math.ceil(spanOrder / 3) - 1);
        }
        else {
            return 0;
        }
    }
    getTicks(axis) {
        if (!axis || axis.viewport_PX.span <= 0) {
            return EMPTY_TICKSET;
        }
        const majorSpacingApprox_LPX = this.majorSpacingApprox_LPX.get();
        const minorPerMajor = this.minorPerMajor.get();
        if (majorSpacingApprox_LPX === null) {
            return EMPTY_TICKSET;
        }
        const displayBounds = this.toDisplayInterval(axis.bounds);
        const majorSpacingApprox_PX = majorSpacingApprox_LPX * axis.dpr;
        const majorCountApprox = axis.viewport_PX.span / majorSpacingApprox_PX;
        const bestMajorSeq = findLinearTickSeq(this.minMajorCount, majorCountApprox, displayBounds);
        if (bestMajorSeq === null) {
            return EMPTY_TICKSET;
        }
        else {
            const majors = [];
            const majorFirst = bestMajorSeq.first;
            const majorCount = bestMajorSeq.countCurrent;
            const majorStep = bestMajorSeq.step;
            for (let i = 0; i < majorCount; i++) {
                const major = majorFirst + i * majorStep;
                if (displayBounds.containsPoint(major)) {
                    majors.push(this.fromDisplayCoord(major));
                }
            }
            const minors = [];
            const minorStep = majorStep / minorPerMajor;
            for (let i = -1; i < majorCount; i++) {
                const major = majorFirst + i * majorStep;
                for (let j = 1; j < minorPerMajor; j++) {
                    const minor = major + j * minorStep;
                    if (displayBounds.containsPoint(minor)) {
                        minors.push(this.fromDisplayCoord(minor));
                    }
                }
            }
            const scaleOrder = this.chooseScaleOrder(displayBounds);
            const scaleFactor = Math.pow(10, -scaleOrder);
            const precision = -order(Math.abs(majorStep * scaleFactor));
            const numDecimalPlaces = Math.max(0, precision);
            
            const formatTickCanary = new ValueBase(this.coordFactor, this.coordOffset, scaleFactor, numDecimalPlaces);
            if (!this.formatTick || !equal(formatTickCanary, this.formatTickCanary)) {
                this.formatTick = axisCoord => {
                    const scaled = this.toDisplayCoord(axisCoord) * scaleFactor;
                    return scaled.toFixed(numDecimalPlaces);
                };
                this.formatTickCanary = formatTickCanary;
            }
            const getAxisLabels = () => {
                const scaleText = run(() => {
                    switch (scaleOrder) {
                        case 0: return '';
                        case +3: return '\u00D7' + '1,000';
                        case -3: return '\u00D7' + '0.001';
                        default: return '\u00D7' + '10^' + scaleOrder.toFixed(0);
                    }
                });
                const unitsText = joinWords(' ', scaleText, this.axisUnits);
                const suffixText = (unitsText.length === 0 ? '' : '(' + unitsText + ')');
                const axisText = joinWords(' ', this.axisLabel, suffixText);
                return new AxisLabelSet([new AxisLabel(0.5, axisText)], []);
            };
            return new TickSet(majors, minors, this.formatTick, getAxisLabels);
        }
    }
}
function joinWords(separator, ...words) {
    let s = '';
    for (const word of words) {
        if (word.length > 0) {
            if (s.length > 0) {
                s += separator;
            }
            s += word;
        }
    }
    return s;
}
function order(x) {
    return Math.floor(Math.log10(x));
}
function findPrelimLinearTickInterval(axisBounds, tickCountApprox) {
    const axisMin = Math.min(axisBounds.min, axisBounds.max);
    const axisMax = Math.max(axisBounds.min, axisBounds.max);
    const tickStepApprox = (axisMax - axisMin) / tickCountApprox;
    return Math.pow(10, Math.round(Math.log10(tickStepApprox)));
}
function findLinearTickSeq(minTickCount, approxTickCount, axisBounds) {
    const tickCountTarget = Math.max(minTickCount, approxTickCount);
    const tickStepPrelim = findPrelimLinearTickInterval(axisBounds, tickCountTarget);
    let bestSeq = null;
    
    {
        let bestMiss = Number.POSITIVE_INFINITY;
        for (const factor of linearTickIntervalFactors) {
            const seq = createLinearTickSeq(axisBounds, factor * tickStepPrelim);
            if (seq.countMin >= minTickCount) {
                const miss = Math.abs(seq.countMin - tickCountTarget);
                if (miss < bestMiss) {
                    bestSeq = seq;
                    bestMiss = miss;
                }
            }
        }
    }
    
    if (bestSeq === null) {
        let bestCount = -1;
        for (const factor of linearTickIntervalFactors) {
            const seq = createLinearTickSeq(axisBounds, factor * tickStepPrelim);
            if (seq.countMin > bestCount) {
                bestSeq = seq;
                bestCount = seq.countMin;
            }
        }
    }
    return bestSeq;
}
function createLinearTickSeq(axisBounds, tickInterval) {
    const axisMin = Math.min(axisBounds.min, axisBounds.max);
    const axisMax = Math.max(axisBounds.min, axisBounds.max);
    const tickStep = Math.abs(tickInterval);
    const tickFirst = Math.ceil(axisMin / tickStep) * tickStep;
    const tickCountMin = Math.floor((axisMax - axisMin) / tickStep);
    const tickCountCurrent = (tickFirst > axisMax ? 0 : 1 + Math.floor((axisMax - tickFirst) / tickStep));
    return {
        first: tickFirst,
        step: tickStep,
        countMin: tickCountMin,
        countCurrent: tickCountCurrent
    };
}

class EdgeAxisWidget {
    
    constructor(axis, axisLabelEdge, options) {
        var _a;
        this.axis = axis;
        this.painter = new AxisPainter(this.axis, axisLabelEdge, (_a = options === null || options === void 0 ? void 0 : options.createTicker) !== null && _a !== void 0 ? _a : (() => new LinearTicker()), options === null || options === void 0 ? void 0 : options.textAtlasCache);
        
        const layout = new ChildlessLayout();
        layout.prefWidth_LPX.getOverride = () => this.painter.getPrefSize_PX().w / currentDpr(this.pane);
        layout.prefHeight_LPX.getOverride = () => this.painter.getPrefSize_PX().h / currentDpr(this.pane);
        this.axisType = (axisLabelEdge === EAST || axisLabelEdge === WEST ? Y : X);
        this.pane = new Pane(layout);
        this.pane.addCssClass('edge-axis');
        this.pane.addCssClass(`${(this.axisType === Y ? 'y' : 'x')}-edge-axis`);
        this.pane.addPainter(this.painter);
        attachAxisInputHandlers1D(this.pane, this.axis, this.axisType);
    }
    
    attachAxisViewportUpdater(plotCenterPane) {
        return attachAxisViewportUpdater1D(plotCenterPane, this.axis, this.axisType);
    }
    get ticker() {
        return this.painter.ticker;
    }
}
class BarAxisWidget {
    
    constructor(axis, axisLabelEdge, options) {
        var _a;
        this.peer = createDomPeer('bar-axis-widget', this, PeerType.CONTRAPTION);
        this.style = window.getComputedStyle(this.peer);
        this.axisInset_LPX = StyleProp.create(this.style, '--axis-inset-px', cssFloat, 0);
        this.axis = axis;
        this.painter = new BarAxisPainter(this.axis, axisLabelEdge, (_a = options === null || options === void 0 ? void 0 : options.createTicker) !== null && _a !== void 0 ? _a : (() => new LinearTicker()), (options === null || options === void 0 ? void 0 : options.tags) && tagCoordsFn(options.tags), options === null || options === void 0 ? void 0 : options.barPainters, options === null || options === void 0 ? void 0 : options.textAtlasCache);
        
        const layout = new ChildlessLayout();
        layout.prefWidth_LPX.getOverride = () => this.painter.getPrefSize_PX().w / currentDpr(this.pane);
        layout.prefHeight_LPX.getOverride = () => this.painter.getPrefSize_PX().h / currentDpr(this.pane);
        this.axisType = (axisLabelEdge === EAST || axisLabelEdge === WEST ? Y : X);
        this.pane = new Pane(layout);
        appendChild(this.pane.peer, this.peer);
        this.pane.addCssClass('bar-axis');
        this.pane.addCssClass(`${(this.axisType === Y ? 'y' : 'x')}-bar-axis`);
        this.pane.addPainter(this.painter);
        const axisInputHandler = createAxisZoomersAndPanners1D(this.axis, this.axisType);
        this.pane.addInputHandler(maskedInputHandler(axisInputHandler, ev => {
            return this.axis.viewport_PX.containsPoint(ev.loc_PX[this.axisType]);
        }));
        if (options === null || options === void 0 ? void 0 : options.tags) {
            const tagsInputHandler = createTagsInputHandler1D(axis, this.axisType, options.tags, true, () => {
                return this.painter.ticker.getTicks(axis).majorTicks;
            });
            this.pane.addInputHandler(maskedInputHandler(tagsInputHandler, ev => {
                const d = getOrthogonalDim(this.axisType);
                return this.painter.tagsMouseArea_PX[d].containsPoint(ev.loc_PX[d]);
            }));
        }
    }
    
    attachAxisViewportUpdater(plotCenterPane) {
        return attachAxisViewportUpdater1D(plotCenterPane, this.axis, this.axisType, () => this.axisInset_LPX.get());
    }
    get ticker() {
        return this.painter.ticker;
    }
}
const Z_INDEX_EDGE_AXIS = 0;
const Z_INDEX_CORNER = +10;
const Z_INDEX_BAR_AXIS = +20;
const Z_INDEX_BORDER = +999;
class Plot {
    constructor() {
        this.gridLayout = new GridLayout();
        this.pane = new Pane(this.gridLayout);
        this.centerPane = new Pane();
        this.centerPane.addCssClass('plot-center');
        const plotBorderPainter = new PlotBorderPainter(paneViewportFn_PX(this.centerPane));
        this.pane.addPainter(plotBorderPainter, Z_INDEX_BORDER);
        this.paddedLayout = new InsetLayout();
        this.paddedLayout.inset_LPX.getOverride = () => {
            const dpr = currentDpr(this.pane);
            const borderWidth_PX = Math.round(plotBorderPainter.width_LPX.get() * dpr);
            const borderOutward_LPX = (borderWidth_PX >> 1) / dpr;
            return createInset(borderOutward_LPX);
        };
        this.paddedPane = new Pane(this.paddedLayout);
        this.paddedPane.addCssClass('plot-padded');
        this.paddedPane.siteInParentOverrides.rowHeight = () => 'flex(0,pref)';
        this.paddedPane.siteInParentOverrides.columnWidth = () => 'flex(0,pref)';
        this.gridLayout.visibleRowKeys.addLast('Center');
        this.gridLayout.visibleColumnKeys.addLast('Center');
        setGridCoords(this.paddedPane, 'Center', 'Center');
        this.paddedPane.addPane(this.centerPane, +999);
        this.pane.addPane(this.paddedPane);
        this.nextNorthPaneIndex = 0;
        this.nextSouthPaneIndex = 0;
        this.nextEastPaneIndex = 0;
        this.nextWestPaneIndex = 0;
    }
    addCenterPainter(painter) {
        return this.centerPane.addPainter(painter);
    }
    addEdgePane(pane, labelEdge, zIndex = 0) {
        const disposers = new DisposerGroup();
        let rowKey = 'ALL';
        let columnKey = 'ALL';
        switch (labelEdge) {
            case NORTH:
                {
                    rowKey = `North${this.nextNorthPaneIndex++}`;
                    this.gridLayout.visibleRowKeys.addLast(rowKey);
                    disposers.add(() => this.gridLayout.visibleRowKeys.delete(rowKey));
                    disposers.add(pane.addCssClass(`plot-north-edge`));
                }
                break;
            case SOUTH:
                {
                    rowKey = `South${this.nextSouthPaneIndex++}`;
                    this.gridLayout.visibleRowKeys.addFirst(rowKey);
                    disposers.add(() => this.gridLayout.visibleRowKeys.delete(rowKey));
                    disposers.add(pane.addCssClass(`plot-south-edge`));
                }
                break;
            case EAST:
                {
                    columnKey = `East${this.nextEastPaneIndex++}`;
                    this.gridLayout.visibleColumnKeys.addLast(columnKey);
                    disposers.add(() => this.gridLayout.visibleColumnKeys.delete(columnKey));
                    disposers.add(pane.addCssClass(`plot-east-edge`));
                }
                break;
            case WEST:
                {
                    columnKey = `West${this.nextWestPaneIndex++}`;
                    this.gridLayout.visibleColumnKeys.addFirst(columnKey);
                    disposers.add(() => this.gridLayout.visibleColumnKeys.delete(columnKey));
                    disposers.add(pane.addCssClass(`plot-west-edge`));
                }
                break;
        }
        setGridCoords(pane, rowKey, columnKey);
        disposers.add(() => setGridCoords(pane, undefined, undefined));
        disposers.add(this.pane.addPane(pane, zIndex));
        return disposers;
    }
    
    addEdgeAxis1D(axisWidget, plotEdge, controlFromCenter = true) {
        const disposers = new DisposerGroup();
        disposers.add(this.addEdgePane(axisWidget.pane, plotEdge, Z_INDEX_EDGE_AXIS));
        if (controlFromCenter) {
            const centerInputHandler = createAxisZoomersAndPanners1D(axisWidget.axis, axisWidget.axisType);
            disposers.add(this.centerPane.addInputHandler(centerInputHandler));
            disposers.add(this.paddedPane.addInputHandler(centerInputHandler));
            disposers.add(this.pane.addInputHandler(maskedInputHandler(centerInputHandler, ev => {
                const parallelDim = axisWidget.axisType;
                const orthogonalDim = getOrthogonalDim(parallelDim);
                return (!this.paddedPane.getScissor_PX()[parallelDim].containsPoint(ev.loc_PX[parallelDim])
                    && axisWidget.pane.getScissor_PX()[orthogonalDim].containsPoint(ev.loc_PX[orthogonalDim]));
            }), Z_INDEX_CORNER));
        }
        return disposers;
    }
    addEdgeAxis2D(xAxisWidget, xPlotEdge, yAxisWidget, yPlotEdge) {
        const disposers = new DisposerGroup();
        disposers.add(this.addEdgePane(xAxisWidget.pane, xPlotEdge, Z_INDEX_EDGE_AXIS));
        disposers.add(this.addEdgePane(yAxisWidget.pane, yPlotEdge, Z_INDEX_EDGE_AXIS));
        const centerInputHandler = createAxisZoomerAndPanner2D(new Axis2D(xAxisWidget.axis, yAxisWidget.axis));
        disposers.add(this.centerPane.addInputHandler(centerInputHandler));
        disposers.add(this.paddedPane.addInputHandler(centerInputHandler));
        disposers.add(this.pane.addInputHandler(maskedInputHandler(centerInputHandler, ev => {
            return (xAxisWidget.pane.getScissor_PX().y.containsPoint(ev.loc_PX.y)
                && yAxisWidget.pane.getScissor_PX().x.containsPoint(ev.loc_PX.x));
        }), Z_INDEX_CORNER));
        return disposers;
    }
    addBarAxis1D(axisWidget, edge) {
        const disposers = new DisposerGroup();
        disposers.add(this.addEdgePane(axisWidget.pane, edge, Z_INDEX_BAR_AXIS));
        return disposers;
    }
    attachAxisViewportUpdaters(...axisWidgets) {
        const disposers = new DisposerGroup();
        doTxn(() => {
            for (const axisWidget of axisWidgets) {
                disposers.add(axisWidget.attachAxisViewportUpdater(this.centerPane));
            }
        });
        return disposers;
    }
}
newImmutableMap([
    ['ArrowUp', -1],
    ['ArrowDown', +1],
    ['PageUp', -11],
    ['PageDown', +11],
]);

function generateXycsCoords(numPoints) {
    const coords = new Float32Array(4 * numPoints);
    for (let i = 0; i < numPoints; i++) {
        const r = Math.random();
        const big = (10 * Math.random() < -0.3 * Math.log(r));
        const x = Math.random() * 2 * Math.PI;
        const y = Math.sin(x) + 0.3 * Math.log(r);
        const c = (big ? -1.2 : -1.0) * (Math.cos(x - 0.33) + 0.3 * (-1 + 2 * r)) + Math.random() - 0.5;
        const s = Math.sqrt((big ? 1 : 0.2) * Math.sqrt(0.5 + 0.5 * Math.sin(3 * c)));
        coords[4 * i + 0] = x;
        coords[4 * i + 1] = y;
        coords[4 * i + 2] = c;
        coords[4 * i + 3] = s;
    }
    return coords;
}

const mainCssUrl = new URL("assets/@metsci/gleam-example-scatter/6640ebee-main.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
run(async () => {
    const stylesLoading = Promise.all([
        gleamCoreDefaultStyleLoading,
        addCssLink(mainCssUrl),
    ]);
    const repaint = new ListenableBasic();
    const textAtlasCache = new TextAtlasCache();
    const xyAxis = createCommonScaleAxis2D();
    const cAxis = createCommonBoundsAxis1D();
    const sAxis = createCommonBoundsAxis1D();
    const cTags = new TagMap({ min: 0, max: 0 });
    const sTags = new TagMap({ min: 0, max: 0 });
    const cTagBoundsFn = tagBoundsFn(cTags, 'min', 'max');
    const sTagBoundsFn = tagBoundsFn(sTags, 'min', 'max');
    const plot = new Plot();
    const xAxisWidget = new EdgeAxisWidget(xyAxis.x, SOUTH, {
        createTicker: () => new LinearTicker('X'),
        textAtlasCache,
    });
    const yAxisWidget = new EdgeAxisWidget(xyAxis.y, WEST, {
        createTicker: () => new LinearTicker('Y'),
        textAtlasCache,
    });
    plot.addEdgeAxis2D(xAxisWidget, SOUTH, yAxisWidget, WEST);
    plot.attachAxisViewportUpdaters(xAxisWidget, yAxisWidget);
    const xyGridPainter = new GridPainter(xyAxis, xAxisWidget.ticker, yAxisWidget.ticker);
    plot.addCenterPainter(xyGridPainter);
    const cGradientPainter = new GradientPainter(Y, axisBoundsFn(cAxis), cTagBoundsFn);
    const cAxisWidget = new BarAxisWidget(cAxis, WEST, {
        createTicker: () => new LinearTicker('Color'),
        textAtlasCache,
        tags: cTags,
        barPainters: [cGradientPainter],
    });
    plot.addBarAxis1D(cAxisWidget, EAST);
    plot.attachAxisViewportUpdaters(cAxisWidget);
    const sSolidPainter = new SolidPainter(Y, axisBoundsFn(sAxis), sTagBoundsFn);
    const sAxisWidget = new BarAxisWidget(sAxis, WEST, {
        createTicker: () => new LinearTicker('Size'),
        textAtlasCache,
        tags: sTags,
        barPainters: [sSolidPainter],
    });
    plot.addBarAxis1D(sAxisWidget, EAST);
    plot.attachAxisViewportUpdaters(sAxisWidget);
    sTags.setConstraint(createTagOrderConstraint('min', 'max'));
    const scatterPainter = new ScatterPainter(axisBoundsFn(xyAxis), cTagBoundsFn, sTagBoundsFn);
    const scatterCoords = generateXycsCoords(10000);
    scatterPainter.setXycsCoords(scatterCoords);
    plot.addCenterPainter(scatterPainter);
    plot.pane.enableColorTables([INFERNO, PLASMA, VIRIDIS, JET_LEGACY, CET_L04, CET_L06, CET_L07, CET_L08, CET_L17, CET_L19, CET_L20]);
    const changes = activityListenable(xyAxis, cAxis, sAxis, cTags, sTags);
    changes.addListener(IMMEDIATE, () => {
        repaint.fire();
    });
    onFirstFewLayouts(plot.pane, 5, () => {
        xyAxis.set(false, -1, 2 * Math.PI + 1, -2.5, +1.5);
        cAxis.set(false, -1.65, +1.65);
        sAxis.set(false, -0.15, +1.15);
        cTags.set(false, { min: -1.5, max: +1.5 });
        sTags.set(false, { min: 0, max: 1 });
    });
    const pane = createInsetPane(plot.pane);
    pane.addCssClass('content');
    await stylesLoading;
    const host = requireNonNull(document.getElementById('host'));
    attachPane(host, pane, repaint);
});

}));
//# sourceMappingURL=main.js.map
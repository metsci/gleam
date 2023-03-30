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
function firstTrue(values, arg2, arg3) {
    let test;
    let fallback;
    if (arg3 === undefined) {
        test = arg2;
        fallback = undefined;
    }
    else {
        test = arg3;
        fallback = arg2;
    }
    for (const v of values) {
        if (test(v)) {
            return v;
        }
    }
    return fallback;
}
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
function atLeast(a) {
    return v => (v >= a);
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

function mod(a, b) {
    return (((a % b) + b) % b);
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

const { floor: floor$1$1, round: round$2 } = Math;

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
const { NEGATIVE_INFINITY: NEGATIVE_INFINITY$1, POSITIVE_INFINITY: POSITIVE_INFINITY$1 } = Number;
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
            yMin = NEGATIVE_INFINITY$1;
        }
        if (yMax === undefined) {
            yMax = POSITIVE_INFINITY$1;
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

const { abs: abs$1, floor: floor$2, trunc } = Math;
const { parseInt: parseInt$1 } = Number;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR_APPROX = 365.2425;
const DAYS_PER_MONTH_APPROX = DAYS_PER_YEAR_APPROX / 12.0;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
const SECONDS_PER_MONTH_APPROX = SECONDS_PER_DAY * DAYS_PER_MONTH_APPROX;
const SECONDS_PER_YEAR_APPROX = SECONDS_PER_DAY * DAYS_PER_YEAR_APPROX;
function localTime(year, month, day, hour, minute, second) {
    return { kind: 'LOCAL', year, month, day, hour, minute, second };
}

function compareLocalTimes(a, b) {
    const aAsUtc_PSEC = utcTimeToPsec(a.year, a.month, a.day, a.hour, a.minute, a.second);
    const bAsUtc_PSEC = utcTimeToPsec(b.year, b.month, b.day, b.hour, b.minute, b.second);
    return (aAsUtc_PSEC - bAsUtc_PSEC);
}
function zonedTime(zoneOffset_MINUTES, year, month, day, hour, minute, second) {
    return { kind: 'ZONED', zoneOffset_MINUTES, year, month, day, hour, minute, second };
}
const cacheForPsecToZonedTime = createLruCache(1024);
function psecToZonedTime(t_PSEC, timezone) {
    const tTrunc_PSEC = trunc(t_PSEC);
    const cacheKey = tTrunc_PSEC.toFixed(0) + '@' + timezone;
    const tTruncCached = cacheForPsecToZonedTime(cacheKey, () => {
        const result = zonedTime(NaN, NaN, NaN, NaN, NaN, NaN, NaN);
        const parts = getFullFormatter(timezone).formatToParts(1e3 * tTrunc_PSEC);
        for (const { type, value } of parts) {
            switch (type) {
                case 'timeZoneName':
                    result.zoneOffset_MINUTES = parseZoneOffset_MINUTES(value);
                    break;
                case 'year':
                    result.year = parseInt$1(value, 10);
                    break;
                case 'month':
                    result.month = parseInt$1(value, 10);
                    break;
                case 'day':
                    result.day = parseInt$1(value, 10);
                    break;
                case 'hour':
                    result.hour = (value === '24' ? 0 : parseInt$1(value, 10));
                    break;
                case 'minute':
                    result.minute = parseInt$1(value, 10);
                    break;
                case 'second':
                    result.second = parseInt$1(value, 10);
                    break;
            }
        }
        if (Number.isNaN(result.zoneOffset_MINUTES) || Number.isNaN(result.year) || Number.isNaN(result.month) || Number.isNaN(result.day) || Number.isNaN(result.hour) || Number.isNaN(result.minute) || Number.isNaN(result.second)) {
            throw { message: 'Failed to convert time', tTrunc_PSEC, timezone, parts, incomplete: result };
        }
        return result;
    });
    const result = Object.assign({}, tTruncCached);
    result.second += t_PSEC - tTrunc_PSEC;
    return result;
}
const cacheForZoneOffsetAt = createLruCache(1024);
function zoneOffsetAt_SEC(t_PSEC, timezone) {
    const cacheKey = t_PSEC.toFixed(0) + '@' + timezone;
    return cacheForZoneOffsetAt(cacheKey, () => {
        const tTrunc_PSEC = trunc(t_PSEC);
        const parts = getZoneFormatter(timezone).formatToParts(1e3 * tTrunc_PSEC);
        for (const { type, value } of parts) {
            if (type === 'timeZoneName') {
                return 60 * parseZoneOffset_MINUTES(value);
            }
        }
        throw { message: 'Failed to find zone offset', t_PSEC, timezone, parts };
    });
}
const cacheForGetFullFormatter = createLruCache(32);
function getFullFormatter(timezone) {
    return cacheForGetFullFormatter(timezone, () => {
        return Object.freeze(new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            hour12: false,
            minute: 'numeric',
            second: 'numeric',
        }));
    });
}
const cacheForGetZoneFormatter = createLruCache(32);
function getZoneFormatter(timezone) {
    return cacheForGetZoneFormatter(timezone, () => {
        return Object.freeze(new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        }));
    });
}
const cacheForParseZoneOffset = createLruCache(32);
function parseZoneOffset_MINUTES(longOffsetTimezone) {
    return cacheForParseZoneOffset(longOffsetTimezone, () => {
        
        const parts = longOffsetTimezone.match(/^(GMT|UTC|Z)?((\+|-)([0-9][0-9]?)((:)?([0-9][0-9])?)?)?$/);
        if (!parts) {
            throw new Error(`Failed to parse timezone string: ${longOffsetTimezone}`);
        }
        else if (!parts[2]) {
            return 0;
        }
        else {
            const sign = (parts[3] === '-' ? -1 : +1);
            const hours = parseInt$1(parts[4], 10);
            const minutes = (parts[7] ? parseInt$1(parts[7], 10) : 0);
            return sign * (60 * hours + minutes);
        }
    });
}

function utcTimeToPsec(year, month, day, hour, minute, second) {
    const additionalMinutes = floor$2(second / 60);
    const second2 = second - 60 * additionalMinutes;
    const minute2 = minute + additionalMinutes;
    return (1e-3 * Date.UTC(year, month - 1, day, hour, minute2) + second2);
}

function localTimeToPsec(t, timezone) {
    const ballpark_PSEC = utcTimeToPsec(t.year, t.month, t.day, t.hour, t.minute, t.second);
    const zoneAtBallpark_SEC = zoneOffsetAt_SEC(ballpark_PSEC, timezone);
    const guess_PSEC = ballpark_PSEC + (0 - zoneAtBallpark_SEC);
    const zoneAtGuess_SEC = zoneOffsetAt_SEC(guess_PSEC, timezone);
    const primary_PSEC = guess_PSEC + (zoneAtBallpark_SEC - zoneAtGuess_SEC);
    const zoneAtPrimary_SEC = zoneOffsetAt_SEC(primary_PSEC, timezone);
    
    if (zoneAtPrimary_SEC !== zoneAtGuess_SEC) {
        
        
        
        
        
        return [];
    }
    
    
    for (let lookback_SEC of [-1800, -3600, -7200]) {
        const zoneBeforePrimary_SEC = zoneOffsetAt_SEC(primary_PSEC + lookback_SEC, timezone);
        const zoneChange_SEC = zoneAtPrimary_SEC - zoneBeforePrimary_SEC;
        if (zoneChange_SEC <= lookback_SEC) {
            
            return [primary_PSEC, primary_PSEC + zoneChange_SEC];
        }
    }
    
    for (let lookahead_SEC of [+1800, +3600, +7200]) {
        const zoneAfterPrimary_SEC = zoneOffsetAt_SEC(primary_PSEC + lookahead_SEC, timezone);
        const zoneChange_SEC = zoneAfterPrimary_SEC - zoneAtPrimary_SEC;
        if (zoneChange_SEC <= -lookahead_SEC) {
            
            return [primary_PSEC, primary_PSEC - zoneChange_SEC];
        }
    }
    
    return [primary_PSEC];
}
function psecToIso8601(t_PSEC, timezone, numDecimalPlaces) {
    const t = psecToZonedTime(t_PSEC, timezone !== null && timezone !== void 0 ? timezone : 'UTC');
    return zonedTimeToIso8601(t, numDecimalPlaces);
}
function zonedTimeToIso8601(t, numDecimalPlaces) {
    const { zoneOffset_MINUTES, year, month, day, hour, minute, second } = t;
    const YYYY = year.toFixed(0).padStart(4, '0');
    const MM = month.toFixed(0).padStart(2, '0');
    const DD = day.toFixed(0).padStart(2, '0');
    const hh = hour.toFixed(0).padStart(2, '0');
    const mm = minute.toFixed(0).padStart(2, '0');
    const wholeSeconds = trunc(second);
    const fracSeconds = second - wholeSeconds;
    const ss = wholeSeconds.toFixed(0).padStart(2, '0');
    const ffff = get$1(() => {
        if (isDefined(numDecimalPlaces)) {
            return '.' + fracSeconds.toFixed(numDecimalPlaces).replace(/^0\./, '');
        }
        else if (fracSeconds === 0) {
            return '';
        }
        else {
            return '.' + fracSeconds.toFixed(16).replace(/^0\./, '').replace(/0*$/, '');
        }
    });
    const ZZZZ = get$1(() => {
        if (zoneOffset_MINUTES === 0) {
            return 'Z';
        }
        else {
            const sign = (zoneOffset_MINUTES > 0 ? '+' : '-');
            const minutes = abs$1(zoneOffset_MINUTES);
            const hours = floor$2(minutes / 60);
            const hh = (hours).toFixed(0).padStart(2, '0');
            const mm = (minutes - 60 * hours).toFixed(0).padStart(2, '0');
            return `Z${sign}${hh}${mm}`;
        }
    });
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${ffff}${ZZZZ}`;
}
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

class AaTreeMap {
    constructor(compareKeys) {
        this.compareKeys = compareKeys;
        this.compareEntries = (a, b) => {
            return compareKeys(a[0], b[0]);
        };
        this.root = undefined;
        this._size = 0;
    }
    get [Symbol.toStringTag]() {
        return '[object AaTreeMap]';
    }
    get size() {
        return this._size;
    }
    has(key) {
        return (this.entry(key) !== undefined);
    }
    get(key) {
        var _a;
        return (_a = this.entry(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    getRoot() {
        return this.root;
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    *entries() {
        for (const { item } of nodesInOrder(this.root)) {
            yield item;
        }
    }
    *entriesInReverse() {
        for (const { item } of nodesInReverse(this.root)) {
            yield item;
        }
    }
    entry(key) {
        var _a;
        const en = [key, undefined];
        return (_a = find(this.root, en, this.compareEntries)) === null || _a === void 0 ? void 0 : _a.item;
    }
    entryBefore(key) {
        var _a;
        const en = [key, undefined];
        return (_a = findBefore(this.root, en, this.compareEntries)) === null || _a === void 0 ? void 0 : _a.item;
    }
    entryAtOrBefore(key) {
        var _a;
        const en = [key, undefined];
        return (_a = findAtOrBefore(this.root, en, this.compareEntries)) === null || _a === void 0 ? void 0 : _a.item;
    }
    entryAfter(key) {
        var _a;
        const en = [key, undefined];
        return (_a = findAfter(this.root, en, this.compareEntries)) === null || _a === void 0 ? void 0 : _a.item;
    }
    entryAtOrAfter(key) {
        var _a;
        const en = [key, undefined];
        return (_a = findAtOrAfter(this.root, en, this.compareEntries)) === null || _a === void 0 ? void 0 : _a.item;
    }
    *keys() {
        for (const en of this.entries()) {
            yield en[0];
        }
    }
    *keysInReverse() {
        for (const en of this.entriesInReverse()) {
            yield en[0];
        }
    }
    keyBefore(key) {
        var _a;
        return (_a = this.entryBefore(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    keyAtOrBefore(key) {
        var _a;
        return (_a = this.entryAtOrBefore(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    keyAfter(key) {
        var _a;
        return (_a = this.entryAfter(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    keyAtOrAfter(key) {
        var _a;
        return (_a = this.entryAtOrAfter(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    *values() {
        for (const en of this.entries()) {
            yield en[1];
        }
    }
    *valuesInReverse() {
        for (const en of this.entriesInReverse()) {
            yield en[1];
        }
    }
    valueBefore(key) {
        var _a;
        return (_a = this.entryBefore(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    valueAtOrBefore(key) {
        var _a;
        return (_a = this.entryAtOrBefore(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    valueAfter(key) {
        var _a;
        return (_a = this.entryAfter(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    valueAtOrAfter(key) {
        var _a;
        return (_a = this.entryAtOrAfter(key)) === null || _a === void 0 ? void 0 : _a[1];
    }
    forEach(fn, thisArg) {
        for (const item of this) {
            fn.call(thisArg, item[1], item[0], this);
        }
    }
    set(key, value) {
        const en = [key, value];
        const update = addIfAbsent(this.root, en, this.compareEntries);
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return this;
    }
    delete(key) {
        const en = [key, undefined];
        const update = removeIfPresent(this.root, en, this.compareEntries);
        this.root = update.newRoot;
        this._size += update.sizeDelta;
        return (update.sizeDelta !== 0);
    }
    clear() {
        this.root = undefined;
        this._size = 0;
    }
    
    computeDepth() {
        return computeTreeDepth(this.root);
    }
    
    format(formatEntry) {
        return formatTree(this.root, formatEntry);
    }
}
function* nodesInOrder(root) {
    if (root) {
        yield* nodesInOrder(root.left);
        yield root;
        yield* nodesInOrder(root.right);
    }
}
function* nodesInReverse(root) {
    if (root) {
        yield* nodesInOrder(root.right);
        yield root;
        yield* nodesInOrder(root.left);
    }
}
function find(root, item, compare) {
    if (!root) {
        return undefined;
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            return find(root.left, item, compare);
        }
        else if (comparison > 0) {
            return find(root.right, item, compare);
        }
        else {
            return root;
        }
    }
}
function findBefore(root, item, compare) {
    var _a;
    if (!root) {
        return undefined;
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison <= 0) {
            return findBefore(root.left, item, compare);
        }
        else {
            return ((_a = findBefore(root.right, item, compare)) !== null && _a !== void 0 ? _a : root);
        }
    }
}
function findAtOrBefore(root, item, compare) {
    var _a;
    if (!root) {
        return undefined;
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            return findAtOrBefore(root.left, item, compare);
        }
        else if (comparison > 0) {
            return ((_a = findAtOrBefore(root.right, item, compare)) !== null && _a !== void 0 ? _a : root);
        }
        else {
            return root;
        }
    }
}
function findAfter(root, item, compare) {
    var _a;
    if (!root) {
        return undefined;
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            return ((_a = findAfter(root.left, item, compare)) !== null && _a !== void 0 ? _a : root);
        }
        else {
            return findAfter(root.right, item, compare);
        }
    }
}
function findAtOrAfter(root, item, compare) {
    var _a;
    if (!root) {
        return undefined;
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            return ((_a = findAtOrAfter(root.left, item, compare)) !== null && _a !== void 0 ? _a : root);
        }
        else if (comparison > 0) {
            return findAtOrAfter(root.right, item, compare);
        }
        else {
            return root;
        }
    }
}

function computeTreeDepth(root, parentDepth = 0) {
    if (!root) {
        return parentDepth;
    }
    else {
        return Math.max(computeTreeDepth(root.left, parentDepth + 1), computeTreeDepth(root.right, parentDepth + 1));
    }
}
function* nodesWithDepths(root, rootDepth = 1) {
    var _a, _b;
    if (root) {
        const rightDepth = (((_a = root.right) === null || _a === void 0 ? void 0 : _a.level) === root.level ? rootDepth : rootDepth + 1);
        yield* nodesWithDepths(root.right, rightDepth);
        yield { node: root, depth: rootDepth };
        const leftDepth = (((_b = root.left) === null || _b === void 0 ? void 0 : _b.level) === root.level ? rootDepth : rootDepth + 1);
        yield* nodesWithDepths(root.left, leftDepth);
    }
}
function formatTree(root, formatItem) {
    const lines = new Array();
    for (const { node, depth } of nodesWithDepths(root)) {
        lines.push(depth.toFixed(0) + ': ' + ' '.repeat(depth) + formatItem(node.item) + '(' + node.level + ')');
    }
    return lines.join('\n');
}
function addIfAbsent(root, item, compare) {
    if (!root) {
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
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            const leftUpdate = addIfAbsent(root.left, item, compare);
            root.left = leftUpdate.newRoot;
            return {
                newRoot: rebalanceAfterAdd(root),
                sizeDelta: leftUpdate.sizeDelta,
            };
        }
        else if (comparison > 0) {
            const rightUpdate = addIfAbsent(root.right, item, compare);
            root.right = rightUpdate.newRoot;
            return {
                newRoot: rebalanceAfterAdd(root),
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
function rebalanceAfterAdd(root) {
    return split(skew(root));
}
function removeIfPresent(root, item, compare) {
    if (!root) {
        return {
            newRoot: root,
            sizeDelta: 0,
        };
    }
    else {
        const comparison = compare(item, root.item);
        if (comparison < 0) {
            const leftUpdate = removeIfPresent(root.left, item, compare);
            root.left = leftUpdate.newRoot;
            return {
                newRoot: rebalanceAfterRemove(root),
                sizeDelta: leftUpdate.sizeDelta,
            };
        }
        else if (comparison > 0) {
            const rightUpdate = removeIfPresent(root.right, item, compare);
            root.right = rightUpdate.newRoot;
            return {
                newRoot: rebalanceAfterRemove(root),
                sizeDelta: rightUpdate.sizeDelta,
            };
        }
        else if (root.left) {
            const prev = rightmostDescendant(root.left);
            const leftUpdate = removeIfPresent(root.left, prev.item, compare);
            root.left = leftUpdate.newRoot;
            root.item = prev.item;
            return {
                newRoot: rebalanceAfterRemove(root),
                sizeDelta: leftUpdate.sizeDelta,
            };
        }
        else if (root.right) {
            const next = leftmostDescendant(root.right);
            const rightUpdate = removeIfPresent(root.right, next.item, compare);
            root.right = rightUpdate.newRoot;
            root.item = next.item;
            return {
                newRoot: rebalanceAfterRemove(root),
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
function rebalanceAfterRemove(root) {
    var _a, _b, _c, _d;
    const level = Math.min((_b = (_a = root.left) === null || _a === void 0 ? void 0 : _a.level) !== null && _b !== void 0 ? _b : 0, (_d = (_c = root.right) === null || _c === void 0 ? void 0 : _c.level) !== null && _d !== void 0 ? _d : 0) + 1;
    if (root.level > level) {
        root.level = level;
        if (root.right && root.right.level > level) {
            root.right.level = level;
        }
    }
    root = skew(root);
    if (root) {
        root.right = skew(root.right);
        if (root.right) {
            root.right.right = skew(root.right.right);
        }
    }
    root = split(root);
    if (root) {
        root.right = split(root.right);
    }
    return root;
}
function leftmostDescendant(node) {
    return (node.left ? leftmostDescendant(node.left) : node);
}
function rightmostDescendant(node) {
    return (node.right ? rightmostDescendant(node.right) : node);
}
function skew(root) {
    if (root && root.left && root.left.level === root.level) {
        const left = root.left;
        root.left = left.right;
        left.right = root;
        return left;
    }
    else {
        return root;
    }
}
function split(root) {
    if (root && root.right && root.right.right && root.right.right.level === root.level) {
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
function linkListenables(...listenables) {
    const disposers = new DisposerGroup();
    let alreadyFiring = false;
    const ensureAllFire = () => {
        if (!alreadyFiring) {
            alreadyFiring = true;
            try {
                for (const listenable of listenables) {
                    listenable.fire();
                }
            }
            finally {
                alreadyFiring = false;
            }
        }
    };
    for (const listenable of listenables) {
        disposers.add(listenable.addListener(IMMEDIATE, ensureAllFire));
    }
    return disposers;
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

var _a$3, _b$2;
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
        this[_a$3] = true;
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
_a$3 = IS_REF_SYMBOL;

class ReadableRefDerived {
    constructor(...listenables) {
        this[_b$2] = true;
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
_b$2 = IS_REF_SYMBOL;
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

const cssUrl$1 = new URL("assets/@metsci/gleam-core/69436c73-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink$1 = createCssLink(cssUrl$1);
function createGleamCoreDefaultStyle() {
    return cssLink$1.cloneNode(true);
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
function fracToByte(frac) {
    return Math.round(255 * clamp(0, 1, frac));
}
const TRANSPARENT = rgba(1, 1, 1, 0);
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GRAY = rgb(0.5, 0.5, 0.5);
const RED = rgb(1, 0, 0);
const GREEN = rgb(0, 1, 0);
const BLUE = rgb(0, 0, 1);
const CYAN = rgb(0, 1, 1);
const MAGENTA = rgb(1, 0, 1);
const YELLOW = rgb(1, 1, 0);
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
const GLSL_HIGHP_MAXVALUE = 2 ** 62;
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
class Float32Scratch {
    constructor() {
        this.values = new Float32Array(0);
    }
    getTempSpace(sizeFloats) {
        this.values = ensureHostBufferCapacity(this.values, sizeFloats, false);
        return this.values.subarray(0, sizeFloats);
    }
}
function put1f(array, i, a) {
    array[i++] = a;
    return i;
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
function put6f(array, i, a, b, c, d, e, f) {
    array[i++] = a;
    array[i++] = b;
    array[i++] = c;
    array[i++] = d;
    array[i++] = e;
    array[i++] = f;
    return i;
}
function putRgba(array, i, color) {
    return put4f(array, i, color.r, color.g, color.b, color.a);
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
function requireFloatTextureSupport(gl) {
    if (!(gl instanceof WebGL2RenderingContext || gl.getExtension('OES_texture_float'))) {
        throw new Error('Float textures aren\'t support');
    }
}
function requireVertexTexUnits(gl, numRequired) {
    const numSupported = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    if (numSupported < numRequired) {
        throw new Error(`Device doesn\'t support enough vertex-shader texture units: supported = ${numSupported}, required = ${numRequired}`);
    }
}
function activeTexture(gl, texUnit) {
    gl.activeTexture(GL.TEXTURE0 + texUnit);
}
function bindTexture(gl, texUnit, texture) {
    activeTexture(gl, texUnit);
    gl.bindTexture(GL.TEXTURE_2D, texture);
    return texUnit;
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

const CET_L01_RGB8UI = new Uint8Array([0, 0, 0, 1, 1, 1, 3, 3, 3, 4, 4, 4, 6, 6, 6, 7, 7, 7, 9, 9, 9, 10, 10, 10, 11, 11, 11, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 22, 22, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 26, 26, 26, 26, 26, 26, 27, 27, 27, 28, 28, 28, 29, 29, 29, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32, 32, 33, 33, 33, 33, 33, 33, 34, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 37, 37, 37, 37, 38, 38, 38, 39, 39, 39, 40, 40, 40, 41, 41, 41, 42, 42, 42, 42, 42, 42, 43, 43, 43, 44, 44, 44, 45, 45, 45, 46, 46, 46, 47, 47, 47, 47, 47, 47, 48, 48, 48, 49, 49, 49, 50, 50, 50, 51, 51, 51, 52, 52, 52, 53, 53, 53, 53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 56, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 59, 60, 60, 60, 60, 60, 61, 61, 61, 62, 62, 62, 63, 63, 63, 64, 64, 64, 65, 65, 65, 66, 66, 66, 67, 67, 67, 67, 67, 67, 68, 68, 68, 69, 69, 69, 70, 70, 70, 71, 71, 71, 72, 72, 72, 73, 73, 73, 74, 74, 74, 75, 75, 75, 76, 76, 76, 77, 77, 77, 77, 77, 77, 78, 78, 78, 79, 79, 79, 80, 80, 80, 81, 81, 81, 82, 82, 82, 83, 83, 83, 84, 84, 84, 85, 85, 85, 86, 86, 86, 87, 87, 87, 88, 88, 88, 89, 89, 89, 90, 90, 90, 90, 90, 90, 91, 91, 91, 92, 92, 92, 93, 93, 93, 94, 94, 94, 95, 95, 95, 96, 96, 96, 97, 97, 97, 98, 98, 98, 99, 99, 99, 100, 100, 100, 101, 101, 101, 102, 102, 102, 103, 103, 103, 104, 104, 104, 105, 105, 105, 106, 106, 106, 107, 107, 107, 108, 108, 108, 109, 109, 109, 110, 110, 110, 111, 111, 111, 112, 112, 112, 113, 113, 113, 113, 114, 114, 114, 114, 114, 115, 115, 115, 116, 116, 116, 117, 117, 117, 118, 118, 118, 119, 119, 119, 120, 120, 120, 121, 121, 121, 122, 122, 122, 123, 123, 123, 124, 124, 124, 125, 125, 125, 126, 126, 126, 127, 127, 127, 128, 128, 128, 129, 129, 129, 130, 130, 130, 131, 131, 131, 132, 132, 132, 133, 133, 133, 134, 134, 134, 135, 135, 135, 136, 136, 136, 137, 137, 137, 138, 138, 138, 139, 139, 139, 140, 140, 140, 141, 141, 141, 142, 143, 143, 144, 144, 144, 145, 145, 145, 146, 146, 146, 147, 147, 147, 148, 148, 148, 149, 149, 149, 150, 150, 150, 151, 151, 151, 152, 152, 152, 153, 153, 153, 154, 154, 154, 155, 155, 155, 156, 156, 156, 157, 157, 157, 158, 158, 158, 159, 159, 159, 160, 160, 160, 161, 161, 161, 162, 162, 162, 163, 163, 163, 164, 164, 164, 165, 165, 165, 166, 166, 166, 167, 167, 167, 168, 168, 168, 169, 169, 169, 170, 171, 171, 172, 172, 172, 173, 173, 173, 174, 174, 174, 175, 175, 175, 176, 176, 176, 177, 177, 177, 178, 178, 178, 179, 179, 179, 180, 180, 180, 181, 181, 181, 182, 182, 182, 183, 183, 183, 184, 184, 184, 185, 185, 185, 186, 186, 186, 188, 188, 188, 189, 189, 189, 190, 190, 190, 191, 191, 191, 192, 192, 192, 193, 193, 193, 194, 194, 194, 195, 195, 195, 196, 196, 196, 197, 197, 197, 198, 198, 198, 199, 199, 199, 200, 201, 201, 202, 202, 202, 203, 203, 203, 204, 204, 204, 205, 205, 205, 206, 206, 206, 207, 207, 207, 208, 208, 208, 209, 209, 209, 210, 210, 210, 211, 211, 211, 212, 213, 213, 214, 214, 214, 215, 215, 215, 216, 216, 216, 217, 217, 217, 218, 218, 218, 219, 219, 219, 220, 220, 220, 221, 221, 221, 222, 222, 222, 224, 224, 224, 225, 225, 225, 226, 226, 226, 227, 227, 227, 228, 228, 228, 229, 229, 229, 230, 230, 230, 231, 231, 231, 232, 232, 232, 234, 234, 234, 235, 235, 235, 236, 236, 236, 237, 237, 237, 238, 238, 238, 239, 239, 239, 240, 240, 240, 241, 241, 241, 243, 243, 243, 244, 244, 244, 245, 245, 245, 246, 246, 246, 247, 247, 247, 248, 248, 248, 249, 249, 249, 250, 250, 250, 252, 252, 252, 253, 253, 253, 254, 254, 254, 255, 255, 255]);
const CET_L01 = /*@__PURE__*/ newColorTableEntry('cet-L01', RGB8UI, GL.LINEAR, CET_L01_RGB8UI);

const MAGMA_RGB8UI = new Uint8Array([0, 0, 4, 1, 0, 5, 1, 1, 6, 1, 1, 8, 2, 1, 9, 2, 2, 11, 2, 2, 13, 3, 3, 15, 3, 3, 18, 4, 4, 20, 5, 4, 22, 6, 5, 24, 6, 5, 26, 7, 6, 28, 8, 7, 30, 9, 7, 32, 10, 8, 34, 11, 9, 36, 12, 9, 38, 13, 10, 41, 14, 11, 43, 16, 11, 45, 17, 12, 47, 18, 13, 49, 19, 13, 52, 20, 14, 54, 21, 14, 56, 22, 15, 59, 24, 15, 61, 25, 16, 63, 26, 16, 66, 28, 16, 68, 29, 17, 71, 30, 17, 73, 32, 17, 75, 33, 17, 78, 34, 17, 80, 36, 18, 83, 37, 18, 85, 39, 18, 88, 41, 17, 90, 42, 17, 92, 44, 17, 95, 45, 17, 97, 47, 17, 99, 49, 17, 101, 51, 16, 103, 52, 16, 105, 54, 16, 107, 56, 16, 108, 57, 15, 110, 59, 15, 112, 61, 15, 113, 63, 15, 114, 64, 15, 116, 66, 15, 117, 68, 15, 118, 69, 16, 119, 71, 16, 120, 73, 16, 120, 74, 16, 121, 76, 17, 122, 78, 17, 123, 79, 18, 123, 81, 18, 124, 82, 19, 124, 84, 19, 125, 86, 20, 125, 87, 21, 126, 89, 21, 126, 90, 22, 126, 92, 22, 127, 93, 23, 127, 95, 24, 127, 96, 24, 128, 98, 25, 128, 100, 26, 128, 101, 26, 128, 103, 27, 128, 104, 28, 129, 106, 28, 129, 107, 29, 129, 109, 29, 129, 110, 30, 129, 112, 31, 129, 114, 31, 129, 115, 32, 129, 117, 33, 129, 118, 33, 129, 120, 34, 129, 121, 34, 130, 123, 35, 130, 124, 35, 130, 126, 36, 130, 128, 37, 130, 129, 37, 129, 131, 38, 129, 132, 38, 129, 134, 39, 129, 136, 39, 129, 137, 40, 129, 139, 41, 129, 140, 41, 129, 142, 42, 129, 144, 42, 129, 145, 43, 129, 147, 43, 128, 148, 44, 128, 150, 44, 128, 152, 45, 128, 153, 45, 128, 155, 46, 127, 156, 46, 127, 158, 47, 127, 160, 47, 127, 161, 48, 126, 163, 48, 126, 165, 49, 126, 166, 49, 125, 168, 50, 125, 170, 51, 125, 171, 51, 124, 173, 52, 124, 174, 52, 123, 176, 53, 123, 178, 53, 123, 179, 54, 122, 181, 54, 122, 183, 55, 121, 184, 55, 121, 186, 56, 120, 188, 57, 120, 189, 57, 119, 191, 58, 119, 192, 58, 118, 194, 59, 117, 196, 60, 117, 197, 60, 116, 199, 61, 115, 200, 62, 115, 202, 62, 114, 204, 63, 113, 205, 64, 113, 207, 64, 112, 208, 65, 111, 210, 66, 111, 211, 67, 110, 213, 68, 109, 214, 69, 108, 216, 69, 108, 217, 70, 107, 219, 71, 106, 220, 72, 105, 222, 73, 104, 223, 74, 104, 224, 76, 103, 226, 77, 102, 227, 78, 101, 228, 79, 100, 229, 80, 100, 231, 82, 99, 232, 83, 98, 233, 84, 98, 234, 86, 97, 235, 87, 96, 236, 88, 96, 237, 90, 95, 238, 91, 94, 239, 93, 94, 240, 95, 94, 241, 96, 93, 242, 98, 93, 242, 100, 92, 243, 101, 92, 244, 103, 92, 244, 105, 92, 245, 107, 92, 246, 108, 92, 246, 110, 92, 247, 112, 92, 247, 114, 92, 248, 116, 92, 248, 118, 92, 249, 120, 93, 249, 121, 93, 249, 123, 93, 250, 125, 94, 250, 127, 94, 250, 129, 95, 251, 131, 95, 251, 133, 96, 251, 135, 97, 252, 137, 97, 252, 138, 98, 252, 140, 99, 252, 142, 100, 252, 144, 101, 253, 146, 102, 253, 148, 103, 253, 150, 104, 253, 152, 105, 253, 154, 106, 253, 155, 107, 254, 157, 108, 254, 159, 109, 254, 161, 110, 254, 163, 111, 254, 165, 113, 254, 167, 114, 254, 169, 115, 254, 170, 116, 254, 172, 118, 254, 174, 119, 254, 176, 120, 254, 178, 122, 254, 180, 123, 254, 182, 124, 254, 183, 126, 254, 185, 127, 254, 187, 129, 254, 189, 130, 254, 191, 132, 254, 193, 133, 254, 194, 135, 254, 196, 136, 254, 198, 138, 254, 200, 140, 254, 202, 141, 254, 204, 143, 254, 205, 144, 254, 207, 146, 254, 209, 148, 254, 211, 149, 254, 213, 151, 254, 215, 153, 254, 216, 154, 253, 218, 156, 253, 220, 158, 253, 222, 160, 253, 224, 161, 253, 226, 163, 253, 227, 165, 253, 229, 167, 253, 231, 169, 253, 233, 170, 253, 235, 172, 252, 236, 174, 252, 238, 176, 252, 240, 178, 252, 242, 180, 252, 244, 182, 252, 246, 184, 252, 247, 185, 252, 249, 187, 252, 251, 189, 252, 253, 191]);
const MAGMA = /*@__PURE__*/ newColorTableEntry('magma', RGB8UI, GL.LINEAR, MAGMA_RGB8UI);

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
function glUniformSize2D(gl, location, size) {
    gl.uniform2f(location, size.w, size.h);
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

var _a$2, _b$1;
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
        this[_b$1] = true;
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
_b$1 = UNBOUND_STYLE_PROP_SYMBOL;
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
const cursorGrabDistance_LPX = 7;
function createAxisCursorInputHandler1D(axis, axisType, cursorCoord, hoveredRef, grabDistance_LPX = cursorGrabDistance_LPX) {
    const target = cursorCoord;
    const getMouseCursorClasses = frozenSupplier(axisType === X ? ['x-tag-dragger'] : ['y-tag-dragger']);
    function getMouseCoord(ev) {
        return getMouseAxisCoord1D(axis, axisType, ev);
    }
    return {
        getHoverHandler(evMove) {
            const cursorValue = cursorCoord.v;
            const moveCoord = getMouseCoord(evMove);
            const moveOffset = (isNonNullish(cursorValue) ? moveCoord - cursorValue : undefined);
            if (axis.bounds.containsPoint(moveCoord) && isDefined(moveOffset) && abs(moveOffset) <= grabDistance_LPX / axis.scale) {
                return {
                    target,
                    getMouseCursorClasses,
                    handleHover: () => hoveredRef === null || hoveredRef === void 0 ? void 0 : hoveredRef.set(true, true),
                    handleUnhover: () => hoveredRef === null || hoveredRef === void 0 ? void 0 : hoveredRef.set(true, false),
                };
            }
            return null;
        },
        getDragHandler(evGrab) {
            if (evGrab.button === 0) {
                const cursorValue = cursorCoord.v;
                const grabCoord = getMouseCoord(evGrab);
                const grabOffset = (evGrab.pressCount > 1 ? 0 : isNonNullish(cursorValue) ? grabCoord - cursorValue : undefined);
                if (axis.bounds.containsPoint(grabCoord) && isDefined(grabOffset) && abs(grabOffset) <= grabDistance_LPX / axis.scale) {
                    return {
                        target,
                        getMouseCursorClasses,
                        handleHover: () => hoveredRef === null || hoveredRef === void 0 ? void 0 : hoveredRef.set(true, true),
                        handleUnhover: () => hoveredRef === null || hoveredRef === void 0 ? void 0 : hoveredRef.set(true, false),
                        handleGrab: () => cursorCoord.set(true, getMouseCoord(evGrab) - grabOffset),
                        handleDrag: evDrag => cursorCoord.set(true, getMouseCoord(evDrag) - grabOffset),
                        handleUngrab: evUngrab => cursorCoord.set(false, getMouseCoord(evUngrab) - grabOffset)
                    };
                }
            }
            return null;
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

function chainTagConstraints(...constraintFns) {
    return (ongoing, map, changingKeys) => {
        for (const constraintFn of constraintFns) {
            constraintFn(ongoing, map, changingKeys);
        }
    };
}
function createStdTagConstraint(minLimit, maxLimit, keysInOrder) {
    return chainTagConstraints(createMinMaxConstraint(minLimit, maxLimit), createTagOrderConstraint(...keysInOrder));
}
function createMinMaxConstraint(minLimit, maxLimit) {
    return (ongoing, map, changingKeys) => {
        let minCoord = Number.POSITIVE_INFINITY;
        let maxCoord = Number.NEGATIVE_INFINITY;
        for (const key of changingKeys) {
            const tag = map.get(key);
            if (tag) {
                const coord = tag.coord.v;
                minCoord = Math.min(minCoord, coord);
                maxCoord = Math.max(maxCoord, coord);
            }
        }
        let shift = 0.0;
        if (maxCoord > maxLimit) {
            shift = maxLimit - maxCoord;
        }
        else if (minCoord < minLimit) {
            shift = minLimit - minCoord;
        }
        if (shift !== 0.0) {
            for (const key of changingKeys) {
                const tag = map.get(key);
                if (tag) {
                    const oldCoord = tag.coord.v;
                    const newCoord = clamp(minLimit, maxLimit, oldCoord + shift);
                    tag.coord.set(ongoing, newCoord);
                }
            }
        }
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
const { max: max$1$1, min: min$2 } = Math;
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
function createHoverAndFocusRefs(pane) {
    const hoverTargetRef = new RefBasic(undefined, equal);
    const focusTargetRef = new RefBasic(undefined, equal);
    attachHoverAndFocusRefs(pane, hoverTargetRef, focusTargetRef);
    return [hoverTargetRef, focusTargetRef];
}
function attachHoverAndFocusRefs(pane, hoverTargetRef, focusTargetRef) {
    const disposers = new DisposerGroup();
    disposers.add(attachHoverRef(pane, hoverTargetRef));
    disposers.add(attachFocusRef(pane, focusTargetRef));
    return disposers;
}
function attachHoverRef(pane, hoverTargetRef) {
    return pane.inputSpectators.add({
        handleHover: target => hoverTargetRef.set(true, target),
        handleUnhover: () => hoverTargetRef.set(true, undefined),
    });
}
function attachFocusRef(pane, focusTargetRef) {
    return pane.inputSpectators.add({
        handleFocus: target => focusTargetRef.set(false, target),
        handleUnfocus: () => focusTargetRef.set(false, undefined),
    });
}
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
            const numToDispose = max$1$1(min$2(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
            const numToDispose = max$1$1(min$2(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
            const numToDispose = max$1$1(min$2(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
class AxisDivider extends ValueBase2 {
    constructor(
    
    axisFrac) {
        super();
        this.axisFrac = axisFrac;
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
const validScaleMin = nextUpFloat64(1.0 / Number.MAX_VALUE);
Object.freeze(Interval1D.fromEdges(validScaleMin, 1.0 / validScaleMin));

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

class ColumnsLayout extends LayoutBase {
    constructor() {
        super('columns-layout');
        this.rightToLeft = StyleProp.create(this.style, '--right-to-left', cssBoolean, false);
        this.gapBetweenColumns_LPX = StyleProp.create(this.style, '--gap-between-columns-px', cssFloat, 0);
        this.columnWidth = UnboundStyleProp.create('--column-width', cssString, 'flex(0,pref)');
        this._visibleColumnKeys = new LinkedSet();
    }
    get visibleColumnKeys() {
        return this._visibleColumnKeys;
    }
    computePrefSize_PX(children) {
        updateChildRowKeys$1(children);
        this._visibleColumnKeys = updateChildColumnKeys$1(children);
        return computeGridPrefSize_PX(currentDpr(this), children, SINGLE_ROW_CONFIG, this);
    }
    computeChildViewports_PX(viewport_PX, children) {
        return computeGridChildViewports_PX(currentDpr(this), viewport_PX, children, SINGLE_ROW_CONFIG, this);
    }
}
const SINGLE_ROW_CONFIG = Object.freeze({
    topToBottom: { get() { return true; } },
    gapBetweenRows_LPX: { get() { return 0; } },
    rowHeight: { get() { return 'flex(0,pref)'; } },
    visibleRowKeys: newImmutableSet([]),
});
function updateChildRowKeys$1(children) {
    for (const child of children) {
        if (child.isVisible()) {
            setRowKey(child, 'ALL');
        }
    }
}
function updateChildColumnKeys$1(children) {
    const visibleColumnKeys = new LinkedSet();
    let nextChildNum = 0;
    for (const child of children) {
        const childNum = nextChildNum++;
        if (child.isVisible()) {
            const columnKey = childNum.toFixed();
            setColumnKey(child, columnKey);
            visibleColumnKeys.add(columnKey);
        }
    }
    return visibleColumnKeys;
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

class RowsLayout extends LayoutBase {
    constructor() {
        super('rows-layout');
        this.topToBottom = StyleProp.create(this.style, '--top-to-bottom', cssBoolean, false);
        this.gapBetweenRows_LPX = StyleProp.create(this.style, '--gap-between-rows-px', cssFloat, 0);
        this.rowHeight = UnboundStyleProp.create('--row-height', cssString, 'flex(0,pref)');
        this._visibleRowKeys = new LinkedSet();
    }
    get visibleRowKeys() {
        return this._visibleRowKeys;
    }
    computePrefSize_PX(children) {
        updateChildColumnKeys(children);
        this._visibleRowKeys = updateChildRowKeys(children);
        return computeGridPrefSize_PX(currentDpr(this), children, this, SINGLE_COLUMN_CONFIG);
    }
    computeChildViewports_PX(viewport_PX, children) {
        return computeGridChildViewports_PX(currentDpr(this), viewport_PX, children, this, SINGLE_COLUMN_CONFIG);
    }
}
const SINGLE_COLUMN_CONFIG = Object.freeze({
    rightToLeft: { get() { return true; } },
    gapBetweenColumns_LPX: { get() { return 0; } },
    columnWidth: { get() { return 'flex(0,pref)'; } },
    visibleColumnKeys: newImmutableSet([]),
});
function updateChildColumnKeys(children) {
    for (const child of children) {
        if (child.isVisible()) {
            setColumnKey(child, 'ALL');
        }
    }
}
function updateChildRowKeys(children) {
    const visibleRowKeys = new LinkedSet();
    let nextChildNum = 0;
    for (const child of children) {
        const childNum = nextChildNum++;
        if (child.isVisible()) {
            const rowKey = childNum.toFixed();
            setRowKey(child, rowKey);
            visibleRowKeys.add(rowKey);
        }
    }
    return visibleRowKeys;
}

class VerticalScrollerLayout extends LayoutBase {
    constructor() {
        super('vertical-scroller-layout');
        this.yOffset_PX = 0;
        this.hContent_PX = 0;
        this.hVisible_PX = 0;
    }
    computePrefSize_PX(children) {
        var _a, _b;
        return ((_b = (_a = getScrollerChild(children)) === null || _a === void 0 ? void 0 : _a.getPrefSize_PX()) !== null && _b !== void 0 ? _b : Size2D.ZERO);
    }
    computeChildViewports_PX(viewport_PX, children) {
        const childViewports_PX = new Map();
        const child = getScrollerChild(children);
        if (child) {
            const hChild_PX = Math.max(child.getPrefSize_PX().h, viewport_PX.h);
            let yChildMin_PX;
            if (hChild_PX <= viewport_PX.h) {
                yChildMin_PX = viewport_PX.yMax - hChild_PX;
            }
            else {
                yChildMin_PX = Math.min(viewport_PX.yMin, viewport_PX.yMax - hChild_PX + Math.max(0, this.yOffset_PX));
            }
            childViewports_PX.set(child, viewport_PX.withYEdges(yChildMin_PX, yChildMin_PX + hChild_PX));
            this.yOffset_PX = (yChildMin_PX + hChild_PX) - viewport_PX.yMax;
            this.hContent_PX = hChild_PX;
            this.hVisible_PX = viewport_PX.h;
        }
        return childViewports_PX;
    }
}
function getScrollerChild(children) {
    const visibles = [];
    for (const child of children) {
        if (child.isVisible()) {
            visibles.push(child);
        }
    }
    if (visibles.length > 1) {
        throw new Error('Scroller layout only works with 1 visible child, but pane has ' + visibles.length);
    }
    else if (visibles.length === 1) {
        return visibles[0];
    }
    else {
        return null;
    }
}

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

const FILL_PROG_SOURCE = Object.freeze({
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
const LINE_PROG_SOURCE = Object.freeze({
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
const POINT_PROG_SOURCE = Object.freeze({
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
function indicateDataBelowMin(mode) {
    switch (mode) {
        case BasicLineOffscreenDataIndicator.ON: return true;
        case BasicLineOffscreenDataIndicator.MIN: return true;
        default: return false;
    }
}
function indicateDataAboveMax(mode) {
    switch (mode) {
        case BasicLineOffscreenDataIndicator.ON: return true;
        case BasicLineOffscreenDataIndicator.MAX: return true;
        default: return false;
    }
}
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
function relativeCoordFn(coordFn, refCoord) {
    if (refCoord === undefined || refCoord === 0) {
        return coordFn;
    }
    else {
        return i => {
            const coord = coordFn(i);
            return (coord === undefined ? undefined : coord - refCoord);
        };
    }
}
function relativizeLine(line, xRef, yRef) {
    return {
        length: line.length,
        x: relativeCoordFn(line.x, xRef),
        y: relativeCoordFn(line.y, yRef),
        connect: line.connect,
    };
}
function relativizeInputs(inputs, xRef, yRef) {
    const { lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline } = inputs;
    switch (fillMode) {
        case BasicLineFillMode.OFF: {
            return inputs;
        }
        case BasicLineFillMode.VERTICAL: {
            if (yRef === undefined || yRef === 0) {
                return inputs;
            }
            else {
                return new CoordInputs(lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline - yRef);
            }
        }
        case BasicLineFillMode.HORIZONTAL: {
            if (xRef === undefined || xRef === 0) {
                return inputs;
            }
            else {
                return new CoordInputs(lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline - xRef);
            }
        }
        default: {
            throw new Error('Unsupported fill mode: ' + fillMode);
        }
    }
}
class CoordInputs extends ValueBase2 {
    constructor(lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline) {
        super();
        this.lineMode = lineMode;
        this.riserMode = riserMode;
        this.stepAlign = stepAlign;
        this.dotMode = dotMode;
        this.fillMode = fillMode;
        this.fillBaseline = fillBaseline;
    }
}
function getBasicLineCoords(line, inputs, scratch) {
    const { lineMode, stepAlign } = inputs;
    switch (lineMode) {
        case BasicLineLineMode.OFF: return getCoords_NOLINES(line, inputs, scratch);
        case BasicLineLineMode.STRAIGHT: return getCoords_STRAIGHT(line, inputs, scratch);
        case BasicLineLineMode.STEP_UP_DOWN: {
            switch (stepAlign) {
                case BasicLineStepAlign.BEFORE_DATAPOINT: return getCoords_STEP_UD_BEFORE(line, inputs, scratch);
                case BasicLineStepAlign.CENTERED_ON_DATAPOINT: return getCoords_STEP_UD_CENTERED(line, inputs, scratch);
                case BasicLineStepAlign.AFTER_DATAPOINT: return getCoords_STEP_UD_AFTER(line, inputs, scratch);
                default: throw new Error('Unsupported step align: ' + stepAlign);
            }
        }
        case BasicLineLineMode.STEP_LEFT_RIGHT: {
            switch (stepAlign) {
                case BasicLineStepAlign.BEFORE_DATAPOINT: return getCoords_STEP_LR_BEFORE(line, inputs, scratch);
                case BasicLineStepAlign.CENTERED_ON_DATAPOINT: return getCoords_STEP_LR_CENTERED(line, inputs, scratch);
                case BasicLineStepAlign.AFTER_DATAPOINT: return getCoords_STEP_LR_AFTER(line, inputs, scratch);
                default: throw new Error('Unsupported step align: ' + stepAlign);
            }
        }
        default: throw new Error('Unsupported line mode: ' + lineMode);
    }
}
function getCoords_NOLINES(line, inputs, scratch) {
    const { dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxPointCount = length;
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i + 0);
        const yCurr = y(i + 0);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasNext) {
                
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xNext, yNext);
            }
            if (dotMode === BasicLineDotMode.ALL || dotMode === BasicLineDotMode.SOLO) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: 0,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STRAIGHT(line, inputs, scratch) {
    const { dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = length - 1;
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return 1 * length;
            case BasicLineDotMode.ALL: return 2 * length;
            case BasicLineDotMode.SOLO: return 1 * length;
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i + 0);
        const yCurr = y(i + 0);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasPrev || hasNext) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 0);
            }
            if (hasNext) {
                
                iLine = putLineSegment(hLineCoords, iLine, xCurr, yCurr, xNext, yNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xNext, yNext);
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext)) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}

function getCoords_STEP_UD_CENTERED(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = length + (risers ? length - 1 : 0);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return 2 * length;
            case BasicLineDotMode.ALL: return 3 * length;
            case BasicLineDotMode.SOLO: return 2 * length;
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasPrev || hasNext) {
                
                let x0 = (hasPrev ? 0.5 * (xPrev + xCurr) : xCurr);
                let x1 = (hasNext ? 0.5 * (xCurr + xNext) : xCurr);
                if ((x0 < xCurr && x1 < xCurr) || (x0 > xCurr && x1 > xCurr)) {
                    if (Math.abs(x0 - xCurr) < Math.abs(x1 - xCurr)) {
                        x0 = xCurr;
                    }
                    else {
                        x1 = xCurr;
                    }
                }
                if (yCurr !== yPrev) {
                    iPoint = put3f(hPointCoords, iPoint, x0, yCurr, 0);
                }
                iLine = putLineSegment(hLineCoords, iLine, x0, yCurr, x1, yCurr);
                iFill = putFillSegment(hFillCoords, iFill, inputs, x0, yCurr, x1, yCurr);
                if (yCurr !== yNext) {
                    iPoint = put3f(hPointCoords, iPoint, x1, yCurr, 0);
                }
            }
            if (hasNext) {
                
                const x1 = 0.5 * (xCurr + xNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, x1, yCurr, x1, yNext);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, x1, yCurr, x1, yNext);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext)) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STEP_LR_CENTERED(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = length + (risers ? length - 1 : 0);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return 2 * length;
            case BasicLineDotMode.ALL: return 3 * length;
            case BasicLineDotMode.SOLO: return 2 * length;
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasPrev || hasNext) {
                
                let y0 = (hasPrev ? 0.5 * (yPrev + yCurr) : yCurr);
                let y1 = (hasNext ? 0.5 * (yCurr + yNext) : yCurr);
                if ((y0 < yCurr && y1 < yCurr) || (y0 > yCurr && y1 > yCurr)) {
                    if (Math.abs(y0 - yCurr) < Math.abs(y1 - yCurr)) {
                        y0 = yCurr;
                    }
                    else {
                        y1 = yCurr;
                    }
                }
                if (xCurr !== xPrev) {
                    iPoint = put3f(hPointCoords, iPoint, xCurr, y0, 0);
                }
                iLine = putLineSegment(hLineCoords, iLine, xCurr, y0, xCurr, y1);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, y0, xCurr, y1);
                if (xCurr !== xNext) {
                    iPoint = put3f(hPointCoords, iPoint, xCurr, y1, 0);
                }
            }
            if (hasNext) {
                
                const y1 = 0.5 * (yCurr + yNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, y1, xNext, y1);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, xCurr, y1, xNext, y1);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && !hasPrev && !hasNext)) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STEP_UD_BEFORE(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = (risers ? 2 * length - 2 : length - 1);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return (2 * length - 1);
            case BasicLineDotMode.ALL: return (3 * length - 1);
            case BasicLineDotMode.SOLO: return (2 * length - 1);
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasPrev || (hasNext && risers)) {
                if (yCurr !== yPrev || !hasPrev || !hasNext) {
                    
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 0);
                }
            }
            if (hasNext) {
                
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xCurr, yNext);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, xCurr, yCurr, xCurr, yNext);
                }
            }
            if (hasNext) {
                
                iLine = putLineSegment(hLineCoords, iLine, xCurr, yNext, xNext, yNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yNext, xNext, yNext);
                if (yCurr !== yNext) {
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yNext, 0);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && !hasPrev && (!hasNext || !risers))) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STEP_LR_BEFORE(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = (risers ? 2 * length - 2 : length - 1);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return (2 * length - 1);
            case BasicLineDotMode.ALL: return (3 * length - 1);
            case BasicLineDotMode.SOLO: return (2 * length - 1);
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if (hasPrev || (hasNext && risers)) {
                if (xCurr !== xPrev || !hasPrev || !hasNext) {
                    
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 0);
                }
            }
            if (hasNext) {
                
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xNext, yCurr);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, xCurr, yCurr, xNext, yCurr);
                }
            }
            if (hasNext) {
                
                iLine = putLineSegment(hLineCoords, iLine, xNext, yCurr, xNext, yNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xNext, yCurr, xNext, yNext);
                if (xCurr !== xNext) {
                    iPoint = put3f(hPointCoords, iPoint, xNext, yCurr, 0);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && !hasPrev && (!hasNext || !risers))) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STEP_UD_AFTER(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = (risers ? 2 * length - 2 : length - 1);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return (2 * length - 1);
            case BasicLineDotMode.ALL: return (3 * length - 1);
            case BasicLineDotMode.SOLO: return (2 * length - 1);
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if ((hasPrev && risers) || hasNext) {
                if (yCurr !== yPrev || !hasPrev || !hasNext) {
                    
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 0);
                }
            }
            if (hasNext) {
                
                iLine = putLineSegment(hLineCoords, iLine, xCurr, yCurr, xNext, yCurr);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xNext, yCurr);
                if (yCurr !== yNext) {
                    iPoint = put3f(hPointCoords, iPoint, xNext, yCurr, 0);
                }
            }
            if (hasNext) {
                
                iFill = putFillSegment(hFillCoords, iFill, inputs, xNext, yCurr, xNext, yNext);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, xNext, yCurr, xNext, yNext);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && (!hasPrev || !risers) && !hasNext)) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function getCoords_STEP_LR_AFTER(line, inputs, scratch) {
    const { riserMode, dotMode } = inputs;
    const { length, x, y, connect = alwaysTrue } = line;
    const risers = (riserMode === BasicLineRiserMode.ON);
    let { hLineCoords, hPointCoords, hFillCoords } = scratch;
    const maxLineCount = (risers ? 2 * length - 2 : length - 1);
    const maxLineCoordCount = maxLineCount * 6 * 4;
    hLineCoords = ensureHostBufferCapacity(hLineCoords, maxLineCoordCount);
    const maxPointCount = run(() => {
        switch (dotMode) {
            case BasicLineDotMode.OFF: return (2 * length - 1);
            case BasicLineDotMode.ALL: return (3 * length - 1);
            case BasicLineDotMode.SOLO: return (2 * length - 1);
        }
    });
    const maxPointCoordCount = maxPointCount * 3;
    hPointCoords = ensureHostBufferCapacity(hPointCoords, maxPointCoordCount);
    const maxFillSegmentCount = length - 1;
    const maxFillCoordCount = 2 * (maxFillSegmentCount * 6 * 2);
    hFillCoords = ensureHostBufferCapacity(hFillCoords, maxFillCoordCount);
    let iLine = 0;
    let iPoint = 0;
    let iFill = 0;
    for (let i = 0; i < length; i++) {
        const xCurr = x(i);
        const yCurr = y(i);
        if (isDefined(xCurr) && isDefined(yCurr)) {
            const connectPrev = (i - 1 >= 0 ? connect(i - 1) : false);
            const connectNext = (i + 1 < length ? connect(i) : false);
            const xPrev = (connectPrev ? x(i - 1) : undefined);
            const yPrev = (connectPrev ? y(i - 1) : undefined);
            const xNext = (connectNext ? x(i + 1) : undefined);
            const yNext = (connectNext ? y(i + 1) : undefined);
            const hasPrev = (isDefined(xPrev) && isDefined(yPrev));
            const hasNext = (isDefined(xNext) && isDefined(yNext));
            if ((hasPrev && risers) || hasNext) {
                if (xCurr !== xPrev || !hasPrev || !hasNext) {
                    
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 0);
                }
            }
            if (hasNext) {
                
                iLine = putLineSegment(hLineCoords, iLine, xCurr, yCurr, xCurr, yNext);
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yCurr, xCurr, yNext);
                if (xCurr !== xNext) {
                    iPoint = put3f(hPointCoords, iPoint, xCurr, yNext, 0);
                }
            }
            if (hasNext) {
                
                iFill = putFillSegment(hFillCoords, iFill, inputs, xCurr, yNext, xNext, yNext);
                if (risers) {
                    
                    iLine = putLineSegment(hLineCoords, iLine, xCurr, yNext, xNext, yNext);
                }
            }
            if (dotMode === BasicLineDotMode.ALL || (dotMode === BasicLineDotMode.SOLO && (!hasPrev || !risers) && !hasNext)) {
                
                iPoint = put3f(hPointCoords, iPoint, xCurr, yCurr, 1);
            }
        }
    }
    return {
        hLineCoords,
        hPointCoords,
        hFillCoords,
        hLineCoordsCount: iLine,
        hPointCoordsCount: iPoint,
        hFillCoordsCount: iFill,
    };
}
function putLineSegment(array, i, x0, y0, x1, y1) {
    const dxForward = x1 - x0;
    const dyForward = y1 - y0;
    if (dxForward !== 0 || dyForward !== 0) {
        i = put4f(array, i, x1, y1, -dxForward, -dyForward);
        i = put4f(array, i, x0, y0, -dxForward, -dyForward);
        i = put4f(array, i, x1, y1, +dxForward, +dyForward);
        i = put4f(array, i, x1, y1, +dxForward, +dyForward);
        i = put4f(array, i, x0, y0, -dxForward, -dyForward);
        i = put4f(array, i, x0, y0, +dxForward, +dyForward);
    }
    return i;
}
function putFillSegment(array, i, inputs, x0, y0, x1, y1) {
    const { fillMode, fillBaseline } = inputs;
    switch (fillMode) {
        case BasicLineFillMode.OFF:
            break;
        case BasicLineFillMode.VERTICAL:
            {
                const yB = clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, fillBaseline);
                if ((y0 < yB && yB < y1) || (y1 < yB && yB < y0)) {
                    const xB = x0 + ((x1 - x0) * (yB - y0) / (y1 - y0));
                    i = put6f(array, i, x0, y0, x0, yB, xB, yB);
                    i = put6f(array, i, xB, yB, x1, yB, x1, y1);
                }
                else {
                    i = put6f(array, i, x0, y0, x0, yB, x1, y1);
                    i = put6f(array, i, x1, y1, x0, yB, x1, yB);
                }
            }
            break;
        case BasicLineFillMode.HORIZONTAL:
            {
                const xB = clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, fillBaseline);
                if ((x0 < xB && xB < x1) || (x1 < xB && xB < x0)) {
                    const yB = y0 + ((y1 - y0) * (xB - x0) / (x1 - x0));
                    i = put6f(array, i, x0, y0, xB, y0, xB, yB);
                    i = put6f(array, i, xB, yB, xB, y1, x1, y1);
                }
                else {
                    i = put6f(array, i, x0, y0, xB, y0, x1, y1);
                    i = put6f(array, i, x1, y1, xB, y0, xB, y1);
                }
            }
            break;
        default: {
            throw new Error('Unsupported fill mode: ' + fillMode);
        }
    }
    return i;
}

const FEATHER_PX = 1.5;

class BasicLinePainter {
    constructor(xyBoundsFn = frozenSupplier(Interval2D.fromEdges(0, 1, 0, 1))) {
        this.peer = createDomPeer('basic-line-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.lineMode = StyleProp.create(this.style, '--line-mode', cssEnum(BasicLineLineMode), 'straight');
        this.lineStepAlign = StyleProp.create(this.style, '--line-step-align', cssEnum(BasicLineStepAlign), 'centered-on-datapoint');
        this.lineRiserMode = StyleProp.create(this.style, '--line-step-risers', cssEnum(BasicLineRiserMode), 'on');
        this.lineColor = StyleProp.create(this.style, '--line-color', cssColor, 'rgb(0,0,0)');
        this.lineThickness_LPX = StyleProp.create(this.style, '--line-thickness-px', cssFloat, 1);
        this.dotMode = StyleProp.create(this.style, '--dot-mode', cssEnum(BasicLineDotMode), 'solo');
        this.dotColor = StyleProp.create(this.style, '--dot-color', cssColor, this.lineColor);
        this.dotDiameter_LPX = StyleProp.create2(this.style, '--dot-diameter-px', cssFloat, () => {
            switch (this.dotMode.get()) {
                case BasicLineDotMode.ALL: return 5;
                case BasicLineDotMode.SOLO: return (1.2 * this.lineThickness_LPX.get());
                default: return 0;
            }
        });
        this.fillMode = StyleProp.create(this.style, '--fill-mode', cssEnum(BasicLineFillMode), 'off');
        this.fillColor = StyleProp.create2(this.style, '--fill-color', cssColor, () => {
            return this.lineColor.get().withUpdatedAlpha(a => 0.5 * a);
        });
        this.fillBaseline = StyleProp.create(this.style, '--fill-baseline', cssFloat, 0);
        this.offscreenDataIndicatorX = StyleProp.create(this.style, '--offscreen-data-indicator-x', cssEnum(BasicLineOffscreenDataIndicator), 'off');
        this.offscreenDataIndicatorY = StyleProp.create(this.style, '--offscreen-data-indicator-y', cssEnum(BasicLineOffscreenDataIndicator), 'off');
        this.offscreenDataIndicatorColor = StyleProp.create(this.style, '--offscreen-data-indicator-color', cssColor, this.dotColor);
        this.offscreenDataIndicatorDiameter_LPX = StyleProp.create(this.style, '--offscreen-data-indicator-diameter-px', cssFloat, this.dotDiameter_LPX);
        this.visible = new RefBasic(true, tripleEquals);
        this.xyBoundsFn = xyBoundsFn;
        this.line = undefined;
        this.xRef = 0;
        this.yRef = 0;
        this.scratch = {
            hLineCoords: new Float32Array(0),
            hPointCoords: new Float32Array(0),
            hFillCoords: new Float32Array(0),
        };
        this.glIncarnation = null;
        this.dLineCoords = null;
        this.dLineCoordsCapacityBytes = -1;
        this.dLineCoordsCount = -1;
        this.dPointCoords = null;
        this.dPointCoordsCapacityBytes = -1;
        this.dPointCoordsCount = -1;
        this.dFillCoords = null;
        this.dFillCoordsCapacityBytes = -1;
        this.dFillCoordsCount = -1;
        this.dLine = undefined;
        this.dCoordInputs = undefined;
    }
    
    paint(context, viewport_PX) {
        var _a, _b, _c, _d, _e, _f;
        
        const lineMode = this.lineMode.get();
        const riserMode = this.lineRiserMode.get();
        const stepAlign = this.lineStepAlign.get();
        const lineColor = this.lineColor.get();
        const lineThickness_LPX = this.lineThickness_LPX.get();
        const dotMode = this.dotMode.get();
        const dotColor = this.dotColor.get();
        const dotDiameter_LPX = this.dotDiameter_LPX.get();
        const offscreenDataIndicatorColor = this.offscreenDataIndicatorColor.get();
        const offscreenDataIndicatorDiameter_LPX = this.offscreenDataIndicatorDiameter_LPX.get();
        const fillMode = this.fillMode.get();
        const fillColor = this.fillColor.get();
        const fillBaseline = this.fillBaseline.get();
        const offscreenDataIndicatorX = this.offscreenDataIndicatorX.get();
        const offscreenDataIndicatorY = this.offscreenDataIndicatorY.get();
        const indicateDataBelowMinX = indicateDataBelowMin(offscreenDataIndicatorX);
        const indicateDataAboveMaxX = indicateDataAboveMax(offscreenDataIndicatorX);
        const indicateDataBelowMinY = indicateDataBelowMin(offscreenDataIndicatorY);
        const indicateDataAboveMaxY = indicateDataAboveMax(offscreenDataIndicatorY);
        
        const dpr = currentDpr(this);
        const lineThickness_PX = lineThickness_LPX * dpr;
        const dotDiameter_PX = dotDiameter_LPX * dpr;
        const offscreenDataIndicatorDiameter_PX = offscreenDataIndicatorDiameter_LPX * dpr;
        const gl = context.gl;
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dLineCoords = gl.createBuffer();
            this.dLineCoordsCapacityBytes = -1;
            this.dLineCoordsCount = -1;
            this.dPointCoords = gl.createBuffer();
            this.dPointCoordsCapacityBytes = -1;
            this.dPointCoordsCount = -1;
            this.dFillCoords = gl.createBuffer();
            this.dFillCoordsCapacityBytes = -1;
            this.dFillCoordsCount = -1;
            this.dCoordInputs = undefined;
        }
        
        const coordInputs = new CoordInputs(lineMode, riserMode, stepAlign, dotMode, fillMode, fillBaseline);
        if (this.line !== this.dLine || !equal(coordInputs, this.dCoordInputs)) {
            if (this.line && this.line.length > 0) {
                if (isDefined(this.line.xRef) && isDefined(this.line.yRef)) {
                    this.xRef = this.line.xRef;
                    this.yRef = this.line.yRef;
                }
                else {
                    this.xRef = (_a = this.line.xRef) !== null && _a !== void 0 ? _a : 0;
                    this.yRef = (_b = this.line.yRef) !== null && _b !== void 0 ? _b : 0;
                    for (let i = this.line.length - 1; i >= 0; i--) {
                        const x = this.line.x(i);
                        const y = this.line.y(i);
                        if (isDefined(x) && isDefined(y) && !Number.isNaN(x) && !Number.isNaN(y)) {
                            this.xRef = (_c = this.line.xRef) !== null && _c !== void 0 ? _c : x;
                            this.yRef = (_d = this.line.yRef) !== null && _d !== void 0 ? _d : y;
                            break;
                        }
                    }
                }
                const relativeLine = relativizeLine(this.line, this.xRef, this.yRef);
                const relativeInputs = relativizeInputs(coordInputs, this.xRef, this.yRef);
                const coords = getBasicLineCoords(relativeLine, relativeInputs, this.scratch);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dLineCoords);
                this.dLineCoordsCount = coords.hLineCoordsCount;
                this.dLineCoordsCapacityBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dLineCoordsCapacityBytes, coords.hLineCoords, this.dLineCoordsCount);
                this.scratch.hLineCoords = coords.hLineCoords;
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dPointCoords);
                this.dPointCoordsCount = coords.hPointCoordsCount;
                this.dPointCoordsCapacityBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dPointCoordsCapacityBytes, coords.hPointCoords, this.dPointCoordsCount);
                this.scratch.hPointCoords = coords.hPointCoords;
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dFillCoords);
                this.dFillCoordsCount = coords.hFillCoordsCount;
                this.dFillCoordsCapacityBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dFillCoordsCapacityBytes, coords.hFillCoords, this.dFillCoordsCount);
                this.scratch.hFillCoords = coords.hFillCoords;
            }
            else {
                this.dLineCoordsCount = 0;
                this.dPointCoordsCount = 0;
                this.dFillCoordsCount = 0;
            }
            this.dLine = this.line;
            this.dCoordInputs = coordInputs;
        }
        
        const xBoundsShift = -((_e = this.xRef) !== null && _e !== void 0 ? _e : 0);
        const yBoundsShift = -((_f = this.yRef) !== null && _f !== void 0 ? _f : 0);
        const xyBounds = this.xyBoundsFn().shift(xBoundsShift, yBoundsShift);
        
        enablePremultipliedAlphaBlending(gl);
        
        const fillVertexCount = Math.floor(this.dFillCoordsCount / 2);
        if (fillVertexCount > 0 && fillColor.a > 0) {
            const { program, attribs, uniforms } = context.getProgram(FILL_PROG_SOURCE);
            gl.disable(gl.CULL_FACE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inCoords);
            try {
                glUniformInterval2D(gl, uniforms.AXIS_LIMITS, xyBounds);
                glUniformRgba(gl, uniforms.COLOR, fillColor);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dFillCoords);
                gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.TRIANGLES, 0, fillVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inCoords);
                gl.useProgram(null);
            }
        }
        
        const lineVertexCount = Math.floor(this.dLineCoordsCount / 4);
        if (lineVertexCount > 0 && lineColor.a > 0 && lineThickness_PX > 0) {
            const { program, attribs, uniforms } = context.getProgram(LINE_PROG_SOURCE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inCoords);
            try {
                glUniformInterval2D(gl, uniforms.AXIS_LIMITS, xyBounds);
                glUniformInterval2D(gl, uniforms.AXIS_VIEWPORT_PX, viewport_PX);
                gl.uniform1f(uniforms.THICKNESS_PX, lineThickness_PX);
                gl.uniform1f(uniforms.FEATHER_PX, FEATHER_PX);
                glUniformRgba(gl, uniforms.COLOR, lineColor);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dLineCoords);
                gl.vertexAttribPointer(attribs.inCoords, 4, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.TRIANGLES, 0, lineVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inCoords);
                gl.useProgram(null);
            }
        }
        
        const pointVertexCount = Math.floor(this.dPointCoordsCount / 3);
        if (pointVertexCount > 0 && ((dotColor.a > 0 && dotDiameter_PX > 0) || (lineColor.a > 0 && lineThickness_LPX > 1) || (offscreenDataIndicatorColor.a > 0 && offscreenDataIndicatorDiameter_PX > 0))) {
            const { program, attribs, uniforms } = context.getProgram(POINT_PROG_SOURCE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inCoords);
            try {
                glUniformInterval2D(gl, uniforms.AXIS_LIMITS, xyBounds);
                gl.uniform4f(uniforms.DATA_CLAMP_LIMITS, clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataBelowMinX ? xyBounds.xMin : Number.NEGATIVE_INFINITY), clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataAboveMaxX ? xyBounds.xMax : Number.POSITIVE_INFINITY), clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataBelowMinY ? xyBounds.yMin : Number.NEGATIVE_INFINITY), clamp(-GLSL_HIGHP_MAXVALUE, +GLSL_HIGHP_MAXVALUE, indicateDataAboveMaxY ? xyBounds.yMax : Number.POSITIVE_INFINITY));
                gl.uniform1f(uniforms.FEATHER_PX, FEATHER_PX);
                gl.uniform1f(uniforms.JOIN_DIAMETER_PX, lineThickness_PX);
                gl.uniform1f(uniforms.DATA_DIAMETER_PX, dotDiameter_PX);
                gl.uniform1f(uniforms.DATA_CLAMPED_DIAMETER_PX, offscreenDataIndicatorDiameter_PX);
                glUniformRgba(gl, uniforms.JOIN_COLOR, lineColor);
                glUniformRgba(gl, uniforms.DATA_COLOR, dotColor);
                glUniformRgba(gl, uniforms.DATA_CLAMPED_COLOR, offscreenDataIndicatorColor);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dPointCoords);
                gl.vertexAttribPointer(attribs.inCoords, 3, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.POINTS, 0, pointVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inCoords);
                gl.useProgram(null);
            }
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteBuffer(this.dLineCoords);
        this.dLineCoords = null;
        this.dLineCoordsCapacityBytes = -1;
        this.dLineCoordsCount = -1;
        gl.deleteBuffer(this.dPointCoords);
        this.dPointCoords = null;
        this.dPointCoordsCapacityBytes = -1;
        this.dPointCoordsCount = -1;
        gl.deleteBuffer(this.dFillCoords);
        this.dFillCoords = null;
        this.dFillCoordsCapacityBytes = -1;
        this.dFillCoordsCount = -1;
        this.glIncarnation = null;
        this.dLine = undefined;
        this.dCoordInputs = undefined;
    }
}

var fragShader_GLSL$4 = "#version 100\nprecision lowp float;\n\nvarying vec4 vColor;\n\nvoid main( ) {\n    gl_FragColor = vec4( vColor.a * vColor.rgb, vColor.a );\n}\n";

var vertShader_GLSL$4 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\n/**\n * Color: r, g, b, a\n */\nattribute vec4 inColor;\n\nvarying vec4 vColor;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    vColor = inColor;\n}\n";

const PROG_SOURCE$4 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$4,
    fragShader_GLSL: fragShader_GLSL$4,
    attribNames: ['inCoords', 'inColor'],
});
class CoordsInputs extends ValueBase2 {
    constructor(viewport_PX, axisViewport_PX, axisBounds_AXIS, cursor_AXIS, innerWidth_PX, edgeWidth_PX, innerColor, edgeColor) {
        super();
        this.viewport_PX = viewport_PX;
        this.axisViewport_PX = axisViewport_PX;
        this.axisBounds_AXIS = axisBounds_AXIS;
        this.cursor_AXIS = cursor_AXIS;
        this.innerWidth_PX = innerWidth_PX;
        this.edgeWidth_PX = edgeWidth_PX;
        this.innerColor = innerColor;
        this.edgeColor = edgeColor;
    }
}
class CursorPainter {
    constructor(axis, axisType) {
        this.peer = createDomPeer('cursor-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.innerColor = StyleProp.create(this.style, '--inner-color', cssColor, 'rgb(0,0,0)');
        this.edgeColor = StyleProp.create(this.style, '--edge-color', cssColor, 'rgb(127,127,127)');
        this.innerColorHovered = StyleProp.create(this.style, '--inner-color-hovered', cssColor, this.innerColor);
        this.edgeColorHovered = StyleProp.create(this.style, '--edge-color-hovered', cssColor, this.edgeColor);
        this.innerWidth_LPX = StyleProp.create(this.style, '--inner-width-px', cssFloat, 1);
        this.edgeWidth_LPX = StyleProp.create(this.style, '--edge-width-px', cssFloat, 1);
        this.visible = new RefBasic(true, tripleEquals);
        this.axis = axis;
        this.axisType = axisType;
        this.coord = undefined;
        this.hovered = false;
        
        this.vertexCount = 18;
        this.hCoords = new Float32Array(6 * this.vertexCount);
        this.glIncarnation = null;
        this.dCoords = null;
        this.dCoordsBytes = -1;
        this.dCoordsInputs = null;
    }
    paint(context, viewport_PX) {
        
        const innerColor = (this.hovered ? this.innerColorHovered.get() : this.innerColor.get());
        const edgeColor = (this.hovered ? this.edgeColorHovered.get() : this.edgeColor.get());
        const innerWidth_LPX = this.innerWidth_LPX.get();
        const edgeWidth_LPX = this.edgeWidth_LPX.get();
        
        const dpr = currentDpr(this);
        const innerWidth_PX = Math.round(innerWidth_LPX * dpr);
        const edgeWidth_PX = Math.round(edgeWidth_LPX * dpr);
        const cursor_AXIS = this.coord;
        const innerVisible = (innerColor.a > 0 && innerWidth_PX > 0);
        const edgeVisible = (edgeColor.a > 0 && edgeWidth_PX > 0);
        if (isDefined(cursor_AXIS) && (innerVisible || edgeVisible)) {
            const gl = context.gl;
            
            if (context.glIncarnation !== this.glIncarnation) {
                this.glIncarnation = context.glIncarnation;
                this.dCoords = gl.createBuffer();
                this.dCoordsBytes = -1;
                this.dCoordsInputs = null;
            }
            
            gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
            
            const axisBounds_AXIS = this.axis.bounds;
            const axisViewport_PX = this.axis.viewport_PX;
            const coordsInputs = new CoordsInputs(viewport_PX, axisViewport_PX, axisBounds_AXIS, cursor_AXIS, innerWidth_PX, edgeWidth_PX, innerColor, edgeColor);
            
            let scissor_PX;
            if (this.axisType === X) {
                scissor_PX = Interval2D.fromXy((viewport_PX.x).intersection(axisViewport_PX), viewport_PX.y);
                viewport_PX = Interval2D.fromXy(axisViewport_PX, viewport_PX.y);
            }
            else {
                scissor_PX = Interval2D.fromXy(viewport_PX.x, (viewport_PX.y).intersection(axisViewport_PX));
                viewport_PX = Interval2D.fromXy(viewport_PX.x, axisViewport_PX);
            }
            glViewport(gl, viewport_PX);
            glScissor(gl, scissor_PX);
            
            if (!equal(coordsInputs, this.dCoordsInputs)) {
                let i = 0;
                if (this.axisType === X) {
                    const wPixel_NDC = 2 / viewport_PX.w;
                    const xCenter_PX = axisBounds_AXIS.valueToFrac(cursor_AXIS) * axisViewport_PX.span + tickOffsetEpsilon_PX;
                    const xMinInner_NDC = xPixelToNdc(axisViewport_PX, Math.round(xCenter_PX - 0.5 * innerWidth_PX));
                    const xMaxInner_NDC = xMinInner_NDC + (innerWidth_PX * wPixel_NDC);
                    const xMinOuter_NDC = xMinInner_NDC - (edgeWidth_PX * wPixel_NDC);
                    const xMaxOuter_NDC = xMaxInner_NDC + (edgeWidth_PX * wPixel_NDC);
                    const yMin_NDC = -1;
                    const yMax_NDC = +1;
                    i = putAlignedBox(this.hCoords, i, xMinOuter_NDC, xMinInner_NDC, yMin_NDC, yMax_NDC);
                    i = putAlignedBox(this.hCoords, i, xMinInner_NDC, xMaxInner_NDC, yMin_NDC, yMax_NDC);
                    i = putAlignedBox(this.hCoords, i, xMaxInner_NDC, xMaxOuter_NDC, yMin_NDC, yMax_NDC);
                }
                else {
                    const hPixel_NDC = 2 / viewport_PX.h;
                    const yCenter_UPX = axisBounds_AXIS.valueToFrac(cursor_AXIS) * axisViewport_PX.span + tickOffsetEpsilon_PX;
                    const yMinInner_NDC = yUpwardPixelToNdc(axisViewport_PX, Math.round(yCenter_UPX - 0.5 * innerWidth_PX));
                    const yMaxInner_NDC = yMinInner_NDC + (innerWidth_PX * hPixel_NDC);
                    const yMinOuter_NDC = yMinInner_NDC - (edgeWidth_PX * hPixel_NDC);
                    const yMaxOuter_NDC = yMaxInner_NDC + (edgeWidth_PX * hPixel_NDC);
                    const xMin_NDC = -1;
                    const xMax_NDC = +1;
                    i = putAlignedBox(this.hCoords, i, xMin_NDC, xMax_NDC, yMinOuter_NDC, yMinInner_NDC);
                    i = putAlignedBox(this.hCoords, i, xMin_NDC, xMax_NDC, yMinInner_NDC, yMaxInner_NDC);
                    i = putAlignedBox(this.hCoords, i, xMin_NDC, xMax_NDC, yMaxInner_NDC, yMaxOuter_NDC);
                }
                for (let c = 0; c < 6; c++) {
                    i = putRgba(this.hCoords, i, edgeColor);
                }
                for (let c = 0; c < 6; c++) {
                    i = putRgba(this.hCoords, i, innerColor);
                }
                for (let c = 0; c < 6; c++) {
                    i = putRgba(this.hCoords, i, edgeColor);
                }
                const numCoords = (2 * this.vertexCount) + (4 * this.vertexCount);
                
                this.dCoordsBytes = pushBufferToDevice_BYTES(gl, GL.ARRAY_BUFFER, this.dCoordsBytes, this.hCoords, numCoords);
                this.dCoordsInputs = coordsInputs;
            }
            
            if (this.vertexCount >= 3) {
                if ((innerVisible && innerColor.a < 1) || (edgeVisible && edgeColor.a < 1)) {
                    enablePremultipliedAlphaBlending(gl);
                }
                else {
                    disableBlending(gl);
                }
                const { program, attribs } = context.getProgram(PROG_SOURCE$4);
                gl.useProgram(program);
                gl.enableVertexAttribArray(attribs.inCoords);
                gl.enableVertexAttribArray(attribs.inColor);
                try {
                    
                    gl.vertexAttribPointer(attribs.inCoords, 2, GL.FLOAT, false, 0, 0);
                    gl.vertexAttribPointer(attribs.inColor, 4, GL.FLOAT, false, 0, 8 * this.vertexCount);
                    gl.drawArrays(GL.TRIANGLES, 0, this.vertexCount);
                }
                finally {
                    gl.disableVertexAttribArray(attribs.inColor);
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

class TileDim extends ValueBase2 {
    constructor(total, first, count) {
        super();
        this.total = total;
        this.first = first;
        this.count = count;
    }
}
class TileRect extends ValueBase2 {
    constructor(rDim, cDim) {
        super();
        this.rDim = rDim;
        this.cDim = cDim;
    }
}

class EmptyMesh {
    constructor() {
        this.tileCoords = new Float32Array(0);
    }
    getTileCoords() {
        return this.tileCoords;
    }
}
function axisAlignedRectCopy({ xMin, xMax, yMin, yMax }) {
    return { xMin, xMax, yMin, yMax };
}
class AxisAlignedLinearMesh {
    constructor(totalBounds) {
        this.totalBounds = axisAlignedRectCopy(totalBounds);
    }
    getTileCoords(tileRect, scratch) {
        const xStep = (this.totalBounds.xMax - this.totalBounds.xMin) / tileRect.cDim.total;
        const x0 = this.totalBounds.xMin + tileRect.cDim.first * xStep;
        const x1 = x0 + tileRect.cDim.count * xStep;
        const yStep = (this.totalBounds.yMax - this.totalBounds.yMin) / tileRect.rDim.total;
        const y0 = this.totalBounds.yMin + tileRect.rDim.first * yStep;
        const y1 = y0 + tileRect.rDim.count * yStep;
        const sStep = 1.0 / (tileRect.cDim.count + 2);
        const s0 = 0.0 + sStep;
        const s1 = 1.0 - sStep;
        const tStep = 1.0 / (tileRect.rDim.count + 2);
        const t0 = 0.0 + tStep;
        const t1 = 1.0 - tStep;
        const xyst = scratch.getTempSpace(6 * 4);
        xyst.set([
            x0, y1, s0, t1,
            x0, y0, s0, t0,
            x1, y1, s1, t1,
            x1, y1, s1, t1,
            x0, y0, s0, t0,
            x1, y0, s1, t0,
        ]);
        return xyst;
    }
}

class EmptySurface {
    constructor() {
        this.rTotal = 0;
        this.cTotal = 0;
        this.tileValues = new Float32Array(0);
    }
    getTileValues() {
        return this.tileValues;
    }
}
class Float32ArraySurface {
    constructor(w, h, values) {
        requireCount(values.length, [w, h]);
        this.rTotal = h;
        this.cTotal = w;
        this.values = values;
    }
    getTileValues(tileRect, scratch) {
        const { rTotal, cTotal } = this;
        const rFirst = tileRect.rDim.first;
        const cFirst = tileRect.cDim.first;
        const rCount = tileRect.rDim.count;
        const cCount = tileRect.cDim.count;
        const iSize = 1 + cCount + 1;
        const jSize = 1 + rCount + 1;
        const result = scratch.getTempSpace(iSize * jSize);
        for (let j = 0; j < jSize; j++) {
            const r = clamp(0, rTotal - 1, rFirst + j - 1);
            const resultIndexFirst = j * iSize + 0;
            const resultRow = result.subarray(resultIndexFirst, resultIndexFirst + iSize);
            
            
            const cLeftBorder = Math.max(0, cFirst - 1);
            resultRow[0] = this.values[r * cTotal + cLeftBorder];
            
            const valuesIndexFirst = r * cTotal + cFirst;
            const valuesRow = this.values.subarray(valuesIndexFirst, valuesIndexFirst + cCount);
            resultRow.set(valuesRow, 1);
            
            
            const cRightBorder = Math.min(cTotal - 1, cFirst + cCount);
            resultRow[iSize - 1] = this.values[r * cTotal + cRightBorder];
        }
        return result;
    }
}
function requireCount(actualCount, requiredDims) {
    const requiredCount = requiredDims.reduce((a, b) => a * b, 1);
    if (actualCount !== requiredCount) {
        throw new Error(`Count doesn't match required dimensions: required = ${requiredCount} (${requiredDims.map(d => d.toFixed(0)).join('x')}), actual = ${actualCount}`);
    }
}

var fragShader_GLSL$2$1 = "#version 100\nprecision lowp float;\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nbool isNaN( float x ) {\n    // Deliberately convoluted to avoid being optimized away\n    return ( x < 0.0 || 0.0 < x || x == 0.0 ) ? false : true;\n}\n\nconst int INTERPOLATE_NEITHER = 0;\nconst int INTERPOLATE_S = 1;\nconst int INTERPOLATE_T = 2;\nconst int INTERPOLATE_BOTH = 3;\n\nuniform int INTERP_MODE;\nuniform sampler2D VALUE_TABLE;\nuniform vec2 VALUE_TABLE_SIZE;\nuniform sampler2D COLOR_TABLE;\nuniform vec2 COLOR_LIMITS;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    vec2 st_FRAC;\n    if ( INTERP_MODE == INTERPOLATE_BOTH ) {\n        st_FRAC = vSt_FRAC;\n    }\n    else if ( INTERP_MODE == INTERPOLATE_S ) {\n        float s_FRAC = vSt_FRAC.s;\n        float t_FRAC = ( floor( vSt_FRAC.t*VALUE_TABLE_SIZE.t ) + 0.5 ) / VALUE_TABLE_SIZE.t;\n        st_FRAC = vec2( s_FRAC, t_FRAC );\n    }\n    else if ( INTERP_MODE == INTERPOLATE_T ) {\n        float s_FRAC = ( floor( vSt_FRAC.s*VALUE_TABLE_SIZE.s ) + 0.5 ) / VALUE_TABLE_SIZE.s;\n        float t_FRAC = vSt_FRAC.t;\n        st_FRAC = vec2( s_FRAC, t_FRAC );\n    }\n    else {\n        st_FRAC = ( floor( vSt_FRAC*VALUE_TABLE_SIZE ) + 0.5 ) / VALUE_TABLE_SIZE;\n    }\n\n    float value = texture2D( VALUE_TABLE, st_FRAC ).r;\n    if ( isNaN( value ) ) {\n        discard;\n    }\n    else {\n        float frac = coordToFrac1D( value, COLOR_LIMITS );\n        vec4 rgba = texture2D( COLOR_TABLE, vec2( frac, 0.0 ) );\n        gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n    }\n}\n";

var vertShader_GLSL$2$1 = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec4 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return vec4( -1.0 + 2.0*frac, 0.0, 1.0 );\n}\n\nuniform vec4 XY_LIMITS;\n\n/**\n * Coords: x_XAXIS, y_YAXIS, s_FRAC, t_FRAC\n */\nattribute vec4 inCoords;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    gl_Position = coordsToNdc2D( inCoords.xy, XY_LIMITS );\n    vSt_FRAC = inCoords.zw;\n}\n";

const PROG_SOURCE$2 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$2$1,
    fragShader_GLSL: fragShader_GLSL$2$1,
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
class HeatmapPainter {
    constructor(xyBoundsFn, colorBoundsFn) {
        this.peer = createDomPeer('heatmap-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.colorTableName = StyleProp.create(this.style, '--color-table', cssLowercase, '');
        this.interpMode = StyleProp.create(this.style, '--interp-mode', cssEnum(HeatmapInterpMode), 'nearest');
        this.visible = new RefBasic(true, tripleEquals);
        this.xyBoundsFn = xyBoundsFn !== null && xyBoundsFn !== void 0 ? xyBoundsFn : frozenSupplier(Interval2D.fromEdges(0, 1, 0, 1));
        this.colorBoundsFn = colorBoundsFn !== null && colorBoundsFn !== void 0 ? colorBoundsFn : frozenSupplier(Interval1D.fromEdges(0, 1));
        this.mesh = new EmptyMesh();
        this.surface = new EmptySurface();
        this.scratch = new Float32Scratch();
        this.glIncarnation = null;
        this.dColorTable = null;
        this.dColorTableName = null;
        this.dTiles = new Array();
        this.dMaxTileDataDim = 0;
        this.dMeshValid = false;
        this.dSurfaceDimsValid = false;
        this.dSurfaceValuesValid = false;
    }
    setMesh(mesh) {
        if (mesh !== this.mesh) {
            this.dMeshValid = false;
            this.mesh = mesh;
        }
    }
    setSurface(surface) {
        if (surface !== this.surface) {
            this.dSurfaceValuesValid = false;
            if (surface.rTotal !== this.surface.rTotal || surface.cTotal !== this.surface.cTotal) {
                this.dSurfaceDimsValid = false;
            }
            this.surface = surface;
        }
    }
    
    paint(context, viewport_PX) {
        const colorTableName = this.colorTableName.get();
        const gl = context.gl;
        
        const maxTileDataDim = gl.getParameter(GL.MAX_TEXTURE_SIZE) - 2;
        
        if (context.glIncarnation !== this.glIncarnation) {
            
            
            
            if (!(gl instanceof WebGL2RenderingContext || (gl.getExtension('OES_texture_float') && gl.getExtension('OES_texture_float_linear')))) {
                throw new Error();
            }
            this.glIncarnation = context.glIncarnation;
            this.dColorTable = gl.createTexture();
            this.dColorTableName = null;
            this.dTiles = new Array();
            this.dMaxTileDataDim = 0;
            this.dMeshValid = false;
            this.dSurfaceDimsValid = false;
            this.dSurfaceValuesValid = false;
        }
        
        gl.activeTexture(GL.TEXTURE0);
        gl.bindTexture(GL.TEXTURE_2D, this.dColorTable);
        if (colorTableName !== this.dColorTableName) {
            context.getColorTable(colorTableName).populate(gl, GL.TEXTURE_2D);
            this.dColorTableName = colorTableName;
        }
        
        gl.activeTexture(GL.TEXTURE1);
        if (!this.dSurfaceDimsValid || maxTileDataDim !== this.dMaxTileDataDim) {
            
            for (const dTile of this.dTiles) {
                gl.deleteBuffer(dTile.coords);
                gl.deleteTexture(dTile.values);
            }
            this.dTiles.length = 0;
            for (const tileRect of getTileRects(this.surface, maxTileDataDim)) {
                const dCoords = gl.createBuffer();
                gl.bindBuffer(GL.ARRAY_BUFFER, dCoords);
                const numCoords = pushTileCoordsToDevice(gl, GL.ARRAY_BUFFER, this.mesh, tileRect, this.scratch);
                const dValues = gl.createTexture();
                gl.bindTexture(GL.TEXTURE_2D, dValues);
                pushTileValuesToDevice(gl, GL.TEXTURE_2D, this.surface, tileRect, this.scratch);
                this.dTiles.push({
                    rect: tileRect,
                    numCoords,
                    coords: dCoords,
                    values: dValues,
                });
            }
        }
        else {
            if (!this.dSurfaceValuesValid) {
                
                for (const dTile of this.dTiles) {
                    gl.bindTexture(GL.TEXTURE_2D, dTile.values);
                    pushTileValuesToDevice(gl, GL.TEXTURE_2D, this.surface, dTile.rect, this.scratch);
                }
            }
            if (!this.dMeshValid) {
                
                for (const dTile of this.dTiles) {
                    gl.bindBuffer(GL.ARRAY_BUFFER, dTile.coords);
                    pushTileCoordsToDevice(gl, GL.ARRAY_BUFFER, this.mesh, dTile.rect, this.scratch);
                }
            }
        }
        this.dMaxTileDataDim = maxTileDataDim;
        this.dSurfaceDimsValid = true;
        this.dSurfaceValuesValid = true;
        this.dMeshValid = true;
        
        enablePremultipliedAlphaBlending(gl);
        gl.disable(GL.CULL_FACE);
        const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$2);
        gl.useProgram(program);
        gl.enableVertexAttribArray(attribs.inCoords);
        try {
            
            
            glUniformInterval2D(gl, uniforms.XY_LIMITS, this.xyBoundsFn());
            glUniformInterval1D(gl, uniforms.COLOR_LIMITS, this.colorBoundsFn());
            gl.uniform1i(uniforms.COLOR_TABLE, 0);
            gl.uniform1i(uniforms.VALUE_TABLE, 1);
            gl.uniform1i(uniforms.INTERP_MODE, this.interpMode.get());
            gl.activeTexture(GL.TEXTURE1);
            for (const dTile of this.dTiles) {
                const numVertices = Math.floor(dTile.numCoords / 4);
                if (numVertices >= 3) {
                    gl.uniform2f(uniforms.VALUE_TABLE_SIZE, 1 + dTile.rect.cDim.count + 1, 1 + dTile.rect.rDim.count + 1);
                    gl.bindTexture(GL.TEXTURE_2D, dTile.values);
                    gl.bindBuffer(GL.ARRAY_BUFFER, dTile.coords);
                    gl.vertexAttribPointer(attribs.inCoords, 4, GL.FLOAT, false, 0, 0);
                    gl.drawArrays(GL.TRIANGLES, 0, numVertices);
                }
            }
        }
        finally {
            gl.disableVertexAttribArray(attribs.inCoords);
            gl.useProgram(null);
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteTexture(this.dColorTable);
        for (const dTile of this.dTiles) {
            gl.deleteBuffer(dTile.coords);
            gl.deleteTexture(dTile.values);
        }
        this.glIncarnation = null;
        this.dColorTable = null;
        this.dColorTableName = null;
        this.dTiles = new Array();
        this.dMeshValid = false;
        this.dSurfaceDimsValid = false;
        this.dSurfaceValuesValid = false;
    }
}
function pushTileCoordsToDevice(gl, target, mesh, tileRect, scratch) {
    const hTileCoords = mesh.getTileCoords(tileRect, scratch);
    gl.bufferData(target, hTileCoords, GL.STATIC_DRAW);
    return hTileCoords.length;
}
function pushTileValuesToDevice(gl, target, surface, tileRect, scratch) {
    const hTileValues = surface.getTileValues(tileRect, scratch);
    
    const textureWidth = tileRect.cDim.count + 2;
    const textureHeight = tileRect.rDim.count + 2;
    if (hTileValues.length !== textureWidth * textureHeight) {
        const extraText = (hTileValues.length === tileRect.cDim.count * tileRect.rDim.count ? ' (seems to be missing the 1-texel border)' : '');
        throw new Error(`Heatmap surface tile has wrong value count${extraText}: required = ${textureWidth * textureHeight} (${textureWidth}x${textureHeight}), actual = ${hTileValues.length}`);
    }
    
    gl.texParameteri(target, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    gl.texParameteri(target, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    gl.texParameteri(target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    gl.texParameteri(target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    gl.texImage2D(target, 0, GL.LUMINANCE, textureWidth, textureHeight, 0, GL.LUMINANCE, GL.FLOAT, hTileValues);
    return hTileValues.length;
}
function getTileRects(surface, maxTileDim) {
    const rDims = getBandDims(surface.rTotal, maxTileDim);
    const cDims = getBandDims(surface.cTotal, maxTileDim);
    const tileRects = new Array();
    for (const rDim of rDims) {
        for (const cDim of cDims) {
            tileRects.push(new TileRect(rDim, cDim));
        }
    }
    return tileRects;
}
function getBandDims(totalRanks, maxBandDim) {
    const bandDims = new Array();
    const bandCount = Math.ceil(totalRanks / maxBandDim);
    for (let b = 0; b < bandCount; b++) {
        const first = b * maxBandDim;
        const count = Math.min(maxBandDim, totalRanks - first);
        if (count > 0) {
            bandDims.push(new TileDim(totalRanks, first, count));
        }
    }
    return bandDims;
}

var fragShader_GLSL$1$1 = "#version 100\nprecision lowp float;\n\nuniform lowp sampler2D IMAGE;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    vec4 rgba = texture2D( IMAGE, vSt_FRAC );\n    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n}\n";

var vertShader_GLSL$1$1 = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform vec2 ANCHOR_PX;\n\n/**\n * Coords: xOffset_PX, yOffset_PX, s_FRAC, t_FRAC\n */\nattribute vec4 inCoords;\n\nvarying vec2 vSt_FRAC;\n\n\nvoid main( ) {\n    vec2 xyOffset_PX = inCoords.xy;\n    vec2 xy_PX = ANCHOR_PX + xyOffset_PX;\n    vec2 xy_NDC = coordsToNdc2D( xy_PX, VIEWPORT_PX );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    vSt_FRAC = inCoords.zw;\n}\n";

const PROG_SOURCE$1 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$1$1,
    fragShader_GLSL: fragShader_GLSL$1$1,
    uniformNames: [
        'VIEWPORT_PX',
        'ANCHOR_PX',
        'IMAGE',
    ],
    attribNames: [
        'inCoords',
    ],
});
const EMPTY_IMAGE = get$1(() => {
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
class ImagePainter {
    constructor(options) {
        this.peer = createDomPeer('image-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.xAlignViewportFrac = StyleProp.create(this.style, '--x-align-viewport-frac', cssFloat, 0);
        this.yAlignViewportFrac = StyleProp.create(this.style, '--y-align-viewport-frac', cssFloat, 0);
        this.xAlignImageCoord = StyleProp.create(this.style, '--x-align-image-coord', cssFloat, 0);
        this.yAlignImageCoord = StyleProp.create(this.style, '--y-align-image-coord', cssFloat, 0);
        this.visible = new RefBasic(true, tripleEquals);
        this.createInputs = options.createInputs;
        this.createImage = options.createImage;
        this.hInputs = undefined;
        this.hImage = EMPTY_IMAGE;
        this.hCoords = new Float32Array(16);
        this.glIncarnation = null;
        this.dInputs = undefined;
        this.dTexture = null;
        this.dCoords = null;
    }
    updateHostResources() {
        const inputs = this.createInputs();
        if (!equal(inputs, this.hInputs)) {
            this.hInputs = inputs;
            this.hImage = this.createImage(this.hInputs);
            const sprawl = getImageSprawl(this.hImage);
            
            const wBorder_FRAC = this.hImage.border / this.hImage.imageData.width;
            const hBorder_FRAC = this.hImage.border / this.hImage.imageData.height;
            const sLeft = 0 + wBorder_FRAC;
            const sRight = 1 - wBorder_FRAC;
            const tBottom = 1 - hBorder_FRAC;
            const tTop = 0 + hBorder_FRAC;
            let i = 0;
            i = put4f(this.hCoords, i, sprawl.dxLeft_PX, sprawl.dyTop_PX, sLeft, tTop);
            i = put4f(this.hCoords, i, sprawl.dxLeft_PX, sprawl.dyBottom_PX, sLeft, tBottom);
            i = put4f(this.hCoords, i, sprawl.dxRight_PX, sprawl.dyTop_PX, sRight, tTop);
            i = put4f(this.hCoords, i, sprawl.dxRight_PX, sprawl.dyBottom_PX, sRight, tBottom);
        }
    }
    getImageInputs() {
        this.updateHostResources();
        return requireDefined(this.hInputs);
    }
    getImage() {
        this.updateHostResources();
        return this.hImage;
    }
    paint(context, viewport_PX) {
        const xAlignViewportFrac = this.xAlignViewportFrac.get();
        const yAlignViewportFrac = this.yAlignViewportFrac.get();
        const xAlignImageCoord = this.xAlignImageCoord.get();
        const yAlignImageCoord = this.yAlignImageCoord.get();
        const gl = context.gl;
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dInputs = undefined;
            this.dTexture = gl.createTexture();
            this.dCoords = gl.createBuffer();
        }
        
        gl.activeTexture(GL.TEXTURE0);
        gl.bindTexture(GL.TEXTURE_2D, this.dTexture);
        gl.bindBuffer(GL.ARRAY_BUFFER, this.dCoords);
        
        this.updateHostResources();
        
        if (!equal(this.hInputs, this.dInputs)) {
            this.dInputs = this.hInputs;
            
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.hImage.imageData);
            
            gl.bufferData(GL.ARRAY_BUFFER, this.hCoords, gl.STATIC_DRAW);
        }
        
        const sprawl = getImageSprawl(this.hImage);
        const x_PX = Math.round(xAlignViewportFrac * viewport_PX.w - xAlignImageCoord * (xAlignImageCoord < 0 ? -sprawl.dxLeft_PX : sprawl.dxRight_PX));
        const y_PX = Math.round(yAlignViewportFrac * viewport_PX.h - yAlignImageCoord * (yAlignImageCoord < 0 ? -sprawl.dyBottom_PX : sprawl.dyTop_PX));
        enablePremultipliedAlphaBlending(gl);
        const { program, attribs, uniforms } = context.getProgram(PROG_SOURCE$1);
        gl.useProgram(program);
        gl.enableVertexAttribArray(attribs.inCoords);
        try {
            gl.uniform4f(uniforms.VIEWPORT_PX, 0, 0, viewport_PX.w, viewport_PX.h);
            gl.uniform2f(uniforms.ANCHOR_PX, x_PX, y_PX);
            
            
            gl.uniform1i(uniforms.IMAGE, 0);
            
            gl.vertexAttribPointer(attribs.inCoords, 4, GL.FLOAT, false, 0, 0);
            gl.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        }
        finally {
            gl.disableVertexAttribArray(attribs.inCoords);
            gl.useProgram(null);
        }
    }
    dispose(context) {
        const gl = context.gl;
        gl.deleteTexture(this.dTexture);
        gl.deleteBuffer(this.dCoords);
        this.glIncarnation = null;
        this.dTexture = null;
        this.dCoords = null;
    }
}
function getImageSprawl(image) {
    return {
        dxLeft_PX: (0 + image.border) - image.xAnchor,
        dxRight_PX: (image.imageData.width - image.border) - image.xAnchor,
        dyBottom_PX: image.yAnchor - (image.imageData.height - image.border),
        dyTop_PX: image.yAnchor - (0 + image.border),
    };
}

var discFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform float FEATHER_PX;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    vec2 xy_NPC = -1.0 + 2.0*gl_PointCoord;\n    float r_NPC = sqrt( dot( xy_NPC, xy_NPC ) );\n\n    float pxToNpc = 2.0 / vSize_PX;\n    float rOuter_NPC = 1.0 - 0.5*pxToNpc;\n    float rInner_NPC = rOuter_NPC - FEATHER_PX*pxToNpc;\n    float mask = smoothstep( rOuter_NPC, rInner_NPC, r_NPC );\n\n    float alpha = mask * vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var ringFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    vec2 xy_NPC = -1.0 + 2.0*gl_PointCoord;\n    float r_NPC = sqrt( dot( xy_NPC, xy_NPC ) );\n\n    float pxToNpc = 2.0 / vSize_PX;\n    float rD_NPC = 1.0 - 0.5*pxToNpc;\n    float rC_NPC = rD_NPC - FEATHER_PX*pxToNpc;\n    float rB_NPC = rC_NPC - max( 0.0, THICKNESS_PX - FEATHER_PX )*pxToNpc;\n    float rA_NPC = rB_NPC - FEATHER_PX*pxToNpc;\n    float mask = smoothstep( rD_NPC, rC_NPC, r_NPC ) * smoothstep( rA_NPC, rB_NPC, r_NPC );\n\n    float alpha = mask * vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var squareFragShader_GLSL = "#version 100\nprecision lowp float;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\nvoid main( ) {\n    float alpha = vRgba.a;\n    gl_FragColor = vec4( alpha*vRgba.rgb, alpha );\n}\n";

var xyVertShader_GLSL = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec4 FIXED_RGBA;\n\nuniform float FIXED_SIZE_PX;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS\n */\nattribute vec2 inCoords;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    vRgba = FIXED_RGBA;\n\n    vSize_PX = FIXED_SIZE_PX;\n    gl_PointSize = vSize_PX;\n}\n";

var xycVertShader_GLSL = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec2 C_BOUNDS;\nuniform sampler2D VARIABLE_COLOR_TABLE;\n\nuniform float FIXED_SIZE_PX;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, c_CAXIS\n */\nattribute vec3 inCoords;\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    float c_CAXIS = inCoords.z;\n    float c_CFRAC = clamp( coordToFrac1D( c_CAXIS, C_BOUNDS ), 0.0, 1.0 );\n    vRgba = texture2D( VARIABLE_COLOR_TABLE, vec2( c_CFRAC, 0.0 ) );\n\n    vSize_PX = FIXED_SIZE_PX;\n    gl_PointSize = vSize_PX;\n}\n";

var xycsVertShader_GLSL = "#version 100\n\n\nconst int SIZE_FUNC_LINEAR = 0;\nconst int SIZE_FUNC_QUADRATIC = 1;\nconst int SIZE_FUNC_SQRT = 2;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\nfloat size_PX( float coord, vec2 bounds, int sizeFunc, vec2 sizeLimits_PX ) {\n    float frac = clamp( coordToFrac1D( coord, bounds ), 0.0, 1.0 );\n    if ( sizeFunc == SIZE_FUNC_LINEAR ) {\n        return fracToCoord1D( frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_QUADRATIC ) {\n        return fracToCoord1D( frac*frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_SQRT ) {\n        return fracToCoord1D( sqrt( frac ), sizeLimits_PX );\n    }\n    else {\n        return min1D( sizeLimits_PX );\n    }\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec2 C_BOUNDS;\nuniform sampler2D VARIABLE_COLOR_TABLE;\n\nuniform vec2 S_BOUNDS;\nuniform vec2 VARIABLE_SIZE_LIMITS_PX;\nuniform int VARIABLE_SIZE_FUNC;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, c_CAXIS, s_SAXIS\n */\nattribute vec4 inCoords;\n\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    float c_CAXIS = inCoords.z;\n    float c_CFRAC = clamp( coordToFrac1D( c_CAXIS, C_BOUNDS ), 0.0, 1.0 );\n    vRgba = texture2D( VARIABLE_COLOR_TABLE, vec2( c_CFRAC, 0.0 ) );\n\n    float s_SAXIS = inCoords.w;\n    vSize_PX = size_PX( s_SAXIS, S_BOUNDS, VARIABLE_SIZE_FUNC, VARIABLE_SIZE_LIMITS_PX );\n    gl_PointSize = vSize_PX;\n}\n";

var xysVertShader_GLSL = "#version 100\n\n\nconst int SIZE_FUNC_LINEAR = 0;\nconst int SIZE_FUNC_QUADRATIC = 1;\nconst int SIZE_FUNC_SQRT = 2;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\nfloat size_PX( float coord, vec2 bounds, int sizeFunc, vec2 sizeLimits_PX ) {\n    float frac = clamp( coordToFrac1D( coord, bounds ), 0.0, 1.0 );\n    if ( sizeFunc == SIZE_FUNC_LINEAR ) {\n        return fracToCoord1D( frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_QUADRATIC ) {\n        return fracToCoord1D( frac*frac, sizeLimits_PX );\n    }\n    else if ( sizeFunc == SIZE_FUNC_SQRT ) {\n        return fracToCoord1D( sqrt( frac ), sizeLimits_PX );\n    }\n    else {\n        return min1D( sizeLimits_PX );\n    }\n}\n\n\nuniform vec4 XY_BOUNDS;\n\nuniform vec4 FIXED_RGBA;\n\nuniform vec2 S_BOUNDS;\nuniform vec2 VARIABLE_SIZE_LIMITS_PX;\nuniform int VARIABLE_SIZE_FUNC;\n\n\n/**\n * Coords: x_XAXIS, y_YAXIS, s_SAXIS\n */\nattribute vec4 inCoords;\n\n\nvarying float vSize_PX;\nvarying vec4 vRgba;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    gl_Position = vec4( coordsToNdc2D( xy_XYAXIS, XY_BOUNDS ), 0.0, 1.0 );\n\n    vRgba = FIXED_RGBA;\n\n    float s_SAXIS = inCoords.z;\n    vSize_PX = size_PX( s_SAXIS, S_BOUNDS, VARIABLE_SIZE_FUNC, VARIABLE_SIZE_LIMITS_PX );\n    gl_PointSize = vSize_PX;\n}\n";

const { floor: floor$1, max: max$2 } = Math;
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
        
        const numVertices = floor$1(this.hCoords.length / this.hCoordsPerPoint);
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
                
                gl.uniform1f(uniforms.FEATHER_PX, max$2(1e-3, feather_PX));
                
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

var fragShader_GLSL$a = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$a = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToNdc1D( float frac ) {\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform int AXIS_IS_VERTICAL;\nuniform vec2 AXIS_LIMITS;\nuniform vec2 COLOR_LIMITS;\n\n\n/**\n * Coords: colorBoundsFrac, orthoFrac\n */\nattribute vec3 inCoords;\n\n\nvoid main( ) {\n    float colorLimitsFrac = inCoords.x;\n    float axisCoord = fracToCoord1D( colorLimitsFrac, COLOR_LIMITS );\n    float axisFrac = coordToFrac1D( axisCoord, AXIS_LIMITS );\n    float axisNdc = fracToNdc1D( axisFrac );\n\n    float orthoFrac = inCoords.y;\n    float orthoNdc = fracToNdc1D( orthoFrac );\n\n    if ( AXIS_IS_VERTICAL == 1 ) {\n        gl_Position = vec4( orthoNdc, axisNdc, 0.0, 1.0 );\n    }\n    else {\n        gl_Position = vec4( axisNdc, orthoNdc, 0.0, 1.0 );\n    }\n}\n";

const PROG_SOURCE = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$a,
    fragShader_GLSL: fragShader_GLSL$a,
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

class TextInputs extends ValueBase2 {
    constructor(dpr, font, color, text, prefix, suffix) {
        super();
        this.dpr = dpr;
        this.font = font;
        this.color = color;
        this.text = text;
        this.prefix = prefix;
        this.suffix = suffix;
    }
}
class TextPainter extends ImagePainter {
    constructor() {
        super({
            createInputs: () => {
                return new TextInputs(currentDpr(this), this.font.get(), this.color.get(), this.text.get(), this.prefix.get(), this.suffix.get());
            },
            createImage: ({ dpr, font, color, text, prefix, suffix }) => {
                const metrics = estimateFontMetrics(dpr, font, DEFAULT_CHARS);
                return createTextImage(dpr, font, metrics, 1, color.cssString, TRANSPARENT.cssString, prefix + text + suffix);
            },
        });
        this.font = StyleProp.create(this.style, '--font', cssString, '13px sans-serif');
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(0,0,0)');
        this.prefix = StyleProp.create(this.style, '--prefix', cssString, '');
        this.text = StyleProp.create(this.style, '--text', cssString, '');
        this.suffix = StyleProp.create(this.style, '--suffix', cssString, '');
    }
}
class TextLabel {
    constructor(text) {
        this.insetLayout = new InsetLayout();
        this.pane = new Pane(this.insetLayout);
        this.style = window.getComputedStyle(this.pane.peer);
        this.textPainter = new TextPainter();
        if (isDefined(text)) {
            this.textPainter.text.override = text;
        }
        this.textLayout = new ChildlessLayout();
        this.textLayout.prefWidth_LPX.getOverride = () => {
            const image = this.textPainter.getImage();
            const prefWidth_PX = image.imageData.width - 2 * image.border;
            return (prefWidth_PX / currentDpr(this.pane));
        };
        this.textLayout.prefHeight_LPX.getOverride = () => {
            const image = this.textPainter.getImage();
            const prefHeight_PX = image.imageData.height - 2 * image.border;
            return (prefHeight_PX / currentDpr(this.pane));
        };
        this.textPane = new Pane(this.textLayout);
        this.textPane.addPainter(this.textPainter);
        this.pane.addCssClass('label');
        this.pane.addPane(this.textPane);
    }
}

class VerticalScrollbar {
    constructor(scrollerLayout) {
        this.scrollerLayout = scrollerLayout;
        this.painter = new VerticalScrollbarPainter(this.scrollerLayout);
        this.repaint = new ListenableBasic();
        this.pane = new Pane();
        this.pane.addCssClass('scrollbar');
        this.pane.addPainter(this.painter);
        attachVerticalScrollbarInputHandler(this.pane, this.scrollerLayout, this.repaint);
    }
    attachToRepaint(repaint) {
        return linkListenables(this.repaint, repaint);
    }
}

function attachVerticalScrollbarInputHandler(scrollbarPane, scrollerLayout, repaint) {
    return scrollbarPane.addInputHandler(createVerticalScrollbarInputHandler(scrollbarPane, scrollerLayout, repaint));
}

function createVerticalScrollbarInputHandler(scrollbarPane, scrollerLayout, repaint) {
    return {
        getHoverHandler() {
            return createHoverHandler(scrollbarPane);
        },
        getDragHandler(evGrab) {
            if (evGrab.button === 0) {
                return createDragHandler(scrollbarPane, scrollerLayout, repaint, evGrab);
            }
            else {
                return null;
            }
        },
        getWheelHandler() {
            return createWheelHandler(scrollbarPane, scrollerLayout, repaint);
        },
        getKeyHandler() {
            return createKeyHandler(scrollbarPane, scrollerLayout, repaint);
        },
    };
}
function createHoverHandler(scrollbarPane) {
    return {
        target: scrollbarPane,
        getMouseCursorClasses: frozenSupplier(['y-scroller']),
    };
}
function createDragHandler(scrollbarPane, scrollerLayout, repaint, evGrab) {
    
    
    const grab_PX = evGrab.loc_PX.y;
    const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX(scrollerLayout, scrollbarPane.getViewport_PX().y);
    const grabThumbFrac = (thumbBounds_PX.containsPoint(grab_PX) ? thumbBounds_PX.valueToFrac(grab_PX) : 0.5);
    let mouse_PX = evGrab.loc_PX.y;
    let repaintListenerDisposer = null;
    return {
        target: newImmutableList(['Scrollbar', scrollbarPane]),
        getMouseCursorClasses: frozenSupplier(['y-scroller']),
        handleGrab() {
            
            
            repaintListenerDisposer = repaint.addListener(() => {
                const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX(scrollerLayout, scrollbarPane.getViewport_PX().y);
                const thumbTop_PX = mouse_PX + (1.0 - grabThumbFrac) * thumbBounds_PX.span;
                const thumbTop_FRAC = scrollbarPane.getViewport_PX().y.valueToFrac(thumbTop_PX);
                const { hContent_PX } = scrollerLayout;
                scrollerLayout.yOffset_PX = hContent_PX - (thumbTop_FRAC * hContent_PX);
            });
            
            mouse_PX = evGrab.loc_PX.y;
            repaint.fire();
        },
        handleDrag(evDrag) {
            
            mouse_PX = evDrag.loc_PX.y;
            repaint.fire();
        },
        handleUngrab() {
            
            
            
            
            if (repaintListenerDisposer) {
                dispose(repaintListenerDisposer);
            }
        },
    };
}

const scrollStepSize_LPX = 40;
const scrollStepsByKey = newImmutableMap([
    ['ArrowUp', -1],
    ['ArrowDown', +1],
    ['PageUp', -11],
    ['PageDown', +11],
]);
function createKeyHandler(keyPane, scrollerLayout, repaint) {
    return {
        target: newImmutableList(['Scrollbar', keyPane]),
        handleKeyPress(evPress) {
            const steps = scrollStepsByKey.get(evPress.key);
            if (isDefined(steps)) {
                scrollerLayout.yOffset_PX += steps * scrollStepSize_LPX * evPress.dpr;
                repaint.fire();
            }
        },
    };
}
function createWheelHandler(wheelPane, scrollerLayout, repaint) {
    return {
        target: newImmutableList(['Scrollbar', wheelPane]),
        handleWheel(evWheel) {
            scrollerLayout.yOffset_PX += evWheel.wheelSteps * scrollStepSize_LPX * evWheel.dpr;
            repaint.fire();
        },
    };
}

function getVerticalScrollbarThumbBounds_PX(scrollerLayout, scrollbarViewport_PX) {
    const { yOffset_PX, hContent_PX, hVisible_PX } = scrollerLayout;
    const thumbBottom_FRAC = (hContent_PX - (yOffset_PX + hVisible_PX)) / hContent_PX;
    const thumbTop_FRAC = (hContent_PX - yOffset_PX) / hContent_PX;
    const yMin_PX = scrollbarViewport_PX.fracToValue(thumbBottom_FRAC);
    const yMax_PX = scrollbarViewport_PX.fracToValue(thumbTop_FRAC);
    return Interval1D.fromEdges(yMin_PX, yMax_PX);
}
class VerticalScrollbarPainter {
    constructor(scrollerLayout) {
        this.peer = createDomPeer('scrollbar-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.trackColor = StyleProp.create(this.style, '--track-color', cssColor, 'rgb( 212,212,212 )');
        this.thumbColor = StyleProp.create(this.style, '--thumb-color', cssColor, 'rgb( 165,165,165 )');
        this.visible = new RefBasic(true, tripleEquals);
        this.scrollerLayout = scrollerLayout;
        this.trackPainter = new FillPainter();
        this.trackPainter.color.getOverride = () => this.trackColor.get();
        appendChild(this.peer, this.trackPainter.peer);
        this.thumbPainter = new FillPainter();
        this.thumbPainter.color.getOverride = () => this.thumbColor.get();
        appendChild(this.peer, this.thumbPainter.peer);
    }
    paint(context, viewport_PX) {
        const gl = context.gl;
        try {
            this.trackPainter.paint(context, viewport_PX);
            const thumbBounds_PX = getVerticalScrollbarThumbBounds_PX(this.scrollerLayout, viewport_PX.y);
            const thumbViewport_PX = viewport_PX.withYEdges(Math.round(thumbBounds_PX.min), Math.round(thumbBounds_PX.max));
            glViewport(gl, thumbViewport_PX);
            this.thumbPainter.paint(context, thumbViewport_PX);
        }
        finally {
            glViewport(gl, viewport_PX);
        }
    }
    dispose(context) {
        this.trackPainter.dispose(context);
        this.thumbPainter.dispose(context);
    }
}

/*!
 * @metsci/gleam-timeline
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

const { max: max$1, min: min$1 } = Math;
const { POSITIVE_INFINITY, NEGATIVE_INFINITY } = Number;
const READABLE_EVENT_SYMBOL = Symbol('@@__GLEAM_READABLE_EVENT__@@');
const WRITABLE_EVENT_SYMBOL = Symbol('@@__GLEAM_WRITABLE_EVENT__@@');
function isWritableEvent(obj) {
    return !!(obj && typeof obj === 'object' && obj[WRITABLE_EVENT_SYMBOL]);
}
var EraConstraintMode;
(function (EraConstraintMode) {
    EraConstraintMode[EraConstraintMode["KEEP_MIN"] = 0] = "KEEP_MIN";
    EraConstraintMode[EraConstraintMode["KEEP_MAX"] = 1] = "KEEP_MAX";
    EraConstraintMode[EraConstraintMode["KEEP_SPAN"] = 2] = "KEEP_SPAN";
    EraConstraintMode[EraConstraintMode["CLIP_PRIORITIZING_MIN_CONSTRAINT"] = 3] = "CLIP_PRIORITIZING_MIN_CONSTRAINT";
    EraConstraintMode[EraConstraintMode["CLIP_PRIORITIZING_MAX_CONSTRAINT"] = 4] = "CLIP_PRIORITIZING_MAX_CONSTRAINT";
})(EraConstraintMode || (EraConstraintMode = {}));
const UNCONSTRAINED = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
function isConstrained(constraint) {
    return !(constraint.min === NEGATIVE_INFINITY && constraint.max === POSITIVE_INFINITY);
}
function constrainEra(era, constraints, mode) {
    var _a, _b;
    const minConstraint = (_a = constraints.min) !== null && _a !== void 0 ? _a : UNCONSTRAINED;
    const maxConstraint = (_b = constraints.max) !== null && _b !== void 0 ? _b : UNCONSTRAINED;
    if (minConstraint.containsPoint(era.min) && maxConstraint.containsPoint(era.max)) {
        
        return era;
    }
    else {
        switch (mode !== null && mode !== void 0 ? mode : EraConstraintMode.CLIP_PRIORITIZING_MAX_CONSTRAINT) {
            case EraConstraintMode.KEEP_MIN: {
                const constrainedMax = maxConstraint.clamp(era.max);
                const constrainedMin = min$1(era.min, constrainedMax);
                return Interval1D.fromEdges(constrainedMin, constrainedMax);
            }
            case EraConstraintMode.KEEP_MAX: {
                const constrainedMin = minConstraint.clamp(era.min);
                const constrainedMax = max$1(era.max, constrainedMin);
                return Interval1D.fromEdges(constrainedMin, constrainedMax);
            }
            case EraConstraintMode.KEEP_SPAN: {
                const { span } = era;
                const constrainedMax = doCombineConstraints(maxConstraint, minConstraint.shift(span)).clamp(era.max);
                const constrainedMin = constrainedMax - span;
                return Interval1D.fromEdges(constrainedMin, constrainedMax);
            }
            case EraConstraintMode.CLIP_PRIORITIZING_MIN_CONSTRAINT: {
                if (isConstrained(minConstraint) && isConstrained(maxConstraint)) {
                    const constrainedMin = minConstraint.clamp(era.min);
                    const constrainedMax = max$1(maxConstraint.clamp(era.max), constrainedMin);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else if (isConstrained(minConstraint)) {
                    const constrainedMin = minConstraint.clamp(era.min);
                    const constrainedMax = max$1(era.max, constrainedMin);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else if (isConstrained(maxConstraint)) {
                    const constrainedMax = maxConstraint.clamp(era.max);
                    const constrainedMin = min$1(era.min, constrainedMax);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else {
                    return era;
                }
            }
            case EraConstraintMode.CLIP_PRIORITIZING_MAX_CONSTRAINT: {
                if (isConstrained(minConstraint) && isConstrained(maxConstraint)) {
                    const constrainedMax = maxConstraint.clamp(era.max);
                    const constrainedMin = min$1(minConstraint.clamp(era.min), constrainedMax);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else if (isConstrained(minConstraint)) {
                    const constrainedMin = minConstraint.clamp(era.min);
                    const constrainedMax = max$1(era.max, constrainedMin);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else if (isConstrained(maxConstraint)) {
                    const constrainedMax = maxConstraint.clamp(era.max);
                    const constrainedMin = min$1(era.min, constrainedMax);
                    return Interval1D.fromEdges(constrainedMin, constrainedMax);
                }
                else {
                    return era;
                }
            }
        }
    }
}
class EventsGroup {
    constructor() {
        this.positionChanges = new NotifierBasic(undefined);
        this.rightNeighborChanges = new NotifierBasic(undefined);
        this.styleChanges = new NotifierBasic(undefined);
        this.labelChanges = new NotifierBasic(undefined);
        this.lanes = new Array();
        this.currLaneNums = new Map();
        this.eventSnapshots = new Map();
        this.snapTimes_PSEC = new AaTreeMap((a, b) => {
            return (a - b);
        });
    }
    get size() {
        return this.currLaneNums.size;
    }
    getLanes() {
        return this.lanes;
    }
    has(event) {
        return this.currLaneNums.has(event);
    }
    getLaneNumContaining(event) {
        return this.currLaneNums.get(event);
    }
    getLaneContaining(event) {
        const laneNum = this.currLaneNums.get(event);
        return (laneNum === undefined ? undefined : this.lanes[laneNum]);
    }
    getLeftNeighbor(event) {
        var _a, _b, _c;
        const lane = requireDefined(this.getLaneContaining(event));
        return (_b = (_a = lane.getEventsAt(event.era_PSEC)) === null || _a === void 0 ? void 0 : _a.valueBefore(event)) !== null && _b !== void 0 ? _b : (_c = lane.getEventsBefore(event.era_PSEC)) === null || _c === void 0 ? void 0 : _c.valueBefore(undefined);
    }
    getRightNeighbor(event) {
        var _a, _b, _c;
        const lane = requireDefined(this.getLaneContaining(event));
        return (_b = (_a = lane.getEventsAt(event.era_PSEC)) === null || _a === void 0 ? void 0 : _a.valueAfter(event)) !== null && _b !== void 0 ? _b : (_c = lane.getEventsAfter(event.era_PSEC)) === null || _c === void 0 ? void 0 : _c.valueAfter(undefined);
    }
    addEvent(event) {
        if (isWritableEvent(event)) {
            requireEqual(event._owner, undefined);
            event._owner = this;
        }
        this._updateEvent(false, event);
        return event;
    }
    
    _updateEvent(ongoing, event) {
        if (isWritableEvent(event)) {
            requireEqual(event._owner, this);
        }
        const oldSnapshot = this.eventSnapshots.get(event);
        if (!equal(event.era_PSEC, oldSnapshot === null || oldSnapshot === void 0 ? void 0 : oldSnapshot.era_PSEC)) {
            this.resettleEvent(ongoing, event, event.era_PSEC);
        }
        if (event.styleKey !== (oldSnapshot === null || oldSnapshot === void 0 ? void 0 : oldSnapshot.styleKey)) {
            this.styleChanges.fire({ ongoing, event });
        }
        if (event.label !== (oldSnapshot === null || oldSnapshot === void 0 ? void 0 : oldSnapshot.label)) {
            this.labelChanges.fire({ ongoing, event });
        }
        this.eventSnapshots.set(event, {
            label: event.label,
            era_PSEC: event.era_PSEC,
            styleKey: event.styleKey,
        });
        return event;
    }
    removeEvent(event) {
        if (isWritableEvent(event)) {
            requireEqual(event._owner, this);
            event._owner = undefined;
        }
        this.resettleEvent(false, event, undefined);
        this.eventSnapshots.delete(event);
    }
    clearEvents() {
        
        for (const [event] of this.currLaneNums) {
            this.removeEvent(event);
        }
    }
    findNearestSnapTime_PSEC(time_PSEC, min_PSEC, max_PSEC, eventsToSuppress) {
        
        const eventSuppression = new DisposerGroup();
        const suppressSnapTime = (snapTime_PSEC, event) => {
            if (this.removeSnapTime(snapTime_PSEC, event)) {
                return () => {
                    this.addSnapTime(snapTime_PSEC, event);
                };
            }
            return NOOP;
        };
        for (const event of eventsToSuppress) {
            const laneNum = this.currLaneNums.get(event);
            const era_PSEC = (laneNum === undefined ? undefined : this.lanes[laneNum].getEra_PSEC(event));
            if (era_PSEC) {
                eventSuppression.add(suppressSnapTime(era_PSEC.min, event));
                eventSuppression.add(suppressSnapTime(era_PSEC.max, event));
            }
        }
        try {
            
            return this.doFindNearestSnapTime_PSEC(time_PSEC, min_PSEC, max_PSEC);
        }
        finally {
            
            eventSuppression.dispose();
        }
    }
    doFindNearestSnapTime_PSEC(time_PSEC, min_PSEC, max_PSEC) {
        let a_PSEC = this.snapTimes_PSEC.keyBefore(time_PSEC);
        if (a_PSEC !== undefined && !(min_PSEC <= a_PSEC && a_PSEC <= max_PSEC)) {
            a_PSEC = undefined;
        }
        let b_PSEC = this.snapTimes_PSEC.keyAtOrAfter(time_PSEC);
        if (b_PSEC !== undefined && !(min_PSEC <= b_PSEC && b_PSEC <= max_PSEC)) {
            b_PSEC = undefined;
        }
        if (a_PSEC !== undefined && b_PSEC !== undefined) {
            return (Math.abs(time_PSEC - a_PSEC) < Math.abs(time_PSEC - b_PSEC) ? a_PSEC : b_PSEC);
        }
        else if (a_PSEC !== undefined) {
            return a_PSEC;
        }
        else if (b_PSEC !== undefined) {
            return b_PSEC;
        }
        else {
            return undefined;
        }
    }
    addSnapTime(snapTime_PSEC, event) {
        let events = this.snapTimes_PSEC.get(snapTime_PSEC);
        if (!events) {
            events = new LinkedSet();
            this.snapTimes_PSEC.set(snapTime_PSEC, events);
        }
        const hadEvent = events.has(event);
        events.add(event);
        return !hadEvent;
    }
    ;
    removeSnapTime(snapTime_PSEC, event) {
        let deletedEvent = false;
        const events = this.snapTimes_PSEC.get(snapTime_PSEC);
        if (events) {
            deletedEvent = events.delete(event);
            if (events.size === 0) {
                this.snapTimes_PSEC.delete(snapTime_PSEC);
            }
        }
        return deletedEvent;
    }
    resettleEvent(ongoing, event, newEra_PSEC, pruneEmptyLanes = true) {
        
        
        const oldLaneNum = this.currLaneNums.get(event);
        const oldEra_PSEC = (oldLaneNum === undefined ? undefined : this.lanes[oldLaneNum].removeEvent(event));
        
        if (oldEra_PSEC) {
            this.removeSnapTime(oldEra_PSEC.min, event);
            this.removeSnapTime(oldEra_PSEC.max, event);
        }
        
        const newLaneNum = (newEra_PSEC ? this.getOrCreateLaneWithRoom(newEra_PSEC) : undefined);
        
        if (newLaneNum !== oldLaneNum || !equal(newEra_PSEC, oldEra_PSEC)) {
            function getLeftNeighbor(lanes, laneNum, t_PSEC) {
                const leftEntry = lanes[laneNum].getEntryStartingAtOrBefore(t_PSEC);
                return leftEntry === null || leftEntry === void 0 ? void 0 : leftEntry[1].valueBefore(undefined);
            }
            if (oldLaneNum !== undefined && oldEra_PSEC) {
                const oldLeftNeighbor = getLeftNeighbor(this.lanes, oldLaneNum, oldEra_PSEC.min);
                oldLeftNeighbor && this.rightNeighborChanges.fire({ ongoing, event: oldLeftNeighbor });
            }
            if (newLaneNum !== undefined && newEra_PSEC) {
                const newLeftNeighbor = getLeftNeighbor(this.lanes, newLaneNum, newEra_PSEC.min);
                newLeftNeighbor && this.rightNeighborChanges.fire({ ongoing, event: newLeftNeighbor });
            }
            if (newLaneNum !== undefined && newLaneNum !== oldLaneNum) {
                this.rightNeighborChanges.fire({ ongoing, event });
            }
        }
        
        if (newLaneNum !== undefined) {
            this.currLaneNums.set(event, newLaneNum);
            this.lanes[newLaneNum].addEvent(event, requireDefined(newEra_PSEC));
        }
        else {
            this.currLaneNums.delete(event);
        }
        
        if (newEra_PSEC) {
            this.addSnapTime(newEra_PSEC.min, event);
            this.addSnapTime(newEra_PSEC.max, event);
        }
        
        this.positionChanges.fire({ ongoing, event });
        
        if (oldLaneNum !== undefined && oldEra_PSEC && (newLaneNum !== oldLaneNum || !equal(newEra_PSEC, oldEra_PSEC))) {
            const vacatedEras_PSEC = (newLaneNum !== oldLaneNum ? [oldEra_PSEC] : oldEra_PSEC.minus(newEra_PSEC !== null && newEra_PSEC !== void 0 ? newEra_PSEC : Interval1D.ZERO));
            for (let laneNum = oldLaneNum + 1; laneNum < this.lanes.length; laneNum++) {
                const lane = this.lanes[laneNum];
                for (const vacatedEra_PSEC of vacatedEras_PSEC) {
                    
                    
                    
                    for (const other of [...lane.getEventsIntersecting(vacatedEra_PSEC)]) {
                        this.resettleEvent(ongoing, other, other.era_PSEC, false);
                    }
                }
            }
        }
        
        if (pruneEmptyLanes) {
            while (this.lanes.length > 0 && this.lanes[this.lanes.length - 1].size === 0) {
                this.lanes.pop();
            }
        }
    }
    getOrCreateLaneWithRoom(era_PSEC) {
        for (let laneNum = 0; laneNum < this.lanes.length; laneNum++) {
            const lane = this.lanes[laneNum];
            if (!lane.hasEventsIntersecting(era_PSEC)) {
                return laneNum;
            }
        }
        const newLane = new EventsLane();
        this.lanes.push(newLane);
        return (this.lanes.length - 1);
    }
}
class EventsLane {
    constructor() {
        this.events = new AaTreeMap((a, b) => {
            const minComparison = a.min - b.min;
            if (minComparison !== 0) {
                return minComparison;
            }
            const maxComparison = a.max - b.max;
            if (maxComparison !== 0) {
                return maxComparison;
            }
            return 0;
        });
        this.eras_PSEC = new Map();
    }
    get size() {
        return this.eras_PSEC.size;
    }
    getEvents() {
        return this.events;
    }
    getEventsAt(era_PSEC) {
        return this.events.get(era_PSEC);
    }
    getEventsBefore(era_PSEC) {
        return this.events.valueBefore(era_PSEC);
    }
    getEventsAtOrBefore(era_PSEC) {
        return this.events.valueAtOrBefore(era_PSEC);
    }
    getEventsAfter(era_PSEC) {
        return this.events.valueAfter(era_PSEC);
    }
    getEventsAtOrAfter(era_PSEC) {
        return this.events.valueAtOrAfter(era_PSEC);
    }
    getEventContaining(t_PSEC) {
        const en = this.events.entryAtOrBefore(Interval1D.fromEdges(t_PSEC, Number.POSITIVE_INFINITY));
        if (en === null || en === void 0 ? void 0 : en[0].containsPoint(t_PSEC)) {
            
            
            
            return en[1].valueBefore(undefined);
        }
        else {
            return undefined;
        }
    }
    getEntryStartingBefore(t_PSEC) {
        return this.events.entryBefore(Interval1D.fromEdges(t_PSEC, Number.NEGATIVE_INFINITY));
    }
    getEntryStartingAtOrBefore(t_PSEC) {
        return this.events.entryAtOrBefore(Interval1D.fromEdges(t_PSEC, Number.POSITIVE_INFINITY));
    }
    getEntryStartingAfter(t_PSEC) {
        return this.events.entryAfter(Interval1D.fromEdges(t_PSEC, Number.POSITIVE_INFINITY));
    }
    getEntryStartingAtOrAfter(t_PSEC) {
        return this.events.entryAtOrAfter(Interval1D.fromEdges(t_PSEC, Number.NEGATIVE_INFINITY));
    }
    hasEventsIntersecting(era_PSEC) {
        function doSubtree(root) {
            if (root) {
                const rootEra_PSEC = root.item[0];
                if (era_PSEC.intersectsInterval(rootEra_PSEC)) {
                    return true;
                }
                if (era_PSEC.min < rootEra_PSEC.min) {
                    if (doSubtree(root.left)) {
                        return true;
                    }
                }
                if (era_PSEC.max > rootEra_PSEC.max) {
                    if (doSubtree(root.right)) {
                        return true;
                    }
                }
            }
            return false;
        }
        return doSubtree(this.events.getRoot());
    }
    getEventsIntersecting(era_PSEC) {
        function* doSubtree(root) {
            if (root) {
                
                
                const rootEra_PSEC = root.item[0];
                if (era_PSEC.min < rootEra_PSEC.min) {
                    yield* doSubtree(root.left);
                }
                if (era_PSEC.intersectsInterval(rootEra_PSEC)) {
                    yield* root.item[1];
                }
                if (era_PSEC.max > rootEra_PSEC.max) {
                    yield* doSubtree(root.right);
                }
            }
        }
        return doSubtree(this.events.getRoot());
    }
    addEvent(event, era_PSEC) {
        if (this.hasEventsIntersecting(era_PSEC)) {
            throw new Error();
        }
        
        let events = this.events.get(era_PSEC);
        if (events === undefined) {
            events = new LinkedSet();
            this.events.set(era_PSEC, events);
        }
        events.addLast(event);
        this.eras_PSEC.set(event, era_PSEC);
    }
    
    removeEvent(event) {
        const era_PSEC = requireDefined(this.eras_PSEC.get(event));
        this.eras_PSEC.delete(event);
        const events = requireDefined(this.events.get(era_PSEC));
        events.delete(event);
        if (events.size === 0) {
            this.events.delete(era_PSEC);
        }
        return era_PSEC;
    }
    getEra_PSEC(event) {
        return this.eras_PSEC.get(event);
    }
}

const STANDARD_PATTERN_GENS = newImmutableMap([
    ['solid', () => new SolidPattern()],
    ['striped', () => new StripedPattern()],
    ['test', () => new TestPattern()],
]);
class FrozenPattern {
    constructor(peerTag, rasterizer) {
        this.peer = createDomPeer(peerTag, this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.rasterizer = rasterizer;
    }
    createRasterizer() {
        return this.rasterizer;
    }
}
class SolidPattern {
    constructor() {
        this.peer = createDomPeer('solid-pattern', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(127,127,127)');
    }
    createRasterizer() {
        return new SolidPatternRasterizer(this.color.get());
    }
}
class SolidPatternRasterizer extends ValueBase {
    constructor(color) {
        super('SolidPatternRasterizer', color);
        this.color = color;
    }
    createImage() {
        const border_PX = 1;
        const canvas = document.createElement('canvas');
        canvas.width = border_PX + 1 + border_PX;
        canvas.height = border_PX + 1 + border_PX;
        const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.fillStyle = this.color.cssString;
        g.fillRect(border_PX, border_PX, 1, 1);
        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData(0, 0, canvas.width, canvas.height),
        };
    }
}
class StripedPattern {
    constructor() {
        this.peer = createDomPeer('striped-pattern', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.angle_MATHDEG = StyleProp.create(this.style, '--angle-mathdeg', cssFloat, -45);
        this.lateralShift_LPX = StyleProp.create(this.style, '--lateral-shift-px', cssFloat, 0);
        this.stripes = StyleProp.create(this.style, '--stripes', cssStripesArray, '5px rgb(255,255,255), 6px rgb(127,127,127)');
    }
    createRasterizer(laneHeight_LPX, maxDim_PX) {
        return new StripedPatternRasterizer(currentDpr(this), this.angle_MATHDEG.get(), this.lateralShift_LPX.get(), laneHeight_LPX, maxDim_PX, newImmutableList(this.stripes.get()));
    }
}
class StripedPatternRasterizer extends ValueBase {
    constructor(dpr, angle_MATHDEG, lateralShift_LPX, laneHeight_LPX, maxDim_PX, stripes) {
        super('StripedPatternRasterizer', dpr, angle_MATHDEG, lateralShift_LPX, laneHeight_LPX, maxDim_PX, stripes);
        this.dpr = dpr;
        this.angle_MATHDEG = angle_MATHDEG;
        this.lateralShift_LPX = lateralShift_LPX;
        this.laneHeight_LPX = laneHeight_LPX;
        this.maxDim_PX = maxDim_PX;
        this.stripes = stripes;
    }
    createImage() {
        
        const { stripes, vPeriod_PX } = run(() => {
            let vSum_PX = 0;
            for (const stripe of this.stripes) {
                vSum_PX += this.dpr * stripe.thickness_LPX;
            }
            if (vSum_PX >= 0.5) {
                return {
                    stripes: this.stripes,
                    vPeriod_PX: vSum_PX,
                };
            }
            else {
                return {
                    stripes: newImmutableList([new Stripe(1, GRAY)]),
                    vPeriod_PX: 1,
                };
            }
        });
        const vMins_PX = [];
        let vSum_PX = 0;
        for (const stripe of stripes) {
            vMins_PX.push(vSum_PX);
            vSum_PX += this.dpr * stripe.thickness_LPX;
        }
        let angle_MATHRAD = this.angle_MATHDEG * Math.PI / 180.0;
        let cosAngle = Math.cos(angle_MATHRAD);
        let sinAngle = Math.sin(angle_MATHRAD);
        if (cosAngle < 0) {
            angle_MATHRAD += Math.PI;
            cosAngle *= -1;
            sinAngle *= -1;
        }
        const border_PX = 1;
        const patternHeightMax_PX = this.maxDim_PX - 2 * border_PX;
        const patternHeight_PX = Math.min(patternHeightMax_PX, Math.ceil(this.dpr * this.laneHeight_LPX));
        const patternWidthMax_PX = this.maxDim_PX - 2 * border_PX;
        const patternWidthPref_PX = Math.round(Math.abs(vPeriod_PX / sinAngle));
        const patternWidth_PX = (patternWidthPref_PX > patternWidthMax_PX ? 1 : patternWidthPref_PX);
        const vShiftDefault_PX = run(() => {
            
            
            
            const firstStripeThickness_PX = this.dpr * requireDefined(stripes.get(0)).thickness_LPX;
            const absAngle_RAD = Math.abs(angle_MATHRAD);
            const a_FRAC = Math.SQRT1_2 * sinAngle / Math.sin(0.75 * Math.PI - absAngle_RAD);
            const b_FRAC = a_FRAC * Math.cos(0.25 * Math.PI - absAngle_RAD);
            if (sinAngle <= 0) {
                
                return -b_FRAC * firstStripeThickness_PX;
            }
            else {
                
                return (1.0 - b_FRAC) * firstStripeThickness_PX - patternHeight_PX * cosAngle;
            }
        });
        const vShift_PX = vShiftDefault_PX + this.dpr * this.lateralShift_LPX;
        const canvas = document.createElement('canvas');
        canvas.width = border_PX + patternWidth_PX + border_PX;
        canvas.height = border_PX + patternHeight_PX + border_PX;
        const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.save();
        g.translate(border_PX, canvas.height - border_PX);
        g.scale(1, -1);
        try {
            for (let row = 0; row < patternHeight_PX; row++) {
                const y = row + 0.5;
                for (let col = 0; col < patternWidth_PX; col++) {
                    const x = col + 0.5;
                    
                    const v = mod(x * sinAngle + y * cosAngle + vPeriod_PX + vShift_PX, vPeriod_PX);
                    const stripeIndexPrelim = findIndexAtOrBefore(vMins_PX, vMin => vMin - v);
                    const stripeIndex = mod(stripeIndexPrelim, stripes.size);
                    const stripe = requireDefined(stripes.get(stripeIndex));
                    const stripeColor = stripe.color;
                    const stripeVMin_PX = vMins_PX[stripeIndex];
                    const stripeVMax_PX = stripeVMin_PX + this.dpr * stripe.thickness_LPX;
                    const vAboveMin_PX = v - stripeVMin_PX;
                    const vBelowMax_PX = stripeVMax_PX - v;
                    const feather_PX = 1;
                    if (vAboveMin_PX < 0.5 * feather_PX && vAboveMin_PX < vBelowMax_PX) {
                        const prevStripeIndex = mod(stripeIndex - 1, stripes.size);
                        const prevStripe = requireDefined(stripes.get(prevStripeIndex));
                        const prevStripeColor = prevStripe.color;
                        const mixFrac = 0.5 + vAboveMin_PX / feather_PX;
                        const mixColor = new Color((1 - mixFrac) * prevStripeColor.r + (mixFrac) * stripeColor.r, (1 - mixFrac) * prevStripeColor.g + (mixFrac) * stripeColor.g, (1 - mixFrac) * prevStripeColor.b + (mixFrac) * stripeColor.b, (1 - mixFrac) * prevStripeColor.a + (mixFrac) * stripeColor.a);
                        g.fillStyle = mixColor.cssString;
                    }
                    else if (vBelowMax_PX < 0.5 * feather_PX) {
                        const nextStripeIndex = mod(stripeIndex + 1, stripes.size);
                        const nextStripe = requireDefined(stripes.get(nextStripeIndex));
                        const nextStripeColor = nextStripe.color;
                        const mixFrac = 0.5 + vBelowMax_PX / feather_PX;
                        const mixColor = new Color((mixFrac) * stripeColor.r + (1 - mixFrac) * nextStripeColor.r, (mixFrac) * stripeColor.g + (1 - mixFrac) * nextStripeColor.g, (mixFrac) * stripeColor.b + (1 - mixFrac) * nextStripeColor.b, (mixFrac) * stripeColor.a + (1 - mixFrac) * nextStripeColor.a);
                        g.fillStyle = mixColor.cssString;
                    }
                    else {
                        g.fillStyle = stripeColor.cssString;
                    }
                    g.fillRect(col, row, 1, 1);
                }
            }
        }
        finally {
            g.restore();
        }
        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData(0, 0, canvas.width, canvas.height),
        };
    }
}
class Stripe extends ValueBase {
    constructor(thickness_LPX, color) {
        super(thickness_LPX, color);
        this.thickness_LPX = thickness_LPX;
        this.color = color;
    }
}
const cssStripesArray = new CssParser('e.g. 3px red, 2px white, ...', parseStripesArray);
function parseStripesArray(s) {
    var _a;
    
    const tokens = s.match(/(?:[^,\(]*\(.*?\)[^,\(]*)+|[^,]+/g);
    return ((_a = tokens === null || tokens === void 0 ? void 0 : tokens.map(parseStripe)) !== null && _a !== void 0 ? _a : UNPARSEABLE);
}
function parseStripeThickness_LPX(s) {
    
    s = s.trim();
    if (s.endsWith('px')) {
        const v = parseFloat(s.substring(0, s.length - 'px'.length));
        if (!Number.isNaN(v)) {
            return v;
        }
    }
    throw new Error(`Failed to parse stripe thickness: string = "${s}"`);
}
function parseStripe(s) {
    
    const tokens = s.match(/(?:[^ \(]*\(.*?\)[^ \(]*)+|[^ ]+/g);
    if (isNonNullish(tokens) && tokens.length === 2) {
        return new Stripe(parseStripeThickness_LPX(tokens[0]), parseColor(tokens[1]));
    }
    throw new Error(`Failed to parse stripe: string = "${s}"`);
}
class TestPattern {
    constructor() {
        this.peer = createDomPeer('test-pattern', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
    }
    createRasterizer() {
        return new TestPatternRasterizer();
    }
}
class TestPatternRasterizer extends ValueBase {
    constructor() {
        super('TestPatternRasterizer');
    }
    createImage() {
        const border_PX = 1;
        const canvas = document.createElement('canvas');
        canvas.width = border_PX + 4 + border_PX;
        canvas.height = border_PX + 4 + border_PX;
        const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.save();
        g.translate(border_PX, canvas.height - border_PX);
        g.scale(1, -1);
        try {
            g.fillStyle = CYAN.cssString;
            g.fillRect(0, 0, 3, 1);
            g.fillStyle = MAGENTA.cssString;
            g.fillRect(3, 0, 1, 3);
            g.fillStyle = YELLOW.cssString;
            g.fillRect(1, 3, 3, 1);
            g.fillStyle = BLACK.cssString;
            g.fillRect(0, 1, 1, 3);
            g.fillStyle = RED.cssString;
            g.fillRect(1, 2, 1, 1);
            g.fillStyle = BLUE.cssString;
            g.fillRect(2, 2, 1, 1);
            g.fillStyle = GREEN.cssString;
            g.fillRect(1, 1, 1, 1);
        }
        finally {
            g.restore();
        }
        return {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData(0, 0, canvas.width, canvas.height),
        };
    }
}

function splitToMilliPrecision(x) {
    if (Math.abs(x) >= 2 ** 35) {
        
        return { a: x, b: 0 };
    }
    else {
        const a = Math.trunc(x * 2 ** -12) * 2 ** 12;
        const b = x - a;
        return { a, b };
    }
}
function glUniformEra(gl, location, era_PSEC) {
    const min_PSEC = splitToMilliPrecision(era_PSEC.min);
    const span_SEC = era_PSEC.span;
    gl.uniform3f(location, min_PSEC.a, min_PSEC.b, span_SEC);
}
function requireInt(x) {
    if (x !== Math.trunc(x)) {
        throw new Error();
    }
    return x;
}
class StateMarker {
    static create() {
        return new StateMarker(0);
    }
    constructor(seqNum) {
        this.seqNum = seqNum;
    }
    bump() {
        return new StateMarker(this.seqNum + 1);
    }
}
class Indexed {
    constructor() {
        this.marker = StateMarker.create();
        this.entriesByKey = new LinkedMap();
        this.entriesByIndex = new Array();
    }
    *[Symbol.iterator]() {
        for (let i = 0; i < this.entriesByIndex.length; i++) {
            const [key, value] = this.entriesByIndex[i];
            yield [key, value, i];
        }
    }
    addIfAbsent(key, value) {
        const entry = this.entriesByKey.get(key);
        if (entry) {
            return entry;
        }
        else {
            const newIndex = this.entriesByIndex.length;
            const newEntry = [newIndex, value];
            this.entriesByKey.putLast(key, newEntry);
            this.entriesByIndex.push([key, value]);
            this.marker = this.marker.bump();
            return newEntry;
        }
    }
    createIfAbsent(key, createValue) {
        const entry = this.entriesByKey.get(key);
        if (entry) {
            return entry;
        }
        else {
            const newValue = createValue();
            const newIndex = this.entriesByIndex.length;
            const newEntry = [newIndex, newValue];
            this.entriesByKey.putLast(key, newEntry);
            this.entriesByIndex.push([key, newValue]);
            this.marker = this.marker.bump();
            return newEntry;
        }
    }
    requireByKey(key) {
        return requireDefined(this.getByKey(key));
    }
    getByKey(key) {
        return this.entriesByKey.get(key);
    }
    requireByIndex(index) {
        return requireDefined(this.getByIndex(index));
    }
    getByIndex(index) {
        return this.entriesByIndex[index];
    }
}

var fragShader_GLSL$2 = "#version 100\nprecision lowp float;\n\n\nuniform sampler2D ATLAS;\nuniform highp vec2 ATLAS_SIZE_PX;\n\n\nvarying highp float v_sMin_PX;\nvarying highp float v_dsUnpacked_PX;\nvarying highp float v_t_PX;\nvarying lowp float v_isAlphaMask;\nvarying lowp vec4 v_alphaMaskColor;\nvarying lowp float v_fadeMask;\n\n\nvoid main( ) {\n    vec4 rgba;\n    if ( v_isAlphaMask >= 0.5 ) {\n        float ds_PX = floor( 0.25*v_dsUnpacked_PX + 0.01 );\n        float s_PX = v_sMin_PX + ds_PX + 0.5;\n\n        vec4 texel = texture2D( ATLAS, vec2( s_PX, v_t_PX )/ATLAS_SIZE_PX );\n        float componentIndex = floor( v_dsUnpacked_PX - 4.0*ds_PX + 0.01 );\n\n        float mask;\n        if ( componentIndex < 0.5 ) {\n            mask = texel.r;\n        }\n        else if ( componentIndex < 1.5 ) {\n            mask = texel.g;\n        }\n        else if ( componentIndex < 2.5 ) {\n            mask = texel.b;\n        }\n        else {\n            mask = texel.a;\n        }\n\n        float a = v_alphaMaskColor.a * clamp( mask, 0.0, 1.0 );\n        rgba = vec4( v_alphaMaskColor.rgb, a );\n    }\n    else {\n        float ds_PX = v_dsUnpacked_PX;\n        float s_PX = v_sMin_PX + ds_PX;\n        rgba = texture2D( ATLAS, vec2( s_PX, v_t_PX )/ATLAS_SIZE_PX );\n    }\n\n    float a = rgba.a * clamp( v_fadeMask, 0.0, 1.0 );\n    gl_FragColor = vec4( a*rgba.rgb, a );\n}\n";

var vertShader_GLSL$2 = "#version 100\n\n\nfloat round( float v ) {\n    return floor( v + 0.5 );\n}\n\nint intRound( float v ) {\n    return int( v + 0.5 );\n}\n\n\n/**\n * Device Pixel Ratio, for converting between LPX and PX.\n */\nuniform float DPR;\n\n/**\n * viewMinHi_PSEC, viewMinLo_PSEC, viewSpan_SEC\n */\nuniform vec3 X_VIEW_LIMITS;\n\nuniform vec4 VIEWPORT_PX;\nuniform float LANE_HEIGHT_PX;\n\n/**\n * If a string is too long to fit, this is the width of the zone\n * over which the string's rightmost glyphs fade to transparent.\n */\nuniform float FADE_ZONE_PX;\n\n/**\n * Each texel holds 4 indices into GLYPHS_TABLE.\n */\nuniform highp sampler2D CODES;\nuniform vec2 CODES_SIZE;\nfloat readGlyphCode( float codeIndex ) {\n    float texelIndex = floor( codeIndex / 4.0 );\n    float y = floor( texelIndex / CODES_SIZE.x );\n    float x = texelIndex - y*CODES_SIZE.x;\n    vec4 raw = texture2D( CODES, ( vec2( x, y ) + 0.5 )/CODES_SIZE );\n    float componentIndex = codeIndex - 4.0*texelIndex;\n\n    float v;\n    if ( componentIndex < 0.5 ) {\n        v = raw.r;\n    }\n    else if ( componentIndex < 1.5 ) {\n        v = raw.g;\n    }\n    else if ( componentIndex < 2.5 ) {\n        v = raw.b;\n    }\n    else {\n        v = raw.a;\n    }\n    return round( v );\n}\n\n/**\n * Texel 1: sMin_PX, tMin_PX, sUnpackedSpan_PX, tSpan_PX\n * Texel 2: ascent_PX, isAlphaMask, IGNORED, IGNORED\n */\nuniform highp sampler2D GLYPHS_TABLE;\nuniform vec2 GLYPHS_TABLE_SIZE;\n\nvec4 readGlyphInfoA( float glyphIndex ) {\n    float texelIndex = 2.0*glyphIndex + 0.0;\n    float y = floor( texelIndex / GLYPHS_TABLE_SIZE.x );\n    float x = texelIndex - y*GLYPHS_TABLE_SIZE.x;\n    return texture2D( GLYPHS_TABLE, ( vec2( x, y ) + 0.5 )/GLYPHS_TABLE_SIZE );\n}\n\nvec4 readGlyphInfoB( float glyphIndex ) {\n    float texelIndex = 2.0*glyphIndex + 1.0;\n    float y = floor( texelIndex / GLYPHS_TABLE_SIZE.x );\n    float x = texelIndex - y*GLYPHS_TABLE_SIZE.x;\n    return texture2D( GLYPHS_TABLE, ( vec2( x, y ) + 0.5 )/GLYPHS_TABLE_SIZE );\n}\n\n/**\n * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES\n * Texel 2: firstCodeIndex, styleIndex, xRightNeighborHi_PSEC, xRightNeighborLo_PSEC\n */\nuniform highp sampler2D EVENTS_TABLE;\nuniform vec2 EVENTS_TABLE_SIZE;\n\nvec4 readEventInfoA( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 0.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\nvec4 readEventInfoB( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 1.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\n/**\n * Texel 1: xOffset_LPX, yOffset_LPX, ( 8-bit fgRed, 8-bit fgGreen ), ( 8-bit fgBlue, 8-bit fgAlpha )\n * Texel 2: allowXOvershoot, IGNORED, IGNORED, IGNORED\n * Texel 3: IGNORED, IGNORED, IGNORED, IGNORED\n */\nuniform highp sampler2D STYLES_TABLE;\nuniform vec2 STYLES_TABLE_SIZE;\n\nvec4 readStyleInfoA( float styleIndex ) {\n    float texelIndex = 3.0*styleIndex + 0.0;\n    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );\n    float x = texelIndex - y*STYLES_TABLE_SIZE.x;\n    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );\n}\n\nvec4 readStyleInfoB( float styleIndex ) {\n    float texelIndex = 3.0*styleIndex + 1.0;\n    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );\n    float x = texelIndex - y*STYLES_TABLE_SIZE.x;\n    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );\n}\n\n/**\n * eventIndex, ( 14-bit codeInString, 2-bit corner )\n *\n * corner = 2 - 3\n *          |   |\n *          0 - 1\n */\nattribute vec2 inVertexCoords;\n\n/**\n * WebGL 1 requires loop bounds to be compile-time constants, so\n * we declare a const max bound, then break out of the loop when\n * the counter reaches the (dynamic) actual bound.\n *\n * Setting the max bound too low would make long labels unusable,\n * so use a large value. Old and very-low-end graphics hardware\n * may choke on such a large value at shader-compile time -- but\n * this painter wouldn't be practically usable on such hardware\n * anyway. Better to work well on decent hardware, and fail quickly\n * on very-low-end hardware.\n *\n * TODO: Remove this when we switch to webgl2\n */\nconst float MAX_GLYPHS_PER_EVENT = 99999.0;\n\nconst float NULL_FLOAT = -1.0;\n\n/**\n * Each block is 7 glyph codes and then a pointer to the next block\n */\nconst float FLOATS_PER_BLOCK = 8.0;\n\n/**\n * Most of this shader follows the same code path for all vertices in\n * a glyph. Those parts can effectively discard the glyph by setting\n * gl_Position to this value, then returning. This puts the glyph's\n * vertices outside the viewport, and all at the same spot so the\n * glyph has zero size.\n */\nconst vec4 DISCARD_GLYPH = vec4( -2.0, -2.0, -2.0, 1.0 );\n\n\nvarying highp float v_sMin_PX;\nvarying highp float v_dsUnpacked_PX;\nvarying highp float v_t_PX;\nvarying lowp float v_isAlphaMask;\nvarying lowp vec4 v_alphaMaskColor;\nvarying lowp float v_fadeMask;\n\n\nvoid main( ) {\n    float eventIndex = inVertexCoords.x;\n    float combinedCoord = inVertexCoords.y;\n    float codeInString = floor( combinedCoord / 4.0 );\n    float cornerNum = round( combinedCoord - 4.0*codeInString );\n\n    // Whole-event values\n    vec4 eventInfoA = readEventInfoA( eventIndex );\n    vec4 eventInfoB = readEventInfoB( eventIndex );\n    float xEventLeftHi_PSEC = eventInfoA.x;\n    float xEventLeftLo_PSEC = eventInfoA.y;\n    float dxDuration_SEC = eventInfoA.z;\n    float yEventTopFromViewMax_LANES = eventInfoA.w;\n    float firstCodeIndex = eventInfoB.x;\n    float styleIndex = eventInfoB.y;\n    float xRightNeighborHi_PSEC = eventInfoB.z;\n    float xRightNeighborLo_PSEC = eventInfoB.w;\n    vec4 styleInfoA = readStyleInfoA( styleIndex );\n    vec4 styleInfoB = readStyleInfoB( styleIndex );\n    float xOffset_LPX = styleInfoA.x;\n    float yOffset_LPX = styleInfoA.y;\n    float maskRedGreen = styleInfoA.z;\n    float maskBlueAlpha = styleInfoA.w;\n    float allowXOvershoot = styleInfoB.x;\n    float maskRed = floor( maskRedGreen / 256.0 );\n    float maskGreen = maskRedGreen - 256.0*maskRed;\n    float maskBlue = floor( maskBlueAlpha / 256.0 );\n    float maskAlpha = maskBlueAlpha - 256.0*maskBlue;\n    float xOffset_PX = xOffset_LPX * DPR;\n    float yOffset_PX = yOffset_LPX * DPR;\n\n    // X context\n    float xViewMinHi_PSEC = X_VIEW_LIMITS.x;\n    float xViewMinLo_PSEC = X_VIEW_LIMITS.y;\n    float xViewSpan_SEC = X_VIEW_LIMITS.z;\n    float xViewSpan_PX = VIEWPORT_PX.z;\n\n    // X of event's left edge\n    float xEventLeftFromViewMin_SEC = ( xEventLeftHi_PSEC - xViewMinHi_PSEC ) + ( xEventLeftLo_PSEC - xViewMinLo_PSEC );\n    if ( xEventLeftFromViewMin_SEC > xViewSpan_SEC ) {\n        gl_Position = DISCARD_GLYPH;\n        return;\n    }\n    float xEventLeft_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );\n\n    // X where glyphs get cut off\n    float xCutoffFromViewMin_SEC;\n    if ( allowXOvershoot >= 0.5 ) {\n        xCutoffFromViewMin_SEC = ( xRightNeighborHi_PSEC - xViewMinHi_PSEC ) + ( xRightNeighborLo_PSEC - xViewMinLo_PSEC );\n    }\n    else {\n        xCutoffFromViewMin_SEC = xEventLeftFromViewMin_SEC + dxDuration_SEC;\n    }\n    if ( xCutoffFromViewMin_SEC < 0.0 ) {\n        gl_Position = DISCARD_GLYPH;\n        return;\n    }\n    float xCutoff_PX = xCutoffFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC;\n    float xFadeZoneLeft_PX = xCutoff_PX - FADE_ZONE_PX;\n\n    // Index of current glyph code, and X of glyph's left edge\n    float xGlyphLeft_PX = xEventLeft_PX + xOffset_PX;\n    float codeIndex = firstCodeIndex;\n    for ( float i = 0.0; i < MAX_GLYPHS_PER_EVENT; i++ ) {\n        if ( i >= codeInString ) {\n            break;\n        }\n\n        // Visit glyph\n        if ( xGlyphLeft_PX >= xCutoff_PX ) {\n            gl_Position = DISCARD_GLYPH;\n            return;\n        }\n        if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {\n            codeIndex = readGlyphCode( codeIndex );\n        }\n        if ( codeIndex == NULL_FLOAT ) {\n            gl_Position = DISCARD_GLYPH;\n            return;\n        }\n        float glyphIndex = readGlyphCode( codeIndex );\n        if ( glyphIndex == NULL_FLOAT ) {\n            gl_Position = DISCARD_GLYPH;\n            return;\n        }\n        vec4 glyphInfoA = readGlyphInfoA( glyphIndex );\n        float glyphUnpackedWidth_PX = glyphInfoA.z;\n\n        // Advance to the next code\n        xGlyphLeft_PX += glyphUnpackedWidth_PX;\n        codeIndex++;\n    }\n\n    // Glyph to render\n    if ( xGlyphLeft_PX >= xCutoff_PX ) {\n        gl_Position = DISCARD_GLYPH;\n        return;\n    }\n    if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {\n        codeIndex = readGlyphCode( codeIndex );\n    }\n    if ( codeIndex == NULL_FLOAT ) {\n        gl_Position = DISCARD_GLYPH;\n        return;\n    }\n    float glyphIndex = readGlyphCode( codeIndex );\n    if ( glyphIndex == NULL_FLOAT ) {\n        gl_Position = DISCARD_GLYPH;\n        return;\n    }\n    vec4 glyphInfoA = readGlyphInfoA( glyphIndex );\n    float glyphUnpackedWidth_PX = glyphInfoA.z;\n\n    float xGlyphFrac = mod( cornerNum, 2.0 );\n    float dx_PX = xGlyphFrac * glyphUnpackedWidth_PX;\n    float x_PX = xGlyphLeft_PX + dx_PX;\n    float x_FRAC = x_PX / xViewSpan_PX;\n    float x_NDC = -1.0 + 2.0*x_FRAC;\n\n    // Y context\n    float yViewSpan_PX = VIEWPORT_PX.w;\n\n    // Y of glyph's bottom\n    float glyphHeight_PX = glyphInfoA.w;\n    vec4 glyphInfoB = readGlyphInfoB( glyphIndex );\n    float ascent_PX = glyphInfoB.x;\n    float descent_PX = glyphHeight_PX - ascent_PX;\n    float yGlyphBottom_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + yOffset_PX - descent_PX );\n\n    // Y of current vertex\n    float yGlyphFrac = mod( floor( cornerNum / 2.0 ), 2.0 );\n    float y_PX = yGlyphBottom_PX + yGlyphFrac*glyphHeight_PX;\n    float y_FRAC = y_PX / yViewSpan_PX;\n    float y_NDC = -1.0 + 2.0*y_FRAC;\n\n    // Set position coords\n    gl_Position = vec4( x_NDC, y_NDC, 0.0, 1.0 );\n\n    // Set texture coords\n    v_sMin_PX = glyphInfoA.x;\n    v_dsUnpacked_PX = dx_PX;\n    float tMin_PX = glyphInfoA.y;\n    v_t_PX = tMin_PX + ( 1.0 - yGlyphFrac )*glyphHeight_PX;\n\n    // Set info for alpha-mask glyphs\n    v_isAlphaMask = glyphInfoB.y;\n    v_alphaMaskColor = vec4( maskRed/255.0, maskGreen/255.0, maskBlue/255.0, maskAlpha/255.0 );\n\n    // Set fade mask\n    v_fadeMask = 1.0;\n    float xGlyphRight_PX = xGlyphLeft_PX + glyphUnpackedWidth_PX;\n    if ( xGlyphRight_PX >= xFadeZoneLeft_PX ) {\n        codeIndex++;\n\n        int doesWholeStringFit = 1;\n        for ( float i = 0.0; i < MAX_GLYPHS_PER_EVENT; i++ ) {\n            // Visit glyph\n            if ( xGlyphRight_PX >= xCutoff_PX ) {\n                doesWholeStringFit = 0;\n                break;\n            }\n            if ( mod( codeIndex+1.0, FLOATS_PER_BLOCK ) == 0.0 ) {\n                codeIndex = readGlyphCode( codeIndex );\n            }\n            if ( codeIndex == NULL_FLOAT ) {\n                break;\n            }\n            float glyphIndex = readGlyphCode( codeIndex );\n            if ( glyphIndex == NULL_FLOAT ) {\n                break;\n            }\n            vec4 glyphInfoA = readGlyphInfoA( glyphIndex );\n            float glyphUnpackedWidth_PX = glyphInfoA.z;\n\n            // Advance to the next code\n            xGlyphRight_PX += glyphUnpackedWidth_PX;\n            codeIndex++;\n        }\n\n        if ( doesWholeStringFit == 0 ) {\n            v_fadeMask = ( xCutoff_PX - x_PX ) / ( xCutoff_PX - xFadeZoneLeft_PX );\n        }\n    }\n}\n";

const SOURCE$2 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$2,
    fragShader_GLSL: fragShader_GLSL$2,
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
    ],
    attribNames: [
        'inVertexCoords',
    ],
});
class GlyphAtlas {
    constructor(options) {
        var _a;
        this.marker = StateMarker.create();
        this.tocFloatsPerRank = (_a = options === null || options === void 0 ? void 0 : options.tocFloatsPerRank) !== null && _a !== void 0 ? _a : 4 * 4096;
        this.indicesByNameByStyle = new Map();
        this.nextIndex = 0;
        this.committedRasterizers = new Map();
        this.glyphs = new Map();
        this.atlas = new Atlas(4096);
        this.toc = new Float32Array(0);
    }
    get tocRanksTotal() {
        return requireInt(this.toc.length / this.tocFloatsPerRank);
    }
    tocTexelsPerRank(floatsPerTexel) {
        return requireInt(this.tocFloatsPerRank / floatsPerTexel);
    }
    addIfAbsent(glyphStyle, glyphName) {
        const indicesByName = this.getIndicesByName(glyphStyle);
        const index = indicesByName.get(glyphName);
        if (index !== undefined) {
            return index;
        }
        else {
            const newIndex = this.nextIndex++;
            indicesByName.set(glyphName, newIndex);
            this.marker = this.marker.bump();
            return newIndex;
        }
    }
    getIndicesByName(style) {
        const indicesByName = this.indicesByNameByStyle.get(style);
        if (indicesByName !== undefined) {
            return indicesByName;
        }
        else {
            const newIndicesByName = new Map();
            this.indicesByNameByStyle.set(style, newIndicesByName);
            return newIndicesByName;
        }
    }
    commit() {
        let isTocValid = true;
        for (const [style, indicesByName] of this.indicesByNameByStyle) {
            const oldRasterizer = this.committedRasterizers.get(style);
            const newRasterizer = style.createGlyphRasterizer();
            if (!equal(newRasterizer, oldRasterizer)) {
                
                for (const [name, index] of indicesByName) {
                    const glyph = newRasterizer.createGlyph(name);
                    this.glyphs.set(index, glyph);
                    this.atlas.put(index, glyph.image);
                    isTocValid = false;
                }
                this.committedRasterizers.set(style, newRasterizer);
            }
            else {
                
                for (const [name, index] of indicesByName) {
                    if (!this.atlas.has(index)) {
                        const glyph = newRasterizer.createGlyph(name);
                        this.glyphs.set(index, glyph);
                        this.atlas.put(index, glyph.image);
                        isTocValid = false;
                    }
                }
            }
        }
        if (!isTocValid) {
            try {
                this.atlas.commit();
            }
            catch (_a) {
                this.atlas.repack();
                this.atlas.commit();
            }
            const tocMinLength = 8 * this.atlas.size;
            if (this.toc.length < tocMinLength) {
                const newNumRanks = Math.ceil(tocMinLength / this.tocFloatsPerRank);
                this.toc = new Float32Array(newNumRanks * this.tocFloatsPerRank);
            }
            for (const [index, _, box] of this.atlas) {
                const { isAlphaMask, unpackedWidth, image } = requireDefined(this.glyphs.get(index));
                const sMin_PX = box.xMin + image.border;
                const tMin_PX = box.yMin + image.border;
                const sUnpackedSpan_PX = unpackedWidth;
                const tSpan_PX = image.imageData.height - 2 * image.border;
                put4f(this.toc, 8 * index + 0, sMin_PX, tMin_PX, sUnpackedSpan_PX, tSpan_PX);
                const ascent_PX = image.yAnchor - image.border;
                const alphaMaskFlag = (isAlphaMask ? 1 : 0);
                put2f(this.toc, 8 * index + 4, ascent_PX, alphaMaskFlag);
            }
            this.marker = this.marker.bump();
        }
    }
}
class StringSet {
    constructor(options) {
        var _a, _b;
        this.marker = StateMarker.create();
        this.floatsPerRank = (_a = options === null || options === void 0 ? void 0 : options.floatsPerRank) !== null && _a !== void 0 ? _a : 4 * 4096;
        this.floatsPerBlock = (_b = options === null || options === void 0 ? void 0 : options.floatsPerBlock) !== null && _b !== void 0 ? _b : 8;
        this.codesPerBlock = this.floatsPerBlock - 1;
        this.blocksPerRank = requireInt(this.floatsPerRank / this.floatsPerBlock);
        this.floats = new Float32Array(0);
        this.freeBlockNums = new Array();
    }
    get ranksTotal() {
        return requireInt(this.floats.length / this.floatsPerRank);
    }
    texelsPerRank(floatsPerTexel) {
        return requireInt(this.floatsPerRank / floatsPerTexel);
    }
    
    add(codes) {
        if (codes.length === 0) {
            return StringSet.NULL_FLOAT;
        }
        let firstBlockNum = undefined;
        let prevBlockNum = undefined;
        const blocksInString = Math.ceil(codes.length / this.codesPerBlock);
        for (let blockInString = 0; blockInString < blocksInString; blockInString++) {
            
            const currBlockNum = this.acquireBlock();
            if (firstBlockNum === undefined) {
                firstBlockNum = currBlockNum;
            }
            if (prevBlockNum !== undefined) {
                
                this.floats[prevBlockNum * this.floatsPerBlock + this.codesPerBlock] = currBlockNum * this.floatsPerBlock;
            }
            const numCodesInBlock = Math.min(this.codesPerBlock, codes.length - blockInString * this.codesPerBlock);
            for (let codeInBlock = 0; codeInBlock < numCodesInBlock; codeInBlock++) {
                this.floats[currBlockNum * this.floatsPerBlock + codeInBlock] = codes[blockInString * this.codesPerBlock + codeInBlock];
            }
            prevBlockNum = currBlockNum;
        }
        this.marker = this.marker.bump();
        return (requireDefined(firstBlockNum) * this.floatsPerBlock);
    }
    
    remove(firstFloatIndex) {
        if (firstFloatIndex !== StringSet.NULL_FLOAT) {
            const blockNum = Math.floor(firstFloatIndex / this.floatsPerBlock);
            if (blockNum * this.floatsPerBlock !== firstFloatIndex) {
                throw new Error();
            }
            const nextFloatIndex = this.floats[firstFloatIndex + this.codesPerBlock];
            this.releaseBlock(blockNum);
            this.remove(nextFloatIndex);
            this.marker = this.marker.bump();
        }
    }
    acquireBlock() {
        const blockNum = this.freeBlockNums.pop();
        if (blockNum !== undefined) {
            return blockNum;
        }
        else {
            const oldNumRanks = Math.ceil(this.floats.length / this.floatsPerRank);
            const minNumFloats = Math.max(this.floats.length + this.floatsPerBlock, 1.618 * this.floats.length);
            const newNumRanks = Math.ceil(minNumFloats / this.floatsPerRank);
            const newFloats = new Float32Array(newNumRanks * this.floatsPerRank);
            newFloats.set(this.floats);
            newFloats.fill(StringSet.NULL_FLOAT, this.floats.length);
            this.floats = newFloats;
            for (let newBlockNum = oldNumRanks * this.blocksPerRank; newBlockNum < newNumRanks * this.blocksPerRank; newBlockNum++) {
                this.freeBlockNums.push(newBlockNum);
            }
            return requireDefined(this.freeBlockNums.pop());
        }
    }
    releaseBlock(blockNum) {
        this.floats.fill(StringSet.NULL_FLOAT, (blockNum) * this.floatsPerBlock, (blockNum + 1) * this.floatsPerBlock);
        this.freeBlockNums.push(blockNum);
    }
}
StringSet.NULL_FLOAT = -1;
class VertexBoxSet {
    constructor() {
        this.marker = StateMarker.create();
        this.boxIndicesByEventIndex = new Map();
        this.eventIndicesByBoxIndex = new Array();
        this.boxIndexDirtyings = new NotifierBasic(undefined);
        this.vertexCoords = new Float32Array(0);
    }
    get boxCount() {
        return this.eventIndicesByBoxIndex.length;
    }
    setEvent(eventIndex, codeCount) {
        this.removeBoxesForEvent(eventIndex);
        for (let codeInString = 0; codeInString < codeCount; codeInString++) {
            const boxIndex = this.addBox(eventIndex);
            let j = 2 * 6 * boxIndex;
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 2));
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 0));
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 3));
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 3));
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 0));
            j = put2f(this.vertexCoords, j, eventIndex, VertexBoxSet.combineVertexCoords(codeInString, 1));
            this.boxIndexDirtyings.fire(boxIndex);
        }
        this.marker = this.marker.bump();
    }
    static combineVertexCoords(codeInString, cornerNum) {
        
        return ((codeInString & 0x3FF) << 2) + (cornerNum & 0x3);
    }
    
    deleteEvent(eventIndex) {
        this.removeBoxesForEvent(eventIndex);
        this.boxIndicesByEventIndex.delete(eventIndex);
    }
    updateEventIndex(eventOldIndex, eventNewIndex) {
        if (this.boxIndicesByEventIndex.has(eventNewIndex)) {
            throw new Error();
        }
        const boxIndices = requireDefined(this.boxIndicesByEventIndex.get(eventOldIndex));
        this.boxIndicesByEventIndex.delete(eventOldIndex);
        this.boxIndicesByEventIndex.set(eventNewIndex, boxIndices);
        for (const boxIndex of boxIndices) {
            this.eventIndicesByBoxIndex[boxIndex] = eventNewIndex;
            let j = 2 * 6 * boxIndex;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            j = put1f(this.vertexCoords, j, eventNewIndex) + 1;
            this.boxIndexDirtyings.fire(boxIndex);
        }
        this.marker = this.marker.bump();
    }
    addBox(eventIndex) {
        const boxIndex = this.eventIndicesByBoxIndex.length;
        let boxIndices = this.boxIndicesByEventIndex.get(eventIndex);
        if (!boxIndices) {
            boxIndices = new LinkedSet();
            this.boxIndicesByEventIndex.set(eventIndex, boxIndices);
        }
        boxIndices.add(boxIndex);
        this.eventIndicesByBoxIndex[boxIndex] = eventIndex;
        this.vertexCoords = ensureHostBufferCapacity(this.vertexCoords, 2 * 6 * this.eventIndicesByBoxIndex.length, true);
        return boxIndex;
    }
    removeBoxesForEvent(eventIndex) {
        const boxIndices = this.boxIndicesByEventIndex.get(eventIndex);
        if (boxIndices) {
            while (true) {
                const boxIndex = boxIndices.valueAfter(undefined);
                if (boxIndex !== undefined) {
                    this.removeBox(boxIndex);
                }
                else {
                    break;
                }
            }
        }
    }
    removeBox(boxIndex) {
        const eventIndex = requireDefined(this.eventIndicesByBoxIndex[boxIndex]);
        const boxIndices = requireDefined(this.boxIndicesByEventIndex.get(eventIndex));
        boxIndices.delete(boxIndex);
        const movingBoxIndex = this.eventIndicesByBoxIndex.length - 1;
        if (boxIndex !== movingBoxIndex) {
            this.vertexCoords.copyWithin(2 * 6 * boxIndex, 2 * 6 * movingBoxIndex, 2 * 6 * (movingBoxIndex + 1));
            this.boxIndexDirtyings.fire(boxIndex);
            const movingEventIndex = requireDefined(this.eventIndicesByBoxIndex[movingBoxIndex]);
            const movingBoxIndices = requireDefined(this.boxIndicesByEventIndex.get(movingEventIndex));
            movingBoxIndices.delete(movingBoxIndex);
            movingBoxIndices.add(boxIndex);
            this.eventIndicesByBoxIndex[boxIndex] = movingEventIndex;
        }
        this.eventIndicesByBoxIndex.length--;
    }
}

class StylesTable {
    constructor(options) {
        var _a;
        this.marker = StateMarker.create();
        this.floatsPerRank = (_a = options === null || options === void 0 ? void 0 : options.floatsPerRank) !== null && _a !== void 0 ? _a : 4 * 4096;
        this.table = new Float32Array(0);
        this.temp = new Float32Array(12);
    }
    get ranksTotal() {
        return requireInt(this.table.length / this.floatsPerRank);
    }
    texelsPerRank(floatsPerTexel) {
        return requireInt(this.floatsPerRank / floatsPerTexel);
    }
    set(index, v) {
        const minLength = 12 * (index + 1);
        if (this.table.length < minLength) {
            const newNumRanks = Math.ceil(minLength / this.floatsPerRank);
            const newTable = new Float32Array(newNumRanks * this.floatsPerRank);
            newTable.set(this.table);
            this.table = newTable;
            this.marker = this.marker.bump();
        }
        const labelRgBa = StylesTable.combineColorComponents(v.labelColor);
        const labelAllowOvershootFlag = (v.labelAllowOvershoot ? 1.0 : 0.0);
        const borderRgBa = StylesTable.combineColorComponents(v.barBorderColor);
        put4f(this.temp, 0, v.labelOffsetX_LPX, v.labelOffsetY_LPX, labelRgBa.rg, labelRgBa.ba);
        put4f(this.temp, 4, labelAllowOvershootFlag, v.barBorderWidth_LPX, borderRgBa.rg, borderRgBa.ba);
        put2f(this.temp, 8, v.barMarginBottom_LPX, v.barMarginTop_LPX);
        const anyValuesChanged = run(() => {
            for (let i = 0; i < 12; i++) {
                if (this.temp[i] !== this.table[12 * index + i]) {
                    return true;
                }
            }
            return false;
        });
        if (anyValuesChanged) {
            this.table.set(this.temp, 12 * index);
            this.marker = this.marker.bump();
        }
    }
    static combineColorComponents(color) {
        return {
            rg: (((255 * color.r) & 0xFF) << 8) + ((255 * color.g) & 0xFF),
            ba: (((255 * color.b) & 0xFF) << 8) + ((255 * color.a) & 0xFF),
        };
    }
}
class EventsTable {
    constructor(options) {
        var _a;
        this.marker = StateMarker.create();
        this.keyMoves = new NotifierBasic(undefined);
        this.floatsPerRank = (_a = options === null || options === void 0 ? void 0 : options.floatsPerRank) !== null && _a !== void 0 ? _a : 4 * 4096;
        this.positionsByKey = new Map();
        this.rightNeighborsByKey = new Map();
        this.stringsByKey = new Map();
        this.stylesByKey = new Map();
        this.indicesByKey = new Map();
        this.keysByIndex = new Array();
        this.table = new Float32Array(0);
    }
    get ranksTotal() {
        return requireInt(this.table.length / this.floatsPerRank);
    }
    texelsPerRank(floatsPerTexel) {
        return requireInt(this.floatsPerRank / floatsPerTexel);
    }
    index(key) {
        return this.indicesByKey.get(key);
    }
    key(index) {
        return this.keysByIndex[index];
    }
    firstCodeIndex(key) {
        var _a, _b;
        return (_b = (_a = this.stringsByKey.get(key)) === null || _a === void 0 ? void 0 : _a.firstCodeIndex) !== null && _b !== void 0 ? _b : StringSet.NULL_FLOAT;
    }
    codeCount(key) {
        var _a, _b;
        return (_b = (_a = this.stringsByKey.get(key)) === null || _a === void 0 ? void 0 : _a.codeCount) !== null && _b !== void 0 ? _b : 0;
    }
    setStyle(key, styleIndex) {
        const index = this.indicesByKey.get(key);
        if (index !== undefined) {
            put1f(this.table, 8 * index + 5, styleIndex);
            this.stylesByKey.set(key, { styleIndex });
            this.marker = this.marker.bump();
        }
        else {
            const l = { styleIndex };
            const p = this.positionsByKey.get(key);
            const r = this.rightNeighborsByKey.get(key);
            const s = this.stringsByKey.get(key);
            if (p && r && s) {
                this.appendToTable(key, p, r, s, l);
            }
            else {
                this.stylesByKey.set(key, l);
            }
        }
    }
    setString(key, firstCodeIndex, codeCount) {
        const index = this.indicesByKey.get(key);
        if (index !== undefined) {
            put1f(this.table, 8 * index + 4, firstCodeIndex);
            this.stringsByKey.set(key, { firstCodeIndex, codeCount });
            this.marker = this.marker.bump();
        }
        else {
            const s = { firstCodeIndex, codeCount };
            const p = this.positionsByKey.get(key);
            const r = this.rightNeighborsByKey.get(key);
            const l = this.stylesByKey.get(key);
            if (p && r && l) {
                this.appendToTable(key, p, r, s, l);
            }
            else {
                this.stringsByKey.set(key, s);
            }
        }
    }
    setPosition(key, era_PSEC, laneNum) {
        const index = this.indicesByKey.get(key);
        if (index !== undefined) {
            const xLeft_PSEC = splitToMilliPrecision(era_PSEC.min);
            put4f(this.table, 8 * index + 0, xLeft_PSEC.a, xLeft_PSEC.b, era_PSEC.span, laneNum);
            this.positionsByKey.set(key, { era_PSEC, laneNum });
            this.marker = this.marker.bump();
        }
        else {
            const p = { era_PSEC, laneNum };
            const r = this.rightNeighborsByKey.get(key);
            const s = this.stringsByKey.get(key);
            const l = this.stylesByKey.get(key);
            if (r && s && l) {
                this.appendToTable(key, p, r, s, l);
            }
            else {
                this.positionsByKey.set(key, p);
            }
        }
    }
    setRightNeighbor(key, rightNeighbor_PSEC) {
        const index = this.indicesByKey.get(key);
        if (index !== undefined) {
            const xRightNeighbor_PSEC = splitToMilliPrecision(rightNeighbor_PSEC);
            put2f(this.table, 8 * index + 6, xRightNeighbor_PSEC.a, xRightNeighbor_PSEC.b);
            this.rightNeighborsByKey.set(key, { rightNeighbor_PSEC });
            this.marker = this.marker.bump();
        }
        else {
            const r = { rightNeighbor_PSEC };
            const p = this.positionsByKey.get(key);
            const s = this.stringsByKey.get(key);
            const l = this.stylesByKey.get(key);
            if (p && s && l) {
                this.appendToTable(key, p, r, s, l);
            }
            else {
                this.rightNeighborsByKey.set(key, r);
            }
        }
    }
    appendToTable(key, p, r, s, l) {
        if (this.indicesByKey.has(key)) {
            throw new Error();
        }
        const index = this.keysByIndex.length;
        this.keysByIndex[index] = key;
        this.indicesByKey.set(key, index);
        const tableMinLength = 8 * this.keysByIndex.length;
        if (this.table.length < tableMinLength) {
            const newNumFloats = Math.max(tableMinLength, 1.618 * this.table.length);
            const newNumRanks = Math.ceil(newNumFloats / this.floatsPerRank);
            const newTable = new Float32Array(newNumRanks * this.floatsPerRank);
            newTable.set(this.table);
            this.table = newTable;
        }
        const xLeft_PSEC = splitToMilliPrecision(p.era_PSEC.min);
        const xRightNeighbor_PSEC = splitToMilliPrecision(r.rightNeighbor_PSEC);
        put4f(this.table, 8 * index + 0, xLeft_PSEC.a, xLeft_PSEC.b, p.era_PSEC.span, p.laneNum);
        put4f(this.table, 8 * index + 4, s.firstCodeIndex, l.styleIndex, xRightNeighbor_PSEC.a, xRightNeighbor_PSEC.b);
        this.positionsByKey.set(key, p);
        this.rightNeighborsByKey.set(key, r);
        this.stringsByKey.set(key, s);
        this.stylesByKey.set(key, l);
        this.marker = this.marker.bump();
        this.keyMoves.fire({ item: key, oldIndex: undefined, newIndex: index });
    }
    delete(key) {
        this.stylesByKey.delete(key);
        this.stringsByKey.delete(key);
        this.rightNeighborsByKey.delete(key);
        this.positionsByKey.delete(key);
        const index = this.indicesByKey.get(key);
        if (index !== undefined) {
            
            const moveToIndex = index;
            const moveFromIndex = this.keysByIndex.length - 1;
            if (moveToIndex !== moveFromIndex) {
                const movingKey = requireDefined(this.keysByIndex[moveFromIndex]);
                this.table.copyWithin(8 * moveToIndex, 8 * moveFromIndex, 8 * (moveFromIndex + 1));
                this.keysByIndex[moveToIndex] = movingKey;
                this.indicesByKey.set(movingKey, moveToIndex);
            }
            this.keysByIndex.length--;
            this.indicesByKey.delete(key);
            this.marker = this.marker.bump();
            this.keyMoves.fire({ item: key, oldIndex: index, newIndex: undefined });
            if (moveToIndex !== moveFromIndex) {
                this.keyMoves.fire({ item: key, oldIndex: moveFromIndex, newIndex: moveToIndex });
            }
        }
    }
}

var fragShader_GLSL$1 = "#version 100\nprecision lowp float;\n\n\nvarying lowp vec4 vColor;\n\n\nvoid main( ) {\n    gl_FragColor = vec4( vColor.a*vColor.rgb, vColor.a );\n}\n";

var vertShader_GLSL$1 = "#version 100\n\n\nfloat round( float v ) {\n    return floor( v + 0.5 );\n}\n\nint intRound( float v ) {\n    return int( v + 0.5 );\n}\n\n\n/**\n * Device Pixel Ratio, for converting between LPX and PX.\n */\nuniform float DPR;\n\n/**\n * viewMinHi_PSEC, viewMinLo_PSEC, viewSpan_SEC\n */\nuniform vec3 X_VIEW_LIMITS;\n\nuniform vec4 VIEWPORT_PX;\nuniform float LANE_HEIGHT_PX;\nuniform float EVENT_MIN_APPARENT_WIDTH_PX;\n\n/**\n * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES\n * Texel 2: IGNORED, styleIndex, IGNORED, IGNORED\n */\nuniform highp sampler2D EVENTS_TABLE;\nuniform vec2 EVENTS_TABLE_SIZE;\n\nvec4 readEventInfoA( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 0.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\nvec4 readEventInfoB( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 1.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\n/**\n * Texel 1: IGNORED, IGNORED, IGNORED, IGNORED\n * Texel 2: IGNORED, thickness_LPX, ( 8-bit red, 8-bit green ), ( 8-bit blue, 8-bit alpha )\n * Texel 3: barMarginBottom_LPX, barMarginTop_LPX\n */\nuniform highp sampler2D STYLES_TABLE;\nuniform vec2 STYLES_TABLE_SIZE;\n\nvec4 readStyleInfoB( float styleIndex ) {\n    float texelIndex = 3.0*styleIndex + 1.0;\n    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );\n    float x = texelIndex - y*STYLES_TABLE_SIZE.x;\n    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );\n}\n\nvec4 readStyleInfoC( float styleIndex ) {\n    float texelIndex = 3.0*styleIndex + 2.0;\n    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );\n    float x = texelIndex - y*STYLES_TABLE_SIZE.x;\n    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );\n}\n\n/**\n * eventIndex, ( 2-bit X rung, 2-bit Y rung )\n *\n * Rungs:   3 ┌─────────┐\n *          2 │ ┌─────┐ │\n *            │ │     │ │\n *          1 │ └─────┘ │\n *          0 └─────────┘\n *            0 1     2 3\n */\nattribute vec2 inVertexCoords;\n\n/**\n * Most of this shader follows the same code path for all vertices in\n * an event. Those parts can effectively discard the event by setting\n * gl_Position to this value, then returning. This puts the event's\n * vertices outside the viewport, and all at the same spot so the\n * event has zero size.\n */\nconst vec4 DISCARD_EVENT = vec4( -2.0, -2.0, -2.0, 1.0 );\n\nvarying lowp vec4 vColor;\n\n\nvoid main( ) {\n    float eventIndex = inVertexCoords.x;\n    float cornerCombined = inVertexCoords.y;\n    float xRung = floor( cornerCombined / 4.0 );\n    float yRung = round( cornerCombined - 4.0*xRung );\n\n    // Misc context\n    float xViewMinHi_PSEC = X_VIEW_LIMITS.x;\n    float xViewMinLo_PSEC = X_VIEW_LIMITS.y;\n    float xViewSpan_SEC = X_VIEW_LIMITS.z;\n    float xViewSpan_PX = VIEWPORT_PX.z;\n    float yViewSpan_PX = VIEWPORT_PX.w;\n\n    // Event info\n    vec4 eventInfoA = readEventInfoA( eventIndex );\n    vec4 eventInfoB = readEventInfoB( eventIndex );\n    float xEventLeftHi_PSEC = eventInfoA.x;\n    float xEventLeftLo_PSEC = eventInfoA.y;\n    float dxDuration_SEC = eventInfoA.z;\n    float yEventTopFromViewMax_LANES = eventInfoA.w;\n    float styleIndex = eventInfoB.y;\n    vec4 styleInfoB = readStyleInfoB( styleIndex );\n    vec4 styleInfoC = readStyleInfoC( styleIndex );\n    float thickness_LPX = styleInfoB.y;\n    float thickness_PX = round( thickness_LPX * DPR );\n    float redGreen = styleInfoB.z;\n    float blueAlpha = styleInfoB.w;\n    float marginBottom_LPX = styleInfoC.x;\n    float marginTop_LPX = styleInfoC.y;\n    float marginBottom_PX = round( marginBottom_LPX * DPR );\n    float marginTop_PX = round( marginTop_LPX * DPR );\n\n    // Event edges\n    float xEventLeftFromViewMin_SEC = ( xEventLeftHi_PSEC - xViewMinHi_PSEC ) + ( xEventLeftLo_PSEC - xViewMinLo_PSEC );\n    float xEventRightFromViewMin_SEC = xEventLeftFromViewMin_SEC + dxDuration_SEC;\n    if ( xEventRightFromViewMin_SEC < 0.0 || xEventLeftFromViewMin_SEC > xViewSpan_SEC ) {\n        gl_Position = DISCARD_EVENT;\n        return;\n    }\n\n    // X of current vertex\n    float x_PX;\n    float x0_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );\n    float x3_PX = max( x0_PX + EVENT_MIN_APPARENT_WIDTH_PX, round( xEventRightFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC ) );\n    float xThickness_PX = min( thickness_PX, 0.5*( x3_PX - x0_PX ) );\n    if ( xRung < 0.5 ) {\n        x_PX = x0_PX;\n    }\n    else if ( xRung < 1.5 ) {\n        x_PX = x0_PX + xThickness_PX;\n    }\n    else if ( xRung < 2.5 ) {\n        x_PX = x3_PX - xThickness_PX;\n    }\n    else {\n        x_PX = x3_PX;\n    }\n    float x_FRAC = x_PX / xViewSpan_PX;\n    float x_NDC = -1.0 + 2.0*x_FRAC;\n\n    // Y of current vertex\n    float y_PX;\n    float y0_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + marginBottom_PX );\n    float y3_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 0.0 )*LANE_HEIGHT_PX - marginTop_PX );\n    float yThickness_PX = min( thickness_PX, y3_PX - y0_PX );\n    if ( yRung < 0.5 ) {\n        y_PX = y0_PX;\n    }\n    else if ( yRung < 1.5 ) {\n        y_PX = y0_PX + yThickness_PX;\n    }\n    else if ( yRung < 2.5 ) {\n        y_PX = y3_PX - yThickness_PX;\n    }\n    else {\n        y_PX = y3_PX;\n    }\n    float y_FRAC = y_PX / yViewSpan_PX;\n    float y_NDC = -1.0 + 2.0*y_FRAC;\n\n    // Set position coords\n    gl_Position = vec4( x_NDC, y_NDC, 0.0, 1.0 );\n\n    // Set color\n    float red = floor( redGreen / 256.0 );\n    float green = redGreen - 256.0*red;\n    float blue = floor( blueAlpha / 256.0 );\n    float alpha = blueAlpha - 256.0*blue;\n    vColor = vec4( red/255.0, green/255.0, blue/255.0, alpha/255.0 );\n}\n";

const SOURCE$1 = Object.freeze({
    vertShader_GLSL: vertShader_GLSL$1,
    fragShader_GLSL: fragShader_GLSL$1,
    uniformNames: [
        'DPR',
        'X_VIEW_LIMITS',
        'VIEWPORT_PX',
        'LANE_HEIGHT_PX',
        'EVENT_MIN_APPARENT_WIDTH_PX',
        'STYLES_TABLE',
        'STYLES_TABLE_SIZE',
        'EVENTS_TABLE',
        'EVENTS_TABLE_SIZE',
    ],
    attribNames: [
        'inVertexCoords',
    ],
});
class VertexSet$1 {
    constructor() {
        this.marker = StateMarker.create();
        this._eventCount = 0;
        this.vertexCoords = new Float32Array(0);
    }
    get eventCount() {
        return this._eventCount;
    }
    set eventCount(value) {
        this._eventCount = value;
        const coordsPerEvent = 2 * 6 * 4;
        const minLength = coordsPerEvent * this._eventCount;
        const oldLength = this.vertexCoords.length;
        if (oldLength < minLength) {
            const newLength = Math.max(minLength, 2 * oldLength);
            const newArray = new Float32Array(newLength);
            newArray.set(this.vertexCoords);
            const oldEventCapacity = Math.floor(oldLength / coordsPerEvent);
            const newEventCapacity = Math.ceil(newLength / coordsPerEvent);
            for (let eventIndex = oldEventCapacity; eventIndex < newEventCapacity; eventIndex++) {
                let i = coordsPerEvent * eventIndex;
                
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 2));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 2));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 1));
                
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 2));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 1));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 1));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 0));
                
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 1));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 1));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 1));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 0));
                
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(0, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 2));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(3, 3));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(1, 2));
                i = put2f(newArray, i, eventIndex, VertexSet$1.combineRungs(2, 2));
            }
            this.vertexCoords = newArray;
        }
        this.marker = this.marker.bump();
    }
    static combineRungs(xRung, yRung) {
        
        return ((xRung & 0x3) << 2) + (yRung & 0x3);
    }
}

var fragShader_GLSL = "#version 100\nprecision lowp float;\n\n\nuniform sampler2D PATTERNS_ATLAS;\n\nvarying highp vec4 vStBounds;\nvarying highp vec2 vStUnwrapped;\n\n\nvoid main( ) {\n    highp vec2 stMin = vStBounds.xy;\n    highp vec2 stSpan = vStBounds.zw;\n    highp vec2 st = stMin + mod( vStUnwrapped, stSpan );\n\n    vec4 rgba = texture2D( PATTERNS_ATLAS, st );\n    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n}\n";

var vertShader_GLSL = "#version 100\n\n\nfloat round( float v ) {\n    return floor( v + 0.5 );\n}\n\n\n/**\n * Device Pixel Ratio, for converting between LPX and PX.\n */\nuniform float DPR;\n\n/**\n * viewMinHi_PSEC, viewMinLo_PSEC, viewSpan_SEC\n */\nuniform vec3 X_VIEW_LIMITS;\n\nuniform vec4 VIEWPORT_PX;\nuniform float LANE_HEIGHT_PX;\nuniform float EVENT_MIN_APPARENT_WIDTH_PX;\n\n/**\n * Texel 1: xLeftHi_PSEC, xLeftLo_PSEC, dxDuration_SEC, yTopFromViewMax_LANES\n * Texel 2: IGNORED, styleIndex, IGNORED, IGNORED\n */\nuniform highp sampler2D EVENTS_TABLE;\nuniform vec2 EVENTS_TABLE_SIZE;\n\nvec4 readEventInfoA( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 0.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\nvec4 readEventInfoB( float eventIndex ) {\n    float texelIndex = 2.0*eventIndex + 1.0;\n    float y = floor( texelIndex / EVENTS_TABLE_SIZE.x );\n    float x = texelIndex - y*EVENTS_TABLE_SIZE.x;\n    return texture2D( EVENTS_TABLE, ( vec2( x, y ) + 0.5 )/EVENTS_TABLE_SIZE );\n}\n\n/**\n * Texel 1: IGNORED, IGNORED, IGNORED, IGNORED\n * Texel 2: IGNORED, IGNORED, IGNORED, IGNORED\n * Texel 3: barMarginBottom_LPX, barMarginTop_LPX\n */\nuniform highp sampler2D STYLES_TABLE;\nuniform vec2 STYLES_TABLE_SIZE;\n\nvec4 readStyleInfoC( float styleIndex ) {\n    float texelIndex = 3.0*styleIndex + 2.0;\n    float y = floor( texelIndex / STYLES_TABLE_SIZE.x );\n    float x = texelIndex - y*STYLES_TABLE_SIZE.x;\n    return texture2D( STYLES_TABLE, ( vec2( x, y ) + 0.5 )/STYLES_TABLE_SIZE );\n}\n\n/**\n * vec4 stBounds = texture2D( PATTERNS_TOC, vec2( patternIndex, 0.0 ) )\n * vec2 stMin = stBounds.xy\n * vec2 stSpan = stBounds.zw\n */\nuniform highp sampler2D PATTERNS_TOC;\nuniform float PATTERNS_TOC_SIZE;\n\nuniform highp vec2 PATTERNS_ATLAS_SIZE_PX;\n\n/**\n * eventIndex, ( 1-bit X frac, 1-bit Y frac )\n */\nattribute vec2 inVertexCoords;\n\n/**\n * Most of this shader follows the same code path for all vertices in\n * an event. Those parts can effectively discard the event by setting\n * gl_Position to this value, then returning. This puts the event's\n * vertices outside the viewport, and all at the same spot so the\n * event has zero size.\n */\nconst vec4 DISCARD_EVENT = vec4( -2.0, -2.0, -2.0, 1.0 );\n\nvarying highp vec4 vStBounds;\nvarying highp vec2 vStUnwrapped;\n\n\nvoid main( ) {\n    float eventIndex = inVertexCoords.x;\n    float cornerCombined = inVertexCoords.y;\n    float xEdge = floor( cornerCombined / 2.0 );\n    float yEdge = round( cornerCombined - 2.0*xEdge );\n\n    // Misc context\n    float xViewMinHi_PSEC = X_VIEW_LIMITS.x;\n    float xViewMinLo_PSEC = X_VIEW_LIMITS.y;\n    float xViewSpan_SEC = X_VIEW_LIMITS.z;\n    float xViewSpan_PX = VIEWPORT_PX.z;\n    float yViewSpan_PX = VIEWPORT_PX.w;\n\n    // Event info\n    vec4 eventInfoA = readEventInfoA( eventIndex );\n    vec4 eventInfoB = readEventInfoB( eventIndex );\n    float xEventLeftHi_PSEC = eventInfoA.x;\n    float xEventLeftLo_PSEC = eventInfoA.y;\n    float dxDuration_SEC = eventInfoA.z;\n    float yEventTopFromViewMax_LANES = eventInfoA.w;\n    float styleIndex = eventInfoB.y;\n    vec4 styleInfoC = readStyleInfoC( styleIndex );\n    float marginBottom_LPX = styleInfoC.x;\n    float marginTop_LPX = styleInfoC.y;\n    float marginBottom_PX = round( marginBottom_LPX * DPR );\n    float marginTop_PX = round( marginTop_LPX * DPR );\n\n    // Event edges\n    float xEventLeftFromViewMin_SEC = ( xEventLeftHi_PSEC - xViewMinHi_PSEC ) + ( xEventLeftLo_PSEC - xViewMinLo_PSEC );\n    float xEventRightFromViewMin_SEC = xEventLeftFromViewMin_SEC + dxDuration_SEC;\n    if ( xEventRightFromViewMin_SEC < 0.0 || xEventLeftFromViewMin_SEC > xViewSpan_SEC ) {\n        gl_Position = DISCARD_EVENT;\n        return;\n    }\n\n    // X of current vertex\n    float xEventLeft_PX = round( xEventLeftFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC );\n    float xEventRight_PX = max( xEventLeft_PX + EVENT_MIN_APPARENT_WIDTH_PX, round( xEventRightFromViewMin_SEC * xViewSpan_PX/xViewSpan_SEC ) );\n    float x_PX = ( xEdge < 0.5 ? xEventLeft_PX : xEventRight_PX );\n\n    // Pattern tile info\n    vec4 stBounds = texture2D( PATTERNS_TOC, vec2( ( styleIndex + 0.5 )/PATTERNS_TOC_SIZE, 0.0 ) );\n\n    // Make texture X coord start at the left edge of the leftmost VISIBLE pattern\n    // tile -- don't start at the event's left edge, which may be so many pixels\n    // left of viewMin that texture-coord interp runs into precision limits\n    float xPatternLeft_PX = xEventLeft_PX;\n    if ( xEventLeft_PX < 0.0 ) {\n        float tileWidth_PX = stBounds.z * PATTERNS_ATLAS_SIZE_PX.x;\n        xPatternLeft_PX += tileWidth_PX * floor( -xEventLeft_PX / tileWidth_PX );\n    }\n\n    // Y of current vertex\n    float yBottom_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 1.0 )*LANE_HEIGHT_PX + marginBottom_PX );\n    float yTop_PX = round( yViewSpan_PX - ( yEventTopFromViewMax_LANES + 0.0 )*LANE_HEIGHT_PX - marginTop_PX );\n    float y_PX = ( yEdge < 0.5 ? yBottom_PX : yTop_PX );\n\n    // Set position coords\n    vec2 xy_PX = vec2( x_PX, y_PX );\n    vec2 xyViewSpan_PX = VIEWPORT_PX.zw;\n    vec2 xy_NDC = -1.0 + 2.0*( xy_PX / xyViewSpan_PX );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    // Set pattern coords\n    vStBounds = stBounds;\n    vStUnwrapped = ( xy_PX - vec2( xPatternLeft_PX, yTop_PX ) ) / PATTERNS_ATLAS_SIZE_PX;\n}\n";

const SOURCE = Object.freeze({
    vertShader_GLSL,
    fragShader_GLSL,
    uniformNames: [
        'DPR',
        'X_VIEW_LIMITS',
        'VIEWPORT_PX',
        'LANE_HEIGHT_PX',
        'EVENT_MIN_APPARENT_WIDTH_PX',
        'STYLES_TABLE',
        'STYLES_TABLE_SIZE',
        'EVENTS_TABLE',
        'EVENTS_TABLE_SIZE',
        'PATTERNS_TOC',
        'PATTERNS_TOC_SIZE',
        'PATTERNS_ATLAS',
        'PATTERNS_ATLAS_SIZE_PX',
    ],
    attribNames: [
        'inVertexCoords',
    ],
});
class VertexSet {
    constructor() {
        this.marker = StateMarker.create();
        this._eventCount = 0;
        this.vertexCoords = new Float32Array(0);
    }
    get eventCount() {
        return this._eventCount;
    }
    set eventCount(value) {
        this._eventCount = value;
        const coordsPerEvent = 2 * 6;
        const minLength = coordsPerEvent * this._eventCount;
        const oldLength = this.vertexCoords.length;
        if (oldLength < minLength) {
            const newLength = Math.max(minLength, 2 * oldLength);
            const newArray = new Float32Array(newLength);
            newArray.set(this.vertexCoords);
            const oldEventCapacity = Math.floor(oldLength / coordsPerEvent);
            const newEventCapacity = Math.ceil(newLength / coordsPerEvent);
            for (let eventIndex = oldEventCapacity; eventIndex < newEventCapacity; eventIndex++) {
                let i = coordsPerEvent * eventIndex;
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(0, 1));
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(1, 1));
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(1, 1));
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(0, 0));
                i = put2f(newArray, i, eventIndex, VertexSet.combineCorner(1, 0));
            }
            this.vertexCoords = newArray;
        }
        this.marker = this.marker.bump();
    }
    static combineCorner(xFrac, yFrac) {
        
        return ((xFrac & 0x1) << 1) + (yFrac & 0x1);
    }
}

class FallbackGlyphRasterizer extends ValueBase {
    constructor() {
        super('FallbackGlyphRasterizer');
    }
    createGlyph() {
        return FallbackGlyphRasterizer.glyph;
    }
}
FallbackGlyphRasterizer.glyph = run(() => {
    const border_PX = 1;
    const canvas = document.createElement('canvas');
    canvas.width = border_PX + 10 + border_PX;
    canvas.height = border_PX + 10 + border_PX;
    const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = RED.cssString;
    g.fillRect(border_PX, border_PX, 10, 10);
    return {
        isAlphaMask: false,
        unpackedWidth: canvas.width,
        image: {
            xAnchor: 0,
            yAnchor: 0,
            border: border_PX,
            imageData: g.getImageData(0, 0, canvas.width, canvas.height),
        },
    };
});
const FALLBACK_EVENT_FILL_RASTERIZER = new SolidPatternRasterizer(GRAY);
const FALLBACK_EVENT_FILL_PATTERN = new FrozenPattern('fallback-pattern', FALLBACK_EVENT_FILL_RASTERIZER);
const FALLBACK_GLYPH_RASTERIZER = new FallbackGlyphRasterizer();
const FALLBACK_EVENT_STYLE = Object.freeze({
    barMarginTop_LPX: { get: frozenSupplier(0) },
    barMarginBottom_LPX: { get: frozenSupplier(0) },
    barBorderColor: { get: frozenSupplier(RED) },
    barBorderWidth_LPX: { get: frozenSupplier(0) },
    createBarFillRasterizer: frozenSupplier(FALLBACK_EVENT_FILL_RASTERIZER),
    labelColor: { get: frozenSupplier(WHITE) },
    labelOffsetX_LPX: { get: frozenSupplier(0) },
    labelOffsetY_LPX: { get: frozenSupplier(0) },
    labelAllowOvershoot: { get: frozenSupplier(false) },
    createGlyphRasterizer: frozenSupplier(FALLBACK_GLYPH_RASTERIZER),
});
function roundLpxToPx(lpx, dpr) {
    return Math.round(lpx * dpr) / dpr;
}
class EventsPainter {
    constructor(events) {
        this.peer = createDomPeer('timeline-events-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.laneHeight_LPX = StyleProp.create(this.style, '--lane-height-px', cssFloat, 20);
        this.eventMinApparentWidth_LPX = StyleProp.create(this.style, '--event-min-apparent-width-px', cssFloat, 1);
        this.glyphFadeZone_LPX = StyleProp.create(this.style, '--glyph-fade-zone-px', cssFloat, 20);
        this.visible = new RefBasic(true, tripleEquals);
        this.events = events;
        this.timeBoundsFn_PSEC = frozenSupplier(Interval1D.fromEdges(0, 1));
        this.createEventStyle = frozenSupplier(FALLBACK_EVENT_STYLE);
        this.disposers = new DisposerGroup();
        this.eventPositionChanges = new Set();
        this.disposers.add(this.events.positionChanges.addListener(change => {
            change && this.eventPositionChanges.add(change.event);
        }));
        this.eventRightNeighborChanges = new Set();
        this.disposers.add(this.events.rightNeighborChanges.addListener(change => {
            change && this.eventRightNeighborChanges.add(change.event);
        }));
        this.eventStyleChanges = new Set();
        this.disposers.add(this.events.styleChanges.addListener(change => {
            change && this.eventStyleChanges.add(change.event);
            change && this.eventLabelChanges.add(change.event);
        }));
        this.eventLabelChanges = new Set();
        this.disposers.add(this.events.labelChanges.addListener(change => {
            change && this.eventLabelChanges.add(change.event);
        }));
        this.hStyles = new Indexed();
        this.hStylesTable = new StylesTable();
        this.hEventsTable = new EventsTable();
        this.hPatternsAtlas = new Atlas(4096);
        this.hPatternsTable = new Float32Array(0);
        this.hPatternsVertices = new VertexSet();
        this.hEventsTable.keyMoves.addListener(move => {
            
            if (move) {
                const { oldIndex, newIndex } = move;
                if (oldIndex === undefined && newIndex !== undefined) {
                    this.hPatternsVertices.eventCount++;
                }
                else if (oldIndex !== undefined && newIndex === undefined) {
                    this.hPatternsVertices.eventCount--;
                }
            }
        });
        this.hBordersVertices = new VertexSet$1();
        this.hEventsTable.keyMoves.addListener(move => {
            
            if (move) {
                const { oldIndex, newIndex } = move;
                if (oldIndex === undefined && newIndex !== undefined) {
                    this.hBordersVertices.eventCount++;
                }
                else if (oldIndex !== undefined && newIndex === undefined) {
                    this.hBordersVertices.eventCount--;
                }
            }
        });
        this.hGlyphsAtlas = new GlyphAtlas();
        this.hGlyphsStrings = new StringSet();
        this.hGlyphsVertices = new VertexBoxSet();
        this.hEventsTable.keyMoves.addListener(move => {
            
            if (move) {
                const { oldIndex, newIndex } = move;
                if (oldIndex === undefined && newIndex !== undefined) {
                    const event = requireDefined(this.hEventsTable.key(newIndex));
                    const codeCount = this.hEventsTable.codeCount(event);
                    this.hGlyphsVertices.setEvent(newIndex, codeCount);
                }
                else if (oldIndex !== undefined && newIndex !== undefined) {
                    this.hGlyphsVertices.updateEventIndex(oldIndex, newIndex);
                }
                else if (oldIndex !== undefined && newIndex === undefined) {
                    this.hGlyphsVertices.deleteEvent(oldIndex);
                }
            }
        });
        this.hGlyphsMinDirtyBoxIndex = Number.POSITIVE_INFINITY;
        this.hGlyphsMaxDirtyBoxIndex = Number.NEGATIVE_INFINITY;
        this.hGlyphsVertices.boxIndexDirtyings.addListener(boxIndex => {
            if (boxIndex !== undefined) {
                this.hGlyphsMinDirtyBoxIndex = Math.min(this.hGlyphsMinDirtyBoxIndex, boxIndex);
                this.hGlyphsMaxDirtyBoxIndex = Math.max(this.hGlyphsMaxDirtyBoxIndex, boxIndex);
            }
        });
        this.glIncarnation = null;
        this.dStylesTable = null;
        this.dEventsTable = null;
        this.dStylesTableMarker = null;
        this.dEventsTableMarker = null;
        this.dPatterns = new LinkedMap();
        this.dPatternsAtlas = null;
        this.dPatternsTable = null;
        this.dPatternsVertexCoords = null;
        this.dPatternsVertexCoordsCapacityBytes = -1;
        this.dPatternsVertexCount = -1;
        this.dPatternsVertexCoordsMarker = null;
        this.dBordersVertexCoords = null;
        this.dBordersVertexCoordsCapacityBytes = -1;
        this.dBordersVertexCount = -1;
        this.dBordersVertexCoordsMarker = null;
        this.dGlyphsAtlas = null;
        this.dGlyphsTable = null;
        this.dGlyphsCodes = null;
        this.dGlyphsVertexCoords = null;
        this.dGlyphsVertexCoordsCapacityBytes = -1;
        this.dGlyphsVertexCount = -1;
        this.dGlyphsAtlasMarker = null;
        this.dGlyphsCodesMarker = null;
        this.dGlyphsVertexCoordsMarker = null;
    }
    paint(context, viewport_PX) {
        var _a;
        const dpr = currentDpr(this);
        const laneHeight_LPX = roundLpxToPx(this.laneHeight_LPX.get(), dpr);
        const eventMinApparentWidth_LPX = this.eventMinApparentWidth_LPX.get();
        const glyphFadeZone_LPX = this.glyphFadeZone_LPX.get();
        const laneHeight_PX = dpr * laneHeight_LPX;
        const eventMinApparentWidth_PX = dpr * eventMinApparentWidth_LPX;
        const glyphFadeZone_PX = dpr * glyphFadeZone_LPX;
        const gl = context.gl;
        requireFloatTextureSupport(gl);
        
        
        if (context.glIncarnation !== this.glIncarnation) {
            this.glIncarnation = context.glIncarnation;
            this.dStylesTable = gl.createTexture();
            this.dEventsTable = gl.createTexture();
            this.dStylesTableMarker = null;
            this.dEventsTableMarker = null;
            this.dPatterns.clear();
            this.dPatternsAtlas = gl.createTexture();
            this.dPatternsTable = gl.createTexture();
            this.dPatternsVertexCoords = gl.createBuffer();
            this.dPatternsVertexCoordsCapacityBytes = -1;
            this.dPatternsVertexCount = -1;
            this.dPatternsVertexCoordsMarker = null;
            this.dBordersVertexCoords = gl.createBuffer();
            this.dBordersVertexCoordsCapacityBytes = -1;
            this.dBordersVertexCount = -1;
            this.dBordersVertexCoordsMarker = null;
            this.dGlyphsAtlas = gl.createTexture();
            this.dGlyphsTable = gl.createTexture();
            this.dGlyphsCodes = gl.createTexture();
            this.dGlyphsVertexCoords = gl.createBuffer();
            this.dGlyphsVertexCoordsCapacityBytes = -1;
            this.dGlyphsVertexCount = -1;
            this.dGlyphsAtlasMarker = null;
            this.dGlyphsCodesMarker = null;
            this.dGlyphsVertexCoordsMarker = null;
            this.hGlyphsMinDirtyBoxIndex = 0;
            this.hGlyphsMaxDirtyBoxIndex = this.hGlyphsVertices.boxCount - 1;
        }
        
        
        
        
        
        const stylesTableTexUnit = bindTexture(gl, 0, this.dStylesTable);
        const eventsTableTexUnit = bindTexture(gl, 1, this.dEventsTable);
        const patternsAtlasTexUnit = bindTexture(gl, 2, this.dPatternsAtlas);
        const patternsTableTexUnit = bindTexture(gl, 3, this.dPatternsTable);
        const glyphsAtlasTexUnit = bindTexture(gl, 4, this.dGlyphsAtlas);
        const glyphsTableTexUnit = bindTexture(gl, 5, this.dGlyphsTable);
        const glyphsCodesTexUnit = bindTexture(gl, 6, this.dGlyphsCodes);
        requireVertexTexUnits(gl, 7);
        
        for (const event of this.eventPositionChanges) {
            const newLaneNum = this.events.getLaneNumContaining(event);
            if (newLaneNum !== undefined) {
                const era_PSEC = event.era_PSEC;
                this.hEventsTable.setPosition(event, era_PSEC, newLaneNum);
            }
            else {
                this.hEventsTable.delete(event);
            }
        }
        for (const event of this.eventRightNeighborChanges) {
            const lane = this.events.getLaneContaining(event);
            if (lane) {
                const rightNeighbor = this.events.getRightNeighbor(event);
                const rightNeighbor_PSEC = (_a = rightNeighbor === null || rightNeighbor === void 0 ? void 0 : rightNeighbor.era_PSEC.min) !== null && _a !== void 0 ? _a : Number.POSITIVE_INFINITY;
                this.hEventsTable.setRightNeighbor(event, rightNeighbor_PSEC);
            }
        }
        for (const event of this.eventStyleChanges) {
            const styleKey = event.styleKey;
            const [styleIndex] = this.hStyles.createIfAbsent(styleKey, () => {
                return this.createEventStyle(event.classes);
            });
            this.hEventsTable.setStyle(event, styleIndex);
        }
        for (const event of this.eventLabelChanges) {
            const styleKey = event.styleKey;
            const [_, eventStyle] = this.hStyles.requireByKey(styleKey);
            const label = event.label;
            const glyphCodes = new Array();
            for (const glyphName of label) {
                const glyphCode = this.hGlyphsAtlas.addIfAbsent(eventStyle, glyphName);
                glyphCodes.push(glyphCode);
            }
            
            const oldFirstCodeIndex = this.hEventsTable.firstCodeIndex(event);
            this.hGlyphsStrings.remove(oldFirstCodeIndex);
            const newFirstCodeIndex = this.hGlyphsStrings.add(glyphCodes);
            this.hEventsTable.setString(event, newFirstCodeIndex, glyphCodes.length);
        }
        this.eventPositionChanges.clear();
        this.eventRightNeighborChanges.clear();
        this.eventStyleChanges.clear();
        this.eventLabelChanges.clear();
        
        for (const [_, eventStyle, styleIndex] of this.hStyles) {
            this.hStylesTable.set(styleIndex, {
                barMarginTop_LPX: eventStyle.barMarginTop_LPX.get(),
                barMarginBottom_LPX: eventStyle.barMarginBottom_LPX.get(),
                barBorderColor: eventStyle.barBorderColor.get(),
                barBorderWidth_LPX: eventStyle.barBorderWidth_LPX.get(),
                labelOffsetX_LPX: eventStyle.labelOffsetX_LPX.get(),
                labelOffsetY_LPX: eventStyle.labelOffsetY_LPX.get(),
                labelColor: eventStyle.labelColor.get(),
                labelAllowOvershoot: eventStyle.labelAllowOvershoot.get(),
            });
        }
        if (this.dStylesTableMarker !== this.hStylesTable.marker) {
            activeTexture(gl, stylesTableTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.hStylesTable.texelsPerRank(4), this.hStylesTable.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hStylesTable.table);
            this.dStylesTableMarker = this.hStylesTable.marker;
        }
        
        if (this.dEventsTableMarker !== this.hEventsTable.marker) {
            activeTexture(gl, eventsTableTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.hEventsTable.texelsPerRank(4), this.hEventsTable.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hEventsTable.table);
            this.dEventsTableMarker = this.hEventsTable.marker;
        }
        
        const dPatternsValid = run(() => {
            for (const [styleKey, eventStyle] of this.hStyles) {
                const oldPattern = this.dPatterns.get(styleKey);
                const newPattern = eventStyle.createBarFillRasterizer(laneHeight_LPX, this.hPatternsAtlas.maxDim);
                if (!equal(newPattern, oldPattern)) {
                    return false;
                }
            }
            return true;
        });
        if (!dPatternsValid) {
            this.hPatternsAtlas.clear();
            const hPatterns = new LinkedMap();
            for (const [styleKey, eventStyle] of this.hStyles) {
                const pattern = eventStyle.createBarFillRasterizer(laneHeight_LPX, this.hPatternsAtlas.maxDim);
                this.hPatternsAtlas.put(styleKey, pattern.createImage());
                hPatterns.set(styleKey, pattern);
            }
            const wTexel_FRAC = 1.0 / this.hPatternsAtlas.getUsedArea().w;
            const hTexel_FRAC = 1.0 / this.hPatternsAtlas.getUsedArea().h;
            this.hPatternsTable = ensureHostBufferCapacity(this.hPatternsTable, 4 * this.hPatternsAtlas.size, false);
            for (const [styleKey, _, styleIndex] of this.hStyles) {
                const [image, box] = requireDefined(this.hPatternsAtlas.get(styleKey));
                const sMin = (box.xMin + image.border) * wTexel_FRAC;
                const tMin = (box.yMin + image.border) * hTexel_FRAC;
                const sMax = (box.xMax - image.border) * wTexel_FRAC;
                const tMax = (box.yMax - image.border) * hTexel_FRAC;
                this.hPatternsTable[4 * styleIndex + 0] = sMin;
                this.hPatternsTable[4 * styleIndex + 1] = tMin;
                this.hPatternsTable[4 * styleIndex + 2] = sMax - sMin;
                this.hPatternsTable[4 * styleIndex + 3] = tMax - tMin;
            }
            activeTexture(gl, patternsAtlasTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.hPatternsAtlas.getPixels());
            activeTexture(gl, patternsTableTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.hPatternsAtlas.size, 1, 0, GL.RGBA, GL.FLOAT, this.hPatternsTable);
            this.dPatterns = hPatterns;
        }
        
        if (this.dPatternsVertexCoordsMarker !== this.hPatternsVertices.marker) {
            this.dPatternsVertexCoordsCapacityBytes = run(() => {
                const oldCapacityBytes = this.dPatternsVertexCoordsCapacityBytes;
                const newCapacityBytes = this.hPatternsVertices.vertexCoords.byteLength;
                if (newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes) {
                    gl.bindBuffer(GL.ARRAY_BUFFER, this.dPatternsVertexCoords);
                    gl.bufferData(GL.ARRAY_BUFFER, this.hPatternsVertices.vertexCoords, GL.STATIC_DRAW);
                    return newCapacityBytes;
                }
                return oldCapacityBytes;
            });
            this.dPatternsVertexCount = 6 * this.hPatternsVertices.eventCount;
            this.dPatternsVertexCoordsMarker = this.hPatternsVertices.marker;
        }
        
        if (this.dPatternsVertexCount > 0) {
            const { program, attribs, uniforms } = context.getProgram(SOURCE);
            enablePremultipliedAlphaBlending(gl);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertexCoords);
            try {
                gl.uniform1f(uniforms.DPR, dpr);
                glUniformEra(gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC());
                glUniformInterval2D(gl, uniforms.VIEWPORT_PX, viewport_PX);
                gl.uniform1f(uniforms.LANE_HEIGHT_PX, laneHeight_PX);
                gl.uniform1f(uniforms.EVENT_MIN_APPARENT_WIDTH_PX, eventMinApparentWidth_PX);
                gl.uniform1i(uniforms.STYLES_TABLE, stylesTableTexUnit);
                gl.uniform2f(uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank(4), this.hStylesTable.ranksTotal);
                gl.uniform1i(uniforms.EVENTS_TABLE, eventsTableTexUnit);
                gl.uniform2f(uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank(4), this.hEventsTable.ranksTotal);
                gl.uniform1i(uniforms.PATTERNS_ATLAS, patternsAtlasTexUnit);
                glUniformSize2D(gl, uniforms.PATTERNS_ATLAS_SIZE_PX, this.hPatternsAtlas.getUsedArea());
                gl.uniform1i(uniforms.PATTERNS_TOC, patternsTableTexUnit);
                gl.uniform1f(uniforms.PATTERNS_TOC_SIZE, this.hPatternsAtlas.size);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dPatternsVertexCoords);
                gl.vertexAttribPointer(attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.TRIANGLES, 0, this.dPatternsVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inVertexCoords);
                gl.useProgram(null);
            }
        }
        
        if (this.dBordersVertexCoordsMarker !== this.hBordersVertices.marker) {
            this.dBordersVertexCoordsCapacityBytes = run(() => {
                const oldCapacityBytes = this.dBordersVertexCoordsCapacityBytes;
                const newCapacityBytes = this.hBordersVertices.vertexCoords.byteLength;
                if (newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes) {
                    gl.bindBuffer(GL.ARRAY_BUFFER, this.dBordersVertexCoords);
                    gl.bufferData(GL.ARRAY_BUFFER, this.hBordersVertices.vertexCoords, GL.STATIC_DRAW);
                    return newCapacityBytes;
                }
                return oldCapacityBytes;
            });
            this.dBordersVertexCount = 6 * 4 * this.hBordersVertices.eventCount;
            this.dBordersVertexCoordsMarker = this.hBordersVertices.marker;
        }
        
        if (this.dBordersVertexCount > 0) {
            const { program, attribs, uniforms } = context.getProgram(SOURCE$1);
            enablePremultipliedAlphaBlending(gl);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertexCoords);
            try {
                gl.uniform1f(uniforms.DPR, dpr);
                glUniformEra(gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC());
                glUniformInterval2D(gl, uniforms.VIEWPORT_PX, viewport_PX);
                gl.uniform1f(uniforms.LANE_HEIGHT_PX, laneHeight_PX);
                gl.uniform1f(uniforms.EVENT_MIN_APPARENT_WIDTH_PX, eventMinApparentWidth_PX);
                gl.uniform1i(uniforms.STYLES_TABLE, stylesTableTexUnit);
                gl.uniform2f(uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank(4), this.hStylesTable.ranksTotal);
                gl.uniform1i(uniforms.EVENTS_TABLE, eventsTableTexUnit);
                gl.uniform2f(uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank(4), this.hEventsTable.ranksTotal);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dBordersVertexCoords);
                gl.vertexAttribPointer(attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.TRIANGLES, 0, this.dBordersVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inVertexCoords);
                gl.useProgram(null);
            }
        }
        
        this.hGlyphsAtlas.commit();
        if (this.dGlyphsAtlasMarker !== this.hGlyphsAtlas.marker) {
            activeTexture(gl, glyphsAtlasTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            if (this.hGlyphsAtlas.atlas.size > 0) {
                const { w, h } = this.hGlyphsAtlas.atlas.getUsedArea();
                gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.hGlyphsAtlas.atlas.getPixelBytes());
            }
            else {
                gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 0, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array(0));
            }
            activeTexture(gl, glyphsTableTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.hGlyphsAtlas.tocTexelsPerRank(4), this.hGlyphsAtlas.tocRanksTotal, 0, GL.RGBA, GL.FLOAT, this.hGlyphsAtlas.toc);
            this.dGlyphsAtlasMarker = this.hGlyphsAtlas.marker;
        }
        
        if (this.dGlyphsVertexCoordsMarker !== this.hGlyphsVertices.marker) {
            this.dGlyphsVertexCount = 6 * this.hGlyphsVertices.boxCount;
            if (this.dGlyphsVertexCount > 0) {
                if (this.hGlyphsMaxDirtyBoxIndex > this.hGlyphsMinDirtyBoxIndex) {
                    this.dGlyphsVertexCoordsCapacityBytes = run(() => {
                        const oldCapacityBytes = this.dGlyphsVertexCoordsCapacityBytes;
                        const newCapacityBytes = this.hGlyphsVertices.vertexCoords.byteLength;
                        if (newCapacityBytes > 0 && oldCapacityBytes !== newCapacityBytes) {
                            gl.bindBuffer(GL.ARRAY_BUFFER, this.dGlyphsVertexCoords);
                            gl.bufferData(GL.ARRAY_BUFFER, newCapacityBytes, GL.STATIC_DRAW);
                            gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.hGlyphsVertices.vertexCoords.subarray(0, 2 * this.dGlyphsVertexCount));
                            return newCapacityBytes;
                        }
                        else {
                            gl.bindBuffer(GL.ARRAY_BUFFER, this.dGlyphsVertexCoords);
                            const startFloat = 2 * 6 * this.hGlyphsMinDirtyBoxIndex;
                            const endFloat = 2 * 6 * (this.hGlyphsMaxDirtyBoxIndex + 1);
                            gl.bufferSubData(GL.ARRAY_BUFFER, 4 * startFloat, this.hGlyphsVertices.vertexCoords.subarray(startFloat, endFloat));
                            return oldCapacityBytes;
                        }
                    });
                    this.hGlyphsMinDirtyBoxIndex = Number.POSITIVE_INFINITY;
                    this.hGlyphsMaxDirtyBoxIndex = Number.NEGATIVE_INFINITY;
                }
            }
            this.dGlyphsVertexCoordsMarker = this.hGlyphsVertices.marker;
        }
        
        if (this.dGlyphsCodesMarker !== this.hGlyphsStrings.marker) {
            activeTexture(gl, glyphsCodesTexUnit);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.hGlyphsStrings.texelsPerRank(4), this.hGlyphsStrings.ranksTotal, 0, GL.RGBA, GL.FLOAT, this.hGlyphsStrings.floats);
            this.dGlyphsCodesMarker = this.hGlyphsStrings.marker;
        }
        
        if (this.dGlyphsVertexCount > 0) {
            const { program, attribs, uniforms } = context.getProgram(SOURCE$2);
            enablePremultipliedAlphaBlending(gl);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertexCoords);
            try {
                gl.uniform1f(uniforms.DPR, dpr);
                glUniformEra(gl, uniforms.X_VIEW_LIMITS, this.timeBoundsFn_PSEC());
                glUniformInterval2D(gl, uniforms.VIEWPORT_PX, viewport_PX);
                gl.uniform1f(uniforms.LANE_HEIGHT_PX, laneHeight_PX);
                gl.uniform1f(uniforms.FADE_ZONE_PX, glyphFadeZone_PX);
                gl.uniform1i(uniforms.STYLES_TABLE, stylesTableTexUnit);
                gl.uniform2f(uniforms.STYLES_TABLE_SIZE, this.hStylesTable.texelsPerRank(4), this.hStylesTable.ranksTotal);
                gl.uniform1i(uniforms.EVENTS_TABLE, eventsTableTexUnit);
                gl.uniform2f(uniforms.EVENTS_TABLE_SIZE, this.hEventsTable.texelsPerRank(4), this.hEventsTable.ranksTotal);
                gl.uniform1i(uniforms.ATLAS, glyphsAtlasTexUnit);
                glUniformSize2D(gl, uniforms.ATLAS_SIZE_PX, this.hGlyphsAtlas.atlas.getUsedArea());
                gl.uniform1i(uniforms.GLYPHS_TABLE, glyphsTableTexUnit);
                gl.uniform2f(uniforms.GLYPHS_TABLE_SIZE, this.hGlyphsAtlas.tocTexelsPerRank(4), this.hGlyphsAtlas.tocRanksTotal);
                gl.uniform1i(uniforms.CODES, glyphsCodesTexUnit);
                gl.uniform2f(uniforms.CODES_SIZE, this.hGlyphsStrings.texelsPerRank(4), this.hGlyphsStrings.ranksTotal);
                gl.bindBuffer(GL.ARRAY_BUFFER, this.dGlyphsVertexCoords);
                gl.vertexAttribPointer(attribs.inVertexCoords, 2, GL.FLOAT, false, 0, 0);
                gl.drawArrays(GL.TRIANGLES, 0, this.dGlyphsVertexCount);
            }
            finally {
                gl.disableVertexAttribArray(attribs.inVertexCoords);
                gl.useProgram(null);
            }
        }
    }
    dispose(context) {
        this.disposers.dispose();
        const gl = context.gl;
        this.glIncarnation = null;
        gl.deleteTexture(this.dStylesTable);
        gl.deleteTexture(this.dEventsTable);
        this.dStylesTable = null;
        this.dEventsTable = null;
        this.dStylesTableMarker = null;
        this.dEventsTableMarker = null;
        gl.deleteTexture(this.dPatternsAtlas);
        gl.deleteTexture(this.dPatternsTable);
        gl.deleteBuffer(this.dPatternsVertexCoords);
        this.dPatternsAtlas = null;
        this.dPatternsTable = null;
        this.dPatterns.clear();
        this.dPatternsVertexCoords = null;
        this.dPatternsVertexCoordsCapacityBytes = -1;
        this.dPatternsVertexCount = -1;
        this.dPatternsVertexCoordsMarker = null;
        gl.deleteBuffer(this.dBordersVertexCoords);
        this.dBordersVertexCoords = null;
        this.dBordersVertexCoordsCapacityBytes = -1;
        this.dBordersVertexCount = -1;
        this.dBordersVertexCoordsMarker = null;
        gl.deleteTexture(this.dGlyphsAtlas);
        gl.deleteTexture(this.dGlyphsTable);
        gl.deleteTexture(this.dGlyphsCodes);
        gl.deleteBuffer(this.dGlyphsVertexCoords);
        this.dGlyphsAtlas = null;
        this.dGlyphsTable = null;
        this.dGlyphsCodes = null;
        this.dGlyphsVertexCoords = null;
        this.dGlyphsVertexCoordsCapacityBytes = -1;
        this.dGlyphsVertexCount = -1;
        this.dGlyphsAtlasMarker = null;
        this.dGlyphsCodesMarker = null;
        this.dGlyphsVertexCoordsMarker = null;
    }
}

var _a, _b;
const eventResizeMinWidth_LPX = 3;
const edgeGrabDistance_LPX = 6;
const edgeSnapDistance_LPX = 6;
class EventImpl {
    constructor(label, era_PSEC, options) {
        var _c, _d;
        this[_a] = true;
        this[_b] = true;
        this._label = label;
        this._allowsUserDrag = (_c = options === null || options === void 0 ? void 0 : options.allowsUserDrag) !== null && _c !== void 0 ? _c : false;
        this._eraConstraints_PSEC = ((options === null || options === void 0 ? void 0 : options.eraConstraints_PSEC) ? Object.assign({}, options.eraConstraints_PSEC) : {});
        this._era_PSEC = constrainEra(era_PSEC, this._eraConstraints_PSEC);
        this._classes = newImmutableSet((_d = options === null || options === void 0 ? void 0 : options.classes) !== null && _d !== void 0 ? _d : []);
        this._styleKeyCache = undefined;
        this._owner = undefined;
    }
    get label() {
        return this._label;
    }
    get era_PSEC() {
        return this._era_PSEC;
    }
    get allowsUserDrag() {
        return this._allowsUserDrag;
    }
    get eraConstraints_PSEC() {
        return this._eraConstraints_PSEC;
    }
    get classes() {
        return this._classes;
    }
    get styleKey() {
        if (!this._styleKeyCache || this._styleKeyCache.classes !== this._classes) {
            this._styleKeyCache = {
                classes: this._classes,
                styleKey: EventImpl.createStyleKey(this._classes),
            };
        }
        return this._styleKeyCache.styleKey;
    }
    static createStyleKey(classNames) {
        let s = '';
        for (const className of [...classNames].sort()) {
            if (s.length > 0) {
                s += '.';
            }
            s += className;
        }
        return s;
    }
    setLabel(ongoing, label) {
        var _c;
        this._label = label;
        (_c = this._owner) === null || _c === void 0 ? void 0 : _c._updateEvent(ongoing, this);
    }
    setEra_PSEC(ongoing, era_PSEC, eraConstraintMode) {
        var _c;
        this._era_PSEC = constrainEra(era_PSEC, this._eraConstraints_PSEC, eraConstraintMode);
        (_c = this._owner) === null || _c === void 0 ? void 0 : _c._updateEvent(ongoing, this);
    }
    setEraConstraints_PSEC(ongoing, eraConstraints) {
        this._eraConstraints_PSEC = Object.assign({}, eraConstraints);
        this.setEra_PSEC(ongoing, this._era_PSEC);
    }
    setAllowsUserDrag(ongoing, allowsUserDrag) {
        var _c;
        this._allowsUserDrag = allowsUserDrag;
        (_c = this._owner) === null || _c === void 0 ? void 0 : _c._updateEvent(ongoing, this);
    }
    setClasses(ongoing, classes) {
        var _c;
        this._classes = classes;
        (_c = this._owner) === null || _c === void 0 ? void 0 : _c._updateEvent(ongoing, this);
    }
    addClass(ongoing, clazz) {
        this.setClasses(ongoing, this.classes.add(clazz));
    }
    removeClass(ongoing, clazz) {
        this.setClasses(ongoing, this.classes.remove(clazz));
    }
    toggleClass(ongoing, clazz) {
        if (this.classes.has(clazz)) {
            this.removeClass(ongoing, clazz);
        }
        else {
            this.addClass(ongoing, clazz);
        }
    }
}
_a = READABLE_EVENT_SYMBOL, _b = WRITABLE_EVENT_SYMBOL;
class EventStyleImpl {
    constructor(cssClasses, patternGens) {
        this.peer = createDomPeer('timeline-event-style', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.barMarginTop_LPX = StyleProp.create(this.style, '--bar-margin-top-px', cssFloat, 0);
        this.barMarginBottom_LPX = StyleProp.create(this.style, '--bar-margin-bottom-px', cssFloat, 0);
        this.barBorderColor = StyleProp.create(this.style, '--bar-border-color', cssColor, 'rgb(127,127,127)');
        this.barBorderWidth_LPX = StyleProp.create(this.style, '--bar-border-width-px', cssFloat, 0);
        this.barFillPattern = StyleProp.create(this.style, '--bar-fill-pattern', cssString, 'solid');
        this.labelColor = StyleProp.create(this.style, '--label-color', cssColor, 'rgb(0,0,0)');
        this.labelOffsetX_LPX = StyleProp.create(this.style, '--label-offset-x-px', cssFloat, 1);
        this.labelOffsetY_LPX = StyleProp.create(this.style, '--label-offset-y-px', cssFloat, 2);
        this.labelAllowOvershoot = StyleProp.create(this.style, '--label-allow-overshoot', cssBoolean, false);
        this.labelFont = StyleProp.create(this.style, '--label-font', cssString, '13px sans-serif');
        for (const cssClass of cssClasses) {
            setCssClassPresent(this.peer, cssClass, true);
        }
        this.patterns = new Map();
        for (const [key, patternGen] of patternGens) {
            const pattern = patternGen();
            appendChild(this.peer, pattern.peer);
            this.patterns.set(key, pattern);
        }
    }
    createBarFillRasterizer(laneHeight_LPX, maxDim_PX) {
        var _c;
        const patternName = this.barFillPattern.get();
        const pattern = (_c = this.patterns.get(patternName)) !== null && _c !== void 0 ? _c : FALLBACK_EVENT_FILL_PATTERN;
        return pattern.createRasterizer(laneHeight_LPX, maxDim_PX);
    }
    createGlyphRasterizer() {
        const font = this.labelFont.get();
        const dpr = currentDpr(this);
        return new GlyphRasterizerImpl(font, dpr);
    }
}
class GlyphRasterizerImpl extends ValueBase {
    constructor(font, dpr) {
        super(font, dpr);
        this.font = font;
        this.dpr = dpr;
        this.metrics = undefined;
    }
    createGlyph(glyphName) {
        if (!this.metrics) {
            this.metrics = estimateFontMetrics(this.dpr, this.font, DEFAULT_CHARS);
        }
        
        
        const bwImage = createTextImage(this.dpr, this.font, this.metrics, 0, 'black', 'white', glyphName);
        const bwBytes = bwImage.imageData.data;
        const bwWidth = bwImage.imageData.width;
        const bwHeight = bwImage.imageData.height;
        const alphaBorder = 1;
        const alphaPackedWidth = Math.ceil(bwWidth / 4) + 2 * alphaBorder;
        const alphaHeight = bwHeight + 2 * alphaBorder;
        const alphaBytes = new Uint8ClampedArray(4 * alphaPackedWidth * alphaHeight);
        alphaBytes.fill(0);
        for (let bwY = 0; bwY < bwHeight; bwY++) {
            for (let bwX = 0; bwX < bwWidth; bwX++) {
                
                
                const alphaByte = 255 - bwBytes[4 * (bwY * bwWidth + bwX) + 1];
                const alphaX = 4 * alphaBorder + bwX;
                const alphaY = alphaBorder + bwY;
                alphaBytes[4 * (alphaY * alphaPackedWidth) + alphaX] = alphaByte;
            }
        }
        return {
            isAlphaMask: true,
            unpackedWidth: bwWidth,
            image: {
                border: alphaBorder,
                xAnchor: bwImage.xAnchor,
                yAnchor: bwImage.yAnchor,
                imageData: new ImageData(alphaBytes, alphaPackedWidth, alphaHeight),
            },
        };
    }
}
class EventsRow {
    constructor(timeAxis_PSEC, patternGens) {
        this.repaint = new ListenableBasic();
        this.timeAxis_PSEC = timeAxis_PSEC;
        this.timeAxis_PSEC.changes.addListener(IMMEDIATE, () => {
            this.repaint.fire();
        });
        this.patternGens = newImmutableMap(patternGens);
        this.events = new EventsGroup();
        this.events.positionChanges.addListener({ order: 999999 }, () => this.repaint.fire());
        this.events.rightNeighborChanges.addListener({ order: 999999 }, () => this.repaint.fire());
        this.events.styleChanges.addListener({ order: 999999 }, () => this.repaint.fire());
        this.events.labelChanges.addListener({ order: 999999 }, () => this.repaint.fire());
        this.eventsPainter = new EventsPainter(this.events);
        this.eventsPainter.timeBoundsFn_PSEC = axisBoundsFn(this.timeAxis_PSEC);
        this.eventsPainter.createEventStyle = classes => {
            
            
            
            const eventStyle = new EventStyleImpl(classes, this.patternGens);
            appendChild(this.pane.peer, eventStyle.peer);
            return eventStyle;
        };
        const layout = new ChildlessLayout();
        layout.prefWidth_LPX.override = 0;
        layout.prefHeight_LPX.getOverride = () => {
            const numLanes = this.events.getLanes().length;
            const laneHeight_LPX = roundLpxToPx(this.eventsPainter.laneHeight_LPX.get(), currentDpr(this.pane));
            return (numLanes * laneHeight_LPX);
        };
        this.pane = new Pane(layout);
        this.pane.addCssClass('timeline-events-row');
        this.pane.addPainter(this.eventsPainter);
        this.pane.addInputHandler(this.createEventsInputHandler());
    }
    createEventsInputHandler() {
        const row = this;
        return {
            getHoverHandler(evMove) {
                var _c, _d, _e;
                return (_e = (_d = (_c = row.findInputHandler(evMove)) === null || _c === void 0 ? void 0 : _c.getHoverHandler) === null || _d === void 0 ? void 0 : _d.call(_c, evMove)) !== null && _e !== void 0 ? _e : null;
            },
            getDragHandler(evGrab) {
                var _c, _d, _e;
                return (_e = (_d = (_c = row.findInputHandler(evGrab)) === null || _c === void 0 ? void 0 : _c.getDragHandler) === null || _d === void 0 ? void 0 : _d.call(_c, evGrab)) !== null && _e !== void 0 ? _e : null;
            },
            getKeyHandler(evGrab) {
                var _c, _d, _e;
                return (_e = (_d = (_c = row.findInputHandler(evGrab)) === null || _c === void 0 ? void 0 : _c.getKeyHandler) === null || _d === void 0 ? void 0 : _d.call(_c, evGrab)) !== null && _e !== void 0 ? _e : null;
            },
        };
    }
    getMouseCoord_PSEC(ev) {
        return getMouseAxisCoord1D(this.timeAxis_PSEC, X, ev);
    }
    ;
    findInputHandler(ev) {
        var _c, _d;
        const dpr = currentDpr(this.pane);
        const laneHeight_LPX = roundLpxToPx(this.eventsPainter.laneHeight_LPX.get(), dpr);
        const laneHeight_PX = laneHeight_LPX * dpr;
        const grabLaneNum = Math.floor((this.pane.getViewport_PX().yMax - ev.loc_PX.y) / laneHeight_PX);
        const grabTime_PSEC = this.getMouseCoord_PSEC(ev);
        const lane = this.events.getLanes()[grabLaneNum];
        if (lane) {
            const edgeGrabDistance_SEC = edgeGrabDistance_LPX / this.timeAxis_PSEC.scale;
            const eventContaining = lane.getEventContaining(grabTime_PSEC);
            if (eventContaining) {
                
                if (eventContaining.allowsUserDrag) {
                    const era_PSEC = eventContaining.era_PSEC;
                    const eraMid_PSEC = era_PSEC.fracToValue(0.5);
                    const maxForMinEdgeGrab_PSEC = Math.min(eraMid_PSEC, era_PSEC.min + edgeGrabDistance_SEC);
                    const minForMaxEdgeGrab_PSEC = Math.max(eraMid_PSEC, era_PSEC.max - edgeGrabDistance_SEC);
                    if (grabTime_PSEC >= minForMaxEdgeGrab_PSEC) {
                        return this.createRightEdgeInputHandler(eventContaining);
                    }
                    else if (grabTime_PSEC <= maxForMinEdgeGrab_PSEC) {
                        return this.createLeftEdgeInputHandler(eventContaining);
                    }
                    else {
                        return this.createWholeEventInputHandler(eventContaining);
                    }
                }
                else {
                    
                    return this.createEventSelector(eventContaining);
                }
            }
            const eventLeft = (_c = lane.getEntryStartingBefore(grabTime_PSEC)) === null || _c === void 0 ? void 0 : _c[1].valueBefore(undefined);
            const eventRight = (_d = lane.getEntryStartingAtOrAfter(grabTime_PSEC)) === null || _d === void 0 ? void 0 : _d[1].valueAfter(undefined);
            if (eventLeft && eventLeft.allowsUserDrag && eventRight && eventRight.allowsUserDrag) {
                
                const leftMax_PSEC = eventLeft.era_PSEC.max;
                const rightMin_PSEC = eventRight.era_PSEC.min;
                const mid_PSEC = leftMax_PSEC + 0.5 * (rightMin_PSEC - leftMax_PSEC);
                const maxForLeftMaxGrab_PSEC = Math.min(mid_PSEC, leftMax_PSEC + edgeGrabDistance_SEC);
                const minForRightMinGrab_PSEC = Math.max(mid_PSEC, rightMin_PSEC - edgeGrabDistance_SEC);
                if (grabTime_PSEC <= maxForLeftMaxGrab_PSEC) {
                    return this.createRightEdgeInputHandler(eventLeft);
                }
                else if (grabTime_PSEC >= minForRightMinGrab_PSEC) {
                    return this.createLeftEdgeInputHandler(eventRight);
                }
            }
            else if (eventLeft && eventLeft.allowsUserDrag) {
                
                const leftMax_PSEC = eventLeft.era_PSEC.max;
                const maxForLeftMaxGrab_PSEC = leftMax_PSEC + edgeGrabDistance_SEC;
                if (grabTime_PSEC <= maxForLeftMaxGrab_PSEC) {
                    return this.createRightEdgeInputHandler(eventLeft);
                }
            }
            else if (eventRight && eventRight.allowsUserDrag) {
                
                const rightMin_PSEC = eventRight.era_PSEC.min;
                const minForRightMinGrab_PSEC = rightMin_PSEC - edgeGrabDistance_SEC;
                if (grabTime_PSEC >= minForRightMinGrab_PSEC) {
                    return this.createLeftEdgeInputHandler(eventRight);
                }
            }
        }
        return null;
    }
    createLeftEdgeInputHandler(event) {
        const target = new EventInputTarget(event, EVENT_ZONE_LEFT);
        const getMouseCursorClasses = frozenSupplier(['left-edge-dragger']);
        return EventsRow.createEventInputHandler(target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC(evGrab);
            const grabOffset_SEC = grabTime_PSEC - event.era_PSEC.min;
            let hasMouseDraggedInTimeDimension = false;
            const updateLeftEdge = (ongoing, ev) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC(ev);
                if (mouseTime_PSEC !== grabTime_PSEC) {
                    hasMouseDraggedInTimeDimension = true;
                }
                const minWidth_SEC = eventResizeMinWidth_LPX / this.timeAxis_PSEC.scale;
                const maxMin_PSEC = Math.max(event.era_PSEC.max - minWidth_SEC, event.era_PSEC.min);
                const newMin_PSEC = run(() => {
                    const prefMin_PSEC = mouseTime_PSEC - grabOffset_SEC;
                    const snappedMin_PSEC = run(() => {
                        if (!ev.modifiers.ctrl) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMin_PSEC = this.events.findNearestSnapTime_PSEC(prefMin_PSEC, Number.NEGATIVE_INFINITY, maxMin_PSEC, [event]);
                            if (snappedMin_PSEC !== undefined && Math.abs(snappedMin_PSEC - prefMin_PSEC) <= edgeSnapDistance_SEC) {
                                return snappedMin_PSEC;
                            }
                        }
                        return undefined;
                    });
                    return (snappedMin_PSEC !== null && snappedMin_PSEC !== void 0 ? snappedMin_PSEC : Math.min(maxMin_PSEC, prefMin_PSEC));
                });
                const oldEra_PSEC = event.era_PSEC;
                if (newMin_PSEC !== oldEra_PSEC.min) {
                    const newEra_PSEC = Interval1D.fromEdges(newMin_PSEC, oldEra_PSEC.max);
                    event.setEra_PSEC(ongoing, newEra_PSEC, EraConstraintMode.KEEP_MAX);
                    this.repaint.fire();
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateLeftEdge(true, ev),
                handleUngrab: ev => {
                    if (hasMouseDraggedInTimeDimension) {
                        updateLeftEdge(false, ev);
                    }
                },
            };
        });
    }
    createRightEdgeInputHandler(event) {
        const target = new EventInputTarget(event, EVENT_ZONE_RIGHT);
        const getMouseCursorClasses = frozenSupplier(['right-edge-dragger']);
        return EventsRow.createEventInputHandler(target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC(evGrab);
            const grabOffset_SEC = grabTime_PSEC - event.era_PSEC.max;
            let hasMouseDraggedInTimeDimension = false;
            const updateRightEdge = (ongoing, ev) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC(ev);
                if (mouseTime_PSEC !== grabTime_PSEC) {
                    hasMouseDraggedInTimeDimension = true;
                }
                const minWidth_SEC = eventResizeMinWidth_LPX / this.timeAxis_PSEC.scale;
                const minMax_PSEC = Math.min(event.era_PSEC.min + minWidth_SEC, event.era_PSEC.max);
                const newMax_PSEC = run(() => {
                    const prefMax_PSEC = mouseTime_PSEC - grabOffset_SEC;
                    const snappedMax_PSEC = run(() => {
                        if (!ev.modifiers.ctrl) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMax_PSEC = this.events.findNearestSnapTime_PSEC(prefMax_PSEC, minMax_PSEC, Number.POSITIVE_INFINITY, [event]);
                            if (snappedMax_PSEC !== undefined && Math.abs(snappedMax_PSEC - prefMax_PSEC) <= edgeSnapDistance_SEC) {
                                return snappedMax_PSEC;
                            }
                        }
                        return undefined;
                    });
                    return (snappedMax_PSEC !== null && snappedMax_PSEC !== void 0 ? snappedMax_PSEC : Math.max(minMax_PSEC, prefMax_PSEC));
                });
                const oldEra_PSEC = event.era_PSEC;
                if (newMax_PSEC !== oldEra_PSEC.max) {
                    const newEra_PSEC = Interval1D.fromEdges(oldEra_PSEC.min, newMax_PSEC);
                    event.setEra_PSEC(ongoing, newEra_PSEC, EraConstraintMode.KEEP_MIN);
                    this.repaint.fire();
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateRightEdge(true, ev),
                handleUngrab: ev => {
                    if (hasMouseDraggedInTimeDimension) {
                        updateRightEdge(false, ev);
                    }
                },
            };
        });
    }
    createWholeEventInputHandler(event) {
        const target = new EventInputTarget(event, EVENT_ZONE_CENTER);
        const getMouseCursorClasses = frozenSupplier(['clickable']);
        return EventsRow.createEventInputHandler(target, getMouseCursorClasses, evGrab => {
            const grabTime_PSEC = this.getMouseCoord_PSEC(evGrab);
            const grabOffset_FRAC = event.era_PSEC.valueToFrac(grabTime_PSEC);
            let hasMouseDraggedInTimeDimension = false;
            const updateEra = (ongoing, ev) => {
                const mouseTime_PSEC = this.getMouseCoord_PSEC(ev);
                if (mouseTime_PSEC !== grabTime_PSEC) {
                    hasMouseDraggedInTimeDimension = true;
                }
                const oldEra_PSEC = event.era_PSEC;
                const span_SEC = oldEra_PSEC.span;
                const newMin_PSEC = run(() => {
                    const prefMin_PSEC = mouseTime_PSEC - grabOffset_FRAC * span_SEC;
                    const snappedMin_PSEC = run(() => {
                        if (!ev.modifiers.ctrl) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMin_PSEC = this.events.findNearestSnapTime_PSEC(prefMin_PSEC, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, [event]);
                            if (snappedMin_PSEC !== undefined && Math.abs(snappedMin_PSEC - prefMin_PSEC) <= edgeSnapDistance_SEC) {
                                return snappedMin_PSEC;
                            }
                        }
                        return undefined;
                    });
                    const prefMax_PSEC = prefMin_PSEC + span_SEC;
                    const snappedMax_PSEC = run(() => {
                        if (!ev.modifiers.ctrl) {
                            const edgeSnapDistance_SEC = edgeSnapDistance_LPX / this.timeAxis_PSEC.scale;
                            const snappedMax_PSEC = this.events.findNearestSnapTime_PSEC(prefMax_PSEC, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, [event]);
                            if (snappedMax_PSEC !== undefined && Math.abs(snappedMax_PSEC - prefMax_PSEC) <= edgeSnapDistance_SEC) {
                                return snappedMax_PSEC;
                            }
                        }
                        return undefined;
                    });
                    if (snappedMin_PSEC !== undefined && snappedMax_PSEC !== undefined) {
                        if (Math.abs(snappedMin_PSEC - prefMin_PSEC) < Math.abs(snappedMax_PSEC - prefMax_PSEC)) {
                            return snappedMin_PSEC;
                        }
                        else {
                            return (snappedMax_PSEC - span_SEC);
                        }
                    }
                    else if (snappedMin_PSEC !== undefined) {
                        return snappedMin_PSEC;
                    }
                    else if (snappedMax_PSEC !== undefined) {
                        return (snappedMax_PSEC - span_SEC);
                    }
                    else {
                        return prefMin_PSEC;
                    }
                });
                if (newMin_PSEC !== oldEra_PSEC.min) {
                    const newEra_PSEC = Interval1D.fromRect(newMin_PSEC, span_SEC);
                    event.setEra_PSEC(ongoing, newEra_PSEC, EraConstraintMode.KEEP_SPAN);
                    this.repaint.fire();
                }
            };
            return {
                target,
                getMouseCursorClasses,
                handleDrag: ev => updateEra(true, ev),
                handleUngrab: ev => {
                    if (hasMouseDraggedInTimeDimension) {
                        updateEra(false, ev);
                    }
                },
            };
        });
    }
    createEventSelector(event) {
        const target = new EventInputTarget(event, EVENT_ZONE_CENTER);
        const getMouseCursorClasses = frozenSupplier(['clickable']);
        return EventsRow.createEventInputHandler(target, getMouseCursorClasses, () => {
            return {
                target,
                getMouseCursorClasses,
            };
        });
    }
    static createEventInputHandler(target, getMouseCursorClasses, createDragHandler) {
        return {
            getHoverHandler(evMove) {
                if (evMove.modifiers.isEmpty()) {
                    return {
                        target,
                        getMouseCursorClasses,
                    };
                }
                else {
                    return null;
                }
            },
            getDragHandler(evGrab) {
                if (evGrab.button === 0 && evGrab.modifiers.isEmpty()) {
                    return createDragHandler(evGrab);
                }
                else {
                    return null;
                }
            },
            getKeyHandler(evGrab) {
                if (evGrab.button === 0 && evGrab.modifiers.isEmpty()) {
                    
                    return {
                        target,
                    };
                }
                else {
                    return null;
                }
            },
        };
    }
    attachToRepaint(repaint) {
        return linkListenables(this.repaint, repaint);
    }
}
const EVENT_ZONE_LEFT = Symbol('EVENT_ZONE_LEFT');
const EVENT_ZONE_RIGHT = Symbol('EVENT_ZONE_RIGHT');
const EVENT_ZONE_CENTER = Symbol('EVENT_ZONE_CENTER');
class EventInputTarget {
    constructor(event, zone) {
        this.event = event;
        this.zone = zone;
    }
    hashCode() {
        const prime = 31;
        let result = 1;
        result = prime * result + hashCode(this.event);
        result = prime * result + hashCode(this.zone);
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
            return (o.event === this.event
                && o.zone === this.zone);
        }
    }
}
function attachEventClassUpdaters(hoverRef, focusRef) {
    const disposers = new DisposerGroup();
    disposers.add(attachHoveredEventClassUpdater(hoverRef));
    disposers.add(attachFocusedEventClassUpdater(focusRef));
    return disposers;
}
function attachFocusedEventClassUpdater(focusRef, focusClass = 'focused') {
    
    return _addOldNewActivityListener(focusRef, IMMEDIATE, (ongoing, oldTarget, newTarget) => {
        const oldEvent = oldTarget === null || oldTarget === void 0 ? void 0 : oldTarget.event;
        if (isWritableEvent(oldEvent)) {
            oldEvent.removeClass(ongoing, focusClass);
        }
        const newEvent = newTarget === null || newTarget === void 0 ? void 0 : newTarget.event;
        if (isWritableEvent(newEvent)) {
            newEvent.addClass(ongoing, focusClass);
        }
    });
}
function attachHoveredEventClassUpdater(hoverRef, hoveredClass = 'hovered') {
    
    return _addOldNewActivityListener(hoverRef, IMMEDIATE, (ongoing, oldHover, newHover) => {
        const oldEvent = oldHover === null || oldHover === void 0 ? void 0 : oldHover.event;
        if (isWritableEvent(oldEvent)) {
            oldEvent.removeClass(ongoing, hoveredClass);
        }
        const newEvent = newHover === null || newHover === void 0 ? void 0 : newHover.event;
        if (isWritableEvent(newEvent)) {
            newEvent.addClass(ongoing, hoveredClass);
        }
    });
}

function addRow(timeline, key, name, dataPainters, dataPanes, parentKey) {
    const row = timeline.addRow(key);
    timeline.setRowParent(key, parentKey);
    const symbolLabel = new RowSymbolLabel(row);
    symbolLabel.pane.addCssClass('timeline-row-label-symbol');
    symbolLabel.pane.addInputHandler(timeline.createExpandCollapseInputHandler(key));
    const nameLabel = new TextLabel(name);
    nameLabel.pane.addCssClass('timeline-row-label-name');
    const columnsPane = new Pane(new ColumnsLayout());
    columnsPane.addCssClass('timeline-row-label-columns');
    columnsPane.addPane(symbolLabel.pane);
    columnsPane.addPane(nameLabel.pane);
    const insetPane = new Pane(new InsetLayout());
    insetPane.addCssClass('timeline-row-label-inset');
    insetPane.addPane(columnsPane);
    row.labelPane.addInputHandler(timeline.createRowDragInputHandler(key));
    row.labelPane.addPane(insetPane);
    for (const dataPainter of dataPainters) {
        const painter = (isfn(dataPainter) ? dataPainter() : dataPainter);
        row.dataPane.addPainter(painter);
    }
    for (const dataPane of dataPanes) {
        row.dataPane.addPane(dataPane);
    }
    return row;
}

class RowSymbolLabel {
    constructor(row) {
        this.insetLayout = new InsetLayout();
        this.pane = new Pane(this.insetLayout);
        this.style = window.getComputedStyle(this.pane.peer);
        this.symbolPainter = new RowSymbolPainter(row);
        this.symbolLayout = new ChildlessLayout();
        this.symbolLayout.prefWidth_LPX.getOverride = () => {
            const image = this.symbolPainter.getImage();
            const imageWidth_PX = image.imageData.width - 2 * image.border;
            return (imageWidth_PX / currentDpr(this.pane));
        };
        this.symbolLayout.prefHeight_LPX.getOverride = () => {
            const image = this.symbolPainter.getImage();
            const imageHeight_PX = image.imageData.height - 2 * image.border;
            return (imageHeight_PX / currentDpr(this.pane));
        };
        this.symbolPane = new Pane(this.symbolLayout);
        this.symbolPane.addPainter(this.symbolPainter);
        this.pane.peer.classList.add('label');
        this.pane.addPane(this.symbolPane);
    }
}
var RowState;
(function (RowState) {
    RowState[RowState["CHILDREN_NONE"] = 0] = "CHILDREN_NONE";
    RowState[RowState["CHILDREN_COLLAPSED"] = 1] = "CHILDREN_COLLAPSED";
    RowState[RowState["CHILDREN_EXPANDED"] = 2] = "CHILDREN_EXPANDED";
})(RowState || (RowState = {}));
class RowSymbolInputs extends ValueBase2 {
    constructor(dpr, font, color, state) {
        super();
        this.dpr = dpr;
        this.font = font;
        this.color = color;
        this.state = state;
    }
}
class RowSymbolPainter extends ImagePainter {
    constructor(row) {
        super({
            createInputs: () => {
                const state = (row.children ? (row.children.expanded ? RowState.CHILDREN_EXPANDED : RowState.CHILDREN_COLLAPSED) : RowState.CHILDREN_NONE);
                return new RowSymbolInputs(currentDpr(this), this.font.get(), this.color.get(), state);
            },
            createImage: ({ dpr, font, color, state }) => {
                const border_PX = 1;
                const leftPadding_PX = Math.ceil(0.75 * dpr);
                const { ascent_PX, descent_PX } = estimateFontMetrics(dpr, font, DEFAULT_CHARS);
                const g = requireNonNull(this.canvas.getContext('2d', { willReadFrequently: true }));
                g.font = font;
                g.textAlign = 'left';
                g.textBaseline = 'alphabetic';
                const wContent_PX = Math.ceil(ascent_PX);
                const hContent_PX = Math.ceil(ascent_PX + descent_PX);
                const wImage_PX = leftPadding_PX + border_PX + wContent_PX + border_PX;
                const hImage_PX = border_PX + hContent_PX + border_PX;
                this.canvas.width = wImage_PX;
                this.canvas.height = hImage_PX;
                
                g.font = font;
                g.textAlign = 'left';
                g.textBaseline = 'alphabetic';
                const yBaseline_PX = border_PX + ascent_PX;
                g.clearRect(0, 0, wImage_PX, hImage_PX);
                switch (state) {
                    case RowState.CHILDREN_NONE:
                        break;
                    case RowState.CHILDREN_COLLAPSED:
                        {
                            g.save();
                            g.translate(border_PX + leftPadding_PX, border_PX);
                            try {
                                
                                const side_PX = ascent_PX - 1;
                                const xCenter_PX = 0.5 * side_PX;
                                const yCenter_PX = 0.5 * side_PX;
                                g.lineWidth = 1;
                                g.lineJoin = 'miter';
                                g.miterLimit = 99;
                                g.beginPath();
                                g.moveTo(xCenter_PX - 0.25 * side_PX, yCenter_PX);
                                g.lineTo(xCenter_PX - 0.25 * side_PX, yCenter_PX - 0.5 * side_PX + 0.25);
                                g.lineTo(xCenter_PX + 0.25 * side_PX, yCenter_PX);
                                g.lineTo(xCenter_PX - 0.25 * side_PX, yCenter_PX + 0.5 * side_PX - 0.25);
                                g.lineTo(xCenter_PX - 0.25 * side_PX, yCenter_PX);
                                g.closePath();
                                g.fillStyle = color.cssString;
                                g.fill();
                            }
                            finally {
                                g.restore();
                            }
                        }
                        break;
                    case RowState.CHILDREN_EXPANDED:
                        {
                            g.save();
                            g.translate(border_PX + leftPadding_PX, border_PX);
                            try {
                                
                                const side_PX = ascent_PX - 1;
                                const xCenter_PX = 0.5 * side_PX;
                                const yCenter_PX = 0.5 * side_PX;
                                g.lineWidth = 1;
                                g.lineJoin = 'miter';
                                g.miterLimit = 99;
                                g.beginPath();
                                g.moveTo(xCenter_PX, yCenter_PX - 0.25 * side_PX);
                                g.lineTo(xCenter_PX + 0.5 * side_PX - 0.25, yCenter_PX - 0.25 * side_PX);
                                g.lineTo(xCenter_PX, yCenter_PX + 0.25 * side_PX);
                                g.lineTo(xCenter_PX - 0.5 * side_PX + 0.25, yCenter_PX - 0.25 * side_PX);
                                g.lineTo(xCenter_PX, yCenter_PX - 0.25 * side_PX);
                                g.closePath();
                                g.fillStyle = color.cssString;
                                g.fill();
                            }
                            finally {
                                g.restore();
                            }
                        }
                        break;
                }
                return {
                    w: this.canvas.width,
                    h: this.canvas.height,
                    xAnchor: border_PX,
                    yAnchor: yBaseline_PX,
                    border: border_PX,
                    imageData: g.getImageData(0, 0, this.canvas.width, this.canvas.height),
                };
            },
        });
        this.font = StyleProp.create(this.style, '--font', cssString, '13px sans-serif');
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(127,127,127)');
        this.canvas = document.createElement('canvas');
    }
}

const { ceil, floor, max, min } = Math;
const UNIT_DURATIONS = Object.freeze({
    year: { seconds: SECONDS_PER_YEAR_APPROX, isExact: false },
    years: { seconds: SECONDS_PER_YEAR_APPROX, isExact: false },
    month: { seconds: SECONDS_PER_MONTH_APPROX, isExact: false },
    months: { seconds: SECONDS_PER_MONTH_APPROX, isExact: false },
    day: { seconds: SECONDS_PER_DAY, isExact: true },
    days: { seconds: SECONDS_PER_DAY, isExact: true },
    hour: { seconds: SECONDS_PER_HOUR, isExact: true },
    hours: { seconds: SECONDS_PER_HOUR, isExact: true },
    minute: { seconds: SECONDS_PER_MINUTE, isExact: true },
    minutes: { seconds: SECONDS_PER_MINUTE, isExact: true },
    second: { seconds: 1, isExact: true },
    seconds: { seconds: 1, isExact: true },
});
function rung(stepCount, stepUnit, startUnit) {
    return {
        stepCount,
        stepUnit,
        stepApprox_SEC: stepCount * UNIT_DURATIONS[stepUnit].seconds,
        startUnit,
    };
}
const timeTickIntervalRungs = Object.freeze([
    rung(1, 'seconds', 'minute'),
    rung(2, 'seconds', 'minute'),
    rung(5, 'seconds', 'minute'),
    rung(10, 'seconds', 'minute'),
    rung(15, 'seconds', 'minute'),
    rung(20, 'seconds', 'minute'),
    rung(30, 'seconds', 'minute'),
    rung(1, 'minutes', 'hour'),
    rung(2, 'minutes', 'hour'),
    rung(5, 'minutes', 'hour'),
    rung(10, 'minutes', 'hour'),
    rung(15, 'minutes', 'hour'),
    rung(20, 'minutes', 'hour'),
    rung(30, 'minutes', 'hour'),
    rung(1, 'hours', 'day'),
    rung(2, 'hours', 'day'),
    rung(3, 'hours', 'day'),
    rung(6, 'hours', 'day'),
    rung(12, 'hours', 'day')
]);
function getMonthAbbreviation(month) {
    switch (month) {
        case 1: return 'Jan';
        case 2: return 'Feb';
        case 3: return 'Mar';
        case 4: return 'Apr';
        case 5: return 'May';
        case 6: return 'Jun';
        case 7: return 'Jul';
        case 8: return 'Aug';
        case 9: return 'Sep';
        case 10: return 'Oct';
        case 11: return 'Nov';
        case 12: return 'Dec';
        default: return 'UNK';
    }
}
function formatInt(i, minWidth) {
    return i.toFixed(0).padStart(minWidth, '0');
}
function truncateToHour(t) {
    const { zoneOffset_MINUTES, year, month, day, hour } = t;
    return zonedTime(zoneOffset_MINUTES, year, month, day, hour, 0, 0);
}
class TimeTicker {
    constructor() {
        this.peer = createDomPeer('time-ticker', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.timezone = StyleProp.create(this.style, '--timezone', cssString, 'UTC');
        this.spacingApprox_LPX = StyleProp.create(this.style, '--approx-spacing-px', cssFloat, 100);
        this.minTickCount = 3;
        this.formatYear = t => formatInt(t.year, 4);
        this.formatMonth = t => getMonthAbbreviation(t.month);
        this.formatDay = t => formatInt(t.day, 2);
        this.formatHour = t => formatInt(t.hour, 2);
        this.formatMinute = t => formatInt(t.minute, 2);
        this.formatSecond = t => formatInt(t.second, 2);
        this.formatUnknown = () => '';
        this.formatYearMonth = t => [this.formatMonth(t), this.formatYear(t)].join(' ');
        this.formatHourMinute = t => [this.formatHour(t), this.formatMinute(t)].join('');
        this.formatMinuteSecond = t => [this.formatMinute(t), this.formatSecond(t)].join(':');
        this.formatYearMonthDay = t => [this.formatDay(t), this.formatMonth(t), this.formatYear(t)].join(' ');
        this.formatMonthDayHour = t => [this.formatDay(t), this.formatMonth(t), this.formatHourMinute(truncateToHour(t))].join(' ');
        this.formatTickCanary = [];
        this.formatTick = undefined;
    }
    getTicks(axis) {
        if (!axis || axis.viewport_PX.span <= 0) {
            return EMPTY_TICKSET;
        }
        const timezone = this.timezone.get();
        const spacingApprox_LPX = this.spacingApprox_LPX.get();
        const spacingApprox_PX = spacingApprox_LPX * axis.dpr;
        const axisMin_PSEC = min(axis.bounds.min, axis.bounds.max);
        const axisMax_PSEC = max(axis.bounds.min, axis.bounds.max);
        const approxTickInterval_SEC = (axisMax_PSEC - axisMin_PSEC) * spacingApprox_PX / axis.viewport_PX.span;
        let ticks_PSEC;
        let format;
        if (approxTickInterval_SEC > 60 * SECONDS_PER_DAY) {
            format = this.formatYear;
            ticks_PSEC = [];
            const tickCountApprox = axis.viewport_PX.span / spacingApprox_PX;
            const axisBoundsApprox_YEAR = Interval1D.fromEdges(toYear(axisMin_PSEC, timezone), toYear(axisMax_PSEC, timezone));
            let tickSeq_YEAR = findLinearTickSeq(this.minTickCount, tickCountApprox, axisBoundsApprox_YEAR);
            if (tickSeq_YEAR !== null) {
                if (tickSeq_YEAR.step < 1) {
                    
                    tickSeq_YEAR = createLinearTickSeq(axisBoundsApprox_YEAR, 1);
                }
                for (let i = 0; i < tickSeq_YEAR.countCurrent; i++) {
                    const t_YEAR = tickSeq_YEAR.first + i * tickSeq_YEAR.step;
                    const t_PSEC = fromYear_PSEC(t_YEAR, timezone);
                    ticks_PSEC.push(t_PSEC);
                }
            }
        }
        else if (approxTickInterval_SEC > 10 * SECONDS_PER_DAY) {
            format = this.formatMonth;
            ticks_PSEC = timeSeq_PSEC('month', axis.bounds, 1, 'month', timezone);
        }
        else if (approxTickInterval_SEC > 12 * SECONDS_PER_HOUR) {
            format = this.formatDay;
            ticks_PSEC = [];
            const approxTickInterval_DAYS = approxTickInterval_SEC / SECONDS_PER_DAY;
            const step_DAYS = firstTrue([1, 2, 3, 4, 5, 7], 10, atLeast(approxTickInterval_DAYS));
            const months_PSEC = timeSeq_PSEC('month', axis.bounds, 1, 'month', timezone);
            for (let i = 1; i < months_PSEC.length; i++) {
                const monthStart_PSEC = months_PSEC[i - 1];
                const monthEnd_PSEC = months_PSEC[i] - 0.5 * SECONDS_PER_DAY;
                for (let t_PSEC of timeSeq_PSEC('day', [monthStart_PSEC, monthEnd_PSEC], step_DAYS, 'day', timezone)) {
                    if (monthStart_PSEC <= t_PSEC && t_PSEC <= monthEnd_PSEC) {
                        ticks_PSEC.push(t_PSEC);
                    }
                }
            }
        }
        else if (approxTickInterval_SEC > 0) {
            const rung = requireDefined(firstTrue(timeTickIntervalRungs, r => (r.stepApprox_SEC >= approxTickInterval_SEC)));
            ticks_PSEC = timeSeq_PSEC(rung.startUnit, axis.bounds, rung.stepCount, rung.stepUnit, timezone);
            format = (rung.stepUnit === 'second' || rung.stepUnit === 'seconds' ? this.formatMinuteSecond : this.formatHourMinute);
        }
        else {
            ticks_PSEC = [];
            format = this.formatUnknown;
        }
        
        ticks_PSEC = ticks_PSEC.filter(t_PSEC => (axisMin_PSEC <= t_PSEC && t_PSEC <= axisMax_PSEC));
        
        const formatTickCanary = [timezone, format];
        if (!this.formatTick || !arrayAllEqual(formatTickCanary, this.formatTickCanary)) {
            this.formatTick = t_PSEC => format(psecToZonedTime(t_PSEC, timezone));
            this.formatTickCanary = formatTickCanary;
        }
        const getAxisLabels = () => {
            if (approxTickInterval_SEC > 60 * SECONDS_PER_DAY) {
                return EMPTY_AXISLABELSET;
            }
            else if (approxTickInterval_SEC > 10 * SECONDS_PER_DAY) {
                return createAxisLabels(axis.bounds, timezone, 'year', this.formatYear);
            }
            else if (approxTickInterval_SEC > 12 * SECONDS_PER_HOUR) {
                return createAxisLabels(axis.bounds, timezone, 'month', this.formatYearMonth);
            }
            else if (approxTickInterval_SEC > 0) {
                const rung = requireDefined(firstTrue(timeTickIntervalRungs, r => (r.stepApprox_SEC >= approxTickInterval_SEC)));
                if (rung.stepUnit === 'second' || rung.stepUnit === 'seconds') {
                    return createAxisLabels(axis.bounds, timezone, 'hour', this.formatMonthDayHour);
                }
                else {
                    return createAxisLabels(axis.bounds, timezone, 'day', this.formatYearMonthDay);
                }
            }
            else {
                return EMPTY_AXISLABELSET;
            }
        };
        return new TickSet(ticks_PSEC, [], this.formatTick, getAxisLabels);
    }
}
function createAxisLabels(axisBounds_PSEC, timezone, unit, format) {
    const times_PSEC = timeSeq_PSEC(unit, axisBounds_PSEC, 1, unit, timezone);
    const axisLabels = new Array();
    for (let i = 1; i < times_PSEC.length; i++) {
        const start_PSEC = times_PSEC[i - 1];
        const end_PSEC = times_PSEC[i];
        const visibleStart_PSEC = clamp(start_PSEC, end_PSEC, axisBounds_PSEC.min);
        const visibleEnd_PSEC = clamp(start_PSEC, end_PSEC, axisBounds_PSEC.max);
        const visibleCenter_PSEC = visibleStart_PSEC + 0.5 * (visibleEnd_PSEC - visibleStart_PSEC);
        axisLabels.push(new AxisLabel(axisBounds_PSEC.valueToFrac(visibleCenter_PSEC), format(psecToZonedTime(visibleCenter_PSEC, timezone)), axisBounds_PSEC.valueToFrac(visibleStart_PSEC), axisBounds_PSEC.valueToFrac(visibleEnd_PSEC)));
    }
    const axisDividers = new Array();
    for (const time_PSEC of times_PSEC) {
        const axisFrac = axisBounds_PSEC.valueToFrac(time_PSEC);
        if (0 <= axisFrac && axisFrac <= 1) {
            axisDividers.push(new AxisDivider(axisFrac));
        }
    }
    return new AxisLabelSet(axisLabels, axisDividers);
}
function getIntervalStartAtOrBefore(startUnit, t_PSEC, timezone) {
    const { year, month, day, hour, minute, second } = psecToZonedTime(t_PSEC, timezone);
    switch (startUnit) {
        case 'year':
        case 'years': return localTime(year, 1, 1, 0, 0, 0);
        case 'month':
        case 'months': return localTime(year, month, 1, 0, 0, 0);
        case 'day':
        case 'days': return localTime(year, month, day, 0, 0, 0);
        case 'hour':
        case 'hours': return localTime(year, month, day, hour, 0, 0);
        case 'minute':
        case 'minutes': return localTime(year, month, day, hour, minute, 0);
        case 'second':
        case 'seconds': return localTime(year, month, day, hour, minute, floor(second));
    }
}
function advanceLocalTime(t, stepCount, stepUnit) {
    const { year, month, day, hour, minute, second } = t;
    switch (stepUnit) {
        case 'year':
        case 'years': return localTime(year + stepCount, month, day, hour, minute, second);
        case 'month':
        case 'months': return localTime(year, month + stepCount, day, hour, minute, second);
        case 'day':
        case 'days': return localTime(year, month, day + stepCount, hour, minute, second);
        case 'hour':
        case 'hours': return localTime(year, month, day, hour + stepCount, minute, second);
        case 'minute':
        case 'minutes': return localTime(year, month, day, hour, minute + stepCount, second);
        case 'second':
        case 'seconds': return localTime(year, month, day, hour, minute, second + stepCount);
    }
}

function timeSeq_PSEC(startUnit, bounds_PSEC, stepCount, stepUnit, timezone) {
    const min_PSEC = (bounds_PSEC instanceof Array ? min(...bounds_PSEC) : min(bounds_PSEC.min, bounds_PSEC.max));
    const max_PSEC = (bounds_PSEC instanceof Array ? max(...bounds_PSEC) : max(bounds_PSEC.min, bounds_PSEC.max));
    
    const step = UNIT_DURATIONS[stepUnit];
    if (step.isExact) {
        const step_SEC = stepCount * step.seconds;
        const tFirst_PSEC = get$1(() => {
            const t = getIntervalStartAtOrBefore(startUnit, min_PSEC, timezone);
            const ts_PSEC = localTimeToPsec(t, timezone);
            if (ts_PSEC.length > 0) {
                return min(...ts_PSEC);
            }
            
            const t2 = advanceLocalTime(t, -2, 'hours');
            const ts2_PSEC = localTimeToPsec(t2, timezone);
            if (ts2_PSEC.length > 0) {
                return min(...ts2_PSEC);
            }
            console.warn(`Failed to get timezone-specific first tick time: start-unit = ${startUnit}, axis-min = ${psecToIso8601(min_PSEC, timezone)}, timezone = ${timezone}`);
            return (floor(min_PSEC / step_SEC) * step_SEC);
        });
        const tLast_PSEC = get$1(() => {
            const t = advanceLocalTime(getIntervalStartAtOrBefore(stepUnit, max_PSEC, timezone), stepCount, stepUnit);
            const ts_PSEC = localTimeToPsec(t, timezone);
            if (ts_PSEC.length > 0) {
                return max(...ts_PSEC);
            }
            
            const t2 = advanceLocalTime(t, +2, 'hours');
            const ts2_PSEC = localTimeToPsec(t2, timezone);
            if (ts2_PSEC.length > 0) {
                return max(...ts2_PSEC);
            }
            console.warn(`Failed to get timezone-specific last tick time: step-unit = ${stepUnit}, axis-max = ${psecToIso8601(max_PSEC, timezone)}, timezone = ${timezone}`);
            return (ceil(max_PSEC / step_SEC) * step_SEC);
        });
        const zoneOffsetChange_SEC = zoneOffsetAt_SEC(tLast_PSEC, timezone) - zoneOffsetAt_SEC(tFirst_PSEC, timezone);
        if (zoneOffsetChange_SEC % step_SEC === 0) {
            const times_PSEC = new Array();
            for (let t_PSEC = tFirst_PSEC; t_PSEC <= tLast_PSEC; t_PSEC += step_SEC) {
                times_PSEC.push(t_PSEC);
            }
            return times_PSEC;
        }
    }
    
    const tFirst = getIntervalStartAtOrBefore(startUnit, min_PSEC, timezone);
    const tLast = advanceLocalTime(getIntervalStartAtOrBefore(stepUnit, max_PSEC, timezone), 1, stepUnit);
    const times_PSEC = new Array();
    for (let t = tFirst; compareLocalTimes(t, tLast) <= 0; t = advanceLocalTime(t, stepCount, stepUnit)) {
        const ts_PSEC = localTimeToPsec(t, timezone);
        if (ts_PSEC.length === 0) ;
        else {
            
            
            times_PSEC.push(min(...ts_PSEC));
        }
    }
    return times_PSEC;
}
function toYear(t_PSEC, timezone) {
    return psecToZonedTime(t_PSEC, timezone).year;
}
function fromYear_PSEC(year, timezone) {
    
    
    for (let hour = 0; hour < 2; hour++) {
        const ts_PSEC = localTimeToPsec(localTime(year, 1, 1, hour, 0, 0), timezone);
        if (ts_PSEC.length > 0) {
            return min(...ts_PSEC);
        }
    }
    throw new Error();
}
const TO_SIBLING_SITES = (timeline, draggedKey) => {
    const origParentKey = timeline.requireRow(draggedKey).parentKey;
    return parentKey => {
        return (parentKey === origParentKey);
    };
};
function getRowVerticalViewport_PX(row) {
    return row.labelPane.getViewport_PX().y;
}
function updateExpandedCssClasses(row) {
    var _a;
    for (const pane of [row.labelPane, row.dataPane]) {
        switch ((_a = row.children) === null || _a === void 0 ? void 0 : _a.expanded) {
            case undefined:
                pane.removeCssClass('expanded');
                pane.removeCssClass('collapsed');
                break;
            case true:
                pane.addCssClass('expanded');
                pane.removeCssClass('collapsed');
                break;
            case false:
                pane.addCssClass('collapsed');
                pane.removeCssClass('expanded');
                break;
        }
    }
}
class HorizontalTimeline {
    constructor(timeAxis_PSEC, options) {
        var _a;
        this.peer = createDomPeer('horizontal-timeline', this, PeerType.CONTRAPTION);
        this.style = window.getComputedStyle(this.peer);
        this.nestIndent_LPX = StyleProp.create(this.style, '--nest-indent-px', cssFloat, 13);
        this.repaint = new ListenableBasic();
        this.timeAxis_PSEC = timeAxis_PSEC;
        this.timeAxis_PSEC.changes.addListener(IMMEDIATE, () => {
            this.repaint.fire();
        });
        this.dragSiteFilter = TO_SIBLING_SITES;
        this.rootRows = new LinkedMap();
        this.allRows = new Map();
        this.gridLayout = new GridLayout();
        this.gridLayout.visibleColumnKeys = new LinkedSet(['Label', 'Data']);
        
        this.gridLayout.topToBottom.override = true;
        this.gridLayout.prepFns.addLast(() => {
            function* walkTree(rows) {
                for (const row of rows.values()) {
                    if (getRowVerticalViewport_PX(row) !== undefined) {
                        yield row.key;
                        if (row.children && row.children.expanded) {
                            yield* walkTree(row.children.rows);
                        }
                    }
                }
            }
            this.gridLayout.visibleRowKeys = new LinkedSet(walkTree(this.rootRows));
        });
        this.gridLayout.prepFns.addLast(() => {
            const indent_LPX = this.nestIndent_LPX.get();
            for (const { row, nest } of this.getVisibleNestedRows()) {
                const inset_LPX = createInset(0, 0, 0, nest * indent_LPX);
                row.labelLayout.inset_LPX.override = inset_LPX;
            }
        });
        this.gridPane = new Pane(this.gridLayout);
        this.gridPane.addCssClass('timeline-content');
        this.dataUnderlayPane = new Pane(new ChildlessLayout());
        this.dataUnderlayPane.background.color.override = TRANSPARENT;
        this.dataUnderlayPane.border.color.override = TRANSPARENT;
        setGridCoords(this.dataUnderlayPane, 'VIEWPORT', 'Data');
        this.gridPane.addPane(this.dataUnderlayPane, -999);
        this.dragSitePainter = new HorizontalDragSitePainter();
        this.gridPane.addPainter(this.dragSitePainter, +888);
        this.scrollerLayout = new VerticalScrollerLayout();
        this.scrollerPane = new Pane(this.scrollerLayout);
        this.scrollerPane.addPane(this.gridPane);
        this.scrollbar = new VerticalScrollbar(this.scrollerLayout);
        this.scrollbar.attachToRepaint(this.repaint);
        const middlePane = new Pane(new ColumnsLayout());
        middlePane.addPane(this.scrollerPane);
        middlePane.addPane(this.scrollbar.pane);
        attachAxisViewportUpdater1D(this.dataUnderlayPane, this.timeAxis_PSEC, X);
        attachAxisInputHandlers1D(this.dataUnderlayPane, this.timeAxis_PSEC, X);
        const textAtlasCache = (_a = options === null || options === void 0 ? void 0 : options.textAtlasCache) !== null && _a !== void 0 ? _a : new TextAtlasCache();
        this.northAxisWidget = new EdgeAxisWidget(this.timeAxis_PSEC, NORTH, { createTicker: () => new TimeTicker(), textAtlasCache });
        this.southAxisWidget = new EdgeAxisWidget(this.timeAxis_PSEC, SOUTH, { createTicker: () => new TimeTicker(), textAtlasCache });
        this.northAxisWidget.pane.addCssClass('north-axis');
        this.southAxisWidget.pane.addCssClass('south-axis');
        this.pane = new Pane(new RowsLayout());
        appendChild(this.pane.peer, this.peer);
        this.pane.addCssClass('timeline');
        this.pane.addPane(this.southAxisWidget.pane);
        this.pane.addPane(middlePane);
        this.pane.addPane(this.northAxisWidget.pane);
    }
    attachToRepaint(repaint) {
        return linkListenables(this.repaint, repaint);
    }
    getRootRows() {
        return this.rootRows;
    }
    getAllRows() {
        return this.allRows;
    }
    getVisibleRows() {
        const result = new LinkedMap();
        for (const key of this.gridLayout.visibleRowKeys) {
            const row = this.getRow(key);
            if (row) {
                result.putLast(key, row);
            }
        }
        return result;
    }
    getVisibleNestedRows() {
        const timeline = this;
        function* walkTree(rows, nest) {
            for (const row of rows.values()) {
                if (timeline.gridLayout.visibleRowKeys.has(row.key)) {
                    yield { row, nest };
                    if (row.children && row.children.expanded) {
                        yield* walkTree(row.children.rows, nest + 1);
                    }
                }
            }
        }
        return walkTree(this.rootRows, 0);
    }
    getChildRows(key) {
        var _a, _b, _c;
        return (key === undefined ? this.rootRows : (_c = (_b = (_a = this.getRow(key)) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b.rows) !== null && _c !== void 0 ? _c : new LinkedMap());
    }
    requireMutableChildRows(key, initIfMissing) {
        if (key === undefined) {
            return this.rootRows;
        }
        else {
            const row = requireDefined(this.allRows.get(key));
            if (row.children === undefined && initIfMissing) {
                row.children = {
                    expanded: true,
                    rows: new LinkedMap(),
                };
                updateExpandedCssClasses(row);
            }
            return requireDefined(row.children).rows;
        }
    }
    hasRow(key) {
        return this.allRows.has(key);
    }
    getRow(key) {
        return this.allRows.get(key);
    }
    getRowNest(key) {
        return (key === undefined ? 0 : this.getRowNest(this.requireRow(key).parentKey) + 1);
    }
    requireRow(key) {
        return requireDefined(this.getRow(key));
    }
    isRowExpanded(key) {
        var _a;
        return (key === undefined || !!((_a = this.requireRow(key).children) === null || _a === void 0 ? void 0 : _a.expanded));
    }
    addRow(key) {
        if (this.hasRow(key)) {
            throw new Error('Timeline row already exists: key = ' + key);
        }
        const labelLayout = new InsetLayout();
        const labelPane = new Pane(labelLayout);
        labelPane.addCssClass('timeline-row-label');
        setGridCoords(labelPane, key, 'Label');
        attachParentOfClassesManager(labelPane);
        this.gridPane.addPane(labelPane);
        const dataLayout = new InsetLayout();
        const dataPane = new Pane(dataLayout);
        dataPane.addCssClass('timeline-row-data');
        setGridCoords(dataPane, key, 'Data');
        attachParentOfClassesManager(dataPane);
        this.gridPane.addPane(dataPane);
        const row = {
            key,
            labelLayout,
            labelPane,
            dataLayout,
            dataPane,
            parentKey: undefined,
        };
        this.allRows.set(key, row);
        this.rootRows.putLast(key, row);
        this.repaint.fire();
        return row;
    }
    removeRow(key) {
        const row = requireDefined(this.allRows.get(key));
        if (row.children) {
            for (const childKey of row.children.rows.keys()) {
                this.removeRow(childKey);
            }
        }
        this.gridPane.removePane(row.labelPane);
        this.gridPane.removePane(row.dataPane);
        this.requireMutableChildRows(row.parentKey, false).delete(key);
        this.allRows.delete(key);
        this.repaint.fire();
    }
    setRowParent(key, parentKey) {
        const row = requireDefined(this.allRows.get(key));
        if (parentKey !== row.parentKey) {
            this.requireMutableChildRows(row.parentKey, false).delete(key);
            row.parentKey = parentKey;
            this.requireMutableChildRows(row.parentKey, true).putLast(key, row, false);
            this.repaint.fire();
        }
    }
    moveRowBefore(key, parentKey, siblingKey) {
        this.setRowParent(key, parentKey);
        this.requireMutableChildRows(parentKey, false).moveBefore(key, siblingKey);
    }
    moveRowAfter(key, parentKey, siblingKey) {
        this.setRowParent(key, parentKey);
        this.requireMutableChildRows(parentKey, false).moveAfter(key, siblingKey);
    }
    setRowExpanded(key, expanded) {
        const row = requireDefined(this.allRows.get(key));
        if (row.children && expanded !== row.children.expanded) {
            row.children.expanded = expanded;
            updateExpandedCssClasses(row);
            this.repaint.fire();
        }
    }
    toggleRowExpanded(key) {
        const row = requireDefined(this.allRows.get(key));
        if (row.children) {
            row.children.expanded = !row.children.expanded;
            updateExpandedCssClasses(row);
            this.repaint.fire();
        }
    }
    *getRowDescendants(key) {
        if (key !== undefined) {
            yield key;
        }
        for (const childKey of this.getChildRows(key).keys()) {
            yield* this.getRowDescendants(childKey);
        }
    }
    getRowsInterval_PX(keys) {
        const viewports_PX = [...keys].filter(key => this.gridLayout.visibleRowKeys.has(key), this)
            .map(this.getRow, this)
            .filter(isDefined)
            .map(getRowVerticalViewport_PX);
        const min_PX = Math.min(...viewports_PX.map(v => v.min));
        const max_PX = Math.max(...viewports_PX.map(v => v.max));
        return (min_PX <= max_PX ? Interval1D.fromEdges(min_PX, max_PX) : undefined);
    }
    scrollToInterval(interval_PX) {
        let sectionMin_PX = interval_PX.min;
        let sectionMax_PX = interval_PX.max;
        if (sectionMin_PX <= sectionMax_PX) {
            const scrollerViewport_PX = this.scrollerPane.getViewport_PX().y;
            if (scrollerViewport_PX.min > sectionMin_PX) {
                const shift_PX = scrollerViewport_PX.min - sectionMin_PX;
                this.scrollerLayout.yOffset_PX += shift_PX;
                sectionMin_PX += shift_PX;
                sectionMax_PX += shift_PX;
                this.repaint.fire();
            }
            if (scrollerViewport_PX.max < sectionMax_PX) {
                const shift_PX = scrollerViewport_PX.max - sectionMax_PX;
                this.scrollerLayout.yOffset_PX += shift_PX;
                sectionMin_PX += shift_PX;
                sectionMax_PX += shift_PX;
                this.repaint.fire();
            }
        }
    }
    scrollToRows(keys) {
        const interval_PX = this.getRowsInterval_PX(keys);
        if (interval_PX) {
            this.scrollToInterval(interval_PX);
        }
    }
    createExpandCollapseInputHandler(key) {
        const timeline = this;
        const target = newImmutableList(['RowExpandCollapse', timeline, key]);
        const getMouseCursorClasses = frozenSupplier(['clickable']);
        return {
            getHoverHandler() {
                return {
                    target,
                    getMouseCursorClasses,
                };
            },
            getDragHandler() {
                return {
                    target,
                    getMouseCursorClasses,
                    handleGrab() {
                        timeline.toggleRowExpanded(key);
                        
                        if (timeline.isRowExpanded(key) && timeline.getChildRows(key).size > 0) {
                            
                            
                            timeline.pane._doLayout();
                            const section_PX = timeline.getRowsInterval_PX(timeline.getRowDescendants(key));
                            if (section_PX) {
                                
                                
                                
                                
                                const revealMin_PX = section_PX.min;
                                const revealMax_PX = Math.min(section_PX.max, timeline.gridPane.getScissor_PX().y.max);
                                timeline.scrollToInterval(Interval1D.fromEdges(revealMin_PX, revealMax_PX));
                            }
                        }
                    },
                };
            }
        };
    }
    createRowDragInputHandler(key) {
        
        
        
        const timeline = this;
        const target = newImmutableList(['RowDrag', timeline, key]);
        const getMouseCursorClasses = frozenSupplier(['draggable']);
        return {
            getHoverHandler() {
                return {
                    target,
                    getMouseCursorClasses,
                };
            },
            getDragHandler(evGrab) {
                if (evGrab.button === 0) {
                    const allowSite = timeline.dragSiteFilter(timeline, key);
                    return {
                        target,
                        getMouseCursorClasses,
                        handleDrag(evDrag) {
                            const site = timeline.findDragSite(key, evDrag, allowSite);
                            if (site) {
                                timeline.dragSitePainter.bar = {
                                    yCenter_PX: site.coord_PX,
                                    xIndent_PX: timeline.getRowNest(site.parentKey) * timeline.nestIndent_LPX.get() * currentDpr(timeline),
                                };
                                timeline.repaint.fire();
                            }
                        },
                        handleUngrab(evUngrab) {
                            const site = timeline.findDragSite(key, evUngrab, allowSite);
                            if (site) {
                                timeline.moveRowBefore(key, site.parentKey, site.keyBelow);
                                timeline.dragSitePainter.bar = null;
                                timeline.repaint.fire();
                            }
                        }
                    };
                }
                return null;
            },
        };
    }
    findDragSite(key, mouse, allowSite) {
        
        const descendants = new Set(this.getRowDescendants(key));
        const sites = [...this.getDragSites((parentKey, keyBelow) => {
                return ((parentKey === undefined || !descendants.has(parentKey)) && allowSite(parentKey, keyBelow));
            })];
        
        
        
        
        
        
        
        const mouse_PX = mouse.loc_PX.y;
        const siteIndexAbove = findIndexAtOrAfter(sites, site => site.coord_PX - mouse_PX);
        const siteAbove = sites[siteIndexAbove];
        const siteBelow = sites[siteIndexAbove - 1];
        if (siteAbove !== undefined && siteBelow !== undefined) {
            const missAbove_PX = Math.abs(siteAbove.coord_PX - mouse_PX);
            const missBelow_PX = Math.abs(siteBelow.coord_PX - mouse_PX);
            return (missBelow_PX <= missAbove_PX ? siteBelow : siteAbove);
        }
        else if (siteBelow !== undefined) {
            
            return siteBelow;
        }
        else if (siteAbove !== undefined) {
            
            return siteAbove;
        }
        else {
            
            return undefined;
        }
    }
    getDragSites(allowSite) {
        const timeline = this;
        function* walkTree(parentKey) {
            const rows = timeline.getChildRows(parentKey);
            
            const sectionViewport_PX = timeline.getRowsInterval_PX(timeline.getRowDescendants(parentKey));
            if (sectionViewport_PX && allowSite(parentKey, undefined)) {
                yield {
                    parentKey,
                    keyBelow: undefined,
                    coord_PX: sectionViewport_PX.min,
                };
            }
            
            for (const row of rows.valuesInReverse()) {
                
                if (row.children && row.children.expanded) {
                    yield* walkTree(row.key);
                }
                
                const rowViewport_PX = getRowVerticalViewport_PX(row);
                if (rowViewport_PX && allowSite(parentKey, row.key)) {
                    yield {
                        parentKey,
                        keyBelow: row.key,
                        coord_PX: rowViewport_PX.max,
                    };
                }
            }
        }
        return walkTree(undefined);
    }
}
function attachTimeCursor_PSEC(timeline, timeCursor_PSEC) {
    const disposers = new DisposerGroup();
    const { timeAxis_PSEC, pane, repaint } = timeline;
    const cursorPainter = new CursorPainter(timeAxis_PSEC, X);
    disposers.add(pane.addPainter(cursorPainter, +999));
    disposers.add(timeCursor_PSEC.addListener(IMMEDIATE, () => {
        var _a;
        cursorPainter.coord = (_a = timeCursor_PSEC.v) !== null && _a !== void 0 ? _a : undefined;
        repaint.fire();
    }));
    const cursorHoveredRef = new RefBasic(false, tripleEquals);
    const cursorInputHandler = createAxisCursorInputHandler1D(timeAxis_PSEC, X, timeCursor_PSEC, cursorHoveredRef);
    disposers.add(pane.addInputHandler(cursorInputHandler, +999));
    disposers.add(cursorHoveredRef.addListener(IMMEDIATE, () => {
        cursorPainter.hovered = cursorHoveredRef.v;
        timeline.repaint.fire();
    }));
    return disposers;
}
function attachParentOfClassesManager(pane) {
    let oldClasses = new Set();
    const updateClasses = children => {
        const newClasses = new Set();
        for (const child of children) {
            for (const cssClass of child.peer.classList) {
                newClasses.add(`parent-of--${cssClass}`);
            }
        }
        for (const oldClass of oldClasses) {
            if (!newClasses.has(oldClass)) {
                pane.removeCssClass(oldClass);
            }
        }
        for (const newClass of newClasses) {
            if (!oldClasses.has(newClass)) {
                pane.addCssClass(newClass);
            }
        }
        oldClasses = newClasses;
    };
    pane.layout.prepFns.addFirst(updateClasses);
    return () => {
        pane.layout.prepFns.delete(updateClasses);
    };
}
class HorizontalDragSitePainter {
    constructor() {
        this.peer = createDomPeer('drag-site-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, 'rgb(255,0,0)');
        this.width_LPX = StyleProp.create(this.style, '--width-px', cssFloat, 3);
        this.visible = new RefBasic(true, tripleEquals);
        this.bar = null;
        this.fillPainter = new FillPainter();
        this.fillPainter.color.getOverride = () => this.color.get();
    }
    paint(context, viewport_PX) {
        if (this.bar !== null) {
            const gl = context.gl;
            try {
                const width_LPX = this.width_LPX.get();
                const width_PX = width_LPX * currentDpr(this);
                const fillViewport_PX = Interval2D.fromEdges(viewport_PX.xMin + Math.round(this.bar.xIndent_PX), viewport_PX.xMax, Math.round(this.bar.yCenter_PX - 0.5 * width_PX), Math.round(this.bar.yCenter_PX + 0.5 * width_PX));
                glViewport(gl, fillViewport_PX);
                this.fillPainter.paint(context, fillViewport_PX);
            }
            finally {
                glViewport(gl, viewport_PX);
            }
        }
    }
    dispose(context) {
        this.fillPainter.dispose(context);
    }
}

const cssUrl = new URL("assets/@metsci/gleam-timeline/cbfdf227-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink = createCssLink(cssUrl);
function createGleamTimelineDefaultStyle() {
    return cssLink.cloneNode(true);
}
appendCssLink(document.head, createGleamTimelineDefaultStyle());

function createLinePlotRowPane(timeAxis_PSEC, repaint, textAtlasCache) {
    const yAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-0.6, +0.6));
    yAxis.changes.addListener(() => {
        repaint.fire();
    });
    yAxis.minConstraint = Interval1D.fromEdges(-12, Number.POSITIVE_INFINITY);
    yAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +12);
    yAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    yAxis.reconstrain(false);
    const firstTime_PSEC = utcTimeToPsec(2021, 1, 1, 6, 0, 0);
    const linePainter = new BasicLinePainter(axisBoundsFn(new Axis2D(timeAxis_PSEC, yAxis)));
    linePainter.line = {
        length: 1000,
        x: i => firstTime_PSEC + (3 * 60 * i),
        y: i => 0.45 * Math.sin(Math.PI * 1e-2 * i),
    };
    const linePane = new Pane();
    linePane.addPainter(linePainter);
    const plotLayout = new GridLayout();
    plotLayout.visibleColumnKeys = new LinkedSet(['AxisY']);
    const plotPane = new Pane(plotLayout);
    plotPane.addCssClass('line-plot');
    const yAxisWidget = new EdgeAxisWidget(yAxis, EAST, { textAtlasCache });
    yAxisWidget.attachAxisViewportUpdater(yAxisWidget.pane);
    setGridCoords(yAxisWidget.pane, 'VIEWPORT', 'AxisY');
    setGridCoords(linePane, 'VIEWPORT', 'VIEWPORT');
    plotPane.addPane(linePane);
    plotPane.addPane(yAxisWidget.pane);
    return plotPane;
}
function createScatterPlotRowPane(timeAxis_PSEC, repaint, textAtlasCache) {
    const yAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-0.25, +1.05));
    yAxis.minConstraint = Interval1D.fromEdges(-12, Number.POSITIVE_INFINITY);
    yAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +12);
    yAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    yAxis.reconstrain(false);
    const tyBoundsFn = axisBoundsFn(new Axis2D(timeAxis_PSEC, yAxis));
    const cAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-1.75, +1.35));
    const cTags = new TagMap({ min: -1.6, max: +1.2 });
    cTags.setConstraint(createMinMaxConstraint(-100, +100));
    cAxis.minConstraint = Interval1D.fromEdges(-104, Number.POSITIVE_INFINITY);
    cAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +104);
    cAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    cAxis.reconstrain(false);
    const cTagBoundsFn = tagBoundsFn(cTags, 'min', 'max');
    const sAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-0.055, +1.055));
    const sTags = new TagMap({ min: 0, max: 1 });
    sTags.setConstraint(createStdTagConstraint(0, 100, ['min', 'max']));
    sAxis.minConstraint = Interval1D.fromEdges(-2, Number.POSITIVE_INFINITY);
    sAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +102);
    sAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    const sTagBoundsFn = tagBoundsFn(sTags, 'min', 'max');
    const changes = activityListenable(yAxis, cAxis, sAxis, cTags, sTags);
    changes.addListener(IMMEDIATE, () => {
        repaint.fire();
    });
    const refTime_PSEC = utcTimeToPsec(2021, 1, 1, 6, 0, 0);
    const pointCount = 10000;
    const pointCoords = new Float32Array(4 * pointCount);
    for (let i = 0; i < pointCount; i++) {
        const r = Math.random();
        const isBig = (10 * Math.random() < -0.3 * Math.log(r));
        const x = Math.random() * 4 * Math.PI;
        const t = 4 * 3600 + 3 * 3600 * x;
        const y = 0.7 + 0.25 * (Math.sin(x) + 0.3 * Math.log(r));
        const c = (isBig ? -1.2 : -1.0) * (Math.cos(x - 0.33) + 0.3 * (-1 + 2 * r)) + Math.random() - 0.5;
        const s = Math.sqrt((isBig ? 1 : 0.2) * Math.sqrt(0.5 + 0.5 * Math.sin(3 * c)));
        pointCoords[4 * i + 0] = refTime_PSEC + t;
        pointCoords[4 * i + 1] = y;
        pointCoords[4 * i + 2] = c;
        pointCoords[4 * i + 3] = s;
    }
    const scatterPainter = new ScatterPainter(tyBoundsFn, cTagBoundsFn, sTagBoundsFn);
    scatterPainter.setXycsCoords(pointCoords);
    const scatterPane = new Pane();
    scatterPane.addPainter(scatterPainter);
    const yAxisWidget = new EdgeAxisWidget(yAxis, EAST, { textAtlasCache });
    yAxisWidget.attachAxisViewportUpdater(yAxisWidget.pane);
    setGridCoords(yAxisWidget.pane, 'VIEWPORT', 'AxisY');
    const spacerPane = new Pane();
    setGridCoords(spacerPane, 'VIEWPORT', 'Spacer');
    const cGradientPainter = new GradientPainter(Y, axisBoundsFn(cAxis), cTagBoundsFn);
    const cAxisWidget = new BarAxisWidget(cAxis, WEST, {
        createTicker: () => new LinearTicker(),
        textAtlasCache,
        tags: cTags,
        barPainters: [cGradientPainter],
    });
    cAxisWidget.attachAxisViewportUpdater(cAxisWidget.pane);
    setGridCoords(cAxisWidget.pane, 'VIEWPORT', 'AxisC');
    const sSolidPainter = new SolidPainter(Y, axisBoundsFn(sAxis), sTagBoundsFn);
    const sAxisWidget = new BarAxisWidget(sAxis, WEST, {
        createTicker: () => new LinearTicker(),
        textAtlasCache,
        tags: sTags,
        barPainters: [sSolidPainter],
    });
    sAxisWidget.attachAxisViewportUpdater(sAxisWidget.pane);
    setGridCoords(sAxisWidget.pane, 'VIEWPORT', 'AxisS');
    const plotLayout = new GridLayout();
    plotLayout.visibleColumnKeys = new LinkedSet(['AxisY', 'Spacer', 'AxisC', 'AxisS']);
    const plotPane = new Pane(plotLayout);
    plotPane.addCssClass('scatter-plot');
    setGridCoords(scatterPane, 'VIEWPORT', 'VIEWPORT');
    plotPane.addPane(scatterPane);
    plotPane.addPane(yAxisWidget.pane);
    plotPane.addPane(spacerPane, Number.NEGATIVE_INFINITY);
    plotPane.addPane(cAxisWidget.pane);
    plotPane.addPane(sAxisWidget.pane);
    return plotPane;
}
function createHeatmapPlotRowPane(timeAxis_PSEC, repaint, textAtlasCache) {
    const yAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-11, +11));
    yAxis.minConstraint = Interval1D.fromEdges(-99, Number.POSITIVE_INFINITY);
    yAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +99);
    yAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    yAxis.reconstrain(false);
    const tyBoundsFn = axisBoundsFn(new Axis2D(timeAxis_PSEC, yAxis));
    const cAxis = createCommonBoundsAxis1D(Interval1D.fromEdges(-4, +54));
    const cTags = new TagMap({ min: 0, max: 50 });
    cTags.setConstraint(createMinMaxConstraint(-100, +100));
    cAxis.minConstraint = Interval1D.fromEdges(-104, Number.POSITIVE_INFINITY);
    cAxis.maxConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, +104);
    cAxis.scaleConstraint = Interval1D.fromEdges(Number.NEGATIVE_INFINITY, 3e3);
    cAxis.reconstrain(false);
    const cTagBoundsFn = tagBoundsFn(cTags, 'min', 'max');
    const changes = activityListenable(yAxis, cAxis, cTags);
    changes.addListener(IMMEDIATE, () => {
        repaint.fire();
    });
    const refTime_PSEC = utcTimeToPsec(2021, 1, 1, 6, 0, 0);
    const pointCount = 10000;
    const pointCoords = new Float32Array(4 * pointCount);
    for (let i = 0; i < pointCount; i++) {
        const r = Math.random();
        const isBig = (10 * Math.random() < -0.3 * Math.log(r));
        const x = Math.random() * 4 * Math.PI;
        const t = 4 * 3600 + 3 * 3600 * x;
        const y = 0.7 + 0.25 * (Math.sin(x) + 0.3 * Math.log(r));
        const c = (isBig ? -1.2 : -1.0) * (Math.cos(x - 0.33) + 0.3 * (-1 + 2 * r)) + Math.random() - 0.5;
        const s = Math.sqrt((isBig ? 1 : 0.2) * Math.sqrt(0.5 + 0.5 * Math.sin(3 * c)));
        pointCoords[4 * i + 0] = refTime_PSEC + t;
        pointCoords[4 * i + 1] = y;
        pointCoords[4 * i + 2] = c;
        pointCoords[4 * i + 3] = s;
    }
    const heatmapPainter = new HeatmapPainter(tyBoundsFn, cTagBoundsFn);
    heatmapPainter.setMesh(new AxisAlignedLinearMesh({
        xMin: refTime_PSEC,
        xMax: refTime_PSEC + 2 * SECONDS_PER_DAY,
        yMin: -10,
        yMax: +10,
    }));
    heatmapPainter.setSurface(get$1(() => {
        const ni = 250;
        const nj = 250;
        const values = new Float32Array(ni * nj);
        for (let j = 0; j < nj; j++) {
            for (let i = 0; i < ni; i++) {
                values[j * ni + i] = 1e-3 * (i * j) + 10 * (Math.random() - 0.5);
            }
        }
        return new Float32ArraySurface(ni, nj, values);
    }));
    const heatmapPane = new Pane();
    heatmapPane.addPainter(heatmapPainter);
    const yAxisWidget = new EdgeAxisWidget(yAxis, EAST, { textAtlasCache });
    yAxisWidget.attachAxisViewportUpdater(yAxisWidget.pane);
    setGridCoords(yAxisWidget.pane, 'VIEWPORT', 'AxisY');
    const spacerPane = new Pane();
    setGridCoords(spacerPane, 'VIEWPORT', 'Spacer');
    const cGradientPainter = new GradientPainter(Y, axisBoundsFn(cAxis), cTagBoundsFn);
    const cAxisWidget = new BarAxisWidget(cAxis, WEST, {
        createTicker: () => new LinearTicker(),
        textAtlasCache,
        tags: cTags,
        barPainters: [cGradientPainter],
    });
    cAxisWidget.attachAxisViewportUpdater(cAxisWidget.pane);
    setGridCoords(cAxisWidget.pane, 'VIEWPORT', 'AxisC');
    const plotLayout = new GridLayout();
    plotLayout.visibleColumnKeys = new LinkedSet(['AxisY', 'Spacer', 'AxisC']);
    const plotPane = new Pane(plotLayout);
    plotPane.addCssClass('heatmap-plot');
    setGridCoords(heatmapPane, 'VIEWPORT', 'VIEWPORT');
    plotPane.addPane(heatmapPane);
    plotPane.addPane(yAxisWidget.pane);
    plotPane.addPane(spacerPane, Number.NEGATIVE_INFINITY);
    plotPane.addPane(cAxisWidget.pane);
    return plotPane;
}

const mainCssUrl = new URL("assets/@metsci/gleam-example-timeline/0a48ca4a-main.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
run(async () => {
    const stylesLoading = Promise.all([
        gleamCoreDefaultStyleLoading,
        addCssLink(mainCssUrl),
    ]);
    const repaint = new ListenableBasic();
    const textAtlasCache = new TextAtlasCache();
    const timeAxis_PSEC = createCommonBoundsAxis1D(Interval1D.fromRect(utcTimeToPsec(2021, 1, 1, 1, 30, 0), 65 * SECONDS_PER_HOUR));
    timeAxis_PSEC.scaleConstraint = Interval1D.fromEdges(3e-7, 3e3);
    timeAxis_PSEC.reconstrain(false);
    const timeline = new HorizontalTimeline(timeAxis_PSEC, { textAtlasCache });
    timeline.attachToRepaint(repaint);
    const timeCursor_PSEC = new RefBasic(0, tripleEquals);
    timeCursor_PSEC.set(false, timeAxis_PSEC.bounds.fracToValue(0.3));
    attachTimeCursor_PSEC(timeline, timeCursor_PSEC);
    const timeGridPainter = () => {
        return new GridPainter(timeAxis_PSEC, null, timeline.northAxisWidget.painter.ticker, null);
    };
    const [hoverRef, focusRef] = createHoverAndFocusRefs(timeline.pane);
    attachEventClassUpdaters(hoverRef, focusRef);
    const eventsRow = get$1(() => {
        const row = new EventsRow(timeAxis_PSEC, STANDARD_PATTERN_GENS);
        row.attachToRepaint(repaint);
        const refTime_PSEC = utcTimeToPsec(2021, 1, 1, 6, 0, 0);
        const eventSpan_SEC = 5 * 3600;
        for (let i = 0; i < 100; i++) {
            const label = `Event ${i.toFixed(0)}`;
            const start_PSEC = refTime_PSEC + 0.03 * (i % 10) * eventSpan_SEC + 1.1 * Math.floor(0.1 * i) * eventSpan_SEC;
            const era_PSEC = Interval1D.fromRect(start_PSEC, eventSpan_SEC);
            const event = new EventImpl(label, era_PSEC, { allowsUserDrag: true });
            if (i % 7 === 0) {
                event.addClass(false, 'alert');
            }
            row.events.addEvent(event);
        }
        return row;
    });
    eventsRow.pane.inputSpectators.add({
        handleKeyPress(target, evPress) {
            const event = target === null || target === void 0 ? void 0 : target.event;
            if (!evPress.keysDown.has('Control') && isWritableEvent(event)) {
                switch (evPress.key) {
                    case 'a':
                    case 'A':
                        {
                            event.toggleClass(false, 'alert');
                        }
                        break;
                    case 'Delete':
                        {
                            if (eventsRow.events.has(event)) {
                                eventsRow.events.removeEvent(event);
                            }
                        }
                        break;
                }
            }
        },
    });
    const linePlotPane = createLinePlotRowPane(timeAxis_PSEC, repaint, textAtlasCache);
    const scatterPlotPane = createScatterPlotRowPane(timeAxis_PSEC, repaint, textAtlasCache);
    const heatmapPlotPane = createHeatmapPlotRowPane(timeAxis_PSEC, repaint, textAtlasCache);
    addRow(timeline, 'A', 'Row A', [timeGridPainter], [eventsRow.pane]);
    addRow(timeline, 'B', 'Row B', [timeGridPainter], []);
    addRow(timeline, 'B0', 'Row B0', [timeGridPainter], [], 'B');
    addRow(timeline, 'B1', 'Row B1', [timeGridPainter], [], 'B');
    addRow(timeline, 'B2', 'Row B2', [timeGridPainter], [], 'B');
    addRow(timeline, 'C', 'Row C', [timeGridPainter], [linePlotPane]);
    addRow(timeline, 'D', 'Row D', [timeGridPainter], []);
    addRow(timeline, 'D0', 'Row D0', [timeGridPainter], [heatmapPlotPane], 'D');
    addRow(timeline, 'D1', 'Row D1', [timeGridPainter], [], 'D');
    addRow(timeline, 'D1a', 'Row D1a', [timeGridPainter], [], 'D1');
    addRow(timeline, 'D1b', 'Row D1b', [timeGridPainter], [], 'D1');
    addRow(timeline, 'E', 'Row E', [timeGridPainter], [scatterPlotPane]);
    addRow(timeline, 'F', 'Row F', [timeGridPainter], []);
    addRow(timeline, 'G', 'Row G', [timeGridPainter], []);
    addRow(timeline, 'H', 'Row H', [timeGridPainter], []);
    addRow(timeline, 'I', 'Row I', [timeGridPainter], []);
    addRow(timeline, 'J', 'Row J', [timeGridPainter], []);
    addRow(timeline, 'K', 'Row K', [timeGridPainter], []);
    await stylesLoading;
    const host = requireNonNull(document.getElementById('host'));
    attachPane(host, timeline.pane, repaint);
});

}));
//# sourceMappingURL=main.js.map

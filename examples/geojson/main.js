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

function isNumber(x) {
    return (typeof (x) === 'number' && !Number.isNaN(x));
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
function getNow_PMILLIS() {
    return (new Date()).getTime();
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

const { round: round$1$1 } = Math;
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
                    console.log(`CSS load completed after ${round$1$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href);
                }
                return true;
            }
            else {
                pollsSoFar++;
                if (pollsSoFar === pollsBeforeWarning) {
                    console.warn(`Still waiting for CSS to load after ${round$1$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href);
                }
                return false;
            }
        }
        catch (e) {
            pollsSoFar++;
            if (pollsSoFar === pollsBeforeWarning) {
                console.warn(`Still waiting for CSS to load after ${round$1$1(1e-3 * millisBetweenPolls * pollsSoFar)} seconds:`, cssLink.href, '\n ', e);
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

const { floor: floor$1$2, round: round$2 } = Math;

function wrapNear(value, ref, wrapSpan) {
    return (ref + wrapDelta(value - ref, wrapSpan));
}

function wrapDelta(delta, wrapSpan) {
    const wrapCount = round$2(delta / wrapSpan);
    return (delta - (wrapCount * wrapSpan));
}

const { asin, atan2, cos: cos$1, PI: PI$1$2, sign: sign$1, sin: sin$1, sqrt } = Math;
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

const { acos: acos$1, atan, cos, log, exp, PI: PI$3, sin: sin$2 } = Math;
const { NEGATIVE_INFINITY: NEGATIVE_INFINITY$1, POSITIVE_INFINITY: POSITIVE_INFINITY$1 } = Number;
const WGS84_EQUATORIAL_RADIUS_METERS = 6378137.0;
const WGS84_EQUATORIAL_CIRCUMFERENCE_METERS = 2 * Math.PI * WGS84_EQUATORIAL_RADIUS_METERS;
const HALF_PI = 0.5 * PI$3;
const DEG_TO_RAD = PI$3 / 180.0;
const RAD_TO_DEG = 180.0 / PI$3;
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
        this.xSpan = 2 * PI$3 * this.radToX;
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
    
    constructor(originLon_RAD = 0.0, yCutoff = PI$3) {
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
        this.xSpan = 2 * PI$3;
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
        return log((sin$2(lat_RAD) + 1.0) / cos(lat_RAD));
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
const SPHERICAL_GREAT_CIRCLE_INTERPOLATOR = Object.freeze({
    desc: {
        type: 'SphericalGreatCircle',
    },
    getInterpFn: (A, B) => {
        const xyzA = toUnitSphereXyz(A.lat_RAD, A.lon_RAD);
        const xyzB = toUnitSphereXyz(B.lat_RAD, B.lon_RAD);
        const distAB_RAD = acos$1(clamp(-1, +1, dot3(xyzA, xyzB)));
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
            const sinD = sin$2(dist_RAD);
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
const SPHERICAL_RHUMB_LINE_INTERPOLATOR = Object.freeze({
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

function* splitString(s, isEscape, isDelim, quotePairs) {
    function getMatchingCloseQuote(possibleOpenQuote) {
        for (const quotePair of quotePairs) {
            if (quotePair.isOpen(possibleOpenQuote)) {
                return quotePair.isClose;
            }
        }
        return undefined;
    }
    let token = '';
    let escaped = false;
    let isCloseQuote = undefined;
    for (const c of s) {
        if (escaped) {
            token += c;
            escaped = false;
        }
        else if (isEscape(c)) {
            escaped = true;
        }
        else if (isCloseQuote === undefined) {
            isCloseQuote = getMatchingCloseQuote(c);
            if (isCloseQuote !== undefined) {
                
                token += c;
            }
            else if (isDelim(c)) {
                
                yield token;
                token = '';
            }
            else {
                
                token += c;
            }
        }
        else if (!isCloseQuote(c)) {
            
            token += c;
        }
        else {
            
            token += c;
            isCloseQuote = undefined;
        }
    }
    yield token;
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

var _a;
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

function createWorkerPool(workerCount, createWorker) {
    if (workerCount <= 0) {
        throw new Error(`WorkerPool size is non-positive: size = ${workerCount}`);
    }
    const workerPool = new Map();
    for (let i = 0; i < workerCount; i++) {
        const worker = Object.assign(createWorker(i), { termination: new ListenableBasic() });
        workerPool.set(worker, Promise.resolve(worker));
    }
    return workerPool;
}
const NEXT_JOB_KEY_SYMBOL = Symbol('@@__GLEAM_NEXT_JOB_KEY__@@');
async function submitToWorkerPool(workerPool, startJob) {
    var _a;
    if (workerPool.size === 0) {
        throw new Error('WorkerPool startJob() fn contains a call to submitToWorkerPool()');
    }
    
    const worker = await Promise.race(workerPool.values());
    
    const jobKeyHolder = workerPool;
    const jobKey = (_a = jobKeyHolder[NEXT_JOB_KEY_SYMBOL]) !== null && _a !== void 0 ? _a : 0;
    jobKeyHolder[NEXT_JOB_KEY_SYMBOL] = jobKey + 1;
    
    const workersTemp = new Map(workerPool);
    workerPool.clear();
    
    const jobResultPromise = get$1(() => {
        try {
            return startJob(worker, jobKey);
        }
        catch (e) {
            return Promise.reject(e);
        }
    });
    
    const freeWorkerPromise = jobResultPromise.then(() => worker).catch(() => worker);
    workersTemp.set(worker, freeWorkerPromise);
    
    workersTemp.forEach((v, k) => workerPool.set(k, v));
    
    return jobResultPromise;
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

const cssUrl$2 = new URL("assets/@metsci/gleam-core/69436c73-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink$2 = createCssLink(cssUrl$2);
function createGleamCoreDefaultStyle() {
    return cssLink$2.cloneNode(true);
}
const defaultStyle$1 = appendCssLink(document.head, createGleamCoreDefaultStyle());
const gleamCoreDefaultStyleLoading = defaultStyle$1.loading;

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
rgba(1, 1, 1, 0);
const BLACK = rgb(0, 0, 0);
rgb(1, 1, 1);
const GRAY = rgb(0.5, 0.5, 0.5);
const RED = rgb(1, 0, 0);
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
function put2f(array, i, a, b) {
    array[i++] = a;
    array[i++] = b;
    return i;
}
function put4f(array, i, a, b, c, d) {
    array[i++] = a;
    array[i++] = b;
    array[i++] = c;
    array[i++] = d;
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
Object.freeze(createInset(0));

function glGetUniformLocation(gl, program, name) {
    return (program ? gl.getUniformLocation(program, name) : null);
}
function glGetAttribLocation(gl, program, name) {
    return (program ? gl.getAttribLocation(program, name) : -1);
}
function glUniformRgba(gl, location, color) {
    gl.uniform4f(location, color.r, color.g, color.b, color.a);
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
new CssParser('<string>', s => s.toLowerCase());
new CssParser('<string>', s => s.toUpperCase());
new CssParser('<integer>', parseInt);
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
new CssParser('omni | vertical horizontal | top horizontal bottom | top right bottom left', s => {
    const numbers = new Array();
    for (const token of s.trim().split(/\s+/, 4)) {
        numbers.push(numberOr(parseFloat(token), 0));
    }
    return createInset(numbers[0], numbers[1], numbers[2], numbers[3]);
});
const STD_ESCAPES = Object.freeze(basicEscapes('\\'));
const STD_DELIMS = Object.freeze(basicDelims(','));
const STD_QUOTES = Object.freeze([
    basicQuotePair('"', '"'),
    basicQuotePair("'", "'"),
    basicQuotePair("`", "`"),
    basicQuotePair('(', ')'),
    basicQuotePair('[', ']'),
    basicQuotePair('{', '}'),
]);
function cssArray(itemParser, delims, quotes, escapes) {
    return new CssParser(`list of ${itemParser.descriptionOfValidValues}`, s => {
        return [...parseIterable(s, itemParser, delims, quotes, escapes)];
    });
}
function* parseIterable(s, itemParser, delims, quotes, escapes) {
    for (const sItem of splitString(s, escapes !== null && escapes !== void 0 ? escapes : STD_ESCAPES, delims !== null && delims !== void 0 ? delims : STD_DELIMS, quotes !== null && quotes !== void 0 ? quotes : STD_QUOTES)) {
        const item = itemParser.parse(sItem.trim());
        if (item === UNPARSEABLE) {
            throw new Error();
        }
        else {
            yield item;
        }
    }
}

const canvas$1 = document.createElement('canvas');
canvas$1.width = 1;
canvas$1.height = 1;
requireNonNull(canvas$1.getContext('2d', { willReadFrequently: true }));

const { abs: abs$2, pow: pow$1, round: round$1 } = Math;

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
            const inset_PX = round$1(getInset_LPX() * dpr);
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

function attachAxisViewportUpdater2D(centerPane, axis) {
    const disposers = new DisposerGroup();
    doTxn(() => {
        disposers.add(attachAxisViewportUpdater1D(centerPane, axis.x, X));
        disposers.add(attachAxisViewportUpdater1D(centerPane, axis.y, Y));
    });
    return disposers;
}
function attachAxisInputHandlers2D(mousePane, arg0, arg1) {
    const axis = xyAxisArg(arg0, arg1);
    return mousePane.addInputHandler(createAxisZoomerAndPanner2D(axis));
}
function xyAxisArg(arg0, arg1) {
    if (arg1 === undefined) {
        return arg0;
    }
    else {
        const x = arg0;
        const y = arg1;
        return new Axis2D(x, y);
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

const { floor: floor$1$1 } = Math;
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

function bufferDataI16(gl, target, data, componentsPerUnit, usage = GL.STATIC_DRAW) {
    return doBufferData(gl, target, data, GL.SHORT, componentsPerUnit, usage);
}

function bufferDataF32(gl, target, data, componentsPerUnit, usage = GL.STATIC_DRAW) {
    return doBufferData(gl, target, data, GL.FLOAT, componentsPerUnit, usage);
}
function doBufferData(gl, target, data, componentType, componentsPerUnit, usage) {
    gl.bufferData(target, data, usage);
    return { componentType, componentsPerUnit, unitCount: floor$1$1(data.length / componentsPerUnit) };
}

function vertexAttribPointer(gl, attrib, buffer, normalized = false, stride_BYTES = 0, offset_BYTES = 0) {
    gl.bindBuffer(GL.ARRAY_BUFFER, buffer.buffer);
    gl.vertexAttribPointer(attrib, buffer.meta.componentsPerUnit, buffer.meta.componentType, normalized, stride_BYTES, offset_BYTES);
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
const { max: max$1$1, min: min$3 } = Math;
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
            const numToDispose = max$1$1(min$3(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
            const numToDispose = max$1$1(min$3(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
            const numToDispose = max$1$1(min$3(disposeLimit, entriesToDispose.length), entriesToDispose.length - deferLimit);
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
new TickSet([], [], () => '', () => EMPTY_AXISLABELSET);
const validSpanMin = nextUpFloat64(1.0 / Number.MAX_VALUE);
Object.freeze(Interval1D.fromEdges(validSpanMin, 1.0 / validSpanMin));
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

function createCommonScaleAxis1D(tieFrac = 0.5, tieCoord = 0.0, scale = 250) {
    return new Axis1D(new CommonScaleAxisGroup1D(tieFrac, tieCoord, scale));
}
function createCommonScaleAxis2D(tieFrac = [0.5, 0.5], tieCoord = [0.0, 0.0], scale = [250, 250]) {
    return new Axis2D(createCommonScaleAxis1D(x(tieFrac), x(tieCoord), x(scale)), createCommonScaleAxis1D(y(tieFrac), y(tieCoord), y(scale)));
}
function lockScaleRatio(arg0, arg1, arg2) {
    let axisA;
    let axisB;
    let ratio;
    if (arg2 === undefined) {
        axisA = arg0.x;
        axisB = arg0.y;
        ratio = arg1;
    }
    else {
        axisA = arg0;
        axisB = arg1;
        ratio = arg2;
    }
    const groupA = axisA.getGroup();
    const groupB = axisB.getGroup();
    if (isfn(groupA.setScaleRatioLock) && isfn(groupB.setScaleRatioLock)) {
        groupA.setScaleRatioLock(groupB, ratio);
    }
    else {
        throw new Error('Axes belong to groups that do not support scale-ratio locking');
    }
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
Object.freeze({
    topToBottom: { get() { return true; } },
    gapBetweenRows_LPX: { get() { return 0; } },
    rowHeight: { get() { return 'flex(0,pref)'; } },
    visibleRowKeys: newImmutableSet([]),
});
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

Object.freeze({
    vertShader_GLSL: markVertShader_GLSL,
    fragShader_GLSL: markFragShader_GLSL,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});
Object.freeze({
    vertShader_GLSL: textVertShader_GLSL,
    fragShader_GLSL: textFragShader_GLSL,
    uniformNames: ['ATLAS', 'RGBA'],
    attribNames: ['inCoords', 'inColor'],
});

var fragShader_GLSL$7 = "#version 100\nprecision lowp float;\n\nuniform lowp sampler2D IMAGE;\nuniform vec4 RGBA;\n\nvarying vec2 vSt_FRAC;\n\nvoid main( ) {\n    float mask = texture2D( IMAGE, vSt_FRAC ).r;\n    float alpha = mask * RGBA.a;\n    gl_FragColor = vec4( alpha*RGBA.rgb, alpha );\n}\n";

var vertShader_GLSL$7 = "#version 100\n\n\nconst int NORTH = 0;\nconst int SOUTH = 1;\nconst int EAST = 2;\nconst int WEST = 3;\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat xMin( vec4 interval2D ) {\n    return interval2D.x;\n}\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform int EDGE;\n\nuniform vec2 AXIS_LIMITS;\nuniform vec2 AXIS_VIEWPORT_PX;\n\nuniform lowp sampler2D IMAGE;\nuniform vec2 IMAGE_SIZE_PX;\nuniform vec2 IMAGE_ANCHOR_PX;\n\n\n/**\n * Coords: tagCoord_AXIS, s_FRAC, t_FRAC\n */\nattribute vec3 inCoords;\n\n\nvarying vec2 vSt_FRAC;\n\n\nvoid main( ) {\n    float coord_ACOORD = inCoords.x;\n    float coord_AFRAC = ( coord_ACOORD - min1D( AXIS_LIMITS ) ) / span1D( AXIS_LIMITS );\n    float coord_APX = coord_AFRAC * span1D( AXIS_VIEWPORT_PX );\n\n    vec2 st_IFRAC = inCoords.yz;\n    vec2 tip_APX = vec2( 0.0, coord_APX );\n    vec2 corner_APX = floor( ( tip_APX - IMAGE_ANCHOR_PX ) + 0.5 );\n    vec2 xy_APX = corner_APX + ( st_IFRAC * vec2( IMAGE_SIZE_PX ) );\n\n    float x_VPX;\n    float y_VPX;\n    if ( EDGE == NORTH ) {\n        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;\n        y_VPX = xy_APX.x;\n    }\n    else if ( EDGE == SOUTH ) {\n        x_VPX = min1D( AXIS_VIEWPORT_PX ) - xMin( VIEWPORT_PX ) + xy_APX.y;\n        y_VPX = ySpan( VIEWPORT_PX ) - xy_APX.x;\n    }\n    else if ( EDGE == EAST ) {\n        x_VPX = xy_APX.x;\n        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;\n    }\n    else {\n        x_VPX = xSpan( VIEWPORT_PX ) - xy_APX.x;\n        y_VPX = min1D( AXIS_VIEWPORT_PX ) - yMin( VIEWPORT_PX ) + xy_APX.y;\n    }\n\n    vec2 xy_NDC = -1.0 + ( 2.0 * vec2( x_VPX, y_VPX ) )/span2D( VIEWPORT_PX );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n    vSt_FRAC = st_IFRAC;\n}\n";

Object.freeze({
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

const canvas = document.createElement('canvas');
requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));

var fragShader_GLSL$6 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$6 = "#version 100\n\n/**\n * Coords: x_NDC, y_NDC\n */\nattribute vec2 inCoords;\n\nvoid main( ) {\n    vec2 xy_NDC = inCoords.xy;\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

Object.freeze({
    vertShader_GLSL: vertShader_GLSL$6,
    fragShader_GLSL: fragShader_GLSL$6,
    uniformNames: ['RGBA'],
    attribNames: ['inCoords'],
});

var fragShader_GLSL$5 = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL$5 = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\n\nuniform vec4 VIEWPORT_PX;\nuniform vec4 AXIS_VIEWPORT_PX;\n\n\n/**\n * Coords: xBase_XFRAC, yBase_YFRAC, xOffset_PX, yOffset_PX\n */\nattribute vec4 inCoords;\n\n\nvoid main( ) {\n    vec2 base_AFRAC = inCoords.xy;\n    vec2 base_APX = base_AFRAC * span2D( AXIS_VIEWPORT_PX );\n    vec2 base_VPX = min2D( AXIS_VIEWPORT_PX ) - min2D( VIEWPORT_PX ) + base_APX;\n\n    vec2 offset_PX = inCoords.zw;\n    vec2 final_VPX = base_VPX + offset_PX;\n    vec2 final_NDC = -1.0 + ( 2.0 * final_VPX )/span2D( VIEWPORT_PX );\n    gl_Position = vec4( final_NDC, 0.0, 1.0 );\n}\n";

Object.freeze({
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

var fillFragShader_GLSL$2 = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\n\nvoid main( ) {\n    float alpha = COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var fillVertShader_GLSL$2 = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 AXIS_LIMITS;\n\n/**\n * Coords: x, y\n */\nattribute vec2 inCoords;\n\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

var lineFragShader_GLSL$2 = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    float featherMask = smoothstep( 0.5*( THICKNESS_PX + FEATHER_PX ), 0.5*( THICKNESS_PX - FEATHER_PX ), abs( vLateral_PX ) );\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var lineVertShader_GLSL$2 = "#version 100\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nuniform vec4 AXIS_LIMITS;\nuniform vec4 AXIS_VIEWPORT_PX;\nuniform lowp float THICKNESS_PX;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x, y, dxForward (unnormalized), dyForward (unnormalized)\n */\nattribute vec4 inCoords;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    vec2 xy_XYAXIS = inCoords.xy;\n    vec2 xy_FRAC = ( xy_XYAXIS - min2D( AXIS_LIMITS ) ) / span2D( AXIS_LIMITS );\n    vec2 xy_PX = xy_FRAC * span2D( AXIS_VIEWPORT_PX );\n\n    vec2 dxyForward_XYAXIS = inCoords.zw;\n    vec2 dxyForward_FRAC = dxyForward_XYAXIS / span2D( AXIS_LIMITS );\n    vec2 dxyForward_PX = dxyForward_FRAC * span2D( AXIS_VIEWPORT_PX );\n    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );\n    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );\n\n    vec2 xyFinal_PX = xy_PX + 0.5*( THICKNESS_PX + FEATHER_PX )*dxyRightUnit_PX;\n    vec2 xyFinal_NDC = -1.0 + 2.0*( xyFinal_PX / span2D( AXIS_VIEWPORT_PX ) );\n\n    gl_Position = vec4( xyFinal_NDC, 0.0, 1.0 );\n\n    bool negativeLateral = ( dxyForward_XYAXIS.x < 0.0 || ( dxyForward_XYAXIS.x == 0.0 && dxyForward_XYAXIS.y < 0.0 ) );\n    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );\n}\n";

var pointFragShader_GLSL$1 = "#version 100\nprecision lowp float;\n\nuniform float FEATHER_PX;\n\nvarying float vDiameter_PX;\nvarying vec4 vColor;\n\nvoid main( ) {\n    vec2 xy_PX = ( gl_PointCoord - 0.5 )*( vDiameter_PX + FEATHER_PX );\n    float r_PX = sqrt( dot( xy_PX, xy_PX ) );\n\n    float rOuter_PX = 0.5*( vDiameter_PX + FEATHER_PX );\n    float rInner_PX = 0.5*( vDiameter_PX - FEATHER_PX );\n    float featherMask = smoothstep( rOuter_PX, rInner_PX, r_PX );\n\n    float alpha = featherMask * vColor.a;\n    gl_FragColor = vec4( alpha*vColor.rgb, alpha );\n}\n";

var pointVertShader_GLSL$1 = "#version 100\n\n\nvec2 min2D( vec4 interval2D ) {\n    return interval2D.xy;\n}\n\nvec2 span2D( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nvec2 coordsToNdc2D( vec2 coords, vec4 bounds ) {\n    vec2 frac = ( coords - min2D( bounds ) ) / span2D( bounds );\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform vec4 AXIS_LIMITS;\n\n/**\n * xMin, xMax, yMin, yMax\n */\nuniform vec4 DATA_CLAMP_LIMITS;\n\nuniform lowp float JOIN_DIAMETER_PX;\nuniform lowp float DATA_DIAMETER_PX;\nuniform lowp float DATA_CLAMPED_DIAMETER_PX;\nuniform lowp vec4 JOIN_COLOR;\nuniform lowp vec4 DATA_COLOR;\nuniform lowp vec4 DATA_CLAMPED_COLOR;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x, y, isData\n */\nattribute vec3 inCoords;\n\nvarying float vDiameter_PX;\nvarying vec4 vColor;\n\n\nvoid main( ) {\n    bool isData = ( inCoords.z >= 0.5 );\n\n    vec2 xy_XYAXIS;\n    if ( isData ) {\n        xy_XYAXIS = clamp( inCoords.xy, DATA_CLAMP_LIMITS.xz, DATA_CLAMP_LIMITS.yw );\n        bool isClamped = ( xy_XYAXIS != inCoords.xy );\n        vDiameter_PX = ( isClamped ? DATA_CLAMPED_DIAMETER_PX : DATA_DIAMETER_PX );\n        vColor = ( isClamped ? DATA_CLAMPED_COLOR : DATA_COLOR );\n    }\n    else {\n        xy_XYAXIS = inCoords.xy;\n        vDiameter_PX = JOIN_DIAMETER_PX;\n        vColor = JOIN_COLOR;\n    }\n\n    vec2 xy_NDC = coordsToNdc2D( xy_XYAXIS, AXIS_LIMITS );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n    gl_PointSize = vDiameter_PX + FEATHER_PX;\n}\n";

Object.freeze({
    vertShader_GLSL: fillVertShader_GLSL$2,
    fragShader_GLSL: fillFragShader_GLSL$2,
    uniformNames: [
        'AXIS_LIMITS',
        'COLOR',
    ],
    attribNames: [
        'inCoords',
    ],
});
Object.freeze({
    vertShader_GLSL: lineVertShader_GLSL$2,
    fragShader_GLSL: lineFragShader_GLSL$2,
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
    vertShader_GLSL: pointVertShader_GLSL$1,
    fragShader_GLSL: pointFragShader_GLSL$1,
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

Object.freeze({
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
get$1(() => {
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
var ScatterSizeFunc;
(function (ScatterSizeFunc) {
    ScatterSizeFunc[ScatterSizeFunc["LINEAR"] = 0] = "LINEAR";
    ScatterSizeFunc[ScatterSizeFunc["QUADRATIC"] = 1] = "QUADRATIC";
    ScatterSizeFunc[ScatterSizeFunc["SQRT"] = 2] = "SQRT";
})(ScatterSizeFunc || (ScatterSizeFunc = {}));

var fragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 RGBA;\n\nvoid main( ) {\n    gl_FragColor = vec4( RGBA.a*RGBA.rgb, RGBA.a );\n}\n";

var vertShader_GLSL = "#version 100\n\n\nfloat min1D( vec2 interval1D ) {\n    return interval1D.x;\n}\n\nfloat span1D( vec2 interval1D ) {\n    return interval1D.y;\n}\n\nfloat fracToCoord1D( float frac, vec2 bounds ) {\n    return ( min1D( bounds ) + frac*span1D( bounds ) );\n}\n\nfloat coordToFrac1D( float coord, vec2 bounds ) {\n    return ( ( coord - min1D( bounds ) ) / span1D( bounds ) );\n}\n\nfloat fracToNdc1D( float frac ) {\n    return ( -1.0 + 2.0*frac );\n}\n\n\nuniform int AXIS_IS_VERTICAL;\nuniform vec2 AXIS_LIMITS;\nuniform vec2 COLOR_LIMITS;\n\n\n/**\n * Coords: colorBoundsFrac, orthoFrac\n */\nattribute vec3 inCoords;\n\n\nvoid main( ) {\n    float colorLimitsFrac = inCoords.x;\n    float axisCoord = fracToCoord1D( colorLimitsFrac, COLOR_LIMITS );\n    float axisFrac = coordToFrac1D( axisCoord, AXIS_LIMITS );\n    float axisNdc = fracToNdc1D( axisFrac );\n\n    float orthoFrac = inCoords.y;\n    float orthoNdc = fracToNdc1D( orthoFrac );\n\n    if ( AXIS_IS_VERTICAL == 1 ) {\n        gl_Position = vec4( orthoNdc, axisNdc, 0.0, 1.0 );\n    }\n    else {\n        gl_Position = vec4( axisNdc, orthoNdc, 0.0, 1.0 );\n    }\n}\n";

Object.freeze({
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

Object.freeze([5.0, 2.0, 1.0, 0.5, 0.2, 0.1]);
newImmutableMap([
    ['ArrowUp', -1],
    ['ArrowDown', +1],
    ['PageUp', -11],
    ['PageDown', +11],
]);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var libtess_minExports = {};
var libtess_min = {
  get exports(){ return libtess_minExports; },
  set exports(v){ libtess_minExports = v; },
};

/*

 Copyright 2000, Silicon Graphics, Inc. All Rights Reserved.
 Copyright 2015, Google Inc. All Rights Reserved.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice including the dates of first publication and
 either this permission notice or a reference to http://oss.sgi.com/projects/FreeB/
 shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 SILICON GRAPHICS, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 Original Code. The Original Code is: OpenGL Sample Implementation,
 Version 1.2.1, released January 26, 2000, developed by Silicon Graphics,
 Inc. The Original Code is Copyright (c) 1991-2000 Silicon Graphics, Inc.
 Copyright in any portions created by third parties is as indicated
 elsewhere herein. All Rights Reserved.
*/

(function (module) {
var n;function t(a,b){return a.b===b.b&&a.a===b.a}function u(a,b){return a.b<b.b||a.b===b.b&&a.a<=b.a}function v(a,b,c){var d=b.b-a.b,e=c.b-b.b;return 0<d+e?d<e?b.a-a.a+d/(d+e)*(a.a-c.a):b.a-c.a+e/(d+e)*(c.a-a.a):0}function x(a,b,c){var d=b.b-a.b,e=c.b-b.b;return 0<d+e?(b.a-c.a)*d+(b.a-a.a)*e:0}function z(a,b){return a.a<b.a||a.a===b.a&&a.b<=b.b}function aa(a,b,c){var d=b.a-a.a,e=c.a-b.a;return 0<d+e?d<e?b.b-a.b+d/(d+e)*(a.b-c.b):b.b-c.b+e/(d+e)*(c.b-a.b):0}
	function ba(a,b,c){var d=b.a-a.a,e=c.a-b.a;return 0<d+e?(b.b-c.b)*d+(b.b-a.b)*e:0}function ca(a){return u(a.b.a,a.a)}function da(a){return u(a.a,a.b.a)}function A(a,b,c,d){a=0>a?0:a;c=0>c?0:c;return a<=c?0===c?(b+d)/2:b+a/(a+c)*(d-b):d+c/(a+c)*(b-d)}function ea(a){var b=B(a.b);C(b,a.c);C(b.b,a.c);D(b,a.a);return b}function E(a,b){var c=!1,d=!1;a!==b&&(b.a!==a.a&&(d=!0,F(b.a,a.a)),b.d!==a.d&&(c=!0,G(b.d,a.d)),H(b,a),d||(C(b,a.a),a.a.c=a),c||(D(b,a.d),a.d.a=a));}function I(a){var b=a.b,c=!1;a.d!==a.b.d&&(c=!0,G(a.d,a.b.d));a.c===a?F(a.a,null):(a.b.d.a=J(a),a.a.c=a.c,H(a,J(a)),c||D(a,a.d));b.c===b?(F(b.a,null),G(b.d,null)):(a.d.a=J(b),b.a.c=b.c,H(b,J(b)));fa(a);}
	function K(a){var b=B(a),c=b.b;H(b,a.e);b.a=a.b.a;C(c,b.a);b.d=c.d=a.d;b=b.b;H(a.b,J(a.b));H(a.b,b);a.b.a=b.a;b.b.a.c=b.b;b.b.d=a.b.d;b.f=a.f;b.b.f=a.b.f;return b}function L(a,b){var c=!1,d=B(a),e=d.b;b.d!==a.d&&(c=!0,G(b.d,a.d));H(d,a.e);H(e,b);d.a=a.b.a;e.a=b.a;d.d=e.d=a.d;a.d.a=e;c||D(d,a.d);return d}function B(a){var b=new M,c=new M,d=a.b.h;c.h=d;d.b.h=b;b.h=a;a.b.h=c;b.b=c;b.c=b;b.e=c;c.b=b;c.c=c;return c.e=b}function H(a,b){var c=a.c,d=b.c;c.b.e=b;d.b.e=a;a.c=d;b.c=c;}
	function C(a,b){var c=b.f,d=new N(b,c);c.e=d;b.f=d;c=d.c=a;do c.a=d,c=c.c;while(c!==a)}function D(a,b){var c=b.d,d=new ga(b,c);c.b=d;b.d=d;d.a=a;d.c=b.c;c=a;do c.d=d,c=c.e;while(c!==a)}function fa(a){var b=a.h;a=a.b.h;b.b.h=a;a.b.h=b;}function F(a,b){var c=a.c,d=c;do d.a=b,d=d.c;while(d!==c);c=a.f;d=a.e;d.f=c;c.e=d;}function G(a,b){var c=a.a,d=c;do d.d=b,d=d.e;while(d!==c);c=a.d;d=a.b;d.d=c;c.b=d;}function ha(a){var b=0;Math.abs(a[1])>Math.abs(a[0])&&(b=1);Math.abs(a[2])>Math.abs(a[b])&&(b=2);return b}var O=4*1E150;function P(a,b){a.f+=b.f;a.b.f+=b.b.f;}function ia(a,b,c){a=a.a;b=b.a;c=c.a;if(b.b.a===a)return c.b.a===a?u(b.a,c.a)?0>=x(c.b.a,b.a,c.a):0<=x(b.b.a,c.a,b.a):0>=x(c.b.a,a,c.a);if(c.b.a===a)return 0<=x(b.b.a,a,b.a);b=v(b.b.a,a,b.a);a=v(c.b.a,a,c.a);return b>=a}function Q(a){a.a.i=null;var b=a.e;b.a.c=b.c;b.c.a=b.a;a.e=null;}function ja(a,b){I(a.a);a.c=!1;a.a=b;b.i=a;}function ka(a){var b=a.a.a;do a=R(a);while(a.a.a===b);a.c&&(b=L(S(a).a.b,a.a.e),ja(a,b),a=R(a));return a}
	function la(a,b,c){var d=new ma;d.a=c;d.e=na(a.f,b.e,d);return c.i=d}function oa(a,b){switch(a.s){case 100130:return 0!==(b&1);case 100131:return 0!==b;case 100132:return 0<b;case 100133:return 0>b;case 100134:return 2<=b||-2>=b}return !1}function pa(a){var b=a.a,c=b.d;c.c=a.d;c.a=b;Q(a);}function T(a,b,c){a=b;for(b=b.a;a!==c;){a.c=!1;var d=S(a),e=d.a;if(e.a!==b.a){if(!d.c){pa(a);break}e=L(b.c.b,e.b);ja(d,e);}b.c!==e&&(E(J(e),e),E(b,e));pa(a);b=d.a;a=d;}return b}
	function U(a,b,c,d,e,f){var g=!0;do la(a,b,c.b),c=c.c;while(c!==d);for(null===e&&(e=S(b).a.b.c);;){d=S(b);c=d.a.b;if(c.a!==e.a)break;c.c!==e&&(E(J(c),c),E(J(e),c));d.f=b.f-c.f;d.d=oa(a,d.f);b.b=!0;!g&&qa(a,b)&&(P(c,e),Q(b),I(e));g=!1;b=d;e=c;}b.b=!0;f&&ra(a,b);}function sa(a,b,c,d,e){var f=[b.g[0],b.g[1],b.g[2]];b.d=null;b.d=a.o?a.o(f,c,d,a.c)||null:null;null===b.d&&(e?a.n||(V(a,100156),a.n=!0):b.d=c[0]);}
	function ta(a,b,c){var d=[null,null,null,null];d[0]=b.a.d;d[1]=c.a.d;sa(a,b.a,d,[.5,.5,0,0],!1);E(b,c);}function ua(a,b,c,d,e){var f=Math.abs(b.b-a.b)+Math.abs(b.a-a.a),g=Math.abs(c.b-a.b)+Math.abs(c.a-a.a),h=e+1;d[e]=.5*g/(f+g);d[h]=.5*f/(f+g);a.g[0]+=d[e]*b.g[0]+d[h]*c.g[0];a.g[1]+=d[e]*b.g[1]+d[h]*c.g[1];a.g[2]+=d[e]*b.g[2]+d[h]*c.g[2];}
	function qa(a,b){var c=S(b),d=b.a,e=c.a;if(u(d.a,e.a)){if(0<x(e.b.a,d.a,e.a))return !1;if(!t(d.a,e.a))K(e.b),E(d,J(e)),b.b=c.b=!0;else if(d.a!==e.a){var c=a.e,f=d.a.h;if(0<=f){var c=c.b,g=c.d,h=c.e,k=c.c,l=k[f];g[l]=g[c.a];k[g[l]]=l;l<=--c.a&&(1>=l?W(c,l):u(h[g[l>>1]],h[g[l]])?W(c,l):va(c,l));h[f]=null;k[f]=c.b;c.b=f;}else for(c.c[-(f+1)]=null;0<c.a&&null===c.c[c.d[c.a-1]];)--c.a;ta(a,J(e),d);}}else {if(0>x(d.b.a,e.a,d.a))return !1;R(b).b=b.b=!0;K(d.b);E(J(e),d);}return !0}
	function wa(a,b){var c=S(b),d=b.a,e=c.a,f=d.a,g=e.a,h=d.b.a,k=e.b.a,l=new N;x(h,a.a,f);x(k,a.a,g);if(f===g||Math.min(f.a,h.a)>Math.max(g.a,k.a))return !1;if(u(f,g)){if(0<x(k,f,g))return !1}else if(0>x(h,g,f))return !1;var r=h,p=f,q=k,y=g,m,w;u(r,p)||(m=r,r=p,p=m);u(q,y)||(m=q,q=y,y=m);u(r,q)||(m=r,r=q,q=m,m=p,p=y,y=m);u(q,p)?u(p,y)?(m=v(r,q,p),w=v(q,p,y),0>m+w&&(m=-m,w=-w),l.b=A(m,q.b,w,p.b)):(m=x(r,q,p),w=-x(r,y,p),0>m+w&&(m=-m,w=-w),l.b=A(m,q.b,w,y.b)):l.b=(q.b+p.b)/2;z(r,p)||(m=r,r=p,p=m);z(q,y)||
	(m=q,q=y,y=m);z(r,q)||(m=r,r=q,q=m,m=p,p=y,y=m);z(q,p)?z(p,y)?(m=aa(r,q,p),w=aa(q,p,y),0>m+w&&(m=-m,w=-w),l.a=A(m,q.a,w,p.a)):(m=ba(r,q,p),w=-ba(r,y,p),0>m+w&&(m=-m,w=-w),l.a=A(m,q.a,w,y.a)):l.a=(q.a+p.a)/2;u(l,a.a)&&(l.b=a.a.b,l.a=a.a.a);r=u(f,g)?f:g;u(r,l)&&(l.b=r.b,l.a=r.a);if(t(l,f)||t(l,g))return qa(a,b),!1;if(!t(h,a.a)&&0<=x(h,a.a,l)||!t(k,a.a)&&0>=x(k,a.a,l)){if(k===a.a)return K(d.b),E(e.b,d),b=ka(b),d=S(b).a,T(a,S(b),c),U(a,b,J(d),d,d,!0),!0;if(h===a.a){K(e.b);E(d.e,J(e));f=c=b;g=f.a.b.a;
	do f=R(f);while(f.a.b.a===g);b=f;f=S(b).a.b.c;c.a=J(e);e=T(a,c,null);U(a,b,e.c,d.b.c,f,!0);return !0}0<=x(h,a.a,l)&&(R(b).b=b.b=!0,K(d.b),d.a.b=a.a.b,d.a.a=a.a.a);0>=x(k,a.a,l)&&(b.b=c.b=!0,K(e.b),e.a.b=a.a.b,e.a.a=a.a.a);return !1}K(d.b);K(e.b);E(J(e),d);d.a.b=l.b;d.a.a=l.a;d.a.h=xa(a.e,d.a);d=d.a;e=[0,0,0,0];l=[f.d,h.d,g.d,k.d];d.g[0]=d.g[1]=d.g[2]=0;ua(d,f,h,e,0);ua(d,g,k,e,2);sa(a,d,l,e,!0);R(b).b=b.b=c.b=!0;return !1}
	function ra(a,b){for(var c=S(b);;){for(;c.b;)b=c,c=S(c);if(!b.b&&(c=b,b=R(b),null===b||!b.b))break;b.b=!1;var d=b.a,e=c.a,f;if(f=d.b.a!==e.b.a)a:{f=b;var g=S(f),h=f.a,k=g.a,l=void 0;if(u(h.b.a,k.b.a)){if(0>x(h.b.a,k.b.a,h.a)){f=!1;break a}R(f).b=f.b=!0;l=K(h);E(k.b,l);l.d.c=f.d;}else {if(0<x(k.b.a,h.b.a,k.a)){f=!1;break a}f.b=g.b=!0;l=K(k);E(h.e,k.b);l.b.d.c=f.d;}f=!0;}f&&(c.c?(Q(c),I(e),c=S(b),e=c.a):b.c&&(Q(b),I(d),b=R(c),d=b.a));if(d.a!==e.a)if(d.b.a===e.b.a||b.c||c.c||d.b.a!==a.a&&e.b.a!==a.a)qa(a,
	b);else if(wa(a,b))break;d.a===e.a&&d.b.a===e.b.a&&(P(e,d),Q(b),I(d),b=R(c));}}
	function ya(a,b){a.a=b;for(var c=b.c;null===c.i;)if(c=c.c,c===b.c){var c=a,d=b,e=new ma;e.a=d.c.b;var f=c.f,g=f.a;do g=g.a;while(null!==g.b&&!f.c(f.b,e,g.b));var f=g.b,h=S(f),e=f.a,g=h.a;if(0===x(e.b.a,d,e.a))e=f.a,t(e.a,d)||t(e.b.a,d)||(K(e.b),f.c&&(I(e.c),f.c=!1),E(d.c,e),ya(c,d));else {var k=u(g.b.a,e.b.a)?f:h,h=void 0;f.d||k.c?(k===f?h=L(d.c.b,e.e):h=L(g.b.c.b,d.c).b,k.c?ja(k,h):(e=c,f=la(c,f,h),f.f=R(f).f+f.a.f,f.d=oa(e,f.f)),ya(c,d)):U(c,f,d.c,d.c,null,!0);}return}c=ka(c.i);e=S(c);f=e.a;e=T(a,
	e,null);if(e.c===f){var f=e,e=f.c,g=S(c),h=c.a,k=g.a,l=!1;h.b.a!==k.b.a&&wa(a,c);t(h.a,a.a)&&(E(J(e),h),c=ka(c),e=S(c).a,T(a,S(c),g),l=!0);t(k.a,a.a)&&(E(f,J(k)),f=T(a,g,null),l=!0);l?U(a,c,f.c,e,e,!0):(u(k.a,h.a)?d=J(k):d=h,d=L(f.c.b,d),U(a,c,d,d.c,d.c,!1),d.b.i.c=!0,ra(a,c));}else U(a,c,e.c,f,f,!0);}function za(a,b){var c=new ma,d=ea(a.b);d.a.b=O;d.a.a=b;d.b.a.b=-O;d.b.a.a=b;a.a=d.b.a;c.a=d;c.f=0;c.d=!1;c.c=!1;c.h=!0;c.b=!1;d=a.f;d=na(d,d.a,c);c.e=d;}function Aa(a){this.a=new Ba;this.b=a;this.c=ia;}function na(a,b,c){do b=b.c;while(null!==b.b&&!a.c(a.b,b.b,c));a=new Ba(c,b.a,b);b.a.c=a;return b.a=a}function Ba(a,b,c){this.b=a||null;this.a=b||this;this.c=c||this;}function X(){this.d=Y;this.p=this.b=this.q=null;this.j=[0,0,0];this.s=100130;this.n=!1;this.o=this.a=this.e=this.f=null;this.m=!1;this.c=this.r=this.i=this.k=this.l=this.h=null;}var Y=0;n=X.prototype;n.x=function(){Z(this,Y);};n.B=function(a,b){switch(a){case 100142:return;case 100140:switch(b){case 100130:case 100131:case 100132:case 100133:case 100134:this.s=b;return}break;case 100141:this.m=!!b;return;default:V(this,100900);return}V(this,100901);};
	n.y=function(a){switch(a){case 100142:return 0;case 100140:return this.s;case 100141:return this.m;default:V(this,100900);}return !1};n.A=function(a,b,c){this.j[0]=a;this.j[1]=b;this.j[2]=c;};
	n.z=function(a,b){var c=b?b:null;switch(a){case 100100:case 100106:this.h=c;break;case 100104:case 100110:this.l=c;break;case 100101:case 100107:this.k=c;break;case 100102:case 100108:this.i=c;break;case 100103:case 100109:this.p=c;break;case 100105:case 100111:this.o=c;break;case 100112:this.r=c;break;default:V(this,100900);}};
	n.C=function(a,b){var c=!1,d=[0,0,0];Z(this,2);for(var e=0;3>e;++e){var f=a[e];-1E150>f&&(f=-1E150,c=!0);1E150<f&&(f=1E150,c=!0);d[e]=f;}c&&V(this,100155);c=this.q;null===c?(c=ea(this.b),E(c,c.b)):(K(c),c=c.e);c.a.d=b;c.a.g[0]=d[0];c.a.g[1]=d[1];c.a.g[2]=d[2];c.f=1;c.b.f=-1;this.q=c;};n.u=function(a){Z(this,Y);this.d=1;this.b=new Ca;this.c=a;};n.t=function(){Z(this,1);this.d=2;this.q=null;};n.v=function(){Z(this,2);this.d=1;};
	n.w=function(){Z(this,1);this.d=Y;var a=this.j[0],b=this.j[1],c=this.j[2],d=!1,e=[a,b,c];if(0===a&&0===b&&0===c){for(var b=[-2*1E150,-2*1E150,-2*1E150],f=[2*1E150,2*1E150,2*1E150],c=[],g=[],d=this.b.c,a=d.e;a!==d;a=a.e)for(var h=0;3>h;++h){var k=a.g[h];k<f[h]&&(f[h]=k,g[h]=a);k>b[h]&&(b[h]=k,c[h]=a);}a=0;b[1]-f[1]>b[0]-f[0]&&(a=1);b[2]-f[2]>b[a]-f[a]&&(a=2);if(f[a]>=b[a])e[0]=0,e[1]=0,e[2]=1;else {b=0;f=g[a];c=c[a];g=[0,0,0];f=[f.g[0]-c.g[0],f.g[1]-c.g[1],f.g[2]-c.g[2]];h=[0,0,0];for(a=d.e;a!==d;a=
	a.e)h[0]=a.g[0]-c.g[0],h[1]=a.g[1]-c.g[1],h[2]=a.g[2]-c.g[2],g[0]=f[1]*h[2]-f[2]*h[1],g[1]=f[2]*h[0]-f[0]*h[2],g[2]=f[0]*h[1]-f[1]*h[0],k=g[0]*g[0]+g[1]*g[1]+g[2]*g[2],k>b&&(b=k,e[0]=g[0],e[1]=g[1],e[2]=g[2]);0>=b&&(e[0]=e[1]=e[2]=0,e[ha(f)]=1);}d=!0;}g=ha(e);a=this.b.c;b=(g+1)%3;c=(g+2)%3;g=0<e[g]?1:-1;for(e=a.e;e!==a;e=e.e)e.b=e.g[b],e.a=g*e.g[c];if(d){e=0;d=this.b.a;for(a=d.b;a!==d;a=a.b)if(b=a.a,!(0>=b.f)){do e+=(b.a.b-b.b.a.b)*(b.a.a+b.b.a.a),b=b.e;while(b!==a.a)}if(0>e)for(e=this.b.c,d=e.e;d!==
	e;d=d.e)d.a=-d.a;}this.n=!1;e=this.b.b;for(a=e.h;a!==e;a=d)if(d=a.h,b=a.e,t(a.a,a.b.a)&&a.e.e!==a&&(ta(this,b,a),I(a),a=b,b=a.e),b.e===a){if(b!==a){if(b===d||b===d.b)d=d.h;I(b);}if(a===d||a===d.b)d=d.h;I(a);}this.e=e=new Da;d=this.b.c;for(a=d.e;a!==d;a=a.e)a.h=xa(e,a);Ea(e);this.f=new Aa(this);za(this,-O);for(za(this,O);null!==(e=Fa(this.e));){for(;;){a:if(a=this.e,0===a.a)d=Ga(a.b);else if(d=a.c[a.d[a.a-1]],0!==a.b.a&&(a=Ga(a.b),u(a,d))){d=a;break a}if(null===d||!t(d,e))break;d=Fa(this.e);ta(this,e.c,
	d.c);}ya(this,e);}this.a=this.f.a.a.b.a.a;for(e=0;null!==(d=this.f.a.a.b);)d.h||++e,Q(d);this.f=null;e=this.e;e.b=null;e.d=null;this.e=e.c=null;e=this.b;for(a=e.a.b;a!==e.a;a=d)d=a.b,a=a.a,a.e.e===a&&(P(a.c,a),I(a));if(!this.n){e=this.b;if(this.m)for(a=e.b.h;a!==e.b;a=d)d=a.h,a.b.d.c!==a.d.c?a.f=a.d.c?1:-1:I(a);else for(a=e.a.b;a!==e.a;a=d)if(d=a.b,a.c){for(a=a.a;u(a.b.a,a.a);a=a.c.b);for(;u(a.a,a.b.a);a=a.e);b=a.c.b;for(c=void 0;a.e!==b;)if(u(a.b.a,b.a)){for(;b.e!==a&&(ca(b.e)||0>=x(b.a,b.b.a,b.e.b.a));)c=
	L(b.e,b),b=c.b;b=b.c.b;}else {for(;b.e!==a&&(da(a.c.b)||0<=x(a.b.a,a.a,a.c.b.a));)c=L(a,a.c.b),a=c.b;a=a.e;}for(;b.e.e!==a;)c=L(b.e,b),b=c.b;}if(this.h||this.i||this.k||this.l)if(this.m)for(e=this.b,d=e.a.b;d!==e.a;d=d.b){if(d.c){this.h&&this.h(2,this.c);a=d.a;do this.k&&this.k(a.a.d,this.c),a=a.e;while(a!==d.a);this.i&&this.i(this.c);}}else {e=this.b;d=!!this.l;a=!1;b=-1;for(c=e.a.d;c!==e.a;c=c.d)if(c.c){a||(this.h&&this.h(4,this.c),a=!0);g=c.a;do d&&(f=g.b.d.c?0:1,b!==f&&(b=f,this.l&&this.l(!!b,this.c))),
	this.k&&this.k(g.a.d,this.c),g=g.e;while(g!==c.a)}a&&this.i&&this.i(this.c);}if(this.r){e=this.b;for(a=e.a.b;a!==e.a;a=d)if(d=a.b,!a.c){b=a.a;c=b.e;g=void 0;do g=c,c=g.e,g.d=null,null===g.b.d&&(g.c===g?F(g.a,null):(g.a.c=g.c,H(g,J(g))),f=g.b,f.c===f?F(f.a,null):(f.a.c=f.c,H(f,J(f))),fa(g));while(g!==b);b=a.d;a=a.b;a.d=b;b.b=a;}this.r(this.b);this.c=this.b=null;return}}this.b=this.c=null;};
	function Z(a,b){if(a.d!==b)for(;a.d!==b;)if(a.d<b)switch(a.d){case Y:V(a,100151);a.u(null);break;case 1:V(a,100152),a.t();}else switch(a.d){case 2:V(a,100154);a.v();break;case 1:V(a,100153),a.w();}}function V(a,b){a.p&&a.p(b,a.c);}function ga(a,b){this.b=a||this;this.d=b||this;this.a=null;this.c=!1;}function M(){this.h=this;this.i=this.d=this.a=this.e=this.c=this.b=null;this.f=0;}function J(a){return a.b.e}function Ca(){this.c=new N;this.a=new ga;this.b=new M;this.d=new M;this.b.b=this.d;this.d.b=this.b;}function N(a,b){this.e=a||this;this.f=b||this;this.d=this.c=null;this.g=[0,0,0];this.h=this.a=this.b=0;}function Da(){this.c=[];this.d=null;this.a=0;this.e=!1;this.b=new Ha;}function Ea(a){a.d=[];for(var b=0;b<a.a;b++)a.d[b]=b;a.d.sort(function(a){return function(b,e){return u(a[b],a[e])?1:-1}}(a.c));a.e=!0;Ia(a.b);}function xa(a,b){if(a.e){var c=a.b,d=++c.a;2*d>c.f&&(c.f*=2,c.c=Ja(c.c,c.f+1));var e;0===c.b?e=d:(e=c.b,c.b=c.c[c.b]);c.e[e]=b;c.c[e]=d;c.d[d]=e;c.h&&va(c,d);return e}c=a.a++;a.c[c]=b;return -(c+1)}
	function Fa(a){if(0===a.a)return Ka(a.b);var b=a.c[a.d[a.a-1]];if(0!==a.b.a&&u(Ga(a.b),b))return Ka(a.b);do--a.a;while(0<a.a&&null===a.c[a.d[a.a-1]]);return b}function Ha(){this.d=Ja([0],33);this.e=[null,null];this.c=[0,0];this.a=0;this.f=32;this.b=0;this.h=!1;this.d[1]=1;}function Ja(a,b){for(var c=Array(b),d=0;d<a.length;d++)c[d]=a[d];for(;d<b;d++)c[d]=0;return c}function Ia(a){for(var b=a.a;1<=b;--b)W(a,b);a.h=!0;}function Ga(a){return a.e[a.d[1]]}function Ka(a){var b=a.d,c=a.e,d=a.c,e=b[1],f=c[e];0<a.a&&(b[1]=b[a.a],d[b[1]]=1,c[e]=null,d[e]=a.b,a.b=e,0<--a.a&&W(a,1));return f}
	function W(a,b){for(var c=a.d,d=a.e,e=a.c,f=b,g=c[f];;){var h=f<<1;h<a.a&&u(d[c[h+1]],d[c[h]])&&(h+=1);var k=c[h];if(h>a.a||u(d[g],d[k])){c[f]=g;e[g]=f;break}c[f]=k;e[k]=f;f=h;}}function va(a,b){for(var c=a.d,d=a.e,e=a.c,f=b,g=c[f];;){var h=f>>1,k=c[h];if(0===h||u(d[k],d[g])){c[f]=g;e[g]=f;break}c[f]=k;e[k]=f;f=h;}}function ma(){this.e=this.a=null;this.f=0;this.c=this.b=this.h=this.d=!1;}function S(a){return a.e.c.b}function R(a){return a.e.a.b}commonjsGlobal.libtess={GluTesselator:X,windingRule:{GLU_TESS_WINDING_ODD:100130,GLU_TESS_WINDING_NONZERO:100131,GLU_TESS_WINDING_POSITIVE:100132,GLU_TESS_WINDING_NEGATIVE:100133,GLU_TESS_WINDING_ABS_GEQ_TWO:100134},primitiveType:{GL_LINE_LOOP:2,GL_TRIANGLES:4,GL_TRIANGLE_STRIP:5,GL_TRIANGLE_FAN:6},errorType:{GLU_TESS_MISSING_BEGIN_POLYGON:100151,GLU_TESS_MISSING_END_POLYGON:100153,GLU_TESS_MISSING_BEGIN_CONTOUR:100152,GLU_TESS_MISSING_END_CONTOUR:100154,GLU_TESS_COORD_TOO_LARGE:100155,GLU_TESS_NEED_COMBINE_CALLBACK:100156},
	gluEnum:{GLU_TESS_MESH:100112,GLU_TESS_TOLERANCE:100142,GLU_TESS_WINDING_RULE:100140,GLU_TESS_BOUNDARY_ONLY:100141,GLU_INVALID_ENUM:100900,GLU_INVALID_VALUE:100901,GLU_TESS_BEGIN:100100,GLU_TESS_VERTEX:100101,GLU_TESS_END:100102,GLU_TESS_ERROR:100103,GLU_TESS_EDGE_FLAG:100104,GLU_TESS_COMBINE:100105,GLU_TESS_BEGIN_DATA:100106,GLU_TESS_VERTEX_DATA:100107,GLU_TESS_END_DATA:100108,GLU_TESS_ERROR_DATA:100109,GLU_TESS_EDGE_FLAG_DATA:100110,GLU_TESS_COMBINE_DATA:100111}};X.prototype.gluDeleteTess=X.prototype.x;
	X.prototype.gluTessProperty=X.prototype.B;X.prototype.gluGetTessProperty=X.prototype.y;X.prototype.gluTessNormal=X.prototype.A;X.prototype.gluTessCallback=X.prototype.z;X.prototype.gluTessVertex=X.prototype.C;X.prototype.gluTessBeginPolygon=X.prototype.u;X.prototype.gluTessBeginContour=X.prototype.t;X.prototype.gluTessEndContour=X.prototype.v;X.prototype.gluTessEndPolygon=X.prototype.w; { module.exports = commonjsGlobal.libtess; }
} (libtess_min));

/*!
 * @metsci/gleam-geojson
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

const cssUrl$1 = new URL("assets/@metsci/gleam-geojson/c3c9733f-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink$1 = createCssLink(cssUrl$1);
function createGleamGeoJsonDefaultStyle() {
    return cssLink$1.cloneNode(true);
}
appendCssLink(document.head, createGleamGeoJsonDefaultStyle());

const { abs: abs$1, max: max$1, min: min$1, PI: PI$1$1, ceil: ceil$1, fround, log2: log2$1, trunc } = Math;

function createXSplitter(xWrapSpan) {
    const xWrapSpan_MM = 1e3 * WGS84_EQUATORIAL_CIRCUMFERENCE_METERS;
    const numFractionBits = ceil$1(log2$1(xWrapSpan_MM / xWrapSpan));
    const numWholeBits = 46 - numFractionBits;
    const numWholeBitsInBottomWord = 23 - numFractionBits;
    const xMaxSplittable = 2 ** numWholeBits;
    const aShiftFactor = 2 ** -numWholeBitsInBottomWord;
    const aUnshiftFactor = 2 ** numWholeBitsInBottomWord;
    return x => {
        if (abs$1(x) >= xMaxSplittable) {
            
            return [fround(x), 0];
        }
        else {
            const a = trunc(x * aShiftFactor) * aUnshiftFactor;
            const b = x - a;
            return [fround(a), fround(b)];
        }
    };
}

var markerFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform sampler2D IMAGE_TEXTURE;\n\nvarying lowp vec2 v_st;\n\nvoid main( ) {\n    vec4 rgba = texture2D( IMAGE_TEXTURE, v_st );\n    gl_FragColor = vec4( rgba.a*rgba.rgb, rgba.a );\n}\n";

var markerVertShader_GLSL = "#version 100\n\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\nvec2 xySpan( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat subtractSplitValues( vec2 vSplit, vec2 wSplit ) {\n    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );\n}\n\n\nuniform vec2 VIEWPORT_SIZE_PX;\nuniform vec4 VIEWPORT_BOUNDS_AXIS;\nuniform vec4 IMAGE_SPRAWL_PX;\n\n/**\n * Coords: xAnchorA_AXIS, xAnchorB_AXIS, yAnchor_AXIS\n */\nattribute vec3 inVerticesA;\n\n/**\n * Coords: xInImage_IMAGEFRAC, yInImage_IMAGEFRAC\n */\nattribute vec2 inVerticesB;\n\n/**\n * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS\n */\nattribute vec2 inViewportXMins;\n\n\nvarying lowp vec2 v_st;\n\n\nvoid main( ) {\n    vec2 xAnchor_AXIS = inVerticesA.xy;\n    vec2 xViewportMin_AXIS = inViewportXMins;\n    float xAnchor_VIEWFRAC = subtractSplitValues( xAnchor_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );\n\n    float yAnchor_AXIS = inVerticesA.z;\n    float yAnchor_VIEWFRAC = ( yAnchor_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );\n\n    float sprawlLeft_PX = IMAGE_SPRAWL_PX.x;\n    float sprawlRight_PX = IMAGE_SPRAWL_PX.y;\n    float sprawlTop_PX = IMAGE_SPRAWL_PX.z;\n    float sprawlBottom_PX = IMAGE_SPRAWL_PX.w;\n\n    // Line up the bottom-left corner of the image with the bottom-left corner of a screen pixel\n    xAnchor_VIEWFRAC = ( floor( xAnchor_VIEWFRAC*VIEWPORT_SIZE_PX.x + sprawlLeft_PX + 0.5 ) - sprawlLeft_PX ) / VIEWPORT_SIZE_PX.x;\n    yAnchor_VIEWFRAC = ( floor( yAnchor_VIEWFRAC*VIEWPORT_SIZE_PX.y + sprawlBottom_PX + 0.5 ) - sprawlBottom_PX ) / VIEWPORT_SIZE_PX.y;\n\n    vec2 xyInImage_IMAGEFRAC = inVerticesB;\n    float dxToCorner_VIEWFRAC = ( sprawlLeft_PX + xyInImage_IMAGEFRAC.x*( sprawlRight_PX - sprawlLeft_PX ) ) / VIEWPORT_SIZE_PX.x;\n    float dyToCorner_VIEWFRAC = ( sprawlBottom_PX + xyInImage_IMAGEFRAC.y*( sprawlTop_PX - sprawlBottom_PX ) ) / VIEWPORT_SIZE_PX.y;\n\n    vec2 xy_NDC = -1.0 + 2.0*vec2( xAnchor_VIEWFRAC + dxToCorner_VIEWFRAC, yAnchor_VIEWFRAC + dyToCorner_VIEWFRAC );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    v_st = vec2( xyInImage_IMAGEFRAC.x, 1.0 - xyInImage_IMAGEFRAC.y );\n}\n";

var lineFragShader_GLSL$1 = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    float featherMask = smoothstep( 0.5*( THICKNESS_PX + FEATHER_PX ), 0.5*( THICKNESS_PX - FEATHER_PX ), abs( vLateral_PX ) );\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var lineVertShader_GLSL$1 = "#version 100\n\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\nvec2 xySpan( vec4 interval2D ) {\n    return interval2D.zw;\n}\n\nfloat subtractSplitValues( vec2 vSplit, vec2 wSplit ) {\n    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );\n}\n\n\nuniform vec2 VIEWPORT_SIZE_PX;\nuniform vec4 VIEWPORT_BOUNDS_AXIS;\nuniform lowp float THICKNESS_PX;\nuniform lowp float FEATHER_PX;\n\n\n/**\n * Coords: xA_AXIS, xB_AXIS, y_AXIS\n */\nattribute vec3 inVerticesA;\n\n/**\n * Coords: dxForward_AXIS (unnormalized), dyForward_AXIS (unnormalized)\n */\nattribute vec2 inVerticesB;\n\n/**\n * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS\n */\nattribute vec2 inViewportXMins;\n\n\nvarying float vLateral_PX;\n\n\nvoid main( ) {\n    vec2 x_AXIS = inVerticesA.xy;\n    vec2 xViewportMin_AXIS = inViewportXMins;\n    float x_VIEWFRAC = subtractSplitValues( x_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );\n\n    float y_AXIS = inVerticesA.z;\n    float y_VIEWFRAC = ( y_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );\n\n    vec2 dxyForward_AXIS = inVerticesB.xy;\n    vec2 dxyForward_VIEWFRAC = dxyForward_AXIS / xySpan( VIEWPORT_BOUNDS_AXIS );\n    vec2 dxyForward_PX = dxyForward_VIEWFRAC * VIEWPORT_SIZE_PX;\n    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );\n    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );\n    vec2 dxyRight_PX = 0.5*( THICKNESS_PX + FEATHER_PX ) * dxyRightUnit_PX;\n    vec2 dxyRight_VIEWFRAC = dxyRight_PX / VIEWPORT_SIZE_PX;\n\n    vec2 xy_VIEWFRAC = vec2( x_VIEWFRAC, y_VIEWFRAC );\n    vec2 xy_NDC = -1.0 + 2.0*( xy_VIEWFRAC + dxyRight_VIEWFRAC );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    bool negativeLateral = ( dxyForward_AXIS.x < 0.0 || ( dxyForward_AXIS.x == 0.0 && dxyForward_AXIS.y < 0.0 ) );\n    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );\n}\n";

var joinFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform lowp vec4 COLOR;\nuniform lowp float DIAMETER_PX;\nuniform lowp float FEATHER_PX;\n\nvoid main( ) {\n    vec2 xy_PX = ( gl_PointCoord - 0.5 )*( DIAMETER_PX + FEATHER_PX );\n    float r_PX = sqrt( dot( xy_PX, xy_PX ) );\n\n    float rOuter_PX = 0.5*( DIAMETER_PX + FEATHER_PX );\n    float rInner_PX = 0.5*( DIAMETER_PX - FEATHER_PX );\n    float featherMask = smoothstep( rOuter_PX, rInner_PX, r_PX );\n\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var joinVertShader_GLSL = "#version 100\n\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\nfloat subtractSplitValues( vec2 vSplit, vec2 wSplit ) {\n    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );\n}\n\n\nuniform vec4 VIEWPORT_BOUNDS_AXIS;\nuniform lowp float DIAMETER_PX;\nuniform lowp float FEATHER_PX;\n\n\n/**\n * Coords: xA_AXIS, xB_AXIS, y_AXIS\n */\nattribute vec3 inVertices;\n\n/**\n * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS\n */\nattribute vec2 inViewportXMins;\n\n\nvoid main( ) {\n    vec2 x_AXIS = inVertices.xy;\n    vec2 xViewportMin_AXIS = inViewportXMins;\n    float x_VIEWFRAC = subtractSplitValues( x_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );\n\n    float y_AXIS = inVertices.z;\n    float y_VIEWFRAC = ( y_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );\n\n    vec2 xy_NDC = -1.0 + 2.0*vec2( x_VIEWFRAC, y_VIEWFRAC );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n\n    gl_PointSize = DIAMETER_PX + FEATHER_PX;\n}\n";

var fillFragShader_GLSL$1 = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\n\nvoid main( ) {\n    float alpha = COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, COLOR.a );\n}\n";

var fillVertShader_GLSL$1 = "#version 100\n\n\nfloat yMin( vec4 interval2D ) {\n    return interval2D.y;\n}\n\nfloat xSpan( vec4 interval2D ) {\n    return interval2D.z;\n}\n\nfloat ySpan( vec4 interval2D ) {\n    return interval2D.w;\n}\n\nfloat subtractSplitValues( vec2 vSplit, vec2 wSplit ) {\n    return ( ( vSplit.x - wSplit.x ) + ( vSplit.y - wSplit.y ) );\n}\n\n\nuniform vec4 VIEWPORT_BOUNDS_AXIS;\n\n/**\n * Coords: xA_AXIS, xB_AXIS, y_AXIS\n */\nattribute vec3 inVertices;\n\n/**\n * Coords: xViewportMinA_AXIS, xViewportMinB_AXIS\n */\nattribute vec2 inViewportXMins;\n\n\nvoid main( ) {\n    vec2 x_AXIS = inVertices.xy;\n    vec2 xViewportMin_AXIS = inViewportXMins;\n    float x_VIEWFRAC = subtractSplitValues( x_AXIS, xViewportMin_AXIS ) / xSpan( VIEWPORT_BOUNDS_AXIS );\n\n    float y_AXIS = inVertices.z;\n    float y_VIEWFRAC = ( y_AXIS - yMin( VIEWPORT_BOUNDS_AXIS ) ) / ySpan( VIEWPORT_BOUNDS_AXIS );\n\n    vec2 xy_NDC = -1.0 + 2.0*vec2( x_VIEWFRAC, y_VIEWFRAC );\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

const { acos, ceil, floor: floor$2, min: min$2, PI: PI$2, sin } = Math;
const MARKER_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: markerVertShader_GLSL,
    fragShader_GLSL: markerFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'VIEWPORT_BOUNDS_AXIS',
        'IMAGE_TEXTURE',
        'IMAGE_SPRAWL_PX',
    ],
    attribNames: [
        'inVerticesA',
        'inVerticesB',
        'inViewportXMins',
    ],
});
const LINE_PROG_SOURCE$1 = Object.freeze({
    vertShader_GLSL: lineVertShader_GLSL$1,
    fragShader_GLSL: lineFragShader_GLSL$1,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
        'THICKNESS_PX',
        'FEATHER_PX',
    ],
    attribNames: [
        'inVerticesA',
        'inVerticesB',
        'inViewportXMins',
    ],
});
const JOIN_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: joinVertShader_GLSL,
    fragShader_GLSL: joinFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
        'DIAMETER_PX',
        'FEATHER_PX',
    ],
    attribNames: [
        'inVertices',
        'inViewportXMins',
    ],
});
const FILL_PROG_SOURCE$1 = Object.freeze({
    vertShader_GLSL: fillVertShader_GLSL$1,
    fragShader_GLSL: fillFragShader_GLSL$1,
    uniformNames: [
        'VIEWPORT_BOUNDS_AXIS',
        'COLOR',
    ],
    attribNames: [
        'inVertices',
        'inViewportXMins',
    ],
});
function getImageSprawl(image) {
    return {
        dxLeft_PX: 0 - image.xAnchor,
        dxRight_PX: image.imageData.width - image.xAnchor,
        dyBottom_PX: image.yAnchor - image.imageData.height,
        dyTop_PX: image.yAnchor - 0,
    };
}
class GeoJsonMarkerPin {
    constructor(...cssClasses) {
        this.peer = createDomPeer('geojson-marker-pin', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.fillColor = StyleProp.create(this.style, '--fill-color', cssColor, RED);
        this.strokeColor = StyleProp.create(this.style, '--stroke-color', cssColor, BLACK);
        cssClasses.forEach(s => this.peer.classList.add(s));
    }
    getTexture(context) {
        const instanceKey = context.getObjectKey(this);
        const fillColor = this.fillColor.get();
        const strokeColor = this.strokeColor.get();
        const dpr = currentDpr(this);
        const dMarker = context.getTexture(`geojson-marker-pin.${instanceKey}`, [dpr, fillColor, strokeColor], (gl, target) => {
            const hMarker = GeoJsonMarkerPin.drawImage(dpr, fillColor, strokeColor);
            gl.texParameteri(target, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(target, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            gl.texParameteri(target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            return texImage2D(gl, target, GL.RGBA, GL.UNSIGNED_BYTE, hMarker.imageData, {
                sprawl: getImageSprawl(hMarker),
            });
        });
        return {
            texture: dMarker.texture,
            sprawl: dMarker.meta.sprawl,
        };
    }
    static drawImage(dpr, fillColor, strokeColor) {
        
        const border = 1;
        const r = ceil(6 * dpr);
        const tipToCenter = 1.667 * r;
        const lineWidth = 2.5 * dpr;
        const phi = acos(r / tipToCenter);
        const thetaA = 0.5 * PI$2 + phi;
        const thetaB = 0.5 * PI$2 - phi;
        const leftRightPad = ceil(0.5 * lineWidth);
        const topPad = ceil(0.5 * lineWidth);
        const bottomPad = ceil(ceil(0.5 * lineWidth) / sin(0.5 * PI$2 - phi));
        const wTotal = 1 + 2 * r + 2 * leftRightPad + 2 * border;
        const hTotal = 1 + r + tipToCenter + topPad + bottomPad + 2 * border;
        const xCenter = 0.5 * wTotal;
        const yCenter = border + topPad + r;
        const yTip = yCenter + tipToCenter;
        const canvas = document.createElement('canvas');
        canvas.width = wTotal;
        canvas.height = hTotal;
        const g = requireNonNull(canvas.getContext('2d', { willReadFrequently: true }));
        g.clearRect(0, 0, wTotal, hTotal);
        g.moveTo(xCenter, yTip);
        g.arc(xCenter, yCenter, r, thetaA, thetaB);
        g.closePath();
        g.strokeStyle = strokeColor.cssString;
        g.lineWidth = lineWidth;
        g.stroke();
        g.fillStyle = fillColor.cssString;
        g.fill();
        const transitionColor = rgb(0.5 * fillColor.r + 0.5 * strokeColor.r, 0.5 * fillColor.g + 0.5 * strokeColor.g, 0.5 * fillColor.b + 0.5 * strokeColor.b);
        g.strokeStyle = transitionColor.cssString;
        g.lineWidth = min$2(1, 0.5 * lineWidth);
        g.stroke();
        return {
            xAnchor: xCenter,
            yAnchor: yTip,
            border,
            imageData: g.getImageData(0, 0, wTotal, hTotal),
        };
    }
}
class MarkersRenderable {
    constructor(renderableKey, props, scores, pointsA3, pointsB2) {
        this.renderableKey = renderableKey;
        this.props = props;
        this.scores = scores;
        this.pointsA3 = pointsA3;
        this.pointsB2 = pointsB2;
        this.type = 'MARKERS';
        this.peer = createDomPeer('geojson-markers-renderable', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.marker = StyleProp.create(this.style, '--marker', cssString, 'default');
        this.zIndex = StyleProp.create(this.style, '--z-index', cssFloat, 0);
        this.visible = StyleProp.create(this.style, '--visible', cssBoolean, true);
    }
}
class LinesRenderable {
    constructor(renderableKey, props, scores, trianglesA3, trianglesB2, points3) {
        this.renderableKey = renderableKey;
        this.props = props;
        this.scores = scores;
        this.trianglesA3 = trianglesA3;
        this.trianglesB2 = trianglesB2;
        this.points3 = points3;
        this.type = 'LINES';
        this.peer = createDomPeer('geojson-lines-renderable', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.color = StyleProp.create(this.style, '--color', cssColor, BLACK);
        this.width_LPX = StyleProp.create(this.style, '--width-px', cssFloat, 1);
        this.zIndex = StyleProp.create(this.style, '--z-index', cssFloat, 0);
        this.visible = StyleProp.create(this.style, '--visible', cssBoolean, true);
    }
}
class PolygonsRenderable {
    constructor(renderableKey, props, scores, fillTriangles3, strokeTrianglesA3, strokeTrianglesB2, strokePoints3) {
        this.renderableKey = renderableKey;
        this.props = props;
        this.scores = scores;
        this.fillTriangles3 = fillTriangles3;
        this.strokeTrianglesA3 = strokeTrianglesA3;
        this.strokeTrianglesB2 = strokeTrianglesB2;
        this.strokePoints3 = strokePoints3;
        this.type = 'POLYGONS';
        this.peer = createDomPeer('geojson-polygons-renderable', this, PeerType.OTHER);
        this.style = window.getComputedStyle(this.peer);
        this.fillColor = StyleProp.create(this.style, '--fill-color', cssColor, rgba(0, 0, 0, 0.25));
        this.strokeColor = StyleProp.create(this.style, '--stroke-color', cssColor, BLACK);
        this.strokeWidth_LPX = StyleProp.create(this.style, '--stroke-width-px', cssFloat, 1);
        this.zIndex = StyleProp.create(this.style, '--z-index', cssFloat, 0);
        this.visible = StyleProp.create(this.style, '--visible', cssBoolean, true);
    }
}
function createRenderable(renderableKey, props, preRenderable) {
    switch (preRenderable.type) {
        case 'MARKERS': return new MarkersRenderable(renderableKey, props, preRenderable.scores, preRenderable.pointsA3, preRenderable.pointsB2);
        case 'LINES': return new LinesRenderable(renderableKey, props, preRenderable.scores, preRenderable.trianglesA3, preRenderable.trianglesB2, preRenderable.points3);
        case 'POLYGONS': return new PolygonsRenderable(renderableKey, props, preRenderable.scores, preRenderable.fillTriangles3, preRenderable.strokeTrianglesA3, preRenderable.strokeTrianglesB2, preRenderable.strokePoints3);
    }
}
function addCssClass(cssClass) {
    return (renderable, disposers) => {
        if (!renderable.peer.classList.contains(cssClass)) {
            renderable.peer.classList.add(cssClass);
            disposers.add(() => {
                renderable.peer.classList.remove(cssClass);
            });
        }
    };
}
const renderableRanksByType = {
    POLYGONS: 1,
    LINES: 2,
    MARKERS: 3,
};
const RENDERING_ORDER = (a, b) => {
    const [aRenderable, aZIndex] = a;
    const [bRenderable, bZIndex] = b;
    const typeComparison = renderableRanksByType[aRenderable.type] - renderableRanksByType[bRenderable.type];
    if (typeComparison !== 0) {
        return typeComparison;
    }
    const zIndexComparison = aZIndex - bZIndex;
    if (zIndexComparison !== 0) {
        return zIndexComparison;
    }
    const altitudeComparison = aRenderable.scores.altitudeScore - bRenderable.scores.altitudeScore;
    if (altitudeComparison !== 0) {
        return altitudeComparison;
    }
    if (aRenderable.type === 'MARKERS' && bRenderable.type === 'MARKERS') {
        const latComparison = aRenderable.scores.latScore - bRenderable.scores.latScore;
        if (latComparison !== 0) {
            return latComparison;
        }
    }
    const areaComparison = aRenderable.scores.areaScore - bRenderable.scores.areaScore;
    if (areaComparison !== 0) {
        return areaComparison;
    }
    return 0;
};


const preRenderablesWorkerUrl = new URL("assets/@metsci/gleam-geojson/c947e3bc-worker.worker.js", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
function createPreRenderablesWorkerPool(options) {
    var _a;
    const workerCount = (_a = options === null || options === void 0 ? void 0 : options.workerCount) !== null && _a !== void 0 ? _a : min$2(2, navigator.hardwareConcurrency);
    return createWorkerPool(workerCount, i => new Worker(preRenderablesWorkerUrl, {
        name: `GeoJsonPreRenderables-${i.toFixed(0).padStart(2, '0')}`,
        credentials: options === null || options === void 0 ? void 0 : options.workerCredentials,
    }));
}
function createPreRenderableFactory(workerPool) {
    return (geometry, interp, proj, perceptibleProjDist) => {
        return submitToWorkerPool(workerPool, (worker, callKey) => {
            return createPreRenderablesAsync(worker, callKey, geometry, interp.desc, proj.desc, perceptibleProjDist);
        });
    };
}
function createPreRenderablesAsync(worker, callKey, geometry, interpDesc, projDesc, perceptibleProjDist) {
    
    worker.postMessage({ callKey, geometry, interpDesc, projDesc, perceptibleProjDist });
    
    return new Promise((resolve, reject) => {
        worker.termination.addListener({ once: true }, () => {
            reject('Worker was terminated');
        });
        const messageListener = (ev) => {
            const result = ev.data;
            if (result.callKey === callKey) {
                worker.removeEventListener('message', messageListener);
                resolve(result.preRenderables);
            }
        };
        worker.addEventListener('message', messageListener);
    });
}
class GeoJsonPainter {
    constructor(viewProj, createPreRenderables, viewBoundsFn, preRenderDefaults) {
        var _a, _b;
        this.peer = createDomPeer('geojson-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.visible = new RefBasic(true, tripleEquals);
        this.viewProj = viewProj;
        this.splitX = createXSplitter(this.viewProj.xSpan);
        this.viewBoundsFn = viewBoundsFn !== null && viewBoundsFn !== void 0 ? viewBoundsFn : frozenSupplier(Interval2D.fromEdges(0, 1, 0, 1));
        this.preRenderDefaults = {
            interp: (_a = preRenderDefaults === null || preRenderDefaults === void 0 ? void 0 : preRenderDefaults.interp) !== null && _a !== void 0 ? _a : SPHERICAL_GREAT_CIRCLE_INTERPOLATOR,
            perceptibleDistance_M: (_b = preRenderDefaults === null || preRenderDefaults === void 0 ? void 0 : preRenderDefaults.perceptibleDistance_M) !== null && _b !== void 0 ? _b : 100,
        };
        this.createPreRenderables = createPreRenderables;
        this.repaint = new ListenableBasic();
        this.markers = new Map();
        this.disposersByMarkerKey = new DisposerGroupMap();
        this.renderablesByDataKey = new LinkedMap();
        this.disposersByDataKey = new DisposerGroupMap();
        this.scratch = new Float32Scratch();
        this.registerMarker('default', new GeoJsonMarkerPin('default'));
    }
    attachToRepaint(repaint) {
        return this.repaint.addListener(() => {
            repaint.fire();
        });
    }
    
    registerMarker(markerKey, marker) {
        this.disposersByMarkerKey.disposeFor(markerKey);
        const disposers = this.disposersByMarkerKey.get(markerKey);
        if (marker.peer) {
            disposers.add(appendChild(this.peer, marker.peer));
        }
        disposers.add(mapAdd(this.markers, markerKey, marker));
        return disposers;
    }
    putData(dataKey, geojson, tweaks, preRenderOptions) {
        this.disposersByDataKey.disposeFor(dataKey);
        const disposers = this.disposersByDataKey.get(dataKey);
        disposers.add(() => this.repaint.fire());
        const renderables = new Array();
        disposers.add(mapAdd(this.renderablesByDataKey, dataKey, { visible: true, renderables }));
        let canceled = false;
        disposers.add(() => (canceled = true));
        const renderablesByGeometry = new Array();
        const addGeometry = async (geometry, props) => {
            var _a, _b;
            const geometryNum = renderablesByGeometry.length;
            const renderablesForGeometry = new Array();
            renderablesByGeometry.push(renderablesForGeometry);
            const preRenderOptions2 = isfn(preRenderOptions) ? preRenderOptions(geometry, props) : preRenderOptions;
            const interp = (_a = preRenderOptions2 === null || preRenderOptions2 === void 0 ? void 0 : preRenderOptions2.interp) !== null && _a !== void 0 ? _a : this.preRenderDefaults.interp;
            const perceptibleDistance_M = (_b = preRenderOptions2 === null || preRenderOptions2 === void 0 ? void 0 : preRenderOptions2.perceptibleDistance_M) !== null && _b !== void 0 ? _b : this.preRenderDefaults.perceptibleDistance_M;
            const perceptibleProjDist = perceptibleDistance_M * this.viewProj.xSpan / WGS84_EQUATORIAL_CIRCUMFERENCE_METERS;
            const preRenderables = await this.createPreRenderables(geometry, interp, this.viewProj, perceptibleProjDist);
            if (canceled) {
                return;
            }
            for (const preRenderable of preRenderables) {
                const renderableKey = `${dataKey}[${geometryNum}][${renderablesForGeometry.length}]`;
                renderablesForGeometry.push(createRenderable(renderableKey, props, preRenderable));
            }
            if (tweaks) {
                for (const renderable of renderablesForGeometry) {
                    for (const tweak of tweaks) {
                        try {
                            tweak(renderable, disposers);
                        }
                        catch (e) {
                            console.warn('Failed to apply GeoJSON renderable tweak', e);
                        }
                    }
                }
            }
            for (const renderable of renderablesForGeometry) {
                disposers.add(appendChild(this.peer, renderable.peer));
            }
            renderables.length = 0;
            renderables.push(...renderablesByGeometry.flat());
            this.repaint.fire();
        };
        const addFeature = (feature) => {
            var _a;
            addGeometry(feature.geometry, (_a = feature.properties) !== null && _a !== void 0 ? _a : {});
        };
        switch (geojson.type) {
            case 'FeatureCollection':
                geojson.features.forEach(f => addFeature(f));
                break;
            case 'Feature':
                addFeature(geojson);
                break;
            default:
                addGeometry(geojson, {});
                break;
        }
        return disposers;
    }
    hasData(dataKey) {
        return this.renderablesByDataKey.has(dataKey);
    }
    setDataVisible(dataKey, visible) {
        const en = this.renderablesByDataKey.get(dataKey);
        if (en && en.visible !== visible) {
            en.visible = visible;
            this.repaint.fire();
        }
    }
    removeData(dataKey) {
        this.disposersByDataKey.disposeFor(dataKey);
    }
    clearData() {
        this.disposersByDataKey.dispose();
    }
    paint(context, viewport_PX) {
        if (this.renderablesByDataKey.size > 0) {
            const painterKey = context.getObjectKey(this);
            const viewBounds = this.viewBoundsFn();
            
            const xViewMin = viewBounds.xMin;
            const xWrapSpan = this.viewProj.xSpan;
            
            const xMapBounds = Interval1D.fromRect(this.viewProj.lonToX(-PI$2), xWrapSpan);
            const xWrapNumMin = floor$2(xMapBounds.valueToFrac(viewBounds.xMin) - 1.0);
            const xWrapNumMax = floor$2(xMapBounds.valueToFrac(viewBounds.xMax) + 1.0);
            const xWrapCount = xWrapNumMax - xWrapNumMin + 1;
            const dViewportXMins = context.getBuffer(`geojson.${painterKey}.viewportXMins`, [xViewMin, xWrapSpan, xWrapNumMin, xWrapCount], (gl, target) => {
                const xs2 = this.scratch.getTempSpace(2 * xWrapCount);
                for (let i = 0; i < xWrapCount; i++) {
                    const x = viewBounds.xMin - (xWrapNumMin + i) * xWrapSpan;
                    const [xa, xb] = this.splitX(x);
                    xs2[2 * i + 0] = xa;
                    xs2[2 * i + 1] = xb;
                }
                return bufferDataF32(gl, target, xs2, 2);
            });
            const contextPlus = {
                context,
                painterKey,
                dpr: currentDpr(this),
                viewport_PX,
                viewBounds,
                viewProj: this.viewProj,
                markers: this.markers,
                gl: context.gl,
                glExt: requireNonNullish(context.gl.getExtension('ANGLE_instanced_arrays')),
                dViewportXMins,
            };
            const renderablePairs = new Array();
            for (const [_, { visible, renderables }] of this.renderablesByDataKey) {
                if (visible) {
                    for (const renderable of renderables) {
                        if (renderable.visible.get()) {
                            renderablePairs.push([renderable, renderable.zIndex.get()]);
                        }
                    }
                }
            }
            arraySortStable(renderablePairs, RENDERING_ORDER);
            enablePremultipliedAlphaBlending(context.gl);
            for (const [renderable] of renderablePairs) {
                switch (renderable.type) {
                    case 'MARKERS':
                        this.drawMarkers(contextPlus, renderable);
                        break;
                    case 'LINES':
                        this.drawLines(contextPlus, renderable);
                        break;
                    case 'POLYGONS':
                        this.drawPolygons(contextPlus, renderable);
                        break;
                }
            }
        }
    }
    drawMarkers(contextPlus, renderable) {
        const { context, painterKey, viewport_PX, viewBounds, markers, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, pointsA3, pointsB2 } = renderable;
        const markerKey = renderable.marker.get();
        const marker = markers.get(markerKey);
        
        if (marker) {
            const dMarker = marker.getTexture(context);
            const dVerticesA = context.getBuffer(`geojson.${painterKey}.marker.verticesA.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, pointsA3, 3);
            });
            const dVerticesB = context.getBuffer(`geojson.${painterKey}.marker.verticesB.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, pointsB2, 2);
            });
            const { program, attribs, uniforms } = context.getProgram(MARKER_PROG_SOURCE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVerticesA);
            gl.enableVertexAttribArray(attribs.inVerticesB);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformSize2D(gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span);
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                gl.activeTexture(GL.TEXTURE0);
                gl.bindTexture(GL.TEXTURE_2D, dMarker.texture);
                gl.uniform1i(uniforms.IMAGE_TEXTURE, 0);
                const sprawl = dMarker.sprawl;
                gl.uniform4f(uniforms.IMAGE_SPRAWL_PX, sprawl.dxLeft_PX, sprawl.dxRight_PX, sprawl.dyTop_PX, sprawl.dyBottom_PX);
                vertexAttribPointer(gl, attribs.inVerticesA, dVerticesA);
                vertexAttribPointer(gl, attribs.inVerticesB, dVerticesB);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVerticesB);
                gl.disableVertexAttribArray(attribs.inVerticesA);
                gl.useProgram(null);
            }
        }
    }
    drawLines(contextPlus, renderable) {
        const { context, painterKey, dpr, viewport_PX, viewBounds, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, trianglesA3, trianglesB2, points3 } = renderable;
        const color = renderable.color.get();
        const width_LPX = renderable.width_LPX.get();
        const width_PX = width_LPX * dpr;
        const feather_PX = 1.5;
        
        if (color && color.a > 0 && width_PX > 1) {
            const dVertices = context.getBuffer(`geojson.${painterKey}.line.points.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, points3, 3);
            });
            const { program, attribs, uniforms } = context.getProgram(JOIN_PROG_SOURCE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertices);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                glUniformRgba(gl, uniforms.COLOR, color);
                gl.uniform1f(uniforms.DIAMETER_PX, width_PX);
                gl.uniform1f(uniforms.FEATHER_PX, feather_PX);
                vertexAttribPointer(gl, attribs.inVertices, dVertices);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.POINTS, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVertices);
                gl.useProgram(null);
            }
        }
        
        if (color && color.a > 0 && width_PX > 0) {
            const dVerticesA = context.getBuffer(`geojson.${painterKey}.line.trianglesA.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, trianglesA3, 3);
            });
            const dVerticesB = context.getBuffer(`geojson.${painterKey}.line.trianglesB.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, trianglesB2, 2);
            });
            const { program, attribs, uniforms } = context.getProgram(LINE_PROG_SOURCE$1);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVerticesA);
            gl.enableVertexAttribArray(attribs.inVerticesB);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformSize2D(gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span);
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                glUniformRgba(gl, uniforms.COLOR, color);
                gl.uniform1f(uniforms.THICKNESS_PX, width_PX);
                gl.uniform1f(uniforms.FEATHER_PX, feather_PX);
                vertexAttribPointer(gl, attribs.inVerticesA, dVerticesA);
                vertexAttribPointer(gl, attribs.inVerticesB, dVerticesB);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVerticesB);
                gl.disableVertexAttribArray(attribs.inVerticesA);
                gl.useProgram(null);
            }
        }
    }
    drawPolygons(contextPlus, renderable) {
        const { context, painterKey, dpr, viewport_PX, viewBounds, gl, glExt, dViewportXMins } = contextPlus;
        const { renderableKey, fillTriangles3, strokeTrianglesA3, strokeTrianglesB2, strokePoints3 } = renderable;
        const fillColor = renderable.fillColor.get();
        const strokeColor = renderable.strokeColor.get();
        const strokeWidth_LPX = renderable.strokeWidth_LPX.get();
        const strokeWidth_PX = strokeWidth_LPX * dpr;
        const strokeFeather_PX = 1.5;
        
        
        if (fillColor && fillColor.a > 0) {
            const dVertices = context.getBuffer(`geojson.${painterKey}.polygon.fillTriangles.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, fillTriangles3, 3);
            });
            const { program, attribs, uniforms } = context.getProgram(FILL_PROG_SOURCE$1);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertices);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                glUniformRgba(gl, uniforms.COLOR, fillColor);
                vertexAttribPointer(gl, attribs.inVertices, dVertices);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVertices);
                gl.useProgram(null);
            }
        }
        
        if (strokeColor && strokeColor.a > 0 && strokeWidth_PX > 1) {
            const dVertices = context.getBuffer(`geojson.${painterKey}.polygon.strokePoints.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, strokePoints3, 3);
            });
            const { program, attribs, uniforms } = context.getProgram(JOIN_PROG_SOURCE);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVertices);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                glUniformRgba(gl, uniforms.COLOR, strokeColor);
                gl.uniform1f(uniforms.DIAMETER_PX, strokeWidth_PX);
                gl.uniform1f(uniforms.FEATHER_PX, strokeFeather_PX);
                vertexAttribPointer(gl, attribs.inVertices, dVertices);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.POINTS, 0, dVertices.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVertices);
                gl.useProgram(null);
            }
        }
        
        if (strokeColor && strokeColor.a > 0 && strokeWidth_PX > 0) {
            const dVerticesA = context.getBuffer(`geojson.${painterKey}.polygon.strokeTrianglesA.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, strokeTrianglesA3, 3);
            });
            const dVerticesB = context.getBuffer(`geojson.${painterKey}.polygon.strokeTrianglesB.${renderableKey}`, [renderable], (gl, target) => {
                return bufferDataF32(gl, target, strokeTrianglesB2, 2);
            });
            const { program, attribs, uniforms } = context.getProgram(LINE_PROG_SOURCE$1);
            gl.useProgram(program);
            gl.enableVertexAttribArray(attribs.inVerticesA);
            gl.enableVertexAttribArray(attribs.inVerticesB);
            gl.enableVertexAttribArray(attribs.inViewportXMins);
            glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 1);
            try {
                glUniformSize2D(gl, uniforms.VIEWPORT_SIZE_PX, viewport_PX.span);
                glUniformInterval2D(gl, uniforms.VIEWPORT_BOUNDS_AXIS, viewBounds);
                glUniformRgba(gl, uniforms.COLOR, strokeColor);
                gl.uniform1f(uniforms.THICKNESS_PX, strokeWidth_PX);
                gl.uniform1f(uniforms.FEATHER_PX, strokeFeather_PX);
                vertexAttribPointer(gl, attribs.inVerticesA, dVerticesA);
                vertexAttribPointer(gl, attribs.inVerticesB, dVerticesB);
                vertexAttribPointer(gl, attribs.inViewportXMins, dViewportXMins);
                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVerticesA.meta.unitCount, dViewportXMins.meta.unitCount);
            }
            finally {
                glExt.vertexAttribDivisorANGLE(attribs.inViewportXMins, 0);
                gl.disableVertexAttribArray(attribs.inViewportXMins);
                gl.disableVertexAttribArray(attribs.inVerticesB);
                gl.disableVertexAttribArray(attribs.inVerticesA);
                gl.useProgram(null);
            }
        }
    }
    dispose(context) {
        
        this.disposersByDataKey.dispose();
    }
}

/*! @license DOMPurify 3.0.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.1/LICENSE */

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var entries = Object.entries,
    setPrototypeOf = Object.setPrototypeOf,
    isFrozen = Object.isFrozen,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var freeze = Object.freeze,
    seal = Object.seal,
    create = Object.create; // eslint-disable-line import/no-mutable-exports

var _ref = typeof Reflect !== 'undefined' && Reflect,
    apply = _ref.apply,
    construct = _ref.construct;

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}

if (!seal) {
  seal = function seal(x) {
    return x;
  };
}

if (!construct) {
  construct = function construct(Func, args) {
    return _construct(Func, _toConsumableArray(args));
  };
}

var arrayForEach = unapply(Array.prototype.forEach);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);
var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringToString = unapply(String.prototype.toString);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);
var regExpTest = unapply(RegExp.prototype.test);
var typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return apply(func, thisArg, args);
  };
}
function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return construct(func, args);
  };
}
/* Add properties to a lookup table */

function addToSet(set, array, transformCaseFunc) {
  transformCaseFunc = transformCaseFunc ? transformCaseFunc : stringToLowerCase;

  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  var l = array.length;

  while (l--) {
    var element = array[l];

    if (typeof element === 'string') {
      var lcElement = transformCaseFunc(element);

      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}
/* Shallow clone an object */

function clone(object) {
  var newObject = create(null);

  var _iterator = _createForOfIteratorHelper(entries(object)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          property = _step$value[0],
          value = _step$value[1];

      newObject[property] = value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return newObject;
}
/* This method automatically checks if the prop is function
 * or getter and behaves accordingly. */

function lookupGetter(object, prop) {
  while (object !== null) {
    var desc = getOwnPropertyDescriptor(object, prop);

    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }

      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }

    object = getPrototypeOf(object);
  }

  function fallbackValue(element) {
    console.warn('fallback value for', element);
    return null;
  }

  return fallbackValue;
}

var html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']); // SVG

var svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']); // List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.

var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
var mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']); // Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.

var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
var text = freeze(['#text']);

var html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
var svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
var mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

var MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

var ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
var TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
var DOCTYPE_NAME = seal(/^html$/i);

var getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {Document} document The document object (to determine policy name suffix)
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported).
 */


var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
  if (_typeof(trustedTypes) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  } // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.


  var suffix = null;
  var ATTR_NAME = 'data-tt-policy-suffix';

  if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
    suffix = document.currentScript.getAttribute(ATTR_NAME);
  }

  var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML: function createHTML(html) {
        return html;
      },
      createScriptURL: function createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};

function createDOMPurify() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };
  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */


  DOMPurify.version = '3.0.1';
  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */

  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  var originalDocument = window.document;
  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      Element = window.Element,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === void 0 ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      HTMLFormElement = window.HTMLFormElement,
      DOMParser = window.DOMParser,
      trustedTypes = window.trustedTypes;
  var ElementPrototype = Element.prototype;
  var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  var getParentNode = lookupGetter(ElementPrototype, 'parentNode'); // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === 'function') {
    var template = document.createElement('template');

    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);

  var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
  var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      createDocumentFragment = _document.createDocumentFragment,
      getElementsByTagName = _document.getElementsByTagName;
  var importNode = originalDocument.importNode;
  var hooks = {};
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */

  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && typeof implementation.createHTMLDocument !== 'undefined';
  var MUSTACHE_EXPR$1 = MUSTACHE_EXPR,
      ERB_EXPR$1 = ERB_EXPR,
      TMPLIT_EXPR$1 = TMPLIT_EXPR,
      DATA_ATTR$1 = DATA_ATTR,
      ARIA_ATTR$1 = ARIA_ATTR,
      IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE$1 = ATTR_WHITESPACE;
  var IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(svgFilters), _toConsumableArray(mathMl$1), _toConsumableArray(text)));
  /* Allowed attribute names */

  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(mathMl), _toConsumableArray(xml)));
  /*
   * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */

  var CUSTOM_ELEMENT_HANDLING = Object.seal(Object.create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

  var FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

  var FORBID_ATTR = null;
  /* Decide if ARIA attributes are okay */

  var ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */

  var ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */

  var ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */

  var ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */

  var SAFE_FOR_TEMPLATES = false;
  /* Decide if document with <html>... should be returned */

  var WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */

  var SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */

  var FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */

  var RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */

  var RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */

  var RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */

  var SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */

  var SANITIZE_NAMED_PROPS = false;
  var SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */

  var KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */

  var IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */

  var USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */

  var FORBID_CONTENTS = null;
  var DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */

  var DATA_URI_TAGS = null;
  var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */

  var URI_SAFE_ATTRIBUTES = null;
  var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  var MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */

  var NAMESPACE = HTML_NAMESPACE;
  var IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */

  var ALLOWED_NAMESPACES = null;
  var DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  /* Parsing of strict XHTML documents */

  var PARSER_MEDIA_TYPE;
  var SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  var DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  var transformCaseFunc;
  /* Keep a reference to config to pass to hooks */

  var CONFIG = null;
  /* Ideally, do not touch anything below this line */

  /* ______________________________________________ */

  var formElement = document.createElement('form');

  var isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity


  var _parseConfig = function _parseConfig(cfg) {
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */


    if (!cfg || _typeof(cfg) !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */


    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */

    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = 'ALLOWED_NAMESPACES' in cfg ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
    cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
    transformCaseFunc // eslint-disable-line indent
    ) // eslint-disable-line indent
    : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
    cfg.ADD_DATA_URI_TAGS, // eslint-disable-line indent
    transformCaseFunc // eslint-disable-line indent
    ) // eslint-disable-line indent
    : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true

    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

    RETURN_DOM = cfg.RETURN_DOM || false; // Default false

    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false

    FORCE_BODY = cfg.FORCE_BODY || false; // Default false

    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false

    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

    IN_PLACE = cfg.IN_PLACE || false; // Default false

    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$1;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};

    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }

    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }

    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */


    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, _toConsumableArray(text));
      ALLOWED_ATTR = [];

      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }

      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */


    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }

      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
    }

    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }

      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
    }

    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }

    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }

      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */


    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */


    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */


    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    } // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.


    if (freeze) {
      freeze(cfg);
    }

    CONFIG = cfg;
  };

  var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  var HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']); // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.

  var COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */

  var ALL_SVG_TAGS = addToSet({}, svg$1);
  addToSet(ALL_SVG_TAGS, svgFilters);
  addToSet(ALL_SVG_TAGS, svgDisallowed);
  var ALL_MATHML_TAGS = addToSet({}, mathMl$1);
  addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
  /**
   *
   *
   * @param  {Element} element a DOM element whose namespace is being checked
   * @returns {boolean} Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */

  var _checkValidNamespace = function _checkValidNamespace(element) {
    var parent = getParentNode(element); // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.

    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }

    var tagName = stringToLowerCase(element.tagName);
    var parentTagName = stringToLowerCase(parent.tagName);

    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }

    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      } // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.


      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      } // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.


      return Boolean(ALL_SVG_TAGS[tagName]);
    }

    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      } // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points


      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      } // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.


      return Boolean(ALL_MATHML_TAGS[tagName]);
    }

    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }

      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      } // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace


      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    } // For XHTML and XML documents that support custom namespaces


    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    } // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.


    return false;
  };
  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */


  var _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });

    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      node.parentNode.removeChild(node);
    } catch (_) {
      node.remove();
    }
  };
  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */


  var _removeAttribute = function _removeAttribute(name, node) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: node
      });
    }

    node.removeAttribute(name); // We void attribute values for unremovable "is"" attributes

    if (name === 'is' && !ALLOWED_ATTR[name]) {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(node);
        } catch (_) {}
      } else {
        try {
          node.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */


  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc;
    var leadingWhitespace;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      var matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }

    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }

    var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */

    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */


    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);

      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {// Syntax error if dirtyPayload is invalid xml
      }
    }

    var body = doc.body || doc.documentElement;

    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */


    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }

    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */


  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
  };
  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */


  var _isClobbered = function _isClobbered(elm) {
    return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
  };
  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */


  var _isNode = function _isNode(object) {
    return _typeof(Node) === 'object' ? object instanceof Node : object && _typeof(object) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
  };
  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */


  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    arrayForEach(hooks[entryPoint], function (hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */


  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content;
    /* Execute a hook if present */

    _executeHook('beforeSanitizeElements', currentNode, null);
    /* Check if element is clobbered or can clobber */


    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Now let's check the element's type and name */


    var tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */

    _executeHook('uponSanitizeElement', currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */


    if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Remove element if anything forbids its presence */


    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _basicCustomElementTest(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) return false;
      }
      /* Keep content except for bad-listed elements */


      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        var parentNode = getParentNode(currentNode) || currentNode.parentNode;
        var childNodes = getChildNodes(currentNode) || currentNode.childNodes;

        if (childNodes && parentNode) {
          var childCount = childNodes.length;

          for (var i = childCount - 1; i >= 0; --i) {
            parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
          }
        }
      }

      _forceRemove(currentNode);

      return true;
    }
    /* Check whether element has a valid namespace */


    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Make sure that older browsers don't get noscript mXSS */


    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Sanitize element content to be template-safe */


    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = stringReplace(content, MUSTACHE_EXPR$1, ' ');
      content = stringReplace(content, ERB_EXPR$1, ' ');
      content = stringReplace(content, TMPLIT_EXPR$1, ' ');

      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity


  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */


    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if ( // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _basicCustomElementTest(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) || // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */

    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if (!value) ; else {
      return false;
    }

    return true;
  };
  /**
   * _basicCustomElementCheck
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   * @param {string} tagName name of the tag of the node to sanitize
   */


  var _basicCustomElementTest = function _basicCustomElementTest(tagName) {
    return tagName.indexOf('-') > 0;
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} currentNode to sanitize
   */


  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr;
    var value;
    var lcName;
    var l;
    /* Execute a hook if present */

    _executeHook('beforeSanitizeAttributes', currentNode, null);

    var attributes = currentNode.attributes;
    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */

    while (l--) {
      attr = attributes[l];
      var _attr = attr,
          name = _attr.name,
          namespaceURI = _attr.namespaceURI;
      value = name === 'value' ? attr.value : stringTrim(attr.value);
      lcName = transformCaseFunc(name);
      /* Execute a hook if present */

      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set

      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);

      value = hookEvent.attrValue;
      /* Did the hooks approve of the attribute? */

      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Remove attribute */


      _removeAttribute(name, currentNode);
      /* Did the hooks approve of the attribute? */


      if (!hookEvent.keepAttr) {
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */


      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);

        continue;
      }
      /* Sanitize attribute content to be template-safe */


      if (SAFE_FOR_TEMPLATES) {
        value = stringReplace(value, MUSTACHE_EXPR$1, ' ');
        value = stringReplace(value, ERB_EXPR$1, ' ');
        value = stringReplace(value, TMPLIT_EXPR$1, ' ');
      }
      /* Is `value` valid for this attribute? */


      var lcTag = transformCaseFunc(currentNode.nodeName);

      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */


      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode); // Prefix the value and later re-create the attribute with the sanitized value


        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Handle attributes that require Trusted Types */


      if (trustedTypesPolicy && _typeof(trustedTypes) === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              value = trustedTypesPolicy.createHTML(value);
              break;

            case 'TrustedScriptURL':
              value = trustedTypesPolicy.createScriptURL(value);
              break;
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */


      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }

        arrayPop(DOMPurify.removed);
      } catch (_) {}
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeAttributes', currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */


  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode;

    var shadowIterator = _createIterator(fragment);
    /* Execute a hook if present */


    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);
      /* Sanitize tags and elements */


      if (_sanitizeElements(shadowNode)) {
        continue;
      }
      /* Deep shadow DOM detected */


      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
      /* Check attributes, sanitize if necessary */


      _sanitizeAttributes(shadowNode);
    }
    /* Execute a hook if present */


    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };
  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity


  DOMPurify.sanitize = function (dirty) {
    var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var body;
    var importedNode;
    var currentNode;
    var returnNode;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */

    IS_EMPTY_INPUT = !dirty;

    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */


    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw typeErrorCreate('toString is not a function');
      } else {
        dirty = dirty.toString();

        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */


    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */


    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */


    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */

    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }

    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        var tagName = transformCaseFunc(dirty.nodeName);

        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);

      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */


      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */

      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */


    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */


    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */


    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }
      /* Shadow DOM detected, sanitize it */


      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
      /* Check attributes, sanitize if necessary */


      _sanitizeAttributes(currentNode);
    }
    /* If we sanitized `dirty` in-place, return it. */


    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */


    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmod) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */

    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */


    if (SAFE_FOR_TEMPLATES) {
      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$1, ' ');
      serializedHTML = stringReplace(serializedHTML, ERB_EXPR$1, ' ');
      serializedHTML = stringReplace(serializedHTML, TMPLIT_EXPR$1, ' ');
    }

    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */


  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);

    SET_CONFIG = true;
  };
  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */


  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */


  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    var lcTag = transformCaseFunc(tag);
    var lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */


  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }

    hooks[entryPoint] = hooks[entryPoint] || [];
    arrayPush(hooks[entryPoint], hookFunction);
  };
  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   * @return {Function} removed(popped) hook
   */


  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      return arrayPop(hooks[entryPoint]);
    }
  };
  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */


  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };
  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */


  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

var pointGeometry = Point$1;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point$1(x, y) {
    this.x = x;
    this.y = y;
}

Point$1.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point$1(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point$1.convert = function (a) {
    if (a instanceof Point$1) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point$1(a[0], a[1]);
    }
    return a;
};

var Point = pointGeometry;

var vectortilefeature = VectorTileFeature$1;

function VectorTileFeature$1(pbf, end, extent, keys, values) {
    // Public
    this.properties = {};
    this.extent = extent;
    this.type = 0;

    // Private
    this._pbf = pbf;
    this._geometry = -1;
    this._keys = keys;
    this._values = values;

    pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
    if (tag == 1) feature.id = pbf.readVarint();
    else if (tag == 2) readTag(pbf, feature);
    else if (tag == 3) feature.type = pbf.readVarint();
    else if (tag == 4) feature._geometry = pbf.pos;
}

function readTag(pbf, feature) {
    var end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var key = feature._keys[pbf.readVarint()],
            value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

VectorTileFeature$1.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature$1.prototype.loadGeometry = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (pbf.pos < end) {
        if (length <= 0) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (line) lines.push(line);
                line = [];
            }

            line.push(new Point(x, y));

        } else if (cmd === 7) {

            // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
            if (line) {
                line.push(line[0].clone()); // closePolygon
            }

        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature$1.prototype.bbox = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (pbf.pos < end) {
        if (length <= 0) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature$1.prototype.toGeoJSON = function(x, y, z) {
    var size = this.extent * Math.pow(2, z),
        x0 = this.extent * x,
        y0 = this.extent * y,
        coords = this.loadGeometry(),
        type = VectorTileFeature$1.types[this.type],
        i, j;

    function project(line) {
        for (var j = 0; j < line.length; j++) {
            var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
            line[j] = [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
        }
    }

    switch (this.type) {
    case 1:
        var points = [];
        for (i = 0; i < coords.length; i++) {
            points[i] = coords[i][0];
        }
        coords = points;
        project(coords);
        break;

    case 2:
        for (i = 0; i < coords.length; i++) {
            project(coords[i]);
        }
        break;

    case 3:
        coords = classifyRings(coords);
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
            }
        }
        break;
    }

    if (coords.length === 1) {
        coords = coords[0];
    } else {
        type = 'Multi' + type;
    }

    var result = {
        type: "Feature",
        geometry: {
            type: type,
            coordinates: coords
        },
        properties: this.properties
    };

    if ('id' in this) {
        result.id = this.id;
    }

    return result;
};

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
    var len = rings.length;

    if (len <= 1) return [rings];

    var polygons = [],
        polygon,
        ccw;

    for (var i = 0; i < len; i++) {
        var area = signedArea$1(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea$1(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

var VectorTileFeature = vectortilefeature;

function VectorTileLayer(pbf, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._pbf = pbf;
    this._keys = [];
    this._values = [];
    this._features = [];

    pbf.readFields(readLayer, this, end);

    this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    else if (tag === 2) layer._features.push(pbf.pos);
    else if (tag === 3) layer._keys.push(pbf.readString());
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
    var value = null,
        end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }

    return value;
}

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._pbf.pos = this._features[i];

    var end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
};

var earcutExports = {};
var earcut$1 = {
  get exports(){ return earcutExports; },
  set exports(v){ earcutExports = v; },
};

earcut$1.exports = earcut;
earcutExports.default = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 32767 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim | 0);
            triangles.push(ear.i / dim | 0);
            triangles.push(next.i / dim | 0);

            removeNode(ear);

            // skipping the next vertex leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

    // triangle bbox; min & max are calculated like this for speed
    var x0 = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
        y0 = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
        x1 = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
        y1 = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy);

    var p = c.next;
    while (p !== a) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

    // triangle bbox; min & max are calculated like this for speed
    var x0 = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
        y0 = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
        x1 = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
        y1 = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(x0, y0, minX, minY, invSize),
        maxZ = zOrder(x1, y1, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim | 0);
            triangles.push(p.i / dim | 0);
            triangles.push(b.i / dim | 0);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return filterPoints(p);
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
                earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        outerNode = eliminateHole(queue[i], outerNode);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    var bridge = findHoleBridge(hole, outerNode);
    if (!bridge) {
        return outerNode;
    }

    var bridgeReverse = splitPolygon(bridge, hole);

    // filter collinear points around the cuts
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                m = p.x < p.next.x ? p : p.next;
                if (x === hx) return m; // hole touches outer segment; pick leftmost endpoint
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m;

    do {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if (locallyInside(p, hole) &&
                (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    } while (p !== stop);

    return m;
}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = (x - minX) * invSize | 0;
    y = (y - minY) * invSize | 0;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
           (ax - px) * (by - py) >= (bx - px) * (ay - py) &&
           (bx - px) * (cy - py) >= (cx - px) * (by - py);
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
           (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
            (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
            equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));

    if (o1 !== o2 && o3 !== o4) return true; // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false;
}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertex index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertex nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = 0;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf8');

/*!
 * @metsci/gleam-mvt
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

const cssUrl = new URL("assets/@metsci/gleam-mvt/f827d5c3-defaults.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
const cssLink = createCssLink(cssUrl);
function createGleamMvtDefaultStyle() {
    return cssLink.cloneNode(true);
}
const defaultStyle = appendCssLink(document.head, createGleamMvtDefaultStyle());
const gleamMvtDefaultStyleLoading = defaultStyle.loading;

const TOC_DEFAULT_BOUNDS = [-180, -85.05112877980659, 180, 85.0511287798066];
const TOC_DEFAULT_MINZOOM = 0;
const TOC_DEFAULT_MAXZOOM = 30;
const TOC_DEFAULT_CRS = 'EPSG:3857';
async function fetchTileSetToc(url, reqInit) {
    const resp = await self.fetch(new Request(url, reqInit));
    if (resp.status !== 200) {
        throw new Error(`Fetch failed: url = ${resp.url}, status = ${resp.status} (${resp.statusText})`);
    }
    return await resp.json();
}
function areProjectionsCompatible(proj, toc) {
    var _a;
    const tocCrsKey = ((_a = toc.crs) !== null && _a !== void 0 ? _a : TOC_DEFAULT_CRS).toUpperCase();
    return proj.compatibleCrsKeys.has(tocCrsKey);
}
function addMvtAttributionElement(parent, tocPromise) {
    const disposers = new DisposerGroup();
    let alreadyDisposed = false;
    disposers.add(() => {
        alreadyDisposed = true;
    });
    tocPromise.then(toc => {
        if (!alreadyDisposed && toc.attribution) {
            const attributionDiv = document.createElement('div');
            attributionDiv.classList.add('mvt-attribution');
            attributionDiv.innerHTML = purify.sanitize(toc.attribution);
            disposers.add(appendChild(parent, attributionDiv));
        }
    });
    return disposers;
}
const FEATURE_TYPE_POINT = 1;
const FEATURE_TYPE_LINE = 2;
const FEATURE_TYPE_POLYGON = 3;

const { abs, pow } = Math;

function createZoomLevelComparator(zView) {
    return (a, b) => {
        if (a === b)
            return 0;
        
        if (a === 0)
            return -1;
        if (b === 0)
            return -1;
        
        if (a < 0 || a > zView) {
            a = -abs(a - zView);
        }
        if (b < 0 || b > zView) {
            b = -abs(b - zView);
        }
        
        return (b - a);
    };
}
function createTileIndexComparator(view) {
    const compareZoomLevels = createZoomLevelComparator(view.z);
    return (a, b) => {
        const zComparison = compareZoomLevels(a.zoomLevel, b.zoomLevel);
        if (zComparison !== 0)
            return zComparison;
        
        const zAB = a.zoomLevel;
        const zAdjustFactor = pow(2, zAB - view.z);
        const cCount = 1 << view.z;
        const cCenter = mod(view.cCenter * zAdjustFactor, cCount);
        const rCenter = view.rCenter * zAdjustFactor;
        const cDeltaA = wrapDelta(a.columnIndex - cCenter, cCount);
        const cDeltaB = wrapDelta(b.columnIndex - cCenter, cCount);
        const rDeltaA = a.rowIndex - rCenter;
        const rDeltaB = b.rowIndex - rCenter;
        const aDistSqFromCenter = cDeltaA * cDeltaA + rDeltaA * rDeltaA;
        const bDistSqFromCenter = cDeltaB * cDeltaB + rDeltaB * rDeltaB;
        return (aDistSqFromCenter - bDistSqFromCenter);
    };
}

const { floor: floor$1, max, min } = Math;
function getTileUrl(toc, tileIndex) {
    var _a;
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    const rowCount = 1 << zoomLevel;
    const columnCount = rowCount;
    const rowIndex_TMS = rowCount - rowIndex - 1;
    const prefix = (columnIndex % 16).toString(16) + (rowIndex % 16).toString(16);
    const z = zoomLevel.toFixed(0);
    const x = columnIndex.toFixed(0);
    const y = (toc.scheme === 'tms' ? rowIndex_TMS : rowIndex).toFixed(0);
    const quadKey = getBingMapsQuadKey(tileIndex);
    const urlTemplates = toc.tiles;
    const roundRobinIndex = (columnIndex + rowIndex) % urlTemplates.length;
    const urlTemplate = urlTemplates[roundRobinIndex];
    const url = urlTemplate
        .replace(/{prefix}/g, prefix)
        .replace(/{z}/g, z)
        .replace(/{x}/g, x)
        .replace(/{y}/g, y)
        .replace(/{quadkey}/g, quadKey);
    
    
    if (areProjectionsCompatible(MERCATOR_PROJ, toc)) {
        
        const xMin_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS * ((columnIndex + 0) / columnCount - 0.5);
        const xMax_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS * ((columnIndex + 1) / columnCount - 0.5);
        const yMin_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS * ((rowIndex_TMS + 0) / rowCount - 0.5);
        const yMax_3857 = WGS84_EQUATORIAL_CIRCUMFERENCE_METERS * ((rowIndex_TMS + 1) / rowCount - 0.5);
        return url.replace(/{bbox-epsg-3857}/g, `${xMin_3857},${yMin_3857},${xMax_3857},${yMax_3857}`);
    }
    else if (url.indexOf('{bbox-epsg-3857}')) {
        
        const crsString = (_a = toc.crs) !== null && _a !== void 0 ? _a : (TOC_DEFAULT_CRS + ' (by default)');
        throw new Error(`Tile URL templates with {bbox-epsg-3857} are only supported when projection is compatible with EPSG:3857: crs = ${crsString}, url-template = ${urlTemplate}`);
    }
    else {
        return url;
    }
}
function getBingMapsQuadKey(tileIndex) {
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    let result = '';
    for (let z = zoomLevel; z > 0; z--) {
        const bitmask = 1 << (z - 1);
        const digit = (((columnIndex & bitmask) ? 1 : 0) + ((rowIndex & bitmask) ? 2 : 0));
        result += digit.toFixed(0);
    }
    return result;
}
function getAncestorTileKeys(zoomLevel, columnIndex, rowIndex) {
    const result = new Array();
    let z = zoomLevel;
    let c = columnIndex;
    let r = rowIndex;
    while (z >= 0) {
        result.push([
            `z=${z},x=${c},y=${r}`,
            { zoomLevel: z, columnIndex: c, rowIndex: r },
        ]);
        z--;
        c = floor$1(c / 2);
        r = floor$1(r / 2);
    }
    return result;
}


const cacheWorkerUrl = new URL("assets/@metsci/gleam-mvt/a3bdf2f8-cacheWorker.worker.js", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
function createCacheWorkerPool(options) {
    var _a;
    const workerCount = (_a = options === null || options === void 0 ? void 0 : options.workerCount) !== null && _a !== void 0 ? _a : min(12, navigator.hardwareConcurrency);
    return createWorkerPool(workerCount, i => new Worker(cacheWorkerUrl, {
        name: `MvtCache-${i.toFixed(0).padStart(2, '0')}`,
        credentials: options === null || options === void 0 ? void 0 : options.workerCredentials,
    }));
}
function createRenderGroupsFactory(cacheWorkerPool) {
    return (view, tileIndex, tileBuffer) => {
        return submitToWorkerPool(cacheWorkerPool, (cacheWorker, callKey) => {
            return createRenderGroupsAsync(cacheWorker, callKey, view, tileIndex, tileBuffer);
        });
    };
}
function createRenderGroupsAsync(cacheWorker, callKey, view, tileIndex, tileBuffer) {
    
    cacheWorker.postMessage({
        callKey,
        viewUpdate: view,
        queryArgs: [tileIndex, tileBuffer],
    }, [tileBuffer]);
    
    return new Promise((resolve, reject) => {
        cacheWorker.termination.addListener({ once: true }, () => {
            reject('Worker was terminated');
        });
        const messageListener = (ev) => {
            const result = ev.data;
            if (result.callKey === callKey) {
                cacheWorker.removeEventListener('message', messageListener);
                resolve(result.queryResult);
            }
        };
        cacheWorker.addEventListener('message', messageListener);
    });
}
class MvtCache {
    
    constructor(tocPromise, createRenderGroups) {
        this.tocPromise = tocPromise;
        this.toc = undefined;
        this.tileEntries = new Map();
        this.createRenderGroups = createRenderGroups;
        this.repaint = new ListenableBasic();
        tocPromise.then(toc => {
            this.toc = toc;
            this.repaint.fire();
        });
    }
    attachToRepaint(repaint) {
        return this.repaint.addListener(IMMEDIATE, () => {
            repaint.fire();
        });
    }
    getTilesToRender(frameNum, view) {
        
        if (!this.toc) {
            return [];
        }
        
        const cs = new Set();
        const tocColumnCount = 1 << view.z;
        for (let cRaw = view.cMin; cRaw <= view.cMax; cRaw++) {
            cs.add(mod(cRaw, tocColumnCount));
        }
        
        const rs = new Set();
        const tocRowCount = 1 << view.z;
        for (let r = max(0, view.rMin); r <= min(tocRowCount - 1, view.rMax); r++) {
            rs.add(r);
        }
        
        const tilesToFetch = new Array();
        for (const r of rs) {
            for (const c of cs) {
                for (const [tileKey, tileIndex] of getAncestorTileKeys(view.z, c, r)) {
                    if (!this.tileEntries.has(tileKey)) {
                        tilesToFetch.push([tileKey, tileIndex]);
                    }
                }
            }
        }
        const compareTileIndices = createTileIndexComparator(view);
        tilesToFetch.sort((a, b) => compareTileIndices(a[1], b[1]));
        
        for (const [tileKey, tileIndex] of tilesToFetch) {
            const tileUrl = getTileUrl(this.toc, tileIndex);
            const fetchController = new AbortController();
            this.tileEntries.set(tileKey, {
                status: 'pending',
                tileUrl,
                tileIndex,
                expiresAfterFrameNum: frameNum + 1,
                fetchController,
            });
            run(async () => {
                try {
                    const resp = await self.fetch(new Request(tileUrl, {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'same-origin',
                        signal: fetchController.signal,
                    }));
                    if (!this.tileEntries.has(tileKey)) {
                        return;
                    }
                    if (resp.status !== 200) {
                        throw new Error(`Fetch failed: url = ${resp.url}, status = ${resp.status} (${resp.statusText})`);
                    }
                    const tileBuffer = await resp.arrayBuffer();
                    if (!this.tileEntries.has(tileKey)) {
                        return;
                    }
                    const renderGroups = await this.createRenderGroups(view, tileIndex, tileBuffer);
                    if (!renderGroups) {
                        return;
                    }
                    if (!this.tileEntries.has(tileKey)) {
                        return;
                    }
                    this.tileEntries.set(tileKey, {
                        status: 'ready',
                        tileUrl,
                        tileIndex,
                        expiresAfterFrameNum: undefined,
                        renderGroups,
                    });
                }
                catch (e) {
                    if (!this.tileEntries.has(tileKey)) ;
                    else if (e instanceof DOMException && e.name === 'AbortError') ;
                    else {
                        
                        const millisUntilRetry = 10 * 60e3;
                        console.warn(`Tile ${tileUrl} is unavailable: time-until-retry = ${1e-3 * millisUntilRetry} seconds\n`, e);
                        this.tileEntries.set(tileKey, {
                            status: 'unavailable',
                            tileUrl,
                            tileIndex,
                            expiresAfterTime_PMILLIS: getNow_PMILLIS() + millisUntilRetry,
                        });
                    }
                }
                finally {
                    this.repaint.fire();
                }
            });
        }
        
        const tileEntriesToRender = new Set();
        for (const r of rs) {
            for (const c of cs) {
                
                
                let bestTileEntry = undefined;
                for (const [tileKey] of getAncestorTileKeys(view.z, c, r)) {
                    const tileEntry = this.tileEntries.get(tileKey);
                    switch (tileEntry === null || tileEntry === void 0 ? void 0 : tileEntry.status) {
                        case 'pending':
                            {
                                tileEntry.expiresAfterFrameNum = frameNum + 1;
                            }
                            break;
                        case 'ready':
                            {
                                tileEntry.expiresAfterFrameNum = frameNum + 1;
                                if (!bestTileEntry) {
                                    bestTileEntry = tileEntry;
                                }
                            }
                            break;
                    }
                }
                if (bestTileEntry) {
                    tileEntriesToRender.add(bestTileEntry);
                }
            }
        }
        
        for (const [tileKey, tileEntry] of this.tileEntries) {
            switch (tileEntry.status) {
                case 'pending':
                    {
                        if (frameNum > tileEntry.expiresAfterFrameNum) {
                            this.tileEntries.delete(tileKey);
                            tileEntry.fetchController.abort();
                        }
                    }
                    break;
                case 'ready':
                    {
                        if (tileEntry.expiresAfterFrameNum === undefined) {
                            
                            tileEntry.expiresAfterFrameNum = frameNum + 1;
                        }
                        else if (frameNum > tileEntry.expiresAfterFrameNum) {
                            this.tileEntries.delete(tileKey);
                        }
                    }
                    break;
                case 'unavailable':
                    {
                        if (getNow_PMILLIS() > tileEntry.expiresAfterTime_PMILLIS) {
                            
                            this.tileEntries.delete(tileKey);
                        }
                    }
                    break;
            }
        }
        
        const tileEntriesInRenderOrder = new Array(...tileEntriesToRender);
        arraySortStable(tileEntriesInRenderOrder, (a, b) => {
            return (a.tileIndex.zoomLevel - b.tileIndex.zoomLevel);
        });
        return tileEntriesInRenderOrder;
    }
    dispose() {
        this.tileEntries.clear();
    }
}

var fillFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\n\nvoid main( ) {\n    gl_FragColor = vec4( COLOR.a*COLOR.rgb, COLOR.a );\n}\n";

var fillVertShader_GLSL = "#version 100\n\nuniform vec2 VIEWPORT_SIZE_PX;\n\n/**\n * Coords: x_STEPS, y_STEPS\n */\nattribute vec2 inCoords;\nattribute vec4 inXyOriginAndStep_PX;\n\nvoid main( ) {\n    vec2 origin_PX = inXyOriginAndStep_PX.xy;\n    vec2 step_PX = inXyOriginAndStep_PX.zw;\n\n    vec2 xy_STEPS = inCoords.xy;\n    vec2 xy_PX = origin_PX + xy_STEPS*step_PX;\n    vec2 xy_NDC = -1.0 + 2.0*( xy_PX / VIEWPORT_SIZE_PX );\n\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n}\n";

var lineFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\nuniform float THICKNESS_PX;\nuniform float FEATHER_PX;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    float featherMask = smoothstep( 0.5*( THICKNESS_PX + FEATHER_PX ), 0.5*( THICKNESS_PX - FEATHER_PX ), abs( vLateral_PX ) );\n\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var lineVertShader_GLSL = "#version 100\n\nuniform vec2 VIEWPORT_SIZE_PX;\nuniform lowp float THICKNESS_PX;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x_STEPS, y_STEPS, dxForward_STEPS (unnormalized), dyForward_STEPS (unnormalized)\n */\nattribute vec4 inCoords;\nattribute vec4 inXyOriginAndStep_PX;\n\nvarying float vLateral_PX;\n\nvoid main( ) {\n    vec2 origin_PX = inXyOriginAndStep_PX.xy;\n    vec2 step_PX = inXyOriginAndStep_PX.zw;\n\n    vec2 xy_STEPS = inCoords.xy;\n    vec2 xy_PX = origin_PX + xy_STEPS*step_PX;\n\n    vec2 dxyForward_STEPS = inCoords.zw;\n    vec2 dxyForward_PX = dxyForward_STEPS*step_PX;\n    vec2 dxyForwardUnit_PX = normalize( dxyForward_PX );\n    vec2 dxyRightUnit_PX = vec2( dxyForwardUnit_PX.y, -dxyForwardUnit_PX.x );\n\n    vec2 xyFinal_PX = xy_PX + 0.5*( THICKNESS_PX + FEATHER_PX )*dxyRightUnit_PX;\n    vec2 xyFinal_NDC = -1.0 + 2.0*( xyFinal_PX / VIEWPORT_SIZE_PX );\n\n    gl_Position = vec4( xyFinal_NDC, 0.0, 1.0 );\n\n    bool negativeLateral = ( dxyForward_STEPS.x < 0.0 || ( dxyForward_STEPS.x == 0.0 && dxyForward_STEPS.y < 0.0 ) );\n    vLateral_PX = ( negativeLateral ? -0.5 : +0.5 )*( THICKNESS_PX + FEATHER_PX );\n}\n";

var pointFragShader_GLSL = "#version 100\nprecision lowp float;\n\nuniform vec4 COLOR;\nuniform float DIAMETER_PX;\nuniform float FEATHER_PX;\n\nvoid main( ) {\n    vec2 xy_PX = ( gl_PointCoord - 0.5 )*( DIAMETER_PX + FEATHER_PX );\n    float r_PX = sqrt( dot( xy_PX, xy_PX ) );\n\n    float rOuter_PX = 0.5*( DIAMETER_PX + FEATHER_PX );\n    float rInner_PX = 0.5*( DIAMETER_PX - FEATHER_PX );\n    float featherMask = smoothstep( rOuter_PX, rInner_PX, r_PX );\n\n    float alpha = featherMask * COLOR.a;\n    gl_FragColor = vec4( alpha*COLOR.rgb, alpha );\n}\n";

var pointVertShader_GLSL = "#version 100\n\nuniform vec2 VIEWPORT_SIZE_PX;\nuniform lowp float DIAMETER_PX;\nuniform lowp float FEATHER_PX;\n\n/**\n * Coords: x_STEPS, y_STEPS\n */\nattribute vec2 inCoords;\nattribute vec4 inXyOriginAndStep_PX;\n\nvoid main( ) {\n    vec2 origin_PX = inXyOriginAndStep_PX.xy;\n    vec2 step_PX = inXyOriginAndStep_PX.zw;\n\n    vec2 xy_STEPS = inCoords.xy;\n    vec2 xy_PX = origin_PX + xy_STEPS*step_PX;\n    vec2 xy_NDC = -1.0 + 2.0*( xy_PX / VIEWPORT_SIZE_PX );\n\n    gl_Position = vec4( xy_NDC, 0.0, 1.0 );\n    gl_PointSize = DIAMETER_PX + FEATHER_PX;\n}\n";

const { floor, log2, PI: PI$1, round } = Math;
const FILL_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: fillVertShader_GLSL,
    fragShader_GLSL: fillFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
    ],
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ],
});
const LINE_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: lineVertShader_GLSL,
    fragShader_GLSL: lineFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
        'THICKNESS_PX',
        'FEATHER_PX',
    ],
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ],
});
const POINT_PROG_SOURCE = Object.freeze({
    vertShader_GLSL: pointVertShader_GLSL,
    fragShader_GLSL: pointFragShader_GLSL,
    uniformNames: [
        'VIEWPORT_SIZE_PX',
        'COLOR',
        'DIAMETER_PX',
        'FEATHER_PX',
    ],
    attribNames: [
        'inCoords',
        'inXyOriginAndStep_PX',
    ],
});
function projectTocBounds(toc, toProj) {
    var _a;
    const [westLon_DEG, southLat_DEG, eastLon_DEG, northLat_DEG] = (_a = toc.bounds) !== null && _a !== void 0 ? _a : TOC_DEFAULT_BOUNDS;
    const xMin = toProj.lonToX(westLon_DEG * DEG_TO_RAD);
    const xMax = toProj.lonToX(eastLon_DEG * DEG_TO_RAD);
    const yMin = toProj.latToY(southLat_DEG * DEG_TO_RAD);
    const yMax = toProj.latToY(northLat_DEG * DEG_TO_RAD);
    return Interval2D.fromEdges(xMin, xMax, yMin, yMax);
}
function boxToFracOfOtherBox(box, otherBox) {
    const xMin = otherBox.x.valueToFrac(box.xMin);
    const xMax = otherBox.x.valueToFrac(box.xMax);
    const yMin = otherBox.y.valueToFrac(box.yMin);
    const yMax = otherBox.y.valueToFrac(box.yMax);
    return Interval2D.fromEdges(xMin, xMax, yMin, yMax);
}
function boxFromFracOfOtherBox(frac, otherBox) {
    const xMin = otherBox.x.fracToValue(frac.xMin);
    const xMax = otherBox.x.fracToValue(frac.xMax);
    const yMin = otherBox.y.fracToValue(frac.yMin);
    const yMax = otherBox.y.fracToValue(frac.yMax);
    return Interval2D.fromEdges(xMin, xMax, yMin, yMax);
}
function getTilesInView(tocBounds, viewBounds, zoomLevel) {
    const tocRowCount = 1 << zoomLevel;
    const tocColumnCount = tocRowCount;
    const viewBounds_TOCFRAC = boxToFracOfOtherBox(viewBounds, tocBounds);
    const viewCenter = viewBounds.fracToValue(new Point2D(0.5, 0.5));
    const viewCenter_TOCFRAC = tocBounds.valueToFrac(viewCenter);
    return {
        z: zoomLevel,
        cMin: floor(viewBounds_TOCFRAC.xMin * tocColumnCount),
        cMax: floor(viewBounds_TOCFRAC.xMax * tocColumnCount),
        cCenter: viewCenter_TOCFRAC.x * tocColumnCount,
        rMin: floor((1.0 - viewBounds_TOCFRAC.yMax) * tocRowCount),
        rMax: floor((1.0 - viewBounds_TOCFRAC.yMin) * tocRowCount),
        rCenter: (1.0 - viewCenter_TOCFRAC.y) * tocRowCount,
    };
}
function getProjectedTileBounds(tocBounds, tileIndex) {
    const { zoomLevel, columnIndex, rowIndex } = tileIndex;
    const oneOverTocRowCount = 1.0 / (1 << zoomLevel);
    const oneOverTocColumnCount = oneOverTocRowCount;
    const xMin_TOCFRAC = (columnIndex + 0) * oneOverTocColumnCount;
    const xMax_TOCFRAC = (columnIndex + 1) * oneOverTocColumnCount;
    const yMin_TOCFRAC = 1.0 - ((rowIndex + 0) * oneOverTocRowCount);
    const yMax_TOCFRAC = 1.0 - ((rowIndex + 1) * oneOverTocRowCount);
    const tileBounds_TOCFRAC = Interval2D.fromEdges(xMin_TOCFRAC, xMax_TOCFRAC, yMin_TOCFRAC, yMax_TOCFRAC);
    return boxFromFracOfOtherBox(tileBounds_TOCFRAC, tocBounds);
}
function getViewColumnIndicesByWrappedColumnIndexByZoomLevel(view) {
    const csByCWrappedByZ = new Array();
    let { z, cMin, cMax } = view;
    while (z >= 0) {
        const csByCWrapped = new Map();
        const cCount = 1 << z;
        for (let c = cMin; c <= cMax; c++) {
            const cWrapped = mod(c, cCount);
            mapSetIfAbsent(csByCWrapped, cWrapped, () => []).push(c);
        }
        csByCWrappedByZ[z] = csByCWrapped;
        z--;
        cMin = floor(cMin / 2);
        cMax = floor(cMax / 2);
    }
    return csByCWrappedByZ;
}
const cssRenderGroupKey = new CssParser('e.g. landcover_sand_area', s => {
    const i = s.lastIndexOf('_');
    if (i >= 0) {
        const stem = s.substring(0, i);
        switch (s.substring(i + 1)) {
            case 'point': return { stem, type: FEATURE_TYPE_POINT };
            case 'line': return { stem, type: FEATURE_TYPE_LINE };
            case 'area': return { stem, type: FEATURE_TYPE_POLYGON };
        }
    }
    return UNPARSEABLE;
});
class MvtPainter {
    constructor(cache, viewProj, viewBoundsFn = frozenSupplier(Interval2D.fromEdges(0, 1, 0, 1))) {
        this.peer = createDomPeer('mvt-painter', this, PeerType.PAINTER);
        this.style = window.getComputedStyle(this.peer);
        this.renderGroupKeys = StyleProp.create(this.style, '--render-groups', cssArray(cssRenderGroupKey), 'background_area, water_area, waterway_line');
        this.featureFillColor = UnboundStyleProp.create('--fill-color', cssColor, GRAY, 100);
        this.featureLineColor = UnboundStyleProp.create('--line-color', cssColor, GRAY, 100);
        this.featureLineThickness_LPX = UnboundStyleProp.create('--line-thickness-px', cssFloat, 1, 100);
        this.visible = new RefBasic(true, tripleEquals);
        this.viewProj = viewProj;
        this.viewBoundsFn = viewBoundsFn;
        this.cache = cache;
        this.tocBounds = undefined;
        this.stylesByGroupKey = new Map();
        this.cache.tocPromise.then(toc => {
            var _a;
            if (!areProjectionsCompatible(viewProj, toc)) {
                throw new Error(`Tile coords are not compatible with view projection: tile-crs=${(_a = toc.crs) !== null && _a !== void 0 ? _a : TOC_DEFAULT_CRS}, view-proj=${viewProj.name}`);
            }
            this.toc = toc;
            this.tocBounds = projectTocBounds(this.toc, this.viewProj);
        });
    }
    paint(context, viewport_PX) {
        var _a, _b;
        if (!this.toc || !this.tocBounds) {
            return;
        }
        const gl = context.gl;
        const glExt = requireNonNullish(gl.getExtension('ANGLE_instanced_arrays'));
        
        const renderGroupKeys = this.renderGroupKeys.get();
        
        const fillColorsByGroupKey = new Map();
        const getFillColor = (groupKey) => {
            return mapSetIfAbsent(fillColorsByGroupKey, groupKey, () => {
                const groupStyle = this.getRenderGroupStyle(groupKey);
                return this.featureFillColor.get(groupStyle);
            });
        };
        const lineColorsByGroupKey = new Map();
        const getLineColor = (groupKey) => {
            return mapSetIfAbsent(lineColorsByGroupKey, groupKey, () => {
                const groupStyle = this.getRenderGroupStyle(groupKey);
                return this.featureLineColor.get(groupStyle);
            });
        };
        const lineThicknessesByGroupKey_LPX = new Map();
        const getLineThickness_LPX = (groupKey) => {
            return mapSetIfAbsent(lineThicknessesByGroupKey_LPX, groupKey, () => {
                const groupStyle = this.getRenderGroupStyle(groupKey);
                return this.featureLineThickness_LPX.get(groupStyle);
            });
        };
        
        const lpxToPx = currentDpr(this);
        const pxToLpx = 1.0 / lpxToPx;
        
        const viewBounds = this.viewBoundsFn();
        const yPerLpx = viewBounds.h / (viewport_PX.h * pxToLpx);
        const radPerY = this.viewProj.maxDLatDY_RAD();
        const rootTileNominalGrainsPerRad = 360 / PI$1;
        const rootTileNominalGrainsPerLpx = rootTileNominalGrainsPerRad * radPerY * yPerLpx;
        const zoomLevel = clamp((_a = this.toc.minzoom) !== null && _a !== void 0 ? _a : TOC_DEFAULT_MINZOOM, (_b = this.toc.maxzoom) !== null && _b !== void 0 ? _b : TOC_DEFAULT_MAXZOOM, round(-log2(rootTileNominalGrainsPerLpx)));
        
        const tilesInView = getTilesInView(this.tocBounds, viewBounds, zoomLevel);
        const tileEntriesToRender = this.cache.getTilesToRender(context.frameNum, tilesInView);
        
        const getXyOriginAndSteps = (tileUrl, extent, perInstanceTileBounds_PX) => {
            const dXyOriginAndStepKey = `${tileUrl}::${extent}::xyOriginAndStep4`;
            return context.getBuffer(dXyOriginAndStepKey, [context.frameNum], (gl, target) => {
                const xyOriginAndStep4 = new Float32Array(4 * perInstanceTileBounds_PX.length);
                let i = 0;
                for (const tileBounds_PX of perInstanceTileBounds_PX) {
                    const xOrigin_PX = tileBounds_PX.xMin;
                    const yOrigin_PX = tileBounds_PX.yMin;
                    const xStep_PX = tileBounds_PX.w / extent;
                    const yStep_PX = tileBounds_PX.h / extent;
                    i = put4f(xyOriginAndStep4, i, xOrigin_PX, yOrigin_PX, xStep_PX, yStep_PX);
                }
                return bufferDataF32(gl, target, xyOriginAndStep4, 4);
            });
        };
        
        const paintLineSegments = (tileUrl, perInstanceTileBounds_PX, stem, groups) => {
            if (groups && groups.some(g => (g.coords.triangleVertexCount >= 3))) {
                const groupKey = `${stem}_line`;
                const thickness_PX = getLineThickness_LPX(groupKey) * lpxToPx;
                const color = getLineColor(groupKey);
                if (thickness_PX > 0 && color.a > 0) {
                    const { program, attribs, uniforms } = context.getProgram(LINE_PROG_SOURCE);
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    gl.enableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                    glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 1);
                    try {
                        gl.uniform2f(uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h);
                        gl.uniform1f(uniforms.THICKNESS_PX, thickness_PX);
                        gl.uniform1f(uniforms.FEATHER_PX, 1.5);
                        glUniformRgba(gl, uniforms.COLOR, color);
                        for (const { extent, coords: { triangleCoords4, triangleVertexCount } } of groups) {
                            if (triangleVertexCount >= 3) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::lineVertices`;
                                const dVertices = context.getBuffer(dVerticesKey, [], (gl, target) => {
                                    return bufferDataI16(gl, target, triangleCoords4.subarray(0, 4 * triangleVertexCount), 4);
                                });
                                vertexAttribPointer(gl, attribs.inCoords, dVertices);
                                const dXyOriginAndSteps = getXyOriginAndSteps(tileUrl, extent, perInstanceTileBounds_PX);
                                vertexAttribPointer(gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps);
                                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount);
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 0);
                        gl.disableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
            }
        };
        
        const paintLineJoins = (tileUrl, perInstanceTileBounds_PX, stem, groups) => {
            if (groups && groups.some(g => (g.coords.pointVertexCount >= 1))) {
                const groupKey = `${stem}_line`;
                const thickness_PX = getLineThickness_LPX(groupKey) * lpxToPx;
                const color = getLineColor(groupKey);
                if (thickness_PX > 1 && color.a > 0) {
                    const { program, attribs, uniforms } = context.getProgram(POINT_PROG_SOURCE);
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    gl.enableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                    glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 1);
                    try {
                        gl.uniform2f(uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h);
                        gl.uniform1f(uniforms.DIAMETER_PX, thickness_PX);
                        gl.uniform1f(uniforms.FEATHER_PX, 1.5);
                        glUniformRgba(gl, uniforms.COLOR, color);
                        for (const { extent, coords: { pointCoords2, pointVertexCount } } of groups) {
                            if (pointVertexCount >= 1) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::pointVertices`;
                                const dVertices = context.getBuffer(dVerticesKey, [], (gl, target) => {
                                    return bufferDataI16(gl, target, pointCoords2.subarray(0, 2 * pointVertexCount), 2);
                                });
                                vertexAttribPointer(gl, attribs.inCoords, dVertices);
                                const dXyOriginAndSteps = getXyOriginAndSteps(tileUrl, extent, perInstanceTileBounds_PX);
                                vertexAttribPointer(gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps);
                                glExt.drawArraysInstancedANGLE(GL.POINTS, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount);
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 0);
                        gl.disableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
            }
        };
        
        const paintPolygonFills = (tileUrl, perInstanceTileBounds_PX, stem, groups) => {
            if (groups && groups.some(g => (g.coords.triangleVertexCount >= 3))) {
                const groupKey = `${stem}_area`;
                const color = getFillColor(groupKey);
                if (color.a > 0) {
                    const { program, attribs, uniforms } = context.getProgram(FILL_PROG_SOURCE);
                    gl.useProgram(program);
                    gl.enableVertexAttribArray(attribs.inCoords);
                    gl.enableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                    glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 1);
                    try {
                        gl.uniform2f(uniforms.VIEWPORT_SIZE_PX, viewport_PX.w, viewport_PX.h);
                        glUniformRgba(gl, uniforms.COLOR, color);
                        for (const { extent, coords: { triangleCoords2, triangleVertexCount } } of groups) {
                            if (triangleVertexCount >= 3) {
                                const dVerticesKey = `${tileUrl}::${groupKey}::${extent}::fillVertices`;
                                const dVertices = context.getBuffer(dVerticesKey, [], (gl, target) => {
                                    return bufferDataI16(gl, target, triangleCoords2.subarray(0, 2 * triangleVertexCount), 2);
                                });
                                vertexAttribPointer(gl, attribs.inCoords, dVertices);
                                const dXyOriginAndSteps = getXyOriginAndSteps(tileUrl, extent, perInstanceTileBounds_PX);
                                vertexAttribPointer(gl, attribs.inXyOriginAndStep_PX, dXyOriginAndSteps);
                                glExt.drawArraysInstancedANGLE(GL.TRIANGLES, 0, dVertices.meta.unitCount, dXyOriginAndSteps.meta.unitCount);
                            }
                        }
                    }
                    finally {
                        glExt.vertexAttribDivisorANGLE(attribs.inXyOriginAndStep_PX, 0);
                        gl.disableVertexAttribArray(attribs.inXyOriginAndStep_PX);
                        gl.disableVertexAttribArray(attribs.inCoords);
                        gl.useProgram(null);
                    }
                }
            }
        };
        
        enablePremultipliedAlphaBlending(gl);
        
        const csByCWrappedByZ = getViewColumnIndicesByWrappedColumnIndexByZoomLevel(tilesInView);
        for (const { tileUrl, tileIndex, renderGroups } of tileEntriesToRender) {
            const tileBounds_PX = new Array();
            const { zoomLevel, rowIndex } = tileIndex;
            const columnIndices = mapRequire(csByCWrappedByZ[zoomLevel], tileIndex.columnIndex);
            const viewportWidth_PX = viewport_PX.w;
            const viewportHeight_PX = viewport_PX.h;
            for (const columnIndex of columnIndices) {
                const tileInstanceBounds_PROJ = getProjectedTileBounds(this.tocBounds, { zoomLevel, columnIndex, rowIndex });
                const tileInstanceBounds_FRAC = boxToFracOfOtherBox(tileInstanceBounds_PROJ, viewBounds);
                const tileInstanceBounds_PX = Interval2D.fromXy(tileInstanceBounds_FRAC.x.scale(viewportWidth_PX), tileInstanceBounds_FRAC.y.scale(viewportHeight_PX));
                tileBounds_PX.push(tileInstanceBounds_PX);
            }
            for (const { stem, type } of renderGroupKeys) {
                switch (type) {
                    case FEATURE_TYPE_POINT:
                        break;
                    case FEATURE_TYPE_LINE:
                        {
                            const groups = renderGroups.lineGroupsByStem.get(stem);
                            paintLineSegments(tileUrl, tileBounds_PX, stem, groups);
                            paintLineJoins(tileUrl, tileBounds_PX, stem, groups);
                        }
                        break;
                    case FEATURE_TYPE_POLYGON:
                        {
                            const groups = renderGroups.polygonGroupsByStem.get(stem);
                            paintPolygonFills(tileUrl, tileBounds_PX, stem, groups);
                        }
                        break;
                }
            }
        }
    }
    getRenderGroupStyle(groupKey) {
        
        const styleEntry = mapSetIfAbsent(this.stylesByGroupKey, groupKey, () => {
            const peer = createDomPeer('feature-style', this, PeerType.OTHER);
            if (groupKey) {
                peer.classList.add(groupKey);
            }
            this.peer.appendChild(peer);
            const style = window.getComputedStyle(peer);
            return { peer, style };
        });
        return styleEntry.style;
    }
    dispose(context) {
        this.cache.dispose();
    }
}

const simpleFeatures = {
    type: 'FeatureCollection',
    features: [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Point',
                coordinates: [-77.35891827299356, 38.958433649794124],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [[
                        [-77.36298667802035, 38.960376973353675],
                        [-77.35459348700716, 38.96004084970365],
                        [-77.35506177663451, 38.95741482879896],
                        [-77.36276153877644, 38.95722575153806],
                    ]],
            },
        }],
};
const antimeridianFeatures = {
    type: 'FeatureCollection',
    features: [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiPoint',
                coordinates: [
                    [-179.8, -20],
                    [-179.9, -20.7],
                    [-180.0, -20.2],
                    [-180.1, -20.9],
                    [-180.2, -20.5],
                ],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-179.8, -20],
                    [-179.9, -20.7],
                    [-180.0, -20.2],
                    [-180.1, -20.9],
                    [-180.2, -20.5],
                ],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiLineString',
                coordinates: [[
                        [+172, +28],
                        [-172, +28],
                        [-172, +12],
                        [+172, +12],
                        [+172, +20.5],
                        [-175, +20.5],
                    ], [
                        [+172, +27],
                        [-173, +27],
                        [-173, +13],
                        [+173, +13],
                        [+173, +19.5],
                        [-175, +19.5],
                    ]],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiPolygon',
                coordinates: [[
                        [[+170, +30], [-170, +30], [-170, +10], [+170, +10]],
                        [[+175, +25], [-175, +25], [-175, +22], [+175, +22]],
                        [[+175, +18], [-175, +18], [-175, +15], [+175, +15]],
                    ], [
                        [[+170, -10], [-170, -10], [-170, -30], [+170, -30]],
                        [[+175, -15], [+178, -15], [+178, -25], [+175, -25]],
                        [[-175, -15], [-178, -15], [-178, -25], [-175, -25]],
                    ]],
            },
        }],
};
const polarFeatures = {
    type: 'FeatureCollection',
    features: [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[+45, +70], [+70, +70], [-45, +75], [-40, +80], [+90, +70], [+135, +70], [+225, +70], [+315, +70]],
                ],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-45, +60], [+45, +60], [+135, +60], [+225, +60], [+315, +60],
                ],
            },
        }, {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[0, -70], [-90, -70], [-180, -70], [-270, -70]],
                    [[0, -75], [-90, -75], [-180, -75], [-270, -75]],
                ],
            },
        }],
};

const { PI } = Math;
const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;
const mainCssUrl = new URL("assets/@metsci/gleam-example-geojson/ab17e875-main.css", (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
run(async () => {
    const stylesLoading = Promise.all([
        gleamCoreDefaultStyleLoading,
        gleamMvtDefaultStyleLoading,
        addCssLink(mainCssUrl),
    ]);
    const repaint = new ListenableBasic();
    const proj = MERCATOR_PROJ;
    const xyAxis = createCommonScaleAxis2D();
    lockScaleRatio(xyAxis, 1);
    xyAxis.y.maxConstraint = Interval1D.fromEdges(NEGATIVE_INFINITY, proj.maxUsableY);
    xyAxis.y.minConstraint = Interval1D.fromEdges(proj.minUsableY, POSITIVE_INFINITY);
    xyAxis.y.scaleConstraint = Interval1D.fromEdges(NEGATIVE_INFINITY, 1e7 * proj.maxDLatDY_RAD());
    xyAxis.x.set(false, proj.lonToX(-PI), proj.lonToX(+PI));
    xyAxis.changes.addListener(() => {
        repaint.fire();
    });
    const pane = new Pane();
    attachAxisViewportUpdater2D(pane, xyAxis);
    attachAxisInputHandlers2D(pane, xyAxis);
    const mvtTocUrl = 'https://api.maptiler.com/tiles/v3/tiles.json?key=NlFMjik0xUI3WrXGNylv';
    const mvtToc = fetchTileSetToc(mvtTocUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
    });
    const mvtCreateRenderGroups = createRenderGroupsFactory(createCacheWorkerPool());
    const mvtCache = new MvtCache(mvtToc, mvtCreateRenderGroups);
    mvtCache.attachToRepaint(repaint);
    const mvtPainter = new MvtPainter(mvtCache, proj, axisBoundsFn(xyAxis));
    pane.addPainter(mvtPainter);
    const geojsonCreatePreRenderables = createPreRenderableFactory(createPreRenderablesWorkerPool());
    const geojsonPainter = new GeoJsonPainter(proj, geojsonCreatePreRenderables, axisBoundsFn(xyAxis), { interp: SPHERICAL_GREAT_CIRCLE_INTERPOLATOR });
    geojsonPainter.attachToRepaint(repaint);
    geojsonPainter.registerMarker('pin1', new GeoJsonMarkerPin('pin1'));
    geojsonPainter.registerMarker('pin2', new GeoJsonMarkerPin('pin2'));
    geojsonPainter.registerMarker('pin3', new GeoJsonMarkerPin('pin3'));
    geojsonPainter.putData('simple-features', simpleFeatures, [addCssClass('simple')]);
    geojsonPainter.putData('antimeridian-features', antimeridianFeatures, [addCssClass('antimeridian')], { interp: SPHERICAL_RHUMB_LINE_INTERPOLATOR });
    geojsonPainter.putData('polar-features', polarFeatures, [addCssClass('polar')]);
    pane.addPainter(geojsonPainter);
    await stylesLoading;
    const host = requireNonNull(document.getElementById('host'));
    attachPane(host, pane, repaint);
    addMvtAttributionElement(host, mvtToc);
});

}));
//# sourceMappingURL=main.js.map
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
import { ActivityListenable, Disposer, Interval1D } from '@metsci/gleam-util';

/**
 * **NOTE:** This interface is defined in terms of *logical* pixels -- unlike the
 * bulk of the rest of the library, which uses physical pixels. Conversion to and
 * from physical pixels is up to `Axis1D`.
 */
export interface AxisGroup1D {
    readonly changes: ActivityListenable;

    set( ongoing: boolean, span_LPX: number, bounds: Interval1D ): void;
    set( ongoing: boolean, span_LPX: number, min: number, max: number ): void;
    set( ongoing: boolean, span_LPX: number, frac: number, coord: number, scale: number ): void;

    pan( ongoing: boolean, span_LPX: number, frac: number, coord: number ): void;

    reconstrain( ongoing: boolean ): void;

    getStateMarker( ): object;
    computeAxisState( span_LPX: number ): AxisState1D;

    /**
     * Creates a new group initialized to this group's current axis state, but
     * with no member axes or links to other groups.
     */
    clone( ): AxisGroup1D;

    /**
     * Intended usage is for client code to call `Axis1D.link()`, not to call this
     * method directly. If you do call this method directly, call `reconstrain()`
     * afterwards.
     */
    _addMember( axis: AxisGroupMember1D ): Disposer;
}

export interface AxisState1D {
    readonly marker: object;
    readonly span_LPX: number;
    readonly bounds: Interval1D;
    readonly scale: number;
}

/**
 * These are the axis fields that a group can access without getting into trouble
 * with infinite recursion. Implementations of `AxisGroup1D` should be written in
 * terms of this interface, rather than `Axis1D`.
 */
export interface AxisGroupMember1D {
    readonly span_LPX: number;
    readonly minConstraint: Interval1D;
    readonly maxConstraint: Interval1D;
    readonly spanConstraint: Interval1D;
    readonly scaleConstraint: Interval1D;
}

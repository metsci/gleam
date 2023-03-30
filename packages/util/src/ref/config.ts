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
export interface ListenerConfig {
    /**
     * Fire the listener immediately, in addition to registering it to be
     * fired on future events. Defaults to `false`. See `IMMEDIATE` for a
     * convenient abbreviation of `{ immediate: true }`.
     */
    readonly immediate?: boolean;

    /**
     * Automatically remove the listener after the first time it fires.
     * Defaults to `false`.
     */
    readonly once?: boolean;

    /**
     * When multiple listeners fire in response to the same event, they fire
     * from smallest `order` to largest, then in the order in which they were
     * registered.
     *
     * Defaults to `0`. Negative and non-integer values are allowed.
     *
     * Typical usage is to leave most listeners with the default `order` of
     * `0`, and here and there use a `-1` for a listener that needs to fire
     * early, or a `+1` for a listener that needs to fire late.
     *
     * In rare cases a listener needs to fire either before or after all other
     * listeners the developer anticipates. While infinite `order` values are
     * allowed, large *finite* values leave more flexibility to handle cases
     * the developer did not anticipate. Internally Gleam uses `order` values
     * like `999999`, which conveys that it's possible to have another listener
     * fire after this one, but the original developer didn't anticipate that
     * happening.
     *
     * **TODO**: Try using ID strings and specifying `before this ID` or `after that ID`
     */
    readonly order?: number;
}

export const IMMEDIATE = Object.freeze( { immediate: true } ) as ListenerConfig;

export function withoutImmediate( flags: ListenerConfig ): ListenerConfig {
    return {
        once: flags.once,
        order: flags.order
    };
}

export function withoutOnce( flags: ListenerConfig ): ListenerConfig {
    return {
        immediate: flags.immediate,
        order: flags.order
    };
}

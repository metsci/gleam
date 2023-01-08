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
import { builtinInterpFromDescriptor, builtinProjectionFromDescriptor, get } from '@metsci/gleam-util';
import { createPreRenderables, getTransferables, WorkerCall, WorkerResult } from './support';

// This `workerSelf` business could be avoided, using a separate tsconfig with
// `webworker` in its `lib` section. That would allow the type checker to ensure
// we are in a worker. It would also make project structure awkward.
interface WebWorkerSelf {
    postMessage( message: WorkerResult, transfer: Array<Transferable> ): void;
}
const workerSelf = get( ( ) => {
    const s = self as any;
    if ( typeof s.WorkerGlobalScope !== 'undefined'
      && typeof s.postMessage === 'function'
      && typeof s.importScripts === 'function'
      && typeof s.WorkerNavigator !== 'undefined'
      && s.navigator instanceof s.WorkerNavigator ) {
        return self as WebWorkerSelf;
    }
    else {
        throw new Error( 'This script must be run in a Web Worker' );
    }
} );

self.onmessage = ev => {
    const { callKey, geometry, interpDesc, projDesc, perceptibleProjDist } = ev.data as WorkerCall;
    const interp = builtinInterpFromDescriptor( interpDesc );
    const proj = builtinProjectionFromDescriptor( projDesc );
    const preRenderables = createPreRenderables( geometry, interp, proj, perceptibleProjDist );
    const transfers = getTransferables( preRenderables );
    workerSelf.postMessage( { callKey, preRenderables }, transfers );
};

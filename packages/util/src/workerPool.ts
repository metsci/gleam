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
import { get } from './util';
import { FireableListenable, ListenableBasic } from './ref';

export type WorkerPoolWorker = Worker & { termination: FireableListenable };
export type WorkerPool = Map<WorkerPoolWorker,Promise<WorkerPoolWorker>>;

export function createWorkerPool( workerCount: number, createWorker: ( workerIndex: number ) => Worker ): WorkerPool {
    if ( workerCount <= 0 ) {
        throw new Error( `WorkerPool size is non-positive: size = ${workerCount}` );
    }
    const workerPool = new Map<WorkerPoolWorker,Promise<WorkerPoolWorker>>( );
    for ( let i = 0; i < workerCount; i++ ) {
        const worker = Object.assign(
            createWorker( i ),
            { termination: new ListenableBasic( ) },
        );
        workerPool.set( worker, Promise.resolve( worker ) );
    }
    return workerPool;
}

const NEXT_JOB_KEY_SYMBOL = Symbol( '@@__GLEAM_NEXT_JOB_KEY__@@' );
export async function submitToWorkerPool<T>( workerPool: WorkerPool, startJob: ( worker: WorkerPoolWorker, jobKey: unknown ) => Promise<T> ): Promise<T> {
    if ( workerPool.size === 0 ) {
        throw new Error( 'WorkerPool startJob() fn contains a call to submitToWorkerPool()' );
    }

    // Wait for a worker to become available
    const worker = await Promise.race( workerPool.values( ) );

    // Claim the next job key
    const jobKeyHolder = workerPool as { [NEXT_JOB_KEY_SYMBOL]?: number };
    const jobKey = jobKeyHolder[ NEXT_JOB_KEY_SYMBOL ] ?? 0;
    jobKeyHolder[ NEXT_JOB_KEY_SYMBOL ] = jobKey + 1;

    // Temporarily clear the pool, to ensure that startJob() can't make nested synchronous calls to submitToWorkerPool()
    const workersTemp = new Map( workerPool );
    workerPool.clear( );

    // Start the job -- presumably on the worker, though the details are up to startJob()
    const jobResultPromise = get( ( ) => {
        try {
            return startJob( worker, jobKey );
        }
        catch ( e ) {
            return Promise.reject( e );
        }
    } );

    // Add a promise to the pool that will resolve to the worker, once it has finished the job and is free again
    const freeWorkerPromise = jobResultPromise.then( ( ) => worker ).catch( ( ) => worker );
    workersTemp.set( worker, freeWorkerPromise );

    // Restore the pool
    workersTemp.forEach( ( v, k ) => workerPool.set( k, v ) );

    // Return the result promise for use by the caller
    return jobResultPromise;
}

export function destroyWorkerPool( workerPool: WorkerPool ): void {
    for ( const [ worker ] of workerPool ) {
        worker.terminate( );
        worker.termination.fire( );
    }
    workerPool.clear( );
}

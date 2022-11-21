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
import { Comparator, get } from '@metsci/gleam-util';
import { RenderGroupsMap, TileIndex, TilesViewport } from '../support';
import { createRenderGroups, createTileIndexComparator, WorkerCall, WorkerResult } from './cacheSupport';

// This `workerSelf` tomfoolery could be avoided, using a separate tsconfig with
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

interface WorkerQuery {
    callKey: unknown;
    queryArgs: [ tileIndex: TileIndex, tileBuffer: Readonly<ArrayBuffer> ];
}

let view: TilesViewport;
const pendingQueries = new Array<WorkerQuery>( );
let pendingJob: number | undefined = undefined;
self.onmessage = ev => {
    const call = ev.data as WorkerCall;

    // Update the view immediately
    view = call.viewUpdate;

    // Enqueue the query, if there is one
    if ( call.queryArgs ) {
        const { callKey, queryArgs } = call;
        pendingQueries.push( { callKey, queryArgs } );
    }

    // Schedule a job, if there isn't one already scheduled
    if ( !pendingJob ) {
        const doJob = ( ) => {
            pendingJob = undefined;

            // Execute the highest-priority query
            const query = popNextQuery( view, pendingQueries );
            if ( query ) {
                const { callKey, queryArgs } = query;

                // Ignore queries with out-of-range levels
                const zQuery = queryArgs[0].zoomLevel;
                if ( 0 <= zQuery && zQuery <= view.z ) {
                    const queryResult = createRenderGroups( ...queryArgs );
                    postQueryResult( callKey, queryResult );
                }
                else {
                    postQueryResult( callKey, undefined );
                }
            }

            // If there are more queries, schedule another job
            if ( pendingQueries.length > 0 ) {
                pendingJob = self.setTimeout( doJob, 1 );
            }
        };
        pendingJob = self.setTimeout( doJob, 1 );
    }
};

function popNextQuery( view: TilesViewport, queries: Array<WorkerQuery> ): WorkerQuery | undefined {
    const compareQueries = createQueryComparator( view );
    let bestQuery: WorkerQuery | undefined = undefined;
    let bestIndex = -1;
    for ( let i = 0; i < queries.length; i++ ) {
        const query = queries[ i ];
        if ( !bestQuery || compareQueries( query, bestQuery ) < 0 ) {
            bestQuery = query;
            bestIndex = i;
        }
    }
    if ( bestIndex >= 0 ) {
        queries.splice( bestIndex, 1 );
    }
    return bestQuery;
}

function createQueryComparator( view: TilesViewport ): Comparator<WorkerQuery> {
    const compareTileIndices = createTileIndexComparator( view );
    return ( a, b ) => {
        return compareTileIndices( a.queryArgs[0], b.queryArgs[0] );
    };
}

function postQueryResult( callKey: unknown, queryResult: RenderGroupsMap | undefined ): void {
    const transfers = new Array<Transferable>( );
    if ( queryResult ) {
        for ( const [ _, groups ] of queryResult.lineGroupsByStem ) {
            for ( const { coords: { pointCoords2, triangleCoords4 } } of groups ) {
                transfers.push( pointCoords2.buffer );
                transfers.push( triangleCoords4.buffer );
            }
        }
        for ( const [ _, groups ] of queryResult.polygonGroupsByStem ) {
            for ( const { coords: { triangleCoords2 } } of groups ) {
                transfers.push( triangleCoords2.buffer );
            }
        }
    }
    workerSelf.postMessage( { callKey, queryResult }, transfers );
}

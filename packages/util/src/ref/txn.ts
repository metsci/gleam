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
import { arrayReverseIterable, Nullable, Supplier } from '../util';

export interface TxnMember {
    /**
     * Implementations of this method must always succeed, and must never
     * throw exceptions.
     */
    rollback?( ): void;

    /**
     * Implementations of this method must always succeed, and must never
     * throw exceptions.
     */
    commit?( ): void;

    /**
     * Implementations of this method may fail, and may throw exceptions.
     *
     * If an impl throws an exception, the `Txn`'s post-commit sequence
     * terminates immediately, without performing any post-commit operations
     * for subsequent members.
     */
    postCommit?( ): void;
}

let activeTxn = null as Nullable<Array<TxnMember>>;

/**
 * Generally, this method shouldn't be called directly from application
 * code. It is public to allow new utilities to be implemented in ways
 * that use the `Txn` mechanism.
 */
export function addToActiveTxn( member: TxnMember ): void {
    const txn = activeTxn;
    if ( !txn ) {
        // No active txn, so commit immediately
        member.commit?.( );
        member.postCommit?.( );
    }
    else {
        // Defer until commit or rollback of active txn
        txn.push( member );
    }
}

export function doTxn<T>( task: Supplier<T> ): T {
    if ( activeTxn ) {
        // Already inside a txn
        return task( );
    }
    else {
        const txn = [] as Array<TxnMember>;
        let result;

        activeTxn = txn;
        try {
            // Task may add members to activeTxn
            result = task( );

            // By general contract, commit() must always succeed
            for ( const member of txn ) {
                member.commit?.( );
            }
        }
        catch ( e ) {
            // By general contract, rollback() must always succeed
            for ( const member of arrayReverseIterable( txn ) ) {
                member.rollback?.( );
            }

            // Re-throwing the exception here pops us out of the method
            throw e;
        }
        finally {
            activeTxn = null;
        }

        // An exception from postCommit() will cause this method to terminate
        // immediately, without calling postCommit() for subsequent members
        for ( const member of txn ) {
            member.postCommit?.( );
        }

        return result;
    }
}

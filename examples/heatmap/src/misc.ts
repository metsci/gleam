import { Float32ArraySurface, Surface } from '@metsci/gleam-core';

export function generateSurface( ): Surface {
    const ni = 250;
    const nj = 250;
    const values = new Float32Array( ni * nj );
    for ( let j = 0; j < nj; j++ ) {
        for ( let i = 0; i < ni; i++ ) {
            values[ j*ni + i ] = 1e-3*( i * j ) + 10*( Math.random( ) - 0.5 );
        }
    }
    return new Float32ArraySurface( ni, nj, values );
}

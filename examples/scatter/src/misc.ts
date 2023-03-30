export function generateXycsCoords( numPoints: number ): Float32Array {
    const coords = new Float32Array( 4 * numPoints );
    for ( let i = 0; i < numPoints; i++ ) {
        const r = Math.random( );
        const big = ( 10*Math.random( ) < -0.3*Math.log( r ) );

        const x = Math.random( ) * 2*Math.PI;
        const y = Math.sin( x ) + 0.3*Math.log( r );
        const c = ( big ? -1.2 : -1.0 ) * ( Math.cos( x - 0.33 ) + 0.3*( -1 + 2*r ) ) + Math.random( ) - 0.5;
        const s = Math.sqrt( ( big ? 1 : 0.2 ) * Math.sqrt( 0.5 + 0.5*Math.sin( 3*c ) ) );

        coords[ 4*i + 0 ] = x;
        coords[ 4*i + 1 ] = y;
        coords[ 4*i + 2 ] = c;
        coords[ 4*i + 3 ] = s;
    }
    return coords;
}

#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const resolvePackagePath = require( 'resolve-package-path' );

const args = process.argv.slice( 2 );
if ( args.length === 0 || args[0] === '--help' ) {
    const redStar = '\x1b[1;31m*\x1b[0m';
    console.log( ` ${redStar} Usage: ${process.argv[0]} ${process.argv[1]} <package-file>` );
    process.exit( 2 );
}

const pkgFile = path.resolve( process.cwd( ), args[0] );
const pkg = require( pkgFile );

function keysWithValue( keyValuePairs, value ) {
    return Object.entries( keyValuePairs ?? {} )
             .filter( ([ _, v ]) => ( v === value ) )
             .map( ([ k ]) => k );
}

let pkgModified = false;
for ( const deps of [ pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, pkg.peerDependencies ] ) {
    for ( const dep of keysWithValue( deps, '*' ) ) {
        const depPkgFile = resolvePackagePath( dep, process.cwd( ) );
        const depVersion = require( depPkgFile ).version;
        if ( depVersion !== undefined ) {
            deps[ dep ] = '^' + depVersion;
            pkgModified = true;
        }
    }
}
if ( pkgModified ) {
    fs.writeFileSync( pkgFile, JSON.stringify( pkg, null, 2 ) + '\n' );
}

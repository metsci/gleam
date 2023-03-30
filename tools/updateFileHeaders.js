#!/usr/bin/env node

const { resolve } = require( 'path' );
const { readdirSync, readFileSync, statSync, writeFileSync, renameSync } = require( 'fs' );
const { EOL } = require( 'os' );

const pwd = process.cwd( );

const redStar = '\x1b[1;31m*\x1b[0m';

const args = process.argv.slice( 2 );
if ( args.length === 0 || args[0] === '--help' ) {
    console.log( ` ${redStar} Usage: ${process.argv[0]} ${process.argv[1]} <header-file> [<top-dir>...]` );
    process.exit( 2 );
}
const headerFileRelative = args[0];
const topDirsRelative = args.slice( 1 );

function visitFiles( dir, visit ) {
    for ( const child of readdirSync( dir, { withFileTypes: true } ) ) {
        if ( child.isFile( ) ) {
            visit( resolve( dir, child.name ) );
        }
        else if ( child.isDirectory( ) ) {
            visitFiles( resolve( dir, child.name ), visit );
        }
    }
}

const headerOpenText = '/**';
const headerLinePrefix = ' * ';
const headerCloseText = ' */';
const headerFile = resolve( pwd, headerFileRelative );
const headerRawText = readFileSync( headerFile, { encoding: 'utf8' } );
const [ headerEol ] = headerRawText.match( /\r\n|\n|\r/ ) ?? [ EOL ];
const headerRawLines = headerRawText.replace( new RegExp( `${headerEol}$` ), '' ).split( headerEol );
const headerFullLines = [ headerOpenText, ...headerRawLines.map( s => ( headerLinePrefix + s ).replace( /\s+$/, '' ) ), headerCloseText ];
const headerFullTextsByEol = new Map( );
function getHeaderFullText( eol ) {
    let headerFullText = headerFullTextsByEol.get( eol );
    if ( headerFullText === undefined ) {
        headerFullText = headerFullLines.join( eol );
        headerFullTextsByEol.set( eol, headerFullText );
    }
    return headerFullText;
}

let anyErrors = false;
for ( const topDirRelative of topDirsRelative ) {
    const topDir = resolve( pwd, topDirRelative );
    visitFiles( topDir, f => {
        if ( f.endsWith( '.ts' ) ) {
            try {
                const fileText = readFileSync( f, { encoding: 'utf8' } );
                const [ fileEol ] = fileText.match( /\r\n|\n|\r/ ) ?? [ EOL ];
                const headerFullText = getHeaderFullText( fileEol );
                if ( !fileText.startsWith( headerOpenText ) ) {
                    console.log( `Adding header to ${f}` );

                    const newFileText = headerFullText + fileEol + fileText;

                    const fTemp = `${f}.tmp`;
                    const { mode } = statSync( f );
                    writeFileSync( fTemp, newFileText, { encoding: 'utf8', mode, flag: 'wx' } );
                    renameSync( fTemp, f );
                }
                else if ( !fileText.startsWith( headerFullText ) ) {
                    console.log( `Updating header in ${f}` );

                    // We already checked that fileText starts with headerFirstLine
                    const headerCloseStart = fileText.indexOf( headerCloseText );
                    if ( headerCloseStart < 0 ) {
                        throw new Error( 'Unclosed header' );
                    }
                    const newFileText = headerFullText + fileText.slice( headerCloseStart + headerCloseText.length );

                    const fTemp = `${f}.tmp`;
                    const { mode } = statSync( f );
                    writeFileSync( fTemp, newFileText, { encoding: 'utf8', mode, flag: 'wx' } );
                    renameSync( fTemp, f );
                }
            }
            catch ( e ) {
                anyErrors = true;
                console.warn( ` ${redStar} Failed to prepend header to ${f}: ${e}` );
            }
        }
    } );
}

process.exit( anyErrors ? 1 : 0 );

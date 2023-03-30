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
import { createFilter } from '@rollup/pluginutils';
import { createHash } from 'crypto';
import { asyncWalk } from 'estree-walker';
import { promises as fs } from 'fs';
import MagicString from 'magic-string';
import path from 'path';

function matches( a, b ) {
    if ( a === b ) {
        return true;
    }
    else if ( typeof a === 'string' && b instanceof RegExp ) {
        return b.test( a );
    }
    else if ( Array.isArray( a ) && Array.isArray( b ) ) {
        for ( let i = 0; i < b.length; i++ ) {
            if ( b[ i ] !== undefined && !matches( a[ i ], b[ i ] ) ) {
                return false;
            }
        }
        return true;
    }
    else if ( typeof a === 'object' && typeof b === 'object' ) {
        return Object.keys( b ).every( function ( prop ) {
            return matches( a[ prop ], b[ prop ] );
        } );
    }
    else {
        return false;
    }
}

async function tryStat( f ) {
    try {
        return await fs.stat( f );
    }
    catch ( e ) {
        return undefined;
    }
}

async function findPackageJson( f ) {
    let dir = f;
    while ( true ) {
        if ( ( await tryStat( dir ) )?.isDirectory( ) ) {
            const pkgJson = path.resolve( dir, 'package.json' );
            if ( ( await tryStat( pkgJson ) )?.isFile( ) ) {
                return require( pkgJson );
            }
        }
        const parentDir = path.resolve( dir, '..' );
        if ( parentDir === dir ) {
            throw new Error( 'No package.json found' );
        }
        dir = parentDir;
    }
}

function getLastNonBlankLine( buf, encoding ) {
    const LF = '\n'.charCodeAt( 0 );
    const CR = '\r'.charCodeAt( 0 );
    let lineEnd = buf.length;
    while ( true ) {
        let lineStart = -1;
        for ( let i = lineEnd - 1; i >= 0; i-- ) {
            if ( buf[ i ] === LF || buf[ i ] === CR ) {
                lineStart = ( i + 1 );
                break;
            }
        }
        if ( lineStart < 0 ) {
            break;
        }

        const line = buf.subarray( lineStart, lineEnd ).toString( encoding );
        if ( line.trim( ) ) {
            return [ line, lineStart ];
        }
        lineEnd = lineStart - 1;
    }
    return undefined;
}

export function asset( options ) {
    const defaultJsGlobs = [ '**/*.js', '**/*.mjs' ];
    const includeId = createFilter( options?.include ?? defaultJsGlobs, options?.exclude );
    const includeAssetSrc = createFilter( options?.includeAssets, options?.excludeAssets );
    const includeSourceMapForAssetSrc = createFilter( options?.includeSourceMapsForAssets ?? defaultJsGlobs, options?.excludeSourceMapsForAssets );

    // We use non-standard `options.outDir` to specify asset destination dir, instead
    // of using the standard `output.assetFileNames`.
    //
    // `output.assetFileNames` would have the advantages of (1) being standard Rollup,
    // and (2) allowing different filenames for different bundles. However, we want to
    // customize the way content hashes are incorporated into filenames, and standard
    // behavior can't be customized that way by a plugin.
    //
    // Specifically we want to (1) hash an asset's content only (not its filename), and
    // (2) have the hash appear in the filename only once. This way, when an app pulls
    // in assets from dependency libraries, the filenames end up like `style-[hash].css`
    // instead of `style-[hashFromLibraryBuild]-[hashFromAppBuild].css`.
    //
    const assetOutDir = options?.outDir ?? 'assets';

    let assetRefIdsBySrcPath = new Map( );
    return {
        name: 'asset',
        buildStart( ) {
            assetRefIdsBySrcPath.clear( );
        },
        async transform( code, id ) {
            if ( includeId( id ) ) {
                const assetUrlLiterals = [];
                const ast = this.parse( code );
                await asyncWalk( ast, {
                    async enter( node ) {
                        if ( matches( node, {
                            type: 'NewExpression',
                            callee: { type: 'Identifier', name: 'URL' },
                            arguments: [ {
                                type: 'Literal',
                            }, {
                                type: 'MemberExpression',
                                object: {
                                    type: 'MetaProperty',
                                    meta: { type: 'Identifier', name: 'import' },
                                    property: { type: 'Identifier', name: 'meta' },
                                },
                                property: { type: 'Identifier', name: 'url' },
                            } ],
                        } ) ) {
                            const { start, end, value } = node.arguments[ 0 ];
                            const assetSrcPath = path.resolve( path.dirname( id ), value );
                            if ( includeAssetSrc( assetSrcPath ) ) {
                                assetUrlLiterals.push( { start, end, assetSrcPath } );
                            }
                        }
                    },
                } );
                if ( assetUrlLiterals.length > 0 ) {
                    const codeWithEdits = new MagicString( code );
                    for ( const { start, end, assetSrcPath } of assetUrlLiterals ) {
                        if ( !assetRefIdsBySrcPath.has( assetSrcPath ) ) {
                            const assetPkgName = ( await findPackageJson( assetSrcPath ) ).name;
                            const assetEmitDir = path.join( assetOutDir, ...( assetPkgName.split( '/' ) ) );
                            let assetContent = await fs.readFile( assetSrcPath );

                            // Emit the asset's sourcemap, and overwrite the sourceMappingURL in assetContent
                            if ( includeSourceMapForAssetSrc( assetSrcPath ) ) {
                                const assetEncoding = 'utf-8';
                                const [ line, lineStart ] = getLastNonBlankLine( assetContent, assetEncoding );
                                //                             1       2   2                          13   34   4
                                const matches = line?.match( /^(\s*\/\/(#|@)\s*sourceMappingURL\s*=\s*)(.*?)(\s*)$/i );
                                if ( matches ) {
                                    const sourceMapPath = path.resolve( path.dirname( assetSrcPath ), decodeURI( matches[ 3 ] ) );
                                    const sourceMapContent = await fs.readFile( sourceMapPath );
                                    const sourceMapContentHash = createHash( 'sha256' ).update( sourceMapContent ).digest( 'hex' ).substring( 0, 8 );
                                    const sourceMapLoc = path.parse( sourceMapPath );
                                    let sourceMapStem = sourceMapLoc.name;
                                    if ( !( new RegExp( `^(.*[^A-Za-z0-9])?${sourceMapContentHash}([^A-Za-z0-9].*)?$` ) ).test( sourceMapStem ) ) {
                                        // Put content hash first, to be friendly to filters like **/*.worker.js.map
                                        sourceMapStem = `${sourceMapContentHash}-${sourceMapStem}`;
                                    }
                                    const sourceMapEmitFilename = path.join( assetEmitDir, sourceMapStem + sourceMapLoc.ext );
                                    this.emitFile( {
                                        type: 'asset',
                                        fileName: sourceMapEmitFilename,
                                        source: sourceMapContent,
                                    } );
                                    const newLine = matches[ 1 ] + encodeURI( path.relative( assetEmitDir, sourceMapEmitFilename ) ) + matches[ 4 ];
                                    assetContent = Buffer.concat( [
                                        assetContent.subarray( 0, lineStart ),
                                        Buffer.from( newLine, assetEncoding ),
                                    ] );
                                }
                            }

                            // Emit the asset
                            const assetContentHash = createHash( 'sha256' ).update( assetContent ).digest( 'hex' ).substring( 0, 8 );
                            const assetSrcLoc = path.parse( assetSrcPath );
                            let assetStem = assetSrcLoc.name;
                            if ( !( new RegExp( `^(.*[^A-Za-z0-9])?${assetContentHash}([^A-Za-z0-9].*)?$` ) ).test( assetStem ) ) {
                                // Put content hash first, to be friendly to filters like **/*.worker.js
                                assetStem = `${assetContentHash}-${assetStem}`;
                            }
                            const assetEmitFilename = path.join( assetEmitDir, assetStem + assetSrcLoc.ext );
                            assetRefIdsBySrcPath.set( assetSrcPath, this.emitFile( {
                                type: 'asset',
                                fileName: assetEmitFilename,
                                source: assetContent,
                            } ) );
                        }
                        // MagicString interprets character indices as referring to the original string
                        codeWithEdits.overwrite( start, end, `import.meta.ROLLUP_FILE_URL_${ assetRefIdsBySrcPath.get( assetSrcPath ) }` );
                    }
                    return {
                        code: codeWithEdits.toString( ),
                        map: codeWithEdits.generateMap( { hires: true } ),
                    };
                }
            }
        },
        resolveFileUrl( { fileName } ) {
            // This plugin only puts `import.meta.ROLLUP_FILE_URL_${refId}` in expressions
            // that already look like `new URL( <href>, import.meta.url )`, so return href
            // (aka fileName) directly, instead of wrapping it in another relative URL
            return JSON.stringify( fileName );
        },
    };
}

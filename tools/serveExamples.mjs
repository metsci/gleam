#!/usr/bin/env node

import express from 'express';
import { readdirSync } from 'fs';
import http from 'http';
import os from 'os';
import { resolve } from 'path';
import url from 'url';

// Parse cli args
const args = process.argv.slice( 2 );
if ( args.length === 0 || args[0] === '--help' ) {
    const redStar = '\x1b[1;31m*\x1b[0m';
    console.log( ` ${redStar} Usage: ${process.argv[0]} ${process.argv[1]} <listen-host> <listen-port>` );
    process.exit( 2 );
}
const host = args[ 0 ];
const port = parseInt( args[ 1 ] );

// Create routes
const app = express( );

// Add a static route for each example
const exampleNameUrlPairs = [];
const examplesDir = new URL( '../examples', import.meta.url ).pathname;
for ( const child of readdirSync( examplesDir, { withFileTypes: true } ) ) {
    if ( child.isDirectory( ) ) {
        const exampleUrl = '/' + child.name;
        exampleNameUrlPairs.push( [ child.name, exampleUrl ] );
        app.use( exampleUrl, express.static( resolve( examplesDir, child.name, 'build', 'dist' ) ) );
    }
}

// Add a top-level table-of-contents page
const encodeTextReplacements = Object.freeze( {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
} );
const encodeTextRegex = new RegExp( `[${ Object.keys( encodeTextReplacements ).join( '' ) }]`, 'g' );
const encodeText = s => s.replace( encodeTextRegex, c => encodeTextReplacements[ c ] );
const tocHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8"/>
        <title>Gleam Examples</title>
        <style>
            p { margin: 10px 4px; }
        </style>
    </head>
    <body>
        ${ exampleNameUrlPairs.map( ( [ name, url ] ) => `<p><a href="${ encodeURI( url ) }">${ encodeText( name ) }</a></p>` ).join( '\n' ) }
    </body>
    </html>
`;
app.use( '/', ( req, resp ) => resp.send( tocHtml ) );

// Serve
const server = http.createServer( app );
server.on( 'listening', ( ) => {
    const { family, address, port } = server.address( );

    // Log the known interfaces we're listening on
    let ifaceFound = false;
    const isAllInterfaces = ( family === 'IPv4' && address === '0.0.0.0' ) || ( family === 'IPv6' && address === '::' );
    for ( const [ ifaceName, ifaceAddrs ] of Object.entries( os.networkInterfaces( ) ) ) {
        for ( const ifaceAddr of ifaceAddrs ) {
            if ( ifaceAddr.family === family && ( isAllInterfaces || ifaceAddr.address === address ) ) {
                const ifaceUrl = url.format( {
                    protocol: 'http',
                    hostname: ( family === 'IPv4' ? ifaceAddr.address : `[${ifaceAddr.address}]` ),
                    port,
                } );
                console.log( `Serving at  ${ifaceUrl}  (${ifaceName})` );
                ifaceFound = true;
            }
        }
    }

    // Log if we're listening on an unknown interface
    if ( !ifaceFound ) {
        const addrUrl = url.format( {
            protocol: 'http',
            hostname: ( family === 'IPv4' ? address : `[${address}]` ),
            port,
        } );
        console.log( `Serving at  ${addrUrl}  (???)` );
    }
} );
server.listen( port, host );

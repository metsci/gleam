import { asset } from '@metsci/rollup-plugin-asset';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { string } from 'rollup-plugin-string';
import pkg from './package.json';

const tilesJsonUrl = process.env.GLEAM_TILES_JSON_URL;
if ( tilesJsonUrl === undefined ) {
    throw new Error( `Env var GLEAM_TILES_JSON_URL must be set at build time, to e.g. https://api.maptiler.com/tiles/v3/tiles.json?key=MY_API_KEY` );
}

export default {
    input: new URL( './build/temp/main.js', import.meta.url ).pathname,
    plugins: [
        resolve( ),
        commonjs( ),
        sourcemaps( ),
        asset( ),
        string( { include: [ '**/*.vert', '**/*.frag' ] } ),
        replace( { values: { '__TILES_JSON_URL__': tilesJsonUrl }, preventAssignment: true } ),
    ],
    output: [ {
        file: new URL( pkg.browser, import.meta.url ).pathname,
        format: 'umd',
        sourcemap: true,
        indent: false,
    } ],
    watch: { clearScreen: false },
}

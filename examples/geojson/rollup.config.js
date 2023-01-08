import { asset } from '@metsci/rollup-plugin-asset';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { string } from 'rollup-plugin-string';
import { requireTilesJsonUrl } from '../../tools/misc';
import pkg from './package.json';

export default {
    input: new URL( './build/temp/main.js', import.meta.url ).pathname,
    plugins: [
        resolve( ),
        commonjs( ),
        sourcemaps( ),
        asset( ),
        string( { include: [ '**/*.vert', '**/*.frag' ] } ),
        replace( { values: { '__TILES_JSON_URL__': requireTilesJsonUrl( process.env ) }, preventAssignment: true } ),
    ],
    output: [ {
        file: new URL( pkg.browser, import.meta.url ).pathname,
        format: 'umd',
        sourcemap: true,
        indent: false,
    } ],
    watch: { clearScreen: false },
}

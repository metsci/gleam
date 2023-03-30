import { asset } from '@metsci/rollup-plugin-asset';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { string } from 'rollup-plugin-string';
import pkg from './package.json';

export default {
    input: new URL( './build/temp/main.js', import.meta.url ).pathname,
    plugins: [
        resolve( ),
        commonjs( ),
        sourcemaps( ),
        asset( ),
        string( { include: [ '**/*.vert', '**/*.frag' ] } ),
    ],
    output: [ {
        file: new URL( pkg.browser, import.meta.url ).pathname,
        format: 'umd',
        sourcemap: true,
        indent: false,
        name: 'gleam-example-histogram',
    } ],
    watch: { clearScreen: false },
}

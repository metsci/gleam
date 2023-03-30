import { removeComments } from '@metsci/rollup-plugin-remove-comments';
import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { externalDeps, getLicenseBanner } from '../../tools/misc';
import pkg from './package.json';

export default [ {
    input: new URL( './build/temp/index.js', import.meta.url ).pathname,
    external: externalDeps( pkg ),
    plugins: [
        resolve( ),
        sourcemaps( ),
        removeComments( ),
    ],
    output: [ {
        file: new URL( pkg.module, import.meta.url ).pathname,
        format: 'esm',
        sourcemap: true,
        indent: false,
        banner: getLicenseBanner( '/*!', pkg.name ),
    } ],
    watch: { clearScreen: false },
}, {
    input: new URL( './build/temp/__tests__/index.js', import.meta.url ).pathname,
    plugins: [
        resolve( ),
        sourcemaps( ),
    ],
    output: [ {
        file: new URL( './build/test/index.js', import.meta.url ).pathname,
        format: 'umd',
        sourcemap: true,
        indent: false,
    } ],
    watch: { clearScreen: false },
} ]

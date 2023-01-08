import fs from 'fs';

export function getLicenseBanner( commentStyle, pkgName ) {
    const licensePath = new URL( '../LICENSE', import.meta.url ).pathname;
    const licenseText = fs.readFileSync( licensePath, { encoding: 'utf8' } ).replace( /\r\n|\r/g, '\n' );
    return comment( commentStyle, pkgName + '\n\n' + licenseText );
}

export function comment( commentStyle, s ) {
    switch ( commentStyle ) {
        case '//': return doubleSlashComment( s );
        case '///': return tripleSlashComment( s );
        case '/*': return slashStarComment( s );
        case '/**': return slashStarStarComment( s );
        case '/*!': return slashStarBangComment( s );
        default: throw new Error( `Unrecognized comment style: '${commentStyle}'` );
    }
}

export function doubleSlashComment( s ) {
    return s.replace( /\s+$/g, '' ).replace( /^/gm, '// ' ).replace( /\s+$/gm, '' );
}

export function tripleSlashComment( s ) {
    return s.replace( /\s+$/g, '' ).replace( /^/gm, '/// ' ).replace( /\s+$/gm, '' );
}

export function slashStarComment( s ) {
    return '/*\n' + s.replace( /\s+$/g, '' ).replace( /^/gm, ' * ' ).replace( /\s+$/gm, '' ) + '\n */';
}

export function slashStarStarComment( s ) {
    return '/**\n' + s.replace( /\s+$/g, '' ).replace( /^/gm, ' * ' ).replace( /\s+$/gm, '' ) + '\n */';
}

export function slashStarBangComment( s ) {
    return '/*!\n' + s.replace( /\s+$/g, '' ).replace( /^/gm, ' * ' ).replace( /\s+$/gm, '' ) + '\n */';
}

export function externalDeps( pkgJson ) {
    const bundled = new Set( pkgJson.bundledDependencies ?? pkgJson.bundleDependencies ?? [] );
    return Object.keys( pkgJson.dependencies ).filter( dep => !bundled.has( dep ) );
}

export function requireTilesJsonUrl( env ) {
    const tilesJsonUrl = env.GLEAM_TILES_JSON_URL;
    if ( tilesJsonUrl === undefined ) {
        throw new Error(
            `Env var GLEAM_TILES_JSON_URL must be set at build time, to e.g. https://api.maptiler.com/tiles/v3/tiles.json?key=YOUR_API_KEY. ...`
          + `If you don't have access to an MVT tile server but want to build this module anyway, you can set GLEAM_TILES_JSON_URL to anything (e.g. the empty string). `
          + `The build will succeed but the module will throw errors at runtime.`
        );
    }
    return tilesJsonUrl;
}

# MVT Tiles Example

[Main](./src/main.ts) | [CSS](./src/main.css) | [Demo](https://metsci.github.io/gleam/examples/mvt/)

Uses `MvtPainter` to display [MVT geo tiles](https://github.com/mapbox/vector-tile-spec).

**NOTE:** Env var `GLEAM_TILES_JSON_URL` must be set *at build time*, to e.g. `https://api.maptiler.com/tiles/v3/tiles.json?key=YOUR_API_KEY`. ... If you don't have access to an MVT server but want to build this example anyway, you can set `GLEAM_TILES_JSON_URL` to anything (e.g. the empty string). The build will succeed but the example will throw errors at runtime.

![Screenshot](./screenshot.png)

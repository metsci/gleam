# GeoJSON Example

Uses `GeoJsonPainter` to display GeoJSON data, with MVT geo tiles in the background.

**NOTE:** Env var `GLEAM_TILES_JSON_URL` must be set *at build time*, to e.g. `https://api.maptiler.com/tiles/v3/tiles.json?key=YOUR_API_KEY`. ... If you don't have access to an MVT server but want to build this example anyway, you can set `GLEAM_TILES_JSON_URL` to anything (e.g. the empty string). The build will succeed but the example will throw errors at runtime.

Example GeoJSON features include:
 - Point, line, and polygon features that span the antimeridian
 - A polygon covering the North Pole
 - A line surrounding the North Pole
 - A polygon surrounding the South Pole (i.e. has a hole that covers the pole)

Defaults to great-circle interp between data points, and for one GeoJSON object specifies rhumb-line interp.

Uses customized icons for point features.

See [main.css](./src/main.css) for styling of GeoJSON features.

![Screenshot](./screenshot.png)

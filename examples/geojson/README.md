# GeoJSON Example

Use `GeoJsonPainter` to display GeoJSON data, with MVT geo tiles in the background.

**NOTE:** Env var `GLEAM_TILES_JSON_URL` must be set *at build time*, to e.g. `https://api.maptiler.com/tiles/v3/tiles.json?key=MY_API_KEY`.

Example GeoJSON features include:
 - Point, line, and polygon features that span the antimeridian
 - A polygon covering the North Pole
 - A line surrounding the North Pole
 - A polygon surrounding the South Pole (i.e. has a hole that covers the pole)

Defaults to great-circle interp between data points, and for one GeoJSON object specifies rhumb-line interp.

Uses customized icons for point features.

See [main.css](./src/main.css) for styling of GeoJSON features.

![Screenshot](./screenshot.png)

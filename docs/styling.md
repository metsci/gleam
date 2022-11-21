# Styling

Gleam painters, layouts, and contraptions get their styling info (colors, spacings, etc.) from CSS. Each painter, layout, or contraption has an associated **DOM peer** -- an invisible DOM element, whose place in the DOM tree mirrors the tree of Gleam panes and painter, and whose CSS style the painter can query.

Settings in pixels units are scaled by the current `devicePixelRatio`, so that Gleam behaves properly with:
 - HiDPI displays
 - OS display scaling
 - Browser zoom (i.e. CTRL+Plus and CTRL+Minus)


## Gleam Inspect

[Gleam Inspect](./inspect.md) may be helpful when writing or debugging CSS for Gleam.


## Example

Here's example styling code for a simple painter:
```typescript
import { Context, createDomPeer, cssColor, cssFloat, currentDpr, Interval2D, Painter, PeerType, StyleProp } from '@metsci/gleam-core';

export class ExamplePainter implements Painter {
    // Create a DOM peer -- added to the DOM when this painter gets added to a pane
    readonly peer = createDomPeer( 'example-painter', this, PeerType.PAINTER );
    readonly style = window.getComputedStyle( this.peer );

    // Each StyleProp has a name (e.g. '--color'), a parser (e.g. cssColor), and a default value (e.g. 'rgb(0,0,0)')
    readonly color = StyleProp.create( this.style, '--color', cssColor, 'rgb(0,0,0)' );
    readonly width_LPX = StyleProp.create( this.style, '--width-px', cssFloat, 1 );

    // ...

    paint( context: Context, viewport_PX: Interval2D ): void {
        // At the start of each paint, get the current value of each CSS prop
        const color = this.color.get( );
        const width_LPX = this.width_LPX.get( );

        // Convert from CSS pixels (aka Logical Pixels, or LPX) to device pixels (PX)
        const dpr = currentDpr( this );
        const width_PX = Math.round( width_LPX * dpr );

        // ...
    }
}
```

To override this painter's default style in CSS:
```css
.gleam example-painter {
    --color: rgb( 100,100,100 );
    --width-px: 3;
}
```

To override the style of *specific instances* of `ExamplePainter`, use standard CSS selectors:
```css
.gleam gleam-pane.red > example-painter {
    --color: rgb( 255,0,0 );
}
```

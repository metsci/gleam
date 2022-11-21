import { addCssLink, attachPane, attachVerticalScrollableInputHandler, ColumnsLayout, gleamCoreDefaultStyleLoading, Pane, RowsLayout, TextLabel, VerticalScrollbar, VerticalScrollerLayout } from '@metsci/gleam-core';
import { ListenableBasic, requireNonNull, run, setTimeout3 } from '@metsci/gleam-util';

// Resolve relative URLs at load-time, in case a polyfill relies on document.currentScript
const mainCssUrl = new URL( './main.css', import.meta.url );

run( async ( ) => {
    // Begin loading CSS
    const stylesLoading = Promise.all( [
        gleamCoreDefaultStyleLoading,
        addCssLink( mainCssUrl ),
    ] );

    // Create a listenable that can be fired by application code to trigger a repaint
    const repaint = new ListenableBasic( );

    // Create a content pane, which will contain a bunch of horizontal rows
    const contentPane = new Pane( new RowsLayout( ) );
    contentPane.peer.id = 'content';

    // Create row panes (styled in CSS)
    const numRows = 500;
    for ( let r = 0; r < numRows; r++ ) {
        const row = new TextLabel( r.toFixed( 0 ) );

        // Add this row a few milliseconds after adding the previous one
        setTimeout3( 10*r, ( ) => {
            contentPane.addPane( row.pane );
            repaint.fire( );
        } );
    }

    // Wrap the content pane in a scroller
    const scrollerLayout = new VerticalScrollerLayout( );
    const scrollerPane = new Pane( scrollerLayout );
    scrollerPane.addPane( contentPane );

    // Create a scrollbar to control the scroller
    const scrollbar = new VerticalScrollbar( scrollerLayout );
    scrollbar.attachToRepaint( repaint );

    // The VerticalScrollbar has built-in input handlers on the scrollbar pane itself;
    // this line adds scrolling wheel and key handlers to the scrollable content pane
    attachVerticalScrollableInputHandler( contentPane, scrollerLayout, repaint );

    // Put the scrollbar along the right edge of the content pane
    const columnsPane = new Pane( new ColumnsLayout( ) );
    columnsPane.addPane( scrollerPane );
    columnsPane.addPane( scrollbar.pane );

    // Attach everything to the DOM
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, columnsPane, repaint );
} );

import { addCssLink, attachPane, BorderPainter, gleamCoreDefaultStyleLoading, GridLayout, Pane, setGridCoords, TextLabel } from '@metsci/gleam-core';
import { LinkedSet, ListenableBasic, requireNonNull, run } from '@metsci/gleam-util';

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

    // Create a grid
    const gridLayout = new GridLayout( );
    const gridPane = new Pane( gridLayout );

    // Add panes to the grid, each associated with a rowKey and columnKey
    const rows = new Map<string,{ label: Pane, data: Pane }>( );
    for ( const rowKey of [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] ) {
        // Add a row-label pane
        const label = new TextLabel( `Label ${rowKey}` );
        label.pane.addCssClass( 'row-label' );
        setGridCoords( label.pane, rowKey, 'Label' );
        gridPane.addPane( label.pane );

        // Add a row-data pane
        const data = new TextLabel( `Data ${rowKey}` );
        data.pane.addCssClass( 'row-data' );
        data.pane.addPainter( new BorderPainter( ) );
        setGridCoords( data.pane, rowKey, 'Data' );
        gridPane.addPane( data.pane );

        // Store the panes to refer to later
        rows.set( rowKey, { label: label.pane, data: data.pane } );
    }

    // Mark a couple of panes with CSS classes, for styling purposes
    rows.get( 'C' )?.data.addCssClass( 'flex-height' );
    rows.get( 'D' )?.data.addCssClass( 'alert' );
    rows.get( 'G' )?.data.addCssClass( 'flex-height' );

    // Indicate what rows and columns to show (and in what order)
    gridLayout.visibleColumnKeys = new LinkedSet( [ 'Label', 'Data' ] );
    gridLayout.visibleRowKeys = new LinkedSet( [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] );

    // Attach everything to the DOM
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, gridPane, repaint );
} );

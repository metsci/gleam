import { addCssLink, attachPane, createCommonBoundsAxis1D, createHoverAndFocusRefs, gleamCoreDefaultStyleLoading, GridPainter, PaneKeyEvent, TextAtlasCache } from '@metsci/gleam-core';
import { addRow, attachEventClassUpdaters, attachTimeCursor_PSEC, EventImpl, EventsRow, HorizontalTimeline, isWritableEvent, STANDARD_PATTERN_GENS } from '@metsci/gleam-timeline';
import { get, Interval1D, ListenableBasic, RefBasic, requireNonNull, run, SECONDS_PER_HOUR, tripleEquals, utcTimeToPsec } from '@metsci/gleam-util';
import { createHeatmapPlotRowPane, createLinePlotRowPane, createScatterPlotRowPane } from './misc';

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

    // Create a shared TextAtlasCache to avoid duplicating text rasterization, which can be slow
    const textAtlasCache = new TextAtlasCache( );

    // Create a time axis, and constrain it to reasonable zoom levels
    const timeAxis_PSEC = createCommonBoundsAxis1D( Interval1D.fromRect( utcTimeToPsec( 2021,1,1, 1,30,0 ), 65*SECONDS_PER_HOUR ) );
    timeAxis_PSEC.scaleConstraint = Interval1D.fromEdges( 3e-7, 3e3 );
    timeAxis_PSEC.reconstrain( false );

    // Create a timeline contraption
    const timeline = new HorizontalTimeline( timeAxis_PSEC, { textAtlasCache } );
    timeline.attachToRepaint( repaint );

    // Create a time cursor
    const timeCursor_PSEC = new RefBasic( 0, tripleEquals );
    timeCursor_PSEC.set( false, timeAxis_PSEC.bounds.fracToValue( 0.3 ) );
    attachTimeCursor_PSEC( timeline, timeCursor_PSEC );

    // Fn that creates a grid painter, called below to create a grid painter for each timeline row
    const timeGridPainter = ( ) => {
        return new GridPainter( timeAxis_PSEC, null, timeline.northAxisWidget.painter.ticker, null );
    };

    // Set CSS classes on hovered/focused timeline events
    const [ hoverRef, focusRef ] = createHoverAndFocusRefs( timeline.pane );
    attachEventClassUpdaters( hoverRef, focusRef );

    // Create an events row
    const eventsRow = get( ( ) => {
        const row = new EventsRow( timeAxis_PSEC, STANDARD_PATTERN_GENS );
        row.attachToRepaint( repaint );

        // Generate events
        const refTime_PSEC = utcTimeToPsec( 2021,1,1, 6,0,0 );
        const eventSpan_SEC = 5 * 3600;
        for ( let i = 0; i < 100; i++ ) {
            const label = `Event ${i.toFixed( 0 )}`;
            const start_PSEC = refTime_PSEC + 0.03*( i % 10 )*eventSpan_SEC + 1.1*Math.floor( 0.1*i )*eventSpan_SEC;
            const era_PSEC = Interval1D.fromRect( start_PSEC, eventSpan_SEC );
            const event = new EventImpl( label, era_PSEC, { allowsUserDrag: true } );
            if ( i % 7 === 0 ) {
                // Give some events a different style
                event.addClass( false, 'alert' );
            }
            row.events.addEvent( event );
        }

        return row;
    } );

    // Add custom key handlers that modify the focused event
    eventsRow.pane.inputSpectators.add( {
        handleKeyPress( target: unknown, evPress: PaneKeyEvent ): void {
            const event = ( target as any )?.event;
            if ( !evPress.keysDown.has( 'Control' ) && isWritableEvent( event ) ) {
                switch ( evPress.key ) {
                    case 'a':
                    case 'A': {
                        event.toggleClass( false, 'alert' );
                    }
                    break;

                    case 'Delete': {
                        if ( eventsRow.events.has( event ) ) {
                            eventsRow.events.removeEvent( event );
                        }
                    }
                    break;
                }
            }
        },
    } );

    // Create additional data rows
    const linePlotPane = createLinePlotRowPane( timeAxis_PSEC, repaint, textAtlasCache );
    const scatterPlotPane = createScatterPlotRowPane( timeAxis_PSEC, repaint, textAtlasCache );
    const heatmapPlotPane = createHeatmapPlotRowPane( timeAxis_PSEC, repaint, textAtlasCache );

    // Add rows to the timeline
    addRow( timeline, 'A',   'Row A',   [ timeGridPainter ], [ eventsRow.pane ] );
    addRow( timeline, 'B',   'Row B',   [ timeGridPainter ], [] );
    addRow( timeline, 'B0',  'Row B0',  [ timeGridPainter ], [], 'B' );
    addRow( timeline, 'B1',  'Row B1',  [ timeGridPainter ], [], 'B' );
    addRow( timeline, 'B2',  'Row B2',  [ timeGridPainter ], [], 'B' );
    addRow( timeline, 'C',   'Row C',   [ timeGridPainter ], [ linePlotPane ] );
    addRow( timeline, 'D',   'Row D',   [ timeGridPainter ], [] );
    addRow( timeline, 'D0',  'Row D0',  [ timeGridPainter ], [ heatmapPlotPane ], 'D' );
    addRow( timeline, 'D1',  'Row D1',  [ timeGridPainter ], [], 'D' );
    addRow( timeline, 'D1a', 'Row D1a', [ timeGridPainter ], [], 'D1' );
    addRow( timeline, 'D1b', 'Row D1b', [ timeGridPainter ], [], 'D1' );
    addRow( timeline, 'E',   'Row E',   [ timeGridPainter ], [ scatterPlotPane ] );
    addRow( timeline, 'F',   'Row F',   [ timeGridPainter ], [] );
    addRow( timeline, 'G',   'Row G',   [ timeGridPainter ], [] );
    addRow( timeline, 'H',   'Row H',   [ timeGridPainter ], [] );
    addRow( timeline, 'I',   'Row I',   [ timeGridPainter ], [] );
    addRow( timeline, 'J',   'Row J',   [ timeGridPainter ], [] );
    addRow( timeline, 'K',   'Row K',   [ timeGridPainter ], [] );

    // Make the timeline visible
    await stylesLoading;
    const host = requireNonNull( document.getElementById( 'host' ) );
    attachPane( host, timeline.pane, repaint );
} );

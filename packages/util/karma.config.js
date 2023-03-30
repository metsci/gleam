module.exports = function( config ) {
    config.set( {
        plugins: [
            'karma-spec-reporter',
            'karma-jasmine',
            'karma-chrome-launcher',
        ],
        basePath: '',
        files: [ 'build/test/index.js' ],
        frameworks: [ 'jasmine' ],
        browsers: [ 'ChromeHeadless' ],
        reporters: [ 'spec' ],
        specReporter: {
            showBrowser: false,
            showSpecTiming: true,
            failFast: false,
        },
    } );
};

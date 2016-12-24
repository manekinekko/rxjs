var httpServer = require('http-server');
var path = require('path');

exports.config = {
  directConnect: true,

  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      //Important for benchpress to get timeline data from the browser
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'v8,blink.console,disabled-by-default-devtools.timeline'
      }
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },

  specs: ['perf/macro/**/*.spec.js'],
  framework: 'jasmine2',

  beforeLaunch: function () {
    httpServer.createServer({
      showDir: false
    }).listen('8080', 'localhost');
  },

  onPrepare: function() {
    // open a new browser for every benchmark
    var originalBrowser = browser;
    var _tmpBrowser;
    beforeEach(function() {
      global.browser = originalBrowser.forkNewDriverInstance();
      global.element = global.browser.element;
      global.$ = global.browser.$;
      global.$$ = global.browser.$$;
    });
    afterEach(function() {
      global.browser.quit();
      global.browser = originalBrowser;
    });
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 100000
  },

  perfy: {
    reportsFolder: './perf_reports',
    reportsDataFolder: './perf_reports/data',
    reportsFiles: './perf_reports/data/macro/*_*.json',

    providers: function(benchpress) {
      return [

        //use protractor as Webdriver client
        benchpress.SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,

        //use RegressionSlopeValidator to validate samples
        { provide: benchpress.Validator, useExisting: benchpress.RegressionSlopeValidator },

        //use 10 samples to calculate slope regression
        { provide: benchpress.RegressionSlopeValidator.SAMPLE_SIZE, useValue: 20 },

        //use the 'renderTime' metric to calculate slope regression
        { provide: benchpress.RegressionSlopeValidator.METRIC, useValue: 'scriptTime' },
        { provide: benchpress.Options.FORCE_GC, useValue: false },

        // Add Reporters : Console + Json
        benchpress.JsonFileReporter.PROVIDERS,

        // Make sure this folder is already created and writable
        { provide: benchpress.JsonFileReporter.PATH, useValue: path.resolve('./perf_reports/data/macro') },
        benchpress.MultiReporter.provideWith([
            benchpress.ConsoleReporter,
            benchpress.JsonFileReporter
        ])

      ];
    }
  }
};

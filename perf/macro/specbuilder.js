var benchpress = require('@angular/benchpress');
var perfy = require('../../protractor.conf').config.perfy;

exports.Preset = (function () {
  function Preset() {
    this.iteration = arguments.length ? Array.prototype.slice.call(arguments) : [1000, 10000];
    this.runner = new benchpress.Runner(perfy.providers(benchpress));
  }

  Preset.prototype.initBrowser = function (browser, url, value) {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:8080/perf/macro/' + url + '/index.html?iterations=' + value);
  };

  Preset.prototype.sampleParameter = function (sampleId, documentId, value) {
    return {
      id: sampleId,
      execute: function () {
        $(documentId).click();
      },
      bindings: [{
        provide: benchpress.Options.SAMPLE_DESCRIPTION,
        useValue: {
          iterations: value
        }
      }]
    };
  };

  return Preset;
})();

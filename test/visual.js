var postcss = require('postcss');
var stylelint = require('stylelint');
var reporter = require('..');
var fs = require('fs');
var sourceMap = require('source-map');

var reporterOptions = {
  // positionless: 'last',
  // sortByPosition: true,
  // noIcon: true,
  // noPlugin: true,
  // plugins: ['stylelint'],
};

fs.readFile('test/fixtures/forVisual.css', { encoding: 'utf8' }, function(err, data) {
  if (err) throw err;

  var processOptions = {
    from: 'test/fixtures/forVisual.css',
    map: { prev: createSourceMap() },
  };

  postcss()
    .use(stylelint({
      rules: {
        'block-opening-brace-newline-after': 'always',
        'declaration-colon-space-after': 'always',
        'length-zero-no-unit': true,
        'indentation': 'tab',
      },
    }))
    .use(reporter(reporterOptions))
    .process(data, processOptions)
    .then(function() {
      console.log('There\'s your visual confirmation that it works.');
    })
    .catch(function(error) {
      console.log(error.stack);
    });
});

function createSourceMap() {
  var map = new sourceMap.SourceMapGenerator({ file: 'forVisual.css' });
  map.addMapping({
    generated: { line: 2, column: 7 },
    source: 'forVisual.original.css',
    original: { line: 102, column: 107 },
  });
  return map.toString();
}

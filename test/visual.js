var postcss = require('postcss');
var stylelint = require('stylelint');
var reporter = require('..');
var fs = require('fs');

var reporterOptions = {
  // positionless: 'last',
  // sortByPosition: true,
};

fs.readFile('test/forVisual.css', { encoding: 'utf8' }, function(err, data) {
  if (err) throw err;
  postcss()
    .use(stylelint({
      rules: {
        'block-opening-brace-newline-after': [2, 'always'],
        'declaration-colon-space-after': [2, 'always'],
        'number-zero-length-no-unit': [2],
        'indentation': [2, 'tlab'],
      },
    }))
    .use(reporter(reporterOptions))
    .process(data, { from: 'test/forVisual.css' })
    .then(function() {
      console.log('There\'s your visual confirmation that it works.');
    })
    .catch(function(error) {
      console.log(error.stack);
    });
});

var postcss = require('postcss');
var bemLinter = require('postcss-bem-linter');
var logWarnings = require('..');
var fs = require('fs');

fs.readFile('test/forVisual.css', { encoding: 'utf8' }, function(err, data) {
  if (err) throw err;
  postcss()
    .use(bemLinter())
    .use(logWarnings())
    .process(data, { from: 'test/forVisual.css' })
    .then(function() {
      console.log('There\'s your visual confirmation that it works.');
    })
    .catch(function(error) {
      console.log(error.stack);
    });
});

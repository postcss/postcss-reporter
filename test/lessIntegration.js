var less = require('less');
var postcss = require('postcss');
var stylelint = require('stylelint');
var reporter = require('..');
var fs = require('fs');
var path = require('path');

var lessSource = path.join(__dirname, 'fixtures/less-bar.less');

fs.readFile(lessSource, 'utf8', function(err, code) {
  if (err) throw err;

  var lessOptions = {
    sourceMap: { sourceMapFileInline: true },
    paths: [path.join(__dirname, 'fixtures')],
    filename: lessSource,
  };
  less.render(code, lessOptions).then(function(output) {
    return postcss()
      .use(stylelint({ rules: { 'selector-no-id': true } }))
      .use(reporter())
      .process(output.css, { from: lessSource })
  }).catch(function(err) { console.log(err.stack); });
});

'use strict';

var postcss = require('postcss');
var logWarnings = require('..');
var fs = require('fs');

var rejectColors = postcss.plugin('reject-colors', function() {
  return function(css, result) {
    css.eachDecl(function(decl) {
      if (decl.prop === 'color') {
        result.warn('no colors allowed', { node: decl });
      }
    });
  };
});

var rejectBackgrounds = postcss.plugin('reject-backgrounds', function() {
  return function(css, result) {
    css.eachDecl(function(decl) {
      if (decl.prop === 'background') {
        result.warn('no backgrounds allowed', { node: decl });
      }
    });
  };
});

var rejectRoot = postcss.plugin('reject-root', function() {
  return function(css, result) {
    result.warn('blergh', { node: css });
  };
});

fs.readFile('test/forVisual.css', { encoding: 'utf8' }, function(err, data) {
  if (err) throw err;
  postcss()
    .use(rejectColors())
    .use(rejectBackgrounds())
    .use(rejectRoot())
    .use(logWarnings({ throwError: true }))
    .process(data, { from: 'test/forVisual.css' })
    .then(function() {
      console.error('`throwError: true` failed!');
    })
    .catch(function(ourErr) {
      console.log(ourErr);
      console.log('There\'s your visual confirmation that it works.');
    })
    .catch(function(error) {
      console.log(error.stack);
    });
});

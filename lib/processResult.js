'use strict';

var chalk = require('chalk');
var path = require('path');

module.exports = function(postcssResult, options) {
  options = options || {};
  options.plugins = options.plugins || [];

  var warnings = postcssResult.warnings();

  if (!warnings.length) return undefined;

  var output = '\n# postcss-log-warnings\n\n';

  output += chalk.bold.underline(logFrom(postcssResult.root.source.input.from)) + '\n';

  var filteredWarnings = warnings.filter(shouldLog);
  filteredWarnings.forEach(function(w) {
    output += warningToString(w) + '\n';
  });

  // Unless user has set `keepWarnings` option,
  // clear all these warnings that were just stringified
  if (!options.keepWarnings) {
    postcssResult.messages = postcssResult.messages.filter(function(message) {
      return message.type !== 'warning';
    });
  }

  return output;

  function shouldLog(warning) {
    if (options.plugins.length && options.plugins.indexOf(warning.plugin) === -1) {
      return false;
    }
    return true;
  }

  function warningToString(warning) {
    var str = '';
    if (warning.node && warning.node.type !== 'root') {
      str += chalk.bold(
        warning.node.source.start.line + ':' +
        warning.node.source.start.column + '\t'
      );
    }
    str += warning.text;
    if (options.plugins.length !== 1) {
      str += chalk.yellow(' [' + warning.plugin + ']');
    }
    return str;
  }

  function logFrom(f) {
    if (f.charAt(0) === '<') return f;
    return path.relative(process.cwd(), f);
  }
};

'use strict';

var postcss = require('postcss');
var chalk = require('chalk');
var _ = require('lodash');
var defaultFormatter = require('./lib/defaultFormatter');
var shouldLogMessage = require('./lib/shouldLogMessage');

module.exports = postcss.plugin('postcss-reporter', function(options) {
  options = options || {};

  var formatter = options.formatter || defaultFormatter;

  return function(css, result) {
    var messagesToLog = shouldLogMessage(result, options.plugins);

    var report = formatter(result, options);

    if (!report) return;

    console.log(report);

    // If user has set `clearMessages` option,
    // clear all these messages that were just stringified
    if (options.clearMessages) {
      result.messages = _.difference(result.message, messagesToLog);
    }

    if (options.throwError && shouldThrowError()) {
      throw new Error(chalk.red.bold('\n** postcss-reporter: warnings or errors were found **'));
    }

    function shouldThrowError() {
      return (
        messagesToLog.length
        && messagesToLog.some(function(message) {
          return message.type === 'warning' || message.type === 'error';
        })
      );
    }
  };
});

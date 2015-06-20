var chalk = require('chalk');
var _ = require('lodash');
var defaultFormatter = require('./defaultFormatter');

module.exports = function(opts) {
  var options = opts || {};

  var formatter = options.formatter || defaultFormatter();

  return function(css, result) {
    var messagesToLog = (!options.plugins || !options.plugins.length)
      ? result.messages
      : result.messages.filter(function(message) {
          if (options.plugins.indexOf(message.plugin) !== -1) {
            return true;
          }
        });

    var report = formatter({
      messages: messagesToLog,
      source: result.root.source.input.from,
    });

    if (options.clearMessages) {
      result.messages = _.difference(result.messages, messagesToLog);
    }

    if (!report) return;

    console.log(report);

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
};

var chalk = require('chalk');
var difference = require('lodash.difference');
var defaultFormatter = require('./formatter');

module.exports = function(opts) {
  var options = opts || {};

  var formatter = options.formatter || defaultFormatter({
    sortByPosition: (typeof options.sortByPosition !== 'undefined') ? options.sortByPosition : true,
    positionless: options.positionless || 'first',
    noIcon: options.noIcon,
    noPlugin: options.noPlugin,
  });

  return function(css, result) {
    var messagesToLog = (!options.plugins || !options.plugins.length)
      ? result.messages
      : result.messages.filter(function(message) {
          return options.plugins.indexOf(message.plugin) !== -1;
        });

    var source = (!result.root.source) ? undefined
      : result.root.source.input.file || result.root.source.input.id

    var report = formatter({
      messages: messagesToLog,
      source: source,
    });

    if (options.clearMessages) {
      result.messages = difference(result.messages, messagesToLog);
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

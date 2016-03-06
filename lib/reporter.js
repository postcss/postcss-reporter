var chalk = require('chalk');
var _ = require('lodash');
var defaultFormatter = require('./formatter');
var symbols = require('log-symbols');
var util = require('./util');

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return (count === 1 ? word : word + 's');
}

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

    var resultSource = (!result.root.source) ? ''
      : result.root.source.input.file || result.root.source.input.id

    var sourceGroupedMessages = _.groupBy(messagesToLog, function(message) {
      return util.getLocation(message).file || resultSource;
    });

    var report = '',
        total = 0,
        levels = {info: 0, warning: 0, error: 0};
    _.forOwn(sourceGroupedMessages, function(messages, source) {
      var formatted = formatter({
        messages: messages,
        source: source,
      });

      report += formatted.output;
      for (var key in formatted.levels) {
        if (formatted.levels.hasOwnProperty(key)) {
          total += formatted.levels[key];
          levels[key] += formatted.levels[key];
        }
      }
    });

    if (options.clearMessages) {
      result.messages = _.difference(result.messages, messagesToLog);
    }

    if (!report) return;

    if (total > 0) {
      var color = 'blue';
      var icon = symbols.info;
      if (levels.error > 0) {
        color = 'red';
        icon = symbols.error;
      } else if (levels.warning > 0) {
        color = 'yellow';
        icon = symbols.warning;
      }


      report += '\n' + chalk[color].bold([
          icon + ' ',
          total,
          pluralize(' problem', total),
          ' (',
          ['info', 'error', 'warning'].map(function(key) {
            if (levels[key] == 0) return null;

            return levels[key] + ' ' + pluralize(key, levels[key]);
          }).filter(function(content) { return !!content }).join(', '),
          ')\n',
        ].join(''));
    }

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

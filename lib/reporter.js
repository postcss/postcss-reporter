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
		warnings = 0,
		errors = 0;
    _.forOwn(sourceGroupedMessages, function(messages, source) {
		var formatted = formatter({
		    messages: messages,
		    source: source,
		  });
		  
      report += formatted.output;
	  warnings += formatted.warnings;
	  errors += formatted.errors;
    });

    if (options.clearMessages) {
      result.messages = _.difference(result.messages, messagesToLog);
    }

    if (!report) return;
	
    if (errors > 0 || warnings > 0) {
		var color = errors > 0 ? 'red' : 'yellow';
		var icon = errors > 0 ? symbols.error : symbols.warning;
		
        report += '\n' + chalk[color].bold([
            icon + ' ',
			errors + warnings,
			pluralize(' problem', errors + warnings),
            ' (',
			errors, pluralize(' error', errors),
			', ',
            warnings, pluralize(' warning', warnings),
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

var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');
var table = require('text-table');
var _ = require('lodash');
var util = require('./util');

module.exports = function(opts) {
  var options = opts || {};
  var sortByPosition = (typeof options.sortByPosition !== 'undefined') ? options.sortByPosition : true;
  var positionless = options.positionless || 'first';

  return function(input) {
    var messages = input.messages;
    var source = input.source;

    if (!messages.length) return {output: '', errors: 0, warnings: 0};

    var orderedMessages = _.sortBy(
      messages,
      function(m) {
        if (!m.line) return 1;
        if (positionless === 'any') return 1;
        if (positionless === 'first') return 2;
        if (positionless === 'last') return 0;
      },
      function(m) {
        if (!sortByPosition) return 1;
        return m.line;
      },
      function(m) {
        if (!sortByPosition) return 1;
        return m.column;
      }
    );

    var output = '\n',
        errors = 0,
		warnings = 0;

    if (source) {
      output += chalk.bold.underline(logFrom(source)) + '\n';
    }
	
	output += table(
		orderedMessages.map(function(message) {
			var location = util.getLocation(message);
            var messageType;

            if (message.type === 'error') {
                messageType = chalk.red(options.noIcon? 'error' : symbols.error);
                errors++;
            } else {
                messageType = chalk.yellow(options.noIcon? 'warning' : symbols.warning);
                warnings++;
            }

            return [
                '',
                location.line || '',
                location.column || '',
                messageType,
                message.text.replace(/\.$/, ''),
                options.noPlugin ? '' : chalk.dim(message.plugin || ''),
            ];
		}),
        {
            align: ['', 'r', 'l'],
            stringLength: function(str) {
                return chalk.stripColor(str).length;
            },
        }
	)
	.split('\n')
	.map(function(el) {
        return el.replace(/(\d+)\s+(\d+)/, function(m, p1, p2) {
            return chalk.dim(p1 + ':' + p2 + ' ');
        });
    })
	.join('\n');

    return {
		output: output + '\n',
		errors: errors,
		warnings: warnings,
	};

    function logFrom(fromValue) {
      if (fromValue.charAt(0) === '<') return fromValue;
      return path.relative(process.cwd(), fromValue).split(path.sep).join('/');
    }
  };
};

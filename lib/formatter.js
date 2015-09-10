var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');
var sortByAll = require('lodash.sortbyall');
var property = require('lodash.property');

module.exports = function(opts) {
  var options = opts || {};
  var sortByPosition = (typeof options.sortByPosition !== 'undefined') ? options.sortByPosition : true;
  var positionless = options.positionless || 'first';

  return function(input) {
    var messages = input.messages;
    var source = input.source;

    if (!messages.length) return undefined;

    var orderedMessages = sortByAll(
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

    var output = '\n';

    if (source) {
      output += chalk.bold.underline(logFrom(source)) + '\n';
    }

    orderedMessages.forEach(function(w) {
      output += messageToString(w) + '\n';
    });

    return output;

    function messageToString(message) {
      var str = '';

      if (message.line) {
        str += chalk.bold(message.line);
      }

      if (message.column) {
        str += chalk.bold(':' + message.column)
      }

      if (message.line || message.column) {
        str += '\t';
      }

      if (!options.noIcon && message.type === 'warning') {
        str += chalk.yellow(symbols.warning + '  ');
      }

      str += message.text;
      if (!options.noPlugin) {
        str += chalk.yellow(' [' + message.plugin + ']');
      }
      return str;
    }

    function logFrom(fromValue) {
      if (fromValue.charAt(0) === '<') return fromValue;
      return path.relative(process.cwd(), fromValue);
    }
  };
};

var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');
var sortByAll = require('lodash.sortbyall');
var property = require('lodash.property');

module.exports = function(opts) {
  var options = opts || {};
  var sortByPosition = (typeof options.sortByPosition !== 'undefined') ? options.sortByPosition : true;
  return function(input) {
    var messages = input.messages;
    var source = input.source;

    if (!messages.length) return undefined;

    var orderedMessages = (sortByPosition)
      ? sortByAll(
        messages,
        property('node.source.start.line'),
        property('node.source.start.column')
      )
      : messages;

    var output = '\n';

    output += chalk.bold.underline(logFrom(source)) + '\n';

    orderedMessages.forEach(function(w) {
      output += messageToString(w) + '\n';
    });

    return output;

    function messageToString(message) {
      var str = '';

      if (message.node && message.node.source && message.node.source.start) {
        str += chalk.bold(
          message.node.source.start.line + ':' +
          message.node.source.start.column + '\t'
        );
      }

      if (message.type === 'warning') {
        str += chalk.yellow(symbols.warning + '  ');
      }

      str += message.text;
      str += chalk.yellow(' [' + message.plugin + ']');
      return str;
    }

    function logFrom(fromValue) {
      if (fromValue.charAt(0) === '<') return fromValue;
      return path.relative(process.cwd(), fromValue);
    }
  };
};

var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');

module.exports = function() {
  return function(input) {
    var messages = input.messages;
    var source = input.source;

    if (!messages.length) return undefined;

    var output = '\n';

    output += chalk.bold.underline(logFrom(source)) + '\n';

    messages.forEach(function(w) {
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

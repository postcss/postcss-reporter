var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');
var sortByAll = require('lodash.sortbyall');
var property = require('lodash.property');

var getMessageLine = property('node.source.start.line');
var getMessageColumn = property('node.source.start.column');

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
        if (!getMessageLine(m)) return 1;
        if (positionless === 'any') return 1;
        if (positionless === 'first') return 2;
        if (positionless === 'last') return 0;
      },
      function(m) {
        if (!sortByPosition) return 1;
        return getMessageLine(m);
      },
      function(m) {
        if (!sortByPosition) return 1;
        return getMessageColumn(m);
      }
    );

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

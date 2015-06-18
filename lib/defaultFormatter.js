'use strict';

var chalk = require('chalk');
var path = require('path');
var shouldLogMessage = require('./shouldLogMessage');

module.exports = function(postcssResult, options) {
  options = options || {};
  options.plugins = options.plugins || [];

  var messages = postcssResult.messages;

  if (!messages.length) return undefined;

  var output = '\n# postcss-reporter\n\n';

  output += chalk.bold.underline(logFrom(postcssResult.root.source.input.from)) + '\n';

  var messagesToLog = messages.filter(shouldLogMessage.bind(null, options.plugins));
  messagesToLog.forEach(function(w) {
    output += messageToString(w) + '\n';
  });

  return output;

  function messageToString(message) {
    var str = '';
    var typeDot;
    if (message.type === 'warning') {
      typeDot = chalk.yellow('! ');
    } else if (message.type === 'error') {
      typeDot = chalk.red('x ');
    }

    if (message.node && message.node.type !== 'root') {
      str += chalk.bold(
        message.node.source.start.line + ':' +
        message.node.source.start.column + '\t'
      );
    }
    str += typeDot;
    str += message.text;
    if (options.plugins.length !== 1) {
      str += chalk.yellow(' [' + message.plugin + ']');
    }
    return str;
  }

  function logFrom(fromValue) {
    if (fromValue.charAt(0) === '<') return fromValue;
    return path.relative(process.cwd(), fromValue);
  }
};

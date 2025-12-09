let pico = require('picocolors');
let path = require('path');
let firstBy = require('thenby');
let util = require('./util');

function createSortFunction(positionless, sortByPosition) {
  let positionValue = 0

  if (positionless === 'any') positionValue = 1;
  if (positionless === 'first') positionValue = 2;
  if (positionless === 'last') positionValue = 0;

  let sortFunction = firstBy((m) => !m.line ? 1 : positionValue)

  if (sortByPosition) {
    sortFunction = sortFunction.thenBy('line').thenBy('column');
  }

  return sortFunction;
}

module.exports = function (options = {}) {
  let sortByPosition =
    typeof options.sortByPosition !== 'undefined'
      ? options.sortByPosition
      : true;
  let positionless = options.positionless || 'first';

  let sortFunction = createSortFunction(positionless, sortByPosition);

  return function (input) {
    let messages = input.messages.filter((message) => typeof message.text === 'string');
    let source = input.source;

    if (!messages.length) return '';

    let orderedMessages = messages.sort(sortFunction);

    let output = '\n';

    if (source) {
      output += pico.bold(pico.underline(logFrom(source))) + '\n';
    }

    orderedMessages.forEach((w) => output += messageToString(w) + '\n');

    return output;

    function messageToString(message) {
      let location = util.getLocation(message);
      let str = '';

      if (location.line) {
        str += pico.bold(location.line);
      }

      if (location.column) {
        str += pico.bold(':' + location.column);
      }

      if (location.line || location.column) {
        str += '\t';
      }

      if (!options.noIcon) {
        if (message.type === 'warning') {
          str += pico.yellow(util.warningSymbol + '  ');
        } else if (message.type === 'error') {
          str += pico.red(util.errorSymbol + '  ');
        }
      }

      str += message.text;
      if (!options.noPlugin) {
        str += pico.yellow(' [' + message.plugin + ']');
      }
      return str;
    }

    function logFrom(fromValue) {
      return fromValue.charAt(0) === '<' ? fromValue : path.relative(process.cwd(), fromValue).split(path.sep).join('/');
    }
  };
};

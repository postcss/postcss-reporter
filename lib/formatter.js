var chalk = require('chalk');
var path = require('path');
var symbols = require('log-symbols');
var table = require('table');
var _ = require('lodash');
var util = require('./util');

var marginWidths = 9;

var levelColors = {
  'info': 'blue',
  'warning': 'yellow',
  'error': 'red',
};

function getSeverity(type) {
  if (type == 'error') {
    return 'error';
  }

  if (type == 'info') {
    return 'info';
  }

  return 'warning';
}

function logFrom(fromValue) {
  if (fromValue.charAt(0) === '<') return fromValue;
  return path.relative(process.cwd(), fromValue).split(path.sep).join('/');
}

function getMessageWidth(columnWidths) {
  if (!process.stdout.isTTY) {
    return columnWidths[3];
  }

  var availableWidth = process.stdout.columns;
  var fullWidth = _.sum(_.values(columnWidths));

  // If there is no reason to wrap the text, we won't align the last column to the right
  if (availableWidth > fullWidth + marginWidths) {
    return columnWidths[3];
  }

  return availableWidth - (fullWidth - columnWidths[3] + marginWidths);
}

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

    // Create a list of column widths, needed to calculate
    // the size of the message column and if needed wrap it.
    var columnWidths = {0: 1, 1: 1, 2: 1, 3: 1, 4: 1};

    var calculateWidths = function (columns) {
      var width;
      for (var i in columns) {
        if (columns.hasOwnProperty(i)) {
          width = chalk.stripColor(columns[i]).toString().length;
          if (width > columnWidths[i]) {
            columnWidths[i] = width;
          }
        }
      }

      return columns;
    };

    var output = '\n',
        levels = {info: 0, warning: 0, error: 0};

    if (source) {
      output += chalk.bold.underline(logFrom(source)) + '\n';
    }

    var cleanedMessages = orderedMessages.map(
      function (message) {
        var location = util.getLocation(message);
        var severity = getSeverity(message.type);
        var messageType = chalk[levelColors[severity]](options.noIcon ? severity : symbols[severity]);
        levels[severity]++;

        return calculateWidths([
            location.line || '',
            location.column || '',
            messageType,
            message.text.replace(/\.$/, ''),
            options.noPlugin ? '' : chalk.yellow(message.plugin || ''),
          ]);
      });

    output += table.default(
      cleanedMessages,
      {
        border: table.getBorderCharacters('void'),
        columns: {
          0: {alignment: 'right', width: columnWidths[0], paddingRight: 0},
          1: {alignment: 'left', width: columnWidths[1]},
          2: {alignment: 'left', width: columnWidths[2]},
          3: {alignment: 'left', width: getMessageWidth(columnWidths), wrapWord: true},
          4: {alignment: 'left', width: columnWidths[4], paddingRight: 0},
        },
        drawHorizontalLine: function() {
          return false
        },
      }
    )
    .split('\n')
    .map(function(el) {
      return el.replace(/(\d+)\s+(\d+)/, function(m, p1, p2) {
        return p1 + ':' + p2;
      });
    })
    .join('\n');

    return {
      output: output,
      levels: levels,
    };
  };
};

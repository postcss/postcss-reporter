let supportsLargeCharset =
  process.platform !== 'win32' ||
  process.env.CI ||
  process.env.TERM === 'xterm-256color';

exports.getLocation = function (message) {
  let messageNode = message.node;

  let location = {
    line: message.line,
    column: message.column,
  };

  let messageInput = messageNode && messageNode.source && messageNode.source.input;

  if (!messageInput) return location;

  let originLocation =
    messageInput.origin && messageInput.origin(message.line, message.column);
  if (originLocation) return originLocation;

  location.file = messageInput.file || messageInput.id;
  return location;
};

exports.plur = function plur(word, count) {
  return (count === 1 ? word : `${word}s`);
}

exports.warningSymbol = supportsLargeCharset ? '⚠' : '!!';
exports.errorSymbol = supportsLargeCharset ? '✖' : 'xx';

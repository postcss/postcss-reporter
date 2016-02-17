exports.getLocation = function (message) {
  var location = {
    line: message.line,
    column: message.column,
  }

  var node = message.node
  if (!node || !node.source || !node.source.input) return location;

  var origin = node.source.input.origin &&
      node.source.input.origin(message.line, message.column);
  if (origin) {
    return origin;
  }

  location.file = message.node.source.input.file || message.node.source.input.id;
  return location;
};

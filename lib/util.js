var _ = require('lodash');

exports.getLocation = function(message) {
  var location = {
    line: message.line,
    column: message.column,
  };

  var messageNode = message.node;
  var messageInput = _.get(messageNode, 'source.input');

  if (!messageInput) return location;

  if (messageInput.origin) {
    return messageInput.origin(message.line, message.column);
  }

  location.file = messageInput.file || messageInput.id;
  return location;
};

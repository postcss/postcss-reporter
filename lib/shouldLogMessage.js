'use strict';

module.exports = function(pluginList, message) {
  if (!pluginList.length || pluginList.indexOf(message.plugin) !== -1) {
    return true;
  }
};

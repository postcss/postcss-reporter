let defaultFormatter = require('./formatter');
let pico = require('picocolors');
let util = require('./util');
let hasOwn = Object.prototype.hasOwnProperty;

module.exports = function (opts = {}) {
  let formatter =
    opts.formatter ||
    defaultFormatter({
      noIcon: opts.noIcon,
      noPlugin: opts.noPlugin,
    });

  let pluginFilter;
  if (!opts.plugins) {
    // Every plugin
    pluginFilter = () => true;
  } else if (
    opts.plugins.every((plugin) => plugin[0] === '!')
  ) {
    // Deny list
    pluginFilter = (message) => opts.plugins.indexOf('!' + message.plugin) === -1;
  } else {
    // Allow list
    pluginFilter = (message) => opts.plugins.indexOf(message.plugin) !== -1;
  }

  let messageFilter = opts.filter || ((message) => message.type === 'warning' || message.type === 'error');

  return {
    postcssPlugin: 'postcss-reporter',
    OnceExit(css, { result }) {
      let messagesToLog = result.messages
        .filter(pluginFilter)
        .filter(messageFilter);

      let resultSource = !result.root.source
        ? ''
        : result.root.source.input.file || result.root.source.input.id;

      let errorCount = 0;
      let warningCount = 0;

      let sourceGroupedMessages = messagesToLog.reduce((grouped, message) => {
        let key = util.getLocation(message).file || resultSource;

        if (!hasOwn.call(grouped, key)) {
          grouped[key] = [];
        }

        if (message.type === 'error') {
          errorCount++;
        } else if (message.type === 'warning') {
          warningCount++;
        }

        grouped[key].push(message);

        return grouped;
      }, {});

      let report = '';
      for (let source in sourceGroupedMessages) {
        if (hasOwn.call(sourceGroupedMessages, source)) {
          report += formatter({
            messages: sourceGroupedMessages[source],
            source: source,
          });
        }
      }

      if (opts.clearReportedMessages) {
        result.messages = result.messages.filter(message => !messagesToLog.includes(message));
      }

      if (opts.clearAllMessages) {
        let messagesToClear = result.messages.filter(pluginFilter);
        result.messages = result.messages.filter(message => !messagesToClear.includes(message));
      }

      if (!report) return;

      let summaryColor = errorCount > 0 ? 'red' : 'yellow';
      let summarySymbol = errorCount > 0 ? util.errorSymbol : util.warningSymbol;
      let summary = `${summarySymbol} ${messagesToLog.length} ${util.plur('problem', messagesToLog.length)} (${errorCount} ${util.plur('error')}, ${warningCount} ${util.plur('warning')})`

      report += `\n ${pico[summaryColor](pico.bold(summary))}\n`;

      console.log(report);

      if (opts.throwError || errorCount > 0) {
        throw new Error(
          pico.red(
            pico.bold('\n** postcss-reporter: warnings or errors were found **')
          )
        );
      }
    },
  };
};

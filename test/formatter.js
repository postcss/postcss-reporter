var test = require('tape');
var formatter = require('../lib/formatter');
var chalk = require('chalk');
var symbols = require('log-symbols');
var path = require('path');

var defaultFormatter = formatter();

var colorlessWarning = chalk.stripColor(symbols.warning);

var basicMessages = [
  {
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning',
  },
  {
    type: 'warning',
    plugin: 'bar',
    text: 'bar warning',
  },
  {
    type: 'warning',
    plugin: 'baz',
    text: 'baz warning',
  },
  {
    type: 'error',
    plugin: 'baz',
    text: 'baz error',
  },
];

var basicOutput = '\n<input css 1>' +
  '\n' + colorlessWarning + '  foo warning [foo]' +
  '\n' + colorlessWarning + '  bar warning [bar]' +
  '\n' + colorlessWarning + '  baz warning [baz]' +
  '\nbaz error [baz]' +
  '\n';

var basicOutputMinimal = '\n<input css 1>' +
  '\nfoo warning' +
  '\nbar warning' +
  '\nbaz warning' +
  '\nbaz error' +
  '\n';

test('defaultFormatter with simple mock messages', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: basicMessages,
      source: '<input css 1>',
    })),
    basicOutput,
    'basic'
  );

  t.end();
});

test('defaultFormatter with noIcon and noPlugin and simple mock messages', function(t) {
  var minimalFormatter = formatter({
    noIcon: true,
    noPlugin: true,
  });

  t.equal(
    chalk.stripColor(minimalFormatter({
      messages: basicMessages,
      source: '<input css 1>',
    })),
    basicOutputMinimal,
    'basic'
  );

  t.end();
});

var complexMessages = [
  {
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning',
    line: 3,
    column: 5,
  }, {
    type: 'error',
    plugin: 'baz',
    text: 'baz error',
  }, {
    type: 'warning',
    plugin: 'bar',
    text: 'bar warning',
    line: 1,
    column: 99,
  }, {
    type: 'warning',
    plugin: 'foo',
    text: 'ha warning',
    line: 8,
    column: 13,
  },
];

var complexOutput = '\nstyle/rainbows/horses.css' +
  '\nbaz error [baz]' +
  '\n1:99\t' + colorlessWarning + '  bar warning [bar]' +
  '\n3:5\t' + colorlessWarning + '  foo warning [foo]' +
  '\n8:13\t' + colorlessWarning + '  ha warning [foo]' +
  '\n';

var noPositionSortOutput = '\nstyle/rainbows/horses.css' +
  '\nbaz error [baz]' +
  '\n3:5\t' + colorlessWarning + '  foo warning [foo]' +
  '\n1:99\t' + colorlessWarning + '  bar warning [bar]' +
  '\n8:13\t' + colorlessWarning + '  ha warning [foo]' +
  '\n';

var positionlessLastOutput = '\nstyle/rainbows/horses.css' +
  '\n1:99\t' + colorlessWarning + '  bar warning [bar]' +
  '\n3:5\t' + colorlessWarning + '  foo warning [foo]' +
  '\n8:13\t' + colorlessWarning + '  ha warning [foo]' +
  '\nbaz error [baz]' +
  '\n';

var noSortOutput = '\nstyle/rainbows/horses.css' +
  '\n3:5\t' + colorlessWarning + '  foo warning [foo]' +
  '\nbaz error [baz]' +
  '\n1:99\t' + colorlessWarning + '  bar warning [bar]' +
  '\n8:13\t' + colorlessWarning + '  ha warning [foo]' +
  '\n';

test('defaultFormatter with complex mock', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    })),
    complexOutput,
    'complex'
  );

  var noPositionSortFormatter = formatter({ sortByPosition: false });

  t.equal(
    chalk.stripColor(noPositionSortFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    })),
    noPositionSortOutput,
    '`sortByPosition: false` complex'
  );

  var positionlessLastFormatter = formatter({ positionless: 'last' });
  t.equal(
    chalk.stripColor(positionlessLastFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    })),
    positionlessLastOutput,
    '`positionless: last` complex'
  );

  var noSortFormatter = formatter({ sortByPosition: false, positionless: 'any' });
  t.equal(
    chalk.stripColor(noSortFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    })),
    noSortOutput,
    'unsorted complex'
  );

  t.end();
});

var onRootMessages = [
  {
    type: 'warning',
    text: 'blergh',
    node: {
      type: 'root',
      // warnings on root do not have start position
      source: {},
    },
    plugin: 'reject-root',
  },
];

var onRootResult = '\n<input css 1>' +
  '\n' + colorlessWarning + '  blergh [reject-root]\n';

test('defaultFormatter with mocked warning on root', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: onRootMessages,
      source: '<input css 1>',
    })),
    onRootResult
  );
  t.end();
});

var oneMessage = [
  {
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning',
  },
];

var oneMessageResult = '\n' + colorlessWarning + '  foo warning [foo]\n';

test('defaultFormatter with undefined source', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: oneMessage,
      source: undefined,
    })),
    oneMessageResult
  );
  t.end();
});

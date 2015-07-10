var test = require('tape');
var defaultFormatter = require('../lib/defaultFormatter')();
var chalk = require('chalk');
var symbols = require('log-symbols');
var path = require('path');

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
  '\nbaz error [baz]\n';

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

var complexMessages = [
  {
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning',
    node: {
      source: {
        start: {
          line: 3,
          column: 5,
        },
      },
    },
  }, {
    type: 'warning',
    plugin: 'bar',
    text: 'bar warning',
    node: {
      source: {
        start: {
          line: 1,
          column: 99,
        },
      },
    },
  }, {
    type: 'error',
    plugin: 'baz',
    text: 'baz error',
  },
];

var complexOutput = '\nstyle/rainbows/horses.css' +
  '\n3:5\t' + colorlessWarning + '  foo warning [foo]' +
  '\n1:99\t' + colorlessWarning + '  bar warning [bar]' +
  '\nbaz error [baz]\n';

test('defaultFormatter with complex mock', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    })),
    complexOutput,
    'complex'
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

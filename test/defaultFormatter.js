var test = require('tape');
var defaultFormatter = require('../lib/defaultFormatter')();
var chalk = require('chalk');
var path = require('path');

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

var basicOutput = '\n# postcss-reporter\n' +
  '\n<input css 1>' +
  '\n>> foo warning [foo]' +
  '\n>> bar warning [bar]' +
  '\n>> baz warning [baz]' +
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

var complexOutput = '\n# postcss-reporter\n' +
  '\nstyle/rainbows/horses.css' +
  '\n3:5\t>> foo warning [foo]' +
  '\n1:99\t>> bar warning [bar]' +
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

var onRootResult = '\n# postcss-reporter\n' +
  '\n<input css 1>' +
  '\n>> blergh [reject-root]\n';

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

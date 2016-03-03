var test = require('tape');
var formatter = require('../lib/formatter');
var chalk = require('chalk');
var symbols = require('log-symbols');
var path = require('path');
var sourceMap = require('source-map');
var postcss = require('postcss');

var defaultFormatter = formatter();

var colorlessWarning = chalk.stripColor(symbols.warning);
var colorlessError = chalk.stripColor(symbols.error);

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
  '\n      ' + colorlessWarning + '  foo warning  foo' +
  '\n      ' + colorlessWarning + '  bar warning  bar' +
  '\n      ' + colorlessWarning + '  baz warning  baz' +
  '\n      ' + colorlessError +   '  baz error    baz' +
  '\n';

test('defaultFormatter with simple mock messages', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: basicMessages,
      source: '<input css 1>',
    }).output),
    basicOutput,
    'basic'
  );

  t.end();
});

var basicOutputMinimal = '\n<input css 1>' +
  '\n      warning  foo warning' +
  '\n      warning  bar warning' +
  '\n      warning  baz warning' +
  '\n      error    baz error' +
  '\n';

test('defaultFormatter with noIcon and noPlugin and simple mock messages', function(t) {
  var minimalFormatter = formatter({
    noIcon: true,
    noPlugin: true,
  });

  t.equal(
    chalk.stripColor(minimalFormatter({
      messages: basicMessages,
      source: '<input css 1>',
    }).output),
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
  '\n         ' + colorlessError +   '  baz error    baz' +
  '\n  1:99   ' + colorlessWarning + '  bar warning  bar' +
  '\n  3:5    ' + colorlessWarning + '  foo warning  foo' +
  '\n  8:13   ' + colorlessWarning + '  ha warning   foo' +
  '\n';

var noPositionSortOutput = '\nstyle/rainbows/horses.css' +
  '\n         ' + colorlessError +   '  baz error    baz' +
  '\n  3:5    ' + colorlessWarning + '  foo warning  foo' +
  '\n  1:99   ' + colorlessWarning + '  bar warning  bar' +
  '\n  8:13   ' + colorlessWarning + '  ha warning   foo' +
  '\n';

var positionlessLastOutput = '\nstyle/rainbows/horses.css' +
  '\n  1:99   ' + colorlessWarning + '  bar warning  bar' +
  '\n  3:5    ' + colorlessWarning + '  foo warning  foo' +
  '\n  8:13   ' + colorlessWarning + '  ha warning   foo' +
  '\n         ' + colorlessError +   '  baz error    baz' +
  '\n';

var noSortOutput = '\nstyle/rainbows/horses.css' +
  '\n  3:5    ' + colorlessWarning + '  foo warning  foo' +
  '\n         ' + colorlessError +   '  baz error    baz' +
  '\n  1:99   ' + colorlessWarning + '  bar warning  bar' +
  '\n  8:13   ' + colorlessWarning + '  ha warning   foo' +
  '\n';

test('defaultFormatter with complex mock', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    }).output),
    complexOutput,
    'complex'
  );

  var noPositionSortFormatter = formatter({ sortByPosition: false });

  t.equal(
    chalk.stripColor(noPositionSortFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    }).output),
    noPositionSortOutput,
    '`sortByPosition: false` complex'
  );

  var positionlessLastFormatter = formatter({ positionless: 'last' });
  t.equal(
    chalk.stripColor(positionlessLastFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    }).output),
    positionlessLastOutput,
    '`positionless: last` complex'
  );

  var noSortFormatter = formatter({ sortByPosition: false, positionless: 'any' });
  t.equal(
    chalk.stripColor(noSortFormatter({
      messages: complexMessages,
      source: path.resolve(process.cwd(), 'style/rainbows/horses.css'),
    }).output),
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

var onRootResult = '\n<input css 1>\n      ' + colorlessWarning + '  blergh  reject-root\n';

test('defaultFormatter with mocked warning on root', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: onRootMessages,
      source: '<input css 1>',
    }).output),
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

var oneMessageResult = '\n      ' + colorlessWarning + '  foo warning  foo\n';

test('defaultFormatter with undefined source', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({
      messages: oneMessage,
      source: undefined,
    }).output),
    oneMessageResult
  );
  t.end();
});

test('defaultFormatter with no messages', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter({ messages: [] }).output),
    ''
  );
  t.end();
});

test('defaultFormatter with real sourcemaps', function(t) {
  var map = new sourceMap.SourceMapGenerator({ file: 'file.css' });
  map.addMapping({
    generated: { line: 2, column: 7 },
    source: 'file.original.css',
    original: { line: 102, column: 107 },
  });

  var root = postcss.parse('.button { color: red; }', {
    from: 'file.css',
    map: { prev: map },
  });

  var message = { line: 2, column: 7, node: root.nodes[0], text: 'blargh', plugin: 'foo', type: 'error' };

  t.equal(
    chalk.stripColor(defaultFormatter({ messages: [message] }).output),
    '\n  102:107   ' + colorlessError + '  blargh  foo\n'
  );
  t.end();
});

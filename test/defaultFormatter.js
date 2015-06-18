'use strict';

var test = require('tape');
var defaultFormatter = require('../lib/defaultFormatter');
var chalk = require('chalk');
var _ = require('lodash');
var path = require('path');

var mockSimpleResult = {
  messages: [{
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning'
  }, {
    type: 'warning',
    plugin: 'bar',
    text: 'bar warning'
  }, {
    type: 'warning',
    plugin: 'baz',
    text: 'baz warning'
  }, {
    type: 'error',
    plugin: 'baz',
    text: 'baz error'
  }],
  root: {
    source: {
      input: {
        from: '<input css 1>'
      }
    }
  }
};

var simpleOutput = '\n# postcss-reporter\n' +
  '\n<input css 1>' +
  '\n! foo warning [foo]' +
  '\n! bar warning [bar]' +
  '\n! baz warning [baz]' +
  '\nx baz error [baz]\n';

var simpleOutputNoBar = '\n# postcss-reporter\n' +
  '\n<input css 1>' +
  '\n! foo warning [foo]' +
  '\n! baz warning [baz]' +
  '\nx baz error [baz]\n';

test('defaultFormatter with simple mock', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter(_.cloneDeep(mockSimpleResult))),
    simpleOutput,
    'basic'
  );

  t.equal(
    chalk.stripColor(
      defaultFormatter(_.cloneDeep(mockSimpleResult), { plugins: ['foo', 'baz']})
    ),
    simpleOutputNoBar,
    'excluding bar'
  );

  t.end();
});

test('clearing messages from result', function(t) {
  var resultA = _.cloneDeep(mockSimpleResult);
  var resultB = _.cloneDeep(mockSimpleResult);

  t.equal(resultA.messages.length, 4, 'initial length accurate');

  defaultFormatter(resultA, { clearMessages: true });

  t.equal(resultA.messages.length, 0,
    'with `clearMessages` option, messages are cleared');

  defaultFormatter(resultB);

  t.deepEqual(mockSimpleResult.messages, resultB.messages,
    'without `clearMessages` option, messages are preserved exactly');

  t.end();
});

var mockComplexResult = {
  messages: [{
    type: 'warning',
    plugin: 'foo',
    text: 'foo warning',
    node: {
      source: {
        start: {
          line: 3,
          column: 5
        }
      }
    }
  }, {
    type: 'warning',
    plugin: 'bar',
    text: 'bar warning',
    node: {
      source: {
        start: {
          line: 1,
          column: 99
        }
      }
    }
  }, {
    type: 'error',
    plugin: 'baz',
    text: 'baz error'
  }],
  root: {
    source: {
      input: {
        from: path.resolve(process.cwd(), 'style/rainbows/horses.css')
      }
    }
  }
};

var complexOutput = '\n# postcss-reporter\n' +
  '\nstyle/rainbows/horses.css' +
  '\n3:5\t! foo warning [foo]' +
  '\n1:99\t! bar warning [bar]' +
  '\nx baz error [baz]\n';

var complexOutputNoBar = '\n# postcss-reporter\n' +
  '\nstyle/rainbows/horses.css' +
  '\n3:5\t! foo warning\n';


test('defaultFormatter with complex mock', function(t) {
  t.equal(
    chalk.stripColor(defaultFormatter(_.cloneDeep(mockComplexResult))),
    complexOutput,
    'basic'
  );

  t.equal(
    chalk.stripColor(defaultFormatter(_.cloneDeep(mockComplexResult), { plugins: ['foo'] })),
    complexOutputNoBar,
    'excluding bar'
  );

  t.end();
});

var mockMessagesOnRootResult = {
  messages: [{
    type: 'warning',
    text: 'blergh',
    node: {
      type: 'root',
      // warnings on root do not have start position
      source: {}
    },
    plugin: 'reject-root'
  }],
  root: {
    source: {
      input: {
        from: '<input css 1>'
      }
    }
  }
};

var messagesOnRootResultOutput = '\n# postcss-reporter\n' +
  '\n<input css 1>' +
  '\n! blergh [reject-root]\n';

test('defaultFormatter with mocked warning on root', function(t) {
  console.log(chalk.stripColor(defaultFormatter(_.cloneDeep(mockMessagesOnRootResult))));
  t.equal(
    chalk.stripColor(defaultFormatter(_.cloneDeep(mockMessagesOnRootResult))),
    messagesOnRootResultOutput
  );
  t.end();
});

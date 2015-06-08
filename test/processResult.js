'use strict';

var test = require('tape');
var processResult = require('../lib/processResult');
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

mockSimpleResult.warnings = function() {
  return this.messages.filter(function(m) {
    return m.type === 'warning';
  });
};

var simpleOutput = '\n# postcss-log-warnings\n' +
  '\n<input css 1>' +
  '\nfoo warning [foo]' +
  '\nbar warning [bar]' +
  '\nbaz warning [baz]\n';

var simpleOutputNoBar = '\n# postcss-log-warnings\n' +
  '\n<input css 1>' +
  '\nfoo warning [foo]' +
  '\nbaz warning [baz]\n';

test('processResult with simple mock', function(t) {
  t.equal(
    chalk.stripColor(processResult(_.cloneDeep(mockSimpleResult))),
    simpleOutput,
    'basic'
  );

  t.equal(
    chalk.stripColor(
      processResult(_.cloneDeep(mockSimpleResult), { plugins: ['foo', 'baz']})
    ),
    simpleOutputNoBar,
    'excluding bar'
  );

  t.end();
});

test('clearing warnings from result.messages', function(t) {
  var resultA = _.cloneDeep(mockSimpleResult);
  var resultB = _.cloneDeep(mockSimpleResult);

  t.equal(resultA.warnings().length, 3, 'initial length accurate');

  processResult(resultA);

  t.equal(resultA.warnings().length, 0, 'warnings are cleared');

  processResult(resultB, { keepWarnings: true });

  t.deepEqual(mockSimpleResult.messages, resultB.messages,
      'keepWarnings option preserves messages exactly');

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

mockComplexResult.warnings = function() {
  return this.messages.filter(function(m) {
    return m.type === 'warning';
  });
};

var complexOutput = '\n# postcss-log-warnings\n' +
  '\nstyle/rainbows/horses.css' +
  '\n3:5\tfoo warning [foo]' +
  '\n1:99\tbar warning [bar]\n';

var complexOutputNoBar = '\n# postcss-log-warnings\n' +
  '\nstyle/rainbows/horses.css' +
  '\n3:5\tfoo warning\n';


test('processResult with complex mock', function(t) {
  t.equal(
    chalk.stripColor(processResult(_.cloneDeep(mockComplexResult))),
    complexOutput,
    'basic'
  );

  t.equal(
    chalk.stripColor(processResult(_.cloneDeep(mockComplexResult), { plugins: ['foo'] })),
    complexOutputNoBar,
    'excluding bar'
  );

  t.end();
});

var mockWarningOnRootResult = {
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

mockWarningOnRootResult.warnings = function() {
  return this.messages.filter(function(m) {
    return m.type === 'warning';
  });
};

var warningOnRootResultOutput = '\n# postcss-log-warnings\n' +
  '\n<input css 1>' +
  '\nblergh [reject-root]\n';

test('processResult with mocked warning on root', function(t) {
  console.log(chalk.stripColor(processResult(_.cloneDeep(mockWarningOnRootResult))));
  t.equal(
    chalk.stripColor(processResult(_.cloneDeep(mockWarningOnRootResult))),
    warningOnRootResultOutput
  );
  t.end();
});

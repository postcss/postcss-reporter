var test = require('tape');
var reporter = require('../lib/reporter');

var mockSimpleResult = {
  messages: [
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
      type: 'warning',
      plugin: 'baz',
      text: 'baz error',
    },
  ],
  root: {
    source: {
      input: {
        id: '<input css 1>',
      },
    },
  },
};

function clone(toClone) {
  return JSON.parse(JSON.stringify(toClone));
}

test('reporter with simple mock result', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  t.doesNotThrow(function() {
    testReporter.OnceExit(null, { result: mockSimpleResult });
  });
  t.deepEqual(tracker.messages, mockSimpleResult.messages);
  t.equal(tracker.source, '<input css 1>');
  t.end();
});

var mockResultContainingNonWarningMessage = {
  messages: [
    {
      type: 'dependency',
      plugin: 'foo',
    },
    {
      type: 'warning',
      plugin: 'foo',
      text: 'foo warning',
    },
    {
      type: 'error',
      plugin: 'foo',
      text: 'foo error',
    },
  ],
  root: {
    source: {
      input: {
        id: '<input css 1>',
      },
    },
  },
};

test('reporter with simple mock result containing non warning typed message', function(t) {
  var tracker = {};
  var expectedMessages = [
    {
      type: 'warning',
      plugin: 'foo',
      text: 'foo warning',
    },
  ];
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  t.doesNotThrow(function() {
    testReporter.OnceExit(null, {
      result: mockResultContainingNonWarningMessage,
    });
  });
  t.deepEqual(tracker.messages, expectedMessages);
  t.equal(tracker.source, '<input css 1>');
  t.end();
});

test('reporter with simple mock result and whitelisted plugins', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['foo', 'bar'],
  });
  testReporter.OnceExit(null, { result: mockSimpleResult });
  t.deepEqual(
    tracker.messages,
    [
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
    ]
  );
  t.equal(tracker.source, '<input css 1>');
  t.end();
});

test('reporter with simple mock result and blacklisted plugins', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['!foo', '!baz'],
  });
  testReporter.OnceExit(null, { result: mockSimpleResult });
  t.deepEqual(
    tracker.messages,
    [
      {
        type: 'warning',
        plugin: 'bar',
        text: 'bar warning',
      },
    ]
  );
  t.end();
});

test('reporter with simple mock result and function-filtered plugins', function(t) {
  var cloneResult = clone(mockSimpleResult);
  cloneResult.messages.push(
    {
      type: 'error',
      plugin: 'baz',
      text: 'baz error',
    }
  );
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    filter: function(message) { return message.type === 'error'; },
  });
  testReporter.OnceExit(null, { result: cloneResult });
  t.deepEqual(
    tracker.messages,
    [
      {
        type: 'error',
        plugin: 'baz',
        text: 'baz error',
      },
    ]
  );
  t.end();
});

test('reporter with simple mock result and empty plugins', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: [],
  });
  testReporter.OnceExit(null, { result: mockSimpleResult });
  t.deepEqual(
    tracker.messages,
    mockSimpleResult.messages
  );
  t.end();
});

test('reporter with simple mock result and clearReportedMessages', function(t) {
  var cloneResult = clone(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    clearReportedMessages: true,
  });
  testReporter.OnceExit(null, { result: cloneResult });
  t.deepEqual(cloneResult.messages, []);
  t.end();
});

test('reporter with simple mock result, whitelisted plugins and clearReportedMessages', function(t) {
  var cloneResult = clone(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['baz', 'foo'],
    clearReportedMessages: true,
  });
  testReporter.OnceExit(null, { result: cloneResult });
  t.deepEqual(
    cloneResult.messages,
    [
      {
        type: 'warning',
        plugin: 'bar',
        text: 'bar warning',
      },
    ]
  );
  t.end();
});

test('reporter with simple mock result and clearAllMessages', function(t) {
  var cloneResult = clone(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    clearAllMessages: true,
  });
  testReporter.OnceExit(null, { result: cloneResult });
  t.deepEqual(cloneResult.messages, []);
  t.end();
});

test('reporter with simple mock result, clearAllMessages and whitelisted plugins', function(t) {
  var cloneResult = clone(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['foo'],
    clearAllMessages: true,
  });
  testReporter.OnceExit(null, { result: cloneResult });
  t.deepEqual(
    cloneResult.messages,
    [
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
        type: 'warning',
        plugin: 'baz',
        text: 'baz error',
      },
    ]
  );
  t.end();
});

test('reporter with simple mock result and throwError', function(t) {
  var cloneResult = clone(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    throwError: true,
  });
  t.throws(function() {
    testReporter.OnceExit(null, { result: cloneResult });
  });
  t.end();
});

function mockFormatter(tracker) {
  return function(obj) {
    tracker.messages = obj.messages;
    tracker.source = obj.source;
    return 'bogus report';
  };
}

var mockResultFromFile = {
  messages: [
    {
      type: 'warning',
      plugin: 'baz',
      text: 'baz warning',
    },
  ],
  root: {
    source: {
      input: {
        file: '/path/to/file.css',
      },
    },
  },
};

test('reporter with mock containing file source', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  testReporter.OnceExit(null, { result: mockResultFromFile });
  t.equal(tracker.source, '/path/to/file.css');
  t.end();
})

var mockResultNoSource = {
  messages: [
    {
      type: 'warning',
      plugin: 'baz',
      text: 'baz warning',
    },
  ],
  root: {},
};

test('reporter with mock containing no source', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  testReporter.OnceExit(null, { result: mockResultNoSource });
  t.equal(tracker.source, '');
  t.end();
})

var mockWarningNodeResult = {
  messages: [
    {
      type: 'warning',
      plugin: 'foo',
      text: 'foo warning',
      node: {
        source: {
          input: {
            file: 'foo.css',
          },
        },
      },
    },
    {
      type: 'warning',
      plugin: 'baz',
      text: 'baz warning',
      node: {
        source: {
          input: {
            file: 'bar.css',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'pat',
      text: 'pat error',
      node: {
        source: {
          input: {
            id: '<input css 2>',
          },
        },
      },
    },
    {
      type: 'warning',
      plugin: 'bar',
      text: 'bar warning',
      node: {
        source: {
          input: {
            file: 'foo.css',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'hoo',
      text: 'hoo error',
      node: {
        source: {
          input: {
            id: '<input css 2>',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'hah',
      text: 'hah error',
    },
  ],
  root: {
    source: {
      input: {
        id: '<input css 1>',
      },
    },
  },
};

function mockMultiSourceFormatter(tracker) {
  return function(obj) {
    tracker.push(obj);
    return 'bogus report';
  };
}

test('reporter with warnings that messages that each have nodes', function(t) {
  var tracker = [];
  var testReporter = reporter({
    formatter: mockMultiSourceFormatter(tracker),
  });
  testReporter.OnceExit(null, { result: mockWarningNodeResult });
  t.deepEqual(tracker, [
    {
      source: 'foo.css',
      messages: [
        {
          type: 'warning',
          plugin: 'foo',
          text: 'foo warning',
          node: {
            source: {
              input: {
                file: 'foo.css',
              },
            },
          },
        },
        {
          type: 'warning',
          plugin: 'bar',
          text: 'bar warning',
          node: {
            source: {
              input: {
                file: 'foo.css',
              },
            },
          },
        },
      ],
    },
    {
      source: 'bar.css',
      messages: [
        {
          type: 'warning',
          plugin: 'baz',
          text: 'baz warning',
          node: {
            source: {
              input: {
                file: 'bar.css',
              },
            },
          },
        },
      ],
    },
  ]);
  t.end();
});

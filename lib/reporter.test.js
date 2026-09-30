"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const reporter = require("./reporter");

const simpleResult = {
  messages: [
    { type: "warning", plugin: "foo", text: "foo warning" },
    { type: "warning", plugin: "bar", text: "bar warning" },
    { type: "warning", plugin: "baz", text: "baz warning" },
    { type: "warning", plugin: "baz", text: "baz error" },
  ],
  root: { source: { input: { id: "<input css 1>" } } },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Runs the reporter on a mock result, keeping its console output away from the
// test output. Returns everything the formatter has been called with, plus the
// error the reporter threw, if any: several assertions need both at once.
function run(options, result) {
  const calls = [];
  const log = console.log;
  let error;
  console.log = () => {};
  try {
    reporter({
      ...options,
      formatter: (input) => {
        calls.push(input);
        return "bogus report";
      },
    }).OnceExit(null, { result });
  } catch (thrown) {
    error = thrown;
  } finally {
    console.log = log;
  }
  return { calls, error };
}

test("reporter with a simple mock result", () => {
  const { calls, error } = run({}, simpleResult);
  assert.equal(error, undefined);
  assert.deepEqual(calls, [{ messages: simpleResult.messages, source: "<input css 1>" }]);
});

test("reporter with a non warning typed message", () => {
  const result = {
    messages: [
      { type: "dependency", plugin: "foo" },
      { type: "warning", plugin: "foo", text: "foo warning" },
      { type: "error", plugin: "foo", text: "foo error" },
    ],
    root: { source: { input: { id: "<input css 1>" } } },
  };

  const { calls, error } = run({}, result);
  assert.ok(error instanceof Error);
  assert.deepEqual(calls, [
    {
      messages: [
        { type: "warning", plugin: "foo", text: "foo warning" },
        { type: "error", plugin: "foo", text: "foo error" },
      ],
      source: "<input css 1>",
    },
  ]);
});

test("reporter with an allow list of plugins", () => {
  const { calls } = run({ plugins: ["foo", "bar"] }, simpleResult);
  assert.deepEqual(calls[0].messages, [
    { type: "warning", plugin: "foo", text: "foo warning" },
    { type: "warning", plugin: "bar", text: "bar warning" },
  ]);
  assert.equal(calls[0].source, "<input css 1>");
});

test("reporter with a deny list of plugins", () => {
  const { calls } = run({ plugins: ["!foo", "!baz"] }, simpleResult);
  assert.deepEqual(calls[0].messages, [{ type: "warning", plugin: "bar", text: "bar warning" }]);
});

test("reporter with a filter function", () => {
  const result = clone(simpleResult);
  result.messages.push({ type: "error", plugin: "baz", text: "baz error" });

  const { calls, error } = run({ filter: (message) => message.type === "error" }, result);
  assert.ok(error instanceof Error);
  assert.deepEqual(calls[0].messages, [{ type: "error", plugin: "baz", text: "baz error" }]);
});

test("reporter with an empty list of plugins", () => {
  const { calls } = run({ plugins: [] }, simpleResult);
  assert.deepEqual(calls[0].messages, simpleResult.messages);
});

test("reporter with clearReportedMessages", () => {
  const result = clone(simpleResult);
  run({ clearReportedMessages: true }, result);
  assert.deepEqual(result.messages, []);
});

test("reporter with an allow list of plugins and clearReportedMessages", () => {
  const result = clone(simpleResult);
  run({ plugins: ["baz", "foo"], clearReportedMessages: true }, result);
  assert.deepEqual(result.messages, [{ type: "warning", plugin: "bar", text: "bar warning" }]);
});

test("reporter with clearAllMessages", () => {
  const result = clone(simpleResult);
  run({ clearAllMessages: true }, result);
  assert.deepEqual(result.messages, []);
});

test("reporter with clearAllMessages and an allow list of plugins", () => {
  const result = clone(simpleResult);
  run({ plugins: ["foo"], clearAllMessages: true }, result);
  assert.deepEqual(result.messages, [
    { type: "warning", plugin: "bar", text: "bar warning" },
    { type: "warning", plugin: "baz", text: "baz warning" },
    { type: "warning", plugin: "baz", text: "baz error" },
  ]);
});

test("reporter with throwError", () => {
  const { error } = run({ throwError: true }, clone(simpleResult));
  assert.ok(error instanceof Error);
});

test("reporter with a file as source", () => {
  const { calls } = run(
    {},
    {
      messages: [{ type: "warning", plugin: "baz", text: "baz warning" }],
      root: { source: { input: { file: "/path/to/file.css" } } },
    },
  );
  assert.equal(calls[0].source, "/path/to/file.css");
});

test("reporter without any source", () => {
  const { calls } = run(
    {},
    {
      messages: [{ type: "warning", plugin: "baz", text: "baz warning" }],
      root: {},
    },
  );
  assert.equal(calls[0].source, "");
});

test("reporter groups messages by the source of their node", () => {
  const fooNode = { source: { input: { file: "foo.css" } } };
  const barNode = { source: { input: { file: "bar.css" } } };
  const inputNode = { source: { input: { id: "<input css 2>" } } };

  const messages = [
    { type: "warning", plugin: "foo", text: "foo warning", node: fooNode },
    { type: "warning", plugin: "baz", text: "baz warning", node: barNode },
    { type: "error", plugin: "pat", text: "pat error", node: inputNode },
    { type: "warning", plugin: "bar", text: "bar warning", node: fooNode },
    { type: "error", plugin: "hoo", text: "hoo error", node: inputNode },
    { type: "error", plugin: "hah", text: "hah error" },
  ];

  const { calls, error } = run(
    {},
    { messages, root: { source: { input: { id: "<input css 1>" } } } },
  );

  assert.ok(error instanceof Error);
  assert.deepEqual(calls, [
    { source: "foo.css", messages: [messages[0], messages[3]] },
    { source: "bar.css", messages: [messages[1]] },
    { source: "<input css 2>", messages: [messages[2], messages[4]] },
    { source: "<input css 1>", messages: [messages[5]] },
  ]);
});

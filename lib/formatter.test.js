"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { stripVTControlCharacters: stripColor } = require("node:util");
const sourceMap = require("source-map");
const postcss = require("postcss");
const formatter = require("./formatter");

const defaultFormatter = formatter();

const warningIcon = "⚠";
const errorIcon = "✖";

const basicMessages = [
  { type: "warning", plugin: "foo", text: "foo warning" },
  { type: "warning", plugin: "bar", text: "bar warning" },
  { type: "warning", plugin: "baz", text: "baz warning" },
  { type: "error", plugin: "baz", text: "baz error" },
];

const complexMessages = [
  { type: "warning", plugin: "foo", text: "foo warning", line: 3, column: 5 },
  { type: "error", plugin: "baz", text: "baz error" },
  { type: "warning", plugin: "bar", text: "bar warning", line: 1, column: 99 },
  { type: "warning", plugin: "foo", text: "ha warning", line: 8, column: 13 },
];

const complexSource = path.resolve(process.cwd(), "style/rainbows/horses.css");

test("default formatter with simple mock messages", () => {
  const output = defaultFormatter({
    messages: basicMessages,
    source: "<input css 1>",
  });

  assert.equal(
    stripColor(output),
    [
      "",
      "<input css 1>",
      `${warningIcon}  foo warning [foo]`,
      `${warningIcon}  bar warning [bar]`,
      `${warningIcon}  baz warning [baz]`,
      `${errorIcon}  baz error [baz]`,
      "",
    ].join("\n"),
  );
});

test("formatter with noIcon and noPlugin", () => {
  const minimalFormatter = formatter({ noIcon: true, noPlugin: true });
  const output = minimalFormatter({
    messages: basicMessages,
    source: "<input css 1>",
  });

  assert.equal(
    stripColor(output),
    ["", "<input css 1>", "foo warning", "bar warning", "baz warning", "baz error", ""].join("\n"),
  );
});

test("default formatter sorts by position, positionless first", () => {
  const output = defaultFormatter({
    messages: complexMessages,
    source: complexSource,
  });

  assert.equal(
    stripColor(output),
    [
      "",
      "style/rainbows/horses.css",
      `${errorIcon}  baz error [baz]`,
      `1:99\t${warningIcon}  bar warning [bar]`,
      `3:5\t${warningIcon}  foo warning [foo]`,
      `8:13\t${warningIcon}  ha warning [foo]`,
      "",
    ].join("\n"),
  );
});

test("formatter with sortByPosition: false", () => {
  const output = formatter({ sortByPosition: false })({
    messages: complexMessages,
    source: complexSource,
  });

  assert.equal(
    stripColor(output),
    [
      "",
      "style/rainbows/horses.css",
      `${errorIcon}  baz error [baz]`,
      `3:5\t${warningIcon}  foo warning [foo]`,
      `1:99\t${warningIcon}  bar warning [bar]`,
      `8:13\t${warningIcon}  ha warning [foo]`,
      "",
    ].join("\n"),
  );
});

test("formatter with positionless: last", () => {
  const output = formatter({ positionless: "last" })({
    messages: complexMessages,
    source: complexSource,
  });

  assert.equal(
    stripColor(output),
    [
      "",
      "style/rainbows/horses.css",
      `1:99\t${warningIcon}  bar warning [bar]`,
      `3:5\t${warningIcon}  foo warning [foo]`,
      `8:13\t${warningIcon}  ha warning [foo]`,
      `${errorIcon}  baz error [baz]`,
      "",
    ].join("\n"),
  );
});

test("formatter without any sorting", () => {
  const output = formatter({ sortByPosition: false, positionless: "any" })({
    messages: complexMessages,
    source: complexSource,
  });

  assert.equal(
    stripColor(output),
    [
      "",
      "style/rainbows/horses.css",
      `3:5\t${warningIcon}  foo warning [foo]`,
      `${errorIcon}  baz error [baz]`,
      `1:99\t${warningIcon}  bar warning [bar]`,
      `8:13\t${warningIcon}  ha warning [foo]`,
      "",
    ].join("\n"),
  );
});

test("default formatter with a warning on root", () => {
  const output = defaultFormatter({
    messages: [
      {
        type: "warning",
        text: "blergh",
        plugin: "reject-root",
        // warnings on root do not have a start position
        node: { type: "root", source: {} },
      },
    ],
    source: "<input css 1>",
  });

  assert.equal(
    stripColor(output),
    ["", "<input css 1>", `${warningIcon}  blergh [reject-root]`, ""].join("\n"),
  );
});

test("default formatter with undefined source", () => {
  const output = defaultFormatter({
    messages: [{ type: "warning", plugin: "foo", text: "foo warning" }],
    source: undefined,
  });

  assert.equal(stripColor(output), ["", `${warningIcon}  foo warning [foo]`, ""].join("\n"));
});

test("default formatter with no message", () => {
  assert.equal(stripColor(defaultFormatter({ messages: [] })), "");
});

test("default formatter with real source maps", () => {
  // Source map columns are 0 based, message columns are 1 based: this maps the
  // message below (line 2, column 7) to line 102, column 107.
  const map = new sourceMap.SourceMapGenerator({ file: "file.css" });
  map.addMapping({
    generated: { line: 2, column: 6 },
    source: "file.original.css",
    original: { line: 102, column: 106 },
  });

  const root = postcss.parse(".button { color: red; }", {
    from: "file.css",
    map: { prev: map.toString() },
  });

  const message = {
    line: 2,
    column: 7,
    node: root.nodes[0],
    text: "blargh",
    plugin: "foo",
  };

  assert.equal(stripColor(defaultFormatter({ messages: [message] })), "\n102:107\tblargh [foo]\n");
});

test("default formatter skips messages without a text property", () => {
  const output = defaultFormatter({
    messages: [
      { type: "warning", plugin: "foo" },
      { type: "dependency", plugin: "bar", file: "bar file" },
    ],
    source: "<input css 1>",
  });

  assert.equal(stripColor(output), "");
});

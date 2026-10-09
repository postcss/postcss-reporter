"use strict";

// Not a test: run `npm run visual` and look at the output to check how the
// default formatter renders in a real terminal.

const postcss = require("postcss");
const sourceMap = require("source-map");
const reporter = require("..");

const css = [
  ".baz {",
  "  top:0px;",
  "}",
  ".foo {",
  "  background: orange;",
  "}",
  ".bar {",
  "  color:pink;",
  "}",
].join("\n");

// A fake linter, only here to produce a few messages to look at.
const fakeLinter = () => ({
  postcssPlugin: "fake-linter",
  Once(css, { result }) {
    result.warn("This message has no position");

    css.walkDecls((decl) => {
      if (decl.raws.between !== ": ") {
        result.warn("Expected a single space after the colon", { node: decl });
      }
      if (/^0\D/.test(decl.value)) {
        result.warn("Unexpected unit on a zero length", { node: decl });
      }
    });
  },
});
fakeLinter.postcss = true;

// Maps the `top` declaration back to another file, to exercise the position
// remapping done by the formatter.
function createSourceMap() {
  const map = new sourceMap.SourceMapGenerator({ file: "visual.css" });
  map.addMapping({
    generated: { line: 2, column: 2 },
    source: "visual.original.css",
    original: { line: 102, column: 106 },
  });
  return map.toString();
}

postcss([fakeLinter(), reporter()])
  .process(css, {
    from: "scripts/visual.css",
    map: { prev: createSourceMap() },
  })
  .then(() => {
    console.log("There's your visual confirmation that it works.");
  })
  .catch((error) => {
    console.log(error.stack);
  });

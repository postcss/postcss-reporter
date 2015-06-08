# postcss-console-log-messages [![Build Status](https://travis-ci.org/postcss/postcss-console-log-messages.svg?branch=master)](https://travis-ci.org/postcss/postcss-console-log-messages)

Log PostCSS messages in the console.

Currently, only warnings are logged.

## Purpose

As of PostCSS 4.1, a single PostCSS process can accumulate warnings from all of the plugins it uses.
Presumably, plugin authors want you to see those warnings.
So this plugin exists to read the accumulated warnings (or warnings from only the plugins you've specified), format them for human legibility, and print them to the console.

In the future, this plugin may log messages of other varieties, not just warnings.
Currently, it's just warnings.

## Example Output

![Example](example.png?raw=true)

## Installation

```
npm install postcss-console-log-messages
```

## Usage

Add it to your plugin list *after any plugins whose warnings you want to log*, and pass it an object of options.

For example, using [gulp-postcss](https://github.com/w0rm/gulp-postcss):

```js
gulp.task('css', function() {
  return gulp.src('./src/*.css')
    .pipe(postcss([
      bemLinter(),
      customProperties(),
      calc(),
      rejectAllColors(),
      consoleLogMessages(myOptions) // <------ ding
    ]))
    .pipe(gulp.dest('./dist'));
});
```

You can also use this module as a library:

```js
var processResult = require('postcss-console-log-messages/lib/processResult');
var warningLog = processResult(postcssResult, options);
```

### Options

- **clearWarnings** (boolean, default = `false`)

  If true, the plugin will clear the result's warnings after it logs them. This prevents other plugins, or the whatever runner you use, from logging the same information again and causing confusion.

- **plugins** (array of strings, default = `[]`)

  If empty, the plugin will log every warning, regardless of which plugin registered it.
  To limit output, name the plugins whose warnings you would like to see.
  For example, `{ plugins: ['postcss-bem-linter'] }` will only log warnings from the `postcss-bem-linter` plugin.

- **throwError** (boolean, default = `false`)

  If `true`, after the plugin logs your warnings it will throw an error if it found any warnings.
  (Not part of the library options.)

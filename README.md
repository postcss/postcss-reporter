# postcss-reporter [![Build Status](https://travis-ci.org/postcss/postcss-reporter.svg?branch=master)](https://travis-ci.org/postcss/postcss-reporter)

A PostCSS plugin to `console.log()` the messages (warnings, errors, etc.) registered by other PostCSS plugins.

## Purpose

As of PostCSS 4.1, a single PostCSS process can accumulate messages from all of the plugins it uses.
Presumably, plugin authors want you to see those messages.
So this plugin exists to read the accumulated messages (or messages from only the plugins you've specified), format them, and print them to the console.

By default, the messages are formatted for human legibility. Another formatting function could be passed in as an option.

## Example Output

![Example](example.png?raw=true)

## Installation

```
npm install postcss-reporter
```

## Usage

Add it to your plugin list *after any plugins whose messages you want to log*, and pass it an object of options.

For example, using [gulp-postcss](https://github.com/w0rm/gulp-postcss):

```js
gulp.task('css', function() {
  return gulp.src('./src/*.css')
    .pipe(postcss([
      bemLinter(),
      customProperties(),
      calc(),
      rejectAllColors(),
      reporter(myOptions) // <------ ding
    ]))
    .pipe(gulp.dest('./dist'));
});
```

You can also use this module's default formatter as a library:

```js
var defaultFormatter = require('postcss-reporter/lib/defaultFormatter');
var warningLog = defaultFormatter(postcssResult, options);
```

### Options

- **clearMessages** (boolean, default = `false`)

  If true, the plugin will clear the result's messages after it logs them. This prevents other plugins, or the whatever runner you use, from logging the same information again and causing confusion.

- **plugins** (array of strings, default = `[]`)

  If empty, the plugin will log every message, regardless of which plugin registered it.
  To limit output, name the plugins whose messages you would like to see.
  For example, `{ plugins: ['postcss-bem-linter'] }` will only log messages from the `postcss-bem-linter` plugin.

- **throwError** (boolean, default = `false`)

  If `true`, after the plugin logs your messages it will throw an error if it found any messages.
  (Not part of the library options.)

# postcss-reporter [![Build Status](https://travis-ci.org/postcss/postcss-reporter.svg?branch=master)](https://travis-ci.org/postcss/postcss-reporter)

A PostCSS plugin to `console.log()` the messages (warnings, etc.) registered by other PostCSS plugins.

## Purpose

As of PostCSS 4.1, a single PostCSS process can accumulate messages from all of the plugins it uses.
Most of these messages are [warnings](https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md#32-use-resultwarn-for-warnings).
Presumably, plugin authors want you to see those messages.
So this plugin exists to read the accumulated messages (or messages from only the plugins you've specified), format them, and print them to the console.

By default, the messages are formatted for human legibility. But another formatting function could be passed in as an option.

## Example Output

![Example](example.png?raw=true)

## Installation

```
npm install postcss-reporter
```

## Usage

Add it to your plugin list *after any plugins whose messages you want to log*, and optionally pass it an object of options.

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

You can also use this module's default formatter as a library, with following API.

```js
var defaultFormatter = require('postcss-reporter/lib/defaultFormatter')();
var warningLog = defaultFormatter({
  messages: someMessages,
  source: someSource
});
console.log(warningLog);
```

### Options

- **clearMessages** (boolean, default = `false`)

  If true, the plugin will clear the result's messages after it logs them. This prevents other plugins, or the whatever runner you use, from logging the same information again and causing confusion.

- **formatter** (function, default = the default formatter)

  By default, this reporter will format the messages for human legibility in the console.
  To use another formatter, pass a function that

    - accepts an object containing a `messages` array and a `source` string
    - returns a the string to report

  For example, you could write a formatter like this:

  ```js
  reporter({
    formatter: function(input) {
      return input.source + ' produced ' + input.messages.length + ' messages';
    }
  })
  ```

- **plugins** (array of strings, default = `[]`)

  If empty, the plugin will log every message, regardless of which plugin registered it.
  To limit output, name the plugins whose messages you would like to see.
  For example, `{ plugins: ['postcss-bem-linter'] }` will only log messages from the `postcss-bem-linter` plugin.

- **throwError** (boolean, default = `false`)

  If `true`, after the plugin logs your messages it will throw an error if it found any warnings.

If you would like no colors in the console output, simply pass `--no-colors` when you invoke whatever command runs this plugin. (This works because of [chalk](https://github.com/sindresorhus/chalk).)

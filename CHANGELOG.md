# Changelog

## v0.3.1
- Fix bug causing error if warning is on root node.

## v0.3.0
- Throw error instead of exiting process when `throwError: true`.

## v0.2.3
- Remove async.

## v0.2.0
- Change the print format slightly.
- Clear warnings from postcssResult.messages after logging them (configurable with option `keepWarnings`).

## v0.1.3
- Add message when exiting process with code 1 to clarify reason.

## v0.1.2
- Only log if there is something to log (don't log undefined).

## v0.1.1
- Only exit process if code is non-zero.

## v0.1.0
- First release.

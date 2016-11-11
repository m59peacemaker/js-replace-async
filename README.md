# replace-async

Like `string.replace`, but with asynchronous, concurrent replacement.

## install

```sh
npm install replace-async
```

## example

```js
const replace = require('replace-async')

replace('{{foo}} {{bar}}', regex, (done, match, ...etc) {
  somethingAsync(match, (err, newValue) => {
    done(err, newValue)
  })
}, (errors, result) => {

})
```

## API

### `replace(string, pattern, replacement, [options], cb`

- `string`
- `pattern: string or RegExp`
- `replacement: string or function`
- `options: object`
  - `ignoreErrors: boolean, false` By default, if any replacement functions fail, no result will be produced and replacement cleanup functions will be called. When true, produces a result even if there are errors and does not call cleanup functions.
- `cb: (errors, result) => {}`
  - errors: `undefined or []` errors are placed at the index of their matching replacement (an error on the first replacement will be `errors[0]`)
  - result: `string or undefined` result of replacement or `undefined` if there were any errors

#### replacement function

The arguments are just like string.replace, but begins with a node-style callback. If the asynchronous operation fails, pass `done(err)`, otherwise pass the replacement value `done(undefined, newValue)`.

You can return a function from the replacement function and it will be called for each replacement that has not called its callback yet if any replacements fail. This gives you opportunity to cancel/cleanup unfinished operations.

```js
(done, match) => {
  const op = asyncOperation((err, result) => {
    done(err, result)
  })
  return () => op.cancel(done)
}
```

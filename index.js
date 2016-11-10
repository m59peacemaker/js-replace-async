var concurrent = require('../concurrent-clean')
var isNil = require('is-nil')

function collect (fn) {
  var args = []
  fn(args.push.bind(args))
  return args
}

function stringReplacement (string, pattern, replacement, cb) {
  // pass through `concurrent` so that the cb is async
  concurrent([function (_cb) {
    var result = string.replace(pattern, replacement)
    cb(undefined, result)
  }], function (errors, results) {
    cb(errors, results[0])
  })
}

function functionReplacement (string, pattern, replacer, cb) {
  var setsOfArgs = collect(function (push) {
    string.replace(pattern, function (match, string) {
      push([].slice.call(arguments))
    })
  })
  concurrent(setsOfArgs.map(function (args) {
    return function (_cb) {
      return replacer.apply(undefined, [_cb].concat(args))
    }
  }), function (errors, results) {
    if (!isNil(errors)) {
      return cb(errors)
    }
    var result = string.replace(pattern, function () {
      return results.shift()
    })
    cb(undefined, result)
  })
}

var replace = function (string, pattern, replacement, cb) {
  var fn = typeof replacement === 'function' ? functionReplacement : stringReplacement
  fn(string, pattern, replacement, cb)
}

module.exports = replace

var concurrent = require('../concurrent-clean')
var isNil = require('is-nil')

function stringReplacement (string, pattern, replacement, cb) {
  var result = string.replace(pattern, replacement)
  cb(undefined, result)
}

var replace = function (string, pattern, replacement, cb) {
  var functions = []
  if (typeof replacement === 'function') {
    var replacer = replacement
    var setsOfArgs = []
    string.replace(pattern, function (match, string) {
      setsOfArgs.push([].slice.call(arguments))
    })
    concurrent(setsOfArgs.map(function (args, idx) {
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
  } else {
    concurrent([function (_cb) {
      stringReplacement(string, pattern, replacement, _cb)
    }], function (errors, results) {
      cb(errors, results[0])
    })
  }
}

module.exports = replace

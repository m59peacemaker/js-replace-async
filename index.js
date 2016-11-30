var isNil = require('is-nil')
var optionalArgs = require('optional-args')
var concurrent = require('concurrent-clean')

var collect = function (fn) {
  var args = []
  fn(args.push.bind(args))
  return args
}

var iterate = function (array, fn) {
  var idx = 0
  return fn(function shift () {
    var value = array[idx]
    ++idx
    return value
  })
}

function stringReplacement (string, pattern, replacement, run) {
  run([function (cb) {
    var result = string.replace(pattern, replacement)
    cb(undefined, result)
  }], function (errors, results, cb) {
    cb(errors, results[0])
  })
}

function functionReplacement (string, pattern, replacer, run, options) {
  // collect args from string.replace replacer calls
  var setsOfArgs = collect(function (push) {
    string.replace(pattern, function () {
      push(arguments)
    })
  })
  run(setsOfArgs.map(function (args) {
    return function (cb) {
      // pass callback followed by the exact args from string.replace
      return replacer.apply(undefined, [].concat.apply([cb], args))
    }
  }), function (errors, results, cb) {
    if (!isNil(errors) && !options.ignoreErrors) {
      return cb(errors, undefined)
    }
    var result = iterate(results, function (shift) {
      return string.replace(pattern, function () {
        var value = shift()
        return isNil(value) ? '' : value
      })
    })
    cb(errors, result)
  })
}

var replace = function (string, pattern, replacement, options, cb) {
  if (typeof cb !== 'function') {
    throw new Error('callback function is required')
  }
  options = options || {}
  var fn = typeof replacement === 'function' ? functionReplacement : stringReplacement
  fn(string, pattern, replacement, function (functions, processResults) {
    if (functions.length === 0) {
      cb(undefined, string)
    } else {
      concurrent(functions, {ignoreErrors: options.ignoreErrors}, function (errors, results) {
        processResults(errors, results, cb)
      })
    }
  }, options)
}

module.exports = optionalArgs(1, 5, replace)

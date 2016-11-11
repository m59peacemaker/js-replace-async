const test = require('tape')
const replace = require('../')
const Regex = require('interpolate-regex')

test('pattern string', t => {
  t.plan(1)
  replace('afooc', 'foo', 'b', (err, result) => {
    t.equal(result, 'abc')
  })
})

test('pattern regex', t => {
  t.plan(1)
  replace('afooc', /foo/g, 'b', (err, result) => {
    t.equal(result, 'abc')
  })
})

test('replacement string', t => {
  t.plan(1)
  replace('afooc', 'foo', 'b', (err, result) => {
    t.equal(result, 'abc')
  })
})

test('replacement function, one simple string/pattern', t => {
  t.plan(1)
  replace(
    'afooc',
    'foo',
    (done) => {
      done(undefined, 'b')
    },
    (err, result) => {
      t.equal(result, 'abc')
    }
  )
})

test('arguments passed to replacer function are same as string.replace', t => {
  t.plan(2)
  const expected = []
  const string = `
    {{foo}}
    {{bar}}
  `
  const pattern = Regex('{{', '}}')
  string.replace(pattern, (...args) => expected.push(args))
  replace(string, pattern, (done, ...args) => {
    t.deepEqual(args, expected[t.assertCount])
    done()
  }, () => {})
})

test('replacement function, complex', t => {
  t.plan(2)
  const template = `
    oh happy {{time}}
    when {{savior}} washed my {{evil}} away
  `
  const pattern = Regex('{{', '}}')
  const data = {
    time: 'day',
    savior: 'Jesus',
    evil: 'sin'
  }
  const expected = template.replace(pattern, (_, contents) => {
    return data[contents]
  })
  const startTime = new Date().getTime()
  replace(
    template,
    pattern,
    (done, _, contents) => {
      setTimeout(() => {
        done(undefined, data[contents])
      }, 500)
    },
    (err, result) => {
      if (err) {
        return t.fail(err)
      }
      const totalTime = new Date().getTime() - startTime
      t.true(totalTime < 750, `Took: ${totalTime}ms`)
      t.equal(result, expected)
    }
  )
})

test('collects errors', t => {
  t.plan(1)
  replace('1 2', /\d/g, (done, match) => {
    match === '2' ? done('error') : done(undefined, match)
  }, (errors, result) => {
    t.deepEqual(errors, [undefined, 'error'])
  })
})

test('no result when there are errors', t => {
  t.plan(1)
  replace('1 2', /\d/g, (done, match) => {
    match === '2' ? done('error') : done(undefined, match)
  }, (errors, result) => {
    t.equal(result, undefined, 'no result')
  })
})


test('ignoreErrors: true, has result', t => {
  t.plan(2)
  const data = {foo: 'abc'}
  replace('{{foo}} {{fail}}', Regex('{{', '}}'), (done, _, contents) => {
    const value = data[contents]
    value ? done(undefined, value) : done(contents)
  }, {ignoreErrors: true}, (errors, result) => {
    t.deepEqual(errors, [undefined, 'fail'])
    t.equal(result, 'abc ')
  })
})

test('throws error if no cb given', t => {
  t.plan(1)
  try {
    replace('foo', 'foo', '')
    t.fail('did not throw error')
  } catch (err) {
    t.pass('threw error: ' + err)
  }
})

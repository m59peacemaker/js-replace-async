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

// test('arguments passed to replacer function

//})

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

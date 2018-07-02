'use strict'

var test = require('tape')
var slsPromised = require('./')

test('normal res', function (t) {
  const event = {}
  const context = {}
  const fn = slsPromised((e, c) => {
    t.equal(e, event)
    t.equal(c, context)
    return {is: 'ok'}
  })
  fn(event, context, (error, result) => {
    t.notOk(error)
    t.deepEqual(result, {
      statusCode: 200,
      body: JSON.stringify({is: 'ok'}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    t.end()
  })
})

test('normal error', function (t) {
  const fn = slsPromised(() => {
    throw 'error' // eslint-disable-line
  })
  fn(null, null, (error, result) => {
    t.notOk(error)
    t.deepEqual(JSON.parse(JSON.stringify(result)), {
      statusCode: 500,
      body: 'error',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    t.end()
  })
})

test('custom response', function (t) {
  const customRes = slsPromised.response({
    statusCode: 204,
    body: null
  })
  const fn = slsPromised(() => customRes)

  fn(null, null, (error, result) => {
    t.notOk(error)
    t.equal(result, customRes)
    t.end()
  })
})

test('error is always string', t => {
  const fn = slsPromised(() => Promise.reject({ custom: 'object' }))
  fn(null, null, (error, result) => {
    t.notOk(error)
    t.equal(result.body, '{"custom":"object"}')
    t.end()
  })
})

test('error {body, statusCode, headers} only are returned', t => {
  const fn = slsPromised(() => Promise.reject({ custom: 'object' }))
  fn(null, null, (error, result) => {
    t.notOk(error)
    t.deepEqual(Object.keys(result).sort(), ['body', 'headers', 'statusCode'])
    t.end()
  })
})

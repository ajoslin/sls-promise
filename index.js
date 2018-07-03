'use strict'

const caseless = require('caseless')

module.exports = slsPromised

slsPromised.response = opts => new SlsCustomResponse(opts)

function slsPromised (handler) {
  return slsPromisedWrapper

  function slsPromisedWrapper (event, context, callback) {
    // NOTE(ajoslin): Do NOT return the promise. Lambda has limited promise support
    // and will treat it as a response.
    Promise.resolve()
      .then(() => handler(event, context))
      .then(function handleSuccess (result) {
        if (!(result instanceof SlsCustomResponse)) {
          result = new SlsCustomResponse({
            body: result
          })
        }
        callback(null, result)
      }, function handleError (data) {
        data = data || {}
        const result = {}
        result.statusCode = data.statusCode || 500
        result.headers = data.headers || {
          'Content-Type': 'application/json'
        }
        result.body = data.body || data.message || JSON.stringify(data || {message: 'Internal Server Error'})
        callback(null, {
          headers: result.headers,
          body: result.body || {message: 'Internal Server Error'},
          statusCode: result.statusCode
        })
      })
  }
}

function SlsCustomResponse (opts) {
  this.statusCode = opts.statusCode || 200
  this.headers = opts.headers || {}

  const caselessHeaders = caseless(this.headers)

  caselessHeaders.set('Content-Type', 'application/json')
  if (opts.body && /application.json/.test(caselessHeaders.get('Content-Type') || '') && typeof opts.body !== 'string') {
    this.body = JSON.stringify(opts.body)
  } else {
    this.body = opts.body
  }
}

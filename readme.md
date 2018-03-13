# sls-promise [![Build Status](https://travis-ci.org/ajoslin/sls-promise.svg?branch=master)](https://travis-ci.org/ajoslin/sls-promise)

> Minimal promise-based responses for serverless. Return JSON or full response.


## Install

```
$ npm install --save sls-promise
```


## Usage

```js
var slsp = require('sls-promise')

// By default, treats return value as the body of a response.
// Adds statusCode 200 and Content-Type application/json.
exports.handler = slsp((event, context) => {
  return { some: 'json' }
})

// Create a custom response with slsp.response() as return value.
exports.withCustomResponse = slsp((event, context) => {
  return slsp.response({
    statusCode: 204,
    body: null
  })
})

// By default, rejected promises response are treated as an error body.
// statusCode 500 is added.
exports.withRejectedPromise = slsp((event, context) => {
  throw new Error('this is not good')
})

// Recommended: use node-http-error for custom errors.
const HttpError = require('node-http-error')
exports.withCustomError = slsp((event, context) => {
  if (notAllowed) throw HttpError(403, 'You cannot view this.')
})
```

## API

#### `slsPromise(handler)` -> `wrappedHandler`

Returns a function that takes (event, context) like a normal serverless function,
except it expects a promise to be returned from `handler`.

**Response Types**

- Promise resolved with any value: responds with `{statusCode: 200, headers: {'Content-Type': 'application/json'}, body: givenValue}`
- Promise resolved with an instance of `slsPromise.response`: Responds with the given response object.
- Promise rejected or error thrown: Sets statusCode to 500 if no statusCode is given, and sets error.message to response.body. Recommended: use [node-http-error](https://npm.im/node-http-error) for custom HTTP errors.


## License

MIT © [Andrew Joslin](http://ajoslin.com)

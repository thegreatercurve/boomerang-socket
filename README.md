<img src="https://raw.githubusercontent.com/thegreatercurve/boomerang-socket/master/logo.png" width="120" alt="Boomerang Socket" />

# Boomerang Socket

[![CircleCI](https://circleci.com/gh/thegreatercurve/boomerang-socket.svg?style=shield&circle-token=b9eab2c726cc4ef104830352a9a46c3b06d07629)](https://circleci.com/gh/thegreatercurve/boomerang-socket) [![Coverage Status](https://coveralls.io/repos/github/thegreatercurve/boomerang-socket/badge.svg?branch=master)](https://coveralls.io/github/thegreatercurve/boomerang-socket?branch=master)

Boomerang Socket is a small JavaScript library that extends the native WebSocket API to allow automatic reconnection if a client is disconnected.

### Features

- Fully mirrors the native WebSocket API.
- Automatic reconnection is [RFC compliant](https://tools.ietf.org/html/rfc6455#section-7.2.3).
- Only 7kb when minified.
- Compatible with IE11 and upwards.
- Fully tested.
- No external dependencies.

### Installation

```
npm install boomerang-socket
```

### Tests

```
npm run test
```

### Usage

It can be used in exactly the same way as [a native WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), with exactly the same API.

```js
// ES2015
import BoomerangSocket from "boomerang-socket";

// ES5
const BoomerangSocket = require("boomerang-socket");

const socket = new BoomerangSocket("wss://localhost:8080");

socket.addEventListener("open", (e) => {
  socket.send("hello!")
});

socket.onmessage = (data) => {
  socket.send("message from server received!")
});
```

The only difference is that the `BoomerangSocket` constructor accepts an additional third argument: an options config object which customises the auto-reconnect behaviour.

```js
const socket = new BoomerangSocket("wss://localhost:8080", undefined, {
  reconnectAttempts: 25,
  reconnectDelay: 5000,
});
```

### Options

| name                   | type    | default    | description                                                            |
|------------------------|---------|------------|------------------------------------------------------------------------|
| connectTimeout         | number  | `250`      | millisecond timeout before a new connection must return `open`          |
| reconnect              | boolean | `true`     | enables or disables auto-reconnection                                  |
| reconnectAttempts      | number  | `Infinity` | maximum number of reconnection attempts                                |
| reconnectDelay         | number  | `3000`     | millisecond delay until first reconnection attempt                     |
| reconnectDelayExponent | number  | `1.05`     | exponent applied to `reconnectDelay` between each reconnection attempt |


### Contribute

We actively welcome any contributions. You can open a Pull Request [here](https://github.com/thegreatercurve/boomerang-socket/compare).

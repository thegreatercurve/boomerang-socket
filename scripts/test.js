"use strict";

process.env.NODE_ENV = "test";

const jest = require("jest");
const argv = process.argv.slice(2);

const MockWebSocket = (url, protocols) => ({
  url,
  protocols,

  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),

  close: jest.fn(),
  send: jest.fn(),

  onerror: null,
  onclose: null,
  onopen: null,
  onerror: null,
});

global.WebSocket = MockWebSocket;

if (process.env.CI) {
  argv.push("--runInBand", "--coverage");
} else {
  argv.push("--watch");
}

jest.run(argv);

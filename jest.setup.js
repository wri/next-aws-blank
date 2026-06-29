import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { webcrypto } from 'crypto'
import { serialize, deserialize } from 'v8'

// Mock Next.js server-side globals
if (typeof global.Request === 'undefined') {
  global.Request = class Request {}
  global.Response = class Response {}
  global.Headers = class Headers {}
}

// Polyfill TextEncoder/TextDecoder for tests
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Web Crypto API for tests
if (!global.crypto) {
  global.crypto = webcrypto
}

// Ensure crypto.subtle is available
if (global.crypto && !global.crypto.subtle) {
  global.crypto.subtle = webcrypto.subtle
}

// Polyfill structuredClone for Node runtimes where it's not globally available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (value) => deserialize(serialize(value))
}

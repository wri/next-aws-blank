import '@testing-library/jest-dom';

// Mock Next.js server-side globals
if (typeof global.Request === 'undefined') {
  global.Request = class Request {};
  global.Response = class Response {};
  global.Headers = class Headers {};
}

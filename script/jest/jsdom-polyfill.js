/**
 * Polyfill for https://github.com/jsdom/jsdom/issues/2524
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

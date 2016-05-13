'use strict';

const platform = process.platform.toLowerCase();
const supportedPlatforms = ['darwin'];

if (supportedPlatforms.indexOf(platform) > -1) {
  const os = require('./lib/' + platform);

  const methodNotImpl = (methodName) =>
    () => new Error(`${methodName} not implemented on ${platform}`);

  for (const methodName in os) {
    if (os.hasOwnProperty(methodName)) {
      exports[methodName] = os[methodName] || methodNotImpl(methodName);
    }
  }
}

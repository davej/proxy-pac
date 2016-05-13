# proxy-pac [![Build Status](https://travis-ci.org/davej/proxy-pac.svg?branch=master)](https://travis-ci.org/davej/proxy-pac)

> Get/set proxy auto-config (PAC) file. Currently only supports OS X.


## Install

```
$ npm install --save proxy-pac
```


## Usage

```js
const proxyPac = require('proxy-pac');

proxyPac.getActiveService().then(activeDevice => console.log(activeDevice));
//=> 'Wi-Fi'

proxyPac.getAll().then(services => console.log(services));
//=> [ { name: 'Bluetooth DUN 2', url: null, enabled: false },
//     { name: 'Wi-Fi', url: 'http://test.com/proxy.pac', enabled: true },
//     { name: 'Bluetooth PAN', url: null, enabled: false },
//     { name: 'Thunderbolt Bridge', url: null, enabled: false } ]

proxyPac.getServices().then(services => console.log(services));
//=> [ 'Bluetooth DUN 2', 'Wi-Fi', 'Bluetooth PAN', 'Thunderbolt Bridge' ]

proxyPac.getNamed('Thunderbolt Bridge').then(pac => console.log(pac));
//=> { name: 'Thunderbolt Bridge', url: null, enabled: false }

proxyPac.setNamed('Thunderbolt Bridge', 'http:localhost:1234/proxy.pac')
  .then(pac => console.log(pac));
//=> { name: 'Thunderbolt Bridge', url: 'http:localhost:1234/proxy.pac', enabled: true }

proxyPac.resetNamed('Thunderbolt Bridge').then(pac => console.log(pac));
//=> { name: 'Thunderbolt Bridge', url: ' ', enabled: false }
// NOTE: I couldn't find a way to set url to null or empty-string so it is set
// to the space character (' ') instead.

// ----------------------------------------------------------------
// The APIs below perform the action on the current active service.
// ----------------------------------------------------------------

proxyPac.getCurrent().then(pac => console.log(pac));
//=> { name: 'Wi-Fi', url: 'http://test.com/proxy.pac', enabled: true }

proxyPac.setCurrent('http://foo.bar/hello.pac').then(pac => console.log(pac));
//=> { name: 'Wi-Fi', url: 'http://foo.bar/hello.pac', enabled: true }

proxyPac.resetCurrent().then(pac => console.log(pac));
//=> { name: 'Wi-Fi', url: ' ', enabled: false }


// ---------------------------------------------------------
// The APIs below perform the action on all active services.
// ---------------------------------------------------------

proxyPac.setAll('http://just-a-test/proxy.pac').then(services => console.log(services));
//=> [ { name: 'Bluetooth DUN 2', url: 'http://just-a-test/proxy.pac', enabled: true },
//     { name: 'Wi-Fi', url: 'http://just-a-test/proxy.pac', enabled: true },
//     { name: 'Bluetooth PAN', url: 'http://just-a-test/proxy.pac', enabled: true },
//     { name: 'Thunderbolt Bridge', url: 'http://just-a-test/proxy.pac', enabled: true } ]

proxyPac.resetAll().then(services => console.log(services));
//=> [ { name: 'Bluetooth DUN 2', url: ' ', enabled: false },
//     { name: 'Wi-Fi', url: ' ', enabled: false },
//     { name: 'Bluetooth PAN', url: ' ', enabled: false },
//     { name: 'Thunderbolt Bridge', url: ' ', enabled: false } ]

```


## License

MIT © [DaveJ](https://twitter.com/DaveJ)

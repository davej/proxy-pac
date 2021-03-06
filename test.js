import test from 'ava';
import proxyPac from './';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let originalProxyPacs;

test.serial('getAll', t =>
  proxyPac.getAll().then(services => {
    t.true(Array.isArray(services));
    services.forEach(service => {
      t.is(typeof service.name, 'string');
      t.not(typeof service.url, 'undefined');
      t.is(typeof service.enabled, 'boolean');
    });
    originalProxyPacs = services;
    t.pass();
  })
);

test('getActiveService', t =>
  proxyPac.getActiveService().then(activeDevice => {
    t.is(typeof activeDevice, 'string');
    t.true(activeDevice.length > 2);
  })
);

test('getServices', t => {
  return proxyPac.getServices().then(services => {
    t.pass();
    t.true(services.length > 1);
    t.is(typeof services[0], 'string');
    t.true(services[0].length > 2);
  });
});

if (process.env.CI === 'true') {
  test('getNamedCI', t =>
    proxyPac.getNamed('Ethernet').then(pac => {
      t.is(pac.url, null);
      t.false(pac.enabled);
    })
  );

  test('getCurrentCI', t =>
    proxyPac.getCurrent().then(pac => {
      t.is(pac.url, null);
      t.false(pac.enabled);
    })
  );
} else {
  // Don't run these test in CI because they require manual authentication

  test.serial('setNamed', t =>
    proxyPac.setNamed('Thunderbolt Bridge', 'foobar').then(pac => {
      t.is(pac.url, 'foobar');
      t.true(pac.enabled);
    })
  );

  test.serial('getNamed', t =>
    proxyPac.getNamed('Thunderbolt Bridge').then(pac => {
      t.is(pac.url, 'foobar');
      t.true(pac.enabled);
    })
  );

  test.serial('setCurrent', t =>
    proxyPac.setCurrent('test').then(pac => {
      t.is(pac.url, 'test');
      t.true(pac.enabled);
    })
  );

  test.serial('getCurrent', t =>
    proxyPac.getCurrent().then(pac => {
      t.is(pac.url, 'test');
      t.true(pac.enabled);
    })
  );

  test.serial('resetCurrent', t =>
    proxyPac.resetCurrent().then(pac => {
      t.is(pac.url, ' ');
      t.false(pac.enabled);
      return proxyPac.getCurrent().then(pac => {
        t.is(pac.url, ' ');
        t.false(pac.enabled);
      });
    })
  );

  test.serial('setAll', t =>
    proxyPac.setAll('http://just-a-test/proxy.pac').then(services => {
      t.true(Array.isArray(services));
      services.forEach(pac => {
        t.is(typeof pac.name, 'string');
        t.true(pac.name.length > 1);
        t.is(pac.url, 'http://just-a-test/proxy.pac');
        t.true(pac.enabled);
      });
      t.pass();
    })
  );

  test.serial('resetAll', t =>
    proxyPac.resetAll().then(services => {
      t.true(Array.isArray(services));
      services.forEach(pac => {
        t.is(typeof pac.name, 'string');
        t.true(pac.name.length > 1);
        t.is(pac.url, ' ');
        t.false(pac.enabled);
      });
      t.pass();
    })
  );

  let enabledPacs;
  test.serial('resetToOriginal', t => {
    // reset
    enabledPacs = (originalProxyPacs || []).filter(service => Boolean(service.enabled));
    enabledPacs.map((service, i) =>
      delay(500 * i).then(() =>
        proxyPac.setNamed(service.name, service.url).then(pac => {
          t.is(pac.name, service.name);
          t.is(pac.url, service.url);
          t.true(pac.enabled);
        })
      )
    );
  });
}

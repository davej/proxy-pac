'use strict';

const execa = require('execa');
const network = require('network');
const pify = require('pify');
const getActiveInterface = pify(network.get_active_interface);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getCurrent = () => getActiveService().then(getNamed);
const setCurrent = (url) => getActiveService().then((service) => setNamed(service, url));
const resetCurrent = () => getActiveService().then(resetNamed);

function setNamed(service, url) {
  if (typeof url !== 'string' || url.length === 0) {
    Promise.reject(new Error('`url` must be a non-empty string.'));
  }
  return execa.shell(`networksetup -setautoproxyurl "${service}" "${url}"`)
    .then(() => setNamedState(service, true));
}

function getNamed(service) {
  return execa.shell(`networksetup -getautoproxyurl "${service}"`)
    .then(data =>
      Object.assign({name: service}, parseStringToObj(data.stdout))
    );
}

function setNamedState(service, stateOn) {
  const state = stateOn ? 'on' : 'off';
  return execa.shell(`networksetup -setautoproxystate "${service}" ${state}`)
    .then(() => getNamed(service));
}

function resetNamed(service) {
  // Can't set as null, must be non-empty string
  return setNamed(service, ' ')
    .then(() => setNamedState(service, false));
}

function setAll(url) {
  // Sets proxy PAC for all services in current location
  return getServices()
    .then(services => services.map((service, i) =>
    // HACK: Add an incremental delay so OS X has time to make the changes
      delay(i * 500).then(() => setNamed(service, url))
    ))
    .then(Promise.all.bind(Promise));
}

function resetAll() {
  // resets proxy PAC for all services in current location
  return getServices()
    .then(services => services.map((service, i) =>
      // HACK: Add an incremental delay so OS X has time to make the changes
      delay(i * 500).then(() => resetNamed(service))
    ))
    .then(Promise.all.bind(Promise));
}

function getAll() {
  // Get proxy PAC for all services in current location
  return getServices()
    .then(services => Promise.all(services.map(getNamed)));
}

function getServices() {
  return execa.shell('networksetup -listallnetworkservices | tail +2')
    .then(data => data.stdout.split('\n'));
}

function parseStringToObj(str) {
  const camelize = (str) =>
    str
      .replace('URL', 'url')
      .replace(/\s(.)/g, ($1) => $1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, ($1) => $1.toLowerCase());

  const checkForBool = str => {
    if (str === 'Yes') {
      return true;
    } else if (str === 'No') {
      return false;
    } else if (str === '(null)') {
      return null;
    }
    return str;
  };

  const returnObj = {};
  str.split('\n').forEach(line => {
    if (!line[0] || line[0] === '') {
      return;
    }
    const obj = line.split(': ');
    const key = camelize(obj[0]);
    obj[1] = checkForBool(obj[1]);
    // .replace('No', false);
    returnObj[key] = obj[1];
  });
  return returnObj;
}

function parseNetworkDevices(networkString) {
  return networkString.split('\n\n').map(parseStringToObj);
}

function getActiveService() {
  const activeInterface = getActiveInterface();
  const allHardwarePorts = execa.shell('networksetup -listallhardwareports');
  return Promise.all([activeInterface, allHardwarePorts])
    .then((promises) => {
      const networkDevices = parseNetworkDevices(promises[1].stdout);
      const activeInterface = promises[0].name;
      const active = networkDevices.find(device => device.device === activeInterface);
      const activeName = active.hardwarePort;
      return activeName;
    });
}

module.exports = {
  getCurrent,
  setCurrent,
  setNamed,
  getNamed,
  setNamedState,
  resetNamed,
  resetCurrent,
  resetAll,
  setAll,
  getAll,
  getActiveService,
  getServices
};

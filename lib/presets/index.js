"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  builtInPresetMap: true,
  getPresetClassByName: true
};
exports.getPresetClassByName = getPresetClassByName;
exports.builtInPresetMap = void 0;

var _mux = _interopRequireDefault(require("./_mux"));

var _baseAuth = _interopRequireDefault(require("./base-auth"));

var _vtest = _interopRequireDefault(require("./vtest"));

var _obfsRandomPadding = _interopRequireDefault(require("./obfs-random-padding"));

var _obfsHttp = _interopRequireDefault(require("./obfs-http"));

var _obfsTls = _interopRequireDefault(require("./obfs-tls1.2-ticket"));

var _aeadRandomCipher = _interopRequireDefault(require("./aead-random-cipher"));

var _defs = require("./defs");

Object.keys(_defs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _defs[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkPresetClass(clazz) {
  if (typeof clazz !== 'function') {
    return false;
  }

  const requiredMethods = ['onDestroy', 'onInit', 'beforeOut', 'beforeIn', 'clientOut', 'serverIn', 'serverOut', 'clientIn', 'beforeOutUdp', 'beforeInUdp', 'clientOutUdp', 'serverInUdp', 'serverOutUdp', 'clientInUdp'];

  if (requiredMethods.some(method => typeof clazz.prototype[method] !== 'function')) {
    return false;
  }

  const requiredStaticMethods = ['onCheckParams', 'onCache'];
  return !requiredStaticMethods.some(method => typeof clazz[method] !== 'function');
}

const builtInPresetMap = {
  'mux': _mux.default,
  'base-auth': _baseAuth.default,
  'vtest': _vtest.default,
  'obfs-random-padding': _obfsRandomPadding.default,
  'obfs-http': _obfsHttp.default,
  'obfs-tls1.2-ticket': _obfsTls.default,
  'aead-random-cipher': _aeadRandomCipher.default
};
exports.builtInPresetMap = builtInPresetMap;

function getPresetClassByName(name, allowPrivate = false) {
  let clazz = builtInPresetMap[name];

  if (clazz === undefined) {
    try {
      clazz = require(name);
    } catch (err) {
      throw Error(`cannot load preset "${name}" from built-in modules or external`);
    }

    if (!checkPresetClass(clazz)) {
      throw Error(`definition of preset "${name}" is invalid`);
    }
  }

  if (!allowPrivate && clazz.isPrivate) {
    throw Error(`cannot load private preset "${name}"`);
  }

  return clazz;
}
'use strict';

var eulerPhi = require('./euler_phi');
var primeFactors = require('./prime_factors');
var powerMod = require('./power_mod');


module.exports = function primitiveRoot(modulus) {
  var phi_m = eulerPhi(modulus);
  var factors = primeFactors(phi_m);
  for (var x = 2; x < modulus; x++) {
    var check = true;
    var n = factors.length;
    for (var i = 0; i < n; i++) {
      if (powerMod(x, phi_m / factors[i], modulus) === 1) {
        check = false;
        break;
      }
    }
    if (check) { return x; }
  }
  return NaN;
};

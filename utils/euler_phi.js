'use strict';

var primeFactors = require('./prime_factors');

module.exports = function eulerPhi(n) {
  var product = function (list) {
    return list.reduce(function (memo, number) {
      return memo * number;
    }, 1);
  };
  var factors = primeFactors(n);

  // Product{p-1} for all prime factors p
  var N = product(factors.map(function (p) { return p - 1; }))

  // Product{p} for all prime factors p
  var D = product(factors);

  // Compose the product formula and return
  return n * N / D;
};

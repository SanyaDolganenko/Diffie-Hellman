'use strict';

var factor = require('./factor');

module.exports = function primeFactors(n) {
  return factor(n).map(function (f) { return f.prime });
};

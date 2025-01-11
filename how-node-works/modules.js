const C = require("./test-modul");
const calc = new C();
console.log(calc.add(2, 6));

// exports
const { add, multiply } = require("./test-module2");
console.log(multiply(5, 6));

// caching
require("./test-modul3")();
require("./test-modul3")();

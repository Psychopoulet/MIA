"use strict";

// consts

const MAIN = require("path").join(__dirname, 'main.js');

// run

try {
	console.log('daemoning', MAIN);
	require('daemon').daemon(MAIN);
}
catch(e) {
	console.log(e);
}

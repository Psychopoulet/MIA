"use strict";

// dépendances

	var Launcher = require(require('path').join(__dirname, 'class', 'Launcher.js'));

// run

	try {
		new Launcher();
	}
	catch (e) {
		console.log('Global script failed : ');
		console.log(e);
	}
	
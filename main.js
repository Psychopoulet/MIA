"use strict";

// dépendances

	var
		path = require('path'),
		
		Logs = require(path.join(__dirname, 'class', 'Logs.js')),
		MIA = require(path.join(__dirname, 'class', 'MIA.js'));

// run

	try {
		
		new MIA().start()
			.catch(function (err) { new Logs(__dirname).err(err); });
			
	}
	catch (e) {
		new Logs(__dirname).err('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
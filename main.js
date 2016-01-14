"use strict";

// dépendances

	var
		path = require('path'),
		simplecontainer = require('simplecontainer'),
		
		ChildsSocket = require(path.join(__dirname, 'class', 'ChildsSocket.js')),
		Conf = require(path.join(__dirname, 'class', 'Conf.js')),
		HTTPServer = require(path.join(__dirname, 'class', 'HTTPServer.js')),
		HTTPSocket = require(path.join(__dirname, 'class', 'HTTPSocket.js')),
		Logs = require(path.join(__dirname, 'class', 'Logs.js')),
		OpenSSL = require(path.join(__dirname, 'class', 'OpenSSL.js')),
		Plugins = require(path.join(__dirname, 'class', 'Plugins.js')),
		MIA = require(path.join(__dirname, 'class', 'MIA.js'));

// run

	try {
		
		var Container = new simplecontainer();

		Container	.set('conf', new Conf())
					.set('openssl', new OpenSSL())
					.set('plugins', new Plugins())
					.set('logs', Logs)

					.set('childssockets', new ChildsSocket(Container))
					.set('webserver', new HTTPServer(Container))
					.set('websockets', new HTTPSocket(Container));

		new MIA(Container).start()
			.catch(function (err) { new Logs(__dirname).err(err); });
			
	}
	catch (e) {
		new Logs(__dirname).err('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
"use strict";

// dépendances

	const 	path = require('path'),

			SimpleContainer = require('simplecontainer'),
			SimpleConfig = require('simpleconfig'),
			SimpleLogs = require('simplelogs'),
			SimpleSSL = require('simplessl'),
			SimplePluginsManager = require('simplepluginsmanager'),
			
			ChildsSocket = require(path.join(__dirname, 'class', 'ChildsSocket.js')),
			HTTPServer = require(path.join(__dirname, 'class', 'HTTPServer.js')),
			HTTPSocket = require(path.join(__dirname, 'class', 'HTTPSocket.js')),
			MIA = require(path.join(__dirname, 'class', 'MIA.js'));

// run

	try {

		var Container = new SimpleContainer();

		Container	.set('conf', new SimpleConfig(path.join(__dirname, 'conf.json')))
					.set('logs', new SimpleLogs(path.join(__dirname, 'logs')))
					.set('http', null)
					.set('express', require('express')())
					.set('openssl', new SimpleSSL())
					.set('plugins', new SimplePluginsManager(path.join(__dirname, 'plugins')))

					.set('childssockets', new ChildsSocket(Container))
					.set('webserver', new HTTPServer(Container))
					.set('websockets', new HTTPSocket(Container));

		if (!Container.get('conf').fileExists()) {

			Container.get('conf')	.set('webport', 1337).set('childrenport', 1338)
									.set('debug', false)
									.set('ssl', true)
									.set('user', {
										login : 'rasp',
										password : 'password'
									})
									.set('clients', []).set('childs', [])
									.save().catch(function(e) {
										Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
									});

		}

		Container.get('conf').spaces = true;

		Container.get('conf').load().then(function() {

			Container.get('logs').showInConsole = Container.get('conf').get('debug');
			Container.get('logs').showInFiles = !(Container.get('conf').get('debug'));

			new MIA(Container).start()
				.catch(function (err) { Container.get('logs').err('-- [MIA] ' + ((err.message) ? err.message : err)); });
			
		})
		.catch(function(e) {
			Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
		});

	}
	catch (e) {
		console.log('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
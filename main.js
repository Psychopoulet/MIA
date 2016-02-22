"use strict";

// dépendances

	const 	path = require('path'),
			fs = require('simplefs'),
			sqlite3 = require('sqlite3').verbose(),

			SimpleContainer = require('simplecontainer'),
			SimpleConfig = require('simpleconfig'),
			SimpleLogs = require('simplelogs'),
			SimpleSSL = require('simplessl'),
			SimplePluginsManager = require('simplepluginsmanager'),
			
			ChildsSocket = require(path.join(__dirname, 'class', 'ChildsSocket.js')),
			HTTPServer = require(path.join(__dirname, 'class', 'HTTPServer.js')),
			HTTPSocket = require(path.join(__dirname, 'class', 'HTTPSocket.js')),
			MIA = require(path.join(__dirname, 'class', 'MIA.js')),

			Actions = require(path.join(__dirname, 'database', 'actions.js')),
			ActionsTypes = require(path.join(__dirname, 'database', 'actionstypes.js')),
			Childs = require(path.join(__dirname, 'database', 'childs.js')),
			Clients = require(path.join(__dirname, 'database', 'clients.js')),
			Crons = require(path.join(__dirname, 'database', 'crons.js')),
			Status = require(path.join(__dirname, 'database', 'status.js')),
			Users = require(path.join(__dirname, 'database', 'users.js'));

// private

	function _loadConf() {

		return new Promise(function(resolve, reject) {

			if (!Container.get('conf').fileExists()) {

				Container.get('conf')	.set('webport', 1337).set('childrenport', 1338)
										.set('debug', false)
										.set('ssl', true)
										.set('clients', []).set('actions', [])
										.save().catch(function(e) {
											Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
										});

			}

			Container.get('conf').load().then(resolve)
			.catch(function(e) {
				Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
				reject();
			});

		});

	}

	function _loadDatabase() {

		return new Promise(function(resolve, reject) {

			// var db = new sqlite3.Database(path.join(__dirname, 'database', 'MIA.sqlite3'));
			var db = new sqlite3.Database(':memory:');

			db.serialize(function() {

				var actions = new Actions(db),
					actionstypes = new ActionsTypes(db),
					childs = new Childs(db),
					clients = new Clients(db),
					crons = new Crons(db),
					status = new Status(db),
					users = new Users(db);

				Container	.set('actions', actions)
							.set('actionstypes', actionstypes)
							.set('childs', childs)
							.set('clients', clients)
							.set('crons', crons)
							.set('status', status)
							.set('users', users);

				status.create().then(function() {

					users.create().then(function() {

						clients.create().then(function() {

							childs.create().then(function() {

								crons.create().then(function() {

									actionstypes.create().then(function() {

										actions.create().then(resolve).catch(reject);
									
									}).catch(reject);

								}).catch(reject);
				
							}).catch(reject);

						}).catch(reject);

					}).catch(reject);

				}).catch(reject);

			});
	
		});

	}

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

		Container.get('conf').spaces = true;

		_loadConf().then(function() {

			Container.get('logs').showInConsole = Container.get('conf').get('debug');
			Container.get('logs').showInFiles = !(Container.get('conf').get('debug'));

			_loadDatabase().then(function() {

				if (Container.get('conf').has('pid')) {

					try {

						process.kill(Container.get('conf').get('pid'));
						Container.get('logs').success('[END PROCESS ' + Container.get('conf').get('pid') + ']');

					}
					catch (e) { }

				}

				Container.get('conf').set('pid', process.pid).save().then(function() {

					Container.get('logs').success('[START PROCESS ' + process.pid + ']');

					new MIA(Container).start()
						.catch(function (err) { Container.get('logs').err(((err.message) ? err.message : err)); });

				})
				.catch(function(err) {
					Container.get('logs').err('-- [process] ' + ((err.message) ? err.message : err));
				});
			
			})
			.catch(function(err) {
				Container.get('logs').err('-- [database] ' + ((err.message) ? err.message : err));
			});
	
		})
		.catch(function(err) {
			Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
		});

	}
	catch (e) {
		console.log('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
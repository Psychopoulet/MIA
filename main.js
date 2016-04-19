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
			CronsActions = require(path.join(__dirname, 'database', 'cronsactions.js')),
			Status = require(path.join(__dirname, 'database', 'status.js')),
			Users = require(path.join(__dirname, 'database', 'users.js'));

// private

	function _loadConf(Container) {

		return new Promise(function(resolve, reject) {

			if (!Container.get('conf').fileExists()) {

				Container.get('conf')	.set('webport', 1337).set('childrenport', 1338)
										.set('debug', false)
										.set('ssl', true)
										.save().catch(function(e) {
											Container.get('logs').err('-- [conf] ' + ((e.message) ? e.message : e));
										});

			}

			Container.get('conf').load().then(resolve)
			.catch(function(e) {
				reject((e.message) ? e.message : e);
			});

		});

	}

	function _createDatabase() {

		return new Promise(function(resolve, reject) {

			let db = null,
				dbFile = path.join(__dirname, 'database', 'MIA.sqlite3'),
				createFile = path.join(__dirname, 'database', 'create.sql');

			fs.pdirExists(createFile).then(function(exists) {

				if (!exists) {
					db = new sqlite3.Database(dbFile);
					db.serialize(function() { resolve(db); });
				}
				else {

					fs.pdirExists(dbFile).then(function(exists) {

						if (exists) {
							db = new sqlite3.Database(dbFile);
							db.serialize(function() { resolve(db); });
						}
						else {

							db = new sqlite3.Database(dbFile);

							db.serialize(function() {
								
								fs.readFile(createFile, 'utf8', function (err, sql) {

									if (err) {
										reject((err.message) ? err.message : err);
									}
									else {

										let queries = [];

										sql.split(';').forEach(function(query) {

											query = query.trim()
														.replace(/--(.*)\s/g, "")
														.replace(/\s/g, " ")
														.replace(/  /g, " ");

											if ('' != query) {
												queries.push(query + ';');
											}

										});

										function executeQueries(i) {

											if (i >= queries.length) {
												resolve(db);
											}
											else {

												db.run(queries[i], [], function(err) {

													if (err) {
														reject((err.message) ? err.message : err);
													}
													else {
														executeQueries(i + 1);
													}

												});

											}

										}

										executeQueries(0);

									}
									
								});

							});

						}

					}).catch(reject);

				}

			}).catch(reject);

		});

	}

	function _loadDatabase(Container) {

		return new Promise(function(resolve, reject) {

			_createDatabase().then(function(db) {

				let actions = new Actions(db),
					actionstypes = new ActionsTypes(db),
					childs = new Childs(db),
					clients = new Clients(db),
					crons = new Crons(db),
					cronsactions = new CronsActions(db),
					status = new Status(db),
					users = new Users(db);

				Container	.set('actions', actions)
							.set('actionstypes', actionstypes)
							.set('childs', childs)
							.set('clients', clients)
							.set('crons', crons)
							.set('cronsactions', cronsactions)
							.set('status', status)
							.set('users', users);

				resolve();
	
			}).catch(reject);

		});

	}

	function _deleteOldLogs(Logs) {

		return new Promise(function(resolve, reject) {

			Logs.getLogs().then(function(logs) {

				let date = new Date(),
					sYear = date.getFullYear(), sMonth = date.getMonth() + 1, sDay = date.getDate();

					sYear = sYear + '';
					sMonth = (9 < sMonth) ? sMonth + '' : '0' + sMonth;
					sDay = (9 < sDay) ? sDay + '' : '0' + sDay;

				for (let _year in logs) {

					for (let _month in logs[_year]) {

						for (let _day in logs[_year][_month]) {

							if (_year != sYear || _month != sMonth) {

								Logs.remove(_year, _month, logs[_year][_month][_day]).catch(function(err) {
									Logs.err((err.message) ? err.message : err);
								});

							}

						}

					}

				}

				resolve();

			}).catch(reject);

		});

	}

// run

	try {

		let Container = new SimpleContainer();

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

		_loadConf(Container).then(function() {

			Container.get('logs').showInConsole = Container.get('conf').get('debug');
			Container.get('logs').showInFiles = true;

			_deleteOldLogs(Container.get('logs')).then(function() {

				_loadDatabase(Container).then(function() {

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
				Container.get('logs').err('-- [logs] ' + ((err.message) ? err.message : err));
			});
	
		})
		.catch(function(err) {
			Container.get('logs').err('-- [conf] ' + ((err.message) ? err.message : err));
		});

	}
	catch (e) {
		console.log('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
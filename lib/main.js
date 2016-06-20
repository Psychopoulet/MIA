"use strict";

// deps

	const 	path = require('path'),
			fs = require('simplefs');

// private

	function _loadConf(Container) {

		return fs.isFileProm(path.join(__dirname, 'conf.json')).then(function(exists) {

			Container.get('conf').spaces = true;

			if (exists) {
				return new Promise(function(resolve, reject) { resolve(); });
			}
			else {

				return Container.get('conf').set('webport', 1337).set('childrenport', 1338)
											.set('debug', false).set('ssl', true)
											.save();

			}

		}).then(function() {
			return Container.get('conf').load();
		});

	}

	function _createDatabase(Container) {

		let dbFile = path.join(__dirname, '..', 'database', 'MIA.sqlite3'),
			createFile = path.join(__dirname, '..', 'database', 'create.sql');

		return require("node-scenarios").init(dbFile).then(function(container) {

			container.forEach(function(value, key) {
				Container.set(key, value);
			});

			fs.readFileProm(createFile, 'utf8').then(function (sql) {

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

			});

		});

	}

	function _loadDatabase(Container) {

		return _createDatabase(Container).then(function() {

			let db = Container.get("db");

			Container	.set('childs', new (require(path.join(__dirname, '..', 'database', 'childs.js')))(db))
						.set('clients', new (require(path.join(__dirname, '..', 'database', 'clients.js')))(db))
						.set('crons', new (require(path.join(__dirname, '..', 'database', 'crons.js')))(db))
						.set('status', new (require(path.join(__dirname, '..', 'database', 'status.js')))(db))
						.set('users', new (require(path.join(__dirname, '..', 'database', 'users.js')))(db));

		}).catch(function(err) {

			return require("node-scenarios").delete().then(function() {
				return Promise.reject(err);
			}).then(function(_err) {
				return Promise.reject(err);
			});

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

		let Container = new (require('node-containerpattern'))();

		Container	.set('conf', new (require('node-confmanager'))(path.join(__dirname, 'conf.json')))
					.set('logs', new (require('simplelogs'))(path.join(__dirname, '..', 'logs')))
					.set('http', null)
					.set('express', require('express')())
					.set('openssl', new (require('simplessl'))())
					.set('plugins', new (require('simplepluginsmanager'))(path.join(__dirname, '..', 'plugins')))

					.set('childssockets', new (require(path.join(__dirname, 'ChildsSocket.js')))(Container))
					.set('webserver', new (require(path.join(__dirname, 'HTTPServer.js')))(Container))
					.set('websockets', new (require(path.join(__dirname, 'HTTPSocket.js')))(Container));

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

						new (require(path.join(__dirname, 'MIA.js')))(Container).start().then(function() {

							Container.get('logs').log('').then(function() {
								return Container.get('logs').success('[MIA started]');
							});

						})
						.catch(function (err) {
							Container.get('logs').err(((err.message) ? err.message : err));
						});

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
	
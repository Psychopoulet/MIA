"use strict";

// deps

	const 	path = require('path'),
			fs = require('simplefs');

// private

	function _loadConf(Container) {

		return fs.isFileProm(path.join(__dirname, 'conf.json')).then(function(exists) {

			Container.get('conf').spaces = true;

			if (exists) {
				return Promise.resolve();
			}
			else {

				return Container.get('conf').set("ports", {
					"clients": { "http": 80, "https": 443 },
					"children": { "http": 1337, "https": 1338 }
				}).set("debug", false).set('ssl', true).save();

			}

		}).then(function() {
			return Container.get('conf').load();
		});

	}

	function _executeQueries(db, queries, i) {

		if (i >= queries.length) {
			return Promise.resolve();
		}
		else {

			return new Promise(function(resolve, reject) {

				db.run(queries[i], [], function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						_executeQueries(db, queries, i + 1).then(function() {
							resolve();
						}).catch(reject);

					}

				});

			});

		}

	}

	function _executeSQLFile(db, file) {

		return fs.readFileProm(file, 'utf8').then(function (sql) {

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

			return _executeQueries(db, queries, 0);

		});

	}

	function _loadDatabase(Container) {

		let createFile = path.join(__dirname, '..', 'database', 'create.sql');

		return require("node-scenarios").init(path.join(__dirname, '..', 'database', 'MIA.sqlite3')).then(function(container) {

			container.forEach(function(value, key) {
				Container.set(key, value);
			});

			return Promise.resolve();

		}).then(function() {

			// @TODO : checker si MIA a été intégrée à la BDD
			// SELECT name FROM sqlite_master WHERE type='users' AND name='table_name';

			return Promise.resolve(false);

		}).then(function(MIADatabaseCreated) {

			if (MIADatabaseCreated) {
				return Promise.resolve();
			}
			else {

				return _executeSQLFile(Container.get("db"), createFile).then(function() {

					return Promise.reject("@TODO");

					// @TODO : créer les données de base (users, actionstypes, crons, status)

					/*

						-- node-scenarios

						INSERT INTO actionstypes (name, command) VALUES
						('Jouer un son', 'media.sound.play'),
						('Jouer une vidéo', 'media.video.play'),
						('Lire un texte', 'tts');



						-- MIA

						INSERT INTO users (login, password, email) VALUES
						('rasp', 'd74bc8c7cb18433b140785ae51c48c77b4dc2208', '');

						INSERT INTO crons (id_user, name, timer) VALUES
						(1, 'Café !!', '00 00 16 * * 1-5'),
						(1, 'Manger !!', '00 30 12 * * 1-5');

						INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES
						('ACCEPTED', 'Accepté(e)', '#dff0d8', '#3c763d'),
						('BLOCKED', 'Bloqué(e)', 'red', 'black'),
						('WAITING', 'En attente', '#fcf8e3', '#8a6d3b');

					*/

				});

			}

		}).then(function() {

			let db = Container.get("db");

			Container	.set('childs', new (require(path.join(__dirname, '..', 'database', 'childs.js')))(db))
						.set('clients', new (require(path.join(__dirname, '..', 'database', 'clients.js')))(db))
						.set('crons', new (require(path.join(__dirname, '..', 'database', 'crons.js')))(db))
						.set('status', new (require(path.join(__dirname, '..', 'database', 'status.js')))(db))
						.set('users', new (require(path.join(__dirname, '..', 'database', 'users.js')))(db));

			return Promise.resolve();

		}).then(function() {

			Container.get("users").add();

			return Promise.resolve();

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
					.set('plugins', new (require('node-pluginsmanager'))(path.join(__dirname, '..', 'plugins')))
					.set('servers', {
						"clients": {
							"web": new (require(path.join(__dirname, 'ServerClientsWeb.js')))(Container),
							"sockets": new (require(path.join(__dirname, 'ServerClientsSockets.js')))(Container)
						},
						"children": {
							"sockets": new (require(path.join(__dirname, 'ServerChildrenSockets.js')))(Container)
						}
					});

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

						new (require(path.join(__dirname, 'MIA.js')))(Container).start().then(function() {

							Container.get('logs').log('').then(function() {
								Container.get('logs').success('[MIA started]');
							});

						})
						.catch(function (err) {
							Container.get('logs').err('-- [MIA] => ' + ((err.message) ? err.message : err));
						});

					})
					.catch(function(err) {
						Container.get('logs').err('-- [process] => ' + ((err.message) ? err.message : err));
					});
				
				})
				.catch(function(err) {
					Container.get('logs').err('-- [database] => ' + ((err.message) ? err.message : err));
				});

			})
			.catch(function(err) {
				Container.get('logs').err('-- [logs] => ' + ((err.message) ? err.message : err));
			});
	
		})
		.catch(function(err) {
			Container.get('logs').err('-- [conf] => ' + ((err.message) ? err.message : err));
		});

	}
	catch (e) {
		console.log('Global script failed : ' + ((e.message) ? e.message : e));
	}
	
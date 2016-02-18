
"use strict";

// deps

	const crypto = require('crypto');

// private

	function _cryptPassword (password) {
		return crypto.createHash('sha1').update("MIA_" + password + "_MIA").digest('hex');
	}

// module

module.exports = class DBUsers extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS users (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" login VARCHAR(50) NOT NULL," +
						" password VARCHAR(100) NOT NULL" +
					");", [], function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						
						that.add({ login: 'rasp', password: 'password' }).then(function() {
							that.getAll().then(resolve).catch(reject);
						}).catch(reject);

					}

				});

			}).catch(reject);

		});

	}

	add (user) {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				if (!user) {
					reject('Aucun utilisateur renseigné.');
				}
				else if (!user.login) {
					reject('Aucun login renseigné.');
				}
				else if (!user.password) {
					reject('Aucun mot de passe renseigné.');
				}
				else {

					that.db.run(
						"INSERT INTO users (login, password) VALUES (:login, :password);", {
							':login': user.login,
							':password': _cryptPassword(user.password)
						}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.lastInserted().then(resolve).catch(reject);
						}

					});

					/*that.db.prepare("INSERT INTO users (login, password) VALUES (:login, :password);")
					.run({
						':login': 'rasp',
						':password': crypto.createHash('sha1').update("MIA_password_MIA").digest('hex')
					})
					.finalize();*/

				}

			}).catch(reject);

		});

	}

	lastInserted() {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.get("SELECT id, login, password FROM users ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(row);
					}

				});

			}).catch(reject);

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.all("SELECT id, login, password FROM users;", [], function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(rows);
					}

				});

			}).catch(reject);

		});

	}

};

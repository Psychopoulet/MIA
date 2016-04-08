
"use strict";

// deps

	const crypto = require('crypto');

// private

	function _cryptPassword (password) {
		return crypto.createHash('sha1').update("MIA_" + password + "_MIA").digest('hex');
	}

// module

module.exports = class DBUsers {

	constructor (db) {
		this.db = db;
	}

	add (user) {

		let that = this;

		return new Promise(function(resolve, reject) {

			if (!user) {
				reject('Aucun utilisateur renseigné.');
			}
			else if (!user.login) {
				reject('Aucun login renseigné.');
			}
			else if (!user.password) {
				reject('Aucun mot de passe renseigné.');
			}
			else if (!user.email) {
				reject('Aucun email renseigné.');
			}
			else {

				that.db.run("INSERT INTO users (login, password, email) VALUES (:login, :password, :email);", {
					':login': user.login,
					':password': _cryptPassword(user.password),
					':email': user.email
				}, function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						that.lastInserted().then(resolve).catch(reject);
					}

				});

			}

		});

	}

	exists (login, password) {

		let that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(users) {

				let result = false;

					password = _cryptPassword(password);

					for (let i = 0; i < users.length; ++i) {

						if (users[i].password === password) {
							result = true;
							break;
						}

					}

				resolve(result);

			}).catch(reject);

		});

	}

	lastInserted () {

		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.get("SELECT id, login, password, email FROM users ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? row : {});
				}

			});

		});

	}

	getAll () {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.all("SELECT id, login, password, email FROM users;", [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((rows) ? rows : []);
				}

			});

		});

	}

	update (user) {

		let that = this;

		return new Promise(function(resolve, reject) {

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

				that.db.run("UPDATE users SET login = :login, password = :password, email = :email WHERE id = :id;", {
					':login': user.login,
					':password': _cryptPassword(user.password),
					':email': (user.email) ? user.email : '',
					':id': user.id
				}, function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						that.lastInserted().then(resolve).catch(reject);
					}

				});

			}

		});

	}

};

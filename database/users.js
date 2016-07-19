
"use strict";

// deps

	const crypto = require('crypto');

// private

	function _cryptPassword (password) {
		return crypto.createHash('sha1').update("MIA_" + password + "_MIA").digest('hex');
	}

// module

module.exports = class DBUsers extends require("node-scenarios").abstract {

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY users.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBUsers.formate(row) : {});
					}

				});

			});

		}





// @TODO : search






	getAll () {
		
		return new Promise((resolve, reject) => {

			this.db.all("SELECT id, login, password, email FROM users;", [], (err, rows) => {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((rows) ? rows : []);
				}

			});

		});

	}

	exists (login, password) {

		return new Promise((resolve, reject) => {

			this.getAll().then((users) => {

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

	// write

		add (user) {

			return new Promise((resolve, reject) => {

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

					this.db.run("INSERT INTO users (login, password, email) VALUES (:login, :password, :email);", {
						':login': user.login,
						':password': _cryptPassword(user.password),
						':email': (user.email) ? err.message : ""
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							this.last().then(resolve).catch(reject);
						}

					});

				}

			});

		}

	update (user) {

		return new Promise((resolve, reject) => {

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

				this.db.run("UPDATE users SET login = :login, password = :password, email = :email WHERE id = :id;", {
					':login': user.login,
					':password': _cryptPassword(user.password),
					':email': (user.email) ? user.email : '',
					':id': user.id
				}, (err) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						this.last().then(resolve).catch(reject);
					}

				});

			}

		});

	}





// @TODO : edit & delete






};

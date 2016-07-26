
"use strict";

// deps

	const crypto = require("crypto");

// private

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" users.id," +
		" users.login," +
		" users.password," +
		" users.email" +

	" FROM users";

	function _cryptPassword (password) {
		return crypto.createHash("sha1").update("MIA_" + password + "_MIA").digest("hex");
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

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if ("undefined" !== typeof data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND users.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.login) {
					query += " AND users.login = :login";
					options[":login"] = data.login;
				}
				if ("undefined" !== typeof data.email) {
					query += " AND users.email = :email";
					options[":email"] = data.email;
				}
					
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY users.login ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBUsers.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

		exists (login, password) {

			return new Promise((resolve, reject) => {

				this.search({
					login: login
				}).then((users) => {

					if (users.length) {
						resolve(false);
					}
					else {

						let result = false;

							password = _cryptPassword(password);

							for (let i = 0; i < users.length; ++i) {

								if (users[i].password === password) {
									result = true;
									break;
								}

							}

						resolve(result);

					}

				}).catch(reject);

			});

		}





// @TODO : search


	// write

		add (user) {

			if ("undefined" === typeof user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
			else if ("undefined" === typeof user.login) {
				return Promise.reject("Aucun login renseigné.");
			}
			else if ("undefined" === typeof user.password) {
				return Promise.reject("Aucun mot de passe renseigné.");
			}
			else if ("undefined" === typeof user.email) {
				return Promise.reject("Aucun email renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO users (login, password, email) VALUES (:login, :password, :email);", {
						":login": user.login,
						":password": _cryptPassword(user.password),
						":email": user.email
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							this.last().then(resolve).catch(reject);
						}

					});

				});

			}

		}

		edit (user) {

			return new Promise((resolve, reject) => {

				if ("undefined" === typeof user) {
					reject("Aucun utilisateur renseigné.");
				}
				else if ("undefined" === typeof user.login) {
					reject("Aucun login renseigné.");
				}
				else if ("undefined" === typeof user.password) {
					reject("Aucun mot de passe renseigné.");
				}
				else if ("undefined" === typeof user.email) {
					reject("Aucun email renseigné.");
				}
				else {

					this.db.run("UPDATE users SET login = :login, password = :password, email = :email WHERE id = :id;", {
						":login": user.login,
						":password": _cryptPassword(user.password),
						":email": user.email,
						":id": user.id
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

		delete (user) {
			
			if ("undefined" === typeof user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if ("undefined" === typeof user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM users WHERE id = :id;", { ":id" : user.id }, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				});

			}
			
		}

};

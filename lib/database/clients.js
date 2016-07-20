
"use strict";

// deps

	const	DBStatus = require(require("path").join(__dirname, "status.js")),
			DBUsers = require(require("path").join(__dirname, "users.js"));

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" clients.id," +
		" clients.token," +
		" clients.name," +

		" users.id AS user_id," +
		" users.login AS user_login," +
		" users.email AS user_email," +

		" status.id AS status_id," +
		" status.code AS status_code," +
		" status.name AS status_name," +
		" status.backgroundcolor AS status_backgroundcolor," +
		" status.textcolor AS status_textcolor" +

	" FROM clients" +
		" INNER JOIN users ON users.id = clients.id_user" +
		" INNER JOIN status ON status.id = clients.id_status";

// module

module.exports = class DBClients extends require("node-scenarios").abstract {

	// formate data

		static formate(client) {

			client.user = DBUsers.formate({
				id : client.user_id,
				login : client.user_login,
				email : client.user_email
			});

				delete client.user_id;
				delete client.user_login;
				delete client.user_email;

			client.status = DBStatus.formate({
				id : client.status_id,
				code : client.status_code,
				name : client.status_name,
				backgroundcolor : client.status_backgroundcolor,
				textcolor : client.status_textcolor
			});

				delete client.status_id;
				delete client.status_code;
				delete client.status_name;
				delete client.status_color;

			return client;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY clients.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBClients.formate(row) : {});
					}

				});

			});

		}

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if (data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND clients.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.token) {
					query += " AND clients.token = :token";
					options[":token"] = data.token;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND clients.name = :name";
					options[":name"] = data.name;
				}

				if ("undefined" !== typeof data.user) {

					if ("undefined" !== typeof data.user.id) {
						query += " AND users.id = :users_id";
						options[":users_id"] = data.user.id;
					}
					if ("undefined" !== typeof data.user.login) {
						query += " AND users.login = :users_login";
						options[":users_login"] = data.user.login;
					}
					if ("undefined" !== typeof data.user.email) {
						query += " AND users.email = :users_email";
						options[":users_email"] = data.user.email;
					}
					
				}
				
				if ("undefined" !== typeof data.status) {

					if ("undefined" !== typeof data.status.id) {
						query += " AND status.id = :status_id";
						options[":status_id"] = data.status.id;
					}
					if ("undefined" !== typeof data.status.code) {
						query += " AND status.code = :status_code";
						options[":status_code"] = data.status.code;
					}
					if ("undefined" !== typeof data.status.name) {
						query += " AND status.name = :status_name";
						options[":status_name"] = data.status.name;
					}

					if ("undefined" !== typeof data.status.colors) {

						if ("undefined" !== typeof data.status.colors.background) {
							query += " AND status.backgroundcolor = :status_backgroundcolor";
							options[":status_backgroundcolor"] = data.status.colors.background;
						}
						if ("undefined" !== typeof data.status.colors.text) {
							query += " AND status.textcolor = :status_textcolor";
							options[":status_textcolor"] = data.status.colors.text;
						}

					}
					
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(_sSelectQuery + " ORDER BY users.login ASC, status.name ASC, clients.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBClients.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (client) {

			if ("undefined" === typeof client) {
				return Promise.reject("Aucun client renseigné.");
			}
			else if ("undefined" === typeof client.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof client.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof client.user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if ("undefined" === typeof client.user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof client.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if ("undefined" === typeof client.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO clients (id_user, id_status, token, name) VALUES (:id_user, :id_status, :token, :name);", {
						":id_user": client.user.id,
						":id_status": client.status.id,
						":token": client.token,
						":name": client.name
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

		edit (client) {

			if ("undefined" === typeof client) {
				return Promise.reject("Aucun client renseigné.");
			}
				else if ("undefined" === typeof client.id) {
					return Promise.reject("Le client renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof client.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof client.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof client.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if ("undefined" === typeof client.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE clients SET id_status = :id_status, name = :name WHERE id = :id;", {
						":id": client.id,
						":id_status": client.status.id,
						":name": client.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(client);
						}

					});

				});

			}

		}

		delete (client) {
			
			if ("undefined" === typeof client) {
				return Promise.reject("Aucun client renseigné.");
			}
				else if ("undefined" === typeof client.id) {
					return Promise.reject("Le client renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM clients WHERE id = :id;", { ":id" : client.id }, (err) => {

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

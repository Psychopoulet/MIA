
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" clients.id," +
		" clients.token," +
		" clients.name," +

		" users.id AS user_id," +
		" users.login AS user_login," +

		" status.id AS status_id," +
		" status.code AS status_code," +
		" status.name AS status_name," +
		" status.backgroundcolor AS status_backgroundcolor," +
		" status.textcolor AS status_textcolor" +

	" FROM clients" +
		" INNER JOIN users ON users.id = clients.id_user" +
		" INNER JOIN status ON status.id = clients.id_status";

	function _formateClient(client) {

		client.user = {
			id : client.user_id,
			login : client.user_login
		};

			delete client.user_id;
			delete client.user_login;

		client.status = {
			id : client.status_id,
			code : client.status_code,
			name : client.status_name,
			backgroundcolor : client.status_backgroundcolor,
			textcolor : client.status_textcolor
		};

			delete client.status_id;
			delete client.status_code;
			delete client.status_name;
			delete client.status_color;

		return client;

	}

// module

module.exports = class DBClients {

	constructor (db) {
		this.db = db;
	}

	add (client) {

		let that = this;

		return new Promise(function(resolve, reject) {

			if (!client) {
				reject("Aucun client renseigné.");
			}
			else if (!client.status) {
				reject("Aucun statut renseigné.");
			}
				else if (!client.status.id) {
					reject("Le statut renseigné n'est pas valide.");
				}
			else if (!client.user) {
				reject("Aucun utilisateur renseigné.");
			}
				else if (!client.user.id) {
					reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if (!client.token) {
				reject('Aucun token renseigné.');
			}
			else if (!client.name) {
				reject('Aucun nom renseigné.');
			}
			else {

				that.db.run("INSERT INTO clients (id_user, id_status, token, name) VALUES (:id_user, :id_status, :token, :name);", {
					':id_user': client.user.id,
					':id_status': client.status.id,
					':token': client.token,
					':name': client.name
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

	lastInserted () {

		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.get(_sSelectQuery + " ORDER BY clients.id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? _formateClient(row) : {});
				}

			});

		});

	}

	getAll () {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.all( _sSelectQuery, [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else if (!rows) {
					resolve([]);
				}
				else {

					rows.forEach(function(row, key) {
						rows[key] = _formateClient(row);
					});

					resolve(rows);

				}

			});

		});

	}

	getOneByToken (token) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(clients) {

				let stResult;

				for (let i = 0; i < clients.length; ++i) {

					if (clients[i].token === token) {
						stResult = clients[i];
						break;
					}

				}

				if (stResult) {
					resolve(stResult);
				}
				else {
					reject("Le token client '" + token + "' n'existe pas.");
				}

			})
			.catch(reject);

		});

	}

	rename (token, name) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.run("UPDATE clients SET name = :name WHERE token = :token;", { ':name': name, ':token' : token }, function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					that.getOneByToken(token).then(resolve).catch(reject);
				}

			});

		});

	}

	delete (token) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.run("DELETE FROM clients WHERE token = :token;", { ':token' : token }, function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve();
				}

			});

		});

	}

};

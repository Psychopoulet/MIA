
"use strict";

// deps

// private

	var _pInsert;

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

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS clients (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" id_user INTEGER," +
					" id_status INTEGER," +
					" token VARCHAR(100) NOT NULL UNIQUE," +
					" name VARCHAR(50) NOT NULL," +
					" FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE," +
					" FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE" +
			");", [], function(err) {

				if (err) {
					reject('(create table clients) ' + (err.message) ? err.message : err);
				}
				else {
					that.getAll().then(resolve).catch(reject);
				}

			});

		});

	}

	add (client) {

		var that = this;

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

				if (!_pInsert) {
					_pInsert = that.db.prepare("INSERT INTO clients (id_user, id_status, token, name) VALUES (:id_user, :id_status, :token, :name);");
				}

				_pInsert.run({
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

		var that = this;

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
		
		var that = this;

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
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(clients) {

				var stResult;

				for (var i = 0; i < clients.length; ++i) {

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
		
		var that = this;

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
		
		var that = this;

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

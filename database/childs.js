
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" childs.id," +
		" childs.token," +
		" childs.name," +

		" status.id AS status_id," +
		" status.code AS status_code," +
		" status.name AS status_name," +
		" status.backgroundcolor AS status_backgroundcolor," +
		" status.textcolor AS status_textcolor" +

	" FROM childs" +
		" INNER JOIN status ON status.id = childs.id_status";

	function _formateChild(child) {

		child.status = {
			id : child.status_id,
			code : child.status_code,
			name : child.status_name,
			backgroundcolor : child.status_backgroundcolor,
			textcolor : child.status_textcolor
		};

			delete child.status_id;
			delete child.status_code;
			delete child.status_name;
			delete child.status_backgroundcolor;
			delete child.status_textcolor;

		return child;

	}

// module

module.exports = class DBChilds {

	constructor (db) {
		this.db = db;
	}

	add (child) {

		let that = this;

		return new Promise(function(resolve, reject) {

			if (!child) {
				reject("Aucun enfant renseigné.");
			}
			else if (!child.status) {
				reject("Aucun statut renseigné.");
			}
				else if (!child.status.id) {
					reject("Le statut renseigné n'est pas valide.");
				}
			else if (!child.token) {
				reject('Aucun token renseigné.');
			}
			else if (!child.name) {
				reject('Aucun nom renseigné.');
			}
			else {

				that.db.run("INSERT INTO childs (id_status, token, name) VALUES (:id_status, :token, :name);", {
					':id_status': child.status.id,
					':token': child.token,
					':name': child.name
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

			that.db.get(_sSelectQuery + " ORDER BY childs.id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? _formateChild(row) : {});
				}

			});

		});

	}

	getAll () {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.all(_sSelectQuery, [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else if (!rows) {
					resolve([]);
				}
				else {

					rows.forEach(function(row, key) {
						rows[key] = _formateChild(row);
					});

					resolve(rows);

				}

			});

		});

	}

	getOneByToken (token) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(childs) {

				let stResult;

				for (let i = 0; i < childs.length; ++i) {

					if (childs[i].token === token) {
						stResult = childs[i];
						break;
					}

				}

				if (stResult) {
					resolve(stResult);
				}
				else {
					reject("Le token enfant '" + token + "' n'existe pas.");
				}

			})
			.catch(reject);

		});

	}

	rename (token, name) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.run("UPDATE childs SET name = :name WHERE token = :token;", { ':name': name, ':token' : token }, function(err) {

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

			that.db.run("DELETE FROM childs WHERE token = :token;", { ':token' : token }, function(err) {

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

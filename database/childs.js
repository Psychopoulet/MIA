
"use strict";

// deps

// private

	var _pInsert;

	var _sSelectQuery = "" +
	" SELECT" +

		" childs.id," +
		" childs.token," +
		" childs.name," +

		" status.id AS status_id," +
		" status.code AS status_code," +
		" status.name AS status_name," +
		" status.color AS status_color" +

	" FROM childs" +
		" INNER JOIN status ON status.id = childs.id_status";

	function _formateChild(child) {

		child.status = {
			id : child.status_id,
			code : child.status_code,
			name : child.status_name,
			color : child.status_color
		};

			delete child.status_id;
			delete child.status_code;
			delete child.status_name;
			delete child.status_color;

		return child;

	}

// module

module.exports = class DBChilds {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS childs (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" id_status INTEGER," +
					" token VARCHAR(100) NOT NULL UNIQUE," +
					" name VARCHAR(50) NOT NULL," +
					" FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE" +
			");", [], function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					that.getAll().then(resolve).catch(reject);
				}

			});

		});

	}

	add (child) {

		var that = this;

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

				if (!_pInsert) {
					_pInsert = that.db.prepare("INSERT INTO childs (id_status, token, name) VALUES (:id_status, :token, :name);");
				}

				_pInsert.run({
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

	lastInserted() {

		var that = this;

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

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.get( _sSelectQuery, [], function(err, rows) {

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

};

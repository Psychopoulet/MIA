
"use strict";

// module

module.exports = class DBCronsActions {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS actions_crons (" +
					" id_action INTEGER NOT NULL," +
					" id_cron INTEGER NOT NULL," +
					" FOREIGN KEY(id_action) REFERENCES actions(id) ON DELETE CASCADE ON UPDATE CASCADE," +
					" FOREIGN KEY(id_cron) REFERENCES crons(id) ON DELETE CASCADE ON UPDATE CASCADE" +
			");", [], function(err) {

				if (err) {
					reject('(create table actions_crons) ' + (err.message) ? err.message : err);
				}
				else {
					that.getAll().then(resolve).catch(reject);
				}

			});

		});

	}

	/*add (action) {

		var that = this;

		return new Promise(function(resolve, reject) {

			if (!action) {
				reject('Aucune action renseignée.');
			}
			else if (!action.user) {
				reject('Aucun utilisateur renseigné.');
			}
				else if (!action.user.id) {
					reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if (!action.type) {
				reject('Aucun type renseigné.');
			}
				else if (!action.type.id) {
					reject("Le type d'action renseigné n'est pas valide.");
				}
			else if (!action.name) {
				reject('Aucun nom renseigné.');
			}
			else {

				if (!action.params) {
					action.params = '';
				}
				else if ('object' === typeof action.params) {
					action.params = JSON.stringify(action.params);
				}

				if (!_pInsert) {
					_pInsert = that.db.prepare("INSERT INTO actions (id_user, id_child, id_type, name, params) VALUES (:id_user, :id_child, :id_type, :name, :params);");
				}

				_pInsert.run({
					':id_user': action.user.id,
					':id_child': (action.child && action.child.id) ? action.child.id : null,
					':id_type': action.type.id,
					':name': action.name,
					':params': action.params
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

	}*/

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			resolve([]);

			/*that.db.all(_sSelectQuery + ";", [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else if (!rows) {
					resolve([]);
				}
				else {

					rows.forEach(function(row, key) {
						rows[key] = _formateAction(row);
					});

					resolve(rows);

				}

			});*/

		});

	}

	/*delete (action) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			if (!action) {
				reject('Aucune action renseignée.');
			}
			else if (!action.id) {
				reject("L'action renseignée est invalide.");
			}
			else {

				that.db.run("DELETE FROM actions WHERE id = :id;", { ':id' : action.id }, function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve();
					}

				});

			}

		});

	}*/

};

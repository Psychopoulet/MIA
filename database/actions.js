
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" actions.id," +
		" actions.name," +
		" actions.params," +

		" users.id AS user_id," +
		" users.login AS user_login," +

		" childs.id AS child_id," +
		" childs.token AS child_token," +
		" childs.name AS child_name," +

		" actionstypes.id AS actiontype_id," +
		" actionstypes.command AS actiontype_command," +
		" actionstypes.name AS actiontype_name" +

	" FROM actions" +
		" INNER JOIN users ON users.id = actions.id_user" +
		" INNER JOIN childs ON childs.id = actions.id_child" +
		" INNER JOIN actionstypes ON actionstypes.id = actions.id_type";

	function _formateAction(action) {

		action.user = {
			id : action.user_id,
			login : action.user_login
		};

			delete action.user_id;
			delete action.user_login;

		action.child = {
			id : action.child_id,
			token : action.child_token,
			name : action.child_name
		};

			delete action.child_id;
			delete action.child_token;
			delete action.child_name;

		action.type = {
			id : action.actiontype_id,
			command : action.actiontype_command,
			name : action.actiontype_name
		};

			delete action.actiontype_id;
			delete action.actiontype_command;
			delete action.actiontype_name;

		if ('string' === typeof action.params && '' != action.params) {
			action.params = JSON.parse(action.params);
		}

		return action;

	}

// module

module.exports = class DBActions {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS actions (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" id_user INTEGER NOT NULL," +
					" id_child INTEGER DEFAULT NULL," +
					" id_type INTEGER NOT NULL," +
					" name VARCHAR(50) NOT NULL," +
					" params VARCHAR(150) NOT NULL," +
					" FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE," +
					" FOREIGN KEY(id_child) REFERENCES childs(id) ON DELETE CASCADE ON UPDATE CASCADE," +
					" FOREIGN KEY(id_type) REFERENCES actionstypes(id) ON DELETE CASCADE ON UPDATE CASCADE" +
			");", [], function(err) {

				if (err) {
					reject('(create table actions) ' + (err.message) ? err.message : err);
				}
				else {
					that.getAll().then(resolve).catch(reject);
				}

			});

		});

	}

	add (action) {

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

				that.db.run("INSERT INTO actions (id_user, id_child, id_type, name, params) VALUES (:id_user, :id_child, :id_type, :name, :params);", {
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

	}

	lastInserted() {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.get(_sSelectQuery + " ORDER BY actions.id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? _formateAction(row) : {});
				}

			});

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.all(_sSelectQuery + ";", [], function(err, rows) {

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

			});

		});

	}

	getAllByCron(cron) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			var query;

			if (!cron) {
				reject('Aucun cron renseigné.');
			}
			else if (!cron.id) {
				reject("Le cron renseigné n'est pas valide.");
			}
			else {

				query  = _sSelectQuery;
				query += " INNER JOIN actions_crons ON actions_crons.id_action = actions.id AND actions_crons.id_cron = :id_cron;";

				that.db.all(query, { ':id_cron' : cron.id }, function(err, rows) {

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

				});

			}

		});

	}

	getOneById (id) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(actions) {

				var stResult;

				for (var i = 0; i < actions.length; ++i) {

					if (actions[i].id === id) {
						stResult = actions[i];
						break;
					}

				}

				if (stResult) {
					resolve(stResult);
				}
				else {
					reject("L'id action '" + id + "' n'existe pas.");
				}

			})
			.catch(reject);

		});

	}

	delete (action) {
		
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

	}

};

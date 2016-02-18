
"use strict";

// deps

// private

	function _formateAction(action) {

		action.user = {
			id : action.user_id,
			login : action.user_login
		};

			action.user_id = null;
			action.user_login = null;

		action.child = {
			id : action.child_id,
			name : action.child_name
		};

			action.child_id = null;
			action.child_name = null;

		action.type = {
			id : action.actiontype_id,
			name : action.actiontype_name
		};

			action.actiontype_id = null;
			action.actiontype_name = null;

		return action;

	}

	var _sSelectQuery = "" +
	" SELECT" +

		" actions.id," +
		" actions.name," +
		" actions.params," +

		" users.id AS user_id," +
		" users.login AS user_login," +

		" childs.id AS child_id," +
		" childs.name AS child_name," +

		" actionstypes.id AS actiontype_id," +
		" actionstypes.name AS actiontype_name" +

	" FROM actionstypes" +
		" INNER JOIN users ON users.id = actions.id_user" +
		" INNER JOIN childs ON childs.id = actions.id_child" +
		" INNER JOIN actionstypes ON actionstypes.id = actions.id_type";

// module

module.exports = class DBActions extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS actions (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" id_user INTEGER NOT NULL," +
						" id_child INTEGER NOT NULL," +
						" id_type INTEGER NOT NULL," +
						" name VARCHAR(50) NOT NULL," +
						" params VARCHAR(150) NOT NULL," +
						" FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE" +
						" FOREIGN KEY(id_child) REFERENCES childs(id) ON DELETE CASCADE ON UPDATE CASCADE" +
						" FOREIGN KEY(id_type) REFERENCES actionstypes(id) ON DELETE CASCADE ON UPDATE CASCADE" +
					");", [], function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve();
					}

				});

			}).catch(reject);

		});

	}

	add (action) {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				if (!action) {
					reject('Aucune action renseignée.');
				}
				else if (!action.id_user) {
					reject('Aucun utilisateur renseigné.');
				}
				else if (!action.id_child) {
					reject('Aucun enfant renseigné.');
				}
				else if (!action.id_type) {
					reject('Aucun type renseigné.');
				}
				else if (!action.name) {
					reject('Aucun nom renseigné.');
				}
				else {

					if (!action.params) {
						action.params = '';
					}

					that.db.run(
						"INSERT INTO actions (id_user, id_child, id_type, name, params) VALUES (:id_user, :id_child, :id_type, :name, :params);", {
							':id_user': action.id_user,
							':id_child': action.id_child,
							':id_type': action.id_type,
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

			}).catch(reject);

		});

	}

	lastInserted() {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.get( _sSelectQuery + " ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(_formateAction(row));
					}

				});

			}).catch(reject);

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.get( _sSelectQuery, [], function(err, row) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(row, key) {
							rows[key] = _formateAction(row);
						});

						resolve(rows);

					}

				});

			}).catch(reject);

		});

	}

};

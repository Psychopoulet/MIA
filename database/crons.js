
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" crons.id," +
		" crons.name," +
		" crons.timer," +

		" users.id AS user_id," +
		" users.login AS user_login" +

	" FROM crons" +
		" INNER JOIN users ON users.id = crons.id_user";

	function _formateCron(cron) {

		cron.user = {
			id : cron.user_id,
			login : cron.user_login
		};

			delete cron.user_id;
			delete cron.user_login;

		return cron;

	}

// module

module.exports = class DBCrons {

	constructor (db) {
		this.db = db;
	}

	add (cron) {

		let that = this;

		return new Promise(function(resolve, reject) {

			if (!cron) {
				reject('Aucun cron renseigné.');
			}
			else if (!cron.user) {
				reject('Aucun utilisateur renseigné.');
			}
				else if (!cron.user.id) {
					reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if (!cron.name) {
				reject('Aucun nom renseigné.');
			}
			else if (!cron.timer) {
				reject('Aucun timer renseigné.');
			}
			else {

				that.db.run("INSERT INTO crons (id_user, name, timer) VALUES (:id_user, :name, :timer);", {
					':id_user': cron.user.id,
					':name': cron.name,
					':timer': cron.timer
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

		let that = this;

		return new Promise(function(resolve, reject) {

			that.db.get(_sSelectQuery + " ORDER BY crons.id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? _formateCron(row) : {});
				}

			});

		});

	}

	getAll() {
		
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
						rows[key] = _formateCron(row);
					});

					resolve(rows);

				}

			});

		});

	}

	delete (cron) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			if (!cron) {
				reject('Aucune tâche plannifiée renseignée.');
			}
			else if (!cron.id) {
				reject("La tâche plannifiée renseignée est invalide.");
			}
			else {

				that.db.run("DELETE FROM crons WHERE id = :id;", { ':id' : cron.id }, function(err) {

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

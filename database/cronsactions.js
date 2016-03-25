
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

	link (cron, action) {

		var that = this;

		return new Promise(function(resolve, reject) {

			if (!cron) {
				reject('Aucune tâche plannifiée renseignée.');
			}
				else if (!cron.id) {
					reject("La tâche plannifiée renseignée est invalide.");
				}
			else if (!action) {
				reject('Aucune action renseignée.');
			}
				else if (!action.id) {
					reject("L'action renseignée est invalide.");
				}
			else {

				that.getAll().then(function(links) {

					var bFound = false;

					for (var i = 0; i < links.length; ++i) {

						if (links[i].cron.id == cron.id && links[i].action.id == action.id) {
							bFound = true;
							break;
						}

					}

					if (bFound) {
						resolve();
					}
					else {

						that.db.run("INSERT INTO actions_crons (id_action, id_cron) VALUES (:id_action, :id_cron);", {
							':id_action' : action.id,
							':id_cron' : cron.id
						}, function(err) {

							if (err) {
								reject((err.message) ? err.message : err);
							}
							else {
								resolve();
							}

						});

					}

				})
				.catch(reject);

			}

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			var sSelectQuery = "" +
			" SELECT" +

				" crons.id AS cron_id," +
				" crons.name AS cron_name," +

				" actions.id AS action_id," +
				" actions.name AS action_name" +

			" FROM actions_crons" +
				" INNER JOIN crons ON crons.id = actions_crons.id_cron" +
				" INNER JOIN actions ON actions.id = actions_crons.id_action";

			that.db.all(sSelectQuery + ";", [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else if (!rows) {
					resolve([]);
				}
				else {

					rows.forEach(function(row, key) {

						rows[key] = {
							action : {
								id : row.action_id,
								name : row.action_name
							},
							cron : {
								id : row.cron_id,
								name : row.cron_name
							}
						};

					});

					resolve(rows);

				}

			});

		});

	}

	unlink (cron, action) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			if (!cron) {
				reject('Aucune tâche plannifiée renseignée.');
			}
				else if (!cron.id) {
					reject("La tâche plannifiée renseignée est invalide.");
				}
			else if (!action) {
				reject('Aucune action renseignée.');
			}
				else if (!action.id) {
					reject("L'action renseignée est invalide.");
				}
			else {

				that.db.run("DELETE FROM actions_crons WHERE id_action = :id_action AND id_cron = :id_cron;", {
					':id_action' : action.id,
					':id_cron' : cron.id
				}, function(err) {

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

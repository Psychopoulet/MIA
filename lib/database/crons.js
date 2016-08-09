
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

// module

module.exports = class DBCrons extends require("node-scenarios").abstract {

	// formate data

		static formate(cron) {

			cron.user = {
				id : cron.user_id,
				login : cron.user_login
			};

				delete cron.user_id;
				delete cron.user_login;

			return cron;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY users.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBCrons.formate(row) : {});
					}

				});

			});

		}

		search(data) {
			
			let options = {}, query = _sSelectQuery;

			if ("undefined" !== typeof data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND crons.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.token) {
					query += " AND crons.token = :token";
					options[":token"] = data.token;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND crons.name = :name";
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
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY users.login ASC, crons.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBCrons.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (cron) {

			if ("undefined" === typeof cron) {
				return Promise.reject("Aucun cron renseigné.");
			}
			else if ("undefined" === typeof cron.user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if ("undefined" === typeof cron.user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof cron.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof cron.timer) {
				return Promise.reject("Aucun timer renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO crons (id_user, name, timer) VALUES (:id_user, :name, :timer);", {
						":id_user": cron.user.id,
						":name": cron.name,
						":timer": cron.timer
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

		edit (cron) {

			if ("undefined" === typeof cron) {
				return Promise.reject("Aucun cron renseigné.");
			}
			else if ("undefined" === typeof cron.id) {
				return Promise.reject("La tâche plannifiée renseignée est invalide.");
			}
			else if ("undefined" === typeof cron.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof cron.timer) {
				return Promise.reject("Aucun timer renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE crons SET name = :name, timer = :timer WHERE id = :id;", {
						":id": cron.id,
						":name": cron.name,
						":timer": cron.timer
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(cron);
						}

					});

				});

			}

		}

		delete (cron) {
			
			if ("undefined" === typeof cron) {
				return Promise.reject("Aucune tâche plannifiée renseignée.");
			}
			else if ("undefined" === typeof cron.id) {
				return Promise.reject("La tâche plannifiée renseignée est invalide.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM crons WHERE id = :id;", { ":id" : cron.id }, (err) => {

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

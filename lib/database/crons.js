
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" crons.id," +
		" crons.code," +
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

			let timerArray = cron.timer.split(" ");

			cron.timer = {
				second : timerArray[0],
				minute : timerArray[1],
				hour : timerArray[2],
				monthday : timerArray[3],
				month : timerArray[4],
				weekday : timerArray[5]
			};

			return cron;

		}

		cronToTimerString(cron) {

			return	cron.timer.second + " " + cron.timer.minute + " " + cron.timer.hour + " " +
					cron.timer.monthday + " " + cron.timer.month + " " + cron.timer.weekday;

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
			
			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null != data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND crons.id = :id";
						options[":id"] = data.id;
					}
					else if (data.code) {
						query += " AND crons.code = :code";
						options[":code"] = data.code;
					}
					else {

						if (data.name) {
							query += " AND crons.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.user && null != data.user) {

							if (data.user.id) {
								query += " AND users.id = :users_id";
								options[":users_id"] = data.user.id;
							}
							else if (data.user.login) {
								query += " AND users.login = :users_login";
								options[":users_login"] = data.user.login;
							}
							else {

								if (data.user.email) {
									query += " AND users.email = :users_email";
									options[":users_email"] = data.user.email;
								}
							
							}
							
						}

					}
					
				}

				this.db.all(query + " ORDER BY users.login ASC, crons.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBCrons.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
			});

		}

	// write

		add (cron) {

				console.log(cron);

			if (!cron) {
				return Promise.reject("Aucun cron renseigné.");
			}
			else if (!cron.user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if (!cron.user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if (!cron.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!cron.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!cron.timer) {
				return Promise.reject("Aucun timer renseigné.");
			}
				else if (!cron.timer.second) {
					return Promise.reject("Aucun timer.second renseigné.");
				}
				else if (!cron.timer.second) {
					return Promise.reject("Aucun timer.minute renseigné.");
				}
				else if (!cron.timer.hour) {
					return Promise.reject("Aucun timer.hour renseigné.");
				}
				else if (!cron.timer.monthday) {
					return Promise.reject("Aucun timer.monthday renseigné.");
				}
				else if (!cron.timer.month) {
					return Promise.reject("Aucun timer.month renseigné.");
				}
				else if (!cron.timer.weekday) {
					return Promise.reject("Aucun timer.weekday renseigné.");
				}
			else {

				console.log(cron);

				return new Promise((resolve, reject) => {

					console.log(cron);

					this.db.run("INSERT INTO crons (id_user, code, name, timer) VALUES (:id_user, :code, :name, :timer);", {
						":id_user": cron.user.id,
						":code": cron.code,
						":name": cron.name,
						":timer": this.cronToTimerString(cron)
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

			if (!cron) {
				return Promise.reject("Aucun cron renseigné.");
			}
			else if (!cron.id) {
				return Promise.reject("La tâche plannifiée renseignée est invalide.");
			}
			else if (!cron.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!cron.timer) {
				return Promise.reject("Aucun timer renseigné.");
			}
				else if (!cron.timer.second) {
					return Promise.reject("Aucun timer.second renseigné.");
				}
				else if (!cron.timer.second) {
					return Promise.reject("Aucun timer.minute renseigné.");
				}
				else if (!cron.timer.hour) {
					return Promise.reject("Aucun timer.hour renseigné.");
				}
				else if (!cron.timer.monthday) {
					return Promise.reject("Aucun timer.monthday renseigné.");
				}
				else if (!cron.timer.month) {
					return Promise.reject("Aucun timer.month renseigné.");
				}
				else if (!cron.timer.weekday) {
					return Promise.reject("Aucun timer.weekday renseigné.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE crons SET name = :name, timer = :timer WHERE id = :id;", {
						":id": cron.id,
						":name": cron.name,
						":timer": this.cronToTimerString(cron)
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
			
			if (!cron) {
				return Promise.reject("Aucune tâche plannifiée renseignée.");
			}
			else if (!cron.id) {
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

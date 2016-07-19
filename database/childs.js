
"use strict";

// deps

	const DBStatus = require(require("path").join(__dirname, "status.js"));

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

// module

module.exports = class DBChilds extends require("node-scenarios").abstract {

	// formate data

		static formate(child) {

			child.status = DBStatus.formate({
				id : child.status_id,
				code : child.status_code,
				name : child.status_name,
				backgroundcolor : child.status_backgroundcolor,
				textcolor : child.status_textcolor
			});

				delete child.status_id;
				delete child.status_code;
				delete child.status_name;
				delete child.status_backgroundcolor;
				delete child.status_textcolor;

			return child;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY childs.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBChilds.formate(row) : {});
					}

				});

			});

		}

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if (data) {

				query += " WHERE 1 = 1";

				if (data.id) {
					query += " AND childs.id = :id";
					options[":id"] = data.id;
				}
				if (data.token) {
					query += " AND childs.token = :token";
					options[":token"] = data.token;
				}
				if (data.name) {
					query += " AND childs.name = :name";
					options[":name"] = data.name;
				}

				if (data.status) {

					if (data.status.id) {
						query += " AND status.id = :status_id";
						options[":status_id"] = data.status.id;
					}
					if (data.status.code) {
						query += " AND status.code = :status_code";
						options[":status_code"] = data.status.code;
					}
					if (data.status.name) {
						query += " AND status.name = :status_name";
						options[":status_name"] = data.status.name;
					}

					if (data.status.colors) {

						if (data.status.colors.background) {
							query += " AND status.backgroundcolor = :status_backgroundcolor";
							options[":status_backgroundcolor"] = data.status.colors.background;
						}
						if (data.status.colors.text) {
							query += " AND status.textcolor = :status_textcolor";
							options[":status_textcolor"] = data.status.colors.text;
						}

					}
					
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(_sSelectQuery + " ORDER BY status.name ASC, childs.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBChilds.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (child) {

			if (!child) {
				return Promise.reject("Aucun enfant renseigné.");
			}
			else if (!child.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!child.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if (!child.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if (!child.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO childs (id_status, token, name) VALUES (:id_status, :token, :name);", {
						":id_status": child.status.id,
						":token": child.token,
						":name": child.name
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

		edit (child) {

			if (!child) {
				return Promise.reject("Aucun enfant renseigné.");
			}
				else if (!child.id) {
					return Promise.reject("L'enfant renseigné n'est pas valide.");
				}
			else if (!child.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!child.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if (!child.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if (!child.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE childs SET id_status = :id_status, name = :name WHERE id = :id;", {
						":id": child.id,
						":id_status": child.status.id,
						":name": child.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(child);
						}

					});

				});

			}

		}

		delete (child) {

			if (!child) {
				return Promise.reject("Aucun enfant renseigné.");
			}
				else if (!child.id) {
					return Promise.reject("L'enfant renseigné n'est pas valide.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM childs WHERE id = :id;", { ":id" : child.id }, (err) => {

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

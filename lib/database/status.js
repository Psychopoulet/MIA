
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" status.id," +
		" status.code," +
		" status.name," +
		" status.color_background," +
		" status.color_text" +

	" FROM status";

// module

module.exports = class DBStatus extends require("node-scenarios").abstract {

	// formate data

		static formate(status) {

			status.colors = {
				background : status.color_background,
				text : status.color_text
			};

				delete status.color_background;
				delete status.color_text;

			return status;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY status.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBStatus.formate(row) : {});
					}

				});

			});

		}

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if ("undefined" !== typeof data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND status.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.code) {
					query += " AND status.code = :code";
					options[":code"] = data.code;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND status.name = :name";
					options[":name"] = data.name;
				}

				if ("undefined" !== typeof data.colors) {

					if ("undefined" !== typeof data.colors.background) {
						query += " AND status.color_background = :color_background";
						options[":color_background"] = data.colors.background;
					}
					if ("undefined" !== typeof data.colors.text) {
						query += " AND status.color_text = :color_text";
						options[":color_text"] = data.colors.text;
					}

				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY status.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBStatus.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (status) {

			if ("undefined" === typeof status) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
			else if ("undefined" === typeof status.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if ("undefined" === typeof status.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof status.colors) {
				return Promise.reject("Aucune couleur renseignée.");
			}
				else if ("undefined" === typeof status.colors.background) {
					return Promise.reject("Aucune couleur de fond renseignée.");
				}
				else if ("undefined" === typeof status.colors.text) {
					return Promise.reject("Aucune couleur de texte renseignée.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO status (code, name, color_background, color_text) VALUES (:code, :name, :color_background, :color_text);", {
						":code": status.code,
						":name": status.name,
						":color_background": status.colors.background,
						":color_text": status.colors.text
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

		edit (status) {

			if ("undefined" === typeof status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof status.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if ("undefined" === typeof status.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof status.colors) {
				return Promise.reject("Aucune couleur renseignée.");
			}
				else if ("undefined" === typeof status.colors.background) {
					return Promise.reject("Aucune couleur de fond renseignée.");
				}
				else if ("undefined" === typeof status.colors.text) {
					return Promise.reject("Aucune couleur de texte renseignée.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE status SET code = :code, name = :name, color_background = :color_background, color_text = :color_text WHERE id = :id;", {
						":id": status.id,
						":code": status.code,
						":color_background": status.colors.background,
						":color_text": status.colors.text
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(status);
						}

					});

				});

			}

		}

		delete (status) {

			if ("undefined" === typeof status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM childs WHERE id = :id;", { ":id" : status.id }, (err) => {

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


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
						reject(err);
					}
					else {
						resolve((row) ? DBStatus.formate(row) : null);
					}

				});

			});

		}

		search (data) {
			
			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null != data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND status.id = :id";
						options[":id"] = data.id;
					}
					else if (data.code) {
						query += " AND status.code = :code";
						options[":code"] = data.code;
					}
					else {

						if (data.name) {
							query += " AND status.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.colors && null != data.colors) {

							if (data.colors.background) {
								query += " AND status.color_background = :color_background";
								options[":color_background"] = data.colors.background;
							}
							if (data.colors.text) {
								query += " AND status.color_text = :color_text";
								options[":color_text"] = data.colors.text;
							}

						}
					
					}
					
				}

				this.db.all(query + " ORDER BY status.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBStatus.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject(err);
			});

		}

	// write

		add (status) {

			if (!status) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
			else if (!status.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!status.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!status.colors) {
				return Promise.reject("Aucune couleur renseignée.");
			}
				else if (!status.colors.background) {
					return Promise.reject("Aucune couleur de fond renseignée.");
				}
				else if (!status.colors.text) {
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
							reject(err);
						}
						else {
							this.last().then(resolve).catch(reject);
						}

					});

				});

			}

		}

		edit (status) {

			if (!status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if (!status.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!status.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!status.colors) {
				return Promise.reject("Aucune couleur renseignée.");
			}
				else if (!status.colors.background) {
					return Promise.reject("Aucune couleur de fond renseignée.");
				}
				else if (!status.colors.text) {
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
							reject(err);
						}
						else {
							resolve(status);
						}

					});

				});

			}

		}

		delete (status) {

			if (!status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM childs WHERE id = :id;", { ":id" : status.id }, (err) => {

						if (err) {
							reject(err);
						}
						else {
							resolve();
						}

					});

				});

			}
			
		}

};

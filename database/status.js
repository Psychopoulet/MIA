
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" status.id," +
		" status.code," +
		" status.name," +
		" status.backgroundcolor," +
		" status.textcolor" +

	" FROM status";

// module

module.exports = class DBStatus extends require("node-scenarios").abstract {

	// formate data

		static formate(status) {

			status.colors = {
				background : status.backgroundcolor,
				text : status.textcolor
			};

				delete status.backgroundcolor;
				delete status.textcolor;

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

			if (data) {

				query += " WHERE 1 = 1";

				if (data.id) {
					query += " AND status.id = :id";
					options[":id"] = data.id;
				}
				if (data.code) {
					query += " AND status.code = :code";
					options[":code"] = data.code;
				}
				if (data.name) {
					query += " AND status.name = :name";
					options[":name"] = data.name;
				}

				if (data.colors) {

					if (data.colors.background) {
						query += " AND status.backgroundcolor = :backgroundcolor";
						options[":backgroundcolor"] = data.colors.background;
					}
					if (data.colors.text) {
						query += " AND status.textcolor = :textcolor";
						options[":textcolor"] = data.colors.text;
					}

				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(_sSelectQuery + " ORDER BY status.name ASC;", options, (err, rows) => {

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

					this.db.run("INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES (:code, :name, :backgroundcolor, :textcolor);", {
						":code": status.code,
						":name": status.name,
						":backgroundcolor": status.colors.background,
						":textcolor": status.colors.text
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

					this.db.run("UPDATE status SET code = :code, name = :name, backgroundcolor = :backgroundcolor, textcolor = :textcolor WHERE id = :id;", {
						":id": status.id,
						":code": status.code,
						":backgroundcolor": status.colors.background,
						":textcolor": status.colors.text
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

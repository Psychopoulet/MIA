
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" devices_functions.id," +
		" devices_functions.code," +
		" devices_functions.name," +
		" devices_functions.icon" +

	" FROM devices_functions";

// module

module.exports = class DBDevicesFunctions extends require("node-scenarios").abstract {

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY devices_functions.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBDevicesFunctions.formate(row) : {});
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
						query += " AND devices_functions.id = :id";
						options[":id"] = data.id;
					}
					else if (data.code) {
						query += " AND devices_functions.code = :code";
						options[":code"] = data.code;
					}
					else {

						if (data.name) {
							query += " AND devices_functions.name = :name";
							options[":name"] = data.name;
						}
						if (data.icon) {
							query += " AND devices_functions.icon = :icon";
							options[":icon"] = data.icon;
						}

					}
						
				}

				this.db.all(query + " ORDER BY devices_functions.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBDevicesFunctions.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
			});

		}

	// write

		add (devicefunction) {

			if (!devicefunction) {
				return Promise.reject("Aucune fonction de périphérique renseignée.");
			}
			else if (!devicefunction.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!devicefunction.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!devicefunction.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO devices_functions (code, name, icon) VALUES (:code, :name, :icon);", {
						":code": devicefunction.code,
						":name": devicefunction.name,
						":icon": devicefunction.icon
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

		edit (devicefunction) {

			if (!devicefunction) {
				return Promise.reject("Aucune fonction de périphérique renseignée.");
			}
				else if (!devicefunction.id) {
					return Promise.reject("La fonction de périphérique renseignée est invalide.");
				}
			else if (!devicefunction.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!devicefunction.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!devicefunction.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE devices_functions SET code = :code, name = :name, icon = :icon WHERE id = :id;", {
						":code": devicefunction.code,
						":name": devicefunction.name,
						":icon": devicefunction.icon,
						":id": devicefunction.id
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

		delete (devicefunction) {
			
			if (!devicefunction) {
				return Promise.reject("Aucune fonction de périphérique renseignée.");
			}
				else if (!devicefunction.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM devices_functions WHERE id = :id;", { ":id" : devicefunction.id }, (err) => {

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

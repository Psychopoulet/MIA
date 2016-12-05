
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" controllers_functions.id," +
		" controllers_functions.code," +
		" controllers_functions.name," +
		" controllers_functions.icon" +

	" FROM controllers_functions";

// module

module.exports = class DBControllersFunctions extends require("node-scenarios").abstract {

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY controllers_functions.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject(err);
					}
					else {
						resolve((row) ? DBControllersFunctions.formate(row) : null);
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
						query += " AND controllers_functions.id = :id";
						options[":id"] = data.id;
					}
					else if (data.code) {
						query += " AND controllers_functions.code = :code";
						options[":code"] = data.code;
					}
					else {

						if (data.name) {
							query += " AND controllers_functions.name = :name";
							options[":name"] = data.name;
						}
						if (data.icon) {
							query += " AND controllers_functions.icon = :icon";
							options[":icon"] = data.icon;
						}

					}
						
				}

				this.db.all(query + " ORDER BY controllers_functions.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBControllersFunctions.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject(err);
			});

		}

	// write

		add (controllerfunction) {

			if (!controllerfunction) {
				return Promise.reject("Aucune fonction de contrôler renseignée.");
			}
			else if (!controllerfunction.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!controllerfunction.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!controllerfunction.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO controllers_functions (code, name, icon) VALUES (:code, :name, :icon);", {
						":code": controllerfunction.code,
						":name": controllerfunction.name,
						":icon": controllerfunction.icon
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

		edit (controllerfunction) {

			if (!controllerfunction) {
				return Promise.reject("Aucune fonction de contrôleur renseignée.");
			}
				else if (!controllerfunction.id) {
					return Promise.reject("La fonction de contrôleur renseignée est invalide.");
				}
			else if (!controllerfunction.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!controllerfunction.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!controllerfunction.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE controllers_functions SET code = :code, name = :name, icon = :icon WHERE id = :id;", {
						":code": controllerfunction.code,
						":name": controllerfunction.name,
						":icon": controllerfunction.icon,
						":id": controllerfunction.id
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

		delete (controllerfunction) {
			
			if (!controllerfunction) {
				return Promise.reject("Aucune fonction de contrôleur renseignée.");
			}
				else if (!controllerfunction.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM controllers_functions WHERE id = :id;", { ":id" : controllerfunction.id }, (err) => {

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

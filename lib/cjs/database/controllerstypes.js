
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" controllers_types.id," +
		" controllers_types.code," +
		" controllers_types.name," +
		" controllers_types.icon," +

			" controllers_functions.id AS controllers_functions_id," +
			" controllers_functions.code AS controllers_functions_code," +
			" controllers_functions.name AS controllers_functions_name," +
			" controllers_functions.icon AS controllers_functions_icon" +

	" FROM controllers_types" +
		" INNER JOIN controllers_functions ON controllers_functions.id = controllers_types.id_function";

// module

module.exports = class DBControllersTypes extends require("node-scenarios").abstract {

	// formate data

		static formate(controllertype) {

			controllertype.function = {
				id : controllertype.controllers_functions_id,
				code : controllertype.controllers_functions_code,
				name : controllertype.controllers_functions_name,
				icon : controllertype.controllers_functions_icon
			};

				delete controllertype.controllers_functions_id;
				delete controllertype.controllers_functions_code;
				delete controllertype.controllers_functions_name;
				delete controllertype.controllers_functions_icon;

			return controllertype;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY controllers_types.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject(err);
					}
					else {
						resolve((row) ? DBControllersTypes.formate(row) : null);
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
						query += " AND controllers_types.id = :id";
						options[":id"] = data.id;
					}
					else if (data.code) {
						query += " AND controllers_types.code = :code";
						options[":code"] = data.code;
					}
					else {

						if (data.name) {
							query += " AND controllers_types.name = :name";
							options[":name"] = data.name;
						}
						if (data.icon) {
							query += " AND controllers_types.icon = :icon";
							options[":icon"] = data.icon;
						}
							
						if ("object" === typeof data.function && null != data.function) {

							if (data.function.id) {
								query += " AND controllers_functions.id = :function_id";
								options[":function_id"] = data.function.id;
							}
							else if (data.function.code) {
								query += " AND controllers_functions.login = :function_code";
								options[":function_code"] = data.function.code;
							}
							else {

								if (data.function.name) {
									query += " AND controllers_functions.name = :function_name";
									options[":function_name"] = data.function.name;
								}
								if (data.function.icon) {
									query += " AND controllers_functions.icon = :function_icon";
									options[":function_icon"] = data.function.icon;
								}
							
							}

						}

					}
					
				}

				this.db.all(query + " ORDER BY controllers_functions.name ASC, controllers_types.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBControllersTypes.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject(err);
			});

		}

	// write

		add (controllertype) {

			if (!controllertype) {
				return Promise.reject("Aucun type de contrôleur renseigné.");
			}
			else if (!controllertype.function) {
				return Promise.reject("Aucune fonction de contrôleur renseignée.");
			}
				else if (!controllertype.function.id) {
					return Promise.reject("La fonction de contrôleur renseignée n'est pas valide.");
				}
			else if (!controllertype.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!controllertype.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!controllertype.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO controllers_types (id_function, code, name, icon) VALUES (:id_function, :code, :name, :icon);", {
						":id_function": controllertype.function.id,
						":code": controllertype.code,
						":name": controllertype.name,
						":icon": controllertype.icon
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

		edit (controllertype) {

			if (!controllertype) {
				return Promise.reject("Aucun type de contrôleur renseigné.");
			}
				else if (!controllertype.id) {
					return Promise.reject("Le type de contrôleur renseigné est invalide.");
				}
			else if (!controllertype.function) {
				return Promise.reject("Aucune fonction de contrôleur renseignée.");
			}
				else if (!controllertype.function.id) {
					return Promise.reject("La fonction de contrôleur renseignée n'est pas valide.");
				}
			else if (!controllertype.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if (!controllertype.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if (!controllertype.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE controllers_types SET id_function = :id_function, name = :name, icon = :icon WHERE id = :id;", {
						":id_function": controllertype.function.id,
						":code": controllertype.code,
						":name": controllertype.name,
						":icon": controllertype.icon,
						":id": controllertype.id
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

		delete (controllertype) {
			
			if (!controllertype) {
				return Promise.reject("Aucun type de contrôleur renseigné.");
			}
				else if (!controllertype.id) {
					return Promise.reject("Le type de contrôleur renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM controllers_types WHERE id = :id;", { ":id" : controllertype.id }, (err) => {

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


"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" devices_types.id," +
		" devices_types.code," +
		" devices_types.name," +
		" devices_types.icon," +

			" devices_functions.id AS devices_functions_id," +
			" devices_functions.code AS devices_functions_code," +
			" devices_functions.name AS devices_functions_name," +
			" devices_functions.icon AS devices_functions_icon" +

	" FROM devices_types" +
		" INNER JOIN devices_functions ON devices_functions.id = devices_types.id_function";

// module

module.exports = class DBDevicesTypes extends require("node-scenarios").abstract {

	// formate data

		static formate(devicetype) {

			devicetype.function = {
				id : devicetype.devices_functions_id,
				code : devicetype.devices_functions_code,
				name : devicetype.devices_functions_name,
				icon : devicetype.devices_functions_icon
			};

				delete devicetype.devices_functions_id;
				delete devicetype.devices_functions_code;
				delete devicetype.devices_functions_name;
				delete devicetype.devices_functions_icon;

			return devicetype;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY devices_types.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBDevicesTypes.formate(row) : {});
					}

				});

			});

		}

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if ("undefined" !== typeof data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND devices_types.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.code) {
					query += " AND devices_types.code = :code";
					options[":code"] = data.code;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND devices_types.name = :name";
					options[":name"] = data.name;
				}
				if ("undefined" !== typeof data.icon) {
					query += " AND devices_types.icon = :icon";
					options[":icon"] = data.icon;
				}
					
				if ("undefined" !== typeof data.function) {

					if ("undefined" !== typeof data.function.id) {
						query += " AND devices_functions.id = :function_id";
						options[":function_id"] = data.function.id;
					}
					if ("undefined" !== typeof data.function.login) {
						query += " AND devices_functions.login = :function_code";
						options[":function_code"] = data.function.login;
					}
					if ("undefined" !== typeof data.function.name) {
						query += " AND devices_functions.name = :function_name";
						options[":function_name"] = data.function.name;
					}
					if ("undefined" !== typeof data.function.icon) {
						query += " AND devices_functions.icon = :function_icon";
						options[":function_icon"] = data.function.icon;
					}
					
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY devices_functions.name ASC, devices_types.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBDevicesTypes.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (devicetype) {

			if ("undefined" === typeof devicetype) {
				return Promise.reject("Aucun type de périphérique renseigné.");
			}
			else if ("undefined" === typeof devicetype.function) {
				return Promise.reject("Aucune fonction de périphérique renseignée.");
			}
				else if ("undefined" === typeof devicetype.function.id) {
					return Promise.reject("La fonction de périphérique renseignée n'est pas valide.");
				}
			else if ("undefined" === typeof devicetype.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if ("undefined" === typeof devicetype.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof devicetype.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO devices_types (id_function, code, name, icon) VALUES (:id_function, :code, :name, :icon);", {
						":id_function": devicetype.function.id,
						":code": devicetype.code,
						":name": devicetype.name,
						":icon": devicetype.icon
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

		edit (devicetype) {

			if ("undefined" === typeof devicetype) {
				return Promise.reject("Aucun type de périphérique renseigné.");
			}
				else if ("undefined" === typeof devicetype.id) {
					return Promise.reject("Le type de périphérique renseigné est invalide.");
				}
			else if ("undefined" === typeof devicetype.function) {
				return Promise.reject("Aucune fonction de périphérique renseignée.");
			}
				else if ("undefined" === typeof devicetype.function.id) {
					return Promise.reject("La fonction de périphérique renseignée n'est pas valide.");
				}
			else if ("undefined" === typeof devicetype.code) {
				return Promise.reject("Aucun code renseigné.");
			}
			else if ("undefined" === typeof devicetype.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else if ("undefined" === typeof devicetype.icon) {
				return Promise.reject("Aucune icone renseignée.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE devices_types SET id_function = :id_function, name = :name, icon = :icon WHERE id = :id;", {
						":id_function": devicetype.function.id,
						":code": devicetype.code,
						":name": devicetype.name,
						":icon": devicetype.icon,
						":id": devicetype.id
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

		delete (devicetype) {
			
			if ("undefined" === typeof devicetype) {
				return Promise.reject("Aucun type de périphérique renseigné.");
			}
				else if ("undefined" === typeof devicetype.id) {
					return Promise.reject("Le type de périphérique renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM devices_types WHERE id = :id;", { ":id" : devicetype.id }, (err) => {

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

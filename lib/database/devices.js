
"use strict";

// deps

	const	DBStatus = require(require("path").join(__dirname, "status.js")),
			DBUsers = require(require("path").join(__dirname, "users.js"));

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" devices.id," +
		" devices.token," +
		" devices.name," +

			" devices_types.id AS devices_types_id," +
			" devices_types.name AS devices_types_name," +
			" devices_types.icon AS devices_types_icon," +

				" devices_functions.id AS devices_functions_id," +
				" devices_functions.name AS devices_functions_name," +
				" devices_functions.color_background AS devices_functions_color_background," +
				" devices_functions.color_text AS devices_functions_color_text," +

			" users.id AS user_id," +
			" users.login AS user_login," +
			" users.email AS user_email," +

			" status.id AS status_id," +
			" status.code AS status_code," +
			" status.name AS status_name," +
			" status.color_background AS status_color_background," +
			" status.color_text AS status_textcolor" +

	" FROM devices" +
		" INNER JOIN devices_types ON devices_types.id = devices.id_type" +
			" INNER JOIN devices_functions ON devices_functions.id = devices_types.id_function" +
		" INNER JOIN users ON users.id = devices.id_user" +
		" INNER JOIN status ON status.id = devices.id_status";

// module

module.exports = class DBDevices extends require("node-scenarios").abstract {

	// formate data

		static formate(device) {

			device.type = {
				id : device.devices_types_id,
				name : device.devices_types_name,
				icon : device.devices_types_icon
			};

				delete device.devices_types_id;
				delete device.devices_types_name;
				delete device.devices_types_icon;

			device.function = {
				id : device.devices_functions_id,
				name : device.devices_functions_name,
				color: {
					background : device.devices_functions_color_background,
					text : device.devices_functions_color_text
				}
			};

				delete device.devices_functions_id;
				delete device.devices_functions_name;
				delete device.devices_functions_color_background;
				delete device.devices_functions_color_text;

			device.user = DBUsers.formate({
				id : device.user_id,
				login : device.user_login,
				email : device.user_email
			});

				delete device.user_id;
				delete device.user_login;
				delete device.user_email;

			device.status = DBStatus.formate({
				id : device.status_id,
				code : device.status_code,
				name : device.status_name,
				color_background : device.status_color_background,
				color_text : device.status_textcolor
			});

				delete device.status_id;
				delete device.status_code;
				delete device.status_name;
				delete device.status_color_background;
				delete device.status_textcolor;

			return device;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY devices.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBDevices.formate(row) : {});
					}

				});

			});

		}

		search (data) {
			
			let options = {}, query = _sSelectQuery;

			if (data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND devices.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.token) {
					query += " AND devices.token = :token";
					options[":token"] = data.token;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND devices.name = :name";
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
				
				if ("undefined" !== typeof data.status) {

					if ("undefined" !== typeof data.status.id) {
						query += " AND status.id = :status_id";
						options[":status_id"] = data.status.id;
					}
					if ("undefined" !== typeof data.status.code) {
						query += " AND status.code = :status_code";
						options[":status_code"] = data.status.code;
					}
					if ("undefined" !== typeof data.status.name) {
						query += " AND status.name = :status_name";
						options[":status_name"] = data.status.name;
					}

					if ("undefined" !== typeof data.status.colors) {

						if ("undefined" !== typeof data.status.colors.background) {
							query += " AND status.color_background = :status_color_background";
							options[":status_color_background"] = data.status.colors.background;
						}
						if ("undefined" !== typeof data.status.colors.text) {
							query += " AND status.color_text = :status_textcolor";
							options[":status_textcolor"] = data.status.colors.text;
						}

					}
					
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY users.login ASC, status.name ASC, devices.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBDevices.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (device) {

			if ("undefined" === typeof device) {
				return Promise.reject("Aucun device renseigné.");
			}
			else if ("undefined" === typeof device.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof device.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof device.user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if ("undefined" === typeof device.user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof device.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if ("undefined" === typeof device.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO devices (id_user, id_status, token, name) VALUES (:id_user, :id_status, :token, :name);", {
						":id_user": device.user.id,
						":id_status": device.status.id,
						":token": device.token,
						":name": device.name
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

		edit (device) {

			if ("undefined" === typeof device) {
				return Promise.reject("Aucun device renseigné.");
			}
				else if ("undefined" === typeof device.id) {
					return Promise.reject("Le device renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof device.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if ("undefined" === typeof device.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof device.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if ("undefined" === typeof device.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE devices SET id_status = :id_status, name = :name WHERE id = :id;", {
						":id": device.id,
						":id_status": device.status.id,
						":name": device.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(device);
						}

					});

				});

			}

		}

		delete (device) {
			
			if ("undefined" === typeof device) {
				return Promise.reject("Aucun device renseigné.");
			}
				else if ("undefined" === typeof device.id) {
					return Promise.reject("Le device renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM devices WHERE id = :id;", { ":id" : device.id }, (err) => {

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

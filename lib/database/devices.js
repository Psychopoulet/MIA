
"use strict";

// deps

	const	crypto = require("crypto"),
			DBStatus = require(require("path").join(__dirname, "status.js")),
			DBUsers = require(require("path").join(__dirname, "users.js"));

// private

	var _sSelectQuery = "" +
	"SELECT" +

		" devices.id," +
		" devices.token," +
		" devices.name," +

			" devices_types.id AS devices_types_id," +
			" devices_types.code AS devices_types_code," +
			" devices_types.name AS devices_types_name," +
			" devices_types.icon AS devices_types_icon," +

				" devices_functions.id AS devices_functions_id," +
				" devices_functions.code AS devices_functions_code," +
				" devices_functions.name AS devices_functions_name," +
				" devices_functions.icon AS devices_functions_icon," +

			" users.id AS user_id," +
			" users.login AS user_login," +
			" users.email AS user_email," +

			" status.id AS status_id," +
			" status.code AS status_code," +
			" status.name AS status_name," +
			" status.color_background AS status_color_background," +
			" status.color_text AS status_color_text" +

	" FROM devices" +
		" INNER JOIN devices_types ON devices_types.id = devices.id_type" +
			" INNER JOIN devices_functions ON devices_functions.id = devices_types.id_function" +
		" INNER JOIN status ON status.id = devices.id_status" +
		" LEFT JOIN users ON users.id = devices.id_user";

// module

module.exports = class DBDevices extends require("node-scenarios").abstract {

	// formate data

		static formate(device) {

			device.function = {
				id : device.devices_functions_id,
				code : device.devices_functions_code,
				name : device.devices_functions_name,
				icon : device.devices_functions_icon
			};

				delete device.devices_functions_id;
				delete device.devices_functions_code;
				delete device.devices_functions_name;
				delete device.devices_functions_icon;

			device.status = DBStatus.formate({
				id : device.status_id,
				code : device.status_code,
				name : device.status_name,
				color_background : device.status_color_background,
				color_text : device.status_color_text
			});

				delete device.status_id;
				delete device.status_code;
				delete device.status_name;
				delete device.status_color_background;
				delete device.status_color_text;

			device.type = {
				id : device.devices_types_id,
				code : device.devices_types_code,
				name : device.devices_types_name,
				icon : device.devices_types_icon
			};

				delete device.devices_types_id;
				delete device.devices_types_code;
				delete device.devices_types_name;
				delete device.devices_types_icon;

			if (!device.user_id) {
				device.user = null;
			}
			else {

				device.user = DBUsers.formate({
					id : device.user_id,
					login : device.user_login,
					email : device.user_email
				});

			}

				delete device.user_id;
				delete device.user_login;
				delete device.user_email;

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

			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null != data) {

					query += " WHERE 1 = 1";

					if ("undefined" !== typeof data.id) {
						query += " AND devices.id = :id";
						options[":id"] = data.id;
					}
					else if ("undefined" !== typeof data.token) {
						query += " AND devices.token = :token";
						options[":token"] = data.token;
					}
					else {

						if ("undefined" !== typeof data.name) {
							query += " AND devices.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.function && null != data.function) {

							if ("undefined" !== typeof data.function.id) {
								query += " AND devices_types.id = :devices_functions_id";
								options[":devices_functions_id"] = data.function.id;
							}
							else {

								if ("undefined" !== typeof data.function.name) {
									query += " AND devices_functions.name = :devices_functions_name";
									options[":devices_functions_name"] = data.function.name;
								}
								if ("undefined" !== typeof data.function.icon) {
									query += " AND devices_functions.icon = :devices_functions_icon";
									options[":devices_functions_icon"] = data.function.icon;
								}
								
							}
							
						}
						
						if ("object" === typeof data.status && null != data.status) {

							if ("undefined" !== typeof data.status.id) {
								query += " AND status.id = :status_id";
								options[":status_id"] = data.status.id;
							}
							else if ("undefined" !== typeof data.status.code) {
								query += " AND status.code = :status_code";
								options[":status_code"] = data.status.code;
							}
							else {

								if ("undefined" !== typeof data.status.name) {
									query += " AND status.name = :status_name";
									options[":status_name"] = data.status.name;
								}

								if ("object" === typeof data.status.colors && null != data.status.colors) {

									if ("undefined" !== typeof data.status.colors.background) {
										query += " AND status.color_background = :status_color_background";
										options[":status_color_background"] = data.status.colors.background;
									}
									if ("undefined" !== typeof data.status.colors.text) {
										query += " AND status.color_text = :status_color_text";
										options[":status_color_text"] = data.status.colors.text;
									}

								}

							}
							
						}
						
						if ("object" === data.type && null != data.type) {

							if ("undefined" !== typeof data.type.id) {
								query += " AND devices_types.id = :devices_types_id";
								options[":devices_types_id"] = data.type.id;
							}
							else {

								if ("undefined" !== typeof data.type.name) {
									query += " AND devices_types.name = :devices_types_name";
									options[":devices_types_name"] = data.type.name;
								}
								if ("undefined" !== typeof data.type.icon) {
									query += " AND devices_types.icon = :devices_types_email";
									options[":devices_types_email"] = data.type.icon;
								}
								
							}

						}
						
						if ("object" === typeof data.user && null != data.user) {

							if ("undefined" !== typeof data.user.id) {
								query += " AND users.id = :users_id";
								options[":users_id"] = data.user.id;
							}
							else {

								if ("undefined" !== typeof data.user.login) {
									query += " AND users.login = :users_login";
									options[":users_login"] = data.user.login;
								}
								if ("undefined" !== typeof data.user.email) {
									query += " AND users.email = :users_email";
									options[":users_email"] = data.user.email;
								}
							
							}
							
						}
						
					}
					
				}

				this.db.all(query + " ORDER BY status.name ASC, devices_functions.name, devices.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBDevices.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
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
			else if ("undefined" === typeof device.type) {
				return Promise.reject("Aucun type renseigné.");
			}
				else if ("undefined" === typeof device.type.id) {
					return Promise.reject("Le type renseigné n'est pas valide.");
				}
			else if ("undefined" === typeof device.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO devices (id_status, id_type, id_user, token, name) VALUES (:id_status, :id_type, :id_user, :token, :name);", {
						":id_status": device.status.id,
						":id_type": device.type.id,
						":id_user": ("object" === typeof device.user && "undefined" !== typeof device.user.id) ? device.user.id : null,
						":token": crypto.createHash("sha1").update(device.status.code + device.type.code + Date.now()).digest("hex"),
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
			else if ("undefined" === typeof device.type) {
				return Promise.reject("Aucun type renseigné.");
			}
				else if ("undefined" === typeof device.type.id) {
					return Promise.reject("Le type renseigné n'est pas valide.");
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

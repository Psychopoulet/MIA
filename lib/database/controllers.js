
"use strict";

// deps

	const	crypto = require("crypto"),
			DBStatus = require(require("path").join(__dirname, "status.js")),
			DBUsers = require(require("path").join(__dirname, "users.js"));

// private

	var _sSelectQuery = "" +
	"SELECT" +

		" controllers.id," +
		" controllers.token," +
		" controllers.name," +

			" controllers_types.id AS controllers_types_id," +
			" controllers_types.code AS controllers_types_code," +
			" controllers_types.name AS controllers_types_name," +
			" controllers_types.icon AS controllers_types_icon," +

				" controllers_functions.id AS controllers_functions_id," +
				" controllers_functions.code AS controllers_functions_code," +
				" controllers_functions.name AS controllers_functions_name," +
				" controllers_functions.icon AS controllers_functions_icon," +

			" users.id AS user_id," +
			" users.login AS user_login," +
			" users.email AS user_email," +

			" status.id AS status_id," +
			" status.code AS status_code," +
			" status.name AS status_name," +
			" status.color_background AS status_color_background," +
			" status.color_text AS status_color_text" +

	" FROM controllers" +
		" INNER JOIN controllers_types ON controllers_types.id = controllers.id_type" +
			" INNER JOIN controllers_functions ON controllers_functions.id = controllers_types.id_function" +
		" INNER JOIN status ON status.id = controllers.id_status" +
		" LEFT JOIN users ON users.id = controllers.id_user";

// module

module.exports = class DBControllers extends require("node-scenarios").abstract {

	// formate data

		static formate(controller) {

			controller.function = {
				id : controller.controllers_functions_id,
				code : controller.controllers_functions_code,
				name : controller.controllers_functions_name,
				icon : controller.controllers_functions_icon
			};

				delete controller.controllers_functions_id;
				delete controller.controllers_functions_code;
				delete controller.controllers_functions_name;
				delete controller.controllers_functions_icon;

			controller.status = DBStatus.formate({
				id : controller.status_id,
				code : controller.status_code,
				name : controller.status_name,
				color_background : controller.status_color_background,
				color_text : controller.status_color_text
			});

				delete controller.status_id;
				delete controller.status_code;
				delete controller.status_name;
				delete controller.status_color_background;
				delete controller.status_color_text;

			controller.type = {
				id : controller.controllers_types_id,
				code : controller.controllers_types_code,
				name : controller.controllers_types_name,
				icon : controller.controllers_types_icon
			};

				delete controller.controllers_types_id;
				delete controller.controllers_types_code;
				delete controller.controllers_types_name;
				delete controller.controllers_types_icon;

			if (!controller.user_id) {
				controller.user = null;
			}
			else {

				controller.user = DBUsers.formate({
					id : controller.user_id,
					login : controller.user_login,
					email : controller.user_email
				});

			}

				delete controller.user_id;
				delete controller.user_login;
				delete controller.user_email;

			return controller;

		}

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY controllers.id DESC LIMIT 0,1;", [], (err, row) => {

					if (err) {
						reject(err);
					}
					else {
						resolve((row) ? DBControllers.formate(row) : null);
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
						query += " AND controllers.id = :id";
						options[":id"] = data.id;
					}
					else if (data.token) {
						query += " AND controllers.token = :token";
						options[":token"] = data.token;
					}
					else {

						if (data.name) {
							query += " AND controllers.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.function && null != data.function) {

							if (data.function.id) {
								query += " AND controllers_functions.id = :controllers_functions_id";
								options[":controllers_functions_id"] = data.function.id;
							}
							else if (data.function.code) {
								query += " AND controllers_functions.code = :controllers_functions_code";
								options[":controllers_functions_code"] = data.function.code;
							}
							else {

								if (data.function.name) {
									query += " AND controllers_functions.name = :controllers_functions_name";
									options[":controllers_functions_name"] = data.function.name;
								}
								if (data.function.icon) {
									query += " AND controllers_functions.icon = :controllers_functions_icon";
									options[":controllers_functions_icon"] = data.function.icon;
								}
								
							}
							
						}
						
						if ("object" === typeof data.status && null != data.status) {

							if (data.status.id) {
								query += " AND status.id = :status_id";
								options[":status_id"] = data.status.id;
							}
							else if (data.status.code) {
								query += " AND status.code = :status_code";
								options[":status_code"] = data.status.code;
							}
							else {

								if (data.status.name) {
									query += " AND status.name = :status_name";
									options[":status_name"] = data.status.name;
								}

								if ("object" === typeof data.status.colors && null != data.status.colors) {

									if (data.status.colors.background) {
										query += " AND status.color_background = :status_color_background";
										options[":status_color_background"] = data.status.colors.background;
									}
									if (data.status.colors.text) {
										query += " AND status.color_text = :status_color_text";
										options[":status_color_text"] = data.status.colors.text;
									}

								}

							}
							
						}
						
						if ("object" === data.type && null != data.type) {

							if (data.type.id) {
								query += " AND controllers_types.id = :controllers_types_id";
								options[":controllers_types_id"] = data.type.id;
							}
							else if (data.type.code) {
								query += " AND controllers_types.code = :controllers_types_code";
								options[":controllers_types_code"] = data.type.code;
							}
							else {

								if (data.type.name) {
									query += " AND controllers_types.name = :controllers_types_name";
									options[":controllers_types_name"] = data.type.name;
								}
								if (data.type.icon) {
									query += " AND controllers_types.icon = :controllers_types_email";
									options[":controllers_types_email"] = data.type.icon;
								}
								
							}

						}
						
						if ("object" === typeof data.user && null != data.user) {

							if (data.user.id) {
								query += " AND users.id = :users_id";
								options[":users_id"] = data.user.id;
							}
							else if (data.user.login) {
								query += " AND users.login = :users_login";
								options[":users_login"] = data.user.login;
							}
							else {

								if (data.user.email) {
									query += " AND users.email = :users_email";
									options[":users_email"] = data.user.email;
								}
							
							}
							
						}
						
					}
					
				}

				this.db.all(query + " ORDER BY status.name ASC, controllers_functions.name, controllers.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {

						rows.forEach((row, key) => {
							rows[key] = DBControllers.formate(row);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject(err);
			});

		}

	// write

		add (controller) {

			if (!controller) {
				return Promise.reject("Aucun controller renseigné.");
			}
			else if (!controller.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!controller.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if (!controller.type) {
				return Promise.reject("Aucun type renseigné.");
			}
				else if (!controller.type.id) {
					return Promise.reject("Le type renseigné n'est pas valide.");
				}
			else if (!controller.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO controllers (id_status, id_type, id_user, token, name) VALUES (:id_status, :id_type, :id_user, :token, :name);", {
						":id_status": controller.status.id,
						":id_type": controller.type.id,
						":id_user": ("object" === typeof controller.user && controller.user.id) ? controller.user.id : null,
						":token": crypto.createHash("sha1").update(controller.status.code + controller.type.code + Date.now()).digest("hex"),
						":name": controller.name
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

		edit (controller) {

			if (!controller) {
				return Promise.reject("Aucun controller renseigné.");
			}
				else if (!controller.id) {
					return Promise.reject("Le controller renseigné n'est pas valide.");
				}
			else if (!controller.status) {
				return Promise.reject("Aucun statut renseigné.");
			}
				else if (!controller.status.id) {
					return Promise.reject("Le statut renseigné n'est pas valide.");
				}
			else if (!controller.type) {
				return Promise.reject("Aucun type renseigné.");
			}
				else if (!controller.type.id) {
					return Promise.reject("Le type renseigné n'est pas valide.");
				}
			else if (!controller.user) {
				return Promise.reject("Aucun utilisateur renseigné.");
			}
				else if (!controller.user.id) {
					return Promise.reject("L'utilisateur renseigné n'est pas valide.");
				}
			else if (!controller.token) {
				return Promise.reject("Aucun token renseigné.");
			}
			else if (!controller.name) {
				return Promise.reject("Aucun nom renseigné.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE controllers SET id_status = :id_status, id_type = :id_type, id_user = :id_user, name = :name WHERE id = :id;", {
						":id": controller.id,
						":id_status": controller.status.id,
						":id_type": controller.type.id,
						":id_user": controller.user.id,
						":name": controller.name
					}, (err) => {

						if (err) {
							reject(err);
						}
						else {
							resolve(controller);
						}

					});

				});

			}

		}

		delete (controller) {
			
			if (!controller) {
				return Promise.reject("Aucun controller renseigné.");
			}
				else if (!controller.id) {
					return Promise.reject("Le controller renseigné n'est pas valide.");
				}
			else {
				
				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM controllers WHERE id = :id;", { ":id" : controller.id }, (err) => {

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

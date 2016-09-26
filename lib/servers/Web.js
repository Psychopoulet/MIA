
"use strict";

// deps

	const 	os = require("os"),
			dns = require("dns"),
			path = require("path"),
			fs = require("node-promfs");

// private

	// attrs

		var _dirWeb = path.join(__dirname, "web"), _dirBuffers = path.join(_dirWeb, "public");
		
// module

module.exports = class ServerWeb {
	
	constructor (Container) {
		this.container = Container;
		this.multiserver = null;
	}

	start () {

		this.multiserver = new (require("node-multi-socketservers"))();

		return this.multiserver.addServer({
			"port": this.container.get("conf").get("ports.http"),
			"name": "server HTTP",
			"ssl": false
		}).then(() => {

			if (!this.container.get("conf").get("ssl")) {
				return Promise.resolve();
			}
			else {

				let sDirSSL = path.join(__dirname, "ssl");

				return this.container.get("openssl").createCertificate(
					path.join(sDirSSL, "server.key"),
					path.join(sDirSSL, "server.csr"),
					path.join(sDirSSL, "server.crt")
				).then((keys) => {

					return this.multiserver.addServer({
						"port": this.container.get("conf").get("ports.https"),
						"name": "server HTTPS",
						"ssl": true,
						"key": keys.privateKey,
						"cert": keys.certificate
					});

				});

			}

		}).then(() => {

			return this.generateBuffers();

		}).then(() => {

			return this.multiserver.setTimeout(2 * 1000);

		}).then(() => {

			let express = require("express"),
				app = this.container.get("servers.app")

				// security

				.use(require("helmet")())

				// compression

				.use(require("compression")())

				// static

				.use("/", express.static(path.join(_dirBuffers)))
				.use("/robots.txt", express.static(path.join(_dirWeb, "others", "robots.txt")))
				.use("/pictures", express.static(path.join(_dirWeb, "pictures")))
				.use("/libs/fonts/", express.static(path.join(_dirWeb, "libs", "font-awesome")));

				// api

				app = require(path.join(__dirname, "api", "api.js"))(this.container);

				// 404

				app.use((req, res) => {
					this.sendNotFoundHTMLResponse(req, res);
				});

				this.container.set("servers.app", app);

			return this.multiserver.listen(this.container.get("servers.app")).then(() => {

				this.multiserver.servers.forEach((server) => {
					this.container.get("logs").success("-- [" + server.options.name + "] demarre sur le port " + server.options.port);
				});

			});

		});

	}

	// API

		// sendResponse

		sendResponse(req, res, code, contentType, msg) {

			if (res.writeHead) {
				res.writeHead(code, {"Content-Type": contentType});
			}
			if (res.end) {
				res.end(msg);
			}

		}

			// HTML

			sendHTMLResponse(req, res, code, msg) {
				this.sendResponse(req, res, code, "text/html; charset=utf-8", msg);
			}

				// ok

				sendValidHTMLResponse(req, res, msg) {
					this.sendHTMLResponse(req, res, 200, msg);
				}

				// errors

				sendNotFoundHTMLResponse(req, res) {
					this.sendHTMLResponse(req, res, 404, "404 : [" + req.method + "] \"" + req.url + "\" not found");
				}

				sendInternalErrorHTMLResponse(req, res, msg) {
					this.sendHTMLResponse(req, res, 500, msg);
				}

			// JSON

			sendJSONResponse(req, res, code, msg) {
				this.sendResponse(req, res, code, "application/json; charset=utf-8", JSON.stringify(msg));
			}

				// ok

				sendValidJSONResponse(req, res, msg) {
					this.sendJSONResponse(req, res, 200, msg);
				}

				sendCreatedJSONResponse(req, res, msg) {
					this.sendJSONResponse(req, res, 201, msg);
				}

				sendDeletedJSONResponse(req, res, msg) {
					this.sendJSONResponse(req, res, 204, msg);
				}

				// errors

				sendErrorJSONResponse(req, res, code, msg) {

					if ("string" === typeof msg) {
						msg = [ { code: "unknown", message: msg } ];
					}
					else if (!(msg instanceof Array)) {
						msg = [ msg ];
					}

					this.sendJSONResponse(req, res, code, { status: code, errors: msg });
					
				}

					sendWrongRequestJSONResponse(req, res, msg) {
						this.sendErrorJSONResponse(req, res, 400, msg);
					}

					sendNotLoggedJSONResponse(req, res, msg) {
						this.sendErrorJSONResponse(req, res, 401, [ { code: "notlogged", message: msg } ]);
					}

					sendNotAllowedJSONResponse(req, res) {
						this.sendErrorJSONResponse(req, res, 403, [ { code: "notallowed", message: "Vous n'êtes pas autorisé à acceder à cette fonctionnalité" } ]);
					}

					sendNotFoundJSONResponse(req, res) {
						this.sendErrorJSONResponse(req, res, 404, [ { code: "notfound", message: "404 : [" + req.method + "] \"" + req.url + "\" not found" } ]);
					}

					sendNotAcceptableJSONResponse(req, res, msg) {
						this.sendErrorJSONResponse(req, res, 406, [ { code: "notacceptable", message: msg } ]);
					}

					sendInternalErrorJSONResponse(req, res, msg) {
						this.sendErrorJSONResponse(req, res, 500, [ { code: "internalerror", message: msg } ]);
					}

		// check

		checkAPI_accept(req, res) {

			if (!req.accepts("application/json")) {
				this.sendNotAcceptableJSONResponse(req, res, "Seul le type de requête 'application/json' est pris en charge par les API du serveur");
				return Promise.reject("Seul le type de requête 'application/json' est pris en charge par les API du serveur");
			}
			else if (!req.acceptsCharsets("utf-8")) {
				this.sendNotAcceptableJSONResponse(req, res, "Seul le type de charset 'utf-8' est pris en charge par les API du serveur");
				return Promise.reject("Seul le type de charset 'utf-8' est pris en charge par les API du serveur");
			}
			else {
				return Promise.resolve();
			}

		}

			checkAPI_token(req, res) {

				return this.checkAPI_accept(req, res).then(() => {
					
					if (!req.headers) {
						this.sendWrongRequestJSONResponse(req, res, [ { code: "authorization-01", message: "Il n'y a aucune donnée d'en-tête" } ]);
						return Promise.reject("Il n'y a aucune donnée d'en-tête");
					}
					else if ("string" !== typeof req.headers.authorization) {
						this.sendWrongRequestJSONResponse(req, res, [ { code: "authorization-02", message: "Il manque le token d'autorisation dans les données d'en-tête" } ]);
						return Promise.reject("Il manque le token d'autorisation dans les données d'en-tête");
					}
					else if ("" === req.headers.authorization.trim()) {
						this.sendWrongRequestJSONResponse(req, res, [ { code: "authorization-03", message: "Le token d'autorisation des données d'en-tête est vide" } ]);
						return Promise.reject("Le token d'autorisation des données d'en-tête est vide");
					}
					else {
						return Promise.resolve(req.headers.authorization.trim());
					}

				});

			}

				checkAPI_userAllowed(req, res) {

					return this.checkAPI_token(req, res).then((token) => {

						return new Promise((resolve, reject) => {

							this.container.get("devices").searchOne({ token: token }).then((device) => {

								if (!device) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique n'existe pas");
									reject("Le périphérique n'existe pas");
								}
								else if (!device.status || "string" !== typeof device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique n'a pas de statut");
									reject("Le périphérique n'a pas de statut");
								}
								else if ("BLOCKED" === device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique est bloqué");
									reject("Le périphérique est bloqué");
								}
								else if ("WAITING" === device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique n'a pas encore été accepté");
									reject("Le périphérique n'a pas encore été accepté");
								}
								else if ("ACCEPTED" !== device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique a un statut inconnu ('" + device.status.code + "')");
									reject("Le périphérique a un statut inconnu ('" + device.status.code + "')");
								}
								else {
									resolve(device);
								}

							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								this.container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
								this.container.get("logs").err("-- [database/devices/searchOne] " + err);

								reject(err);
									
							});

						});

					});

				}

				checkAPI_userAllowedOrWaiting(req, res) {

					return this.checkAPI_token(req, res).then((token) => {

						return new Promise((resolve, reject) => {

							this.container.get("devices").searchOne({ token: token }).then((device) => {

								if (!device) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique n'existe pas");
									reject("Le périphérique n'existe pas");
								}
								else if (!device.status || "string" !== typeof device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique n'a pas de statut");
									reject("Le périphérique n'a pas de statut");
								}
								else if ("BLOCKED" === device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique est bloqué");
									reject("Le périphérique est bloqué");
								}
								else if ("ACCEPTED" !== device.status.code && "WAITING" !== device.status.code) {
									this.sendNotLoggedJSONResponse(req, res, "Le périphérique a un statut inconnu ('" + device.status.code + "')");
									reject("Le périphérique a un statut inconnu ('" + device.status.code + "')");
								}
								else {
									resolve(device);
								}

							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								this.container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
								this.container.get("logs").err("-- [database/devices/searchOne] " + err);

								reject(err);
									
							});

						});

					});

				}

	// sockets

		connection(eventListener) {
			return this.multiserver.connection(eventListener);
		}
		
		emit(eventName, data) {
			return this.multiserver.emit(eventName, data);
		}
		
		broadcast(socket, server, eventName, data) {
			return this.multiserver.broadcast(socket, server, eventName, data);
		}
		
		removeAllListeners(eventNames) {
			return this.multiserver.removeAllListeners(eventNames);
		}
		
	generateBuffers() {

		let indexBufferFile = path.join(_dirBuffers, "index.html"),
			pluginsJavascriptsBufferFile = path.join(_dirBuffers, "js", "plugins.js"),
			designsBufferFile = path.join(_dirBuffers, "css", "designs.css"),
			javascriptsBufferFile = path.join(_dirBuffers, "js", "scripts.js");

		// on efface les vieilles versions

		return fs.rmdirpProm(_dirBuffers)

		// on recréé les dossiers

		.then(() => {
			return fs.mkdirpProm(_dirBuffers);
		}).then(() => {
			return fs.mkdirpProm(path.join(_dirBuffers, "js"));
		}).then(() => {
			return fs.mkdirpProm(path.join(_dirBuffers, "css"));
		}).then(() => {
			return fs.mkdirpProm(path.join(_dirBuffers, "libs"));
		})

		// on recréer les fichiers

		.then(() => {
			return fs.writeFileProm(indexBufferFile, "", "utf8");
		}).then(() => {
			return fs.writeFileProm(pluginsJavascriptsBufferFile, "", "utf8");
		}).then(() => {
			return fs.writeFileProm(designsBufferFile, "", "utf8");
		}).then(() => {
			return fs.writeFileProm(javascriptsBufferFile, "", "utf8");
		}).then(() => {

			// on rempli les fichiers liés aux plugins

			let plugins = this.container.get("plugins").plugins, sPluginsTemplates = "";

			function _bufferPlugin(i) {

				if (i >= plugins.length) {
					return Promise.resolve();
				}
				else {

					return fs.filesToStringProm(plugins[i].templates, "utf8", "\r\n").then((templates) => {

						sPluginsTemplates += templates
								.replace(/{{plugin.description}}/g, plugins[i].description)
								.replace(/{{plugin.github}}/g, plugins[i].github)
								.replace(/{{plugin.license}}/g, plugins[i].license)
								.replace(/{{plugin.name}}/g, plugins[i].name)
								.replace(/{{plugin.version}}/g, plugins[i].version);

						return Promise.resolve();

					}).then(() => {

						return fs.filesToStringProm(plugins[i].designs, "utf8", "\r\n").then((designs) => {
							return fs.appendFileProm(designsBufferFile, designs, "utf8");
						});

					}).then(() => {

						return fs.filesToStringProm(plugins[i].javascripts, "utf8", "\r\n").then((scripts) => {
							return fs.appendFileProm(pluginsJavascriptsBufferFile, scripts, "utf8");
						});

					}).then(() => {
						return _bufferPlugin(i+1);
					});

				}

			}

			return _bufferPlugin(0).then(() => {
				return fs.readFileProm(path.join(_dirWeb, "templates", "index.html"), "utf8");
			}).then((index) => {

				return new Promise((resolve) => {

					dns.lookup(os.hostname(), (err, ip) => {

						fs.appendFileProm(
							indexBufferFile,
							index	.replace("{{ip}}", (err) ? "?.?.?.?" : ip)
									.replace("{{pluginstemplates}}", sPluginsTemplates) + "\r\n",
							"utf8"
						).then(() => { resolve(); });

					});

				});

			});

		}).then(() => {

			// on rempli les fichiers liés au js normal

			return fs.directoryFilesToFileProm(path.join(_dirWeb, "js"), javascriptsBufferFile, "\r\n\r\n// ---- {{filename}} ----\r\n\r\n");

		}).then(() => {

			// on recopie les libs

				let dirLibs = path.join(_dirWeb, "libs"),
					dirLibPublic = path.join(_dirWeb, "public", "libs");

				// css

				return fs.copyProm(path.join(dirLibs, "bootstrap", "css", "bootstrap.min.css"), path.join(dirLibPublic, "bootstrap.css"))

				// js

				.then(() => {
					return fs.copyProm(path.join(dirLibs, "interactjs", "interact.min.js"), path.join(dirLibPublic, "interact.js"));
				}).then(() => {

					return fs.filesToFileProm(
						[
							path.join(dirLibs, "jquery", "jquery.min.js"),
							path.join(dirLibs, "bootstrap", "js", "bootstrap.min.js"),
							path.join(dirLibs, "tether", "tether.min.js")
						],
						path.join(dirLibPublic, "bootstrap.js"),
						"\r\n\r\n// ---- {{filename}} ----\r\n\r\n"
					);

				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "socketio", "socket.io.js"), path.join(dirLibPublic, "socketio.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "angularjs", "angular.min.js"), path.join(dirLibPublic, "angular.js"));
				}).then(() => {
					return fs.directoryFilesToFileProm(path.join(dirLibs, "angularjs", "modules"), path.join(dirLibPublic, "angular-modules.js"), "\r\n\r\n// ---- {{filename}} ----\r\n\r\n");
				});

		});

	}

};

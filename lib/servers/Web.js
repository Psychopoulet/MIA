
"use strict";

// deps

	const 	os = require("os"),
			dns = require("dns"),
			path = require("path"),
			fs = require("node-promfs");

// private

	// attrs

		var m_sDirWeb = path.join(__dirname, "web"), m_sDirBuffers = path.join(m_sDirWeb, "public");
			
	// methodes

		// files

			function _readAllFiles(dir) {

				return fs.readdirProm(dir).then( (files) => {

					files.forEach((file, i) => {
						files[i] = path.join(dir, file);
					});

					return fs.concatFilesProm(files, "utf8", "\r\n");

				});

			}

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

			let express = require("express"),
				app = this.container.get("servers.app")

				// compression

				.use(require("compression")())

				// static

				.use("/", express.static(path.join(m_sDirBuffers)))
				.use("/pictures", express.static(path.join(m_sDirWeb, "pictures")))
				.use("/libs/fonts/", express.static(path.join(m_sDirWeb, "libs", "font-awesome-4.5.0")));

				// api

				app = require(path.join(__dirname, "api", "api.js"))(this.container);

				// 404

				app.use((req, res) => {
					this.sendHTMLResponse(res, 404, "Not found");
				});

				this.container.set("servers.app", app);

			return this.multiserver.listen(this.container.get("servers.app")).then(() => {

				this.multiserver.servers.forEach((server) => {
					server.server.timeout = 2 * 1000;
					this.container.get("logs").success("-- [" + server.options.name + "] demarre sur le port " + server.options.port);
				});

			});

		});

	}

	sendResponse(res, code, contentType, msg) {

		if (res.writeHead) {
			res.writeHead(code, {"Content-Type": contentType});
		}
		if (res.end) {
			res.end(msg);
		}

	}

		sendHTMLResponse(res, code, msg) {
			this.sendResponse(res, code, "text/html; charset=utf-8", msg);
		}

		sendJSONResponse(res, code, msg) {
			this.sendResponse(res, code, "application/json; charset=utf-8", ("string" === typeof msg) ? msg : JSON.stringify(msg));
		}

			// ok

			sendValidJSONResponse(res, msg) {
				this.sendJSONResponse(res, 200, msg);
			}

			sendCreatedJSONResponse(res, msg) {
				this.sendJSONResponse(res, 201, msg);
			}

			sendDeletedJSONResponse(res, msg) {
				this.sendJSONResponse(res, 204, msg);
			}

			// errors

			sendWrongRequestJSONResponse(res, msg) {
				this.sendJSONResponse(res, 400, msg);
			}

			sendNotLoggedJSONResponse(res, msg) {
				this.sendJSONResponse(res, 401, msg);
			}

			sendNotAllowedJSONResponse(res, msg) {
				this.sendJSONResponse(res, 403, msg);
			}

			sendInternalErrorJSONResponse(res, msg) {
				this.sendJSONResponse(res, 500, msg);
			}

	generateBuffers() {

		let indexBufferFile = path.join(m_sDirBuffers, "index.html"),
			pluginsJavascriptsBufferFile = path.join(m_sDirBuffers, "js", "plugins.js"),
			javascriptsBufferFile = path.join(m_sDirBuffers, "js", "scripts.js");

		// on efface les vieilles versions

		return fs.rmdirpProm(m_sDirBuffers)

		// on recréé les dossiers

		.then(() => {
			return fs.mkdirpProm(m_sDirBuffers);
		}).then(() => {
			return fs.mkdirpProm(path.join(m_sDirBuffers, "js"));
		}).then(() => {
			return fs.mkdirpProm(path.join(m_sDirBuffers, "libs"));
		})

		// on recréer les fichiers

		.then(() => {
			return fs.writeFileProm(indexBufferFile, "", "utf8");
		}).then(() => {
			return fs.writeFileProm(pluginsJavascriptsBufferFile, "", "utf8");
		}).then(() => {
			return fs.writeFileProm(javascriptsBufferFile, "", "utf8");
		}).then(() => {

			// on rempli les fichiers liés aux plugins

			let plugins = this.container.get("plugins").plugins, sPluginsWidgets = "";

			function _bufferPluginWidget(plugin) {

				if (!plugin.widget) {
					return Promise.resolve("");
				}
				else {

					return fs.readFileProm(plugin.widget, "utf8").then((content) => {

						return Promise.resolve(

							content .replace(/{{plugin.name}}/g, plugin.name)
									.replace(/{{plugin.description}}/g, plugin.description)
									.replace(/{{plugin.version}}/g, plugin.version)

						);

					});

				}
				
			}

			function _bufferPlugin(i) {

				if (i >= plugins.length) {
					return Promise.resolve();
				}
				else {

					return _bufferPluginWidget(plugins[i]).then((widget) => {

						sPluginsWidgets += widget;

						if (plugins[i].javascripts && 0 < plugins[i].javascripts.length) {

							return fs.concatFilesProm(plugins[i].javascripts, "utf8", "\r\n").then((scripts) => {
								return fs.appendFileProm(pluginsJavascriptsBufferFile, scripts, "utf8");
							}).then(() => {
								return _bufferPlugin(i+1);
							});

						}
						else {
							return _bufferPlugin(i+1);
						}

					});

				}

			}

			return _bufferPlugin(0).then(() => {

				return fs.readFileProm(path.join(m_sDirWeb, "templates", "index.html"), "utf8").then( (index) => {

					return new Promise((resolve) => {

						dns.lookup(os.hostname(), (err, ip) => {

							fs.appendFileProm(
								indexBufferFile,
								index	.replace("{{ip}}", (err) ? "?.?.?.?" : ip)
										.replace("{{widgets}}", sPluginsWidgets) + "\r\n",
								"utf8"
							).then(() => { resolve(); });

						});

					});

				});

			});

		}).then(() => {

			// on rempli les fichiers liés au js normal

			return _readAllFiles(path.join(m_sDirWeb, "js")).then((data) => {
				return fs.appendFileProm(javascriptsBufferFile, data,"utf8");
			});

		}).then(() => {

			// on recopie les libs

				let dirLibs = path.join(m_sDirWeb, "libs"),
					dirLibPublic = path.join(m_sDirWeb, "public", "libs");

				// css

				return fs.copyProm(path.join(dirLibs, "bootstrap-v4", "css", "bootstrap.min.css"), path.join(dirLibPublic, "bootstrap.css"))

				// js

				.then(() => {
					return fs.copyProm(path.join(dirLibs, "tether", "tether.min.js"), path.join(dirLibPublic, "tether.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "jquery", "jquery.min.js"), path.join(dirLibPublic, "jquery.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "interactjs", "interact.min.js"), path.join(dirLibPublic, "interact.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "bootstrap-v4", "js", "bootstrap.min.js"), path.join(dirLibPublic, "bootstrap.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "socketio", "socket.io.js"), path.join(dirLibPublic, "socketio.js"));
				}).then(() => {
					return fs.copyProm(path.join(dirLibs, "angularjs", "angular.min.js"), path.join(dirLibPublic, "angular.js"));
				}).then(() => {

					return _readAllFiles(path.join(dirLibs, "angularjs", "modules")).then((data) => {
						return fs.appendFileProm(path.join(dirLibPublic, "angular-modules.js"), data,"utf8");
					});

				});

		});

	}

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
	
};

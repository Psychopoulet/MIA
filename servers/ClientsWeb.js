
"use strict";

// deps

	const 	os = require('os'),
			dns = require('dns'),
			path = require('path'),
			fs = require('node-promfs');

// private

	// attrs

		var m_sDirWeb = path.join(__dirname, '..', 'web'),
				m_sDirTemplates = path.join(m_sDirWeb, 'templates'),
				m_sDirBuffers = path.join(m_sDirWeb, 'buffers'),
					m_sIndexBufferFile = path.join(m_sDirBuffers, 'index.html'),
					m_sPluginsJavascriptsBufferFile = path.join(m_sDirBuffers, 'plugins.js');
			
	// methodes

		// response
			
			function _sendResponse(res, p_nCode, p_sContentType, p_sMessage) {

				if (res.writeHead) {
					res.writeHead(p_nCode, {'Content-Type': p_sContentType});
				}
				if (res.end) {
					res.end(p_sMessage);
				}

			}
				
				function _sendHTMLResponse(res, p_nCode, p_sMessage) {
					_sendResponse(res, p_nCode, 'text/html', p_sMessage);
				}
					
					function _404(res) {
						_sendHTMLResponse(res, 404, 'Not found');
					}
					
					function _500(res, p_sMessage) {

						if (p_sMessage) {
							_sendHTMLResponse(res, 500, p_sMessage);
						}
						else {
							_sendHTMLResponse(res, 500, 'Internal error');
						}
						
					}
				
				function _sendJSResponse(res, p_nCode, p_sMessage) {
					_sendResponse(res, p_nCode, 'application/javascript', p_sMessage);
				}

				function _sendCSSResponse(res, p_nCode, p_sMessage) {
					_sendResponse(res, p_nCode, 'text/css', p_sMessage);
				}

				function _sendPNGResponse(res, p_nCode, p_sMessage) {
					_sendResponse(res, p_nCode, 'image/png', p_sMessage);
				}

		// files

			function _readAllFiles(dir) {

				return fs.readdirProm(dir).then(function (files) {

					files.forEach(function(file, i) {
						files[i] = path.join(dir, file);
					});

					return fs.concatFilesProm(files, 'utf8', "\r\n");

				});

			}

			function _createBuffers(that) {

				// on efface les vieilles versions

				return fs.mkdirpProm(path.dirname(m_sIndexBufferFile)).then(function() {
					return fs.unlinkProm(m_sIndexBufferFile);
				}).then(function() {
					return fs.unlinkProm(m_sPluginsJavascriptsBufferFile);
				})

				// on recréer les fichiers

				.then(function() {
					return fs.writeFileProm(m_sIndexBufferFile, '', 'utf8');
				}).then(function() {
					return fs.writeFileProm(m_sPluginsJavascriptsBufferFile, '', 'utf8');
				}).then(function() {

					// on les rempli

					let plugins = that.container.get('plugins').plugins, sPluginsWidgets = '';

					function _bufferPluginWidget(plugin) {

						if (!plugin.widget) {
							return Promise.resolve('');
						}
						else {

							return fs.readFileProm(plugin.widget, 'utf8').then(function(content) {

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

							return _bufferPluginWidget(plugins[i]).then(function(widget) {

								sPluginsWidgets += widget;

								if (plugins[i].javascripts && 0 < plugins[i].javascripts.length) {

									return fs.concatFilesProm(plugins[i].javascripts, 'utf8', "\r\n").then(function(scripts) {
										return fs.appendFileProm(m_sPluginsJavascriptsBufferFile, scripts, 'utf8');
									}).then(function() {
										return _bufferPlugin(i+1);
									});

								}
								else {
									return _bufferPlugin(i+1);
								}

							});

						}

					}

					return _bufferPlugin(0).then(function() {

						return fs.readFileProm(path.join(m_sDirTemplates, 'index.html'), 'utf8').then(function (index) {

							return new Promise(function(resolve) {

								dns.lookup(os.hostname(), function (err, ip, fam) {

									fs.appendFileProm(
										m_sIndexBufferFile,
										index	.replace('{{ip}}', (err) ? '?.?.?.?' : ip)
												.replace('{{widgets}}', sPluginsWidgets) + "\r\n",
										'utf8'
									).then(function() {

										resolve();
							
									});

								});

							});

						});

					});

				});

			}

// module

module.exports = class ServerClientsWeb {
	
	constructor (Container) {
		this.container = Container;
	}

	start () {

		let multiserver = new (require("node-multi-webserver"))();

		return multiserver.addServer({
			"port": this.container.get("conf").get("ports.clients.http"),
			"name": "client HTTP",
			"ssl": false
		}).then(() => {

			if (!this.container.get('conf').get('ssl')) {
				return Promise.resolve();
			}
			else {

				let sDirSSL = path.join(__dirname, '..', 'ssl');

				return this.container.get('openssl').createCertificate(
					path.join(sDirSSL, 'server.key'),
					path.join(sDirSSL, 'server.csr'),
					path.join(sDirSSL, 'server.crt')
				).then((keys) => {

					return multiserver.addServer({
						"port": this.container.get("conf").get("ports.clients.https"),
						"name": "client HTTPS",
						"ssl": true,
						key: keys.privateKey,
						cert: keys.certificate
					})

				});

			}

		}).then(() => {

			return _createBuffers(this);

		}).then(() => {

			let express = require("express");

			let that = this, app = express()
				.use(require("compression")())

				.use('/pictures', express.static(path.join(m_sDirWeb, 'pictures')))
				// .use('/libs', express.static(path.join(m_sDirWeb, 'libs')))

				.get('/', function (req, res) {
					res.sendFile(m_sIndexBufferFile);
				})

				// js

					.get('/js/plugins.js', function (req, res) {
						res.sendFile(m_sPluginsJavascriptsBufferFile);
					})
					.get('/js/children.js', function (req, res) {

						_readAllFiles(path.join(m_sDirWeb, 'js')).then(function (data) {
							_sendJSResponse(res, 200, data);
						}).catch(function (error) {
							_500(res, error);
						});

					})

				// libs

					// css

					.get('/libs/bootstrap.css', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap-v4', 'css', 'bootstrap.min.css'));
					})
					.get('/libs/font-awesome.css', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'css', 'font-awesome.min.css'));
					})

					// fonts

					.get('/fonts/FontAwesome.otf', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'FontAwesome.otf'));
					})
					.get('/fonts/fontawesome-webfont.eot', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'fontawesome-webfont.eot'));
					})
					.get('/fonts/fontawesome-webfont.svg', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'fontawesome-webfont.svg'));
					})
					.get('/fonts/fontawesome-webfont.ttf', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'fontawesome-webfont.ttf'));
					})
					.get('/fonts/fontawesome-webfont.woff', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'fontawesome-webfont.woff'));
					})
					.get('/fonts/fontawesome-webfont.woff2', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'font-awesome-4.5.0', 'fonts', 'fontawesome-webfont.woff2'));
					})

					// js
					
					.get('/libs/tether.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'tether', 'tether.min.js'));
					})
					.get('/libs/jquery.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'jquery', 'jquery.min.js'));
					})
					.get('/libs/interact.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'interactjs', 'interact.min.js'));
					})
					.get('/libs/bootstrap.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap-v4', 'js', 'bootstrap.min.js'));
					})
					.get('/libs/socketio.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'socketio', 'socket.io.js'));
					})
					.get('/libs/angular.js', function (req, res) {
						res.sendFile(path.join(m_sDirWeb, 'libs', 'angularjs', 'angular.min.js'));
					})
					.get('/libs/angular-modules.js', function (req, res) {

						_readAllFiles(path.join(m_sDirWeb, 'libs', 'angularjs', 'modules')).then(function (data) {
							_sendJSResponse(res, 200, data);
						}).catch(function (error) {
							_500(res, error);
						});

					})

				// 404

					.use(function (req, res) {
						_404(req, res);
					});

			return multiserver.listen(app).then(function() {

				multiserver.servers.forEach(function(server) {
					server.server.timeout = 2 * 1000;
					that.container.get('logs').success("-- [" + server.options.name + "] demarre sur le port " + server.options.port);
				});

			});

		});

	};
	
};

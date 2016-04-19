
"use strict";

// dépendances

	const 	os = require('os'),
			dns = require('dns'),
			path = require('path'),
			fs = require('simplefs');

// private

	if (!fs.punlink) {

		fs.punlink = function(file) {

			return new Promise(function(resolve, reject) {

				try {

					fs.pfileExists(file).then(function(exists) {

						if (!exists) {
							resolve();
						}
						else {
							
							fs.unlink(file, function(err) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {
									resolve();
								}

							});

						}

					}).catch(reject);

				}
				catch(e) {
					reject(((e.message) ? e.message : e));
				}

			});

		};

	}

	if (!fs.pwriteFile) {

		fs.pwriteFile = function(file, message, options) {

			return new Promise(function(resolve, reject) {

				try {

					fs.writeFile(file, message, (options) ? options : null, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				}
				catch(e) {
					reject(((e.message) ? e.message : e));
				}

			});

		};

	}

	if (!fs.pappendFile) {

		fs.pappendFile = function(file, message, options) {

			return new Promise(function(resolve, reject) {

				try {

					fs.appendFile(file, message, (options) ? options : null, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				}
				catch(e) {
					reject(((e.message) ? e.message : e));
				}

			});

		};

	}

	if (!fs.preadFile) {

		fs.preadFile = function(file, options) {

			return new Promise(function(resolve, reject) {

				try {

					fs.readFile(file, (options) ? options : null, function(err, data) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(data);
						}

					});

				}
				catch(e) {
					reject(((e.message) ? e.message : e));
				}

			});

		};

	}

// module
	
	module.exports = function (Container) {
	
		"use strict";
		
		// attributes
			
			var m_sDirWeb = path.join(__dirname, '..', 'web'),
					m_sDirTemplates = path.join(m_sDirWeb, 'templates'),
					m_sDirBuffers = path.join(m_sDirWeb, 'buffers'),
						m_sIndexBufferFile = path.join(m_sDirBuffers, 'index.html'),
						m_sPluginsJavascriptsBufferFile = path.join(m_sDirBuffers, 'plugins.js'),

				m_bBuffersCreated = false;
				
		// methodes

			// private

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

					function _readAllFiles(p_sDirectory) {

						return new Promise(function(resolve, reject) {

							try {

								fs.readdir(p_sDirectory, function (err, files) {

									let bResult = true, sResult = '';

									if (err) {
										reject(err);
									}
									else {

										let i = files.length;

										files.forEach(function (p_sFile) {

											p_sFile = path.join(p_sDirectory, p_sFile);

											fs.pfileExists(p_sFile).then(function(exists) {

												if (exists) {

													fs.readFile(p_sFile, 'utf8', function (err, data) {

														i--;

														if (err) {
															if (0 === i) { reject(err); }
														}
														else {

															sResult += data + "\r\n";

															if (0 === i) {
																resolve(sResult);
															}

														}

													});

												}
												else if (0 === i) {
													i--;
													resolve(sResult);
												}

											}).catch(function(err) {
												i--;
												if (0 === i) { reject(err); }
											});

										});

									}

								});

							}
							catch (e) {
								reject((e.message) ? e.message : e);
							}

						});

					}
					
					function _createBuffers() {

						return new Promise(function(resolve, reject) {

							try {

								if (!Container.get('conf').get('debug') && m_bBuffersCreated) {
									resolve();
								}
								else {

									// on efface les vieilles versions

									fs.pmkdirp(path.dirname(m_sIndexBufferFile)).then(function() {
										return fs.punlink(m_sIndexBufferFile);
									}).then(function() {
										return fs.punlink(m_sPluginsJavascriptsBufferFile);
									})

									// on recréer les fichiers

									.then(function() {
										return fs.pwriteFile(m_sIndexBufferFile, '', 'utf8');
									}).then(function() {
										return fs.pwriteFile(m_sPluginsJavascriptsBufferFile, '', 'utf8');
									}).then(function() {

										// on les rempli

										let sPluginsWidgets = '';

										Container.get('plugins').plugins.forEach(function(plugin) {

											if (plugin.widget) {

												sPluginsWidgets += fs.readFileSync(plugin.widget, 'utf8')
																	.replace(/{{plugin.name}}/g, plugin.name)
																	.replace(/{{plugin.description}}/g, plugin.description)
																	.replace(/{{plugin.version}}/g, plugin.version);

											}

											if (plugin.javascripts && 0 < plugin.javascripts.length) {

												plugin.javascripts.forEach(function(javascript) {

													fs.preadFile(javascript, 'utf8').then(function(data) {

														fs.pappendFile(m_sPluginsJavascriptsBufferFile, data + "\r\n", 'utf8').then(function() {

														}).catch(function(err) {

														});

													}).catch(function(err) {

													});

												});

											}

										});

										fs.preadFile(path.join(m_sDirTemplates, 'index.html'), 'utf8').then(function (index) {

											dns.lookup(os.hostname(), function (err, ip, fam) {

												fs.pappendFile(
													m_sIndexBufferFile,
													index	.replace('{{ip}}', (err) ? '?.?.?.?' : ip)
															.replace('{{widgets}}', sPluginsWidgets) + "\r\n",
													'utf8'
												).then(function() {

													m_bBuffersCreated = true;
													resolve();
										
												}).catch(reject);

											});

										})
										.catch(reject);

									}).catch(reject);

								}

							}
							catch (e) {
								reject((e.message) ? e.message : e);
							}

						});

					}

					function _initServer() {

						return new Promise(function(resolve, reject) {

							let sDirSSL = path.join(__dirname, '..', 'ssl');

							try {

								if (!Container.get('conf').get('ssl')) {
									resolve(require('http').createServer(Container.get('express')));
								}
								else {

									Container.get('openssl').createCertificate(
										path.join(sDirSSL, 'server.key'),
										path.join(sDirSSL, 'server.csr'),
										path.join(sDirSSL, 'server.crt')
									).then(function(keys) {

										resolve(

											require('https').createServer({
												key: keys.privateKey,
												cert: keys.certificate
											}, Container.get('express'))

										);

									})
									.catch(function(err) {
										reject('-- [HTTPS server] openssl : ' + ((err.message) ? err.message : err));
									});

								}

							}
							catch (e) {
								reject((e.message) ? e.message : e);
							}

						});

					}
					
			// public

				this.start = function () {

					return new Promise(function(resolve, reject) {

						let nWebPort = Container.get('conf').get('webport');

						try {

							_initServer().then(function (server) {

								Container.set('http', server).get('express').get('/', function (req, res) {

									_createBuffers().then(function() {
										res.sendFile(m_sIndexBufferFile);
									})
									.catch(function(err) {
										_500(res, (err.message) ? err.message : err)
									});

								})

								// js

									.get('/js/plugins.js', function (req, res) {

										_createBuffers().then(function() {
											res.sendFile(m_sPluginsJavascriptsBufferFile);
										})
										.catch(function() {
											_sendJSResponse(res, 500, 'Impossible de générer les scripts des plugins')
										});

									})
									.get('/js/children.js', function (req, res) {

										_readAllFiles(path.join(m_sDirWeb, 'js')).then(function (data) {
											_sendJSResponse(res, 200, data);
										})
										.catch(function (error) {
											_500(res, error);
										});

									})

								// pictures

									.get('/pictures/favicon.png', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'pictures', 'favicon.png'));
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
										})
										.catch(function (error) {
											_500(res, error);
										});

									})

								// 404

									.use(function (req, res) {
										_404(req, res);
									});

								server.listen(nWebPort, function () {

									if (Container.get('conf').get('ssl')) {
										Container.get('logs').success('-- [HTTP server] avec SSL démarré sur le port ' + nWebPort);
									}
									else {
										Container.get('logs').success('-- [HTTP server] démarré sur le port ' + nWebPort);
									}

									resolve();
									
								});

							})
							.catch(reject);

						}
						catch (e) {
							reject((e.message) ? e.message : e);
						}

					});

				};
				
	};
	

"use strict";

// dépendances

	const 	os = require('os'),
			dns = require('dns'),
			path = require('path'),
			fs = require('simplefs');
		
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

					function _readFile(p_sFilePath) {

						return new Promise(function(resolve, reject) {

							try {

								if (!fs.fileExists(p_sFilePath)) {
									Container.get('logs').err('-- [HTTP server] The ' + p_sFilePath + ' file does not exist');
									reject('-- [HTTP server] The ' + p_sFilePath + ' file does not exist');
								}
								else {

									fs.readFile(p_sFilePath, 'utf8', function (err, data) {

										if (err) {
											reject(err);
										}
										else {
											resolve(data);
										}

									});

								}
								
							}
							catch (e) {
								reject((e.message) ? e.message : e);
							}

						});
						
					}
					
					function _readAllFiles(p_sDirectory) {

						return new Promise(function(resolve, reject) {

							try {

								fs.readdir(p_sDirectory, function (err, files) {

									var bResult = true, sResult = '';

									if (err) {
										reject(err);
									}
									else {

										files.forEach(function (p_sFile) {

											p_sFile = path.join(p_sDirectory, p_sFile);

											if (fs.fileExists(p_sFile)) {
												sResult += fs.readFileSync(p_sFile, 'utf8');
											}

										});

										if (bResult) {
											resolve(sResult);
										}
										else {
											reject(sResult);
										}

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
								else if (!fs.mkdirp(path.dirname(m_sIndexBufferFile))) {
									reject('Impossible to create the html file');
								}
								else {

									// on efface les vieilles versions

									if (fs.fileExists(m_sIndexBufferFile)) {
										fs.unlinkSync(m_sIndexBufferFile);
									}

									if (fs.fileExists(m_sPluginsJavascriptsBufferFile)) {
										fs.unlinkSync(m_sPluginsJavascriptsBufferFile);
									}

									// on recréer les fichiers

									fs.writeFileSync(m_sIndexBufferFile, '', 'utf8');
									fs.writeFileSync(m_sPluginsJavascriptsBufferFile, '', 'utf8');

									// on les rempli

									var sPluginsWidgets = '';

									Container.get('plugins').plugins.forEach(function(plugin) {

										if (plugin.widget) {

											sPluginsWidgets += fs.readFileSync(plugin.widget, 'utf8')
																.replace(/{{plugin.name}}/g, plugin.name)
																.replace(/{{plugin.description}}/g, plugin.description)
																.replace(/{{plugin.version}}/g, plugin.version);

										}

										if (plugin.javascripts && 0 < plugin.javascripts.length) {

											plugin.javascripts.forEach(function(javascript) {

												fs.appendFileSync(
													m_sPluginsJavascriptsBufferFile,
													fs.readFileSync(javascript, 'utf8'),
													'utf8'
												);

											});

										}

									});

									_readFile(path.join(m_sDirTemplates, 'index.html')).then(function (index) {

										dns.lookup(os.hostname(), function (err, ip, fam) {

											fs.appendFileSync(
												m_sIndexBufferFile,
												index	.replace('{{ip}}', (err) ? '?.?.?.?' : ip)
														.replace('{{widgets}}', sPluginsWidgets),
												'utf8'
											);

											m_bBuffersCreated = true;
											resolve();
									
										});

									})
									.catch(reject);

								}

							}
							catch (e) {
								reject((e.message) ? e.message : e);
							}

						});

					}

					function _initServer() {

						return new Promise(function(resolve, reject) {

							var sDirSSL = path.join(__dirname, '..', 'ssl');

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

						var nWebPort = Container.get('conf').get('webport');

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
											_sendJSResponse(res, 500, 'Impossible to buffer plugins\'s scripts')
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

										_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'css')).then(function (data) {
											_sendCSSResponse(res, 200, data);
										})
										.catch(function (error) {
											_500(res, error);
										});

									})

									// fonts

									.get('/fonts/glyphicons-halflings-regular.eot', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap', 'fonts', 'glyphicons-halflings-regular.eot'));
									})
									.get('/fonts/glyphicons-halflings-regular.svg', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap', 'fonts', 'glyphicons-halflings-regular.svg'));
									})
									.get('/fonts/glyphicons-halflings-regular.ttf', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap', 'fonts', 'glyphicons-halflings-regular.ttf'));
									})
									.get('/fonts/glyphicons-halflings-regular.woff', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap', 'fonts', 'glyphicons-halflings-regular.woff'));
									})
									.get('/fonts/glyphicons-halflings-regular.woff2', function (req, res) {
										res.sendFile(path.join(m_sDirWeb, 'libs', 'bootstrap', 'fonts', 'glyphicons-halflings-regular.woff2'));
									})

									// js
										
									.get('/libs/jquery.js', function (req, res) {

										_readAllFiles(path.join(m_sDirWeb, 'libs', 'jquery')).then(function (data) {
											_sendJSResponse(res, 200, data);
										})
										.catch(function (error) {
											_500(res, error);
										});

									})
									.get('/libs/bootstrap.js', function (req, res) {

										_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'js')).then(function (data) {
											_sendJSResponse(res, 200, data);
										})
										.catch(function (error) {
											_500(res, error);
										});

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
										Container.get('logs').success('-- [HTTP server] with ssl started on port ' + nWebPort);
									}
									else {
										Container.get('logs').success('-- [HTTP server] started on port ' + nWebPort);
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
	
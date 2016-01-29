
// dépendances

	const 	os = require('os'),
			dns = require('dns'),
			path = require('path'),
			fs = require('fs'),
			q = require('q'),
			mkdirp = require('mkdirp');
		
// module
	
	module.exports = function (Container) {
	
		"use strict";
		
		// attributes
			
			var m_sDirWeb = path.join(__dirname, '..', 'web'),
					m_sDirTemplates = path.join(m_sDirWeb, 'templates'),
					m_sDirBuffers = path.join(m_sDirWeb, 'buffers'),
						m_sIndexBufferFile = path.join(m_sDirBuffers, 'index.html'),
						m_sPluginsJavascriptsBufferFile = path.join(m_sDirBuffers, 'plugins.js'),
				m_sDirSSL = path.join(__dirname, '..', 'ssl'),

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

						var deferred = q.defer();

							try {

								if (!fs.existsSync(p_sFilePath)) {
									Container.get('logs').err('-- [HTTP server] The ' + p_sFilePath + ' file does not exist');
									deferred.reject('-- [HTTP server] The ' + p_sFilePath + ' file does not exist');
								}
								else {

									fs.readFile(p_sFilePath, 'utf8', function (err, data) {

										if (err) {
											deferred.reject(err);
										}
										else {
											deferred.resolve(data);
										}

									});

								}
								
							}
							catch (e) {
								deferred.reject((e.message) ? e.message : e);
							}
							
						return deferred.promise;
						
					}
					
					function _readAllFiles(p_sDirectory) {
q
						var deferred = q.defer();

							try {

								fs.readdir(p_sDirectory, function (err, files) {

									var bResult = true, sResult = '';

									if (err) {
										deferred.reject(err);
									}
									else {

										files.forEach(function (p_sFile) {

											p_sFile = path.join(p_sDirectory, p_sFile);

											if (fs.lstatSync(p_sFile).isFile()) {
												sResult += fs.readFileSync(p_sFile, 'utf8');
											}

										});

										if (bResult) {
											deferred.resolve(sResult);
										}
										else {
											deferred.reject(sResult);
										}

									}

								});

							}
							catch (e) {
								deferred.reject((e.message) ? e.message : e);
							}
							
						return deferred.promise;

					}
					
					function _createBuffers() {
q
						var deferred = q.defer();

							try {

								if (!Container.get('conf').get('debug') && m_bBuffersCreated) {
									deferred.resolve();
								}
								else {

									mkdirp(path.dirname(m_sIndexBufferFile), function (err) {

										if (err) {
											deferred.reject(err);
										}
										else {

											// on efface les vieilles versions

											try {
												if (fs.lstatSync(m_sIndexBufferFile).isFile()) {
													fs.unlinkSync(m_sIndexBufferFile);
												}
											}
											catch(e) {}

											try {
												if (fs.lstatSync(m_sPluginsJavascriptsBufferFile).isFile()) {
													fs.unlinkSync(m_sPluginsJavascriptsBufferFile);
												}
											}
											catch(e) {}

											// on recréer les fichiers

											fs.writeFileSync(m_sIndexBufferFile, '', 'utf8');
											fs.writeFileSync(m_sPluginsJavascriptsBufferFile, '', 'utf8');

											// on les rempli

											Container.get('plugins').getData().then(function (p_tabData) {

												var sPluginsWidgets = '';

												p_tabData.forEach(function(plugin) {

													if (plugin.web) {

														if (plugin.web.templates && plugin.web.templates.widget && plugin.web.widgetcontroller) {

															sPluginsWidgets += '<div class="col-xs-12 col-md-6">';

																sPluginsWidgets += '<div class="panel panel-default" data-ng-controller="' + plugin.web.widgetcontroller + '">';

																	sPluginsWidgets += '<div class="panel-heading">';
																		sPluginsWidgets += '<h4 class="panel-title">' + plugin.name + '</h4>';
																	sPluginsWidgets += '</div>';

																	sPluginsWidgets += '<div class="panel-body">';

																		sPluginsWidgets += fs.readFileSync(plugin.web.templates.widget, 'utf8')
																							.replace('{{plugin.name}}', plugin.name)
																							.replace('{{plugin.description}}', plugin.description)
																							.replace('{{plugin.version}}', plugin.version);

																	sPluginsWidgets += '</div>';

																sPluginsWidgets += '</div>';

															sPluginsWidgets += '</div>';

														}

														if (plugin.web.javascripts && 0 < plugin.web.javascripts.length) {

															plugin.web.javascripts.forEach(function(javascript) {

																fs.appendFileSync(
																	m_sPluginsJavascriptsBufferFile,
																	fs.readFileSync(javascript, 'utf8'),
																	'utf8'
																);

															});

														}

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
														deferred.resolve();
												
													});

												})
												.catch(deferred.reject);

											})
											.catch(deferred.reject);

										}
									
									});

								}

							}
							catch (e) {
								deferred.reject((e.message) ? e.message : e);
							}
							
						return deferred.promise;

					}

					function _initServer() {

						var deferred = q.defer();

							try {

								if (!Container.get('conf').get('ssl')) {
									deferred.resolve(require('http').createServer(Container.get('express')));
								}
								else {

									Container.get('openssl').createCertificate(
										path.join(m_sDirSSL, 'server.key'),
										path.join(m_sDirSSL, 'server.csr'),
										path.join(m_sDirSSL, 'server.crt')
									).then(function(data) {

										deferred.resolve(

											require('https').createServer({
												key: data.privateKey,
												cert: data.certificate
											}, Container.get('express'))

										);

									})
									.catch(function(e) {

										Container.get('logs').err('-- [HTTP server] openssl : ' ((e.message) ? e.message : e));

										deferred.resolve(
											require('http').createServer(Container.get('express'))
										);

									});

								}

							}
							catch (e) {
								deferred.reject((e.message) ? e.message : e);
							}
							
						return deferred.promise;

					}
					
			// public

				this.start = function () {

					var deferred = q.defer(), nWebPort = Container.get('conf').get('webport');

						try {

							_initServer().then(function (p_clServer) {

								Container.set('http', p_clServer).get('express').get('/', function (req, res) {

									_createBuffers().then(function() {
										res.sendFile(m_sIndexBufferFile);
									})
									.catch(function(err) {
										_sendJSResponse(res, 500, (err.message) ? err.message : err)
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

								p_clServer.listen(nWebPort, function () {
									Container.get('logs').success('-- [HTTP server] started on port ' + nWebPort);
								});

								deferred.resolve();
								
							})
							.catch(deferred.reject);

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
				this.stop = function () {

					var deferred = q.defer();

						try {

							deferred.resolve();
					
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};

	};
	
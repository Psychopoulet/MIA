
// dépendances

	var
		os = require('os'),
		dns = require('dns'),
		path = require('path'),
		fs = require('fs'),
		q = require('q'),
		express = require('express')(),

		Container = require(path.join(__dirname, 'Container.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {
	
		"use strict";
		
		// attributes
			
			var
				m_sDirWeb = path.join(__dirname, '..', 'web'),
				m_sDirSSL = path.join(__dirname, '..', 'ssl'),
				m_clServer = false,
				m_clPlugins = Container.get('plugins'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'httpserver')),

				m_bPluginsBuffersCreated = false,
				m_sPluginsBuffersPath = path.join(__dirname, '..', 'web', 'buffers'),
				m_sPluginsWidgetsBufferFile = path.join(m_sPluginsBuffersPath, 'plugins.html'),
				m_sPluginsJavascriptsBufferFile = path.join(m_sPluginsBuffersPath, 'plugins.js');
				
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
									m_clLog.err('-- [HTTP server] The ' + p_sFilePath + ' file does not exist');
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

								if (!Container.get('conf').get('debug') && m_bPluginsBuffersCreated) {
									deferred.resolve();
								}
								else {

									try {
										if (fs.lstatSync(m_sPluginsWidgetsBufferFile).isFile()) {
											fs.unlinkSync(m_sPluginsWidgetsBufferFile);
										}
									}
									catch(e) {}

									fs.appendFileSync(m_sPluginsWidgetsBufferFile, '', 'utf8');

									try {
										if (fs.lstatSync(m_sPluginsJavascriptsBufferFile).isFile()) {
											fs.unlinkSync(m_sPluginsJavascriptsBufferFile);
										}
									}
									catch(e) {}

									fs.appendFileSync(m_sPluginsJavascriptsBufferFile, '', 'utf8');

									m_clPlugins.getData().then(function (p_tabData) {

										p_tabData.forEach(function(plugin) {

											if (plugin.web) {

												if (plugin.web.templates && plugin.web.templates.widget && plugin.web.widgetcontroller) {

													fs.appendFileSync(
														m_sPluginsWidgetsBufferFile,

														'<div class="col-xs-12 col-md-6">' +

															'<div class="panel panel-default" data-ng-controller="' + plugin.web.widgetcontroller + '">' +

																'<div class="panel-heading">' +
																	'<h4 class="panel-title">' + plugin.name + '</h4>' +
																'</div>' +

																'<div class="panel-body">' +

																	fs.readFileSync(plugin.web.templates.widget, 'utf8')
																		.replace('{{plugin.name}}', plugin.name)
																		.replace('{{plugin.description}}', plugin.description)
																		.replace('{{plugin.version}}', plugin.version) +

																'</div>' +

															'</div>' +

														'</div>',

														'utf8'
													);
													
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

										m_bPluginsBuffersCreated = true;

										deferred.resolve();

									})
									.catch(deferred.reject);

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
									deferred.resolve(require('http').createServer(express));
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
											}, express)

										);

									})
									.catch(function(e) {

										m_clLog.err('-- [HTTP server] openssl : ' ((e.message) ? e.message : e));

										deferred.resolve(
											require('http').createServer(express)
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

				this.getServer = function () {
					return m_clServer;
				};
				
				this.start = function () {

					var deferred = q.defer(), nWebPort = Container.get('conf').get('webport');

						try {

							_initServer().then(function (p_clServer) {

								m_clServer = p_clServer;

								express.get('/', function (req, res) {

									_readFile(path.join(m_sDirWeb, 'templates', 'index.html')).then(function (index) {

										
										dns.lookup(os.hostname(), function (err, ip, fam) {

											if (err) {
												_500(res, index.replace('{{widgets}}', err).replace('{{ip}}', '0.0.0.0'));
											}
											else {
											
												_createBuffers().then(function() {

													_readFile(m_sPluginsWidgetsBufferFile).then(function(sHTML) {
														_sendHTMLResponse(res, 200, index.replace('{{widgets}}', sHTML).replace('{{ip}}', ip));
													})
													.catch(function (err) {
														_500(res, index.replace('{{widgets}}', err).replace('{{ip}}', ip));
													});

												})
												.catch(function(err) {
													_500(res, index.replace('{{widgets}}', err).replace('{{ip}}', ip));
												});

											}

										});

									})
									.catch(function (err) {
										_500(res, err);
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

								m_clServer.listen(nWebPort, function () {
									m_clLog.success('-- [HTTP server] started on port ' + nWebPort);
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
	
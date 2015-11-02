
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		url = require('url'),
		q = require('q'),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {
	
		"use strict";
		
		// attributes
			
			var
				m_clServer,
				m_sDirWeb = path.join(__dirname, '..', 'web'),
				m_tabWebPlugins = [],
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'httpserver'));
				
		// methodes

			// protected

				// response
					
					function _sendResponse(p_clResponse, p_nCode, p_sContentType, p_sMessage) {
						p_clResponse.writeHead(p_nCode, {'Content-Type': p_sContentType});
						p_clResponse.end(p_sMessage);
					}
						
						function _sendHTMLResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'text/html', p_sMessage);
						}
							
							function _404(p_clResponse) {
								_sendHTMLResponse(p_clResponse, 404, 'Not found');
							}
							
							function _500(p_clResponse, p_sMessage) {

								if (p_sMessage) {
									_sendHTMLResponse(p_clResponse, 500, p_sMessage);
								}
								else {
									_sendHTMLResponse(p_clResponse, 500, 'Internal error');
								}
								
							}
						
						function _sendJSResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'application/javascript', p_sMessage);
						}

						function _sendCSSResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'text/css', p_sMessage);
						}

						function _sendPNGResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'image/png', p_sMessage);
						}

				// files

					function _extractPluginsTemplates() {

						var deferred = q.defer(), sContent = '';

							try {

								m_tabWebPlugins.forEach(function (p_stPlugin) {

									if (p_stPlugin.templates) {

										p_stPlugin.templates.forEach(function (p_sFile) {

											if (fs.existsSync(p_sFile)) {
												sContent += fs.readFileSync(p_sFile, 'utf8');
											}

										});

									}

								});

								deferred.resolve(sContent);

							}
							catch (e) {
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}

						return deferred.promise;
						
					}


					function _extractPluginsJavascripts() {

						var deferred = q.defer(), sContent = '';

							try {

								m_tabWebPlugins.forEach(function (p_stPlugin) {

									if (p_stPlugin.javascripts) {

										p_stPlugin.javascripts.forEach(function (p_sFile) {

											if (fs.existsSync(p_sFile)) {
												sContent += fs.readFileSync(p_sFile, 'utf8');
											}

										});

									}

								});

								deferred.resolve(sContent);

							}
							catch (e) {
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}

						return deferred.promise;
						
					}

					function _extractDataPlugins() {

						var sDirWebPlugins = path.join(m_sDirWeb, 'plugins');

						var deferred = q.defer();

							try {

								fs.readdir(sDirWebPlugins, function (err, directories) {

									if (err) {
										deferred.reject(err);
									}
									else {

										directories.forEach(function (p_sDirectory) {

											var
												sDirectory = path.join(sDirWebPlugins, p_sDirectory),
												sConf = path.join(sDirectory, 'plugin.json'),
												stPlugin;

											if (!fs.existsSync(sConf)) {
												deferred.reject("Missing 'plugin.json' for '" + sDirectory + "' plugin.");
											}
											else {

												stPlugin = JSON.parse(fs.readFileSync(sConf, 'utf8'));

												if (stPlugin.javascripts) {

													stPlugin.javascripts.forEach(function (value, key) {
														stPlugin.javascripts[key] = path.join(sDirectory, value);
													});

												}

												if (stPlugin.templates) {

													stPlugin.templates.forEach(function (value, key) {
														stPlugin.templates[key] = path.join(sDirectory, value);
													});

												}

												m_tabWebPlugins.push(stPlugin);

											}

										});

										deferred.resolve();

									}

								});

							}
							catch (e) {
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}

						return deferred.promise;
						
					}

					function _readFile(p_sDirectory, p_sFileName) {

						var deferred = q.defer(), sFileName = '';

							try {

								sFileName = path.join(m_sDirWeb, p_sDirectory, p_sFileName);

								if (!fs.existsSync(sFileName)) {
									m_clLog.err('-- [HTTP server] The ' + sFileName + ' file does not exist');
								}
								else {

									fs.readFile(sFileName, 'utf8', function (err, data) {

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
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
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
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}
							
						return deferred.promise;

					}
					
				// routers
					
					function _router(p_clResponse, p_sPathName) {

						var tabURI;

						try {

							tabURI = p_sPathName.split('/').filter(function (sData) {
								return ('' != sData);
							});

							switch (tabURI.length) {

								case 0:

									m_clLog.log('-- [HTTP server] query');

									_readFile('', 'index.html')
										.then(function (index) {

											_extractPluginsTemplates()
												.then(function(sHTML) {
													_sendHTMLResponse(p_clResponse, 200, index.replace('{{pages}}', sHTML));
												})
												.catch(function (error) {
													_500(p_clResponse, index.replace('{{pages}}', error));
												});

										})
										.catch(function (error) {
											_500(p_clResponse, error);
										});

								break;

								default:

									switch (tabURI[0]) {

										case 'js':

											if (tabURI[1]) {

												switch (tabURI[1]) {

													case 'plugins.js' :

														_extractPluginsJavascripts()
															.then(function(sJavascript) {
																_sendJSResponse(p_clResponse, 200, sJavascript);
															})
															.catch(function (error) {
																_500(p_clResponse, error);
															});

													break;

													case 'children.js' :

														_readAllFiles(path.join(m_sDirWeb, 'js'))
															.then(function (data) {
																_sendJSResponse(p_clResponse, 200, data);
															})
															.catch(function (error) {
																_500(p_clResponse, error);
															});

													break;

													default :
														_404(p_clResponse);
													break;

												}

											}
											else {
												_404(p_clResponse);
											}

										break;

										case 'pictures':

											switch (tabURI[1]) {

												case 'favicon.png':

													_readFile('pictures', 'favicon.png')
														.then(function (data) {
															_sendPNGResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;

												default:
													_404(p_clResponse);
												break;

											}

										break;

										case 'libs':

											switch (tabURI[1]) {

												// css

												case 'bootstrap.css':

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'css'))
														.then(function (data) {
															_sendCSSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;

												// js
												
												case 'jquery.js':

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'jquery'))
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;
												case 'bootstrap.js':

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'js'))
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;
												case 'socketio.js':

													_readFile('libs/socketio', 'socket.io.js')
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;
												case 'angular.js':

													_readFile('libs/angularjs', 'angular.min.js')
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;
												case 'angular-modules.js':

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'angularjs', 'modules'))
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_500(p_clResponse, error);
														});

												break;

												default:
													_404(p_clResponse);
												break;

											}

										break;

										default:
											_404(p_clResponse);
										break;

									}

								break;

							}
							
						}
						catch (e) {
							m_clLog.err(e);
							_500(p_clResponse);
						}


					}

			// public

				this.getServer = function () {
					return m_clServer;
				};
				
				this.start = function (p_nPort) {

					var deferred = q.defer();

						try {

							// lancement

								_extractDataPlugins()
									.then(function () {

										m_clServer = require('http').createServer();
										
										m_clServer.listen(p_nPort, function () {
											m_clLog.success('-- [HTTP server] started');
										});
									
									// requete

										m_clServer.on('request', function (p_clRequest, p_clResponse) {
											_router(p_clResponse, url.parse(p_clRequest.url).pathname);
										});
								
									deferred.resolve();

									})
									.catch(deferred.reject);
									
						}
						catch (e) {
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};
				
				this.stop = function (p_fCallback) {

					var deferred = q.defer();

						try {

							deferred.resolve();
					
						}
						catch (e) {
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};

	};
	
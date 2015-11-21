
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		url = require('url'),
		q = require('q'),
		app = require('express')(),
		http = require('http').Server(app),

		Container = require(path.join(__dirname, 'Container.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {
	
		"use strict";
		
		// attributes
			
			var
				m_sDirWeb = path.join(__dirname, '..', 'web'),
				m_clPlugins = require(path.join(__dirname, 'Container.js')).get('plugins'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'httpserver')),

				m_sTemplatesBufferFile = "",
				m_sJavascriptsBufferFile = "";
				
		// methodes

			// protected

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
					
			// public

				this.getServer = function () {
					return http;
				};
				
				this.start = function () {

					var deferred = q.defer();

						try {

							// lancement

								m_clPlugins.getData()
									.then(function (p_tabData) {

										m_sTemplatesBufferFile = path.join(__dirname, '..', 'web', 'buffers', 'plugins.html');

										try {
											if (fs.lstatSync(m_sTemplatesBufferFile).isFile()) {
												fs.unlinkSync(m_sTemplatesBufferFile);
											}
										}
										catch(e) {}

										m_sJavascriptsBufferFile = path.join(__dirname, '..', 'web', 'buffers', 'plugins.js');

										try {
											if (fs.lstatSync(m_sJavascriptsBufferFile).isFile()) {
												fs.unlinkSync(m_sJavascriptsBufferFile);
											}
										}
										catch(e) {}

										p_tabData.forEach(function(plugin) {

											if (plugin.web) {
												
												if (plugin.web.templates && 0 < plugin.web.templates.length) {

													plugin.web.templates.forEach(function(template) {
														fs.appendFileSync(m_sTemplatesBufferFile, fs.readFileSync(template, 'utf8'), 'utf8');
													});

												}

												if (plugin.web.javascripts && 0 < plugin.web.javascripts.length) {

													plugin.web.javascripts.forEach(function(javascript) {
														fs.appendFileSync(m_sJavascriptsBufferFile, fs.readFileSync(javascript, 'utf8'), 'utf8');
													});

												}

											}

										});

										app

											.get('/', function (req, res) {

												_readFile('templates', 'index.html')
													.then(function (index) {

														_readFile('buffers', 'plugins.html')
															.then(function(sHTML) {
																_sendHTMLResponse(res, 200, index.replace('{{pages}}', sHTML));
															})
															.catch(function (error) {
																_500(res, index.replace('{{pages}}', error));
															});

													})
													.catch(function (error) {
														_500(res, error);
													});
													
											})

											// js

												.get('/js/plugins.js', function (req, res) {
													res.sendFile(m_sJavascriptsBufferFile);
												})
												.get('/js/children.js', function (req, res) {

													_readAllFiles(path.join(m_sDirWeb, 'js'))
														.then(function (data) {
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

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'css'))
														.then(function (data) {
															_sendCSSResponse(res, 200, data);
														})
														.catch(function (error) {
															_500(res, error);
														});

												})

												// js
													
												.get('/libs/jquery.js', function (req, res) {

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'jquery'))
														.then(function (data) {
															_sendJSResponse(res, 200, data);
														})
														.catch(function (error) {
															_500(res, error);
														});

												})
												.get('/libs/bootstrap.js', function (req, res) {

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'bootstrap', 'js'))
														.then(function (data) {
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

													_readAllFiles(path.join(m_sDirWeb, 'libs', 'angularjs', 'modules'))
														.then(function (data) {
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

										http.listen(Container.get('conf').get('webport'), function () {
											m_clLog.success('-- [HTTP server] started on port ' + Container.get('conf').get('webport'));
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
	

// dépendances
	
	var

		path = require('path'),
		q = require('q'),

		HTTPServer = require(path.join(__dirname, 'HTTPServer.js')),
		HTTPSocket = require(path.join(__dirname, 'HTTPSocket.js')),
		ChildSocket = require(path.join(__dirname, 'ChildSocket.js')),
		Plugins = require(path.join(__dirname, 'Plugins.js')),

		Logs = require(path.join(__dirname, 'Logs.js')),
		Conf = require(path.join(__dirname, 'Conf.js')),

		SikyAPI = require(path.join(__dirname, 'SIKY-API.js'));
		
// module
	
	module.exports = function () {
		
		"use strict";
		
		// attributes
			
			var
				m_stSIKYUser,

				m_clHTTPServer = new HTTPServer(),
				m_clHTTPSocket = new HTTPSocket(),
				m_clChildSocket = new ChildSocket(),
				m_clPlugins = new Plugins(),
				
				m_clLog = new Logs(path.join(__dirname, '..', 'logs')),
				m_clConf = new Conf(),
				m_clSikyAPI = new SikyAPI();
				
		// methodes

			// public

				this.start = function () {

					var deferred = q.defer();

						try {

							// events

								m_clHTTPSocket
									.onDisconnect(function(socket) {
										socket.removeAllListeners('web.getconnected');
										socket.removeAllListeners('web.login');
									})
									.onConnection(function(socket) {

										socket
											.on('web.getconnected', function () {
												m_clHTTPSocket.emit('web.getconnected', m_clChildSocket.getConnectedChilds());
											})
											.on('web.login', function (p_stData) {

												if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
													socket.emit('web.logged');
												}
												else {

													m_clSikyAPI.login(p_stData.email, p_stData.password)
														.then(function () {

															m_stSIKYUser = {
																token : m_clSikyAPI.getToken(),
																email : p_stData.email,
																password : p_stData.password
															};

															m_clLog.success('-- [socket server] logged to SIKY');
															socket.emit('web.logged');
															
														})
														.catch(function (e) {
															m_clLog.err((e.message) ? e.message : e);
															socket.emit('web.login.error', (e.message) ? e.message : e);
														});
														
												}

											});

									});

								m_clChildSocket
									.onDisconnect(function(socket) {
										m_clHTTPSocket.emit('web.disconnected', socket.MIA);
									})
									.onConnection(function(socket) {
										m_clHTTPSocket.emit('web.connection', socket.MIA);
									});

							// run

								m_clHTTPServer.start(m_clConf.getConf().portweb)
									.then(function() {

										// plugins

											m_clPlugins.getData()
												.then(function(p_tabData) {

													p_tabData.forEach(function(p_stPlugin) {

														try {
															require(p_stPlugin.main)(m_clHTTPSocket, m_clChildSocket, m_clSikyAPI);
															m_clLog.success('-- [plugin] ' + p_stPlugin.name + ' loaded');
														}
														catch (e) {
															m_clLog.err((e.message) ? e.message : e);
														}

													})

												})
												.catch(deferred.reject);
											
										// start
											
											m_clHTTPSocket.start(m_clHTTPServer.getServer())
												.then(function () {
													
													m_clChildSocket.start(m_clConf.getConf().portchildren)
														.then(deferred.resolve)
														.catch(deferred.reject);
														
												})
												.catch(deferred.reject);

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

							m_clChildSocket.stop()
								.then(function () {
									
									m_clHTTPSocket.stop()
										.then(function () {
											
											m_clHTTPServer.stop()
												.then(deferred.resolve)
												.catch(deferred.reject);
											
										})
										.catch(deferred.reject);

								})
								.catch(deferred.reject);
								
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
				this.getVersion = function () {
					return '0.0.1'
				};
				
	};
	
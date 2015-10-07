
// dépendances
	
	var

		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Q = require('q'),

		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js')),

		CST_DEP_Log = require('logs'),
		CST_DEP_Conf = require(CST_DEP_Path.join(__dirname, 'Conf.js')),

		CST_DEP_SikyAPI = require('SIKY-API');
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var
				m_stSIKYUser,

				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket(),
				
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs')),
				m_clConf = new CST_DEP_Conf(),
				m_clSikyAPI = new CST_DEP_SikyAPI();
				
		// methodes

			// public

				this.start = function () {

					var
						deferred = CST_DEP_Q.defer();

						try {

							// events

								m_clHTTPSocket
									.onDisconnect(function(socket) {
										socket.removeAllListeners('child.getconnected');
										socket.removeAllListeners('child.login');
									})
									.onConnection(function(socket) {

										socket
											.on('child.getconnected', function () {
												m_clHTTPSocket.emit('child.getconnected', m_clChildSocket.getConnectedChilds());
											})
											.on('child.login', function (p_stData) {

												if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
													socket.emit('child.logged');
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
															socket.emit('child.logged');
															
														})
														.catch(function (e) {
															
															if(e.message) {
																e = e.message;
															}

															m_clLog.err(e);
															socket.emit('child.login.error', e);

														});
														
												}

											});

									});

								m_clChildSocket
									.onDisconnect(function(socket) {
										m_clHTTPSocket.emit('child.disconnected', socket.MIA);
									})
									.onConnection(function(socket) {
										m_clHTTPSocket.emit('child.connection', socket.MIA);
									});

							// run

								m_clHTTPServer.start(m_clConf.getConf().portweb)
									.then(function() {

										// plugins
											
											var sPluginsPath = CST_DEP_Path.join(__dirname, '..', 'plugins');

											CST_DEP_FileSystem.readdirSync(sPluginsPath).forEach(function (file) {
												require(CST_DEP_Path.join(sPluginsPath, file))(m_clHTTPSocket, m_clChildSocket, m_clSikyAPI);
											});

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
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};
				
				this.stop = function () {

					var deferred = CST_DEP_Q.defer();

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
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};
				
				this.getVersion = function () {
					return '0.0.1'
				};
				
	};
	
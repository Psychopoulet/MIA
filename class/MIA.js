
// dépendances
	
	var

		path = require('path'),
		q = require('q'),

		Factory = require(path.join(__dirname, 'Factory.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {
		
		"use strict";
		
		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs')),
				m_stSIKYUser;
				
		// methodes

			// public

				this.start = function () {

					var deferred = q.defer();

						try {

							// events

								Factory.getHTTPSocketInstance()
									.onDisconnect(function(socket) {
										socket.removeAllListeners('web.getconnected');
										socket.removeAllListeners('web.login');
									})
									.onConnection(function(socket) {

										socket
											.on('web.getconnected', function () {
												Factory.getHTTPSocketInstance().emit('web.getconnected', Factory.getChildSocketInstance().getConnectedChilds());
											})
											.on('web.login', function (p_stData) {

												if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
													socket.emit('web.logged');
												}
												else {

													Factory.getSikyAPIInstance().login(p_stData.email, p_stData.password)
														.then(function () {

															m_stSIKYUser = {
																token : Factory.getSikyAPIInstance().getToken(),
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

								Factory.getChildSocketInstance()
									.onDisconnect(function(socket) {
										Factory.getHTTPSocketInstance().emit('web.disconnected', socket.MIA);
									})
									.onConnection(function(socket) {
										Factory.getHTTPSocketInstance().emit('web.connection', socket.MIA);
									});

							// run

								Factory.getHTTPServerInstance().start(Factory.getConfInstance().getConf().portweb)
									.then(function() {

										// plugins

											Factory.getPluginsInstance().getData()
												.then(function(p_tabData) {

													p_tabData.forEach(function(p_stPlugin) {

														try {
															require(p_stPlugin.main)(Factory);
															m_clLog.success('-- [plugin] ' + p_stPlugin.name + ' loaded');
														}
														catch (e) {
															m_clLog.err((e.message) ? e.message : e);
														}

													});

												})
												.catch(deferred.reject);
											
										// start
											
											Factory.getHTTPSocketInstance().start(Factory.getHTTPServerInstance().getServer())
												.then(function () {
													
													Factory.getChildSocketInstance().start(Factory.getConfInstance().getConf().portchildren)
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

							Factory.getChildSocketInstance().stop()
								.then(function () {
									
									Factory.getHTTPSocketInstance().stop()
										.then(function () {
											
											Factory.getHTTPServerInstance().stop()
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
	
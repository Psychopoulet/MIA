
// dépendances
	
	var

		path = require('path'),
		q = require('q'),

		Container = require(path.join(__dirname, 'Container.js')),
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

								Container.get('server.socket.web')
									.onDisconnect(function(socket) {
										socket.removeAllListeners('web.getconnected');
										socket.removeAllListeners('web.login');
									})
									.onConnection(function(socket) {

										socket
											.on('web.getconnected', function () {
												Container.get('server.socket.web').emit('web.getconnected', Container.get('server.socket.child').getConnectedChilds());
											})
											.on('web.login', function (p_stData) {

												if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
													socket.emit('web.logged');
												}
												else {

													Container.get('sikyapi').login(p_stData.email, p_stData.password)
														.then(function () {

															m_stSIKYUser = {
																token : Container.get('sikyapi').getToken(),
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

								Container.get('server.socket.child')
									.onDisconnect(function(socket) {
										Container.get('server.socket.web').emit('web.disconnected', socket.MIA);
									})
									.onConnection(function(socket) {
										Container.get('server.socket.web').emit('web.connection', socket.MIA);
									});

							// run

								Container.get('server.http').start()
									.then(function() {

										// plugins

											Container.get('plugins').getData()
												.then(function(p_tabData) {

													p_tabData.forEach(function(p_stPlugin) {

														try {
															require(p_stPlugin.main)(Container);
															m_clLog.success('-- [plugin] ' + p_stPlugin.name + ' loaded');
														}
														catch (e) {
															m_clLog.err((e.message) ? e.message : e);
														}

													});

												})
												.catch(deferred.reject);
											
										// start
											
											Container.get('server.socket.web').start(Container.get('server.http').getServer())
												.then(function () {
													
													Container.get('server.socket.child').start()
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

							Container.get('server.socket.child').stop()
								.then(function () {
									
									Container.get('server.socket.web').stop()
										.then(function () {
											
											Container.get('server.http').stop()
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
				
	};
	
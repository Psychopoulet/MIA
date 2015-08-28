
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Q = require('q'),
		CST_DEP_SIKY = require('SIKY-API'),
		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js')),
		CST_DEP_Conf = require(CST_DEP_Path.join(__dirname, 'Conf.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var
				m_clThis = this,
				m_clConf = new CST_DEP_Conf(),
				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket();
				
		// methodes

			// public

				this.start = function () {

					var
						deferred = CST_DEP_Q.defer();

						try {

							m_clHTTPServer.start(m_clConf.getConf().portweb)
								.then(function() {
									
									// plugins
										
										var sPluginsPath = CST_DEP_Path.join(__dirname, '..', 'plugins');

										CST_DEP_FileSystem.readdirSync(sPluginsPath).forEach(function (file) {
											require(CST_DEP_Path.join(sPluginsPath, file))(m_clHTTPSocket, m_clChildSocket, CST_DEP_SIKY);
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
	
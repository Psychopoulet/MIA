
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Q = require('q'),
		CST_DEP_SIKY = require('SIKY-API'),
		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var
				m_clThis = this,
				m_sConfFile = CST_DEP_Path.join(__dirname, '..', 'conf.json'),
				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket();
				
		// methodes

			// protected

				function _saveConf(p_stConf) {

					var deferred = CST_DEP_Q.defer();

						try {

							CST_DEP_FileSystem.writeFile(m_sConfFile, JSON.stringify(p_stConf), 'utf8', function (err) {

								if (err) {
									if (err.message) {
										deferred.reject(err.message);
									}
									else {
										deferred.reject(err);
									}
								}
								else {
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
			
			// public

				this.start = function () {

					var
						deferred = CST_DEP_Q.defer(),
						stConf = m_clThis.getConf();

						try {

							m_clHTTPServer.start(stConf.portweb)
								.then(function() {
									
									// plugins
										
										var sPluginsPath = CST_DEP_Path.join(__dirname, '..', 'plugins');

										CST_DEP_FileSystem.readdirSync(sPluginsPath).forEach(function (file) {
											require(CST_DEP_Path.join(sPluginsPath, file))(m_clHTTPSocket, m_clChildSocket, CST_DEP_SIKY);
										});

									// start
										
										m_clHTTPSocket.start(m_clHTTPServer.getServer())
											.then(function () {
												
												m_clChildSocket.start(stConf.portchildren)
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
				
				this.getConf = function () {
					return JSON.parse(CST_DEP_FileSystem.readFileSync(m_sConfFile), 'utf8');
				};
				
				this.setWebPort = function (p_nPort) {

					var deferred = CST_DEP_Q.defer(), stConf;

						try {

							stConf = m_clThis.getConf();
							stConf.portweb = p_nPort;

							_saveConf(stConf)
								.then(deferred.resolve)
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
				
				this.setChildrenPort = function (p_nPort) {

					var deferred = CST_DEP_Q.defer(), stConf;

						try {

							stConf = m_clThis.getConf();
							stConf.portchildren = p_nPort;

							_saveConf(stConf)
								.then(deferred.resolve)
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
				
	};
	
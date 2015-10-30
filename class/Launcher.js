
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Q = require('q'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Logs.js')),
		CST_DEP_MIA = require(CST_DEP_Path.join(__dirname, 'MIA.js')),
		CST_DEP_Conf = require(CST_DEP_Path.join(__dirname, 'Conf.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var
				m_clThis = this,
				m_sCommandFile = CST_DEP_Path.join(__dirname, '../', 'command.tmp'),
				m_tabArgs = process.argv.slice(2),
				m_sLaunchType = m_tabArgs[0],
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs')),
				m_clMIA = new CST_DEP_MIA();
				
		// methodes

			// public

				this.start = function () {

					var deferred = CST_DEP_Q.defer();

						try {

							if (CST_DEP_FileSystem.existsSync(m_sCommandFile)) {
								m_clLog.err('An another server is already running.');
							}
							else {

								CST_DEP_FileSystem.writeFile(m_sCommandFile, process.pid, function (err) {
									
									if (err) {
										if (err.message) {
											deferred.reject(err.message);
										}
										else {
											deferred.reject(err);
										}
									}
									else {

										m_clLog.log('[START ' + process.pid + ']');
										
										m_clMIA.start()
											.then(deferred.resolve)
											.catch(deferred.reject);

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

				};
				
				this.stop = function (p_fCallback) {

					var deferred = CST_DEP_Q.defer();

						try {

							if (!CST_DEP_FileSystem.existsSync(m_sCommandFile)) {
								m_clLog.log('[END]');
								deferred.resolve();
							}
							else {
								
								CST_DEP_FileSystem.readFile(m_sCommandFile, function (err, p_sData) {

									if (err) {
										if (err.message) {
											deferred.reject(err.message);
										}
										else {
											deferred.reject(err);
										}
									}
									else {

										CST_DEP_FileSystem.unlink(m_sCommandFile, function (err) {

											if (err) {
												if (err.message) {
													deferred.reject(err.message);
												}
												else {
													deferred.reject(err);
												}
											}
											else {

												m_clMIA.stop()
													.then(function () {

														var sPID = p_sData.toString();

														try {
															process.kill(sPID);
														}
														catch (e) {}

														m_clLog.log('[END ' + sPID + ']');

														deferred.resolve();

													})
													.catch(deferred.reject);

											}
											
										});
										
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

				};
				
				this.help = function () {

					var deferred = CST_DEP_Q.defer();

						try {

							console.log('--help | -H : get the commands');
							console.log('--version | -V : get the soft version');
							console.log('--start | -S : start MIA');
							console.log('--end | -E : stop MIA');
							console.log('--restart | -R : restart MIA');
							console.log('--webport | -WP : configure the watched port for the web interface');
							console.log('--childrenport | -CP : configure the watched port for the children communication');

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
				
				this.setWebPort = function () {

					var deferred = CST_DEP_Q.defer();

						try {

							if (m_tabArgs[1]) {

								new CST_DEP_Conf().setConfOption('portweb', parseInt(m_tabArgs[1])).save()
									.then(deferred.resolve)
									.catch(deferred.reject);

							}
							else {
								deferred.reject('\'port\' missing');
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

				};
				
				this.setChildrenPort = function () {

					var deferred = CST_DEP_Q.defer();

						try {

							if (m_tabArgs[1]) {

								new CST_DEP_Conf().setConfOption('portchildren', parseInt(m_tabArgs[1])).save()
									.then(deferred.resolve)
									.catch(deferred.reject);

							}
							else {
								deferred.reject('\'port\' missing');
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

				};
				
		// construct
			
			switch (m_sLaunchType) {
				
				case '--version' :
				case '-V' :
					console.log(m_clMIA.getVersion());
				break;
				
				case '--help' :
				case '-H' :
					this.help().catch(function (err) { m_clLog.err(err); });
				break;
				
				case '--start' :
				case '-S' :
					this.start().catch(function (err) { m_clLog.err(err); });
				break;
				
				case '--end' :
				case '-E' :
					this.stop().catch(function (err) { m_clLog.err(err); });
				break;
				
				case '--restart' :
				case '-R' :

					this.stop()
						.then(function () {
							m_clThis.start().catch(function (err) { m_clLog.err(err); });
						})
						.catch(function (err) { m_clLog.err(err); });

				break;
				
				case '--webport' :
				case '-WP' :
					this.setWebPort().catch(function (err) { m_clLog.err(err); });
				break;
				
				case '--childrenport' :
				case '-CP' :
					this.setChildrenPort().catch(function (err) { m_clLog.err(err); });
				break;
				
				case '' :
					m_clLog.err('Arg empty');
				break;
				
				default :
					m_clLog.err('Unknown arg \'' + m_sLaunchType + '\'');
				break;
				
			}
			
	};
	
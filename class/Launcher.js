
// dépendances
	
	var
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_MIA = require(CST_DEP_Path.join(__dirname, 'MIA.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var m_sCommandFile = CST_DEP_Path.join(__dirname, '../', 'command.tmp'),
				m_sLaunchType = process.argv.slice(2)[0],
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs'));
				
		// methodes
			
			this.start = function () {

				try {

					if (CST_DEP_FileStream.existsSync(m_sCommandFile)) {
						m_clLog.err('An another server is already running.');
					}
					else {

						m_clLog.log('[START ' + process.pid + ']');

						CST_DEP_FileStream.writeFile(m_sCommandFile, process.pid, function (p_vError) {
							
							if (p_vError) {
								m_clLog.err(p_vError);
							}
							else {
								new CST_DEP_MIA().start();
							}
							
						});

					}
						
				}
				catch (e) {
					m_clLog.err(e);
				}
				
			};
			
			this.stop = function (p_fCallback) {

				try {

					if (CST_DEP_FileStream.existsSync(m_sCommandFile)) {
						
						CST_DEP_FileStream.readFile(m_sCommandFile, function (p_vError, p_sData) {

							if (p_vError) {
								m_clLog.err(p_vError);
							}
							else {

								CST_DEP_FileStream.unlink(m_sCommandFile, function (p_vError) {

									if (p_vError) {
										m_clLog.err(p_vError);
									}
									else {

										new CST_DEP_MIA().stop(function () {

											var sPID = p_sData.toString();

											try {
												process.kill(sPID);
											}
											catch (e) {}

											m_clLog.log('[END ' + sPID + ']');

											if ('function' === typeof p_fCallback) {
												p_fCallback();
											}

										});

									}
									
								});
								
							}

						});

					}
					else if ('function' === typeof p_fCallback) {
						p_fCallback();
						m_clLog.log('[END]');
					}
						
				}
				catch (e) {
					m_clLog.err(e);
				}
				
			};
			
		// construct
			
			switch (m_sLaunchType) {
				
				case 'start' :
					this.start();
				break;
				
				case 'stop' :
					this.stop();
				break;
				
				case 'restart' :
					this.stop(this.start);
				break;
				
				case '' :
					m_clLog.err('Arg empty');
				break;
				
				default :
					m_clLog.err('Arg missing');
				break;
				
			}
			
	};
	
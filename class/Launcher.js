
// dépendances
	
	var
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_MIA = require(CST_DEP_Path.join(__dirname, 'MIA.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var m_sCommandFile = CST_DEP_Path.join(__dirname, '../', 'command.tmp'),
				m_sLaunchType = process.argv.slice(2)[0],
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs')),
				m_sConfFile = CST_DEP_Path.join(__dirname, '..', 'conf.json');
				
		// methodes

			// protected

				function _getConf() {
					return JSON.parse(CST_DEP_FileSystem.readFileSync(m_sConfFile), 'utf8');
				}
			
				function _setConf(p_stConf) {
					CST_DEP_FileSystem.writeFileSync(m_sConfFile, JSON.stringify(p_stConf), 'utf8');
				}
			
			// public

				this.start = function () {

					try {

						if (CST_DEP_FileSystem.existsSync(m_sCommandFile)) {
							m_clLog.err('An another server is already running.');
						}
						else {

							m_clLog.log('[START ' + process.pid + ']');

							CST_DEP_FileSystem.writeFile(m_sCommandFile, process.pid, function (p_vError) {
								
								if (p_vError) {
									m_clLog.err(p_vError);
								}
								else {
									new CST_DEP_MIA().start(_getConf());
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

						if (CST_DEP_FileSystem.existsSync(m_sCommandFile)) {
							
							CST_DEP_FileSystem.readFile(m_sCommandFile, function (p_vError, p_sData) {

								if (p_vError) {
									m_clLog.err(p_vError);
								}
								else {

									CST_DEP_FileSystem.unlink(m_sCommandFile, function (p_vError) {

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
				
				this.help = function () {

					console.log('--help | -H : get the commands');
					console.log('--version | -V : get the soft version');
					console.log('--start | -S : start MIA');
					console.log('--end | -E : stop MIA');
					console.log('--restart | -R : restart MIA');
					console.log('--webport | -WP : configure the watched port for the web interface');
					console.log('--childrenport | -CP : configure the watched port for the children communication');

				};
				
				this.setWebPort = function () {

					var
						stConf = _getConf(),
						tabArg = process.argv.slice(2);

						stConf.portweb = (tabArg[1]) ? tabArg[1] : stConf.portweb;

					_setConf(stConf);

				};
				
				this.setChildrenPort = function () {

					var
						stConf = _getConf(),
						tabArg = process.argv.slice(2);

						stConf.portchildren = (tabArg[1]) ? tabArg[1] : stConf.portchildren;

					_setConf(stConf);

				};
				
		// construct
			
			switch (m_sLaunchType) {
				
				case '--version' :
				case '-V' :
					console.log(new CST_DEP_MIA().getVersion());
				break;
				
				case '--help' :
				case '-H' :
					this.help();
				break;
				
				case '--start' :
				case '-S' :
					this.start();
				break;
				
				case '--end' :
				case '-E' :
					this.stop();
				break;
				
				case '--restart' :
				case '-R' :
					this.stop(this.start);
				break;
				
				case '--webport' :
				case '-WP' :
					this.setWebPort();
				break;
				
				case '--childrenport' :
				case '-CP' :
					this.setChildrenPort();
				break;
				
				case '' :
					m_clLog.err('Arg empty');
				break;
				
				default :
					m_clLog.err('Unknown arg \'' + m_sLaunchType + '\'');
				break;
				
			}
			
	};
	

// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Q = require('q');
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var
				m_clThis = this,
				m_sConfFile = CST_DEP_Path.join(__dirname, '..', 'conf.json'),
				m_stConf = m_stConf = JSON.parse(CST_DEP_FileSystem.readFileSync(m_sConfFile), 'utf8');
				
		// methodes
			
			// public

				this.getConf = function () {
					return m_stConf;
				};
				
				this.setConfOption = function (p_sKey, p_vValue) {
					m_stConf[p_sKey] = p_vValue;
					return m_clThis;
				};
				
				this.save = function() {

					var deferred = CST_DEP_Q.defer();

						try {

							CST_DEP_FileSystem.writeFile(m_sConfFile, JSON.stringify(m_stConf), 'utf8', function (err) {

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

	};
	
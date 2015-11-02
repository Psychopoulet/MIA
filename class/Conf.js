
// dépendances
	
	var
		fs = require('fs'),
		q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				m_clThis = this,
				m_sConfFile = require('path').join(__dirname, '..', 'conf.json'),
				m_stConf = JSON.parse(fs.readFileSync(m_sConfFile), 'utf8');
				
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

					var deferred = q.defer();

						try {

							fs.writeFile(m_sConfFile, JSON.stringify(m_stConf), 'utf8', function (err) {

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
	
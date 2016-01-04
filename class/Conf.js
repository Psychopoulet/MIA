
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_sFilePath = path.join(__dirname, '..', 'conf.json'),
				m_stConf = { };
				
		// methodes
			
			// public

				this.initialized = function (p_sKey, p_vValue) {

					var bResult = false;

						try {

							if (fs.lstatSync(m_sFilePath).isFile()) {
								bResult = true;
							}

						}
						catch (e) { }

					return bResult;

				};

				this.load = function () {

					var deferred = q.defer();

						if (!that.initialized()) {
							deferred.reject("La configuration n'est pas initialisée.");
						}
						else {

							fs.readFile(m_sFilePath, { encoding : 'utf8' } , function (err, data) {

								if (err) {
									deferred.reject('Impossible de lire le fichier de conf : ' + ((err.message) ? err.message : err) + '.');
								}
								else {

									try {

										m_stConf = JSON.parse(data);
										deferred.resolve();

									}
									catch (e) {
										deferred.reject('Impossible de récupérer les données du fichier de conf : ' + ((err.message) ? err.message : err) + '.');
									}

								}

							});

						}

					return deferred.promise;

				};

				this.save = function () {

					var deferred = q.defer();

						JSON.stringify(m_stConf);

						fs.writeFile(m_sFilePath, JSON.stringify(m_stConf), function (err) {

							if (err) {
								deferred.reject('Impossible de sauver le fichier de conf : ' + ((err.message) ? err.message : err) + '.');
							}
							else {
								deferred.resolve();
							}

						});

					return deferred.promise;

				};

				this.get = function (p_sKey, p_vValue) {
					return (m_stConf[p_sKey]) ? m_stConf[p_sKey] : '';
				};

				this.set = function (p_sKey, p_vValue) {
					m_stConf[p_sKey] = p_vValue;
					return that;
				};
				
	};
	
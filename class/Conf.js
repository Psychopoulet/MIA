
// dépendances
	
	var
		fs = require('fs'),
		q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_clSavingPromise = false,
				m_sFilePath = require('path').join(__dirname, '..', 'conf.json'),
				m_stConf = { };
				
		// methodes

			// private

				function _load() {

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

										if (m_stConf.debug) {
											console.log('load');
											console.log(data);
										}

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

				}
			
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

						if (m_clSavingPromise) {

							m_clSavingPromise
								.then(function() {

									_load()
										.then(deferred.resolve)
										.catch(deferred.reject);

								})
								.catch(deferred.reject);

						}
						else {

							_load()
								.then(deferred.resolve)
								.catch(deferred.reject);

						}

					return deferred.promise;

				};

				this.save = function () {

					var deferred = q.defer();

						m_clSavingPromise = deferred.promise;

						if (m_stConf.debug) {
							console.log('save');
							console.log(JSON.stringify(m_stConf));
						}

						fs.writeFile(m_sFilePath, JSON.stringify(m_stConf), function (err) {

							if (err) {
								deferred.reject('Impossible de sauvegarder le fichier de conf : ' + ((err.message) ? err.message : err) + '.');
							}
							else {
								deferred.resolve();
							}

							m_clSavingPromise = false;

						});

					return m_clSavingPromise;

				};

				this.get = function (p_sKey) {

					if (m_stConf.debug) {

						console.log('get ' + p_sKey);
						console.log((m_stConf[p_sKey]) ? m_stConf[p_sKey] : '');

					}

					return (m_stConf[p_sKey]) ? m_stConf[p_sKey] : '';

				};

				this.set = function (p_sKey, p_vValue) {

					if (m_stConf.debug) {
						
						console.log('set ' + p_sKey);
						console.log(p_vValue);

					}

					m_stConf[p_sKey] = p_vValue;
					return that;

				};
				
				this.addTo = function (p_sKey, p_vValue) {

					if (m_stConf.debug) {
						
						console.log('addTo ' + p_sKey);
						console.log(p_vValue);

					}

					m_stConf[p_sKey].push(p_vValue);
					return that;

				};
				
	};
	

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
				m_clSavingPromise = false,
				m_sFilePath = path.join(__dirname, '..', 'conf.json'),
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

						if (m_stConf.clients) {
							
							m_stConf.clients.forEach(function (value, key) {

								m_stConf.clients[key] = {
									token : value.token,
									name : value.name
								};

							});

						}

						if (m_stConf.childs) {
							
							m_stConf.childs.forEach(function (value, key) {

								m_stConf.childs[key] = {
									token : value.token,
									name : value.name
								};

							});

						}

						JSON.stringify(m_stConf);

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

				this.get = function (p_sKey, p_vValue) {
					return (m_stConf[p_sKey]) ? m_stConf[p_sKey] : '';
				};

				this.set = function (p_sKey, p_vValue) {
					m_stConf[p_sKey] = p_vValue;
					return that;
				};
				
	};
	
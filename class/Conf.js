
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

					var deferred = q.defer(), conf;

						m_clSavingPromise = deferred.promise;

						conf = m_stConf;

						if (conf.clients) {
							
							conf.clients.forEach(function (value, key) {

								conf.clients[key] = {
									allowed : value.allowed,
									token : value.token,
									name : value.name
								};

							});

						}

						if (conf.childs) {
							
							conf.childs.forEach(function (value, key) {

								conf.childs[key] = {
									allowed : value.allowed,
									token : value.token,
									name : value.name
								};

							});

						}
						
						if (m_stConf.debug) {
							console.log('save');
							console.log(JSON.stringify(conf));
						}

						fs.writeFile(m_sFilePath, JSON.stringify(conf), function (err) {

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
				
	};
	
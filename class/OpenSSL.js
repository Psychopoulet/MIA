
// dépendances
	
	const 	fs = require('fs'),
			q = require('q'),
			pem = require('pem');
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this;
				
		// methodes
			
			// public

				this.createPrivateKey = function (p_sKeyFilePath) {
					
					var deferred = q.defer();

						try {

							try {

								if (fs.lstatSync(p_sKeyFilePath).isFile()) {

									fs.readFile(p_sKeyFilePath, { encoding : 'utf8' } , function (err, data) {

										if (err) {
											deferred.reject('Impossible de lire la clef de sécurité : ' + ((err.message) ? err.message : err) + '.');
										}
										else {
											deferred.resolve({ privateKey : data });
										}

									});

								}

							}
							catch (e) {

								pem.createPrivateKey(2048, function(err, data) {

									if (err) {
										deferred.reject('Impossible de créer la clef de sécurité : ' + ((err.message) ? err.message : err) + '.');
									}
									else {

										fs.writeFile(p_sKeyFilePath, data.key, function (err) {

											if (err) {
												deferred.reject('Impossible de créer la clef de sécurité : ' + ((err.message) ? err.message : err) + '.');
											}
											else {
												deferred.resolve({ privateKey : data.key });
											}

										});

									}

								});

							}

						}
						catch (e) {
							deferred.reject('Impossible de créer la clef de sécurité : ' + ((e.message) ? e.message : e) + '.');
						}
						
					return deferred.promise;

				};

				this.createCSR = function (p_sKeyFilePath, p_sCSRFilePath) {
					
					var deferred = q.defer();
						
						try {

							that.createPrivateKey(p_sKeyFilePath)
								.then(function(createPrivateKeyData) {

									try {

										if (fs.lstatSync(p_sCSRFilePath).isFile()) {

											fs.readFile(p_sCSRFilePath, { encoding : 'utf8' } , function (err, CSR) {

												if (err) {
													deferred.reject('Impossible de lire la requète de signature du certificat : ' + ((err.message) ? err.message : err) + '.');
												}
												else {
													deferred.resolve({ privateKey : createPrivateKeyData.privateKey, CSR : CSR });
												}

											});

										}

									}
									catch (e) {

										pem.createCSR({ clientKey : createPrivateKeyData.privateKey, hash : 'sha256' }, function(err, data) {

											if (err) {
												deferred.reject('Impossible de créer la requète de signature du certificat : ' + ((err.message) ? err.message : err) + '.');
											}
											else {

												fs.writeFile(p_sCSRFilePath, data.csr, function (err) {

													if (err) {
														deferred.reject('Impossible de créer la requète de signature du certificat : ' + ((err.message) ? err.message : err) + '.');
													}
													else {
														deferred.resolve({ privateKey : createPrivateKeyData.privateKey, CSR : data.csr });
													}

												});

											}
											
										});

									}

								})
								.catch(deferred.reject);

						}
						catch (e) {
							deferred.reject('Impossible de créer la requète de signature du certificat : ' + ((e.message) ? e.message : e) + '.');
						}
						
					return deferred.promise;

				};

				this.createCertificate = function (p_sKeyFilePath, p_sCSRFilePath, p_sCRTFilePath) {
					
					var deferred = q.defer();

						try {

							that.createCSR(p_sKeyFilePath, p_sCSRFilePath)
								.then(function(createCSRData) {

									try {

										if (fs.lstatSync(p_sCRTFilePath).isFile()) {
											
											fs.readFile(p_sCRTFilePath, { encoding : 'utf8' } , function (err, certificate) {

												if (err) {
													deferred.reject("Impossible d'auto-assigner le certificat : ' + ((err.message) ? err.message : err) + '.");
												}
												else {
													deferred.resolve({ privateKey : createCSRData.privateKey, CSR : createCSRData.CSR, certificate : certificate });
												}

											});

										}

									}
									catch (e) {

										pem.createCertificate({ clientKey : createCSRData.privateKey, csr : createCSRData.CSR, selfSigned : true, days : 365 }, function(err, data) {

											if (err) {
												deferred.reject("Impossible d'auto-assigner le certificat : ' + ((err.message) ? err.message : err) + '.");
											}
											else {

												fs.writeFile(p_sCRTFilePath, data.certificate, function (err) {

													if (err) {
														deferred.reject("Impossible d'auto-assigner le certificat : ' + ((err.message) ? err.message : err) + '.");
													}
													else {
														deferred.resolve({ privateKey : createCSRData.privateKey, CSR : createCSRData.CSR, certificate :  data.certificate });
													}

												});

											}
											
										});

									}

								})
								.catch(deferred.reject);

						}
						catch (e) {
							deferred.reject("Impossible d'auto-assigner le certificat : " + ((e.message) ? e.message : e) + '.');
						}
						
					return deferred.promise;

				};

		// constructor

	};
	
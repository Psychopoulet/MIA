
// dépendances
	
	var
		path = require('path'),
		q = require('q'),
		fs = require('fs'),
		pem = require('pem'),

		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_clLog = new Logs(path.join(__dirname, '..', 'openssl'));
				
		// methodes
			
			// public

				this.createPrivateKey = function (p_sKeyFilePath) {
					
					var deferred = q.defer();

						try {

							try {

								if (fs.lstatSync(p_sKeyFilePath).isFile()) {

									fs.readFile(p_sKeyFilePath, { encoding : 'utf8' } , function (err, data) {

										if (err) {
											m_clLog.err('Impossible to read the security key.');
											deferred.reject('-- [OpenSSL] : Impossible to read the security key.');
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
										m_clLog.err('Impossible to create the security key.');
										deferred.reject('-- [OpenSSL] : Impossible to create the security key.');
									}
									else {

										fs.writeFile(p_sKeyFilePath, data.key, function (err) {

											if (err) {
												m_clLog.err('Impossible to create the security key.');
												deferred.reject('-- [OpenSSL] : Impossible to create the security key.');
											}
											else {

												m_clLog.success('Security key created.');
												deferred.resolve({ privateKey : data.key });

											}

										});

									}

								});

							}

						}
						catch (e) {
							m_clLog.err((e.message) ? e.message : e);
							deferred.reject('-- [OpenSSL] : Impossible to create the security key.');
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
													m_clLog.err('Impossible to read the signing request certificate.');
													deferred.reject('-- [OpenSSL] : Impossible to read the signing request certificate.');
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
												m_clLog.err('Impossible to create the signing request certificate.');
												deferred.reject('-- [OpenSSL] : Impossible to create the signing request certificate.');
											}
											else {

												fs.writeFile(p_sCSRFilePath, data.csr, function (err) {

													if (err) {
														m_clLog.err('Impossible to create the signing request certificate.');
														deferred.reject('-- [OpenSSL] : Impossible to create the signing request certificate.');
													}
													else {

														m_clLog.success('Signing request certificate created.');
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
							m_clLog.err((e.message) ? e.message : e);
							deferred.reject('-- [OpenSSL] :  Impossible to create the signing request certificate.');
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
													m_clLog.err('Impossible to autosign the certificate.');
													deferred.reject('-- [OpenSSL] : Impossible to autosign the certificate.');
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
												m_clLog.err('Impossible to autosign the certificate.');
												deferred.reject('-- [OpenSSL] : Impossible to autosign the certificate.');
											}
											else {

												fs.writeFile(p_sCRTFilePath, data.certificate, function (err) {

													if (err) {
														m_clLog.err('Impossible to autosign the certificate.');
														deferred.reject('-- [OpenSSL] : Impossible to autosign the certificate.');
													}
													else {
														m_clLog.success('Certificate autosigned.');
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
							m_clLog.err((e.message) ? e.message : e);
							deferred.reject('-- [OpenSSL] :  Impossible to autosign the certificate.');
						}
						
					return deferred.promise;

				};

		// constructor

	};
	
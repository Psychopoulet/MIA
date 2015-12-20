
// dépendances
	
	var
		path = require('path'),
		q = require('q'),
		fs = require('fs'),
		exec = require('child_process').exec,
		spawn = require('child_process').spawn,

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

				this.generateKey = function (p_sKeyFilePath) {
					
					var deferred = q.defer();

						try {

							try {

								if (fs.lstatSync(p_sKeyFilePath).isFile()) {
									deferred.resolve();
								}

							}
							catch (e) {

								exec('openssl genrsa -out "' + p_sKeyFilePath + '" 2048', function (err, stdout, stderr) {

									if (err) {
										m_clLog.err('-- [OpenSSL] : ' + ((stderr && '' !== stderr) ? stderr : 'Impossible to create the security key.'));
										deferred.reject('Impossible to create the security key.');
									}
									else {
										m_clLog.success('-- [OpenSSL] : ' + ((stdout && '' !== stdout) ? stdout : 'Security key created.'));
										deferred.resolve();
									}

								});
								
							}

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};

				this.signingRequestCertificate = function (p_sKeyFilePath, p_sCSRFilePath) {
					
					var deferred = q.defer(), openssl,
						stdout, stderr;
						
						try {

							try {

								if (fs.lstatSync(p_sCSRFilePath).isFile()) {
									deferred.resolve();
								}

							}
							catch (e) {

								openssl = spawn('openssl', ['req', '-new', '-key', '"' + p_sKeyFilePath + '"', '-out', '"' + p_sCSRFilePath + '"']),
								stdout = '', stderr = '';

								openssl.stdout.on('data', function (data) {
									stdout += data.toString('utf8');
								});

								openssl.stderr.on('data', function (data) {
									stderr += data.toString('utf8');
								});

								openssl.on('close', function() {

									if (0 < stderr.length) {

										m_clLog.err('-- [OpenSSL] : ' + stderr);
										deferred.reject('Impossible to create the signing request certificate.');

									}
									else {

										m_clLog.success('-- [OpenSSL] : ' + stdout);
										deferred.resolve('Signing request certificate created.');

									}

								});

							}

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};

				this.autosignCertificate = function (p_sKeyFilePath, p_sCSRFilePath, p_sCRTFilePath) {
					
					var deferred = q.defer();

						try {

							try {

								if (fs.lstatSync(p_sKeyFilePath).isFile()) {
									deferred.resolve();
								}

							}
							catch (e) {

								exec('openssl x509 -req -days 365 -in "' + p_sCSRFilePath + '" -signkey "' + p_sKeyFilePath + '" -out "' + p_sCRTFilePath + '"', function (err, stdout, stderr) {

									if (err) {
										m_clLog.err('-- [OpenSSL] : ' + ((stderr && '' !== stderr) ? stderr : 'Impossible to autosign the certificate.'));
										deferred.reject('Impossible to autosign the certificate.');
									}
									else {
										m_clLog.success('-- [OpenSSL] : ' + ((stdout && '' !== stdout) ? stdout : 'Certificate autosigned.'));
										deferred.resolve('Certificate autosigned.');
									}

								});
								
							}

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};

		// constructor

	};
	
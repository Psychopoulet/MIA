
"use strict";

// deps

// private

	var _pInsert;

// module

module.exports = class DBStatus {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS status (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" code VARCHAR(50) NOT NULL UNIQUE," +
					" name VARCHAR(50) NOT NULL," +
					" backgroundcolor VARCHAR(50) NOT NULL," +
					" textcolor VARCHAR(50) NOT NULL" +
			");", [], function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {

					that.getAll().then(function(status) {

						if (0 < status.length) {
							resolve(status);
						}
						else {

							that.add({ code : 'ACCEPTED', name : 'Accepté(e)', backgroundcolor : '#dff0d8', textcolor : '#3c763d' }).then(function() {

								that.add({ code : 'BLOCKED', name : 'Bloqué(e)', backgroundcolor : 'red', textcolor : 'black' }).then(function() {
									
									that.add({ code : 'WAITING', name : 'En attente', backgroundcolor : '#fcf8e3', textcolor : '#8a6d3b' }).then(function() {
										that.getAll().then(resolve).catch(reject);
									}).catch(reject);

								}).catch(reject);
								
							}).catch(reject);
					
						}

					}).catch(reject);

				}

			});

		});

	}

	add (status) {

		var that = this;

		return new Promise(function(resolve, reject) {

			if (!status) {
				reject('Aucun utilisateur renseigné.');
			}
			else if (!status.code) {
				reject('Aucun code renseigné.');
			}
			else if (!status.name) {
				reject('Aucun nom renseigné.');
			}
			else if (!status.backgroundcolor) {
				reject('Aucune couleur de fond renseignée.');
			}
			else if (!status.textcolor) {
				reject('Aucune couleur de texte renseignée.');
			}
			else {

				if (!_pInsert) {
					_pInsert = that.db.prepare("INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES (:code, :name, :backgroundcolor, :textcolor);");
				}

				_pInsert.run({
					':code': status.code,
					':name': status.name,
					':backgroundcolor': status.backgroundcolor,
					':textcolor': status.textcolor
				}, function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						that.lastInserted().then(resolve).catch(reject);
					}

				});

			}

		});

	}

	lastInserted () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.get("SELECT id, code, name, backgroundcolor, textcolor FROM status ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
				
				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((row) ? row : {});
				}

			});

		});

	}

	getAll () {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.all("SELECT id, code, name, backgroundcolor, textcolor FROM status;", [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((rows) ? rows : []);
				}

			});

		});

	}

	getOneByCode (code) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(status) {

				var stResult;

				for (var i = 0; i < status.length; ++i) {

					if (status[i].code === code) {
						stResult = status[i];
						break;
					}

				}

				if (stResult) {
					resolve(stResult);
				}
				else {
					reject("Le code statut '" + code + "' n'existe pas.");
				}

			})
			.catch(reject);

		});

	}

};

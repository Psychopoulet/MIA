
"use strict";

// module

module.exports = class DBStatus {

	constructor (db) {
		this.db = db;
	}

	add (status) {

		let that = this;

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

				that.db.run("INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES (:code, :name, :backgroundcolor, :textcolor);", {
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

		let that = this;

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
		
		let that = this;

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
		
		let that = this;

		return new Promise(function(resolve, reject) {

			that.getAll().then(function(status) {

				let stResult;

				for (let i = 0; i < status.length; ++i) {

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

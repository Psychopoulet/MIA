
"use strict";

module.exports = class DBActionsTypes {

	constructor (db) {
		this.db = db;
	}

	add (actiontype) {

		let that = this;

		return new Promise(function(resolve, reject) {

			if (!actiontype) {
				reject("Aucun type d'action renseigné.");
			}
			else if (!actiontype.name) {
				reject('Aucun nom renseigné.');
			}
			else if (!actiontype.command) {
				reject('Aucune commande renseignée.');
			}
			else {

				that.db.run("INSERT INTO actionstypes (name, command) VALUES (:name, :command);", {
					':name': actiontype.name,
					':command': actiontype.command
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

			that.db.get("SELECT id, name, command FROM actionstypes ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
				
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

			that.db.all("SELECT id, name, command FROM actionstypes;", [], function(err, rows) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((rows) ? rows : []);
				}

			});

		});

	}

};


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

				that.getOneByCommand(actiontype.command).then(function(actiontype) {

					if (actiontype) {
						reject('Cette commande existe déjà.');
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

				}).catch(reject);

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

	getOneByCommand(command) {
		
		let that = this;
		return new Promise(function(resolve, reject) {

			if (!command) {
				reject('Aucune commande renseignée.');
			}
			else {

				that.db.all("SELECT id, name, command FROM actionstypes WHERE command = :command;", {
					':command': actiontype.command
				}, function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((rows) ? rows[0] : null);
					}

				});

			}

		});

	}

};

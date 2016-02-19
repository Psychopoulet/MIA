
"use strict";

// deps

// private

	var _pInsert;

// module

module.exports = class DBActionsTypes {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS actionstypes (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" name VARCHAR(50) NOT NULL," +
					" command VARCHAR(100) NOT NULL" +
			");", [], function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {

					that.add({ name : 'Jouer un son', command : 'media.sound.play' }).then(function() {

						that.add({ name : 'Jouer une vidéo', command : 'media.video.play' }).then(function() {
							that.getAll().then(resolve).catch(reject);
						}).catch(reject);

					}).catch(reject);
					
				}

			});

		});

	}

	add (actiontype) {

		var that = this;

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

				if (!_pInsert) {
					_pInsert = that.db.prepare("INSERT INTO actionstypes (name, command) VALUES (:name, :command);");
				}

				_pInsert.run({
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

	lastInserted() {

		var that = this;

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

	getAll() {
		
		var that = this;

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

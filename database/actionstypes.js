
"use strict";

// deps

// module

module.exports = class DBActionsTypes extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

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

			}).catch(reject);

		});

	}

	add (actiontype) {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				if (!actiontype) {
					reject('Aucun utilisateur renseigné.');
				}
				else if (!actiontype.name) {
					reject('Aucun nom renseigné.');
				}
				else if (!actiontype.command) {
					reject('Aucune commande renseignée.');
				}
				else {

					that.db.run(
						"INSERT INTO actionstypes (name, command) VALUES (:name, :command);", {
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

		});

	}

	lastInserted() {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.get("SELECT id, name, command FROM actionstypes ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(row);
					}

				});

			}).catch(reject);

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.all("SELECT id, name, command FROM actionstypes;", [], function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(rows);
					}

				});

			}).catch(reject);

		});

	}

};

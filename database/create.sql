
-- status

CREATE TABLE IF NOT EXISTS status (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	backgroundcolor VARCHAR(50) NOT NULL,
	textcolor VARCHAR(50) NOT NULL
);

-- users, childs & clients

CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	login VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	email VARCHAR(250) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS childs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_status INTEGER,
	token VARCHAR(100) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_user INTEGER,
	id_status INTEGER,
	token VARCHAR(100) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- crons

CREATE TABLE IF NOT EXISTS crons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_user INTEGER,
	name VARCHAR(50) NOT NULL,
	timer VARCHAR(50) NOT NULL,
	FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- basic data

INSERT INTO users (login, password, email) VALUES
('rasp', 'd74bc8c7cb18433b140785ae51c48c77b4dc2208', '');

INSERT INTO actionstypes (name, command) VALUES
('Jouer un son', 'media.sound.play'),
('Jouer une vidéo', 'media.video.play'),
('Lire un texte', 'tts');

INSERT INTO crons (id_user, name, timer) VALUES
(1, 'Café !!', '00 00 16 * * 1-5'),
(1, 'Manger !!', '00 30 12 * * 1-5');

INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES
('ACCEPTED', 'Accepté(e)', '#dff0d8', '#3c763d'),
('BLOCKED', 'Bloqué(e)', 'red', 'black'),
('WAITING', 'En attente', '#fcf8e3', '#8a6d3b');

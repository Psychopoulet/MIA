
-- status

CREATE TABLE IF NOT EXISTS status (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	color_background VARCHAR(25) NOT NULL,
	color_text VARCHAR(25) NOT NULL
);

-- users

CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	login VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL,
	email VARCHAR(250) NOT NULL DEFAULT ''
);

-- crons

CREATE TABLE IF NOT EXISTS crons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_user INTEGER,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	timer VARCHAR(50) NOT NULL,
	FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- devices

CREATE TABLE IF NOT EXISTS devices_functions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS devices_types (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_function INTEGER NOT NULL,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(25) NOT NULL,
	FOREIGN KEY(id_function) REFERENCES devices_functions(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_status INTEGER NOT NULL,
	id_type INTEGER NOT NULL,
	id_user INTEGER DEFAULT NULL,
	name VARCHAR(50) NOT NULL,
	token VARCHAR(100) NOT NULL UNIQUE,
	FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(id_type) REFERENCES devices_types(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

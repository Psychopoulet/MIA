
"use strict";

// deps

	const path = require("path"),

		gulp = require("gulp"),
		eslint = require("gulp-eslint"),
		excludeGitignore = require("gulp-exclude-gitignore"),
		plumber = require("gulp-plumber");

// private

	var _gulpFile = path.join(__dirname, "gulpfile.js"),

		_libFiles = path.join(__dirname, "lib", "*.js"),
			_databaseFiles = path.join(__dirname, "lib", "database", "**", "*.js"),
			_serversFiles = path.join(__dirname, "lib", "servers", "*.js"),
				_apiFiles = path.join(__dirname, "lib", "servers", "api", "**", "*.js"),

		_allJSFiles = [_gulpFile, _libFiles, _databaseFiles, _serversFiles, _apiFiles];

// tasks

	gulp.task("eslint", () => {

		return gulp.src(_allJSFiles)
			.pipe(plumber())
			.pipe(excludeGitignore())
			.pipe(eslint({
				"parserOptions": {
					"ecmaVersion": 6
				},
				"rules": {
					"linebreak-style": 0,
					"quotes": [ 1, "double" ],
					"indent": 0,
					// "indent": [ 2, "tab" ],
					"semi": [ 2, "always" ]
				},
				"env": {
					"node": true, "es6": true, "mocha": true
				},
				"extends": "eslint:recommended"
			}))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());

	});

// watcher

	gulp.task("watch", () => {
		gulp.watch(_allJSFiles, ["eslint"]);
	});


// default

	gulp.task("default", ["eslint"]);

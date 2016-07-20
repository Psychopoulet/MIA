
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

	gulp.task("eslint", function () {

		return gulp.src(_allJSFiles)
			.pipe(plumber())
			.pipe(excludeGitignore())
			.pipe(eslint({
				"rules": {
					"indent": 0
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

	gulp.task("watch", function () {
		gulp.watch(_allJSFiles, ["eslint"]);
	});


// default

	gulp.task("default", ["eslint"]);


// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		q = require('q'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_tabCategories = [],
				m_sBufferFilePath = path.join(__dirname, 'backup.json'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos'));
				
		// methods

			// private

				function _load() {

					var deferred = q.defer();

						try {

							fs.readFile(m_sBufferFilePath, { encoding : 'utf8' } , function (err, data) {

								if (err) {
									deferred.reject('Impossible de lire les données enregistrée : ' + ((err.message) ? err.message : err) + '.');
								}
								else {

									try {
										m_tabCategories = JSON.parse(data);
										deferred.resolve();
									}
									catch (e) {
										deferred.reject('Impossible de lire les données enregistrée : ' + ((err.message) ? err.message : err) + '.');
									}

								}

							});

						}
						catch(e) {
							deferred.reject((e.message) ? e.message : e);
						}
					
					return deferred.promise;

				}

				function _save() {

					var deferred = q.defer();

						try {

							fs.writeFile(m_sBufferFilePath, JSON.stringify(m_tabCategories), { encoding : 'utf8' } , function (err, data) {

								if (err) {
									deferred.reject('Impossible de sauvegarder les données : ' + ((err.message) ? err.message : err) + '.');
								}
								else {
									deferred.resolve();
								}

							});

						}
						catch (e) {
							deferred.reject('Impossible de sauvegarder les données : ' + ((err.message) ? err.message : err) + '.');
						}

					return deferred.promise;

				}

				function _loadCategories() {

					var tabCategories = [];

					if (0 < m_tabCategories.length) {

						m_tabCategories.forEach(function(category) {

							tabCategories.push({
								code : category.code,
								name : category.name
							});

						});

						Container.get('server.socket.web').emit('plugins.videos.categories', tabCategories);
						
					}
					else {

						_load().then(function() {

							m_tabCategories.forEach(function(category) {

								tabCategories.push({
									code : category.code,
									name : category.name
								});

							});

							Container.get('server.socket.web').emit('plugins.videos.categories', tabCategories);

						});

					}

				}

				function _loadVideosByCategory(p_stCategory) {

					var tabVideos = [];

						m_tabCategories.forEach(function(category) {

							if (category.code === p_stCategory.code) {
								tabVideos = category.videos;
							}

						});

					Container.get('server.socket.web').emit('plugins.videos.videos', tabVideos);

				}

				function _formateVideo(video) {

					video.url = video.url 	.replace('http:', 'https:')
											.replace('m.', '')
											.replace('//youtu', '//www.youtu')
											.replace('youtu.be/', 'youtube.com/watch?v=')
											.replace(/&(.*)/, '');

					video.urlembeded = video.url 	.replace('.com/', '.com/embed/')
													.replace('watch?v=', '');

					if (!video.code || '' == video.code) {

						if (1 < video.url.split('=').length) {
							video.code = video.url.split('=')[1];
						}
						else {
							video.code = video.name;
						}

					}

					return video;

				}

		// constructor

			// events

				Container.get('server.socket.web').onDisconnect(function(socket) {

					// categories

						socket.removeAllListeners('plugins.videos.category.add');
						socket.removeAllListeners('plugins.videos.category.edit');
						socket.removeAllListeners('plugins.videos.category.delete');

					// videos

						socket.removeAllListeners('plugins.videos.videos');

						socket.removeAllListeners('plugins.videos.video.add');
						socket.removeAllListeners('plugins.videos.video.edit');
						socket.removeAllListeners('plugins.videos.video.delete');

						socket.removeAllListeners('plugins.videos.video.play');

				})
				.onLog(function(socket) {

					_loadCategories();

					// categories

						socket.on('plugins.videos.category.add', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.category.add');
							}

							var bFound = false;

								m_tabCategories.forEach(function(category) {

									if (category.code === data.code) {
										bFound = true;
									}

								});

							if (bFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Cette catégorie existe déjà.');
							}
							else {
								
								data = {
									code : data.name,
									name : data.name,
									videos : []
								};

								m_tabCategories.push(data);

								_save().then(function() {

									Container.get('server.socket.web').emit('plugins.videos.category.added', {
										code : data.name,
										name : data.name
									});

								})
								.catch(function(err) {
									Container.get('server.socket.web').emit('plugins.videos.error', err);
								});

							}

						})
						.on('plugins.videos.category.edit', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.category.edit');
							}

							var bFound = false;

								m_tabCategories.forEach(function(category, key) {

									if (category.code === data.code) {
										bFound = true;
										m_tabCategories[key].name = data.name;
									}

								});

							if (!bFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette catégorie.');
							}
							else {

								_save().then(function() {

									Container.get('server.socket.web').emit('plugins.videos.category.edited', {
										code : data.code,
										name : data.name
									});

								})
								.catch(function(err) {
									Container.get('server.socket.web').emit('plugins.videos.error', err);
								});

							}

						})
						.on('plugins.videos.category.delete', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.category.delete');
							}

							m_tabCategories.forEach(function(category, key) {

								if (category.code === data.code) {
									m_tabCategories.splice(key, 1);
								}

							});

							_save().then(_loadCategories)
							.catch(function(err) {
								Container.get('server.socket.web').emit('plugins.videos.error', err);
							});

						});

					// videos

						socket.on('plugins.videos.videos', _loadVideosByCategory)

						socket.on('plugins.videos.video.add', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.video.add');
							}

							var bCategoryFound = false, stVideo = false;

								m_tabCategories.forEach(function(category, key) {

									if (category.code === data.category.code) {

										bCategoryFound = true;

										stVideo = _formateVideo(data.video);

										category.videos.forEach(function(video, vidkey) {

											if (video.code === stVideo.code) {
												stVideo = false;
											}

										});

										if (stVideo) {
											m_tabCategories[key].videos.push(stVideo);
										}

									}

								});

							if (!bCategoryFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette catégorie.');
							}
							else if (!stVideo) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Cette vidéo est déjà enregistrée.');
							}
							else {
								
								_save().then(function() {
									Container.get('server.socket.web').emit('plugins.videos.video.added', stVideo);
								})
								.catch(function(err) {
									Container.get('server.socket.web').emit('plugins.videos.error', err);
								});

							}

						})
						.on('plugins.videos.video.edit', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.video.edit');
							}

							var bCategoryFound = false, stVideo = false;

								m_tabCategories.forEach(function(category, catkey) {

									if (category.code === data.category.code) {

										bCategoryFound = true;

										category.videos.forEach(function(video, vidkey) {

											if (video.code === data.video.code) {
												stVideo = _formateVideo(data.video);
												m_tabCategories[catkey].videos[vidkey] = stVideo;
											}

										});

									}

								});

							if (!bCategoryFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette catégorie.');
							}
							else if (!stVideo) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette vidéo.');
							}
							else {

								_save().then(function() {
									Container.get('server.socket.web').emit('plugins.videos.video.edited', stVideo);
								})
								.catch(function(err) {
									Container.get('server.socket.web').emit('plugins.videos.error', err);
								});

							}

						})
						.on('plugins.videos.video.delete', function (data) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.video.delete');
							}

							var bCategoryFound = false, bVideoFound = false;

								m_tabCategories.forEach(function(category, catkey) {

									if (category.code === data.category.code) {

										bCategoryFound = true;

										category.videos.forEach(function(video, vidkey) {

											if (video.code === data.video.code) {
												bVideoFound = true;
												m_tabCategories[catkey].videos.splice(vidkey, 1);
											}

										});

									}

								});

							if (!bCategoryFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette catégorie.');
							}
							else if (!bVideoFound) {
								Container.get('server.socket.web').emit('plugins.videos.error', 'Impossible de trouver cette vidéo.');
							}
							else {

								_save().then(function() {
									_loadVideosByCategory(data.category);
								})
								.catch(function(err) {
									Container.get('server.socket.web').emit('plugins.videos.error', err);
								});

							}

						});

						// action

							socket.on('plugins.videos.video.playsound', function (data) {

								if (Container.get('conf').get('debug')) {
									m_clLog.log('plugins.videos.video.playsound');
								}

								if (!data) {
									m_clLog.err('play video - données manquantes');
									socket.emit('plugins.videos.error', 'Données manquantes');
								}
								else if (!data.child) {
									m_clLog.err('play video - aucun enfant choisi');
									socket.emit('plugins.videos.error', 'Aucun enfant choisi');
								}
								else if (!data.video) {
									m_clLog.err('play video - aucune vidéo choisie');
									socket.emit('plugins.videos.error', 'Aucune vidéo choisie');
								}
								else {
									Container.get('server.socket.child').emitTo(data.child.token, 'media.sound.play', data.video);
								}

							});

							socket.on('plugins.videos.video.playvideo', function (data) {

								if (Container.get('conf').get('debug')) {
									m_clLog.log('plugins.videos.video.playvideo');
								}

								if (!data) {
									m_clLog.err('play video - données manquantes');
									socket.emit('plugins.videos.error', 'Données manquantes');
								}
								else if (!data.child) {
									m_clLog.err('play video - aucun enfant choisi');
									socket.emit('plugins.videos.error', 'Aucun enfant choisi');
								}
								else if (!data.video) {
									m_clLog.err('play video - aucune vidéo choisie');
									socket.emit('plugins.videos.error', 'Aucune vidéo choisie');
								}
								else {
									Container.get('server.socket.child').emitTo(data.child.token, 'media.video.play', data.video);
								}

							});

				});

	};
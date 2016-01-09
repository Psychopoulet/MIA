
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_tabCategories = [
					{
						code : 'reveils',
						name : 'Réveils',
						videos : [
							{
								code : 'test1',
								name : 'Test 1'
							},
							{
								code : 'test2',
								name : 'Test 2'
							}
						]
					}
				],
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos'));
				
		// methods

			// private

				// SIKY

					function _loadCategories() {

						var tabCategories = [];

							m_tabCategories.forEach(function(category) {

								tabCategories.push({
									code : category.code,
									name : category.name
								});

							});

						Container.get('server.socket.web').emit('plugins.videos.categories', tabCategories);
						
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
				.onConnection(function(socket) {

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
								Container.get('server.socket.web').emit('plugins.videos.videos.error', 'Cette catégorie existe déjà.');
							}
							else {
								
								data = {
									code : data.name,
									name : data.name,
									videos : []
								};

								m_tabCategories.push(data);

								Container.get('server.socket.web').emit('plugins.videos.category.added', {
									code : data.name,
									name : data.name
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

							if (bFound) {

								Container.get('server.socket.web').emit('plugins.videos.category.edited', {
									code : data.code,
									name : data.name
								});

							}
							else {
								Container.get('server.socket.web').emit('plugins.videos.videos.error', 'Impossible de trouver cette catégorie.');
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

							_loadCategories();

						});

					// videos

						socket.on('plugins.videos.videos', _loadVideosByCategory)

						socket.on('plugins.videos.video.add', function (p_stData) {

							var bFound = false;

								m_tabCategories.forEach(function(category) {

									if (category.code === p_stData.category.code) {
										bFound = true;
										m_tabCategories.videos.push(p_stData.video);
									}

								});

							if (bFound) {
								
								if (Container.get('conf').get('debug')) {
									m_clLog.log('plugins.videos.video.add');
								}

								Container.get('server.socket.web').emit('plugins.videos.video.added', {
									code : p_stData.video.name,
									name : p_stData.video.name,
									url : p_stData.video.url
								});

							}
							else {
								Container.get('server.socket.web').emit('plugins.videos.videos.error', 'Impossible de trouver cette catégorie.');
							}

						})
						.on('plugins.videos.video.edit', function (p_stData) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.video.edit');
							}

							_loadVideosByCategory(p_stData.category);

						})
						.on('plugins.videos.video.delete', function (p_stData) {

							if (Container.get('conf').get('debug')) {
								m_clLog.log('plugins.videos.video.delete');
							}

							_loadVideosByCategory(p_stData.category);

						});

						// action

							socket.on('plugins.videos.video.play', function (data) {

								if (Container.get('conf').get('debug')) {
									m_clLog.log('plugins.videos.video.play');
								}

								if (!data) {
									m_clLog.err('play video - données manquantes');
									socket.emit('plugins.videos.videos.error', 'Données manquantes');
								}
								else if (!data.child) {
									m_clLog.err('play video - aucun enfant choisi');
									socket.emit('plugins.videos.videos.error', 'Aucun enfant choisi');
								}
								else if (!data.video) {
									m_clLog.err('play video - aucune vidéo choisie');
									socket.emit('plugins.videos.videos.error', 'Aucune vidéo choisie');
								}
								else {
									Container.get('server.socket.child').emitTo(data.child.token, 'plugins.videos.video.play', data.video);
								}

							});

				});

				Container.get('server.socket.child').onDisconnect(function(socket) {

					socket.removeAllListeners('child.videos.error');
					socket.removeAllListeners('child.videos.played');
					socket.removeAllListeners('child.videos.downloaded');

					Container.get('server.socket.web').emit('child.disconnected', socket.MIA);

				})
				.onConnection(function(socket) {

					socket
						.on('child.videos.error', function (error) {
							m_clLog.err('play video - ' + error);
							Container.get('server.socket.child').emit('child.videos.error', error);
						})
						.on('child.videos.played', function () {
							m_clLog.log('child.videos.played');
							Container.get('server.socket.child').emit('child.videos.played');
						})
						.on('child.videos.downloaded', function (video) {
							m_clLog.log('child.videos.downloaded');
							Container.get('server.socket.child').emit('child.videos.downloaded', video);
						});

				});

	};
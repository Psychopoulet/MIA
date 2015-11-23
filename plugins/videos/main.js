
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_sLocalFile = path.join(__dirname, 'backup.json'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos')),
				m_tabCategories = [],
				m_tabVideos = [];
				
		// methods

			// private

				// cache
					
					function _readCache() {

						if (fs.existsSync(m_sLocalFile)) {

							try {

								var stData = JSON.parse(fs.readFileSync(m_sLocalFile, 'utf8'));

								if (stData.categories) {
									m_tabCategories = stData.categories;
								}
								if (stData.videos) {
									m_tabVideos = stData.videos;
								}

							}
							catch(e) {
								m_clLog.err((e.message) ? e.message : e);
							}

						}

					}

					function _writeCache() {

						try {

							fs.writeFileSync(m_sLocalFile, JSON.stringify({
								categories : m_tabCategories,
								videos : m_tabVideos
							}), 'utf8');

						}
						catch(e) {
							m_clLog.err((e.message) ? e.message : e);
						}

					}

				// SIKY

					/*function _loadCategoriesFromSIKY() {

						Container.get('sikyapi').query('videos', 'categories', 'GET')
							.then(function (p_tabData) {
								m_tabCategories = p_tabData; _writeCache();
								Container.get('server.socket.web').emit('web.videos.categories.getall', m_tabData);
							})
							.catch(function (err){
								m_clLog.err(err);
								Container.get('server.socket.web').emit('web.videos.error', err);
							});

					}

					function _loadVideosByCategoryFromSIKY(p_nIdCategory) {

						var stCategory = {};

						for (var i = 0; i < m_tabCategories; ++i) {

							if (m_tabCategories[i].id == p_nIdCategory) {
								stCategory = m_tabCategories[i];
								break;
							}

						}

						if (stCategory.id && 0 < stCategory.id) {

							Container.get('sikyapi').query('videos', 'videos?category.id=' + stCategory.id, 'GET')
								.then(function (p_tabData) {

									var tabVideos = [];

									for (var i = 0; i < m_tabVideos; ++i) {

										if (m_tabVideos[i].category.id != stCategory.id) {
											tabVideos.push(m_tabVideos[i]);
										}

									}

									m_tabVideos = tabVideos;

									for (var i = 0; i < p_tabData; ++i) {
										p_tabData.category = stCategory;
										m_tabVideos.push(p_tabData);
									}

									_writeCache();
									Container.get('server.socket.web').emit('web.videos.videos.getallbycategory', m_tabData);

								})
								.catch(function (err){
									m_clLog.err(err);
									Container.get('server.socket.web').emit('web.videos.error', err);
								});

						}

					}*/

		// constructor

			// events

				Container.get('server.socket.web')
					.onDisconnect(function(socket) {

						// categories

							socket.removeAllListeners('web.videos.categories.getall');

							socket.removeAllListeners('web.videos.categories.add');
							socket.removeAllListeners('web.videos.categories.edit');
							socket.removeAllListeners('web.videos.categories.delete');

						// videos

							socket.removeAllListeners('web.videos.videos.getallbycategory');

							socket.removeAllListeners('web.videos.videos.add');
							socket.removeAllListeners('web.videos.videos.edit');
							socket.removeAllListeners('web.videos.videos.delete');

							socket.removeAllListeners('web.videos.videos.play');

					})
					.onConnection(function(socket) {

						socket

							// categories

								// read

									.on('web.videos.categories.getall', function () {

										console.log(m_tabCategories);

										socket.emit('web.videos.categories.getall', m_tabCategories);

									})
								
								// write

									.on('web.videos.categories.add', function (data) {

										m_tabCategories.push(data);
										_writeCache();
										Container.get('server.socket.web').emit('web.videos.categories.added', m_tabCategories);
										
										console.log(m_tabCategories);

										/*Container.get('sikyapi').query('videos', 'categories', 'POST')
											.then(_loadCategoriesFromSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})
									.on('web.videos.categories.edit', function (data) {

										for (var i = 0, l = m_tabCategories.length; i < l; ++i) {

											if (data.id == m_tabCategories[i].id) {
												m_tabCategories[i] = data;
												break;
											}

										}

										_writeCache();
										Container.get('server.socket.web').emit('web.videos.categories.edited', m_tabCategories);

										console.log(m_tabCategories);

										/*Container.get('sikyapi').query('videos', 'categories/' + data.id, 'PUT')
											.then(_loadCategoriesFromSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})
									.on('web.videos.categories.delete', function (data) {

										for (var i = 0, l = m_tabCategories.length; i < l; ++i) {

											if (data.id == m_tabCategories[i].id) {
												m_tabCategories.slice(i, 1);
												break;
											}

										}

										_writeCache();
										Container.get('server.socket.web').emit('web.videos.categories.deleted', m_tabCategories);

										console.log(m_tabCategories);

										/*Container.get('sikyapi').query('videos', 'categories/' + data.id, 'DELETE')
											.then(_loadCategoriesFromSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})

							// videos

								// read

									.on('web.videos.videos.getallbycategory', function (p_nIdCategory) {

										var stCategory = {};

										for (var i = 0; i < m_tabCategories; ++i) {

											if (m_tabCategories[i].id == p_nIdCategory) {
												stCategory = m_tabCategories[i];
												break;
											}

										}

										if (stCategory.id && 0 < stCategory.id) {

											var tabVideos = [];

											for (var i = 0; i < m_tabVideos; ++i) {

												if (m_tabVideos[i].category.id != stCategory.id) {
													tabVideos.push(m_tabVideos[i]);
												}

											}

											console.log(tabVideos);

											socket.emit('web.videos.videos.getallbycategory', tabVideos);

										}
										else {
											console.log(tabVideos);
											socket.emit('web.videos.videos.getallbycategory', []);
										}

									})
								
								// write

									.on('web.videos.videos.add', function (data) {

										m_tabVideos.push(data);
										_writeCache();
										Container.get('server.socket.web').emit('web.videos.videos.added', m_tabVideos);
										
										/*Container.get('sikyapi').query('videos', 'videos', 'POST')
											.then(_loadFormSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})
									.on('web.videos.videos.edit', function (data) {

										for (var i = 0, l = m_tabVideos.length; i < l; ++i) {

											if (data.id == m_tabVideos[i].id) {
												m_tabVideos[i] = data;
												break;
											}

										}

										_writeCache();
										Container.get('server.socket.web').emit('web.videos.videos.edited', m_tabVideos);

										/*Container.get('sikyapi').query('videos', 'videos/' + data.id, 'PUT')
											.then(_loadFormSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})
									.on('web.videos.videos.delete', function (data) {

										for (var i = 0, l = m_tabVideos.length; i < l; ++i) {

											if (data.id == m_tabVideos[i].id) {
												m_tabVideos.slice(i, 1);
												break;
											}

										}

										_writeCache();
										Container.get('server.socket.web').emit('web.videos.videos.deleted', m_tabVideos);

										/*Container.get('sikyapi').query('videos', 'videos/' + data.id, 'DELETE')
											.then(_loadFormSIKY)
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});*/

									})

								// action

									.on('web.videos.videos.play', function (data) {

										if (!data) {
											m_clLog.err('Missing data');
											socket.emit('web.videos.error', 'Missing data');
										}
										else if (!data.token) {
											m_clLog.err('Missing \'token\' data');
											socket.emit('web.videos.error', 'Missing \'token\' data');
										}
										else if (!data.video) {
											m_clLog.err('Missing \'video\' data');
											socket.emit('web.videos.error', 'Missing \'video\' data');
										}
										else {
											Container.get('server.socket.child').emitTo(data.token, 'child.videos.videos.played', data.video);
										}

									});

					});

				Container.get('server.socket.child')
					.onDisconnect(function(socket) {

						socket.removeAllListeners('child.videos.error');
						socket.removeAllListeners('child.videos.played');
						socket.removeAllListeners('child.videos.downloaded');

						Container.get('server.socket.web').emit('child.disconnected', socket.MIA);

					})
					.onConnection(function(socket) {

						socket
							.on('child.videos.error', function (error) {
								m_clLog.err(error);
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

			// data

				_readCache();
				//Container.get('sikyapi').onLogin(_loadCategoriesFormSIKY);
						
	};
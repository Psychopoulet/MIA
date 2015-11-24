
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos'));
				
		// methods

			// private

				// SIKY

					function _loadCategoriesFromSIKY() {

						Container.get('sikyapi').query('videos', 'categories', 'GET')
							.then(function (p_tabData) {
								Container.get('server.socket.web').emit('web.videos.categories.getall', p_tabData);
							})
							.catch(function (err){
								m_clLog.err(err);
								Container.get('server.socket.web').emit('web.videos.error', err);
							});

					}

					function _loadVideosByCategoryFromSIKY(p_stCategory) {

						Container.get('sikyapi').query('videos', 'videos?category.id=' + parseInt(p_stCategory.id), 'GET')
							.then(function (p_tabData) {
								Container.get('server.socket.web').emit('web.videos.videos.getallbycategory', p_tabData);
							})
							.catch(function (err){
								m_clLog.err(err);
								Container.get('server.socket.web').emit('web.videos.error', err);
							});

					}

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

									.on('web.videos.categories.getall', _loadCategoriesFromSIKY)
								
								// write

									.on('web.videos.categories.add', function (data) {

										Container.get('sikyapi').query('videos', 'categories', 'POST', data)
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.categories.added');
												_loadCategoriesFromSIKY();
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

									})
									.on('web.videos.categories.edit', function (data) {

										Container.get('sikyapi').query('videos', 'categories/' + data.id, 'PUT', data)
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.categories.edited');
												_loadCategoriesFromSIKY();
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

									})
									.on('web.videos.categories.delete', function (data) {

										Container.get('sikyapi').query('videos', 'categories/' + data.id, 'DELETE')
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.categories.deleted');
												_loadCategoriesFromSIKY();
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

									})

							// videos

								// read

									.on('web.videos.videos.getallbycategory', _loadVideosByCategoryFromSIKY)
								
								// write

									.on('web.videos.videos.add', function (p_stData) {

										Container.get('sikyapi').query('videos', 'videos', 'POST', {
											'category.id' : parseInt(p_stData.category.id),
											name : p_stData.name,
											url : p_stData.url
										})
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.videos.added');
												_loadVideosByCategoryFromSIKY(p_stData.category.id);
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

									})
									.on('web.videos.videos.edit', function (p_stData) {

										Container.get('sikyapi').query('videos', 'videos/' + p_stData.id, 'PUT', {
											'category.id' : parseInt(p_stData.category.id),
											name : p_stData.name,
											url : p_stData.url
										})
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.videos.edited');
												_loadVideosByCategoryFromSIKY(p_stData.category.id);
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

									})
									.on('web.videos.videos.delete', function (p_stData) {

										Container.get('sikyapi').query('videos', 'videos/' + p_stData.id, 'DELETE')
											.then(function() {
												Container.get('server.socket.web').emit('web.videos.videos.deleted');
												_loadVideosByCategoryFromSIKY(p_stData.category.id);
											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.videos.error', err);
											});

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

	};
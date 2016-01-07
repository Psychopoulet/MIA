app.service('ModelCategories', function() {

    // attributes

        var
            that = this,

            m_tabOnError = [],
            m_tabOnChange = [],

            m_tabOnAdded = [],
            m_tabOnEdited = [],
            m_tabOnDeleted = [];

    // methods

        // public

            // actions

            this.add = function (video) {
                socket.emit('plugins.videos.category.add', video);
            };
            this.edit = function (video) {
                socket.emit('plugins.videos.category.edit', video);
            };
            this.delete = function (video) {
                socket.emit('plugins.videos.category.delete', video);
            };

            this.play = function (child, video) {

                socket.emit('plugins.videos.video.play', {
                    child : child, video : video
                });

            };

            // events

            this.onError = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnError.push(p_fCallback);
                }

                return that;

            };
            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

            this.onAdded = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnAdded.push(p_fCallback);
                }

                return that;

            };
            this.onEdited = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnEdited.push(p_fCallback);
                }

                return that;

            };
            this.onDeleted = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnDeleted.push(p_fCallback);
                }

                return that;

            };

	// constructor

		socket.on('plugins.videos.categories.error', function (msg) {

			angular.forEach(m_tabOnError, function (p_fCallback) {
				p_fCallback(msg);
			});

		})
		.on('plugins.videos.categories', function (data) {

			angular.forEach(m_tabOnChange, function (p_fCallback) {
				p_fCallback(data);
			});

		})

		.on('plugins.videos.category.added', function (category) {

			angular.forEach(m_tabOnAdded, function (p_fCallback) {
				p_fCallback(category);
			});

		})
		.on('plugins.videos.category.edited', function (category) {
			
			angular.forEach(m_tabOnEdited, function (p_fCallback) {
				p_fCallback(category);
			});

		})
		.on('plugins.videos.category.deleted', function () {
			
			angular.forEach(m_tabOnDeleted, function (p_fCallback) {
				p_fCallback();
			});

		});

});
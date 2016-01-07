app.service('ModelVideos', function() {

    // attributes

        var
            that = this,

            m_tabOnError = [],
            m_tabOnChange = [],

            m_tabOnAdded = [],
            m_tabOnEdited = [],
            m_tabOnDeleted = [],
            m_tabOnPlayed = [];

    // methods

        // public

            // actions

            this.getAllByCategory = function (category) {
                socket.emit('plugins.videos.videos', category);
            };

            this.add = function (video) {
                socket.emit('plugins.videos.video.add', video);
            };
            this.edit = function (video) {
                socket.emit('plugins.videos.video.edit', video);
            };
            this.deleted = function (video) {
                socket.emit('plugins.videos.video.deleted', video);
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

            this.onPlayed = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnPlayed.push(p_fCallback);
                }

                return that;

            };

	// constructor

		socket.on('plugins.videos.videos.error', function (msg) {

			angular.forEach(m_tabOnError, function (p_fCallback) {
				p_fCallback(msg);
			});

		})
        .on('plugins.videos.videos', function (data) {

            angular.forEach(m_tabOnChange, function (p_fCallback) {
                p_fCallback(data);
            });

        })
		
		.on('plugins.videos.video.added', function (video) {

			angular.forEach(m_tabOnAdded, function (p_fCallback) {
				p_fCallback(video);
			});

		})
		.on('plugins.videos.video.edited', function (video) {
			
			angular.forEach(m_tabOnEdited, function (p_fCallback) {
				p_fCallback(video);
			});

		})
		.on('plugins.videos.video.deleted', function () {
			
			angular.forEach(m_tabOnDeleted, function (p_fCallback) {
				p_fCallback();
			});

		})
        .on('plugins.videos.video.played', function (video) {

            angular.forEach(m_tabOnPlayed, function (p_fCallback) {
                p_fCallback(video);
            });

        });

});
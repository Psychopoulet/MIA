app.service('ModelYoutube', ['$q', function($q) {

    "use strict";

    // attributes

        var
            CST_THAT = this,
            m_tabOnChange = [],
            m_clPromiseGetAll,
            m_tabData = [];

    // methods

        // protected

            function _execOnChange() {

                angular.forEach(m_tabOnChange, function (p_fCallback) {
                    p_fCallback(m_tabData);
                });

                return CST_THAT;

            }

        // public

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return CST_THAT;

            };

            // read

                this.getAll = function () {

                    var defer = $q.defer();

                        if (0 < m_tabData.length) {
                            defer.resolve(m_tabData);
                        }
                        else {

                            m_clPromiseGetAll
                                .then(defer.resolve)
                                .catch(defer.resolve);

                        }

                    return defer.promise;

                };

            // write

                this.add = function (p_stData) {

                    var deferred = $q.defer(), video;

                    	video = {
                    		name : p_stData.name,
                    		url : p_stData.url
                    					.replace('http://', 'https://').replace('http://', 'https://').replace('https://youtu', 'https://www.youtu')
                    					.replace('youtu.be', 'youtube.com')
                    					.replace('.com/', '.com/embed/')
                    					.replace('watch?v=', '')
                    	};

                    	if (0 < m_tabData.length) {
                    		video.id = m_tabData[m_tabData.length - 1].id + 1;
                    	}
                    	else {
                    		video.id = 1;
                    	}

                    	m_tabData.push(video);

                    	_execOnChange();
                    	deferred.resolve(video);

                    return deferred.promise;

                };

                this.edit = function (p_stData) {

                    var deferred = $q.defer();

                        for (var i = 0; i < m_tabData.length; ++i) {

                            if (m_tabData[i].id == p_stData.id) {
                                m_tabData[i] = p_stData;
                                break;
                            }

                        }

                    return deferred.promise;

                };

                this.delete = function (p_stData) {

                    var deferred = $q.defer();

                    	if (true == confirm('Do you really want to delete "' + p_stData.name + '" ?')) {

	                    	for (var i = 0; i < m_tabData.length; ++i) {

	                            if (m_tabData[i].id == p_stData.id) {
	                                m_tabData.splice(i, 1);
	                                break;
	                            }

	                        }

	                        _execOnChange();
	                        deferred.resolve();

                    	}

                    return deferred.promise;

                };

    // constructor

        // data

            socket
                .on('disconnect', function () {

                    socket.removeAllListeners('child.youtube.getall');
                    socket.removeAllListeners('child.youtube.error');

                    m_tabData = [];

                })
                .on('connect', function () {

                    var deferred = $q.defer();
                    m_clPromiseGetAll = deferred.promise;

                    socket
                        .on('child.logged', function () {
                            socket.emit('child.youtube.getall');
                        })
                        .on('child.youtube.getall', function (p_tabData) {
                            m_tabData = p_tabData;
                            _execOnChange();
                            deferred.resolve(m_tabData);
                        })
                        .on('child.youtube.error', deferred.reject);

                });

}]);
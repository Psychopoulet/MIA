app.service('ModelYoutube', ['$q', function($q) {

    "use strict";

    // attributes

        var
            CST_THAT = this,
            m_stSelected = null,
            m_tabOnSelect = [],
            m_tabOnUnselect = [],
            m_tabOnChange = [],
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

            this.getSelected = function () {
                return m_stSelected;
            };

            this.select = function (p_stData) {

                m_stSelected = p_stData;

                for (var i = 0; i < m_tabData.length; ++i) {
                    m_tabData[i].selected = (m_stSelected.id == m_tabData[i].id);
                }

                angular.forEach(m_tabOnSelect, function (p_fCallback) {
                    p_fCallback(m_stSelected);
                });

                return CST_THAT;

            };

            this.unselect = function () {

                m_stSelected = null;

                for (var i = 0; i < m_tabData.length; ++i) {
                    m_tabData[i].selected = false;
                }

                angular.forEach(m_tabOnUnselect, function (p_fCallback) {
                    p_fCallback();
                });

                return CST_THAT;

            };

            this.onSelect = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnSelect.push(p_fCallback);
                }

                return CST_THAT;

            };

            this.onUnselect = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnUnselect.push(p_fCallback);
                }

                return CST_THAT;

            };

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return CST_THAT;

            };

            // read

                var isLoadingGetAll = false, deferredGetAll;
                this.getAll = function (p_bForceLoading) {

                    if (!isLoadingGetAll) {

                        deferredGetAll = $q.defer();

                        isLoadingGetAll = true;

                        if (0 < m_tabData.length && ('undefined' == typeof p_bForceLoading || !p_bForceLoading)) {
                            deferredGetAll.resolve(m_tabData);
                        }
                        else {

                        	m_tabData = [
	                        	{
									id : 1,
									name : 'witcher 9',
									address : 'https://www.youtube.com/embed/x6go-o0TNd4'
								},
								{
									id : 2,
									name : 'witcher 10',
									address : 'https://www.youtube.com/embed/gTgVcK8E7tM'
								}
							];

                        	deferredGetAll.resolve(m_tabData);

                        }

                    }

                    return deferredGetAll.promise;

                };

            // write

                this.add = function (p_stData) {

                    var deferred = $q.defer(), video;

                    	video = {
                    		name : p_stData.name,
                    		address : p_stData.address
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

}]);

app.controller('ControllerYoutubeList', ['$scope', '$sce', 'ModelYoutube', function($scope, $sce, ModelYoutube) {

	"use strict";

	// attributes

		$scope.loading = false;
		$scope.selected = false;
		$scope.videos = [];
		$scope.video = {};

	// methods

		// public

            $scope.select = function (selected) {

                if (selected) {
                    ModelYoutube.select(selected);
                }
                else {
                    ModelYoutube.unselect();
                }

            };

			$scope.add = function (p_stData) {

                $scope.loading = true;
				ModelYoutube.add(p_stData)
					.then(ModelYoutube.select)
                    .catch(alert)
                    .finally(function() {
                        $scope.loading = false;
                    });

			};

			$scope.edit = function (p_stData) {
				
                $scope.loading = true;
				ModelYoutube.edit(p_stData)
					.then(ModelYoutube.select)
                    .catch(alert)
                    .finally(function() {
                        $scope.loading = false;
                    });

			};

			$scope.delete = function (p_stData) {

                $scope.loading = true;
				ModelYoutube.delete(p_stData)
					.then(ModelYoutube.unselect)
                    .catch(alert)
                    .finally(function() {
                        $scope.loading = false;
                    });

			};

            $scope.preview = function (p_stData) {
                jQuery('#modalYoutubePreviewIframe').empty().append('<iframe class="embed-responsive-item" src="' + p_stData.address + '" frameborder="0" allowfullscreen></iframe>');
                jQuery('#modalYoutubePreview').modal('show');
            };

            $scope.closePreview = function () {
                jQuery('#modalYoutubePreviewIframe').empty();
                jQuery('#modalYoutubePreview').modal('hide');
            };

    // constructor

        // events

            ModelYoutube
                .onSelect(function (data) {
                    $scope.video = data;
                    $scope.selected = true;
                })
                .onUnselect(function () {
                    $scope.video = {};
                    $scope.selected = false;
                });

			jQuery('#menuYoutube').click(function(e) {
				e.preventDefault();
				jQuery('#modalYoutubeList').modal('show');
			});

            jQuery('#modalYoutubeList')
                .on('shown.bs.modal', function() {

                    $scope.loading = true;
                    ModelYoutube.getAll()
                        .then(function(p_tabData) {
                            $scope.videos = p_tabData;
                        })
                        .catch(alert)
                        .finally(function() {
                            $scope.loading = false;
                        });

                });

        // socket

            socket
                .on('disconnect', function () {
                    socket.removeAllListeners('child.logged');
                    socket.removeAllListeners('child.youtube.error');
                })
                .on('connect', function () {

                    socket.on('child.logged', function (socketData) {

                        socket.on('child.youtube.error', function (error) {
                            alert(error);
                        });

                    });
                    
                });
        
}]);
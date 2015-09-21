app.controller('ControllerYoutubeList', ['$scope', 'ModelYoutube', 'ModelChildren', function($scope, ModelYoutube, ModelChildren) {

	"use strict";

	// attributes

		$scope.loading = true;

        $scope.videos = [];
		$scope.selectedvideo = null;

        $scope.children = [];
        $scope.selectedchild = null;

	// methods

		// public

            $scope.selectVideo = function (selected) {

                if (selected) {
                    $scope.selectedvideo = selected;
                }
                else {
                    $scope.selectedvideo = null;
                }

            };

            // model

    			$scope.add = function () {

                    $scope.loading = true;
    				ModelYoutube.add($scope.selectedvideo)
                        .then(function(data) {
                            $scope.selectVideo(data);
                        })
                        .catch(alert)
                        .finally(function() {
                            $scope.loading = false;
                        });

    			};

    			$scope.edit = function () {
    				
                    $scope.loading = true;
    				ModelYoutube.edit($scope.selectedvideo)
                        .then(function(data) {
                            $scope.selectVideo(data);
                        })
                        .catch(alert)
                        .finally(function() {
                            $scope.loading = false;
                        });

    			};

                $scope.delete = function () {

                    $scope.loading = true;
                    ModelYoutube.delete($scope.selectedvideo)
                        .then(function() {
                            $scope.selectVideo();
                        })
                        .catch(alert)
                        .finally(function() {
                            $scope.loading = false;
                        });

                };

            // preview

                $scope.preview = function () {
                    jQuery('#modalYoutubePreviewIframe').empty().append('<iframe class="embed-responsive-item" src="' + $scope.selectedvideo.url + '" frameborder="0" allowfullscreen></iframe>');
                    jQuery('#modalYoutubePreview').modal('show');
                };

                $scope.closePreview = function () {
                    jQuery('#modalYoutubePreviewIframe').empty();
                    jQuery('#modalYoutubePreview').modal('hide');
                };

            // play

                $scope.play = function () {

                    socket.emit('child.youtube.play', {
                        token : $scope.selectedchild.token,
                        url : $scope.selectedvideo.url
                    });

                };

    // constructor

        // events

            ModelYoutube
                .onChange(function (p_tabData) {
                    console.log(p_tabData);
                    $scope.videos = p_tabData;
                });

            ModelChildren
                .onChange(function(p_tabData) {
                    $scope.children = p_tabData;
                    $scope.selectedchild = null;
                    $scope.$apply();
                });

			jQuery('#menuYoutube').click(function(e) {
				e.preventDefault();
				jQuery('#modalYoutube').modal('show');
			});
                
            jQuery('#modalYoutube').on('shown.bs.modal', function() {

                ModelYoutube.getAll()
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

                    socket.on('child.logged', function () {

                        socket.on('child.youtube.error', function (p_sError) {
                            alert(p_sError); 
                        });

                    });
                    
                });
        
}]);
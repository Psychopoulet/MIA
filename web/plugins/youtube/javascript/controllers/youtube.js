app.controller('ControllerYoutubeList', ['$scope', 'ModelChildren', function($scope, ModelChildren) {

	"use strict";

	// attributes

		$scope.loading = true;

        $scope.videos = [];
		$scope.selectedvideo = null;

        $scope.children = [];
        $scope.selectedchild = null;

	// methods

        // private

            function _formateVideo(p_stVideo) {

                return {
                    name : p_stVideo.name,
                    url : p_stVideo.url
                            .replace('http://', 'https://').replace('http://', 'https://').replace('https://youtu', 'https://www.youtu')
                            .replace('youtu.be', 'youtube.com')
                            .replace('.com/', '.com/embed/')
                            .replace('watch?v=', '')
                };

            }

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

                        var video = _formateVideo($scope.selectedvideo);

                        if (0 < $scope.videos.length) {
                            video.id = $scope.videos[$scope.videos.length - 1].id + 1;
                        }
                        else {
                            video.id = 1;
                        }

                        $scope.videos.push(video);

                        // socket.emit('child.youtube.add', video)

    			};

    			$scope.edit = function () {
    				
                    $scope.loading = true;

                        var video = _formateVideo($scope.selectedvideo);
                        video.id = $scope.selectedvideo.id;

                        for (var i = 0; i < $scope.videos.length; ++i) {

                            if ($scope.videos[i].id == video.id) {
                                $scope.videos[i] = video;
                                break;
                            }

                        }

                        // socket.emit('child.youtube.add', video)

    			};

                $scope.delete = function () {

                    if (true == confirm('Do you really want to delete "' + $scope.selectedvideo.name + '" ?')) {

                        $scope.loading = true;
                        
                        for (var i = 0; i < $scope.videos.length; ++i) {

                            if ($scope.videos[i].id == $scope.selectedvideo.id) {
                                $scope.videos.splice(i, 1);
                                break;
                            }

                        }

                        // socket.emit('child.youtube.delete', video)

                    }

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

            ModelChildren
                .onChange(function(p_tabData) {
                    $scope.children = p_tabData;
                    $scope.selectedchild = null;
                    $scope.$apply();
                });

            // sockets

                socket
                    .on('disconnect', function () {
                        socket.removeAllListeners('child.youtube.getall');
                        socket.removeAllListeners('child.youtube.error');
                    })
                    .on('connect', function () {

                        socket
                            .on('child.logged', function () {
                                socket.emit('child.youtube.getall');
                            })
                            .on('child.youtube.getall', function (p_tabData) {
                                console.log(p_tabData);
                                $scope.videos = p_tabData;
                                $scope.loading = false;
                                $scope.$apply();
                            })
                            .on('child.youtube.error', function(p_sMessage) {
                                // $popup.error(p_sMessage);
                                alert(p_sMessage);
                            });

                    });

            // interface

    			jQuery('#menuYoutube').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalYoutube').modal('show');
    			});
                
}]);
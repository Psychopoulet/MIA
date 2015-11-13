app.controller('ControllerYoutubeList', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

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

                        // socket.emit('web.youtube.add', video)

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

                        // socket.emit('web.youtube.edit', video)

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

                        // socket.emit('web.youtube.delete', video)

                    }

                };

            // preview

                $scope.preview = function () {
                    $popup.preview($scope.selectedvideo.url, $scope.selectedvideo.name);
                };

            // play

                $scope.play = function () {

                    socket.emit('web.youtube.play', {
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
                        socket.removeAllListeners('web.youtube.getall');
                        socket.removeAllListeners('web.youtube.error');
                    })
                    .on('connect', function () {

                        socket
                            .on('web.logged', function () {
                                socket.emit('web.youtube.getall');
                            })
                            .on('web.youtube.getall', function (p_tabData) {
                                $scope.videos = p_tabData;
                                $scope.loading = false;
                                $scope.$apply();
                            })
                            .on('web.youtube.error', $popup.alert);

                    });

            // interface

    			jQuery('#menuYoutube').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalYoutube').modal('show');
    			});
                
}]);
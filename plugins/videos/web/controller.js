app.controller('ControllerVideosList', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

	"use strict";

	// attributes

        $scope.loading = true;
        $scope.loadingCategories = true;
		$scope.loadingVideos = true;

        $scope.categories = [];
        $scope.selectedcategory = null;

        $scope.videos = [];
		$scope.selectedvideo = null;

        $scope.children = [];
        $scope.selectedchild = null;

	// methods

        // private

            function _formateVideo(p_stVideo) {

                p_stVideo.url = p_stVideo.url
                            .replace('http://', 'https://')
                            .replace('//youtu', '//www.youtu')
                            .replace('youtu.be', 'youtube.com');

                return {
                    name : p_stVideo.name,
                    url : p_stVideo.url,
                    urlembeded : p_stVideo.url
                                    .replace('.com/', '.com/embed/')
                                    .replace('watch?v=', '')
                };

            }

		// public

            $scope.selectCategory = function (selected) {

                if (selected) {
                    $scope.selectedcategory = selected;
                    $scope.loadingVideos = true;
                    socket.on('web.videos.videos.getallbycategory', $scope.selectedcategory);
                }
                else {
                    $scope.selectedcategory = null;
                }

            };

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
                    socket.emit('web.videos.videos.add', $scope.selectedvideo);
    			};

    			$scope.edit = function () {
                    $scope.loading = true;
                    socket.emit('web.videos.videos.edit', $scope.selectedvideo);
    			};

                $scope.delete = function () {

                    if (true == confirm('Do you really want to delete "' + $scope.selectedvideo.name + '" ?')) {
                        $scope.loading = true;
                        socket.emit('web.videos.videos.delete', $scope.selectedvideo);
                    }

                };

            // preview

                $scope.preview = function () {
                    $popup.preview($scope.selectedvideo.urlembeded, $scope.selectedvideo.name);
                };

            // play

                $scope.play = function () {

                    socket.emit('web.videos.play', {
                        token : $scope.selectedchild.token,
                        video : $scope.selectedvideo
                    });

                };

    // constructor

        $scope.loadingCategories = true;

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

                        socket.removeAllListeners('web.videos.error');

                        // categories

                        socket.removeAllListeners('web.videos.categories.getall');
                        socket.removeAllListeners('web.videos.categories.added');
                        socket.removeAllListeners('web.videos.categories.edited');
                        socket.removeAllListeners('web.videos.categories.deleted');

                        // videos

                        socket.removeAllListeners('web.videos.videos.getallbycategory');
                        socket.removeAllListeners('web.videos.videos.added');
                        socket.removeAllListeners('web.videos.videos.edited');
                        socket.removeAllListeners('web.videos.videos.deleted');

                    })
                    .on('connect', function () {

                        socket

                            .on('web.logged', function () {
                                console.log('send web.videos.categories.getall');
                                socket.emit('web.videos.categories.getall');
                            })

                            .on('web.videos.error', $popup.alert)

                            // categories

                            .on('web.videos.categories.getall', function (p_tabData) {
                                console.log('receive web.videos.categories.getall');
                                console.log(p_tabData);
                                $scope.categories = p_tabData;
                                $scope.loading = false; $scope.loadingCategories = false;
                            })
                            .on('web.videos.categories.added', function () {
                                $scope.loading = false;
                            })
                            .on('web.videos.categories.edited', function () {
                                $scope.loading = false;
                            })
                            .on('web.videos.categories.deleted', function () {
                                $scope.loading = false;
                            })

                            // videos

                            .on('web.videos.videos.getallbycategory', function (p_tabData) {
                                $scope.videos = p_tabData;
                                $scope.loading = false; $scope.loadingVideos = false;
                            })
                            .on('web.videos.videos.added', function () {
                                $scope.loading = false;
                            })
                            .on('web.videos.videos.edited', function () {
                                $scope.loading = false;
                            })
                            .on('web.videos.videos.deleted', function () {
                                $scope.loading = false;
                            });

                    });

            // interface

    			jQuery('#menuVideos').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalVideos').modal('show');
    			});
                
}]);
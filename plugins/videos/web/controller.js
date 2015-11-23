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
                    socket.emit('web.videos.videos.getallbycategory', $scope.selectedcategory);
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

                $scope.addCategory = function () {

                    $popup.prompt('Nouvelle catégorie', function(name) {
                        $scope.loading = true;
                        socket.emit('web.videos.categories.add', { name : name });
                    });

                };

                $scope.editCategory = function () {

                    $popup.prompt('', function(name) {
                        $scope.loading = true;
                        $scope.selectedcategory.name = name;
                        socket.emit('web.videos.categories.edit', $scope.selectedcategory);
                    });

                };

                $scope.deleteCategory = function () {

                    $popup.confirm('Voulez-vous vraiment supprimer "' + $scope.selectedcategory.name + '" ?', 'Confirmation', function() {
                        $scope.loading = true;
                        socket.emit('web.videos.categories.delete', $scope.selectedcategory);
                        $scope.selectCategory(null);
                    });

                };


    			$scope.addVideo = function () {
                    $scope.loading = true;
                    socket.emit('web.videos.videos.add', $scope.selectedvideo);
    			};

    			$scope.editVideo = function () {
                    $scope.loading = true;
                    socket.emit('web.videos.videos.edit', $scope.selectedvideo);
    			};

                $scope.deleteVideo = function () {

                    $popup.confirm('Voulez-vous vraiment supprimer "' + $scope.selectedvideo.name + '" ?', 'Confirmation', function() {
                        $scope.loading = true;
                        socket.emit('web.videos.videos.delete', $scope.selectedvideo);
                        $scope.selectVideo(null);
                    });

                };

            // play

                $scope.play = function () {

                    socket.emit('web.videos.videos.play', {
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
                });

            // sockets

                socket
                    .on('disconnect', function () {

                        socket.removeAllListeners('web.videos.error');

                        // categories

                            socket.removeAllListeners('web.videos.categories.getall');

                        // videos

                            socket.removeAllListeners('web.videos.videos.getallbycategory');
                            socket.removeAllListeners('web.videos.videos.added');
                            socket.removeAllListeners('web.videos.videos.edited');
                            socket.removeAllListeners('web.videos.videos.deleted');

                    })
                    .on('connect', function () {

                        socket

                            .on('web.logged', function () {
                                socket.emit('web.videos.categories.getall');
                            })

                            .on('web.videos.error', $popup.alert)

                            // categories

                                .on('web.videos.categories.getall', function (p_tabData) {
                                    $scope.categories = p_tabData;
                                    $scope.loading = false; $scope.loadingCategories = false;
                                    $scope.$apply();
                                })

                            // videos

                                .on('web.videos.videos.getallbycategory', function (p_tabData) {
                                    $scope.videos = p_tabData;
                                    $scope.loading = false; $scope.loadingVideos = false;
                                    $scope.$apply();
                                });

                    });

            // interface

    			jQuery('#menuVideos').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalVideos').modal('show');
    			});
                
}]);
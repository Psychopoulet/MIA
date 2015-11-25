app.controller('ControllerVideosList', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

	"use strict";

	// attributes

        $scope.loading = true;
        $scope.loadingCategories = true;
		$scope.loadingVideos = true;

        $scope.categories = [];
        $scope.selectedcategory = null;

        $scope.videos = [];

        $scope.children = [];
        $scope.selectedchild = null;

	// methods

		// public

            $scope.selectCategory = function (selected) {

                if (selected) {

                    if (!$scope.selectedcategory || $scope.selectedcategory.id != selected.id) {
                        $scope.selectedcategory = selected;
                        $scope.loadingVideos = true;
                        socket.emit('web.videos.videos.getallbycategory', $scope.selectedcategory);
                    }

                }
                else {
                    $scope.selectedcategory = null;
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


                $scope.openModalFormVideo = function (video) {


                    $scope.formVideo = (video) ? video : {};

                    jQuery('#modalFormVideo')
                        .on('shown.bs.modal', function () {

                            var tabInputs = jQuery(this).find('form input');

                            if (0 < tabInputs.length) {
                                jQuery(tabInputs[0]).focus();
                            }

                        })
                        .modal({
                            backdrop : 'static',
                            keyboard: false,
                            show : true
                        });

                };

                $scope.closeModalFormVideo = function () {
                    jQuery('#modalFormVideo').modal('hide');
                };

                $scope.sendVideo = function (video) {

                    $scope.loading = true;

                    if (video && video.id && 0 < video.id) {
                        socket.emit('web.videos.videos.edit', video);
                    }
                    else {
                        video.category = $scope.selectedcategory;
                        socket.emit('web.videos.videos.add', video);
                    }

                };

                $scope.deleteVideo = function (video) {

                    $popup.confirm('Voulez-vous vraiment supprimer "' + video.name + '" ?', 'Confirmation', function() {
                        $scope.loading = true;
                        socket.emit('web.videos.videos.delete', video);
                    });

                };

            // play

                $scope.preview = function (video) {
                    $popup.preview(video.urlembeded);
                };

                $scope.play = function (video) {

                    socket.emit('web.videos.videos.play', {
                        token : $scope.selectedchild.token,
                        video : video
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
                                .on('web.videos.categories.added', function () {
                                    $scope.loadingCategories = true;
                                    $scope.$apply();
                                })
                                .on('web.videos.categories.edited', function () {
                                    $scope.loadingCategories = true;
                                    $scope.$apply();
                                })
                                .on('web.videos.categories.deleted', function () {
                                    $scope.loadingCategories = true;
                                    $scope.$apply();
                                })

                            // videos

                                .on('web.videos.videos.getallbycategory', function (p_tabData) {
                                    $scope.videos = p_tabData;
                                    $scope.loading = false; $scope.loadingVideos = false;
                                    $scope.$apply();
                                })
                                .on('web.videos.videos.added', function () {
                                    $scope.loadingVideos = true;
                                    $scope.closeModalFormVideo();
                                    $scope.$apply();
                                })
                                .on('web.videos.videos.edited', function () {
                                    $scope.loadingVideos = true;
                                    $scope.closeModalFormVideo();
                                    $scope.$apply();
                                })
                                .on('web.videos.videos.deleted', function () {
                                    $scope.loadingVideos = true;
                                    $scope.closeModalFormVideo();
                                    $scope.$apply();
                                });

                    });

            // interface

                jQuery('#menuVideos').click(function(e) {

                    e.preventDefault();

                    jQuery('#modalVideos').modal({
                        backdrop : 'static',
                        keyboard: false,
                        show : true
                    });
                    
                });
                
}]);
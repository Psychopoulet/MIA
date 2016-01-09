app.controller('ControllerWidget',
	['$scope', '$popup', 'ModelChilds',
	function($scope, $popup, ModelChilds) {

	"use strict";

	// attributes

		// private

			var clModalForm = jQuery('#modalFormVideo');

		// public

			$scope.categories = [];
			$scope.selectedcategory = null;

			$scope.videos = [];
			$scope.selectedvideo = null;

			$scope.childs = [];
			$scope.selectedchild = null;

	// methods

		// public

			$scope.selectCategory = function (category) {

				if (category) {
					$scope.selectedcategory = category;
					socket.emit('plugins.videos.videos', category);
				}
				else {
					$scope.selectedcategory = null;
					$scope.videos = [];
				}

			};

			// models

				// categories

				$scope.addCategory = function () {

					$popup.prompt('Nouvelle catégorie', '', function(name) {
						socket.emit('plugins.videos.category.add', { name : name });
					});

				};
				$scope.editCategory = function (category) {

					$popup.prompt('', category.name, function(name) {
						category.name = name;
						socket.emit('plugins.videos.category.edit', category);
					});

				};
				$scope.deleteCategory = function (category) {

					$popup.confirm('Voulez-vous vraiment supprimer "' + category.name + '" ?', 'Confirmation', function() {
						socket.emit('plugins.videos.category.delete', category);
					});

				};

				// videos

				$scope.openWindowVideo = function(category, video) {
					$scope.selectedvideo = (video) ? video : {};
					clModalForm.modal('show');
				};

				$scope.writeVideo = function (category, video) {

					console.log(category);
					console.log(video);

					if (!video.code) {
						socket.emit('plugins.videos.video.add', video);
					}
					else {
						socket.emit('plugins.videos.video.edit', video);
					}

				};
				$scope.deleteVideo = function (category, video) {

					$popup.confirm('Voulez-vous vraiment supprimer "' + video.name + '" ?', 'Confirmation', function() {
						
						socket.emit('plugins.videos.video.delete', {
		                    child : child, video : video
		                });

					});

				};

			// interface

				$scope.closeModalFormVideo = function () {
					clModalForm.modal('hide');
				};

				// play

					$scope.preview = function (video) {
						$popup.iframe(video.urlembeded + '?autoplay=1');
					};

					$scope.playSound = function (child, video) {

						socket.emit('plugins.videos.video.playsound', {
		                    child : child, video : video
		                });

					};

					$scope.playVideo = function (child, video) {

						socket.emit('plugins.videos.video.playvideo', {
		                    child : child, video : video
		                });

					};

	// constructor

		// events

			// childs

			ModelChilds.onError($popup.alert)
			.onChange(function(data) {

				$scope.childs = [];
				angular.forEach(data, function(child) {

					if (child.connected && child.allowed) {
						$scope.childs.push(child);
					}

				});

				$scope.selectedchild = null;
				$scope.$apply();

			});

			// categories

			socket.on('plugins.videos.categories.error', $popup.alert)

			.on('plugins.videos.categories', function (data) {
				$scope.categories = data;
				$scope.$apply();
			})

			.on('plugins.videos.category.added', function (category) {

				$scope.categories.push(category);
				$scope.selectCategory(category);

				$scope.$apply();

			})
			.on('plugins.videos.category.edited', function (category) {

				angular.forEach($scope.categories, function(cat, key) {

					if (category.code == cat.code) {
						$scope.categories[key] = category;
					}

				});

				$scope.selectCategory(category);

				$scope.$apply();

			});

			// videos

			socket.on('plugins.videos.videos.error', $popup.alert)

			.on('plugins.videos.videos', function (data) {
				$scope.videos = data;
				$scope.$apply();
			})

			.on('plugins.videos.video.added', function (video) {
				
				$scope.videos.push(video);
				$scope.selectedvideo = video;

				$scope.closeModalFormVideo();
				$scope.$apply();

			})
			.on('plugins.videos.video.edited', function (video) {
				
				angular.forEach($scope.videos, function(vid, key) {

					if (video.code == vid.code) {
						$scope.videos[key] = video;
					}

				});

				$scope.selectedvideo = video;
				$scope.closeModalFormVideo();

				$scope.$apply();

			});

		// interface

			clModalForm.modal({
				backdrop : 'static',
				keyboard: false,
				show : false
			})
			.on('shown.bs.modal', function () {
				jQuery(clModalForm.find('input')[0]).focus();
			});
		
}]);
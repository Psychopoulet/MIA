app.controller('ControllerWidget',
	['$scope', '$popup', 'ModelChilds', 'ModelCategories', 'ModelVideos',
	function($scope, $popup, ModelChilds, ModelCategories, ModelVideos) {

	"use strict";

	// attributes

		$scope.categories = [];
		$scope.selectedcategory = null;

		$scope.videos = [];
		$scope.selectedvideo = null;

		$scope.childs = [];
		$scope.selectedchild = null;

	// methods

		// public

			$scope.selectCategory = function (selected) {

				if (selected) {

					if (!$scope.selectedcategory || $scope.selectedcategory.id != selected.id) {
						$scope.selectedcategory = selected;
						ModelVideos.getAllByCategory(selected);
					}

				}
				else {
					$scope.selectedcategory = null;
				}

			};

			// model

				$scope.addCategory = function () {

					$popup.prompt('Nouvelle catégorie', '', function(name) {
						ModelCategories.add({ name : name });
					});

				};

				$scope.editCategory = function (p_stCategory) {

					$popup.prompt('', p_stCategory.name, function(name) {
						p_stCategory.name = name;
						ModelCategories.edit(p_stCategory);
					});

				};

				$scope.deleteCategory = function (p_stCategory) {

					$popup.confirm('Voulez-vous vraiment supprimer "' + p_stCategory.name + '" ?', 'Confirmation', function() {
						ModelCategories.delete(p_stCategory);
					});

				};


				$scope.openModalFormVideo = function (video) {

					$scope.formVideo = (video) ? video : {};

					jQuery('#modalFormVideo').on('shown.bs.modal', function () {

						var tabInputs = jQuery(this).find('form input');

						if (0 < tabInputs.length) {
							jQuery(tabInputs[0]).focus();
						}

					})
					.modal('show');

				};

				$scope.closeModalFormVideo = function () {
					jQuery('#modalFormVideo').modal('hide');
				};

				$scope.sendVideo = function (video) {

					if (video.code && '' != video.code) {
						ModelVideos.edit(video);
						socket.emit('web.videos.videos.edit', video);
					}
					else {
						video.category = $scope.selectedcategory;
						ModelVideos.add(video);
					}

				};

				$scope.deleteVideo = function (video) {

					$popup.confirm('Voulez-vous vraiment supprimer "' + video.name + '" ?', 'Confirmation', function() {
						ModelVideos.delete(video);
					});

				};

			// play

				$scope.preview = function (video) {
					$popup.iframe(video.urlembeded + '?autoplay=1');
				};

				$scope.play = ModelVideos.play;

	// constructor

		jQuery('#modalVideos').modal({
			backdrop : 'static',
			keyboard: false,
			show : false
		});
		
		jQuery('#modalFormVideo').modal({
			backdrop : 'static',
			keyboard: false,
			show : false
		});
					
		// events

			ModelChilds.onChange(function(data) {
				$scope.childs = data;
				
				$scope.selectedchild = null;
			});

			ModelCategories.onError($popup.alert)

				.onChange(function(data) {
					console.log(data);
					$scope.categories = data;
					$scope.selectCategory(null);
				})

				.onAdded(function(category) {
					console.log(category);
					$scope.selectCategory(category);
				})
				.onEdited(function(category) {
					console.log(category);
					$scope.selectCategory(category);
				});

			ModelVideos.onError($popup.alert)

				.onChange(function(data) {
					$scope.videos = data;
					$scope.selectedvideo = null;
				})

				.onAdded(function(video) {
					$scope.selectedvideo = video;
					$scope.closeModalFormVideo();
				})
				.onEdited(function(category) {
					$scope.selectedvideo = video;
					$scope.closeModalFormVideo();
				})
				.onDeleted($scope.closeModalFormVideo);

			// interface

				jQuery('#menuVideos').click(function(e) {
					e.preventDefault();
					jQuery('#modalVideos').modal('show');
				});
				
}]);
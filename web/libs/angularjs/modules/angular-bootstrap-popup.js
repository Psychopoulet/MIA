angular.module('ngBootstrapPopup', [])

	.service('$popup', function() {

		"use strict";

		// attributes

			// public

				this.lng = {
					titles : {
						alert : 'Alert',
						confirm : 'Confirm',
						prompt : 'Prompt',
						preview : 'Preview',
						sound : 'Sound'
					},
					buttons : {
						ok : 'Ok',
						close : 'Close',
						no : 'No',
						yes : 'Yes'
					}
				};

			// private

				var that = this, m_nCountPrompt = 0;

		// methodes

			// private

				function _create(p_stPopupOptions, p_stModaleOptions) {

					var clModal, clDialog, clContent, clHeader, clBody, clFooter;

					p_stPopupOptions = (p_stPopupOptions) ? p_stPopupOptions : {};
					p_stModaleOptions = (p_stModaleOptions) ? p_stModaleOptions : {};

					clModal = jQuery('<div class="modal fade text-left"></div>');

						clDialog = jQuery('<div class="modal-dialog modal-' + ((p_stPopupOptions.size && 'large' === p_stPopupOptions.size) ? 'lg' : 'sm') + ' modal-vertical-centered"></div>');

							clContent = jQuery('<div class="modal-content"></div>');

								clHeader = jQuery('<div class="modal-header"><h4 class="modal-title"></h4></div>');

									if (p_stPopupOptions.title && 0 < p_stPopupOptions.title.length) {

										if (1 === p_stPopupOptions.title.length) {
											clHeader.text(p_stPopupOptions.title.toUpperCase());
										}
										else {
											clHeader.text(p_stPopupOptions.title.charAt(0).toUpperCase() + p_stPopupOptions.title.slice(1));
										}

									}
									else if (p_stPopupOptions.title_html) {
										clHeader.html(p_stPopupOptions.title_html);
									}
									else {
										clHeader.text(that.lng.titles.alert);
									}

								clContent.append(clHeader);

								clBody = jQuery('<div class="modal-body"></div>');

									if (p_stPopupOptions.content && 0 < p_stPopupOptions.content.length) {

										if (1 === p_stPopupOptions.content.length) {
											clBody.text(p_stPopupOptions.content.toUpperCase());
										}
										else {
											clBody.text(p_stPopupOptions.content.charAt(0).toUpperCase() + p_stPopupOptions.content.slice(1));
										}

									}
									else if (p_stPopupOptions.contentHTML) {
										clBody.html(p_stPopupOptions.contentHTML);
									}
									else {
										clBody.text(that.lng.titles.alert);
									}

								clContent.append(clBody);

									if (p_stPopupOptions.buttons && 0 < p_stPopupOptions.buttons.length) {

										clFooter = jQuery('<div class="modal-footer"></div>');

										angular.forEach(p_stPopupOptions.buttons, function(stButton) {

											var clButton = jQuery('<button type="button" class="btn btn-default"></button>');

												if (stButton.cls) {
													clButton.addClass(stButton.cls);
												}

												if (stButton.text) {
													clButton.append(stButton.text);
												}

												if (stButton.click) {

													if (!angular.isArray(stButton.click)) {
														stButton.click = [ stButton.click ];
													}

													clButton.click(function() {

														angular.forEach(stButton.click, function(fClick) {
															
															if ('function' === typeof fClick) {
																fClick();
															}
															else if ('close' === fClick) {
																clModal.modal('hide');
															}

														});

													});

												}

											clFooter.append(clButton);

										});

									}

								clContent.append(clFooter);

							clDialog.append(clContent);

						clModal.append(clDialog);

						p_stModaleOptions.show = true;

					clModal.modal(p_stModaleOptions);

					clModal
						.on('shown.bs.modal', function () {

							if (p_stPopupOptions.shown && 'function' === typeof p_stPopupOptions.shown) {
								p_stPopupOptions.shown();
							}

						})
						.on('hidden.bs.modal', function () {
							clModal.remove();
							clModal = null;
						});

					return clModal;

				}

			// public

				this.alert = function (p_sMessage, p_sTitle) {

					return _create({
						title : (p_sTitle && '' != p_sTitle) ? p_sTitle : that.lng.titles.alert,
						contentHTML : p_sMessage,
						buttons : [
							{
								text : that.lng.buttons.ok,
								click : 'close'
							}
						]
					},
					{
						backdrop : 'static',
						keyboard : true
					});

				};

				this.confirm = function (p_sMessage, p_sTitle, p_fOnYes, p_fOnNo) {

					return _create({
						title : (p_sTitle && '' != p_sTitle) ? p_sTitle : that.lng.titles.confirm,
						contentHTML : p_sMessage,
						buttons : [
							{
								cls : 'btn-primary',
								text : that.lng.buttons.yes,
								click : ('function' === typeof p_fOnYes) ? [ p_fOnYes, 'close' ] : 'close'
							},
							{
								text : that.lng.buttons.no,
								click : ('function' === typeof p_fOnNo) ? [ p_fOnNo, 'close' ] : 'close'
							}
						]
					},
					{
						backdrop : 'static',
						keyboard : true
					});

				};

				this.prompt = function (p_sTitle, p_sValue, p_fOnConfirm, p_fOnAbort) {

					p_sTitle = (p_sTitle && '' != p_sTitle) ? p_sTitle : that.lng.titles.prompt;

					++m_nCountPrompt;

					var sId = 'idPopupFormPrompt' + m_nCountPrompt,
						sInput = '';

					if (p_sValue && '' != p_sValue) {
						sInput = '<input id="' + sId + '" type="text" class="form-control" value="' + p_sValue + '" />';
					}
					else {
						sInput = '<input id="' + sId + '" type="text" class="form-control" />';
					}

					return _create({
						title : p_sTitle,
						contentHTML :   '<div class="form-group">'+
											'<label for="' + sId + '">' +
												p_sTitle +
											'</label>' +
											sInput +
										'</div>',
						buttons : [
							{
								cls : 'btn-primary',
								text : that.lng.buttons.ok,
								click : ('function' === typeof p_fOnConfirm) ? [ function() { p_fOnConfirm(jQuery('#' + sId).val()); }, 'close' ] : 'close'
							},
							{
								text : that.lng.buttons.close,
								click : ('function' === typeof p_fOnAbort) ? [ p_fOnAbort, 'close' ] : 'close'
							}
						],
						shown : function () {
							jQuery('#' + sId).focus();
						}
					},
					{
						backdrop : 'static',
						keyboard : true
					});

				};

				this.iframe = function (p_sUrl, p_sTitle) {

					return _create({
						title : (p_sTitle && '' != p_sTitle) ? p_sTitle : that.lng.titles.preview,
						contentHTML :   '<div class="embed-responsive embed-responsive-16by9">' +
											'<iframe class="embed-responsive-item" src="' + p_sUrl + '" frameborder="0" allowfullscreen></iframe>' +
										'</div>',
						size : 'large',
						buttons : [
							{
								text : that.lng.buttons.close,
								click : 'close'
							}
						]
					},
					{
						backdrop : 'static',
						keyboard : true
					});

				};

				this.sound = function (p_sUrl, p_sTitle) {

					var clResult, sDocumentTitle = document.title;

						function _close() {
							clResult.modal('hide');
							document.title = sDocumentTitle;
						}

						document.title = p_sTitle;

						clResult = _create({
							title : (p_sTitle && '' != p_sTitle) ? p_sTitle : that.lng.titles.sound,
							contentHTML :   '<div class="row">' +
												'<audio class="col-xs-12" controls>' +
													'Votre navigateur ne supporte pas l\'Ã©lÃ©ment <code>audio</code>.' +
													'<source src="' + p_sUrl + '" type="audio/wav">' +
												'</audio>' +
											'</div>',
							size : 'large',
							buttons : [
								{
									text : that.lng.buttons.close,
									click : _close
								}
							]
						},
						{
							backdrop : 'static',
							keyboard : true
						});

						clResult.find('audio')[0].onended = _close;
						clResult.find('audio')[0].play();

					return clResult;

				};

				this.closeAll = function () {
					jQuery('.modal').modal('hide');
				};

	})

	.directive('popupTranslate', ['$popup', function($popup) {

		"use strict";

		return {

			scope: {
				titleAlert: '@', titleConfirm: '@', titlePrompt: '@', titlePreview: '@', titleSound: '@',
				buttonOk: '@', buttonClose: '@', buttonNo: '@', buttonYes: '@'
			},

			link: function ($scope) {

				if ($scope.titleAlert && '' != $scope.titleAlert) {
					$popup.lng.titles.alert = $scope.titleAlert;
				}
				if ($scope.titleConfirm && '' != $scope.titleConfirm) {
					$popup.lng.titles.confirm = $scope.titleConfirm;
				}
				if ($scope.titlePrompt && '' != $scope.titlePrompt) {
					$popup.lng.titles.prompt = $scope.titlePrompt;
				}
				if ($scope.titlePreview && '' != $scope.titlePreview) {
					$popup.lng.titles.preview = $scope.titlePreview;
				}
				if ($scope.titleSound && '' != $scope.titleSound) {
					$popup.lng.titles.sound = $scope.titleSound;
				}

				if ($scope.buttonOk && '' != $scope.buttonOk) {
					$popup.lng.buttons.ok = $scope.buttonOk;
				}
				if ($scope.buttonClose && '' != $scope.buttonClose) {
					$popup.lng.buttons.close = $scope.buttonClose;
				}
				if ($scope.buttonNo && '' != $scope.buttonNo) {
					$popup.lng.buttons.no = $scope.buttonNo;
				}
				if ($scope.buttonYes && '' != $scope.buttonYes) {
					$popup.lng.buttons.yes = $scope.buttonYes;
				}
				
			}

		};

	}]);
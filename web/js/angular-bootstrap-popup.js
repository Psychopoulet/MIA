app.service('$popup', function() {

    "use strict";

    // methodes

        // private

            function _create(p_stPopupOptions, p_stModaleOptions) {

                var clModal, clDialog, clContent, clHeader, clBody, clFooter, clButtonClose;

                p_stPopupOptions = (p_stPopupOptions) ? p_stPopupOptions : {};
                p_stModaleOptions = (p_stModaleOptions) ? p_stModaleOptions : {};

                clModal = jQuery('<div class="modal fade text-left" data-backdrop="static" data-keyboard="true" data-show="false"></div>');

                    clDialog = jQuery('<div class="modal-dialog modal-' + ((p_stPopupOptions.size && 'large' == p_stPopupOptions.size) ? 'lg' : 'sm') + ' modal-vertical-centered"></div>');

                        clContent = jQuery('<div class="modal-content"></div>');

                            clHeader = jQuery('<div class="modal-header"><h4 class="modal-title"></h4></div>');

                                if (p_stPopupOptions.title && 0 < p_stPopupOptions.title.length) {

                                    if (1 == p_stPopupOptions.title.length) {
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
                                    clHeader.text('Alert');
                                }

                            clContent.append(clHeader);

                            clBody = jQuery('<div class="modal-body"></div>');

                                if (p_stPopupOptions.content && 0 < p_stPopupOptions.content.length) {

                                    if (1 == p_stPopupOptions.content.length) {
                                        clBody.text(p_stPopupOptions.content.toUpperCase());
                                    }
                                    else {
                                        clBody.text(p_stPopupOptions.content.charAt(0).toUpperCase() + p_stPopupOptions.content.slice(1));
                                    }

                                }
                                else if (p_stPopupOptions.content_html) {
                                    clBody.html(p_stPopupOptions.content_html);
                                }
                                else {
                                    clBody.text('Alert');
                                }

                            clContent.append(clBody);

                                clButtonClose = jQuery('<button type="button" class="btn btn-primary">Ok</button>');

                                    clButtonClose.click(function () {
                                        clModal.modal('hide');
                                    });

                                clFooter = jQuery('<div class="modal-footer"></div>').append(clButtonClose);

                            clContent.append(clFooter);

                        clDialog.append(clContent);

                    clModal.append(clDialog);

                    p_stModaleOptions.show = true;

                clModal.modal(p_stModaleOptions);

                clModal
                    .on('hidden.bs.modal', function () {
                        clModal.remove();
                        clModal = null;
                    });

                return clModal;

            }

        // public

            this.alert = function (p_sMessage, p_sTitle) {

                return _create({
                    title : (p_sTitle) ? p_sTitle : 'Alert',
                    content_html : p_sMessage
                }, {
                    backdrop : 'static',
                    keyboard : true
                });

            };

            this.preview = function (p_sUrl, p_sTitle) {

                return _create({
                    title : (p_sTitle) ? p_sTitle : 'Preview',
                    content_html : '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="' + p_sUrl + '" frameborder="0" allowfullscreen></iframe></div>',
                    size : 'large'
                }, {
                    backdrop : 'static',
                    keyboard : true
                });

            };

});
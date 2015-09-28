app.service('$popup', function() {

    "use strict";

    // attributes

        // private

            var
                m_clModalAlert = jQuery('#bootstrap-popup'),
                m_clModalAlertContent = jQuery('#bootstrap-popup-content');

    // methodes

        // private

            // on créé le composant dans une fonction au lieu du constructeur pour faciliter la libération de mémoire
            function _create() {

                var clDialog, clContent, clHeader, clBody, cFooter;

                m_clModalAlert = jQuery('<div id="compoBTR_alert" class="modal fade text-left" data-backdrop="static" data-keyboard="true" data-show="false"></div>');

                    clDialog = jQuery('<div class="modal-dialog modal-sm modal-vertical-centered"></div>');

                        clContent = jQuery('<div class="modal-content"></div>');

                            clHeader = jQuery('<div class="modal-header"><h4 class="modal-title">WyndPay</h4></div>');

                        clContent.append(clHeader);

                            clBody = jQuery('<div class="modal-body"></div>');
                                m_clModalAlertContent = jQuery('<p id="bootstrap-popup-content"></p>');
                            clBody.append(m_clModalAlertContent);

                        clContent.append(clBody);

                            cFooter = jQuery('<div class="modal-footer"><button id="compoBTR_alert_OK" type="button" class="btn btn-primary" data-dismiss="modal">Ok</button></div>');

                        clContent.append(cFooter);

                    clDialog.append(clContent);

                m_clModalAlert.append(clDialog);

                jQuery('body').append(m_clModalAlert);

            }

        // public

            this.alert = function (p_sMessage) {
                m_clModalAlertContent.html(p_sMessage.nl2br());
                m_clModalAlert.modal('show');
            };

    // constructor

        if (0 >= m_clModalAlert.length) {
            _create();
        }

});
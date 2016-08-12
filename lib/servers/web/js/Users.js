app.controller('ControllerUser', ['$scope', '$popup', function($scope, $popup) {

    "use strict";

    var _user = {};
    $scope.user = {};

        socket.on('user.error', $popup.alert)
        .on('user.update.login', function (login) {

            $popup.alert({
                type : 'success',
                message : "Login modifié."
            });

            $scope.$apply(function() {
                _user.login = login;
                $scope.user.login = login;
            });

        })
        .on('user.update.password', function () {

            $popup.alert({
                type : 'success',
                message : "Mot de passe modifié."
            });

        })
        .on('logged', function (client) {

            client.user.password = '';

            $scope.$apply(function() {
                angular.copy(client.user, _user);
                $scope.user = client.user;
            });

        });

        $scope.editLogin = function (login) {

            if (_user.login != login) {

                $popup.confirm({
                    message: "Voulez-vous vraiment remplacer votre login '" + _user.login + "' par '" + login + "' ?",
                    onyes: function() {
                        socket.emit('user.update.login', login);
                    }
                });

                
            }

        };

        $scope.editPassword = function (password) {

            if ('' != password) {

                $popup.prompt({
                    title: "Confirmez le mot de passe :",
                    label: "Mot de passe :",
                    fieldtype: 'password',
                    onconfirm: function(confirmpassword) {

                        if (password == confirmpassword) {

                            socket.emit('user.update.password', {
                                password: password,
                                confirm: confirmpassword
                            });

                        }
                        else {
                            
                            $popup.alert({
                                type : 'danger',
                                message : "Le mot de passe de confirmaton est incorrect."
                            });

                        }

                    }

                });

            }

        };

}]);

jQuery(document).ready(function() {

    jQuery('#navUsers').click(function() {

        jQuery('#modalUser').modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        }).on('shown.bs.modal', function () {
            jQuery('#formUserPassword').focus();
        });

        return false;

    });

});

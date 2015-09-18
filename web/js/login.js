jQuery(document).ready(function() {
	
	"use strict";

	var login_form = jQuery('#login_form');

	socket
		.on('disconnect', function () {

			socket.removeAllListeners('child.logged');
			socket.removeAllListeners('child.login.error');

			socket.logged = false;

		})

		.on('connect', function() {

			socket
				.on('child.logged', function () {

					socket.logged = true;
					login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');

				})
				.on('child.login.error', function (m_sError) {
					login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');
					socket.logged = false;
					alert(m_sError);
				});

		});

	login_form.submit(function (e) {
		login_form.find('input, button, select, checkbox').attr('disabled', 'disabled').addClass('disabled');
		socket.emit('child.login', { email : jQuery('#login_email').val(), password : jQuery('#login_password').val() });
		return false;

	});

});
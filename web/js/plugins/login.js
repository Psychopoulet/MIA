jQuery(document).ready(function() {
	
	"use strict";

	var status = jQuery('#status'),
		login_form = jQuery('#login_form');

	function _displayIsConnected() {

		if (!socket.connected) {
			status.removeClass('label-success').addClass('label-danger').text('disconnected');
			jQuery('#children').addClass('hidden');
		}
		else if (!socket.logged) {
			status.removeClass('label-success').removeClass('label-danger').addClass('label-warning').text('connected');
			login_form.removeClass('hidden');
			jQuery('#children').addClass('hidden');
		}
		else {
			status.removeClass('label-warning').removeClass('label-danger').addClass('label-success').text('logged');
			login_form.addClass('hidden');
			jQuery('#children').removeClass('hidden');
		}

	}

	socket
		.on('disconnect', function () {

			socket.removeAllListeners('child.logged');
			socket.removeAllListeners('child.login.error');

			socket.logged = false;
			_displayIsConnected();

		})

		.on('connect', function() {

			socket
				.on('child.logged', function () {

					socket.logged = true;
					_displayIsConnected();
					login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');

				})
				.on('child.login.error', function (m_sError) {
					login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');
					socket.logged = false;
					_displayIsConnected();
					alert(m_sError);
				});

			_displayIsConnected();

		});

	login_form.submit(function (e) {
		login_form.find('input, button, select, checkbox').attr('disabled', 'disabled').addClass('disabled');
		socket.emit('child.login', { email : jQuery('#login_email').val(), password : jQuery('#login_password').val() });
		return false;

	});

});
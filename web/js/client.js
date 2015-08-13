jQuery(document).ready(function() {
	
	"use strict";

	var status = jQuery('#status'),
		login_form = jQuery('#login_form');

	var socket;

	function _displayIsConnected() {

		if (!socket.connected) {
			status.removeClass('label-success').addClass('label-danger').text('disconnected');
		}
		else if (!socket.logged) {
			status.removeClass('label-success').removeClass('label-danger').addClass('label-warning').text('connected');
			login_form.removeClass('hidden');
		}
		else {
			status.removeClass('label-warning').removeClass('label-danger').addClass('label-success').text('logged');
			login_form.addClass('hidden');
		}

	}

	socket = io.connect('//' + window.location.hostname + ':1337');

	socket
		.on('connect', _displayIsConnected)
		.on('login_ok', function () {
			login_form.find('input').removeAttr('disable');
			socket.logged = true;
			_displayIsConnected();
		})
		.on('login_ko', function (m_sError) {
			login_form.find('input').removeAttr('disable');
			socket.logged = false;
			_displayIsConnected();
			alert(m_sError);
		})
		.on('disconnect', function () {
			socket.logged = false;
			_displayIsConnected();
		});

	login_form.submit(function (e) {
		login_form.find('input').attr('disable', 'disable');
		socket.emit('login', { email : jQuery('#login_email').val(), password : jQuery('#login_password').val() });
		return false;
	});

});
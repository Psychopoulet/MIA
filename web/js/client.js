jQuery(document).ready(function() {
	
	"use strict";

	var status = jQuery('#status'),
		login_form = jQuery('#login_form');

	var socket = io(function () {
		console.log('test');
	});

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

	socket
		.on('connect', _displayIsConnected)
		.on('logged', function () {
			socket.logged = true;
			_displayIsConnected();
		})
		.on('disconnect', function () {
			socket.logged = false;
			_displayIsConnected();
		});

	login_form.submit(function (e) {
		socket.emit('login', { email : jQuery('#login_email').val(), password : jQuery('#login_password').val() });
		return false;
	});

});
jQuery(document).ready(function() {
	
	"use strict";

	var login_form = jQuery('#login_form');

	// cookies

		function _createCookie(name, value, days) {

			var date, expires = '';

			if (days) {
				date = new Date();
				date.setTime(date.getTime() + (days*24*60*60*1000));
				expires = "; expires=" + date.toGMTString();
			}

			document.cookie = name + "=" + value + expires + "; path=/";

		}

		function _readCookie(name) {

			var nameEQ = name + "=", ca = document.cookie.split(';'), sResult = '';

			for(var i = 0; i < ca.length; ++i) {

				var c = ca[i];

				while (' ' == c.charAt(0)) {
					c = c.substring(1,c.length);
				}

				if (0 == c.indexOf(nameEQ)) {
					sResult = c.substring(nameEQ.length,c.length);
				}

			}

			return sResult;

		}

	// socket

		// connection

		socket.on('connect', function() {

			var token = '';

			jQuery('.only-disconnected, .only-logged').addClass('hidden');
			jQuery('.only-connected').removeClass('hidden');

			// check token

				if (localStorage) {
					token = localStorage.getItem('token');
				}
				if (!token) {

					token = _readCookie('token');

					if (token) {
						_createCookie('token', token, 360);
					}

				}

				if (token) {

					login_form.find('input, button, select, checkbox').attr('disabled', 'disabled').addClass('disabled');

					socket.emit('web.client.login', {
						token : token
					});

				}

		})
		.on('disconnect', function () {

			login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');

			jQuery('.only-logged, .only-connected').addClass('hidden');
			jQuery('.only-disconnected').removeClass('hidden');

		})

		// login

		.on('web.client.login.error', function (err) {
			login_form.find('input, button, select, checkbox').removeAttr('disabled', 'disabled').removeClass('disabled');
			alert(err);
		})
		.on('web.client.deleted', function (err) {

			if (localStorage) {
				localStorage.removeItem('token');
			}
			else {
				_createCookie('token', '', -1);
			}
			
		})
		.on('web.client.logged', function (data) {

			if (localStorage) {
				localStorage.setItem('token', data.token);
			}
			else {
				_createCookie('token', data.token, 360);
			}

			jQuery('.only-disconnected, .only-connected').addClass('hidden');
			jQuery('.only-logged').removeClass('hidden');

		});

	// form

		login_form.submit(function () {

			login_form.find('input, button, select, checkbox').attr('disabled', 'disabled').addClass('disabled');

			socket.emit('web.client.login', {
				login : jQuery('#login_login').val(),
				password : jQuery('#login_password').val()
			});

			return false;

		});

		jQuery('#login_allow').click(function () {

			login_form.find('input, button, select, checkbox').attr('disabled', 'disabled').addClass('disabled');

			socket.emit('web.client.login');

			return false;

		});

});
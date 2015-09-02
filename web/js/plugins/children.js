jQuery(document).ready(function() {
	
	"use strict";

	socket
		.on('disconnect', function () {

			jQuery('#children').empty().addClass('hidden');
			jQuery('#login_form').removeClass('hidden');

			socket.removeAllListeners('logged');

			socket.removeAllListeners('child.connection');
			socket.removeAllListeners('child.getconnected');
			socket.removeAllListeners('child.disconnected');

		})
		.on('connect', function () {

			socket.on('logged', function () {

				jQuery('#children').empty().removeClass('hidden');

				socket
					.on('child.getconnected', function(children) {

						jQuery.each(children, function (key, value) {
							jQuery('#children').append('<li id="child' + value.token + '">' + value.token + ', <span id="child' + value.token + 'temp"></span>°C</li>');
						});

					})
					.on('child.connection', function(child) {
						jQuery('#children').append('<li id="child' + child.token + '">' + child.token + ', <span id="child' + value.token + 'temp"></span>°C</li>');
					})
					.on('child.disconnected', function(value) {
						jQuery('#child' + value.token).remove();
					});

				socket.emit('child.getconnected');
				
			});

		});
		

});
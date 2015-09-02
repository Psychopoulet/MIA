jQuery(document).ready(function() {
	
	"use strict";

	socket
		.on('disconnect', function () {

			socket.removeAllListeners('logged');
			socket.removeAllListeners('temperature');

		})
		.on('connect', function () {

			socket.on('logged', function () {

				socket.on('temperature', function (socket) {
					jQuery('#child' + socket.token + 'temp').text(socket.temperature);
				});
				
			});

		});
		

});
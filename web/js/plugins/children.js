jQuery(document).ready(function() {
	
	"use strict";


	socket
		.on('child.connected', function(child) {

			console.log(child);

		});

});
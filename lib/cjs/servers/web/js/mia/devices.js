
jQuery(document).ready(function() {

	jQuery("#navDevices").click(function() {

		jQuery("#modalDevices").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});

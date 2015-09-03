<!DOCTYPE html>
<html>
	<head>
		
		<!-- INFOS -->

			<meta charset="utf-8" />
			<title>MIA</title>

			<link rel="shortcut icon" href="/pictures/favicon.png" />

			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="HandheldFriendly" content="True" />
			<meta name="MobileOptimized" content="320" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

			<meta name="google" content="notranslate" />
			
		<!-- CSS -->

			<link rel="stylesheet" type="text/css" href="/libs/bootstrap.css">
			
		<!-- JS -->

			<script type="text/javascript" src="/libs/jquery.js"></script>
			<script type="text/javascript" src="/libs/socketio.js"></script>
			<script type="text/javascript" src="/libs/angular.js"></script>

			<script type="text/javascript">
				var socket = io.connect();
				var app = angular.module('MIAApp', []);
			</script>
			
			<script src="/js/plugins.js"></script>
			
	</head>
 
	<body data-ng-app="MIAApp" class="container-fluid">

		<div class="row">

			<h2 class="col-xs-6">
				MIA
			</h2>

			<div class="col-xs-6 text-right">
				<span id="status" class="label label-danger">diconnected</span>
			</div>

		</div>

		<div class="row">

			<div class="col-xs-12">

				<form id="login_form" action="#" method="POST" class="panel panel-default hidden">

					<div class="panel-heading">Login</div>

					<div class="panel-body">

						<div class="form-group">
							<label for="login_email">Email</label>
							<input id="login_email" type="email" placeholder="Login" class="form-control">
						</div>

						<div class="form-group">
							<label for="login_password">Password</label>
							<input id="login_password" type="password" placeholder="Password" class="form-control">
						</div>

						<button type="submit" class="btn btn-default">Submit</button>

					</div>

				</form>

				<div id="children" class="panel panel-default hidden" data-ng-controller="ControllerChildren" class="hidden">

					<div class="panel-heading">Children</div>

					<div class="panel-body">

						<div data-ng-repeat="child in children" class="panel panel-default">
						
							<div class="panel-heading">{{child.name}}</div>

							<div class="panel-body">

								token : {{child.token}}<br />
								temperature : {{child.temperature}}°C

								<div class="panel panel-default">

									<div class="panel-heading">Youtube</div>

									<div class="panel-body">
										<input type="text" placeholder="url" data-ng-model="urlyoutube" />
										<button data-ng-click="play(child.token, urlyoutube)">Play</button>
									</div>

								</div>

							</div>

						</div>

					</div>

				</div>

			</div>

		</div>
		
	</body>
	
</html>
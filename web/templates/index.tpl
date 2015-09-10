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
			<script type="text/javascript" src="/libs/bootstrap.js"></script>
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

			<nav class="navbar navbar-default">

				<div class="navbar-header">
					<div class="navbar-brand">MIA</div>
				</div>

				<div class="collapse navbar-collapse bs-example-js-navbar-collapse">

					<ul class="nav navbar-nav only-logged hidden">
						<li class="dropdown">
							<a href="#" class="dropdown-toggle" data-toggle="dropdown">
								Medias
								<span class="caret"></span>
							</a>
							<ul class="dropdown-menu">
								<li><a id="menuYoutube" href="#">Youtube</a></li>
							</ul>
						</li>

					</ul>

					<div class="navbar-form navbar-right">
						<span class="label label-danger only-disconnected">diconnected</span>
						<span class="label label-warning only-connected hidden">connected</span>
						<span class="label label-success only-logged hidden">logged</span>
					</div>

				</div>

			</nav>

		</div>

		<div class="row">

			<div class="col-xs-12 only-disconnected">

				<div class="panel panel-danger">
					<div class="panel-heading">MIA déconnectée. Veuillez attendre la reconnexion.</div>
				</div>

			</div>

			<div class="col-xs-12 only-connected hidden">

				<form id="login_form" action="#" method="POST" class="panel panel-default">

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

			</div>

			<div data-ng-controller="ControllerChildren" class="col-xs-12 only-logged hidden">

				<div data-ng-repeat="child in children" class="panel panel-default">
				
					<div class="panel-heading">{{child.name}}</div>

					<div class="panel-body">

						token : {{child.token}}<br />
						temperature : {{child.temperature}}°C

						<div class="panel panel-default">

							<div class="panel-heading">Youtube</div>

							<div class="panel-body">
								<select class="form-control"
	                                data-ng-model="urlyoutube"
	                                data-ng-options="video.name for video in youtubevideos track by video.id"
	                                data-ng-hide="loadingYoutubeVideos"
		                        >
		                            <option value="">- NC -</option>
		                        </select>
								<button data-ng-click="play(child.token, urlyoutube)">Play</button>
							</div>

						</div>

					</div>

				</div>

			</div>

			<div id="modalYoutubeList" class="modal fade only-logged hidden" data-ng-controller="ControllerYoutubeList">

				<div class="modal-dialog modal-lg">

					<div class="modal-content">

						<div class="modal-header">
							<h4 class="modal-title">Youtube</h4>
						</div>

						<div class="modal-body">

			                <form class="form-inline">

			                    <div class="form-group">
			                    	<input type="text" data-ng-model="video.name" class="form-control" />
			                    </div>

			                    <div class="form-group">
			                    	<input type="text" data-ng-model="video.url" class="form-control" />
			                    </div>

			                    <button type="button" class="btn btn-primary" data-ng-click="add(video)">
			                        Add
			                    </button>

			                    <button type="button" class="btn btn-primary" data-ng-disabled="loading || !videos.length || !selected" data-ng-class="{'disabled' : loading || !videos.length || !selected }" data-ng-click="edit(video)">
			                        Edit
			                    </button>

			                </form>

							<table class="table table-bordered table-hover">

								<thead>
									<tr>
										<th>Name</th>
										<th>Address</th>
										<th></th>
									</tr>
								</thead>

								<tbody>

									<tr data-ng-show="loading && !videos.length">
										<td colspan="3">loading...</td>
									</tr>

									<tr data-ng-show="videos.length" data-ng-repeat="video in videos" data-ng-class="{ 'info' : video.selected }" data-ng-click="select(video)">

										<td>{{video.name}}</td>
										<td>{{video.url}}</td>
										<td>
											<input type="button" value="Preview" class="btn btn-primary col-xs-6" data-ng-click="preview(video)" />
											<input type="button" value="Delete" class="btn btn-primary col-xs-6" data-ng-click="delete(video)" />
										</td>

									</tr>

								</tbody>

							</table>

						</div>

						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				  		</div>

					</div>

				</div>

				<div id="modalYoutubePreview" class="modal fade only-logged hidden">

					<div class="modal-dialog modal-lg">

						<div class="modal-content">

							<div class="modal-header">
								<h4 class="modal-title">Youtube (preview {{video.name}})</h4>
							</div>

							<div class="modal-body">

								<div id="modalYoutubePreviewIframe" class="embed-responsive embed-responsive-16by9">
								  	
								</div>
								
					  		</div>

							<div class="modal-footer">
								<button type="button" class="btn btn-default" data-ng-click="closePreview()">Close</button>
					  		</div>

						</div>

					</div>

				</div>

			</div>

		</div>
		
	</body>
	
</html>
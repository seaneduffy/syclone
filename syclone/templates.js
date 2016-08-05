'use strict';

function applyVars(templateStr, vars) {
	for(let key in vars) {
		templateStr = templateStr.replace(new RegExp('_'+key+'_','g'), vars[key]);
	}
	return templateStr;
}

module.exports = {
	home: function(vars){
		
		let templateStr = '<!doctype html>\
			<html><head><title>Syclone</title>\
			<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">\
			<link rel="stylesheet" type="text/css" href="/css/main.css">\
			<script src="/angular/angular.min.js"></script>\
			<script src="/js/main.js"></script>\
			</head>\
			<body ng-app="main" ng-controller="main" authenticated="_authenticated_">\
				<div ng-include src="\'/templates/syclone.html\'"></div>\
			</body>\
		</html>';
		return applyVars(templateStr, vars);
	}
}
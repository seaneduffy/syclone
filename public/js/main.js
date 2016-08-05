var app = angular.module('main', []);

app.controller('main', ['$scope', '$http', function($scope, $http){
	
	$scope.location = 'landing';
	$scope.searching = '';
	$scope.cloud = new Array();
	$scope.cloudIndex = 0;
	$scope.searchKeywords = {
		text: ''
	};
	$scope.showSearch = showSearch;
	$scope.moveLayer = moveLayer;
	$scope.loadTweets = loadTweets;
	
	function addLayer(keywords, tweets){
		while($scope.cloudIndex < $scope.cloud.length-1) {
			$scope.cloud.pop();
		}
		$scope.cloud.push({
			tweets: tweets,
			keywords: keywords 
		});
		moveLayer(1);
	}
	
	function moveLayer(direction) {
		if($scope.cloud.length > 1) {
			$scope.cloud[$scope.cloudIndex].position = direction > 0 ? 'currToPrev' : 'currToNext';
			$scope.cloud[$scope.cloudIndex + direction].position = direction > 0 ? 'nextToCurr' : 'prevToCurr';
			$scope.cloudIndex += direction;
		} else {
			$scope.cloud[$scope.cloudIndex].position = direction > 0 ? 'nextToCurr' : 'prevToCurr';
		}
		requestAnimationFrame(function(){
			$scope.$apply();
		});
	}

	function showSearch() {
		$scope.searching = 'search';
		requestAnimationFrame(function(){
			$scope.$apply();
		});
	};
	
	function loadTweets(){
		if(!$scope.authenticated) {
			window.location.href = '/request';
		} else {
			$http({
				method: 'GET',
				url: '/search/?keywords='+encodeURIComponent($scope.searchKeywords.text)
			}).then(function(response) {
				if(!response.data.success) {
					window.location.href = '/request';
				} else {
					
					$scope.location = 'cloud';
					$scope.searching = '';
					addLayer($scope.searchKeywords.text, response.data.tweets);
					
				}
	
			});
		}
	}
}]);

app.directive('cloud', function(){
	return {
		templateUrl: '/templates/cloud.html',
		link: function(scope, element, attrs) {
			
		}
	}
});

app.directive('authenticated', function(){
	return {
		link: function(scope, element, attr) {
			scope.authenticated = attr.authenticated === 'true';
		}
	}
});

app.directive('search', function(){
	return {
		scope: {
			loadSearch: '&',
			keywords: '=',
			pos: '='
		},
		template: '<div class="container" ng-style="{top:pos.top, left:pos.left}">\
			<div><input ng-model="keywords.text" type="text">\
				<button ng-click="loadSearch()">search</button>\
			</div>\
		</div>'
	};
});

app.directive('tweetlayer', function(){
	return {
		templateUrl: '/templates/tweetlayer.html',
		link: function(scope, element, attr) {
		}
	}
});

app.directive('tweet', function(){
	return {
		scope: {
			profileBannerUrl: '@',
			profileImageUrl: '@',
			userScreenname: '@',
			userName: '@',
			text: '@',
			tweetIndex: '@',
			showSearch: '&',
			searchKeywords: '='
		},
		templateUrl: '/templates/tweet.html',
		link: function(scope, element, attr) {
			var increment = Math.PI / 180 * 60,
				angle = increment * scope.tweetIndex,
				point = geom.getVector( angle % (2 * Math.PI), Math.floor(angle / (2 * Math.PI)) * 180 + 200);
			scope.position = 'left: '+Math.floor(point.x)+'px; top:'+Math.floor(point.y)+'px';
		}
	}
});

app.directive('selecttext', function(){
	
	return {
		scope: {
			selected: '=',
			textSelected: '&'
		},
		link: function(scope, element, attr) {
			
			var $spans,
				selectedText = '';
			
			function hoverText(){
				selectedText = '';
				angular.element(this).addClass('highlight');
				var i=0, l = $spans.length;
				for(i; i<l; i++) {
					var $el = angular.element($spans[i]);
					if($el.hasClass('highlight')) {
						selectedText += ' '+$el.text();
					}
					selectedText = selectedText.trim();
				}
			}
			
			function textSelected() {
				scope.selected.text = selectedText;
				$spans.off('mouseover', hoverText);
				scope.textSelected();
				angular.element(document.body).off('mouseup', textSelected);
			}
			
			requestAnimationFrame(function(){
				var str = element.text().replace(/ /g, '</span> <span>');
				str = '<span>' + str + '</span>';
				element.html(str);
				
				requestAnimationFrame(function(){
					$spans = element.find('span');
					
					angular.element(document.body).on('mousedown', function(){
						$spans.removeClass('highlight');
					});
					
					$spans.on('mousedown', function(){
						
						requestAnimationFrame(()=>{
							hoverText.call(this);
						});
						
						$spans.on('mouseover', hoverText);
					
						angular.element(document.body).on('mouseup', textSelected);
					});
				});
			});
		}
	}
});

app.directive('cloudNavigation', function(){
	return {
		scope: {
			backKeywords: '=',
			forwardKeywords: '=',
			goBack: '&',
			canGoBack: '=',
			goForward: '&',
			canGoForward: '='
		},
		template: '\<div class="container">\
			<div ng-style="{\'display\':canGoBack?\'block\':\'none\'}">\
				<button ng-click="goBack()">Back</button><span ng-bind="keywords"></span>\
			</div>\
			<div ng-style="{\'display\':canGoForward?\'block\':\'none\'}">\
				<button ng-click="goForward()">Forward</button><span ng-bind="keywords"></span>\
			</div>\
		</div>'
	}
});
	

	
var geom = (function(){
	
	var a360 = 2 * Math.PI,
		a90 = Math.PI / 2,
		a180 = Math.PI,
		a270 = 3 * Math.PI / 2;
	
	function getVector(angle, distance) {		
		let point = {}, 
			tmpAngle = 0, 
			xModifier = 1,
			yModifier = 1;
	
		if(angle === 0 || angle === a360) {
			point.x = 0;
			point.y = -distance;
			return point;
		} else if(angle === a90) {
			point.x = distance;
			point.y = 0;
			return point;
		} else if(angle === a180) {
			point.x = 0;
			point.y = distance;
			return point;
		} else if(angle === a270) {
			point.x = -distance;
			point.y = 0;
			return point;
		} else if(angle < a90) {
			tmpAngle = a90 - angle;
			xModifier = 1;
			yModifier = -1;
		} else if(angle < a180) {
			tmpAngle = angle - a90;
			xModifier = 1;
			yModifier = 1;
		} else if(angle < a270) {
			tmpAngle = a270 - angle;
			xModifier = -1;
			yModifier = 1;
		} else {
			tmpAngle = angle - a270;
			xModifier = -1;
			yModifier = -1;
		}
		point.x = Math.cos(tmpAngle) * distance * xModifier; 
		point.y = Math.sin(tmpAngle) * distance * yModifier;
		return point;
	}
	
	return {
		getVector: getVector
	}
}());
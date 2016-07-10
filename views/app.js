angular.module('myApp', []).controller('searchController', function($scope, $http) {

	$scope.sold = [
		{name: 'Default - 0 and more', value: 0},
		{name: '2 and more', value: 2},
		{name: '5 and more', value: 5},
		{name: '10 and more', value: 10},
		{name: '15 and more', value: 15}
	]
	$scope.options = [{name: 'Last 5 days', value: 5},
					  {name: 'Last 15 days', value: 15},
					  {name: 'Last 30 days', value: 30},
					  {name: 'Last 60 days', value: 60}];
	$scope.amazon_matches = 0;
	$scope.search = function(username, date, sold) {
		
		var begin=Date.now();
		$http.get('/search?username='+username+'&date='+date+'&sold='+sold).then(function(resp) {
			var end=Date.now();
			console.log(resp);
			$scope.pageLoaded = true;
			$scope.loading = false;
			$scope.item = resp.data.data;
			$scope.searchTime = (end-begin)/1000+' Seconds';
			for(var i in $scope.item) {
		
				if($scope.item[i].amazon[0] && $scope.item[i].amazon[0].asin) {
					console.log('fo real??');
					$scope.amazon_matches++;
				}
				
			}

		}, function(err) {
			console.log(err);
			
		})


	}
})
var app = angular.module('fundingHubApp', []);

app.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller("fundingHubController", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout) {
	$scope.accounts = [];
 	$scope.account = "";
	$scope.prCount = "";
	$scope.status = "Test";



	$scope.refreshBalance = function() {

	  FundingHub.deployed().getProjectCount.call($scope.account, {from: $scope.account})
		.then(function(value) {
		    $timeout(function () {
		        $scope.prCount = value.valueOf();
		    });
	    console.log("Project count = "+value.valueOf());
	  }).catch(function(e) {
	    console.log(e);
	    $scope.status = "Error getting balance; see log.";
	  });
	};
    
	$scope.addProject = function(newName, newGoal, newDeadline) {
		console.log(newName+ newGoal+ newDeadline);
		$scope.status = "Adding project";
		FundingHub.deployed()
			.createProject(
				newName,
				newGoal,
				newDeadline,
				{ from: $scope.account, gas: 3000000 })
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("project added");
				$scope.status = "Project added";
				$scope.refreshBalance();
				$scope.collectProjects();
			});
	};


	$scope.collectProjects = function() {
		$scope.projects = [];
		FundingHub.deployed().getProjectCount.call($scope.account, {from: $scope.account})
			.then(function (count) {
				$timeout(function () {
					console.log("Count="+count.valueOf());
					if (count.valueOf() > 0) {
						for (var i = 0; i < count.valueOf(); i++) {
							console.log("i="+i);
							/*FundingHub.deployed().getProjectName.call(i, {from: $scope.account})
								.then(function (values) {
									console.log("OK"+values);
									$timeout(function () {
										console.log("OK1"+values.valueOf());
										$scope.projects.push({
											name: values.valueOf()
										});
									});
								})
								.catch(function (e) {
									console.log("NOK");
									console.error(e);
								});*/							
						}
					}
				});
			});
	};

	$window.onload = function () {

		initUtils(web3);
		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
			  alert("There was an error fetching your accounts.");
			  return;
			}

			if (accs.length == 0) {
			  alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			  return;
			}

			$scope.accounts = accs;
            		$scope.account = $scope.accounts[0];

		});	

		$scope.refreshBalance();
		$scope.collectProjects();

	}

}]);

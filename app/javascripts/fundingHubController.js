var app = angular.module('fundingHubApp', []);

app.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller("fundingHubController", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout) {
	$scope.accounts = [];
 	$scope.account = "";
	$scope.prCount = "";
	$scope.status = "";
	$scope.balance="";

	$scope.reFund = function(projectId) {

		console.log("Refund projectId="+projectId);
		$scope.refundstatus = "refunding...";
		FundingHub.deployed()
			.refund(
				projectId,
				{ from: $scope.account, gas: 3000000})
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("project refundeded "+receipt);
				$scope.refundstatus = "refunded";
				$scope.collectProjects();
			});
	};

	$scope.fundProject = function(projectId, fundAmont) {

		console.log("projectId="+projectId+" fundAmont="+fundAmont);
		$scope.fundstatus = "funding project...";
		FundingHub.deployed()
			.contribute(
				projectId,
				{ from: $scope.account, gas: 3000000, value: fundAmont})
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("project funded "+receipt);
				$scope.fundstatus = "Project funded";
				$scope.collectProjects();
			});
	};

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
				newDeadline*60,
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

	$scope.hex2str = function hex2a(hexx) {
	    var hex = hexx.toString();//force conversion
	    var str = '';
	    for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	    return str;
	}


	$scope.collectProjects = function() {
		//$scope.balance = web3.eth.getBalance("'"+$scope.account+"'");
		$scope.balance = web3.eth.getBalance($scope.account).valueOf();
		$scope.projects = [];
		FundingHub.deployed().getProjectCount.call($scope.account, {from: $scope.account})
			.then(function (count) {
				$timeout(function () {
					console.log("Count="+count.valueOf());
					if (count.valueOf() > 0) {
						for (var i = 0; i < count.valueOf(); i++) {
							FundingHub.deployed().getProjectInfo.call(i, {from: $scope.account})
								.then(function (values) {
									$timeout(function () {
										console.log("OK "+values.valueOf());
										var d = new Date(1970, 0, 1);
										console.log("date "+d);
										$scope.projects.push({
											projectId: values[0].valueOf(),
											name: $scope.hex2str(values[1]),
											goal: values[2].valueOf(),
											deadline: values[3].valueOf()*1000,
											owner: values[4].valueOf(),
											raised: values[5].valueOf(),
											myFunding: values[6].valueOf()
										});
									});
								})
								.catch(function (e) {
									console.log("NOK");
									console.error(e);
								});						
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
			$scope.balance = web3.eth.getBalance($scope.account).valueOf();
			console.log($scope.account);
			$scope.refreshBalance();
			$scope.collectProjects();
		});
	}

}]);

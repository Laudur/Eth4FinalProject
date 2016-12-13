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

	$scope.reFund = function(projectAddr, name) {

		console.log("Refund projectId="+projectAddr);
		$scope.status = "Refunding from project "+name;
		Project.at(projectAddr)
			.refund(
				{ from: $scope.account, gas: 500000, gasPrice: web3.eth.gasPrice.toString(10)})
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("project refundeded "+receipt);
				$scope.status = "Project "+name+" refunded";
				$scope.collectProjects();
			});
	};

	$scope.fundProject = function(projectId, fundAmont, name) {

		console.log("projectId="+projectId+" fundAmont="+fundAmont);
		$scope.status = "Funding project "+name;
		FundingHub.deployed()
			.contribute(
				projectId,
				{ from: $scope.account, gas: 500000, value: fundAmont, gasPrice: web3.eth.gasPrice.toString(10)})
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("Project "+name+" funded");
				$scope.status = "Project "+name+" funded";
				$scope.collectProjects();
			});
	};
    
	$scope.addProject = function(newName, newGoal, newDeadline) {
		console.log(newName+ newGoal+ newDeadline);
		$scope.status = "Adding project "+newName;
		FundingHub.deployed()
			.createProject(
				newName,
				newGoal,
				newDeadline*60,
				{ from: $scope.account, gas: 500000, gasPrice: web3.eth.gasPrice.toString(10) })
			.then(function (tx) {
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
				console.log("project added");
				$scope.status = "Project "+newName+" added";
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
		$scope.balance = web3.eth.getBalance($scope.account).valueOf();
		$scope.projects = [];
		FundingHub.deployed().getProjectCount.call($scope.account, {from: $scope.account})
			.then(function (count) {
				$timeout(function () {
					if (count.valueOf() > 0) {
						for (var i = 0; i < count.valueOf(); i++) {
							FundingHub.deployed().getProjectInfo.call(i, {from: $scope.account})
								.then(function (values) {
									$timeout(function () {
										console.log("name="+values[0].valueOf()+" "+values[1]);
										$scope.projects.push({
											projectId: values[0].valueOf(),
											name: $scope.hex2str(values[1]),
											goal: values[2].valueOf(),
											deadline: values[3].valueOf()*1000,
											owner: values[4].valueOf(),
											raised: values[5].valueOf(),
											myFunding: values[6].valueOf(),
											address: values[7].valueOf()
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

	/*$window.onload = function () {
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
			$scope.collectProjects();
		});
	}*/
	$window.onload = function () {
		    initUtils(web3);
		    // Example of seed 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
		    var seed = prompt('Enter your private key seed', '12 words long');;
		    // the seed is stored in memory and encrypted by this user-defined password
		    var password = prompt('Enter password to encrypt the seed', 'dev_password');

		    lightwallet.keystore.deriveKeyFromPassword(password, function(err, _pwDerivedKey) {
			pwDerivedKey = _pwDerivedKey;
			ks = new lightwallet.keystore(seed, pwDerivedKey);
			// Create a custom passwordProvider to prompt the user to enter their
			// password whenever the hooked web3 provider issues a sendTransaction
			// call.
			ks.passwordProvider = function (callback) {
			    var pw = prompt("Please enter password to sign your transaction", "dev_password");
			    callback(null, pw);
			};
			var provider = new HookedWeb3Provider({
			    // Let's pick the one that came with Truffle
			    host: web3.currentProvider.host,
			    transaction_signer: ks
			});
			web3.setProvider(provider);
			// And since Truffle v2 uses EtherPudding v3, we also need the line:
			FundingHub.setProvider(provider);
			// Generate the first address out of the seed
			ks.generateNewAddress(pwDerivedKey);
			$scope.accounts = ks.getAddresses();
			$scope.account = "0x" + $scope.accounts[0];
			console.log("Your account is " + $scope.account);
			$scope.balance = web3.eth.getBalance($scope.account).valueOf();
			console.log($scope.account);
			$scope.collectProjects();
		});
	}

}]);

var app = angular.module('fundingHubApp', []);

app.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller("fundingHubController", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout) {
	$scope.accounts = [];
 	$scope.account = "";
	$scope.prCount = "";
	$scope.status = "";
	$scope.balance = "";
        $scope.contract = "";

	$scope.reFund = function(projectAddr, name) {
		console.log("reFund: projectAddr="+projectAddr+" name="+name);
		$scope.status = "Refunding from project: "+name;
		Project.at(projectAddr).refund(
				{ from: $scope.account, gas: 500000, gasPrice: web3.eth.gasPrice.toString(10)})
			.then(function(result) {
				console.log("Refunded "+result.tx+" "+result.logs);
				console.log(result.receipt);
				$scope.status = "Project "+name+" refunded";
				$scope.collectProjects();
				return web3.eth.getTransactionReceiptMined(result.tx);
			});
	};

	$scope.fundProject = function(projectAddr, fundAmont, name) {
		console.log("fundProject: projectAddr="+projectAddr+" fundAmont="+fundAmont+" name="+name);
		if(fundAmont>=1){
			$scope.status = "Funding project: "+name;
			FundingHub.deployed().then(function(instance) {
			  deployed = instance;  
			  return deployed.contribute(projectAddr, { from: $scope.account, gas: 500000, value: fundAmont*1000000000000000000, gasPrice: web3.eth.gasPrice.toString(10)});
			}).then(function(result) {
				console.log("Contributed "+result.tx+" "+result.logs);
				console.log(result.receipt);
				$scope.status = "Project "+name+" funded";
				$scope.collectProjects();
				return web3.eth.getTransactionReceiptMined(result.tx);
			});
		}else{
			$scope.status = "Funding amount too small!";
		}
	};
    
	$scope.addProject = function(newName, newGoal, newDeadline) {
		console.log("addProject: newName="+newName+" newGoal"+ newGoal+" newDeadline"+ newDeadline);
		$scope.status = "Adding project "+newName;
		FundingHub.deployed().then(function(instance) {
			  deployed = instance;  
			  return deployed.createProject(
				newName,
				newGoal*1000000000000000000,
				newDeadline*60,
				{ from: $scope.account, gas: 500000, gasPrice: web3.eth.gasPrice.toString(10) });
			}).then(function(result) {
				console.log("Project "+newName+" added");
				$scope.status = "Project "+newName+" added";
				console.log(result.receipt);
				$scope.collectProjects();
				return web3.eth.getTransactionReceiptMined(result.tx);
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
		$scope.balance = web3.eth.getBalance($scope.account).valueOf()/1000000000000000000;
		$scope.projects = [];
		var dt = new Date();
		var date = dt.getTime();
		console.log("Time: "+date);
		FundingHub.deployed().then(function(instance) {
console.log("instance: "+instance);
		  $scope.contract = instance.address;
		  //deployed = instance;  
		  return instance.getProjectCount.call($scope.account, {from: $scope.account})
			.then(function (count) {
				$timeout(function () {
					if (count.valueOf() > 0) {
						console.log("count: "+count);
  						var c = count.valueOf();
						for (var i = 0; i < c; i++) {
								console.log("i: "+i);
							 instance.getProjectAddr.call(i, {from: $scope.account})
							.then(function (values1) {
								$timeout(function () {
									var addr = values1.valueOf();
									console.log("addr: "+addr);
									Project.at(addr).getInfo.call({from: $scope.account})
										.then(function (values) {
											$timeout(function () {
												var f = false;
												var rf = false;
												var g = Number(values[1].valueOf());
												var r = Number(values[4].valueOf());
												var mf = Number(values[5].valueOf());
												var d = Number(values[2].valueOf());
												var mess = "";
												if (g > r && d*1000>date){
													f=true;
												}
												if (g > r && mf>0){
													rf=true;
												}
												if (g <= r){
													mess="Goal reached!";
												}
												else if (d*1000<=date){
													mess="Deadline passed!";
												}
												$scope.projects.push({
													name: $scope.hex2str(values[0]),
													goal: g/1000000000000000000,
													deadline: d*1000,
													owner: values[3].valueOf(),
													raised: r/1000000000000000000,
													myFunding: mf/1000000000000000000,
													address: values[6].valueOf(),
													fundable: f,
													refundable: rf,
													message: mess
												});
											});
										})
										.catch(function (e) {
											console.log("Problem calling getInfo");
											console.error(e);
										});
								});
							})
							.catch(function (e) {
								console.log("Problem calling getProjectAddr");
								console.error(e);
							});
						}
					}
				});
			});
}).then(function(result) {
console.log("End result");
  // result is an object with the following values:
  //
  // result.tx      => transaction hash, string
  // result.logs    => array of decoded events that were triggered within this transaction
  // result.receipt => transaction receipt object, which includes gas used
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
			$scope.collectProjects();
		});
	}
	/*$window.onload = function () {
		    initUtils(web3);
		    // Example of seed 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
		    //var seed = prompt('Enter your private key seed', '12 words long');
var seed = lightwallet.keystore.generateRandomSeed();
		    // the seed is stored in memory and encrypted by this user-defined password
		    var password = prompt('Enter password to encrypt the seed', 'dev_password');
var salt = lightwallet.keystore.generateSalt();
		    lightwallet.keystore.deriveKeyFromPassword(password, salt, function(err, _pwDerivedKey) {
			pwDerivedKey = _pwDerivedKey;
			ks = new lightwallet.keystore(seed, pwDerivedKey);
			// Create a custom passwordProvider to prompt the user to enter their
			// password whenever the hooked web3 provider issues a sendTransaction
			// call.
			console.log("1");
			ks.passwordProvider = function (callback) {
			    var pw = prompt("Please enter password to sign your transaction", "dev_password");
			    callback(null, pw);
			};
			var provider = new HookedWeb3Provider({
			    // Let's pick the one that came with Truffle
			    host: web3.currentProvider.host,
			    transaction_signer: ks
			});
			console.log("2");
			web3.setProvider(provider);
			// And since Truffle v2 uses EtherPudding v3, we also need the line:
			console.log("3");
			FundingHub.setProvider(provider);
			console.log("4");
			Project.setProvider(provider);
			console.log("seed "+seed);
			// Generate the first address out of the seed
			ks.generateNewAddress(pwDerivedKey, 1);
			console.log("6");
			$scope.accounts = ks.getAddresses();
			console.log("7");
			$scope.account = "0x" + $scope.accounts[0];
			console.log("Your account is " + $scope.account);
			$scope.balance = web3.eth.getBalance($scope.account).valueOf();
			$scope.collectProjects();
		});
	}*/

}]);

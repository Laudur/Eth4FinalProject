var FundingHub = artifacts.require("./FundingHub.sol");

module.exports = function(deployer) {

	deployer.then(function() {
	  // Create a new version of FundingHub
	  return FundingHub.new();
	}).then(function(instance) {
	  // Set the new instance of A's address on B.
	  FundingHub.deployed().then(function(instance) {
	  	deployed = instance;  
	  	return deployed.createProject("First Project", 1000000000000000000*100, 7*60*60*24);
	  }).then(function(result) {
		  // result is an object with the following values:
		  //
		  // result.tx      => transaction hash, string
		  // result.logs    => array of decoded events that were triggered within this transaction
		  // result.receipt => transaction receipt object, which includes gas used
		});
	});
}

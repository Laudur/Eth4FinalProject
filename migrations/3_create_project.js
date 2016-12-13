module.exports = function(deployer) {

	deployer.then(function() {
	  // Create a new version of FundingHub
	  return FundingHub.new();
	}).then(function(instance) {
	  // Set the new instance of A's address on B.
	  var f = FundingHub.deployed();
	  return f.createProject("First Great Project", 10000, 7*60*60*24);
	});
}

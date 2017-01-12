contract('FundingHub', function(accounts) {
  it("should be possible to refund", function() {
    var account_one = accounts[0];
    var account_two = accounts[1];
console.log("Log1");
    var hub = FundingHub.deployed();
    hub.getProjectAddr.call(0, {from: account_one})
    .then(function (values1) {
          Project.at(values1).getInfo.call({from: account_one}).then(function(values) {
		console.log(values[6].valueOf());
              assert.equal(values[6].valueOf(), values1, "Initial project not created");
    	  });
	  var amount1 = 500;
          var amount2 = 300;
	  hub.contribute(values1, { from: account_one, gas: 500000, value: amount1, gasPrice: web3.eth.gasPrice.toString(10)})
         .then(function () {
		  Project.at(values1).getInfo.call({from: account_one})
                  .then(function(values) {
		      console.log("funded1="+values[5].valueOf()+" total="+values[4].valueOf());
		      assert.equal(values[5].valueOf(), amount1, "Account not funded by account1");
	    	  });
          })
          .then(function () {
		  hub.contribute(values1, { from: account_two, gas: 500000, value: amount2, gasPrice: web3.eth.gasPrice.toString(10)})
		  .then(function () {
			  Project.at(values1).getInfo.call({from: account_two})
		          .then(function(values) {
				console.log("funded2="+values[5].valueOf()+" total="+values[4].valueOf());
			      assert.equal(values[5].valueOf(), amount2, "Account not funded by account2");
		    	  })
			  .then(function () {
				  Project.at(values1).refund({from: account_one})
				   .then(function() {
				          Project.at(values1).getInfo.call({from: account_two})
				          .then(function(values) {
					      console.log("total after 1st refund="+values[4].valueOf()+" total="+values[4].valueOf());
					      assert.equal(values[4].valueOf(), amount2, "Project balance not "+amount2);
				    	  });
				   });
			  });
          	  });
          });
    });
  });
  /*it("should call a function that depends on a linked library", function() {
    var meta = MetaCoin.deployed();
    var metaCoinBalance;
    var metaCoinEthBalance;

    return meta.getBalance.call(accounts[0]).then(function(outCoinBalance) {
      metaCoinBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth) {
      metaCoinEthBalance = outCoinBalanceEth.toNumber();
    }).then(function() {
      assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpeced function, linkage may be broken");
    });
  });
  it("should send coin correctly", function() {
    var meta = MetaCoin.deployed();

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return meta.getBalance.call(account_one).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });*/
});

contract('FundingHub', function(accounts) {
  var account1 = accounts[0];//owner
  var account2 = accounts[1];
  var account3 = accounts[2];
  var project1 = "";
	var amount2a = 310000000000000000;
	var amount2b = 530000000000000000;
	var amount3a = 170000000000000000;
	var amount3b = 80000000000000000;

  //function for adding balances
  function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = 10,
            sum, i, ia, ib;
        for (i = 0; i < l_a; i++) {
            ia = l_a - 1 - i;
            ib = l_b - 1 - i;

            if(ib>=0)
            	sum = Number(a[ia]) + Number(b[ib]) + carry;
            else
							sum = Number(a[ia]) + carry;

            carry = sum >= base ? 1 : 0;
            r[ia] = sum - carry * base;
        }

      var str = '';
	    for (var i = 0; i < r.length; i += 1){
				str += String(r[i]);
			}
	    return str;
    }

  it("initial Project created", function() {
    console.log("Test1 start");
    return FundingHub.deployed().getProjectAddr.call(0, {from: account1})
    .then(function (values1) {
          return Project.at(values1).getInfo.call({from: account1})
          .then(function(values) {
              project1 = values[6].valueOf();
	            console.log("Project1="+project1);
              assert.equal(project1, values1, "Initial project not created");
    	  });
    });
  });

  it("should be possible for owner to refund all", function() {
			console.log("Test2 start");
			var bal1 = 0;
			var bal2 = 0;
			var bal3 = 0;
			var goal2 = 0;
			var goal3 = 0;
			var hub = FundingHub.deployed();

			console.log("Contributing from account2 "+amount2a+"...");
	    return hub.contribute(project1, { from: account2, gas: 500000, value: amount2a, gasPrice: web3.eth.gasPrice.toString(10)})
		  .then(function (success) {
				return Project.at(project1).getInfo.call({from: account2});
      })
			.then(function(values) {
				console.log("Project account2="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount2a, "Account not funded by account2");
				assert.equal(values[4].valueOf(), amount2a, "Project total wrong (account2 cont 1)");
			})
			.then(function () {
			  console.log("Contributing from account3 "+amount3a+"...");
				return hub.contribute(project1, { from: account3, gas: 500000, value: amount3a, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account3});
      })
			.then(function(values) {
				console.log("Project account3="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount3a, "Account not funded by account3");
				assert.equal(values[4].valueOf(), amount2a + amount3a, "Project total wrong (account3 cont 1)");
			})
      .then(function () {
			  console.log("Contributing from account2 "+amount2b+"...");
				return hub.contribute(project1, { from: account2, gas: 500000, value: amount2b, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account2});
      })
			.then(function(values) {
				console.log("Project account2="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount2a + amount2b, "Account not funded by account2");
				assert.equal(values[4].valueOf(), amount2a + amount2b +amount3a, "Project total wrong (account2 cont 2)");
			})
      .then(function () {
			  console.log("Contributing from account3 "+amount3b+"...");
				return hub.contribute(project1, { from: account3, gas: 500000, value: amount3b, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account3});
      })
			.then(function(values) {
				console.log("Project account3="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount3a + amount3b, "Account not funded by account3");
				assert.equal(values[4].valueOf(), amount2a + amount2b + amount3a + amount3b, "Project total wrong (account3 cont 2)");
				bal1 = web3.eth.getBalance(project1).valueOf();
				assert.equal(bal1, amount2a + amount2b + amount3a + amount3b, "Project balance wrong");
			})
			.then(function () {
				console.log("Owner refund...");
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				console.log("account2 balance before "+bal2);
				console.log("account3 balance before "+bal3);
			  return Project.at(project1).refund({from: account1});
			})
			.then(function (success) {
				goal2 = add(bal2, String(amount2a + amount2b));
				goal3 = add(bal3, String(amount3a + amount3b));
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				bal1 = web3.eth.getBalance(project1).valueOf();
				console.log("account2 balance after "+bal2+" goal="+goal2);
				console.log("account3 balance after "+bal3+" goal="+goal3);
				assert.equal(bal2, goal2, "Refunded amount wrong to account2");
				assert.equal(bal3, goal3, "Refunded amount wrong to account3");
				assert.equal(bal1, 0, "Project balance should be 0");
				return Project.at(project1).getInfo.call({from: account1});
      })
			.then(function(values) {
				console.log("After refund: account1="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[4].valueOf(), 0, "Project total wrong (account1 refund)");
			});
  });

  it("should be possible for contibutor to refund", function() {
			console.log("Test3 start");
			var bal1 = 0;
			var bal2 = 0;
			var bal3 = 0;
			var goal2 = 0;
			var goal3 = 0;
			var hub = FundingHub.deployed();

			console.log("Contributing from account2 "+amount2a+"...");
	    return hub.contribute(project1, { from: account2, gas: 500000, value: amount2a, gasPrice: web3.eth.gasPrice.toString(10)})
		  .then(function (success) {
				return Project.at(project1).getInfo.call({from: account2});
      })
			.then(function(values) {
				console.log("Project account2="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount2a, "Account not funded by account2");
				assert.equal(values[4].valueOf(), amount2a, "Project total wrong (account2 cont 1)");
			})
			.then(function () {
			  console.log("Contributing from account3 "+amount3a+"...");
				return hub.contribute(project1, { from: account3, gas: 500000, value: amount3a, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account3});
      })
			.then(function(values) {
				console.log("Project account3="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount3a, "Account not funded by account3");
				assert.equal(values[4].valueOf(), amount2a + amount3a, "Project total wrong (account3 cont 1)");
			})
      .then(function () {
			  console.log("Contributing from account2 "+amount2b+"...");
				return hub.contribute(project1, { from: account2, gas: 500000, value: amount2b, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account2});
      })
			.then(function(values) {
				console.log("Project account2="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount2a + amount2b, "Account not funded by account2");
				assert.equal(values[4].valueOf(), amount2a + amount2b +amount3a, "Project total wrong (account2 cont 2)");
			})
      .then(function () {
			  console.log("Contributing from account3 "+amount3b+"...");
				return hub.contribute(project1, { from: account3, gas: 500000, value: amount3b, gasPrice: web3.eth.gasPrice.toString(10)});
      })
			.then(function (success) {
				return Project.at(project1).getInfo.call({from: account3});
      })
			.then(function(values) {
				console.log("Project account3="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[5].valueOf(), amount3a + amount3b, "Account not funded by account3");
				assert.equal(values[4].valueOf(), amount2a + amount2b + amount3a + amount3b, "Project total wrong (account3 cont 2)");
				bal1 = web3.eth.getBalance(project1).valueOf();
				assert.equal(bal1, amount2a + amount2b + amount3a + amount3b, "Project balance wrong");
			})
			.then(function () {
				console.log("Account2 refund...");
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				console.log("account2 balance before "+bal2);
				console.log("account3 balance before "+bal3);
			  return Project.at(project1).refund({from: account2});
			})
			.then(function (success) {
        var tx = web3.eth.getTransactionReceipt(success);
				var gasUsed = tx.gasUsed*100000000000;
				console.log("account2 gas used="+gasUsed);
				goal2 = add(bal2, String((amount2a + amount2b) - gasUsed));
				goal3 = bal3;
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				bal1 = web3.eth.getBalance(project1).valueOf();
				console.log("account2 balance after "+bal2+" goal="+goal2);
				console.log("account3 balance after "+bal3+" goal="+goal3);
				assert.equal(bal2, goal2, "Refunded amount wrong to account2");
				assert.equal(bal3, goal3, "Refunded amount wrong to account3");
				assert.equal(bal1, amount3a + amount3b, "Project balance wrong (account2 refund A)");
				return Project.at(project1).getInfo.call({from: account2});
      })
			.then(function(values) {
				console.log("After refund: account2="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[4].valueOf(), amount3a + amount3b, "Project total wrong (account2 refund B)");
			})
			.then(function () {
				console.log("Account3 refund...");
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				console.log("account2 balance before "+bal2);
				console.log("account3 balance before "+bal3);
			  return Project.at(project1).refund({from: account3});
			})
			.then(function (success) {
        var tx = web3.eth.getTransactionReceipt(success);
				var gasUsed = tx.gasUsed*100000000000;
				console.log("account3 gas used="+gasUsed);
				goal3 = add(bal3, String((amount3a + amount3b) - gasUsed));
				goal2 = bal2;
				bal2 = web3.eth.getBalance(account2).valueOf();
				bal3 = web3.eth.getBalance(account3).valueOf();
				bal1 = web3.eth.getBalance(project1).valueOf();
				console.log("account2 balance after "+bal2+" goal="+goal2);
				console.log("account3 balance after "+bal3+" goal="+goal3);
				assert.equal(bal2, goal2, "Refunded amount wrong to account2");
				assert.equal(bal3, goal3, "Refunded amount wrong to account3");
				assert.equal(bal1, 0, "Project balance wrong (account3 refund A)");
				return Project.at(project1).getInfo.call({from: account3});
      })
			.then(function(values) {
				console.log("After refund: account3="+values[5].valueOf()+" total="+values[4].valueOf());
				assert.equal(values[4].valueOf(), 0, "Project total wrong (account3 refund B)");
			});
  });


});

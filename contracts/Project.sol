pragma solidity ^0.4.4;

contract Project {
    struct Attribs{
        address owner;
        bytes32 name;
        uint goalAmount;
        uint deadline;
        uint funders;
        uint amountRaised;
    }
    
    Attribs attribs;
    address[] funders;
    mapping (address => uint) amounts;
    
    modifier onlyOwner() { if (tx.origin == attribs.owner) _; else throw;}
    modifier onlyFunder() { if (amounts[tx.origin] > 0) _; else throw;}
    modifier afterDeadline() { if (attribs.deadline <= now) _; else throw;}
    
	function Project(address _owner, bytes32 _name,  uint _goal, uint _deadline) {
		attribs = Attribs(_owner, _name,  _goal, now + _deadline, 0, 0);
	}

	function fund() payable returns(bool) {
	    uint v = msg.value;
	    uint back;
		if (v > 0){
		    if(attribs.deadline > now && attribs.goalAmount > attribs.amountRaised){
		        
		        //when funding amount exeeds goal
                if(attribs.amountRaised + msg.value > attribs.goalAmount){
                    v = attribs.goalAmount - attribs.amountRaised;
                    back = attribs.amountRaised + msg.value - attribs.goalAmount;
    		        if(!tx.origin.send(back))
    		            throw;
                }
                
	            amounts[tx.origin] += v;
		        funders.push(tx.origin);
	    	    attribs.amountRaised += v;
		    }
		    else{
		        if(!tx.origin.send(msg.value))
		            throw;
		    }
		}
        
		return true;
	}

	function payout() onlyOwner() afterDeadline() returns(bool) {
	    if(!attribs.owner.send(this.balance))
	        throw;
	    
		return true;
	}
	
	function refund() onlyFunder() returns(bool) {
	    uint v = amounts[tx.origin];
	    amounts[tx.origin] = 0;
	    
	    if(!tx.origin.send(v))
	        throw;
	    
	    attribs.amountRaised -= v;
		return true;
	}

	function getInfo() returns(bytes32, uint, uint, address, uint, uint) {
		return (attribs.name, this.balance+1, attribs.deadline, attribs.owner, attribs.amountRaised, amounts[tx.origin]);
	}

	function getAmountRaised() returns(uint) {
		return attribs.amountRaised;
	}
}

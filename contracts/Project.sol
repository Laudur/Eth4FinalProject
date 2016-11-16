pragma solidity ^0.4.2;

contract Project {
        
    struct Attribs{
        address owner;
        string name;
        uint goalAmount;
        uint deadline;
        uint funders;
        uint amount;
    }
    
    Attribs attribs;
    
    struct Funder {
        address addr;
        uint amount;
    }
    
    mapping (uint => Funder) funders;

	function Project(address _owner, string _name,  uint _goal, uint _deadline) {
        attribs = Attribs(_owner, _name,  _goal, _deadline, 0, 0);
	}

	function fund(address funder) returns(bool sufficient) {
        if (msg.value>0){
            funders[attribs.funders++] = Funder(funder, msg.value);
	        attribs.amount += msg.value;
		    return true;
        }
	    else{
		    return false;  
		}
	}

	function payout(address addr) returns(bool) {
		return true;
	}
	
	function refund(address addr) returns(bool) {
		return true;
	}
}

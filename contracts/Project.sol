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
    modifier afterDeadline() { if (attribs.deadline <= now) _;}
    modifier raisedLess() { if (attribs.amountRaised < attribs.goalAmount) _;}
    
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
	
    function refund() raisedLess() returns(bool) {
        uint v;
        if(msg.sender==attribs.owner){
            for (uint i = 0; i<funders.length; i++){
                address funder = funders[i];
                v = amounts[funder];
        
                if(v > 0){
                    amounts[funder] = 0;
                    
                    if(funder.send(v))
                        attribs.amountRaised -= v;
                    else
                        amounts[funder] = v;
                    
                }
            }
        }else{
            v = amounts[msg.sender];
            if(v > 0){
                amounts[msg.sender] = 0;
                
                if(!msg.sender.send(v))
                    amounts[msg.sender] = v;
                
                attribs.amountRaised -= v;
            }
        }
        return true;
    }

    function getInfo() returns(bytes32, uint, uint, address, uint, uint) {
        return (attribs.name, attribs.goalAmount, attribs.deadline, attribs.owner, attribs.amountRaised, amounts[msg.sender]);
    }
}

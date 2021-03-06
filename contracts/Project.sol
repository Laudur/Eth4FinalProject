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
    
    modifier goalNotReached() { if (attribs.amountRaised < attribs.goalAmount) _;}
    modifier goalReached() { if (attribs.amountRaised >= attribs.goalAmount) _;}
    
    function Project(address _owner, bytes32 _name,  uint _goal, uint _deadline) {
        attribs = Attribs(_owner, _name,  _goal, now + _deadline, 0, 0);
    }

    function fund(address funder) payable returns(bool) {
        if (msg.value > 0){
            if(now <= attribs.deadline && attribs.goalAmount > attribs.amountRaised){
                amounts[funder] += msg.value;
                funders.push(funder);
                attribs.amountRaised += msg.value;
                
                //when goal reached with this payment then payout
                if(attribs.goalAmount <= attribs.amountRaised)
                    payout();
            }
            else{
                if(!funder.send(msg.value))
                    return false;
                
                //when deadline passed then refund 
                if(now > attribs.deadline)
                    refund();
            }
            
            return true;
        }
    }

    function payout() goalReached() returns(bool) {
        if(attribs.owner.send(this.balance)){
            return true;
        }
        
        return false;
    }
	
    function refund() goalNotReached() returns(bool) {
        uint v;
        //when msg.sender is owner then refund to all funders
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
        //when msg.sender is not owner then refund to msg.sender
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

    function getInfo() constant returns(bytes32, uint, uint, address, uint, uint, address) {
        return (attribs.name, attribs.goalAmount, attribs.deadline, attribs.owner, attribs.amountRaised, amounts[msg.sender], this);
    }
}

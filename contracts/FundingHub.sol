pragma solidity ^0.4.4;

import "Project.sol";

contract FundingHub {
	Project[] projects;

	function FundingHub() {
	}

	function createProject(bytes32 name,  uint goal, uint deadline) returns(uint projectID) {
		Project p = new Project(msg.sender, name,  goal, deadline);
		projects.push(p);
		return projects.length;
	}
	
	function contribute(uint projectID) payable returns(bool) {
	    if (msg.value>0){
	        Project p = projects[projectID];
	        p.fund.value(msg.value)();
	        return true;
	    }
	}

	function getProjectCount(address addr) returns(uint) {
	    return projects.length;
	}
	
	function getProjectInfo(uint projectID) constant returns(uint id, bytes32 name, uint goalAmount, uint deadline, address owner, uint amountRaised, uint myAmount) {
	    Project p = projects[projectID];
	    (name, goalAmount, deadline, owner, amountRaised, myAmount)= p.getInfo();
	    id = projectID;
	    //return (projectID, name, goalAmount, deadline, owner, amountRaised);
	}
}

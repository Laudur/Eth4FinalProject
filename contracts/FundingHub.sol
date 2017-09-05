pragma solidity ^0.4.4;

import "./Project.sol";

contract FundingHub {
	Project[] projects;

	function FundingHub() {
	}

	function createProject(bytes32 name,  uint goal, uint deadline) returns(address project) {
		Project p = new Project(msg.sender, name,  goal, deadline);
		projects.push(p);
		return p;
	}
	
	function contribute(address project) payable returns(bool) {
	    if (msg.value>0){
		Project p = Project(project);
	        p.fund.value(msg.value)(msg.sender);
	        return true;
	    }
	}

	function getProjectCount(address addr) constant returns(uint) {
	    return projects.length;
	}
	
	function getProjectAddr(uint projectID) constant returns(address) {
	    return projects[projectID];
	}
}

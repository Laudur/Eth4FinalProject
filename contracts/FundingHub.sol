pragma solidity ^0.4.2;

import "Project.sol";

contract FundingHub {
	Project[] projects;

	function FundingHub() {
		//createProject(tx.origin, "Test",  0, 0);
	}

	function createProject(address _owner, string _name,  uint _goal, uint _deadline) returns(uint projectID) {
		Project p = new Project(_owner, _name,  _goal, _deadline);
		projects[projects.length] = p;
		return projects.length;
	}
	
	function contribute(uint _projectID) returns(bool) {
	    if (msg.value>0){
	        projects[_projectID].fund(msg.sender);
		    return true;
	    }
		else{
		    return false;
		}
	}

	function getProjectCount(address addr) returns(uint) {
	    return projects.length;
	}
}

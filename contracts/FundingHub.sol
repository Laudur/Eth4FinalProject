pragma solidity ^0.4.2;

import "Project.sol";

contract FundingHub {
	Project[] projects;

	function FundingHub() {
		//createProject(tx.origin, "Test",  0, 0);
	}

	function createProject(bytes32 _name,  uint _goal, uint _deadline) returns(uint projectID) {
		Project p = new Project(msg.sender, _name,  _goal, _deadline);
		projects.push(p);
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
	
	function getProject(uint projectID) returns(Project) {
	    return projects[projectID];
	}
	
	function getProjectName(uint projectID) constant returns(bytes32) {
	    bytes32 n = projects[projectID].getName();
	    return n;
	}
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./ProxyWarehouse.sol";
import "@acala-network/contracts/schedule/ISchedule.sol";

/*
 * Time delaying multi-sig admin, in other word a council :p
 * Administrates an upgradable contract through the concensus
 * of a group of addresses
 */
contract Admin{
    
    ProxyWarehouse public proxy;

    address[] public signers;
    mapping (address => bool) public voted;
    mapping (address => bool) public isSigner;
    uint256 public threshold;
	ISchedule scheduler = ISchedule(0x0000000000000000000000000000000000000803);
    
    address public upgrade;
    bool private upgradeQueded;
    uint256 public approvals;
    uint256 public rejects;
    
    event upgradeProposed(address who, address _upgrade);
    event upgradeApproved(address _upgrade);
	event proposalRejected(address _upgrade);
	event signerVoted(address _signer);
    
    /*
     * Creates a new Time delaying multi-sig admin with a group of signers and a threshold on 
     * the number of approved votes from the signers to approve an upgrade of the underlying contract
     */
    constructor(address[] memory _signers, uint256 _threshold, address payable _proxy) public {
		require(_threshold > 0, "The threshold needs to be greater than zero");
        require(_signers.length >= _threshold, "The threshold can't be greater that the number of signers");
        for(uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "The address zero can't be a signer");
            require(!isSigner[signer], "The signers need to be unique");
            
            isSigner[signer] = true;
            signers.push(signer);
        }
        threshold = _threshold;
        proxy = ProxyWarehouse(_proxy);
        upgradeQueded = false;
        approvals = 0;
        rejects = 0;
    }
	
	/*
     * Allows a signer to propose a new upgrade for the underlying contract.
     * Only one upgrade can be propose at any given Time
     */
    function makeProposal(address propose) public {
        require(isSigner[msg.sender], "You don't have permission to propose an upgrade");
        require(!upgradeQueded, "There's an upgrade waiting to be approved");
        upgradeQueded = true;
        upgrade = propose;
        voted[msg.sender] = true;
        approvals = 1;
        emit upgradeProposed(msg.sender, propose);
    }
	
	/*
     * Allows a signer to aprove an upgrade if there is an upgrade waiting to be approved
     * If the approvals equal the threshold we schedule an upgrade with a minimum delay of
     * three blocks from the current block
     */
    function approveUpgrade() public {
        processVote();
        approvals++;
        if(approvals >= threshold) {
            emit upgradeApproved(upgrade);
			scheduler.scheduleCall(address(this), 0, 100000, 100, 4, abi.encodeWithSignature("upgradeContract(address)", upgrade));
            restarVoting();
        }
    }
    
	/*
     * Allows a signer to reject an upgrade if there is an upgrade waiting to be approved
     * If the amount of rejects equals the number signers minus the  threshold we cancel upgrade 
     * and restart the voting for a new propose
     */
    function rejectUpgrade() public {
        processVote();
        rejects++;
        if(rejects >= (signers.length - threshold)) {
            emit proposalRejected(upgrade);
            restarVoting();
        }
    }
	
	/*
	 * Chekcs a signer can vote and marks his vote
	 */
	function processVote() private {
	    require(isSigner[msg.sender], "You don't have permission to vote");
        require(upgradeQueded, "There isn't an upgrade waiting to be approved");
        require(!voted[msg.sender], "You already voted");
        voted[msg.sender] = true;
        emit signerVoted(msg.sender);
	}
	
	/*
     * Cleans all the relevant values for new upgrade proposal
     */
    function restarVoting() private {
        approvals = 0;
        rejects = 0;
        upgradeQueded = false;
        for(uint256 i = 0; i < signers.length; i++) {
                voted[signers[i]] = false;
        }
    }
	
     /*
     * Upgrades the contract to a new implementation once the upgrade has been approved
     */
    function upgradeContract(address _implementation) public {
        require(msg.sender == address(this), "oNLY HTE CONTA");
        proxy.changeImplementation(_implementation);
    }
   
	
}
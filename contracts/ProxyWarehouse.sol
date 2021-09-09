// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/StorageSlot.sol";

/*
 * Simple implementation of a Proxy for an upgradable contract using the Transparent Proxy pattern 
 * We try to use the methods describe in openzeppelin to avoid the problems of Storage Collisions
 * and Function Clashes
 */
contract ProxyWarehouse is Proxy {
    
   /*
     * Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    
    
    /*
     * Storage slot with the admin of the contract.
     * This is the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 internal constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;
    
    
    /*
     * Initiates a new proxy with a new admin and an implementation behind this proxy
     * @council The address of the admin
     * @logic The address of the implementation
     */
    constructor(address logic, address council) {
        setImplementation(logic);
        setAdmin(council);
    }
    
    
    /*
     * Returns the address of the current implementation
     */
    function getImplementation() public view returns(address) {
        return _implementation();
    }
    
    /*
     * Retrives the address of the current implementation
     */
    function _implementation() internal view override returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }
    
    
    /*
     * Changes the current implementation address for the address of the new implementation
     * This action can only be perfom by the contract administrator
     */
    function changeImplementation(address newImplementation) public {
        require(msg.sender == getAdmin(), "You are not the admin");
        setImplementation(newImplementation);
    }
    
    /*
     * Internal function that changes the implementation address for a new implementation address
     */
    function setImplementation(address newImplementation) internal {
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
    }
    
    /*
     * Returns the address of the current admin
     */
    function getAdmin() public view returns(address) {
        return _admin();
    }
    
    /*
     * Retrives the address of the current admin
     */
    function _admin() internal view returns (address) {
        return StorageSlot.getAddressSlot(_ADMIN_SLOT).value;
    }
    
    /*
     * Replaces de current admin address with a new address corresponding to the new 
     * admin
     * Only the current admin can execute this function
     */
    function changeAdmin(address newAdmin) public{
        require(msg.sender == getAdmin(), "You are not the admin");
        setAdmin(newAdmin);
    }
    
    
    /*
     * Internal function the replaces the current admin address with a new address
     */
    function setAdmin(address newAdmin) internal {
        require(newAdmin != address(0), "Admin can't be zero address");
        StorageSlot.getAddressSlot(_ADMIN_SLOT).value = newAdmin;
    }
    
    
    /*
     * Verifies that the current admin can not execute the fallback function to the underlygin contract
     * behind this proxy
     */
    function _beforeFallback() internal override {
        require(msg.sender != getAdmin(), "The admin cannot call functions from the implementation");
        super._beforeFallback();
    }

  
}
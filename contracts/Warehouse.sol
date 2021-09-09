// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

/*
 * Simple implementation of a  an upgradable contract using the Transparent Proxy pattern 
 * We try to use the methods describe in openzeppelin to avoid the problems of Storage Collisions
 * and Function Clashes
 * We use an initilizer instead of a constructor to avoid memory problems between the implementation and the 
 * proxy
 */
contract Warehouse {
    
    uint256 public number;
    bool public isInitialize;
    
    
    /*
     * Initializes all the values of the contract, similar to a constructor
     * We use a flag so the initializer can only be called once
     */
    function initialize(uint256 num) public {
        require(!isInitialize, "The contract has been initialized");
        isInitialize = true;
        number = num;
    }
    
    
    /*
     * Modifies the numerical value stored by the contract
     */
    function setNumber(uint256 num) public {
        number = num;
    }
}

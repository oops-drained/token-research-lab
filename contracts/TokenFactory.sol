// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ResearchToken.sol";

/// @title TokenFactory
/// @notice Deploys ResearchToken instances for security research on testnets.
contract TokenFactory {
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint8 decimals
    );

    address[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    function createToken(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_
    ) external returns (address token) {
        ResearchToken t = new ResearchToken(name_, symbol_, decimals_, msg.sender);
        token = address(t);
        allTokens.push(token);
        tokensByCreator[msg.sender].push(token);
        emit TokenCreated(token, msg.sender, name_, symbol_, decimals_);
    }

    function tokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    function creatorTokenCount(address creator) external view returns (uint256) {
        return tokensByCreator[creator].length;
    }
}

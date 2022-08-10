// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Using the openzepplin contract standard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token contract
contract MockDAI is ERC20, Ownable {
    constructor() ERC20("MockDAI", "DAI") {
        _mint(msg.sender, 500 * 10**decimals());
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return 1000 * 10**decimals();
    }
}

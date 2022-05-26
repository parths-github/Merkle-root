// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist {
    bytes32 public merkleroot;

    constructor (bytes32 _merkleroot) {
        merkleroot = _merkleroot;
    }


    /**
     * @dev returns bool
     * @param proof bytes32 array of all necessary nodes(hashes) for rebuilding merkleroot
     * @param maxAllowance number of nft allowed to mint to msg.sender
     */
    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowance) view public returns (bool) {
        // While verifying that whether the data is in merkle tree or not, we have to provide proof, merkleroot and data(leaf) that we want to verify with
        // Proof will be array of all the neccessary node to rebuild the merkelTree
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowance));
        bool verified = MerkleProof.verify(proof, merkleroot, leaf);
        return verified;
    }
}
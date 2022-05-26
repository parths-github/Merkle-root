const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address, spots) {
    // Same as "abi.encodePacked" in solidity
    return ethers.utils.defaultAbiCoder.encode(
        ["address", "uint64"],
        [address, spots]
    );
}

describe("Check if merkle root is working", function() {
    it("Should be able to verify if a given address is in whitelist or not", async function () {
        // Get some test address
        const [owner, add1, add2, add3, add4, add5] = await ethers.getSigners();

        // Create an array of data that we ant to include in merkle tree
        const list = [
            encodeLeaf(owner.address, 2),
            encodeLeaf(add1.address, 2),
            encodeLeaf(add2.address, 2),
            encodeLeaf(add3.address, 2),
            encodeLeaf(add4.address, 2),
            encodeLeaf(add5.address, 2)
            ];

        // Create the Merkle Tree using the hashing algorithm `keccak256`
        // Make sure to sort the tree so that it can be produced deterministically regardless
        // of the order of the input list
        const merkleTree = new MerkleTree(list, keccak256, {
            // If the list you provided is data not hash, then hashleaves: true
            hashLeaves: true,
            sortPairs: true,
        });

        // Compute the merkle root
        const root = merkleTree.getHexRoot();

        // Deploy the whitelist contract
        const whitelist = await ethers.getContractFactory("Whitelist");
        const Whitelist = await whitelist.deploy(root);
        await Whitelist.deployed();

        // compute the merkle proof of owner with 2 spots
        const leaf = keccak256(list[0]);
        const proof = merkleTree.getHexProof(leaf);

        let verified = await Whitelist.checkInWhitelist(proof, 2);
        expect(verified).to.equal(true);

        // Provide an invalid Merkle Proof to the contract, and ensure that
        // it can verify that this leaf node was NOT part of the Merkle Tree
        verified = await Whitelist.checkInWhitelist([], 2);
        expect(verified).to.equal(false);

    })
})
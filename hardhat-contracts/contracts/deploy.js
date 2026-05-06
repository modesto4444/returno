import { createRequire } from "module";
import { readFileSync } from "fs";
import { ethers } from "ethers";

const require = createRequire(import.meta.url);

// Read the compiled contract
const artifact = JSON.parse(
    readFileSync(
        new URL("../artifacts/contracts/Returno.sol/Returno.json", import.meta.url)
    )
);

async function main() {
    console.log("Deploying Returno...");

    // Connect to local hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Use first account from hardhat node
    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner(0);
    
    console.log("Deploying from:", signer.address);

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Returno deployed to:", address);
    console.log("📋 Copy this address into server.js");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
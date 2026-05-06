import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const artifact = JSON.parse(
    readFileSync(
        new URL("../artifacts/contracts/Returno.sol/Returno.json", import.meta.url)
    )
);

async function main() {
    console.log("Deploying Returno...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("Returno deployed to:", address);

    // Auto-save address to a config file
    const config = { CONTRACT_ADDRESS: address };
    const configPath = join(__dirname, '../../returno-backend/contract-config.json');
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Address saved to contract-config.json automatically");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
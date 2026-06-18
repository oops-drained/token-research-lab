import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying TokenFactory...");
  console.log("Network:", network.name, `(chainId ${network.chainId})`);
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("TokenFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("TokenFactory deployed to:", address);

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const file = path.join(deploymentsDir, `${network.chainId}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        chainId: Number(network.chainId),
        factory: address,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
      },
      null,
      2
    )
  );

  console.log("Saved deployment to", file);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

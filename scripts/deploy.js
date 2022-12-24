const hre = require("hardhat");

async function main() {
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    const mynft = await MyNFT.deploy();

    await mynft.deployed();

    console.log("MyNFT deployed to:", mynft.address);
    storeContractData(mynft)
}

function storeContractData(contract) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../src/contracts";
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      contractsDir + "/MyNFT-address.json",
      JSON.stringify({ MyNFT: contract.address }, undefined, 2)
    );
  
    const MyNFTArtifact = artifacts.readArtifactSync("MyNFT");
  
    fs.writeFileSync(
      contractsDir + "/MyNFT.json",
      JSON.stringify(MyNFTArtifact, null, 2)
    );
  }


main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
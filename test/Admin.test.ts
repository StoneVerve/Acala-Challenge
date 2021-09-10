import { expect, use } from "chai";
import { Contract, ethers } from "ethers";
import { deployContract, solidity } from "ethereum-waffle";
import { evmChai } from "@acala-network/bodhi/evmChai";
import Warehouse from "../build/Warehouse.json";
import ProxyWarehouse from "../build/ProxyWarehouse.json";
import Admin from "../build/Admin.json";
import { TestAccountSigningKey, TestProvider, Signer } from "@acala-network/bodhi";
import { WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";

use(solidity);
use(evmChai);

const provider = new TestProvider({
  provider: new WsProvider("ws://127.0.0.1:9944"),
});

/* Declaration of the variables with addresses */
let firstMember;
let secondMember;
let thirdMember;
let deployerAddress;


/*
 * Auxilary function to generate blocks
 */
const testPairs = createTestPairs();

const next_block = async (block_number: number) => {
  return new Promise((resolve) => {
    provider.api.tx.system.remark(block_number.toString(16)).signAndSend(testPairs.alice.address, (result) => {
      if (result.status.isInBlock) {
        resolve(undefined);
      }
    });
  });
}

/*
 * Testing the functionality of the admin contract
 */
describe("Admin", () => {
  let deployer: Signer;
  let firstSigner: Signer;
  let secondSigner: Signer;
  let thirdSigner: Signer;
  let warehouse: Contract;
  let proxy: Contract;
  let admin: Contract;
  let newWarehouse: Contract;
  let adminSigner1: Contract;
  let adminSigner2: Contract;
  let adminSigner3: Contract;
  
  /*
   * Befere we initialize our testing we deploy the contracts
   * and generate a wallet to sign transactions
   */   
  before(async () => {
    [deployer, firstSigner, secondSigner, thirdSigner] = await provider.getWallets();
	deployerAddress = await deployer.getAddress();
	firstMember = await firstSigner.getAddress();
	secondMember = await secondSigner.getAddress();
	thirdMember = await thirdSigner.getAddress();
	warehouse = await deployContract(deployer, Warehouse, []);
	newWarehouse = await deployContract(firstSigner, Warehouse, []);
	proxy = await deployContract(deployer, ProxyWarehouse, [warehouse.address, deployerAddress]);
	admin = await deployContract(deployer, Admin, [[firstMember, secondMember, thirdMember], 3, proxy.address]);
	adminSigner1 = admin.connect(firstSigner);
	adminSigner2 = admin.connect(secondSigner);
	adminSigner3 = admin.connect(thirdSigner);
	await proxy.changeAdmin(admin.address); 
  });
  
  /*
   * After the testing is done we disconnect from
   * the test net 
   */
  after(async () => {
    provider.api.disconnect();
  });
  
  
 
  it("Can't approve an upgrade if there isn't an upgrade waiting to be approved", async () => {
    await expect(adminSigner1.approveUpgrade()).to.
	             be.revertedWith("There isn't an upgrade waiting to be approved");
  });
  
  it("If you are not a listed signer you can't approve or reject an upgrade", async () => {
    await expect(admin.approveUpgrade()).to.be.revertedWith
				 ("You don't have permission to vote");
  });
  
  it("If you are not a listed signer you can't propose an upgrade", async () => {
    await expect(admin.makeProposal(newWarehouse.address)).to.
	             be.revertedWith("You don't have permission to propose an upgrade");
  });
  
  it("A valid signer can propose an upgrade", async () => {
    await expect(adminSigner1.makeProposal(newWarehouse.address))
                 .to.emit(admin, 'upgradeProposed')
                 .withArgs(firstMember, newWarehouse.address);
  });
  
  it("If an upgrade is waiting to be approved you can't propose another upgrade", async () => {
    await expect(adminSigner1.makeProposal(newWarehouse.address)).to.
	             be.revertedWith("There's an upgrade waiting to be approved");
  });
  
  it("Can't approve an upgrade if you already voted", async () => {
    await expect(adminSigner1.approveUpgrade()).to.
	             be.revertedWith("You already voted");
  });
  
  it("A valid signer can approve an upgrade", async () => {
    await expect(adminSigner2.approveUpgrade()).to.emit(admin, 'signerVoted')
                 .withArgs(secondMember);
  });
  
   
  it("The upgrade should be schedule a be completed successfully", async () => {
    const inital_block_number = Number(await provider.api.query.system.number());
	await adminSigner3.approveUpgrade();
	let current_block_number = Number(await provider.api.query.system.number());
    while (current_block_number < (inital_block_number + 10)) {
      await next_block(current_block_number);
      current_block_number = Number(await provider.api.query.system.number());
    }
	expect(await proxy.getImplementation()).to.equal(newWarehouse.address); 
  });

  it("Should be able to propose a new upgrade after the completion of the previous upgrade", async () => {
     await expect(adminSigner1.makeProposal(warehouse.address))
                 .to.emit(admin, 'upgradeProposed')
                 .withArgs(firstMember, warehouse.address);
  });
   
  it("A valid signer can propose an upgrade", async () => {
    await expect(adminSigner2.rejectUpgrade())
                 .to.emit(admin, 'proposalRejected')
                 .withArgs(warehouse.address);
  });
  
  it("Should be able to propose a new upgrade after the rejection of the previous upgrade", async () => {
     await expect(adminSigner1.makeProposal(warehouse.address))
                 .to.emit(admin, 'upgradeProposed')
                 .withArgs(firstMember, warehouse.address);
	 expect(await proxy.getImplementation()).to.equal(newWarehouse.address);
  });
  
});

 
 
 
 
 
 
 
 
 
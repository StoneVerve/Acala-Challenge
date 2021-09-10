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

let firstMember;
let secondMember;
let thirdMember;
let fourthMember;


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


describe("Admin", () => {
  let firstSigner: Signer;
  let secondSigner: Signer;
  let thirdSigner: Signer;
  let fourthSigner: Signer;
  let fifthSigner: Signer;
  let warehouse: Contract;
  let proxy: Contract;
  let admin: Contract;
  let newWarehouse: Contract;
  let adminSigner1: Contract;
  let adminSigner2: Contract;
  let adminSigner3: Contract;
  

  before(async () => {
    [firstSigner, secondSigner, thirdSigner, fourthSigner] = await provider.getWallets();
	firstMember = await firstSigner.getAddress();
	secondMember = await secondSigner.getAddress();
	thirdMember = await thirdSigner.getAddress();
	fourthMember = await fourthSigner.getAddress();
	warehouse = await deployContract(firstSigner, Warehouse, []);
	newWarehouse = await deployContract(secondSigner, Warehouse, []);
	proxy = await deployContract(firstSigner, ProxyWarehouse, [warehouse.address, firstMember]);
	admin = await deployContract(firstSigner, Admin, [[secondMember, thirdMember, fourthMember], 3, proxy.address], { value: 10_000, gasLimit: 2_000_000 });
	adminSigner1 = admin.connect(secondSigner);
	adminSigner2 = admin.connect(thirdSigner);
	adminSigner3 = admin.connect(fourthSigner);
	await proxy.changeAdmin(admin.address); 
  });

  after(async () => {
    provider.api.disconnect();
  });
  
  
  it("Verify implementation address", async () => {
    expect(await proxy.getImplementation()).to.equal(warehouse.address);
  });
  
 /*
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
  });*/
  
  
  
  it("A valid signer can propose an upgrade", async () => {
    await expect(adminSigner1.makeProposal(newWarehouse.address))
                 .to.emit(admin, 'upgradeProposed')
                 .withArgs(secondMember, newWarehouse.address);
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
    await expect(adminSigner2.approveUpgrade()).to.emit(admin, 'signerApproved')
                 .withArgs(thirdMember);
  });
  
   
   it("The upgrade should be schedule a be completed successfully", async () => {
    const inital_block_number = Number(await provider.api.query.system.number());
	//await admin.test(newWarehouse.address, { value: 10_000, gasLimit: 2_000_000 });
	await adminSigner3.approveUpgrade( { value: 20_000, gasLimit: 2_000_000 });
	let current_block_number = Number(await provider.api.query.system.number());
    while (current_block_number < (inital_block_number + 10)) {
      await next_block(current_block_number);
      current_block_number = Number(await provider.api.query.system.number());
    }
	expect(await proxy.getImplementation()).to.equal(newWarehouse.address); 
  }); 
  
});

 
 
 
 
 
 
 
 
 
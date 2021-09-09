import { expect, use } from "chai";
import { Contract} from "ethers";
import { deployContract, solidity } from "ethereum-waffle";
import { evmChai } from "@acala-network/bodhi/evmChai";
import Warehouse from "../build/Warehouse.json";
import ProxyWarehouse from "../build/ProxyWarehouse.json";
import Admin from "../build/Admin.json";
import { TestAccountSigningKey, TestProvider, Signer } from "@acala-network/bodhi";
import { WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";

use(solidity)
use(evmChai);

const provider = new TestProvider({
  provider: new WsProvider("ws://127.0.0.1:9944"),
});

describe("Warehouse", () => {
  let wallet: Signer;
  let warehouse: Contract;
  

  before(async () => {
    [wallet] = await provider.getWallets();
	const deployerAddress =  await wallet.getAddress();
    warehouse = await deployContract(wallet, Warehouse, []);
  });

  after(async () => {
    provider.api.disconnect();
  });
	
  it("Assigns initial value", async () => {
    await warehouse.initialize(8);
	expect(await warehouse.number()).to.equal(8);
  });
  
  it("Can not call the initializer a second time", async () => {
    await expect(warehouse.initialize(11)).to.be.revertedWith("The contract has been initialized");
  });
  
  it("Verify value", async () => {
    expect(await warehouse.number()).to.equal(8);
  });
  
  it("Set a new value", async () => {
    await warehouse.setNumber(10);
	expect(await warehouse.number()).to.equal(10);
  });
  
  
});

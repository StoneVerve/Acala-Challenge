 import { expect, use } from "chai";
import { Contract } from "ethers";
import { deployContract, solidity } from "ethereum-waffle";
import { evmChai } from "@acala-network/bodhi/evmChai";
import Warehouse from "../build/Warehouse.json";
import ProxyWarehouse from "../build/ProxyWarehouse.json";
import { TestAccountSigningKey, TestProvider, Signer } from "@acala-network/bodhi";
import { WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";

use(solidity)
use(evmChai);

const provider = new TestProvider({
  provider: new WsProvider("ws://127.0.0.1:9944"),
});

describe("Proxy", () => {
  let wallet: Signer;
  let walletTo: Signer;
  let warehouse: Contract;
  let newWarehouse: Contract;
  let proxy: Contract;
  let proxyA: Contract;
  let proxyFactory: ContractFactory;
  

  before(async () => {
    [wallet, walletTo] = await provider.getWallets();
	const deployerAddress =  await wallet.getAddress();
    warehouse = await deployContract(wallet, Warehouse, []);
	newWarehouse = await deployContract(walletTo, Warehouse, []);
	proxy = await deployContract(wallet, ProxyWarehouse, [warehouse.address, deployerAddress]);
	proxyA = await proxy.connect(walletTo);
	await proxyA.deployTransaction.wait();	
  });

  after(async () => {
    provider.api.disconnect();
  });
	
  it("Verify implementation address", async () => {
    expect(await proxy.getImplementation()).to.equal(warehouse.address);
  });
  
    it("Verify admin address", async () => {
    expect(await proxy.getAdmin()).to.equal(await wallet.getAddress());
  });
  
  it("Can't call the function without admin permission", async () => {
    await expect(proxyA.changeAdmin(await walletTo.getAddress())).to.be.revertedWith("You are not the admin");
  });
  
  it("We change the admin with the current admin", async () => {
    await proxy.changeAdmin(await walletTo.getAddress());
	await expect(await proxy.getAdmin()).to.equal(await walletTo.getAddress());
  });
  
  it("We can't change the implementation if we are not the admin", async () => {
    await expect(proxy.changeImplementation(newWarehouse.address)).to.be.revertedWith("You are not the admin");
  });
  
  it("The admin can change the implementation", async () => {
    await proxyA.changeImplementation(newWarehouse.address);
	await expect(await proxy.getImplementation()).to.equal(newWarehouse.address);
  });
  
  
});

 
 
 
 
 
 
 
 
 
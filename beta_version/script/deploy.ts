import { Contract, ContractFactory } from "ethers";
import { TestAccountSigningKey, Provider, Signer, TestProvider } from "@acala-network/bodhi";
import Warehouse from "../build/Warehouse.json";
import ProxyWarehouse from "../build/ProxyWarehouse.json";
import Admin from "../build/Admin.json";
import setup from "./setup";
import ADDRESS from "@acala-network/contracts/utils/Address";


const main = async () => {
    const { wallet, provider } = await setup();
    const deployerAddress = await wallet.getAddress();
	//const bobAddress = await bob.getAddress();
	//const charlieAddress = await bob.getAddress();
	//const daveAddress = await bob.getAddress();
	
    // deploy factory
    const warehouse = await ContractFactory.fromSolidity(Warehouse).connect(wallet).deploy()
	
	// deploy factory
    const proxy = await ContractFactory.fromSolidity(ProxyWarehouse).connect(wallet).deploy(warehouse.address, deployerAddress)
	
	// deploy factory
    const admin = await ContractFactory.fromSolidity(Admin).connect(wallet).deploy([deployerAddress], 1, proxy.address)

    console.log('Deploy done')
    console.log({
        warehouse: warehouse.address,
        proxy: proxy.address,
		admin: admin.address,
    })
	
    // We call initializer
    
    // We Switch de Admin of Proxy to our contract Admin
    await proxy.changeAdmin(admin.address)
	
    // We check values are deployed correctly
    const adminOfProxy = await proxy.getAdmin();
    //const contractAdministrated = await admin
    const contractLogic = await proxy.getImplementation();
    
    console.log({
        Address_admin_of_proxy: adminOfProxy,
        Address_Contract_Logic: contractLogic,
    })

    provider.api.disconnect();
}

main()

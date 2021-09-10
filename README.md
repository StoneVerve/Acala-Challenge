# Acala-Challenge
Acala's scheduller challenge

Implementation of a time delaying multi-sig admin contract using the schedular feature of Acala EVM
The multi-signature contract administrates an upgradable contract. The upgradable contract is implemented using the Transparent Proxy approach.

## Dependecies

All the requiered dependecies are listed in the packege.json file. I strongly recommed to usea the exact dependencies versions listed in the packege.json file, since there are 
compatibilty issues in subsequent versions

# Acala Evm

In order to run all the test and deploy our contracts we need to run a development Acala Mandala chain
For this project we used docker to run a development Acala Mandala chain

It's recommended to use the docker image with tag 8b66f260 using the following command

```
docker run --rm -p 9944:9944 acala/mandala-node:8b66f260 --dev --ws-external --rpc-methods=unsafe --instant-sealing  -levm=trace

```

## Instalation and Use
We used `yarn` to manage and install all the packages. To install all the packages type `yarn install`

The current commands supported are:

- In order to comiple our smar contracts type `yarn build` in your terminal
- In order to run all the tests type `yarn test` in your terminal
- In order to deploy the contracts to a local testnet type `yarn deploy` in your terminal





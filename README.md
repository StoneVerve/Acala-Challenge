# Acala-Challenge
Acala's scheduler challenge

Implementation of a time delaying multi-sig admin contract using the scheduler feature of Acala EVM

The multi-signature contract administrates an upgradeable contract. The upgradeable contract is implemented using the Transparent Proxy approach.

## Dependecies

All the requiered dependecies are listed in the **packege.json** file. I strongly recommed to use the exact dependencies versions listed in the **packege.json** file, since there are compatibilty issues in subsequent versions

All the tests and the deployment of the contracts was done usign `ether.js` and `waffle`.

### Small detail
This project was developed using Windows 10, if your using a linux distribution you need the change the key word `set` for `export` in the line

```
"test": "set NODE_ENV=test && mocha -r ts-node/register/transpile-only --timeout 50000 --no-warnings test/**/*.test.{js,ts}",

```

Located in the file **packege.json**

# Acala Evm

In order to run all the tests and deploy our contracts we need to run a development Acala Mandala chain
For this project we used docker to run a development Acala Mandala chain

It's recommended to use the docker image with tag *8b66f260* by typing the following command

```
docker run --rm -p 9944:9944 acala/mandala-node:8b66f260 --dev --ws-external --rpc-methods=unsafe --instant-sealing  -levm=trace

```

## Instalation and Use
We used `yarn` to manage and install all the packages. To install all the packages type `yarn install`

The current supported commands are:

- In order to comiple our smar contracts, type `yarn build` in your terminal
- In order to run all the tests, type `yarn test` in your terminal
- In order to deploy the contracts to a local testnet, type `yarn deploy` in your terminal




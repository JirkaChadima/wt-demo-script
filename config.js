// 1. Load the libs
const { WtJsLibs } = require('@windingtree/wt-js-libs');
const SwarmAdapter = require('@windingtree/off-chain-adapter-swarm');
const HttpAdapter = require('@windingtree/off-chain-adapter-http');

// 2. Configure the wt-js-libs
module.exports = WtJsLibs.createInstance({
  onChainDataOptions: {
    // We are using Ropsten as testnet, our demo index is on 0x407f550023eb6ad8a4797844489e17c5ced17e06
    provider: 'https://ropsten.infura.io/',
  },
  offChainDataOptions: {
    adapters: {
      // WT is using bzz-raw protocol to access data on swarm
      'bzz-raw': {
        options: {
          swarmProviderUrl: 'https://swarm-gateways.net/',
          timeout: 1000,
        },
        create: (options) => {
          return new SwarmAdapter(options);
        },
      },
      // WT is not using http at the moment, we only resolve https
      https: {
        create: () => {
          return new HttpAdapter();
        },
      },
    },
  },
});

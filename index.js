const WTLibs = require('@windingtree/wt-js-libs');
const SwarmAdapter = require('@windingtree/off-chain-adapter-swarm');
const HttpAdapter = require('@windingtree/off-chain-adapter-http');

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'https://ropsten.infura.io/',
  },
  offChainDataOptions: {
    adapters: {
      'bzz-raw': {
        options: {
          swarmProviderUrl: 'https://swarm-gateways.net/',
        },
        create: (options) => {
          return new SwarmAdapter(options);
        },
      },
      https: {
        create: () => {
          return new HttpAdapter();
        },
      },
    },
  },
});

(async () => {
  const index = await libs.getWTIndex('0x407f550023eb6ad8a4797844489e17c5ced17e06');
  const hotels = await index.getAllHotels();
  console.log('Checking an actual Winding Tree Index on Ropsten - 0x407f550023eb6ad8a4797844489e17c5ced17e06')
  
  console.log('='.repeat(80));
  console.log('Checking out hotel with data on HTTPS')
  console.log('hotel address: ' + await hotels[0].address);
  const hotel1dataIndex = (await hotels[0].dataIndex);
  console.log('off-chain data location: ' + await hotel1dataIndex.ref);
  const hotel1descriptionData = await hotel1dataIndex.contents.descriptionUri;
  console.log('off-chain description data location: ' + await hotel1descriptionData.ref);
  console.log('off-chain stored hotel name: ' + await hotel1descriptionData.contents.name);
  console.log('-'.repeat(80));

  console.log('Checking out hotel with data on Swarm')
  console.log('hotel address: ' + await hotels[1].address);
  const hotel2dataIndex = (await hotels[1].dataIndex);
  console.log('off-chain data location: ' + await hotel2dataIndex.ref);
  const hotel2descriptionData = await hotel2dataIndex.contents.descriptionUri;
  console.log('off-chain description data location: ' + await hotel2descriptionData.ref);
  console.log('off-chain stored hotel name: ' + await hotel2descriptionData.contents.name);
})();

const web3utils = require('web3-utils');
const libs = require('./config');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!! NEVER USE THIS WALLET !!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const WALLET_FILE = {"version":3,"id":"7fe84016-4686-4622-97c9-dc7b47f5f5c6","address":"d037ab9025d43f60a31b32a82e10936f07484246","crypto":{"ciphertext":"ef9dcce915eeb0c4f7aa2bb16b9ae6ce5a4444b4ed8be45d94e6b7fe7f4f9b47","cipherparams":{"iv":"31b12ef1d308ea1edacc4ab00de80d55"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d06ccd5d9c5d75e1a66a81d2076628f5716a3161ca204d92d04a42c057562541","n":8192,"r":8,"p":1},"mac":"2c30bc373c19c5b41385b85ffde14b9ea9f0f609c7812a10fdcb0a565034d9db"}};
const PASSWORD = 'windingtree';
// This is for demo purposes only, it's the same
// wallet used in https://github.com/windingtree/wt-demo-app
// Never use this wallet for any production data,
// everyone would have access to it.
// However, this Wallet has some Ether on Ropsten,
// so this example should work.

// 3. Get your off-chain data ready
// This is not provided by wt-js-libs out of the box
const offChainDataUri = 'https://gist.githubusercontent.com/JirkaChadima/9c86f9ed1cfd157f71a172ee9379f35f/raw/0287be953438ba04a9fb98b625589b2b28c64b8b/legal-entity-hotel-api.json';
const offChainDataHash = '0xea937104edca4af1f37e47808a5667173e83cc6033e0cf6e6a3c9f7c102b8beb';

// 4. Register your hotel to Winding Tree platform
(async () => {
  // Get an instance of WTIndex wrapper
  const entrypoint = await libs.getEntrypoint('0xa268937c2573e2AB274BF6d96e88FfE0827F0D4D');
  const directory = await entrypoint.getSegmentDirectory('hotels');
  const factory = await entrypoint.getOrganizationFactory();

  // Create a Wallet abstraction and unlock it.
  const wallet = await libs.createWallet(WALLET_FILE);
  wallet.unlock(PASSWORD);

  try {
    // Register the hotel itself
    // a. Get ready transaction data
    // You can also do this in two transactions - create on the Factory and add on the directory
    const { organization, transactionData, eventCallbacks } = await factory.createAndAddOrganization({
      owner: wallet.getAddress(),
      orgJsonUri: offChainDataUri,
      orgJsonHash: offChainDataHash,
    }, directory.address);
    // b. Sign and send the transaction. You probably don't have to use our wallet abstraction.
    // This signs a transaction and waits for it to be mined. You can get finer control
    // of this by using your own eventCallbacks, not waiting for the promise to be resolved etc.
    const receipt = await wallet.signAndSendTransaction(transactionData, eventCallbacks);
    // After the transaction is mined, one of the eventCallbacks
    // sets the address of the freshly created hotel.
    const newOrganization = await organization;
    const newHotelAddress = newOrganization.address;
    console.log('hotel ORG.ID address: ', newHotelAddress);

    // To add a guarantor to a hotel, we need to create a guarantee.
    // Normally it would have been a trusted third-party Ethereum address,
    // here we use the same address as is the hotel owner.
    // Guarantee is used by the platform users to determine the trust level
    // of a hotel.
    // You can use the tool on http://guarantee-generator.windingtree.com
    // to create and sign the guarantee.
    const monthFromNow = new Date();
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    
    // Claim has to contain both hotel and guarantor address and has to expire
    const claim = web3utils.utf8ToHex(JSON.stringify({
      "subject": newHotelAddress,
      "guarantor": wallet.getAddress(),
      "expiresAt": monthFromNow.getTime() / 1000,
    }));
    const signature = await wallet.signData(claim);
    // After generating a guarantee, it has to be published alongside hotel data
    // on offChainDataUri.
    console.log('Guarantee would look like:');
    console.log({
      claim,
      signature
    });
  } finally {
    // Don't forget to lock your wallet after you are done, you
    // don't want to leave your private keys lying around.
    wallet.lock();
  }
})();

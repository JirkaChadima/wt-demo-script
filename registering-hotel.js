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
const offChainDataUri = 'https://jirkachadima.cz/wt/hotel-data-index.json';

// 4. Register your hotel to Winding Tree platform
(async () => {
  // Get an instance of WTIndex wrapper
  const index = await libs.getWTIndex('hotels', '0xB309875d8b24D522Ea0Ac57903c8A0b0C93C414A');

  // Create a Wallet abstraction and unlock it.
  const wallet = await libs.createWallet(WALLET_FILE);
  wallet.unlock(PASSWORD);

  try {
    // Register the hotel itself
    // a. Get ready transaction data
    const { hotel, transactionData, eventCallbacks } = await index.addHotel({
      manager: wallet.getAddress(),
      dataUri: offChainDataUri,
    });
    // b. Sign and send the transaction. You probably don't have to use our wallet abstraction.
    // This signs a transaction and waits for it to be mined. You can get finer control
    // of this by using your own eventCallbacks, not waiting for the promise to be resolved etc.
    const receipt = await wallet.signAndSendTransaction(transactionData, eventCallbacks);
    // After the transaction is mined, one of the eventCallbacks
    // sets the address of the freshly created hotel.
    const newHotelAddress = hotel.address;
    console.log('hotel address: ', newHotelAddress);

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
    const guarantee = await wallet.encodeAndSignData({
      "hotel": newHotelAddress,
      "guarantor": wallet.getAddress(),
      "expiresAt": monthFromNow.getTime(),
    }, 'guarantor');
    // After generating a guarantee, it has to be published alongside hotel data
    // on offChainDataUri.
    console.log('Guarantee would look like:');
    console.log(guarantee);
  } finally {
    // Don't forget to lock your wallet after you are done, you
    // don't want to leave your private keys lying around.
    wallet.lock();
  }
})();

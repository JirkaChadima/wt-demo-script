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

// 4. Update your hotel on Winding Tree platform
(async () => {
  // Get an instance of your organization. This will work only for ORG.IDs created
  // by the OrganizationFactory
  const organization = await libs.getUpdateableOrganization('0x40D0ac93E893c75950A90a5b8d708d6D309967aD');

  // Create a Wallet abstraction and unlock it.
  const wallet = await libs.createWallet(WALLET_FILE);
  wallet.unlock(PASSWORD);

  organization.orgJsonUri = offChainDataUri;
  
  try {
    // Update the hotel data on-chain
    // a. Get ready transaction data - update may produce multiple transactions
    const transactionDataList = await organization.updateOnChainData({
      from: wallet.getAddress()
    });
    let receipt, transactions = [];
    // b. Sign and send all of the transactions. You probably don't have to use our wallet abstraction.
    for (let { transactionData, eventCallbacks } of transactionDataList) {
      // This signs a transaction and sends it to be mined. You can get finer control
      // of this by using your own eventCallbacks, handling each transaction sequentially etc.
      transactions.push(wallet.signAndSendTransaction(transactionData, eventCallbacks));
    }
    const receipts = await Promise.all(transactions);
    for (let receipt of receipts) {
      // After the transaction is mined, you get
      // a receipt which contains a transaciontHash, among other useful things.
      console.log('transaction to check: ', receipt.transactionHash);
    }
  } finally {
    // Don't forget to lock your wallet after you are done, you
    // don't want to leave your private keys lying around.
    wallet.lock();
  }
})();

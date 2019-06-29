const libs = require('./config');

// 3. Collect the data
// This has to be in an async block due to the nature of distributed data
(async () => {
  // Get an instance of WTIndex wrapper
  const directory = await libs.getDirectory('hotels', '0x8ea119A7Ef0Ac4c1a83a3BB6D1aa1a3afcAfDE8b');

  // We can get all hotels available in the Directory
  // - We will get only hotels on valid and accessible addresses
  // - Every hotel is an abstraction over on-chain and off-chain data
  // - This should be reasonably fast, because only a single method call on Segment Directory is performed
  const hotels = await directory.getOrganizations();

  // Notice how the approach is totally protocol agnostic
  for (let hotel of hotels) {
    try {
      // You can benefit from a recursive shorthand method that downloads all of hotel data for you
      // const serializedHotel = await hotel.toPlainObject();
      // And you can access all of the data in a simple, synchronous way
      // const orgJsonData = serializedHotel.orgJsonUri.contents;
      console.log({
        address: await hotel.address,
        owner: await hotel.owner,
        orgJsonUri: await hotel.orgJsonUri,
      });

      // OR with much finer control and a lot of await calls, you can do this:
      
      // This actually fetches data from a hotel smart contract
      //const orgJsonUri = await hotel.orgJsonUri;
      // But it gets cached, so the second call is way faster
      //const orgJsonUri2 = await hotel.orgJsonUri;

      // Let's initialize the off-chain data index - but no data is downloaded yet
      //const offChainData = await hotel.orgJson;
      // Only the next command actually initiates the download of the data index document
      //const legalEntity = (await offChainData.contents).legalEntity;
      // And only now the actual contents of gets downloaded
      //const legalEntityName = (await offChainData.contents).legalEntity.name;
      //console.log('Legal entity name:', legalEntityName);
      // But this is fast, because the document is already cached in memory.
      // The properties are of course interchangeable, so the data is downloaded
      // only when any of the data properties is accessed for the first time.
    } catch (e) {
      console.log(hotel.address, e.message);
    }
  }
})();

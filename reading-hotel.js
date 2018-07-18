const libs = require('./config');

// 3. Collect the data
// This has to be in an async block due to the nature of distributed data
(async () => {
  // Get an instance of WTIndex wrapper
  const index = await libs.getWTIndex('0x407f550023eb6ad8a4797844489e17c5ced17e06');

  // We can get all hotels available in the WTIndex
  // - We will get only hotels on valid and accessible addresses
  // - Every hotel is an abstraction over on-chain and off-chain data
  // - This should be reasonably fast, because only a single method call on WTIndex is performed
  const hotels = await index.getAllHotels();

  // Notice how the approach is totally protocol agnostic
  for (let hotel of hotels) {
    try {
      // You can benefit from a recursive shorthand method that downloads all of hotel data for you
      const serializedHotel = await hotel.toPlainObject();
      // And you can access all of the data in a simple, synchronous way
      const hotelLocation = serializedHotel.dataUri.contents.descriptionUri.contents.location;
      console.log(serializedHotel.address);

      // OR with much finer control and a lot of await calls, you can do this:
      
      // This actually fetches data from a hotel smart contract
      const hotelDataUri = await hotel.dataUri;
      // But it gets cached, so the second call is way faster
      const hotelDataUri2 = await hotel.dataUri;

      // Let's initialize the off-chain data index - but no data is downloaded yet
      const offChainData = await hotel.dataIndex;
      // Only the next command actually initiates the download of the data index document
      const hotelDescriptionUri = await offChainData.contents.descriptionUri;
      // And only now the actual contents of descriptionUri gets downloaded
      const hotelName = await hotelDescriptionUri.contents.name;
      // But this is fast, because the document is already cached in memory.
      // The properties are of course interchangeable, so the data is downloaded
      // only when any of the data properties is accessed for the first time.
      const hotelDescription = await hotelDescriptionUri.contents.description;
    } catch (e) {
      console.log(hotel.address, e);
    }
  }
})();

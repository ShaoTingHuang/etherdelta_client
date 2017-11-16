
'use strict';
const fs = require('fs');


class EtherdeltaParser {

  constructor() {
    this.source = null;
  }

  loadFromFile(filename) {
    const contents = fs.readFileSync(filename);
    this.source = JSON.parse(contents);
  }

  getTokenAddrFromSource(source) {
    return source["orders"]["buys"][0]["tokenGet"];
  }

  findSymbolFromTokenAddr(tokenAddr, source) {
    const marketData = source["returnTicker"];
    for (var key in marketData) {
      if (marketData[key]["tokenAddr"] == tokenAddr) {
        return key;
      } 
    }
  }

  formatSymbol(symbol) {
    return symbol.split("_").reverse().join("-")
  }

  parse() {
    const source = this.source;
    const tokenAddr = this.getTokenAddrFromSource(source);
    let symbol = this.findSymbolFromTokenAddr(tokenAddr, source);
    symbol = this.formatSymbol(symbol);
    if (!symbol) { 
      console.log(`no symbol for ${tokenAddr}`);
    }
    console.log(`tokenAddr: ${tokenAddr}, symbol: ${symbol}`);
    this.parseOrderBook();
  }

  parseOrderBook() {
  //   const bids = this.source["orders"]["buys"]
  //   const asks = this.source["orders"]["sells"]
  //   let orderBook = {}
  //   for (let bid of bids) {

  //   }
  //   bids.each do |bid|
  //     order_book.add_entry(quantity: bid["ethAvailableVolume"], price: bid["price"], side: 'bid')
  //   end
  //   asks.each do |ask|
  //     order_book.add_entry(quantity: ask["ethAvailableVolume"], price: ask["price"], side: 'ask')
  //   end
  //   order_book.finish_adding_entries()
  // end
  }
}


if (!module.parent) {
  require('dotenv').config();
  let p = new EtherdeltaParser();
  p.loadFromFile('./exchange_data/etherdelta/ADX-ETH.json');
  p.parse();


  const mongojs = require('mongojs');
  let connectionString = `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}` +
    `@ds249575.mlab.com:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`;
  console.log(connectionString)

  const db = mongojs(connectionString);
  let sample = db.collection('sample');
  db.sample.find( (err, docs) => {
    console.log(docs);
  })


} 


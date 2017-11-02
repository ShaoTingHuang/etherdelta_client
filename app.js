const io = require('socket.io-client');
var fs = require('fs');

var socket = io.connect('https://socket.etherdelta.com', { transports: ['websocket'] });
var firstCall = true;
var tokenAddr = null;
var tokens = null;
var tokenIndex = -1;
socket.on('connect', () => {
  console.log('socket connected');
});

socket.on('disconnect', () => {
  console.log('socket disconnected');
});


function findSymbolFromTokenAddr(tokenAddr, marketData) {
  for (var key in marketData) {
    if (marketData[key]["tokenAddr"] == tokenAddr) {
      return key;
    } 
  }
}

function formatSymbol(symbol) {
  return symbol.split("_").reverse().join('-');
}

function writeToFile(symbol, data) {
  if (!fs.existsSync('./exchange_data')) {
    fs.mkdirSync('./exchange_data');
  }
  if (!fs.existsSync('./exchange_data/etherdelta')) {
    fs.mkdirSync('./exchange_data/etherdelta');
  }
  fs.writeFileSync(`./exchange_data/etherdelta/${symbol}.json`, JSON.stringify(data));
}

socket.on('market', (data) => {
  if (!data["returnTicker"]) {
    return;
  }
  if (data["orders"] && data["orders"]["buys"].length == 0) {
    tokens = [];
    markets = data["returnTicker"]
    for (var key in markets) {
      tokens.push( [ key, markets[key]["tokenAddr"] ] );
    }
    console.log(`tokens: ${tokens}`);
  }
  else {
    var tokenAddr = data["orders"]["buys"][0]["tokenGet"];
    symbol = findSymbolFromTokenAddr(tokenAddr, data["returnTicker"]);
    symbol = formatSymbol(symbol);
    writeToFile(symbol, data);
  }
});

// var socket = require('socket.io-client')('https://socket.etherdelta.com');
// socket.on('connect', function(){
//   console.log("connected");
// });
// socket.on('event', function(data){
//   console.log('event')
//   console.log(data);
// });
// socket.on('disconnect', function(){
//   console.log("disconnected");
// });

// socket.on('market', function(data) {
//   console.log('data')
//   console.log(data);
// });



(async function main() {
  if( tokens ) {
    tokenIndex++;
    tokenAddr = tokens[tokenIndex][1];
  }
  console.log(`emitting getmarket with tokenAddr ${tokenAddr}`)
  socket.emit("getMarket", { token: tokenAddr });
    //{token: "0xac3211a5025414af2866ff09c23fc18bc97e79b1" });
  console.log('getMarket');
  setTimeout(main, 5000);
})();
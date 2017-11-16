require('dotenv').config()
const io = require('socket.io-client');
var fs = require('fs');

var socket = io.connect('https://socket.etherdelta.com', { transports: ['websocket'] });
var firstCall = true;
var tokenAddr = null;
var tokens = null;
var tokenIndex = -1;
var writeDirectory = null;

function createDirectories() {
  var rootDir = "../crypto-arb2"
  var dir1 = `${rootDir}/exchange_data`;
  var dir2 = `${dir1}/etherdelta`;
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }
  if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2);
  }
  writeDirectory = dir2;
}
createDirectories();

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
  console.log(`writing to ${writeDirectory}/${symbol}.json`);
  fs.writeFileSync(`${writeDirectory}/${symbol}.json`, JSON.stringify(data));
}

socket.on('market', (data) => {
  if (!data["returnTicker"]) {
    return;
  }
  if (data["orders"]) {
    if (data["orders"]["buys"].length == 0) {
      console.log("first call complete, setting tokens");
      tokens = [];
      markets = data["returnTicker"]
      for (var key in markets) {
        keySplit = key.split("_")
        if (keySplit[keySplit.length-1].startsWith("0x")) {
          continue;
        }
        tokens.push( [ key, markets[key]["tokenAddr"] ] );
      }
      console.log(`tokens: ${tokens}`);
    }
    else {
      var tokenAddr = data["orders"]["buys"][0]["tokenGet"];
      symbol = findSymbolFromTokenAddr(tokenAddr, data["returnTicker"]);
      if (!symbol) { 
        console.log(`no symbol for ${tokenAddr}`);
        return; 
      }
      symbol = formatSymbol(symbol);
      writeToFile(symbol, data);
    }
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
    console.log(`${tokens.length} tokens, \n` + tokens.toString());
    tokenIndex++;
    if (tokenIndex >= tokens.length) {
      tokenIndex = 0;
    }

    // find a specific symbol
    // for(var i=0; i<tokens.length; i++) {
    //   if( tokens[i][0] == "ETH_OMG" ){

    //     console.log('found OMG')
    //     tokenIndex = i;
    //     break;
    //   }
    // }

    console.log(`requesting #${tokenIndex} of ${tokens.length}, ${tokens[tokenIndex][0]}`);
    tokenAddr = tokens[tokenIndex][1];
  }

  console.log(`emitting getmarket with tokenAddr ${tokenAddr}`)
  socket.emit("getMarket", { token: tokenAddr });
    //{token: "0xac3211a5025414af2866ff09c23fc18bc97e79b1" });
  console.log('getMarket');
  setTimeout(main, 5000);
})();
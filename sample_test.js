var request = require('request');

for(var i = 0; i < 10000; i++){
  request('http://localhost:3000', function(error, response, body){
    console.log(body);
  });
}
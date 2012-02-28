// trainsharing - 2012
//
// backend for mobile app

var express = require('express'),
	fs = require('fs'),
	util = require('util');
var app = express.createServer();

// load stations
var stations = JSON.parse(fs.readFileSync('stations.json', 'utf-8'));

console.log(stations.length);
console.log(stations[600].name);

var requests_made = 0;

app.get('/', function(req, res){

  // increase requests
  requests_made = requests_made + 1;

	var random_entry_index = Math.floor(Math.random() * 1817);

	console.log(random_entry_index + ' - ' + requests_made);

	res.send(stations[random_entry_index]);

	// res.send({
	// 	name: 'Philipp Küng'
	// });
});

app.listen(3000);
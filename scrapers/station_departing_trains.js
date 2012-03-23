/* 
 *	This Scraper will make POST requests against the SBB website.
 *	It then extract the departing train IDs and stores them.
 *	Then moves on to fetch a response for some time later until a full 24h are collected.
 *
 *	SBB Website URL: http://fahrplan.sbb.ch/bin/query.exe/dn
 *	
 */

 // Basic POST
 // _charset_=UTF-8&start=1&S=z%C3%BCrich+hb&REQ0JourneyStopsS0A=7&Z=wollerau&REQ0JourneyStopsZ0A=7&V1=&date=22.03.12&time=09%3A13&timesel=depart

var util = require('util'),
	request = require('superagent'),
	qs = require('querystring'),
	select = require('soupselect').select,
	htmlparser = require('htmlparser'),
	fs = require('fs');

/* FOR GETTING A FAHRPLAN -------------- */

// var postData = {
// 	"_charset_": "UTF-8",
// 	"start": 1,
// 	"S": "Zürich HB",
// 	"REQ0JourneyStopsS0A": "7",
// 	"Z": "Siebnen-Wangen",
// 	"REQ0JourneyStopsZ0A": "7",
// 	"V1": "",
// 	"date": "15.03.12",
// 	"time": "11:40",
// 	"timesel": "depart"
// }

// var remoteUri = 'http://fahrplan.sbb.ch/bin/query.exe/dn';

/* FOR GETTING DEPARTING TRAINS FROM A STATION ------------- */

// input=Z%FCrich+HB&selectDate=today&dateBegin=22.03.12&dateEnd=08.12.12&time=12%3A00&boardType=dep&REQProduct_list=2%3A1111010010000000&dirInput=&REQTrain_name=&maxJourneys=50&start=Anzeigen&distance=1
// input=Z%fcrich+HB&selectDate=today&dateBegin=22.03.12&dateEnd=08.12.12&time=12%3A00&boardType=dep&REQProduct_list=2%3A1111010010000000&dirInput=&REQTrain_name=&maxJourneys=50&start=Anzeigen&distance=1

var content = "input=Z%FCrich+HB&selectDate=today&dateBegin=22.03.12&dateEnd=08.12.12&time=12%3A00&boardType=dep&REQProduct_list=2%3A1111010010000000&dirInput=&REQTrain_name=&maxJourneys=50&start=Anzeigen&distance=1";

var postData = {
	// input: "Zürich HB",
	input: "Siebnen-Wangen",
	selectDate: "today",
	dateBegin: "22.03.12",
	dateEnd: "08.12.12",
	time: "12:00",
	boardType: "dep",
	REQProduct_list: "2:1111010010000000", // Return results for "Nur Bahn"
	dirInput: "",
	REQTrain_name: "",
	maxJourneys: "50",
	start: "Anzeigen",
	distance: "1"
};


/* LOAD STATIONS FROM FILE ------------- */

var stations = JSON.parse(fs.readFileSync('./../stations.json', 'utf-8'));

 // [{ id: '8503004',
 //    x: '8.561661',
 //    y: '47.350068',
 //    name: 'Zürich Tiefenbrunnen' }, {...}]


/* FORMATS VALUE INTO EXTENDED ASCII ------------- */

var formatValue = function(value){

	// Replaces whitespace with a + via the regex.
	// Escapes the UTF-8 encoded value to ASCII.

	return escape(value.replace(/\s/gi, "+"));
};


/* CREATE ASCII ENCODED QUERYSTRING ------------- */

var createDataString = function(data){

	var output = "";

	for(var key in data){
		if(data.hasOwnProperty(key)){
			output += key + "=";

			if(typeof data[key] !== 'undefined'){
				output += formatValue(data[key]) + "&";
			} else {
				output += "&";
			}
		}
	}

	return output;
};


/* MAKE POST REQUEST AGAINST SBB WEBSITE ------------- */

var remoteUri = 'http://fahrplan.sbb.ch/bin/bhftafel.exe/dn';

var fetchTimetable = function(station, start, number, current_index){

	setTimeout(function(){
		var newData = postData;
		newData.input = station;
		newData.time = start;

		request
			.post(remoteUri)
			// .type('form')
			.send(createDataString(postData))
			// .send(postData)
			.end(function(res){

				// Parsing Departures from a single station and returning the last one.

				var handler = new htmlparser.DefaultHandler(function(err, dom){
					if(err){
						util.debug("Error: " + err);
					} else {
						var table = select(dom, 'table.hfs_stboard');
						var departureTimes = [];

						table[0].children.forEach(function(tr){ // Iterating throught the tr elements within tbody.
							if(typeof tr.attribs !== 'undefined' && typeof tr.attribs.class !== 'undefined'){ // tr has some class

								tr.children.forEach(function(td){
									if(typeof td.attribs !== 'undefined' && typeof td.attribs.class !== 'undefined' && td.attribs.class === 'time'){

										td.children.forEach(function(span){
											if(typeof span.children !== 'undefined'){
												departureTimes.push(span.children[0].data);
											}
										});
									}
								});
							}
						});

						departureTimes.sort(); // Sort all the times from the response to latest one.

						// console.log(departureTimes[departureTimes.length - 1]);

						// Save Response HTML to Disk for further analysis.
						// Format: Station--IncreasingNumber.html
						// -- Format: Date--Time--Station.html

						fs.writeFile('data/' + station + '--' + number + '.html', res.text, function (err) {
	  						if (err){
	  							throw err;
	  						} else {
	  							console.log('saved ' + station + '--' + number + '.html with start time ' + start + ' is station [' + current_index + '/' + stations.length + ']');

	  							if(departureTimes[departureTimes.length - 1] !== start){
	  								number += 1;
	  								fetchTimetable(station, departureTimes[departureTimes.length - 1], number, current_index);
	  							} else {
	  								console.log('--> done with ' + station);
	  								nextStation(current_index);
	  							}
	  						}
						});


						// Find time & date of last element to know what the data for the next request has to be.
					}
				});

				var parser = new htmlparser.Parser(handler);
				parser.parseComplete(res.text);

				// console.log(res.text);

			});
	}, 2000);

};

var nextStation = function(current_index){
	index = current_index + 1;
	if(index <= stations.length && typeof stations[index] !== 'undefined'){
		fetchTimetable(stations[index].name, '00:00', 1, index);
	} else {
		console.log('==> done with fetching!');
	}
};

nextStation(-1);

// fetchTimetable('Siebnen-Wangen','00:00', 1);

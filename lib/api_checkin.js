module.exports = function(req, res, mysql, moment){
    // check if necessary data is there...
    
    if(req.is('json')){
        check_post_body(req, res, mysql, moment);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }
    
};

/* Check if checkin POST body is valid */

// valid body
// ----------
// --> http://trainshare.ch/v1/checkin?trainshare_id=the_trainshare_id
// [{
//     departure_station: "Bern",
//     departure_time: "16:34",
//     arrival_station: "Basel SBB",
//     arrival_time: "17:29",
//     train_id: "IC 1080"
// },{
//     ... next train ...
// }]

var check_post_body = function(req, res, mysql, moment){
    if(typeof req.body !== 'undefined' && req.body.length !== 0){
        console.log(req.query['trainshare_id']);

        if(typeof req.query['trainshare_id'] !== 'undefined' && req.query['trainshare_id'].length === 36){
            send_friends(req, res, mysql, moment);
        } else {
            res.json({error: 'trainshare_id missing'}, 400);
        }

    } else {
        res.json({error: 'Invalid POST body'}, 400);
    } 
};

var send_friends = function(req, res, mysql, moment){

    var dep_time = moment().minutes(3).hours(12).utc();
    var arr_time = moment(dep_time).minutes(14).hours(13).utc();

    res.json([
            {
                name: 'Darth Vader', // prefer twitter over facebook
                trainshare_id: '5eedcdfb-db12-4abd-a46f-694361f3cbb6',
                position: 4, // 0 -> 10
                upper: false, 
                message: 'a message', // 120
                image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png', // -> just from one network
                overlaps: {
                    departure_time: dep_time.format(),
                    departure_station: "Bern",
                    arrival_time: arr_time.format(),
                    arrival_station: "Basel SBB"
                }
            },
            {
                name: 'Yöda', 
                trainshare_id: '5eedcdfb-db12-4abd-a46f-694361f3cbb5',
                position: 9, 
                upper: true, 
                message: 'a message', 
                image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_biger.png',
                overlaps: {
                    departure_time: dep_time.format(),
                    departure_station: "Bern",
                    arrival_time: arr_time.format(),
                    arrival_station: "Basel SBB"
                }
            }
        ], 200);
};

// var twitter = require('twitter'),
//     config = require('../config'),
//     neo4j = require('./neo4j'),
//     uuid = require('node-uuid');
// 
// module.exports = function(req, res, mysql){
//     if(req.is('json')){
//         check_network(req, res, mysql);
//     } else {
//         res.json({error: 'Invalid Content-Type'}, 400);
//     }  
// };

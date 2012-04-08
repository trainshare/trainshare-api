module.exports = function(req, res, mysql){
    // check if necessary data is there...
    
    if(req.is('json')){
        check_post_body(req, res, mysql);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }
    
};

/* Check if checkin POST body is valid */

// valid body
// ----------
// --> http://trainshare.ch/v1/checkin?trainshare_id=the_trainshare_id
// [{
//     dep_st: "Bern",
//     dep_t: "16:34",
//     arr_st: "Basel SBB",
//     arr_t: "17:29",
//     train_id: "IC 1080" (optional if dep_t and arr_t are given)
// },{
//     ... next train ...
// }]

var check_post_body = function(req, res, mysql){
    if(typeof req.body !== 'undefined' && req.body.length !== 0){
        console.log(req.query['trainshare_id']);

        if(typeof req.query['trainshare_id'] !== 'undefined' && req.query['trainshare_id'].length === 36){
            send_friends(req, res, mysql);
        } else {
            res.json({error: 'trainshare_id missing'}, 400);
        }

    } else {
        res.json({error: 'Invalid POST body'}, 400);
    } 
};

var send_friends = function(req, res, mysql){
    res.json([
            {
                name: 'Darth Vader', 
                position: 4, 
                upper: false, 
                message: 'a message', 
                networks: {
                    twitter: {
                        image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png'
                    },
                    facebook: {
                        image_url: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/49305_744608228_7336_n.jpg'
                    }
                },
                overlaps: {
                    time: "2:23",
                    routes: [123, 423, 7456, 457345]
                }
            },
            {
                name: 'Yoda', 
                position: 9, 
                upper: true, 
                message: 'a message', 
                networks: {
                    twitter: {
                        image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png'
                    }
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

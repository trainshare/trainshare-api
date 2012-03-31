module.exports = function(req, res, mysql){
    // check if necessary data is there...
    
    if(req.is('json')){
        send_friends(req, res, mysql);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }
    
};

var check_post_body = function(req, res, mysql){
    
    
    
};

var send_friends = function(req, res, mysql){
    res.json({
        friends: [
            {name: 'Darth Vader', position: 4, upper: false},
            {name: 'Yoda', position: 9, upper: true},
            {name: 'R2-D2', position: 1, upper: false},
            {name: 'Luke Skywalker', position: 1, upper: false},
            {name: 'Chewbacca', position: 8, upper: true},
            {name: 'Leia Organa Solo', position: 10, upper: true},
            {name: 'Han Solo', position: 10, upper: true}
        ]
    }, 200);
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

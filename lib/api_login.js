var twitter = require('twitter'),
    config = require('./config');

module.exports = function(req, res){
    if(req.is('json')){
        check_network(req, res);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }  
};

var check_network = function(req, res){
    // check if network is given
    if(typeof req.body !== 'undefined' && typeof req.body.network !== 'undefined' && req.body.network !== ''){

        // check if network is valid & supported -> facebook & twitter only for now.
        switch(req.body.network){
            case 'twitter':
                check_twitter_tokens(req, res);
                break;
            case 'facebook':
                check_facebook_tokens(req, res);
                break;
            default:
                res.json({error: 'No network given'}, 400);
        }

    } else {
        res.json({error: 'No network given'}, 400);
    }
};

/* Check occurrence of the access_token and the access_token_secret ----------- */
var check_twitter_tokens = function(req, res){
    if(typeof req.body.access_token !== 'undefined' && typeof req.body.access_token_secret !== 'undefined' &&
        req.body.access_token !== '' && req.body.access_token_secret !== ''){
            fetch_twitter_uid(req, res);
    } else {
        res.json({error: 'No authentication tokens given'}, 400);
    }
};

/* Check occurrence of the single authentication token ----------- */
var check_facebook_tokens = function(req, res){
    if(typeof req.body.token !== 'undefined' && req.body.token !== ''){
      fetch_facebook_friends(req, res);
    } else {
        res.json({error: 'No authentication tokens given'}, 400);
    }
};

var fetch_twitter_uid = function(req, res){
    var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY ? process.env.TWITTER_CONSUMER_KEY : config.twitter.consumer_key,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET ? process.env.TWITTER_CONSUMER_SECRET : config.twitter.consumer_secret,
        access_token_key: req.body.access_token,
        access_token_secret: req.body.access_token_secret
    });
    
    
    
    // Fetch the UID here...
    // Make callback to fetch follower list
}

var fetch_facebook_friends = function(req, res){
    
};

/* Fetch those people following you ------------ */
var fetch_twitter_friends = function(req, res, twit){
    var twit = new twitter({
        consumer_key: 
    })
    
    // var twit = new twitter({
    //     consumer_key: 'STATE YOUR NAME',
    //     consumer_secret: 'STATE YOUR NAME',
    //     access_token_key: 'STATE YOUR NAME',
    //     access_token_secret: 'STATE YOUR NAME'
    // });
};

// Check if network and tokens are given

// Fetch friends list from network

// Insert friends list into Neo4j
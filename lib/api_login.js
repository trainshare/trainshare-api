var twitter = require('twitter'),
    config = require('../config'),
    neo4j = require('./neo4j'),
    uuid = require('node-uuid');

module.exports = function(req, res, mysql){
    if(req.is('json')){
        check_network(req, res, mysql);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }  
};

/* Check if network property is there, valid and supported ------------ */
var check_network = function(req, res, mysql){

    // check if network is given
    if(typeof req.body !== 'undefined' && typeof req.body.network !== 'undefined' && req.body.network !== ''){

        // check if network is valid & supported -> facebook & twitter only for now.
        switch(req.body.network){
            case 'twitter':
                check_twitter_tokens(req, res, mysql);
                break;
            case 'facebook':
                check_facebook_tokens(req, res, mysql);
                break;
            default:
                res.json({error: 'No network given'}, 400);
        }

    } else {
        res.json({error: 'No network given'}, 400);
    }
};

/* Check occurrence of the access_token and the access_token_secret ----------- */
var check_twitter_tokens = function(req, res, mysql){
    if(typeof req.body.access_token !== 'undefined' && typeof req.body.access_token_secret !== 'undefined' &&
        req.body.access_token !== '' && req.body.access_token_secret !== ''){
            fetch_twitter_uid(req, res, mysql);
    } else {
        res.json({error: 'No authentication tokens given'}, 400);
    }
};

/* Check occurrence of the single authentication token ----------- */
var check_facebook_tokens = function(req, res, mysql){
    if(typeof req.body.token !== 'undefined' && req.body.token !== ''){
      fetch_facebook_friends(req, res);
    } else {
        res.json({error: 'No authentication tokens given'}, 400);
    }
};

var fetch_twitter_uid = function(req, res, mysql){
    var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY ? process.env.TWITTER_CONSUMER_KEY : config.twitter.consumer_key,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET ? process.env.TWITTER_CONSUMER_SECRET : config.twitter.consumer_secret,
        access_token_key: req.body.access_token,
        access_token_secret: req.body.access_token_secret
    });
    
    twit
        .verifyCredentials(function(twitter_data){
            // use id_str as UID
            
            console.log(twitter_data);

            // check if user is already within the users table.
            mysql.query(
                'SELECT * FROM users WHERE twitter_uid = ?',
                [twitter_data.id_str],
                function(err, results, fields){
                    if(err){
                        console.log(err);
                    } else {
                        if(results.length === 0){ // Insert the user into neo4j
                            
                            // Insert a Node with this specific user into Neo4j.
                            neo4j.InsertUserNode({
                               username: twitter_data.screen_name,
                               access_token_key: req.body.access_token,
                               access_token_secret: req.body.access_token_secret
                            }, function(err, node_result){
                                if(err){
                                    console.log(err);
                                } else {

                                    // create a new UUID as a trainsharingAppID
                                    var trainsharingID = uuid.v4();
                                    var node_id = node_result.id;
                                    // var twitter_uid = data.str_id;
                                    
                                    // insert the user information into the users table.
                                    mysql.query(
                                        'INSERT INTO users SET node_id = ?, twitter_uid = ?, trainsharing_uid = ?',
                                        [node_id, twitter_data.id_str, trainsharingID],
                                        function(err, results, fields){
                                            if(err){
                                                console.log(err);
                                                res.json(err, 500);
                                            } else {

                                                // res.json({trainsharingID:trainsharingID}, 200);
                                                
                                                // continue with fetching friends and upserting them into neo4j.
                                                res.json(results, 200);
                                                // fetch_twitter_friends(req, res, twit, data.str_id, node_result);
                                            }
                                            
                                        }
                                    );
                                }
                            });
                            
                        } else { // Continue without with followers neo4j Upsert.
                            
                        }
                        // console.log(results);
                        // res.json(results, 200);
                    }
                }
            )
            
            // check if user is already in users TABLE, if not add -> start adding
            // if user is there, start fetching followers and upsert them into neo4j.
            
            // client.query(
            //     'SELECT * FROM routes limit 10',
            //     function(err, results, fields){
            //         if(err){
            //             console.log('an error occurred');
            //         }
            //         res.send(results);
            //     }
            // );
        });
    
    // Fetch the UID here...
    // Make callback to fetch follower list
}

var fetch_facebook_friends = function(req, res){
    
};

/* Fetch those people following you ------------ */
var fetch_twitter_friends = function(req, res, twit, twit_id, root_node_object){
    twit.getFollowersIds(twit_id, function(data){
        neo4j.UpsertListWithRoot('twitter', root_node_object, data, function(err, results){
            console.log(err);
            console.log(results);
            res.json(results, 200);
        });
        // res.json(data, 200); 
    });
};

// Check if network and tokens are given

// Fetch friends list from network

// Insert friends list into Neo4j
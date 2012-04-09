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
    if(typeof req.body.access_token !== 'undefined' && req.body.access_token !== ''){
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
        .verifyCredentials(function(twitter_data){ // use id_str as UID

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
                            }, function(err, user_node){
                                if(err){
                                    console.log(err);
                                } else {

                                    // create a new UUID as a trainsharingAppID
                                    var trainshare_id = uuid.v4();
                                    
                                    // insert the user information into the users table.
                                    mysql.query(
                                        'INSERT INTO users SET node_id = ?, twitter_uid = ?, trainsharing_uid = ?',
                                        [user_node.id, twitter_data.id_str, trainshare_id],
                                        function(err, insert_results, fields){
                                            if(err){
                                                console.log(err);
                                                res.json(err, 500);
                                            } else {
                                                
                                                // return the trainshare_id to the client app.
                                                res.json({trainshare_id: trainshare_id}, 200);

                                                // continue with fetching friends and upserting them into neo4j.
                                                // fetch_twitter_friends(req, res, twit, twitter_data.id_str, user_node, trainshare_id, mysql);
                                            }
                                        }
                                    );
                                }
                            });
                            
                        } else { // Continue without with follower upserting into neo4j.
                            res.json({trainshare_id: results[0].trainsharing_uid}, 200);
                        }
                    }
                }
            );
        });
    
    // Fetch the UID here...
    // Make callback to fetch follower list
}

var fetch_facebook_friends = function(req, res){
    res.json({trainshare_id: uuid.v4()}, 200);
};

/* Fetch those people following you ------------ */
var fetch_twitter_friends = function(req, res, twit, twit_id, user_node, trainshare_id, mysql){

    console.log(twit_id);

    // Fetch followers for that user from twitter (people following that user)
    twit.getFollowersIds(twit_id, function(data){

        console.log(data);

        res.json({trainshare_id: trainshare_id}, 200);

        // // Insert a node for each user not already within the Neo4j DB.
        // neo4j.UpsertListWithRoot('twitter', user_node, data, mysql, function(err, results){

        //     // return the trainshare_id to the client app.
        //     res.json({trainshare_id: trainshare_id}, 200);
        // });
    });

    // twit.getFollowersIds(twit_id, function(data){
    //     neo4j.UpsertListWithRoot('twitter', root_node_object, data, function(err, results){
    //         console.log(err);
    //         console.log(results);
    //         res.json(results, 200);
    //     });
    // });
};

// Check if network and tokens are given

// Fetch friends list from network

// Insert friends list into Neo4j
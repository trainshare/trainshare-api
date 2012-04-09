var twitter = require('twitter'),
    config = require('../config'),
    neo4j = require('node-neo4j'),
    uuid = require('node-uuid');

// Initialize Neo4j DB
var db = new neo4j(process.env.NEO4J_URL || "http://localhost:7474");

// do some checking if request is valid.
// fetch users twitter_id -> generate trainshare_id -> response
// fetch users twitter followers -> insert into neo4j and mysql
// api_login(data.request, data.response, data.mysql, data.moment);

module.exports = function Login(util, events){
    events.call(this);

    // PUBLIC FUNCTIONS

    this.login = function(data){
        if(data.request.is('json')){
            this.emit('checkNetwork', data);
        } else {
            data.response.json({error: 'Invalid Content-Type'}, 400);
        }
    }


    // PRIVATE FUNCTIONS

    /* Check if network property is there, valid and supported ------------ */
    var _checkNetwork = function(data){
        if(typeof data.request.body !== 'undefined' && typeof data.request.body.network !== 'undefined' && data.request.body.network !== ''){
            
            // check if network is valid & supported -> facebook & twitter only for now.
            switch(data.request.body.network){
                case 'twitter':
                    this.emit('checkTwitterTokens', data);
                    break;
                case 'facebook':
                    this.emit('checkFacebookTokens', data);
                    break;
                default:
                    data.response.json({error: 'No network given'}, 400);
            }
        } else {
            data.response.json({error: 'No network given'}, 400);
        }
    };

    var _checkTwitterTokens = function(data){      
        if(typeof data.request.body.access_token !== 'undefined' &&
           typeof data.request.body.access_token_secret !== 'undefined' &&
           data.request.body.access_token !== '' &&
           data.request.body.access_token_secret !== ''){

            this.emit('fetchTwitterUid', data);
        } else {
            data.response.json({error: 'No authentication tokens given'}, 400);
        }
    };

    var _fetchTwitterUid = function(data){
        var that = this;

        data.twit = new twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY ? process.env.TWITTER_CONSUMER_KEY : config.twitter.consumer_key,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET ? process.env.TWITTER_CONSUMER_SECRET : config.twitter.consumer_secret,
            access_token_key: data.request.body.access_token,
            access_token_secret: data.request.body.access_token_secret
        });

        data.twit.verifyCredentials(function(twitter_user){
            if(typeof twitter_user !== 'undefined' &&
               typeof twitter_user.id_str !== 'undefined'
                ){

                data.twitter_user = twitter_user;

                that.emit('checkIfTwitterUserIsInDB', data);
            } else {
                data.response.json({error: 'Invalid Response from Twitter'}, 400);
            }
        });
    };

    var _checkIfTwitterUserIsInDB = function(data){
        var that = this;

        data.mysql.query(
            'SELECT * FROM users WHERE twitter_uid = ?',
            [data.twitter_user.id_str],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    if(results.length === 0){
                        that.emit('insertTwitterUserIntoNeo4j', data);
                    } else {
                        data.response.json({trainshare_id: results[0].trainshare_id}, 200);
                    }
                }
            });
    };

    var _insertTwitterUserIntoNeo4j = function(data){
        var that = this;

        db.InsertNode({
            twitter_username: data.twitter_user.screen_name,
            twitter_access_token: data.request.body.access_token,
            twitter_access_token_secret: data.request.body.access_token_secret
        }, function(err, result){
            if(err){
                console.log(err);
                data.response.json({error: 'Internal Error'}, 400);
            } else {
                data.user_node = result;
                data.trainshare_id = uuid.v4();
                that.emit('insertTwitterNodeIntoUsersTable', data);
            }
        });
    };

    var _insertTwitterNodeIntoUsersTable = function(data){

        data.mysql.query(
            'INSERT INTO users SET node_id = ?, twitter_uid = ?, trainshare_id = ?',
            [data.user_node.id, data.twitter_user.id_str, data.trainshare_id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    data.response.json({trainshare_id: data.trainshare_id}, 200);
                }
            });
    };

    var _checkFacebookTokens = function(data){
        if(typeof data.request.body.access_token !== 'undefined' &&
           data.request.body.access_token !== ''){

            this.emit('fetchFacebookFriends', data);
        } else {
            data.response.json({error: 'No authentication tokens given'}, 400);
        }
    };


    // LISTENERS

    this.on('checkNetwork', _checkNetwork);
    this.on('checkTwitterTokens', _checkTwitterTokens);
    this.on('fetchTwitterUid', _fetchTwitterUid);
    this.on('checkIfTwitterUserIsInDB', _checkIfTwitterUserIsInDB);
    this.on('insertTwitterUserIntoNeo4j', _insertTwitterUserIntoNeo4j);
    this.on('insertTwitterNodeIntoUsersTable', _insertTwitterNodeIntoUsersTable);
    this.on('checkFacebookTokens', _checkFacebookTokens);
};


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
var twitter = require('twitter'),
    config = require('../config'),
    neo4j = require('node-neo4j'),
    uuid = require('node-uuid'),
    request = require('superagent');

// Initialize Neo4j DB
var db = new neo4j(config.neo4j.url);

// do some checking if request is valid.
// fetch users twitter_id -> generate trainshare_id -> response
// fetch users twitter followers -> insert into neo4j and mysql

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

            this.emit('writeEntryIntoLoginrequestsTable', data); // save it to the database if process fails from here on down.
            this.emit('fetchTwitterUid', data);
        } else {
            data.response.json({error: 'No authentication tokens given'}, 400);
        }
    };

    var _fetchTwitterUid = function(data){
        var that = this;

        data.twit = new twitter({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
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
            'SELECT * FROM users WHERE twitter_uid = ? LIMIT 1',
            [data.twitter_user.id_str],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    if(results.length === 0){
                        that.emit('insertTwitterUserIntoNeo4j', data);
                    } else {
                        if(results[0].trainshare_id === null){
                            that.emit('upsertExistingTwitterUserInNeo4j', {data: data, mysql_entry: results[0]});
                        } else {
                            that.emit('regenerateTrainshareToken', {data: data, trainshare_id: results[0].trainshare_id});
                        }
                    }
                }
            });
    };

    var _regenerateTrainshareToken = function(data){

        var trainshare_token = uuid.v4();

        data.data.mysql.query(
            'UPDATE users SET trainshare_token = ? WHERE trainshare_id = ?',
            [trainshare_token, data.trainshare_id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.data.response.json({error: 'Internal Error'}, 500);
                } else {
                    data.data.response.json({
                        trainshare_id: data.trainshare_id,
                        trainshare_token: trainshare_token
                    }, 200);
                }
        });
    };

    var _upsertExistingTwitterUserInNeo4j = function(data){
        var that = this;

        db.UpdateNode(data.mysql_entry.node_id, {
            twitter_uid: data.data.twitter_user.id_str,
            twitter_username: data.data.twitter_user.screen_name,
            twitter_access_token: data.data.request.body.access_token,
            twitter_access_token_secret: data.data.request.body.access_token_secret
        }, function(err, result){
            if(err){
                console.log(err);
                data.data.response.json({error: 'Internal Error'}, 400); 
            } else {
                data.data.user_node = {id: data.mysql_entry.node_id};
                data.data.trainshare_id = uuid.v4();
                data.data.trainshare_token = uuid.v4();
                that.emit('upsertExistingTwitterNodeIntoUsersTable', data);
            }
        });
    };

    var _upsertExistingTwitterNodeIntoUsersTable = function(data){
        var that = this;

        data.data.mysql.query(
            'UPDATE users SET trainshare_id = ?, trainshare_token = ? WHERE node_id = ?',
            [data.data.trainshare_id, data.data.trainshare_token, data.mysql_entry.node_id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.data.response.json({error: 'Internal Error'}, 500);
                } else {
                    that.emit('fetchTwitterFollowers', data.data);
                    data.data.response.json({trainshare_id: data.data.trainshare_id, trainshare_token: data.data.trainshare_token}, 200);
                }
        });
    };

    var _insertTwitterUserIntoNeo4j = function(data){
        var that = this;

        db.InsertNode({
            twitter_uid: data.twitter_user.id_str,
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
                data.trainshare_token = uuid.v4();
                that.emit('insertTwitterNodeIntoUsersTable', data);
            }
        });
    };

    var _insertTwitterNodeIntoUsersTable = function(data){
        var that = this;

        data.mysql.query(
            'INSERT INTO users SET node_id = ?, twitter_uid = ?, trainshare_id = ?, trainshare_token = ?',
            [data.user_node.id, data.twitter_user.id_str, data.trainshare_id, data.trainshare_token],
            function(err, results, fields){
                if(err){
                    if(err.number && err.number === 1062){ // duplicate entry for twitter_uid

                        that.emit('fetchExistingTwitterNodeInUsersTable', {data: data});

                        // remove the neo4j node and re-route the relationship
                        // update the new node into mysql

                    } else {
                        console.log(err);
                        data.response.json({error: 'Internal Error'}, 500);        
                    }

                } else {
                    that.emit('fetchTwitterFollowers', data);
                    data.response.json({trainshare_id: data.trainshare_id, trainshare_token: data.trainshare_token}, 200);
                }
            });
    };

    var _fetchTwitterFollowers = function(data){
        var that = this;

        data.twit.getFollowersIds(parseInt(data.twitter_user.id_str), function(followers){

            if(typeof followers !== 'undefined' && followers.length > 0){

                for(var i = 0; i < followers.length; i++){
                    that.emit('checkIfTwitterFollowerIsInDB', {data: data, twitter_follower: followers[i]});
                }
            }
        });
    };

    var _checkIfTwitterFollowerIsInDB = function(data){
        var that = this;

        // INFO :: only users who've signed up for trainshare have a trainshare_id & trainshare_token in the mysql DB.

        data.data.mysql.query(
            'SELECT * FROM users WHERE twitter_uid = ? LIMIT 1',
            [data.twitter_follower],
            function(err, results, fields){
                if(err){
                    console.log(err);
                } else {
                    if(results.length === 0){
                        that.emit('insertTwitterFollowerIntoNeo4j', data);
                    } else {
                        that.emit('createRelationshipBetweenExistingUsers', {data: data, follower_node: results[0].node_id});
                    }
                }
        });
    };

    var _insertTwitterFollowerIntoNeo4j = function(data){
        var that = this;

        // Insert a Node for this follower into Neo4j.
        db.InsertNode({
            twitter_uid: data.twitter_follower
        }, function(err, result){
            if(err){
                console.log(err);
            } else {

                data.follower_node = result;

                // this follower id
                // data.follower_node.id

                // root user id
                // data.data.user_node.id

                // Create a directed Relationship towards the root user. (this follower -> root user)
                db.InsertRelationship(data.follower_node.id, data.data.user_node.id, 'RELATED_TO', {}, function(err, relationship){
                    if(err){
                        console.log(err);
                    } else {
                        that.emit('insertTwitterFollowerIntoMysql', data);
                    }
                });
            }
        });
    };

    var _insertTwitterFollowerIntoMysql = function(data){
        var that = this;

        data.data.mysql.query(
            'INSERT INTO users SET node_id = ?, twitter_uid = ?',
            [data.follower_node.id, data.twitter_follower],
            function(err, results, fields){
                if(err){
                    if(err.number && err.number === 1062){ // duplicate entry for twitter_uid
                        // re-route relationship, remove duplicate node
                        that.emit('fetchExistingTwitterNodeInUsersTable', data);
                    } else {
                        console.log(err);   
                    }
                }
        });
    };

    // In case there's already a node for this follower in Neo4j, just add a Relationship and skip MySQL.
    var _createRelationshipBetweenExistingUsers = function(data){
        var that = this;

        db.InsertRelationship(data.follower_node, data.data.data.user_node.id, 'RELATED_TO', {}, function(err, relationship){
            if(err){
                console.log(err);
            }
        });       
    };

    var _checkFacebookTokens = function(data){
        if(typeof data.request.body.access_token !== 'undefined' &&
           data.request.body.access_token !== ''){

            this.emit('fetchFacebookUid', data);
            // data.response.json({trainshare_id: uuid.v4()}, 200);
        } else {
            data.response.json({error: 'No authentication tokens given'}, 400);
        }
    };

    var _fetchFacebookUid = function(data){
        var that = this;

        request
            .get('https://graph.facebook.com/me?access_token=' + data.request.body.access_token)
            .set('Accept', 'application/json')
            .end(function(result){
                if(result.statusCode === 200){
                    data.facebook_user = result.body;
                    that.emit('checkIfFacebookUserIsInDB', data);

                } else {
                    console.log(result.body);
                    data.response.json({error: 'Invalid response from Facebook'}, 400);
                }
            });
    };

    var _checkIfFacebookUserIsInDB = function(data){
        var that = this;

        data.mysql.query(
            'SELECT * FROM users WHERE facebook_uid = ?',
            [data.facebook_user.id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    if(results.length === 0){
                        that.emit('insertFacebookUserIntoNeo4j', data);
                    } else {
                        that.emit('regenerateTrainshareToken', {data: data, trainshare_id: results[0].trainshare_id});
                    }
                }
            });
    };

    var _insertFacebookUserIntoNeo4j = function(data){
        var that = this;

        db.InsertNode({
            facebook_uid: data.facebook_user.id,
            facebook_name: data.facebook_user.name,
            facebook_access_token: data.request.body.access_token
        }, function(err, result){
            if(err){
                console.log(err);
                data.response.json({error: 'Internal Error'}, 500);
            } else {
                data.user_node = result;
                data.trainshare_id = uuid.v4();
                data.trainshare_token = uuid.v4();
                that.emit('insertFacebookNodeIntoUsersTable', data);
            }
        });
    };

    var _insertFacebookNodeIntoUsersTable = function(data){
        var that = this;

        data.mysql.query(
            'INSERT INTO users SET node_id = ?, facebook_uid = ?, trainshare_id = ?, trainshare_token = ?',
            [data.user_node.id, data.facebook_user.id, data.trainshare_id, data.trainshare_token],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    that.emit('fetchFacebookFollowers', data);
                    data.response.json({trainshare_id: data.trainshare_id, trainshare_token: data.trainshare_token}, 200);
                }
            });
    };

    var _fetchFacebookFollowers = function(data){
        var that = this;

        request
            .get('https://graph.facebook.com/me/friends?access_token=' + data.request.body.access_token)
            .set('Accept', 'application/json')
            .end(function(result){
                if(result.statusCode === 200){
                    // data.facebook_friends = result.body.facebook_friends;

                    for(var i = 0; i < result.body.data.length; i++){
                        that.emit('checkIfFacebookFriendIsInDB', {data: data, facebook_friend: result.body.data[i]});
                    }
                } else {
                    console.log(result);
                    data.response.json({error: 'Invalid response from Facebook'}, 400);
                }
            });
    };

    var _checkIfFacebookFriendIsInDB = function(data){
        var that = this;

        // INFO :: only users who've signed up for trainshare have a trainshare_id and trainshare_token in the mysql DB.

        data.data.mysql.query(
            'SELECT * FROM users WHERE facebook_uid = ? LIMIT 1',
            [data.facebook_friend],
            function(err, results, fields){
                if(err){
                    console.log(err);
                } else {
                    if(results.length === 0){
                        that.emit('insertFacebookFriendIntoNeo4j', data);
                    } else {
                        that.emit('createRelationshipBetweenExistingUsers', {data: data, follower_node: results[0].node_id});
                    }
                }
        });
    };


    var _insertFacebookFriendIntoNeo4j = function(data){
        var that = this;

        // Insert a Node for this friend into Neo4j.
        db.InsertNode({
            facebook_uid: data.facebook_friend
        }, function(err, result){
            if(err){
                console.log(err);
            } else {
                data.follower_node = result;

                // Create a directed Relationship towards the root user. (this follower -> root user)
                db.InsertRelationship(data.follower_node.id, data.data.user_node.id, 'RELATED_TO', {}, function(err, relationship){
                    if(err){
                        console.log(err);
                    } else {
                        that.emit('insertFacebookFriendIntoMysql', data);
                    }
                });
            }
        });
    };

    var _insertFacebookFriendIntoMysql = function(data){
        var that = this;

        data.data.mysql.query(
            'INSERT INTO users SET node_id = ?, facebook_uid = ?',
            [data.follower_node.id, data.facebook_friend.id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                }
        });

    };

    // LISTENERS

    this.on('checkNetwork', _checkNetwork);
    
    this.on('checkTwitterTokens', _checkTwitterTokens);
    this.on('fetchTwitterUid', _fetchTwitterUid);
    this.on('checkIfTwitterUserIsInDB', _checkIfTwitterUserIsInDB);
    this.on('regenerateTrainshareToken', _regenerateTrainshareToken);

    this.on('upsertExistingTwitterUserInNeo4j', _upsertExistingTwitterUserInNeo4j);
    this.on('upsertExistingTwitterNodeIntoUsersTable', _upsertExistingTwitterNodeIntoUsersTable);

    this.on('insertTwitterUserIntoNeo4j', _insertTwitterUserIntoNeo4j);
    this.on('insertTwitterNodeIntoUsersTable', _insertTwitterNodeIntoUsersTable);

    this.on('fetchTwitterFollowers', _fetchTwitterFollowers);
    this.on('checkIfTwitterFollowerIsInDB', _checkIfTwitterFollowerIsInDB);
    this.on('insertTwitterFollowerIntoNeo4j', _insertTwitterFollowerIntoNeo4j);
    this.on('insertTwitterFollowerIntoMysql', _insertTwitterFollowerIntoMysql);
    this.on('createRelationshipBetweenExistingUsers', _createRelationshipBetweenExistingUsers);
    
    this.on('checkFacebookTokens', _checkFacebookTokens);
    this.on('fetchFacebookUid', _fetchFacebookUid);
    this.on('checkIfFacebookUserIsInDB', _checkIfFacebookUserIsInDB);
    this.on('insertFacebookUserIntoNeo4j', _insertFacebookUserIntoNeo4j);
    this.on('insertFacebookNodeIntoUsersTable', _insertFacebookNodeIntoUsersTable);
    this.on('fetchFacebookFollowers', _fetchFacebookFollowers);
    this.on('checkIfFacebookFriendIsInDB', _checkIfFacebookFriendIsInDB);
    this.on('insertFacebookFriendIntoNeo4j', _insertFacebookFriendIntoNeo4j);
    this.on('insertFacebookFriendIntoMysql', _insertFacebookFriendIntoMysql);


    // PRIVATE

    var _writeEntryIntoLoginrequestsTable = function(data){
        var that = this;

        data.mysql.query(
            'INSERT INTO loginrequests SET network = ?, access_token = ?, access_token_secret = ?',
            [data.request.body.network, data.request.body.access_token, data.request.body.access_token_secret],
            function(err, results, fields){
                if(err){
                    console.log(err);
                }
        });
    };

    // LISTENERS

    this.on('writeEntryIntoLoginrequestsTable', _writeEntryIntoLoginrequestsTable);



    // PRIVATE - REMOVING DUPLICATE ENTRIES

    var _fetchExistingTwitterNodeInUsersTable = function(data){
        var that = this;

        // if we're working with the full node
        // data.data.twitter_user.id_str

        // if we're working with an empty user node
        // data.twitter_follower

        var user_twitter_uid;
        var user_node_id;
        if(!data.follower_node){
            user_twitter_uid = data.data.twitter_user.id_str;
            user_node_id = data.data.user_node.id;
        } else {
            user_twitter_uid = data.twitter_follower;
            user_node_id = data.follower_node.id;
        }

        console.log(user_twitter_uid);
        console.log(user_node_id);

        data.data.mysql.query(
            'SELECT * FROM users WHERE twitter_uid = ? LIMIT 1',
            [user_twitter_uid],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.data.response.json({error: 'Internal Error'}, 500);
                } else {
                    var original_node_id = results[0].node_id;

                    console.log(results[0]);

                    // replace change relationships and delete the duplicate node.
                    that.emit('moveOutgoingRelationship', {
                        data: data.data, 
                        original_node_id: original_node_id,
                        user_twitter_uid: user_twitter_uid,
                        user_node_id: user_node_id
                    });

                }
        });
    };

    var _moveOutgoingRelationship = function(data){
        var that = this;

        // original_node-[:RELATED_TO]->root_node & duplicate_node-[:RELATED_TO]->root_node
        // -> merge to original_node-[:RELATED_TO]->root_node

        db.ReadOutgoingRelationshipsOfNode(data.user_node_id, function(err, relationships){
            if(err){
                console.log(err);
                data.data.response.json({error: 'Internal Error'}, 500);
            } else {
                if(relationships.length === 0){
                    that.emit('movePropertiesAndDeleteDuplicateNode', {
                        data: data.data,
                        original_node_id: data.original_node_id,
                        user_twitter_uid: data.user_twitter_uid,
                        user_node_id: data.user_node_id
                    });

                } else { // just copy the first relationship since more shouldn't be there.

                    // TODO -> move relationship from duplicate_node->root_node to original_node->root_node
                }

                console.log(relationships);
            }
        });

    };

    var _movePropertiesAndDeleteDuplicateNode = function(data){
        var that = this;

        // since this is the root_node there are no relationships attached to it, which we need to move.

        // read duplicate node body
        db.ReadNode(data.user_node_id, function(err, duplicate_node){
            if(err){
                console.log(err);
            } else {
                console.log(duplicate_node.data);

                // read original node body
                db.ReadNode(data.original_node_id, function(err, original_node){
                    if(err){
                        console.log(err);
                    } else {

                        console.log(original_node.data);

                        // merge the 2 bodies

                        // update original_node with new merged body

                        // delete duplicate_node
                    }
                });

            }
        });

        // delete duplicate node
        // override root node body with duplicate node body content

    };

    this.on('fetchExistingTwitterNodeInUsersTable', _fetchExistingTwitterNodeInUsersTable);
    this.on('moveOutgoingRelationship', _moveOutgoingRelationship);
    this.on('movePropertiesAndDeleteDuplicateNode', _movePropertiesAndDeleteDuplicateNode);

};

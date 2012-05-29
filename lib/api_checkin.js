var Step = require('step'),
    _ = require('../deps/underscore-min.js'),
    config = require('../config'),
    neo4j = require('node-neo4j');


// Initialize Neo4j DB
var db = new neo4j(config.neo4j.url);

module.exports = function Login(util, events){
    events.call(this);

    // PUBLIC FUNCTIONS

    this.checkin = function(data){
        if(data.request.is('json')){
            this.emit('checkTrainshareId', data);
        } else {
            data.response.json({error: 'Invalid Content-Type'}, 400);
        }
    }

    // PRIVATE FUNCTIONS

    var _checkTrainshareId = function(data){
        if(data.request.body.trainshare_id && data.request.body.trainshare_id.length === 36){
            this.emit('checkPostBody', data);
        } else {
            data.response.json({error: 'trainshare_id missing'}, 400);
        }
    };

    var _checkPostBody = function(data){

        if(data.request.body && data.request.body.trainshare_token && data.request.body.data.length > 0){
            this.emit('checkIfTrainshareTokenAndIdMatch', data);
        } else {
            data.response.json({error: 'Invalid POST body'}, 400);
        }
    };

    var _checkIfTrainshareTokenAndIdMatch = function(data){

        var that = this;

        data.mysql.query(
            'SELECT id FROM users WHERE trainshare_id = ? AND trainshare_token = ? LIMIT 1',
            [data.request.body.trainshare_id, data.request.body.trainshare_token],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    if(results.length > 0){
                        that.emit('getCoveredSubroutes', data);
                    } else {
                        data.response.json({error: 'trainshare_id and trainshare_token do not match'}, 400);
                    }
                    
                }
        });
    };

    var _getCoveredSubroutes = function(data){
        var that = this;

        Step(
            function forEachTrain(){
                var group = this.group();
                data.request.body.data.forEach(function(train){
                    getRoutesForTrain(data, train, group());
                });
            },
            function sumUp(err, results){
                if(err){
                    console.log(err);
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    that.emit('registerForSubroutes', {data: data, routes: _.compact(_.flatten(results))});
                }
            }
        );
    };

    var _registerForSubroutes = function(data){
        var that = this;

        var fetchUserMysqlId = function(){
            data.data.mysql.query(
                'SELECT id, node_id from users WHERE trainshare_id = ?',
                [data.data.request.body.trainshare_id],
                function(err, results, fields){

                    // var user_id = results[0].id;
                    var user = results[0];

                    Step(
                        function forEachRoute(){
                            var group = this.group();
                            data.routes.forEach(function(route){
                                registerRouteForUser(data, route, user.id, group());
                            });
                        },
                        function sumUp(err, results){
                            if(err){
                                console.log(err);
                                data.data.response.json({error: 'Internal Error'}, 500);
                            } else {
                                that.emit('getUsersOnTheSameRoutes', {data: data.data, routes: data.routes, user: user});
                            }
                        }
                    )
            });
        };

        fetchUserMysqlId();
    };

    var _getUsersOnTheSameRoutes = function(data){
        var that = this;

        // Fetch a set of user_ids associated to the route_id.

        var routes_or_clause = _.map(data.routes, function(value){
            return value.id;
        }).join(',');

        data.data.mysql.query(
            'SELECT routes_users.routes_id, users.trainshare_id, users.node_id FROM routes_users, users WHERE routes_users.users_id = users.id AND routes_users.routes_id IN (?) AND routes_users.users_id != ?',
            [routes_or_clause, data.user.id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    data.data.response.json({error: 'Internal Error'}, 500);
                } else {
                    // console.log(results);

                    if(results.length >= 1){
                        that.emit('isolateFriends', {data: data.data, routes: data.routes, user: data.user, overlaps: results});    
                    } else {
                        data.data.response.json([], 200); // No overlaps found so return an empty array.
                    }
                    
                }
        });
    };


    var _isolateFriends = function(data){
        var that = this;

        // run cypher query against neo4j to only return those nodes which have a relationship pointing towards the root_node
        // START user = node(1), friends = node(2,3,4,5,1234) MATCH friends-[:RELATED_TO]->user RETURN friends

        var friends_nodes = _.map(data.overlaps, function(overlap){
            return overlap.node_id;
        }).join(',');

        // console.log(data.user.node_id);
        // console.log(friends_nodes);

        db.CypherQuery("START user = node(" + data.user.node_id + "), friends = node(" + friends_nodes + ") MATCH friends-[:RELATED_TO]->user RETURN friends", function(err, result){
            if(err){
                console.log(err);
                data.data.response.json({error: 'Internal Error'}, 500);
            } else {

                // Use an object as a key-value store to later ask a true or false question when filtering through the overlaps array.
                var friendsObj = {};
                _.each(result.data, function(node){
                    friendsObj[node.id] = true;
                });

                var friends = _.filter(data.overlaps, function(overlap){
                    return friendsObj[overlap.node_id];
                });

                that.emit('formatResponse', {data: data.data, routes: data.routes, user_id: data.user_id, friends: friends});
            }
        });        
    };

    var _formatResponse = function(data){
        var that = this;

        that.emit('sendCheckinResponse', {data: data.data, routes: data.routes, user_id: data.user_id});
    };

    var _sendCheckinResponse = function(data){

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

        var dep_time = data.data.moment().minutes(3).hours(12).utc();
        var arr_time = data.data.moment(dep_time).minutes(14).hours(13).utc();

        data.data.response.json([
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

    // LISTENERS
    this.on('checkTrainshareId', _checkTrainshareId);
    this.on('checkPostBody', _checkPostBody);
    this.on('checkIfTrainshareTokenAndIdMatch', _checkIfTrainshareTokenAndIdMatch);
    this.on('getCoveredSubroutes', _getCoveredSubroutes);
    this.on('registerForSubroutes', _registerForSubroutes);
    this.on('getUsersOnTheSameRoutes', _getUsersOnTheSameRoutes);
    this.on('isolateFriends', _isolateFriends);
    this.on('formatResponse', _formatResponse);
    this.on('sendCheckinResponse', _sendCheckinResponse);



    // EXTERNAL HELPER FUNCTIONS

    var getRoutesForTrain = function(data, train_data, callback){

        var departure_time = data.moment(train_data.departure_time).utc();
        var arrival_time = data.moment(train_data.arrival_time).utc();

        data.mysql.query(
            'SELECT * FROM routes WHERE linename = ? AND dep_time >= ? AND arr_time <= ?',
            [train_data.train_id, departure_time.format("HH:mm"), arrival_time.format("HH:mm")],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    callback(err, null);
                } else {
                    if(results.length > 0){
                        callback(null, results);
                    } else {
                        callback(null, null);
                    }
                }
        });
    };

    var registerRouteForUser = function(data, route, user_id, callback){

        data.data.mysql.query(
            'INSERT INTO routes_users SET routes_id = ?, users_id = ?',
            [route.id, user_id],
            function(err, results, fields){
                if(err){
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, true);
                }
        });
    };

    ////////// STEPS //////////

    // 1. check request body
    // 2. get subroutes which are covered by the POST body
    // 3. insert entries for each of those subroutes
    // 4. foreach subroutes get people taking the same ride
    // 5. foreach person found check against neo4j if they know each other

};






var Step = require('step'),
    _ = require('../deps/underscore-min.js');

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
        if(data.request.query['trainshare_id'] && data.request.query['trainshare_id'].length === 36){
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
            [data.request.query['trainshare_id'], data.request.body.trainshare_token],
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
                    data.response.json({error: 'Internal Error'}, 500);
                } else {
                    that.emit('registerForSubroutes', {data: data, routes: _.flatten(results)});
                }
            }
        );
    };

    var _registerForSubroutes = function(data){
        var that = this;

        var fetchUserMysqlId = function(){
            data.data.mysql.query(
                'SELECT id from users WHERE trainshare_id = ?',
                [data.data.request.query['trainshare_id']],
                function(err, results, fields){

                    var user_id = results[0].id;

                    Step(
                        function forEachRoute(){
                            var group = this.group();
                            data.routes.forEach(function(route){
                                registerRouteForUser(data, route, user_id, group());
                            });
                        },
                        function sumUp(err, results){
                            if(err){
                                data.response.json({error: 'Internal Error'}, 500);
                            } else {
                                that.emit('sendCheckinResponse', {data: data.data, routes: data.routes, user_id: user_id});
                            }
                        }
                    )
            });
        };

        fetchUserMysqlId();
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






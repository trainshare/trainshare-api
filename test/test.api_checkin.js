var should = require('should'),
    request = require('superagent'),
    request_original = require('request');

var api_url = 'http://localhost:5000/v1/checkin';

describe('=> Testing the /checkin API endpoint', function(){
    describe('-> Making an empty request', function(){

        it('should return an error with Content-Type=x-www-form-urlencoded', function(done){
            request.post(api_url)
                .type('form')
                .send({})
                .end(function(result){
                    result.body.error.should.equal('Invalid Content-Type');
                    result.statusCode.should.equal(400);
                    done();
                });
        });

        it('should return an error by not sending a trainshare_id', function(done){
            request
                .post(api_url)
                .send({})
                .end(function(result){
                    result.body.error.should.equal('trainshare_id missing');
                    result.statusCode.should.equal(400);
                    done();
                });
        });

        it('should return an error by sending an empty POST body', function(done){
            request
                .post(api_url)
                .send({trainshare_id: '499fee3c-4a00-4382-bbc4-9b3fc0a49e04'})
                .end(function(result){
                    result.body.error.should.equal('Invalid POST body');
                    result.statusCode.should.equal(400);
                    done();
                });
        });
    });
    
    
    // Creating real users.
    var user1_trainshare_id = null;
    var user1_trainshare_token = null;

    var user2_trainshare_id = null;
    var user2_trainshare_token = null;

    before(function(done){
        request.post('http://localhost:5000/v1/login')
            .send({
               network: 'twitter',
                access_token: '6848912-Pbfyb6IKViwL5dSvkEbUKFGeCX1HKxayRftnO7v14c',
                access_token_secret: 'WtATrHj9UHPTsad4J1QyAVjffErMTyctPiyxk6KpvYE' 
            })
            .end(function(res){
                user1_trainshare_id = res.body.trainshare_id;
                user1_trainshare_token = res.body.trainshare_token;

                request.post('http://localhost:5000/v1/login')
                    .send({
                       network: 'twitter',
                        access_token: '333949978-OoDPh35UnmZvUxJ8q8MSDdamvfaPDksk42TT8BPI',
                        access_token_secret: 'vAzq9qqDzKG3AagVrWK7lMdiGbBBJRdMi2cRilKk' 
                    })
                    .end(function(res){
                        user2_trainshare_id = res.body.trainshare_id;
                        user2_trainshare_token = res.body.trainshare_token;
                        done();
                    });
            });
    });

    describe('-> Make a request with an outdated trainshare_token', function(){
        it('should return an error message', function(done){
            request
                .post(api_url)
                .send({
                    trainshare_id: user1_trainshare_id,
                    trainshare_token: '499fee3c-4a00-4382-bbc4-9b3fc0aa9e04',
                    data: [{
                        departure_station: 'Bern',
                        departure_time: '2012-04-09T16:34:00+00:00',
                        arrival_station: 'Basel SBB',
                        arrival_time: '2012-04-09T17:29:00+00:00',
                        train_id: 'IC 1080'
                    }]
                })
                .end(function(result){
                    result.statusCode.should.equal(400);
                    result.body.error.should.equal('trainshare_id and trainshare_token do not match');
                    done();
                });
        });
    });

    describe('-> Make a request with a valid POST body', function(){
        it('should return a valid response with only sending an array of 1', function(done){
            request
                .post(api_url)
                .send({
                    trainshare_id: user1_trainshare_id,
                    trainshare_token: user1_trainshare_token,
                    data: [{
                        departure_station: 'Bern',
                        departure_time: '2012-04-09T16:34:00+00:00',
                        arrival_station: 'Basel SBB',
                        arrival_time: '2012-04-09T17:29:00+00:00',
                        train_id: 'IC 1080'
                    }]
                })
                .end(function(result){
                    result.statusCode.should.equal(200);
                    done();
                });
        });

        it('should return a valid response with only sending an array of 1 with UTF-8 characters', function(done){

            request_original.post({
                url: api_url,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trainshare_id: user2_trainshare_id,
                    trainshare_token: user2_trainshare_token,
                    data: [{
                        departure_station: 'Zürich HB',
                        departure_time: '2012-05-04T10:04:00+00:00',
                        arrival_station: 'Genève-Aéroport',
                        arrival_time: '2012-05-04T12:56:00+00:00',
                        train_id: 'ICN 518'
                    }]
                })
            }, function(err, response, body){
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return a valid response with only sending an array of 2', function(done){

            request_original.post({
                url: api_url,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trainshare_id: user1_trainshare_id,
                    trainshare_token: user1_trainshare_token,
                    data: [{
                        departure_station: 'Siebnen-Wangen',
                        departure_time: '2012-05-04T09:03:00+00:00',
                        arrival_station: 'Zürich HB',
                        arrival_time: '2012-05-04T09:50:00+00:00',
                        train_id: 'S2 18234'
                    }, {
                        departure_station: 'Zürich HB',
                        departure_time: '2012-05-04T10:04:00+00:00',
                        arrival_station: 'Genève-Aéroport',
                        arrival_time: '2012-05-04T12:56:00+00:00',
                        train_id: 'ICN 518'
                    }]
                })
            }, function(err, response, body){
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return a valid response with having someone else signed up before', function(done){

            request_original.post({
                url: api_url,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trainshare_id: user2_trainshare_id,
                    trainshare_token: user2_trainshare_token,
                    data: [{
                        departure_station: 'Siebnen-Wangen',
                        departure_time: '2012-05-04T09:03:00+00:00',
                        arrival_station: 'Zürich HB',
                        arrival_time: '2012-05-04T09:50:00+00:00',
                        train_id: 'S2 18234'
                    }, {
                        departure_station: 'Zürich HB',
                        departure_time: '2012-05-04T10:04:00+00:00',
                        arrival_station: 'Genève-Aéroport',
                        arrival_time: '2012-05-04T12:56:00+00:00',
                        train_id: 'ICN 518'
                    }]
                })
            }, function(err, response, body){
                response.statusCode.should.equal(200);
                done();
            });
        });
    });
});
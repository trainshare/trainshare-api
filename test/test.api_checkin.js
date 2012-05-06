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
                        access_token: '333949978-eFDeye3eOIo29R0wRCHvatGn4RjcKc675ljPpQdw',
                        access_token_secret: 'az2AmimLdggQo6rrGeAAFVVi41LjOR1LDjoCw5kNkY' 
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
    });
});

// describe('=> Testing the /login API endpoint', function(){
   
//     describe('-> Making an empty request', function(){
//         it('should return an error with Content-Type=x-www-form-urlencoded', function(done){
//             request.post(api_url + '/login')
//                 .type('form')
//                 .send({})
//                 .end(function(res){
//                     res.body.error.should.equal('Invalid Content-Type');
//                     res.statusCode.should.equal(400);
//                     done();
//                 });
//         });
      
//         it('should return an error with an empty POST body', function(done){
//             request.post(api_url + '/login')
//                 .send({})
//                 .end(function(res){
//                     res.body.error.should.equal('No network given');
//                     res.statusCode.should.equal(400);
//                     done();
//                 });
//         });
//     });
   
//     describe('-> Making requests with data', function(){
//         it('should return an error with network not defined', function(done){
//             request.post(api_url + '/login')
//                 .send({network:''})
//                 .end(function(res){
//                     res.body.error.should.equal('No network given');
//                     res.statusCode.should.equal(400);
//                     done();
//                 });
//         });

//         it('should return an error with an unsupported network defined', function(done){
//             request.post(api_url + '/login')
//                 .send({network: 'foobar'})
//                 .end(function(res){
//                     res.body.error.should.equal('No network given');
//                     res.statusCode.should.equal(400);
//                     done();
//                 });
//         });

//         it('should return an error by not sending token and token_secret', function(done){
//             request.post(api_url + '/login')
//                 .send({network: 'facebook'})
//                 .end(function(res){
//                     res.body.error.should.equal('No authentication tokens given');
//                     res.statusCode.should.equal(400);
//                     done();
//                 });
//         });

//         it('should return a correct response', function(done){
//             request.post(api_url + '/login')
//                 .send({
//                     network: 'twitter',
//                     access_token: '6848912-Pbfyb6IKViwL5dSvkEbUKFGeCX1HKxayRftnO7v14c',
//                     access_token_secret: 'WtATrHj9UHPTsad4J1QyAVjffErMTyctPiyxk6KpvYE'
//                 })
//                 .end(function(res){
//                     res.statusCode.should.equal(200);
//                     res.body.trainshare_id.length.should.equal(36);
//                     done();
//                 });
//         });
//     });
    
// });
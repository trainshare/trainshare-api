var should = require('should'),
    request = require('superagent');

var api_url = 'http://localhost:3000/v1/checkin';

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
                .post(api_url + '?trainshare_id=499fee3c-4a00-4382-bbc4-9b3fc0a49e04')
                .send({})
                .end(function(result){
                    result.body.error.should.equal('Invalid POST body');
                    result.statusCode.should.equal(400);
                    done();
                });
        });
    });

    describe('-> Make a request with a valid POST body', function(){
        it('should return a valid response with only sending an array of 1', function(done){
            request
                .post(api_url + '?trainshare_id=499fee3c-4a00-4382-bbc4-9b3fc0a49e04')
                .send([{
                    departure_station: 'Bern',
                    departure_time: '2012-04-09T16:34:00+00:00',
                    arrival_station: 'Basel SBB',
                    arrival_time: '2012-04-09T17:29:00+00:00',
                    train_id: 'IC 1080'
                }])
                .end(function(result){
                    result.statusCode.should.equal(200);
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
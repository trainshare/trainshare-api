var should = require('should'),
    request = require('superagent');

var api_url = 'http://localhost:5000/v1';

describe('=> Testing the /login API endpoint', function(){
   
    describe('-> Making an empty request', function(){
        it('should return an error with Content-Type=x-www-form-urlencoded', function(done){
            request.post(api_url + '/login')
                .type('form')
                .send({})
                .end(function(res){
                    res.body.error.should.equal('Invalid Content-Type');
                    res.statusCode.should.equal(400);
                    done();
                });
        });
      
        it('should return an error with an empty POST body', function(done){
            request.post(api_url + '/login')
                .send({})
                .end(function(res){
                    res.body.error.should.equal('No network given');
                    res.statusCode.should.equal(400);
                    done();
                });
        });
    });
   
    describe('-> Making requests with data', function(){
        it('should return an error with network not defined', function(done){
            request.post(api_url + '/login')
                .send({network:''})
                .end(function(res){
                    res.body.error.should.equal('No network given');
                    res.statusCode.should.equal(400);
                    done();
                });
        });

        it('should return an error with an unsupported network defined', function(done){
            request.post(api_url + '/login')
                .send({network: 'foobar'})
                .end(function(res){
                    res.body.error.should.equal('No network given');
                    res.statusCode.should.equal(400);
                    done();
                });
        });

        it('should return an error by not sending token and token_secret', function(done){
            request.post(api_url + '/login')
                .send({network: 'facebook'})
                .end(function(res){
                    res.body.error.should.equal('No authentication tokens given');
                    res.statusCode.should.equal(400);
                    done();
                });
        });

        it('should return a correct response with twitter', function(done){
            request.post(api_url + '/login')
                .send({
                    network: 'twitter',
                    access_token: '6848912-Pbfyb6IKViwL5dSvkEbUKFGeCX1HKxayRftnO7v14c',
                    access_token_secret: 'WtATrHj9UHPTsad4J1QyAVjffErMTyctPiyxk6KpvYE'
                })
                .end(function(res){
                    res.statusCode.should.equal(200);
                    res.body.trainshare_id.length.should.equal(36);
                    res.body.trainshare_token.length.should.equal(36);
                    done();
                });
        });

        it('should return a correct response with twitter with a different user', function(done){
            request.post(api_url + '/login')
                .send({
                    network: 'twitter',
                    access_token: '333949978-OoDPh35UnmZvUxJ8q8MSDdamvfaPDksk42TT8BPI',
                    access_token_secret: 'vAzq9qqDzKG3AagVrWK7lMdiGbBBJRdMi2cRilKk'
                })
                .end(function(res){
                    res.statusCode.should.equal(200);
                    res.body.trainshare_id.length.should.equal(36);
                    res.body.trainshare_token.length.should.equal(36);
                    done();
                });
        });

        it('should return an error message with a wrong or outdated facebook access_token', function(done){
            request.post(api_url + '/login')
                .send({
                    network: 'facebook',
                    access_token: 'foobar'
                })
                .end(function(res){
                    res.statusCode.should.equal(400);
                    res.body.error.should.equal('Invalid response from Facebook');
                    done();
                });
        });

        // it('should return a correct response with facebook', function(done){
        //     request.post(api_url + '/login')
        //         .send({
        //             network: 'facebook',
        //             access_token: 'AAABhY12QxPUBAODuPZAJCeCDYHH59jXtXB2AXLrOK5syZBVGiuyqDkx0BzFhqE0CsNFZCXr1yimM4pQ5xJlZBKsuauG3xEfbHPLD53aROAZDZD'
        //         })
        //         .end(function(res){
        //             res.statusCode.should.equal(200);
        //             res.body.trainshare_id.length.should.equal(36);
        //             res.body.trainshare_token.length.should.equal(36);
        //             done();
        //         });
        // });
    });
    
});
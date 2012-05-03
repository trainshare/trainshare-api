var should = require('should'),
    request = require('superagent');

var root_url = 'http://localhost:5000';

describe('=> Website', function(){
    describe('-> Make root request', function(){
        it('should return an statusCode 200', function(done){
            request
                .get(root_url)
                .end(function(result){
                    result.statusCode.should.equal(200);
                    done();
                });
        });
    });
});
var should = require('should'),
    request = require('superagent');

var api_url = 'http://localhost:3000';

describe('Testing the /login API endpoint', function(){
   
   describe('Making an empty request', function(){
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
   
   // describe('Making incomplete requests', function(){
   //    it('should return an error with ') 
   // });
   
   // describe('Posting a network without tokens', function(){
   //    it('should return an error', function(done){
   //        
   //    });
   // });
    
});
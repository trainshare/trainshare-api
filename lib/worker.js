var api_read = require('./api_read'),
    api_checkin = require('./api_checkin'),
    api_login = require('./api_login');

module.exports = function Worker(events){
    events.call(this);

    this.api_login = function(data){
        // do some checking if request is valid.

        // fetch users twitter_id -> generate trainshare_id -> response

        // fetch users twitter followers -> insert into neo4j and mysql

        api_login(data.request, data.response, data.mysql, data.moment);
    };

    this.api_checkin = function(data){
        api_checkin(data.request, data.response, data.mysql, data.moment);
    };

    this.api_read = function(data){
        api_read(data.request, data.response, data.mysql, data.moment);
    };

    // this.insert = function(item){
    //     this.emit('fetchTwitterFollowers', item);
    // };

    // var _fetchTwitterFollowers = function(item){
    //     setTimeout(function(){
    //         console.log(item);
    //     }, 4000);
    // };

    // // Create listeners
    // this.on('fetchTwitterFollowers', _fetchTwitterFollowers);
};
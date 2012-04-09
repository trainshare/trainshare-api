var api_read = require('./api_read'),
    api_checkin = require('./api_checkin'),
    Api_login = require('./api_login');

module.exports = function Worker(util, events){
    events.call(this);

    this.api_login;

    // PUBLIC FUNCTIONS

    this.init = function(){
        util.inherits(Api_login, events);
        this.api_login = new Api_login(util, events);
    };

    this.login = function(data){
        this.emit('worker_login', data);
    };

    this.checkin = function(data){
        api_checkin(data.request, data.response, data.mysql, data.moment);
    };

    this.read = function(data){
        api_read(data.request, data.response, data.mysql, data.moment);
    };


    // PRIVATE FUNCTIONS

    var _login = function(data){
        this.api_login.login(data);
    };


    // LISTENERS
    
    this.on('worker_login', _login);
};
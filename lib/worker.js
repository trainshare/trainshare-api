var api_read = require('./api_read'),
    api_checkin = require('./api_checkin'),
    Api_login = require('./api_login'),
    Api_checkin = require('./api_checkin');

module.exports = function Worker(util, events){
    events.call(this);

    this.api_login;
    this.api_checkin;

    // PUBLIC FUNCTIONS

    this.init = function(){
        util.inherits(Api_login, events);
        util.inherits(Api_checkin, events);
        this.api_login = new Api_login(util, events);
        this.api_checkin = new Api_checkin(util, events);
    };

    this.login = function(data){
        this.emit('worker_login', data);
    };

    this.checkin = function(data){
        this.emit('worker_checkin', data);
        // api_checkin(data.request, data.response, data.mysql, data.moment);
    };

    this.read = function(data){
        api_read(data.request, data.response, data.mysql, data.moment);
    };


    // PRIVATE FUNCTIONS

    var _login = function(data){
        this.api_login.login(data);
    };

    var _checkin = function(data){
        this.api_checkin.checkin(data);
    };

    // LISTENERS
    
    this.on('worker_login', _login);
    this.on('worker_checkin', _checkin);
};
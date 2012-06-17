/* 
 * trainsharingApp - 2012
 *
 */ 



/* LOAD LIBRARIES ---------- */

var express = require('express'),
    mysql = require('mysql'),
    moment = require('moment'),
    util = require('util'),
    events = require('events').EventEmitter,
    Worker = require('./lib/worker'),
    config = require('./config');

// Initialize EventEmitter based Worker
util.inherits(Worker, events);
var worker = new Worker(util, events);
worker.init();


// Start Webserver & API
var app = express.createServer();

// Configure Express
app.configure(function(){
   app.use(express.bodyParser()); 
});

// Instantiate MySQL client
var client = mysql.createClient({
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
    host: config.mysql.host
});

/* MAKE SURE ALL THE TABLES ARE THERE ----------- */

// routes
client.query(
    'SHOW TABLES LIKE "routes"',
    function(err, results, fields){
        if(results.length > 0){
            console.log('table "routes" exists. ok.');
        }else if(err){
            console.log(err);
        }else{
            throw new Error('table "routes" does not exist.');
        }
    });

// users
client.query(
    'SHOW TABLES LIKE "users"',
    function(err, results, fields){
        if(results.length > 0){
            console.log('table "users" exists. ok.');
        }else if(err){
            console.log(err);
        }else{
            throw new Error('table "users" does not exist.');
        }
    });

// routes_users
client.query(
    'SHOW TABLES LIKE "users"',
    function(err, results, fields){
        if(results.length > 0){
            console.log('table "users" exists. ok.');
        }else if(err){
            console.log(err);
        }else{
            throw new Error('table "users" does not exist.');
        }
    });


/* ROUTES ------------- */
app.get('/', function(req, res){    
    res.sendfile('static/index.html');
});

app.get('/mysql_test', function(req, res){
    client.query(
        'SELECT * FROM routes limit 10',
        function(err, results, fields){
            if(err){
                console.log('an error occurred');
            }
            res.send(results);
        }
    );
});

app.post('/v1/login', function(req, res){
    worker.login({
        request: req,
        response: res,
        mysql: client,
        moment: moment
    });
});

app.post('/v1/checkin', function(req, res){
    worker.checkin({
        request: req,
        response: res,
        mysql: client,
        moment: moment
    });
});

app.post('/v1/read', function(req, res){
    worker.read({
        request: req,
        response: res,
        mysql: client,
        moment: moment
    });
});

app.get('/:file', function(req, res){
    console.log(req.params.file);
    res.sendfile('static/' + req.params.file);
});

app.listen(process.env.PORT || 5000);
console.log('trainsharing server running on %s:%d.', app.address().address, app.address().port);

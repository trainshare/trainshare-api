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
    Worker = require('./lib/worker');

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
    user: process.env.MYSQL_USER ? process.env.MYSQL_USER : 'root',
    password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : '',
    database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : 'trainsharing',
    port: process.env.MYSQL_PORT ? process.env.MYSQL_PORT : 3306,
    host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST : 'localhost'
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

// routes_users
client.query(
    'CREATE TABLE routes_users (id INT NOT NULL AUTO_INCREMENT, routes_id INT NOT NULL, users_id INT NOT NULL, PRIMARY KEY (id))',
    function(err, results, fields){
        if(err && err.number === 1050){ // MySQL: ER_TABLE_EXISTS_ERROR
            console.log('table "routes_users" already exists. ok.');
        }else if(null === err){
            console.log('table "routes_users" created.');
        }else{
            console.log(err);
        }                
    });

// users -> needed to store Neo4j Node ID and unique identifier for network.
client.query(
    'CREATE TABLE users (id INT NOT NULL AUTO_INCREMENT, node_id INT NOT NULL, facebook_uid VARCHAR(40) NULL, twitter_uid VARCHAR(40) NULL, trainshare_id VARCHAR(40) NULL, trainshare_token VARCHAR(40) NULL, PRIMARY KEY (id))',
    function(err, results, fields){
        if(err && err.number === 1050) { // MySQL: ER_TABLE_EXISTS_ERROR
            console.log('table "users" already exists. ok.');
        } else if(null === err) {
            console.log('table "users" created.');
        } else {
            console.log(err);
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

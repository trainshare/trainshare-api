/* 
 * trainsharingApp - 2012
 *
 */ 



/* LOAD LIBRARIES ---------- */

var express = require('express'),
    mysql = require('mysql'),
    api_login = require('./lib/api_login');

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

// routes_users
client.query(
    'CREATE TABLE routes_users (id INT NOT NULL, routes_id INT NOT NULL, users_id INT NOT NULL, PRIMARY KEY (id))',
    function(err, results, fields){
        if(err && typeof err.message !== 'undefined' && err.message !== "Table \'routes_users\' already exists"){
            console.log(err);
        } else {
            console.log('creating routes_users table if necessary');
        }
    });

// users -> needed to store Neo4j Node ID and unique identifier for network.
client.query(
    'CREATE TABLE users (id INT NOT NULL, node_id INT NOT NULL, facebook_uid VARCHAR(40) NOT NULL, PRIMARY KEY (id))',
    function(err, results, fields){
        if(err && typeof err.message !== 'undefined' && err.message !== "Table \'users\' already exists"){
            console.log(err);
        } else {
            console.log('creating users table if necessary');
        }
    });


/* ROUTES ------------- */
app.get('/', function(req, res){    
    res.send('trainsharingApp Server says hi.');
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

app.post('/v1/login', api_login);

app.listen(process.env.PORT || 3000);
console.log('trainsharing server running.');
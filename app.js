/* 
 * trainsharingApp - 2012
 *
 */ 



/* LOAD LIBRARIES ---------- */

var express = require('express'),
    mysql = require('mysql'),
    neo4j = require('neo4j'),
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
client.query(
    'CREATE TABLE routes_users (id INT NOT NULL, routes_id INT NOT NULL, users_id INT NOT NULL, PRIMARY KEY (id))',
    function(err, results, fields){
        if(err && typeof err.message !== 'undefined' && err.message !== "Table \'routes_users\' already exists"){
            console.log(err);
        } else {
            console.log('creating routes_users table if necessary');
        }
    });


// Initialize Neo4j DB
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || "http://localhost:7474");

/* ROUTES ------------- */
app.get('/', function(req, res){

    // db.getNodeById(0, function(err, result){
    //     if(err) throw err;
        
    //     result.incoming('RELATED_TO', function(err, result){
    //         if(err) throw err;
    //         // console.log(result);
    //         console.log(result.length);
    //         res.send(result);
    //     });
    // });
    
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

app.post('/login', api_login);

app.listen(process.env.PORT || 3000);
console.log('trainsharing server running.');
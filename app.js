/* 
 * trainsharingApp - 2012
 *
 */ 



/* LOAD LIBRARIES ---------- */

var express = require('express'),
    mysql = require('mysql'),
    config = require('./config'),
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
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
    host: config.mysql.host    
});

// Initialize Neo4j DB
var db = new neo4j.GraphDatabase('http://localhost:7474');

/* ROUTES ------------- */
app.get('/', function(req, res){

    // client.query(
    //     'SELECT * FROM routes limit 10',
    //     function(err, results, fields){
    //         if(err){
    //             console.log('an error occured');
    //             throw err;
    //         }
    //         console.log(results);
    //         res.send(results);
    //     }
    // );

    // db.getNodeById(0, function(err, result){
    //     if(err) throw err;
    //     
    //     result.incoming('RELATED_TO', function(err, result){
    //         if(err) throw err;
    //         // console.log(result);
    //         console.log(result.length);
    //         res.send(result);
    //     });
    // });
    
    res.send('trainsharingApp Server says hi.');
});

app.post('/login', api_login);

app.listen(3000);
console.log('trainsharing server running.');
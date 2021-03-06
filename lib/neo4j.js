var neo4j = require('node-neo4j');

// Initialize Neo4j DB
var db = new neo4j(process.env.NEO4J_URL || "http://localhost:7474");


/* Given a ME_Node and a list of friends, it'll update/insert nodes for each friend. ----------------- */

module.exports.UpsertList = function(network, root_node_id, list_of_users, callback){

	// var that = this;
    
	// that.InsertUserNode(root_node_id, function(err, me_node){
	// 	if(err){
	// 		callback(err, null);
	// 	} else {
	// 		Step(
	// 			function createNodes(){
	// 				var group = this.group();
	// 				list_of_users.forEach(function(user_in_list){
	// 					that.InsertUserNode(user_in_list, group());
	// 				});
	// 			},
	// 			function createRelationships(err, friends_nodes){
	// 				if(err){
	// 					throw err;
	// 				} else {

	// 					var group = this.group();
	// 					friends_nodes.forEach(function(friend_node){
	// 						me_node.createRelationshipTo(friend_node, 'RELATED_TO', {}, group());
	// 					});
	// 				}
	// 			},
	// 			function last(err, results){
	// 				callback(err, results);
	// 			}
	// 		)
	// 	}
	// });
};

/* Inserts or Updates a list of users into Neo4j and the MySQL DB */

module.exports.UpsertListWithRoot = function(network, root_node, list_of_users, mysql, callback){
    var that = this;
    
    console.log(list_of_users);

    callback(null, null);

    // check for each user if it is already within the mysql db
    // -> if user already within the mysql db -> just add a relationship
    // -> if user is not in DB -> create a node and a relationship



    // Step(
    //     function createNodes(){
    //         var group = this.group();
    //         list_of_users.forEach(function(user_in_list){
    //            that.InsertUserNode(user_in_list, group()); 
    //         });
    //     },
    //     // function createRelationships(err, friends_nodes){
    //     //     if(err){
    //     //         throw err;
    //     //     } else {
    //     //         var group = this.group();
    //     //         friends_nodes.forEach(function(friend_node){
    //     //             root_node.createRelationshipTo(friend_node, 'RELATED_TO', {}, group());
    //     //         });
    //     //     }
    //     // },
    //     function last(err, results){
    //         callback(err, results);
    //     }
    // )
};

module.exports.UpsertUserWithRoot = function(network, root_node, user_to_insert, mysql, callback){
    var that = this;

    // check if user is already in the DB.
    mysql.query(
        'SELECT node_id FROM users WHERE ' + network + '_uid = ? LIMIT 1',
        [user_to_insert.id_str],
        function(err, user_in_mysql, fields){

        }
    );

    // mysql.query(
    //     'INSERT INTO users SET node_id = ?, twitter_uid = ?, trainsharing_uid = ?',
    //     [node_result.id, twitter_data.id_str, trainsharingID],
    //     function(err, insert_results, fields){
    //         if(err){
    //             console.log(err);
    //             res.json(err, 500);
    //         } else {
                
    //             // return the trainsharingID to the client app.
    //             // res.json({trainsharingID: trainsharingID}, 200);

    //             // continue with fetching friends and upserting them into neo4j.
    //             fetch_twitter_friends(req, res, twit, data.str_id, user_node, trainsharingID, mysql);
    //         }
    //     }
    // );
};

/* Inserts a User Node, returns the Node object */

module.exports.InsertUserNode = function(user, callback){

  db.InsertNode(user, callback);

	// based on the data given, check first if the user is already somewhere, if true merge with that user.
	// if false create a new UserNode.
    
    // if user node with that id already exists, don't insert it.
    // if(typeof user !== 'undefined' && typeof user.node_id !== 'undefined'){
    //     db.getNodeById(user.node_id, function(err, result){
    //         console.log(err);
    //         console.log(result);
    //         callback(null, result);
    //     });
    // } else {
        
 //    var node = db.createNode(user);
	// try{
	// 	node.save(function(){
	// 		callback(null, node);
	// 	});
	// } catch (err){
	// 	callback(new Error("Node couldn't be saved"), null);
	// }

};

module.exports.InsertSampleNode = function(name, callback){

    db.InsertNode({name: name}, callback);
    
};


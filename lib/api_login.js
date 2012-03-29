module.exports = function(req, res){
    if(req.is('json')){
        check_network(req, res);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }  
};

var check_network = function(req, res){
    // check if network is given
    if(typeof req.body !== 'undefined' && typeof req.body.network !== 'undefined'){
        
        // check if network is valid & supported -> facebook only for now.
        if(req.body.network === 'facebook'){
            check_tokens(req, res);
        } else {
            
        }
    } else {
        res.json({error: 'No network given'}, 400);
    }
};

var check_tokens = function(req, res){
    
};

// Check if network and tokens are given

// Fetch friends list from network

// Insert friends list into Neo4j
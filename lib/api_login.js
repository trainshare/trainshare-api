module.exports = function(req, res){
    if(req.is('json')){
        check_network(req, res);
    } else {
        res.json({error: 'Invalid Content-Type'}, 400);
    }  
};

var check_network = function(req, res){
    // check if network is given
    if(typeof req.body !== 'undefined' && typeof req.body.network !== 'undefined' && req.body.network !== ''){

        // check if network is valid & supported -> facebook only for now.
        if(req.body.network === 'facebook'){
            check_tokens(req, res);
        } else {
            res.json({error: 'No network given'}, 400);
        }

    } else {
        res.json({error: 'No network given'}, 400);
    }
};

var check_tokens = function(req, res){
    if(typeof req.body.token !== 'undefined' && typeof req.body.token_secret !== 'undefined' &&
        req.body.token !== '' && req.body.token_secret !== ''){



    } else {
        res.json({error: 'No authentication tokens given'}, 400);
    }
};

// Check if network and tokens are given

// Fetch friends list from network

// Insert friends list into Neo4j
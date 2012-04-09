module.exports = function(req, res, mysql){
    // check if trainshare_id querystring is present

    if(typeof req.query['trainshare_id'] !== 'undefined' && req.query['trainshare_id'].length === 36){
        send_friends(req, res, mysql);
    } else {
        res.json({error: 'trainshare_id missing'}, 400);
    }    
};

var send_friends = function(req, res, mysql){
    res.json([
            {
                name: 'Darth Vader', // prefer twitter over facebook
                trainshare_id: '5eedcdfb-db12-4abd-a46f-694361f3cbb6',
                position: 4, // 0 -> 10
                upper: false, 
                message: 'a message', // 120
                image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png', // -> just from one network
                overlaps: {
                    time: "2:23",
                    departure_time: "12:03",
                    departure_station: "Bern",
                    arrival_time: "13:14",
                    arrival_station: "Basel SBB"
                }
            },
            {
                name: 'Yöda', 
                trainshare_id: '5eedcdfb-db12-4abd-a46f-694361f3cbb5',
                position: 9, 
                upper: true, 
                message: 'a message', 
                image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_biger.png',
                overlaps: {
                    time: "12:23",
                    departure_time: "12:03",
                    departure_station: "Bern",
                    arrival_time: "13:14",
                    arrival_station: "Basel SBB"
                }
            }
        ], 200);
};
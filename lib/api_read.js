module.exports = function(req, res, mysql, moment){
    // check if trainshare_id querystring is present

    if(typeof req.query['trainshare_id'] !== 'undefined' && req.query['trainshare_id'].length === 36){
        send_friends(req, res, mysql, moment);
    } else {
        res.json({error: 'trainshare_id missing'}, 400);
    }    
};

var send_friends = function(req, res, mysql, moment){

    var dep_time = moment().minutes(3).hours(12).utc();
    var arr_time = moment(dep_time).minutes(14).hours(13).utc();

    res.json([
            {
                name: 'Darth Vader', // prefer twitter over facebook
                trainshare_id: '5eedcdfb-db12-4abd-a46f-694361f3cbb6',
                position: 4, // 0 -> 10
                upper: false, 
                message: 'a message', // 120
                image_url: 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png', // -> just from one network
                overlaps: {
                    departure_time: dep_time.format(),
                    departure_station: "Bern",
                    arrival_time: arr_time.format(),
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
                    departure_time: dep_time.format(),
                    departure_station: "Bern",
                    arrival_time: arr_time.format(),
                    arrival_station: "Basel SBB"
                }
            }
        ], 200);
};
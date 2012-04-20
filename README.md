# Trainshare

An API for the trainshare apps which will connect you with your friends traveling by train.

## Setup (OSX) - For running the API

Since OSX has no real packet manager go ahead and [install Homebrew](https://github.com/mxcl/homebrew/wiki/installation).

Then go ahead and install Neo4j aswell as MySQL.

    $ brew install neo4j
    $ brew install mysql
    
Import the [database dump](http://philippkueng.ch/files/trainsharing_routes.sql) used to make the matches into your MySQL Database.

Now, if you haven't installed Node.js yet go ahead and follow the steps below.

    $ git clone git://github.com/joyent/node.git
    $ cd node/
    $ git checkout v0.6.12 (or latest stable release at that time)
    $ ./configure
    $ sudo make
    $ sudo make install

As a final step clone this repo and install the npm dependencies.

    $ git clone git://github.com/philippkueng/trainsharingApp.git
    $ cd trainsharingApp/
    $ npm install
  
And run it.

    $ node app.js
    
## API documentation

### /login

Send over the social network tokens to trainshare.ch so we can fetch the users friends for later matching. It'll return a unique trainshare_id and a secret trainshare_token for each user.

Request

    curl -X POST
         -d '{"network":"twitter","access_token":"your token","access_token_secret":"your secret token"}'
         -H "Content-Type:application/json"
         https://trainshare.herokuapp.com/v1/login
         
Response
    
    {"trainshare_id":"6b34bf17-da69-4593-b7c9-7d0dc9e6947d", "trainshare_token": "6b3asf17-da69-4593-b7c9-7d0dc9e6947d"}
    
### /checkin

Checkin to a train ride by sending details about the departure and arrival station aswell as the train_id for each train used during the ride. 

`Time/Date` is formatted according to ISO-8601 taking the swiss timezone (GMT+1 or in summer GMT+2) as a basis (+00:00).

Request

    curl -X POST
         -d '[{"departure_station":"Bern","departure_time":"2012-04-09T16:34:00+00:00","arrival_station":"Basel SBB","arrival_time":"2012-04-09T17:29:00+00:00","train_id":"IC 1080"}]'
         -H "Content-Type:application/json"
         http://trainshare.ch/v1/checkin?trainshare_id=6b34bf17-da69-4593-b7c9-7d0dc9e6947d
         
Response

    [{
        "name":"Darth Vader",
        "trainshare_id":"5eedcdfb-db12-4abd-a46f-694361f3cbb6",
        "position":4, // range from 0 to 10
        "upper":false,
        "message":"a message", // 120 characters max
        "image_url":"https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png",
        "overlaps":{
            "departure_time":"2012-04-09T10:03:34+00:00",
            "departure_station":"Bern",
            "arrival_time":"2012-04-09T11:14:34+00:00",
            "arrival_station":"Basel SBB"
        }
    },{
        "name":"Yöda",
        "trainshare_id":"5eedcdfb-db12-4abd-a46f-694361f3cbb5",
        "position":9,
        "upper":true,
        "message":"a message",
        "image_url":"https://si0.twimg.com/sticky/default_profile_images/default_profile_3_biger.png",
        "overlaps":{
            "departure_time":"2012-04-09T10:03:34+00:00",
            "departure_station":"Bern",
            "arrival_time":"2012-04-09T11:14:34+00:00",
            "arrival_station":"Basel SBB"
        }
    }]
         
### /read

After checkin the /read endpoint can be used to check wether new friends have checked in. Will return the same response as the /checkin.

`Time/Date` is formatted according to ISO-8601 taking the swiss timezone (GMT+1 or in summer GMT+2) as a basis (+00:00).

Request

    curl http://trainshare.ch/v1/read?trainshare_id=6b34bf17-da69-4593-b7c9-7d0dc9e6947d
    
Response

    [{
        "name":"Darth Vader",
        "trainshare_id":"5eedcdfb-db12-4abd-a46f-694361f3cbb6",
        "position":4, // range from 0 to 10
        "upper":false,
        "message":"a message", // 120 characters max
        "image_url":"https://si0.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png",
        "overlaps":{
            "departure_time":"2012-04-09T10:03:34+00:00",
            "departure_station":"Bern",
            "arrival_time":"2012-04-09T11:14:34+00:00",
            "arrival_station":"Basel SBB"
        }
    },{
        "name":"Yöda",
        "trainshare_id":"5eedcdfb-db12-4abd-a46f-694361f3cbb5",
        "position":9,
        "upper":true,
        "message":"a message",
        "image_url":"https://si0.twimg.com/sticky/default_profile_images/default_profile_3_biger.png",
        "overlaps":{
            "departure_time":"2012-04-09T10:03:34+00:00",
            "departure_station":"Bern",
            "arrival_time":"2012-04-09T11:14:34+00:00",
            "arrival_station":"Basel SBB"
        }
    }]

## License (MIT)

Copyright (C) 2012 Philipp Küng

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
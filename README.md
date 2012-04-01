# Trainshare

An API for the trainshare apps which will connect you with your friends traveling by train.

## Setup (OSX) - For running the API

Since OSX has no real packet manager go ahead and [install Homebrew](https://github.com/mxcl/homebrew/wiki/installation).

Then go ahead and install Neo4j aswell as MySQL.

  $ brew install neo4j
  $ brew install mysql

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

---

## License (MIT)

Copyright (C) 2012 Philipp Küng

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
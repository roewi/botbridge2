const agentBot = require('./lib/agentBot');
const agent = new agentBot(91256585, "Support_Bot", "Francis2011");


var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// agent.start();
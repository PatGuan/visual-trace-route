var express = require('express');
var router = express.Router();
var request = require('request');
var Traceroute = require('traceroute-lite');
var async = require('async');

getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'] || '').split(',')[0] 
        || req.connection.remoteAddress;
};

refreshHomePageWithData = function(listOfIp, res) {

  var ipLocationDetails = [];
  var timedOutRequests = [];

  async.each(listOfIp, 
      function(ip, callback) {
        console.log(ip.ip);
        if (ip.ip != null) {
          console.log("http://ip-api.com/json/" + ip.ip);
          request("http://ip-api.com/json/" + ip.ip, function(error, response, body) {
            if (!error && response.statusCode == 200) {
              ipLocationDetails.push(body);
              callback();
            }
          });
        }
        else{
          timedOutRequests.push(ip.counter);
          callback();
        }
        
      },
      function(err) {
          console.log("rendering");
          res.setHeader('Content-Type', 'application/json');
          res.send({"websiteData" : ipLocationDetails, "timedOutRequests": timedOutRequests});
      }
  );
}


getLocationFromIp = function(website) {
  console.log(website.ip);
    request("http://ip-api.com/json/" + website, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("returning body " + body);
        return body;
      }
    });
};

getTotalTraceRoute = function(website, res) {
  var traceroute = new Traceroute(website);
  traceroute.on('hop', function(hop) {
    console.log(hop);
  });
  traceroute.start(function(err, hops) {
    refreshHomePageWithData(hops, res);
  });
}

router.post('/traceIp', function(req, res) {
  getTotalTraceRoute(req.body.website, res);
});

router.get('/', function(req, res) {
    res.render('index', { 'ip' : "hey", "websiteData": "nullfornow"});
});


module.exports = router;

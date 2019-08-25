var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser=require('body-parser');
var request = require('request');
var fs = require('fs');
var https = require('https')
var http = require( 'http')


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

//enabling ccross origin requests
const cors = require('cors')
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))

mongoose.connect('mongodb://localhost:27017/road', {useNewUrlParser: true});
var Road     = require('./models/road');
var router = express.Router();



router.use(function(req, res, next) {
  // do logging
  console.log('Incoming request \n');
  next(); // make sure we go to the next routes and don't stop here
});


//helper function

function isNotEmpty(x){
  if(x!= "" && x != null){
    return true;
  }
}


//routes to /api 


//api to get all potholes within 10 km radius
router.get('/', function(req, res) {


  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);
  console.log(lat+"-----"+lng);
  if(isNotEmpty(lat) && isNotEmpty(lng)){
    Road.find({
      location: {
       $near: {
        $maxDistance: 10000,
        $geometry: {
         type: "Point",
         coordinates: [lng, lat]
        }
       }
      }
     },function(error, results) {
      if (error){
        console.log(error);
        res.json({msg:"error"});
        res.status(400);
      }else{
        res.json(results);
      }
     }); //
  }else{
    console.log("empty");
    res.json({msg:"empty"});
    res.status(400);
  }
});



//api to post new pothole
//it will automatically snap to near by road using google maps api
router.post('/',function(req,res){

  var lat = parseFloat(req.body.lat);
  var lng = parseFloat(req.body.lng);
  var roadtype = req.body.roadtype;
  if( isNotEmpty(lat) && isNotEmpty(lng) && isNotEmpty(roadtype) ){
    var road = new Road({
      location:{
        type:"Point",
        coordinates:[lng,lat]
      },
      roadtype:roadtype,
      positiveVotes:0,
      negetiveVotes:0
    });


    road.save(function(err){
      if(err){
        console.log(err);
        res.status(400);
        res.json({msg:"error"});
      }
      else{
        res.json({})
      }
    });
  }else{
    console.log("error, empty post body\n");
    res.json({msg:"error"});
    res.status(400);
  }
});


//get one pothole

router.get('/one', function(req, res) {


  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);
  console.log(lat+"-----"+lng);
  if(isNotEmpty(lat) && isNotEmpty(lng)){
    Road.findOne({
      location: {
       $near: {
        $maxDistance: 10,
        $geometry: {
         type: "Point",
         coordinates: [lng, lat]
        }
       }
      }
     },function(error, result) {
      if (error || result.length){
        console.log(error);
        res.json({msg:"error"});
        res.status(400);
      }else{
        console.log("returning single object");
        res.json(result);
      }
     }); //
  }else{
    console.log("empty");
    res.json({msg:"empty"});
    res.status(400);
  }
});


// upvote an existing pothole
router.post('/upvote',function(req,res){
  var lat = parseFloat(req.body.lat);
  var lng = parseFloat(req.body.lng);
  console.log(lat+"<"+lng);
  
  Road.find({
    location: {
     $near: {
      $maxDistance: 10,
      $geometry: {
       type: "Point",
       coordinates: [lng, lat]
      }
     }
    }
   },function(error, results)  {
    if (error){
      console.log(error);
      res.json({msg:"error"});
      res.status(400);
    }else{
      if(results.length){
        
        results[0].positiveVotes += 1;
        results[0].positiveVoteTimeStamp = Date.now();
        results[0].save(function(err){
          if(err){
            console.log(err);
            res.json({msg:"error"});
            res.status(400);
          }
          console.log("upvoted");
          
          res.json({});
        });
      }else{
        console.log("empty");
        res.json({msg:"error"})
        res.status(400);
      }
    }
   });
});


// downvote an existing pothole
router.post('/downvote',function(req,res){
  var lat = parseFloat(req.body.lat);
  var lng = parseFloat(req.body.lng);
  console.log(lat+"<"+lng);
  Road.find({
    location: {
     $near: {
      $maxDistance: 10,
      $geometry: {
       type: "Point",
       coordinates: [lng, lat]
      }
     }
    }
   },function(error, results)  {
    if (error){
      console.log(error);
      res.json({msg:"error"});
      res.status(400);
    }else{
      if(results.length){
        console.log("down voting");
        
        results[0].negetiveVotes += 1;
        results[0].negetiveVoteTimeStamp = Date.now();
        results[0].save(function(err){
          if(err){
            console.log(err);
            res.json({msg:"error"});
            res.status(400);
          }
          console.log("down voted");
          
          res.json({});
        });
      }else{
        console.log("empty");
        res.json({msg:"error"})
        res.status(400);
      }
    }
   });
});




app.use('/api', router);
app.use('/', express.static(path.join(__dirname, 'frontend')))


// app.set('port', 3000);
// app.listen(app.get('port'));


// http.createServer(app)
// .listen(3000, function () {
//   console.log('Example app listening on port 3000! Go to https://localhost:3000/')
// })


https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(443, function () {
  console.log('app listening on port 3000! Go to https://localhost:443/')
})

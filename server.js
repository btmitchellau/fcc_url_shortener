'use strict';

const express    = require('express');
const bodyParser = require("body-parser");
const cors       = require('cors');
const mongoose   = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const setupDB = () => {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('connected');
  });

  const urlSchema = new mongoose.Schema({  
    id: Number,
    url: String  
  });

  let UrlEntry = mongoose.model('urlShortList', urlSchema);
  return UrlEntry
};

const findNextID = () => {

  //find the lowest ID
    const query = UrlEntry.find()
                          .sort({ 'id': 'desc' })
                          .limit(1)
                          .select('id');
    query.exec(function(err, data){
    console.log(data[0].id);    
    return data[0].id;
  });        
}

const UrlEntry = setupDB();
  

// user posts URL here
app.post("/api/shorturl/new", bodyParser.urlencoded({extended: false}), (req, res, next) => {
  console.log(req.body.url);
  console.log(findNextID());
       
  
  //check if it exists  
  UrlEntry.findOne({"url":req.body.url}, (err, urlFound) =>{

    if(err){
      console.log(`e:${err}`);
    } else if (urlFound == null){
      console.log(`notfound: ${urlFound}`);
      const newUrl = UrlEntry({"id":2,"url":req.body.url});
      newUrl.save( (err,data) =>{
        console.log(`data:${data}`);
      })
    }
    else {
      console.log(`found:${urlFound}`);
    };    
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
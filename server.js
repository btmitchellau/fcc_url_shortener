'use strict';

const express = require('express'),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    urlExists = require("url-exists"),
    db = require('./db'),
    app = express(),
    port = process.env.PORT || 3000;


console.log(db);
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});

// user posts URL here
app.post("/api/shorturl/new", (req, res) => {

    urlExists(req.body.url, (err, exists) => {
        if (!exists) {
            console.log(err);
            res.json({
                "error": "invalid URL"
            });
        } else {

            let nextId = 1;

            //find the lowest ID
            const query = db.UrlEntry.find()
                .sort({
                    'id': 'desc'
                })
                .limit(1)
                .select('id url');

            query.exec((err, data) => {

                nextId = parseInt(data[0].id) + 1;

                // check if it exists  
                db.UrlEntry.findOne({
                    "url": req.body.url
                }, (err, urlFound) => {

                    if (err) {
                        console.log(`e:${err}`);

                    } else if (urlFound == null) {
                        const newUrl = db.UrlEntry({
                            "id": nextId,
                            "url": req.body.url
                        });
                        newUrl.save((err, data) => {});
                    }
                    res.json({
                        "original_url": req.body.url,
                        "short_url": nextId
                    });
                });
            });
        }
    });
});

// user retrieving a URL
app.get('/:urlId', (req, res) => {
    console.log(req.params.urlId)

    const query = db.UrlEntry.where({
        id: req.params.urlId
    });
    query.findOne(function(err, url) {
        if (err) {
            console.log(err)
        }
        if (url) {
            console.log(url)
            if (url != null) {
                console.log('redirecting...')
                res.redirect(url.url);
            } else {
                res.json({
                    "error": "url lookup failed"
                });
            }
        }
    });
});

app.listen(port, () => {
    console.log('Node.js listening ...');
});
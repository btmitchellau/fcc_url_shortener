'use strict';

const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
const urlExists = require("url-exists");
const db = ('./db');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// user posts URL here
app.post("/api/shorturl/new", bodyParser.urlencoded({
	extended: false
}), (req, res, next) => {
	console.log(req.body.url);

	urlExists(req.body.url, function(err, exists) {
		if (!exists) {
			console.log(err);
			res.json({
				"error": "invalid URL"
			});
		} else {

			let nextId = 1;

			//find the lowest ID
			const query = UrlEntry.find()
				.sort({
					'id': 'desc'
				})
				.limit(1)
				.select('id url');

			query.exec(function(err, data) {

				nextId = parseInt(data[0].id) + 1;

				// check if it exists  
				UrlEntry.findOne({
					"url": req.body.url
				}, (err, urlFound) => {

					if (err) {
						console.log(`e:${err}`);

					} else if (urlFound == null) {
						const newUrl = UrlEntry({
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

	const query = UrlEntry.where({
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

app.listen(port, function() {
	console.log('Node.js listening ...');
});
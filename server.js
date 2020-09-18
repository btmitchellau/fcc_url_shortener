const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const urlExists = require('url-exists');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// user posts URL here
app.post('/api/shorturl/new', (req, res) => {
  urlExists(req.body.url, (err, exists) => {
    if (!exists) {
      res.json({
        error: 'invalid URL',
      });
    } else {
      let nextId = 1;

      // find the lowest ID
      const query = db.UrlEntry.find()
        .sort({
          id: 'desc',
        })
        .limit(1)
        .select('id url');

      query.exec((queryExecErr, data) => {
        nextId = parseInt(data[0].id) + 1;

        // check if it exists
        db.UrlEntry.findOne({
          url: req.body.url,
        }, (dbFindOneErr, urlFound) => {
          if (err) {

          } else if (urlFound == null) {
            const newUrl = db.UrlEntry({
              id: nextId,
              url: req.body.url,
            });
            newUrl.save((err, data) => {});
          }
          res.json({
            original_url: req.body.url,
            short_url: nextId,
          });
        });
      });
    }
  });
});

// user retrieving a URL
app.get('/:urlId', (req, res) => {
  const query = db.UrlEntry.where({
    id: req.params.urlId,
  });
  query.findOne((err, url) => {
    if (err) {

    }
    if (url) {
      if (url != null) {
        res.redirect(url.url);
      } else {
        res.json({
          error: 'url lookup failed',
        });
      }
    }
  });
});

app.listen(port);

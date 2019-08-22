let express = require('express');
let morgan = require('morgan');
let path = require('path');
let Pool = require('pg').Pool;
let bodyParser = require('body-parser');

let config = {
  user: 'username',
  database: 'db_name',
  host: 'host_name',
  password: 'password'
};

let app = express();
app.use(morgan('combined'));
app.use(bodyParser.json({
  limit: '50mb',
  extended: true
}));

let pool = new Pool(config);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/add-update-movie', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'add_movie.html'));
});

app.get('/ui/:filename', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.filename));
});

app.get('/css/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'css', req.params.fileName));
});

app.get('/js/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'js', req.params.fileName));
});

app.get('/images/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'images', req.params.fileName));
});

function* iterate_object(o) {
  var keys = Object.keys(o);
  for (var i=0; i<keys.length; i++) {
    yield [keys[i], o[keys[i]]];
  }
}

/* List Movies, actors, producers
all movie details - 1,
actor - 2,
producer - 3
specific movie details - 4
*/
app.get('/list_items', function (req, res) {
  var fetch_type = req.query.type;
  var query;
  var params = [];
  if (fetch_type == 1)
    query = 'SELECT * FROM "master-view"';
  else if (fetch_type == 2)
    query = 'SELECT * FROM "actor"';
  else if (fetch_type == 3)
    query = 'SELECT * FROM "producer"';
  else {
    query = 'SELECT * FROM "master-view" WHERE movie_id = $1';
    params = [req.query.movie_id];
  }
  pool.query(query, params, function (err, result) {
    if (err) {
      console.log("kuch toh gadbad hai!");
      res.status(500).send(err.toString());
    }
    else {
      var response = {};
      response.status = 1;
      response.list = result.rows;
      res.status(200).send(response);
    }
  });
});

/* Create Actor/Producer
1 - Actor
2 - Producer
*/
app.post('/add_actor_producer', function (req, res) {
  var name = req.body.name;
  var sex = req.body.sex;
  var dob = req.body.dob;
  var bio = req.body.bio;
  var type = req.body.type;
  var req_type = (type == 1) ? "actor" : "producer";
  var table_name = (type == 1) ? "actor" : "producer";
  var response = {};

  pool.query('INSERT INTO $1 (name, sex, dob, bio) VALUES ($2, $3, $4, $5)', [table_name, name, sex, dob, bio], function (err, result) {
    if (err) {
      response.status = 0;
      response.msg = "Something went wrong!";
      console.log("Something went wrong while inserting!");
      res.status(500).send(response);
    } else {
      console.log("Successfully inserted/updated in fileSystem table.");
      response.status = 1;
      response.msg = "Successfully " + req_type;
      res.status(200).send(response);
    }
  });
});

// add movie (all constraints)
app.post('/add_update_movie_details', function (req, response) {
  var form_details = req.body;
  var actor = form_details.actor;
  var producer_details = form_details.producer;

  (async () => {
      const client = await pool.connect();

      try {
        var movie_id;
        await client.query('BEGIN');
        if (form_details.request_type == 2) {
          const { rows } = await client.query('INSERT INTO movie(name, image, plot, yor) VALUES($1, $2, $3, $4) RETURNING movie_id', [form_details.name, form_details.image, form_details.plot, form_details.yor]);
          movie_id = parseInt(rows[0].movie_id);
        }
        else {
          movie_id = parseInt(form_details.id);
          await client.query('UPDATE movie SET name = $1, image = $2, plot = $3, yor = $4 WHERE movie_id = $5', [form_details.name, form_details.image, form_details.plot, form_details.yor, movie_id]);

          // delete entries of this movie from actor-movie and movie-producer tables
          await client.query('DELETE FROM "actor-movie" WHERE movie_id = $1', [movie_id]);
          await client.query('DELETE FROM "movie-producer" WHERE movie_id = $1', [movie_id]);
        }

        if (actor.mode == 1) {
          var ids = actor.details.ids;
          await Promise.all(ids.map(async (value) => {
            await client.query('INSERT INTO "actor-movie"(actor_id, movie_id) VALUES($1, $2)', [parseInt(value), movie_id]);
          }));
        }
        else {
          for (var [key, value] of iterate_object(actor.details)) {
            let { rows } = await client.query('INSERT INTO actor(name, sex, dob, bio) VALUES($1, $2, $3, $4) RETURNING actor_id', [value.name, value.sex, value.dob, value.bio]);
            let actorID = parseInt(rows[0].actor_id);
            await client.query('INSERT INTO "actor-movie"(actor_id, movie_id) VALUES($1, $2)', [parseInt(actorID), movie_id]);
          }
        }
        if (producer_details.mode == 1) {
          await client.query('INSERT INTO "movie-producer"(movie_id, producer_id) VALUES($1, $2)', [movie_id, parseInt(producer_details.id)]);
        }
        else {
          let { rows } = await client.query('INSERT INTO producer(name, sex, dob, bio) VALUES($1, $2, $3, $4) RETURNING producer_id', [producer_details.name, producer_details.sex, producer_details.dob, producer_details.bio]);
          let producerID = parseInt(rows[0].producer_id);
          await client.query('INSERT INTO "movie-producer"(movie_id, producer_id) VALUES($1, $2)', [movie_id, producerID]);
        }
        await client.query('COMMIT');
        response.status(200).send({"status" : 1});
      } catch (e) {
        await client.query('ROLLBACK');
        response.status(500).send({"status" : 0});
        throw e;
      } finally {
        client.release();
      }
    })().catch(e => console.error(e.stack))
});

app.listen(9090, function () {
  console.log('App listening on port 9090!');
});

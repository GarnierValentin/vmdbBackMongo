import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express();
const port = 3000;
const url = 'mongodb+srv://valentgarnier:7CLTXx2ER9vC9wJk@vmdb.7wbikkf.mongodb.net/';
const dbName = 'sample_mflix';
const collectionName = 'movies';

const client = new MongoClient(url);

app.use(cors());
app.use(express.json());

app.get('/movie', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const movieTitle = req.query.title;
        let decodedMovieTitle = decodeURIComponent(movieTitle as string);
        const movie = await collection.findOne({ title: decodedMovieTitle });

        if (movie) {
            res.status(200).send({
                status: 'success',
                message: 'Movie found',
                data: movie
            });
        } else {
            res.status(404).send({
                status: 'error',
                message: 'Movie not found'
            });
        }
    } catch (err) {
        console.log(err.stack);
        res.status(500).send({
            status: 'error',
            message: 'Internal server error',
            data: {}
        });
    }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
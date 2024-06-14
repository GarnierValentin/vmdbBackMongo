import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.URLDB);
const dbName = process.env.DBNAME;
const collectionName = process.env.COLLECTIONNAME;

const movieController = {
    async getMoviesByTitle(req, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const movieTitle = req.query.title;
            let decodedMovieTitle = decodeURIComponent(movieTitle.toString());
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
    },
    async getTopRatedMovies(_, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const movies = await collection.find({
                "imdb.rating": { $exists: true, $ne: null, $not: { $eq: "" } },
                poster: { $exists: true, $ne: null }
            })
            .sort({ "imdb.rating": -1 })
            .limit(10)
            .toArray();
    
            res.status(200).send({
                status: 'success',
                message: 'Top rated movies found',
                data: movies
            });
        } catch (err) {
            console.log(err.stack);
            res.status(500).send({
                status: 'error',
                message: 'Internal server error',
                data: {}
            });
        }
    },
    async getMovieById(req, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const movieId = req.params.id;

            if (!ObjectId.isValid(movieId)) {
                return res.status(400).send({
                    status: 'error',
                    message: 'Invalid movie ID'
                });
            }

            const movie = await collection.findOne({ _id: new ObjectId(movieId) });

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
    }
}

export default movieController;

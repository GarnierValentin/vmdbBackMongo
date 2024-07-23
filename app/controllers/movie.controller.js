import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const dbMovie = process.env.DBNAMEMOVIE;
const collectionMovie = process.env.COLLECTIONNAMEMOVIE;

const movieController = {
    async getTopRatedMovies(_, res) {
        try {
            await client.connect();
            const db = client.db(dbMovie);
            const collection = db.collection(collectionMovie);
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
            const db = client.db(dbMovie);
            const collection = db.collection(collectionMovie);
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
    },
    async getMoviesByTitle(req, res) {
        try {
            await client.connect();

            const db = client.db(dbMovie);
            const collection = db.collection(collectionMovie);
            const movieTitle = req.query.title;

            let decodedMovieTitle = decodeURIComponent(movieTitle.toString());
            const regex = new RegExp('^' + decodedMovieTitle, 'i');

            const query = { title: { $regex: regex } };
            let data = await collection.find(query).limit(8).toArray();

            if (data.length < 8) {
                const remainingMovies = 8 - data.length;
                const regexPartialMatch = new RegExp(decodedMovieTitle, 'i');
                const queryPartialMatch = { title: { $regex: regexPartialMatch } };
                const additionalMovies = await collection.find(queryPartialMatch).limit(remainingMovies).toArray();
                data = data.concat(additionalMovies);
            }

            res.status(200).send({
                status: 'success',
                message: 'Movies found',
                data: data,
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
    async getMoviesByGenre(req, res) {
        try {
            await client.connect();
    
            const db = client.db(dbMovie);
            const collection = db.collection(collectionMovie);
            const genre = req.params.genre;

            console.log(genre);
    
            const query = {
                genres: genre,
                "imdb.rating": { $exists: true, $ne: null, $not: { $eq: "" } },
                poster: { $exists: true, $ne: null }
            };
    
            const data = await collection.find(query)
                .sort({ "imdb.rating": -1 })
                .limit(10)
                .toArray();
    
            res.status(200).send({
                status: 'success',
                message: 'Movies found',
                data: data
            });
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

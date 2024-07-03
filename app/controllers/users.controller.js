import 'dotenv/config';
import {
    MongoClient
} from 'mongodb';
import CryptoJS from 'crypto-js';

const client = new MongoClient(process.env.URLDB);
const dbName = process.env.DBNAMEUSERS;
const collectionName = process.env.COLLECTIONNAMEUSERS;

const nicknameRegex = /^[a-zA-Z0-9]{3,20}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const hashRegex = /^[a-f0-9]{64}$/;

const isValidSessionToken = async (email, sessionToken) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const query = {
        email: email,
        sessionToken: sessionToken,
        lastConnection: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    };

    const user = await collection.findOne(query);

    return user ? true : false;

}

const usersController = {
    async registerUser(req, res) {
        try {
            await client.connect();

            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            const { nickname, email, password } = req.body;

            const existingUser = await collection.findOne({ email });

            if (existingUser) {
                throw new Error(400);
            }

            if (!nicknameRegex.test(nickname) || !emailRegex.test(email) || !hashRegex.test(password)) {
                throw new Error(400);
            }

            const hash = CryptoJS.SHA256('salt' + password).toString(CryptoJS.enc.Hex);

            const result = await collection.insertOne({ nickname, email, password: hash });
            if (result.insertedId) {
                usersController.loginUser(req, res);
            } else {
                throw new Error(500);
            }
        } catch (err) {
            if (err.message > 399 && err.message < 500) {
                res.status(err.message).send({
                    status: 'error',
                    message: 'Erreur client'
                });
            } else {
                res.status(500).send({
                    status: 'error',
                    message: 'Erreur serveur'
                });
            }
        }
    },

    async loginUser(req, res) {
        try {
            await client.connect();

            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            const { email, password } = req.body;

            const hash = CryptoJS.SHA256('salt' + password).toString(CryptoJS.enc.Hex);

            const user = await collection.findOne({ email, password: hash });

            if (!user) {
                throw new Error(401);
            }

            const date = new Date();
            const sessionToken = CryptoJS.SHA256('salt' + user._id + date).toString(CryptoJS.enc.Hex);

            await collection.updateOne({ _id: user._id }, { $set: { sessionToken, lastConnection: date } });

            res.status(200).send({
                status: 'success',
                message: 'Connexion réussie',
                sessionToken: sessionToken,
            });
        } catch (err) {
            if (err.message === '401') {
                res.status(401).send({
                    status: 'error',
                    message: 'Email ou mot de passe incorrect'
                });
            } else {
                res.status(500).send({
                    status: 'error',
                    message: 'Erreur serveur'
                });
            }
        }
    },
    async getFavoriteMovies(req, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const userEmail = req.query.email;
            const userSessionToken = req.query.sessionToken;

            if (!isValidSessionToken(userEmail, userSessionToken)) {
                throw new Error(401);
            };

            const favoritesMovies = await collection.findOne({ email: userEmail });

            res.status(200).send({
                status: 'success',
                message: 'Favorite movies found',
                data: favoritesMovies?.favorites
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
    async addFavoriteMovie(req, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const movieId = req.body.movieId;
            const userEmail = req.body.email;
            const userSessionToken = req.body.sessionToken;

            if (!isValidSessionToken(userEmail, userSessionToken)) {
                throw new Error(401);
            };

            await collection.updateOne(
                { email: userEmail },
                { $addToSet: { favorites: movieId } }
            );

            res.status(200).send({
                status: 'success',
                message: 'Movie added to favorites'
            });

        } catch (err) {
            console.log(err.stack);
            res.status(500).send({
                status: 'error',
                message: 'Internal server error'
            });
        }
    },
    async removeFavoriteMovie(req, res) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const movieId = req.body.movieId;
            const userEmail = req.body.email;
            const userSessionToken = req.body.sessionToken;

            if (!isValidSessionToken(userEmail, userSessionToken)) {
                throw new Error(401);
            };

            await collection.updateOne(
                { email: userEmail },
                { $pull: { favorites: movieId } }
            );

            res.status(200).send({
                status: 'success',
                message: 'Movie removed from favorites'
            });

        } catch (err) {
            console.log(err.stack);
            res.status(500).send({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
};

export default usersController;

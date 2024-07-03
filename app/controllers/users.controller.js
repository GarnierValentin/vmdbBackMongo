import 'dotenv/config';
import {
    MongoClient
} from 'mongodb';

const client = new MongoClient(process.env.URLDB);
const dbName = process.env.DBNAMEUSERS;
const collectionName = process.env.COLLECTIONNAMEUSERS;

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

            const result = await collection.insertOne({ nickname, email, password });
            if (result.insertedId) {
                res.status(201).json({
                    status: 'success',
                    message: 'User created'
                });
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

            const hash = CryptoJS.SHA256(email + password).toString(CryptoJS.enc.Hex);

            const user = await collection.findOne({ email, password: hash });

            if (!user) {
                throw new Error(401);
            }

            res.status(200).send({
                status: 'success',
                message: 'Connexion réussie',
                data: user
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
    }
};

export default usersController;

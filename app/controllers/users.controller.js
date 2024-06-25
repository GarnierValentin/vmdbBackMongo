import 'dotenv/config';
import {
    MongoClient
} from 'mongodb';

const client = new MongoClient(process.env.URLDB);
const dbName = process.env.DBNAMEUSERS;
const collectionName = process.env.COLLECTIONNAMEUSERS;

const emailRegex = /(?:[a-z0-9!#$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const passwordRegex = '^[a-fA-F0-9]{64}$';

const usersController = {
    async registerUser(req, res) {
        try {
            const { email, nickname, password } = req.body;

            if (!email.match(emailRegex)) {
                throw new Error(403); // Email invalide
            }

            if (!password.match(passwordRegex)) {
                throw new Error(403); // Mot de passe invalide
            }

            await client.connect();
            const existingUser = await client.db(dbName).collection(collectionName).findOne({ email });

            if (existingUser) {
                throw new Error(403); // Utilisateur déjà existant
            }

            const result = await client.db(dbName).collection(collectionName).insertOne({ email, nickname, password });

            res.status(201).send({
                status: 'success',
                message: 'Utilisateur enregistré',
                data: result.insertedId
            });
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
    }
};

export default usersController;

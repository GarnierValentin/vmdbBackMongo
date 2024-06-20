import 'dotenv/config';
import bcrypt from 'bcrypt';
import {
    MongoClient,
    ObjectId
} from 'mongodb';

const client = new MongoClient(process.env.URLDB);
const dbName = process.env.DBNAMEUSERS;
const collectionName = process.env.COLLECTIONNAMEUSERS;

const emailRegex = /(?:[a-z0-9!#$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const usersController = {
    async registerUser(req, res) {
        try {
            const { email, password, passwordConfirmation } = req.body;

            if (password !== passwordConfirmation) {
                throw new Error('Les mots de passe ne sont pas identiques');
            }

            if (!email.match(emailRegex)) {
                throw new Error('Email invalide');
            }

            await client.connect();

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await client.db(dbName).collection(collectionName).findOne({ email });

            if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }

            // Hasher le mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insérer l'utilisateur dans la base de données
            const result = await client.db(dbName).collection(collectionName).insertOne({
                email,
                password: hashedPassword,
            });

            res.status(201).send({
                status: 'success',
                message: 'Utilisateur enregistré',
                data: result.ops[0]
            });
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
            res.status(500).send({
                status: 'error',
                message: 'Erreur interne du serveur',
                data: {}
            });
        }
    }
};

export default usersController;

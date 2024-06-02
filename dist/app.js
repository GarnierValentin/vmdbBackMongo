"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
const url = 'mongodb+srv://valentgarnier:7CLTXx2ER9vC9wJk@vmdb.7wbikkf.mongodb.net/';
const dbName = 'sample_mflix';
const collectionName = 'movies';
const client = new mongodb_1.MongoClient(url);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/movie', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const movieTitle = req.query.title;
        const movie = yield collection.findOne({ title: movieTitle });
        if (movie) {
            res.status(200).send({
                status: 'success',
                message: 'Movie found',
                data: movie
            });
        }
        else {
            res.status(404).send({
                status: 'error',
                message: 'Movie not found'
            });
        }
    }
    catch (err) {
        console.log(err.stack);
        res.status(500).send({
            status: 'error',
            message: 'Internal server error',
            data: {}
        });
    }
}));
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map
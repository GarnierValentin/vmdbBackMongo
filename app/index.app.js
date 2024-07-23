import express from 'express';
import cors from 'cors';
import { globalLimiter } from './middlewares/limiters.js';
import routerMovie from './routers/router.movie.js';
import routerUsers from './routers/router.users.js';

const app = express();

app.use(cors());
app.use(globalLimiter);
app.use(express.json());
app.use(routerMovie);
app.use(routerUsers);

export default app;
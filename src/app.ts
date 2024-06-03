import 'dotenv/config';
import app from '../app/index.app.js';
import { createServer } from 'node:http';

const server = createServer(app);

const { PORT } = process.env;

server.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
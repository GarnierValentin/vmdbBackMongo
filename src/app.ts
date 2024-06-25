import 'dotenv/config';
import app from '../app/index.app.js';
import { createServer } from 'node:http';
// import { createServer } from 'node:https';
import fs from 'node:fs';

const httpsOptions = {
  key: fs.readFileSync(process.env.KEY),
  cert: fs.readFileSync(process.env.CRT),
};

const { PORT, KEY, CRT } = process.env;

const server = createServer(/* httpsOptions, */app);

server.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
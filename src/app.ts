import 'dotenv/config';
import app from '../app/index.app.js';
// import { createServer } from 'node:http';
import { createServer } from 'node:https';
import fs from 'node:fs';

const { PORT } = process.env;
const { KEY, CRT } = process.env;

const httpsOptions = {
  key: fs.readFileSync(KEY),
  cert: fs.readFileSync(CRT),
};

const server = createServer( httpsOptions, app);

server.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
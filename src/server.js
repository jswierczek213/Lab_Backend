// Environment Variables Initialization
import 'dotenv/config';

// Express App Initialization
import Express from 'express';
const app = Express();

// Middlewares
app.use(Express.json());

app.listen(
  process.env.SERVER_PORT, 
  () => console.log(`Server running on port ${process.env.SERVER_PORT}`)
);

import groups from './api/groups/groups.js';

// API Endpoints
app.use('/groups', groups);
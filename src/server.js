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

// API Endpoints
import groups from './api/groups/groups.js';
app.use('/groups', groups);

import users from './api/users/users.js';
app.use('/users', users);

import posts from './api/posts/posts.js';
app.use('/posts', posts);

import categories from './api/categories/categories.js';
app.use('/categories', categories);

// API RABBITMQ Endpoints
app.get('')
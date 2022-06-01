const Express = require('express');
const App = Express();

const SERVER_PORT = 3000;

App.listen(SERVER_PORT, () => console.log(`Server running on port ${SERVER_PORT}`));
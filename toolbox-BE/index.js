const env = require('dotenv').config();
const config = require('config');

const express = require('express');
const app = express();

const cors = require('cors');

// Custom middleware
const setContentTypeJSON = require('./middleware/setResponseHeader');
const errorMiddleware = require('./middleware/error');

const users = require('./routes/users');
const tools = require('./routes/tools');

// Error handler
const { TakeError } = require('./helpers/helpError');

app.use(express.json());
app.use(cors());
app.use(setContentTypeJSON);
app.use('/api/users', users);
app.use('/api/tools', tools);

// Check if things work, like the errorHandler / errorMiddleware
app.get('/error', (req, res) => {
    throw new TakeError(500, 'Checking to see if errorHandler works!');
})

// After Other Middleware
app.use(errorMiddleware);

app.listen(config.get('port'), () => console.log(`Listening on port ${config.get('port')}...`));
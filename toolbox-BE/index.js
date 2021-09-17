const env = require('dotenv').config();
const config = require('config');

const express = require('express');
const app = express();

const cors = require('cors');

// custom middleware
const setContentTypeJSON = require('./middleware/setResponseHeader');

const users = require('./routes/users');
const tools = require('./routes/tools');

app.use(express.json());
app.use(cors());
app.use(setContentTypeJSON);
app.use('/api/users', users);

// books --> tools
app.use('/api/tools', tools);

app.listen(config.get('port'), () => console.log(`Listening on port ${config.get('port')}...`));
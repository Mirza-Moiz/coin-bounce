const express = require('express');
const dbConnect = require('./database/index');
const { PORT } = require('./config/index');

const app = express();

dbConnect();

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`)
); 

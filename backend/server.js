const express = require('express');
const dbConnect = require('./database/index');
const { PORT } = require('./config/index');
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandling')

const app = express();


app.use(router)

dbConnect();

app.use(errorHandler)

app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`)
); 

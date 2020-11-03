require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect Database.
 */
connectDB();

/**
 * Body Parser for allowed to data from body.
 */
app.use(express.json({extended:false}))

/**
 * Define Routes.
 */
app.use('/api/users', require('./routes/api/users'));
app.use('/api/books', require('./routes/api/books'));
app.use('/api/auth', require('./routes/api/auth'));

/**
 * Express configuration.
 */
const PORT = process.env.PORT || 5000;


/**
 * Start Express server.
 */
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
    console.log("Press CTRL-C to stop\n");
});
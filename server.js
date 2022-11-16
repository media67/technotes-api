require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;

connectDB();

//log events sent to the server (this is a custom middleware)
app.use(logger);

//cross origin resource sharing (this is a third party middeware)
app.use(cors(corsOptions));

//allow our app receive and parse JSON data (this is a built-in middleware)
app.use(express.json());

//allow our app to use/parse cookies we receive (this is a third party middleware)
app.use(cookieParser());

//Tells our server where to find static files(css, image) that would be used on the server. (this is a built-in middleware)
app.use('/', express.static(path.join(__dirname, 'public')));
//or app.use(express.static('public)) because its relative to where the server.js file is located.

app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))


app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

//middleware for error handling (this is a custom middleware)
app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoError.log'
  );
});

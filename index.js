const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Add logger
app.use(morgan('tiny'));

//Configure cors to allow requests from any origin
app.use(cors());
//Configure json parse
app.use(express.json());

//Initial route ping
app.get('/ping', (req, res) => {
  return res.send('pong!');
});

app.use('/v1/notes', require('./controllers/note'));

//Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

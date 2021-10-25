const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const feedRoute = require('./router/feed');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const auth = require('./router/auth');
const cors = require('cors');
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getSeconds() + file.originalname);
  },
});
const FilterFile = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype == 'image/jpeg' ||
    file.mimetype == 'image/jpg'
  )
    cb(null, true);
  else cb(null, false);
};

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json()); // appilcation/json  // header set auto
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET ,POST ,DELETE ,PATCH ,PUT ,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,Authorization, Content-Type'
  );
  next();
});
app.use(multer({ storage: Storage, fileFilter: FilterFile }).single('image'));
mongoose
  .connect(
    'mongodb+srv://Rest:rest@cluster0.h4cpj.mongodb.net/post?retryWrites=true&w=majority'
  )
  .then(res => {
    const server = app.listen(3000);
    const io = require('./socket.io').init(server);
    io.on('connection', servers => {
      console.log('CONNECTION', servers.id);
    });
  })
  .catch(err => console.log(err));
app.use('/feed', feedRoute);
app.use('/auth', auth);
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const msg = error.message;
  res.status(status).json({
    message: msg,
  });
});

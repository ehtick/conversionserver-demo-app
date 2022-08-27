const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');
const express = require('express');

const cors = require('cors');
const config = require('config');
const app = express();

const session = require("express-session");

var MongoDBStore = require('connect-mongodb-session')(session);

const apiRoutes = require('./routes/api');
const loginRoutes = require('./routes/login');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const bodyParser = require('body-parser');

const middleware = require('./middleware');


process.on('uncaughtException', function (err) {
  console.log(err);
}); 

//const conversionservice = require('ts3d-hc-conversionservice');

let csmanager;

if (config.get('app.useCSAPI'))
  csmanager = require('./libs/csManagerAPI');
else
  csmanager = require('./libs/csManager');

mongoose
  .connect(config.get('app.mongodbURI'))
  .then(result => {

//    conversionservice.start(mongoose);
    app.use(cors());
    app.use(express.json({ limit: '25mb' }));
    app.use(express.urlencoded({ limit: '25mb', extended: false }));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());


    const fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {

        var uv4 = uuidv4();
        if (!fs.existsSync("./csmodelupload")) {
          fs.mkdirSync("./csmodelupload");
        }

        var dir = "./csmodelupload/" + uv4;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        cb(null, 'csmodelupload/' + uv4);

      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    });

    if (!config.get('app.demoMode')) {
      app.use(multer({ storage: fileStorage }).single('file'));
    }

    app.use(express.static(path.join(__dirname, 'public')));

    var store = new MongoDBStore({
      uri: config.get('app.mongodbURI'),
      collection: 'mySessions'
    });

    // Catch errors
    store.on('error', function (error) {
      console.log(error);
    });

    app.use(session({
      secret: "mysecret",
      resave: false,
      saveUninitialized: true,
      store: store
    }));

    
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/public/viewer.html');
    });

    app.use("/api", loginRoutes);
    app.use(middleware.requireLogin);
    app.use("/api", apiRoutes);
    
    // if (config.get('app.useCSAPI'))
    //   csmanager.init(conversionservice.server);
    // else
      csmanager.init(config.get('app.conversionServiceURI'));

    console.log("listening");
    var server = app.listen(3000);


    var httpProxy = require('http-proxy');


    var proxy = new httpProxy.createProxyServer({
    });

    proxy.on('error', function (err, req, res) {
        console.log(err);
    });

    server.on('upgrade', async function (req, socket, head) {
            proxy.ws(req, socket, head, { target: 'ws://127.0.0.1:3200' });
    });




  })
  .catch(err => {
    console.log(err);
  });
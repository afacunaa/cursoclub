let express = require('express');

let app = express();
let multer = require('multer');
let mime = require('mime');
let constants = require('constants');
let constant = require('./config/constants');



let port = process.env.PORT || 8042;
let passport = require('passport');
let flash = require('connect-flash');
let path = require('path');

let morgan = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, constant.upload_directory )
    },
    filename: function (req, file, cb) {
        cb(null, req.body.userId + '.' + mime.extension(file.mimetype))
    }
});
let upload = multer( {storage: storage, limits: { fileSize: 6000000 }} );

app.use(upload.single('picture'));

/***************Mongodb configuratrion********************/
let mongoose = require('mongoose');
let configDB = require('./config/database.js');
//configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database


require('./config/passport')(passport); // pass passport for configuration

//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
//app.set('view engine', 'ejs'); // set up ejs for templating


//required for passport
//app.use(session({ secret: 'iloveyoudear...' })); // session secret

app.use(session({
    secret: 'I Love Colombia...',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
let routes = require('./config/routes.js');//(app, passport); // load our routes and pass in our app and fully configured passport
app.use('/', routes);

//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Página no encontrada", user: req.user});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Algo salió mal", user: req.user});
});
exports = module.exports = app;
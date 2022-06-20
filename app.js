var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// Declaring some vars for storing the project directories for use later, maybe :D
const appDirectories = {
  rootDirectory: __dirname,
  routesDirectory: path.join(__dirname, 'routes'),
  viewsDirectory: path.join(__dirname, 'views')
}
module.exports = { appDirectories };
//************************************************** */

// Starting the user session manager
let sessionOptions = {
  secret:             '80097982',
  name:               'myWalletAppSessionID',
  saveUninitialized:  true,
  resave:             false
}

app.use( session( sessionOptions ) );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/app', require('./routes/app-endpoints'));
// app.use('/app/login', require('./routes/app-endpoints'));

app.use('/users', require('./database/models/users/users-controller'));
app.use('/wallets', require('./database/models/wallets/wallets-controller'));
app.use('/categories', require('./database/models/categories/categories-controller'));
app.use('/transactions', require('./database/models/transactions/transactions-controller'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
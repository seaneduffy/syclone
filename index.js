'use strict';

let express = require('express'),
	app = express(),
	http = require('http'),
	syclone = require('./syclone'),
	config = require('./syclone/config'),
	session = require('express-session'),
	mongoose = require('mongoose');
	
mongoose.Promise = Promise;
	
app.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	rolling: true,
	cookie: { 
		secure: false,
		maxAge: 60 * 60 * 1000
	 }
}));
	
app.use(express.static('./public'));
app.use(express.static('./bower_components'));
mongoose.connect(config.db);

syclone(app);

http.Server(app).listen(3000, function(){
	console.log('Server started at port 3000');
});
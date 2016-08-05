'use strict';

let env = process.env.NODE_ENV === 'production' ? 'production' : 'development',
	config = require('./'+env);
	
module.exports = config;
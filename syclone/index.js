'use strict';

let twitter = require('./twitter'),
	templates = require('./templates');

module.exports = function(app){
	
	app.get('/', function(req, res) {
		
		let session = req.session;
		
		res.send(templates.home({authenticated: !!session.twitter && !!session.twitter.accessToken}));
	});
	
	app.get('/clear/', function(req, res) {
		req.session = null;
		res.redirect('/');
	});
	
	app.get('/search/', function(req, res) {
		
		let session = req.session;
		
		if(!!session.twitter && !!session.twitter.accessToken) {
			let twitterSession = session.twitter;
			/*let twitterSession = {
				accessToken: "",
				accessTokenSecret: ""
			}*/
			twitter.search(twitterSession.accessToken, twitterSession.accessTokenSecret, req.query.keywords).then(function(data) {
				res.json({success: true, tweets:data.tweets});
			}, function(reason) {
				res.json({success: false, error: reason});
			});
		} else {
			res.json({success: false, error: 'User is not authenticated.'});
		}
	});
	
	app.get('/oauth', function(req, res) {
		
		let session = req.session;
		
		twitter.authenticate(req.query.oauth_token, 
			req.query.oauth_token_secret, 
			req.query.oauth_verifier).then(function(data){
			
			for(let key in data) {
				session.twitter[key] = data[key];
			}
			
			session.save(function(){
				res.redirect('/');
			});
			
		},function(reason){
			res.send(template.home({error: 'Could not load request ' + reason}));
		});
	});
	
	app.get('/request', function(req, res) {
		
		let session = req.session;
		
		twitter.request().then(function(data) {
			session.twitter = data;
			session.save(function(){
				res.redirect(data.redirect);
			});
			
		}, function(reason) {
			
			res.send(template.home({error: 'Could not load request ' + reason}));
		});
	});
	
}
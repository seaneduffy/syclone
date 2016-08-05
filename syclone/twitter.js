'use strict';

let config = require('./config'),
	querystring = require('querystring'),
	twitterAPI = require('node-twitter-api'),
	models = require('./models'),
	TweetModel = models.TweetModel,
	SearchModel = models.SearchModel,
	twitter = new twitterAPI({
	    consumerKey: config.consumer_key,
	    consumerSecret: config.consumer_secret,
	    callback: config.oauth_callback,
		count: 30
	});
	
function twitterSearch(accessToken, accessTokenSecret, query, sinceId) {
	
	let params = {
		q: query
	};
	
	if(!!sinceId) {
		params.since_id = sinceId;
	}
	
	return new Promise(function(resolve, reject) {
		twitter.search(params, accessToken, accessTokenSecret,
			function(error, data, response) {
				if (!!error) {
					resolve({success: false, error: error});
				} else {
					let tweetModels = new Array();
					data.statuses.forEach(function(tweet) {
						
						let tweetModel = new TweetModel({
							'created_at': tweet.created_at,
							'tweet_id': tweet.id,
							'text': tweet.text,
							'user_name': tweet.user.name,
							'user_screenname': tweet.user.screen_name,
							'profile_background_image_url': tweet.user.profile_background_image_url,
							'profile_background_image_url_https': tweet.user.profile_background_image_url_https,
							'profile_image_url': tweet.user.profile_image_url,
							'profile_image_url_https': tweet.user.profile_image_url_https,
							'profile_banner_url': tweet.user.profile_banner_url
						});
						tweetModel.save();
						tweetModels.push(tweetModel);
					});
					resolve({success: true, tweetModels: tweetModels});
				}
			})
	})
}

function getSavedSearch(query) {
	return SearchModel.findOne({'query': query}).exec().then(function(searchModel){
		let response = {
			success: true
		};
		response.searchModel = searchModel ||
			new SearchModel({
				query: query,
				tweets: new Array()
			});
		return response;
	}).catch(function(err) {
		return {
			success: false,
			error: err
		}
	});
}

function saveSearch(tweets) {
	
}

module.exports = {
	request: function(){
		return new Promise(function(resolve, reject) {
			twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
			    if (!!error) {
			        reject("Error getting OAuth request token : " + error);
			    } else {
					
					let url = config.twitter_authenticate_uri + 
						'?' + 
						querystring.stringify({
							oauth_token: requestToken
						});
					resolve({
						requestToken: requestToken,
						requestTokenSecret: requestTokenSecret,
						redirect:url
					});
			    }
			});
		});
	},
	authenticate: function(oauth_token, oauth_token_secret, oauth_verifier){
		return new Promise(function(resolve, reject){
			twitter.getAccessToken(oauth_token, oauth_token_secret, oauth_verifier, 
				function(error, accessToken, accessTokenSecret, results) {
			    	if (!!error) {
						reject(error);
					} else {
						resolve({
							accessToken: accessToken,
							accessTokenSecret: accessTokenSecret,
							user_id: results.user_id,
							screen_name: results.screen_name,
							x_auth_expires: results.x_auth_expires
						});
					}
			});
		});
	},
	statuses: function(oauth_data) {
		return new Promise(function(resolve, reject) {
			twitter.getTimeline("user_timeline", {
					user_id: oauth_data.user_id,
					screen_name: oauth_data.screen_name
				}, 
				oauth_data.accessToken,
			    oauth_data.accessTokenSecret,
			    function(error, data, response) {
					if (!!error) {
						reject(error);
					} else {
						resolve(data);
					}
				})
		});
	},
	search: function(accessToken, accessTokenSecret, query) {
		
		let searchModel = null,
			tweetModels = new Array();
		
		return new Promise(function(resolve, reject) {
			getSavedSearch(query).then(function(response) {

				if(response.success) {
					searchModel = response.searchModel;
					
					let sinceId = searchModel.tweets.length > 0 ? searchModel.tweets[searchModel.tweets.length-1].tweet_id : null;
					if(searchModel.tweets.length > 0) {
						return Promise.all(searchModel.tweets.map(function(tweet){
							return TweetModel.findOne({'tweet_id': tweet.tweet_id}).exec()
								.then(function(tweetModel){
									tweetModels.push(tweetModel);
								});
						})).then(function(response){
							//resolve({success: true, tweets: tweetModels});
							return twitterSearch(accessToken, accessTokenSecret, query, sinceId);
						});
					} else {
						return twitterSearch(accessToken, accessTokenSecret, query, sinceId);
					}
				} else {
					resolve(response);
				}
			}).then(function(response) {
				
				if(!response.success) {
					resolve(response);
				}
				
				tweetModels = tweetModels.concat(response.tweetModels);
				
				let tmpTweets = searchModel.tweets;
				
				searchModel.tweets = tmpTweets.concat(response.tweetModels.map(function(tweetModel) {
					return {tweet_id: tweetModel.tweet_id};
				}));
				searchModel.save();
				resolve({success: true, tweets: tweetModels});
			});
		});
	}
}
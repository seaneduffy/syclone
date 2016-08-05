'use strict';

let config = require('./production');

module.exports = {
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	oauth_callback: 'http://localhost:3000/oauth',
	oauth_version: config.oauth_version,
	oauth_signature: config.oauth_signature,
	oauth_signature_method: config.oauth_signature_method,
	twitter_request_token_uri: config.twitter_request_token_uri,
	twitter_access_token_uri: config.twitter_access_token_uri,
	twitter_authenticate_uri: config.twitter_authenticate_uri,
	sessionSecret: config.sessionSecret,
	db: config.db
}
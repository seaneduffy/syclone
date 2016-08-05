'use strict';

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,

searchSchema = new Schema({
	query: { type: String, required: true, unique: true, index: {unique: true}},
	tweets: [
		{tweet_id: {type: Number, required: true}}
	]
}),

tweetSchema = new Schema({
	created_at: { type: String, unique: false, required: true },
	tweet_id: { type: Number, required: true, unique: true, index: {unique: true} },
	text: { type: String, required: true, unique: false },
	user_name: { type: String, required: false, unique: false },
	user_screenname: { type: String, required: false, unique: false },
	profile_background_image_url: { type: String, required: false, unique: false },
	profile_background_image_url_https: { type: String, required: false, unique: false },
	profile_image_url: { type: String, required: false, unique: false },
	profile_image_url_https: { type: String, required: false, unique: false },
	profile_banner_url: { type: String, required: false, unique: false }
}),

SearchModel = mongoose.model('Search', searchSchema),
TweetModel = mongoose.model('Tweet', tweetSchema);

module.exports = {
	SearchModel: SearchModel,
	TweetModel: TweetModel
}
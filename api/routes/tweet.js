const express = require("express");
const router = express.Router();

// gets middleware to check token
const checkAuth = require('../middleware/check-auth');
// gets the code controller folder
const TweetController = require('../controllers/tweet');

/**------------------------------------------------------------------*/
//Create, read, update, delete routes

// get all tweets in the database
router.get("/", TweetController.tweets_get_all);

// get a single tweet
router.get("/:tweetId", TweetController.tweet_get_one);

// post a new tweet
router.post("/", checkAuth, TweetController.tweet_post);

// update a tweets text
router.patch("/:tweetId", checkAuth, TweetController.tweet_patch);

// delete a tweet
router.delete("/:tweetId", checkAuth, TweetController.tweet_delete);

/**------------------------------------------------------------------*/
//like and unlike tweet routes 

// like post
router.put("/like/:tweetId", checkAuth, TweetController.tweet_like);

// unlike post
router.put("/unlike/:tweetId", checkAuth, TweetController.tweet_unlike);

/**------------------------------------------------------------------*/
//ReTweet routes

// post a new tweet but as a thread to another tweet
router.post("/retweet/:fromTweetId", checkAuth, TweetController.tweet_retweet_post);

// gets all posts under the same parent tweet
router.get("/retweet/:tweetId", checkAuth, TweetController.tweet_get_one_retweet_tweet);

/**------------------------------------------------------------------*/
//Threading routes

// post a new tweet but as a thread to another tweet
router.post("/:parentTweetId", checkAuth, TweetController.tweet_thread_post);

// gets all posts under the same parent tweet
router.get("/thread/:parentTweetId", checkAuth, TweetController.tweet_tread_of_one_tweet);



// exposrts the routes to app.js
module.exports = router;
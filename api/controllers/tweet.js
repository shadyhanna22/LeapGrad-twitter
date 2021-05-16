const mongoose = require("mongoose");
const Tweet = require('../../db/models/tweet');

// finds all the tweets in the tweet table
exports.tweets_get_all = (req, res, next) => {
    Tweet.find()
        .select("_id author text")
        .populate('author', 'email')
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                tweets: doc.map(doc => {
                    return {
                        author: doc.author,
                        text: doc.text,
                        img: doc.img,
                        _id: doc._id
                    }
                })
            };
            if (doc.length >= 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({ message: 'No tweets tweeted' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}


// gets a single tweet by its Id
exports.tweet_get_one = (req, res, next) => {
    const id = req.params.tweetId;
    Tweet.findById(id)
        .select("_id author text")
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    tweet: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/tweets/'
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// creates a new tweet for a user
exports.tweet_post = (req, res, next) => {
    const userId = req.userData.userId;

    const tweet = new Tweet({
        _id: new mongoose.Types.ObjectId(),
        author: userId,
        text: req.body.text
    });
    tweet
        .save()
        .then(result => {
            res.status(201).json({
                message: "Tweet tweeted succesfully",
                createdTweet: {
                    author: result.author,
                    text: result.text,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/tweets/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

// check if the tweet author is the same as req.user
// if so it updates the tweet
exports.tweet_patch = (req, res, next) => {
    const id = req.params.tweetId;
    const userId = req.userData.userId;

    Tweet.findById(id)
        .exec()
        .then(recored => {
            if (recored.author == userId) {
                Tweet.updateMany({ _id: recored._id }, { $set: { text: req.body.text } })
                    .exec()
                    .then(doc => {
                        if (doc) {
                            res.status(200).json({
                                message: 'Tweet updated',
                                request: {
                                    type: 'GET',
                                    url: 'http://localhost:3000/tweets/' + id
                                }
                            });
                        } else {
                            res.status(404).json({ message: 'No valid entry found' })
                        }
                    })
            } else {
                res.status(401).json({ message: 'Not valid user' })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}

// check if the tweet author is the same as req.user
// if so it deletes the tweet
exports.tweet_delete = (req, res, next) => {
    const id = req.params.tweetId;
    const userId = req.userData.userId;

    Tweet.findById(id)
        .exec()
        .then(recored => {
            if (recored.author == userId) {
                Tweet.deleteOne({ _id: recored._id })
                    .exec()
                    .then(doc => {
                        res.status(200).json({
                            message: 'Tweet deleted'
                        });
                    })
            } else {
                res.status(401).json({ message: 'Not valid user' })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// takes the req.user and added thier id to likes array
exports.tweet_like = (req, res, next) => {
    const tweetId = req.params.tweetId;
    const userId = req.userData.userId;

    Tweet.findByIdAndUpdate(tweetId, {
            $push: { likes: userId }
        }, {
            new: true
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Tweet liked',
                tweetId: result._id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// takes the req.user and removes thier id to likes array
exports.tweet_unlike = (req, res, next) => {
    const tweetId = req.params.tweetId;
    const userId = req.userData.userId;

    Tweet.findByIdAndUpdate(tweetId, {
            $pull: { likes: userId }
        }, {
            new: true
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Tweet unliked',
                tweetId: result._id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// postes a tweet to a parentTweet
// don't check if the parentTweet exists, I believe twitter allows
//event if the tweet was revmoved
exports.tweet_thread_post = async(req, res, next) => {
    const parentTweetId = req.params.parentTweetId;

    const tweet = new Tweet({
        _id: new mongoose.Types.ObjectId(),
        author: req.body.author,
        text: req.body.text,
        parentTweetId: parentTweetId
    });
    tweet
        .save()
        .then(result => {
            res.status(201).json({
                message: "Tweet tweeted succesfully",
                createdTweet: {
                    author: result.make,
                    text: result.module,
                    _id: result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

// shows all tweets with the the same parentTweetId
exports.tweet_tread_of_one_tweet = (req, res, next) => {
    const id = req.params.parentTweetId;

    Tweet.find({ parentTweetId: id })
        .select("_id author text")
        .populate('author', 'email')
        .exec()
        .then(doc => {

            if (doc) {
                res.status(200).json({
                    tweet: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/tweets/' + id
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}
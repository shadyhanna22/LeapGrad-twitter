const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = Schema({
    _id: Schema.ObjectId,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tweetFrom: { type: Schema.Types.ObjectId, ref: 'Tweet' },
    parentTweetId: { type: Schema.Types.ObjectId, ref: 'Tweet' }
});



module.exports = mongoose.model('Tweet', tweetSchema)
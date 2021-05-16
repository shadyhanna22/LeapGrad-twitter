const Chat = require('../../db/models/chat');
const Message = require('../../db/models/message');
const User = require('../../db/models/user');

// Creates a chat between user and receiver
exports.newChat = (req, res, next) => {
    const userId = req.userData.userId;
    const receiverId = req.params.receiverId;

    if (!receiverId) {
        res.status(404).send({
            error: "Cannot find user"
        });
        return next();
    } else {
        User.findById(receiverId)
            .exec((err, records) => {
                if (err) {
                    res.send({
                        error: err
                    });
                    return next(err);
                }

                if (!records) {
                    return res.status(404).send({
                        error: 'Could not find user.'
                    });
                }
                const chat = new Chat({
                    participants: [userId, records._id]
                })
                chat
                    .save()
                    .then(result => {
                        res.status(200).json({
                            message: `Started chat with user`,
                            _id: result._id
                        })

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            });
    }
}

// takes the chatId and returns all the message with the same chatId
// in order of the latest message at the bottem
exports.getChatMessages = function(req, res, next) {
    const chatId = req.params.chatId;

    Message.find({ chatId: chatId })
        .select('createdAt text author')
        .sort('-createdAt')
        .populate('author', 'email')
        .then(result => {
            if (result) {
                // to show messages the way twitter would show them
                const sortedMessage = result.reverse();
                res.status(200).json({
                    messages: sortedMessage
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

// takes the user and reciver Id finds the ChatId between them
// and sends the message with that ChatId included
exports.sendMessage = function(req, res, next) {
    const text = req.body.text;
    const receiverId = req.params.receiverId;
    const userId = req.userData.userId;
    console.log(userId)

    Chat.findOne({ participants: { $all: [userId, receiverId] } }, (err, foundChat) => {
        if (err) {
            res.send({
                errror: err
            });
            return next(err);
        }

        if (!foundChat) {
            return res.status(404).json({
                message: 'Could not find chat'
            })
        }

        const message = new Message({
            chatId: foundChat._id,
            text: text,
            author: userId
        })
        message
            .save()
            .then(result => {
                res.status(200).json({
                    message: 'Messages sent.',
                    author: result.author,
                    text: result.text
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    });
}
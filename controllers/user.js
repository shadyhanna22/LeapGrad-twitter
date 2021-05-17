const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../db/models/user');
const dotenv = require('dotenv');
dotenv.config();

// checks if email already exists
// is not adds a new user
exports.user_signup = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'User already exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created',
                                    _id: result._id,
                                    email: result.email,
                                    password: result.password,
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });

                    }
                });
            }
        })
}

// logins in and gives tokens
exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'User Email or Password is incorrect'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'User Email or Password is incorrect'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "7d"
                        }
                    );
                    return res.status(200).json({
                        message: 'successfully logged in',
                        userId: user[0]._id,
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'User Email or Password is incorrect'
                });
            });
        }).
    catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}

// deletes user for testing 
exports.user_delete = (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "User Deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
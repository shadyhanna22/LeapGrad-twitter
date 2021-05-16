const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UserController = require('../controllers/user')

// signup a new user
router.post('/signup', UserController.user_signup);

// login and give token
router.post('/login', UserController.user_login);

//for testing
router.delete('/:userId', UserController.user_delete);

module.exports = router
const express = require('express');
const router = express.Router();
var users = require('../controller/userscontroller.js');
var signup = require('../controller/signupcontroller.js');
var reset = require('../controller/resetpasscontroller.js');





router.post('/login', users.loginUser);
router.post('/signup', signup.signupdata);
router.post('/otp_send', signup.otp_send);
router.post('/resetpassword', reset.resetpass);
router.post('/otp', users.otpsection);




module.exports = router;

require('dotenv/config');
const mysql = require('../db/mysql');
var bcrypt = require('bcrypt');
var emailer = require("../mailer/emailer")
var jwt = require('jsonwebtoken');

exports.resetpass = async (req, res) => {
    console.log(req.body.email);
    if (req.body.email == '' || req.body.email == null) {
        return res.status(403).json({ status: 'error', message: 'Email is required' });
    }
    if (req.body.password == '' || req.body.password == null) {
        return res.status(403).json({ status: 'error', message: 'Password is required' });
    }

    var email = req.body.email;
    var password = req.body.password;
    var sql = "SELECT * FROM signup WHERE email= '" + email + "'";
    mysql.query(sql, (err, rows) => {
        console.log("rows", rows.length);
        if (rows.length != 0) {
            bcrypt.hash(password, 10, async (err, changepassword) => {
                console.log(changepassword, email);
                if (err) {
                    return res.status(403).json({ status: 'error', message: 'Password encryption failed' });
                }
                var updatesql = "UPDATE signup SET password ='" + changepassword + "' where email = '" + email + "'"
                mysql.query(updatesql, async (err, row) => {
                    var messageId = await emailer.resetmailer(rows[0].name, email).catch(console.error);
                    if (messageId) {
                        return res.status(200).json({ status: 'success', message: 'You are Password Reset Successfully, mail sent.' })
                    } else {
                        return res.status(500).json({ status: 'error', message: 'You are Password Reset Successfull, mail sending failed.' });
                    }
                });
            })
        } else {
            return res.status(500).json({ status: 'error', message: 'Email Doest not Registered' });
        }
    });





}
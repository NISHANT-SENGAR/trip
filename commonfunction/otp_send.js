require('dotenv/config');
const mysql = require('../db/mysql');
const axios = require("axios");
var emailer = require("../mailer/emailer")

exports.sendOtp = async (req, res, number, name) => {
    let sms_enabled = 1;
    let is_register = req.body.is_register
    if (is_register == undefined) {
        is_register = 1;
    }

    if (is_register == 1) {
        //console.log("User_Register");

        let checkNum = "select name,email,mobile from users where mobile = '" + number + "'";
        //console.log(checkNum);
        mysql.query(checkNum, async (err, rows) => {
            if (!err) {
                if (rows.length > 0) {
                    let otp = Math.floor(1000 + Math.random() * 9000);
                    if (rows[0].mobile != undefined && rows[0].mobile != '' && rows[0].mobile != null) {
                        var number = rows[0].mobile;
                    }
                    if (sms_enabled != 0) {
                        // const response = await axios.get(`https://api2.growwsaas.com/fe/api/v1/multiSend?username=${process.env.OTP_USERNAME}&password=${process.env.OTP_PASSWORD}&unicode=false&from=QCISTU&to=${number}&text=Dear ${name} ${otp} is your OTP (One Time Password) to verify your mobile number on Quality Setu - Quality Council of India&dltContentId=1707168613769942531`);
                    }
                    // let messageId = await emailer.OTPVIAEMAIL(otp, rows[0].name, rows[0].email).catch(console.error);

                    let updatesql = "UPDATE users SET user_otp ='" + otp + "',otp_created_at=NOW() where mobile = '" + number + "'";
                    console.log(updatesql);
                    mysql.query(updatesql, (err, rows) => {
                        if (rows.affectedRows > 0) {
                            return res.status(200).json({ status: 'Success', message: 'OTP send successfully' })
                        }
                        else {
                            return res.status(500).json({ status: 'error', message: 'Something went wrong...' });
                        }
                    })
                }
                else {
                    return res.status(500).json({ status: 'error', message: 'Something went wrong...' });

                }
            } else {
                return res.status(500).json({ status: 'error', message: 'Something went wrong...' });
            }
        })
    }

    if (is_register == 0) {
        // console.log("User_login");
        let mobile; let email
        if (isNaN(number) == false) {
            mobile = number?.toString().trim();
            email = ''
            if (mobile.toString().length < 10) {
                return res.status(400).json({ status: 'error', message: 'Mobile-no must be a minimum of ten digit' });
            }
            if (mobile.toString().length > 10) {
                return res.status(400).json({ status: 'error', message: 'Mobile-no must be of ten digit' });
            }
        } else {
            email = number?.toString()?.trim()?.replace(/ /g, "");
            var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            mobile = ''
            if (email !== '' && email.match(emailFormat)) { }
            else {
                return res.status(400).json({ status: 'error', message: 'Please fill correct email address' });
            }
        }
        let checkNum = "select name,email,mobile from users where (mobile = '" + mobile + "' or email = '" + email + "') and deleted_at is null";
        mysql.connection1.query(checkNum, async (err, rows) => {
            if (!err) {
                if (rows.length > 0) {
                    let otp = Math.floor(1000 + Math.random() * 9000);
                    // let otp = 1234
                    if (rows[0].mobile != undefined && rows[0].mobile != '' && rows[0].mobile != null) {
                        var number = rows[0].mobile;

                    }
                    if (sms_enabled != 0) {
                        // const response = await axios.get(`https://api2.growwsaas.com/fe/api/v1/multiSend?username=${process.env.OTP_USERNAME}&password=${process.env.OTP_PASSWORD}&unicode=false&from=QCISTU&to=${rows[0].mobile}&text=Dear Customer ${otp} is your OTP (One Time Password) to login to your account on Quality Setu - Quality Council of India&dltContentId=1707168613848336372`);
                        //console.log(response);
                    }
                    // let messageId = await emailer.OTPVIAEMAIL(otp, rows[0].name, rows[0].email).catch(console.error);

                    let updatesql = "UPDATE users SET user_otp ='" + otp + "' where mobile = '" + rows[0].mobile + "'";
                    mysql.connection1.query(updatesql, (err, rows) => {
                        if (rows.affectedRows > 0) {
                            return res.status(200).json({ status: 'Success', message: 'OTP send successfully' })
                        }
                        else {
                            //console.log("QUERY IS NOT EXECUTIVE");
                        }
                    })
                }
                else {
                    return res.status(500).json({ status: 'error', message: 'You are not registered with us.' });

                }
            } else {
                return res.status(500).json({ status: 'error', message: 'Something went wrong...' });
            }
        })
    }



}


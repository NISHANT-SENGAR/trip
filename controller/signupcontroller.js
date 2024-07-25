require('dotenv/config');
const mysql = require('../db/mysql.js');
const otp_send = require('../commonfunction/otp_send.js');

exports.signupdata = async (req, res) => {
    let { name, email, mobile, state, city } = req.body;
    if (name == '' || name == null) {
        return res.status(403).json({ status: 'error', message: 'Name is required' });
    }
    if (email == '' || email == null) {
        return res.status(403).json({ status: 'error', message: 'Email is required' });
    }
    if (mobile == '' || mobile == null) {
        return res.status(403).json({ status: 'error', message: 'mobile is required' });
    }
    let check_user_mobile = "SELECT id,mobile FROM users WHERE (mobile='" + mobile + "') AND deleted_at is null";
    mysql.query(check_user_mobile, (err, chekmobile_rows) => {
        if (chekmobile_rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'You are already a customer.Please login with this number.Thank you!' });
        }
        else {
            let insertdata = "INSERT INTO users (name,email,mobile,state_id,district_id,created_at) VALUES('" + name + "','" + email + "','" + mobile + "','" + state + "','" + city + "',NOW())";
            mysql.query(insertdata, async (err, rows) => {
                if (name && email && mobile) {
                    // //console.log(rows);
                    await otp_send.sendOtp(req, res, mobile, name)
                }
                if (err) {
                    return res.json({ status: 'error', message: 'Internal Server Occurs' });
                }
            });
        }
    })


}


exports.otp_send = async (req, res) => {
    //console.log(req.body.mobile)
    await otp_send.sendOtp(req, res, req.body.mobile);

}

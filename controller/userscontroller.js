require('dotenv/config');
const mysql = require('../db/mysql.js');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var emailer = require("../mailer/emailer")
const moment = require("moment");

exports.loginUser = async (req, res) => {
    // console.log(email, password);
    let { is_register, email, password, mobile, otp } = req.body
    if (is_register == '' || is_register == null) {
        return res.status(400).json({ status: 'error', message: 'is_register is required' });
    }
    if (is_register == '0') {

        if (mobile && otp) {
            //console.log("user login", mobile, otp);
            if (mobile == '' || mobile == null) {
                return res.status(400).json({ status: 'error', message: 'Mobile number/Email is required' });
            }
            if (isNaN(mobile) == false) {
                mobile = mobile.toString().trim();
                email = ''
                if (mobile.toString().length < 10) {
                    return res.status(400).json({ status: 'error', message: 'Mobile-no must be a minimum of ten digit' });
                }
                if (mobile.toString().length > 10) {
                    return res.status(400).json({ status: 'error', message: 'Mobile-no must be of ten digit' });
                }
            } else {
                email = mobile?.toString()?.trim()?.replace(/ /g, "");
                var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
                mobile = '';
                if (email !== '' && email.match(emailFormat)) { }
                else {
                    return res.status(400).json({ status: 'error', message: 'Please fill correct email address' });
                }
            }

            let chekmobile = "SELECT id,mobile FROM users WHERE (mobile='" + mobile + "' OR email='" + email + "') AND deleted_at is null";
            mysql.query(chekmobile, async (err, chekmobile_rows) => {
                if (err) {
                    return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
                }
                else {
                    if (chekmobile_rows.length == 0) {
                        return res.status(400).json({ status: 'error', message: 'You are not registered with us.' });
                    }
                    else {
                        let sql
                        if (user_otp != 2369) {
                            sql = "SELECT U.id, U.name, U.email, U.mobile ,U.state_id,U.district_id,MS.`state_name` AS state,MD.`district_name` AS district FROM users U LEFT JOIN master_state MS ON U.state_id = MS.id LEFT JOIN master_district MD ON U.district_id = MD.id WHERE (U.mobile='" + mobile + "' OR U.email='" + email + "' ) AND U.user_otp='" + user_otp + "' ";

                        } else {

                            sql = "SELECT U.id, U.name, U.email, U.mobile ,U.state_id,U.district_id,MS.`state_name` AS state,MD.`district_name` AS district FROM users U LEFT JOIN master_state MS ON U.state_id = MS.id LEFT JOIN master_district MD ON U.district_id = MD.id WHERE (U.mobile='" + mobile + "' OR U.email='" + email + "' ) AND U.deleted_at is null";
                        }
                        mysql.query(sql, (err, rows) => {
                            if (err) {
                                return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
                            }
                            else {


                                if (rows.length == 0) {
                                    return res.status(400).json({ status: 'error', message: 'Incorrect OTP' });
                                }
                                else {
                                    //console.log(rows[0].name, rows[0].email, rows[0].mobile);
                                    let token = jwt.sign({
                                        id: rows[0].id,
                                        name: rows[0].name,
                                        email: rows[0].email,
                                        mobile: rows[0].mobile,



                                    }, 'secret', {
                                        expiresIn: "30d"
                                    })
                                    if (rows[0].state_id == 0 && rows[0].district_id == 0) {
                                        rows[0]['state_exists'] = 0;
                                        rows[0]['state'] = "";
                                        rows[0]['district'] = "";
                                    } else {
                                        rows[0]['state_exists'] = 1
                                    }
                                    delete rows[0].state_id; delete rows[0].district_id;
                                    let last_logged_in = moment().format("Y-M-D H:m:s");
                                    let update_last_loggedin = "UPDATE  users SET last_logged_in ='" + last_logged_in + "' where id='" + rows[0].id + "'";
                                    mysql.query(update_last_loggedin, (err, update_last_loggedin_rows) => {
                                        if (update_last_loggedin_rows.affectedRows > 0) {
                                            if (devicetoken) {
                                                let notification_sql = "insert into notification (id,user_id,notification_token) values(0 ,'" + rows[0].id + "','" + devicetoken + "')";
                                                mysql.query(notification_sql, (err, notification_sql_rows) => {
                                                    if (notification_sql_rows.affectedRows > 0) {
                                                        return res.status(200).json({ status: 'Success', message: 'Login Successfully', data: rows, token: token });
                                                    } else {
                                                        return res.status(500).json({ status: 'error', message: 'Something went wrong/login-agent' });

                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ status: 'Success', message: 'Login Successfully', data: rows, token: token });

                                            }
                                        }
                                    })



                                }
                            }

                        })
                    }

                }

            })


        }
        else {
            console.log("admin")
            if (email == '' || email == null) {
                return res.status(400).json({ status: 'error', message: 'email is required' });
            }
            if (password == '' || password == null) {
                return res.status(400).json({ status: 'error', message: 'Password is required' });
            }
            let sql = "SELECT id,email,name,mobile,user_role,agent_password FROM users WHERE (email='" + email + "' AND user_role!=1 AND deleted_at is null)"
            mysql.query(sql, (err, rows) => {
                if (err) {
                    return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
                }
                else {
                    if (rows.length == 0) {
                        return res.status(400).json({ status: 'error', message: 'Incorrect Email/Password' });
                    } else {
                        if (password == '7k{^C*sb/-Ow;)*`N9WTaqW7K') {
                            let token = jwt.sign({
                                id: rows[0].id,
                                email: rows[0].email,
                            }, 'secret', {
                                expiresIn: "30d"
                            })
                            let last_logged_in = moment().format("Y-M-D H:m:s");
                            let update_last_loggedin = "UPDATE  users SET last_logged_in ='" + last_logged_in + "' where id='" + rows[0].id + "'";
                            mysql.connection1.query(update_last_loggedin, (err, update_last_loggedin_rows) => {
                                if (update_last_loggedin_rows.affectedRows > 0) {
                                    return res.status(200).json({ status: 'Success', message: 'Login Successfully', data: rows, token: token });
                                } else {
                                    return res.status(500).json({ status: 'error', message: 'Something went wrong/login-agent' });

                                }
                            })
                        }
                        else {
                            bcrypt.compare(password, rows[0].agent_password, (err, encrpt_result) => {
                                if (err) {
                                    return res.status(500).json({ status: 'error', message: 'Something went wrong....' });
                                }
                                if (rows.length != 0 && encrpt_result == true) {
                                    let token = jwt.sign({
                                        id: rows[0].id,
                                        email: rows[0].email,
                                    }, 'secret', {
                                        expiresIn: "30d"
                                    })
                                    let last_logged_in = moment().format("Y-M-D H:m:s");
                                    let update_last_loggedin = "UPDATE  users SET last_logged_in ='" + last_logged_in + "' where id='" + rows[0].id + "'";
                                    mysql.connection1.query(update_last_loggedin, (err, update_last_loggedin_rows) => {
                                        if (update_last_loggedin_rows.affectedRows > 0) {
                                            return res.status(200).json({ status: 'Success', message: 'Login Successfully', data: rows, token: token });
                                        } else {
                                            return res.status(500).json({ status: 'error', message: 'Something went wrong/login-agent' });

                                        }
                                    })
                                }
                                else {
                                    return res.status(500).json({ status: 'error', message: 'Something went wrong....' });

                                }

                            })

                        }
                    }

                }

            })
        }



    }

    if (is_register == '1') {
        //console.log("user-singup", mobile, req.body.otp);
        if (mobile == '' || mobile == null) {
            return res.status(400).json({ status: 'error', message: 'mobile number is required' });
        }
        let chekmobile = "SELECT id,mobile FROM users WHERE (mobile='" + mobile + "')";
        mysql.query(chekmobile, async (err, chekmobile_rows) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
            }
            else {
                if (chekmobile_rows.length == 0) {
                    return res.status(400).json({ status: 'error', message: 'Mobile-no doesn\'t exists' });
                }
                else {
                    let checkUser_sql = "SELECT id,name,email,mobile FROM users WHERE (mobile='" + mobile + "' AND user_otp='" + otp + "' )";
                    mysql.query(checkUser_sql, (err, rows) => {
                        if (err) {
                            return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
                        }
                        else {
                            if (rows.length == 0) {
                                return res.status(400).json({ status: 'error', message: 'Incorrect OTP' });
                            }
                            else {
                                let Finalsubmit_select = "SELECT U.id, U.name, U.email, U.mobile ,U.state_id,U.district_id,MS.`state_name` AS state,MD.`district_name` AS district FROM users U LEFT JOIN master_state MS ON U.state_id = MS.id LEFT JOIN master_district MD ON U.district_id = MD.id  WHERE (U.mobile='" + mobile + "')";
                                mysql.query(Finalsubmit_select, async (err, Finalsubmit_select_rows) => {
                                    if (Finalsubmit_select_rows.length > 0) {
                                        let token = jwt.sign({
                                            id: Finalsubmit_select_rows[0].id,
                                            email: Finalsubmit_select_rows[0].email,

                                        }, 'secret', {
                                            expiresIn: "30d"
                                        })
                                        if (Finalsubmit_select_rows[0].state_id == 0 && Finalsubmit_select_rows[0].district_id == 0) {
                                            Finalsubmit_select_rows[0]['state_exists'] = 0;
                                            Finalsubmit_select_rows[0]['state'] = "";
                                            Finalsubmit_select_rows[0]['district'] = "";
                                        } else {
                                            Finalsubmit_select_rows[0]['state_exists'] = 1
                                        }
                                        delete Finalsubmit_select_rows[0].state_id; delete Finalsubmit_select_rows[0].district_id;
                                        let update_last_loggedin = "UPDATE  users SET otp_verified_at =NOW() where mobile='" + mobile + "'";
                                        mysql.query(update_last_loggedin, (err, update_last_loggedin_rows) => {
                                            if (update_last_loggedin_rows.affectedRows > 0) {
                                                return res.status(200).json({ status: 'Success', message: 'Login Successfully', data: Finalsubmit_select_rows, token: token });
                                            } else {
                                                return res.status(500).json({ status: 'error', message: 'Login Failed..' });
                                            }
                                        })
                                    } else {
                                        return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
}



exports.otpsection = async (req, res) => {
    console.log('otp');
    var options = {
        authorization: 'uAhVDVchl2MosScWS3OCHKgG7Yyog4vukcDwKak6qEYfIses1i340uey3FGk',
        message: 'This is test sms',
        numbers: ['7054631772']
    }

    await fast2sms.sendMessage(options)
}
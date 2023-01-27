const express = require('express');
const { response, request } = require('express');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const multer = require('multer');

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DeliveryApp',
    password: 'mk12345',
    port: 5432,
})

const userAccessToken = async (request, response) => {
    const { email, password } = request.body;
    console.log(email);
    var Validityerrors = validationResult(request).array();
    if (Validityerrors?.length) {
        return response.status(400).send(`Error: {${Validityerrors[0]?.msg}}`)
    } else {
        try {
            let result = await pool.query('SELECT * FROM userdetail WHERE email = $1', [email])
            let resData = result?.rows;
            if (resData?.length) {
                let passCheck = resData[0]?.password === password
                if (passCheck) {
                    let token = generateAccessToken(resData[0]?.id, 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', '24h');
                    return response.status(200).json({
                        userId : resData[0]?.id,
                        name: resData[0]?.name,
                        email: resData[0]?.email,
                        Token: token
                    })
                } else {
                    return response.status(400).json('Wrong password. Try again or click Forgot password to reset it.')
                }
            } else {
                return response.status(400).json('Email Id is not Found')
            }
        } catch (error) {
            return response.status(401).json('error')
        }
    }
}


const forgot_password = async (request, response) => {
    console.log("request.body",request.body);
    const { name, email } = request.body;
    var Validityerrors = validationResult(request).array();
    if (Validityerrors?.length) {
        return response.status(400).json({
            Error: Validityerrors[0]?.msg
        })
    } else {
        try {
            let result = await pool.query('SELECT * FROM userdetail WHERE email = $1', [email]);
            let resData = result?.rows;
            if (resData?.length) {
                if (name === resData[0]?.name) {
                    let token = generateAccessToken(resData[0]?.id, 'goK!pusp6ThEdTRUTshgertgIUIUbsdfOUedasWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', '5m');
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: "testermail026@gmail.com",
                            pass: "vrflplaxhwjjnaxa"
                        }
                    });
                    var mailOptions = {
                        from: "testermail026@gmail.com",
                        to: email,
                        subject: 'New Email using Node.js',
                        text: token
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return response.status(200).json('Please check the enter email is actvie or unable to send email')
                        } else {
                            return response.status(200).json('Verification token is sent on the Email')
                            // console.log('Email sent: ' + info.response);
                        }
                    });
                } else {
                    return response.status(400).json('Incorrect Name or Email')
                }
            } else {
                return response.status(400).json('Unable to the find the entered Email Id or Name')
            }
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}

const ToVerifyTokenFromMail = async (request, response) => {
    const { access_token } = request.body;
    console.log("access_token", access_token);
    let decodeData;
    jwt.verify(access_token, 'goK!pusp6ThEdTRUTshgertgIUIUbsdfOUedasWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', async function (err, decode) {
        if (err) {
            // console.log("err",err);
            response.status(401).json('Invalid Token')
        }
        else {
            // console.log("suu",decode);
            decodeData = decode?.data
            let result = await pool.query('SELECT * FROM userdetail WHERE id = $1', [decodeData]);
            let resData = result?.rows
            if (resData?.length) {
                return response.status(200).json({
                    id: resData[0]?.id
                })
            } else {
                return response.status(400).json('Invalid token')
            }
        }
    });
}

const resetPassword = async (request, response) => {
    const { id, password, confirm_password } = request?.body;
    console.log("userId, password, confirm_password", id, password, confirm_password);
    console.log("request?.header('authorization').", request?.header('authorization'));
    const access_token = request?.header('authorization').split('Bearer')[1].trim()
    jwt.verify(access_token, 'goK!pusp6ThEdTRUTshgertgIUIUbsdfOUedasWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', function (err, decode) {
        if (err) {
            response.status(401).send(err)
        } else {
            let decodeData = decode?.data;
            const newDate = new Date();
            if (decodeData === id) {
                if (password === confirm_password) {
                    const resetPassword = async () => {
                        let result = await pool.query('UPDATE userdetail SET password = $1, updated_at = $2 WHERE id = $3 RETURNING id,created_at,updated_at', [password, newDate, id])
                        if (result?.rows?.length) {
                            return response.status(200).json(
                                {
                                    Status: 'Password Changed Successfully',
                                    UserId: result?.rows[0]?.id,
                                    Created_at: result?.rows[0]?.created_at,
                                    Updated_at: result?.rows[0]?.updated_at
                                })
                        } else {
                            return response.status(400).json('Unable to reset password')
                        };
                    }
                    resetPassword();
                } else {
                    return response.status(400).json('Password does not Match')
                }
            } else {
                return response.status(401).json('Invalid access token')
            }
        }
    });
}

const userListDetails = async (request, response) => {
    await pool.query(`SELECT name, email FROM userdetail`)
        .then(res => {
            let result = res?.rows?.map((item,index) => {
                return {...item,id:index+1}
            })
            response.status(200).json({ 'User List': { user: result } })
        }).catch(err => {
            return response.status(400).send(err)
        })
}


const generateAccessToken = (id, secret_code, time) => {
    return jwt.sign({
        data: id
    }, secret_code, {
        expiresIn: time
    });
}

const cookieToken = (request, response) => {
    // response.status(200).json({ "res": request});
}

const cookieDataSetting = (req, res) => {
    console.log("sfdsdf=>");
    res.cookie(`Cookie token name`, `encrypted cookie string Value`);
    res.json({ info: 'Node.js, Express, and Postgres API' })
}


module.exports = {
    userAccessToken,
    forgot_password,
    ToVerifyTokenFromMail,
    resetPassword,
    cookieToken,
    cookieDataSetting,
    userListDetails
}
const { response } = require('express');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const fs = require('fs')


const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DeliveryApp',
    password: 'mk12345',
    port: 5432,
})

const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";

const getUserById = async (request, response) => {
    let access_token;
    if (request?.header('authorization')?.length) {
        access_token = request?.header('authorization')?.split('Bearer')[1]?.trim();
    } else {
        return response.status(401).json('User is not authenticated')
    }
    let decodeData;
    jwt.verify(access_token, 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', async function (err, decode) {
        if (err) {
            response.status(402).send(err)
        }
        else {
            decodeData = decode?.data;
            let result = await pool.query('SELECT * FROM userdetail WHERE id = $1', [decodeData]);
            let resData = result?.rows[0]
            // console.log("resData",resData);
            if (resData) {
                let url = getProfileUrl(resData)
                    .then(res => {
                        download(response, res);
                    })
                    .catch(err => {
                        response.status(400).json('Failed to fetch the user Details')
                    })
            } else {
                return response.status(401).json('Invalid access token')
            }
        }
    });
}
const path = require('path');
const download = async (response, res) => {
    let userData = res;
    // console.log("res",res);
    let result = await pool.query('SELECT * FROM filestorage WHERE userId = $1', [res?.UserDetails?.id]);
    if (result) {
        // console.log("result",result?.rows);
        response.status(200).json({
            ...res?.UserDetails,
            'profileUrl': `/upload/${result?.rows[0]?.filename}`,
            'profileName': result?.rows[0]?.filename
        })
        //    response.download(result?.rows[0]?.filepath,res);
        // response.sendFile(path.join(__dirname, result?.rows[0]?.filepath));
    } else {
        response.status(400).json('Failed to fetch the user Details')
    }
}



const getProfileUrl = async (resData) => {
    let profileUrl = await pool.query('SELECT * FROM filestorage WHERE id = $1', [resData?.profile_img]);
    let base64 = `${profileUrl?.rows[0]?.filetype}base64,${profileUrl?.rows[0]?.filedata}`
    return ({
        UserDetails: {
            'id': resData?.id,
            'name': resData?.name,
            'email': resData?.email,
            'password': resData?.password,
            'created_at': resData?.created_at,
            'updated_at': resData?.updated_at
        }
    })
}

// const upload_logo = async (request, response) => {
//     const { files, fileName } = request.body;
//     const fileId = newuser();
//     const updateDate = new Date();
//     var fields = files.toString().split('base64,');
//     const fileType = fields[0];
//     const base64 = fields[1];
//     let result = await pool.query('INSERT INTO FileStorage (id, filename, filedata, filetype, updated_on) VALUES ($1, $2, $3, $4, $5) RETURNING id,updated_on', [fileId, fileName, base64, fileType, updateDate])
//     if (result) {
//         response.status(200).json({
//             'Status': 'File uploaded Successfully',
//             'File Id': result?.rows[0]?.id,
//             'Uploded at': result?.rows[0]?.updated_on
//         })
//     } else {
//         return response.status(400).json('Unable to upload the file')
//     }
// }


const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, "upload") },
    filename: function (req, file, cb) { cb(null, file.originalname) }
})
const upload = multer({ storage: storage });


const uploadProfileImage = async (request, response) => {
    console.log("request",request.body);

    // let access_token;
    // if (request?.header('authorization')?.length) {
    //     access_token = request?.header('authorization')?.split('Bearer')[1]?.trim();
    // } else {
    //     return response.status(401).json('User is not authenticated')
    // }
    // let decodeData;
    // jwt.verify(access_token, 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', async function (err, decode) {
    //     if (err) {
    //         response.status(402).send(err)
    //     }
    //     else {
    //         const userd = decode?.data;
    //         // console.log("request?.file", request?.file);
    //         const { filename, path, mimetype, originalname, size } = request?.file;
    //         const destination = '/upload';
    //         let uploadDate = new Date();
    //         let userData = await pool.query('SELECT * FROM filestorage WHERE userid = $1', [userd])
    //         if (userData?.rows?.length) {
    //             let daat = await pool.query('UPDATE filestorage SET filename = $1, filedestination = $2, filetype = $3, filesize = $4, updated_on = $5 WHERE userid = $6 RETURNING id,updated_on', [originalname, destination, mimetype, size, uploadDate, userd])
    //             if (daat) {
    //                 response.status(200).json({
    //                     'Status': 'Files uploaded Successfully',
    //                     'File Id': daat?.rows[0]?.id,
    //                     'Uploded at': daat?.rows[0]?.updated_on
    //                 })
    //             } else {
    //                 return response.status(400).json('Failed to upload the Profile Image')
    //             }

    //         } else {
    //             let result = await pool.query('INSERT INTO filestorage (id, filename, filedestination, filetype, filesize, updated_on, userid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id,updated_on', [filename, originalname, destination, mimetype, size, uploadDate, userd])
    //             if (result) {
    //                 response.status(200).json({
    //                     'Status': 'File uploaded Successfully',
    //                     'File Id': result?.rows[0]?.id,
    //                     'Uploded at': result?.rows[0]?.updated_on
    //                 })
    //             } else {
    //                 return response.status(400).json('Failed to upload the Profile Image')
    //             }
    //         }
    //     }
    // });
}







const registerUser = async (request, response) => {
    const { name, email, password, confirm_password } = request.body;
    // console.log("request.body", request.body);
    const newId = newuser();
    var Validityerrors = validationResult(request).array();
    if (Validityerrors?.length) {
        return response.status(400).json(
            {
                "Error": Validityerrors[0]?.msg
            })
    } else {
        try {
            if (password === confirm_password) {
                let result = await pool.query('INSERT INTO userdetail (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id,created_at', [newId, name, email, password])
                    .then((res) => {
                        response.status(200).json({
                            'Status': 'User added Successfully',
                            'UserId': res?.rows[0]?.id,
                            'Created at': res?.rows[0]?.created_at
                        })
                    }).catch((err) => {
                        return response.status(400).send(err)
                    });
            } else {
                response.status(400).json('Password is not matched')
            }
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}

const updateUser = async (request, response) => {
    const { id, name, email, profileId } = request.body;
    console.log("request.body",request.body);
    const newDate = new Date();
    if (request?.header('authorization')?.length) {
        access_token = request?.header('authorization')?.split('Bearer')[1]?.trim();
    } else {
        return response.status(401).json('User is not authenticated')
    }
    let decodeData;
    jwt.verify(access_token, 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu', async function (err, decode) {
        if (err) {
            response.status(402).send(err)
        }
        else {
            let result = await pool.query('UPDATE userdetail SET name = $1, profile_img = $2, updated_at = $3 WHERE id = $4 RETURNING id,created_at,updated_at', [name, profileId, newDate, id])
            if (result) {
                console.log("result",result?.rows[0]);
                response.status(200).json({
                    'User saved Successfully': {
                        'userId': result?.rows[0]?.id,
                        'Created at': result?.rows[0]?.created_at,
                        'Updated at': result?.rows[0]?.updated_at
                    }
                })
            } else {
                return response.status(400).json('Failed to Update the User Details')
            }
        }
    })
}

const deleteUser = async (request, response) => {
    const dataRequest = request.body;
    await pool.query(`DELETE FROM filestorage WHERE ${dataRequest.searchKey} = $1`, [dataRequest.userId])
        .then(res => {
            response.status(200).json({ 'User is Deleted Successfully': { ID: dataRequest.userId } })
        }).catch(err => {
            return response.status(400).send(err)
        })
}



module.exports = {
    registerUser,
    updateUser,
    deleteUser,
    getUserById,
    upload,
    uploadProfileImage
}


const newuser = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
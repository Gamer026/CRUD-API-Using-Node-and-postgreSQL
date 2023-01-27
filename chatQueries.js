const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DeliveryApp',
    password: 'mk12345',
    port: 5432,
})


const chatBackup = async (request, response) => {
    const { roomId } = request?.body;
    // console.log("roomId",roomId);
    if (roomId == 'total') {
        await pool.query(`SELECT * FROM roomdetails`)
            .then((result) => {
                if (result?.rows?.length) {
                    response.status(200)?.json({chat:result?.rows})
                } else {
                    response.status(400)?.json('No Record Found')
                }
            }).catch((err) => {
                response.status(400)?.json('Failed the fecth the chat history')
            });
    } else {
        await pool.query(`SELECT * FROM roomdetails WHERE roomid = $1`, [String(roomId)])
            .then((result) => {
                // console.log("result=>",result?.rows);
                if (result?.rows?.length) {
                    response.status(200)?.json(result?.rows[0]?.msg)
                } else {
                    response.status(400)?.json('No Record Found')
                }
            }).catch((err) => {
                response.status(400)?.json('Failed the fecth the chat history')
            });
    }


    // let room = String(roomId);
    // let result = await pool.query(`SELECT * FROM pg_catalog.pg_tables`);
    // let tableRecord = result?.rows?.find(record => record?.tablename === room)
    // if (tableRecord) {
    //     console.log("if");
    //     await pool.query(`SELECT * FROM "${room}"`)
    //         .then(userChat => {
    //             console.log("result", userChat?.rows);
    //             if (userChat?.rows?.length) {
    //                 response?.status(200).json({ chat: userChat?.rows })
    //             } else {
    //                 response?.status(200).json('No chat history avalilable')
    //             }
    //         })
    //         .catch(error => {
    //             console.log("error=>", error);
    //         })

    // } else {
    //     await pool.query(`CREATE TABLE "${room}"(
    //             "id" SERIAL PRIMARY KEY,
    //             "user" VARCHAR,
    //             "msg" VARCHAR
    //          )`)
    //         .then(details => {
    //             // console.log("details",details);
    //         })
    //         .catch(error => {
    //             // console.log("error",error);
    //         })
    // }
}

const saveChatData = async (request, response) => {
    const { roomId, msg } = request.body;
    await pool.query(`SELECT * FROM roomdetails WHERE roomid = $1`, [String(roomId)])
        .then(async (result) => {
            if (result?.rows?.length) {
                await pool.query(`UPDATE roomdetails SET msg = $1 WHERE roomid = $2`, [msg, String(roomId)])
                    .then((result) => {
                        response.status(200).json(result)
                    }).catch((err) => {
                        response.status(400).json(err)
                    });
            } else {
                await pool.query(`INSERT INTO roomdetails (roomid,msg) VALUES ($1,$2)`, [String(roomId), msg])
                    .then((result) => {
                        response.status(200).json(result)
                    }).catch((err) => {
                        response.status(400).json(err)
                    });
            }
        }).catch((err) => {
            response.status(400).json('Unable to process, Please try again later...')
        });
}


module.exports = {
    chatBackup,
    saveChatData
}
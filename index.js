const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const redis = require('ioredis')
require('dotenv').config()

const app = express()

const commonResponse = function (data, error) {
    if (error) {
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        data: data
    }
}

const redisCon = new redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})

const mysqlCon = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
})

const query = (query, values) => {
    return new Promise((resolve, reject) => {
        mysqlCon.query(query, values, (err, result, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

mysqlCon.connect((err) => {
    if (err) throw err

    console.log("mysql successfully connected")
})

app.use(bodyParser.json())

app.get('/persons', (request, response) => {
    mysqlCon.query("select * from revou.person", (err, result, fields) => {
        if (err) {
            console.error(err)
            response.status(500).json(commonResponse(null, "server error"))
            response.end()
            return
        }

        response.status(200).json(commonResponse(result, null))
        response.end()
    })
})

app.get('/persons/:id', async (request, response) => {
    try {
        const id = request.params.id
        const userKey = "user:" + id
        const cacheData = await redisCon.hgetall(userKey)

        if (Object.keys(cacheData).length !== 0) {
            console.log("get data from cache")
            response.status(200).json(commonResponse(cacheData, null))
            response.end()
            return
        }

        const dbData = await query(`select
                p.id,
                p.name,
                p.gender,
                p.department,
                sum(o.price) as amount
            from
                revou.person as p
                left join revou.order as o on p.id = o.person_id
            where
                p.id = ?
            group by
                p.id`, id)

        await redisCon.hset(userKey, dbData[0])
        await redisCon.expire(userKey, 20);

        response.status(200).json(commonResponse(dbData[0], null))
        response.end()
    } catch (err) {
        console.error(err)
        response.status(500).json(commonResponse(null, "server error"))
        response.end()
        return
    }

})

app.post('/persons', (request, response) => {

})

app.post('/orders', async (request, response) => {
    try {
        const body = request.body

        const dbData = await query(`insert into
            revou.order (person_id, price, product)
        values
        (?, ?, ?)`, [body.user_id, body.price, body.product])

        const userId = body.user_id
        const userKey = "user:" + userId
        await redisCon.del(userKey)

        response.status(200).json(commonResponse({
            id: dbData.insertId
        }, null))
        response.end()

    } catch (err) {
        console.error(err)
        response.status(500).json(commonResponse(null, "server error"))
        response.end()
        return
    }
})

app.delete('/orders/:id', async (request, response) => {
    try {
        const id = request.params.id
        const data = await query("select person_id from revou.order where id = ?", id)
        if (Object.keys(data).length === 0) {
            response.status(404).json(commonResponse(null, "data not found"))
            response.end()
            return
        }
        const personId = data[0].person_id
        const userKey = "user:" + personId
        await query("delete from revou.order where id = ?", id)
        await redisCon.del(userKey)

        response.status(200).json(commonResponse({
            id: id
        }))

        response.end()

    } catch (err) {
        console.error(err)
        response.status(500).json(commonResponse(null, "server error"))
        response.end()
        return
    }
})


app.listen(3000, () => {
    console.log("running in 3000")
})
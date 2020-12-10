'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')
const uuidv4 = require('uuid').v4

const app = express()
app.use(bodyParser.json())
app.use(cors())


const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('Service listening on port', port)
})

app.get('/', (req, res) => {
  console.log('Hello world received a request.')
  res.send(`Hello World!`)
})


let sendDataToEncrypt = (dataString, cryptoKey, blockIndex, jobId) => {
    return new Promise((resolve, reject) => {
        let data = {
            "message": dataString,
            "key": cryptoKey,
            "blockIndex": blockIndex,
            "jobId": jobId
            }
        let options = {
            url: "http://cryptoservice/encrypt",
            headers: {
            'Content-Type': 'application/json'
            },
            body : data,
            json: true
        }
        let body = ""
        request.post(options)
        .on("data", (data) => {
            body += data.toString() 
        })
        .on("complete", (status) => {
            console.log("Encrypted data block.")
            resolve(body)
            return
        })
        .on("error", (error) => {
            console.error("Data block send error!" + error.message)
            reject(error.message)
        })
    })
}

app.post('/fetchFromURL', async (req, res) => {
    let ebookUrl = req.body.ebookUrl
    let cryptoKey = req.body.cryptoKey
    let blockIndex = 0
    let jobId = uuidv4()
    let cipherPromises = []
    request.get(ebookUrl).on("data", (data) => {
        console.log("Got data of size : " + data.length)
        let dataString = data.toString()
        cipherPromises.push(sendDataToEncrypt(dataString, cryptoKey, blockIndex, jobId))
        blockIndex += 1
    }).on("error", (error) => {
        console.error("eBook GET error: "+ error.message)
        res.status(500).send(error.message)
    }).on("complete", (status) => {
        console.log("eBook encryption complete")
        // Wait for all encryption Jobs to complete
        Promise.all(cipherPromises).then((values) => {
            res.status(200).send(values.join("\r\n"))
        }).catch((error) => {
            console.error("eBook Encrypt error: "+ error.message)
            res.status(500).send(error.message)
        })
    })
})
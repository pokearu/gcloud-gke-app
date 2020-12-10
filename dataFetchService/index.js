'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')
const uuidv4 = require('uuid').v4

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))


const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('Service listening on port', port)
})

/**
 * Test route for health checks
 */
app.get('/', (req, res) => {
  console.log('Hello world received a request.')
  res.send(`Hello World!`)
})


/**
 * Function triggers a Encrypt call and returns a Promise
 * @param {string} dataString Data to send to encrypt service
 * @param {string} cryptoKey The encryption Key
 */
let sendDataToEncrypt = (dataString, cryptoKey) => {
    return new Promise((resolve, reject) => {
        let data = {
            "message": dataString,
            "key": cryptoKey
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


/**
 * Function triggers a decrypt call and returns a Promise
 * @param {string} dataString Data to send to decrypt service
 * @param {string} cryptoKey The decryption Key
 */
let sendDataToDecrypt = (dataString, cryptoKey) => {
    return new Promise((resolve, reject) => {
        let data = {
            "message": dataString,
            "key": cryptoKey
            }
        let options = {
            url: "http://cryptoservice/decrypt",
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
            console.log("Plaintext data block.")
            resolve(body)
            return
        })
        .on("error", (error) => {
            console.error("Data block send error!" + error.message)
            reject(error.message)
        })
    })
}


/**
 * Route to fetch data from a URL and initiate the Encryption flows
 * Responds to the user with the ciphertext and Job ID
 */
app.post('/fetchFromURL', async (req, res) => {
    let ebookUrl = req.body.ebookUrl
    let cryptoKey = req.body.cryptoKey
    let jobId = uuidv4()
    let cipherPromises = []
    request.get(ebookUrl).on("data", (data) => {
        console.log("Got data of size : " + data.length)
        let dataString = data.toString()
        cipherPromises.push(sendDataToEncrypt(dataString, cryptoKey))
    }).on("error", (error) => {
        console.error("eBook GET error: "+ error.message)
        res.status(500).send(error.message)
    }).on("complete", (status) => {
        console.log("eBook encryption complete")
        // Wait for all encryption Jobs to complete
        Promise.all(cipherPromises).then((values) => {
            res.status(200).json({"cipherText": values.join("\r\n"), "jobId": jobId})
        }).catch((error) => {
            console.error("eBook Encrypt error: "+ error.message)
            res.status(500).send(error.message)
        })
    })
})

/**
 * Route to fetch data from a URL and initiate the Decryption flows
 * Responds to the user with the plaintext and Job ID
 */
app.post('/fetchFromURLDecrypt', async (req, res) => {
    let ebookUrl = req.body.ebookUrl
    let cryptoKey = req.body.cryptoKey
    let jobId = uuidv4()
    let plaintextPromises = []
    let cipherText = ""
    request.get(ebookUrl).on("data", (data) => {
        console.log("Got data of size : " + data.length)
        let dataString = data.toString()
        cipherText += dataString
    }).on("error", (error) => {
        console.error("eBook ciphertext GET error: "+ error.message)
        res.status(500).send(error.message)
    }).on("complete", (status) => {
        let chiperBlocks = cipherText.split("\n")
        for (let block of chiperBlocks) {
            plaintextPromises.push(sendDataToDecrypt(block, cryptoKey))
        }
        // Wait for all decryption Jobs to complete
        Promise.all(plaintextPromises).then((values) => {
            res.status(200).json({"plainText": values.join(""), "jobId": jobId})
        }).catch((error) => {
            console.error("eBook Decrypt error: "+ error.message)
            res.status(500).send(error.message)
        })
    })
})
"use strict";

const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const myBucket = storage.bucket('ebook_crypto');
const myBucketEndpoint = "https://storage.googleapis.com/ebook_crypto/"

/**
 * HTTP Cloud function to handle OPTIONS, GET, POST requests
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.dataLoad = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    switch (req.method) {
        case 'OPTIONS':
            {   // Send response to OPTIONS requests
                res.set('Access-Control-Allow-Methods', 'GET, POST')
                res.set('Access-Control-Allow-Headers', 'Content-Type')
                res.set('Access-Control-Max-Age', '3600')
                res.status(204).send('')
                break
            }
        case 'GET':
            {
                // let jobId = req.query.jobId
                // let fileData = await myBucket.getFiles({autoPaginate: false, prefix: jobId})
                // .catch((error) => {
                //     console.error(error)
                //     res.status(400).send(error.message)
                // })
                // let cipherText = ""
                // for(const element of fileData[0]) {
                //     let fileContent = await element.download().catch((error) => {
                //         console.error(error)
                //         res.status(400).send(error.message)
                //     })
                //     cipherText += fileContent[0].toString() + '\r\n'
                // }
                // res.status(200).send(cipherText)
                // break
            }
        case 'POST':
            {
                let cipherText = req.body.cipherText
                // let blockIndex = req.body.blockIndex
                let jobId = req.body.jobId
                const file = myBucket.file(jobId);

                file.save(cipherText)
                .then(() => {
                    res.status(201).send(myBucketEndpoint + jobId)
                }).catch((error) => {
                    console.error(error)
                    res.status(500).send(error.message)
                })

                // // Data to SET in the entity
                // const data = {}

                // const key = datastore.key(["CipherText", ebookUrl + "_" + cryptoKey])
                // // GET the current entity
                // let currentEntity = await datastore.get(key)
                // .catch((error) => {
                //         console.error(error)
                //         res.status(400).send(error.message)
                //     })
                // // Update the Entity
                // if (currentEntity[0] != null) {
                //     let cipherTextBlock = JSON.parse(currentEntity[0]['cipherTextBlock'])
                //     cipherTextBlock[blockIndex] = cipherText
                //     data['cipherTextBlock'] = JSON.stringify(cipherTextBlock)
                // } else {
                //     let cipherTextBlock = {}
                //     cipherTextBlock[blockIndex] = cipherText
                //     data['cipherTextBlock'] = JSON.stringify(cipherTextBlock)
                // }
                
                // // Set the new entity
                // const entity = {
                //     "key": key,
                //     "data": data
                // }
                // datastore.upsert(entity)
                break
            }
    }
}

"use strict";

const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const myBucket = storage.bucket('ebook_crypto');
const myBucketEndpoint = "https://storage.googleapis.com/ebook_crypto/"

/**
 * HTTP Cloud function to handle OPTIONS, POST requests
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
        case 'POST':
            {
                let cipherText = req.body.cipherText
                let jobId = req.body.jobId
                const file = myBucket.file(jobId);

                file.save(cipherText)
                .then(() => {
                    res.status(201).send(myBucketEndpoint + jobId)
                }).catch((error) => {
                    console.error(error)
                    res.status(500).send(error.message)
                })
                break
            }
    }
}

'use strict';

// Global AJAX settings
$.ajaxSetup({
    headers: {
        'Content-Type': 'application/json'    
    }
})

/**
 * Triggers a Google Function to store data in GCS
 * @param {Object} data The data object to write to storage
 * @param {Function} showCard The function to use display to the users
 */
let saveToStorage = (data, showCard) => {
    $.post("https://us-central1-aravind-ramalingam.cloudfunctions.net/dataLoad", JSON.stringify(data))
    .done((endpoint) => {
        console.log(endpoint)
        showCard(data.cipherText, endpoint)
    }).fail((error)=> {
        console.error(error)
    })
}

/**
 * Displays the Ciphertext and encrypted file link on the DOM
 * @param {string} cipherText Ciphertext to display
 * @param {string} endpoint Endpoint URL to display
 */
let showHexCard = (cipherText, endpoint) => {
    let encrytedHexCard = $('#encrytedHexCard')
    encrytedHexCard.html("")
    let html = `
    <div class="card-body">
        <h5 class="card-title">Encrypted Hex Sample</h5>
        <a href="${endpoint}" target="_blank">Click to download</a>
        <p class="card-text">${cipherText.slice(0, 1000)}</p>
    </div>`
    encrytedHexCard.append(html)
    encrytedHexCard.show()
    $('#loader').hide()
}

/**
 * Displays the Plaintext and decryted file link on the DOM
 * @param {string} plainText The decryted plaintexet
 * @param {string} endpoint Endpoint URL to display
 */
let showPlainTextCard = (plainText, endpoint) => {
    let plainTextCard = $('#plainTextCard')
    plainTextCard.html("")
    let html = `
    <div class="card-body">
        <h5 class="card-title">The Plaintext</h5>
        <a href="${endpoint}" target="_blank">Click to download</a>
        <p class="card-text">${plainText.slice(0, 1000)}...</p>
    </div>`
    plainTextCard.append(html)
    plainTextCard.show()
    $('#plainTextLoader').hide()
}

/**
 * Function that triggers the service and initiates the encryption process
 */
let encryptBookFromUrl = () => {
    let cryptoKey = $('#cryptoKey').val()
    if (cryptoKey.length != 16 && cryptoKey.length != 32) {
        console.error("Invalid Key length")
        alert("Invalid Key length. Key must be 16 or 32 bytes long")
        return
    }
    $('#loader').show()
    let data = {
        "ebookUrl": $('#ebookUrl').val(),
        "cryptoKey": cryptoKey
      }
    $.post("/fetchFromURL", JSON.stringify(data))
    .done((data) => {
        console.log(data.cipherText.slice(0, 1000))
        saveToStorage(data, showHexCard)
    }).fail((error)=> {
        console.error(error)
    })
}

/**
 * Function that triggers the service and initiates the decryption process
 */
let decryptBookFromUrl = () => {
    let cryptoKey = $('#cryptoKeyDecrypt').val()
    if (cryptoKey.length != 16 && cryptoKey.length != 32) {
        console.error("Invalid Key length")
        alert("Invalid Key length. Key must be 16 or 32 bytes long")
        return
    }
    $('#plainTextLoader').show()
    let data = {
        "ebookUrl": $('#cipherBookUrl').val(),
        "cryptoKey": cryptoKey
      }
    $.post("/fetchFromURLDecrypt", JSON.stringify(data))
    .done((data) => {
        console.log(data.plainText.slice(0, 1000))
        saveToStorage({"cipherText": data.plainText, jobId: data.jobId + ".txt"}, showPlainTextCard)
    }).fail((error)=> {
        console.error(error)
    })
}
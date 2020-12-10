'use strict';

$.ajaxSetup({
    headers: {
        'Content-Type': 'application/json'    
    }
})

let saveToStorage = (data, showCard) => {
    $.post("https://us-central1-aravind-ramalingam.cloudfunctions.net/dataLoad", JSON.stringify(data))
    .done((endpoint) => {
        console.log(endpoint)
        showCard(data.cipherText, endpoint)
    }).fail((error)=> {
        console.error(error)
    })
}

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

let showPlainTextCard = (cipherText, endpoint) => {
    let plainTextCard = $('#plainTextCard')
    plainTextCard.html("")
    let html = `
    <div class="card-body">
        <h5 class="card-title">The Plaintext</h5>
        <a href="${endpoint}" target="_blank">Click to download</a>
        <p class="card-text">${cipherText.slice(0, 1000)}...</p>
    </div>`
    plainTextCard.append(html)
    plainTextCard.show()
    $('#plainTextLoader').hide()
}

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
import os
from Crypto.Cipher import Salsa20
from flask import Flask, request, abort
import requests

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello World!\n'


@app.route('/encrypt', methods = ['POST'])
def encrypt_message():
    """
    Takes an message as input and runs Salsa20 stream cipher encryption 
    """
    try:
        request_body = request.json
        message = request_body['message']
        key = request_body['key']
        cipher = Salsa20.new(str.encode(key))
        ciphertext = cipher.encrypt(str.encode(message))
        print("Encrypted Block of Size: {0}".format(len(message)))
        return "{0}{1}".format(cipher.nonce.hex(),ciphertext.hex()), 201
    except Exception as e:
        print("Error in Encrypt : " + str(e))
        abort(500, str(e))


@app.route('/decrypt', methods = ['POST'])
def decrypt_message():
    """
    Takes a hex dump as input and runs Salsa20 stream cipher decryption
    """
    try:
        request_body = request.json
        message = request_body['message']
        key = request_body['key']
        message_bytes = bytes.fromhex(message)
        message_nonce = message_bytes[:8]
        ciphertext = message_bytes[8:]
        cipher = Salsa20.new(str.encode(key), nonce=message_nonce)
        plaintext = cipher.decrypt(ciphertext)
        print("Decrypted Block of Size: {0}".format(len(message)))
        return plaintext, 201
    except Exception as e:
        print("Error in Decrypt : " + str(e))
        abort(500, str(e))


if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 8080)))
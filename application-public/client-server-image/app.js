const express = require('express');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
const config = require('./config');

app.use(
    cors({
      origin: function (origin, callback) {
        // Check if the origin is in the list of allowed origins
        if (config.allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    })
  );

const cryptoRouter = express.Router();

app.use('/crypto', cryptoRouter);

cryptoRouter.get('/encrypt', (req, res) => {
    const {plainText} = req.query;
    var b64 = CryptoJS.AES.encrypt(plainText, config.salt).toString();
    var e64 = CryptoJS.enc.Base64.parse(b64);
    var eHex = e64.toString(CryptoJS.enc.Hex);
    res.send(eHex);
});


cryptoRouter.get('/decrypt', (req, res) => {
    const {cipherText} = req.query;
    var reb64 = CryptoJS.enc.Hex.parse(cipherText);
    var bytes = reb64.toString(CryptoJS.enc.Base64);
    var decrypt = CryptoJS.AES.decrypt(bytes, config.salt);
    var plain = decrypt.toString(CryptoJS.enc.Utf8);
    res.send(plain);
})


app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});

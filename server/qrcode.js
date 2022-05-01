require("dotenv").config();

const qr = require("qrcode");

const data = "solana:" + encodeURIComponent(process.env.GOT_SOL_APP_URL);

qr.toString(data, { type: "terminal" }, (err, data) => {
  console.log(data);
});

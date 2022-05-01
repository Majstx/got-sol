require("dotenv").config();

const qr = require("qrcode");

const url = new URL(process.env.GOT_SOL_APP_URL);
url.pathname = "/transaction";
url.searchParams.set("amount", "2.2");
url.searchParams.set("label", "tx label");

const content = "solana:" + encodeURIComponent(url.toString());

qr.toString(content, { type: "terminal" }, (err, data) => {
  console.clear();
  console.log(url.toString());
  console.log(data);
});

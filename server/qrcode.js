require("dotenv").config();

const qr = require("qrcode");

const url = new URL(process.env.GOT_SOL_APP_URL);
url.pathname = "/transaction";
url.searchParams.set("amount", "2.2");
url.searchParams.set("label", "tx label");
url.searchParams.set(
  "recipient",
  "AbUV7m5KCcfYWM1sC9TMVZyPnXSBFTHS8QnKLwdJFj3x"
);

const content = "solana:" + encodeURIComponent(url.toString());

qr.toString(content, { type: "terminal" }, (err, data) => {
  console.clear();
  console.log(url.toString());
  console.log(data);
});

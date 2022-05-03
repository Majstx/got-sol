import {
  Cluster,
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { join } from "path";
import { SplitPaymentController } from "./split-payment/SplitPaymentController";
import { SplitPaymentService } from "./split-payment/SplitPaymentService";
import { Config } from "./config";
import bs58 from "bs58";
import { SplUtils } from "./split-payment/SplUtils";
import { TransactionFactory } from "./split-payment/TransactionFactory";

require("dotenv").config();

const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");

const config: Config = {
  port: process.env.PORT || 3000,
  appUrl: process.env.GOT_SOL_APP_URL,
  solanaCluster: process.env.GOT_SOL_SOLANA_CLUSTER as Cluster,
};

function asyncRoute(route) {
  return (req, res, next) => {
    Promise.resolve(route(req, res, next))
      .then((payload) => res.send(payload))
      .catch((err) => next(err));
  };
}

const app = express();
app.use(bodyParser());
app.use(compression());

const operator = Keypair.fromSecretKey(
  bs58.decode(process.env.GOT_SOL_OPERATOR_SECRET_KEY)
);

const splitters = {
  operator: operator.publicKey,
  splitterA: new PublicKey(process.env.GOT_SOL_SPLITTER_A_PUBLIC_KEY),
  splitterB: new PublicKey(process.env.GOT_SOL_SPLITTER_B_PUBLIC_KEY),
  devA: new PublicKey(process.env.GOT_SOL_DEV_A_PUBLIC_KEY),
  devB: new PublicKey(process.env.GOT_SOL_DEV_B_PUBLIC_KEY),
};

const endpoint = clusterApiUrl(config.solanaCluster);
const connection = new Connection(endpoint, "confirmed");
const transactionFactory = new TransactionFactory(connection);
const splUtils = new SplUtils(connection);
const transactionService = new SplitPaymentService(
  connection,
  transactionFactory,
  splUtils,
  operator,
  splitters
);
const transactionController = new SplitPaymentController(
  config,
  transactionService
);

app.get("/logo", (req, res) => {
  const path = join(__dirname, "../resources/logo.jpeg");
  res.sendFile(path);
});

app.get(
  "/transaction",
  asyncRoute(transactionController.requestMeta.bind(transactionController))
);

app.post(
  "/transaction",
  asyncRoute(transactionController.splitPay.bind(transactionController))
);

app.listen(config.port, () => {
  console.log(`App is running on port ${config.port}`);
});

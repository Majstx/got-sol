import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { join } from "path";
import { TransactionController } from "./controllers/TransactionController";
import { TransactionService } from "./services/TransactionService";
import { Config } from "./config";

require("dotenv").config();

const express = require("express");
const compression = require("compression");

const config: Config = {
  port: process.env.PORT || 3000,
  appUrl: process.env.GOT_SOL_APP_URL,
  solanaCluster: process.env.GOT_SOL_SOLANA_CLUSTER,
};

const app = express();
app.use(compression());

const endpoint = clusterApiUrl(config.solanaCluster as Cluster);
const connection = new Connection(endpoint, "confirmed");
const transactionService = new TransactionService(connection);
const transactionController = new TransactionController(
  config,
  transactionService
);

app.get("/logo", (req, res) => {
  const path = join(__dirname, "../resources/logo.jpeg");
  res.sendFile(path);
});

app.get("/transaction", transactionController.meta.bind(transactionController));

app.post(
  "/transaction",
  transactionController.splitPay.bind(transactionController)
);

app.listen(config.port, () => {
  console.log(`App is running on port ${config.port}`);
});

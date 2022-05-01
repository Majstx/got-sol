import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { join } from "path";
import { TransactionController } from "./controllers/TransactionController";
import { TransactionService } from "./services/TransactionService";

require('dotenv').config()

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const endpoint = clusterApiUrl(process.env.GOT_SOL_SOLANA_CLUSTER as Cluster);
const connection = new Connection(endpoint, "confirmed");
const transactionService = new TransactionService(connection);
const transactionController = new TransactionController(transactionService);

app.get('/logo', (req, res) => {
  const path = join(__dirname, '../resources/logo.jpeg')
  res.sendFile(path)
})

app.get(
  "/transaction",
  transactionController.splitPay.bind(transactionController)
);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

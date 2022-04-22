import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { TransactionController } from "./controllers/TransactionController";
import { TransactionService } from "./services/TransactionService";

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const endpoint = clusterApiUrl(process.env.GOT_SOL_SOLANA_CLUSTER as Cluster);
const connection = new Connection(endpoint, "confirmed");
const transactionService = new TransactionService(connection);
const transactionController = new TransactionController(transactionService);

app.get(
  "/transaction",
  transactionController.splitPay.bind(transactionController)
);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

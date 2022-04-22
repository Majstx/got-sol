import {clusterApiUrl, Connection} from "@solana/web3.js";
import {TransactionController} from "./controllers/TransactionController";
import {TransactionService} from "./services/TransactionService";

const express = require('express')

const app = express()
const port = process.env.PORT || 3000

const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
const transactionService = new TransactionService(connection)
const transactionController = new TransactionController(transactionService)

app.get('/transaction', transactionController.splitPay)

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})

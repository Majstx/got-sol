import "reflect-metadata";
import { Cluster } from "@solana/web3.js";
import { Config } from "./config";
import { App } from "./App";
import { container } from "tsyringe";

require("dotenv").config();

const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");

const config: Config = {
  port: process.env.PORT || 3000,
  appUrl: process.env.GOT_SOL_APP_URL,
  solanaCluster: process.env.GOT_SOL_SOLANA_CLUSTER as Cluster,
  operatorSecretKey: process.env.GOT_SOL_OPERATOR_SECRET_KEY,
  splitterAPubKey: process.env.GOT_SOL_SPLITTER_A_PUBLIC_KEY,
  splitterBPubKey: process.env.GOT_SOL_SPLITTER_B_PUBLIC_KEY,
  devAPubKey: process.env.GOT_SOL_DEV_A_PUBLIC_KEY,
  devBPubKey: process.env.GOT_SOL_DEV_B_PUBLIC_KEY,
};

const server = express();
server.use(bodyParser());
server.use(compression());

const app = new App(container, server);
app.registerProviders(config);
app.registerRoutes();

server.listen(config.port, () => {
  console.log(`App is running on port ${config.port}`);
});

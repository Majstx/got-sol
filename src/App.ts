import * as express from "express";
import { DependencyContainer } from "tsyringe";
import { SplitPaymentRouter } from "./split-payment/SplitPaymentRouter";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Config } from "./config";
import bs58 from "bs58";
import { Splitters } from "./split-payment/Splitters";
import path from "path";
import { createLogger, format, Logger, transports } from "winston";

export class App {
  constructor(
    private readonly container: DependencyContainer,
    private readonly server: express.Express
  ) {}

  registerProviders(config: Config) {
    this.container.register("Config", { useValue: config });

    const endpoint = clusterApiUrl(config.solanaCluster);
    const connection = new Connection(endpoint, "confirmed");
    this.container.register(Connection, { useValue: connection });

    const operator = Keypair.fromSecretKey(
      bs58.decode(config.operatorSecretKey)
    );
    this.container.register("Operator", { useValue: operator });

    const splitters: Splitters = {
      operator: operator.publicKey,
      splitterA: new PublicKey(config.splitterAPubKey),
      splitterB: new PublicKey(config.splitterBPubKey),
      devA: new PublicKey(config.devAPubKey),
      devB: new PublicKey(config.devBPubKey),
    };
    this.container.register("Splitters", { useValue: splitters });

    const logger: Logger = createLogger({
      transports: [
        new transports.Console({
          format: format.combine(format.timestamp(), format.simple()),
        }),
      ],
    });
    this.container.register("Logger", { useValue: logger });
  }

  registerRoutes() {
    this.server.use(
      "/resources",
      express.static(path.join(__dirname, "resources"))
    );

    const splitPaymentRouter = this.container.resolve(SplitPaymentRouter);
    this.server.use("/tx", splitPaymentRouter.register());
  }
}

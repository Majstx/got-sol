import { NextFunction, Request, Response } from "express";
import {
  SplitPayDetailsDto,
  TransactionService,
} from "../services/TransactionService";
import { Keypair } from "@solana/web3.js";
import { Config } from "../config";

const merchant = Keypair.generate();

export class TransactionController {
  constructor(
    private readonly config: Config,
    private readonly transactionService: TransactionService
  ) {}

  meta(req: Request, res: Response) {
    const icon = this.config.appUrl + "/logo";

    res.json({
      label: "tx label",
      icon,
    });
  }

  async splitPay(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentRequest: SplitPayDetailsDto = {
        amount: 10,
        merchantAddress: merchant.publicKey,
      };
      const tx = await this.transactionService.createSplitPayTx(paymentRequest);
      const serialized = tx.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      });

      res.json({
        transaction: serialized.toString("base64"),
      });
    } catch (e) {
      next(e);
    }
  }
}

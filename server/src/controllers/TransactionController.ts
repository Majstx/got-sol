import { NextFunction, Request, Response } from "express";
import {
  SplitPayDetailsDto,
  TransactionService,
} from "../services/TransactionService";
import { Keypair } from "@solana/web3.js";

const merchant = Keypair.generate();

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

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

import { NextFunction, Request, Response } from "express";
import {
  SplitPayDetailsDto,
  TransactionService,
} from "../services/TransactionService";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Config } from "../config";

let serializationConfig = {
  verifySignatures: false,
  requireAllSignatures: false,
};

export class TransactionController {
  constructor(
    private readonly config: Config,
    private readonly transactionService: TransactionService
  ) {}

  meta(req: Request, res: Response) {
    const label = req.query.label || "transaction";
    const icon = `https://${req.headers.host}/logo`;

    res.json({
      label,
      icon,
    });
  }

  async splitPay(req: Request, res: Response, next: NextFunction) {
    try {
      const amountField = req.query.amount;
      if (!amountField) throw new Error("missing amount");
      if (typeof amountField !== "string") throw new Error("invalid amount");
      const amount = Number(amountField);

      // Account provided in the transaction request body by the wallet.
      const accountField = req.body?.account;
      if (!accountField) throw new Error("missing account");
      if (typeof accountField !== "string") throw new Error("invalid account");
      const merchantAddress = new PublicKey(accountField);

      const paymentRequest: SplitPayDetailsDto = {
        amount,
        merchantAddress,
      };
      let tx = await this.transactionService.createSplitPayTx(paymentRequest);

      // Serialize and deserialize the transaction. This ensures consistent ordering of the account keys for signing.
      tx = Transaction.from(tx.serialize(serializationConfig));

      // Serialize and return the unsigned transaction.
      const serialized = tx.serialize(serializationConfig);
      const base64 = serialized.toString("base64");

      res.json({
        transaction: base64,
      });
    } catch (e) {
      next(e);
    }
  }
}

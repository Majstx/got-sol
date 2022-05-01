import { Request } from "express";
import {
  SplitPayDetailsDto,
  TransactionService,
} from "../services/TransactionService";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Config } from "../config";

const serializationConfig = {
  verifySignatures: false,
  requireAllSignatures: false,
};

export class TransactionController {
  constructor(
    private readonly config: Config,
    private readonly transactionService: TransactionService
  ) {}

  meta(req: Request) {
    const label = req.query.label || "transaction";
    const icon = `https://${req.headers.host}/logo`;

    return {
      label,
      icon,
    };
  }

  async splitPay(req: Request) {
    console.log(new Date(), { ...req.query, ...req.body });

    // TODO: validate input
    const paymentRequest: SplitPayDetailsDto = {
      amount: Number(req.query.amount),
      sender: new PublicKey(req.body?.account),
      recipient: new PublicKey(req.query.recipient),
      splToken: new PublicKey(req.query["spl-token"]),
    };
    let tx = await this.transactionService.createSplitPayTx(paymentRequest);

    // Serialize and deserialize the transaction. This ensures consistent ordering of the account keys for signing.
    tx = Transaction.from(tx.serialize(serializationConfig));

    // Serialize and return the unsigned transaction.
    const serialized = tx.serialize(serializationConfig);
    const base64 = serialized.toString("base64");

    return {
      transaction: base64,
    };
  }
}

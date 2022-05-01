import { Request } from "express";
import {
  SplitPayDetailsDto,
  TransactionService,
} from "../services/TransactionService";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Config } from "../config";
import tokenList, { TokenList } from "../tokens";

const serializationConfig = {
  verifySignatures: false,
  requireAllSignatures: false,
};

export class TransactionController {
  private readonly tokens: TokenList;

  constructor(
    private readonly config: Config,
    private readonly transactionService: TransactionService
  ) {
    this.tokens = tokenList[config.solanaCluster];
    if (!this.tokens) {
      throw new Error(
        `token list not found for cluster ${config.solanaCluster}`
      );
    }
  }

  meta(req: Request) {
    const label = req.query.label || "transaction";
    const icon = `https://${req.headers.host}/logo`;

    return {
      label,
      icon,
    };
  }

  async splitPay(req: Request) {
    const amountField = req.query.amount;
    if (!amountField) throw new Error("missing amount");
    if (typeof amountField !== "string") throw new Error("invalid amount");
    const amount = Number(amountField);

    const recipientField = req.query.recipient;
    if (!recipientField) throw new Error("missing recipient");
    if (typeof recipientField !== "string")
      throw new Error("invalid recipient");
    const recipient = new PublicKey(recipientField);

    // Account provided in the transaction request body by the wallet.
    const accountField = req.body?.account;
    if (!accountField) throw new Error("missing account");
    if (typeof accountField !== "string") throw new Error("invalid account");
    const account = new PublicKey(accountField);

    const token = this.tokens.USDC; // TODO: fetch from query

    const paymentRequest: SplitPayDetailsDto = {
      amount,
      from: account,
      merchant: recipient,
      token,
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

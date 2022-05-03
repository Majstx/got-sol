import { Request } from "express";
import { SplitPayDetailsDto, SplitPaymentService } from "./SplitPaymentService";
import { PublicKey, Transaction } from "@solana/web3.js";
import { inject, injectable } from "tsyringe";

const serializationConfig = {
  verifySignatures: false,
  requireAllSignatures: false,
};

type TransactionRequestMeta = {
  label: string;
  icon: string;
};

type TransactionResponse = {
  transaction: string;
  message?: string;
};

@injectable()
export class SplitPaymentController {
  constructor(
    @inject(SplitPaymentService)
    private readonly splitPaymentService: SplitPaymentService
  ) {}

  requestMeta(req: Request): TransactionRequestMeta {
    const label = String(req.query.label) || "transaction";
    const icon = `https://${req.headers.host}/resources/logo.jpeg`;

    return {
      label,
      icon,
    };
  }

  async splitPay(req: Request): Promise<TransactionResponse> {
    console.log(new Date(), { ...req.query, ...req.body });

    const paymentRequest: SplitPayDetailsDto = {
      amount: Number(req.query.amount),
      sender: new PublicKey(req.body?.account),
      recipient: new PublicKey(req.query.recipient),
      splToken: new PublicKey(req.query["spl-token"]),
    };
    let tx = await this.splitPaymentService.createTransaction(paymentRequest);

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

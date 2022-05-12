import { Request } from "express";
import { SplitPayDetailsDto, SplitPaymentService } from "./SplitPaymentService";
import { PublicKey, Transaction } from "@solana/web3.js";
import { inject, injectable } from "tsyringe";
import { Logger } from "winston";

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
    private readonly splitPaymentService: SplitPaymentService,
    @inject("Logger") private readonly logger: Logger
  ) {}

  requestMeta(req: Request): TransactionRequestMeta {
    const label = req.query.label
      ? decodeURIComponent(req.query.label as string)
      : "transaction";
    const icon = `https://${req.headers.host}/resources/logo.jpeg`;

    return {
      label,
      icon,
    };
  }

  async splitPay(req: Request): Promise<TransactionResponse> {
    const paymentRequest: SplitPayDetailsDto = {
      id: Date.now(),
      amount: Number(req.query.amount),
      sender: new PublicKey(req.body?.account),
      recipient: new PublicKey(req.query.recipient),
      reference: new PublicKey(req.query.reference),
      splToken: new PublicKey(req.query["spl-token"]),
    };

    this.logger.info("new tx", paymentRequest);

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

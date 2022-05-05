import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { SplitPaymentTransactionBuilder } from "./SplitPaymentTransactionBuilder";
import { SplUtils } from "./SplUtils";
import { TransactionFactory } from "./TransactionFactory";
import { container, inject, injectable } from "tsyringe";
import { Splitters } from "./Splitters";

export type SplitPayDetailsDto = {
  id: number;
  amount: number;
  sender: PublicKey;
  recipient: PublicKey;
  splToken: PublicKey;
};

@injectable()
export class SplitPaymentService {
  constructor(
    @inject(Connection) private readonly connection: Connection,
    @inject(TransactionFactory)
    private readonly transactionFactory: TransactionFactory,
    @inject(SplUtils) private readonly splUtils: SplUtils,
    @inject("Operator") private readonly feePayer: Keypair,
    @inject("Splitters") private readonly splitters: Splitters
  ) {}

  async createTransaction({
    id,
    amount,
    sender,
    recipient,
    splToken,
  }: SplitPayDetailsDto): Promise<Transaction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");

    const tokens = amount * Math.pow(10, mint.decimals);
    const builder = container.resolve(SplitPaymentTransactionBuilder);

    return builder
      .setId(id)
      .setAmount(tokens)
      .setSplToken(splToken)
      .setFeePayer(this.feePayer)
      .setSender(sender)
      .setDecimals(mint.decimals)
      .addMerchant(recipient)
      .addDev(this.splitters.devA)
      .addDev(this.splitters.devB)
      .addSplitter(this.splitters.splitterA)
      .addSplitter(this.splitters.splitterB)
      .addOperator(this.splitters.operator)
      .build();
  }
}

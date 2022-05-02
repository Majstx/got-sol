import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { SplitPaymentBuilder } from "./SplitPaymentBuilder";
import { SplUtils } from "./SplUtils";

export type SplitPayDetailsDto = {
  amount: number;
  sender: PublicKey;
  recipient: PublicKey;
  splToken: PublicKey;
};

export class TransactionService {
  constructor(
    private readonly connection: Connection,
    private readonly splUtils: SplUtils,
    private readonly operator: Keypair
  ) {}

  async createSplitPayTx({
    amount,
    sender,
    recipient,
    splToken,
  }: SplitPayDetailsDto): Promise<Transaction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");

    const tokens = amount * Math.pow(10, mint.decimals);

    const instructions = await SplitPaymentBuilder.init(this.splUtils, tokens)
      .setSplToken(splToken)
      .setFeePayer(this.operator.publicKey)
      .setSender(sender)
      .setDecimals(mint.decimals)
      .addMerchant(recipient)
      .addDev(recipient)
      .addDev(recipient)
      .addSplitter(recipient)
      .addSplitter(recipient)
      .addOperator(this.operator.publicKey)
      .build();

    return this.createTransaction(instructions);
  }

  private async createTransaction(
    instructions: TransactionInstruction[]
  ): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: this.operator.publicKey,
      recentBlockhash: blockhash,
    });
    instructions.forEach((ix) => tx.add(ix));
    tx.partialSign(this.operator);

    return tx;
  }
}

import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getMint, Mint } from "@solana/spl-token";
import { SplitPaymentTransactionBuilder } from "./SplitPaymentTransactionBuilder";
import { SplUtils } from "./SplUtils";
import { TransactionFactory } from "./TransactionFactory";
import { container, inject, injectable } from "tsyringe";
import { Splitters } from "./Splitters";
import LRUCache from "lru-cache";

export type SplitPayDetailsDto = {
  id: number;
  amount: number;
  sender: PublicKey;
  recipient: PublicKey;
  reference: PublicKey;
  splToken: PublicKey;
  memo: string;
};

@injectable()
export class SplitPaymentService {
  private readonly cacheMint: LRUCache<string, Mint>;

  constructor(
    @inject(Connection) private readonly connection: Connection,
    @inject(TransactionFactory)
    private readonly transactionFactory: TransactionFactory,
    @inject(SplUtils) private readonly splUtils: SplUtils,
    @inject("Operator") private readonly feePayer: Keypair,
    @inject("Splitters") private readonly splitters: Splitters
  ) {
    this.cacheMint = new LRUCache({ max: 5 });
  }

  async createTransaction({
    id,
    amount,
    sender,
    recipient,
    reference,
    splToken,
    memo,
  }: SplitPayDetailsDto): Promise<Transaction> {
    const mint = await this.getMint(splToken);

    const tokens = amount * Math.pow(10, mint.decimals);
    const builder = container.resolve(SplitPaymentTransactionBuilder);

    return builder
      .setId(id)
      .setAmount(tokens)
      .setSplToken(splToken)
      .setFeePayer(this.feePayer)
      .setSender(sender)
      .setDecimals(mint.decimals)
      .setReference(reference)
      .setMemo(memo)
      .addMerchant(recipient)
      .addDev(this.splitters.devA)
      .addDev(this.splitters.devB)
      .addSplitter(this.splitters.splitterA)
      .addSplitter(this.splitters.splitterB)
      .addOperator(this.splitters.operator)
      .build();
  }

  private async getMint(splToken: PublicKey): Promise<Mint> {
    const key = splToken.toString();
    if (this.cacheMint.has(key)) {
      return this.cacheMint.get(key);
    }

    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");
    this.cacheMint.set(key, mint);

    return mint;
  }
}

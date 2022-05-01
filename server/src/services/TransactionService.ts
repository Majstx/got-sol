import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction } from "@solana/spl-token";
import { TokenDetails } from "../tokens";

const PAYMENT_FEE = 0.01;
const SPLITTER_SHARE = 0.4;
const DEV_SHARE = 0.05;
const OPERATOR_SHARE = 0.1;

type TokenInfo = {
  mint: PublicKey;
  decimals: number;
};

export type SplitPayDetailsDto = {
  amount: number;
  from: PublicKey;
  merchant: PublicKey;
  token: TokenDetails;
};

export class TransactionService {
  constructor(
    private readonly connection: Connection,
    private readonly operator: Keypair
  ) {}

  async createSplitPayTx({
    amount,
    merchant,
    from,
    token,
  }: SplitPayDetailsDto): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: this.operator.publicKey,
      recentBlockhash: blockhash,
    });

    const foo = amount * Math.pow(10, token.decimals);
    // const splitterAmount = Math.floor(foo * PAYMENT_FEE * SPLITTER_SHARE);
    // const devAmount = Math.floor(foo * PAYMENT_FEE * DEV_SHARE);
    // const opAmount = Math.floor(foo * PAYMENT_FEE * OPERATOR_SHARE);
    // const finalAmount = foo - 2 * splitterAmount - 2 * devAmount - opAmount;

    this.transferTo(tx, token, from, merchant, foo);

    tx.partialSign(this.operator);
    return tx;
  }

  private transferTo(
    tx: Transaction,
    token: TokenInfo,
    from: PublicKey,
    to: PublicKey,
    amount: number
  ) {
    const ix = createTransferCheckedInstruction(
      from,
      token.mint,
      to,
      from,
      amount,
      token.decimals
    );

    tx.add(ix);
  }
}
